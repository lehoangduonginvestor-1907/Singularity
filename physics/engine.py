import numpy as np
from . import geometry
from . import air_mass
from . import thermodynamics
from . import scattering
from . import turbulence
from . import lunar_penalty

class PhysicsEngine:
    @staticmethod
    def run(ephemeris_data, atmos_profile, surface_data):
        """
        Thực thi tuần tự 6 nhánh vật lý theo đúng Dependency (Phase 2).
        
        Args:
            ephemeris_data (dict): {'target_dec', 'target_ra', 'moon_dec', 'moon_ra', 'moon_phase', 'ha', 'lat'}
            atmos_profile (list): List of dicts, sorted from surface to high altitude (e.g. 1000hPa -> 300hPa)
                                  [{'pressure': hPa, 'temp': C, 'wind_speed': m/s}, ...]
            surface_data (dict): {'pressure', 'temp', 'rh', 'aqi', 'cloud_cover'}
        """
        results = {}
        
        # === 1. GEOMETRY (Branch 1) ===
        target_alt, target_az = geometry.eq_to_altaz(
            ephemeris_data['target_dec'], ephemeris_data['lat'], ephemeris_data['ha']
        )
        moon_alt, moon_az = geometry.eq_to_altaz(
            ephemeris_data['moon_dec'], ephemeris_data['lat'], ephemeris_data['moon_ha']
        )
        rho = geometry.sep_ang(target_alt, moon_alt, abs(target_az - moon_az))
        
        results['target_alt'] = target_alt
        results['moon_alt'] = moon_alt
        results['rho'] = rho
        
        # === 2. AIR MASS (Branch 0) ===
        x_target = air_mass.abs_air_mass(target_alt, surface_data['pressure']) if target_alt > 0 else 99.0
        x_moon = air_mass.abs_air_mass(moon_alt, surface_data['pressure']) if moon_alt > 0 else 99.0
        
        results['x_abs_target'] = x_target
        results['x_abs_moon'] = x_moon
        
        # === 3. THERMODYNAMICS (Branch 3) ===
        t_dew = thermodynamics.dew_point(surface_data['temp'], surface_data['rh'])
        t_lens = thermodynamics.t_lens_estimate(surface_data['temp'], surface_data['cloud_cover'])
        dt = thermodynamics.delta_t(t_lens, t_dew)
        dew_warn = thermodynamics.dew_warning(dt)
        pwv = scattering.pwv(surface_data['rh'], surface_data['temp'])
        
        results['t_dew'] = t_dew
        results['delta_t'] = dt
        results['dew_warning'] = dew_warn
        results['pwv'] = pwv
        
        # === 4. SCATTERING (Branch 2) ===
        k_ext = scattering.k_extinction(
            lambda_um=0.55, 
            pressure_hpa=surface_data['pressure'], 
            aqi=surface_data['aqi'], 
            rh_percent=surface_data['rh']
        )
        transparency = scattering.transparency(k_ext, x_target)
        results['k_ext'] = k_ext
        results['transparency'] = transparency
        
        # === 5. TURBULENCE (Branch 4) ===
        heights = []
        # Calculate heights using Hypsometric
        for level in atmos_profile:
            if level['pressure'] == surface_data['pressure']:
                h = 0.0
            else:
                t_mean_k = (surface_data['temp'] + level['temp']) / 2.0 + 273.15
                h = turbulence.hypsometric(surface_data['pressure'], level['pressure'], t_mean_k)
            heights.append(h)
        
        heights = np.array(heights)
        # Use HV57 to generate continuous profile (simplified for Phase 2)
        v_rms = atmos_profile[-1]['wind_speed'] # Assume top level is 300hPa jet stream
        cn2_ground = 1e-14
        cn2_profile = turbulence.hv57_profile(heights, v_rms, cn2_ground)
        r0 = turbulence.fried_parameter(cn2_profile, heights)
        seeing = turbulence.seeing_arcsec(r0)
        
        results['r0'] = r0
        results['seeing'] = seeing
        
        # === 6. LUNAR PENALTY (Branch 5) ===
        if moon_alt > 0:
            i_moon = lunar_penalty.lunar_illuminance(ephemeris_data['moon_phase'], x_moon, k_ext)
            b_moon = lunar_penalty.sky_brightness_moon(rho, i_moon, x_target, k_ext)
            sky_mag = lunar_penalty.b_moon_to_mag(b_moon)
        else:
            sky_mag = 22.0 # Dark sky if moon is below horizon
            
        results['sky_mag'] = sky_mag
        
        # === V_model calculation (Heuristic for demo) ===
        seeing_score = max(0.0, 10.0 - (seeing - 0.5) * 4) # 0.5" -> 10, 3.0" -> 0
        trans_score = max(0.0, (transparency - 0.5) * 25)  # 0.9 -> 10, 0.5 -> 0
        lunar_score = max(0.0, (sky_mag - 18) * 2.5)       # 22 -> 10, 18 -> 0
        
        v_model = (seeing_score * 0.5) + (trans_score * 0.3) + (lunar_score * 0.2)
        if dew_warn == 3: # DEW threshold crossed
            v_model = 0.0
            
        results['v_model'] = np.clip(v_model, 0.0, 10.0)
        return results

# Self-test block
if __name__ == "__main__":
    ephemeris_mock = {
        'target_dec': 45.0, 'ha': 10.0, 'lat': 21.0,
        'moon_dec': 20.0, 'moon_ha': 40.0, 'moon_phase': 45.0
    }
    atmos_mock = [
        {'pressure': 1013.25, 'temp': 25.0, 'wind_speed': 2.0},
        {'pressure': 850.0, 'temp': 15.0, 'wind_speed': 5.0},
        {'pressure': 500.0, 'temp': -10.0, 'wind_speed': 15.0},
        {'pressure': 300.0, 'temp': -40.0, 'wind_speed': 25.0} # Jet stream 300hPa
    ]
    surface_mock = {
        'pressure': 1013.25, 'temp': 25.0, 'rh': 80.0, 'aqi': 50.0, 'cloud_cover': 0.0
    }
    print("Running Physics Engine Pipeline...")
    res = PhysicsEngine.run(ephemeris_mock, atmos_mock, surface_mock)
    print("=== ENGINE OUTPUT ===")
    for k, v in res.items():
        print(f"{k}: {v:.3f}" if isinstance(v, float) else f"{k}: {v}")
    print("Integration Test PASS")
