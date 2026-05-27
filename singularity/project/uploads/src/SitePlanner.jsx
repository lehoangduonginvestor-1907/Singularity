import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_URL as API } from './api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* ── Icons ────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, stroke = 1.5 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    pin:          <svg {...p}><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>,
    compass:      <svg {...p}><circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z" fill="currentColor" fillOpacity="0.2"/></svg>,
    clock:        <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
    mountain:     <svg {...p}><path d="m8 3 4 8 5-5 2 4h3L12 21 2 10h3Z"/></svg>,
    moon:         <svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>,
    star:         <svg {...p}><path d="m12 2 3 7 7 .6-5.3 4.7L18 22l-6-3.6L6 22l1.4-7.7L2 9.6 9 9Z"/></svg>,
    layers:       <svg {...p}><path d="m12 3 10 5-10 5L2 8Z"/><path d="m2 13 10 5 10-5M2 18l10 5 10-5"/></svg>,
    refresh:      <svg {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>,
    plus:         <svg {...p}><path d="M12 5v14M5 12h14"/></svg>,
    x:            <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
    alert:        <svg {...p}><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.5"/></svg>,
    check:        <svg {...p}><path d="m5 13 4 4L19 7"/></svg>,
    "chevron-down": <svg {...p}><path d="m6 9 6 6 6-6"/></svg>,
    "arrow-up-right": <svg {...p}><path d="M7 17 17 7M9 7h8v8"/></svg>,
    zap:          <svg {...p}><path d="M13 2 3 14h7l-1 8 10-12h-7Z"/></svg>,
    target:       <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
    eye:          <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>,
    telescope:    <svg {...p}><path d="M3 14 17 7l3 5L6 19Zm5 0v6"/><circle cx="13" cy="20" r="1.5"/></svg>,
    "zoom-in":    <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>,
    "zoom-out":   <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/></svg>,
    filter:       <svg {...p}><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></svg>,
    globe:        <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  };
  return icons[name] || null;
};

/* ── Colors ────────────────────────────────────────────────── */
const getScoreColor = (s) => s >= 7 ? "#7bf6ff" : s >= 5 ? "#5cf2bd" : s >= 3 ? "#ff9b4d" : "#ff8aa0";
const getScoreTone = (s) => s >= 7 ? "cyan" : s >= 5 ? "green" : s >= 3 ? "orange" : "red";

const TONE_MAP = {
  cyan:    { fg: "#7bf6ff", glow: "rgba(0,240,255,0.4)",   bg: "rgba(0,240,255,0.10)",   border: "rgba(0,240,255,0.3)" },
  violet:  { fg: "#c4a0fb", glow: "rgba(168,85,247,0.4)",  bg: "rgba(168,85,247,0.10)",  border: "rgba(168,85,247,0.3)" },
  orange:  { fg: "#ff9b4d", glow: "rgba(255,107,0,0.4)",   bg: "rgba(255,107,0,0.10)",   border: "rgba(255,107,0,0.3)" },
  green:   { fg: "#5cf2bd", glow: "rgba(0,214,138,0.4)",   bg: "rgba(0,214,138,0.10)",   border: "rgba(0,214,138,0.3)" },
  red:     { fg: "#ff8aa0", glow: "rgba(255,59,92,0.4)",   bg: "rgba(255,59,92,0.10)",   border: "rgba(255,59,92,0.3)" },
  neutral: { fg: "rgba(255,255,255,0.7)", glow: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
};

/* ── Bortle Micro-bar ──────────────────────────────────────── */
const BORTLE_COLORS = [
  "#e0e0ff","#b8b8ff","#80b0ff","#60d880","#e0d040",
  "#e0a030","#e05050","#d02080","#a00000"
];

const BortleMicroBar = ({ value, size = "normal" }) => {
  const v = Math.min(9, Math.max(1, Math.round(value)));
  const h = size === "small" ? 3 : 4;
  const gap = size === "small" ? 1 : 2;
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          width: size === "small" ? 8 : 12, height: h, borderRadius: 1,
          background: i < v ? BORTLE_COLORS[i] : "rgba(255,255,255,0.06)",
          opacity: i < v ? 1 : 0.4,
          transition: "background 0.3s, opacity 0.3s",
        }} />
      ))}
    </div>
  );
};

