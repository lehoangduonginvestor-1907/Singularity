import { useState, useCallback } from "react";

// ── Bortle color palette (chuẩn IDA/Globe at Night) ─────────────────────────
const BORTLE_CONFIG = {
  1: { color: "#FFFFFF", bg: "rgba(255,255,255,0.12)", label: "1 — Hoàn hảo", emoji: "⚫" },
  2: { color: "#D4D4FF", bg: "rgba(180,180,255,0.15)", label: "2 — Cực tối",   emoji: "🟣" },
  3: { color: "#A0C4FF", bg: "rgba(100,180,255,0.15)", label: "3 — Nông thôn", emoji: "🔵" },
  4: { color: "#74E888", bg: "rgba(100,230,120,0.13)", label: "4 — Nông thôn+","emoji": "🟢" },
  5: { color: "#FFE066", bg: "rgba(255,220,50,0.13)",  label: "5 — Ngoại ô",   emoji: "🟡" },
  6: { color: "#FFB347", bg: "rgba(255,160,60,0.14)",  label: "6 — Ngoại ô sáng", emoji: "🟠" },
  7: { color: "#FF6B6B", bg: "rgba(255,80,80,0.14)",   label: "7 — Đô thị",    emoji: "🔴" },
  8: { color: "#FF3399", bg: "rgba(255,30,130,0.14)",  label: "8 — Đô thị sáng", emoji: "❌" },
  9: { color: "#CC0000", bg: "rgba(200,0,0,0.18)",     label: "9 — Nội thành",  emoji: "🚫" },
};

const getBortleStyle = (b) => BORTLE_CONFIG[Math.min(9, Math.max(1, b))] || BORTLE_CONFIG[5];

// ── Score → color ─────────────────────────────────────────────────────────────
const getScoreColor = (s) => {
  if (s >= 7) return "#00e5ff";
  if (s >= 5) return "#74E888";
  if (s >= 3) return "#FFE066";
  return "#FF6B6B";
};

// ── API helper ────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function fetchSiteRanker(userLat, userLon, customSpots = []) {
  const url = `${API}/api/site-ranker?user_lat=${userLat}&user_lon=${userLon}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(customSpots),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════════════════

function SiteCard({ site, rank }) {
  const bortle = getBortleStyle(site.bortle_eff ?? site.bortle);
  const scoreColor = getScoreColor(site.s_eff);
  const isCustom = site._custom;

  return (
    <div style={{
      position: "relative",
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${bortle.color}30`,
      borderRadius: "16px",
      padding: "20px",
      backdropFilter: "blur(12px)",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${scoreColor}22`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Rank badge */}
      <div style={{
        position: "absolute", top: "-12px", left: "16px",
        background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}88)`,
        color: "#0f1117", fontWeight: 800, fontSize: "13px",
        padding: "3px 10px", borderRadius: "20px",
      }}>
        #{rank} {rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : ""}
      </div>

      {/* Custom badge */}
      {isCustom && (
        <div style={{
          position: "absolute", top: "-12px", right: "16px",
          background: "rgba(167,139,250,0.25)", border: "1px solid #a78bfa",
          color: "#a78bfa", fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
        }}>✦ Điểm của bạn</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "6px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "15px", color: "#e2e8f0", fontWeight: 700 }}>
            {site.name}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>
            {site.description}
          </p>
        </div>
        {/* S_eff score ring */}
        <div style={{
          minWidth: "58px", height: "58px", borderRadius: "50%", flexShrink: 0, marginLeft: "12px",
          border: `3px solid ${scoreColor}`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: `${scoreColor}0f`,
        }}>
          <span style={{ fontSize: "17px", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {site.s_eff.toFixed(1)}
          </span>
          <span style={{ fontSize: "9px", color: "#64748b", marginTop: "1px" }}>S_eff</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "14px"
      }}>
        <StatChip icon="🕐" label="Lái xe" value={`~${site.time_mins} phút`} />
        <StatChip icon="📡" label="V-model" value={`${site.v_model}/10`} color="#00e5ff" />
        <StatChip icon="⛰️" label="Cao độ" value={`${site.elevation}m`} />
      </div>

      {/* Bortle badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px", marginTop: "12px",
        background: bortle.bg, border: `1px solid ${bortle.color}40`,
        borderRadius: "8px", padding: "6px 10px",
      }}>
        <span style={{ fontSize: "14px" }}>{bortle.emoji}</span>
        <span style={{ fontSize: "12px", color: bortle.color, fontWeight: 600 }}>
          Bortle {site.bortle_eff ?? site.bortle} — {getBortleStyle(site.bortle_eff ?? site.bortle).label.split("—")[1].trim()}
        </span>
        {site.bortle_eff > site.bortle && (
          <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "auto" }}>
            (trăng nâng từ {site.bortle})
          </span>
        )}
      </div>

      {/* Reason */}
      <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#64748b", lineHeight: 1.5 }}>
        💡 {site.reason}
      </p>
    </div>
  );
}

