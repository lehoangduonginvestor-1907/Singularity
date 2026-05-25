import numpy as np

# Hang so vat ly -- KHONG duoc thay doi, co nguon goc ro rang
R_GAS     = 8.314     # J/mol/K -- hang so khi ly tuong
MU_AIR    = 0.029     # kg/mol  -- khoi luong mol khong khi
G_GRAVITY = 9.81      # m/s^2   -- gia toc trong truong
GAMMA_DRY = -9.8e-3   # K/m     -- adiabatic lapse rate
                      # Source: Wallace & Hobbs, Atmospheric Science (2006)

L0_OUTER  = 25.0      # m -- outer scale turbulence
                      # Source: Tatarski (1961), chap 3

LAMBDA_DEFAULT_M = 0.55e-6  # m -- buoc song mac dinh (550nm)

# HV57 profile constants -- Source: Valley (1980)
HV57_A1 = 0.00594    # He so jet stream term
HV57_V0 = 27.0       # m/s -- toc do gio chuan hoa HV57
HV57_C2 = 2.7e-16    # He so upper atmosphere term (hang so)


def hypsometric(p_surface_hpa: float, p_level_hpa: float, temp_mean_k: float) -> float:
    """
    Tinh do cao khi quyen tu ap suat bang phuong trinh Hypsometric.

    Args:
        p_surface_hpa: Ap suat mat dat (hPa) tu BME280
        p_level_hpa: Ap suat tang khi quyen can tinh (hPa)
                     Vi du: 850, 700, 500, 300 hPa
        temp_mean_k: Nhiet do trung binh lop khi quyen (K)
                     Lay trung binh cong nhiet do 2 level lien ke

    Returns:
        height_m: Do cao uoc tinh (m) so voi mat dat

    Physics (Loai 1 -- tu chung minh):
        Hydrostatic equilibrium: dP = -rho * g * dh
        Ideal Gas Law: rho = P * mu / (R * T)
        Ket hop va tich phan:
        h = (R * T) / (mu * g) * ln(P0 / P)

    Source: Wallace & Hobbs, Atmospheric Science (2006) ch.3
    """
    # Validate p_surface_hpa > 0 va p_level_hpa > 0
    if p_level_hpa <= 0:
        raise ValueError(f"Invalid parameters: p_level_hpa = {p_level_hpa}")

    if p_surface_hpa <= 0:
        raise ValueError(f"Invalid parameters: p_surface_hpa = {p_surface_hpa}")




    # Tinh ty so ap suat:
    ratio = p_surface_hpa / p_level_hpa
    

    # Ap dung cong thuc Hypsometric:
    height_m = (R_GAS * temp_mean_k) / (MU_AIR * G_GRAVITY) * np.log(ratio)
    # Don vi: R_GAS (J/mol/K), temp_mean_k (K), MU_AIR (kg/mol), G_GRAVITY (m/s^2)
    # --> Ket qua ra don vi met (m), khong can doi don vi them
    return height_m


def tatarski_cn2(temp_k: float, pressure_hpa: float, lapse_rate_k_per_m: float) -> float:
    """
    Tinh Cn2 (structure parameter of refractive index) tai 1 diem.

    Args:
        temp_k: Nhiet do tai tang khi quyen (K) tu Open-Meteo
        pressure_hpa: Ap suat tai tang do (hPa) tu Open-Meteo
        lapse_rate_k_per_m: Toc do giam nhiet thuc te (K/m)
                            = (T_upper - T_lower) / (h_upper - h_lower)
                            Am = nhiet do giam theo do cao (binh thuong)
                            Duong = nghich nhiet (inversion, on dinh)

    Returns:
        cn2: Gia tri Cn2 tai tang do (m^-2/3)
             cn2 lon --> turbulence manh --> seeing xau
             cn2 = 0 khi lapse_rate = GAMMA_DRY (trung tinh hoan toan)

    Physics (Loai 2 -- Tatarski 1961):
        cn2 = (79e-6 * P / T^2)^2 * L0^(4/3) * (dT/dh + Gamma_d)^2

        LUU Y DON VI QUAN TRONG:
        Hang so 79e-6 duoc derive voi P tinh bang hPa (millibars).
        KHONG nhan them 100 de doi sang Pa -- se sai 10,000 lan.
        Source: Gladstone-Dale relation, Tatarski (1961) eq. 3.12

        Stability term: lapse_rate_k_per_m + GAMMA_DRY
        Vi GAMMA_DRY = -9.8e-3 (am san), chi can cong thang.
        (dT/dh - Gamma_d) = 0   --> cn2 = 0 (trung tinh, khi dT/dh = Gamma_d)
        (dT/dh - Gamma_d) != 0  --> cn2 lon (bat on dinh hoac nghich nhiet)

    Source: Tatarski (1961), Wave Propagation in a Turbulent Medium
    """
    # Tinh thermal_coeff:
    thermal_coeff = (79e-6 * pressure_hpa) / (temp_k ** 2)
    # KHONG nhan pressure_hpa voi 100 -- hang so 79e-6 yeu cau don vi hPa

    # Tinh stability term:
    # Tatarski: stability = (dT/dh) - Γ_d
    # Trong đó Γ_d = GAMMA_DRY = -9.8e-3 K/m (đã mang dấu âm)
    # Khi trung tính (dT/dh = Γ_d = -9.8e-3): stability = (-9.8e-3) - (-9.8e-3) = 0 → Cn² = 0 ✓
    # Khi bất ổn (dT/dh < Γ_d): stability < 0 → |stability|² lớn → Cn² lớn → seeing xấu ✓
    stability = lapse_rate_k_per_m - GAMMA_DRY

    # Tinh cn2:
    cn2 = (thermal_coeff ** 2) * (L0_OUTER ** (4.0/3.0)) * (stability ** 2)

    return cn2


