import math
import requests
from datetime import datetime, timezone, timedelta

def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def fetch_weather(lat, lon):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,relative_humidity_2m,surface_pressure",
        "forecast_days": 2,
        "timezone": "UTC"
    }
    resp = requests.get(url, params=params)
    return resp.json()

def calculate_dew_point(t, rh):
    # Magnus formula
    a = 17.27
    b = 237.7
    alpha = ((a * t) / (b + t)) + math.log(rh / 100.0)
    return (b * alpha) / (a - alpha)

lat, lon = 11.085, 107.05 # Ho Tri An
data = fetch_weather(lat, lon)
times = data["hourly"]["time"]
temps = data["hourly"]["temperature_2m"]
rhs = data["hourly"]["relative_humidity_2m"]

now_utc = datetime.now(timezone.utc)
# Find 18:00 local (UTC+7) -> 11:00 UTC
target_utc_str = now_utc.strftime("%Y-%m-%dT11:00")
if target_utc_str not in times:
    # try tomorrow if it's already past 11:00 UTC
    target_utc_str = (now_utc + timedelta(days=1)).strftime("%Y-%m-%dT11:00")

if target_utc_str in times:
    idx = times.index(target_utc_str)
    t = temps[idx]
    rh = rhs[idx]
    dp = calculate_dew_point(t, rh)
    delta_t = t - dp
    print(f"Time: {target_utc_str}")
    print(f"Temp: {t}C, RH: {rh}%")
    print(f"Dew Point: {dp:.2f}C")
    print(f"Delta T: {delta_t:.2f}C")
    if delta_t <= 1.0:
        print("VETOED: Dew risk!")
    else:
        print("PASSED: No dew risk.")
else:
    print(f"Time {target_utc_str} not found in forecast.")