/* ── Card (glassmorphism — matches dashboard-v2) ───────────── */
const Card = ({ children, accent = "neutral", padding = 24, style, onClick, className }) => {
  const accents = {
    neutral: "rgba(255,255,255,0.04)",   cyan: "rgba(0,240,255,0.10)",
    violet: "rgba(168,85,247,0.10)",      orange: "rgba(255,107,0,0.08)",
    green: "rgba(0,214,138,0.08)",        red: "rgba(255,59,92,0.08)",
  };
  return (
    <div onClick={onClick} className={className} style={{
      position: "relative", overflow: "hidden", padding,
      borderRadius: 20,
      background: "linear-gradient(180deg, rgba(20,20,28,0.6), rgba(10,10,14,0.75))",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(320px 200px at 100% 0%, ${accents[accent]}, transparent 60%)`,
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
};

/* ── Chip ───────────────────────────────────────────────────── */
const Chip = ({ children, tone = "neutral", icon }) => {
  const t = TONE_MAP[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.14em",
      textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      {icon && <Icon name={icon} size={11} />} {children}
    </span>
  );
};

/* ── Section Header (editorial pattern from dashboard) ──── */
const SectionHeader = ({ eyebrow, title, italicWord, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: right ? "flex-end" : "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
    <div>
      {eyebrow && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--fg-tertiary)", fontWeight: 500, marginBottom: 8,
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        margin: 0, fontFamily: "var(--font-display)", fontWeight: 400,
        fontSize: 28, letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.15,
      }}>
        {title}{italicWord && <span style={{ fontStyle: "italic", color: "var(--violet)" }}> {italicWord}</span>}.
      </h2>
      {sub && <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

/* ── Map Controller ─────────────────────────────────────────── */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

/* ── Map Section ────────────────────────────────────────────── */
function MapSection({ userLat, userLon, top5, vetoed, redVision = false }) {
  const [mapZoom, setMapZoom] = useState(7);
  const [mapCenter, setMapCenter] = useState([userLat, userLon]);

  const markers = useMemo(() => {
    const all = [];
    if (top5) top5.forEach((s, i) => all.push({ ...s, type: "passed", rank: i + 1 }));
    if (vetoed) vetoed.forEach(s => all.push({ ...s, type: "vetoed" }));
    return all;
  }, [top5, vetoed]);

  const btnStyle = {
    width: 34, height: 34, borderRadius: 9,
    background: "rgba(10,10,16,0.88)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.7)", cursor: "pointer",
    display: "grid", placeItems: "center", transition: "all 0.2s",
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Card padding={0} style={{ overflow: "hidden" }}>
        {/* Map header inside card */}
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
              background: "rgba(168,85,247,0.10)", color: "var(--violet)",
            }}>
              <Icon name="globe" size={14} />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "var(--fg-tertiary)",
              }}>FIELD MAP</div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", marginTop: 1,
              }}>
                Candidate <span style={{ fontStyle: "italic" }}>coverage</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Chip tone="violet" icon="pin">
              {userLat.toFixed(3)}°N · {userLon.toFixed(3)}°E
            </Chip>
          </div>
        </div>

        {/* Leaflet map */}
        <div style={{ height: 400, margin: "16px 0 0", position: "relative" }}>
          <MapContainer
            center={mapCenter} zoom={mapZoom}
            style={{ height: "100%", width: "100%", background: "#0a0a0c" }}
            zoomControl={false} attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapController center={mapCenter} zoom={mapZoom} />

            <CircleMarker center={[userLat, userLon]} radius={7}
              pathOptions={{ fillColor: "#ffffff", fillOpacity: 1, color: "var(--violet)", weight: 3 }}>
              <Popup><div style={{ color: "#fff", fontFamily: "var(--font-body)", fontSize: 12 }}>
                <strong>Your position</strong><br />{userLat.toFixed(4)}°N, {userLon.toFixed(4)}°E
              </div></Popup>
            </CircleMarker>

            {markers.map((s, idx) => {
              const isPassed = s.type === "passed";
              const color = redVision
                ? (isPassed ? "#ff333d" : "rgba(180,10,20,0.3)")
                : (isPassed ? getScoreColor(s.s_eff) : "rgba(255,138,160,0.5)");
              const borderCol = redVision
                ? (isPassed ? "rgba(255,255,255,0.7)" : "rgba(180,10,20,0.4)")
                : (isPassed ? "rgba(255,255,255,0.6)" : color);
              return (
                <CircleMarker key={`${s.id}-${idx}`} center={[s.lat, s.lon]}
                  radius={isPassed ? 9 : 5}
                  pathOptions={{
                    fillColor: color, fillOpacity: redVision ? (isPassed ? 0.9 : 0.2) : (isPassed ? 0.85 : 0.35),
                    color: borderCol,
                    weight: isPassed ? 2 : 1,
                  }}
                  eventHandlers={{ click: () => { setMapCenter([s.lat, s.lon]); setMapZoom(12); } }}>
                  <Popup>
                    <div style={{ color: "#fff", fontFamily: "var(--font-body)", fontSize: 12, minWidth: 140 }}>
                      <strong style={{ display: "block", marginBottom: 4, fontSize: 13, fontFamily: "var(--font-display)" }}>{s.name}</strong>
                      {isPassed ? (
                        <>
                          <div style={{ color: "var(--cyan)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>Score: {s.s_eff.toFixed(1)}/10</div>
                          <div style={{ fontSize: 10, color: "var(--fg-secondary)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{s.dist_km}km · ~{s.time_mins}min</div>
                        </>
                      ) : (
                        <div style={{ color: "var(--red)", fontSize: 11, fontFamily: "var(--font-mono)" }}>VETOED: {s.veto_reason}</div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Zoom controls */}
          <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, display: "flex", flexDirection: "column", gap: 4 }}>
            <button style={btnStyle} onClick={() => setMapZoom(z => Math.min(18, z + 1))}><Icon name="zoom-in" size={15} /></button>
            <button style={btnStyle} onClick={() => setMapZoom(z => Math.max(3, z - 1))}><Icon name="zoom-out" size={15} /></button>
          </div>

          {/* Legend */}
          <div style={{
            position: "absolute", bottom: 12, left: 12, zIndex: 1000,
            display: "flex", gap: 14, alignItems: "center",
            background: "rgba(10,10,16,0.88)", backdropFilter: "blur(12px)",
            padding: "7px 14px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--fg-secondary)",
          }}>
            {[
              { color: "#fff", border: "2px solid var(--violet)", label: "YOU" },
              { color: "var(--cyan)", label: "VIABLE" },
              { color: "rgba(255,138,160,0.4)", label: "VETOED" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, border: l.border || "none" }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Site Card ──────────────────────────────────────────────── */
function SiteCard({ site, rank }) {
  const bortleVal = site.bortle_eff ?? site.bortle;
  const scoreColor = getScoreColor(site.s_eff);
  const scoreTone = getScoreTone(site.s_eff);
  const t = TONE_MAP[scoreTone];
  const isCustom = site._custom;

  const metrics = [
    { icon: "clock",    label: "DRIVE",   value: `${site.time_mins}m`,   tone: "neutral" },
    { icon: "eye",      label: "V-MODEL", value: `${site.v_model}`,      tone: "cyan" },
    { icon: "mountain", label: "ELEV",    value: `${site.elevation}m`,   tone: "neutral" },
    { icon: "compass",  label: "DIST",    value: `${site.dist_km}km`,    tone: "neutral" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card accent={scoreTone} padding={0} style={{
        cursor: "default",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s",
      }}>
        <div style={{ padding: "24px 28px" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Rank + badges */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", borderRadius: 999,
                  background: `${scoreColor}18`, border: `1px solid ${scoreColor}40`,
                  fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: scoreColor, fontWeight: 600,
                }}>
                  #{rank} {rank === 1 ? "PRIORITY" : rank === 2 ? "SECONDARY" : "ALT"}
                </span>
                {isCustom && <Chip tone="violet">CUSTOM</Chip>}
              </div>

              {/* Name */}
              <h3 style={{
                margin: 0, fontFamily: "var(--font-display)", fontWeight: 400,
                fontSize: 30, letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.1,
              }}>
                {site.name}
              </h3>
              {site.description && (
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--fg-tertiary)", lineHeight: 1.5 }}>
                  {site.description}
                </p>
              )}
            </div>

            {/* Score gauge */}
            <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="44" cy="44" r="36" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 36 * (site.s_eff / 10)} ${2 * Math.PI * 36}`}
                  strokeLinecap="round" transform="rotate(-90 44 44)"
                  style={{ filter: `drop-shadow(0 0 4px ${t.glow})`, transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center",
              }}>
                <div>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: 28, color: "#fff", lineHeight: 1,
                    textShadow: `0 0 16px ${t.glow}`,
                  }}>{site.s_eff.toFixed(1)}</span>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--fg-tertiary)",
                    letterSpacing: "0.14em", marginTop: 1,
                  }}>OF 10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "20px 0 14px" }}>
            {metrics.map(m => {
              const mt = TONE_MAP[m.tone];
              return (
                <div key={m.label} style={{
                  padding: "10px 12px", borderRadius: 12,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <span style={{ color: mt.fg, opacity: 0.7 }}><Icon name={m.icon} size={11} /></span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
                      textTransform: "uppercase", color: "var(--fg-tertiary)", fontWeight: 500,
                    }}>{m.label}</span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
                    color: m.tone === "cyan" ? "var(--cyan)" : "var(--fg-secondary)",
                  }}>{m.value}</div>
                </div>
              );
            })}
          </div>

          {/* Bortle bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "10px 14px", borderRadius: 12,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "var(--fg-secondary)", fontWeight: 500,
            }}>BORTLE {bortleVal}</span>
            <BortleMicroBar value={bortleVal} />
            {site.bortle_eff > site.bortle && (
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--orange)",
                marginLeft: "auto", letterSpacing: "0.08em",
              }}>+{site.bortle_eff - site.bortle} LUNAR</span>
            )}
          </div>

          {/* Analysis */}
          {site.reason && (
            <div style={{
              marginTop: 14, paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.04)",
              fontSize: 12.5, color: "var(--fg-secondary)", lineHeight: 1.6,
            }}>
              <span style={{
                color: "var(--fg-tertiary)", fontFamily: "var(--font-mono)",
                fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase",
              }}>ANALYSIS </span>
              {site.reason}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/* ── Vetoed Sites Row (disclosure pattern from dashboard) ── */
function VetoedRow({ vetoed }) {
  const [open, setOpen] = useState(false);
  if (!vetoed?.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "14px 20px", borderRadius: 14, cursor: "pointer",
          background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: "rgba(255,59,92,0.10)", border: "1px solid rgba(255,59,92,0.2)",
          display: "grid", placeItems: "center", color: "var(--red)",
        }}>
          <Icon name="x" size={14} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff" }}>
            Vetoed <span style={{ fontStyle: "italic" }}>sites</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 2 }}>
            Sites rejected by physics filters
          </div>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--red)",
          background: "rgba(255,59,92,0.10)", padding: "3px 10px", borderRadius: 999,
        }}>{vetoed.length}</span>
        <div style={{
          color: "var(--fg-secondary)",
          transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s",
        }}>
          <Icon name="chevron-down" size={16} />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "12px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
              {vetoed.map((s, i) => (
                <div key={s.id || i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-tertiary)",
                    letterSpacing: "0.1em", minWidth: 22,
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{
                    fontFamily: "var(--font-display)", fontSize: 16, color: "var(--fg-secondary)",
                    flex: 1,
                  }}>{s.name}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--red)",
                    letterSpacing: "0.06em", maxWidth: 280,
                  }}>{s.veto_reason}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-tertiary)",
                  }}>{s.dist_km}km</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <Card accent="red" padding={48} style={{ textAlign: "center" }}>
      <div style={{ color: "rgba(255,138,160,0.4)", marginBottom: 16 }}>
        <Icon name="alert" size={48} />
      </div>
      <h3 style={{
        margin: "0 0 8px", fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 28, color: "#fff",
      }}>
        No viable sites <span style={{ fontStyle: "italic", color: "var(--red)" }}>tonight</span>.
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: "var(--fg-secondary)", maxWidth: 420, marginInline: "auto" }}>
        Weather or lunar conditions are prohibitive across all evaluated locations. Recommend postponing observation.
      </p>
    </Card>
  );
}

