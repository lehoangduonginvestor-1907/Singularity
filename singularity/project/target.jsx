/* Target Explorer + Forecast Graph */

const SkyDome = () => {
  // Stereographic-like sky chart
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1", maxWidth: 420, margin: "0 auto" }}>
      <svg width="100%" height="100%" viewBox="0 0 420 420">
        <defs>
          <radialGradient id="dome-bg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,40,60,0.6)"/>
            <stop offset="60%" stopColor="rgba(10,12,24,0.7)"/>
            <stop offset="100%" stopColor="rgba(2,4,8,1)"/>
          </radialGradient>
          <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,200,150,0.4)"/>
            <stop offset="100%" stopColor="rgba(255,200,150,0)"/>
          </radialGradient>
        </defs>

        {/* Sky dome */}
        <circle cx="210" cy="210" r="200" fill="url(#dome-bg)" stroke="rgba(255,255,255,0.1)"/>

        {/* Altitude rings */}
        {[60, 120, 160].map(r => (
          <circle key={r} cx="210" cy="210" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4"/>
        ))}

        {/* Cardinal lines */}
        <line x1="10" y1="210" x2="410" y2="210" stroke="rgba(255,255,255,0.06)"/>
        <line x1="210" y1="10" x2="210" y2="410" stroke="rgba(255,255,255,0.06)"/>

        {/* Compass labels */}
        <text x="210" y="22" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">N</text>
        <text x="210" y="402" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">S</text>
        <text x="14" y="214" fontSize="11" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">W</text>
        <text x="398" y="214" fontSize="11" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.5)">E</text>

        {/* Alt labels */}
        <text x="218" y="58" fontSize="9" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.3)">60°</text>
        <text x="218" y="98" fontSize="9" fontFamily="JetBrains Mono" fill="rgba(255,255,255,0.3)">30°</text>

        {/* Milky way band */}
        <path d="M 60 90 Q 200 240 380 110" stroke="rgba(168,85,247,0.15)" strokeWidth="50" fill="none" strokeLinecap="round"/>
        <path d="M 60 90 Q 200 240 380 110" stroke="rgba(168,85,247,0.25)" strokeWidth="22" fill="none" strokeLinecap="round"/>

        {/* Stars */}
        {Array.from({length: 80}).map((_,i) => {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 190;
          const x = 210 + Math.cos(a) * r;
          const y = 210 + Math.sin(a) * r;
          const s = Math.random() * 1.2 + 0.3;
          return <circle key={i} cx={x} cy={y} r={s} fill="white" opacity={Math.random() * 0.7 + 0.2}/>;
        })}

        {/* Moon */}
        <circle cx="120" cy="160" r="44" fill="url(#moon-glow)"/>
        <circle cx="120" cy="160" r="10" fill="rgba(255,220,180,0.9)"/>

        {/* Target M51 — current */}
        <circle cx="260" cy="140" r="14" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 2"/>
        <circle cx="260" cy="140" r="4" fill="#00f0ff"/>
        <text x="280" y="138" fontSize="11" fontFamily="Space Grotesk" fontWeight="600" fill="#fff">M51</text>
        <text x="280" y="152" fontSize="9" fontFamily="JetBrains Mono" fill="#7bf6ff">ALT 72° · AZ 218°</text>

        {/* Trace of M51 across sky */}
        <path d="M 320 280 Q 280 180 260 140 Q 240 100 180 60" stroke="#00f0ff" strokeWidth="1.5" fill="none" strokeDasharray="3 4" opacity="0.7"/>

        {/* Other targets */}
        <g opacity="0.7">
          <circle cx="180" cy="110" r="3" fill="#a855f7"/>
          <text x="190" y="108" fontSize="9" fontFamily="JetBrains Mono" fill="rgba(168,85,247,0.8)">M81</text>
        </g>
        <g opacity="0.7">
          <circle cx="290" cy="240" r="3" fill="#a855f7"/>
          <text x="300" y="244" fontSize="9" fontFamily="JetBrains Mono" fill="rgba(168,85,247,0.8)">M104</text>
        </g>
        <g opacity="0.4">
          <circle cx="150" cy="290" r="3" fill="#ff6b00"/>
          <text x="160" y="294" fontSize="9" fontFamily="JetBrains Mono" fill="rgba(255,107,0,0.8)">M42 ↓</text>
        </g>

        {/* Horizon haze ring */}
        <circle cx="210" cy="210" r="195" fill="none" stroke="rgba(255,107,0,0.2)" strokeWidth="4"/>
      </svg>

      <div style={{ position: "absolute", left: 12, bottom: 12 }} className="glass">
        <div style={{ padding: "8px 12px" }}>
          <div className="t-eyebrow">VIEW · 00:30 UTC+7</div>
          <div className="t-mono" style={{ fontSize: 11, color: "#fff", marginTop: 2 }}>Local stereographic</div>
        </div>
      </div>
    </div>
  );
};

