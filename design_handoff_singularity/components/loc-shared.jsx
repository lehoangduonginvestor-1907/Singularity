/* Shared bits for the 3 Location Entry variations */
const { useState } = React;

// Curated preset sites for Vietnam (from codebase context)
const PRESET_SITES = [
  { name: "Sa Pa Observatory", region: "Lào Cai", lat: 22.337, lon: 103.844, score: 8.6, bortle: 2, alt: "1,650m" },
  { name: "Tam Đảo Plateau",   region: "Vĩnh Phúc", lat: 21.467, lon: 105.642, score: 6.4, bortle: 4, alt: "1,140m" },
  { name: "Mộc Châu Highland", region: "Sơn La",    lat: 20.836, lon: 104.638, score: 5.4, bortle: 5, alt: "1,050m" },
  { name: "Cúc Phương · Bãi Trống", region: "Ninh Bình", lat: 20.255, lon: 105.722, score: 4.1, bortle: 6, alt: "350m" },
  { name: "Đà Lạt Observatory", region: "Lâm Đồng",  lat: 11.945, lon: 108.479, score: 7.8, bortle: 3, alt: "1,500m" },
];

// Subtle nebula CSS background — used as a reusable element
const NebulaBg = ({ intensity = 1 }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    background:
      `radial-gradient(1200px 600px at 75% 15%, rgba(168,85,247,${0.22*intensity}), transparent 60%),` +
      `radial-gradient(900px 500px at 20% 75%, rgba(0,240,255,${0.18*intensity}), transparent 65%),` +
      `radial-gradient(700px 500px at 90% 90%, rgba(255,107,0,${0.08*intensity}), transparent 65%)`,
  }}/>
);

// Star field
const StarField = ({ density = 80 }) => (
  <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({length: density}).map((_,i) => {
      const x = (i * 137) % 1440;
      const y = (i * 263) % 900;
      const r = ((i * 7) % 10) / 10 * 1.2 + 0.3;
      const op = ((i * 13) % 10) / 10 * 0.7 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={op}/>;
    })}
    {/* Bright stars with diffraction spikes */}
    {[[260,180],[920,140],[1180,460],[420,640],[760,720]].map(([x,y],i) => (
      <g key={i} opacity="0.7">
        <circle cx={x} cy={y} r="1.5" fill="#fff"/>
        <line x1={x-8} y1={y} x2={x+8} y2={y} stroke="#fff" strokeWidth="0.4"/>
        <line x1={x} y1={y-8} x2={x} y2={y+8} stroke="#fff" strokeWidth="0.4"/>
      </g>
    ))}
  </svg>
);

// Top bar shared across variations (compact)
const ProShell = ({ children, variant = "a" }) => (
  <div className="sg-bg" style={{
    width: "100%", height: "100%", position: "relative", overflow: "hidden",
    fontFamily: "var(--f-body)", color: "var(--fg-200)"
  }}>
    {children}
  </div>
);

const LangSwitch = () => (
  <div style={{ display: "inline-flex", gap: 0, padding: 3, borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
    {["EN","VI"].map((l,i) => (
      <span key={l} style={{
        padding: "5px 12px", borderRadius: 999, fontSize: 11.5, letterSpacing: "0.06em",
        fontFamily: "var(--f-mono)",
        background: i===0 ? "rgba(255,255,255,0.08)" : "transparent",
        color: i===0 ? "#fff" : "var(--fg-400)"
      }}>{l}</span>
    ))}
  </div>
);

const RedVisionToggle = ({ on = false }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "5px 12px 5px 10px", borderRadius: 999,
    background: on ? "rgba(255,59,92,0.08)" : "rgba(255,255,255,0.03)",
    border: on ? "1px solid rgba(255,59,92,0.3)" : "1px solid rgba(255,255,255,0.06)",
    color: on ? "#ff8aa0" : "var(--fg-400)"
  }}>
    <Icon name="eye" size={13}/>
    <span style={{ fontSize: 12 }}>Red vision</span>
    <div style={{ width: 22, height: 12, borderRadius: 999, background: on ? "rgba(255,59,92,0.4)" : "rgba(255,255,255,0.1)", position: "relative" }}>
      <div style={{ position: "absolute", top: 1, left: on ? 11 : 1, width: 10, height: 10, borderRadius: 999, background: on ? "#ff8aa0" : "#fff", transition: "all .2s" }}/>
    </div>
  </div>
);

// Live status pill — shows model freshness
const StatusPill = ({ status = "live", text }) => {
  const map = {
    live: { color: "#00f0ff", bg: "rgba(0,240,255,0.08)", border: "rgba(0,240,255,0.3)" },
    pending: { color: "#ff9b4d", bg: "rgba(255,107,0,0.08)", border: "rgba(255,107,0,0.3)" },
  };
  const c = map[status];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      <span className="dot pulse" style={{ color: c.color }}/>
      <span className="t-mono" style={{ fontSize: 11, letterSpacing: "0.08em" }}>{text}</span>
    </div>
  );
};

Object.assign(window, { PRESET_SITES, NebulaBg, StarField, ProShell, LangSwitch, RedVisionToggle, StatusPill });
