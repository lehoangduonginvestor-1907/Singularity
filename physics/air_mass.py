import numpy as np

# Hang so vat ly -- KHONG duoc thay doi, co nguon goc ro rang
P0_HPA = 1013.25        # Ap suat chuan muc nuoc bien (hPa) -- ICAO Standard Atmosphere
KASTEN_A = 0.50572      # Empirical fit -- Kasten & Young (1989), Table 1
KASTEN_B = 96.07995     # Empirical fit -- Kasten & Young (1989), Table 1
KASTEN_C = 1.6364       # Empirical fit -- Kasten & Young (1989), Table 1


def rel_air_mass(alt_deg: float) -> float:
    """
    Tinh Relative Air Mass X_rel theo Kasten-Young (1989).

    Args:
        altitude_deg: Altitude cua muc tieu (do), range (0, 90]

    Returns:
        X_rel: Relative air mass (dimensionless), range [1.0, ~38.0]

    Physics:
        z = 90 do - altitude  (zenith angle)

        X_rel = 1 / [cos(z) + 0.50572 * (96.07995 - z)^(-1.6364)]

    Source: Kasten & Young (1989), Applied Optics 28(22):4735
    
    Warning:
        altitude <= 5 do khong khuyen nghi quan sat
        X_rel > 5.6 nen canh bao user
    """

    # kiem tra valid
    if alt_deg <= 0 or alt_deg > 90: 
        raise ValueError(f"Invalid parameters : alt_deg = {alt_deg}. Must be in (0, 90]")

    # zenith angle
    z_deg = 90.0 - alt_deg
    z = np.radians(z_deg)


    #tinh x_rel
    x_rel = 1.0 / (np.cos(z) + KASTEN_A * (KASTEN_B - z_deg)**(-KASTEN_C))
    return x_rel


def abs_air_mass(alt_deg: float, p_hpa: float) -> float:
    """
    Tinh Absolute Air Mass X_abs voi pressure correction.

    Args:
        altitude_deg: Altitude cua muc tieu (do)
        pressure_hpa: Ap suat thuc te tu BME280 (hPa)

    Returns:
        X_abs: Absolute air mass (dimensionless)

    Physics:
        X_abs = X_rel * (P / P0)

        Ly do: Mat do khong khi ti le voi ap suat.
        Da Lat (P ~ 850 hPa) co X_abs thap hon Ha Noi
        du cung altitude goc quan sat.

    Source: Derived tu Beer-Lambert + Hydrostatic eq.
    """
    # Validate pressure_hpa -- phai trong [950, 1050] hPa
    # Neu ngoai range: raise ValueError kem message ro rang

    if p_hpa > 1200 or p_hpa < 400:
        raise ValueError(f"Invalid parameters : p_hpa = {p_hpa}. Must be in [400, 1200]")

    #Tim x_abs chuan theo cong thuc 
    # X_abs = X_rel * (pressure_hpa / P0_HPA)
    x_abs =  rel_air_mass(alt_deg) * (p_hpa / P0_HPA)

    return x_abs


def air_mass_warning(x_abs: float) -> bool:
    """
    Tra ve boolean neu X_abs vuot nguong an toan.

    Args:
        x_abs: Absolute air mass

    Returns:
        Warning tra ve 0 hoac 1 neu an toan

    Physics basis:
        X > 5.6 tuong duong altitude < 10 do
        Extinction qua lon, quan sat khong khuyen nghi.
        Kasten-Young valid den z = 90 do nhung accuracy giam.
    """


    #neu warning tra ve 1 ngc lai tra ve 0
    return (x_abs > 5.6)



# ============================================================
# VALIDATION -- Minh phai pass toan bo truoc khi bao Duong
# ============================================================


def _run_tests():
    print("=== Branch 0 Validation ===\n")

    # Test relative_air_mass -- P = P0 nen X_abs = X_rel
    cases = [
        # (altitude, X_expected, tolerance)
        (90.0, 1.000, 0.001),
        (45.0, 1.413, 0.001),
        (10.0, 5.587, 0.01),
    ]

    print("relative_air_mass() tests:")
    for alt, expected, tol in cases:
        result = rel_air_mass(alt)
        status = "PASS" if abs(result - expected) <= tol else "FAIL"
        print(f"  [{status}] alt={alt} > X_rel={result:.3f} (expected {expected})")

    print()

    # Test pressure correction
    print("absolute_air_mass() pressure correction test:")
    x_hanoi  = abs_air_mass(45.0, 1013.25)  # Ha Noi, sea level
    x_dalat  = abs_air_mass(45.0, 850.0)    # Da Lat, ~1500m
    status = "PASS" if x_dalat < x_hanoi else "FAIL"
    print(f"  [{status}] X_abs Ha Noi={x_hanoi:.3f} > X_abs Da Lat={x_dalat:.3f}")

    print()

    # Test warning
    print("air_mass_warning() tests:")
    w1 = air_mass_warning(3.0)
    w2 = air_mass_warning(6.0) # Assuming this will return a warning
    print(f"  [{'PASS' if not w1 else 'FAIL'}] X=3.0 -> No warning (got: {w1})")
    print(f"  [{'PASS' if w2 else 'FAIL'}] X=6.0 -> Warning (got: {w2})")


if __name__ == "__main__":
    _run_tests()

