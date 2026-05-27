import os
import re
import csv
from datetime import datetime, time

# Define paths
PICKERING_DIR = "D:/Github/Interstellar/Pickering"
MASTER_CSV = "D:/Github/Interstellar/interstellar_master_v5.csv"
OUTPUT_CSV = "D:/Github/Interstellar/Pickering/pickering_matched_dataset.csv"

def parse_session_file(filepath):
    """
    Parses a session markdown file to extract date, time window, and ground truth labels.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract date
    date_match = re.search(r"Ngày:\s*([\d/]+)", content)
    if not date_match:
        # Try different format
        date_match = re.search(r"Ngày:\s*([\d-]+)", content)
    
    if not date_match:
        print(f"[-] Could not parse date from {filepath}")
        return None
    
    date_str = date_match.group(1).strip()
    # Normalize date to YYYY-MM-DD
    try:
        dt = datetime.strptime(date_str, "%d/%m/%Y")
    except ValueError:
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            print(f"[-] Could not parse date format: {date_str}")
            return None
            
    date_iso = dt.strftime("%Y-%m-%d")
    
    # Extract time window
    time_match = re.search(r"Thời gian\s*(?:\(UTC\+7\))?:\s*([\d:]+)\s*[-→]\s*([\d:]+)", content)
    if time_match:
        start_time_str = time_match.group(1).strip()
        end_time_str = time_match.group(2).strip()
    else:
        # Single time point
        single_time_match = re.search(r"Thời gian\s*(?:\(UTC\+7\))?:\s*([\d:]+)", content)
        if single_time_match:
            start_time_str = single_time_match.group(1).strip()
            end_time_str = start_time_str
        else:
            # Fallback
            start_time_str = "00:00"
            end_time_str = "23:59"
            
    # Parse times
    try:
        t_start = datetime.strptime(start_time_str, "%H:%M").time()
    except ValueError:
        t_start = time(0, 0)
        
    try:
        t_end = datetime.strptime(end_time_str, "%H:%M").time()
    except ValueError:
        t_end = time(23, 59)
        
    # Extract Pickering median
    pickering_match = re.search(r"Median Pickering:\s*(\d+)", content)
    pickering = int(pickering_match.group(1).strip()) if pickering_match else None
    
    # Extract FWHM label
    fwhm_match = re.search(r"label_fwhm(?: cho XGBoost)?:\s*([\d.]+)", content)
    fwhm = float(fwhm_match.group(1).strip()) if fwhm_match else None
    
    return {
        "filename": os.path.basename(filepath),
        "date": date_iso,
        "start_time": t_start,
        "end_time": t_end,
        "pickering": pickering,
        "label_fwhm": fwhm
    }

def robust_parse_datetime(ts_str):
    ts_str = ts_str.strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%m/%d/%Y %H:%M:%S", "%m/%d/%Y %H:%M", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y %H:%M"):
        try:
            return datetime.strptime(ts_str, fmt)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(ts_str)
    except ValueError:
        return None

def main():
    # 1. Parse all session files
    sessions = []
    for file in os.listdir(PICKERING_DIR):
        if file.startswith("FWHM Session") and file.endswith(".md"):
            filepath = os.path.join(PICKERING_DIR, file)
            sess = parse_session_file(filepath)
            if sess:
                sessions.append(sess)
                print(f"[+] Loaded session: {sess['filename']} ({sess['date']} {sess['start_time']} - {sess['end_time']}), Pickering: {sess['pickering']}, FWHM: {sess['label_fwhm']}")
                
    if not sessions:
        print("[-] No Pickering session files found!")
        return
        
    # 2. Parse master CSV and match rows
    matched_rows = []
    print(f"\n[+] Reading master CSV: {MASTER_CSV}")
    with open(MASTER_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        
        # Dynamic index lookup
        header_lower = [h.strip().lower() for h in header]
        
        def find_index(names, default):
            for name in names:
                if name.lower() in header_lower:
                    return header_lower.index(name.lower())
            return default
            
        idx_ts = find_index(['timestamp', 'time'], 0)
        idx_esp_t = find_index(['esp_t'], 1)
        idx_esp_hum = find_index(['esp_hum'], 2)
        idx_esp_p = find_index(['esp_press', 'esp_p'], 3)
        idx_norm_vis = find_index(['esp_normvis', 'esp_norm'], 4)
        idx_delta_t = find_index(['delta_t'], 8)
        idx_std_vis = find_index(['std_normvis_10m', 'std_vis'], 9)
        idx_nwp_t = find_index(['nwp_temp'], 11)
        idx_nwp_h = find_index(['nwp_hum'], 12)
        idx_nwp_c = find_index(['nwp_cloud'], 13)
        idx_nwp_w = find_index(['nwp_wind'], 14)
        idx_moon_alt = find_index(['moon_alt'], 16)
        idx_moon_phase = find_index(['moon_phase'], 18)
        
        max_idx = max(idx_ts, idx_esp_t, idx_esp_hum, idx_esp_p, idx_norm_vis, idx_delta_t, idx_std_vis, idx_nwp_t, idx_nwp_h, idx_nwp_c, idx_nwp_w, idx_moon_alt, idx_moon_phase)
        
        for idx, row in enumerate(reader):
            if len(row) <= max_idx:
                continue
                
            ts = robust_parse_datetime(row[idx_ts])
            if ts is None:
                continue
                
            row_date = ts.strftime("%Y-%m-%d")
            row_time = ts.time()
            
            # Match against sessions
            for s in sessions:
                if s['date'] == row_date:
                    # Check if row time falls within session time window
                    is_match = False
                    if s['start_time'] <= s['end_time']:
                        is_match = (s['start_time'] <= row_time <= s['end_time'])
                    else:
                        # Overnight window
                        is_match = (row_time >= s['start_time'] or row_time <= s['end_time'])
                        
                    if is_match:
                        matched_rows.append({
                            "session": s['filename'],
                            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                            "pickering_label": s['pickering'],
                            "fwhm_label": s['label_fwhm'],
                            "esp_t": float(row[idx_esp_t]) if row[idx_esp_t].strip() else None,
                            "esp_hum": float(row[idx_esp_hum]) if row[idx_esp_hum].strip() else None,
                            "esp_press": float(row[idx_esp_p]) if row[idx_esp_p].strip() else None,
                            "esp_normvis": float(row[idx_norm_vis]) if row[idx_norm_vis].strip() else None,
                            "delta_t": float(row[idx_delta_t]) if row[idx_delta_t].strip() else None,
                            "std_normvis_10m": float(row[idx_std_vis]) if row[idx_std_vis].strip() and row[idx_std_vis] != 'NaN' else None,
                            "nwp_temp": float(row[idx_nwp_t]) if row[idx_nwp_t].strip() else None,
                            "nwp_hum": float(row[idx_nwp_h]) if row[idx_nwp_h].strip() else None,
                            "nwp_cloud": float(row[idx_nwp_c]) if row[idx_nwp_c].strip() else None,
                            "nwp_wind": float(row[idx_nwp_w]) if row[idx_nwp_w].strip() else None,
                            "moon_alt": float(row[idx_moon_alt]) if row[idx_moon_alt].strip() else None,
                            "moon_phase": float(row[idx_moon_phase]) if row[idx_moon_phase].strip() else None
                        })
                        
        # Fallback manual telemetry for sessions during PC data gaps
        MANUAL_TELEMETRY_FALLBACK = {
            "FWHM Session 4.md": {
                "esp_t": 30.0, # Estimated ambient temperature
                "esp_hum": 70.0,
                "esp_press": 1008.0,
                "esp_normvis": 49.0,
                "delta_t": 5.5,
                "std_normvis_10m": 4.5, # Estimated σVis
                "nwp_temp": 30.0,
                "nwp_hum": 70.0,
                "nwp_cloud": 0.0,  # Clear sky (Milky Way core photographed)
                "nwp_wind": 8.0,
                "moon_alt": 30.0,
                "moon_phase": 0.63
            },
            "FWHM Session 5.md": {
                "esp_t": 29.5,
                "esp_hum": 75.0, # RH ~75%
                "esp_press": 1002.0,
                "esp_normvis": 56.0,
                "delta_t": 4.59,
                "std_normvis_10m": 9.8, # σVis ~9.8
                "nwp_temp": 29.5,
                "nwp_hum": 75.0,
                "nwp_cloud": 10.0,  # Light clouds/stable seeing
                "nwp_wind": 6.0,
                "moon_alt": 37.5, # ~35-40
                "moon_phase": 0.63
            }
        }
        
        # Add manual fallbacks if no matches were found in CSV
        for s in sessions:
            sess_matches = [r for r in matched_rows if r["session"] == s["filename"]]
            if len(sess_matches) == 0 and s["filename"] in MANUAL_TELEMETRY_FALLBACK:
                fb = MANUAL_TELEMETRY_FALLBACK[s["filename"]]
                matched_rows.append({
                    "session": s['filename'],
                    "timestamp": s['date'] + " 00:00:00",
                    "pickering_label": s['pickering'],
                    "fwhm_label": s['label_fwhm'],
                    **fb
                })
                print(f"[+] Added manual telemetry fallback for {s['filename']}")

    print(f"\n[+] Matched {len(matched_rows)} telemetry records with Pickering sessions.")
    
    if not matched_rows:
        print("[-] No records matched between sessions and master CSV.")
        return
        
    # 3. Write output CSV
    fieldnames = [
        "session", "timestamp", "pickering_label", "fwhm_label", 
        "esp_t", "esp_hum", "esp_press", "esp_normvis", "delta_t", 
        "std_normvis_10m", "nwp_temp", "nwp_hum", "nwp_cloud", "nwp_wind", 
        "moon_alt", "moon_phase"
    ]
    
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(matched_rows)
        
    print(f"[+] Clean dataset written to: {OUTPUT_CSV}")
    
    # 4. Print summary per session
    print("\nMATCH SUMMARY PER SESSION:")
    for s in sessions:
        sess_matches = [r for r in matched_rows if r["session"] == s["filename"]]
        print(f"  {s['filename']}: {len(sess_matches)} matches")

if __name__ == "__main__":
    main()
