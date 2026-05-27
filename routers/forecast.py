"""
Router: /api/target-forecast + /api/debug-forecast
"""
from fastapi import APIRouter, Query

from core.ephemeris import AstroHelper
from core.catalog import df_catalog
from core.scoring import type_aware_score, to_python, DSO_TYPES, PLANET_TYPES
from ingestion.fetchers import Type1Fetcher, Type2Fetcher
from ingestion.multi_source import EnsembleFetcher
from physics.engine_orchestrator import SingularityOrchestrator

router = APIRouter()


def _get_atmos(ensemble: bool, lat: float, lon: float):
    if ensemble:
        return EnsembleFetcher.fetch_atmosphere_profile_12h(lat, lon)
    return Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)


@router.get("/api/target-forecast")
def get_target_forecast(
    lat: float = Query(...), lon: float = Query(...),
    target_name: str = Query(...),
    ensemble: bool = Query(True, description="Use multi-model NWP ensemble")
):
    atmos_12h = _get_atmos(ensemble, lat, lon)
    surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    bench_12h = Type2Fetcher.fetch_benchmark_seeing_12h(lat, lon)

    target_row = df_catalog[df_catalog["Name"] == target_name]
    if target_row.empty:
        return {"error": "Target not found"}
    target_row = target_row.iloc[0]
    ttype = str(target_row["Type"])

    forecast = []
    for i in range(12):
        current_time = atmos_12h[i]["time"]
        ephem = AstroHelper.get_ephemeris(lat, lon, current_time, target_row)
        payload = SingularityOrchestrator.map_and_execute(ephem, atmos_12h[i]["profile"], surface_12h[i])

        # Áp dụng logic chấm điểm mới cho từng bước forecast
        score = type_aware_score(payload, ttype)

        forecast.append({
            "time": current_time.isoformat(),
            "physics_score": round(score, 1),
            "benchmark_score": float(bench_12h[i]["v_model_benchmark"])
        })

    return {"forecast": forecast}


@router.get("/api/debug-forecast")
def get_debug_forecast(
    lat: float = Query(...), lon: float = Query(...),
    target_name: str = Query(...),
    ensemble: bool = Query(True, description="Use multi-model NWP ensemble")
):
    atmos_12h = _get_atmos(ensemble, lat, lon)
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
        payload = SingularityOrchestrator.map_and_execute(ephem, profile, surface)

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

        ttype_str = str(target_row["Type"])
        debug_rows.append({
            # ── Time & Geometry ──
            "time": current_time.isoformat(),
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
                "pm2_5": round(float(surface.get("pm2_5", 15.0)), 1),
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

            # ── Heuristic Scores (Singularity) ──
            "singularity_scores": {
                "seeing_score": round(float(sc["seeing_score_10"]), 2),
                "transparency_score": round(float(sc["transparency_score_10"]), 2),
                "lunar_penalty_applied": round(max(0, (21.0 if ttype_str in DSO_TYPES else 17.5 if ttype_str in PLANET_TYPES else 19.0) - rp["sqm"]) * (2.0 if ttype_str in DSO_TYPES else 0.3 if ttype_str in PLANET_TYPES else 1.0), 2),
                "final_score": round(type_aware_score(payload, ttype_str), 2),
                "logic": "Physics-based Sensitivity Penalty",
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
                    "Singularity significantly more optimistic"
                    if float(sc["v_model_10"]) - float(bench["v_model_benchmark"]) > 2
                    else "7Timer more optimistic"
                    if float(bench["v_model_benchmark"]) - float(sc["v_model_10"]) > 2
                    else "Models in agreement"
                ),
            },
        })

    result = {"target": str(target_row["Name"]), "debug": debug_rows}
    meta = atmos_12h[0].get("ensemble_meta")
    if meta:
        result["ensemble"] = meta
    return to_python(result)
