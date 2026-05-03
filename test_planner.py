import math
import json
import os

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

db_path = "data/sites_database.json"
with open(db_path, encoding="utf-8") as f:
    all_sites = json.load(f)["sites"]

user_lat, user_lon = 11.2057, 107.0142

candidates = [
    s for s in all_sites
    if _haversine_km(user_lat, user_lon, s["lat"], s["lon"]) <= 200
]

print(f"User location: {user_lat}, {user_lon}")
print(f"Total sites in DB: {len(all_sites)}")
print(f"Candidates found: {len(candidates)}")

for s in candidates:
    dist = _haversine_km(user_lat, user_lon, s["lat"], s["lon"])
    time_mins = dist * 1.5
    print(f"- {s['name']}: {dist:.2f}km, {time_mins:.2f} mins")
