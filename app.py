import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timezone
import astropy.units as u
from astropy.coordinates import EarthLocation, AltAz, get_body, SkyCoord, get_sun
from astropy.time import Time
import plotly.express as px

from ingestion.fetchers import Type1Fetcher, Type2Fetcher
from physics.engine_orchestrator import SingularityOrchestrator

st.set_page_config(page_title="Singularity Forecast V3", layout="wide", page_icon="🔭")

# ==========================================
# 1. DATA LAYER (MOCK CATALOG)
# ==========================================
@st.cache_data
def get_mock_catalog() -> pd.DataFrame:
    """
    Giả lập việc nạp Catalog vào RAM với tốc độ cực cao.
    Bao gồm Hành tinh, Messier nổi bật và NGC.
    """
    data = [
        # Hành tinh
        {"Name": "Jupiter", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -2.5},
        {"Name": "Saturn", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": 0.5},
        {"Name": "Mars", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -1.0},
        {"Name": "Venus", "RA": 0.0, "Dec": 0.0, "Type": "Planet", "Magnitude": -4.0},
        
        # Nebulae & Clusters
        {"Name": "Orion Nebula (M42)", "RA": 83.822, "Dec": -5.391, "Type": "Nebula", "Magnitude": 4.0},
        {"Name": "Pleiades (M45)", "RA": 56.75, "Dec": 24.116, "Type": "Open Cluster", "Magnitude": 1.6},
        {"Name": "Hercules Cluster (M13)", "RA": 250.422, "Dec": 36.46, "Type": "Globular Cluster", "Magnitude": 5.8},
        {"Name": "Lagoon Nebula (M8)", "RA": 270.925, "Dec": -24.38, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Dumbbell Nebula (M27)", "RA": 299.901, "Dec": 22.716, "Type": "Planetary Nebula", "Magnitude": 7.5},
        {"Name": "Ring Nebula (M57)", "RA": 283.396, "Dec": 33.029, "Type": "Planetary Nebula", "Magnitude": 8.8},
        {"Name": "Crab Nebula (M1)", "RA": 83.633, "Dec": 22.014, "Type": "Supernova Remnant", "Magnitude": 8.4},
        {"Name": "Eagle Nebula (M16)", "RA": 274.7, "Dec": -13.8, "Type": "Nebula", "Magnitude": 6.0},
        {"Name": "Omega Centauri (NGC 5139)", "RA": 201.697, "Dec": -47.479, "Type": "Globular Cluster", "Magnitude": 3.9},
        {"Name": "Tarantula Nebula (NGC 2070)", "RA": 84.676, "Dec": -69.1, "Type": "Nebula", "Magnitude": 8.0},
        
        # Galaxies
        {"Name": "Andromeda Galaxy (M31)", "RA": 10.684, "Dec": 41.269, "Type": "Galaxy", "Magnitude": 3.4},
        {"Name": "Triangulum Galaxy (M33)", "RA": 23.462, "Dec": 30.66, "Type": "Galaxy", "Magnitude": 5.7},
        {"Name": "Sombrero Galaxy (M104)", "RA": 189.997, "Dec": -11.623, "Type": "Galaxy", "Magnitude": 8.0},
        {"Name": "Whirlpool Galaxy (M51)", "RA": 202.469, "Dec": 47.195, "Type": "Galaxy", "Magnitude": 8.4},
        {"Name": "Bode's Galaxy (M81)", "RA": 148.888, "Dec": 69.065, "Type": "Galaxy", "Magnitude": 6.9},
        {"Name": "Cigar Galaxy (M82)", "RA": 148.969, "Dec": 69.679, "Type": "Galaxy", "Magnitude": 8.4}
    ]
    return pd.DataFrame(data)

class AstroHelper:
    @staticmethod
    def get_ephemeris(lat: float, lon: float, time_utc: datetime, target_row: pd.Series) -> dict:
        loc = EarthLocation(lat=lat*u.deg, lon=lon*u.deg, height=10*u.m)
        t = Time(time_utc)
        
        target_name = target_row["Name"]
        if target_row["Type"] == "Planet":
            target = get_body(target_name.lower(), t)
        else:
            target = SkyCoord(ra=target_row["RA"]*u.deg, dec=target_row["Dec"]*u.deg)
            
        target_altaz = target.transform_to(AltAz(obstime=t, location=loc))
        
        # Tính toán Mặt trăng
        moon = get_body("moon", t)
        moon_altaz = moon.transform_to(AltAz(obstime=t, location=loc))
        
        # Tính Moon Phase qua góc Separation với Sun
        sun = get_body("sun", t)
        elongation = sun.separation(moon)
        phase_angle = 180.0 - elongation.deg
        
        # Tính Separation giữa Mục tiêu và Mặt trăng
        rho_deg = target.separation(moon).deg
        
        lst = t.sidereal_time('apparent', longitude=loc.lon)
        target_ha = (lst - target.ra).deg
        moon_ha = (lst - moon.ra).deg
        
        return {
            'target_dec': target.dec.deg,
            'target_ra': target.ra.deg,
            'target_alt': target_altaz.alt.deg,
            'target_az': target_altaz.az.deg,
            'ha': target_ha,
            'lat': lat,
            'moon_dec': moon.dec.deg,
            'moon_ra': moon.ra.deg,
            'moon_alt': moon_altaz.alt.deg,
            'moon_az': moon_altaz.az.deg,
            'moon_ha': moon_ha,
            'moon_phase': phase_angle,
            'moon_sep': rho_deg
        }

# ==========================================
# 3. THUẬT TOÁN "TONIGHT'S BEST"
# ==========================================
def get_tonights_best(df_catalog: pd.DataFrame, lat: float, lon: float, dt_utc: datetime, 
                      atmos_profile: list, surface_data: dict, zenith_payload: dict, zenith_ephem: dict) -> pd.DataFrame:
    best_targets = []
    
    # Lấy thông số Zenith để đánh giá chất lượng bầu trời (Bộ lọc 2)
    zenith_trans = zenith_payload['raw_physics']['transparency']
    moon_phase = zenith_ephem['moon_phase'] # 0: Trăng tròn, 180: Trăng non
    
    # Bầu trời bị đánh giá kém nếu: Transparency thấp HOẶC Trăng quá sáng (Phase < 90)
    bad_sky = zenith_trans < 0.6 or moon_phase < 90.0
    
    for _, row in df_catalog.iterrows():
        ephem = AstroHelper.get_ephemeris(lat, lon, dt_utc, row)
        alt = ephem["target_alt"]
        mag = row["Magnitude"]
        rho = ephem["moon_sep"]
        
        # Lọc 1: Lấy Alt > 30°
        if alt <= 30.0:
            continue
            
        # Lọc 2: Giới hạn Magnitude dựa trên chất lượng bầu trời
        if bad_sky and mag >= 5.0:
            continue
        if not bad_sky and mag >= 10.0:
            continue
            
        # Lọc 3: Tránh xa Mặt trăng
        if rho <= 40.0:
            continue
            
        # Chạy Core Physics Engine cho Mục tiêu thỏa mãn
        payload = SingularityOrchestrator.map_and_execute(ephem, atmos_profile, surface_data)
        v_model = payload["scores"]["v_model_10"]
        
        best_targets.append({
            "Target": row["Name"],
            "Type": row["Type"],
            "Mag": mag,
            "Altitude (°)": round(alt, 1),
            "Score": round(v_model, 1)
        })
        
    df_best = pd.DataFrame(best_targets)
    if not df_best.empty:
        df_best = df_best.sort_values(by="Score", ascending=False).head(5)
    return df_best

# ==========================================
# 4. GIAO DIỆN STREAMLIT (UI/UX)
# ==========================================
if 'local_offset' not in st.session_state:
    st.session_state.local_offset = 0.0

df_catalog = get_mock_catalog()

with st.sidebar:
    st.title("🔭 Singularity V3")
    st.header("⚙️ Configuration")
    lat = st.number_input("Latitude", value=20.886355, format="%.4f")
    lon = st.number_input("Longitude", value=105.755763, format="%.4f")
    run_btn = st.button("🚀 Run Forecast", type="primary", use_container_width=True)
    st.markdown("---")
    st.markdown(f"**Local Offset (Δ):** `{st.session_state.local_offset:+.1f}`")

if run_btn or 'atmos_12h' in st.session_state:
    if run_btn:
        with st.spinner("Fetching Atmospheric Data..."):
            st.session_state.atmos_12h = Type1Fetcher.fetch_atmosphere_profile_12h(lat, lon)
            st.session_state.surface_12h = Type1Fetcher.fetch_surface_data_12h(lat, lon)
            st.session_state.bench_12h = Type2Fetcher.fetch_benchmark_seeing_12h(lat, lon)
    
    atmos_12h = st.session_state.atmos_12h
    surface_12h = st.session_state.surface_12h
    bench_12h = st.session_state.bench_12h
    times = [a["time"] for a in atmos_12h]
    current_time = times[0]
    
    # ==========================================
    # LOGIC LAYER: Mode 1 (Global Zenith)
    # ==========================================
    dummy_zenith = pd.Series({"Name": "Zenith", "RA": 0.0, "Dec": 0.0, "Type": "Zenith"})
    ephem_z = AstroHelper.get_ephemeris(lat, lon, current_time, dummy_zenith)
    ephem_z["target_alt"] = 90.0 # Bắt buộc Zenith
    payload_z = SingularityOrchestrator.map_and_execute(ephem_z, atmos_12h[0]["profile"], surface_12h[0])
    global_score = np.clip(payload_z["scores"]["v_model_10"] + st.session_state.local_offset, 0.0, 10.0)
    
    # TOP DASHBOARD
    st.header(f"🌍 Global Sky Score ({current_time.strftime('%H:%M')} UTC)")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Overall Score (Zenith)", f"{global_score:.1f} / 10", delta="Khí quyển nội tại")
    c2.metric("Zenith Seeing", f"{payload_z['raw_physics']['seeing_arcsec']:.2f}\"")
    c3.metric("Zenith Transp.", f"{payload_z['raw_physics']['transparency']:.2f}")
    is_dew = payload_z['alerts']['dew_danger']
    c4.metric("Dew Status", "DANGER" if is_dew else "SAFE", delta="-Dew Alert" if is_dew else "Clear Lens", delta_color="inverse" if is_dew else "normal")
    
    st.markdown("---")
    
    tab1, tab2 = st.tabs(["🏆 Tonight's Best", "🎯 Target Explorer"])
    
    with tab1:
        st.subheader("🌟 Các Thiên thể đáng xem nhất hiện tại")
        df_best = get_tonights_best(df_catalog, lat, lon, current_time, atmos_12h[0]["profile"], surface_12h[0], payload_z, ephem_z)
        
        if df_best.empty:
            st.warning("Đêm nay không có mục tiêu nào thỏa mãn điều kiện quan sát (Có thể do trăng sáng, mây mù hoặc mục tiêu quá thấp).")
        else:
            st.dataframe(
                df_best,
                column_config={
                    "Score": st.column_config.ProgressColumn(
                        "V_Model Score",
                        help="Điểm số chất lượng quan sát (0-10)",
                        format="%.1f",
                        min_value=0,
                        max_value=10,
                    ),
                    "Target": st.column_config.TextColumn("Mục tiêu"),
                    "Type": st.column_config.TextColumn("Loại"),
                    "Mag": st.column_config.NumberColumn("Độ sáng (Mag)", format="%.1f"),
                    "Altitude (°)": st.column_config.NumberColumn("Độ cao hiện tại", format="%.1f")
                },
                hide_index=True,
                use_container_width=True
            )
            
    with tab2:
        st.subheader("Phân tích chi tiết Mục tiêu (12 Giờ)")
        target_name = st.selectbox("Lựa chọn Mục tiêu từ Catalog", df_catalog["Name"])
        target_row = df_catalog[df_catalog["Name"] == target_name].iloc[0]
        
        v_model_scores = []
        bench_scores = []
        
        # LOGIC LAYER: Mode 2 (Target Specific)
        for i in range(12):
            ephem = AstroHelper.get_ephemeris(lat, lon, times[i], target_row)
            payload = SingularityOrchestrator.map_and_execute(ephem, atmos_12h[i]["profile"], surface_12h[i])
            final_score = np.clip(payload["scores"]["v_model_10"] + st.session_state.local_offset, 0.0, 10.0)
            v_model_scores.append(final_score)
            bench_scores.append(bench_12h[i]["v_model_benchmark"])
            
        df_chart = pd.DataFrame({
            "Time": times,
            "Singularity (Physics)": v_model_scores,
            "7Timer (Benchmark)": bench_scores
        })
        
        fig = px.line(
            df_chart, 
            x="Time", 
            y=["Singularity (Physics)", "7Timer (Benchmark)"],
            title=f"12-Hour Forecast: {target_name}",
            labels={"value": "V_Model Score (0-10)", "variable": "Mô hình", "Time": "Thời gian (UTC)"},
            color_discrete_map={
                "Singularity (Physics)": "#00E676", # Màu xanh lục nổi bật
                "7Timer (Benchmark)": "#29B6F6" # Màu xanh dương
            }
        )
        fig.update_layout(yaxis_range=[0, 10], hovermode="x unified")
        st.plotly_chart(fig, use_container_width=True)
