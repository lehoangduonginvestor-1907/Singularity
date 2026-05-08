"""Tests for physics/air_mass.py — Kasten-Young (1989) air mass model."""
import pytest
from physics.air_mass import rel_air_mass, abs_air_mass, air_mass_warning


class TestRelAirMass:
    @pytest.mark.parametrize("alt, expected, tol", [
        (90.0, 1.000, 0.001),
        (45.0, 1.413, 0.001),
        (10.0, 5.587, 0.01),
    ])
    def test_known_values(self, alt, expected, tol):
        result = rel_air_mass(alt)
        assert abs(result - expected) <= tol, f"alt={alt} -> X_rel={result:.3f} (expected {expected})"

    def test_invalid_alt_raises(self):
        with pytest.raises(ValueError):
            rel_air_mass(0.0)
        with pytest.raises(ValueError):
            rel_air_mass(-5.0)


class TestAbsAirMass:
    def test_pressure_correction(self):
        """Da Lat (850 hPa) should have lower X_abs than Ha Noi (1013 hPa)."""
        x_hanoi = abs_air_mass(45.0, 1013.25)
        x_dalat = abs_air_mass(45.0, 850.0)
        assert x_dalat < x_hanoi

    def test_invalid_pressure_raises(self):
        with pytest.raises(ValueError):
            abs_air_mass(45.0, 300.0)


class TestAirMassWarning:
    def test_safe(self):
        assert not air_mass_warning(3.0)

    def test_warning(self):
        assert air_mass_warning(6.0)
