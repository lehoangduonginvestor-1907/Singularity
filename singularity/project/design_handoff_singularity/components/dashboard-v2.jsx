/* Dashboard v2 — Hybrid style (Instrument Serif × Plus Jakarta × Roboto Mono)
   Matches Location Entry + Scanning aesthetic
   Layer 1 — primary screen after location lock */

const { useState, useEffect, useMemo, useRef } = React;

/* ── Nebula bg ─────────────────────────────────────────── */
const NebulaBg = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 1080" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
    <defs>
      <radialGradient id="hb-warm" cx="0.62" cy="0.18" r="0.55">
        <stop offset="0%"   stopColor="rgba(255,140,80,0.10)"/>
        <stop offset="50%"  stopColor="rgba(168,85,247,0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hb-cyan" cx="0.15" cy="0.55" r="0.45">
        <stop offset="0%"   stopColor="rgba(0,180,220,0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hb-violet" cx="0.88" cy="0.78" r="0.42">
        <stop offset="0%"   stopColor="rgba(168,85,247,0.10)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <filter id="hb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40"/>
      </filter>
    </defs>
    <rect width="1440" height="1080" fill="#0a0a0c"/>
    <rect width="1440" height="1080" fill="url(#hb-cyan)"/>
    <rect width="1440" height="1080" fill="url(#hb-violet)"/>
    <rect width="1440" height="1080" fill="url(#hb-warm)"/>
    {/* Soft filament */}
    <g filter="url(#hb-soft)" opacity="0.4">
      <path d="M 100 280 Q 500 240 800 320 Q 1100 400 1360 360"
        stroke="rgba(255,180,140,0.25)" strokeWidth="18" fill="none" strokeLinecap="round"/>
    </g>
    {/* Stars */}
    {Array.from({length: 140}).map((_,i) => {
      const x = (i * 137.5 + (i*i)%80) % 1440;
      const y = (i * 263 + (i*i*3)%60) % 1080;
      const r = ((i * 7) % 10) / 10 * 1.2 + 0.2;
      const op = ((i * 11) % 10) / 10 * 0.6 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op}/>;
    })}
    {[[200,160],[920,120],[1280,420],[480,720],[1100,820]].map(([x,y],i) => (
      <g key={i} opacity="0.55">
        <circle cx={x} cy={y} r="1.2" fill="#fff"/>
        <line x1={x-9} y1={y} x2={x+9} y2={y} stroke="#fff" strokeWidth="0.4"/>
        <line x1={x} y1={y-9} x2={x} y2={y+9} stroke="#fff" strokeWidth="0.4"/>
      </g>
    ))}
  </svg>
);

