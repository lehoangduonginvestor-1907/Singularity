import numpy as np

# Hang so vat ly -- KHONG duoc thay doi, co nguon goc ro rang
LAMBDA_DEFAULT_UM = 0.55    # Buoc song mac dinh (micromet) -- giua dai nhin thay
P0_HPA = 1013.25            # Ap suat chuan muc nuoc bien (hPa) -- ICAO
K_OZONE = 0.016             # He so tat ozone -- hang so, bo qua Phase 1
                            # Source: Leckner (1978), Solar Energy 20:143

# He so Rayleigh -- Source: Angstrom (1929)
RAYLEIGH_A = 0.00864        # Empirical fit
RAYLEIGH_B = 4.09           # Empirical fit -- mu ong tru khi thay doi buoc song



def k_rayleigh(lambda_um: float, pressure_hpa: float) -> float:
    """
    Tinh he so tat Rayleigh (tan xa phan tu khi).

    Args:
        lambda_um: Buoc song anh sang (micromet), default 0.55
        pressure_hpa: Ap suat thuc te tu BME280 (hPa)

    Returns:
        k_ray: He so tat Rayleigh (khong co don vi)

    Physics:
        k_ray = (0.00864 / lambda^4.09) * (P / P0)

        Ly do co P/P0: mat do phan tu khi ty le voi ap suat.
        Da Lat (P thap hon) co k_ray nho hon Ha Noi.

    Source: Angstrom (1929), Shettle & Fenn (1979)
    """
    # Tinh (RAYLEIGH_A / lambda_um ^ RAYLEIGH_B)
    # Nhan voi pressure correction (pressure_hpa / P0_HPA)

    k_ray = (RAYLEIGH_A / lambda_um ** RAYLEIGH_B) * (pressure_hpa / P0_HPA)
    return k_ray


def hygroscopic_growth(rh_percent: float, gamma: float = 0.5) -> float:
    """
    Tinh hygroscopic growth factor f(RH) cho bui aerosol.

    Args:
        rh_percent: Do am tuong doi (%), range [0, 99]
        gamma: He so empirical, default 0.5
               Source: Shettle & Fenn (1979), Table 3
               Can fine-tune bang TSL2591 data

    Returns:
        f_rh: Growth factor (khong co don vi), range [1.0, +inf)

    Physics:
        f(RH) = (1 / (1 - RH/100))^gamma

        Ha Noi mua nom RH > 90%:
        f(RH) > 2.7 --> k_Mie tang gap doi du AQI khong doi

    Source: Shettle & Fenn (1979), Applied Optics 18(3):330
    """
    # Validate rh_percent phai trong [0, 100)
    # Neu rh_percent >= 100: clip to 99.0
    # (tranh chia cho 0 trong cong thuc)

    rh_percent = float(np.clip(rh_percent, 0.0, 99.0))

    # Tinh f_rh = (1 / (1 - rh_percent/100)) ^ gamma

    f_rh = (1.0 / (1.0 - rh_percent / 100.0)) ** gamma
    return f_rh


def k_mie(aqi: float, rh_percent: float,
          beta: float = 0.02, alpha: float = 0.8,
          gamma: float = 0.5) -> float:
    """
    Tinh he so tat Mie (bui, aerosol).

    Args:
        aqi: Chi so bui tu API (OpenAQ)
        rh_percent: Do am tuong doi (%) tu BME280
        beta: He so empirical, can fine-tune bang TSL2591
              Gia tri khoi diem: 0.02
        alpha: He so empirical (mu ong tru AQI)
               Gia tri khoi diem: 0.8
        gamma: He so hygroscopic growth
               Source: Shettle & Fenn (1979)

    Returns:
        k_mie: He so tat Mie (khong co don vi)

    Physics:
        k_Mie = beta * AQI^alpha * f(RH)

        beta, alpha: fine-tune bang TSL2591 sau khi co data
        Khong duoc tu dat so nay -- phai learned tu data (Rule 5)

    Source: Angstrom (1929) + Shettle & Fenn (1979)
    """
    # Validate aqi >= 0
    if aqi < 0 :
        raise ValueError(f"Invalid parameters : aqi = {aqi}. Must be >= 0")


    # Goi hygroscopic_growth(rh_percent, gamma) de lay f_rh
    f_rh = hygroscopic_growth(rh_percent, gamma)


    # Tinh k_mie = beta * aqi ^ alpha * f_rh

    k_Mie = beta * (aqi ** alpha) * f_rh 
    return k_Mie


