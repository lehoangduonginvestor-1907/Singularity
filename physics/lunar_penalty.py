import numpy as np

# Hang so -- KHONG duoc thay doi, co nguon goc ro rang

# He so ham pha mat trang -- Source: Krisciunas & Schaefer (1991), eq.20
KS_PHASE_A = 0.026     # He so bac 1 trong ham pha
KS_PHASE_B = 4e-9      # He so bac 4 trong ham pha

# He so ham tan xa f(rho) -- Source: Krisciunas & Schaefer (1991), eq.21
KS_SCATTER_A = 5.36    # He so Rayleigh term
KS_SCATTER_B = 6.15    # He so Mie term
KS_SCATTER_C = 40.0    # He so giam dan Mie theo goc

def lunar_phase_function(phase_angle_deg: float) -> float:
    """
    Tinh ham pha Mat Trang f(phi).

    Args:
        phase_angle_deg: Goc pha Mat Trang (do)
                         phi = 0   --> Trang tron (Full Moon), sang nhat
                         phi = 180 --> Trang non (New Moon), toi nhat
                         Range: [0, 180]

    Returns:
        f_phi: Ham pha (khong co don vi)
               f_phi = 1.0 khi trang tron
               f_phi -> 0  khi trang non

    Physics (Loai 2 -- Krisciunas & Schaefer 1991):
        f(phi) = 10^(-0.4 * (0.026*|phi| + 4e-9*phi^4))

        Bac 4 (phi^4) mo ta hieu ung opposition surge:
        Mat trang sang dot ngot khi gan trang tron hon
        du chi lech vai do -- do phan xa back-scatter.

    Source: Krisciunas & Schaefer (1991), PASP 103:1033, eq.20
    """
    # Validate phase_angle_deg trong [0, 180]
    if phase_angle_deg < 0 or phase_angle_deg > 180:
        raise ValueError (f"Invalid parameters : phase_angle_deg = {phase_angle_deg}. Must be in [0, 180]")


    # Tinh exponent:
    expo = -0.4 * (KS_PHASE_A * abs(phase_angle_deg) + KS_PHASE_B * phase_angle_deg**4)

    # Tinh f_phi = 10 ** exponent
    return 10 ** expo

def lunar_illuminance(phase_angle_deg: float, x_moon: float, k_ext: float, i0: float = 1.0) -> float:
    """
    Tinh do sang Mat Trang I_moon sau khi xuyen qua khi quyen.

    Args:
        phase_angle_deg: Goc pha Mat Trang (do) tu Ephemeris/Astropy
        x_moon: Air Mass cua Mat Trang tu Branch 0
        k_ext: He so tat tong hop tu Branch 2
        i0: Do sang tham chieu (mac dinh 1.0, don vi tuong doi)

    Returns:
        i_moon: Do sang Mat Trang sau khi bi khi quyen hap thu
                Don vi tuong doi

    Physics (Loai 2 -- Krisciunas & Schaefer 1991):
        I_moon = I0 * f(phi) * 10^(-0.4 * k_ext * X_moon)

        f(phi): Ham pha -- goi lunar_phase_function()
        10^(-0.4 * k * X): Beer-Lambert trong thang mag
                           (nhat quan voi photometric convention)

    Source: Krisciunas & Schaefer (1991), PASP 103:1033, eq.19
    """
    # Goi lunar_phase_function(phase_angle_deg) de lay f_phi
    f_phi = lunar_phase_function(phase_angle_deg)

    # Tinh att:
    att = 10 ** (-0.4 * k_ext * x_moon)

    # TODO: Tinh i_moon = i0 * f_phi * attenuation
    return i0 * f_phi * att