/* ── Card primitive ────────────────────────────────────── */
const Card = ({ children, accent = "neutral", padding = 24, style }) => {
  const accents = {
    neutral: "rgba(255,255,255,0.04)",
    cyan:    "rgba(0,240,255,0.10)",
    violet:  "rgba(168,85,247,0.10)",
    orange:  "rgba(255,107,0,0.08)",
    green:   "rgba(0,214,138,0.08)",
    red:     "rgba(255,59,92,0.08)",
  };
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      padding,
      borderRadius: 20,
      background: "linear-gradient(180deg, rgba(20,20,28,0.6), rgba(10,10,14,0.75))",
      border: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      ...style,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(320px 200px at 100% 0%, ${accents[accent]}, transparent 60%)`,
        pointerEvents: "none"
      }}/>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

/* ── Chip ──────────────────────────────────────────────── */
const Chip = ({ children, tone = "neutral", icon }) => {
  const tones = {
    neutral: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", fg: "rgba(255,255,255,0.7)" },
    cyan:    { bg: "rgba(0,240,255,0.10)",  border: "rgba(0,240,255,0.3)",    fg: "#7bf6ff" },
    violet:  { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.3)",   fg: "#c4a0fb" },
    orange:  { bg: "rgba(255,107,0,0.10)",  border: "rgba(255,107,0,0.3)",    fg: "#ff9b4d" },
    green:   { bg: "rgba(0,214,138,0.10)",  border: "rgba(0,214,138,0.3)",    fg: "#5cf2bd" },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      fontFamily: "'Roboto Mono'", fontSize: 10.5, letterSpacing: "0.14em",
      textTransform: "uppercase"
    }}>
      {icon && <Icon name={icon} size={11}/>} {children}
    </span>
  );
};

/* ── Sparkline (Hybrid) ────────────────────────────────── */
const ThinSparkline = ({ points, color = "#00f0ff", height = 28 }) => {
  const w = 200, h = height;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i ? "L" : "M"} ${i * step} ${h - ((p - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={d} stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      {points.map((p, i) => i === points.length - 1 && (
        <circle key={i} cx={i * step} cy={h - ((p - min) / range) * (h - 4) - 2} r="2" fill={color}/>
      ))}
    </svg>
  );
};

/* ── Radial gauge (Hybrid) ─────────────────────────────── */
const SkyGauge = ({ value = 7.4, max = 10, size = 220 }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 88, c = 2 * Math.PI * r;
  const dash = c * pct;
  const color = value >= 7 ? "#7bf6ff" : (value >= 4 ? "#c4a0fb" : "#ff9b4d");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 220 220">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        {/* Tick ring */}
        {Array.from({length: 40}).map((_,i) => {
          const a = (i / 40) * Math.PI * 2 - Math.PI/2;
          const x1 = 110 + Math.cos(a) * 102;
          const y1 = 110 + Math.sin(a) * 102;
          const x2 = 110 + Math.cos(a) * 108;
          const y2 = 110 + Math.sin(a) * 108;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 5 === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"} strokeWidth="1"/>;
        })}
        {/* Background track */}
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none"/>
        {/* Progress */}
        <circle cx="110" cy="110" r={r} stroke="url(#gaugeGrad)" strokeWidth="8" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 110 110)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div style={{
            fontFamily: "'Instrument Serif', serif", fontSize: 72, lineHeight: 1, color: "#fff",
            letterSpacing: "-0.02em"
          }}>{value.toFixed(1)}</div>
          <div className="t-eyebrow" style={{ marginTop: 6 }}>OF 10 · PEAK</div>
        </div>
      </div>
    </div>
  );
};

/* ── Metric tile ───────────────────────────────────────── */
const MetricTile = ({ label, icon, value, unit, sub, tone = "cyan", spark, subTone }) => {
  const tones = {
    cyan:   { glow: "rgba(0,240,255,0.4)",  fg: "#7bf6ff", accent: "cyan" },
    violet: { glow: "rgba(168,85,247,0.4)", fg: "#c4a0fb", accent: "violet" },
    orange: { glow: "rgba(255,107,0,0.4)",  fg: "#ff9b4d", accent: "orange" },
    green:  { glow: "rgba(0,214,138,0.4)",  fg: "#5cf2bd", accent: "green" },
    red:    { glow: "rgba(255,59,92,0.4)",  fg: "#ff8aa0", accent: "red" },
  };
  const t = tones[tone];
  return (
    <Card accent={t.accent} padding={22}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.05)", display: "grid", placeItems: "center", color: t.fg }}>
          <Icon name={icon} size={12}/>
        </div>
        <span className="t-eyebrow">{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 52, lineHeight: 1, color: "#fff",
          textShadow: `0 0 22px ${t.glow}`, letterSpacing: "-0.02em"
        }}>{value}</span>
        {unit && <span className="t-mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{unit}</span>}
      </div>
      {sub && (
        <div style={{ marginTop: 8, fontSize: 12.5, color: subTone || "rgba(255,255,255,0.55)" }}>
          {sub}
        </div>
      )}
      {spark && (
        <div style={{ marginTop: 12 }}>
          <ThinSparkline points={spark} color={t.fg} height={24}/>
        </div>
      )}
    </Card>
  );
};

/* ── Forecast chart ────────────────────────────────────── */
const PhysicsChart = () => {
  const w = 800, h = 280, pad = { l: 36, r: 16, t: 24, b: 32 };
  const hrs = Array.from({length: 24}, (_,i) => i);
  const score = hrs.map(h => {
    if (h < 5) return 6 + Math.sin((h+1)/4) * 1.5;
    if (h < 18) return 0;
    if (h < 20) return 2;
    if (h < 22) return 4.5;
    if (h < 24) return 7;
    return 7.5;
  });
  const benchmark = score.map(s => Math.max(0, s - 0.6 + Math.sin(s) * 0.3));
  const toX = i => pad.l + (i / 23) * (w - pad.l - pad.r);
  const toY = v => pad.t + (1 - v/10) * (h - pad.t - pad.b);
  const scorePath = score.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v)}`).join(" ");
  const fillPath = scorePath + ` L ${toX(23)} ${h-pad.b} L ${toX(0)} ${h-pad.b} Z`;
  const benchPath = benchmark.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Twilight bands */}
      <rect x={toX(5.5)} y={pad.t} width={toX(18.5)-toX(5.5)} height={h-pad.t-pad.b} fill="rgba(255,107,0,0.04)"/>

      {/* Optimal window */}
      <rect x={toX(22)} y={pad.t} width={toX(24)-toX(22)} height={h-pad.t-pad.b}
        fill="rgba(0,240,255,0.06)" stroke="rgba(0,240,255,0.25)" strokeDasharray="2 3" strokeWidth="0.5"/>
      <text x={(toX(22)+toX(24))/2} y={pad.t + 14} textAnchor="middle"
        fontSize="9.5" fill="#7bf6ff" fontFamily="Roboto Mono" letterSpacing="0.12em">OPTIMAL</text>

      {/* Grid */}
      {[0,2.5,5,7.5,10].map(g => (
        <g key={g}>
          <line x1={pad.l} x2={w-pad.r} y1={toY(g)} y2={toY(g)}
            stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
          <text x={pad.l-8} y={toY(g)+3} textAnchor="end" fontSize="9"
            fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono">{g}</text>
        </g>
      ))}
      {hrs.filter(i=>i%4===0).map(i => (
        <text key={i} x={toX(i)} y={h-pad.b+18} textAnchor="middle" fontSize="9"
          fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono">{String(i).padStart(2,"0")}:00</text>
      ))}

      {/* Benchmark (7Timer) */}
      <path d={benchPath} stroke="#a855f7" strokeWidth="1.5" fill="none"
        strokeDasharray="5 4" opacity="0.7"/>

      {/* Physics score */}
      <path d={fillPath} fill="url(#scoreFill)"/>
      <path d={scorePath} stroke="#00f0ff" strokeWidth="2" fill="none"
        style={{ filter: "drop-shadow(0 0 6px rgba(0,240,255,0.5))" }}/>

      {/* Peak marker */}
      <g transform={`translate(${toX(0)}, ${toY(7.8)})`}>
        <circle r="4" fill="#00f0ff"/>
        <circle r="9" fill="none" stroke="#00f0ff" opacity="0.4"/>
        <line x1="0" y1="-10" x2="0" y2="-26" stroke="rgba(0,240,255,0.5)"/>
        <rect x="-32" y="-50" width="64" height="22" rx="5"
          fill="rgba(10,10,16,0.95)" stroke="rgba(0,240,255,0.4)"/>
        <text x="0" y="-36" textAnchor="middle" fontSize="9" fontFamily="Roboto Mono"
          fill="rgba(255,255,255,0.5)" letterSpacing="0.08em">PEAK</text>
        <text x="0" y="-28" textAnchor="middle" fontSize="9" fontFamily="Roboto Mono"
          fill="#7bf6ff" letterSpacing="0.08em">00:30 · 7.8</text>
      </g>

      {/* Now line */}
      <line x1={toX(14.2)} x2={toX(14.2)} y1={pad.t} y2={h-pad.b}
        stroke="rgba(168,85,247,0.5)" strokeDasharray="2 3"/>
      <text x={toX(14.2)} y={pad.t+12} fontSize="9" fontFamily="Roboto Mono"
        fill="#c4a0fb">NOW 14:14</text>
    </svg>
  );
};

