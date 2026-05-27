/* Variation C — "Cinematic Sky-First"
   Wide nebula composition. Single, refined search.
   Editorial restraint. Apple landing × natural history museum. */

const NebulaArt = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 1024" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="neb-core" cx="0.5" cy="0.42" r="0.5">
        <stop offset="0%" stopColor="rgba(255,200,160,0.15)"/>
        <stop offset="25%" stopColor="rgba(255,140,80,0.18)"/>
        <stop offset="55%" stopColor="rgba(168,85,247,0.18)"/>
        <stop offset="85%" stopColor="rgba(60,30,80,0.08)"/>
        <stop offset="100%" stopColor="rgba(2,4,8,0)"/>
      </radialGradient>
      <radialGradient id="neb-cyan" cx="0.2" cy="0.7" r="0.6">
        <stop offset="0%" stopColor="rgba(0,180,220,0.18)"/>
        <stop offset="50%" stopColor="rgba(0,80,140,0.06)"/>
        <stop offset="100%" stopColor="rgba(2,4,8,0)"/>
      </radialGradient>
      <radialGradient id="neb-violet" cx="0.85" cy="0.25" r="0.55">
        <stop offset="0%" stopColor="rgba(168,85,247,0.22)"/>
        <stop offset="50%" stopColor="rgba(90,40,160,0.06)"/>
        <stop offset="100%" stopColor="rgba(2,4,8,0)"/>
      </radialGradient>
      <radialGradient id="dust" cx="0.5" cy="0.6" r="0.45">
        <stop offset="0%" stopColor="rgba(20,10,30,0)"/>
        <stop offset="60%" stopColor="rgba(20,10,30,0.6)"/>
        <stop offset="100%" stopColor="rgba(2,4,8,0.95)"/>
      </radialGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40"/>
      </filter>
    </defs>

    <rect width="1440" height="1024" fill="#020203"/>
    {/* Nebula layers */}
    <rect width="1440" height="1024" fill="url(#neb-cyan)"/>
    <rect width="1440" height="1024" fill="url(#neb-violet)"/>
    <rect width="1440" height="1024" fill="url(#neb-core)"/>

    {/* Dust pillars — abstract Carina-style silhouettes */}
    <g filter="url(#soft)" opacity="0.65">
      <path d="M 0 720 Q 200 600 400 680 Q 500 720 600 660 Q 700 600 800 700 Q 950 800 1100 720 Q 1300 600 1440 700 L 1440 1024 L 0 1024 Z" fill="rgba(80,30,40,0.5)"/>
      <path d="M 0 820 Q 300 720 500 800 Q 700 880 900 800 Q 1100 720 1440 820 L 1440 1024 L 0 1024 Z" fill="rgba(20,10,20,0.7)"/>
    </g>

    {/* Bright filament */}
    <g opacity="0.4" filter="url(#soft)">
      <path d="M 200 380 Q 480 360 760 430 Q 1080 510 1280 460" stroke="rgba(255,180,140,0.4)" strokeWidth="30" fill="none" strokeLinecap="round"/>
    </g>

    {/* Stars — 200 with size variation */}
    {Array.from({length: 240}).map((_,i) => {
      const x = (i * 137.5 + (i*i)%80) % 1440;
      const y = (i * 263 + (i*i*3)%60) % 1024;
      const r = ((i * 7) % 10) / 10 * 1.4 + 0.2;
      const op = ((i * 11) % 10) / 10 * 0.7 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op}/>;
    })}

    {/* Bright diffraction-spike stars */}
    {[[260,180],[920,140],[1180,460],[420,640],[760,290],[140,420],[1330,720]].map(([x,y],i) => (
      <g key={i} opacity={0.7 + (i%3)*0.1}>
        <circle cx={x} cy={y} r={1.5 + i%2} fill="#fff"/>
        <circle cx={x} cy={y} r={4 + i%2} fill="rgba(255,255,255,0.3)"/>
        <line x1={x-14} y1={y} x2={x+14} y2={y} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
        <line x1={x} y1={y-14} x2={x} y2={y+14} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
      </g>
    ))}

    {/* Vignette */}
    <rect width="1440" height="1024" fill="url(#dust)"/>
  </svg>
);

