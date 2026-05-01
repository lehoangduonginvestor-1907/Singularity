"""
Singularity Data Collector
============================
Chạy độc lập (không cần FastAPI). Được gọi bởi GitHub Actions mỗi giờ.

Logic:
  1. Kết nối Google Sheets qua Service Account.
  2. Đọc timestamp cuối cùng trong sheet để phát hiện gap.
  3. Backfill toàn bộ giờ bị thiếu từ Open-Meteo historical API.
  4. Append các row mới vào sheet.
"""

import os
import sys
import json
import math
import logging
import requests
import numpy as np
import pandas as pd
import time
import csv
from datetime import datetime, timezone, timedelta

# ─── Thiết lập import physics engine ─────────────────────────────────────────
# Script chạy từ thư mục gốc của project
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from physics.engine_orchestrator import SingularityOrchestrator
from ingestion.fetchers import Type2Fetcher

import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body
from astropy.time import Time

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("collector")

# ─── CONFIG ──────────────────────────────────────────────────────────────────
LAT  = float(os.getenv("COLLECT_LAT",  "20.886355"))
LON  = float(os.getenv("COLLECT_LON",  "105.755763"))
CSV_FILE = "catalog.csv"
LOCAL_UTC_OFFSET = int(os.getenv("LOCAL_UTC_OFFSET", "7"))
SLEEP_INTERVAL = int(os.getenv("SLEEP_INTERVAL", "1800")) # 30 phút mặc định

COLUMNS = [
    "timestamp_utc", "timestamp_local", "lat", "lon",
    # Surface
    "surf_temp_c", "surf_rh_pct", "surf_pressure_hpa", "surf_cloud_cover_pct", "surf_aqi",
    "surf_wind_ms", "surf_wind_dir",
    # Atmospheric layers (Temp, Speed, Direction)
    "atmos_1000hpa_temp_c", "atmos_1000hpa_wind_ms", "atmos_1000hpa_wind_dir",
    "atmos_850hpa_temp_c",  "atmos_850hpa_wind_ms",  "atmos_850hpa_wind_dir",
    "atmos_700hpa_temp_c",  "atmos_700hpa_wind_ms",  "atmos_700hpa_wind_dir",
    "atmos_500hpa_temp_c",  "atmos_500hpa_wind_ms",  "atmos_500hpa_wind_dir",
    "atmos_300hpa_temp_c",  "atmos_300hpa_wind_ms",  "atmos_300hpa_wind_dir",
    # Ephemeris
    "moon_phase_deg", "moon_alt_deg", "target_alt_deg",
    # Core Physics
    "seeing_arcsec", "transparency", "sqm_mag_arcsec2", "bortle_class",
    "air_mass", "delta_t_dew_c",
    # Alerts
    "dew_danger", "air_mass_warning",
    # Heuristic Scores
    "seeing_score_10", "transparency_score_10", "lunar_score_10", "v_model_10",
    # 7Timer Benchmark
    "bench_seeing_raw", "bench_trans_raw", "bench_v_model",
    # Delta
    "score_delta",
]


# ─── LOCAL STORAGE ───────────────────────────────────────────────────────────
def ensure_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(COLUMNS)
        log.info(f"Created new CSV file: {CSV_FILE}")

def get_last_timestamp_csv() -> datetime | None:
    if not os.path.exists(CSV_FILE):
        return None
    try:
        # Sử dụng header=0 để đảm bảo bỏ qua dòng đầu tiên
        df = pd.read_csv(CSV_FILE)
        if df.empty:
            return None
        last_val = df["timestamp_utc"].iloc[-1]
        return datetime.fromisoformat(last_val).replace(tzinfo=timezone.utc)
    except Exception:
        return None

def append_to_csv(rows):
    with open(CSV_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)


def get_bortle(sqm):
    """Tính Bortle Class từ SQM (ước tính)."""
    if sqm > 21.75: return 1
    if sqm > 21.60: return 2
    if sqm > 21.30: return 3
    if sqm > 20.80: return 4
    if sqm > 20.10: return 5
    if sqm > 19.50: return 6
    if sqm > 18.50: return 7
    if sqm > 17.50: return 8
    return 9

