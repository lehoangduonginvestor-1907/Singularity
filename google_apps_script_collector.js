/**
 * SINGULARITY DATA COLLECTOR — Google Apps Script v4.0 (Multi-Source Ensemble)
 * =============================================================================
 * Thu thập dữ liệu tự động 24/7 từ 3 NWP models: GFS, ECMWF, ICON.
 * 
 * Thay đổi so với v3.1:
 *  - Fetch song song 3 models (GFS, ECMWF, ICON) thay vì chỉ GFS
 *  - Tính ensemble weighted average (ECMWF 40%, GFS 30%, ICON 30%)
 *  - Ghi cả raw per-model data + ensemble vào sheet
 *  - Thêm model spread (confidence indicator) tại 300hPa
 */

// ═══════════════════════════════════════════════════════════════════════════
// ─── CONFIG ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const LAT      = 20.886355;
const LON      = 105.755763;
const TIMEZONE = "Asia/Ho_Chi_Minh";

const CSV_SENSOR_FILENAME = "singularity_master_v5.csv";
const CSV_SEPARATOR       = ",";

const SHEET_RAW_DATA   = "raw_data";
const SHEET_RAW_SENSOR = "raw_sensor";

// Ensemble weights — ECMWF generally better for tropical upper atmosphere
const WEIGHTS = { gfs: 0.30, ecmwf: 0.40, icon: 0.30 };

// NWP Model endpoints
const NWP_MODELS = {
  gfs:   "https://api.open-meteo.com/v1/forecast",
  ecmwf: "https://api.open-meteo.com/v1/ecmwf",
  icon:  "https://api.open-meteo.com/v1/dwd-icon"
};

const P_LABELS = ["1000hPa","850hPa","700hPa","500hPa","300hPa"];

