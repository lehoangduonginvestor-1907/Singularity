"""
Router: /api/visibility-window
"""
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Query
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time

from core.catalog import df_catalog
from core.scoring import to_python

router = APIRouter()


@router.get("/api/visibility-window")
def get_visibility_window(lat: float = Query(...), lon: float = Query(...), target_name: str = Query(...), days: int = Query(5)):
    target_row = df_catalog[df_catalog["Name"] == target_name]
    if target_row.empty:
        return {"error": "Target not found"}
    target_row = target_row.iloc[0]
    loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
    base = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    result_days = []
    for day_offset in range(min(days, 7)):
        day_start = base + timedelta(days=day_offset)
        conf_pct = [90, 85, 72, 65, 55, 48, 42][day_offset]
        confidence = "high" if day_offset < 2 else "moderate" if day_offset < 4 else "low"
        hourly = []; sun_alts = []; best_alt = -90.0; transit_hour = 12
        for h in range(24):
            t = Time(day_start + timedelta(hours=h))
            if target_row["Type"] == "Planet":
                body = get_body(target_row["Name"].lower(), t)
            else:
                body = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)
            alt = float(body.transform_to(AltAz(obstime=t, location=loc)).alt.deg)
            sun_alt = float(get_body("sun", t).transform_to(AltAz(obstime=t, location=loc)).alt.deg)
            sun_alts.append(sun_alt)
            zone = "ideal" if alt >= 50 else "good" if alt >= 30 else "poor"
            hourly.append({"hour": h, "alt": round(alt, 1), "zone": zone})
            if alt > best_alt:
                best_alt = alt; transit_hour = h
        dark_s = next((h for h in range(24) if sun_alts[h] < -18), 18)
        dark_e = next((h for h in range(23, -1, -1) if sun_alts[h] < -18), 6)
        sunset = next((h for h in range(24) if sun_alts[h] < 0), None)
        vis = [h["hour"] for h in hourly if h["alt"] > 30 and (h["hour"] >= dark_s or h["hour"] <= dark_e)]
        result_days.append(to_python({
            "date": day_start.strftime("%Y-%m-%d"),
            "day_label": ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"][day_offset],
            "confidence": confidence, "confidence_pct": conf_pct,
            "hourly_altitude": hourly, "transit_hour": transit_hour,
            "transit_alt": round(float(best_alt), 1),
            "twilight": {"civil_sunset_utc": sunset, "astro_dark_start_utc": dark_s, "astro_dark_end_utc": dark_e},
            "visibility_window_hours": vis,
            "best_window": f"{min(vis):02d}:00-{max(vis):02d}:00 UTC" if vis else "Not visible",
        }))
    return to_python({"target": str(target_row["Name"]), "days": result_days})