const LocC = () => {
  return (
    <ProShell>
      <NebulaArt/>

      {/* Top bar — very minimal */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SingularityMark size={26}/>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>Singularity</div>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          <span style={{ color: "#fff" }}>Forecast</span>
          <span>Sites</span>
          <span>Targets</span>
          <span>Engine</span>
          <span>Stories</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="dot pulse" style={{ color: "#5cf2bd" }}/>02:14 UTC · 12 MODELS NOMINAL
          </span>
          <LangSwitch/>
          <RedVisionToggle/>
        </div>
      </div>

      {/* Hero block — centered */}
      <div style={{ position: "relative", textAlign: "center", padding: "120px 0 80px", maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
          <span className="dot" style={{ color: "#c4a0fb" }}/>
          <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.16em" }}>NEW MOON · 14 DAYS · IDEAL WINDOW APPROACHING</span>
        </div>

        <h1 style={{
          fontFamily: "var(--f-display)", fontWeight: 300, letterSpacing: "-0.05em",
          fontSize: 120, lineHeight: 0.95, color: "#fff", margin: "30px 0 0",
          textShadow: "0 0 80px rgba(0,0,0,0.6)"
        }}>
          The sky, <span className="serif" style={{ fontStyle: "italic", fontWeight: 400, color: "#fff", opacity: 0.9 }}>computed</span>.
        </h1>

        <p style={{
          fontSize: 19, lineHeight: 1.5, color: "rgba(255,255,255,0.7)",
          maxWidth: 560, margin: "26px auto 0",
          textShadow: "0 1px 20px rgba(0,0,0,0.6)"
        }}>
          A physics-first forecast for observers. Lock a site — see seeing, transparency,
          and dew at minute precision. Anywhere on Earth.
        </p>

        {/* Search — single elegant input */}
        <div style={{ maxWidth: 620, margin: "44px auto 0" }}>
          <div style={{
            display: "flex", alignItems: "stretch",
            borderRadius: 18,
            background: "rgba(10,12,18,0.5)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "0 20px" }}>
              <Icon name="search" size={18}/>
            </div>
            <input style={{
              flex: 1, padding: "22px 4px", background: "transparent", border: "none", outline: "none",
              color: "#fff", fontSize: 18, fontFamily: "var(--f-body)", textAlign: "left"
            }} placeholder="Search a city, observatory, or paste coordinates" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 0 14px", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              <button title="Use my GPS" style={{
                width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                display: "grid", placeItems: "center", cursor: "pointer"
              }}>
                <Icon name="pin" size={16}/>
              </button>
              <button className="btn btn-primary" style={{ padding: "10px 22px", margin: "8px 8px 8px 0", fontSize: 14 }}>
                Lock site <Icon name="arrow-right" size={13}/>
              </button>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", justifyContent: "center", gap: 24 }}>
            <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, color: "rgba(255,255,255,0.7)" }}>↵</span> lock</span>
            <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, color: "rgba(255,255,255,0.7)" }}>⌘ K</span> open anywhere</span>
            <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4, color: "rgba(255,255,255,0.7)" }}>⌘ G</span> use GPS</span>
          </div>
        </div>
      </div>

      {/* "What's up tonight" 3-card row */}
      <div style={{ position: "relative", padding: "0 56px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>TONIGHT · 27 MAY</div>
            <div className="h-title" style={{ fontSize: 22, color: "#fff" }}>What's up.</div>
          </div>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>updated <span className="t-mono">02:14 UTC</span></span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Card 1 — Sky tonight */}
          <div className="frame glass" style={{ padding: 24, position: "relative", overflow: "hidden", backdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 200px at 100% 0%, rgba(0,240,255,0.1), transparent 60%)"}}/>
            <div className="t-eyebrow">CONDITIONS · GLOBAL MEDIAN</div>
            <div className="h-display" style={{ fontSize: 40, color: "#fff", marginTop: 8, lineHeight: 1 }}>
              <span style={{ color: "#7bf6ff" }}>62%</span> viable
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
              1,243 of 2,008 indexed sites have seeing under 2″ tonight.
            </div>
            <div className="divider" style={{ margin: "18px 0" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>
                <div className="t-eyebrow">SEE</div>
                <div className="t-mono" style={{ fontSize: 16, color: "#fff", marginTop: 4 }}>1.6″</div>
              </div>
              <div>
                <div className="t-eyebrow">TRANS</div>
                <div className="t-mono" style={{ fontSize: 16, color: "#fff", marginTop: 4 }}>74%</div>
              </div>
              <div>
                <div className="t-eyebrow">SQM</div>
                <div className="t-mono" style={{ fontSize: 16, color: "#fff", marginTop: 4 }}>20.4</div>
              </div>
            </div>
          </div>

          {/* Card 2 — Moon */}
          <div className="frame glass" style={{ padding: 24, position: "relative", overflow: "hidden", backdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 200px at 100% 0%, rgba(255,107,0,0.08), transparent 60%)"}}/>
            <div className="t-eyebrow">MOON · WAXING GIBBOUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
              <div style={{ position: "relative", width: 60, height: 60 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: "radial-gradient(circle at 65% 40%, #fff, #d6dae6 30%, #6a6f80 80%, #2a2d3a)", boxShadow: "0 0 24px rgba(255,200,160,0.3)" }}/>
                <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: "linear-gradient(105deg, transparent 30%, rgba(0,0,0,0.7) 50%)" }}/>
              </div>
              <div>
                <div className="h-display" style={{ fontSize: 32, color: "#fff" }}>86<span style={{fontSize:18, color:"rgba(255,255,255,0.5)"}}>%</span></div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>illumination</div>
              </div>
            </div>
            <div className="divider" style={{ margin: "18px 0" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div className="t-eyebrow">RISE</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>16:42</div>
              </div>
              <div>
                <div className="t-eyebrow">SET</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#ff9b4d", marginTop: 4 }}>04:12</div>
              </div>
            </div>
          </div>

          {/* Card 3 — Featured target */}
          <div className="frame glass" style={{ padding: 24, position: "relative", overflow: "hidden", backdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(300px 200px at 100% 0%, rgba(168,85,247,0.12), transparent 60%)"}}/>
            <div className="t-eyebrow">FEATURED · TONIGHT</div>
            <div className="h-display" style={{ fontSize: 40, color: "#fff", marginTop: 8, lineHeight: 1 }}>M51</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              The Whirlpool Galaxy peaks at <span className="t-mono" style={{ color: "#c4a0fb" }}>00:30 UTC+7</span>.
            </div>
            <div className="divider" style={{ margin: "18px 0" }}/>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div className="t-eyebrow">ALT</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>72°</div>
              </div>
              <div>
                <div className="t-eyebrow">MAG</div>
                <div className="t-mono" style={{ fontSize: 14, color: "#fff", marginTop: 4 }}>8.4</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer pressroom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 56px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 36, fontSize: 11.5, color: "rgba(255,255,255,0.4)" }} className="t-mono">
          <span>ECMWF</span>
          <span>GFS</span>
          <span>7TIMER</span>
          <span>METAR</span>
          <span>OSM</span>
          <span>ESP32 FLEET · 24/7</span>
        </div>
        <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>v1.0.0 · physics v3.1</span>
      </div>
    </ProShell>
  );
};

window.LocC = LocC;
