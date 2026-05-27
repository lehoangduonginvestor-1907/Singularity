/* Variation A — "Observatory Console"
   Editorial, restrained. Sober scientific instrument feel.
   Less neon. More Linear × NYT. */

const LocA = () => {
  return (
    <ProShell>
      <NebulaBg intensity={0.6}/>
      <StarField density={60}/>

      {/* Top bar */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 48px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SingularityMark size={26}/>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>Singularity</div>
          <span style={{ color: "var(--fg-500)" }}>·</span>
          <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)", letterSpacing: "0.14em" }}>OBSERVATORY ENGINE</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 13, color: "var(--fg-300)" }}>
          <span style={{ color: "#fff" }}>Forecast</span>
          <span>Sites</span>
          <span>Targets</span>
          <span>Models</span>
          <span>Docs</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusPill text="MODELS · 02:14 UTC · 12/12 NOMINAL"/>
          <LangSwitch/>
          <RedVisionToggle/>
        </div>
      </div>

      {/* Main */}
      <div style={{ position: "relative", padding: "72px 48px 0", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 80, alignItems: "start" }}>
        {/* Left */}
        <div style={{ maxWidth: 640 }}>
          <div className="t-eyebrow" style={{ marginBottom: 16, color: "var(--fg-400)" }}>STEP 01 · LOCK A SITE</div>
          <h1 style={{
            fontFamily: "var(--f-display)", fontWeight: 400, letterSpacing: "-0.045em",
            fontSize: 88, lineHeight: 0.95, color: "#fff", margin: 0
          }}>
            Where are you<br/>
            observing<span className="serif" style={{ fontStyle: "italic", color: "#c4a0fb" }}> tonight</span>?
          </h1>
          <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.55, color: "var(--fg-300)", maxWidth: 540 }}>
            Singularity runs a 5-layer atmospheric column model through ECMWF, GFS, and METAR at your
            coordinates — then cross-checks against 7Timer. Seeing, transparency, and dew at minute precision.
          </p>

          {/* Input */}
          <div style={{ marginTop: 44 }}>
            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {[
                { l: "Place name", icon: "search", active: true },
                { l: "Coordinates", icon: "compass" },
                { l: "Use my GPS",  icon: "pin" },
                { l: "From map",    icon: "globe" },
              ].map((t,i) => (
                <div key={t.l} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 14px", borderRadius: 10,
                  background: t.active ? "rgba(0,240,255,0.08)" : "transparent",
                  border: t.active ? "1px solid rgba(0,240,255,0.25)" : "1px solid rgba(255,255,255,0.06)",
                  color: t.active ? "#7bf6ff" : "var(--fg-400)",
                  fontSize: 12.5
                }}>
                  <Icon name={t.icon} size={13}/> {t.l}
                </div>
              ))}
            </div>

            {/* Search input — refined */}
            <div style={{
              display: "flex", alignItems: "stretch",
              borderRadius: 16,
              background: "linear-gradient(180deg, rgba(20,24,35,0.7), rgba(8,10,16,0.85))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
              overflow: "hidden"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px", color: "var(--fg-400)" }}>
                <Icon name="search" size={16}/>
              </div>
              <input style={{
                flex: 1, padding: "20px 4px", background: "transparent", border: "none", outline: "none",
                color: "#fff", fontSize: 17, fontFamily: "var(--f-body)"
              }} placeholder="Sa Pa, Lào Cai — or 22.337, 103.844" />
              <div style={{ display: "flex", alignItems: "center", padding: "0 14px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)", marginRight: 10 }}>↵</span>
                <button className="btn btn-primary" style={{ padding: "10px 20px" }}>
                  <Icon name="lock" size={13}/> Lock site
                </button>
              </div>
            </div>

            {/* Helper row */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12, color: "var(--fg-500)" }}>
              <span>Accepts <span className="t-mono" style={{ color: "var(--fg-300)" }}>lat, lon</span> · place name · plus code · IATA airport</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} className="t-mono">
                <span style={{ width: 6, height: 6, borderRadius: 3, background: "#5cf2bd"}}/>Geocoder online
              </span>
            </div>
          </div>

          {/* Presets */}
          <div style={{ marginTop: 56 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <div className="t-eyebrow">QUICK SITES · DARK ZONES NEAR YOU</div>
              <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)" }}>5 of 78 · tonight</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {PRESET_SITES.slice(0,4).map((s,i) => (
                <div key={s.name} style={{
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, rgba(0,240,255,${0.05+i*0.04}), rgba(168,85,247,${0.05+i*0.04}))`,
                    border: "1px solid rgba(255,255,255,0.05)",
                    display: "grid", placeItems: "center", color: "#c4a0fb"
                  }}>
                    <Icon name="pin" size={14}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="h-title" style={{ fontSize: 14.5, color: "#fff" }}>{s.name}</div>
                    <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>
                      {s.region} · Bortle {s.bortle} · {s.alt}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="h-display" style={{ fontSize: 20, color: s.score >= 7 ? "#7bf6ff" : (s.score >= 5 ? "#c4a0fb" : "#ff9b4d") }}>{s.score.toFixed(1)}</div>
                    <div className="t-mono" style={{ fontSize: 9, color: "var(--fg-500)", letterSpacing: "0.14em" }}>SCORE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Tonight at a glance */}
        <div style={{ paddingTop: 28 }}>
          <div className="frame" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(400px 280px at 100% 0%, rgba(0,240,255,0.10), transparent 60%)"}}/>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div className="t-eyebrow">TONIGHT · GLOBAL AVERAGE</div>
              <span className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)" }}>27 MAY · UTC+7</span>
            </div>
            <div className="h-display" style={{ fontSize: 32, color: "#fff", marginTop: 6, lineHeight: 1.1 }}>
              <span style={{ color: "#7bf6ff" }}>62%</span> of sites viable
            </div>
            <div style={{ fontSize: 13, color: "var(--fg-400)", marginTop: 6 }}>
              Moon at 86% · sets <span className="t-mono">04:12</span> · jet stream easing across SE Asia.
            </div>

            <div className="divider" style={{ margin: "22px 0" }}/>

            {/* Live metric mini grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
              {[
                { l: "MEDIAN SEEING", v: "1.6″", sub: "FWHM @ zenith", spark: [3,2.6,2.2,1.9,1.6,1.5,1.6], color: "#00f0ff" },
                { l: "TRANSPARENCY",  v: "74%", sub: "aerosol τ 0.14",  spark: [42,55,62,68,74,78,74], color: "#a855f7" },
                { l: "MEDIAN SQM",    v: "20.4", sub: "mag/arcsec²",     spark: [18.2,18.8,19.4,20.0,20.4,20.3,20.4], color: "#00f0ff" },
                { l: "DEW RISK",      v: "18%", sub: "optics safe",      spark: [22,20,18,17,18,19,18], color: "#5cf2bd" },
              ].map(m => (
                <div key={m.l}>
                  <div className="t-eyebrow" style={{ marginBottom: 6 }}>{m.l}</div>
                  <div className="h-display" style={{ fontSize: 26, color: "#fff" }}>{m.v}</div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>{m.sub}</div>
                  <div style={{ marginTop: 8 }}>
                    <Sparkline points={m.spark} color={m.color} height={28}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Models card */}
          <div className="frame" style={{ padding: 24, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="t-eyebrow">MODELS FEEDING THIS FORECAST</div>
              <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)" }}>12 ACTIVE</span>
            </div>
            {[
              { name: "ECMWF · NEMS", spec: "5 pressure levels · 11km",      ts: "02:14", on: true },
              { name: "GFS · 0.25°",  spec: "global · 6-hour cycle",         ts: "02:08", on: true },
              { name: "7Timer · ASTRO", spec: "benchmark · 3-hour cadence",  ts: "02:00", on: true },
              { name: "METAR · NOIBAI", spec: "ground truth · 30 min",       ts: "02:13", on: true },
              { name: "ESP32 · Cúc Phương", spec: "field sensor · 5 min",    ts: "02:11", on: true },
            ].map((m,i) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span className="dot" style={{ color: "#5cf2bd", marginRight: 12 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: "#fff" }}>{m.name}</div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)" }}>{m.spec}</div>
                </div>
                <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-300)" }}>{m.ts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 48px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--fg-500)" }} className="t-mono">
        <span>Data · ECMWF · GFS · METAR · 7Timer · OSM · ESP32 fleet</span>
        <span>Singularity v1.0.0 · build 2026.05.27 · physics engine v3.1</span>
      </div>
    </ProShell>
  );
};

window.LocA = LocA;
