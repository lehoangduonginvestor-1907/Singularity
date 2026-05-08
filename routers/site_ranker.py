"""
Router: /api/site-ranker (GET + POST) — Physics-first Location Recommender
"""
import os
import json
import math
import concurrent.futures
from datetime import datetime, timezone

from fastapi import APIRouter, Query
from pydantic import BaseModel
import pandas as pd

from core.ephemeris import AstroHelper
from core.scoring import to_python
from ingestion.fetchers import Type1Fetcher
from physics.engine_orchestrator import SingularityOrchestrator

router = APIRouter()

# Load site database once at startup
_SITES_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sites_database.json")
try:
    with open(_SITES_DB_PATH, encoding="utf-8") as _f:
        _SITES_DB = json.load(_f)["sites"]
except FileNotFoundError:
    _SITES_DB = []


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def _moon_penalty_bortle(moon_phase_deg: float) -> int:
    illumination = (1 + math.cos(math.radians(moon_phase_deg))) / 2
    if illumination >= 0.80: return 7
    elif illumination >= 0.40: return 5
    else: return 1


def _score_site(site, user_lat, user_lon, moon_phase_deg, v_model, delta_t):
    dist_km = _haversine_km(user_lat, user_lon, site["lat"], site["lon"])
    time_mins = dist_km * 1.5

    if v_model < 5.0:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"V-model qua thap ({v_model:.1f} < 5.0)"}
    if delta_t <= 1.0:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"Delta-T suong qua thap ({delta_t:.1f}C)"}
    if time_mins > 300:
        return {**site, "dist_km": round(dist_km), "time_mins": round(time_mins),
                "v_model": round(v_model, 1), "s_eff": 0,
                "veto_reason": f"Qua xa ({dist_km:.0f}km)"}

    moon_pen = _moon_penalty_bortle(moon_phase_deg)
    bortle_eff = max(site["bortle"], moon_pen)
    base = v_model - (bortle_eff * 0.5)

    if time_mins < 120:
        s_eff = base
        drive_note = f"Gan ({dist_km:.0f}km, ~{time_mins:.0f} phut)"
    else:
        s_eff = base - 2.5
        drive_note = f"Xa ({dist_km:.0f}km, ~{time_mins:.0f} phut, -2.5)"

    moon_illum_pct = round((1 + math.cos(math.radians(moon_phase_deg)))/2 * 100)
    reason_parts = [
        f"V-model {v_model:.1f}/10",
        f"Bortle eff {bortle_eff} (site={site['bortle']}, moon={moon_pen})",
        drive_note,
        f"DT {delta_t:.1f}C {'OK' if delta_t > 3 else '(warn)'}",
    ]
    return {
        **site, "dist_km": round(dist_km), "time_mins": round(time_mins),
        "v_model": round(v_model, 1), "bortle_eff": bortle_eff,
        "moon_illum_pct": moon_illum_pct,
        "s_eff": round(max(0, s_eff), 2),
        "reason": " | ".join(reason_parts), "veto_reason": None,
    }


def _fetch_and_score_site(site, user_lat, user_lon, moon_phase_deg):
    try:
        atmos = Type1Fetcher.fetch_atmosphere_profile_12h(site["lat"], site["lon"])
        surface = Type1Fetcher.fetch_surface_data_12h(site["lat"], site["lon"])
        if not atmos or not surface:
            return {**site, "s_eff": 0, "veto_reason": "No weather data"}

        surface[0]["pressure"] = surface[0].get("pressure", 1013.25) * (
            (1 - 0.0000226 * site["elevation"]) ** 5.256
        )

        dummy = AstroHelper.make_zenith_series()
        ephem = AstroHelper.get_ephemeris(site["lat"], site["lon"], atmos[0]["time"], dummy)
        ephem["target_alt"] = 90.0

        payload = SingularityOrchestrator.map_and_execute(ephem, atmos[0]["profile"], surface[0])
        v_model = float(payload["scores"]["v_model_10"])
        delta_t = float(payload["raw_physics"]["delta_t"])
        return _score_site(site, user_lat, user_lon, moon_phase_deg, v_model, delta_t)
    except Exception as e:
        return {**site, "s_eff": 0, "veto_reason": f"Error: {str(e)[:80]}"}


class CustomSpot(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    elevation: int = 100
    bortle: int = 5
    description: str = "Custom observation spot"


@router.post("/api/site-ranker")
def rank_sites(
    user_lat: float = Query(...), user_lon: float = Query(...),
    custom_spots: list[CustomSpot] = None
):
    try:
        t_now = datetime.now(timezone.utc)
        dummy = AstroHelper.make_zenith_series()
        ephem_user = AstroHelper.get_ephemeris(user_lat, user_lon, t_now, dummy)
        moon_phase_deg = float(ephem_user["moon_phase"])
    except Exception:
        moon_phase_deg = 90.0

    all_sites = list(_SITES_DB)
    for cs in (custom_spots or []):
        all_sites.append({
            "id": cs.id, "name": cs.name, "lat": cs.lat, "lon": cs.lon,
            "elevation": cs.elevation, "bortle": cs.bortle,
            "description": cs.description, "_custom": True
        })

    candidates = [s for s in all_sites if _haversine_km(user_lat, user_lon, s["lat"], s["lon"]) <= 2000]
    if not candidates:
        return {"error": "No sites within 2000km.", "results": []}

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(_fetch_and_score_site, s, user_lat, user_lon, moon_phase_deg): s for s in candidates}
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as e:
                results.append({**futures[future], "s_eff": 0, "veto_reason": str(e)})

    passed = sorted([r for r in results if r.get("s_eff", 0) > 0], key=lambda x: x["s_eff"], reverse=True)
    vetoed = sorted([r for r in results if r.get("s_eff", 0) == 0], key=lambda x: x.get("dist_km", 999))
    moon_illum = round((1 + math.cos(math.radians(moon_phase_deg)))/2 * 100)

    return to_python({
        "meta": {
            "user_lat": user_lat, "user_lon": user_lon,
            "moon_phase_deg": round(moon_phase_deg, 1), "moon_illum_pct": moon_illum,
            "total_evaluated": len(candidates), "passed": len(passed), "vetoed": len(vetoed),
        },
        "top5": passed[:5], "vetoed": vetoed[:5],
    })


@router.get("/api/site-ranker")
def rank_sites_get(user_lat: float = Query(...), user_lon: float = Query(...)):
    return rank_sites(user_lat=user_lat, user_lon=user_lon, custom_spots=[])
