/**
 * INTERSTELLAR DATA COLLECTOR — Google Apps Script v2
 * =====================================================
 * Cách dùng lần đầu:
 *   1. Mở Google Sheet → Extensions → Apps Script → Xóa hết, paste file này vào
 *   2. Bấm Save (Ctrl+S)
 *   3. Dropdown chọn hàm → chọn "setupWithSensor" → Bấm ▶ Run
 *   4. Cấp quyền khi Google hỏi → Xong!
 *
 * Script sẽ tự chạy MỖI GIỜ để:
 *   • Thu thập dữ liệu thời tiết + tính toán physics → tab raw_data
 *   • Import CSV sensor từ Drive (nếu có file mới) → tab raw_sensor
 */

// ═══════════════════════════════════════════════════════════════════════════
// ─── CONFIG ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const LAT      = 20.886355;
const LON      = 105.755763;
const TIMEZONE = "Asia/Ho_Chi_Minh"; // GMT+7

// Tên file CSV sensor trên Google Drive (đặt "" nếu chưa dùng tính năng này)
const CSV_SENSOR_FILENAME = "sensor_log.csv";
const CSV_SEPARATOR       = ",";

// Tên các tab trong Sheets
const SHEET_RAW_DATA   = "raw_data";
const SHEET_RAW_SENSOR = "raw_sensor";
const SHEET_COMPARISON = "comparison";

// Map cột CSV sensor (index 0-based) — khớp với interstellar_master_v4.csv
// Timestamp, ESP_T, ESP_Hum, ESP_Press, ESP_Norm, ESP_Gain,
// ESP_T_Sky, ESP_T_Am, OM_Temp, OM_Hum, OM_Cloud, OM_Wind,
// Moon_Alt, Moon_Az, Moon_Phase
const SENSOR_COL = {
  timestamp:  0,
  esp_t:      1,
  esp_hum:    2,
  esp_press:  3,
  esp_norm:   4,
  esp_gain:   5,
  esp_t_sky:  6,
  esp_t_am:   7,
  om_cloud:   10,
  om_wind:    11,
  moon_alt:   12,
  moon_az:    13,
  moon_phase: 14,
};

// Header cho tab raw_data (Interstellar physics collector)
const RAW_DATA_HEADERS = [
  "timestamp_utc", "timestamp_vn",
  "lat", "lon",
  "surf_temp_c", "surf_rh_pct", "surf_pressure_hpa",
  "surf_cloud_cover_pct", "surf_aqi",
  "atmos_1000hpa_temp_c", "atmos_1000hpa_wind_ms",
  "atmos_850hpa_temp_c",  "atmos_850hpa_wind_ms",
  "atmos_700hpa_temp_c",  "atmos_700hpa_wind_ms",
  "atmos_500hpa_temp_c",  "atmos_500hpa_wind_ms",
  "atmos_300hpa_temp_c",  "atmos_300hpa_wind_ms",
  "moon_phase_deg",
  "seeing_arcsec", "transparency", "sqm_mag_arcsec2",
  "seeing_score_10", "transparency_score_10", "lunar_score_10", "v_model_10",
  "bench_seeing_raw", "bench_trans_raw", "bench_v_model",
  "score_delta",
];

// Header cho tab raw_sensor (ESP32 sensor import)
const RAW_SENSOR_HEADERS = [
  "timestamp", "timestamp_vn",
  "esp_temp_c", "esp_hum_pct", "esp_press_hpa",
  "esp_norm_vis", "esp_gain",
  "esp_t_sky_c", "esp_t_am_c",
  "om_cloud_pct", "om_wind_ms",
  "moon_alt_deg", "moon_az_deg", "moon_phase",
  // Derived metrics
  "derived_delta_t_dew_c",    // Magnus-Tetens: esp_temp - dew_point → dew safety margin
  "derived_cloud_ir_delta",   // MLX90614: esp_t_am - esp_t_sky → IR cloud detector
  "derived_sqm_measured",     // TSL2591: NormVis → mag/arcsec² (K-S ground truth)
];


// ═══════════════════════════════════════════════════════════════════════════
// ─── SETUP ───────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function setupWithSensor() {
  _ensureSheet(SHEET_RAW_DATA,   RAW_DATA_HEADERS,   "#00e5ff");
  _ensureSheet(SHEET_RAW_SENSOR, RAW_SENSOR_HEADERS, "#a78bfa");

  // Xóa tất cả trigger cũ
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // Tạo trigger mỗi giờ cho cả 2 hàm
  ScriptApp.newTrigger("collect").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("importSensorCSV").timeBased().everyHours(1).create();

  Logger.log("✓ Triggers đã được tạo (mỗi giờ).");

  // Chạy ngay lần đầu
  collect();
  if (CSV_SENSOR_FILENAME) importSensorCSV();
}

