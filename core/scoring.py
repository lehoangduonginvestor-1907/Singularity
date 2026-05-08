"""
Scoring — Target-type-aware scoring and JSON serialization helpers.
Extracted from main.py to be shared across routers.
"""
import numpy as np

from core.ephemeris import AstroHelper
from core.catalog import df_catalog
from physics.engine_orchestrator import SingularityOrchestrator


# ── Target-type weight tables ────────────────────────────────────────────────
DSO_TYPES    = {"Nebula", "Galaxy", "Open Cluster", "Globular Cluster",
                "Supernova Remnant", "Planetary Nebula"}
PLANET_TYPES = {"Planet"}


def type_aware_score(payload: dict, target_type: str) -> float:
    """
    Re-weight sub-scores by target type and apply physics-based lunar penalty.
    DSOs: Extremely sensitive to moonlight (sensitivity=2.0, threshold=21.0).
    Planets: Very bright, low sensitivity (sensitivity=0.3, threshold=17.5).
    Formula: final_score = base_score - max(0, threshold - m_sky) * sensitivity
    """
    sc = payload["scores"]
    m_sky = payload["raw_physics"]["sqm"]

    if target_type in PLANET_TYPES:
        # Planets: seeing dominates (60%), transparency (40%), low lunar sensitivity
        base_score = (sc["seeing_score_10"] * 0.60 + sc["transparency_score_10"] * 0.40)
        sensitivity = 0.3
        threshold = 17.5
    elif target_type in DSO_TYPES:
        # DSOs: transparency and darkness are critical
        base_score = (sc["seeing_score_10"] * 0.40 + sc["transparency_score_10"] * 0.60)
        sensitivity = 2.0
        threshold = 21.0
    else:  # Double stars, Zenith, defaults
        base_score = (sc["seeing_score_10"] * 0.50 + sc["transparency_score_10"] * 0.50)
        sensitivity = 1.0
        threshold = 19.0

    lunar_penalty = max(0.0, threshold - m_sky) * sensitivity
    final_score = base_score - lunar_penalty

    return float(np.clip(final_score, 0.0, 10.0))


def get_tonights_best(lat: float, lon: float, dt_utc, atmos_profile: list,
                      surface_data: dict, zenith_trans: float, moon_phase: float) -> list:
    """Compute the top 5 observable targets for tonight."""
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

        payload  = SingularityOrchestrator.map_and_execute(ephem, atmos_profile, surface_data)
        score    = type_aware_score(payload, ttype)

        # Hard veto: dew danger or below horizon
        if payload["alerts"]["dew_danger"] or alt <= 0:
            score = 0.0

        best_targets.append({
            "Target":   str(row["Name"]),
            "Type":     ttype,
            "Mag":      float(mag),
            "Altitude": round(float(alt), 1),
            "Score":    round(score, 1),
            "LunarWeight": f"Sens:{0.3 if ttype in PLANET_TYPES else 2.0 if ttype in DSO_TYPES else 1.0}",
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
