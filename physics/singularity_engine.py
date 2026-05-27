import numpy as np
from .geometry import sep_ang, eq_to_altaz
from .air_mass import abs_air_mass, air_mass_warning
from .scattering import k_extinction, transparency
from .thermodynamics import dew_point, delta_t, t_lens_estimate
from .turbulence import (hypsometric, tatarski_cn2, hv57_profile, fried_parameter, seeing_arcsec, wind_shear, cn2_with_wind_shear)
from .lunar_penalty import (lunar_illuminance, sky_brightness_moon, b_moon_to_mag)

def phys_engine(target : dict, api : dict, sensor : dict) -> dict:
    """
    Args:
        sensor: {temp_c, rh_percent, pressure_hpa, t_lens_c}
        api:    {aqi, cloud_cover, pressure_levels, v_300hpa,
                 moon_phase_deg, moon_alt_deg, moon_az_deg}
        target: {alt_deg, az_deg}

    Returns:
        physics_output: tat ca output cua 6 Branch
    """
    
    #geometry:

    delta_az = abs(target["az_deg"] - api["moon_az_deg"])
    min_ang_delta = min(delta_az % 360, 360 - (delta_az % 360))
    rho_deg = sep_ang(target["alt_deg"], api["moon_alt_deg"], min_ang_delta)

    #air_mass:
    air_mass = abs_air_mass(target["alt_deg"], sensor["pressure_hpa"])
    air_warn = air_mass_warning(air_mass)

    #scattering:
    k_ext = k_extinction(0.55, sensor["pressure_hpa"], api["pm2_5"], sensor["rh_percent"])
    trans = transparency(k_ext, air_mass)

    #thermodynamics:
    t_dew = dew_point(sensor["temp_c"], sensor["rh_percent"])

    t_delta = delta_t(sensor["t_lens_c"], t_dew)
    t_delta_heu = delta_t(t_lens_estimate(sensor["temp_c"], api["cloud_cover"]), t_dew)


    #turbulence:
    levels = api["pressure_levels"]
    heights_m = [0.0]
    valid_levels = []
    for i in range(len(levels["pressure_hpa"])):
        if levels["pressure_hpa"][i] >= sensor["pressure_hpa"]:
            continue
        temps = [sensor["temp_c"] + 273.15]
        temps.extend(levels["temp_k"][:i+1])
        temp_mean_k = np.mean(temps)
        h = hypsometric(sensor["pressure_hpa"], levels["pressure_hpa"][i], temp_mean_k)
        heights_m.append(h)
        valid_levels.append(i)
        
    heights_m = np.array(heights_m)

    # 1. Ground lapse rate calculation using least-squares linear regression over the lower levels.
    # Boundary Layer Physics: Surface layer (lowest 50-100m, Stull 1988) temperature profile is highly non-linear
    # and dominated by surface contact. Fitting a line over the lower troposphere (up to ~1.5km/850hPa)
    # filters out surface-layer microclimate noise and API grid discrepancies.
    if len(valid_levels) > 0:
        fit_indices = [0, 1]  # surface and first valid level
        # If there are more valid levels (like index 2/850hPa) and it is under 2000m, include it for a more robust fit.
        if len(heights_m) > 2 and heights_m[2] < 2000.0:
            fit_indices.append(2)
        
        # Compile temperatures corresponding to the selected heights
        temps_k = [sensor["temp_c"] + 273.15]
        for idx in valid_levels:
            temps_k.append(levels["temp_k"][idx])
        temps_k = np.array(temps_k)
        
        x = heights_m[fit_indices]
        y = temps_k[fit_indices]
        
        # Linear regression slope = dT / dh
        lapse_rate_ground, _ = np.polyfit(x, y, 1)
        
        # Type 2 Defensive Measure: Heuristic guard limit to prevent numerical runaways in extreme API data
        lapse_rate_ground = np.clip(lapse_rate_ground, -0.015, 0.015)
    else:
        lapse_rate_ground = -9.8e-3  # Default dry adiabatic lapse rate

    cn2_ground = tatarski_cn2(sensor["temp_c"] + 273.15, sensor["pressure_hpa"], lapse_rate_ground)

    # 2. Estimate altitude above sea level (ASL) of the site from surface pressure
    # US Standard Atmosphere formula: z_asl = 44330 * (1 - (P_surf / 1013.25)^0.1903)
    asl_site_m = 44330.0 * (1.0 - (sensor["pressure_hpa"] / 1013.25) ** 0.1903)
    asl_site_m = max(0.0, asl_site_m)

    # 3. Fine-grid integration for Fried parameter to prevent trapezoidal integration error on coarse grids.
    # We generate a 10m step grid from 0 to max(heights_m) to properly capture exponential ground layer decay.
    max_h = max(heights_m)
    heights_fine = np.arange(0.0, max_h + 10.0, 10.0)
    cn2_profile_fine = hv57_profile(heights_fine, api["v_300hpa"], cn2_ground, asl_site_m=asl_site_m)

    # Calculate wind shear correction factor at the coarse levels and interpolate to fine grid.
    shear_factors = [1.0]  # factor is 1.0 at h = 0 (surface)
    if "wind_u" in levels and "wind_v" in levels:
        u_vals = [0.0]
        v_vals = [0.0]
        for idx in valid_levels:
            u_vals.append(levels["wind_u"][idx])
            v_vals.append(levels["wind_v"][idx])
            
        for i in range(1, len(heights_m)):
            u1, u2 = u_vals[i-1], u_vals[i]
            v1, v2 = v_vals[i-1], v_vals[i]
            dh_shear = heights_m[i] - heights_m[i-1]
            if dh_shear > 0:
                shear = wind_shear(u1, u2, v1, v2, dh_shear)
                # wind shear correction formula from tatarski_cn2: factor = 1 + alpha * shear^2
                # alpha defaults to 0.1 in physics/turbulence.py
                factor = 1.0 + 0.1 * (shear ** 2)
                shear_factors.append(factor)
            else:
                shear_factors.append(1.0)
    else:
        for _ in range(1, len(heights_m)):
            shear_factors.append(1.0)
            
    # Interpolate shear factors to the fine grid and apply
    shear_factors_fine = np.interp(heights_fine, heights_m, shear_factors)
    cn2_profile_fine *= shear_factors_fine

    # Compute final r0 and seeing using the fine grid
    r0_m = fried_parameter(cn2_profile_fine, heights_fine)
    
    # Apply zenith angle correction (BUG 3 Fix)
    target_alt_clipped = np.clip(target["alt_deg"], 0.1, 90.0)
    sec_gamma = 1.0 / np.sin(np.radians(target_alt_clipped))
    seeing = seeing_arcsec(r0_m) * (sec_gamma ** 0.6)  # 3/5 = 0.6


    #lunar_penalty
    if api["moon_alt_deg"] > 0:
        air_mass_moon = abs_air_mass(api["moon_alt_deg"], sensor["pressure_hpa"])
        i_moon = lunar_illuminance(api["moon_phase_deg"], air_mass_moon, k_ext)
        b_moon = sky_brightness_moon(rho_deg, i_moon, air_mass, k_ext)
        sqm    = b_moon_to_mag(b_moon)
    else:
        air_mass_moon = 99.0
        b_moon = 0.0
        sqm    = 22.0

    return {
        "rho_deg":    rho_deg,
        "air_mass":   air_mass,
        "air_mass_moon":    air_mass_moon,
        "air_mass_warning": air_warn,
        "k_ext":      k_ext,
        "transparency": trans,
        "t_dew":      t_dew,
        "delta_t":    t_delta,
        "r0_m":       r0_m,
        "seeing_arcsec": seeing,
        "b_moon":     b_moon,
        "sqm":        sqm,
    }

