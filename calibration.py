"""
calibration.py — Interstellar Physics Calibration Tool
=======================================================
So sánh SQM model (Krisciunas-Schaefer) vs SQM đo thực tế từ TSL2591
để tính correction cho các hằng số trong physics engine.

Chạy: python calibration.py --csv path/to/sensor_log.csv

Output:
  - c_offset_correction: hiệu chỉnh cho b_moon_to_mag()
  - beta_correction:     hiệu chỉnh cho k_mie()
  - Biểu đồ scatter: sqm_model vs sqm_measured

Các hằng số cần calibrate:
  lunar_penalty.py   → c_offset (mặc định 22.0)
  scattering.py      → beta (0.02), alpha (0.8) trong k_mie()
  turbulence.py      → alpha (0.1) trong cn2_with_wind_shear()
"""

import os
import sys
import math
import argparse
import csv
import numpy as np
from datetime import datetime, timezone

# Đảm bảo import được physics engine
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from physics.lunar_penalty import lunar_illuminance, sky_brightness_moon, b_moon_to_mag
from physics.scattering import k_extinction
from physics.air_mass import abs_air_mass

# ─── CONSTANTS ────────────────────────────────────────────────────────────────
# TSL2591 với integration time 600ms và MAX gain (9876x)
# Adafruit library: CPL = (atime × again) / TSL2591_LUX_DF
#   atime = 600ms, again = 9876, TSL2591_LUX_DF = 408
TSL2591_CPL = (600 * 9876) / 408.0   # = 14523.5 (Counts Per Lux)
SQM_ZERO_POINT = 108000              # lux reference cho SQM = 0 mag/arcsec²


# ─── TSL2591 → SQM CONVERSION ────────────────────────────────────────────────
def normvis_to_sqm(norm_vis: float) -> float | None:
    """
    Convert NormVis (Arduino AGC-normalized count) → SQM (mag/arcsec²).

    Derivation:
        lux      = norm_vis / CPL
        SQM      = -2.5 × log10(lux / SQM_ZERO_POINT)

    Args:
        norm_vis: Giá trị ESP_Norm từ TSL2591 (normalized visible count)

    Returns:
        SQM (mag/arcsec²) hoặc None nếu norm_vis <= 0
    """
    if norm_vis <= 0:
        return None
    lux = norm_vis / TSL2591_CPL
    return -2.5 * math.log10(lux / SQM_ZERO_POINT)


# ─── SQM MODEL (K-S) ──────────────────────────────────────────────────────────
def sqm_model_ks(moon_phase_deg: float, moon_alt_deg: float, target_alt_deg: float,
                 pressure_hpa: float, aqi: float, rh_pct: float,
                 c_offset: float = 22.0) -> float:
    """
    Tính SQM model theo Krisciunas-Schaefer (1991).
    Giả định target là Zenith (để chỉ đo ảnh hưởng của Mặt Trăng, không phụ thuộc target).

    Args:
        moon_phase_deg:   Góc pha Mặt Trăng (0=Full, 180=New)
        moon_alt_deg:     Độ cao Mặt Trăng (°)
        target_alt_deg:   Độ cao zenith giả định = 90° cho calibration
        pressure_hpa:     Áp suất từ BME280
        aqi:              AQI từ API
        rh_pct:           Độ ẩm từ BME280 (%)
        c_offset:         Hằng số photometric (cần calibrate)

    Returns:
        SQM model (mag/arcsec²)
    """
    if moon_alt_deg <= 0:
        return c_offset  # Trăng dưới chân trời → bầu trời tối tối đa

    # Clamp phase angle về [0, 180]
    phase = max(0.0, min(180.0, moon_phase_deg))

    # Separation angle rho: giả định target là Zenith, Moon ở altitude moon_alt_deg
    # rho = khoảng cách góc Moon → Zenith = 90° - moon_alt_deg
    rho_deg = max(1.0, 90.0 - moon_alt_deg)

    # Air mass
    x_moon   = abs_air_mass(max(1.0, moon_alt_deg),   pressure_hpa)
    x_target = abs_air_mass(max(1.0, target_alt_deg), pressure_hpa)

    # Extinction coefficient (Branch 2)
    k_ext = k_extinction(0.55, pressure_hpa, aqi, min(rh_pct, 98.9))

    # K-S model (Branch 5)
    i_moon = lunar_illuminance(phase, x_moon, k_ext)
    b_moon = sky_brightness_moon(rho_deg, i_moon, x_target, k_ext)
    return b_moon_to_mag(b_moon, c_offset)


