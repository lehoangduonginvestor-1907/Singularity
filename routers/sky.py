"""
Router: /api/global-sky + /api/health
"""
from fastapi import APIRouter, Query

from core.ephemeris import AstroHelper
from core.catalog import df_catalog
from core.scoring import type_aware_score, get_tonights_best, to_python
from ingestion.fetchers import Type1Fetcher
from ingestion.multi_source import EnsembleFetcher
from physics.engine_orchestrator import SingularityOrchestrator

router = APIRouter()


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
        "catalog_names": df_catalog["Name"].tolist()
    }

    # Include ensemble metadata if available
    meta = atmos_12h[0].get("ensemble_meta")
    if meta:
        response["ensemble"] = meta

    return to_python(response)
