"""
Router: /api/gear-check — Telescope bottleneck analysis
"""
import math
from fastapi import APIRouter, Query
from core.ephemeris import AstroHelper
from core.scoring import to_python
from ingestion.fetchers import Type1Fetcher
from ingestion.multi_source import EnsembleFetcher
from physics.engine_orchestrator import SingularityOrchestrator

router = APIRouter()

@router.get("/api/gear-check")
def get_gear_check(
    aperture_mm: float = Query(...), focal_length_mm: float = Query(...),
    eyepiece_mm: float = Query(25.0), lat: float = Query(...), lon: float = Query(...),
    ensemble: bool = Query(True, description="Use multi-model NWP ensemble")
):
    if ensemble:
        atmos = EnsembleFetcher.fetch_atmosphere_profile_12h(lat, lon)
    else:
        atmos = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    surface = Type1Fetcher.fetch_surface_data_12h(lat, lon)
    dummy = AstroHelper.make_zenith_series()
    ephem_z = AstroHelper.get_ephemeris(lat, lon, atmos[0]["time"], dummy)
    ephem_z["target_alt"] = 90.0
    payload = SingularityOrchestrator.map_and_execute(ephem_z, atmos[0]["profile"], surface[0])
    seeing = float(payload["raw_physics"]["seeing_arcsec"])

    rayleigh = math.degrees(1.22 * 550e-9 / (aperture_mm / 1000.0)) * 3600
    dawes = 116.0 / aperture_mm
    effective = max(rayleigh, seeing)
    seeing_limited = seeing > rayleigh
    equiv_ap = 116.0 / seeing if seeing_limited else aperture_mm
    lim_mag = 2.1 + 5 * math.log10(aperture_mm)
    mag_power = focal_length_mm / eyepiece_mm
    exit_p = aperture_mm / mag_power

    m_optimal = round(aperture_mm / (effective * 0.9), 0)
    m_optimal = min(m_optimal, 2.0 * aperture_mm)
    ep_optimal = round(focal_length_mm / m_optimal, 0) if m_optimal > 0 else eyepiece_mm
    COMMON_EPS = [40, 32, 25, 20, 15, 13, 10, 8, 6, 5, 4]
    ep_best = min(COMMON_EPS, key=lambda e: abs(e - ep_optimal))
    m_at_best = round(focal_length_mm / ep_best, 1)

    if seeing_limited:
        bottleneck_type = "atmosphere"
        bottleneck_narrative = (
            f"Khi quyen dem nay ({seeing:.2f}\" FWHM) te hon gioi han quang hoc cua kinh "
            f"({rayleigh:.2f}\"). Atmosphere Bottleneck. "
            f"Thi kinh tot nhat toi nay: {ep_best}mm ({m_at_best:.0f}x)."
        )
    else:
        bottleneck_type = "telescope"
        bottleneck_narrative = (
            f"Khi quyen dem nay ({seeing:.2f}\") tot hon gioi han quang hoc cua kinh "
            f"({rayleigh:.2f}\" Rayleigh). Telescope Bottleneck. "
            f"Co the cam thi kinh {ep_best}mm de day len {m_at_best:.0f}x."
        )

    doubles = [
        {"name": "Epsilon Lyrae", "sep": 2.3}, {"name": "Castor", "sep": 3.9},
        {"name": "Porrima", "sep": 2.9}, {"name": "Albireo", "sep": 34.6},
        {"name": "Mizar", "sep": 14.4},
    ]
    return to_python({
        "current_seeing_arcsec": round(seeing, 3),
        "resolution": {
            "rayleigh_arcsec": round(rayleigh, 3), "dawes_arcsec": round(dawes, 3),
            "effective_arcsec": round(effective, 3), "seeing_limited": bool(seeing_limited),
            "equiv_aperture_mm": round(equiv_ap, 1),
            "verdict": (f"Seeing-limited — acting like {equiv_ap:.0f}mm aperture"
                        if seeing_limited else "Diffraction-limited — full optical potential"),
        },
        "bottleneck": {
            "type": bottleneck_type, "narrative": bottleneck_narrative,
            "optimal_mag": int(m_optimal), "recommended_ep_mm": ep_best,
            "mag_at_best_ep": round(m_at_best, 1),
            "telescope_limit_arcsec": round(rayleigh, 2),
            "atmosphere_limit_arcsec": round(seeing, 2),
        },
        "limiting_magnitude": round(lim_mag, 1),
        "optics": {
            "magnification": round(mag_power, 1), "exit_pupil_mm": round(exit_p, 2),
            "max_useful_mag": round(2.0 * aperture_mm, 0),
            "min_mag": round(aperture_mm / 7.0, 1),
            "exit_pupil_warning": ("Too small" if exit_p < 0.5
                                   else "Too large" if exit_p > 7.0 else "Optimal"),
        },
        "double_stars": [
            {**d, "resolvable": d["sep"] > effective,
             "verdict": "Resolvable" if d["sep"] > effective else "Too close"}
            for d in doubles
        ],
    })
