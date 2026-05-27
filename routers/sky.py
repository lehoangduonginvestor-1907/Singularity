"""
Router: /api/global-sky + /api/health
"""
import math
from datetime import timedelta
from fastapi import APIRouter, Query
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time

from core.ephemeris import AstroHelper
from core.catalog import df_catalog
from core.scoring import type_aware_score, get_tonights_best, to_python
from ingestion.fetchers import Type1Fetcher
from ingestion.multi_source import EnsembleFetcher
from physics.engine_orchestrator import SingularityOrchestrator

router = APIRouter()

CATALOG_METADATA = {
    "Jupiter": {"short": "Jupiter", "sub": "Gas Giant", "region": "Solar System"},
    "Saturn": {"short": "Saturn", "sub": "Ringed Planet", "region": "Solar System"},
    "Mars": {"short": "Mars", "sub": "Red Planet", "region": "Solar System"},
    "Venus": {"short": "Venus", "sub": "Morning Star", "region": "Solar System"},
    "Orion Nebula (M42)": {"short": "M42", "sub": "Orion Nebula", "region": "Orion"},
    "Pleiades (M45)": {"short": "M45", "sub": "Seven Sisters", "region": "Taurus"},
    "Hercules Cluster (M13)": {"short": "M13", "sub": "Great Globular Cluster", "region": "Hercules"},
    "Lagoon Nebula (M8)": {"short": "M8", "sub": "Lagoon Nebula", "region": "Sagittarius"},
    "Dumbbell Nebula (M27)": {"short": "M27", "sub": "Dumbbell Nebula", "region": "Vulpecula"},
    "Ring Nebula (M57)": {"short": "M57", "sub": "Ring Nebula", "region": "Lyra"},
    "Crab Nebula (M1)": {"short": "M1", "sub": "Crab Nebula", "region": "Taurus"},
    "Eagle Nebula (M16)": {"short": "M16", "sub": "Eagle Nebula", "region": "Serpens"},
    "Omega Centauri (NGC 5139)": {"short": "NGC 5139", "sub": "Omega Centauri", "region": "Centaurus"},
    "Tarantula Nebula (NGC 2070)": {"short": "NGC 2070", "sub": "Tarantula Nebula", "region": "Dorado"},
    "Andromeda Galaxy (M31)": {"short": "M31", "sub": "Andromeda Galaxy", "region": "Andromeda"},
    "Triangulum Galaxy (M33)": {"short": "M33", "sub": "Triangulum Galaxy", "region": "Triangulum"},
    "Sombrero Galaxy (M104)": {"short": "M104", "sub": "Sombrero Galaxy", "region": "Virgo"},
    "Whirlpool Galaxy (M51)": {"short": "M51", "sub": "Whirlpool", "region": "Canes Venatici"},
    "Bode's Galaxy (M81)": {"short": "M81", "sub": "Bode's Galaxy", "region": "Ursa Major"},
    "Cigar Galaxy (M82)": {"short": "M82", "sub": "Cigar Galaxy", "region": "Ursa Major"}
}


def _get_atmos_fetcher(use_ensemble: bool):
    """Select atmosphere data source: ensemble (3 NWP models) or GFS-only."""
    if use_ensemble:
        return EnsembleFetcher.fetch_atmosphere_profile_12h
    return Type1Fetcher.fetch_atmosphere_profile_12h


@router.get("/api/health")
def health_check():
    """Readiness check for deployment monitoring."""
    return {"status": "ok", "catalog_size": len(df_catalog), "ensemble_available": True}


