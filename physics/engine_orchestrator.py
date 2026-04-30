import numpy as np
from .interstellar_engine import phys_engine
from .geometry import eq_to_altaz

class InterstellarOrchestrator:
    @staticmethod
    def map_and_execute(ephemeris_data, atmos_profile, surface_data):
        """
        Adapter Pattern: Orchestrates data mapping -> core execution -> scoring -> UI formatting.
        """
        # ==========================================
        # 1. DATA PREPARATION LAYER (Mapping)
        # ==========================================
        
        # Tọa độ Target
        if "target_alt" not in ephemeris_data:
            alt, az = eq_to_altaz(
                ephemeris_data['target_dec'], 
                ephemeris_data['lat'], 
                ephemeris_data['ha']
            )
        else:
            alt, az = ephemeris_data["target_alt"], ephemeris_data["target_az"]
            
        target = {
            "alt_deg": max(0.001, float(alt)),
            "az_deg": float(az)
        }
        
        # Tọa độ Moon
        moon_alt, moon_az = eq_to_altaz(
            ephemeris_data['moon_dec'], 
            ephemeris_data['lat'], 
            ephemeris_data['moon_ha']
        )
        moon_alt = max(0.001, float(moon_alt))
        
        # Map 'sensor' data (Mô phỏng IoT Sensor)
        sensor = {
            "temp_c": surface_data['temp'],
            "rh_percent": surface_data['rh'],
            "pressure_hpa": surface_data['pressure'],
            "t_lens_c": surface_data.get('t_lens_c', surface_data['temp'] - 2.0) # Delta T giả định
        }
        
        # Map 'api' data (Tầng khí quyển từ OpenMeteo)
        p_levels, t_levels, u_levels, v_levels = [], [], [], []
        for level in atmos_profile:
            p_levels.append(level['pressure'])
            # Đảm bảo nhiệt độ OpenMeteo (thường là C) chuyển sang K
            temp_k = level['temp'] if level['temp'] > 200 else level['temp'] + 273.15
            t_levels.append(temp_k) 
            u_levels.append(level.get('wind_u', 0.0))
            v_levels.append(level.get('wind_v', 0.0))
            
        api = {
            "aqi": surface_data['aqi'],
            "cloud_cover": surface_data['cloud_cover'],
            "moon_phase_deg": ephemeris_data['moon_phase'],
            "moon_alt_deg": moon_alt,
            "moon_az_deg": moon_az,
            "v_300hpa": atmos_profile[-1].get('wind_speed', 20.0), # Vận tốc gió Jet Stream
            "pressure_levels": {
                "pressure_hpa": p_levels,
                "temp_k": t_levels,
                "wind_u": u_levels,
                "wind_v": v_levels
            }
        }
        
        # ==========================================
        # 2. EXECUTION LAYER (Core Library Call)
        # ==========================================
        raw_output = phys_engine(target, api, sensor)
        
        # ==========================================
        # 3. SCORING & HEURISTIC LAYER
        # ==========================================
        seeing = raw_output["seeing_arcsec"]
        transparency = raw_output["transparency"]
        sqm = raw_output["sqm"]
        dew_dt = raw_output["delta_t"]
        
        # Thang điểm 10 theo thuật toán Heuristic
        # Capping each sub-score to [0, 10] to prevent runaway scores compensating for others
        seeing_score = float(np.clip(10.0 - (seeing - 0.5) * 4, 0.0, 10.0))
        trans_score = float(np.clip((transparency - 0.5) * 25, 0.0, 10.0))
        lunar_score = float(np.clip((sqm - 18) * 2.5, 0.0, 10.0))
        
        # Ensemble Trọng số
        v_model = (seeing_score * 0.5) + (trans_score * 0.3) + (lunar_score * 0.2)
        
        # Hard constraints (An toàn thiết bị & Khả năng quan sát)
        if dew_dt <= 1.0: # DANGER hoặc DEW
            v_model = 0.0
        
        # Original raw target_alt before clipping in prep layer
        raw_target_alt = ephemeris_data.get("target_alt", 0.0)
        if "target_alt" not in ephemeris_data:
            raw_target_alt, _ = eq_to_altaz(
                ephemeris_data['target_dec'], 
                ephemeris_data['lat'], 
                ephemeris_data['ha']
            )
            
        if raw_target_alt <= 0.0:
            v_model = 0.0 # Không thể nhìn thấy dưới đường chân trời
            
        # ==========================================
        # 4. UI INTEGRATION PAYLOAD
        # ==========================================
        ui_payload = {
            "raw_physics": raw_output,
            "scores": {
                "seeing_score_10": float(np.clip(seeing_score, 0.0, 10.0)),
                "transparency_score_10": float(np.clip(trans_score, 0.0, 10.0)),
                "lunar_score_10": float(np.clip(lunar_score, 0.0, 10.0)),
                "v_model_10": float(np.clip(v_model, 0.0, 10.0))
            },
            "alerts": {
                "dew_danger": dew_dt <= 1.0,
                "air_mass_warning": raw_output["air_mass_warning"]
            }
        }
        
        return ui_payload

if __name__ == "__main__":
    ephemeris_mock = {
        'target_dec': 45.0, 'ha': 10.0, 'lat': 21.0,
        'moon_dec': 20.0, 'moon_ha': 40.0, 'moon_phase': 45.0
    }
    atmos_mock = [
        {'pressure': 1013.25, 'temp': 25.0, 'wind_u': 2.0, 'wind_v': 1.0, 'wind_speed': 2.2},
        {'pressure': 850.0, 'temp': 15.0, 'wind_u': 5.0, 'wind_v': 3.0, 'wind_speed': 5.8},
        {'pressure': 500.0, 'temp': -10.0, 'wind_u': 15.0, 'wind_v': 10.0, 'wind_speed': 18.0},
        {'pressure': 300.0, 'temp': -40.0, 'wind_u': 25.0, 'wind_v': 15.0, 'wind_speed': 29.1} 
    ]
    surface_mock = {
        'pressure': 1013.25, 'temp': 25.0, 'rh': 80.0, 'aqi': 50.0, 'cloud_cover': 0.0, 't_lens_c': 22.0
    }
    
    payload = InterstellarOrchestrator.map_and_execute(ephemeris_mock, atmos_mock, surface_mock)
    print("=== ORCHESTRATOR PAYLOAD ===")
    print(f"V_Model Score: {payload['scores']['v_model_10']:.2f} / 10")
    print(f"Seeing: {payload['raw_physics']['seeing_arcsec']:.2f}\" (Score: {payload['scores']['seeing_score_10']:.1f})")
    print(f"Transparency: {payload['raw_physics']['transparency']:.2f} (Score: {payload['scores']['transparency_score_10']:.1f})")
    print(f"SQM: {payload['raw_physics']['sqm']:.2f} (Score: {payload['scores']['lunar_score_10']:.1f})")
    print(f"Dew Danger: {payload['alerts']['dew_danger']}")
