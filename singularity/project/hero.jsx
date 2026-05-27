/* Hero + Login artboard */

const HeroArtboard = () => {
  return (
    <div className="sg-bg grain" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", fontFamily: "var(--f-body)" }}>
      {/* Aurora */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background:
          "radial-gradient(1200px 600px at 70% 20%, rgba(168,85,247,0.30), transparent 60%)," +
          "radial-gradient(900px 500px at 20% 70%, rgba(0,240,255,0.22), transparent 65%)," +
          "radial-gradient(700px 500px at 90% 90%, rgba(255,107,0,0.10), transparent 65%)"
      }}/>

      {/* Concentric orbits */}
      <svg width="100%" height="100%" viewBox="0 0 1440 900" style={{ position: "absolute", inset: 0, opacity: 0.35 }} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="orbit-line" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(0,240,255,0)"/>
            <stop offset="50%" stopColor="rgba(0,240,255,0.6)"/>
            <stop offset="100%" stopColor="rgba(168,85,247,0)"/>
          </linearGradient>
        </defs>
        {[180,300,460,620,800,1000].map((r,i) => (
          <ellipse key={r} cx="1000" cy="500" rx={r} ry={r*0.55} stroke="url(#orbit-line)" strokeWidth="0.7" fill="none" strokeDasharray={i%2?"4 6":"none"} transform={`rotate(${-12 + i*2} 1000 500)`}/>
        ))}
        {/* Planet */}
        <circle cx="1000" cy="500" r="34" fill="rgba(0,240,255,0.06)" stroke="rgba(0,240,255,0.6)" strokeWidth="1"/>
        <circle cx="1000" cy="500" r="14" fill="#00f0ff" opacity="0.6"/>
        {/* Markers on orbit */}
        <circle cx="1300" cy="520" r="4" fill="#a855f7"/>
        <circle cx="700" cy="430" r="3" fill="#00f0ff"/>
        <circle cx="1120" cy="280" r="3" fill="#ff6b00"/>
      </svg>

      {/* Nav */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SingularityMark size={32}/>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>Singularity</div>
          <span className="chip" style={{ marginLeft: 8 }}><span className="dot" style={{color:"#00f0ff"}}/>OBSERVATORY ENGINE</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13.5, color: "var(--fg-300)" }}>
          <span>Forecast</span>
          <span>Site Planner</span>
          <span>Targets</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost">Sign in</button>
          <button className="btn btn-primary">Lock a site <Icon name="arrow-right" size={14}/></button>
        </div>
      </div>

      {/* Hero content */}
      <div style={{ position: "relative", padding: "60px 56px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 80, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <span className="dot" style={{ color: "#a855f7" }}/>
            <span className="t-mono" style={{ fontSize: 11, color: "#c4a0fb", letterSpacing: "0.16em" }}>NOW SAMPLING · 24 ATMOSPHERIC MODELS</span>
          </div>
          <h1 className="h-display" style={{ fontSize: 96, color: "#fff", marginTop: 26, marginBottom: 8 }}>
            Predict the<br/>
            <span style={{ background: "linear-gradient(90deg, #00f0ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>night sky.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--fg-300)", maxWidth: 540, lineHeight: 1.55, marginTop: 24 }}>
            A physics-first forecast engine for astronomers and observatory operators. Seeing,
            transparency, dew, and sky darkness — modeled per minute, per square kilometer.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <button className="btn btn-primary" style={{ padding: "14px 24px", fontSize: 15 }}>Start observing <Icon name="arrow-right" size={14}/></button>
            <button className="btn btn-ghost" style={{ padding: "14px 24px", fontSize: 15 }}><Icon name="play" size={12}/> Watch a forecast unfold</button>
          </div>
          <div style={{ display: "flex", gap: 36, marginTop: 56 }}>
            {[
              {k: "78", l: "models · live"},
              {k: "1.2M", l: "site polygons"},
              {k: "12ms", l: "p95 latency"},
              {k: "94%", l: "veto recall"},
            ].map(s => (
              <div key={s.l}>
                <div className="h-display" style={{ fontSize: 32, color: "#fff" }}>{s.k}</div>
                <div className="t-eyebrow" style={{ marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login Lock card */}
        <div style={{ position: "relative" }}>
          <div className="frame" style={{ padding: 32, position: "relative", overflow: "hidden", backdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(500px 300px at 80% -10%, rgba(0,240,255,0.18), transparent 60%)" }}/>
            <ScanLine/>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <span className="t-eyebrow">> ENGAGE OBSERVATORY</span>
              <span className="chip cyan"><span className="dot"/>READY</span>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>OBSERVER ID</div>
              <input className="input" defaultValue="aurora.kepler" />
            </div>
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="t-eyebrow">CRED · TOTP</span>
                <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)" }}>Rotates 00:23</span>
              </div>
              <input className="input" type="password" defaultValue="••••••••••••" />
            </div>
            <div style={{ marginBottom: 26 }}>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>SITE LOCK · LAT / LON</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" defaultValue="21.028 °N" style={{ flex: 1 }}/>
                <input className="input" defaultValue="105.850 °E" style={{ flex: 1 }}/>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 11.5, color: "var(--fg-400)" }}>
                <Icon name="pin" size={12}/> Hà Nội Plateau · alt 18m · UTC+7
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 15 }}>
              <Icon name="lock" size={14}/> Lock site & launch dashboard
            </button>

            <div className="divider" style={{ margin: "24px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--fg-400)" }}>
              <span>SSO · ORCID · Observatory IdP</span>
              <span>v1.0.0 · build 2026.05</span>
            </div>
          </div>

          {/* Floating sub-badge */}
          <div className="glass" style={{ position: "absolute", left: -36, bottom: -28, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <Icon name="moon" size={18}/>
            <div>
              <div className="t-eyebrow">MOON · TONIGHT</div>
              <div className="h-title" style={{ fontSize: 16, color: "#fff", marginTop: 2 }}>86% waxing gibbous</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 56px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 48, fontSize: 12, color: "var(--fg-400)" }} className="t-mono">
        <span><span style={{ color: "var(--cyan)" }}>● </span>SAT-A · 02:14 UTC</span>
        <span><span style={{ color: "var(--violet)" }}>● </span>ECMWF-NEMS · 02:14 UTC</span>
        <span><span style={{ color: "var(--orange)" }}>● </span>METAR · 02:13 UTC</span>
        <span style={{ marginLeft: "auto" }}>78 sites tracked / 1,243 targets indexed</span>
      </div>
    </div>
  );
};

window.HeroArtboard = HeroArtboard;