# ─── OPEN-METEO HISTORICAL FETCH ─────────────────────────────────────────────
def fetch_historical_hours(lat: float, lon: float,
                           start_dt: datetime, end_dt: datetime) -> list[dict]:
    """
    Lấy dữ liệu từ Open-Meteo cho một khoảng thời gian cụ thể.
    Bao gồm cả dữ liệu atmospheric profile lẫn surface.
    """
    start_str = start_dt.strftime("%Y-%m-%d")
    end_str   = end_dt.strftime("%Y-%m-%d")

    # Atmospheric
    levels = ["1000hPa", "850hPa", "700hPa", "500hPa", "300hPa"]
    atmos_vars = []
    for l in levels:
        atmos_vars.extend([f"temperature_{l}", f"windspeed_{l}", f"winddirection_{l}"])

    url_atmos = "https://api.open-meteo.com/v1/forecast"
    params_a = {
        "latitude": lat, "longitude": lon,
        "hourly": ",".join(atmos_vars),
        "start_date": start_str, "end_date": end_str,
        "timezone": "UTC",
    }
    ra = requests.get(url_atmos, params=params_a, timeout=30)
    ra.raise_for_status()
    da = ra.json()

    # Surface
    url_surf = "https://api.open-meteo.com/v1/forecast"
    params_s = {
        "latitude": lat, "longitude": lon,
        "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover,windspeed_10m,winddirection_10m",
        "start_date": start_str, "end_date": end_str,
        "timezone": "UTC",
    }
    rs = requests.get(url_surf, params=params_s, timeout=30)
    rs.raise_for_status()
    ds = rs.json()

    # AQI
    url_aqi = "https://air-quality-api.open-meteo.com/v1/air-quality"
    params_q = {
        "latitude": lat, "longitude": lon,
        "hourly": "european_aqi",
        "start_date": start_str, "end_date": end_str,
        "timezone": "UTC",
    }
    rq = requests.get(url_aqi, params=params_q, timeout=30)
    rq.raise_for_status()
    dq = rq.json()

    times = da["hourly"]["time"]
    pressures = [1000, 850, 700, 500, 300]
    p_labels  = ["1000hPa", "850hPa", "700hPa", "500hPa", "300hPa"]

    result = []
    for i, t_str in enumerate(times):
        t_dt = datetime.strptime(t_str, "%Y-%m-%dT%H:%M").replace(tzinfo=timezone.utc)
        # Filter to our window
        if t_dt < start_dt or t_dt > end_dt:
            continue

        profile = []
        for p_hpa, p_label in zip(pressures, p_labels):
            speed_kmh = da["hourly"][f"windspeed_{p_label}"][i] or 0
            direction = da["hourly"][f"winddirection_{p_label}"][i] or 0
            speed_ms  = speed_kmh / 3.6
            profile.append({
                "pressure": p_hpa,
                "temp": da["hourly"][f"temperature_{p_label}"][i] or 0,
                "wind_speed": speed_ms,
                "wind_dir": direction,
            })

        aqi_val = dq["hourly"]["european_aqi"][i]
        surface = {
            "temp":         ds["hourly"]["temperature_2m"][i] or 0,
            "rh":           ds["hourly"]["relative_humidity_2m"][i] or 0,
            "pressure":     ds["hourly"]["surface_pressure"][i] or 1013,
            "cloud_cover":  ds["hourly"]["cloud_cover"][i] or 0,
            "aqi":          aqi_val if aqi_val is not None else 50,
            "wind_speed":   (ds["hourly"]["windspeed_10m"][i] or 0) / 3.6,
            "wind_dir":     ds["hourly"]["winddirection_10m"][i] or 0,
        }
        result.append({"time": t_dt, "profile": profile, "surface": surface})

    return result


