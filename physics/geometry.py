import numpy as np

def sep_ang(a1_deg : float, a2_deg : float, delta_az_deg : float) -> float :

    """
    Args:
        a1_deg: Altitude cua muc tieu (do)
        a2_deg: Altitude cua Mat Trang (do)
        delta_az_deg: Hieu Azimuth giua 2 thien the (do)
    
    Returns:
        rho_deg: Separation angle rho (do), range [0, 180]
    """

    #convert sang rad
    a1 = np.radians(a1_deg)
    a2 = np.radians(a2_deg)
    delta_az = np.radians(delta_az_deg)

    # ap dung ct spherical Spherical Law of Cosine
    # cos(rho) = sin(a1) * sin(a2) + cos(a1) * cos(a2) * cos(delta_az)

    cos_rho = np.sin(a1) * np.sin(a2) + np.cos(a1) * np.cos(a2) * np.cos(delta_az)
   
    
    #chuan hoa va thay doi
    cos_rho = np.clip(cos_rho, -1.0, 1.0)
    rho = np.arccos(cos_rho)

    #tra ve gia tri
    return np.rad2deg(rho)

def eq_to_altaz(dec_deg: float, lat_deg: float, ha_deg: float) -> tuple[float, float]:
    """
    Chuyen doi toa do Equatorial -> Horizontal (Alt/Az).
    
    Args:
        dec_deg: Declination cua thien the (do)
        lat_deg: Vi do nguoi quan sat (do)
        ha_deg: Hour Angle (do)
    
    Returns:
        (altitude_deg, azimuth_deg)
    
    Physics:
        Karttunen eq 2.14:
        sin(a) = sin(delta)*sin(phi) + cos(delta)*cos(phi)*cos(h)
    
    Source: Karttunen Sec 2.4
    """

    #convert sang rad
    dec = np.radians(dec_deg)
    lat = np.radians(lat_deg)
    ha = np.radians(ha_deg)

    #tinh sin altitude va chuan hoa
    sin_alt = np.sin(dec) * np.sin(lat) + np.cos(dec) * np.cos(lat) * np.cos(ha)
    sin_alt = np.clip(sin_alt, -1.0, 1.0)

    alt_deg = np.rad2deg(np.arcsin(sin_alt))

    y = -np.sin(ha) * np.cos(dec)
    x = np.sin(dec) * np.cos(lat) - np.cos(dec) * np.sin(lat) * np.cos(ha)

    # Tinh goc Azimuth theo radian (ham arctan2 tra ve khoang [-pi, pi])
    azi_rad = np.arctan2(y, x)
    azi_deg = (np.rad2deg(azi_rad) + 360.0) % 360.0
    return (alt_deg, azi_deg)



# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================


def _run_tests():
    print("=== Branch 1 Validation ===\n")
    
    # Test separation_angle
    cases = [
        # (a1, a2, delta_az, rho_expected, tolerance)
        (45.0, 60.0, 30.0, 23.28, 0.1),
        (90.0, 90.0,  0.0,  0.0, 0.01),
        ( 0.0,  0.0, 180.0, 180.0, 0.01),
    ]
    
    print("separation_angle() tests:")
    for a1, a2, daz, expected, tol in cases:
        result = sep_ang(a1, a2, daz)
        status = "PASS" if abs(result - expected) <= tol else "FAIL"
        print(f"  [{status}] a1={a1}* a2={a2}* DAz={daz}* -> p = {result:.2f}* (expected {expected}*)")
    
    print()

if __name__ == "__main__":
    _run_tests()