/* ── Hourly strip ──────────────────────────────────────── */
const HourlyStrip = () => {
  const hours = [
    {h:"18", icon:"cloud",   score: 1.2, see: "3.4", trans: "32"},
    {h:"19", icon:"cloud",   score: 2.1, see: "2.8", trans: "45"},
    {h:"20", icon:"sparkle", score: 4.0, see: "2.2", trans: "61"},
    {h:"21", icon:"sparkle", score: 5.6, see: "1.9", trans: "72"},
    {h:"22", icon:"sparkle", score: 6.8, see: "1.6", trans: "81"},
    {h:"23", icon:"sparkle", score: 7.4, see: "1.4", trans: "86", peak: true},
    {h:"00", icon:"sparkle", score: 7.8, see: "1.3", trans: "88", peak: true},
    {h:"01", icon:"sparkle", score: 7.6, see: "1.4", trans: "85"},
    {h:"02", icon:"sparkle", score: 6.9, see: "1.6", trans: "78"},
    {h:"03", icon:"moon",    score: 5.2, see: "1.9", trans: "64"},
    {h:"04", icon:"moon",    score: 3.4, see: "2.4", trans: "48"},
    {h:"05", icon:"cloud",   score: 1.8, see: "3.1", trans: "31"},
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6 }}>
      {hours.map((h,i) => (
        <div key={i} style={{
          padding: "12px 8px",
          background: h.peak ? "linear-gradient(180deg, rgba(0,240,255,0.14), rgba(0,240,255,0.04))" : "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: h.peak ? "1px solid rgba(0,240,255,0.4)" : "1px solid rgba(255,255,255,0.05)",
          textAlign: "center", position: "relative"
        }}>
          {h.peak && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: 3, background: "#00f0ff", boxShadow: "0 0 8px #00f0ff" }}/>}
          <div className="t-mono" style={{ fontSize: 11, color: h.peak ? "#7bf6ff" : "rgba(255,255,255,0.45)" }}>{h.h}:00</div>
          <div style={{ marginTop: 6, color: h.peak ? "#7bf6ff" : "rgba(255,255,255,0.5)" }}>
            <Icon name={h.icon} size={14}/>
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", marginTop: 6, lineHeight: 1 }}>{h.score.toFixed(1)}</div>
          <div style={{ marginTop: 8, height: 36, position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              height: `${(h.score/10)*100}%`,
              background: h.peak ? "linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.1))" : "linear-gradient(180deg, rgba(168,85,247,0.5), rgba(168,85,247,0.05))",
              borderRadius: 3, opacity: 0.85
            }}/>
          </div>
          <div className="t-mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{h.see}″ · {h.trans}%</div>
        </div>
      ))}
    </div>
  );
};

