"""
Interstellar Data Collector
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
from datetime import datetime, timezone, timedelta

import gspread
from google.oauth2.service_account import Credentials

# ─── Thiết lập import physics engine ─────────────────────────────────────────
# Script chạy từ thư mục gốc của project
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from physics.engine_orchestrator import InterstellarOrchestrator
from ingestion.fetchers import Type2Fetcher

import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord
from astropy.time import Time

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("collector")

# ─── CONFIG ──────────────────────────────────────────────────────────────────
LAT  = float(os.getenv("COLLECT_LAT",  "20.886355"))
LON  = float(os.getenv("COLLECT_LON",  "105.755763"))
SHEET_NAME = os.getenv("SHEET_NAME", "Interstellar_Data")
# Credentials từ GitHub Secret (JSON string)
GSPREAD_CREDS_JSON = os.getenv("GSPREAD_CREDENTIALS", "")

SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

COLUMNS = [
    "timestamp_utc",
    "lat", "lon",
    # Surface
    "surf_temp_c", "surf_rh_pct", "surf_pressure_hpa",
    "surf_cloud_cover_pct", "surf_aqi",
    # Atmospheric layers
    "atmos_1000hpa_temp_c", "atmos_1000hpa_wind_ms",
    "atmos_850hpa_temp_c",  "atmos_850hpa_wind_ms",
    "atmos_700hpa_temp_c",  "atmos_700hpa_wind_ms",
    "atmos_500hpa_temp_c",  "atmos_500hpa_wind_ms",
    "atmos_300hpa_temp_c",  "atmos_300hpa_wind_ms",
    # Ephemeris
    "moon_phase_deg", "moon_alt_deg",
    # Core Physics
    "seeing_arcsec", "transparency", "sqm_mag_arcsec2",
    "air_mass", "delta_t_dew_c",
    # Alerts
    "dew_danger", "air_mass_warning",
    # Heuristic Scores
    "seeing_score_10", "transparency_score_10",
    "lunar_score_10", "v_model_10",
    # 7Timer Benchmark
    "bench_seeing_raw", "bench_trans_raw", "bench_v_model",
    # Delta
    "score_delta",
]


# ─── GOOGLE SHEETS ────────────────────────────────────────────────────────────
def connect_sheet(sheet_name: str):
    if not GSPREAD_CREDS_JSON:
        raise RuntimeError("GSPREAD_CREDENTIALS env var is empty.")
    creds_dict = json.loads(GSPREAD_CREDS_JSON)
    creds = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    gc = gspread.authorize(creds)
    try:
        sh = gc.open(sheet_name)
    except gspread.SpreadsheetNotFound:
        sh = gc.create(sheet_name)
        log.info(f"Created new spreadsheet: {sheet_name}")

    try:
        ws = sh.worksheet("raw_data")
    except gspread.WorksheetNotFound:
        ws = sh.add_worksheet(title="raw_data", rows=50000, cols=len(COLUMNS))
        ws.append_row(COLUMNS)
        log.info("Created worksheet 'raw_data' with header row.")

    return ws


def get_last_timestamp(ws) -> datetime | None:
    """Lấy timestamp cuối cùng đã được ghi vào sheet."""
    all_values = ws.col_values(1)  # Cột timestamp_utc
    # Bỏ qua header
    data_rows = [v for v in all_values[1:] if v.strip()]
    if not data_rows:
        return None
    try:
        return datetime.fromisoformat(data_rows[-1]).replace(tzinfo=timezone.utc)
    except ValueError:
        return None


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
        "hourly": "temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover",
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
            dir_rad   = math.radians(direction)
            profile.append({
                "pressure": p_hpa,
                "temp": da["hourly"][f"temperature_{p_label}"][i] or 0,
                "wind_u": -speed_ms * math.sin(dir_rad),
                "wind_v": -speed_ms * math.cos(dir_rad),
                "wind_speed": speed_ms,
            })

        aqi_val = dq["hourly"]["european_aqi"][i]
        surface = {
            "temp":         ds["hourly"]["temperature_2m"][i] or 0,
            "rh":           ds["hourly"]["relative_humidity_2m"][i] or 0,
            "pressure":     ds["hourly"]["surface_pressure"][i] or 1013,
            "cloud_cover":  ds["hourly"]["cloud_cover"][i] or 0,
            "aqi":          aqi_val if aqi_val is not None else 50,
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


def compute_row(lat: float, lon: float, entry: dict) -> dict:
    """Tính toán tất cả thông số cho một giờ và trả về dict row."""
    t_utc   = entry["time"]
    profile = entry["profile"]
    surface = entry["surface"]

    moon    = get_moon_ephemeris(lat, lon, t_utc)
    ephem_z = build_zenith_ephem(lat, lon, t_utc, moon)

    payload = InterstellarOrchestrator.map_and_execute(ephem_z, profile, surface)
    rp = payload["raw_physics"]
    sc = payload["scores"]
    al = payload["alerts"]

    # 7Timer benchmark (lấy 1 giờ)
    bench = Type2Fetcher.fetch_benchmark_seeing_12h(lat, lon)
    b = bench[0]

    v_model = float(sc["v_model_10"])
    v_bench = float(b["v_model_benchmark"])

    layers = {f"atmos_{p}hpa": lyr for p, lyr in zip(
        [1000, 850, 700, 500, 300], profile)}

    row = [
        t_utc.isoformat(),
        lat, lon,
        # Surface
        round(float(surface["temp"]),        2),
        round(float(surface["rh"]),          2),
        round(float(surface["pressure"]),    2),
        round(float(surface["cloud_cover"]), 2),
        round(float(surface["aqi"]),         2),
        # Atmos
        round(float(profile[0]["temp"]),         2), round(float(profile[0]["wind_speed"]), 3),
        round(float(profile[1]["temp"]),         2), round(float(profile[1]["wind_speed"]), 3),
        round(float(profile[2]["temp"]),         2), round(float(profile[2]["wind_speed"]), 3),
        round(float(profile[3]["temp"]),         2), round(float(profile[3]["wind_speed"]), 3),
        round(float(profile[4]["temp"]),         2), round(float(profile[4]["wind_speed"]), 3),
        # Ephemeris
        round(float(moon["moon_phase"]), 2),
        round(float(moon["moon_alt"]),   2),
        # Physics
        round(float(rp["seeing_arcsec"]),  4),
        round(float(rp["transparency"]),   4),
        round(float(rp["sqm"]),            4),
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


def main():
    log.info(f"=== Interstellar Collector START === lat={LAT} lon={LON}")

    # 1. Kết nối sheet
    ws = connect_sheet(SHEET_NAME)

    # 2. Tìm gap
    last_ts = get_last_timestamp(ws)
    now_utc = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

    if last_ts is None:
        # Lần đầu chạy: lấy 24h gần nhất
        start_ts = now_utc - timedelta(hours=23)
        log.info("First run — backfilling last 24h.")
    else:
        start_ts = last_ts + timedelta(hours=1)
        if start_ts > now_utc:
            log.info("Sheet is up-to-date. Nothing to do.")
            return
        gap_hours = int((now_utc - last_ts).total_seconds() / 3600)
        log.info(f"Gap detected: {gap_hours} hours ({last_ts.isoformat()} → {now_utc.isoformat()})")

    # 3. Fetch historical data for the gap
    entries = fetch_historical_hours(LAT, LON, start_ts, now_utc)
    log.info(f"Fetched {len(entries)} hourly records from Open-Meteo.")

    if not entries:
        log.warning("No data returned from API.")
        return

    # 4. Compute + append
    rows_to_append = []
    for i, entry in enumerate(entries):
        try:
            row = compute_row(LAT, LON, entry)
            rows_to_append.append(row)
            log.info(f"[{i+1}/{len(entries)}] {entry['time'].isoformat()} — V-Model: {row[-4]}")
        except Exception as e:
            log.error(f"Error processing {entry['time']}: {e}")

    if rows_to_append:
        ws.append_rows(rows_to_append, value_input_option="USER_ENTERED")
        log.info(f"✓ Appended {len(rows_to_append)} rows to Google Sheets.")
    else:
        log.warning("No rows to append.")

    log.info("=== Collector DONE ===")


if __name__ == "__main__":
    main()