def scattering_function(rho_deg: float) -> float:
    """
    Tinh ham tan xa f(rho) -- mo ta goc phu thuoc cua do sang Mat Trang.

    Args:
        rho_deg: Separation angle giua muc tieu va Mat Trang (do)
                 Tu Branch 1 (sep_ang())
                 Range: [0, 180]

    Returns:
        f_rho: Gia tri ham tan xa (khong co don vi)
               f_rho lon khi rho nho (Mat Trang gan muc tieu)
               f_rho nho khi rho = 90 (Mat Trang vuong goc)

    Physics (Loai 2 -- Krisciunas & Schaefer 1991):
        f(rho) = 10^5.36 * (1.06 + cos^2(rho)) + 10^(6.15 - rho/40)

        Term 1: 10^5.36 * (1.06 + cos^2(rho))
            --> Rayleigh scattering angular dependence
            --> cos^2(rho): tan xa manh ve phia truoc va phia sau
                           yeu nhat o goc 90 do
            --> Source: Bohren & Huffman (1983)

        Term 2: 10^(6.15 - rho/40)
            --> Mie scattering component
            --> Giam dan theo goc, manh hon o goc nho (forward scatter)
            --> Source: Angstrom (1929)

    Source: Krisciunas & Schaefer (1991), PASP 103:1033, eq.21
    """
    # TODO: Validate rho_deg trong [0, 180]
    if rho_deg < 0 or rho_deg > 180: 
        raise ValueError(f"Invalid parameters : rho_deg = {rho_deg}. Must be in [0, 180]")

    # Chuyen rho sang radian de tinh cos:
    rho_rad = np.radians(rho_deg)

    # Tinh term1 (Rayleigh):
    term1 = (10 ** KS_SCATTER_A) * (1.06 + np.cos(rho_rad) ** 2)

    # Tinh term2 (Mie):
    term2 = 10 ** (KS_SCATTER_B - rho_deg / KS_SCATTER_C)
    # Chu y: rho_deg (do) trong exponent, khong phai rho_rad

    #tra ve f_rho
    return term1 + term2

def sky_brightness_moon(rho_deg: float, i_moon: float, x_target: float, k_ext: float) -> float:
    """
    Tinh do sang nen troi do Mat Trang gay ra (B_moon).

    Args:
        rho_deg: Separation angle (do) tu Branch 1
        i_moon: Do sang Mat Trang tu lunar_illuminance()
        x_target: Air Mass cua muc tieu tu Branch 0
        k_ext: He so tat tu Branch 2

    Returns:
        b_moon: Do sang nen troi (don vi tuong doi)
                b_moon lon --> nen troi sang --> quan sat kho
                b_moon ~ 0 --> Trang non, nen toi

    Physics (Loai 2 -- Krisciunas & Schaefer 1991):
        B_moon = f(rho) * I_moon * 10^(-0.4 * k_ext * X_target)

        f(rho): Tan xa anh sang Mat Trang den mat nguoi quan sat
        I_moon: Do sang Mat Trang truoc khi vao khi quyen muc tieu
        10^(-0.4*k*X): Suy giam them khi qua khi quyen huong muc tieu

    Source: Krisciunas & Schaefer (1991), PASP 103:1033, eq.22
    """
    # Goi scattering_function(rho_deg) de lay f_rho
    f_rho = scattering_function(rho_deg)

    # Tinh target_att:
    target_att = 10 ** (-0.4 * k_ext * x_target)

    # Tinh b_moon = f_rho * i_moon * target_att
    return f_rho * i_moon * target_att

