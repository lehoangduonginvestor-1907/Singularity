"""
Phase 6A: New endpoints injector.
Run once: python inject_endpoints.py
"""
import re

ENDPOINTS = r'''

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
    rayleigh = _math.degrees(1.22 * 550e-9 / (aperture_mm/1000.0)) * 3600
    dawes = 116.0 / aperture_mm
    effective = max(rayleigh, seeing)
    seeing_limited = seeing > rayleigh
    equiv_ap = 116.0/seeing if seeing_limited else aperture_mm
    lim_mag = 2.1 + 5*_math.log10(aperture_mm)
    mag_power = focal_length_mm / eyepiece_mm
    exit_p = aperture_mm / mag_power
    doubles = [
        {"name": "Epsilon Lyrae", "sep": 2.3},
        {"name": "Castor", "sep": 3.9},
        {"name": "Porrima", "sep": 2.9},
        {"name": "Albireo", "sep": 34.6},
        {"name": "Mizar", "sep": 14.4},
    ]
    return to_python({
        "current_seeing_arcsec": round(seeing, 3),
        "resolution": {
            "rayleigh_arcsec": round(rayleigh, 3),
            "dawes_arcsec": round(dawes, 3),
            "effective_arcsec": round(effective, 3),
            "seeing_limited": bool(seeing_limited),
            "equiv_aperture_mm": round(equiv_ap, 1),
            "verdict": (f"Seeing-limited - acting like {equiv_ap:.0f}mm"
                        if seeing_limited else "Diffraction-limited - full potential"),
        },
        "limiting_magnitude": round(lim_mag, 1),
        "optics": {
            "magnification": round(mag_power, 1),
            "exit_pupil_mm": round(exit_p, 2),
            "max_useful_mag": round(2.0*aperture_mm, 0),
            "min_mag": round(aperture_mm/7.0, 1),
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

'''

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

MARKER = 'if __name__ == "__main__":'
idx = content.rfind(MARKER)
new_content = content[:idx] + ENDPOINTS + content[idx:]

with open("main.py", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Injected successfully. Total lines:", new_content.count("\n"))
