/* Dashboard — main screen */

const DashboardTopBar = () => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 36px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(5,6,8,0.6)", backdropFilter: "blur(20px)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <SingularityMark size={28}/>
      <div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 14.5, color: "#fff", letterSpacing: "-0.01em" }}>Project Singularity</div>
        <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", letterSpacing: "0.16em" }}>OBSERVATORY DIAGNOSTICS · v1</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--fg-300)" }}>
      {["Dashboard","Site Planner","Targets","Forecast","Gear","Logs"].map((t,i)=>(
        <div key={t} style={{
          padding: "8px 14px", borderRadius: 999,
          background: i===0 ? "rgba(0,240,255,0.08)" : "transparent",
          border: i===0 ? "1px solid rgba(0,240,255,0.3)" : "1px solid transparent",
          color: i===0 ? "#7bf6ff" : "var(--fg-300)",
        }}>{t}</div>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="t-mono" style={{ fontSize: 11.5, color: "var(--fg-400)", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="pin" size={12}/> 21.028°N · 105.85°E
      </div>
      <div className="chip cyan"><span className="dot pulse"/>LIVE · 02:14 UTC</div>
      <button className="btn btn-ghost" style={{ padding: "8px 12px" }}><Icon name="refresh" size={13}/></button>
      <button className="btn btn-primary" style={{ padding: "8px 16px" }}><Icon name="zap" size={13}/> Sync</button>
    </div>
  </div>
);

const ForecastChart = () => {
  // Simulated 24h forecast curves
  const hrs = Array.from({length: 24}, (_,i) => i);
  const altitude = hrs.map(h => {
    const phase = (h - 22 + 24) % 24;
    return Math.max(0, Math.sin((phase / 12) * Math.PI) * 65 + Math.random()*2);
  });
  const score = hrs.map(h => {
    if (h < 18 && h > 5) return 0;
    if (h < 20) return 1.2;
    if (h < 22) return 3.5;
    if (h < 24) return 6.2;
    if (h < 2) return 7.8;
    return 6.5;
  });
  const w = 880, h = 280, pad = { l: 36, r: 24, t: 24, b: 32 };
  const toX = i => pad.l + (i / 23) * (w - pad.l - pad.r);
  const toY = v => pad.t + (1 - v/100) * (h - pad.t - pad.b);
  const altPath = altitude.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v)}`).join(" ");
  const scorePath = score.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v*10)}`).join(" ");
  const scoreFill = scorePath + ` L ${toX(23)} ${h-pad.b} L ${toX(0)} ${h-pad.b} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="scoreFillG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="altLineG" x1="0" x2="1">
          <stop offset="0%" stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#00f0ff"/>
        </linearGradient>
        <filter id="lineGlow"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>

      {/* Twilight bands */}
      <rect x={toX(5.5)} y={pad.t} width={toX(18.5)-toX(5.5)} height={h-pad.t-pad.b} fill="rgba(255,107,0,0.04)"/>
      <rect x={pad.l} y={pad.t} width={toX(5.5)-pad.l} height={h-pad.t-pad.b} fill="rgba(0,240,255,0.03)"/>
      <rect x={toX(18.5)} y={pad.t} width={w-pad.r-toX(18.5)} height={h-pad.t-pad.b} fill="rgba(0,240,255,0.03)"/>

      {/* Grid */}
      {[0,25,50,75,100].map(g => (
        <g key={g}>
          <line x1={pad.l} x2={w-pad.r} y1={toY(g)} y2={toY(g)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
          <text x={pad.l-8} y={toY(g)+3} textAnchor="end" fontSize="9.5" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{g}</text>
        </g>
      ))}

      {/* x axis */}
      {hrs.filter(i=>i%4===0).map(i => (
        <text key={i} x={toX(i)} y={h-pad.b+18} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{String(i).padStart(2,"0")}:00</text>
      ))}

      {/* Score area */}
      <path d={scoreFill} fill="url(#scoreFillG)"/>
      <path d={scorePath} stroke="#00f0ff" strokeWidth="2" fill="none" filter="url(#lineGlow)" opacity="0.6"/>
      <path d={scorePath} stroke="#00f0ff" strokeWidth="1.5" fill="none"/>

      {/* Altitude line */}
      <path d={altPath} stroke="url(#altLineG)" strokeWidth="1.5" fill="none" strokeDasharray="3 4" opacity="0.7"/>

      {/* Peak marker */}
      <g transform={`translate(${toX(0.5)}, ${toY(78)})`}>
        <circle r="6" fill="#00f0ff" opacity="0.2"/>
        <circle r="3" fill="#00f0ff"/>
      </g>
      <g transform={`translate(${toX(0.5)}, ${toY(78)})`}>
        <line x1="0" y1="-8" x2="0" y2="-30" stroke="rgba(0,240,255,0.4)"/>
        <rect x="-44" y="-58" width="88" height="26" rx="6" fill="rgba(10,12,18,0.92)" stroke="rgba(0,240,255,0.4)"/>
        <text x="0" y="-44" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="JetBrains Mono">PEAK · 00:30</text>
        <text x="0" y="-34" textAnchor="middle" fontSize="11" fill="#7bf6ff" fontFamily="Space Grotesk" fontWeight="600">7.8 · OPTIMAL</text>
      </g>

      {/* Now line */}
      <line x1={toX(14.2)} x2={toX(14.2)} y1={pad.t} y2={h-pad.b} stroke="rgba(168,85,247,0.5)" strokeDasharray="2 3"/>
      <text x={toX(14.2)} y={pad.t+12} fontSize="9" fill="#c4a0fb" fontFamily="JetBrains Mono">NOW 14:14</text>
    </svg>
  );
};

const HourlyStrip = () => {
  const hours = [
    {h:"18", icon:"cloud", score: 1.2, seeing: "3.4", trans: "32"},
    {h:"19", icon:"cloud", score: 2.1, seeing: "2.8", trans: "45"},
    {h:"20", icon:"sparkle", score: 4.0, seeing: "2.2", trans: "61"},
    {h:"21", icon:"sparkle", score: 5.6, seeing: "1.9", trans: "72"},
    {h:"22", icon:"sparkle", score: 6.8, seeing: "1.6", trans: "81"},
    {h:"23", icon:"sparkle", score: 7.4, seeing: "1.4", trans: "86", peak: true},
    {h:"00", icon:"sparkle", score: 7.8, seeing: "1.3", trans: "88", peak: true},
    {h:"01", icon:"sparkle", score: 7.6, seeing: "1.4", trans: "85"},
    {h:"02", icon:"sparkle", score: 6.9, seeing: "1.6", trans: "78"},
    {h:"03", icon:"moon", score: 5.2, seeing: "1.9", trans: "64"},
    {h:"04", icon:"moon", score: 3.4, seeing: "2.4", trans: "48"},
    {h:"05", icon:"cloud", score: 1.8, seeing: "3.1", trans: "31"},
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6 }}>
      {hours.map((h,i) => (
        <div key={i} style={{
          padding: "12px 8px",
          background: h.peak ? "linear-gradient(180deg, rgba(0,240,255,0.14), rgba(0,240,255,0.04))" : "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: h.peak ? "1px solid rgba(0,240,255,0.4)" : "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          position: "relative"
        }}>
          {h.peak && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: 3, background: "#00f0ff", boxShadow: "0 0 8px #00f0ff"}}/>}
          <div className="t-mono" style={{ fontSize: 11, color: h.peak ? "#7bf6ff" : "var(--fg-400)" }}>{h.h}:00</div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center", color: h.peak ? "#7bf6ff" : "var(--fg-400)" }}>
            <Icon name={h.icon} size={14}/>
          </div>
          <div className="h-display" style={{ fontSize: 22, color: "#fff", marginTop: 6 }}>{h.score.toFixed(1)}</div>
          <div style={{ marginTop: 8, height: 36, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(h.score/10)*100}%`,
              background: h.peak ? "linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.1))" : "linear-gradient(180deg, rgba(168,85,247,0.6), rgba(168,85,247,0.05))",
              borderRadius: 3, opacity: 0.7
            }}/>
          </div>
          <div className="t-mono" style={{ fontSize: 9.5, color: "var(--fg-500)", marginTop: 6 }}>{h.seeing}″ · {h.trans}%</div>
        </div>
      ))}
    </div>
  );
};

