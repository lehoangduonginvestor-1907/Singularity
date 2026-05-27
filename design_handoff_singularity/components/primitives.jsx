/* Shared primitives for Project Singularity screens */
const { useState, useEffect, useRef, useMemo } = React;

// ── Logo mark ────────────────────────────────────────────
const SingularityMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <radialGradient id="sgCore" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
        <stop offset="40%" stopColor="#00f0ff" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="sgRing" x1="0" x2="1">
        <stop offset="0%" stopColor="#00f0ff"/>
        <stop offset="100%" stopColor="#a855f7"/>
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" stroke="url(#sgRing)" strokeWidth="1" opacity="0.5"/>
    <ellipse cx="16" cy="16" rx="14" ry="5" stroke="url(#sgRing)" strokeWidth="1" opacity="0.7" transform="rotate(-20 16 16)"/>
    <circle cx="16" cy="16" r="4" fill="url(#sgCore)"/>
  </svg>
);

// ── Icon set (tiny inline SVGs) ─────────────────────────
const Icon = ({ name, size = 16, stroke = 1.5 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "globe": return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>);
    case "eye": return (<svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "sparkle": return (<svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>);
    case "moon": return (<svg {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>);
    case "droplet": return (<svg {...props}><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/></svg>);
    case "target": return (<svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>);
    case "pin": return (<svg {...props}><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></svg>);
    case "calendar": return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>);
    case "clock": return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "gear": return (<svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>);
    case "telescope": return (<svg {...props}><path d="M3 14 17 7l3 5L6 19Zm5 0v6"/><circle cx="13" cy="20" r="1.5"/></svg>);
    case "arrow-right": return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>);
    case "arrow-up-right": return (<svg {...props}><path d="M7 17 17 7M9 7h8v8"/></svg>);
    case "chevron-down": return (<svg {...props}><path d="m6 9 6 6 6-6"/></svg>);
    case "search": return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);
    case "lock": return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>);
    case "thermometer": return (<svg {...props}><path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0Z"/></svg>);
    case "wind": return (<svg {...props}><path d="M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h9"/></svg>);
    case "cloud": return (<svg {...props}><path d="M7 18a5 5 0 1 1 1-9.9 6 6 0 0 1 11.7 1.9A4 4 0 0 1 19 18Z"/></svg>);
    case "alert": return (<svg {...props}><path d="M12 3 2 21h20Z"/><path d="M12 10v5M12 18v.5"/></svg>);
    case "check": return (<svg {...props}><path d="m5 13 4 4L19 7"/></svg>);
    case "layers": return (<svg {...props}><path d="m12 3 10 5-10 5L2 8Z"/><path d="m2 13 10 5 10-5M2 18l10 5 10-5"/></svg>);
    case "play": return (<svg {...props}><path d="M6 4v16l14-8Z" fill="currentColor"/></svg>);
    case "share": return (<svg {...props}><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m8.5 10.5 7-3.5M8.5 13.5l7 3.5"/></svg>);
    case "filter": return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></svg>);
    case "ruler": return (<svg {...props}><path d="m3 17 14-14 4 4L7 21Z"/><path d="m7 13 2 2M11 9l2 2M15 5l2 2"/></svg>);
    case "zap": return (<svg {...props}><path d="M13 2 3 14h7l-1 8 10-12h-7Z"/></svg>);
    case "star": return (<svg {...props}><path d="m12 2 3 7 7 .6-5.3 4.7L18 22l-6-3.6L6 22l1.4-7.7L2 9.6 9 9Z"/></svg>);
    case "compass": return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z" fill="currentColor" fillOpacity="0.2"/></svg>);
    case "refresh": return (<svg {...props}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>);
    case "menu": return (<svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>);
    default: return null;
  }
};

