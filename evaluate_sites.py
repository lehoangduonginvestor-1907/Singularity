import pandas as pd
import numpy as np
from datetime import datetime, timezone
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time

from ingestion.fetchers import Type1Fetcher
from physics.engine_orchestrator import SingularityOrchestrator

class AstroHelper:
    @staticmethod
    def get_ephemeris(lat: float, lon: float, time_utc: datetime, target_row: pd.Series) -> dict:
        loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
        t = Time(time_utc)
        
        target = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)
            
        target_altaz = target.transform_to(AltAz(obstime=t, location=loc))
        
        # Tính toán Mặt trăng
        moon = get_body("moon", t)
        moon_altaz = moon.transform_to(AltAz(obstime=t, location=loc))
        
        # Tính Moon Phase qua góc Separation với Sun
        sun = get_body("sun", t)
        elongation = sun.separation(moon)
        phase_angle = 180.0 - elongation.deg
        
        # Tính Separation giữa Mục tiêu và Mặt trăng
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


sites = [
    {"name": "Mauna Kea", "lat": 19.8225, "lon": -155.475},
    {"name": "Mount Fuji", "lat": 35.3625, "lon": 138.730556},
    {"name": "South Pole", "lat": -90.0, "lon": 0.0},
    {"name": "Atacama", "lat": -23.019167, "lon": -67.753056},
    {"name": "Greenwich", "lat": 51.477778, "lon": -0.001389},
]

for site in sites:
    lat = site["lat"]
    lon = site["lon"]
    print(f"--- {site['name']} ---")
    try:
        atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
        surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
        
        current_time = atmos_12h[0]["time"]
        
        dummy_zenith = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith"})
        ephem_z = AstroHelper.get_ephemeris(lat, lon, current_time, dummy_zenith)
        ephem_z["target_alt"] = 90.0
        
        payload_z = SingularityOrchestrator.map_and_execute(ephem_z, atmos_12h[0]["profile"], surface_12h[0])
        
        print(f"Seeing (arcsec): {payload_z['raw_physics']['seeing_arcsec']:.2f}")
        print(f"Transparency: {payload_z['raw_physics']['transparency']:.2f}")
        print(f"SQM: {payload_z['raw_physics']['sqm']:.2f}")
        print(f"V-model: {payload_z['scores']['v_model_10']:.2f}")
    except Exception as e:
        import traceback
        traceback.print_exc()
