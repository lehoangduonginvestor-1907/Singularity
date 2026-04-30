import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime, timezone
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time
import uvicorn

from ingestion.fetchers import Type1Fetcher, Type2Fetcher
from physics.engine_orchestrator import InterstellarOrchestrator

app = FastAPI(title="Interstellar API", version="3.0")

# Setup CORS cho phép React Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REPLICATE HELPER FUNCTIONS FROM APP.PY ---
def get_mock_catalog() -> pd.DataFrame:
    data = [
        {"Name": "Jupiter", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -2.5},
        {"Name": "Saturn", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": 0.5},
        {"Name": "Mars", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -1.0},
        {"Name": "Venus", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -4.0},
        {"Name": "Orion Nebula (M42)", "RA": 83.822, "Dec": -5.391, "Type": "Nebula", "Magnitude": 4.0},
        {"Name": "Pleiades (M45)", "RA": 56.75, "Dec": 24.116, "Type": "Open Cluster", "Magnitude": 1.6},
        {"Name": "Hercules Cluster (M13)", "RA": 250.422, "Dec": 36.46, "Type": "Globular Cluster", "Magnitude": 5.8},
        {"Name": "Lagoon Nebula (M8)", "RA": 270.925, "Dec": -24.38, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Dumbbell Nebula (M27)", "RA": 299.901, "Dec": 22.716, "Type": "Planetary Nebula", "Magnitude": 7.5},
        {"Name": "Ring Nebula (M57)", "RA": 283.396, "Dec": 33.029, "Type": "Planetary Nebula", "Magnitude": 8.8},
        {"Name": "Crab Nebula (M1)", "RA": 83.633, "Dec": 22.014, "Type": "Supernova Remnant", "Magnitude": 8.4},
        {"Name": "Eagle Nebula (M16)", "RA": 274.7, "Dec": -13.8, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Omega Centauri (NGC 5139)", "RA": 201.697, "Dec": -47.479, "Type": "Globular Cluster", "Magnitude": 3.9},
        {"Name": "Tarantula Nebula (NGC 2070)", "RA": 84.676, "Dec": -69.1, "Type": "Nebula", "Magnitude": 8.0},
        {"Name": "Andromeda Galaxy (M31)", "RA": 10.684, "Dec": 41.269, "Type": "Galaxy", "Magnitude": 3.4},
        {"Name": "Triangulum Galaxy (M33)", "RA": 23.462, "Dec": 30.66, "Type": "Galaxy", "Magnitude": 5.7},
        {"Name": "Sombrero Galaxy (M104)", "RA": 189.997, "Dec": -11.623, "Type": "Galaxy", "Magnitude": 8.0},
        {"Name": "Whirlpool Galaxy (M51)", "RA": 202.469, "Dec": 47.195, "Type": "Galaxy", "Magnitude": 8.4},
        {"Name": "Bode's Galaxy (M81)", "RA": 148.888, "Dec": 69.065, "Type": "Galaxy", "Magnitude": 6.9},
        {"Name": "Cigar Galaxy (M82)", "RA": 148.969, "Dec": 69.679, "Type": "Galaxy", "Magnitude": 8.4}
    ]
    return pd.DataFrame(data)

df_catalog = get_mock_catalog()

class AstroHelper:
    @staticmethod
    def get_ephemeris(lat: float, lon: float, time_utc: datetime, target_row: pd.Series) -> dict:
        loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
        t = Time(time_utc)
        
        target_name = target_row["Name"]
        if target_row["Type"] == "Planet" or target_row["Type"] == "Zenith":
            if target_row["Type"] == "Zenith":
                target = get_body("jupiter", t) # dummy body, alt will be forced to 90
            else:
                target = get_body(target_name.lower(), t)
        else:
            target = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)
            
        target_altaz = target.transform_to(AltAz(obstime=t, location=loc))
        moon = get_body("moon", t)
        moon_altaz = moon.transform_to(AltAz(obstime=t, location=loc))
        
        sun = get_body("sun", t)
        elongation = sun.separation(moon)
        phase_angle = 180.0 - elongation.deg
        rho_deg = target.separation(moon).deg
        
        lst = t.sidereal_time('apparent', longitude=loc.lon)
        target_ha = (lst - target.ra).deg
        moon_ha = (lst - moon.ra).deg
        
        return {
            'target_dec': target.dec.deg,
            'target_ra': target.ra.deg,
            'target_alt': target_altaz.alt.deg,
            'target_az': target_altaz.az.deg,
            'ha': target_ha,
            'lat': lat,
            'moon_dec': moon.dec.deg,
            'moon_ra': moon.ra.deg,
            'moon_alt': moon_altaz.alt.deg,
            'moon_az': moon_altaz.az.deg,
            'moon_ha': moon_ha,
            'moon_phase': phase_angle,
            'moon_sep': rho_deg
        }

# ── Target-type weight tables ────────────────────────────────────────────────
_DSO_TYPES    = {"Nebula", "Galaxy", "Open Cluster", "Globular Cluster",
                 "Supernova Remnant", "Planetary Nebula"}
_PLANET_TYPES = {"Planet"}

def _type_aware_score(sc: dict, target_type: str) -> float:
    """
    Re-weight sub-scores by target type.
    Planets: bright point sources → lunar irrelevant, seeing dominates.
    DSOs:    faint extended objects → sky darkness (lunar) is critical.
    """
    if target_type in _PLANET_TYPES:
        # Trăng rằm không ảnh hưởng hành tinh sáng
        raw = (sc["seeing_score_10"]       * 0.60
             + sc["transparency_score_10"] * 0.40
             + sc["lunar_score_10"]        * 0.00)
    elif target_type in _DSO_TYPES:
        # Tinh vân/thiên hà bị ánh trăng nuốt chửng → lunar weight 45%
        raw = (sc["seeing_score_10"]       * 0.25
             + sc["transparency_score_10"] * 0.30
             + sc["lunar_score_10"]        * 0.45)
    else:  # Double stars, defaults
        raw = (sc["seeing_score_10"]       * 0.50
             + sc["transparency_score_10"] * 0.30
             + sc["lunar_score_10"]        * 0.20)
    return float(np.clip(raw, 0.0, 10.0))


def get_tonights_best(lat: float, lon: float, dt_utc: datetime,
                      atmos_profile: list, surface_data: dict, zenith_trans: float, moon_phase: float) -> list:
    best_targets = []
    bad_sky = zenith_trans < 0.6 or moon_phase < 90.0

    for _, row in df_catalog.iterrows():
        ephem = AstroHelper.get_ephemeris(lat, lon, dt_utc, row)
        alt   = ephem["target_alt"]
        mag   = row["Magnitude"]
        rho   = ephem["moon_sep"]
        ttype = str(row["Type"])

        if alt <= 30.0:                       continue
        if bad_sky and mag >= 5.0:            continue
        if not bad_sky and mag >= 10.0:       continue
        if rho <= 40.0:                       continue

        payload  = InterstellarOrchestrator.map_and_execute(ephem, atmos_profile, surface_data)
        sc       = payload["scores"]
        score    = _type_aware_score(sc, ttype)

        # Hard veto: dew danger or below horizon
        if payload["alerts"]["dew_danger"] or alt <= 0:
            score = 0.0

        best_targets.append({
            "Target":   str(row["Name"]),
            "Type":     ttype,
            "Mag":      float(mag),
            "Altitude": round(float(alt), 1),
            "Score":    round(score, 1),
            "LunarWeight": "0%" if ttype in _PLANET_TYPES else "45%" if ttype in _DSO_TYPES else "20%",
        })

    best_targets.sort(key=lambda x: x["Score"], reverse=True)
    return best_targets[:5]

def to_python(obj):
    """Recursively convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: to_python(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_python(v) for v in obj]
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    return obj

# --- ENDPOINTS ---
@app.get("/api/global-sky")
def get_global_sky(lat: float = Query(...), lon: float = Query(...)):
    atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    
    current_time = atmos_12h[0]["time"]
    
    dummy_zenith = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith", "Magnitude": 0.0})
    ephem_z = AstroHelper.get_ephemeris(lat, lon, current_time, dummy_zenith)
    ephem_z["target_alt"] = 90.0 
    
    payload_z = InterstellarOrchestrator.map_and_execute(ephem_z, atmos_12h[0]["profile"], surface_12h[0])
    
    global_score = float(payload_z["scores"]["v_model_10"])
    zenith_trans = float(payload_z["raw_physics"]["transparency"])
    seeing_arcsec = float(payload_z["raw_physics"]["seeing_arcsec"])
    dew_danger = bool(payload_z["alerts"]["dew_danger"])
    
    best_targets = get_tonights_best(
        lat, lon, current_time, atmos_12h[0]["profile"], surface_12h[0], 
        zenith_trans, ephem_z["moon_phase"]
    )
    
    return to_python({
        "time_utc": current_time.isoformat(),
        "zenith_metrics": {
            "global_score": round(global_score, 1),
            "seeing_arcsec": round(seeing_arcsec, 2),
            "transparency": round(zenith_trans, 2),
            "dew_danger": dew_danger
        },
        "tonights_best": best_targets,
        "catalog_names": df_catalog["Name"].tolist()
    })

@app.get("/api/target-forecast")
def get_target_forecast(lat: float = Query(...), lon: float = Query(...), target_name: str = Query(...)):
    atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    bench_12h = Type2Fetcher.fetch_benchmark_seeing_12h(lat, lon)
    
    target_row = df_catalog[df_catalog["Name"] == target_name]
    if target_row.empty:
        return {"error": "Target not found"}
    target_row = target_row.iloc[0]
    
    forecast = []
    for i in range(12):
        current_time = atmos_12h[i]["time"]
        ephem = AstroHelper.get_ephemeris(lat, lon, current_time, target_row)
        payload = InterstellarOrchestrator.map_and_execute(ephem, atmos_12h[i]["profile"], surface_12h[i])
        
        forecast.append({
            "time": current_time.strftime("%H:%M"),
            "physics_score": round(float(payload["scores"]["v_model_10"]), 1),
            "benchmark_score": float(bench_12h[i]["v_model_benchmark"])
        })
        
    return {"forecast": forecast}

@app.get("/api/debug-forecast")
def get_debug_forecast(lat: float = Query(...), lon: float = Query(...), target_name: str = Query(...)):
    atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    bench_12h = Type2Fetcher.fetch_benchmark_seeing_12h(lat, lon)

    target_row = df_catalog[df_catalog["Name"] == target_name]
    if target_row.empty:
        return {"error": "Target not found"}
    target_row = target_row.iloc[0]

    debug_rows = []
    for i in range(12):
        current_time = atmos_12h[i]["time"]
        profile = atmos_12h[i]["profile"]
        surface = surface_12h[i]
        bench = bench_12h[i]

        ephem = AstroHelper.get_ephemeris(lat, lon, current_time, target_row)
        payload = InterstellarOrchestrator.map_and_execute(ephem, profile, surface)

        rp = payload["raw_physics"]
        sc = payload["scores"]
        al = payload["alerts"]

        # Build per-layer wind data for display
        layers = []
        for lyr in profile:
            layers.append({
                "pressure_hpa": int(lyr["pressure"]),
                "temp_c": round(float(lyr["temp"]), 1),
                "wind_u_ms": round(float(lyr.get("wind_u", 0)), 2),
                "wind_v_ms": round(float(lyr.get("wind_v", 0)), 2),
                "wind_speed_ms": round(float(lyr.get("wind_speed", 0)), 2),
            })

        debug_rows.append({
            # ── Time & Geometry ──
            "time": current_time.strftime("%H:%M"),
            "target_alt_deg": round(float(ephem["target_alt"]), 2),
            "target_az_deg": round(float(ephem["target_az"]), 2),
            "moon_alt_deg": round(float(ephem["moon_alt"]), 2),
            "moon_sep_deg": round(float(ephem["moon_sep"]), 2),
            "moon_phase_deg": round(float(ephem["moon_phase"]), 1),

            # ── Surface Inputs (Open-Meteo) ──
            "surface": {
                "temp_c": round(float(surface["temp"]), 1),
                "rh_percent": round(float(surface["rh"]), 1),
                "pressure_hpa": round(float(surface["pressure"]), 1),
                "cloud_cover_pct": round(float(surface["cloud_cover"]), 1),
                "aqi": round(float(surface["aqi"]), 1),
            },

            # ── Atmospheric Profile Layers (Open-Meteo) ──
            "atmos_layers": layers,

            # ── Core Physics Output ──
            "physics": {
                "seeing_arcsec": round(float(rp["seeing_arcsec"]), 3),
                "transparency": round(float(rp["transparency"]), 4),
                "sqm_mag_arcsec2": round(float(rp["sqm"]), 3),
                "air_mass": round(float(rp.get("air_mass", 0)), 4),
                "delta_t_dew_c": round(float(rp["delta_t"]), 2),
                "air_mass_warning": bool(al["air_mass_warning"]),
                "dew_danger": bool(al["dew_danger"]),
            },

            # ── Heuristic Scores (Interstellar) ──
            "interstellar_scores": {
                "seeing_score": round(float(sc["seeing_score_10"]), 2),
                "transparency_score": round(float(sc["transparency_score_10"]), 2),
                "lunar_score": round(float(sc["lunar_score_10"]), 2),
                "v_model_final": round(float(sc["v_model_10"]), 2),
                "weights": {"seeing": "50%", "transparency": "30%", "lunar": "20%"},
            },

            # ── 7Timer Benchmark ──
            "benchmark_7timer": {
                "seeing_raw_1to8": bench.get("seeing_raw", "N/A"),
                "transparency_raw_1to8": bench.get("trans_raw", "N/A"),
                "v_model_benchmark": round(float(bench["v_model_benchmark"]), 2),
                "formula": "score = 10 - (raw - 1) * (10/7)",
            },

            # ── Delta Analysis ──
            "delta": {
                "score_diff": round(float(sc["v_model_10"]) - float(bench["v_model_benchmark"]), 2),
                "interpretation": (
                    "Interstellar significantly more optimistic"
                    if float(sc["v_model_10"]) - float(bench["v_model_benchmark"]) > 2
                    else "7Timer more optimistic"
                    if float(bench["v_model_benchmark"]) - float(sc["v_model_10"]) > 2
                    else "Models in agreement"
                ),
            },
        })

    return to_python({"target": str(target_row["Name"]), "debug": debug_rows})



from datetime import timedelta as _td
import math as _math

@app.get("/api/visibility-window")
def get_visibility_window(lat: float = Query(...), lon: float = Query(...), target_name: str = Query(...), days: int = Query(5)):
    target_row = df_catalog[df_catalog["Name"] == target_name]
    if target_row.empty:
        return {"error": "Target not found"}
    target_row = target_row.iloc[0]
    loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
    base = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    result_days = []
    for day_offset in range(min(days, 7)):
        day_start = base + _td(days=day_offset)
        conf_pct = [90,85,72,65,55,48,42][day_offset]
        confidence = "high" if day_offset < 2 else "moderate" if day_offset < 4 else "low"
        hourly = []; sun_alts = []; best_alt = -90.0; transit_hour = 12
        for h in range(24):
            t = Time(day_start + _td(hours=h))
            if target_row["Type"] == "Planet":
                body = get_body(target_row["Name"].lower(), t)
            else:
                body = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)
            alt = float(body.transform_to(AltAz(obstime=t, location=loc)).alt.deg)
            sun_alt = float(get_body("sun", t).transform_to(AltAz(obstime=t, location=loc)).alt.deg)
            sun_alts.append(sun_alt)
            zone = "ideal" if alt >= 50 else "good" if alt >= 30 else "poor"
            hourly.append({"hour": h, "alt": round(alt,1), "zone": zone})
            if alt > best_alt:
                best_alt = alt; transit_hour = h
        dark_s = next((h for h in range(24) if sun_alts[h] < -18), 18)
        dark_e = next((h for h in range(23,-1,-1) if sun_alts[h] < -18), 6)
        sunset = next((h for h in range(24) if sun_alts[h] < 0), None)
        vis = [h["hour"] for h in hourly if h["alt"] > 30 and (h["hour"] >= dark_s or h["hour"] <= dark_e)]
        result_days.append(to_python({
            "date": day_start.strftime("%Y-%m-%d"),
            "day_label": ["Today","Tomorrow","Day 3","Day 4","Day 5","Day 6","Day 7"][day_offset],
            "confidence": confidence, "confidence_pct": conf_pct,
            "hourly_altitude": hourly, "transit_hour": transit_hour,
            "transit_alt": round(float(best_alt),1),
            "twilight": {"civil_sunset_utc": sunset, "astro_dark_start_utc": dark_s, "astro_dark_end_utc": dark_e},
            "visibility_window_hours": vis,
            "best_window": f"{min(vis):02d}:00-{max(vis):02d}:00 UTC" if vis else "Not visible",
        }))
    return to_python({"target": str(target_row["Name"]), "days": result_days})


@app.get("/api/gear-check")
def get_gear_check(
    aperture_mm: float = Query(...),
    focal_length_mm: float = Query(...),
    eyepiece_mm: float = Query(25.0),
    lat: float = Query(...),
    lon: float = Query(...),
):
    atmos = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    surface = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    dummy = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith", "Magnitude": 0.0})
    ephem_z = AstroHelper.get_ephemeris(lat, lon, atmos[0]["time"], dummy)
    ephem_z["target_alt"] = 90.0
    payload = InterstellarOrchestrator.map_and_execute(ephem_z, atmos[0]["profile"], surface[0])
    seeing = float(payload["raw_physics"]["seeing_arcsec"])

    # ── Optical limits ──────────────────────────────────────────────────────
    rayleigh = _math.degrees(1.22 * 550e-9 / (aperture_mm / 1000.0)) * 3600
    dawes    = 116.0 / aperture_mm
    effective = max(rayleigh, seeing)
    seeing_limited = seeing > rayleigh        # True = atmosphere is bottleneck
    equiv_ap = 116.0 / seeing if seeing_limited else aperture_mm
    lim_mag  = 2.1 + 5 * _math.log10(aperture_mm)
    mag_power = focal_length_mm / eyepiece_mm
    exit_p   = aperture_mm / mag_power

    # ── Bottleneck Analysis (The Bottleneck Test) ───────────────────────────
    # Optimal magnification: aperture / (effective_resolution * 0.9)
    m_optimal  = round(aperture_mm / (effective * 0.9), 0)
    m_optimal  = min(m_optimal, 2.0 * aperture_mm)   # cap at max useful
    ep_optimal = round(focal_length_mm / m_optimal, 0) if m_optimal > 0 else eyepiece_mm
    # Snap to closest common eyepiece size
    COMMON_EPS = [40, 32, 25, 20, 15, 13, 10, 8, 6, 5, 4]
    ep_best = min(COMMON_EPS, key=lambda e: abs(e - ep_optimal))
    m_at_best = round(focal_length_mm / ep_best, 1)

    if seeing_limited:
        # Atmosphere = bottleneck — telescope resolution wasted
        bottleneck_type = "atmosphere"
        bottleneck_narrative = (
            f"Khí quyển đêm nay ({seeing:.2f}\" FWHM) tệ hơn giới hạn quang học của kính "
            f"({rayleigh:.2f}\"). Khí quyển đang là điểm nghẽn (Atmosphere Bottleneck). "
            f"Tăng độ phóng đại quá {m_optimal:.0f}× không cải thiện độ sắc nét — "
            f"chỉ làm ảnh mờ to thêm. Thị kính tốt nhất tối nay: {ep_best}mm ({m_at_best:.0f}×)."
        )
    else:
        # Telescope = bottleneck — atmosphere is better than optics
        bottleneck_type = "telescope"
        bottleneck_narrative = (
            f"Khí quyển đêm nay ({seeing:.2f}\") tốt hơn giới hạn quang học của kính "
            f"({rayleigh:.2f}\" Rayleigh). Kính viễn vọng đang là điểm nghẽn "
            f"(Telescope Bottleneck). Bạn có thể yên tâm cắm thị kính {ep_best}mm "
            f"để đẩy lên {m_at_best:.0f}× — ảnh vẫn sắc nét do khí quyển tốt hơn "
            f"giới hạn kính."
        )

    doubles = [
        {"name": "Epsilon Lyrae", "sep": 2.3},
        {"name": "Castor",        "sep": 3.9},
        {"name": "Porrima",       "sep": 2.9},
        {"name": "Albireo",       "sep": 34.6},
        {"name": "Mizar",         "sep": 14.4},
    ]
    return to_python({
        "current_seeing_arcsec": round(seeing, 3),
        "resolution": {
            "rayleigh_arcsec":   round(rayleigh, 3),
            "dawes_arcsec":      round(dawes, 3),
            "effective_arcsec":  round(effective, 3),
            "seeing_limited":    bool(seeing_limited),
            "equiv_aperture_mm": round(equiv_ap, 1),
            "verdict": (f"Seeing-limited — acting like {equiv_ap:.0f}mm aperture"
                        if seeing_limited else "Diffraction-limited — full optical potential"),
        },
        "bottleneck": {
            "type":               bottleneck_type,      # "atmosphere" | "telescope"
            "narrative":          bottleneck_narrative,
            "optimal_mag":        int(m_optimal),
            "recommended_ep_mm":  ep_best,
            "mag_at_best_ep":     round(m_at_best, 1),
            "telescope_limit_arcsec": round(rayleigh, 2),
            "atmosphere_limit_arcsec": round(seeing, 2),
        },
        "limiting_magnitude": round(lim_mag, 1),
        "optics": {
            "magnification":     round(mag_power, 1),
            "exit_pupil_mm":     round(exit_p, 2),
            "max_useful_mag":    round(2.0 * aperture_mm, 0),
            "min_mag":           round(aperture_mm / 7.0, 1),
            "exit_pupil_warning": ("Too small - image dim" if exit_p < 0.5
                                   else "Too large - light wasted" if exit_p > 7.0
                                   else "Optimal"),
        },
        "double_stars": [
            {**d, "resolvable": d["sep"] > effective,
             "verdict": "Resolvable" if d["sep"] > effective else "Too close"}
            for d in doubles
        ],
    })


# ═══════════════════════════════════════════════════════════════════════════
# SITE RANKER — Module 2: Physics-first Location Recommender
# ═══════════════════════════════════════════════════════════════════════════
import json, math, concurrent.futures
from typing import Optional
from pydantic import BaseModel

# Load site database once at startup
_SITES_DB_PATH = os.path.join(os.path.dirname(__file__), "data", "sites_database.json")
try:
    with open(_SITES_DB_PATH, encoding="utf-8") as _f:
        _SITES_DB = json.load(_f)["sites"]
except FileNotFoundError:
    _SITES_DB = []

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def _moon_penalty_bortle(moon_phase_deg: float) -> int:
    """
    Convert moon phase angle → Bortle-equivalent sky penalty.
    φ = 0° = Full Moon (worst), φ = 180° = New Moon (best).
    """
    illumination = (1 + math.cos(math.radians(moon_phase_deg))) / 2  # 0=new, 1=full
    if illumination >= 0.80:
        return 7   # Trăng rằm >80% sáng
    elif illumination >= 0.40:
        return 5   # Trăng bán nguyệt
    else:
        return 1   # Trăng non <20%

def _score_site(site: dict, user_lat: float, user_lon: float,
                moon_phase_deg: float, v_model: float, delta_t: float) -> dict:
    """
    Heuristic Decision Tree theo spec Phase 7.
    Returns scored site dict (score=0 nếu bị veto).
    """
    dist_km = _haversine_km(user_lat, user_lon, site["lat"], site["lon"])
    time_mins = dist_km * 1.5

    # ── Luật 1: Hard Veto ───────────────────────────────────────────────────
    if v_model < 5.0:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"V-model quá thấp ({v_model:.1f} < 5.0) — thời tiết xấu tại điểm này"}
    if delta_t <= 1.0:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"ΔT sương quá thấp ({delta_t:.1f}°C) — nguy cơ đọng sương trên kính"}

    # ── Luật 2: Khoảng cách tối đa ─────────────────────────────────────────
    if time_mins > 180:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"Quá xa ({dist_km:.0f}km, ~{time_mins:.0f} phút) — không đáng đi trong 1 đêm"}

    # ── Luật 3: Lunar Masking ───────────────────────────────────────────────
    moon_pen = _moon_penalty_bortle(moon_phase_deg)
    bortle_eff = max(site["bortle"], moon_pen)

    # ── Luật 4: Cost Function → Final Score ────────────────────────────────
    base = v_model - (bortle_eff * 0.5)
    if time_mins < 90:
        s_eff = base
        drive_note = f"Gần ({dist_km:.0f}km, ~{time_mins:.0f} phút)"
    else:  # 90 <= time_mins <= 180
        s_eff = base - 2.0
        drive_note = f"Xa vừa ({dist_km:.0f}km, ~{time_mins:.0f} phút, -2 điểm mệt đường)"

    # ── Lý do cụ thể ────────────────────────────────────────────────────────
    moon_illum_pct = round((1 + math.cos(math.radians(moon_phase_deg)))/2 * 100)
    reason_parts = [
        f"V-model {v_model:.1f}/10",
        f"Bortle thực tế {bortle_eff} (site={site['bortle']}, trăng={moon_pen})",
        drive_note,
        f"ΔT sương {delta_t:.1f}°C ✓" if delta_t > 3 else f"ΔT sương {delta_t:.1f}°C (cảnh báo)",
    ]

    return {
        **site,
        "dist_km":      round(dist_km),
        "time_mins":    round(time_mins),
        "v_model":      round(v_model, 1),
        "bortle_eff":   bortle_eff,
        "moon_illum_pct": moon_illum_pct,
        "s_eff":        round(max(0, s_eff), 2),
        "reason":       " | ".join(reason_parts),
        "veto_reason":  None,
    }

def _fetch_and_score_site(site: dict, user_lat: float, user_lon: float,
                           moon_phase_deg: float) -> dict:
    """
    Fetch Open-Meteo cho 1 site và chạy physics engine → score.
    Được gọi song song trong ThreadPoolExecutor.
    """
    try:
        atmos = Type1Fetcher.fetch_atmosphere_profile_12h(site["lat"], site["lon"])
        surface = Type1Fetcher.fetch_surface_data_12h(site["lat"], site["lon"])

        if not atmos or not surface:
            return {**site, "s_eff": 0, "veto_reason": "Không lấy được dữ liệu thời tiết"}

        # Áp suất theo độ cao thực tế (ISA lapse rate)
        surface[0]["pressure"] = surface[0].get("pressure", 1013.25) * (
            (1 - 0.0000226 * site["elevation"]) ** 5.256
        )

        # Zenith ephemeris tại site
        dummy = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith", "Magnitude": 0.0})
        ephem = AstroHelper.get_ephemeris(site["lat"], site["lon"], atmos[0]["time"], dummy)
        ephem["target_alt"] = 90.0

        payload = InterstellarOrchestrator.map_and_execute(ephem, atmos[0]["profile"], surface[0])
        v_model  = float(payload["scores"]["v_model_10"])
        delta_t  = float(payload["raw_physics"]["delta_t"])

        return _score_site(site, user_lat, user_lon, moon_phase_deg, v_model, delta_t)

    except Exception as e:
        return {**site, "s_eff": 0, "veto_reason": f"Lỗi xử lý: {str(e)[:80]}"}


class CustomSpot(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    elevation: int = 100
    bortle: int = 5
    description: str = "Điểm quan sát tùy chỉnh"

@app.post("/api/site-ranker")
def rank_sites(
    user_lat: float = Query(..., description="Vĩ độ người dùng"),
    user_lon: float = Query(..., description="Kinh độ người dùng"),
    custom_spots: list[CustomSpot] = []
):
    """
    Phase 7 — Physics-first Site Ranker.
    Batch fetch weather + run physics engine cho tất cả sites.
    Áp dụng Heuristic Decision Tree, trả về Top 5 địa điểm tốt nhất.
    """
    # Lấy moon phase tại vị trí user (đại diện cho toàn khu vực)
    try:
        t_now = datetime.now(timezone.utc)
        dummy = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith", "Magnitude": 0.0})
        ephem_user = AstroHelper.get_ephemeris(user_lat, user_lon, t_now, dummy)
        moon_phase_deg = float(ephem_user["moon_phase"])
    except Exception:
        moon_phase_deg = 90.0  # Fallback: quarter moon

    # Merge database sites + custom spots
    all_sites = list(_SITES_DB)
    for cs in custom_spots:
        all_sites.append({
            "id": cs.id, "name": cs.name, "lat": cs.lat, "lon": cs.lon,
            "elevation": cs.elevation, "bortle": cs.bortle,
            "description": cs.description, "_custom": True
        })

    # Filter: chỉ giữ sites trong bán kính 200km (pre-filter trước khi gọi API)
    candidates = [
        s for s in all_sites
        if _haversine_km(user_lat, user_lon, s["lat"], s["lon"]) <= 200
    ]

    if not candidates:
        return {"error": "Không có địa điểm nào trong bán kính 200km.", "results": []}

    # Batch fetch + score song song (max 8 workers để tránh quá tải API)
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(_fetch_and_score_site, site, user_lat, user_lon, moon_phase_deg): site
            for site in candidates
        }
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as e:
                site = futures[future]
                results.append({**site, "s_eff": 0, "veto_reason": str(e)})

    # Sort: passed sites (s_eff > 0) trước, sort theo s_eff giảm dần
    passed = sorted([r for r in results if r.get("s_eff", 0) > 0],
                    key=lambda x: x["s_eff"], reverse=True)
    vetoed = sorted([r for r in results if r.get("s_eff", 0) == 0],
                    key=lambda x: x.get("dist_km", 999))

    moon_illum = round((1 + math.cos(math.radians(moon_phase_deg)))/2 * 100)

    return to_python({
        "meta": {
            "user_lat":       user_lat,
            "user_lon":       user_lon,
            "moon_phase_deg": round(moon_phase_deg, 1),
            "moon_illum_pct": moon_illum,
            "total_evaluated": len(candidates),
            "passed":          len(passed),
            "vetoed":          len(vetoed),
        },
        "top5":   passed[:5],
        "vetoed": vetoed[:5],  # Top 5 vetoed để debug nếu cần
    })


# ── Cũng hỗ trợ GET với custom_spots trống ─────────────────────────────────
@app.get("/api/site-ranker")
def rank_sites_get(
    user_lat: float = Query(...),
    user_lon: float = Query(...)
):
    return rank_sites(user_lat=user_lat, user_lon=user_lon, custom_spots=[])


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