/* ── Top bar ───────────────────────────────────────────── */
const TopBar = ({ red, setRed }) => (
  <div style={{
    position: "sticky", top: 0, zIndex: 30,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 36px", borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(10,10,16,0.7)", backdropFilter: "blur(18px)"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <SingularityMark size={26}/>
      <div style={{ fontWeight: 600, fontSize: 14.5, color: "#fff", letterSpacing: "-0.01em" }}>Singularity</div>
      <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
      <div style={{ display: "flex", gap: 6, padding: 3, borderRadius: 999,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {["Layer 1 · Dashboard","Site Planner","Targets","Models"].map((t,i) => (
          <span key={t} style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500,
            background: i===0 ? "rgba(0,240,255,0.10)" : "transparent",
            border: i===0 ? "1px solid rgba(0,240,255,0.3)" : "1px solid transparent",
            color: i===0 ? "#7bf6ff" : "rgba(255,255,255,0.55)",
            cursor: "pointer"
          }}>{t}</span>
        ))}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", borderRadius: 999,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)"
      }}>
        <Icon name="pin" size={12}/>
        <span className="t-mono" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>22.337°N · 103.844°E</span>
        <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
        <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>UTC+7</span>
      </div>
      <Chip tone="green" icon="check">SYNCED · 02:14 UTC</Chip>
      <button style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 999, cursor: "pointer",
        background: "linear-gradient(180deg, rgba(0,240,255,0.95), rgba(0,200,220,0.85))",
        color: "#001216", border: "none",
        fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 13,
        boxShadow: "0 0 0 1px rgba(0,240,255,0.4), 0 6px 20px rgba(0,240,255,0.3)"
      }}>
        <Icon name="refresh" size={13}/> Sync
      </button>
      <div style={{ display: "inline-flex", padding: 3, borderRadius: 999,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ padding: "5px 12px", borderRadius: 999, fontFamily: "'Roboto Mono'", fontSize: 11.5,
          background: "rgba(255,255,255,0.08)", color: "#fff" }}>EN</span>
        <span style={{ padding: "5px 12px", borderRadius: 999, fontFamily: "'Roboto Mono'", fontSize: 11.5,
          color: "rgba(255,255,255,0.45)" }}>VI</span>
      </div>
      <div onClick={() => setRed(!red)} style={{
        display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
        padding: "5px 12px 5px 10px", borderRadius: 999,
        background: red ? "rgba(255,59,92,0.10)" : "rgba(255,255,255,0.03)",
        border: red ? "1px solid rgba(255,59,92,0.35)" : "1px solid rgba(255,255,255,0.06)",
        color: red ? "#ff8aa0" : "rgba(255,255,255,0.55)"
      }}>
        <Icon name="eye" size={13}/>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Red vision</span>
        <div style={{ width: 22, height: 12, borderRadius: 999,
          background: red ? "rgba(255,59,92,0.35)" : "rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ position: "absolute", top: 1, left: red ? 11 : 1, width: 10, height: 10,
            borderRadius: 999, background: red ? "#ff8aa0" : "#fff", transition: "all .2s" }}/>
        </div>
      </div>
    </div>
  </div>
);

