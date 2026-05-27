import pandas as pd
from evaluate_sites import AstroHelper, sites
from ingestion.fetchers import Type1Fetcher
from physics.engine_orchestrator import SingularityOrchestrator
from physics.singularity_engine import phys_engine

print("=== MOCK FULL MOON ZENITH TEST ===")
sensor_mock = {
    "temp_c": 15.0,
    "rh_percent": 50.0,
    "pressure_hpa": 1013.25,
    "t_lens_c": 15.0
}
api_mock = {
    "aqi": 10,
    "pm2_5": 5.0,
    "cloud_cover": 0.0,
    "moon_phase_deg": 0.0,    # Full Moon
    "moon_alt_deg": 90.0,     # Zenith
    "moon_az_deg": 180.0,
    "v_300hpa": 20.0,
    "pressure_levels": {
        "pressure_hpa": [1000, 850, 700, 500, 300],
        "temp_k":       [288, 280, 270, 255, 235],
        "wind_u":       [0, 0, 0, 0, 0],
        "wind_v":       [0, 0, 0, 0, 0],
    }
}
target_mock = {"alt_deg": 90.0, "az_deg": 180.0} # Zenith
out = phys_engine(target_mock, api_mock, sensor_mock)
print(f"Mock SQM (Full Moon @ Zenith): {out['sqm']:.2f}\n")

print("=== LIVE DATA TEST ===")
target_sites = [s for s in sites if s["name"] in ["Atacama", "South Pole"]]

for site in target_sites:
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
        print(f"Error: {e}")
