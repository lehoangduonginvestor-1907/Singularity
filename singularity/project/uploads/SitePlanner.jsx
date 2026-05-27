import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Mountain, Clock, Moon, Star, Plus, X, AlertTriangle, Target } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_URL as API } from './api';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom component to handle map view changes
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function MapSection({ userLat, userLon, top5, vetoed }) {
  const [mapZoom, setMapZoom] = useState(7);
  const [mapCenter, setMapCenter] = useState([userLat, userLon]);

  const markers = useMemo(() => {
    const all = [];
    if (top5) {
      top5.forEach((s, i) => all.push({ ...s, type: 'passed', rank: i + 1 }));
    }
    if (vetoed) {
      vetoed.forEach(s => all.push({ ...s, type: 'vetoed' }));
    }
    return all;
  }, [top5, vetoed]);

  return (
    <div style={{
      height: "400px",
      width: "100%",
      borderRadius: "24px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
      marginBottom: "32px",
      position: "relative",
      zIndex: 10
    }}>
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: "100%", width: "100%", background: "#050505" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* User Location */}
        <CircleMarker 
          center={[userLat, userLon]} 
          radius={8}
          pathOptions={{ fillColor: '#ffffff', fillOpacity: 1, color: '#a78bfa', weight: 4 }}
        >
          <Popup>Vị trí của bạn</Popup>
        </CircleMarker>

        {markers.map((s, idx) => {
          const isPassed = s.type === 'passed';
          const color = isPassed ? getScoreColor(s.s_eff) : "#f87171";
          
          return (
            <CircleMarker
              key={`${s.id}-${idx}`}
              center={[s.lat, s.lon]}
              radius={isPassed ? 10 : 6}
              pathOptions={{ 
                fillColor: color, 
                fillOpacity: isPassed ? 0.8 : 0.4, 
                color: isPassed ? '#ffffff' : color, 
                weight: isPassed ? 2 : 1 
              }}
              eventHandlers={{
                click: () => {
                  setMapCenter([s.lat, s.lon]);
                  setMapZoom(12);
                }
              }}
            >
              <Popup>
                <div style={{ color: "#000", fontSize: "12px", minWidth: "120px" }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>{s.name}</strong>
                  {isPassed ? (
                    <>
                      <div style={{ color: color, fontWeight: 800 }}>Score: {s.s_eff.toFixed(1)}/10</div>
                      <div style={{ fontSize: "10px" }}>{s.dist_km}km | ~{s.time_mins}m drive</div>
                    </>
                  ) : (
                    <div style={{ color: "#f87171", fontSize: "10px" }}>VETO: {s.veto_reason}</div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map UI Overlays */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        zIndex: 1000,
        background: "rgba(5,5,5,0.8)",
        backdropFilter: "blur(8px)",
        padding: "8px 12px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        gap: "12px",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff', border: '2px solid #a78bfa' }} />
          <span>You</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00e5ff' }} />
          <span>Top Sites</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(248,113,113,0.4)' }} />
          <span>Vetoed</span>
        </div>
      </div>
    </div>
  );
}

// ── Bortle color palette (chuẩn IDA/Globe at Night) ─────────────────────────
const BORTLE_CONFIG = {
  1: { color: "#FFFFFF", bg: "rgba(255,255,255,0.12)", label: "1 — Hoàn hảo", emoji: "⚫" },
  2: { color: "#D4D4FF", bg: "rgba(180,180,255,0.15)", label: "2 — Cực tối",   emoji: "🟣" },
  3: { color: "#A0C4FF", bg: "rgba(100,180,255,0.15)", label: "3 — Nông thôn", emoji: "🔵" },
  4: { color: "#74E888", bg: "rgba(100,230,120,0.13)", label: "4 — Nông thôn+", emoji: "🟢" },
  5: { color: "#FFE066", bg: "rgba(255,220,50,0.13)",  label: "5 — Ngoại ô",   emoji: "🟡" },
  6: { color: "#FFB347", bg: "rgba(255,160,60,0.14)",  label: "6 — Ngoại ô sáng", emoji: "🟠" },
  7: { color: "#FF6B6B", bg: "rgba(255,80,80,0.14)",   label: "7 — Đô thị",    emoji: "🔴" },
  8: { color: "#FF3399", bg: "rgba(255,30,130,0.14)",  label: "8 — Đô thị sáng", emoji: "❌" },
  9: { color: "#CC0000", bg: "rgba(200,0,0,0.18)",     label: "9 — Nội thành",  emoji: "🚫" },
};

const getBortleStyle = (b) => BORTLE_CONFIG[Math.min(9, Math.max(1, b))] || BORTLE_CONFIG[5];

const getScoreColor = (s) => {
  if (s >= 7) return "#00e5ff";
  if (s >= 5) return "#34d399";
  if (s >= 3) return "#fbbf24";
  return "#f87171";
};



async function fetchSiteRanker(userLat, userLon, customSpots = []) {
  const url = `${API}/api/site-ranker?user_lat=${userLat}&user_lon=${userLon}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customSpots),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function SiteCard({ site, rank }) {
  const bortle = getBortleStyle(site.bortle_eff ?? site.bortle);
  const scoreColor = getScoreColor(site.s_eff);
  const isCustom = site._custom;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${bortle.color}30`,
        borderRadius: "20px",
        padding: "24px",
        backdropFilter: "blur(12px)",
        transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${scoreColor}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{
        position: "absolute", top: "-14px", left: "20px",
        background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}88)`,
        color: "#050505", fontWeight: 800, fontSize: "12px",
        padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px"
      }}>
        #{rank} {rank === 1 ? "PRIORITY" : rank === 2 ? "SECONDARY" : "ALTERNATE"}
      </div>

      {isCustom && (
        <div style={{
          position: "absolute", top: "-12px", right: "20px",
          background: "rgba(167,139,250,0.2)", border: "1px solid #a78bfa",
          color: "#a78bfa", fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em'
        }}>Custom Spot</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "12px", marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#ffffff", fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color={scoreColor} />
            {site.name}
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            {site.description}
          </p>
        </div>
        <div style={{
          minWidth: "64px", height: "64px", borderRadius: "50%", flexShrink: 0, marginLeft: "16px",
          border: `2px solid ${scoreColor}40`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: `${scoreColor}10`,
          boxShadow: `inset 0 0 20px ${scoreColor}20`
        }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: scoreColor, lineHeight: 1, fontFamily: 'Roboto Mono' }}>
            {site.s_eff.toFixed(1)}
          </span>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", marginTop: "2px", fontWeight: 600, letterSpacing: '0.05em' }}>SCORE</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <StatChip icon={Clock} label="Drive Time" value={`~${site.time_mins}m`} />
        <StatChip icon={Star} label="V-Model" value={`${site.v_model}/10`} color="#00e5ff" />
        <StatChip icon={Mountain} label="Elevation" value={`${site.elevation}m`} />
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: bortle.bg, border: `1px solid ${bortle.color}40`,
        borderRadius: "12px", padding: "8px 12px",
      }}>
        <span style={{ fontSize: "16px" }}>{bortle.emoji}</span>
        <span style={{ fontSize: "13px", color: bortle.color, fontWeight: 600 }}>
          Bortle {site.bortle_eff ?? site.bortle} — {getBortleStyle(site.bortle_eff ?? site.bortle).label.split("—")[1].trim()}
        </span>
        {site.bortle_eff > site.bortle && (
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>
            (moon interference)
          </span>
        )}
      </div>

      <p style={{ margin: "16px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
        <strong style={{ color: "rgba(255,255,255,0.8)" }}>Analysis: </strong>{site.reason}
      </p>
    </motion.div>
  );
}

function StatChip({ icon: Icon, label, value, color = "rgba(255,255,255,0.8)" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px",
      padding: "10px", display: "flex", flexDirection: "column", alignItems: "flex-start"
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Icon size={14} color="rgba(255,255,255,0.4)" />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 700, color, fontFamily: 'Roboto Mono' }}>{value}</div>
    </div>
  );
}

export default function SitePlanner({ userLat = 20.886355, userLon = 105.755763 }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  
  // Map control state
  const [mapCenter, setMapCenter] = useState([userLat, userLon]);
  const [mapZoom, setMapZoom] = useState(7);

  const [customSpots, setCustomSpots] = useState(() => {
    try { return JSON.parse(localStorage.getItem("singularity_custom_spots") || "[]"); }
    catch { return []; }
  });

  const runRanker = useCallback(async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      const data = await fetchSiteRanker(userLat, userLon, customSpots);
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
        // Tự động căn giữa bản đồ vào vị trí người dùng khi có kết quả
        setMapCenter([userLat, userLon]);
        setMapZoom(7);
      }
    } catch (e) { setError(e.message); } 
    finally { setLoading(false); }
  }, [userLat, userLon, customSpots]);

  const focusOnSite = (lat, lon) => {
    setMapCenter([lat, lon]);
    setMapZoom(12);
    // Cuộn lên đầu bản đồ để người dùng thấy
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div style={{ color: "#ffffff", padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: "24px", fontWeight: 800, letterSpacing: '-0.02em',
            background: "linear-gradient(135deg, #ffffff, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Navigation size={24} color="#a78bfa" />
            Observatory Site Planner
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
            Physics-first site ranking across {results?.meta?.total_evaluated ?? "78"} locations within 2000km.
          </p>
        </div>
        
        <button
          onClick={runRanker}
          disabled={loading}
          style={{
            background: loading ? "rgba(167,139,250,0.1)" : "linear-gradient(135deg, #6366f1, #a78bfa)",
            border: "none", borderRadius: "12px", color: "#fff",
            padding: "12px 28px", fontSize: "14px", fontWeight: 700,
            cursor: loading ? "wait" : "pointer", transition: "all 0.3s",
            boxShadow: loading ? 'none' : '0 8px 24px rgba(167,139,250,0.25)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
        >
          {loading ? 'Analyzing Locations...' : 'Run Site Diagnostics'}
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#f87171", fontSize: "13px", display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} /> <span>{error}</span>
        </div>
      )}

      {results && (
        <>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", alignItems: 'center' }}>
            <Moon size={18} color={results.meta.moon_illum_pct > 80 ? "#f87171" : results.meta.moon_illum_pct > 40 ? "#fbbf24" : "#34d399"} />
            <span>Moon: <strong style={{ fontFamily: 'Roboto Mono' }}>{results.meta.moon_illum_pct}%</strong></span>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
            <span>Viable Sites: <strong style={{ color: "#00e5ff", fontFamily: 'Roboto Mono' }}>{results.meta.passed}/{results.meta.total_evaluated}</strong></span>
            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Vetoed: {results.meta.vetoed}</span>
          </div>

          <MapSection 
            userLat={userLat} 
            userLon={userLon} 
            top5={results.top5} 
            vetoed={results.vetoed}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            setMapCenter={setMapCenter}
            setMapZoom={setMapZoom}
          />
        </>
      )}

      {results?.top5?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {results.top5.map((site, i) => (
            <div key={site.id} onClick={() => focusOnSite(site.lat, site.lon)} style={{ cursor: 'pointer' }}>
              <SiteCard site={site} rank={i + 1} />
            </div>
          ))}
        </div>
      )}

      {results?.top5?.length === 0 && (
        <div style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "20px", padding: "40px", textAlign: "center", marginBottom: "32px" }}>
          <Mountain size={48} color="rgba(248,113,113,0.5)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: "0 0 8px", color: "#f87171", fontSize: '18px' }}>No Viable Sites Tonight</h3>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            Weather or lunar conditions are prohibitive across all evaluated locations.<br/>Recommend postponing observation.
          </p>
        </div>
      )}

      {/* Custom Spots Toolbar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#a78bfa' }}>Custom Locations ({customSpots.length})</span>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: 'none', border: '1px solid rgba(167,139,250,0.4)', color: '#a78bfa', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showAdd ? <X size={14} /> : <Plus size={14} />} {showAdd ? 'Close' : 'Add Spot'}
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Define a private observation coordinate to include in the next diagnostic run.</p>
                <button onClick={() => setShowAdd(false)} style={{ background: '#a78bfa', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save Location (Mock)</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {customSpots.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "10px", padding: "8px 14px", fontSize: "13px" }}>
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: '11px', fontFamily: 'Roboto Mono' }}>{s.lat.toFixed(3)}, {s.lon.toFixed(3)}</span>
              <button onClick={() => {}} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: 0, marginLeft: '4px' }}><X size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