@router.get("/api/global-sky")
def get_global_sky(
    lat: float = Query(...),
    lon: float = Query(...),
    ensemble: bool = Query(True, description="Use multi-model NWP ensemble (GFS+ECMWF+ICON)")
):
    fetch_atmos = _get_atmos_fetcher(ensemble)
    atmos_12h = fetch_atmos(lat, lon)
    surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)

    current_time = atmos_12h[0]["time"]

    dummy_zenith = AstroHelper.make_zenith_series()
    
    peak_score = -1.0
    best_idx = 0
    best_payload = None
    best_ephem = None
    best_time = None

    # Evaluate the full 12-hour forecast to find the peak observing window
    for i in range(len(atmos_12h)):
        t = atmos_12h[i]["time"]
        ephem_z = AstroHelper.get_ephemeris(lat, lon, t, dummy_zenith)
        ephem_z["target_alt"] = 90.0
        payload_z = SingularityOrchestrator.map_and_execute(ephem_z, atmos_12h[i]["profile"], surface_12h[i])
        score = type_aware_score(payload_z, "Zenith")
        
        if score > peak_score:
            peak_score = score
            best_idx = i
            best_payload = payload_z
            best_ephem = ephem_z
            best_time = t

    zenith_trans = float(best_payload["raw_physics"]["transparency"])
    seeing_arcsec = float(best_payload["raw_physics"]["seeing_arcsec"])
    sqm = float(best_payload["raw_physics"]["sqm"])
    dew_danger = bool(best_payload["alerts"]["dew_danger"])

    best_targets = get_tonights_best(
        lat, lon, best_time, atmos_12h[best_idx]["profile"], surface_12h[best_idx],
        zenith_trans, best_ephem["moon_phase"]
    )

    # 1. Local time formatting helper
    tz_offset = round(lon / 15.0)
    def to_local_string(dt):
        if dt is None:
            return "--:--"
        local_dt = dt + timedelta(hours=tz_offset)
        return local_dt.strftime("%H:%M")

    # 2. Calculate Moon rise/set/transit times over 24h
    loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
    times_24h = [best_time + timedelta(hours=h) for h in range(-12, 13)]
    alts = []
    for t_step in times_24h:
        t_astropy = Time(t_step)
        moon_body = get_body("moon", t_astropy)
        altaz = moon_body.transform_to(AltAz(obstime=t_astropy, location=loc))
        alts.append(float(altaz.alt.deg))

    max_idx = alts.index(max(alts))
    transit_time = times_24h[max_idx]

    rise_time = None
    set_time = None
    for idx in range(len(alts) - 1):
        alt1, alt2 = alts[idx], alts[idx+1]
        t1, t2 = times_24h[idx], times_24h[idx+1]
        if alt1 <= 0 < alt2:
            fraction = -alt1 / (alt2 - alt1)
            rise_time = t1 + timedelta(seconds=fraction * 3600)
        elif alt1 >= 0 > alt2:
            fraction = alt1 / (alt1 - alt2)
            set_time = t1 + timedelta(seconds=fraction * 3600)

    rise_local = to_local_string(rise_time)
    transit_local = to_local_string(transit_time)
    set_local = to_local_string(set_time)

    # 3. Determine Moon phase waxing/waning
    phase_deg = float(best_ephem["moon_phase"])
    t_plus_1h = Time(best_time + timedelta(hours=1))
    sun_body_1h = get_body("sun", t_plus_1h)
    moon_body_1h = get_body("moon", t_plus_1h)
    elongation_1h = sun_body_1h.separation(moon_body_1h)
    phase_deg_1h = 180.0 - elongation_1h.deg
    is_waxing = phase_deg_1h < phase_deg

    moon_illum = (1 + math.cos(math.radians(phase_deg))) / 2 * 100

    if phase_deg <= 10 or phase_deg >= 170:
        phase_en = "Full Moon" if phase_deg <= 10 else "New Moon"
        phase_vi = "Trăng Tròn" if phase_deg <= 10 else "Trăng Non"
    elif 80 <= phase_deg <= 100:
        phase_en = "First Quarter" if is_waxing else "Last Quarter"
        phase_vi = "Bán Nguyệt Đầu Tháng" if is_waxing else "Bán Nguyệt Cuối Tháng"
    elif phase_deg < 90:
        phase_en = "Waxing Gibbous" if is_waxing else "Waning Gibbous"
        phase_vi = "Trăng Khuyết Đầu Tháng" if is_waxing else "Trăng Khuyết Cuối Tháng"
    else:
        phase_en = "Waxing Crescent" if is_waxing else "Waning Crescent"
        phase_vi = "Trăng Lưỡi Liềm Đầu Tháng" if is_waxing else "Trăng Lưỡi Liềm Cuối Tháng"

    moon_metrics = {
        "illumination": round(moon_illum),
        "phase_angle_deg": round(phase_deg, 1),
        "phase_label_en": phase_en,
        "phase_label_vi": phase_vi,
        "rise_local": rise_local,
        "transit_local": transit_local,
        "set_local": set_local,
        "is_waxing": is_waxing
    }

    # 4. Determine Featured Target
    featured_target = None
    if best_targets:
        top_t = best_targets[0]
        featured_name = top_t["Target"]
        meta = CATALOG_METADATA.get(featured_name, {"short": featured_name, "sub": top_t["Type"], "region": "Celestial"})
        
        # Calculate transit time local
        featured_row = df_catalog[df_catalog["Name"] == featured_name].iloc[0]
        f_alts = []
        f_times = [best_time + timedelta(hours=h) for h in range(-12, 13)]
        for t_step in f_times:
            t_astropy = Time(t_step)
            if featured_row["Type"] == "Planet":
                body = get_body(featured_row["Name"].lower(), t_astropy)
            else:
                body = SkyCoord(ra=featured_row["RA"]*u.deg, dec=featured_row["Dec"]*u.deg)
            altaz = body.transform_to(AltAz(obstime=t_astropy, location=loc))
            f_alts.append(float(altaz.alt.deg))
        
        max_f_idx = f_alts.index(max(f_alts))
        featured_transit_time = f_times[max_f_idx]
        featured_transit_local = to_local_string(featured_transit_time)
        
        featured_target = {
            "name": meta["short"],
            "fullname": featured_name,
            "sub": meta["sub"],
            "region": meta["region"],
            "type": top_t["Type"],
            "mag": top_t["Mag"],
            "alt": top_t["Altitude"],
            "score": top_t["Score"],
            "transit_local": featured_transit_local
        }
    else:
        # Fallback featured target if none are found tonight
        featured_target = {
            "name": "M51",
            "fullname": "Whirlpool Galaxy (M51)",
            "sub": "Whirlpool",
            "region": "Canes Venatici",
            "type": "Galaxy",
            "mag": 8.4,
            "alt": 72.0,
            "score": 7.8,
            "transit_local": "00:30"
        }

    response = {
        "time_utc": current_time.isoformat(),
        "best_time_utc": best_time.isoformat(),
        "zenith_metrics": {
            "global_score": round(peak_score, 1),
            "seeing_arcsec": round(seeing_arcsec, 2),
            "transparency": round(zenith_trans, 2),
            "sqm": round(sqm, 2),
            "dew_danger": dew_danger
        },
        "tonights_best": best_targets,
        "catalog_names": df_catalog["Name"].tolist(),
        "moon_metrics": moon_metrics,
        "featured_target": featured_target
    }

    # Include ensemble metadata if available
    meta = atmos_12h[0].get("ensemble_meta")
    if meta:
        response["ensemble"] = meta

    return to_python(response)