// ── Metric tile ─────────────────────────────────────────
const MetricTile = ({ label, icon, value, unit, sub, tone = "cyan", chart, big = false }) => {
  const toneMap = {
    cyan:   { glow: "rgba(0,240,255,0.45)",  fg: "#7bf6ff", soft: "rgba(0,240,255,0.08)" },
    violet: { glow: "rgba(168,85,247,0.45)", fg: "#c4a0fb", soft: "rgba(168,85,247,0.08)" },
    orange: { glow: "rgba(255,107,0,0.45)",  fg: "#ff9b4d", soft: "rgba(255,107,0,0.08)" },
    green:  { glow: "rgba(0,214,138,0.45)",  fg: "#5cf2bd", soft: "rgba(0,214,138,0.08)" },
    red:    { glow: "rgba(255,59,92,0.45)",  fg: "#ff8aa0", soft: "rgba(255,59,92,0.08)" },
  };
  const t = toneMap[tone];
  return (
    <div className="frame" style={{ padding: big ? 28 : 22, position: "relative", overflow: "hidden", minHeight: big ? 220 : 170 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(400px 200px at 110% -20%, ${t.soft}, transparent 60%)`, pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: t.soft, display: "grid", placeItems: "center", color: t.fg }}>
            <Icon name={icon} size={14} />
          </div>
          <span className="t-eyebrow">{label}</span>
        </div>
        <Icon name="arrow-up-right" size={14} stroke={1.2} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="h-display" style={{ fontSize: big ? 72 : 56, color: "#fff", textShadow: `0 0 28px ${t.glow}` }}>{value}</span>
        {unit && <span className="t-mono" style={{ fontSize: 13, color: "var(--fg-400)" }}>{unit}</span>}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--fg-400)" }}>{sub}</div>}
      {chart}
    </div>
  );
};

// ── Sparkline ───────────────────────────────────────────
const Sparkline = ({ points, color = "#00f0ff", height = 38, fill = true }) => {
  const w = 200, h = height;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i ? "L" : "M"} ${i * step} ${h - ((p - min) / range) * (h - 4) - 2}`).join(" ");
  const dFill = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sl-${color}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={dFill} fill={`url(#sl-${color})`} />}
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ── Section header ──────────────────────────────────────
const SectionHeader = ({ kicker, title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
    <div>
      {kicker && <div className="t-eyebrow" style={{ marginBottom: 8 }}>{kicker}</div>}
      <div className="h-title" style={{ fontSize: 28, color: "#fff" }}>{title}</div>
      {sub && <div style={{ marginTop: 6, color: "var(--fg-400)", fontSize: 14 }}>{sub}</div>}
    </div>
    {right}
  </div>
);

// ── Radial gauge ────────────────────────────────────────
const RadialGauge = ({ value = 7.2, max = 10, size = 220, color = "#00f0ff", label = "SKY SCORE" }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 88, c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 220 220">
        <defs>
          <linearGradient id="gaugeG" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
          <filter id="gaugeGlow"><feGaussianBlur stdDeviation="3"/></filter>
        </defs>
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none"/>
        <circle cx="110" cy="110" r={r} stroke="url(#gaugeG)" strokeWidth="10" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 110 110)" filter="url(#gaugeGlow)"/>
        <circle cx="110" cy="110" r={r} stroke="url(#gaugeG)" strokeWidth="2" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 110 110)"/>
        {/* tick marks */}
        {Array.from({length: 40}).map((_,i) => {
          const a = (i / 40) * Math.PI * 2 - Math.PI/2;
          const x1 = 110 + Math.cos(a) * 100;
          const y1 = 110 + Math.sin(a) * 100;
          const x2 = 110 + Math.cos(a) * 104;
          const y2 = 110 + Math.sin(a) * 104;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="h-display" style={{ fontSize: 64, color: "#fff", textShadow: "0 0 30px rgba(0,240,255,0.5)" }}>{value.toFixed(1)}</div>
          <div className="t-eyebrow" style={{ marginTop: 4 }}>{label}</div>
        </div>
      </div>
    </div>
  );
};

// ── Scan line decoration ────────────────────────────────
const ScanLine = ({ color = "rgba(0,240,255,0.15)" }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `repeating-linear-gradient(0deg, transparent 0, transparent 3px, ${color} 3px, ${color} 4px)`, opacity: 0.35, mixBlendMode: "overlay" }} />
);

Object.assign(window, { SingularityMark, Icon, MetricTile, Sparkline, SectionHeader, RadialGauge, ScanLine });