function _ensureSheet(name, headers, headerColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let ws = ss.getSheetByName(name);
  if (!ws) {
    ws = ss.insertSheet(name);
    ws.appendRow(headers);
    ws.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#0f1117")
      .setFontColor(headerColor);
    ws.setFrozenRows(1);
    Logger.log(`Tab '${name}' đã được tạo.`);
  }
  return ws;
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── INTERSTELLAR COLLECTOR (raw_data) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function collect() {
  try {
    Logger.log("=== Interstellar Collector START ===");
    const now = new Date();
    const utcStr   = Utilities.formatDate(now, "UTC",      "yyyy-MM-dd HH:00");
    const localStr = Utilities.formatDate(now, TIMEZONE,   "yyyy-MM-dd HH:mm");

    // ── Fetch Open-Meteo ──────────────────────────────────────────────────
    const { profile, surface } = _fetchOpenMeteo(now);

    // ── Fetch 7Timer benchmark ────────────────────────────────────────────
    const bench = _fetch7Timer();

    // ── Physics engine (JS port) ──────────────────────────────────────────
    const moonPhase = _getMoonPhase(now);
    const phys      = _computePhysics(profile, surface, moonPhase);
    const scores    = _computeScores(phys);

    const vModel = scores.vModel;
    const vBench = bench.vBench;

    // ── Build row ─────────────────────────────────────────────────────────
    const row = [
      utcStr, localStr,
      LAT, LON,
      _r(surface.temp),        _r(surface.rh),
      _r(surface.pressure),    _r(surface.cloudCover),  _r(surface.aqi),
      _r(profile[0].temp), _r(profile[0].ws),
      _r(profile[1].temp), _r(profile[1].ws),
      _r(profile[2].temp), _r(profile[2].ws),
      _r(profile[3].temp), _r(profile[3].ws),
      _r(profile[4].temp), _r(profile[4].ws),
      _r(moonPhase),
      _r(phys.seeing, 4), _r(phys.transparency, 4), _r(phys.sqm, 3),
      _r(scores.seeingScore), _r(scores.transScore),
      _r(scores.lunarScore),  _r(vModel),
      bench.seeingRaw, bench.transRaw, _r(vBench),
      _r(vModel - vBench),
    ];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = _ensureSheet(SHEET_RAW_DATA, RAW_DATA_HEADERS, "#00e5ff");
    ws.appendRow(row);

    Logger.log(`✓ ${utcStr} UTC (${localStr} VN) | V=${vModel} | 7T=${vBench} | Δ=${_r(vModel-vBench)}`);
    Logger.log("=== Collector DONE ===");

  } catch(e) {
    Logger.log("ERROR collect(): " + e.toString());
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── SENSOR CSV IMPORTER (raw_sensor) ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function importSensorCSV() {
  if (!CSV_SENSOR_FILENAME) { Logger.log("CSV_SENSOR_FILENAME trống, bỏ qua."); return; }

  // 1. Tìm file CSV trên Drive
  const files = DriveApp.getFilesByName(CSV_SENSOR_FILENAME);
  if (!files.hasNext()) {
    Logger.log(`Không tìm thấy file '${CSV_SENSOR_FILENAME}' trên Drive. Hãy upload lên.`);
    return;
  }
  const content  = files.next().getBlob().getDataAsString("UTF-8");
  const allLines = content.split("\n").filter(l => l.trim().length > 0);
  if (!allLines.length) { Logger.log("File CSV trống."); return; }

  // 2. Phát hiện header tự động
  let dataLines = allLines;
  const firstCell = allLines[0].split(CSV_SEPARATOR)[0].trim();
  if (isNaN(Date.parse(firstCell))) {
    dataLines = allLines.slice(1);
    Logger.log(`Header phát hiện: "${firstCell}" — bỏ qua dòng 1.`);
  }

  // 3. Lấy mốc timestamp cuối đã import (lưu vĩnh viễn trong Script Properties)
  const props       = PropertiesService.getScriptProperties();
  const lastTsStr   = props.getProperty("SENSOR_LAST_TS") || "";
  const lastTs      = lastTsStr ? new Date(lastTsStr) : new Date(0);
  Logger.log(`Last imported: ${lastTsStr || "(chưa có)"}`);

  // 4. Parse — chỉ lấy dòng mới hơn mốc cuối
  const newRows      = [];
  let   newestTs     = lastTs;

  for (const line of dataLines) {
    if (!line.trim()) continue;
    const c   = line.split(CSV_SEPARATOR).map(x => x.trim());
    const ts  = new Date(c[SENSOR_COL.timestamp] || "");
    if (isNaN(ts) || ts <= lastTs) continue;

    const espT   = parseFloat(c[SENSOR_COL.esp_t]   ?? "");
    const espHum = parseFloat(c[SENSOR_COL.esp_hum]  ?? "");
    const espP   = parseFloat(c[SENSOR_COL.esp_press]?? "");
    const norm   = parseFloat(c[SENSOR_COL.esp_norm] ?? "");
    const gain   = c[SENSOR_COL.esp_gain]?.trim() ?? "";
    const tSky   = parseFloat(c[SENSOR_COL.esp_t_sky]?? "");
    const tAm    = parseFloat(c[SENSOR_COL.esp_t_am] ?? "");
    const cloud  = parseFloat(c[SENSOR_COL.om_cloud] ?? "");
    const wind   = parseFloat(c[SENSOR_COL.om_wind]  ?? "");
    const mAlt   = parseFloat(c[SENSOR_COL.moon_alt] ?? "");
    const mAz    = parseFloat(c[SENSOR_COL.moon_az]  ?? "");
    const mPhase = parseFloat(c[SENSOR_COL.moon_phase]?? "");

    // Derived: Dew point margin (Magnus formula)
    const deltaTDew = (!isNaN(espT) && !isNaN(espHum)) ? (() => {
      const A = 17.27, B = 237.7;
      const alpha = (A * espT)/(B + espT) + Math.log(Math.max(0.01, espHum)/100);
      return _r(espT - (B*alpha)/(A-alpha));
    })() : "";

    // Derived: IR cloud indicator (T_am - T_sky; lớn = quang đãng)
    const cloudIR = (!isNaN(tAm) && !isNaN(tSky)) ? _r(tAm - tSky) : "";

    // Derived: TSL2591 NormVis → SQM (mag/arcsec²)
    // Derivation từ Arduino code:
    //   norm_vis = visible_raw × (9876 / actual_gain)  → normalized to MAX-gain scale
    //   CPL = (integration_time_ms × MAX_gain) / TSL2591_LUX_DF
    //       = (600 × 9876) / 408 = 14523.5
    //   lux = norm_vis / CPL
    //   SQM = -2.5 × log10(lux / 108000)
    //       = -2.5 × log10(norm_vis / CPL / 108000)
    //       = -2.5 × log10(norm_vis) + 2.5 × log10(CPL × 108000)
    //       ≈ 22.99 - 2.5 × log10(norm_vis)
    // Source: Adafruit TSL2591 datasheet + K-S photometric convention
    const sqm_measured = (!isNaN(norm) && norm > 0)
      ? _r(22.99 - 2.5 * Math.log10(norm), 3) : "";

    // Timestamp local VN
    const localStr = Utilities.formatDate(ts, TIMEZONE, "yyyy-MM-dd HH:mm");

    newRows.push([
      c[SENSOR_COL.timestamp], localStr,
      _n(espT), _n(espHum), _n(espP),
      _n(norm), gain,
      _n(tSky), _n(tAm),
      _n(cloud), _n(wind),
      _n(mAlt), _n(mAz), _n(mPhase),
      deltaTDew, cloudIR, sqm_measured,
    ]);


    if (ts > newestTs) newestTs = ts;
  }

  Logger.log(`${dataLines.length} dòng tổng | ${newRows.length} dòng mới.`);
  if (!newRows.length) { Logger.log("Sheet đã up-to-date."); return; }

  // 5. Batch write vào sheet
  const ws = _ensureSheet(SHEET_RAW_SENSOR, RAW_SENSOR_HEADERS, "#a78bfa");
  ws.getRange(ws.getLastRow()+1, 1, newRows.length, newRows[0].length).setValues(newRows);

  // 6. Lưu mốc mới
  props.setProperty("SENSOR_LAST_TS", newestTs.toISOString());
  Logger.log(`✓ Import ${newRows.length} dòng. Newest: ${newestTs.toISOString()}`);
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── OPEN-METEO ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _fetchOpenMeteo(now) {
  const pLabels = ["1000hPa","850hPa","700hPa","500hPa","300hPa"];
  const atmosVars = pLabels.flatMap(l => [`temperature_${l}`,`windspeed_${l}`,`winddirection_${l}`]);

  const base = `latitude=${LAT}&longitude=${LON}&forecast_days=2&timezone=UTC`;
  const rA = JSON.parse(UrlFetchApp.fetch(`https://api.open-meteo.com/v1/forecast?${base}&hourly=${atmosVars.join(",")}`).getContentText());
  const rS = JSON.parse(UrlFetchApp.fetch(`https://api.open-meteo.com/v1/forecast?${base}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover`).getContentText());
  const rQ = JSON.parse(UrlFetchApp.fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${base}&hourly=european_aqi`).getContentText());

  const nowStr = Utilities.formatDate(now, "UTC", "yyyy-MM-dd'T'HH:00");
  let idx = rA.hourly.time.indexOf(nowStr);
  if (idx < 0) idx = 0;

  const profile = pLabels.map((label, i) => {
    const spd = (rA.hourly[`windspeed_${label}`][idx] || 0) / 3.6;
    return { temp: rA.hourly[`temperature_${label}`][idx] || 0, ws: _r(spd, 3) };
  });

  const aqi = rQ.hourly.european_aqi[idx];
  const surface = {
    temp:       rS.hourly.temperature_2m[idx]       || 0,
    rh:         rS.hourly.relative_humidity_2m[idx]  || 0,
    pressure:   rS.hourly.surface_pressure[idx]      || 1013,
    cloudCover: rS.hourly.cloud_cover[idx]           || 0,
    aqi:        aqi != null ? aqi : 50,
  };

  return { profile, surface };
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── 7TIMER ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _fetch7Timer() {
  try {
    const url  = `http://www.7timer.info/bin/api.pl?lon=${LON}&lat=${LAT}&product=astro&output=json`;
    const data = JSON.parse(UrlFetchApp.fetch(url, {muteHttpExceptions:true}).getContentText());
    const d    = data.dataseries[0];
    const sR   = d.seeing, tR = d.transparency;
    const sS   = 10 - (sR-1)*(10/7);
    const tS   = 10 - (tR-1)*(10/7);
    return { seeingRaw: sR, transRaw: tR, vBench: _r(Math.max(0, Math.min(10, (sS+tS)/2))) };
  } catch(e) {
    return { seeingRaw: "N/A", transRaw: "N/A", vBench: 0 };
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── PHYSICS ENGINE (JS port) ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _getMoonPhase(now) {
  const y = now.getUTCFullYear(), m = now.getUTCMonth()+1, d = now.getUTCDate();
  const a  = Math.floor((14-m)/12);
  const yy = y+4800-a, mm = m+12*a-3;
  const jdn = d + Math.floor((153*mm+2)/5) + 365*yy +
              Math.floor(yy/4) - Math.floor(yy/100) + Math.floor(yy/400) - 32045;
  const jd  = jdn - 0.5 + now.getUTCHours()/24;
  return ((jd - 2451549.5) / 29.53058867 % 1) * 360;
}

function _computePhysics(profile, surface, moonPhase) {
  const wind300   = profile[4].ws, wind500 = profile[3].ws;
  const windShear = Math.abs(wind300 - wind500);
  const seeing    = Math.min(4.0, 0.5 + windShear*0.06 + Math.max(0,(surface.aqi-50)*0.005));

  const cloudF = 1 - (surface.cloudCover/100)*0.9;
  const aqiF   = 1 - Math.min(0.4, surface.aqi/500);
  const transparency = Math.max(0, Math.min(1, cloudF*aqiF));

  const moonRad = Math.abs(moonPhase-180)*Math.PI/180;
  const sqm     = 22 - Math.pow(Math.cos(moonRad/2), 4)*4;

  const A = 17.27, B = 237.7;
  const alpha   = (A*surface.temp)/(B+surface.temp) + Math.log(Math.max(0.01,surface.rh)/100);
  const dewPt   = (B*alpha)/(A-alpha);
  const deltaT  = surface.temp - dewPt;

  return { seeing, transparency, sqm, deltaT };
}

function _computeScores(p) {
  const seeingScore = Math.max(0, Math.min(10, 10-(p.seeing-0.5)*4));
  const transScore  = Math.max(0, Math.min(10, (p.transparency-0.5)*25));
  const lunarScore  = Math.max(0, Math.min(10, (p.sqm-18)*2.5));
  let   vModel      = seeingScore*0.5 + transScore*0.3 + lunarScore*0.2;
  if (p.deltaT <= 1.0) vModel = 0;
  return {
    seeingScore: _r(seeingScore), transScore: _r(transScore),
    lunarScore:  _r(lunarScore),  vModel:     _r(Math.max(0, Math.min(10, vModel))),
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// ─── HELPERS ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/** Round to N decimals (default 2) */
function _r(v, n=2) { return Math.round(v * Math.pow(10,n)) / Math.pow(10,n); }

/** Return value or "" if NaN */
function _n(v) { return isNaN(v) ? "" : v; }
