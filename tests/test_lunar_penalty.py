"""Tests for physics/lunar_penalty.py — Krisciunas-Schaefer (1991)."""
import pytest
from physics.lunar_penalty import (
    lunar_phase_function, lunar_illuminance,
    scattering_function, sky_brightness_moon, b_moon_to_mag
)


class TestLunarPhaseFunction:
    def test_full_moon_near_one(self):
        f_full = lunar_phase_function(0.0)
        assert abs(f_full - 1.0) < 0.01

    def test_full_brighter_than_new(self):
        f_full = lunar_phase_function(0.0)
        f_new = lunar_phase_function(180.0)
        assert f_full > f_new

    def test_invalid_raises(self):
        with pytest.raises(ValueError):
            lunar_phase_function(200.0)


class TestScatteringFunction:
    def test_forward_greater_than_90(self):
        assert scattering_function(0.0) > scattering_function(90.0)

    def test_back_greater_than_90(self):
        assert scattering_function(180.0) > scattering_function(90.0)


class TestSkyBrightness:
    def test_new_moon_dimmer_than_full(self):
        i_new = lunar_illuminance(180.0, x_moon=1.5, k_ext=0.113)
        b_new = sky_brightness_moon(60.0, i_new, x_target=1.0, k_ext=0.113)
        i_full = lunar_illuminance(0.0, x_moon=1.5, k_ext=0.113)
        b_full = sky_brightness_moon(30.0, i_full, x_target=1.0, k_ext=0.113)
        assert b_new < b_full

    def test_far_dimmer_than_close(self):
        i_full = lunar_illuminance(0.0, x_moon=1.5, k_ext=0.113)
        b_close = sky_brightness_moon(30.0, i_full, x_target=1.0, k_ext=0.113)
        b_far = sky_brightness_moon(150.0, i_full, x_target=1.0, k_ext=0.113)
        assert b_far < b_close


class TestBMoonToMag:
    def test_zero_brightness_returns_offset(self):
        assert abs(b_moon_to_mag(0.0) - 22.0) < 0.01