def k_extinction(lambda_um: float, pressure_hpa: float,
                 aqi: float, rh_percent: float) -> float:
    """
    Tinh tong he so tat k_ext.

    Args:
        lambda_um: Buoc song (micromet)
        pressure_hpa: Ap suat tu BME280 (hPa)
        aqi: Chi so bui tu API
        rh_percent: Do am tu BME280 (%)

    Returns:
        k_ext: Tong he so tat (khong co don vi)

    Physics:
        k_ext = k_Rayleigh + k_Mie + k_Ozone

        k_Ozone = 0.016 (hang so, bo qua Phase 1)
        Source: Leckner (1978)

    Source: Beer-Lambert Law
    """
    # Goi k_rayleigh(lambda_um, pressure_hpa)
    # Goi k_mie(aqi, rh_percent)

    # k_ext = k_ray + k_mie + K_OZONE
    k_ext = k_rayleigh(lambda_um, pressure_hpa) + k_mie(aqi, rh_percent) + K_OZONE
    return k_ext


def transparency(k_ext: float, x_abs: float) -> float:
    """
    Tinh ty le photon song sot qua khi quyen (Beer-Lambert).

    Args:
        k_ext: He so tat tong hop tu k_extinction()
        x_abs: Air Mass tuyet doi tu Branch 0

    Returns:
        T: Transparency, range (0, 1]
           T = 1.0: khong mat photon (ly tuong)
           T = 0.5: mat 50% photon

    Physics:
        I = I0 * exp(-k_ext * X)
        T = I / I0 = exp(-k_ext * X)

    Source: Beer-Lambert Law (First Principles)
    """
    # Tinh T = np.exp(-k_ext * x_abs)
    T = np.exp(-k_ext * x_abs)
    return T

def pwv(rh_percent: float, temp_c: float) -> float:
    """
    Tinh Precipitable Water Vapor (PWV).

    Args:
        rh_percent: Do am tuong doi (%) tu BME280
        temp_c: Nhiet do khong khi (°C) tu BME280

    Returns:
        pwv_cm: Luong hoi nuoc co the ket tu (cm)

    Physics:
        PWV ≈ 0.493 * (RH/100) * es(T) / T

        es(T): ap suat hoi nuoc bao hoa -- dung Magnus-Tetens
               (tai su dung logic tu Branch 3)
        T: nhiet do tuyet doi (K)

    Source: Smith (1966), simplified form
    Note: PWV feed vao Branch 3 (Magnus-Tetens)
    """
    # Tinh ap suat hoi nuoc bao hoa es(T)
    # Dung Magnus-Tetens: es = 6.112 * exp(17.625*T / (243.04 + T))
    # voi T tinh bang Celsius
    # Source: Magnus-Tetens -- cung source voi Branch 3

    es = 6.112 * np.exp(17.625 * temp_c / (243.04 + temp_c))
    # Tinh pwv_cm = 0.493 * (rh_percent/100) * es / T_k

    pwv_cm = 0.493 * (rh_percent / 100.0) * es / (temp_c + 273.15)
    return pwv_cm


# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================


def _run_tests():
    print("=== Branch 2 Validation ===\n")

    # Test k_rayleigh -- dieu kien ly tuong
    print("k_rayleigh() tests:")
    k_ray = k_rayleigh(0.55, 1013.25)
    expected = 0.0996
    status = "PASS" if abs(k_ray - expected) <= 0.005 else "FAIL"
    print(f"  [{status}] lambda=0.55um P=1013.25hPa -> k_ray={k_ray:.4f} (expected ~{expected})")

    print()

    # Test hygroscopic_growth
    print("hygroscopic_growth() tests:")
    cases_rh = [
        (50.0, 0.5, 1.414),   # RH 50%
        (90.0, 0.5, 3.162),   # RH 90% -- Ha Noi mua nom
        (0.0,  0.5, 1.000),   # RH 0% -- kho han tuyet doi
    ]
    for rh, gamma, expected in cases_rh:
        result = hygroscopic_growth(rh, gamma)
        status = "PASS" if abs(result - expected) <= 0.01 else "FAIL"
        print(f"  [{status}] RH={rh}% -> f(RH)={result:.3f} (expected {expected})")

    print()

    # Test transparency -- validation cases tu Branch_2_Scattering.md
    print("transparency() tests:")
    cases_t = [
        # (k_ext, x_abs, T_expected, tolerance)
        (0.113, 1.0, 0.893, 0.01),   # Ly tuong, X=1
        (0.113, 5.6, 0.530, 0.02),   # X=5.6 (alt=10 do)
    ]
    for k, x, expected, tol in cases_t:
        result = transparency(k, x)
        status = "PASS" if abs(result - expected) <= tol else "FAIL"
        print(f"  [{status}] k={k} X={x} -> T={result:.3f} (expected {expected})")

    print()

    # Test blue sky / sunset logic
    print("Rayleigh wavelength test (blue sky logic):")
    k_blue = k_rayleigh(0.45, 1013.25)   # Xanh lam 450nm
    k_red  = k_rayleigh(0.70, 1013.25)   # Do 700nm
    status = "PASS" if k_blue > k_red else "FAIL"
    print(f"  [{status}] k_blue={k_blue:.4f} > k_red={k_red:.4f} (xanh tan xa manh hon do)")


if __name__ == "__main__":
    _run_tests()
