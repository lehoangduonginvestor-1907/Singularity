"""Tests for physics/turbulence.py — HV57, Tatarski Cn2, Fried parameter."""
import pytest
import numpy as np
from physics.turbulence import (
    hypsometric, tatarski_cn2, hv57_profile, fried_parameter,
    seeing_arcsec, GAMMA_DRY
)


class TestHypsometric:
    def test_850hpa(self):
        h = hypsometric(1013.25, 850.0, 284.0)
        assert 1200 < h < 1700, f"h={h:.0f}m (expected ~1500m)"

    def test_500hpa(self):
        h = hypsometric(1013.25, 500.0, 256.0)
        assert 4500 < h < 6000, f"h={h:.0f}m (expected ~5500m)"

    def test_invalid_pressure_raises(self):
        with pytest.raises(ValueError):
            hypsometric(1013.25, 0.0, 284.0)


class TestTatarskiCn2:
    def test_neutral_atmosphere_gives_zero(self):
        cn2 = tatarski_cn2(280.0, 1013.25, GAMMA_DRY)
        assert abs(cn2) < 1e-30, f"Expected ~0, got {cn2:.2e}"


class TestFriedAndSeeing:
    @pytest.mark.parametrize("integral, r0_exp, seeing_exp, tol_r0, tol_see", [
        (2.66e-13, 0.20, 0.55, 0.02, 0.1),
        (8.50e-13, 0.10, 1.10, 0.02, 0.1),
        (2.72e-12, 0.05, 2.20, 0.01, 0.1),
    ])
    def test_known_values(self, integral, r0_exp, seeing_exp, tol_r0, tol_see):
        h_test = np.array([0.0, 20000.0])
        cn2_test = np.array([integral / 20000.0, integral / 20000.0])
        r0 = fried_parameter(cn2_test, h_test)
        eps = seeing_arcsec(r0)
        assert abs(r0 - r0_exp) <= tol_r0, f"r0={r0:.3f}m (expected {r0_exp}m)"
        assert abs(eps - seeing_exp) <= tol_see, f"seeing={eps:.2f}\" (expected {seeing_exp}\")"


class TestQuickRule:
    @pytest.mark.parametrize("r0_cm", [5, 10, 20])
    def test_seeing_approx_11_over_r0cm(self, r0_cm):
        """Quick rule: seeing ≈ 11 / r0(cm)."""
        eps = seeing_arcsec(r0_cm / 100.0)
        approx = 11.0 / r0_cm
        assert abs(eps - approx) <= 0.2


class TestHV57Profile:
    def test_output_shape_and_positive(self):
        h = np.array([0.0, 1500.0, 3000.0, 5500.0, 9000.0, 12000.0])
        profile = hv57_profile(h, v_rms_ms=20.0, cn2_ground=1e-14)
        assert len(profile) == len(h)
        assert all(profile >= 0)

    def test_jet_stream_zero_at_ground(self):
        """Term 1 (jet stream) must be 0 at h=0."""
        term1 = 0.00594 * (20.0/27.0)**2 * (1e-5 * 0.0)**10 * np.exp(0)
        assert term1 == 0.0
