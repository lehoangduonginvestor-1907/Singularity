"""Tests for physics/scattering.py — Beer-Lambert, Rayleigh, Mie models."""
import pytest
from physics.scattering import k_rayleigh, hygroscopic_growth, transparency


class TestKRayleigh:
    def test_standard_conditions(self):
        k_ray = k_rayleigh(0.55, 1013.25)
        assert abs(k_ray - 0.0996) <= 0.005

    def test_blue_scatters_more_than_red(self):
        k_blue = k_rayleigh(0.45, 1013.25)
        k_red = k_rayleigh(0.70, 1013.25)
        assert k_blue > k_red


class TestHygroscopicGrowth:
    @pytest.mark.parametrize("rh, gamma, expected, tol", [
        (50.0, 0.5, 1.414, 0.01),
        (90.0, 0.5, 3.162, 0.01),
        (0.0,  0.5, 1.000, 0.01),
    ])
    def test_known_values(self, rh, gamma, expected, tol):
        result = hygroscopic_growth(rh, gamma)
        assert abs(result - expected) <= tol


class TestTransparency:
    @pytest.mark.parametrize("k_ext, x_abs, expected, tol", [
        (0.113, 1.0, 0.893, 0.01),
        (0.113, 5.6, 0.530, 0.02),
    ])
    def test_known_values(self, k_ext, x_abs, expected, tol):
        result = transparency(k_ext, x_abs)
        assert abs(result - expected) <= tol
