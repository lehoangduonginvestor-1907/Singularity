/* Variation B — "Mission Control"
   Tactical operator HUD. Full-bleed world map with active observations.
   Density + live data. Feels like an operator workstation. */

const WorldMap = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="terra" cx="0.4" cy="0.4" r="0.8">
        <stop offset="0%" stopColor="rgba(20,30,50,0.6)"/>
        <stop offset="100%" stopColor="rgba(2,4,8,0.95)"/>
      </radialGradient>
      <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.07)"/>
      </pattern>
    </defs>
    <rect width="1440" height="900" fill="url(#terra)"/>

    {/* Latitude lines (curved Mercator-style) */}
    {[150, 280, 410, 540, 670].map(y => (
      <path key={y} d={`M 0 ${y} Q 720 ${y + (y<450?10:-10)} 1440 ${y}`}
        stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 5" fill="none"/>
    ))}
    {/* Longitude lines */}
    {[180, 360, 540, 720, 900, 1080, 1260].map(x => (
      <line key={x} x1={x} y1="100" x2={x} y2="780"
        stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="3 5"/>
    ))}

    {/* Stylized continents — abstract land masses */}
    <g fill="url(#dots)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5">
      {/* N America */}
      <path d="M 120 250 Q 200 220 280 240 L 320 320 Q 280 380 200 400 L 140 380 Q 110 320 120 250 Z"/>
      {/* S America */}
      <path d="M 300 430 Q 340 420 360 480 L 350 600 Q 320 640 290 620 L 280 520 Z"/>
      {/* Europe */}
      <path d="M 660 230 Q 720 220 760 250 L 740 310 Q 700 320 670 300 Z"/>
      {/* Africa */}
      <path d="M 700 340 Q 760 340 800 400 L 790 540 Q 750 600 720 580 L 700 480 Q 690 400 700 340 Z"/>
      {/* Asia */}
      <path d="M 820 200 Q 1000 190 1180 230 L 1240 300 Q 1180 380 1080 400 L 950 380 Q 850 340 820 280 Z"/>
      {/* SE Asia + Vietnam */}
      <path d="M 1080 410 Q 1130 420 1140 460 L 1130 510 Q 1100 500 1090 470 Z"/>
      {/* Australia */}
      <path d="M 1180 560 Q 1280 550 1320 600 L 1300 640 Q 1240 660 1200 640 Z"/>
    </g>

    {/* Day/night terminator */}
    <ellipse cx="500" cy="450" rx="500" ry="500" fill="rgba(255,107,0,0.04)" stroke="rgba(255,107,0,0.15)" strokeWidth="1" strokeDasharray="4 6"/>
    <ellipse cx="1000" cy="450" rx="500" ry="500" fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.15)" strokeWidth="1" strokeDasharray="4 6"/>

    {/* Observation pins (worldwide) */}
    {[
      // Active green
      {x: 1120, y: 442, color: "#00f0ff", glow: "rgba(0,240,255,0.5)", label: "HÀ NỘI", active: true},
      {x: 1100, y: 480, color: "#5cf2bd", glow: "rgba(0,214,138,0.4)", small: true},
      {x: 1135, y: 460, color: "#5cf2bd", glow: "rgba(0,214,138,0.4)", small: true},
      {x: 1080, y: 200, color: "#5cf2bd", glow: "rgba(0,214,138,0.4)", small: true},
      {x: 980, y: 280, color: "#5cf2bd", glow: "rgba(0,214,138,0.4)", small: true},
      {x: 1230, y: 560, color: "#5cf2bd", glow: "rgba(0,214,138,0.4)", small: true, label: "SIDING SPRING"},
      // Marginal violet
      {x: 720, y: 260, color: "#a855f7", glow: "rgba(168,85,247,0.4)", small: true, label: "LA PALMA"},
      {x: 320, y: 280, color: "#a855f7", glow: "rgba(168,85,247,0.4)", small: true},
      {x: 230, y: 350, color: "#a855f7", glow: "rgba(168,85,247,0.4)", small: true, label: "KITT PEAK"},
      // Vetoed orange
      {x: 300, y: 480, color: "#ff6b00", glow: "rgba(255,107,0,0.4)", small: true, label: "ATACAMA · weather hold"},
      {x: 1140, y: 280, color: "#ff6b00", glow: "rgba(255,107,0,0.4)", small: true},
    ].map((p,i) => (
      <g key={i}>
        {p.active && <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={p.color} opacity="0.3" className="pulse"/>}
        <circle cx={p.x} cy={p.y} r={p.small ? 4 : 7} fill={p.color} style={{filter: `drop-shadow(0 0 8px ${p.glow})`}}/>
        {p.label && (
          <g>
            <text x={p.x + 14} y={p.y + 4} fontSize="9.5" fill="rgba(255,255,255,0.7)" fontFamily="JetBrains Mono" letterSpacing="0.08em">{p.label}</text>
          </g>
        )}
      </g>
    ))}

    {/* Connecting arcs for live sync */}
    <path d="M 1120 442 Q 1300 200 1230 560" stroke="rgba(0,240,255,0.2)" strokeWidth="0.8" strokeDasharray="2 4" fill="none"/>
    <path d="M 1120 442 Q 900 100 720 260" stroke="rgba(0,240,255,0.15)" strokeWidth="0.8" strokeDasharray="2 4" fill="none"/>
  </svg>
);