function StatChip({ icon, label, value, color = "#94a3b8" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: "8px",
      padding: "6px 8px", textAlign: "center",
    }}>
      <div style={{ fontSize: "13px" }}>{icon}</div>
      <div style={{ fontSize: "10px", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "12px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function AddSpotForm({ onAdd }) {
  const [form, setForm] = useState({ name: "", lat: "", lon: "", bortle: "5", elevation: "100" });
  const [error, setError] = useState("");

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const lat = parseFloat(form.lat), lon = parseFloat(form.lon);
    if (!form.name.trim()) return setError("Vui lòng nhập tên.");
    if (isNaN(lat) || lat < -90 || lat > 90) return setError("Vĩ độ không hợp lệ.");
    if (isNaN(lon) || lon < -180 || lon > 180) return setError("Kinh độ không hợp lệ.");
    setError("");
    onAdd({
      id: `custom-${Date.now()}`, name: form.name.trim(),
      lat, lon,
      bortle: parseInt(form.bortle) || 5,
      elevation: parseInt(form.elevation) || 100,
      description: "Điểm quan sát tùy chỉnh",
      _custom: true,
    });
    setForm({ name: "", lat: "", lon: "", bortle: "5", elevation: "100" });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px", color: "#e2e8f0", padding: "8px 10px", fontSize: "13px",
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{
      background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)",
      borderRadius: "16px", padding: "20px",
    }}>
      <h4 style={{ margin: "0 0 14px", color: "#a78bfa", fontSize: "14px", fontWeight: 700 }}>
        ✦ Thêm điểm quan sát bí mật
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "block" }}>Tên địa điểm</label>
          <input style={inputStyle} placeholder="VD: Sân thượng nhà ông Năm..." value={form.name} onChange={e => handle("name", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "block" }}>Vĩ độ</label>
          <input style={inputStyle} placeholder="20.886..." value={form.lat} onChange={e => handle("lat", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "block" }}>Kinh độ</label>
          <input style={inputStyle} placeholder="105.755..." value={form.lon} onChange={e => handle("lon", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div>
          <label style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "block" }}>Bortle ước tính (1–9)</label>
          <input style={inputStyle} type="number" min="1" max="9" value={form.bortle} onChange={e => handle("bortle", e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "block" }}>Độ cao (m)</label>
          <input style={inputStyle} type="number" min="0" value={form.elevation} onChange={e => handle("elevation", e.target.value)} />
        </div>
      </div>
      {error && <p style={{ color: "#FF6B6B", fontSize: "12px", margin: "0 0 8px" }}>⚠ {error}</p>}
      <button onClick={submit} style={{
        background: "linear-gradient(135deg, #a78bfa, #7c3aed)", border: "none",
        borderRadius: "8px", color: "white", padding: "9px 20px", fontSize: "13px",
        fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
      onMouseLeave={e => e.currentTarget.style.opacity = 1}
      >
        + Thêm vào danh sách
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════════

export default function SitePlanner({ userLat = 20.886355, userLon = 105.755763 }) {
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [customSpots, setCustomSpots] = useState(() => {
    try { return JSON.parse(localStorage.getItem("interstellar_custom_spots") || "[]"); }
    catch { return []; }
  });

  const addCustomSpot = (spot) => {
    const updated = [...customSpots, spot];
    setCustomSpots(updated);
    localStorage.setItem("interstellar_custom_spots", JSON.stringify(updated));
  };

  const removeCustomSpot = (id) => {
    const updated = customSpots.filter(s => s.id !== id);
    setCustomSpots(updated);
    localStorage.setItem("interstellar_custom_spots", JSON.stringify(updated));
  };

  const runRanker = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await fetchSiteRanker(userLat, userLon, customSpots);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userLat, userLon, customSpots]);

  const moonIllum = results?.meta?.moon_illum_pct;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#e2e8f0", padding: "0" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{
          margin: 0, fontSize: "22px", fontWeight: 800,
          background: "linear-gradient(135deg, #00e5ff, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          🗺 Site Planner
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b" }}>
          Physics-first ranker — chấm điểm thực chiến cho {results?.meta?.total_evaluated ?? "36"} địa điểm trong 200km
        </p>
      </div>

      {/* Moon info bar (if results) */}
      {results && (
        <div style={{
          display: "flex", gap: "16px", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px",
        }}>
          <span>🌕 Trăng: <b style={{ color: moonIllum > 80 ? "#FF6B6B" : moonIllum > 40 ? "#FFE066" : "#74E888" }}>{moonIllum}%</b></span>
          <span>✅ Đạt điều kiện: <b style={{ color: "#00e5ff" }}>{results.meta.passed}/{results.meta.total_evaluated}</b></span>
          <span>❌ Bị veto: <b style={{ color: "#94a3b8" }}>{results.meta.vetoed}</b></span>
          <span style={{ marginLeft: "auto", color: "#64748b" }}>
            Góc pha trăng: {results.meta.moon_phase_deg}°
          </span>
        </div>
      )}

      {/* Run button */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
        <button
          onClick={runRanker}
          disabled={loading}
          style={{
            background: loading
              ? "rgba(0,229,255,0.1)"
              : "linear-gradient(135deg, #00e5ff22, #00e5ff44)",
            border: "1px solid #00e5ff66",
            borderRadius: "10px", color: loading ? "#64748b" : "#00e5ff",
            padding: "10px 24px", fontSize: "14px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading
            ? "⏳ Đang phân tích (~30 giây)..."
            : "🚀 Tìm địa điểm tốt nhất tối nay"}
        </button>
        {customSpots.length > 0 && (
          <span style={{ fontSize: "12px", color: "#a78bfa" }}>
            + {customSpots.length} điểm của bạn
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)",
          borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#FF6B6B", fontSize: "13px"
        }}>
          ⚠ Lỗi: {error}. Hãy đảm bảo backend đang chạy.
        </div>
      )}

      {/* Top 5 Bento Grid */}
      {results?.top5?.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: "#94a3b8", fontWeight: 600 }}>
            ⭐ Top {results.top5.length} địa điểm tối nay
          </h3>
          {/* First card: full width */}
          {results.top5[0] && (
            <div style={{ marginBottom: "12px" }}>
              <SiteCard site={results.top5[0]} rank={1} />
            </div>
          )}
          {/* Cards 2-5: 2-col grid */}
          {results.top5.length > 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {results.top5.slice(1).map((site, i) => (
                <SiteCard key={site.id} site={site} rank={i + 2} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {results?.top5?.length === 0 && (
        <div style={{
          background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🌧</div>
          <h3 style={{ margin: "0 0 8px", color: "#FF6B6B" }}>Không có địa điểm đạt điều kiện tối nay</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Thời tiết hoặc trăng không thuận lợi cho tất cả địa điểm trong khu vực.
            Thử lại vào đêm khác.
          </p>
        </div>
      )}

      {/* Add custom spot */}
      <AddSpotForm onAdd={addCustomSpot} />

      {/* Custom spots list */}
      {customSpots.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b" }}>
            Điểm đã lưu ({customSpots.length}):
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {customSpots.map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
                borderRadius: "8px", padding: "5px 10px", fontSize: "12px",
              }}>
                <span style={{ color: "#a78bfa" }}>✦ {s.name}</span>
                <span style={{ color: "#64748b" }}>{s.lat.toFixed(3)}, {s.lon.toFixed(3)}</span>
                <button
                  onClick={() => removeCustomSpot(s.id)}
                  style={{ background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", fontSize: "12px", padding: 0 }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