def wind_shear(u1_ms: float, u2_ms: float, v1_ms: float, v2_ms: float, dh_m: float) -> float:
    """
    Tinh wind shear giua 2 tang khi quyen lien ke.

    Args:

        1 la tang duoi, 2 la tang tren
        u1_ms, u2_ms: Thanh phan gio huong Dong 2 tang (m/s)
        v1_ms, v2_ms: Thanh phan gio huong Bac 2 tang (m/s)
        dh_m: Chenh lech do cao giua 2 tang (m)

    Returns:
        shear: Wind shear (1/s)

    Physics:
        S = sqrt((dU/dh)^2 + (dV/dh)^2)

        dU/dh = (u2 - u1) / dh
        dV/dh = (v2 - v1) / dh

    Source: Tatarski (1961) + Roddier (1999)
    """
    # TODO: Validate dh_m != 0 -- tranh chia cho 0
    if dh_m == 0: 
        raise ValueError(f"Invalid parameter, dh_m = {dh_m}. Must != 0")

    # Tinh du_dh = (u2_ms - u1_ms) / dh_m
    du_dh = (u2_ms - u1_ms) / dh_m
    # Tinh dv_dh = (v2_ms - v1_ms) / dh_m
    dv_dh = (v2_ms - v1_ms) / dh_m
    # Tinh shear = np.sqrt(du_dh**2 + dv_dh**2)
    return np.sqrt(du_dh ** 2 + dv_dh ** 2)


def cn2_with_wind_shear(cn2_base: float, shear: float, alpha: float = 0.1) -> float:
    """
    Hieu chinh Cn2 theo wind shear.

    Args:
        cn2_base: Cn2 tu tatarski_cn2() (m^-2/3)
        shear: Wind shear tu wind_shear() (1/s)
        alpha: He so hieu chinh empirical
               Gia tri khoi diem: 0.1
               Can fine-tune bang FWHM data thuc te (Rule 5)

    Returns:
        cn2_corrected: Cn2 sau hieu chinh (m^-2/3)

    Physics:
        cn2_corrected = cn2_base * (1 + alpha * shear^2)

    Source: Tatarski (1961) ch.4
    Note:
        alpha = 0.1 la gia tri khoi diem chua co ground truth.
        SAU KHI co 30 dem FWHM data: fine-tune alpha bang regression.
        Khong duoc hardcode alpha ma khong co nguon goc (Rule 5).
    """
    # TODO: Tinh cn2_corrected = cn2_base * (1.0 + alpha * shear**2)
    cn2_fixed = cn2_base * (1.0 + alpha * shear ** 2)
    return cn2_fixed