const PhysicsTraceChart = () => {
  const w = 720, h = 240, pad = { l: 36, r: 16, t: 24, b: 28 };
  const hrs = Array.from({length: 13}, (_,i) => i + 18); // 18 → 06
  const seeing = [3.4, 3.0, 2.6, 2.2, 1.9, 1.6, 1.4, 1.3, 1.3, 1.5, 1.8, 2.4, 3.1];
  const transparency = [32, 45, 58, 68, 76, 82, 86, 88, 87, 82, 74, 58, 40];
  const altitude = [0, 0, 15, 28, 42, 58, 70, 72, 68, 55, 38, 22, 5];
  const toX = i => pad.l + (i / 12) * (w - pad.l - pad.r);
  const toY = (v, max=100) => pad.t + (1 - v/max) * (h - pad.t - pad.b);

  const transPath = transparency.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v)}`).join(" ");
  const altPath = altitude.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(v, 90)}`).join(" ");
  const seePath = seeing.map((v,i) => `${i?"L":"M"}${toX(i)} ${toY(4-v, 4)}`).join(" "); // invert seeing (lower=better)
  const fillPath = transPath + ` L ${toX(12)} ${h-pad.b} L ${toX(0)} ${h-pad.b} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="tt-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Twilight bands */}
      <rect x={pad.l} y={pad.t} width={toX(2)-pad.l} height={h-pad.t-pad.b} fill="rgba(255,107,0,0.04)"/>
      <rect x={toX(10)} y={pad.t} width={w-pad.r-toX(10)} height={h-pad.t-pad.b} fill="rgba(255,107,0,0.04)"/>

      {[0,25,50,75,100].map(g => (
        <g key={g}>
          <line x1={pad.l} x2={w-pad.r} y1={toY(g)} y2={toY(g)} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4"/>
          <text x={pad.l-6} y={toY(g)+3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{g}</text>
        </g>
      ))}
      {hrs.map((hr,i) => i%2===0 && (
        <text key={hr} x={toX(i)} y={h-pad.b+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{String(hr%24).padStart(2,"0")}</text>
      ))}

      <path d={fillPath} fill="url(#tt-fill)"/>
      <path d={transPath} stroke="#a855f7" strokeWidth="2" fill="none"/>
      <path d={altPath} stroke="#00f0ff" strokeWidth="1.5" fill="none" strokeDasharray="3 3"/>
      <path d={seePath} stroke="#ff9b4d" strokeWidth="1.5" fill="none" opacity="0.8"/>

      {/* Optimal window highlight */}
      <rect x={toX(4)} y={pad.t} width={toX(8)-toX(4)} height={h-pad.t-pad.b} fill="rgba(0,240,255,0.04)" stroke="rgba(0,240,255,0.2)" strokeDasharray="2 3"/>
      <text x={(toX(4)+toX(8))/2} y={pad.t+12} textAnchor="middle" fontSize="9" fill="#7bf6ff" fontFamily="JetBrains Mono" letterSpacing="0.14em">OPTIMAL · 22 → 02</text>

      {/* Peak */}
      <circle cx={toX(6)} cy={toY(transparency[6])} r="4" fill="#a855f7"/>
      <circle cx={toX(6)} cy={toY(transparency[6])} r="8" fill="none" stroke="#a855f7" opacity="0.4"/>
    </svg>
  );
};

const TargetArtboard = () => {
  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", fontFamily: "var(--f-body)", overflow: "hidden" }}>
      <DashboardTopBar/>

      <div style={{ padding: "32px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>TARGET EXPLORER · DSO CATALOG</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <span className="h-display" style={{ fontSize: 64, color: "#fff" }}>M51</span>
              <span className="h-title" style={{ fontSize: 22, color: "var(--fg-300)" }}>Whirlpool Galaxy</span>
            </div>
            <div style={{ marginTop: 10, color: "var(--fg-400)", fontSize: 14 }} className="t-mono">
              13h 29m 52s · +47° 11′ 43″ · Sb · mag 8.4 · 11′.2 × 6′.9 · NGC 5194
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span className="chip cyan"><span className="dot"/>VISIBLE TONIGHT</span>
            <span className="chip violet"><Icon name="star" size={10}/>FAVORITE</span>
            <button className="btn btn-ghost"><Icon name="search" size={13}/> Change target</button>
            <button className="btn btn-primary"><Icon name="target" size={13}/> Lock & trace</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.4fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Sky dome */}
          <div className="frame" style={{ padding: 24 }}>
            <div className="t-eyebrow" style={{ marginBottom: 12 }}>SKY DOME · TRANSIT ARC</div>
            <SkyDome/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="t-eyebrow">RISE</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>20:42</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(0,240,255,0.06)", border: "1px solid rgba(0,240,255,0.3)" }}>
                <div className="t-eyebrow" style={{ color: "#7bf6ff" }}>TRANSIT</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>00:30</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="t-eyebrow">SET</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>04:18</div>
              </div>
            </div>
          </div>

          {/* Physics trace */}
          <div className="frame" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div className="t-eyebrow">12-HOUR PHYSICS TRACE · UTC+7</div>
                <div className="h-title" style={{ fontSize: 20, color: "#fff", marginTop: 4 }}>Optimal window 22:14 → 02:48</div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: "#a855f7" }}/><span className="t-mono">TRANSPARENCY</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: "#00f0ff", borderTop: "2px dashed #00f0ff" }}/><span className="t-mono">ALTITUDE</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 2, background: "#ff9b4d" }}/><span className="t-mono">SEEING (inv)</span></div>
              </div>
            </div>
            <PhysicsTraceChart/>

            {/* Window summary */}
            <div className="divider" style={{ margin: "20px 0 16px" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                {l:"PEAK SCORE", v:"7.8 / 10", s:"00:30", c: "#7bf6ff"},
                {l:"MIN SEEING", v:"1.3″", s:"FWHM at zenith", c: "#fff"},
                {l:"MAX TRANS", v:"88 %", s:"aerosol τ 0.10", c: "#fff"},
                {l:"WINDOW", v:"4h 34m", s:"continuous viable", c: "#c4a0fb"},
              ].map(s => (
                <div key={s.l}>
                  <div className="t-eyebrow">{s.l}</div>
                  <div className="h-display" style={{ fontSize: 26, color: s.c, marginTop: 4 }}>{s.v}</div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended targets */}
          <div className="frame" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div className="t-eyebrow">SUGGESTED · TONIGHT</div>
                <div className="h-title" style={{ fontSize: 18, color: "#fff", marginTop: 2 }}>Visible at peak</div>
              </div>
              <Icon name="filter" size={14}/>
            </div>
            {[
              {name: "M51", desc: "Whirlpool Galaxy", mag: "8.4", peak: "00:30", score: 7.8, active: true},
              {name: "M81", desc: "Bode's Galaxy", mag: "6.9", peak: "21:48", score: 7.3},
              {name: "M104", desc: "Sombrero Galaxy", mag: "8.0", peak: "22:14", score: 6.9},
              {name: "NGC 6960", desc: "Veil Nebula West", mag: "7.0", peak: "03:12", score: 6.2},
              {name: "M27", desc: "Dumbbell Nebula", mag: "7.5", peak: "02:48", score: 5.8},
              {name: "NGC 7000", desc: "North America Neb.", mag: "4.0", peak: "03:32", score: 5.4},
            ].map((t,i) => (
              <div key={t.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", marginBottom: 6, borderRadius: 10,
                background: t.active ? "rgba(0,240,255,0.08)" : "rgba(255,255,255,0.02)",
                border: t.active ? "1px solid rgba(0,240,255,0.3)" : "1px solid rgba(255,255,255,0.04)"
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", color: t.active ? "#7bf6ff" : "var(--fg-400)" }}>
                  <Icon name="target" size={16}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span className="h-title" style={{ fontSize: 15, color: "#fff" }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: "var(--fg-400)" }}>{t.desc}</span>
                  </div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>mag {t.mag} · peak {t.peak}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="h-display" style={{ fontSize: 20, color: t.active ? "#7bf6ff" : "#fff" }}>{t.score.toFixed(1)}</div>
                  <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-500)" }}>SCORE</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly mini strip */}
        <div className="frame" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="t-eyebrow">M51 · HOURLY SCORE</div>
            <div className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)" }}>18:00 → 06:00</div>
          </div>
          <HourlyStrip/>
        </div>
      </div>
    </div>
  );
};

window.TargetArtboard = TargetArtboard;