/* ── Fetch ───────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SitePlanner({ userLat = 20.886355, userLon = 105.755763, redVision = false }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLat, setAddLat] = useState("");
  const [addLon, setAddLon] = useState("");

  const [customSpots, setCustomSpots] = useState(() => {
    try { return JSON.parse(localStorage.getItem("singularity_custom_spots") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("singularity_custom_spots", JSON.stringify(customSpots));
  }, [customSpots]);

  const runRanker = useCallback(async () => {
    setLoading(true); setError(null); setResults(null);
    try {
      const data = await fetchSiteRanker(userLat, userLon, customSpots);
      if (data.error) setError(data.error);
      else setResults(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [userLat, userLon, customSpots]);

  useEffect(() => {
    runRanker();
  }, [runRanker]);

  const addCustomSpot = () => {
    const lat = parseFloat(addLat), lon = parseFloat(addLon);
    if (!addName.trim() || isNaN(lat) || isNaN(lon)) return;
    setCustomSpots(prev => [...prev, {
      id: `custom-${Date.now()}`, name: addName.trim(), lat, lon, _custom: true,
    }]);
    setAddName(""); setAddLat(""); setAddLon(""); setShowAdd(false);
  };

  const removeCustomSpot = (id) => {
    setCustomSpots(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="relative" style={{ color: "#fff", position: "relative", zIndex: 10 }}>
      {/* Dynamic inline styles for premium dark popups & micro-elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium dark glassmorphism popups overrides */
        .leaflet-popup-content-wrapper {
          background: rgba(10, 12, 18, 0.94) !important;
          backdrop-filter: blur(16px) saturate(130%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(130%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
          color: #ffffff !important;
          border-radius: 14px !important;
        }
        .leaflet-popup-tip {
          background: rgba(10, 12, 18, 0.94) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-popup-content {
          margin: 14px 18px !important;
          font-family: var(--font-body) !important;
          line-height: 1.5 !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 16px !important;
          padding: 8px 10px 0 0 !important;
          transition: color 0.2s !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--red) !important;
        }
        
        /* Tactical input enhancements */
        .sp-input {
          background: rgba(0, 0, 0, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 10px !important;
          color: #fff !important;
          font-family: var(--font-mono) !important;
          font-size: 13px !important;
          padding: 10px 14px !important;
          outline: none !important;
          transition: border-color 0.25s, box-shadow 0.25s !important;
        }
        .sp-input:focus {
          border-color: rgba(0, 240, 255, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.12) !important;
        }
        
        /* Hifi diagnostics button */
        .sp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 999px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          background: linear-gradient(180deg, rgba(0, 240, 255, 0.95), rgba(0, 200, 220, 0.85));
          color: #001216;
          box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.4), 0 6px 20px rgba(0, 240, 255, 0.3);
          transition: transform 0.15s ease, box-shadow 0.25s ease, background 0.2s ease;
        }
        .sp-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(0, 240, 255, 0.6), 0 10px 30px rgba(0, 240, 255, 0.45);
        }
        .sp-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
      ` }} />

      {/* Volumetric Nebula Background Glows */}
      <div style={{
        position: "absolute",
        top: "-15%",
        left: "-25%",
        width: "800px",
        height: "800px",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
        zIndex: 1,
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "-15%",
        width: "700px",
        height: "700px",
        background: "radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 70%)",
        filter: "blur(50px)",
        zIndex: 1,
        pointerEvents: "none"
      }} />

      {/* ── Hero header ──────────────────────────────── */}
      <div style={{ marginBottom: 32, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "5px 12px", borderRadius: 999,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--violet)", boxShadow: "0 0 8px var(--violet)" }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                color: "var(--fg-secondary)", letterSpacing: "0.16em",
              }}>SITE PLANNER</span>
            </div>
            <h1 style={{
              margin: 0, fontFamily: "var(--font-display)", fontWeight: 400,
              fontSize: 46, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1,
            }}>
              Find the <span style={{ fontStyle: "italic", color: "var(--violet)" }}>darkest</span> sky.
            </h1>
            <p style={{
              margin: "14px 0 0", fontSize: 15, color: "var(--fg-secondary)", lineHeight: 1.5, maxWidth: 560,
            }}>
              Physics-first ranking across{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>
                {results?.meta?.total_evaluated ?? "78"}
              </span>{" "}
              candidate sites within 2000 km of your position.
            </p>
          </div>

          <button
            onClick={runRanker} disabled={loading}
            className="sp-btn-primary"
            style={{
              // Loading fallback styled inline to maintain transition smoothness
              ...(loading ? {
                background: "rgba(168,85,247,0.10)",
                color: "var(--violet)",
                boxShadow: "none",
                cursor: "wait",
              } : {})
            }}
          >
            <Icon name={loading ? "refresh" : "target"} size={16} />
            {loading ? "Analyzing locations..." : "Run Site Diagnostics"}
          </button>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card accent="red" padding={14} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--red)", fontSize: 13 }}>
                  <Icon name="alert" size={16} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{error}</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Results meta chips ───────────────────────── */}
      {results && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 20, position: "relative", zIndex: 10 }}
        >
          <Chip tone={results.meta.moon_illum_pct > 60 ? "orange" : "green"} icon="moon">
            MOON {results.meta.moon_illum_pct}%
          </Chip>
          <Chip tone="cyan" icon="check">
            VIABLE {results.meta.passed}/{results.meta.total_evaluated}
          </Chip>
          <Chip tone="red" icon="x">
            VETOED {results.meta.vetoed}
          </Chip>
          {results.meta.sun_alt != null && (
            <Chip tone="neutral">
              SUN ALT {results.meta.sun_alt.toFixed(1)}°
            </Chip>
          )}
        </motion.div>
      )}

      {/* ── Map ──────────────────────────────────────── */}
      {results && (
        <div style={{ position: "relative", zIndex: 10 }}>
          <MapSection
            userLat={userLat} userLon={userLon}
            top5={results.top5} vetoed={results.vetoed}
            redVision={redVision}
          />
        </div>
      )}

      {/* ── Ranked Sites ─────────────────────────────── */}
      {results?.top5?.length > 0 && (
        <div style={{ marginBottom: 24, position: "relative", zIndex: 10 }}>
          <SectionHeader
            eyebrow={`RANKED SITES · TOP ${results.top5.length}`}
            title="Best observation"
            italicWord="sites"
            sub="Ranked by physics score — seeing, transparency, light pollution, lunar penalty."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.top5.map((site, i) => (
              <SiteCard key={site.id} site={site} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {results?.top5?.length === 0 && (
        <div style={{ marginBottom: 32, position: "relative", zIndex: 10 }}><EmptyState /></div>
      )}

      {/* ── Vetoed sites (disclosure) ────────────────── */}
      {results && <div style={{ position: "relative", zIndex: 10 }}><VetoedRow vetoed={results.vetoed} /></div>}

      {/* ── Custom Locations ──────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
              background: "rgba(168,85,247,0.10)", color: "var(--violet)",
            }}>
              <Icon name="pin" size={13} />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "var(--fg-tertiary)",
              }}>CUSTOM LOCATIONS</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", marginTop: 1 }}>
                Private <span style={{ fontStyle: "italic" }}>spots</span>
              </div>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--violet)",
              background: "rgba(168,85,247,0.10)", padding: "2px 8px", borderRadius: 999, marginLeft: 4,
            }}>{customSpots.length}</span>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 999, cursor: "pointer",
              background: showAdd ? "rgba(255,59,92,0.08)" : "rgba(168,85,247,0.08)",
              border: showAdd ? "1px solid rgba(255,59,92,0.3)" : "1px solid rgba(168,85,247,0.3)",
              color: showAdd ? "var(--red)" : "var(--violet)",
              fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            <Icon name={showAdd ? "x" : "plus"} size={13} />
            {showAdd ? "Cancel" : "Add spot"}
          </button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
              <Card accent="violet" padding={20} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 160px" }}>
                    <label style={{
                      display: "block", fontFamily: "var(--font-mono)",
                      fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--fg-tertiary)", marginBottom: 6,
                    }}>NAME</label>
                    <input value={addName} onChange={e => setAddName(e.target.value)}
                      placeholder="My dark site" className="sp-input" style={{ width: "100%" }} />
                  </div>
                  <div style={{ flex: "0 0 110px" }}>
                    <label style={{
                      display: "block", fontFamily: "var(--font-mono)",
                      fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--fg-tertiary)", marginBottom: 6,
                    }}>LAT</label>
                    <input value={addLat} onChange={e => setAddLat(e.target.value)}
                      placeholder="21.034" className="sp-input" style={{ width: "100%" }} />
                  </div>
                  <div style={{ flex: "0 0 110px" }}>
                    <label style={{
                      display: "block", fontFamily: "var(--font-mono)",
                      fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--fg-tertiary)", marginBottom: 6,
                    }}>LON</label>
                    <input value={addLon} onChange={e => setAddLon(e.target.value)}
                      placeholder="105.820" className="sp-input" style={{ width: "100%" }} />
                  </div>
                  <button onClick={addCustomSpot} style={{
                    padding: "10px 18px", borderRadius: 999, cursor: "pointer",
                    background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.4)",
                    color: "var(--violet)", fontFamily: "var(--font-body)",
                    fontSize: 12.5, fontWeight: 600, transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Icon name="check" size={13} /> Save
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {customSpots.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {customSpots.map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 999,
                background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                fontSize: 12, transition: "background 0.2s",
              }}>
                <span style={{ color: "var(--violet)" }}><Icon name="pin" size={12} /></span>
                <span style={{ color: "#fff", fontWeight: 500, fontFamily: "var(--font-body)" }}>{s.name}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-tertiary)",
                }}>{s.lat.toFixed(3)}, {s.lon.toFixed(3)}</span>
                <button
                  onClick={() => removeCustomSpot(s.id)}
                  style={{
                    background: "none", border: "none", color: "var(--red)",
                    cursor: "pointer", padding: 0, display: "grid", placeItems: "center",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer attribution ────────────────────────── */}
      {results && (
        <div style={{
          marginTop: 32, paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--fg-tertiary)", letterSpacing: "0.06em",
          position: "relative", zIndex: 10
        }}>
          <div style={{ display: "flex", gap: 20 }}>
            <span>RADIUS 2000KM</span>
            <span>MODELS: SEEING + BORTLE + LUNAR + ELEV</span>
          </div>
          <span>SINGULARITY SITE PLANNER · v1.0</span>
        </div>
      )}
    </div>
  );
}
