"""
Multi-Source NWP Ensemble Fetcher
=================================
Fetches atmospheric data from 3 NWP models (GFS, ECMWF, ICON) via Open-Meteo
and produces a weighted-average ensemble for improved accuracy.

Why ensemble?
    - GFS:   0.25° grid (~28km) — global baseline, updated 4×/day
    - ECMWF: 0.25° grid — generally more accurate upper-atmosphere in tropics
    - ICON:  0.0625° grid (~7km, EU) / 0.125° (~13km, global) — best spatial resolution

    A weighted mean of 3 independent NWP models reduces systematic bias
    inherent in any single model. Weights are learned from historical comparison.

Reference: Ensemble Model Output Statistics (EMOS) — Gneiting et al. (2005), JASA
"""
import math
import time as _time
import logging
import concurrent.futures
from datetime import datetime, timezone, timedelta

from ingestion.fetchers import _robust_get, _cache_key, _get_cached, _set_cache, Type1Fetcher

log = logging.getLogger(__name__)

# ── NWP Model Registry ──────────────────────────────────────────────────────
NWP_MODELS = {
    "gfs": {
        "url": "https://api.open-meteo.com/v1/forecast",
        "speed_prefix": "wind_speed",       # Standardized naming
        "dir_prefix": "wind_direction",
        "temp_prefix": "temperature",
    },
    "ecmwf": {
        "url": "https://api.open-meteo.com/v1/ecmwf",
        "speed_prefix": "wind_speed",
        "dir_prefix": "wind_direction",
        "temp_prefix": "temperature",
    },
    "icon": {
        "url": "https://api.open-meteo.com/v1/dwd-icon",
        "speed_prefix": "wind_speed",
        "dir_prefix": "wind_direction",
        "temp_prefix": "temperature",
    },
}

# ── Ensemble Weights ─────────────────────────────────────────────────────────
# Default: equal weighting. Updated by calibration pipeline when data > 200 rows.
# Higher weight = more trusted model.
ENSEMBLE_WEIGHTS = {
    "gfs":   0.30,
    "ecmwf": 0.40,   # ECMWF typically more accurate for tropical upper atmosphere
    "icon":  0.30,
}

PRESSURE_LEVELS = [1000, 850, 700, 500, 300]


def _fetch_single_model_atmos(model_name: str, lat: float, lon: float) -> dict | None:
    """
    Fetch atmospheric profile from a single NWP model.
    Returns raw JSON response or None on failure.
    """
    cfg = NWP_MODELS[model_name]
    levels_str = [f"{p}hPa" for p in PRESSURE_LEVELS]
    variables = []
    for l in levels_str:
        variables.extend([
            f"{cfg['temp_prefix']}_{l}",
            f"{cfg['speed_prefix']}_{l}",
            f"{cfg['dir_prefix']}_{l}",
        ])

    params = {
        "latitude": lat, "longitude": lon,
        "hourly": ",".join(variables),
        "forecast_days": 2, "timezone": "UTC"
    }

    try:
        data = _robust_get(cfg["url"], params, timeout=12)
        return {"model": model_name, "data": data, "config": cfg}
    except Exception as e:
        log.warning(f"Ensemble: {model_name} failed — {e}")
        return None


def _parse_model_profile(result: dict, hour_index: int) -> list[dict]:
    """
    Parse a single model's response into our standard profile format.
    Returns list of {pressure, temp, wind_u, wind_v, wind_speed} dicts.
    """
    data = result["data"]
    cfg = result["config"]
    hourly = data["hourly"]
    profile = []

    for p_hpa in PRESSURE_LEVELS:
        level_str = f"{p_hpa}hPa"
        temp_key = f"{cfg['temp_prefix']}_{level_str}"
        speed_key = f"{cfg['speed_prefix']}_{level_str}"
        dir_key = f"{cfg['dir_prefix']}_{level_str}"

        temp = hourly[temp_key][hour_index]
        speed_kmh = hourly[speed_key][hour_index]
        direction_deg = hourly[dir_key][hour_index]

        # Handle None values from API
        if temp is None or speed_kmh is None or direction_deg is None:
            return []  # Model returned incomplete data

        speed_ms = speed_kmh / 3.6
        dir_rad = math.radians(direction_deg)
        u = -speed_ms * math.sin(dir_rad)
        v = -speed_ms * math.cos(dir_rad)

        profile.append({
            "pressure": p_hpa,
            "temp": temp,
            "wind_u": u,
            "wind_v": v,
            "wind_speed": speed_ms,
        })

    return profile


