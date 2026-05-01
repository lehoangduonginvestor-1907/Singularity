export const getTzOffset = (lon) => Math.round(lon / 15);

export const formatTzLabel = (lon) => {
  const offset = getTzOffset(lon);
  return offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
};

export const formatLocalTime = (isoString, lon) => {
  if (!isoString) return '';
  // Check if isoString is HH:MM or actual ISO
  if (isoString.length === 5 && isoString.includes(':')) return isoString; // Fallback
  
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  
  const offset = getTzOffset(lon);
  d.setUTCHours(d.getUTCHours() + offset);
  return d.toISOString().substring(11, 16);
};

export const DICT = {
  en: {
    app_title: "Project Singularity",
    app_sub: "OBSERVATORY DIAGNOSTICS & FORECAST",
    tab_dash: "Layer 1: Dashboard",
    tab_plan: "Site Planner",
    red_vision: "Red Vision",
    sync: "SYNC",
    scanning: "SCANNING...",
    cond_exc: "Conditions are excellent tonight.",
    cond_mod: "Conditions are moderate tonight.",
    cond_poor: "Conditions are poor tonight.",
    global_sky: "Global Sky Score",
    clear_skies: "Clear skies ahead",
    proceed_caution: "Proceed with caution",
    zenith_seeing: "Zenith Seeing",
    arcsec_fwhm: "Arc-seconds FWHM",
    transparency: "Transparency",
    atmos_clarity: "Atmospheric clarity",
    dew_risk: "Dew Risk",
    cond_risk: "⚠ Condensation risk",
    lens_protected: "✓ Lens protected",
    danger: "DANGER",
    safe: "SAFE",
    target_exp: "Target Explorer",
    physics_trace: "12-hour physics forecast trace",
    physics_score: "Singularity Score",
    bench_score: "7Timer Benchmark",
    time_label: "Time",
    model_label: "Model"
  },
  vi: {
    app_title: "Dự Án Singularity",
    app_sub: "CHẨN ĐOÁN & DỰ BÁO THIÊN VĂN",
    tab_dash: "Lớp 1: Bảng Điều Khiển",
    tab_plan: "Đề Xuất Vị Trí",
    red_vision: "Chế Độ Đỏ",
    sync: "ĐỒNG BỘ",
    scanning: "ĐANG QUÉT...",
    cond_exc: "Điều kiện quan sát đêm nay rất tuyệt vời.",
    cond_mod: "Điều kiện quan sát đêm nay ở mức trung bình.",
    cond_poor: "Điều kiện quan sát đêm nay khá tệ.",
    global_sky: "Điểm Bầu Trời Chung",
    clear_skies: "Trời quang mây tạnh",
    proceed_caution: "Cần chú ý cẩn thận",
    zenith_seeing: "Độ Nét (Seeing)",
    arcsec_fwhm: "Giây cung (FWHM)",
    transparency: "Độ Trong Suốt",
    atmos_clarity: "Độ sạch của không khí",
    dew_risk: "Nguy Cơ Đọng Sương",
    cond_risk: "⚠ Nguy cơ đọng sương",
    lens_protected: "✓ Ống kính an toàn",
    danger: "NGUY HIỂM",
    safe: "AN TOÀN",
    target_exp: "Trình Khám Phá Mục Tiêu",
    physics_trace: "Biểu đồ dự báo vật lý 12 giờ",
    physics_score: "Điểm Vật Lý (Singularity)",
    bench_score: "Dự báo 7Timer",
    time_label: "Thời gian",
    model_label: "Mô hình"
  }
};
