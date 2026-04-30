from datetime import datetime, timezone
from ingestion.fetchers import Type1Fetcher
from physics.engine_orchestrator import InterstellarOrchestrator
from app import AstroHelper

lat, lon = 20.886355, 105.755763
atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)

for i in range(12):
    dt_utc = atmos_12h[i]["time"]
    ephem = AstroHelper.get_ephemeris(lat, lon, dt_utc, "Jupiter")
    payload = InterstellarOrchestrator.map_and_execute(ephem, atmos_12h[i]["profile"], surface_12h[i])
    scores = payload["scores"]
    print(f"{dt_utc.strftime('%H:%M')} | Alt: {ephem['target_alt']:.1f} | Trans: {payload['raw_physics']['transparency']:.2f} | Seeing: {payload['raw_physics']['seeing_arcsec']:.2f} | SQM: {payload['raw_physics']['sqm']:.1f} | V_Model: {scores['v_model_10']}")
