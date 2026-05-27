/* Hybrid — Cinematic visuals (C) + Editorial UX (A)
   Layered nebula SVG · Instrument Serif heading · refined input
   Right rail: global stats with thin sparklines
   Bottom row: Quick Sites + Moon + Featured Target — elegant horizontal strip */

const NebulaArtHybrid = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 1280" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="hyb-warm" cx="0.62" cy="0.28" r="0.55">
        <stop offset="0%" stopColor="rgba(255,200,160,0.10)"/>
        <stop offset="30%" stopColor="rgba(255,140,80,0.10)"/>
        <stop offset="60%" stopColor="rgba(168,85,247,0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-cyan" cx="0.18" cy="0.55" r="0.5">
        <stop offset="0%" stopColor="rgba(0,180,220,0.14)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-violet" cx="0.88" cy="0.75" r="0.45">
        <stop offset="0%" stopColor="rgba(168,85,247,0.14)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-vignette" cx="0.5" cy="0.5" r="0.7">
        <stop offset="60%" stopColor="rgba(10,10,12,0)"/>
        <stop offset="100%" stopColor="rgba(2,2,4,0.85)"/>
      </radialGradient>
      <filter id="hyb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="38"/>
      </filter>
    </defs>

    <rect width="1440" height="1280" fill="#0a0a0c"/>
    <rect width="1440" height="1280" fill="url(#hyb-cyan)"/>
    <rect width="1440" height="1280" fill="url(#hyb-violet)"/>
    <rect width="1440" height="1280" fill="url(#hyb-warm)"/>

    {/* Soft filaments */}
    <g filter="url(#hyb-soft)" opacity="0.5">
      <path d="M 100 360 Q 480 320 760 380 Q 1080 440 1340 420" stroke="rgba(255,180,140,0.32)" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M 0 880 Q 360 820 700 880 Q 1040 940 1440 880" stroke="rgba(120,80,200,0.28)" strokeWidth="32" fill="none" strokeLinecap="round"/>
    </g>

    {/* Dust silhouette */}
    <g filter="url(#hyb-soft)" opacity="0.55">
      <path d="M 0 1080 Q 280 970 500 1040 Q 720 1110 940 1030 Q 1180 940 1440 1040 L 1440 1280 L 0 1280 Z" fill="rgba(50,30,60,0.55)"/>
    </g>

    {/* Star field */}
    {Array.from({length: 280}).map((_,i) => {
      const x = (i * 137.5 + (i*i)%80) % 1440;
      const y = (i * 263 + (i*i*3)%60) % 1280;
      const r = ((i * 7) % 10) / 10 * 1.2 + 0.2;
      const op = ((i * 11) % 10) / 10 * 0.6 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op}/>;
    })}

    {/* Diffraction stars */}
    {[[260,200],[920,160],[1180,500],[420,640],[760,290],[140,460],[1330,820],[680,1020]].map(([x,y],i) => (
      <g key={i} opacity={0.65 + (i%3)*0.1}>
        <circle cx={x} cy={y} r={1.5 + i%2} fill="#fff"/>
        <circle cx={x} cy={y} r={4 + i%2} fill="rgba(255,255,255,0.25)"/>
        <line x1={x-14} y1={y} x2={x+14} y2={y} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
        <line x1={x} y1={y-14} x2={x} y2={y+14} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
      </g>
    ))}

    <rect width="1440" height="1280" fill="url(#hyb-vignette)"/>
  </svg>
);