def _weighted_average_profiles(profiles_by_model: dict[str, list[dict]]) -> list[dict]:
    """
    Compute weighted average of atmospheric profiles from multiple NWP models.

    For each pressure level, produces:
        ensemble_value = Σ(weight_i × value_i) / Σ(weight_i)

    Only uses models that successfully returned data (graceful degradation).
    """
    available_models = [m for m in profiles_by_model if profiles_by_model[m]]
    if not available_models:
        return []

    # Normalize weights for available models only
    raw_w = {m: ENSEMBLE_WEIGHTS.get(m, 0.33) for m in available_models}
    total_w = sum(raw_w.values())
    weights = {m: w / total_w for m, w in raw_w.items()}

    ensemble = []
    for level_idx, p_hpa in enumerate(PRESSURE_LEVELS):
        temp_avg = 0.0
        u_avg = 0.0
        v_avg = 0.0
        speed_avg = 0.0

        for model_name in available_models:
            profile = profiles_by_model[model_name]
            if level_idx >= len(profile):
                continue
            layer = profile[level_idx]
            w = weights[model_name]

            temp_avg += w * layer["temp"]
            u_avg += w * layer["wind_u"]
            v_avg += w * layer["wind_v"]
            speed_avg += w * layer["wind_speed"]

        ensemble.append({
            "pressure": p_hpa,
            "temp": round(temp_avg, 2),
            "wind_u": round(u_avg, 4),
            "wind_v": round(v_avg, 4),
            "wind_speed": round(speed_avg, 4),
        })

    return ensemble


class EnsembleFetcher:
    """
    Multi-source NWP ensemble for atmospheric profiles.

    Usage:
        # Drop-in replacement for Type1Fetcher.fetch_atmosphere_profile_12h()
        result = EnsembleFetcher.fetch_atmosphere_profile_12h(lat, lon)

    Returns same format as Type1Fetcher but with ensemble-averaged profiles.
    Also includes per-model spread (disagreement) as a confidence indicator.
    """

    @staticmethod
    def fetch_atmosphere_profile_12h(lat: float, lon: float) -> list:
        """
        Fetch 12-hour atmospheric profile using NWP ensemble.

        Returns:
            list of {"time": datetime, "profile": [...], "ensemble_meta": {...}}
        """
        cache_key = _cache_key("ensemble_atmos12h", lat, lon)
        cached = _get_cached(cache_key)
        if cached is not None:
            return cached

        # ── Parallel fetch from all models ───────────────────────────────
        model_results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = {
                executor.submit(_fetch_single_model_atmos, name, lat, lon): name
                for name in NWP_MODELS
            }
            for future in concurrent.futures.as_completed(futures):
                name = futures[future]
                try:
                    result = future.result()
                    if result is not None:
                        model_results[name] = result
                except Exception as e:
                    log.warning(f"Ensemble: {name} raised {e}")

        if not model_results:
            # All models failed — fallback to GFS-only via existing Type1Fetcher
            log.error("Ensemble: ALL models failed. Falling back to GFS-only.")
            return Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)

        # ── Determine time index using first available model ─────────────
        first_model = next(iter(model_results.values()))
        times = first_model["data"]["hourly"]["time"]
        start_idx = Type1Fetcher.get_start_index(times, lon)

        # ── Build 12-hour ensemble ───────────────────────────────────────
        result_12h = []
        models_used = list(model_results.keys())

        for i in range(start_idx, start_idx + 12):
            # Parse each model's profile for this hour
            profiles_by_model = {}
            for name, result in model_results.items():
                try:
                    profiles_by_model[name] = _parse_model_profile(result, i)
                except (IndexError, KeyError):
                    profiles_by_model[name] = []

            # Weighted average
            ensemble_profile = _weighted_average_profiles(profiles_by_model)

            if not ensemble_profile:
                # Fallback to GFS if ensemble fails for this hour
                if "gfs" in profiles_by_model and profiles_by_model["gfs"]:
                    ensemble_profile = profiles_by_model["gfs"]
                else:
                    continue

            # ── Model Spread (confidence indicator) ──────────────────
            # Standard deviation of wind_speed at 300hPa across models
            # Large spread = low confidence = models disagree
            jet_speeds = []
            for name, profile in profiles_by_model.items():
                if profile and len(profile) >= 5:
                    jet_speeds.append(profile[4]["wind_speed"])  # 300hPa = index 4

            spread_300 = float(max(jet_speeds) - min(jet_speeds)) if len(jet_speeds) > 1 else 0.0

            dt_utc = datetime.strptime(times[i], "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)
            result_12h.append({
                "time": dt_utc,
                "profile": ensemble_profile,
                "ensemble_meta": {
                    "models_used": models_used,
                    "n_models": len([p for p in profiles_by_model.values() if p]),
                    "jet_stream_spread_ms": round(spread_300, 2),
                    "confidence": (
                        "high" if spread_300 < 5.0
                        else "moderate" if spread_300 < 15.0
                        else "low"
                    ),
                },
            })

        _set_cache(cache_key, result_12h)
        return result_12h
