import numpy as np

# Hang so Magnus-Tetens -- Source: Lawrence (2005), BAMS
# Derived tu Clausius-Clapeyron, curve-fit thuc nghiem
# Valid trong khoang 0-60 C, sai so < 0.5 C
MAGNUS_A = 17.625
MAGNUS_B = 243.04   # don vi: do C

# Nguong canh bao delta_T -- Source: kinh nghiem thuc dia + radiative cooling
# Xem Branch_3_Thermodynamics.md phan "Nguong Canh Bao"
THRESHOLD_SAFE    = 3.0   # C -- an toan
THRESHOLD_WARNING = 1.0   # C -- canh bao bat suoi
THRESHOLD_DANGER  = 0.0   # C -- qua muon, suong da dong


def dew_point(temp_c: float, rh_percent: float) -> float:
    """
    Tinh diem suong T_dew bang Magnus-Tetens.

    Args:
        temp_c: Nhiet do khong khi (C) tu BME280
        rh_percent: Do am tuong doi (%) tu BME280

    Returns:
        t_dew: Nhiet do diem suong (C)

    Physics:
        gamma(T, RH) = (a * T) / (b + T) + ln(RH/100)
        T_dew = (b * gamma) / (a - gamma)

        a = 17.625
        b = 243.04 C

    Source: Lawrence (2005), BAMS 86(2):225
    """
    # TODO: Validate rh_percent trong (0, 100]
    # Neu rh_percent <= 0: raise ValueError
    # Neu rh_percent > 100: raise ValueError

    if rh_percent <= 0 or rh_percent > 100:
        raise ValueError(f"Invalid parameters : rh_percent = {rh_percent}. Must be in [0, 100)")


    # TODO: Tinh gamma = (MAGNUS_A * temp_c) / (MAGNUS_B + temp_c) + np.log(rh_percent / 100.0)
    # Chu y: np.log() la logarit tu nhien (ln), khong phai log10
    gamma = (MAGNUS_A * temp_c) / (MAGNUS_B + temp_c) + np.log(rh_percent / 100.0)

    # TODO: Tinh t_dew = (MAGNUS_B * gamma) / (MAGNUS_A - gamma)
    t_dew = (MAGNUS_B * gamma) / (MAGNUS_A - gamma)
    return t_dew


def delta_t(t_lens_c: float, t_dew_c: float) -> float:
    """
    Tinh bien do an toan nhiet do giua kinh va diem suong.

    Args:
        t_lens_c: Nhiet do mat kinh (C) tu MLX90614
        t_dew_c: Nhiet do diem suong (C) tu dew_point()

    Returns:
        dt: Delta T (C) = T_lens - T_dew
            dt > 0: an toan (kinh am hon diem suong)
            dt <= 0: suong da dong hoac sap dong

    Physics:
        delta_T = T_lens - T_dew

        Dem quang may: kinh buc xa nhiet ra vu tru
        --> T_lens giam nhanh hon T_ambient 2-5 C
        --> Nghich ly: dem dep nhat lai de bi suong nhat

    Source: Radiative cooling theory
    """
    # Tinh dt = t_lens_c - t_dew_c
    return t_lens_c - t_dew_c

def dew_warning(dt: float) -> int:
    """
    Tra ve trang thai an toan dua tren delta_T.

    Args:
        dt: Delta T (C) tu delta_t()

    Returns:
        status: Mot trong 4 gia tri:
                "SAFE"    -- dt > 3.0 C -> tra ve 0
                "WARNING" -- 1.0 < dt <= 3.0 C -> tra ve 1
                "DANGER"  -- 0.0 < dt <= 1.0 C -> tra ve 2
                "DEW"     -- dt <= 0.0 C -> tra ve 3

    Physics basis:
        Nguong 3.0 C: margin du de T_lens khong xuong
                      duoi T_dew trong 30 phut tiep theo
        Nguong 1.0 C: bat suoi ngay lap tuc
        Nguong 0.0 C: suong co the da dong tren kinh
    """

    if dt > THRESHOLD_SAFE:
        return 0
    if dt > THRESHOLD_WARNING:
        return 1
    if dt > THRESHOLD_DANGER:
        return 2
    return 3

