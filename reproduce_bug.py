import os
import sys
import json
import pandas as pd
from datetime import datetime, timezone
import math

# Mocking parts of main.py to test the logic
def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def _moon_penalty_bortle(moon_phase_deg: float) -> int:
    illumination = (1 + math.cos(math.radians(moon_phase_deg))) / 2
    if illumination >= 0.80: return 7
    elif illumination >= 0.40: return 5
    else: return 1

def _score_site(site: dict, user_lat: float, user_lon: float,
                moon_phase_deg: float, v_model: float, delta_t: float) -> dict:
    dist_km = _haversine_km(user_lat, user_lon, site["lat"], site["lon"])
    time_mins = dist_km * 1.5
    
    if v_model < 5.0:
        return {"s_eff": 0, "veto_reason": "V-model low"}
    if delta_t <= 1.0:
        return {"s_eff": 0, "veto_reason": "Dew risk"}
    if time_mins > 180:
        return {"s_eff": 0, "veto_reason": "Too far"}
    
    return {"s_eff": 10, "veto_reason": None}

# Test with user's coordinates
user_lat, user_lon = 11.2057, 107.0142
moon_phase_deg = 180.0 # New Moon for testing

with open("data/sites_database.json", encoding="utf-8") as f:
    all_sites = json.load(f)["sites"]

candidates = [s for s in all_sites if _haversine_km(user_lat, user_lon, s["lat"], s["lon"]) <= 200]
print(f"Candidates within 200km: {len(candidates)}")

for s in candidates:
    # Simulating a "good" v_model and delta_t
    res = _score_site(s, user_lat, user_lon, moon_phase_deg, 7.0, 5.0)
    print(f"- {s['name']}: {res['veto_reason'] or 'PASSED'}")