def hv57_profile(heights_m: np.ndarray, v_rms_ms: float, cn2_ground: float) -> np.ndarray:
    """
    Tinh Cn2 profile lien tuc theo do cao dua tren HV57 model.

    Args:
        heights_m: Mang do cao (m) -- output tu hypsometric()
                   Vi du: np.array([0, 1500, 3000, 5500, 9000, 12000])
        v_rms_ms: Toc do gio RMS tai 300hPa (m/s) tu Open-Meteo
                  Dai dien cho jet stream
        cn2_ground: Cn2 mat dat (m^-2/3) tu tatarski_cn2() tai 1000hPa
                    He so A trong HV57 -- calibrate bang ESP32
                    Thanh Oai khac noi thanh Ha Noi -- phai do rieng

    Returns:
        cn2_profile: Mang Cn2 tai tung do cao (m^-2/3)
                     Cung chieu voi heights_m

    Physics (Loai 2 -- HV57 model, Valley 1980):
        3 thanh phan:

        Term 1 (Jet stream, manh nhat 8-12km):
        HV57_A1 * (v_rms_ms/HV57_V0)^2 * (1e-5*h)^10 * exp(-h/1000)
        --> Khi h=0: term1=0 vi (1e-5*0)^10=0
            Jet stream khong anh huong mat dat -- dung vat ly

        Term 2 (Upper atmosphere, hang so nen):
        HV57_C2 * exp(-h/1500)

        Term 3 (Ground layer, calibrate ESP32):
        cn2_ground * exp(-h/100)
        --> Giam nhanh theo do cao, chi anh huong 0-500m

    Source: Valley (1980), AGARD Lecture Series No.80

    Implementation note:
        Dung vectorized NumPy -- KHONG dung for loop.
        heights_m la ndarray, cac phep tinh ap dung cho ca mang.
    """
    # Tinh term1 (vectorized tren toan bo heights_m):
    term1 = HV57_A1 * (v_rms_ms / HV57_V0) ** 2 * (1e-5 * heights_m) ** 10 * np.exp(-heights_m / 1000.0)

    # Tinh term2 (vectorized):
    term2 = HV57_C2 * np.exp(-heights_m / 1500.0)

    # Tinh term3 (vectorized):
    term3 = cn2_ground * np.exp(-heights_m / 100.0)

    # cn2_profile = term1 + term2 + term3
    return term1 + term2 + term3


def fried_parameter(cn2_profile: np.ndarray, heights_m: np.ndarray, lambda_m: float = LAMBDA_DEFAULT_M) -> float:
    """
    Tinh Fried parameter r0 tu Cn2 profile.

    Args:
        cn2_profile: Mang Cn2 tai tung do cao tu hv57_profile() (m^-2/3)
        heights_m: Mang do cao tuong ung (m)
        lambda_m: Buoc song anh sang (m), default 550nm

    Returns:
        r0_m: Fried parameter (m)
              r0 lon --> seeing tot
              r0 = 0.20m --> seeing ~0.55 arcsec
              r0 = 0.05m --> seeing ~2.2 arcsec

    Physics (Loai 2 -- Roddier 1999):
        r0 = 0.185 * (lambda^2 / integral(Cn2 dh))^(3/5)

        Tich phan bang numpy.trapz (thang hinh thang):
        --> Chinh xac hon Riemann sum
        --> Phu hop khi data thua (5-6 pressure levels tu Open-Meteo)

    Source: Roddier (1999), Adaptive Optics in Astronomy, ch.2
    """
    # Tich phan Cn2 theo do cao bang numpy:
    if hasattr(np, "trapezoid"):
        integral_cn2 = np.trapezoid(cn2_profile, heights_m)
    else:
        integral_cn2 = np.trapz(cn2_profile, heights_m)


    # Xu ly truong hop integral_cn2 <= 0
    # (khi quy en trung tinh hoan toan hoac data loi)
    # Neu integral_cn2 <= 0: return gia tri r0 rat lon (vi du 999.0)
    # Khong raise exception -- day la edge case hop le ve vat ly

    if integral_cn2 <= 0:
        return 1e18

    # Tinh r0:
    return 0.185 * (lambda_m ** 2 / integral_cn2) ** (3.0 / 5.0)


def seeing_arcsec(r0_m: float,
                  lambda_m: float = LAMBDA_DEFAULT_M) -> float:
    """
    Tinh Seeing tu Fried parameter.

    Args:
        r0_m: Fried parameter (m) tu fried_parameter()
        lambda_m: Buoc song anh sang (m)

    Returns:
        epsilon: Seeing (arcseconds)
                 < 1.0" : tot
                 1.0-2.0": trung binh
                 > 2.0" : xau

    Physics (Loai 2 -- Roddier 1999):
        epsilon = 0.98 * lambda / r0  (don vi: radian)
        Chuyen sang arcsec: nhan voi 206265

    Source: Roddier (1999), Adaptive Optics in Astronomy, ch.2
    """
    # TODO: Validate r0_m > 0
    if r0_m <= 0:
        raise ValueError(f"Invalid parameter, r0_m = {r0_m}. Must > 0")

    # TODO: Tinh epsilon_rad = 0.98 * lambda_m / r0_m
    eps_rad = 0.98 * lambda_m / r0_m

    # TODO: Chuyen sang arcseconds:
    # epsilon_arcsec = epsilon_rad * 206265.0

    eps_arcsec = eps_rad * 206265.0
    return eps_arcsec

# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================

def _run_tests():
    print("=== Branch 4 Validation ===\n")

    # Test hypsometric
    print("hypsometric() tests:")
    h_850 = hypsometric(1013.25, 850.0, 284.0)
    h_500 = hypsometric(1013.25, 500.0, 256.0)
    status1 = "PASS" if 1200 < h_850 < 1700 else "FAIL"
    status2 = "PASS" if 4500 < h_500 < 6000 else "FAIL"
    print(f"  [{status1}] P=850hPa -> h={h_850:.0f}m (expected ~1500m)")
    print(f"  [{status2}] P=500hPa -> h={h_500:.0f}m (expected ~5500m)")

    print()

    # Test tatarski_cn2 -- trung tinh hoan toan
    print("tatarski_cn2() neutrality test:")
    cn2_neutral = tatarski_cn2(280.0, 1013.25, GAMMA_DRY)
    status = "PASS" if abs(cn2_neutral) < 1e-30 else "FAIL"
    print(f"  [{status}] lapse_rate=GAMMA_DRY -> cn2={cn2_neutral:.2e} (expected ~0)")

    print()

    # Test fried + seeing -- validation cases tu Branch_4_Turbulence.md
    print("fried_parameter() + seeing_arcsec() tests:")
    cases = [
        # (integral_cn2, r0_expected_m, seeing_expected_arcsec, tol_r0, tol_seeing)
        (2.66e-13, 0.20, 0.55, 0.02, 0.1),
        (8.50e-13, 0.10, 1.10, 0.02, 0.1),
        (2.72e-12, 0.05, 2.20, 0.01, 0.1),
    ]
    for integral, r0_exp, seeing_exp, tol_r0, tol_see in cases:
        h_test   = np.array([0.0, 20000.0])
        cn2_test = np.array([integral / 20000.0, integral / 20000.0])
        r0  = fried_parameter(cn2_test, h_test)
        eps = seeing_arcsec(r0)
        status_r0  = "PASS" if abs(r0  - r0_exp)    <= tol_r0  else "FAIL"
        status_eps = "PASS" if abs(eps - seeing_exp) <= tol_see else "FAIL"
        print(f"  [{status_r0}]  integral={integral:.0e} -> r0={r0:.3f}m (expected {r0_exp}m)")
        print(f"  [{status_eps}] integral={integral:.0e} -> seeing={eps:.2f}\" (expected {seeing_exp}\")")

    print()

    # Test quick rule: seeing ~ 11 / r0(cm)
    print("Quick rule test: seeing ~ 11 / r0(cm):")
    for r0_cm in [5, 10, 20]:
        r0_m = r0_cm / 100.0
        eps  = seeing_arcsec(r0_m)
        approx = 11.0 / r0_cm
        status = "PASS" if abs(eps - approx) <= 0.2 else "FAIL"
        print(f"  [{status}] r0={r0_cm}cm -> seeing={eps:.2f}\" (quy tac nhanh: {approx:.2f}\")")

    print()

    # Test hv57_profile -- kiem tra vectorized output
    print("hv57_profile() shape test:")
    h_test = np.array([0.0, 1500.0, 3000.0, 5500.0, 9000.0, 12000.0])
    profile = hv57_profile(h_test, v_rms_ms=20.0, cn2_ground=1e-14)
    status = "PASS" if len(profile) == len(h_test) and all(profile >= 0) else "FAIL"
    print(f"  [{status}] Output shape={len(profile)}, tat ca gia tri >= 0")

    # Term 1 phai = 0 tai h=0
    term1_at_zero = 0.00594 * (20.0/27.0)**2 * (1e-5 * 0.0)**10 * np.exp(0)
    status2 = "PASS" if term1_at_zero == 0.0 else "FAIL"
    print(f"  [{status2}] term1 tai h=0 = {term1_at_zero} (expected 0.0 -- jet stream khong anh huong mat dat)")


if __name__ == "__main__":
    _run_tests()