def radiative_cooling_estimate(cloud_cover_percent: float) -> float:
    """
    Uoc tinh do chenh lech nhiet do buc xa (delta_T_rad).

    Args:
        cloud_cover_percent: Do phu may (%) tu Open-Meteo
                             range [0, 100]

    Returns:
        dt_rad: Uoc tinh chenh lech nhiet do buc xa (C)
                range [0.5, 5.0]

    Physics:
        Dem quang may (cloud = 0%):
            Kinh nhin thang len vu tru (T ~ 3K)
            --> buc xa manh --> dt_rad ~ 4-5 C
        Dem nhieu may (cloud = 100%):
            May dong vai "chan nhiet"
            --> buc xa yeu --> dt_rad ~ 0.5-1 C

        Cong thuc noi suy tuyen tinh -- simplified model
        Fine-tune bang MLX90614 sau khi co data thuc

    Note:
        Day la ESTIMATE, khong phai do thuc.
        Khi co MLX90614: dung T_lens do truc tiep thay the.
        Ham nay chi dung khi MLX90614 chua san sang.
    """
    # TODO: Validate cloud_cover_percent trong [0, 100]
    if cloud_cover_percent < 0 or cloud_cover_percent > 100:
        raise ValueError(f"Invalid parameters : cloud_cover_percent = {cloud_cover_percent}. Must be in [0, 100]")

    # TODO: Noi suy tuyen tinh:
    # cloud = 0%   --> dt_rad = 5.0 C (quang may hoan toan)
    # cloud = 100% --> dt_rad = 0.5 C (may phu kin)
    # Goi y: dt_rad = 5.0 - (5.0 - 0.5) * (cloud_cover_percent / 100.0)
    dt_rad = 5.0 - (5.0 - 0.5) * (cloud_cover_percent / 100.0)
    return dt_rad

def t_lens_estimate(t_ambient: float, cloud_cover_percent: float) -> float:
    #tinh t_lens gan dung (heuristic)
    return t_ambient - radiative_cooling_estimate(cloud_cover_percent)


# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================

def _run_tests():
    print("=== Branch 3 Validation ===\n")

    # Test dew_point -- validation cases tu Branch_3_Thermodynamics.md
    print("dew_point() tests:")
    cases = [
        # (temp_c, rh_percent, t_dew_expected, tolerance)
        (25.0, 80.0, 21.4, 0.2),
        (20.0, 60.0, 12.0, 0.2),
        (30.0, 90.0, 28.2, 0.2),
    ]
    for temp, rh, expected, tol in cases:
        result = dew_point(temp, rh)
        status = "PASS" if abs(result - expected) <= tol else "FAIL"
        print(f"  [{status}] T={temp}C RH={rh}% -> T_dew={result:.1f}C (expected {expected}C)")

    print()

    # Test delta_t
    print("delta_t() tests:")
    dt_safe   = delta_t(25.0, 21.4)   # dt = 3.6 C --> SAFE
    dt_danger = delta_t(22.0, 21.4)   # dt = 0.6 C --> DANGER
    dt_dew    = delta_t(21.0, 21.4)   # dt = -0.4 C --> DEW
    print(f"  [{'PASS' if dt_safe   >  3.0 else 'FAIL'}] T_lens=25.0 T_dew=21.4 -> dt={dt_safe:.1f}C (expected > 3.0)")
    print(f"  [{'PASS' if dt_danger <  1.0 else 'FAIL'}] T_lens=22.0 T_dew=21.4 -> dt={dt_danger:.1f}C (expected < 1.0)")
    print(f"  [{'PASS' if dt_dew    <= 0.0 else 'FAIL'}] T_lens=21.0 T_dew=21.4 -> dt={dt_dew:.1f}C (expected <= 0.0)")

    print()

    # Test dew_warning
    print("dew_warning() tests:")
    cases_w = [
        (5.0,  0),
        (2.0,  1),
        (0.5,  2),
        (-1.0, 3),
    ]
    for dt_val, expected_status in cases_w:
        result = dew_warning(dt_val)
        status = "PASS" if result == expected_status else "FAIL"
        print(f"  [{status}] dt={dt_val}C -> {result} (expected {expected_status})")

    print()

    # Test radiative_cooling_estimate
    print("radiative_cooling_estimate() tests:")
    dt_clear  = radiative_cooling_estimate(0.0)
    dt_cloudy = radiative_cooling_estimate(100.0)
    status = "PASS" if dt_clear > dt_cloudy else "FAIL"
    print(f"  [{status}] Quang may (0%): dt_rad={dt_clear:.1f}C > Nhieu may (100%): dt_rad={dt_cloudy:.1f}C")


if __name__ == "__main__":
    _run_tests()




