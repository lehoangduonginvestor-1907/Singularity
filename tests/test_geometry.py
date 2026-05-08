"""Tests for physics/geometry.py — Spherical coordinate transforms."""
import pytest
from physics.geometry import sep_ang, eq_to_altaz


class TestSepAng:
    @pytest.mark.parametrize("a1, a2, daz, expected, tol", [
        (45.0, 60.0, 30.0, 23.28, 0.1),
        (90.0, 90.0,  0.0,  0.0,  0.01),
        ( 0.0,  0.0, 180.0, 180.0, 0.01),
    ])
    def test_known_values(self, a1, a2, daz, expected, tol):
        result = sep_ang(a1, a2, daz)
        assert abs(result - expected) <= tol


class TestEqToAltaz:
    def test_zenith_at_pole(self):
        """Star at dec=90 from lat=90 should be at alt=90."""
        alt, az = eq_to_altaz(90.0, 90.0, 0.0)
        assert abs(alt - 90.0) < 0.01