# ─── EPHEMERIS ────────────────────────────────────────────────────────────────
def get_moon_ephemeris(lat: float, lon: float, time_utc: datetime) -> dict:
    loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
    t = Time(time_utc)
    moon = get_body("moon", t)
    sun  = get_body("sun",  t)
    moon_altaz = moon.transform_to(AltAz(obstime=t, location=loc))
    elongation = sun.separation(moon)
    phase_angle = 180.0 - elongation.deg
    lst = t.sidereal_time("apparent", longitude=loc.lon)
    moon_ha = (lst - moon.ra).deg
    return {
        "moon_phase": phase_angle,
        "moon_alt":   float(moon_altaz.alt.deg),
        "moon_dec":   float(moon.dec.deg),
        "moon_ra":    float(moon.ra.deg),
        "moon_ha":    moon_ha,
        "lat": lat,
    }


# ─── MAIN COLLECTOR ───────────────────────────────────────────────────────────
def build_zenith_ephem(lat, lon, t_utc, moon_data):
    """Ephemeris dict cho Zenith (Alt=90)."""
    ephem = {
        "target_alt":  90.0,
        "target_az":   0.0,
        "ha":          0.0,
        "target_dec":  lat,
        "target_ra":   0.0,
        "lat":         lat,
        **moon_data,
        "moon_sep":    90.0,  # Giả định zenith, moon ở một góc khác
    }
    return ephem


def compute_row(lat: float, lon: float, entry: dict, benchmark_data: dict = None) -> list:
    """Tính toán tất cả thông số cho một giờ và trả về dict row."""
    t_utc   = entry["time"]
    t_local = t_utc + timedelta(hours=LOCAL_UTC_OFFSET)
    
    profile = entry["profile"]
    surface = entry["surface"]

    moon    = get_moon_ephemeris(lat, lon, t_utc)
    ephem_z = build_zenith_ephem(lat, lon, t_utc, moon)

    payload = SingularityOrchestrator.map_and_execute(ephem_z, profile, surface)
    rp = payload["raw_physics"]
    sc = payload["scores"]
    al = payload["alerts"]

    # Benchmark: Chỉ dùng nếu thời gian khớp (gần hiện tại), nếu không để N/A
    b = benchmark_data if benchmark_data else {"seeing_raw": "N/A", "trans_raw": "N/A", "v_model_benchmark": 0.0}

    v_model = float(sc["v_model_10"])
    v_bench = float(b.get("v_model_benchmark", 0.0))
    sqm     = float(rp["sqm"])

    row = [
        t_utc.isoformat(),
        t_local.isoformat(),
        lat, lon,
        # Surface
        round(float(surface["temp"]),        2),
        round(float(surface["rh"]),          2),
        round(float(surface["pressure"]),    2),
        round(float(surface["cloud_cover"]), 2),
        round(float(surface["aqi"]),         2),
        round(float(surface["wind_speed"]),  2),
        round(float(surface["wind_dir"]),    1),
        # Atmos (1000, 850, 700, 500, 300 hPa)
        round(float(profile[0]["temp"]),         2), round(float(profile[0]["wind_speed"]), 3), round(float(profile[0]["wind_dir"]), 1),
        round(float(profile[1]["temp"]),         2), round(float(profile[1]["wind_speed"]), 3), round(float(profile[1]["wind_dir"]), 1),
        round(float(profile[2]["temp"]),         2), round(float(profile[2]["wind_speed"]), 3), round(float(profile[2]["wind_dir"]), 1),
        round(float(profile[3]["temp"]),         2), round(float(profile[3]["wind_speed"]), 3), round(float(profile[3]["wind_dir"]), 1),
        round(float(profile[4]["temp"]),         2), round(float(profile[4]["wind_speed"]), 3), round(float(profile[4]["wind_dir"]), 1),
        # Ephemeris
        round(float(moon["moon_phase"]), 2),
        round(float(moon["moon_alt"]),   2),
        round(float(ephem_z["target_alt"]), 1), # target_alt_deg
        # Physics
        round(float(rp["seeing_arcsec"]),  4),
        round(float(rp["transparency"]),   4),
        round(sqm, 4),
        get_bortle(sqm),
        round(float(rp.get("air_mass", 0)), 4),
        round(float(rp["delta_t"]),        2),
        # Alerts
        int(bool(al["dew_danger"])),
        int(bool(al["air_mass_warning"])),
        # Scores
        round(float(sc["seeing_score_10"]),       3),
        round(float(sc["transparency_score_10"]), 3),
        round(float(sc["lunar_score_10"]),        3),
        round(v_model, 3),
        # Benchmark
        b.get("seeing_raw", "N/A"),
        b.get("trans_raw",  "N/A"),
        round(v_bench, 3),
        # Delta
        round(v_model - v_bench, 3),
    ]
    return row


