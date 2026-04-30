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
    air_mass_moon = abs_air_mass(api["moon_alt_deg"], sensor["pressure_hpa"])
    air_warn = air_mass_warning(air_mass)

    #scattering:
    k_ext = k_extinction(0.55, sensor["pressure_hpa"], api["aqi"], sensor["rh_percent"])
    trans = transparency(k_ext, air_mass)

    #thermodynamics:
    t_dew = dew_point(sensor["temp_c"], sensor["rh_percent"])

    t_delta = delta_t(sensor["t_lens_c"], t_dew)
    t_delta_heu = delta_t(t_lens_estimate(sensor["temp_c"], api["cloud_cover"]), t_dew)


    #turbulence:
    levels = api["pressure_levels"]
    heights_m = []
    for i in range(len(levels["pressure_hpa"])):
        temps = [sensor["temp_c"] + 273.15]
        temps.extend(levels["temp_k"][:i+1])
        temp_mean_k = np.mean(temps)
        h = hypsometric(sensor["pressure_hpa"], levels["pressure_hpa"][i], temp_mean_k)
        heights_m.append(h)
    heights_m = np.array(heights_m)



    dT = levels["temp_k"][1] - levels["temp_k"][0]
    dh = heights_m[1] - heights_m[0]
    lapse_rate_ground = dT / dh

    cn2_ground = tatarski_cn2(sensor["temp_c"] + 273.15, sensor["pressure_hpa"], lapse_rate_ground)
    cn2_profile = hv57_profile(heights_m, api["v_300hpa"], cn2_ground)

    if "wind_u" in levels and "wind_v" in levels:
        for i in range(1, len(heights_m)):
            u1, u2 = levels["wind_u"][i-1], levels["wind_u"][i]
            v1, v2 = levels["wind_v"][i-1], levels["wind_v"][i]
            dh_shear = heights_m[i] - heights_m[i-1]
            if dh_shear > 0:
                shear = wind_shear(u1, u2, v1, v2, dh_shear)
                cn2_profile[i] = cn2_with_wind_shear(cn2_profile[i], shear)

    r0_m = fried_parameter(cn2_profile, heights_m)
    seeing = seeing_arcsec(r0_m)


    #lunar_penalty
    i_moon = lunar_illuminance(api["moon_phase_deg"], air_mass_moon, k_ext)
    b_moon = sky_brightness_moon(rho_deg, i_moon, air_mass, k_ext)
    sqm    = b_moon_to_mag(b_moon)

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
        "aqi": 80,
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