/* ── Target spotlight panel ────────────────────────────── */
const TargetSpotlight = () => (
  <Card accent="violet" padding={26}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span className="t-eyebrow">PRIME TARGET</span>
      <Chip tone="violet" icon="star">VISIBLE</Chip>
    </div>
    <div style={{
      fontFamily: "'Instrument Serif', serif", fontSize: 48, color: "#fff",
      letterSpacing: "-0.02em", lineHeight: 1
    }}>
      M51 <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontSize: 26 }}>Whirlpool</span>
    </div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
      Sb galaxy · Canes Venatici · mag 8.4
    </div>

    {/* Transit arc */}
    <div style={{ position: "relative", height: 130, margin: "18px 0 14px" }}>
      <svg width="100%" height="130" viewBox="0 0 320 130">
        <defs>
          <linearGradient id="arc-g" x1="0" x2="1">
            <stop offset="0%"  stopColor="rgba(168,85,247,0)"/>
            <stop offset="50%" stopColor="#a855f7"/>
            <stop offset="100%" stopColor="rgba(168,85,247,0)"/>
          </linearGradient>
        </defs>
        <line x1="10" y1="110" x2="310" y2="110" stroke="rgba(255,255,255,0.1)"/>
        <text x="10" y="124" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono">SE · 20:42</text>
        <text x="155" y="124" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono" textAnchor="middle">S · 00:30</text>
        <text x="310" y="124" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono" textAnchor="end">SW · 04:18</text>
        <path d="M 10 110 Q 160 -30 310 110" stroke="url(#arc-g)" strokeWidth="1.5" fill="none" strokeDasharray="2 4"/>
        <path d="M 10 110 Q 160 -30 160 40" stroke="#a855f7" strokeWidth="2.5" fill="none"
          style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.6))" }}/>
        <circle cx="160" cy="40" r="5" fill="#a855f7"/>
        <circle cx="160" cy="40" r="10" fill="none" stroke="#a855f7" opacity="0.4"/>
        <text x="160" y="30" textAnchor="middle" fontSize="9" fill="#c4a0fb" fontFamily="Roboto Mono">ALT 72°</text>
      </svg>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="t-eyebrow" style={{ fontSize: 9.5 }}>RISE</div>
        <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>20:42</div>
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)" }}>
        <div className="t-eyebrow" style={{ fontSize: 9.5, color: "#c4a0fb" }}>TRANSIT</div>
        <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>00:30</div>
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="t-eyebrow" style={{ fontSize: 9.5 }}>SET</div>
        <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>04:18</div>
      </div>
    </div>
  </Card>
);