// Thin sparkline for the right rail
const ThinSparkline = ({ points, color = "#00f0ff", height = 24 }) => {
  const w = 200, h = height;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i ? "L" : "M"} ${i * step} ${h - ((p - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={d} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      {points.map((p, i) => i === points.length - 1 && (
        <circle key={i} cx={i * step} cy={h - ((p - min) / range) * (h - 4) - 2} r="1.8" fill={color}/>
      ))}
    </svg>
  );
};

const Moon3D = ({ size = 72, phase = 0.86 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: "radial-gradient(circle at 62% 36%, #fff, #e8ebf2 22%, #8a8f9e 65%, #3a3d48 90%, #1a1d24)",
      boxShadow: "0 0 28px rgba(255,200,160,0.25), inset 0 0 12px rgba(255,255,255,0.15)"
    }}/>
    {/* Craters */}
    <div style={{ position: "absolute", left: "30%", top: "25%", width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.15)" }}/>
    <div style={{ position: "absolute", left: "55%", top: "55%", width: 8, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.18)" }}/>
    <div style={{ position: "absolute", left: "70%", top: "32%", width: 4, height: 4, borderRadius: "50%", background: "rgba(0,0,0,0.12)" }}/>
    {/* Shadow */}
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: `linear-gradient(${105}deg, transparent ${phase*60}%, rgba(0,0,0,0.78) ${phase*60+18}%)`
    }}/>
  </div>
);

