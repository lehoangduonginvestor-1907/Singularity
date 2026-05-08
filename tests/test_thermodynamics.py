"""Tests for physics/thermodynamics.py — Dew point and thermal models."""
import pytest
from physics.thermodynamics import dew_point, delta_t, dew_warning, radiative_cooling_estimate


class TestDewPoint:
    @pytest.mark.parametrize("temp, rh, expected, tol", [
        (25.0, 80.0, 21.4, 0.2),
        (20.0, 60.0, 12.0, 0.2),
        (30.0, 90.0, 28.2, 0.2),
    ])
    def test_known_values(self, temp, rh, expected, tol):
        result = dew_point(temp, rh)
        assert abs(result - expected) <= tol


class TestDeltaT:
    def test_safe(self):
        assert delta_t(25.0, 21.4) > 3.0

    def test_danger(self):
        assert delta_t(22.0, 21.4) < 1.0

    def test_dew(self):
        assert delta_t(21.0, 21.4) <= 0.0


class TestDewWarning:
    @pytest.mark.parametrize("dt_val, expected", [
        (5.0, 0), (2.0, 1), (0.5, 2), (-1.0, 3),
    ])
    def test_thresholds(self, dt_val, expected):
        assert dew_warning(dt_val) == expected


class TestRadiativeCooling:
    def test_clear_greater_than_cloudy(self):
        assert radiative_cooling_estimate(0.0) > radiative_cooling_estimate(100.0)