const LocB = () => {
  return (
    <ProShell>
      <WorldMap/>

      {/* Top status bar */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,6,8,0.5)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SingularityMark size={26}/>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 14, color: "#fff" }}>Singularity</div>
          <span style={{ color: "var(--fg-500)" }}>·</span>
          <span className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-400)", letterSpacing: "0.16em" }}>MISSION CONTROL</span>
        </div>

        {/* Center: live status strip */}
        <div style={{ display: "flex", gap: 28, fontFamily: "var(--f-mono)", fontSize: 11.5 }}>
          {[
            { l: "UTC",        v: "02:14:38", c: "#fff" },
            { l: "MOON",       v: "86% ↘",    c: "#ff9b4d" },
            { l: "VIABLE",     v: "1,243 / 2,008", c: "#7bf6ff" },
            { l: "OBSERVING",  v: "189 live",    c: "#5cf2bd" },
            { l: "MODELS",     v: "12 / 12",     c: "#c4a0fb" },
          ].map(s => (
            <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--fg-500)" }}>{s.l}</span>
              <span style={{ color: s.c, marginTop: 2 }}>{s.v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <LangSwitch/>
          <RedVisionToggle/>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "440px 1fr 320px", gap: 24, padding: "36px 36px 0" }}>
        {/* Left — console */}
        <div className="frame glass-strong" style={{ padding: 28, position: "relative", overflow: "hidden", backdropFilter: "blur(18px)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(400px 200px at 0% 0%, rgba(0,240,255,0.10), transparent 60%)"}}/>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span className="t-eyebrow">> OBSERVER CONSOLE</span>
            <StatusPill text="READY"/>
          </div>

          <div className="h-display" style={{ fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 6 }}>
            Lock your site.
          </div>
          <div style={{ fontSize: 13.5, color: "var(--fg-400)", marginBottom: 24, lineHeight: 1.5 }}>
            Any coordinate on Earth. Singularity will compute the full physics stack within 12 ms p95.
          </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", padding: 3, borderRadius: 10, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
            {[
              { l: "Place",   icon: "search", active: true },
              { l: "Coords",  icon: "compass" },
              { l: "GPS",     icon: "pin" },
            ].map(t => (
              <div key={t.l} style={{
                flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6,
                padding: "8px 10px", borderRadius: 7,
                background: t.active ? "linear-gradient(180deg, rgba(0,240,255,0.16), rgba(0,240,255,0.04))" : "transparent",
                border: t.active ? "1px solid rgba(0,240,255,0.25)" : "1px solid transparent",
                color: t.active ? "#7bf6ff" : "var(--fg-400)",
                fontSize: 12.5
              }}>
                <Icon name={t.icon} size={12}/> {t.l}
              </div>
            ))}
          </div>

          {/* Big input */}
          <div style={{
            background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,240,255,0.2)",
            borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 0 0 4px rgba(0,240,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03)"
          }}>
            <span className="t-mono" style={{ color: "#7bf6ff", fontSize: 16 }}>{">"}</span>
            <input style={{
              flex: 1, padding: "4px 0", background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 15, fontFamily: "var(--f-mono)", letterSpacing: "0.04em"
            }} defaultValue="22.337, 103.844" />
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)", padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>LAT, LON</span>
          </div>

          {/* Inline parse */}
          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="check" size={13}/>
            <div style={{ flex: 1, fontSize: 12.5, color: "var(--fg-200)" }}>
              <span className="t-mono" style={{ color: "#7bf6ff" }}>22.337°N · 103.844°E</span>
              <span style={{ color: "var(--fg-400)", marginLeft: 8 }}>Sa Pa, Lào Cai · Vietnam · 1,650m · UTC+7</span>
            </div>
          </div>

          {/* Pre-lock readouts */}
          <div className="divider" style={{ margin: "20px 0 16px" }}/>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>PRE-LOCK ESTIMATE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
            {[
              { l: "BORTLE", v: "2",     c: "#7bf6ff" },
              { l: "ELEV",   v: "1,650m", c: "#fff" },
              { l: "TZ",     v: "UTC+7", c: "#fff" },
              { l: "SCORE",  v: "8.6",   c: "#5cf2bd" },
            ].map(s => (
              <div key={s.l} style={{ padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8 }}>
                <div className="t-eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
                <div className="h-display" style={{ fontSize: 18, color: s.c, marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Lock button */}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 14 }}>
            <Icon name="lock" size={14}/> Lock site · run engine
            <span className="t-mono" style={{ marginLeft: "auto", fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.2)", color: "rgba(0,30,40,0.7)" }}>↵</span>
          </button>

          {/* Recent locks */}
          <div className="divider" style={{ margin: "20px 0 14px" }}/>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>RECENT LOCKS</div>
          {[
            { name: "Tam Đảo", coord: "21.467, 105.642", t: "yesterday · 22:14" },
            { name: "Cúc Phương · Bãi Trống", coord: "20.255, 105.722", t: "3 days ago" },
          ].map(r => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 12 }}>
              <div>
                <div style={{ color: "#fff" }}>{r.name}</div>
                <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)" }}>{r.coord}</div>
              </div>
              <span className="t-mono" style={{ color: "var(--fg-400)", fontSize: 11 }}>{r.t}</span>
            </div>
          ))}
        </div>

        {/* Center — map overlay info */}
        <div style={{ position: "relative", minHeight: 660 }}>
          {/* Cursor crosshair on Sa Pa */}
          <div style={{ position: "absolute", left: "50%", top: "20%", width: 60, height: 60, transform: "translate(-50%,-50%)" }}>
            <svg width="60" height="60">
              <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(0,240,255,0.4)" strokeDasharray="2 3"/>
              <circle cx="30" cy="30" r="6" fill="#00f0ff" style={{filter:"drop-shadow(0 0 12px #00f0ff)"}}/>
              <line x1="30" y1="0" x2="30" y2="20" stroke="rgba(0,240,255,0.4)"/>
              <line x1="30" y1="40" x2="30" y2="60" stroke="rgba(0,240,255,0.4)"/>
              <line x1="0" y1="30" x2="20" y2="30" stroke="rgba(0,240,255,0.4)"/>
              <line x1="40" y1="30" x2="60" y2="30" stroke="rgba(0,240,255,0.4)"/>
            </svg>
          </div>
          <div style={{ position: "absolute", left: "calc(50% + 40px)", top: "calc(20% - 6px)" }} className="glass-strong glass">
            <div style={{ padding: "10px 14px", minWidth: 200 }}>
              <div className="t-eyebrow">SELECTED · SA PA</div>
              <div className="h-title" style={{ fontSize: 18, color: "#fff", marginTop: 4 }}>Mt. Aurora Ridge</div>
              <div style={{ fontSize: 11.5, color: "var(--fg-400)", marginTop: 4 }}>1,650 m · Bortle 2</div>
              <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.06)" }}/>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
                <span style={{ color: "var(--fg-400)" }}>Score tonight</span>
                <span className="t-mono" style={{ color: "#7bf6ff", fontSize: 14 }}>8.6 / 10</span>
              </div>
            </div>
          </div>

          {/* Map controls */}
          <div style={{ position: "absolute", right: 16, top: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {["search","layers","filter","compass"].map(i => (
              <div key={i} className="glass-strong glass" style={{ width: 38, height: 38, display: "grid", placeItems: "center" }}>
                <Icon name={i} size={14}/>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ position: "absolute", left: 16, bottom: 16, display: "flex", gap: 8 }}>
            {[
              {c: "#5cf2bd", l: "OBSERVING · 189"},
              {c: "#a855f7", l: "MARGINAL · 312"},
              {c: "#ff6b00", l: "VETOED · 765"},
            ].map(l => (
              <div key={l.l} className="glass" style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: l.c, boxShadow: `0 0 8px ${l.c}`}}/>
                <span className="t-mono" style={{ fontSize: 10 }}>{l.l}</span>
              </div>
            ))}
          </div>

          {/* Search radius indicator */}
          <div style={{ position: "absolute", right: 16, bottom: 16 }} className="glass-strong glass">
            <div style={{ padding: "8px 12px" }}>
              <div className="t-eyebrow">SEARCH RADIUS</div>
              <div className="t-mono" style={{ fontSize: 13, color: "#fff", marginTop: 4 }}>2,000 km</div>
            </div>
          </div>
        </div>

        {/* Right — Tonight at a glance */}
        <div className="frame glass-strong" style={{ padding: 22, position: "relative", overflow: "hidden", backdropFilter: "blur(18px)" }}>
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>TONIGHT · GLOBAL</div>
          <div className="h-display" style={{ fontSize: 28, color: "#fff", marginBottom: 14, lineHeight: 1.05 }}>
            <span style={{ color: "#7bf6ff" }}>62%</span> of sites viable
          </div>

          {[
            { l: "MEDIAN SEEING", v: "1.6″",  s: "FWHM @ zenith",   c: "#fff" },
            { l: "MEDIAN SQM",    v: "20.4",  s: "mag/arcsec²",     c: "#fff" },
            { l: "PEAK WINDOW",   v: "23:30 → 02:48", s: "UTC+7",   c: "#7bf6ff" },
            { l: "MOON",          v: "86% · sets 04:12", s: "waxing gibbous", c: "#ff9b4d" },
            { l: "JET STREAM",    v: "easing",  s: "−14% over SE Asia", c: "#5cf2bd" },
          ].map((m,i) => (
            <div key={m.l} style={{ padding: "12px 0", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="t-eyebrow">{m.l}</span>
                <span className="t-mono" style={{ fontSize: 13, color: m.c }}>{m.v}</span>
              </div>
              <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 4 }}>{m.s}</div>
            </div>
          ))}

          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 14, fontSize: 12 }}>
            <Icon name="arrow-right" size={12}/> Compare sites globally
          </button>
        </div>
      </div>

      {/* Bottom preset strip */}
      <div style={{ position: "relative", padding: "20px 36px 24px", marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="t-eyebrow">PRESETS · POPULAR DARK SITES</div>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)" }}>SCROLL · 78 SITES</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {PRESET_SITES.map((s,i) => (
            <div key={s.name} className="frame glass" style={{ padding: 14, position: "relative", overflow: "hidden", backdropFilter: "blur(12px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)", letterSpacing: "0.14em" }}>#{i+1}</span>
                <div style={{ display: "flex", gap: 1 }}>
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <div key={n} style={{ width: 2, height: 8, borderRadius: 1, background: n <= s.bortle ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.06)" }}/>
                  ))}
                </div>
              </div>
              <div className="h-title" style={{ fontSize: 14, color: "#fff" }}>{s.name}</div>
              <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>{s.region}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                <div className="h-display" style={{ fontSize: 24, color: s.score >= 7 ? "#7bf6ff" : (s.score >= 5 ? "#c4a0fb" : "#ff9b4d") }}>{s.score.toFixed(1)}</div>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-400)" }}>{s.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProShell>
  );
};

window.LocB = LocB;