const DashboardArtboard = () => {
  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", fontFamily: "var(--f-body)", overflow: "hidden" }}>
      <DashboardTopBar/>

      <div style={{ padding: "32px 36px" }}>
        {/* Hero state */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>TONIGHT · 27 MAY · UTC+7</div>
            <div className="h-display" style={{ fontSize: 56, color: "#fff", lineHeight: 1 }}>
              <span style={{ color: "#fff" }}>Conditions improve to </span>
              <span style={{ background: "linear-gradient(90deg, #00f0ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>excellent</span>
              <span style={{ color: "#fff" }}> at <span className="t-mono" style={{ fontSize: 48, color: "#7bf6ff" }}>00:30</span>.</span>
            </div>
            <div style={{ marginTop: 14, color: "var(--fg-300)", fontSize: 15 }}>
              Window <span className="t-mono" style={{ color: "var(--cyan-soft)" }}>22:14 → 02:48</span> · seeing dips to <span className="t-mono" style={{ color: "#fff" }}>1.3″ FWHM</span> · moon sets <span className="t-mono" style={{ color: "#fff" }}>04:12</span>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span className="chip orange"><Icon name="moon" size={11}/>MOON 86%</span>
            <span className="chip cyan"><Icon name="wind" size={11}/>JET STREAM EASING</span>
            <span className="chip violet"><Icon name="layers" size={11}/>3 MODELS AGREE</span>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginBottom: 24 }}>
          {/* Gauge card */}
          <div className="frame" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(400px 300px at 50% 100%, rgba(0,240,255,0.15), transparent 60%)"}}/>
            <div className="t-eyebrow">GLOBAL SKY SCORE</div>
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
              <RadialGauge value={7.4} max={10} label="OF 10 · PEAK"/>
            </div>
            <div className="divider" style={{ margin: "16px 0" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="t-eyebrow">NOW</div>
                <div className="h-title" style={{ fontSize: 20, color: "#fff" }}>3.2 <span style={{ fontSize: 11, color: "var(--fg-400)" }}>/ 10</span></div>
              </div>
              <div>
                <div className="t-eyebrow">DELTA · 4H</div>
                <div className="h-title" style={{ fontSize: 20, color: "#7bf6ff" }}>+4.6 ↑</div>
              </div>
            </div>
            <button className="btn btn-violet" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
              <Icon name="telescope" size={13}/> Plan tonight's session
            </button>
          </div>

          {/* 4 metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <MetricTile label="ZENITH SEEING" icon="eye" value="1.42" unit="″ FWHM" tone="cyan"
              sub={<span style={{ color: "#5cf2bd" }}>↓ 0.4″ vs 24h avg · excellent</span>}
              chart={<div style={{ marginTop: 14 }}><Sparkline points={[3.4,3.0,2.8,2.3,2.0,1.7,1.5,1.42]} color="#00f0ff"/></div>}/>
            <MetricTile label="TRANSPARENCY" icon="sparkle" value="87" unit="%" tone="violet"
              sub={<span style={{ color: "var(--fg-400)" }}>aerosol τ 0.12 · clean</span>}
              chart={<div style={{ marginTop: 14 }}><Sparkline points={[42,55,62,68,74,82,86,87]} color="#a855f7"/></div>}/>
            <MetricTile label="SKY DARKNESS" icon="moon" value="20.8" unit="mag/arcsec²" tone="cyan"
              sub={<span style={{ color: "var(--fg-400)" }}>Bortle 4 · suburban</span>}
              chart={<div style={{ marginTop: 14 }}><Sparkline points={[18.2,18.6,19.1,19.6,20.2,20.5,20.7,20.8]} color="#00f0ff"/></div>}/>
            <MetricTile label="DEW RISK" icon="droplet" value="12" unit="%" tone="green"
              sub={<span style={{ color: "#5cf2bd" }}>✓ optics safe · ΔT 4.2°C</span>}
              chart={<div style={{ marginTop: 14 }}><Sparkline points={[8,10,9,12,14,13,12,12]} color="#00d68a"/></div>}/>
          </div>
        </div>

        {/* Forecast chart row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="frame" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div className="t-eyebrow">24-HOUR PHYSICS TRACE</div>
                <div className="h-title" style={{ fontSize: 22, color: "#fff", marginTop: 4 }}>Tonight's observable window</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  {l:"SKY SCORE", c:"#00f0ff", active: true},
                  {l:"ALTITUDE", c:"#a855f7", active: true, dashed: true},
                  {l:"MOON", c:"#ff6b00", active: false},
                ].map(s => (
                  <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: s.active ? "rgba(255,255,255,0.04)" : "transparent", opacity: s.active ? 1 : 0.4 }}>
                    <div style={{ width: 14, height: 2, background: s.c, borderRadius: 2, opacity: s.dashed ? 0.7 : 1 }}/>
                    <span className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-300)" }}>{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <ForecastChart/>
          </div>

          {/* Right rail — target spotlight */}
          <div className="frame" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 220, height: 220, background: "radial-gradient(circle at 70% 30%, rgba(168,85,247,0.25), transparent 60%)" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="t-eyebrow">PRIME TARGET</div>
              <span className="chip violet"><span className="dot"/>VISIBLE</span>
            </div>
            <div className="h-display" style={{ fontSize: 36, color: "#fff" }}>M51</div>
            <div style={{ color: "var(--fg-400)", marginBottom: 18 }}>Whirlpool Galaxy · Canes Venatici</div>

            {/* Mini orbit */}
            <div style={{ position: "relative", height: 140, marginBottom: 12 }}>
              <svg width="100%" height="140" viewBox="0 0 320 140">
                <defs>
                  <linearGradient id="arc-g" x1="0" x2="1">
                    <stop offset="0%" stopColor="rgba(168,85,247,0)"/>
                    <stop offset="50%" stopColor="#a855f7"/>
                    <stop offset="100%" stopColor="rgba(168,85,247,0)"/>
                  </linearGradient>
                </defs>
                {/* Horizon */}
                <line x1="10" y1="120" x2="310" y2="120" stroke="rgba(255,255,255,0.1)"/>
                <text x="10" y="135" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">SE</text>
                <text x="155" y="135" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">S</text>
                <text x="305" y="135" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">SW</text>
                {/* Arc */}
                <path d="M 10 120 Q 160 -20 310 120" stroke="url(#arc-g)" strokeWidth="2" fill="none" strokeDasharray="2 4"/>
                <path d="M 10 120 Q 160 -20 160 50" stroke="#a855f7" strokeWidth="2.5" fill="none"/>
                <circle cx="160" cy="50" r="6" fill="#a855f7" opacity="0.3"/>
                <circle cx="160" cy="50" r="3" fill="#a855f7"/>
                {/* Labels */}
                <text x="160" y="42" textAnchor="middle" fontSize="9" fill="#c4a0fb" fontFamily="JetBrains Mono">ALT 72° · 00:30</text>
              </svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="t-eyebrow">RISE</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>20:42</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="t-eyebrow">TRANSIT</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#7bf6ff", marginTop: 4 }}>00:30</div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="t-eyebrow">SET</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>04:18</div>
              </div>
            </div>

            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
              <Icon name="target" size={13}/> Lock target & open trace
            </button>
          </div>
        </div>

        {/* Hourly strip */}
        <div className="frame" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div className="t-eyebrow">HOURLY · 12H AHEAD</div>
              <div className="h-title" style={{ fontSize: 18, color: "#fff", marginTop: 2 }}>Minute-stepped score · seeing · transparency</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["12H","24H","5D"].map((t,i)=>(
                <button key={t} className="btn" style={{ padding: "6px 14px", fontSize: 11, background: i===0?"rgba(0,240,255,0.12)":"rgba(255,255,255,0.03)", borderColor: i===0?"rgba(0,240,255,0.4)":"rgba(255,255,255,0.08)", color: i===0?"#7bf6ff":"var(--fg-300)"}}>{t}</button>
              ))}
            </div>
          </div>
          <HourlyStrip/>
        </div>
      </div>
    </div>
  );
};

window.DashboardArtboard = DashboardArtboard;
