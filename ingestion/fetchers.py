import requests
import math
import time as _time
from datetime import datetime, timezone, timedelta
import random
import logging

log = logging.getLogger(__name__)

# ─── TTL Cache ────────────────────────────────────────────────────────────────
_CACHE = {}
_CACHE_TTL = 900  # 15 minutes — weather data doesn't change faster than this

def _cache_key(prefix: str, lat: float, lon: float) -> str:
    """Round coords to 2 decimals to improve cache hit rate (~1km precision)."""
    return f"{prefix}:{lat:.2f},{lon:.2f}"

def _get_cached(key: str):
    if key in _CACHE:
        entry = _CACHE[key]
        if _time.time() - entry["ts"] < _CACHE_TTL:
            return entry["data"]
        del _CACHE[key]  # Expired
    return None

def _set_cache(key: str, data):
    _CACHE[key] = {"data": data, "ts": _time.time()}

# ─── HTTP helper with timeout + retry ─────────────────────────────────────────
_HTTP_TIMEOUT = 15  # seconds
_HTTP_RETRIES = 2

def _robust_get(url: str, params: dict, timeout: int = _HTTP_TIMEOUT) -> dict:
    """GET with timeout and retry. Raises on final failure."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    for attempt in range(_HTTP_RETRIES + 1):
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=timeout)
            resp.raise_for_status()
            return resp.json()
        except (requests.Timeout, requests.ConnectionError) as e:
            if attempt == _HTTP_RETRIES:
                log.error(f"API request failed after {_HTTP_RETRIES + 1} attempts: {url} — {e}")
                raise
            log.warning(f"API attempt {attempt + 1} failed ({e}), retrying...")
            _time.sleep(1.0 * (attempt + 1))

class Type1Fetcher:
    """
    Fetch data from Open-Meteo API.
    """
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
                pass

        current_time_str = now_utc.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:00")
        try:
            return times.index(current_time_str)
        except ValueError:
            return 0

    @staticmethod
    def fetch_atmosphere_profile_12h(lat: float, lon: float) -> list:
        cache_key = _cache_key("atmos12h", lat, lon)
        cached = _get_cached(cache_key)
        if cached is not None:
            return cached

        url = "https://api.open-meteo.com/v1/forecast"
        
        levels = ["1000hPa", "850hPa", "700hPa", "500hPa", "300hPa"]
        variables = []
        for l in levels:
            variables.extend([f"temperature_{l}", f"windspeed_{l}", f"winddirection_{l}"])
            
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": ",".join(variables),
            "forecast_days": 2, # Ensure we have enough data for +12h if near midnight
            "timezone": "UTC"
        }
        
        resp = _robust_get(url, params)
        data = resp
        
        idx = Type1Fetcher.get_start_index(data["hourly"]["time"], lon)
        
        result_12h = []
        pressures = [1000, 850, 700, 500, 300]
        
        for i in range(idx, idx + 12):
            profile = []
            for p_hpa in pressures:
                t = data["hourly"][f"temperature_{p_hpa}hPa"][i]
                speed_kmh = data["hourly"][f"windspeed_{p_hpa}hPa"][i]
                direction_deg = data["hourly"][f"winddirection_{p_hpa}hPa"][i]
                
                speed_ms = speed_kmh / 3.6
                dir_rad = math.radians(direction_deg)
                u = -speed_ms * math.sin(dir_rad)
                v = -speed_ms * math.cos(dir_rad)
                
                profile.append({
                    "pressure": p_hpa,
                    "temp": t,
                    "wind_u": u,
                    "wind_v": v,
                    "wind_speed": speed_ms
                })
            
            dt_utc = datetime.strptime(data["hourly"]["time"][i], "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)
            result_12h.append({
                "time": dt_utc,
                "profile": profile
            })
            
        _set_cache(cache_key, result_12h)
        return result_12h

    @staticmethod
    def fetch_surface_data_12h(lat: float, lon: float) -> list:
        cache_key = _cache_key("surface12h", lat, lon)
        cached = _get_cached(cache_key)
        if cached is not None:
            return cached

        url_weather = "https://api.open-meteo.com/v1/forecast"
        params_weather = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover",
            "forecast_days": 2,
            "timezone": "UTC"
        }
        resp_weather = _robust_get(url_weather, params_weather)
        data = resp_weather
        
        url_aqi = "https://air-quality-api.open-meteo.com/v1/air-quality"
        params_aqi = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "european_aqi",
            "forecast_days": 2,
            "timezone": "UTC"
        }
        resp_aqi = _robust_get(url_aqi, params_aqi)
        data_aqi = resp_aqi
        
        idx = Type1Fetcher.get_start_index(data["hourly"]["time"], lon)
        idx_aqi = Type1Fetcher.get_start_index(data_aqi["hourly"]["time"], lon)
        
        result_12h = []
        for i in range(12):
            aqi_val = data_aqi["hourly"]["european_aqi"][idx_aqi + i]
            result_12h.append({
                "temp": data["hourly"]["temperature_2m"][idx + i],
                "rh": data["hourly"]["relative_humidity_2m"][idx + i],
                "pressure": data["hourly"]["surface_pressure"][idx + i],
                "cloud_cover": data["hourly"]["cloud_cover"][idx + i],
                "aqi": aqi_val if aqi_val is not None else 50
            })
            
        _set_cache(cache_key, result_12h)
        return result_12h

class Type2Fetcher:
    """
    Benchmark data from 7Timer API (Astro Product)
    """
    @staticmethod
    def fetch_benchmark_seeing_12h(lat: float, lon: float) -> list:
        url = f"http://www.7timer.info/bin/api.pl?lon={lon}&lat={lat}&product=astro&output=json"
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()["dataseries"]
            
            result = []
            for i in range(12):
                # 7Timer returns data in 3-hour intervals
                idx = i // 3
                if idx < len(data):
                    seeing_raw = data[idx]["seeing"]
                    trans_raw = data[idx]["transparency"]
                else:
                    seeing_raw = 8
                    trans_raw = 8
                
                # Nội suy tuyến tính lật ngược (1 -> 10, 8 -> 0)
                seeing_score = 10.0 - (seeing_raw - 1) * (10.0 / 7.0)
                trans_score = 10.0 - (trans_raw - 1) * (10.0 / 7.0)
                
                # Tổng hợp điểm Benchmark (giả định tỷ trọng 50/50 cho Seeing và Trans)
                v_model_bench = round((seeing_score + trans_score) / 2.0, 1)
                
                result.append({
                    "seeing_raw": seeing_raw,
                    "trans_raw": trans_raw,
                    "v_model_benchmark": max(0.0, min(10.0, v_model_bench)),
                    "source": "7Timer API"
                })
            return result
        except Exception as e:
            print(f"7Timer API failed: {e}")
            # Fallback nếu API chết
            return [{"v_model_benchmark": 0.0, "source": "7Timer (Error)"} for _ in range(12)]