if __name__ == "__main__":
    print("=== Run Mock Data Test ===")
    sensor_mock = {
        "temp_c": 25.0,
        "rh_percent": 70.0,
        "pressure_hpa": 1010.0,
        "t_lens_c": 23.0
    }
    api_mock = {
        "pm2_5": 15.0,
        "cloud_cover": 20.0,
        "moon_phase_deg": 90.0,
        "moon_alt_deg": 30.0,
        "moon_az_deg": 90.0,
        "v_300hpa": 20.0,
        "pressure_levels": {
            "pressure_hpa": [1000, 850, 700, 500, 300],
            "temp_k":       [298, 290, 280, 265, 245],
            "wind_u":       [2, 5, 10, 15, 20],
            "wind_v":       [1, 3, 7, 10, 15],
        }
    }
    target_mock = {"alt_deg": 45.0, "az_deg": 180.0}

    output = phys_engine(target_mock, api_mock, sensor_mock)

    print("Output")
    for k, v in output.items():
        print(f"  {k}: {v}")

    # Sanity check ranges
    assert 1.0 <= output["air_mass"] <= 38.0, f"Air mass out of range: {output['air_mass']}"
    assert 0.0 <= output["transparency"] <= 1.0, f"Transparency out of range: {output['transparency']}"
    assert output["t_dew"] < sensor_mock["temp_c"], "Dew point logic error!"
    assert output["sqm"] > 15.0, f"SQM too low: {output['sqm']}"

    print("\n Success")