def run_collector():
    log.info(f"--- Cycle Start: lat={LAT} lon={LON} ---")

    # 1. Đảm bảo file CSV tồn tại
    ensure_csv()

    # 2. Tìm gap
    last_ts = get_last_timestamp_csv()
    now_utc = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

    if last_ts is None:
        # Lần đầu chạy: lấy 72h gần nhất (3 ngày)
        start_ts = now_utc - timedelta(hours=71)
        log.info("First run — backfilling last 72 hours.")
    else:
        start_ts = last_ts + timedelta(hours=1)
        if start_ts > now_utc:
            log.info("CSV is up-to-date. Nothing to do.")
            return
        gap_hours = int((now_utc - last_ts).total_seconds() / 3600)
        log.info(f"Gap detected: {gap_hours} hours ({last_ts.isoformat()} → {now_utc.isoformat()})")

    # 3. Fetch data
    entries = fetch_historical_hours(LAT, LON, start_ts, now_utc)
    log.info(f"Fetched {len(entries)} records from Open-Meteo.")
    
    # 7Timer Benchmark (chỉ lấy 1 lần cho hiện tại)
    bench_list = Type2Fetcher.fetch_benchmark_seeing_12h(LAT, LON)
    current_bench = bench_list[0] if bench_list else None

    if not entries:
        log.warning("No data returned from API.")
        return

    # 4. Compute + append
    rows_to_append = []
    log.info(f"{'Time (UTC)':<17} | {'Temp':<5} | {'Hum':<4} | {'Cloud':<5} | {'Seeing':<6} | {'Trans':<5} | {'SQM':<6} | {'Score':<5}")
    log.info("-" * 95)
    
    for i, entry in enumerate(entries):
        try:
            # Chỉ gán benchmark nếu là giờ hiện tại (entry cuối cùng)
            is_recent = (i == len(entries) - 1)
            row = compute_row(LAT, LON, entry, benchmark_data=current_bench if is_recent else None)
            rows_to_append.append(row)
            
            # Log chi tiết thông số
            # Index: Temp(4), Hum(5), Cloud(7), Seeing(22), Trans(23), SQM(24), Score(32)
            t_str = entry['time'].strftime("%m-%d %H:00")
            log.info(f"{t_str:<17} | {row[4]:>4}°C | {row[5]:>3}% | {row[7]:>4}% | {row[22]:>6.2f}\" | {row[23]:>5.2f} | {row[24]:>6.2f} | {row[32]:>5.1f}")
            
        except Exception as e:
            log.error(f"Error processing {entry['time']}: {e}")

    if rows_to_append:
        append_to_csv(rows_to_append)
        log.info("-" * 95)
        log.info(f"✓ Successfully appended {len(rows_to_append)} rows to {CSV_FILE}.")
    else:
        log.warning("No rows to append.")

    log.info("--- Cycle Done ---")


def main():
    log.info(f"=== Singularity Collector DAEMON START === Interval: {SLEEP_INTERVAL}s")
    while True:
        try:
            run_collector()
            log.info(f"Sleeping for {SLEEP_INTERVAL}s...")
            time.sleep(SLEEP_INTERVAL)
        except Exception as e:
            log.error(f"CRITICAL ERROR: {e}")
            log.info("Retrying in 60s...")
            time.sleep(60)
        except KeyboardInterrupt:
            log.info("Stop requested by user.")
            break


if __name__ == "__main__":
    main()