/* ── Progressive disclosure stubs ──────────────────────── */
const DisclosureRow = ({ icon, label, sub, count, tone = "neutral" }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px 20px", borderRadius: 14,
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer"
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: tone === "violet" ? "rgba(168,85,247,0.10)" : (tone === "orange" ? "rgba(255,107,0,0.10)" : "rgba(255,255,255,0.04)"),
      border: "1px solid rgba(255,255,255,0.05)",
      display: "grid", placeItems: "center",
      color: tone === "violet" ? "#c4a0fb" : (tone === "orange" ? "#ff9b4d" : "rgba(255,255,255,0.7)")
    }}>
      <Icon name={icon} size={16}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#fff" }}>{label}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>
    </div>
    {count && (
      <div className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginRight: 8 }}>{count}</div>
    )}
    <Icon name="chevron-down" size={16}/>
  </div>
);

/* ── MAIN DASHBOARD ────────────────────────────────────── */
const DashboardScreen = ({ red, setRed }) => {
  return (
    <div className="hybrid" style={{ minHeight: "100vh", position: "relative", color: "rgba(255,255,255,0.9)" }}>
      <NebulaBg/>
      <div style={{ position: "relative", zIndex: 1 }}>
        <TopBar red={red} setRed={setRed}/>

        <div style={{ padding: "40px 36px 80px", maxWidth: 1440, margin: "0 auto" }}>
          {/* ── Hero ────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 10 }}>TONIGHT · 27 MAY · UTC+7 · SA PA</div>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                fontSize: 64, lineHeight: 1, letterSpacing: "-0.025em",
                color: "#fff", margin: 0
              }}>
                Conditions are <span style={{ fontStyle: "italic", color: "#7bf6ff" }}>excellent</span> tonight.
              </h1>
              <div style={{ marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 15, lineHeight: 1.5, maxWidth: 720 }}>
                Window <span className="t-mono" style={{ color: "#7bf6ff" }}>22:14 → 02:48</span> ·
                seeing dips to <span className="t-mono" style={{ color: "#fff" }}>1.3″ FWHM</span> ·
                moon sets <span className="t-mono" style={{ color: "#fff" }}>04:12</span> ·
                jet stream easing over SE Asia.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Chip tone="orange" icon="moon">MOON 86%</Chip>
              <Chip tone="cyan" icon="wind">JET EASING</Chip>
              <Chip tone="violet" icon="layers">12/12 MODELS AGREE</Chip>
            </div>
          </div>

          {/* ── Metric grid ─────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, marginBottom: 20 }}>
            {/* Global Sky Score — featured */}
            <Card accent="cyan" padding={28}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="t-eyebrow">GLOBAL SKY SCORE</span>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "rgba(255,255,255,0.6)", marginTop: 4, fontStyle: "italic" }}>
                    physics-first
                  </div>
                </div>
                <Icon name="arrow-up-right" size={14} stroke={1.2}/>
              </div>
              <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 4px" }}>
                <SkyGauge value={7.4} max={10} size={220}/>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }}/>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div className="t-eyebrow" style={{ fontSize: 9.5 }}>NOW</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#fff", marginTop: 2 }}>3.2 <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ 10</span></div>
                </div>
                <div>
                  <div className="t-eyebrow" style={{ fontSize: 9.5 }}>DELTA · 4H</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#7bf6ff", marginTop: 2 }}>+4.6 ↑</div>
                </div>
              </div>
            </Card>

            {/* 4 metric tiles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14 }}>
              <MetricTile
                label="ZENITH SEEING" icon="eye" tone="cyan"
                value="1.42" unit="″ FWHM"
                sub={<>↓ 0.4″ vs 24h avg · <span style={{ color: "#5cf2bd" }}>excellent</span></>}
                spark={[3.4,3.0,2.8,2.3,2.0,1.7,1.5,1.42]}/>
              <MetricTile
                label="TRANSPARENCY" icon="sparkle" tone="violet"
                value="87" unit="%"
                sub={<>aerosol τ 0.12 · <span style={{ color: "#c4a0fb" }}>clean atmosphere</span></>}
                spark={[42,55,62,68,74,82,86,87]}/>
              <MetricTile
                label="SKY DARKNESS · SQM" icon="moon" tone="cyan"
                value="20.8" unit="mag/arcsec²"
                sub={<><span style={{ color: "#7bf6ff" }}>Bortle 4</span> · suburban-dark</>}
                spark={[18.2,18.6,19.1,19.6,20.2,20.5,20.7,20.8]}/>
              <MetricTile
                label="DEW RISK" icon="droplet" tone="green"
                value="12" unit="%"
                sub={<><span style={{ color: "#5cf2bd" }}>✓ Lens protected</span> · ΔT 4.2°C margin</>}
                spark={[8,10,9,12,14,13,12,12]}/>
            </div>
          </div>

          {/* ── Forecast + Target ────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, marginBottom: 20 }}>
            <Card padding={28}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <span className="t-eyebrow">24-HOUR PHYSICS TRACE</span>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", marginTop: 4, letterSpacing: "-0.01em" }}>
                    Tonight's <span style={{ fontStyle: "italic" }}>observable</span> window.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 16, height: 2, background: "#00f0ff" }}/>
                    <span className="t-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>SINGULARITY</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 16, height: 0, borderTop: "2px dashed #a855f7" }}/>
                    <span className="t-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>7TIMER</span>
                  </div>
                </div>
              </div>
              <PhysicsChart/>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0 16px" }}/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  {l: "PEAK · 00:30", v: "7.8 / 10",  c: "#7bf6ff", italic: "peak"},
                  {l: "MIN SEEING",   v: "1.3″",      c: "#fff",     sub: "FWHM"},
                  {l: "MAX TRANS",    v: "88%",       c: "#fff",     sub: "aerosol τ 0.10"},
                  {l: "WINDOW",       v: "4h 34m",    c: "#c4a0fb",  sub: "continuous viable"},
                ].map(s => (
                  <div key={s.l}>
                    <div className="t-eyebrow" style={{ fontSize: 9.5 }}>{s.l}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: s.c, marginTop: 4, letterSpacing: "-0.01em" }}>
                      {s.v}
                    </div>
                    {s.sub && <div className="t-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.sub}</div>}
                  </div>
                ))}
              </div>
            </Card>

            <TargetSpotlight/>
          </div>

          {/* ── Hourly ────────────────────────────────── */}
          <Card padding={24} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span className="t-eyebrow">HOURLY · 12H AHEAD</span>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", marginTop: 2 }}>
                  Minute-stepped <span style={{ fontStyle: "italic" }}>forecast</span>.
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["12H","24H","5D"].map((t,i) => (
                  <span key={t} style={{
                    padding: "6px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 500,
                    background: i===0 ? "rgba(0,240,255,0.10)" : "rgba(255,255,255,0.03)",
                    border: i===0 ? "1px solid rgba(0,240,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: i===0 ? "#7bf6ff" : "rgba(255,255,255,0.55)", cursor: "pointer"
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <HourlyStrip/>
          </Card>

          {/* ── Progressive disclosure ──────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <DisclosureRow icon="calendar" tone="violet" label="Layer 2 · 5-Day Visibility Horizon" sub="Mid-range planning · M51, M81, NGC 6960..." count="5d"/>
            <DisclosureRow icon="layers" tone="orange" label="Layer 3 · Deep Nerd Stats" sub="Cn², r₀, scattering, Krisciunas-Schaefer" count="12 fields"/>
            <DisclosureRow icon="gear" label="Gear Check · 80ED + ASI2600" sub="Sampling 1.29″/px · matched to seeing" count="3 ✓"/>
          </div>

          {/* ── Footer ──────────────────────────────── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 4px", borderTop: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ display: "flex", gap: 28, fontSize: 11, color: "rgba(255,255,255,0.35)" }} className="t-mono">
              <span>ECMWF · 02:14</span>
              <span>GFS · 02:08</span>
              <span>7TIMER · 02:00</span>
              <span>METAR · 02:13</span>
              <span>ESP32 · 02:11</span>
            </div>
            <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Singularity v1.0.0 · physics engine v3.1 · last poll 02:14 UTC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.DashboardScreen = DashboardScreen;
