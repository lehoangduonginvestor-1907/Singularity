/* Site Planner — interactive map + ranked sites */

const SiteMap = () => {
  // Stylized "constellation" map view
  return (
    <div style={{ position: "relative", width: "100%", height: 520, borderRadius: 16, overflow: "hidden",
      background: "radial-gradient(800px 500px at 30% 50%, rgba(0,30,40,0.6), rgba(2,4,8,0.95))",
      border: "1px solid rgba(255,255,255,0.06)"
    }}>
      {/* Topo lines */}
      <svg width="100%" height="100%" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
          </pattern>
          <radialGradient id="lightDome" cx="0.7" cy="0.55" r="0.3">
            <stop offset="0%" stopColor="rgba(255,107,0,0.4)"/>
            <stop offset="100%" stopColor="rgba(255,107,0,0)"/>
          </radialGradient>
        </defs>
        <rect width="800" height="520" fill="url(#grid)"/>
        {/* Coastline */}
        <path d="M 0 380 Q 80 360 160 380 T 320 360 Q 420 380 520 340 T 700 320 L 800 360 L 800 520 L 0 520 Z" fill="rgba(0,30,50,0.4)" stroke="rgba(0,240,255,0.2)" strokeWidth="0.8"/>
        {/* Mountains */}
        <path d="M 100 200 Q 200 100 300 200 T 500 220 Q 550 180 600 200" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="2 3"/>
        <path d="M 140 240 Q 220 160 320 250" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="0.8" strokeDasharray="2 3"/>
        {/* Light pollution domes */}
        <circle cx="560" cy="290" r="120" fill="url(#lightDome)"/>
        <circle cx="180" cy="420" r="80" fill="url(#lightDome)" opacity="0.7"/>
        {/* Cloud layer */}
        <path d="M 400 80 Q 500 60 600 100 T 800 90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="40" strokeLinecap="round"/>
      </svg>

      {/* Site markers */}
      {[
        {x: 38, y: 30, score: 9.2, label: "Mt. Aurora", priority: 1, color: "#00f0ff"},
        {x: 22, y: 42, score: 8.6, label: "Pico Sereno", priority: 2, color: "#00f0ff"},
        {x: 52, y: 22, score: 8.1, label: "Ridge 4A", priority: 3, color: "#00f0ff"},
        {x: 68, y: 48, score: 5.4, label: "Plateau East", priority: 8, color: "#a855f7"},
        {x: 44, y: 60, score: 4.1, label: "Valley North", priority: 12, color: "#a855f7"},
        {x: 76, y: 64, score: 2.1, label: "Coastal C", priority: 24, color: "#ff6b00"},
        {x: 14, y: 70, score: 1.5, label: "Lakeshore", priority: 32, color: "#ff6b00"},
        {x: 60, y: 80, score: 0.8, label: "Light Zone", priority: 58, color: "#ff3b5c", vetoed: true},
      ].map((s,i) => (
        <div key={i} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)" }}>
          <div style={{
            width: 14, height: 14, borderRadius: 999,
            background: s.color, opacity: s.vetoed ? 0.5 : 1,
            boxShadow: `0 0 24px ${s.color}, 0 0 0 4px rgba(0,0,0,0.4)`,
            border: s.priority === 1 ? "2px solid #fff" : "none",
          }}/>
          {s.priority <= 3 && (
            <div style={{ position: "absolute", left: 22, top: -10, whiteSpace: "nowrap" }}>
              <div className="t-mono" style={{ fontSize: 10, color: s.color, letterSpacing: "0.1em" }}>#{s.priority} · {s.score.toFixed(1)}</div>
              <div style={{ fontSize: 11.5, color: "#fff", fontFamily: "var(--f-display)" }}>{s.label}</div>
            </div>
          )}
          {/* Pulse ring */}
          {s.priority === 1 && (
            <div className="pulse" style={{ position: "absolute", inset: -8, borderRadius: 999, border: `1px solid ${s.color}`, opacity: 0.6 }}/>
          )}
        </div>
      ))}

      {/* User location */}
      <div style={{ position: "absolute", left: "45%", top: "50%", transform: "translate(-50%,-50%)" }}>
        <div style={{ width: 12, height: 12, borderRadius: 999, background: "#fff", boxShadow: "0 0 18px #fff, 0 0 0 4px rgba(0,0,0,0.5)" }}/>
        <div className="pulse" style={{ position: "absolute", inset: -10, borderRadius: 999, border: "1px solid #fff", opacity: 0.5 }}/>
      </div>

      {/* Map overlays */}
      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
        <div className="glass-strong glass" style={{ padding: "8px 12px", display: "flex", gap: 12, alignItems: "center" }}>
          <Icon name="layers" size={13}/>
          <span className="t-mono" style={{ fontSize: 11 }}>BORTLE · SQM · SEEING · WIND</span>
        </div>
        <div className="glass-strong glass" style={{ padding: "8px 12px", display: "flex", gap: 12, alignItems: "center" }}>
          <Icon name="moon" size={13}/>
          <span className="t-mono" style={{ fontSize: 11 }}>NEW MOON · 2026.06.10</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8 }}>
        {[
          {c: "#00f0ff", l: "TOP-3"},
          {c: "#a855f7", l: "VIABLE"},
          {c: "#ff6b00", l: "MARGINAL"},
          {c: "#ff3b5c", l: "VETOED"},
        ].map(l => (
          <div key={l.l} className="glass" style={{ padding: "6px 10px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: l.c, boxShadow: `0 0 8px ${l.c}`}}/>
            <span className="t-mono" style={{ fontSize: 10 }}>{l.l}</span>
          </div>
        ))}
      </div>

      {/* Compass */}
      <div style={{ position: "absolute", bottom: 16, right: 16, width: 64, height: 64, borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(5,6,8,0.6)", display: "grid", placeItems: "center" }}>
        <Icon name="compass" size={28}/>
      </div>

      {/* Scale */}
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <div className="glass" style={{ padding: "10px 14px" }}>
          <div className="t-eyebrow">SEARCH RADIUS</div>
          <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>2 000 km</div>
        </div>
      </div>
    </div>
  );
};

const SiteRow = ({ rank, name, region, score, drive, elev, bortle, seeing, tone = "cyan", winner }) => {
  const toneMap = {
    cyan: { bg: "rgba(0,240,255,0.06)", border: "rgba(0,240,255,0.3)", fg: "#7bf6ff" },
    violet: { bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.3)", fg: "#c4a0fb" },
    orange: { bg: "rgba(255,107,0,0.06)", border: "rgba(255,107,0,0.3)", fg: "#ff9b4d" },
  };
  const t = toneMap[tone];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "60px 1.5fr 70px 90px 90px 100px 90px", alignItems: "center", padding: "14px 18px", borderRadius: 12, background: winner ? t.bg : "rgba(255,255,255,0.02)", border: `1px solid ${winner ? t.border : "rgba(255,255,255,0.05)"}`, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="h-display" style={{ fontSize: 22, color: winner ? t.fg : "#fff" }}>#{rank}</span>
      </div>
      <div>
        <div className="h-title" style={{ fontSize: 16, color: "#fff" }}>{name}</div>
        <div style={{ fontSize: 11.5, color: "var(--fg-400)", marginTop: 2 }}>{region}</div>
      </div>
      <div>
        <div className="h-display" style={{ fontSize: 22, color: t.fg, textShadow: winner ? `0 0 18px ${t.border}` : "none" }}>{score}</div>
      </div>
      <div className="t-mono" style={{ fontSize: 12, color: "var(--fg-300)" }}>{drive}</div>
      <div className="t-mono" style={{ fontSize: 12, color: "var(--fg-300)" }}>{elev}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="t-mono" style={{ fontSize: 12, color: "var(--fg-200)" }}>Bortle {bortle}</span>
        <div style={{ display: "flex", gap: 2 }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <div key={n} style={{ width: 3, height: 9, borderRadius: 1, background: n <= bortle ? "rgba(0,240,255,0.6)" : "rgba(255,255,255,0.06)" }}/>
          ))}
        </div>
      </div>
      <div className="t-mono" style={{ fontSize: 12, color: "var(--fg-200)", textAlign: "right" }}>{seeing}″</div>
    </div>
  );
};