const LocHybrid = () => {
  return (
    <div className="hybrid" style={{
      width: "100%", height: "100%", position: "relative", overflow: "hidden",
      background: "#0a0a0c", color: "var(--fg-200)"
    }}>
      <NebulaArtHybrid/>

      {/* Top bar */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SingularityMark size={26}/>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15.5, color: "#fff", letterSpacing: "-0.01em" }}>Singularity</div>
          <span style={{ color: "var(--fg-500)" }}>·</span>
          <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}>OBSERVATORY ENGINE</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13.5, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
          <span style={{ color: "#fff" }}>Forecast</span>
          <span>Sites</span>
          <span>Targets</span>
          <span>Models</span>
          <span>Docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="dot pulse" style={{ color: "#5cf2bd" }}/>02:14 UTC · 12 MODELS NOMINAL
          </span>
          <LangSwitch/>
          <RedVisionToggle/>
        </div>
      </div>

      {/* MAIN — 2-col hero */}
      <div style={{ position: "relative", padding: "80px 56px 0", display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 72, alignItems: "start" }}>
        {/* LEFT */}
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "5px 12px", borderRadius: 999,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="dot" style={{ color: "#c4a0fb" }}/>
            <span className="t-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", letterSpacing: "0.16em" }}>STEP 01 · LOCK A SITE</span>
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            letterSpacing: "-0.035em",
            fontSize: 112, lineHeight: 0.95, color: "#fff", margin: "28px 0 0",
            textShadow: "0 0 60px rgba(0,0,0,0.5)"
          }}>
            Where are you<br/>
            <span style={{ fontStyle: "italic", color: "#c4a0fb" }}>observing</span> tonight?
          </h1>

          <p style={{
            marginTop: 24, fontSize: 17, lineHeight: 1.55, maxWidth: 560,
            color: "rgba(255,255,255,0.66)", fontWeight: 400
          }}>
            Singularity runs a 5-layer atmospheric column through ECMWF, GFS, and METAR
            at your coordinates — then cross-checks against 7Timer. Seeing, transparency,
            and dew at minute precision.
          </p>

          {/* Mode chips — compact */}
          <div style={{ display: "flex", gap: 6, marginTop: 36 }}>
            {[
              { l: "Place name",  icon: "search",  active: true },
              { l: "Coordinates", icon: "compass" },
              { l: "Use GPS",     icon: "pin" },
              { l: "From map",    icon: "globe" },
            ].map(t => (
              <div key={t.l} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 12px", borderRadius: 999,
                background: t.active ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.03)",
                border: t.active ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: t.active ? "#c4a0fb" : "rgba(255,255,255,0.55)",
                fontSize: 12, fontWeight: 500
              }}>
                <Icon name={t.icon} size={12}/> {t.l}
              </div>
            ))}
          </div>

          {/* Refined search — from C, polished */}
          <div style={{ marginTop: 16, maxWidth: 640 }}>
            <div style={{
              display: "flex", alignItems: "stretch",
              borderRadius: 18,
              background: "rgba(10,10,16,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              overflow: "hidden"
            }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0 20px", color: "rgba(255,255,255,0.55)" }}>
                <Icon name="search" size={18}/>
              </div>
              <input style={{
                flex: 1, padding: "20px 4px", background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: 17, fontFamily: "'Plus Jakarta Sans'", fontWeight: 400
              }} placeholder="Search a city, observatory, or paste 22.337, 103.844" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 12px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <button title="Use my GPS" style={{
                  width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                  display: "grid", placeItems: "center", cursor: "pointer", margin: "8px 0"
                }}>
                  <Icon name="pin" size={15}/>
                </button>
                <button className="btn btn-primary" style={{
                  padding: "10px 18px", margin: "8px 8px 8px 0", fontSize: 14,
                  fontFamily: "'Plus Jakarta Sans'", fontWeight: 600
                }}>
                  <Icon name="lock" size={13}/> Lock site
                </button>
              </div>
            </div>

            {/* Helper */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              <div style={{ display: "flex", gap: 18 }}>
                <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 5, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>↵</span> lock</span>
                <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 5, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>⌘ K</span> open anywhere</span>
                <span><span className="t-mono" style={{ background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 5, color: "rgba(255,255,255,0.7)", fontSize: 11 }}>⌘ G</span> GPS</span>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} className="t-mono">
                <span style={{ width: 6, height: 6, borderRadius: 3, background: "#5cf2bd"}}/>Geocoder online · 38 ms
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — minimal global stats */}
        <div style={{ paddingTop: 32 }}>
          <div style={{
            padding: "28px 28px 24px", borderRadius: 22,
            background: "linear-gradient(180deg, rgba(20,18,28,0.5), rgba(8,8,12,0.7))",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="t-eyebrow" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}>TONIGHT · GLOBAL AVERAGE</span>
              <span className="t-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>27 MAY · 02:14 UTC</span>
            </div>

            <div style={{
              marginTop: 14,
              fontFamily: "'Instrument Serif', serif", fontWeight: 400,
              fontSize: 56, lineHeight: 1, color: "#fff", letterSpacing: "-0.02em"
            }}>
              <span style={{ color: "#7bf6ff" }}>62%</span> <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: 38 }}>viable</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.5 }}>
              1,243 of 2,008 indexed sites tonight. Moon waning, jet stream easing over SE Asia.
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "24px 0" }}/>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { l: "MEDIAN SEEING", v: "1.6", unit: "″",  s: [3.4,3.0,2.6,2.2,1.9,1.6,1.5,1.6], color: "#00f0ff" },
                { l: "TRANSPARENCY",  v: "74", unit: "%",   s: [42,55,62,68,74,78,76,74],         color: "#a855f7" },
                { l: "MEDIAN SQM",    v: "20.4", unit: "",  s: [18.2,18.8,19.4,20.0,20.4,20.5,20.3,20.4], color: "#c4a0fb" },
                { l: "DEW RISK",      v: "18", unit: "%",   s: [28,24,20,18,17,18,19,18],         color: "#5cf2bd" },
              ].map(m => (
                <div key={m.l}>
                  <div className="t-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>{m.l}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>{m.v}</span>
                    <span className="t-mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{m.unit}</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <ThinSparkline points={m.s} color={m.color} height={20}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0 14px" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)" }} className="t-mono">
              <span>5 sources · 12 models</span>
              <span>next poll · 02:19</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM — Quick sites + Moon + Target horizontal strip */}
      <div style={{ position: "relative", padding: "72px 56px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <div>
            <div className="t-eyebrow" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>YOUR SITES · TONIGHT'S OUTLOOK</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#fff", letterSpacing: "-0.01em" }}>
              Lock somewhere <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>familiar</span>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>5 of 78 indexed</span>
            <button style={{
              padding: "8px 14px", borderRadius: 999,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer"
            }}>See all sites <Icon name="arrow-right" size={12}/></button>
          </div>
        </div>

        {/* 5-card horizontal row: 3 Quick sites + Moon + Target */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
          {/* 3 Quick Sites */}
          {PRESET_SITES.slice(0,3).map((s,i) => (
            <div key={s.name} style={{
              padding: 20, borderRadius: 18,
              background: "linear-gradient(180deg, rgba(20,20,28,0.55), rgba(10,10,14,0.7))",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(240px 140px at 100% 0%, ${s.score>=7?"rgba(0,240,255,0.08)":(s.score>=5?"rgba(168,85,247,0.08)":"rgba(255,107,0,0.06)")}, transparent 60%)`}}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="t-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>SITE · 0{i+1}</span>
                <div style={{ display: "flex", gap: 1.5 }}>
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <div key={n} style={{ width: 2, height: 8, borderRadius: 1, background: n <= s.bortle ? "rgba(0,240,255,0.55)" : "rgba(255,255,255,0.06)" }}/>
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#fff", marginTop: 14, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
                {s.name}
              </div>
              <div className="t-mono" style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                {s.region} · {s.alt}
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0 12px" }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>SCORE</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, lineHeight: 1, marginTop: 4,
                    color: s.score >= 7 ? "#7bf6ff" : (s.score >= 5 ? "#c4a0fb" : "#ff9b4d")
                  }}>{s.score.toFixed(1)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>BORTLE</div>
                  <div className="t-mono" style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>{s.bortle}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Moon card */}
          <div style={{
            padding: 20, borderRadius: 18,
            background: "linear-gradient(180deg, rgba(28,22,18,0.55), rgba(10,10,14,0.7))",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(240px 140px at 100% 0%, rgba(255,107,0,0.10), transparent 60%)"}}/>
            <span className="t-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>MOON · WAXING GIBBOUS</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
              <Moon3D size={72} phase={0.86}/>
              <div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, lineHeight: 1, color: "#fff" }}>
                  86<span style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>%</span>
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>illumination</div>
              </div>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0 12px" }}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>RISE</div>
                <div className="t-mono" style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>16:42</div>
              </div>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>TRANSIT</div>
                <div className="t-mono" style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>22:08</div>
              </div>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>SET</div>
                <div className="t-mono" style={{ fontSize: 15, color: "#ff9b4d", marginTop: 4 }}>04:12</div>
              </div>
            </div>
          </div>

          {/* Featured target card */}
          <div style={{
            padding: 20, borderRadius: 18,
            background: "linear-gradient(180deg, rgba(28,22,40,0.55), rgba(10,10,14,0.7))",
            border: "1px solid rgba(168,85,247,0.2)",
            backdropFilter: "blur(20px)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(260px 160px at 100% 0%, rgba(168,85,247,0.18), transparent 60%)"}}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="t-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)" }}>FEATURED · PEAKS 00:30</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.3)", fontSize: 9.5, color: "#c4a0fb" }} className="t-mono">
                <Icon name="star" size={9}/>DSO
              </span>
            </div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 46, color: "#fff", lineHeight: 1, marginTop: 14, letterSpacing: "-0.02em" }}>
              M51 <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.55)", fontSize: 22 }}>Whirlpool</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.5 }}>
              Sb galaxy · Canes Venatici · transits at <span className="t-mono" style={{ color: "#c4a0fb" }}>00:30 UTC+7</span>.
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0 12px" }}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>ALT</div>
                <div className="t-mono" style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>72°</div>
              </div>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>MAG</div>
                <div className="t-mono" style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>8.4</div>
              </div>
              <div>
                <div className="t-eyebrow" style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)" }}>SCORE</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#c4a0fb", marginTop: 2 }}>7.8</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 56px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 32, fontSize: 11, color: "rgba(255,255,255,0.35)" }} className="t-mono">
          <span>ECMWF</span>
          <span>GFS</span>
          <span>7TIMER</span>
          <span>METAR</span>
          <span>OSM</span>
          <span>ESP32 FLEET · 24/7</span>
        </div>
        <span className="t-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Singularity v1.0.0 · physics engine v3.1</span>
      </div>
    </div>
  );
};

window.LocHybrid = LocHybrid;
