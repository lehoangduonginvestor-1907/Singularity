/**
 * SINGULARITY DATA COLLECTOR — Google Apps Script v3.1 (Stable - Physics Aligned)
 * ==============================================================================
 * Hệ thống thu thập dữ liệu tự động 24/7 cho Project Singularity.
 * 
 * Các tính năng chính:
 *  1. Tự động bù đắp dữ liệu (Backfill): Nếu script bị dừng, lần chạy sau sẽ tự lấy lại các giờ bị thiếu.
 *  2. Tích hợp đa nguồn: Open-Meteo (Thời tiết), 7Timer (Benchmark), Astropy-like (Thiên văn).
 *  3. Nhập dữ liệu Sensor: Tự động đồng bộ file CSV từ ESP32 trên Google Drive.
 *  4. Lõi Vật lý chuẩn (v3.1): Hypsometric, HV57, Magnus-Tetens, Beer-Lambert, Krisciunas-Schaefer.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ─── CONFIG ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const LAT      = 20.886355;
const LON      = 105.755763;
const TIMEZONE = "Asia/Ho_Chi_Minh"; // GMT+7

const CSV_SENSOR_FILENAME = "sensor_log.csv";
const CSV_SEPARATOR       = ",";

const SHEET_RAW_DATA   = "raw_data";
const SHEET_RAW_SENSOR = "raw_sensor";

const RAW_DATA_HEADERS = [
  "timestamp_utc", "timestamp_vn", "lat", "lon",
  "surf_temp_c", "surf_rh_pct", "surf_pressure_hpa", "surf_cloud_cover_pct", "surf_aqi",
  "atmos_1000hpa_temp_c", "atmos_1000hpa_wind_ms",
  "atmos_850hpa_temp_c",  "atmos_850hpa_wind_ms",
  "atmos_700hpa_temp_c",  "atmos_700hpa_wind_ms",
  "atmos_500hpa_temp_c",  "atmos_500hpa_wind_ms",
  "atmos_300hpa_temp_c",  "atmos_300hpa_wind_ms",
  "moon_phase_deg", "moon_alt_deg", "target_alt_deg",
  "seeing_arcsec", "transparency", "sqm_mag_arcsec2",
  "seeing_score_10", "transparency_score_10", "lunar_score_10", "v_model_10",
  "bench_seeing_raw", "bench_trans_raw", "bench_v_model", "score_delta"
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── SETUP ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function setup() {
  _ensureSheet(SHEET_RAW_DATA, RAW_DATA_HEADERS, "#00e5ff");
  
  // Xóa trigger cũ
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Tạo trigger chạy mỗi giờ
  ScriptApp.newTrigger("mainJob").timeBased().everyHours(1).create();

  Logger.log("✓ Setup hoàn tất. Đã tạo trigger chạy mỗi giờ.");
  mainJob();
}

/** Hàm tổng hợp chạy mỗi giờ */
function mainJob() {
  collect();
  if (CSV_SENSOR_FILENAME) importSensorCSV();
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SINGULARITY COLLECTOR (raw_data) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function collect() {
  try {
    const ws = _ensureSheet(SHEET_RAW_DATA, RAW_DATA_HEADERS, "#00e5ff");
    const lastTsStr = _getLastTimestamp(ws);
    const now = new Date();
    now.setMinutes(0, 0, 0); // Làm tròn về đầu giờ

    let startTs;
    if (!lastTsStr) {
      startTs = new Date(now.getTime() - 24 * 3600000); // Lấy 24h trước nếu sheet trống
    } else {
      // Đảm bảo parse chuỗi thời gian là UTC bằng cách chuyển thành chuẩn ISO 8601 (có 'Z')
      let isoStr = lastTsStr.replace(" ", "T");
      if (!isoStr.endsWith("Z")) isoStr += ":00Z";
      startTs = new Date(new Date(isoStr).getTime() + 3600000);
    }

    if (startTs > now) {
      Logger.log("Sheet đã cập nhật đến giờ hiện tại.");
      return;
    }

    Logger.log(`Đang lấy dữ liệu từ ${startTs.toISOString()} đến ${now.toISOString()}`);
    
    // Fetch dữ liệu từ Open-Meteo (hỗ trợ dải thời gian)
    const entries = _fetchOpenMeteoRange(LAT, LON, startTs, now);
    if (!entries.length) return;

    const rows = [];
    for (const entry of entries) {
      const moon     = _getMoonEphemeris(LAT, LON, entry.time);
      const phys     = _computePhysics(entry.profile, entry.surface, moon.phase, moon.alt);
      const scores   = _computeScores(phys);
      const bench    = _fetch7Timer(); // Lấy benchmark hiện tại (giả định)

      const utcStr   = Utilities.formatDate(entry.time, "UTC", "yyyy-MM-dd HH:00");
      const vnStr    = Utilities.formatDate(entry.time, TIMEZONE, "yyyy-MM-dd HH:mm");

      rows.push([
        utcStr, vnStr, LAT, LON,
        _r(entry.surface.temp), _r(entry.surface.rh), _r(entry.surface.pressure), _r(entry.surface.cloudCover), _r(entry.surface.aqi),
        _r(entry.profile[0].temp), _r(entry.profile[0].ws),
        _r(entry.profile[1].temp), _r(entry.profile[1].ws),
        _r(entry.profile[2].temp), _r(entry.profile[2].ws),
        _r(entry.profile[3].temp), _r(entry.profile[3].ws),
        _r(entry.profile[4].temp), _r(entry.profile[4].ws),
        _r(moon.phase), _r(moon.alt), 90.0, // target_alt mặc định zenith
        _r(phys.seeing, 4), _r(phys.transparency, 4), _r(phys.sqm, 3),
        _r(scores.seeingScore), _r(scores.transScore), _r(scores.lunarScore), _r(scores.vModel),
        bench.seeingRaw, bench.transRaw, _r(bench.vBench), _r(scores.vModel - bench.vBench)
      ]);
    }

    if (rows.length > 0) {
      ws.getRange(ws.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      Logger.log(`✓ Đã thêm ${rows.length} dòng mới.`);
    }

  } catch (e) {
    Logger.log("LỖI collect(): " + e.stack);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── OPEN-METEO API ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _fetchOpenMeteoRange(lat, lon, start, end) {
  const startStr = Utilities.formatDate(start, "UTC", "yyyy-MM-dd");
  const endStr   = Utilities.formatDate(end, "UTC", "yyyy-MM-dd");
  const pLabels  = ["1000hPa","850hPa","700hPa","500hPa","300hPa"];
  const atmosVars = pLabels.flatMap(l => [`temperature_${l}`, `windspeed_${l}`]);

  const urlAtmos = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${atmosVars.join(",")}&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;
  const urlSurf  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;
  const urlAqi   = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=european_aqi&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;

  const rA = JSON.parse(UrlFetchApp.fetch(urlAtmos).getContentText());
  const rS = JSON.parse(UrlFetchApp.fetch(urlSurf).getContentText());
  let rQ = { hourly: { european_aqi: [] } };
  try {
     rQ = JSON.parse(UrlFetchApp.fetch(urlAqi).getContentText());
  } catch(e) {}

  const results = [];
  rA.hourly.time.forEach((tStr, idx) => {
    const t = new Date(tStr + "Z");
    if (t < start || t > end) return;

    const profile = pLabels.map((l, i) => ({
      pressure: parseInt(l.replace("hPa", "")),
      temp: rA.hourly[`temperature_${l}`][idx],
      ws:   (rA.hourly[`windspeed_${l}`][idx] || 0) / 3.6
    }));

    const surface = {
      temp: rS.hourly.temperature_2m[idx],
      rh:   Math.max(0.1, Math.min(99.0, rS.hourly.relative_humidity_2m[idx])),
      pressure: rS.hourly.surface_pressure[idx],
      cloudCover: Math.max(0.0, Math.min(100.0, rS.hourly.cloud_cover[idx])),
      aqi: (rQ.hourly.european_aqi && rQ.hourly.european_aqi[idx]) ? rQ.hourly.european_aqi[idx] : 50
    };

    results.push({ time: t, profile, surface });
  });

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PHYSICS & EPHEMERIS (Aligned with v3.1 Python Core) ───────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _getMoonEphemeris(lat, lon, date) {
  // Bản rút gọn để tính Pha và Độ cao gần đúng
  const jd = (date.getTime() / 86400000) + 2440587.5;
  
  // Pha mặt trăng (0-360)
  const phase = ((jd - 2451549.5) / 29.53058867 % 1) * 360;
  
  // Độ cao gần đúng (chỉ để tham khảo)
  const hour = date.getUTCHours();
  const alt = 45 + 30 * Math.sin((hour - 6) * Math.PI / 12); 
  
  return { phase: phase < 0 ? phase + 360 : phase, alt: alt };
}

function _computePhysics(profile, surface, moonPhase, moonAlt) {
  // 1. Thermodynamics (Branch 3)
  // Magnus-Tetens
  const a = 17.625;
  const b = 243.04;
  const gamma = (a * surface.temp) / (b + surface.temp) + Math.log(surface.rh / 100.0);
  const dewPt = (b * gamma) / (a - gamma);
  const deltaTRad = 5.0 - (5.0 - 0.5) * (surface.cloudCover / 100.0);
  const tLensEst = surface.temp - deltaTRad;
  const deltaT = tLensEst - dewPt;

  // 2. Scattering (Branch 2)
  const lambda_um = 0.55;
  const p0 = 1013.25;
  const kRay = (0.00864 / Math.pow(lambda_um, 4.09)) * (surface.pressure / p0);
  const fRh = Math.pow(1.0 / (1.0 - surface.rh / 100.0), 0.5);
  const kMie = 0.02 * Math.pow(Math.max(0, surface.aqi), 0.8) * fRh;
  const kExt = kRay + kMie + 0.016; // 0.016 is K_OZONE

  // Target is Zenith (alt=90) -> air_mass = 1 * (P/P0)
  const xTarget = 1.0 * (surface.pressure / p0);
  const transparency = Math.exp(-kExt * xTarget);

  // 3. Turbulence (Branch 4) - Simplified HV57 & Hypsometric
  // Giả định height các tầng bằng hypsometric
  const rGas = 8.314, muAir = 0.029, g = 9.81;
  let heights = [0];
  let h_sum = 0;
  for(let i=1; i<profile.length; i++) {
    let t_mean = (profile[i-1].temp + profile[i].temp)/2 + 273.15;
    let ratio = profile[i-1].pressure / profile[i].pressure;
    let dh = (rGas * t_mean) / (muAir * g) * Math.log(ratio);
    h_sum += dh;
    heights.push(h_sum);
  }

  // HV57
  const v_rms = profile[4].ws; // 300hPa wind
  const cn2_ground = 1e-14;
  let integral_cn2 = 0;
  
  for(let i=0; i<heights.length - 1; i++) {
      let h = (heights[i] + heights[i+1]) / 2;
      let dh = heights[i+1] - heights[i];
      let term1 = 0.00594 * Math.pow(v_rms/27.0, 2) * Math.pow(1e-5 * h, 10) * Math.exp(-h / 1000.0);
      let term2 = 2.7e-16 * Math.exp(-h / 1500.0);
      let term3 = cn2_ground * Math.exp(-h / 100.0);
      let cn2 = term1 + term2 + term3;
      integral_cn2 += cn2 * dh;
  }

  let r0 = 0.185 * Math.pow(Math.pow(0.55e-6, 2) / Math.max(1e-18, integral_cn2), 0.6);
  let seeing = 0.98 * 0.55e-6 / r0 * 206265.0;

  // 4. Lunar Penalty (Branch 5)
  let sqm = 22.0;
  if (moonAlt > 0) {
      let z_deg = 90 - moonAlt;
      let z_rad = z_deg * Math.PI / 180;
      let xMoonRel = 1.0 / (Math.cos(z_rad) + 0.50572 * Math.pow(96.07995 - z_deg, -1.6364));
      let xMoon = xMoonRel * (surface.pressure / p0);
      
      // Phase function
      let phase_angle = moonPhase > 180 ? 360 - moonPhase : moonPhase; // [0, 180]
      let f_phi = Math.pow(10, -0.4 * (0.026 * phase_angle + 4e-9 * Math.pow(phase_angle, 4)));
      let iMoon = 1.0 * f_phi * Math.pow(10, -0.4 * kExt * xMoon);
      
      // Scattering (Target Zenith, Moon at moonAlt -> rho = 90 - moonAlt)
      let rho = 90 - moonAlt;
      let rho_rad = rho * Math.PI / 180;
      let term1 = Math.pow(10, 5.36) * (1.06 + Math.pow(Math.cos(rho_rad), 2));
      let term2 = Math.pow(10, 6.15 - rho / 40.0);
      let f_rho = term1 + term2;
      
      let target_att = Math.pow(10, -0.4 * kExt * xTarget);
      let bMoon = f_rho * iMoon * target_att;
      if(bMoon > 0) {
         sqm = -2.5 * Math.log10(bMoon) + 22.0;
      }
  }

  return { seeing, transparency, sqm, deltaT };
}

function _computeScores(p) {
  const sS = Math.max(0, Math.min(10, 10 - (p.seeing - 0.5) * 4));
  const tS = Math.max(0, Math.min(10, (p.transparency - 0.5) * 25));
  const lS = Math.max(0, Math.min(10, (p.sqm - 18) * 2.5));
  let v = sS * 0.5 + tS * 0.3 + lS * 0.2;
  if (p.deltaT <= 1.0) v = 0;
  return { seeingScore: sS, transScore: tS, lunarScore: lS, vModel: v };
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _ensureSheet(name, headers, color) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ws = ss.getSheetByName(name);
  if (!ws) {
    ws = ss.insertSheet(name);
    ws.appendRow(headers);
    ws.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor(color);
    ws.setFrozenRows(1);
  }
  return ws;
}

function _getLastTimestamp(ws) {
  const lastRow = ws.getLastRow();
  if (lastRow <= 1) return null;
  return ws.getRange(lastRow, 1).getDisplayValue();
}

function _fetch7Timer() {
  try {
    const url  = `http://www.7timer.info/bin/api.pl?lon=${LON}&lat=${LAT}&product=astro&output=json`;
    const res  = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const data = JSON.parse(res.getContentText());
    const d    = data.dataseries[0];
    const sS   = 10 - (d.seeing - 1) * 1.4;
    const tS   = 10 - (d.transparency - 1) * 1.4;
    return { seeingRaw: d.seeing, transRaw: d.transparency, vBench: (sS + tS) / 2 };
  } catch (e) {
    return { seeingRaw: "N/A", transRaw: "N/A", vBench: 0 };
  }
}

function _r(v, n = 2) { return Math.round(v * Math.pow(10, n)) / Math.pow(10, n); }

// ═══════════════════════════════════════════════════════════════════════════
// ─── SENSOR IMPORT ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function importSensorCSV() {
  try {
    const files = DriveApp.getFilesByName(CSV_SENSOR_FILENAME);
    if (!files.hasNext()) {
      Logger.log(`Không tìm thấy file ${CSV_SENSOR_FILENAME} trên Drive.`);
      return;
    }
    const file = files.next();
    const csvData = file.getBlob().getDataAsString("UTF-8");
    const rows = Utilities.parseCsv(csvData, CSV_SEPARATOR);
    
    if (rows.length < 2) return; // Chỉ có header hoặc rỗng
    
    const ws = _ensureSheet(SHEET_RAW_SENSOR, rows[0], "#f59e0b");
    const lastRow = ws.getLastRow();
    let startIdx = 1; // Bỏ qua header
    
    if (lastRow > 1) {
      // Tìm dòng cuối đã import để chỉ import data mới (dựa vào cột 1 thường là timestamp)
      const lastImportedTs = ws.getRange(lastRow, 1).getValue().toString();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === lastImportedTs) {
          startIdx = i + 1;
          break;
        }
      }
    }
    
    const newRows = rows.slice(startIdx);
    if (newRows.length > 0) {
      ws.getRange(lastRow + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
      Logger.log(`✓ Đã đồng bộ ${newRows.length} dòng từ Sensor CSV.`);
    }
  } catch (e) {
    Logger.log("LỖI importSensorCSV(): " + e.stack);
  }
}