const SitePlannerArtboard = () => {
  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", fontFamily: "var(--f-body)", overflow: "hidden" }}>
      <DashboardTopBar/>

      <div style={{ padding: "32px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>SITE PLANNER · PHYSICS-RANKED</div>
            <div className="h-display" style={{ fontSize: 48, color: "#fff", lineHeight: 1 }}>
              <span style={{ color: "var(--cyan)" }} className="glow-cyan">8 viable</span> sites within 2,000 km.
            </div>
            <div style={{ marginTop: 12, color: "var(--fg-300)", fontSize: 14 }}>70 vetoed · jet stream over 4 ridges · moon altitude {">"} 30° at <span className="t-mono">23:14</span>.</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost"><Icon name="filter" size={13}/> Filters · 4 active</button>
            <button className="btn btn-ghost"><Icon name="share" size={13}/> Export · GeoJSON</button>
            <button className="btn btn-violet"><Icon name="telescope" size={13}/> Run diagnostics</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
          {/* Left — map */}
          <div>
            <SiteMap/>
            {/* Quick stats below map */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
              {[
                {l:"VIABLE", v:"8 / 78", c: "#7bf6ff"},
                {l:"VETOED", v:"70", c: "#ff8aa0"},
                {l:"SEARCH", v:"2 000 km", c: "#fff"},
                {l:"MOON ALT", v:"42°", c: "#ff9b4d"},
              ].map(s => (
                <div key={s.l} className="frame" style={{ padding: 14 }}>
                  <div className="t-eyebrow">{s.l}</div>
                  <div className="h-title" style={{ fontSize: 22, color: s.c, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Site ranking */}
          <div className="frame" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div className="t-eyebrow">RANKED · TONIGHT</div>
                <div className="h-title" style={{ fontSize: 20, color: "#fff", marginTop: 4 }}>Drive within 4h</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["SCORE","DRIVE","BORTLE"].map((t,i)=>(
                  <button key={t} className="btn" style={{ padding: "6px 10px", fontSize: 10, background: i===0?"rgba(168,85,247,0.14)":"rgba(255,255,255,0.03)", borderColor: i===0?"rgba(168,85,247,0.4)":"rgba(255,255,255,0.08)", color: i===0?"#c4a0fb":"var(--fg-300)"}}>{t}</button>
                ))}
              </div>
            </div>

            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "60px 1.5fr 70px 90px 90px 100px 90px", padding: "0 18px 8px", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--fg-500)", textTransform: "uppercase" }}>
              <span>RANK</span><span>SITE</span><span>SCORE</span><span>DRIVE</span><span>ELEV</span><span>BORTLE</span><span style={{textAlign:"right"}}>SEEING</span>
            </div>

            <SiteRow rank={1} name="Mt. Aurora Observatory" region="Sa Pa · Lào Cai · 286 km" score="9.2" drive="3h 50m" elev="2,432m" bortle={2} seeing="0.9" tone="cyan" winner/>
            <SiteRow rank={2} name="Pico Sereno Ridge" region="Bắc Hà · 312 km" score="8.6" drive="4h 10m" elev="1,980m" bortle={2} seeing="1.1" tone="cyan"/>
            <SiteRow rank={3} name="Ridge 4A · West Saddle" region="Phongsaly · 480 km" score="8.1" drive="6h 20m" elev="1,820m" bortle={3} seeing="1.2"/>
            <SiteRow rank={4} name="Tam Đảo South Spur" region="Vĩnh Phúc · 78 km" score="6.4" drive="1h 40m" elev="1,140m" bortle={4} seeing="1.7"/>
            <SiteRow rank={5} name="Plateau East" region="Mộc Châu · 220 km" score="5.4" drive="3h 10m" elev="1,050m" bortle={5} seeing="1.9" tone="violet"/>
            <SiteRow rank={6} name="Cúc Phương · Bãi Trống" region="Ninh Bình · 120 km" score="4.1" drive="2h 00m" elev="350m" bortle={6} seeing="2.4" tone="violet"/>

            <div className="divider" style={{ margin: "8px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 18px 0", fontSize: 12, color: "var(--fg-400)" }}>
              <span>Showing 6 of 8 viable · sorted by physics score</span>
              <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 11 }}>View all 78 <Icon name="arrow-right" size={11}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.SitePlannerArtboard = SitePlannerArtboard;
