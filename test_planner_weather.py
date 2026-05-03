import math
import json
import os
import requests
from datetime import datetime, timezone, timedelta

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

class Type1Fetcher:
    @staticmethod
    def get_start_index(times: list, lon: float = None) -> int:
        now_utc = datetime.now(timezone.utc)
        if lon is not None:
            tz_offset = round(lon / 15.0)
            current_local_time = now_utc + timedelta(hours=tz_offset)
            if current_local_time.hour < 6:
                target_local = current_local_time.replace(hour=18, minute=0, second=0, microsecond=0) - timedelta(days=1)
            else:
                target_local = current_local_time.replace(hour=18, minute=0, second=0, microsecond=0)
            target_utc = target_local - timedelta(hours=tz_offset)
            target_time_str = target_utc.strftime("%Y-%m-%dT%H:00")
            try:
                return times.index(target_time_str)
            except ValueError:
                print(f"DEBUG: {target_time_str} not found in times")
        
        current_time_str = now_utc.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:00")
        try:
            return times.index(current_time_str)
        except ValueError:
            return 0

    @staticmethod
    def fetch_atmosphere_profile_12h(lat: float, lon: float) -> list:
        url = "https://api.open-meteo.com/v1/forecast"
        levels = ["1000hPa", "850hPa", "700hPa", "500hPa", "300hPa"]
        variables = [f"temperature_{l}" for l in levels]
        params = {"latitude": lat, "longitude": lon, "hourly": ",".join(variables), "forecast_days": 2, "timezone": "UTC"}
        response = requests.get(url, params=params)
        data = response.json()
        if "hourly" not in data:
            print(f"ERROR: No hourly data for {lat}, {lon}: {data}")
            return []
        idx = Type1Fetcher.get_start_index(data["hourly"]["time"], lon)
        print(f"DEBUG: Start index for {lat}, {lon} (lon_arg={lon}) is {idx}")
        return data["hourly"]["time"][idx:idx+12]

db_path = "data/sites_database.json"
with open(db_path, encoding="utf-8") as f:
    all_sites = json.load(f)["sites"]

user_lat, user_lon = 11.2057, 107.0142
candidates = [s for s in all_sites if _haversine_km(user_lat, user_lon, s["lat"], s["lon"]) <= 200]

print(f"Candidates found: {len(candidates)}")
for s in candidates:
    times = Type1Fetcher.fetch_atmosphere_profile_12h(s["lat"], s["lon"])
    print(f"- {s['name']}: Fetched {len(times)} hours. Start: {times[0] if times else 'N/A'}")