def b_moon_to_mag(b_moon: float, c_offset: float = 22.0) -> float:
    """
    Chuyen B_moon sang don vi mag/arcsec^2.

    Args:
        b_moon: Do sang nen troi tu sky_brightness_moon()
        c_offset: Hang so hieu chinh photometric (mag/arcsec^2)
                  Gia tri khoi diem: 22.0
                  Fine-tune bang TSL2591 SQM data sau

    Returns:
        m_sky: Do sang nen troi (mag/arcsec^2)
               Gia tri cao hon = toi hon = tot hon
               21-22: xuat sac
               19-20: kha
               < 18: bi o nhiem anh sang nang

    Physics:
        m_sky = -2.5 * log10(B_moon) + C

        Thang magnitude: am 2.5 log --> doi so sang do sang

    Source: Krisciunas & Schaefer (1991) + photometric convention
    Note:
        Khi b_moon = 0 (Trang non): log10(0) khong xac dinh
        --> Xu ly bang cach tra ve c_offset (nen toi hoan toan)
    """
    # Xu ly edge case b_moon <= 0:
    if b_moon <= 0:
        return c_offset

    # Khi Trang non, b_moon ~ 0 --> log10 khong xac dinh
    # Neu b_moon <= 0: return c_offset (nen toi hoan toan)

    # Tinh m_sky = -2.5 * np.log10(b_moon) + c_offset
    return -2.5 * np.log10(b_moon) + c_offset
    pass


# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================

def _run_tests():
    print("=== Branch 5 Validation ===\n")

    # Test lunar_phase_function
    print("lunar_phase_function() tests:")
    f_full = lunar_phase_function(0.0)    # Trang tron
    f_new  = lunar_phase_function(180.0)  # Trang non
    status1 = "PASS" if f_full > f_new else "FAIL"
    status2 = "PASS" if abs(f_full - 1.0) < 0.01 else "FAIL"
    print(f"  [{status1}] f(0) > f(180): f_full={f_full:.4f}, f_new={f_new:.6f}")
    print(f"  [{status2}] f(0) ~ 1.0: got {f_full:.4f} (expected ~1.0)")

    print()

    # Test scattering_function -- Rayleigh symmetry
    print("scattering_function() tests:")
    f_0   = scattering_function(0.0)    # Forward scatter -- lon
    f_90  = scattering_function(90.0)   # Vuong goc -- nho nhat
    f_180 = scattering_function(180.0)  # Back scatter -- lon hon 90
    status1 = "PASS" if f_0  > f_90  else "FAIL"
    status2 = "PASS" if f_180 > f_90 else "FAIL"
    print(f"  [{status1}] f(0) > f(90): {f_0:.1f} > {f_90:.1f}")
    print(f"  [{status2}] f(180) > f(90): {f_180:.1f} > {f_90:.1f}")

    print()

    # Test sky_brightness_moon -- validation cases tu Branch_5_LunarPenalty.md
    print("sky_brightness_moon() qualitative tests:")

    # Trang non -- b_moon phai gan 0
    i_new  = lunar_illuminance(180.0, x_moon=1.5, k_ext=0.113)
    b_new  = sky_brightness_moon(60.0, i_new, x_target=1.0, k_ext=0.113)

    # Trang tron, rho nho -- b_moon phai lon
    i_full = lunar_illuminance(0.0, x_moon=1.5, k_ext=0.113)
    b_full_close = sky_brightness_moon(30.0, i_full, x_target=1.0, k_ext=0.113)

    # Trang tron, rho lon -- b_moon nho hon
    b_full_far = sky_brightness_moon(150.0, i_full, x_target=1.0, k_ext=0.113)

    status1 = "PASS" if b_new < b_full_close else "FAIL"
    status2 = "PASS" if b_full_far < b_full_close else "FAIL"
    print(f"  [{status1}] Trang non < Trang tron (rho=30): {b_new:.4f} < {b_full_close:.4f}")
    print(f"  [{status2}] Trang tron rho=150 < rho=30: {b_full_far:.4f} < {b_full_close:.4f}")

    print()

    # Test b_moon_to_mag -- edge case
    print("b_moon_to_mag() edge case test:")
    m_zero = b_moon_to_mag(0.0)   # b_moon = 0 --> phai tra ve c_offset
    status = "PASS" if abs(m_zero - 22.0) < 0.01 else "FAIL"
    print(f"  [{status}] b_moon=0.0 -> m_sky={m_zero:.1f} (expected 22.0)")


if __name__ == "__main__":
    _run_tests()