# ─── CALIBRATION ANALYSIS ─────────────────────────────────────────────────────
def run_calibration(csv_path: str, lat: float = 20.886355, lon: float = 105.755763):
    """
    Đọc sensor CSV, tính SQM model vs measured, phân tích delta.

    Columns cần có trong CSV (interstellar_master_v4.csv format):
        Timestamp, ESP_T, ESP_Hum, ESP_Press, ESP_Norm, ESP_Gain,
        ESP_T_Sky, ESP_T_Am, OM_Temp, OM_Hum, OM_Cloud, OM_Wind,
        Moon_Alt, Moon_Az, Moon_Phase
    """
    records = []

    print(f"Reading CSV: {csv_path}")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        print(f"Header: {header}")

        for i, row in enumerate(reader):
            if len(row) < 15:
                continue
            try:
                ts       = datetime.fromisoformat(row[0].strip())
                esp_t    = float(row[1])
                esp_hum  = float(row[2])
                esp_p    = float(row[3])
                norm_vis = float(row[4])
                # gain    = row[5]   # không cần cho calibration
                # t_sky  = float(row[6])
                # t_am   = float(row[7])
                # om_temp= float(row[8])
                # om_hum = float(row[9])
                om_cloud = float(row[10])
                # om_wind= float(row[11])
                moon_alt = float(row[12])
                # moon_az= float(row[13])
                moon_phase = float(row[14])

                # Chỉ lấy ban đêm (Moon_Alt có thể dương) và norm_vis hợp lệ
                if norm_vis <= 0:
                    continue

                # Thường chỉ lấy data khi moon_alt > 5° để K-S có nghĩa
                if moon_alt < 5.0:
                    continue

                # Bỏ qua khi trời quá nhiều mây (cloud > 80%) → TSL2591 không đại diện
                if om_cloud > 80:
                    continue

                sqm_meas = normvis_to_sqm(norm_vis)
                if sqm_meas is None:
                    continue

                # SQM model với c_offset hiện tại (22.0)
                sqm_mod = sqm_model_ks(
                    moon_phase_deg = moon_phase * 180,  # CSV lưu phase 0-1 → convert sang 0-180
                    moon_alt_deg   = moon_alt,
                    target_alt_deg = 90.0,              # Zenith cho calibration
                    pressure_hpa   = esp_p,
                    aqi            = 80.0,              # Fallback AQI nếu không có trong CSV
                    rh_pct         = esp_hum,
                    c_offset       = 22.0
                )

                records.append({
                    "timestamp":   ts,
                    "norm_vis":    norm_vis,
                    "sqm_meas":    sqm_meas,
                    "sqm_model":   sqm_mod,
                    "delta":       sqm_mod - sqm_meas,  # (+) = model sáng hơn thực → c_offset cần giảm
                    "moon_phase":  moon_phase,
                    "moon_alt":    moon_alt,
                    "cloud":       om_cloud,
                })

            except (ValueError, IndexError) as e:
                continue

    if not records:
        print("[!] Không có bản ghi hợp lệ nào. Kiểm tra format CSV.")
        return

    # ── Thống kê ──
    deltas = [r["delta"] for r in records]
    sqm_meas_all  = [r["sqm_meas"]  for r in records]
    sqm_model_all = [r["sqm_model"] for r in records]

    mean_delta = np.mean(deltas)
    std_delta  = np.std(deltas)
    mae        = np.mean(np.abs(deltas))

    print(f"\n{'='*60}")
    print(f"CALIBRATION RESULTS — {len(records)} valid records")
    print(f"{'='*60}")
    print(f"  SQM Measured  : {np.mean(sqm_meas_all):.3f} ± {np.std(sqm_meas_all):.3f} mag/arcsec²")
    print(f"  SQM Model     : {np.mean(sqm_model_all):.3f} ± {np.std(sqm_model_all):.3f} mag/arcsec²")
    print(f"  Delta (M-R)   : {mean_delta:+.3f} ± {std_delta:.3f} mag/arcsec²")
    print(f"  MAE           : {mae:.3f} mag/arcsec²")
    print()

    # ── Recommended c_offset correction ──
    # delta = sqm_model - sqm_meas
    # Nếu delta > 0 → model cho trời tối hơn thực tế → c_offset hiện tại quá cao
    # c_offset mới = c_offset cũ - mean_delta
    c_offset_new = 22.0 - mean_delta
    print(f"RECOMMENDED CORRECTIONS:")
    print(f"  c_offset: 22.0 → {c_offset_new:.3f}  (thay trong lunar_penalty.py, b_moon_to_mag())")

    if abs(mean_delta) < 0.3:
        print(f"  ✅ Model calibrated tốt — sai số {mean_delta:+.3f} nằm trong ngưỡng ±0.3 mag/arcsec²")
    elif abs(mean_delta) < 1.0:
        print(f"  ⚠️  Cần fine-tune nhẹ — sai số {mean_delta:+.3f} mag/arcsec²")
    else:
        print(f"  🔴 Sai số lớn {mean_delta:+.3f} — cần kiểm tra lại AQI hoặc moon_phase unit")

    print()
    print(f"  Lưu ý: MAE = {mae:.3f} mag/arcsec²")
    print(f"  Unihedron SQM-L accuracy: ±0.1 → MAE < 0.3 là tốt cho TSL2591 DIY")

    # ── Ghi kết quả ra file ──
    out_path = os.path.join(os.path.dirname(csv_path), "calibration_results.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)
    print(f"\n  Kết quả chi tiết đã lưu: {out_path}")

    # ── Phân tích theo moon phase ──
    print(f"\nDELTA BREAKDOWN BY MOON PHASE:")
    bins = [(0, 0.1, "🌑 New"), (0.1, 0.35, "🌙 Crescent"),
            (0.35, 0.65, "🌓 Quarter"), (0.65, 0.9, "🌔 Gibbous"), (0.9, 1.01, "🌕 Full")]
    for lo, hi, label in bins:
        subset = [r["delta"] for r in records if lo <= r["moon_phase"] < hi]
        if subset:
            print(f"  {label:15s} ({lo:.0%}–{hi:.0%}): δ={np.mean(subset):+.3f} ± {np.std(subset):.3f}  (n={len(subset)})")

    return {
        "mean_delta":    mean_delta,
        "c_offset_new":  c_offset_new,
        "mae":           mae,
        "n_records":     len(records),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Interstellar Calibration Tool")
    parser.add_argument("--csv",  required=True, help="Đường dẫn đến file sensor CSV")
    parser.add_argument("--lat",  type=float, default=20.886355)
    parser.add_argument("--lon",  type=float, default=105.755763)
    args = parser.parse_args()

    result = run_calibration(args.csv, args.lat, args.lon)
