"""
AstroHelper — Single source of truth for ephemeris calculations.
Previously duplicated in main.py, app.py, evaluate_sites.py.
"""
import pandas as pd
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time
from datetime import datetime


class AstroHelper:
    @staticmethod
    def get_ephemeris(lat: float, lon: float, time_utc: datetime, target_row: pd.Series) -> dict:
        """
        Compute target + moon ephemeris for a given location and time.

        Args:
            lat: Observer latitude (degrees)
            lon: Observer longitude (degrees)
            time_utc: Observation time (UTC)
            target_row: pd.Series with keys: Name, RA, Dec, Type

        Returns:
            dict with target/moon alt/az/ra/dec, hour angles, moon phase, moon separation
        """
        loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
        t = Time(time_utc)

        target_name = target_row["Name"]
        target_type = target_row["Type"]

        if target_type == "Planet" or target_type == "Zenith":
            if target_type == "Zenith":
                target = get_body("jupiter", t)  # dummy body, alt will be forced to 90
            else:
                target = get_body(target_name.lower(), t)
        else:
            target = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)

        target_altaz = target.transform_to(AltAz(obstime=t, location=loc))
        moon = get_body("moon", t)
        moon_altaz = moon.transform_to(AltAz(obstime=t, location=loc))

        sun = get_body("sun", t)
        elongation = sun.separation(moon)
        phase_angle = 180.0 - elongation.deg
        rho_deg = target.separation(moon).deg

        lst = t.sidereal_time('apparent', longitude=loc.lon)
        target_ha = (lst - target.ra).deg
        moon_ha = (lst - moon.ra).deg

        return {
            'target_dec': target.dec.deg,
            'target_ra': target.ra.deg,
            'target_alt': target_altaz.alt.deg,
            'target_az': target_altaz.az.deg,
            'ha': target_ha,
            'lat': lat,
            'moon_dec': moon.dec.deg,
            'moon_ra': moon.ra.deg,
            'moon_alt': moon_altaz.alt.deg,
            'moon_az': moon_altaz.az.deg,
            'moon_ha': moon_ha,
            'moon_phase': phase_angle,
            'moon_sep': rho_deg
        }

    @staticmethod
    def make_zenith_series() -> pd.Series:
        """Create a dummy Zenith target row for global sky evaluation."""
        return pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith", "Magnitude": 0.0})
