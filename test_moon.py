import pandas as pd
from evaluate_sites import AstroHelper, sites
from ingestion.fetchers import Type1Fetcher
from physics.engine_orchestrator import SingularityOrchestrator

for site in sites:
    lat = site["lat"]
    lon = site["lon"]
    atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
    current_time = atmos_12h[0]["time"]
    dummy_zenith = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith"})
    ephem_z = AstroHelper.get_ephemeris(lat, lon, current_time, dummy_zenith)
    print(f"--- {site['name']} ---")
    print(f"Moon Alt: {ephem_z['moon_alt']:.1f}, Moon Phase: {ephem_z['moon_phase']:.1f}, Moon Sep: {ephem_z['moon_sep']:.1f}")