const RAW_DATA_HEADERS = [
  "timestamp_utc", "timestamp_vn", "lat", "lon",
  // Surface
  "surf_temp_c", "surf_rh_pct", "surf_pressure_hpa", "surf_cloud_cover_pct", "surf_aqi", "surf_wind_gusts_ms",
  // Ensemble atmospheric profile (weighted average of 3 models)
  "ens_1000hpa_temp_c", "ens_1000hpa_wind_ms",
  "ens_850hpa_temp_c",  "ens_850hpa_wind_ms",
  "ens_700hpa_temp_c",  "ens_700hpa_wind_ms",
  "ens_500hpa_temp_c",  "ens_500hpa_wind_ms",
  "ens_300hpa_temp_c",  "ens_300hpa_wind_ms",
  // Per-model 300hPa wind (for spread analysis)
  "gfs_300hpa_wind_ms", "ecmwf_300hpa_wind_ms", "icon_300hpa_wind_ms",
  "jet_spread_ms", "ensemble_confidence",
  // Per-model 300hPa temp (for bias analysis)
  "gfs_300hpa_temp_c", "ecmwf_300hpa_temp_c", "icon_300hpa_temp_c",
  // Ephemeris
  "moon_phase_deg", "moon_alt_deg", "target_alt_deg",
  // Physics output (computed from ensemble)
  "seeing_arcsec", "transparency", "sqm_mag_arcsec2",
  // Scores
  "seeing_score_10", "transparency_score_10", "lunar_score_10", "v_model_10",
  // Benchmark
  "bench_seeing_raw", "bench_trans_raw", "bench_v_model", "score_delta"
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── SETUP & MAIN ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function setup() {
  _ensureSheet(SHEET_RAW_DATA, RAW_DATA_HEADERS, "#00e5ff");
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("mainJob").timeBased().everyHours(1).create();
  Logger.log("✓ Setup v4.0 hoàn tất. Trigger mỗi giờ đã được tạo.");
  mainJob();
}

function mainJob() {
  if (CSV_SENSOR_FILENAME) importSensorCSV();
  collect();
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── COLLECTOR ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function collect() {
  try {
    const ws = _ensureSheet(SHEET_RAW_DATA, RAW_DATA_HEADERS, "#00e5ff");
    const lastTsStr = _getLastTimestamp(ws);
    const now = new Date();
    now.setMinutes(0, 0, 0);

    let startTs;
    if (!lastTsStr) {
      startTs = new Date(now.getTime() - 24 * 3600000);
    } else {
      let isoStr = lastTsStr.replace(" ", "T");
      if (!isoStr.endsWith("Z")) isoStr += ":00Z";
      startTs = new Date(new Date(isoStr).getTime() + 3600000);
    }

    if (startTs > now) {
      Logger.log("Sheet đã cập nhật đến giờ hiện tại.");
      return;
    }

    Logger.log(`Fetching ${startTs.toISOString()} → ${now.toISOString()}`);

    // Fetch surface + AQI (same for all models)
    const surfaceData = _fetchSurfaceRange(LAT, LON, startTs, now);

    // Fetch atmospheric profiles from 3 NWP models
    const modelProfiles = {};
    for (const [name, url] of Object.entries(NWP_MODELS)) {
      try {
        modelProfiles[name] = _fetchAtmosRange(url, LAT, LON, startTs, now);
        Logger.log(`✓ ${name}: ${Object.keys(modelProfiles[name]).length} hours`);
      } catch (e) {
        Logger.log(`✗ ${name} failed: ${e.message}`);
        modelProfiles[name] = {};
      }
    }

    const rows = [];
    for (const entry of surfaceData) {
      const tKey = entry.time.toISOString();
      
      // Get profiles from each model for this hour
      const perModel = {};
      for (const name of Object.keys(NWP_MODELS)) {
        perModel[name] = (modelProfiles[name] || {})[tKey] || null;
      }

      // Compute ensemble
      const ensemble = _ensembleProfile(perModel);
      if (!ensemble) continue; // All models failed for this hour

      // Per-model 300hPa data for spread analysis
      const jet = _extractJetData(perModel);

      const moon   = _getMoonFromSensor(entry.time);
      const phys   = _computePhysics(ensemble, entry.surface, moon.phase, moon.alt);
      const scores = _computeScores(phys);
      const bench  = _fetch7Timer();

      const utcStr = Utilities.formatDate(entry.time, "UTC", "yyyy-MM-dd HH:00");
      const vnStr  = Utilities.formatDate(entry.time, TIMEZONE, "yyyy-MM-dd HH:mm");

      rows.push([
        utcStr, vnStr, LAT, LON,
        _r(entry.surface.temp), _r(entry.surface.rh), _r(entry.surface.pressure),
        _r(entry.surface.cloudCover), _r(entry.surface.aqi), _r(entry.surface.windGusts),
        // Ensemble profile
        _r(ensemble[0].temp), _r(ensemble[0].ws),
        _r(ensemble[1].temp), _r(ensemble[1].ws),
        _r(ensemble[2].temp), _r(ensemble[2].ws),
        _r(ensemble[3].temp), _r(ensemble[3].ws),
        _r(ensemble[4].temp), _r(ensemble[4].ws),
        // Per-model 300hPa wind
        _r(jet.gfs_wind), _r(jet.ecmwf_wind), _r(jet.icon_wind),
        _r(jet.spread), jet.confidence,
        // Per-model 300hPa temp
        _r(jet.gfs_temp), _r(jet.ecmwf_temp), _r(jet.icon_temp),
        // Ephemeris
        _r(moon.phase), _r(moon.alt), 90.0,
        // Physics
        _r(phys.seeing, 4), _r(phys.transparency, 4), _r(phys.sqm, 3),
        // Scores
        _r(scores.seeingScore), _r(scores.transScore), _r(scores.lunarScore), _r(scores.vModel),
        // Benchmark
        bench.seeingRaw, bench.transRaw, _r(bench.vBench), _r(scores.vModel - bench.vBench)
      ]);
    }

    if (rows.length > 0) {
      ws.getRange(ws.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
      Logger.log(`✓ Đã thêm ${rows.length} dòng (ensemble từ ${Object.keys(modelProfiles).filter(m => Object.keys(modelProfiles[m]).length > 0).join("+")}).`);
    }

  } catch (e) {
    Logger.log("LỖI collect(): " + e.stack);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MULTI-SOURCE FETCH ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch atmospheric profile from a single NWP model endpoint.
 * Returns { "2026-01-01T12:00:00.000Z": [{pressure, temp, ws}, ...], ... }
 */
function _fetchAtmosRange(apiUrl, lat, lon, start, end) {
  const startStr = Utilities.formatDate(start, "UTC", "yyyy-MM-dd");
  const endStr   = Utilities.formatDate(end, "UTC", "yyyy-MM-dd");
  
  // All 3 APIs support wind_speed_ (standardized naming)
  const vars = P_LABELS.flatMap(l => [`temperature_${l}`, `wind_speed_${l}`]);
  const url = `${apiUrl}?latitude=${lat}&longitude=${lon}&hourly=${vars.join(",")}&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;
  
  const resp = JSON.parse(UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText());
  if (!resp.hourly) return {};

  const result = {};
  resp.hourly.time.forEach((tStr, idx) => {
    const t = new Date(tStr + "Z");
    if (t < start || t > end) return;

    const profile = P_LABELS.map(l => {
      const temp = resp.hourly[`temperature_${l}`][idx];
      const ws_kmh = resp.hourly[`wind_speed_${l}`][idx];
      return {
        pressure: parseInt(l),
        temp: temp !== null ? temp : null,
        ws: ws_kmh !== null ? ws_kmh / 3.6 : null
      };
    });

    // Skip if any critical value is null
    if (profile.some(p => p.temp === null || p.ws === null)) return;
    result[t.toISOString()] = profile;
  });

  return result;
}

/** Fetch surface weather + AQI (model-independent). */
function _fetchSurfaceRange(lat, lon, start, end) {
  const startStr = Utilities.formatDate(start, "UTC", "yyyy-MM-dd");
  const endStr   = Utilities.formatDate(end, "UTC", "yyyy-MM-dd");

  const urlSurf = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,cloud_cover,wind_gusts_10m&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;
  const urlAqi  = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=european_aqi&start_date=${startStr}&end_date=${endStr}&timezone=UTC`;

  const rS = JSON.parse(UrlFetchApp.fetch(urlSurf).getContentText());
  let rQ = { hourly: { european_aqi: [] } };
  try { rQ = JSON.parse(UrlFetchApp.fetch(urlAqi).getContentText()); } catch(e) {}

  const results = [];
  rS.hourly.time.forEach((tStr, idx) => {
    const t = new Date(tStr + "Z");
    if (t < start || t > end) return;
    results.push({
      time: t,
      surface: {
        temp: rS.hourly.temperature_2m[idx],
        rh: Math.max(0.1, Math.min(99.0, rS.hourly.relative_humidity_2m[idx])),
        pressure: rS.hourly.surface_pressure[idx],
        cloudCover: Math.max(0.0, Math.min(100.0, rS.hourly.cloud_cover[idx])),
        aqi: (rQ.hourly.european_aqi && rQ.hourly.european_aqi[idx]) ? rQ.hourly.european_aqi[idx] : 50,
        windGusts: (rS.hourly.wind_gusts_10m && rS.hourly.wind_gusts_10m[idx]) ? rS.hourly.wind_gusts_10m[idx] / 3.6 : 0
      }
    });
  });
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── ENSEMBLE LOGIC ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Weighted average of available model profiles.
 * perModel = { gfs: [{pressure,temp,ws},...] | null, ecmwf: ..., icon: ... }
 */
function _ensembleProfile(perModel) {
  const available = Object.entries(perModel).filter(([_, v]) => v !== null);
  if (available.length === 0) return null;

  // Normalize weights for available models
  const totalW = available.reduce((s, [name]) => s + WEIGHTS[name], 0);

  return P_LABELS.map((_, levelIdx) => {
    let tempSum = 0, wsSum = 0;
    for (const [name, profile] of available) {
      const w = WEIGHTS[name] / totalW;
      tempSum += w * profile[levelIdx].temp;
      wsSum   += w * profile[levelIdx].ws;
    }
    return {
      pressure: parseInt(P_LABELS[levelIdx]),
      temp: Math.round(tempSum * 100) / 100,
      ws:   Math.round(wsSum * 10000) / 10000
    };
  });
}

/** Extract per-model 300hPa data + compute spread. */
function _extractJetData(perModel) {
  const winds = [], temps = [];
  const out = {
    gfs_wind: 0, ecmwf_wind: 0, icon_wind: 0,
    gfs_temp: 0, ecmwf_temp: 0, icon_temp: 0,
    spread: 0, confidence: "N/A"
  };

  for (const [name, profile] of Object.entries(perModel)) {
    if (profile && profile.length >= 5) {
      const w = profile[4].ws;
      const t = profile[4].temp;
      out[`${name}_wind`] = w;
      out[`${name}_temp`] = t;
      winds.push(w);
      temps.push(t);
    }
  }

  if (winds.length > 1) {
    out.spread = Math.max(...winds) - Math.min(...winds);
    out.confidence = out.spread < 5 ? "high" : out.spread < 15 ? "moderate" : "low";
  } else if (winds.length === 1) {
    out.confidence = "single_model";
  }

  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── PHYSICS & EPHEMERIS (Unchanged from v3.1) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function _getMoonFromSensor(date) {
  const ws = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RAW_SENSOR);
  if (!ws) return { phase: 0, alt: -10, az: 0 };

  const data = ws.getDataRange().getValues();
  if (data.length < 2) return { phase: 0, alt: -10, az: 0 };

  const targetTs = date.getTime();
  let closestRow = data[1];
  let minDiff = Math.abs(new Date(data[1][0]).getTime() - targetTs);

  for (let i = 2; i < data.length; i++) {
    const ts = new Date(data[i][0]).getTime();
    const diff = Math.abs(ts - targetTs);
    if (diff < minDiff) {
      minDiff = diff;
      closestRow = data[i];
    }
  }

  if (minDiff > 2 * 3600000) {
    Logger.log(`Warning: No recent sensor data for ${date}. Min diff: ${Math.round(minDiff/60000)}m`);
  }

  return {
    alt:   parseFloat(closestRow[12]) || 0,
    az:    parseFloat(closestRow[13]) || 0,
    phase: parseFloat(closestRow[14]) || 0  // Python logger provides phase angle 0-180 (0=Full)
  };
}

function _computePhysics(profile, surface, moonPhase, moonAlt) {
  // 1. Thermodynamics (Branch 3) — Magnus-Tetens
  const a = 17.625, b = 243.04;
  const gamma = (a * surface.temp) / (b + surface.temp) + Math.log(surface.rh / 100.0);
  const dewPt = (b * gamma) / (a - gamma);
  const deltaTRad = 5.0 - (5.0 - 0.5) * (surface.cloudCover / 100.0);
  const tLensEst = surface.temp - deltaTRad;
  const deltaT = tLensEst - dewPt;

  // 2. Scattering (Branch 2) — Beer-Lambert
  const lambda_um = 0.55, p0 = 1013.25;
  const kRay = (0.00864 / Math.pow(lambda_um, 4.09)) * (surface.pressure / p0);
  const fRh = Math.pow(1.0 / (1.0 - surface.rh / 100.0), 0.5);
  const kMie = 0.02 * Math.pow(Math.max(0, surface.aqi), 0.8) * fRh;
  const kExt = kRay + kMie + 0.016;
  const xTarget_zenith = 1.0 * (surface.pressure / p0);
  // NOTE: Zenith reference only. No target object defined in Phase 1.
  // Update when target Alt is available from observation session.
  const transparency = Math.exp(-kExt * xTarget_zenith);

  // 3. Turbulence (Branch 4) — HV57 + Hypsometric
  const rGas = 8.314, muAir = 0.029, g = 9.81;
  let heights = [0], h_sum = 0;
  for (let i = 1; i < profile.length; i++) {
    let t_mean = (profile[i-1].temp + profile[i].temp) / 2 + 273.15;
    let dh = (rGas * t_mean) / (muAir * g) * Math.log(profile[i-1].pressure / profile[i].pressure);
    h_sum += dh;
    heights.push(h_sum);
  }

  const v_rms = profile[4].ws;
  const cn2_ground = 1e-14;
  let integral_cn2 = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    let h = (heights[i] + heights[i+1]) / 2;
    let dh = heights[i+1] - heights[i];
    let term1 = 0.00594 * Math.pow(v_rms/27.0, 2) * Math.pow(1e-5 * h, 10) * Math.exp(-h / 1000.0);
    let term2 = 2.7e-16 * Math.exp(-h / 1500.0);
    let term3 = cn2_ground * Math.exp(-h / 100.0);
    integral_cn2 += (term1 + term2 + term3) * dh;
  }

  let r0 = 0.185 * Math.pow(Math.pow(0.55e-6, 2) / Math.max(1e-18, integral_cn2), 0.6);
  let seeing = 0.98 * 0.55e-6 / r0 * 206265.0;

  // 4. Lunar Penalty (Branch 5) — Krisciunas-Schaefer
  let sqm = 22.0;
  if (moonAlt > 0) {
    const I0 = 1.74e-3; // lux, lunar illuminance tại Full Moon ngoài khí quyển (Krisciunas & Schaefer 1991)
    
    let z_deg = 90 - moonAlt;
    let z_rad = z_deg * Math.PI / 180;
    let xMoonRel = 1.0 / (Math.cos(z_rad) + 0.50572 * Math.pow(96.07995 - z_deg, -1.6364));
    let xMoon = xMoonRel * (surface.pressure / p0);
    
    let phase_angle = moonPhase > 180 ? 360 - moonPhase : moonPhase;
    let f_phi = Math.pow(10, -0.4 * (0.026 * phase_angle + 4e-9 * Math.pow(phase_angle, 4)));
    
    // ĐÚNG — iMoon theo Krisciunas & Schaefer (1991)
    let iMoon = I0 * f_phi * Math.pow(10, -0.4 * kExt * xMoon);
    
    // Simplified lunar penalty — no target object defined (f_rho omitted)
    // We calculate sky brightness contribution at Zenith
    let bMoon = iMoon * Math.pow(10, -0.4 * kExt * xTarget_zenith);
    
    // Convert to SQM using flux-addition logic
    // Scale factor to align lux with SQM magnitude (Full Moon ~13-14 mag/arcsec2)
    const K_CALIB = 620.0;
    let flux_dark = 1.0;
    let flux_moon = bMoon * 1e8 / K_CALIB; 
    let flux_total = flux_dark + flux_moon;
    
    sqm = 22.0 - 2.5 * Math.log10(flux_total);
    // NOTE: Simplified lunar penalty — no target object defined. 
    // Fine-tune sau khi có TSL2591 calibration data.
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
    
    if (rows.length < 2) return;
    
    const ws = _ensureSheet(SHEET_RAW_SENSOR, rows[0], "#f59e0b");
    const lastRow = ws.getLastRow();
    let startIdx = 1;
    
    if (lastRow > 1) {
      const lastImportedTs = ws.getRange(lastRow, 1).getValue().toString();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === lastImportedTs) { startIdx = i + 1; break; }
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
