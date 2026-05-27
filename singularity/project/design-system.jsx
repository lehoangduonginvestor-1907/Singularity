/* Design System artboard */

const DSSwatch = ({ name, hex, dark }) => (
  <div style={{ flex: 1, minWidth: 130 }}>
    <div style={{
      height: 88, borderRadius: 14, background: hex,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: `0 12px 32px ${hex}40, inset 0 1px 0 rgba(255,255,255,0.06)`,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,0.18), transparent 50%)" }} />
    </div>
    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="h-title" style={{ fontSize: 13, color: "#fff" }}>{name}</span>
      <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)" }}>{hex}</span>
    </div>
  </div>
);

const DSTypeRow = ({ label, sample, font, size, weight, tracking }) => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 200px", alignItems: "center", padding: "18px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <div>
      <div className="t-eyebrow">{label}</div>
      <div style={{ marginTop: 4, fontSize: 11, color: "var(--fg-500)" }} className="t-mono">{font} · {size} · {weight}</div>
    </div>
    <div style={{ fontFamily: font, fontSize: parseInt(size), fontWeight: weight, letterSpacing: tracking, color: "#fff", lineHeight: 1.1 }}>{sample}</div>
    <div className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)", textAlign: "right" }}>{tracking}</div>
  </div>
);

const DesignSystemArtboard = () => {
  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", padding: 56, fontFamily: "var(--f-body)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <SingularityMark size={32}/>
            <span className="t-mono" style={{ fontSize: 11, letterSpacing: "0.24em", color: "var(--fg-400)" }}>PROJECT SINGULARITY / DESIGN SYSTEM v1.0</span>
          </div>
          <div className="h-display" style={{ fontSize: 76, color: "#fff" }}>The <span style={{color: "var(--cyan)"}} className="glow-cyan">Spacescape</span><br/>Operating Layer.</div>
          <div style={{ marginTop: 18, color: "var(--fg-300)", maxWidth: 620, fontSize: 15, lineHeight: 1.55 }}>
            A scientific, cinematic UI language for observatory operators. Built around glass surfaces,
            spectral accents, and instrument-grade typography that reads cleanly at telescope eyepieces under red-vision.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span className="chip cyan"><span className="dot"/>v 1.0.0</span>
          <span className="chip violet">DARK · ONLY</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32 }}>
        {/* Color */}
        <div className="frame" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div className="t-eyebrow">01 · Spectrum</div>
              <div className="h-title" style={{ fontSize: 26, color: "#fff", marginTop: 4 }}>Color</div>
            </div>
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)" }}>OKLCH · sRGB safe</span>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <DSSwatch name="Void"   hex="#050505"/>
            <DSSwatch name="Cyan"   hex="#00F0FF"/>
            <DSSwatch name="Violet" hex="#A855F7"/>
            <DSSwatch name="Warn"   hex="#FF6B00"/>
          </div>
          <div className="divider" style={{ margin: "8px 0 18px" }}/>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>Ink scale</div>
          <div style={{ display: "flex", gap: 0, height: 36, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {["#020203","#050608","#0a0c12","#0f1219","#141823","#1c2230","#262d3e","#3a4256","#5a6378","#9aa3b8","#d6dae6","#f4f6fb"].map((h,i)=>(
              <div key={i} style={{ flex: 1, background: h }} title={h}/>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--fg-500)" }} className="t-mono">
            <span>000</span><span>500</span><span>900</span>
          </div>
          <div className="divider" style={{ margin: "22px 0 18px" }}/>
          <div className="t-eyebrow" style={{ marginBottom: 12 }}>Semantic</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {l:"info / primary",  c:"#00F0FF", n:"cyan"},
              {l:"focus / accent",  c:"#A855F7", n:"violet"},
              {l:"warn / risk",     c:"#FF6B00", n:"orange"},
              {l:"success / safe",  c:"#00D68A", n:"green"},
            ].map(s => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: s.c, boxShadow: `0 0 14px ${s.c}80` }}/>
                <span style={{ fontSize: 12.5, color: "var(--fg-200)" }}>{s.l}</span>
                <span style={{ marginLeft: "auto" }} className="t-mono">{s.c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="frame" style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div className="t-eyebrow">02 · Voice</div>
              <div className="h-title" style={{ fontSize: 26, color: "#fff", marginTop: 4 }}>Typography</div>
            </div>
            <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)" }}>Space Grotesk · Inter · JetBrains Mono</span>
          </div>
          <DSTypeRow label="DISPLAY"  sample="Singularity"  font="Space Grotesk" size="56px" weight="500" tracking="-0.04em"/>
          <DSTypeRow label="TITLE"    sample="Zenith Seeing" font="Space Grotesk" size="28px" weight="500" tracking="-0.02em"/>
          <DSTypeRow label="BODY"     sample="Atmospheric clarity at 87% transparency." font="Inter" size="16px" weight="400" tracking="0"/>
          <DSTypeRow label="MONO"     sample="21.028°N · 105.85°E"  font="JetBrains Mono" size="14px" weight="500" tracking="0.02em"/>
          <DSTypeRow label="EYEBROW"  sample="GLOBAL SKY SCORE"     font="JetBrains Mono" size="11px" weight="500" tracking="0.18em"/>
        </div>

        {/* Components */}
        <div className="frame" style={{ padding: 32, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div className="t-eyebrow">03 · Instruments</div>
              <div className="h-title" style={{ fontSize: 26, color: "#fff", marginTop: 4 }}>Components</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {/* Buttons */}
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Buttons</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <button className="btn btn-primary"><Icon name="zap" size={14}/> Sync forecast</button>
                <button className="btn btn-violet"><Icon name="telescope" size={14}/> Run diagnostics</button>
                <button className="btn btn-ghost"><Icon name="refresh" size={14}/> Re-poll · 5m</button>
                <button className="btn" style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.4)", color: "#ff9b4d" }}><Icon name="alert" size={14}/> Override veto</button>
              </div>
            </div>
            {/* Chips */}
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Chips · States</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <span className="chip cyan"><span className="dot"/>NOMINAL</span>
                <span className="chip green"><span className="dot"/>SAFE · DEW 12%</span>
                <span className="chip orange"><span className="dot"/>CAUTION · MOON 86%</span>
                <span className="chip violet"><span className="dot"/>PRIORITY 01</span>
                <span className="chip" style={{ color: "#ff8aa0", background: "rgba(255,59,92,0.1)", borderColor: "rgba(255,59,92,0.3)" }}><span className="dot"/>VETOED · CLOUD</span>
              </div>
            </div>
            {/* Inputs */}
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Inputs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <Icon name="search" size={14}/>
                  <input className="input" placeholder="> 21.028, 105.85" style={{ paddingLeft: 16 }}/>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" defaultValue="80" style={{ flex: 1 }}/>
                  <input className="input" defaultValue="600" style={{ flex: 1 }}/>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["1H","12H","5D","30D"].map((t,i)=>(
                    <button key={t} className="btn-ghost btn" style={{ padding: "6px 12px", fontSize: 11, background: i===1?"rgba(0,240,255,0.12)":"rgba(255,255,255,0.03)", borderColor: i===1?"rgba(0,240,255,0.4)":"rgba(255,255,255,0.08)", color: i===1?"#7bf6ff":"var(--fg-300)"}}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Metric tile mini */}
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>Metric tile</div>
              <div className="frame" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(200px 100px at 110% -20%, rgba(0,240,255,0.12), transparent 60%)" }}/>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Icon name="eye" size={12}/>
                  <span className="t-eyebrow">SEEING</span>
                </div>
                <div className="h-display" style={{ fontSize: 36, color: "#fff", textShadow: "0 0 22px rgba(0,240,255,0.5)" }}>1.42<span className="t-mono" style={{ fontSize: 12, color: "var(--fg-400)", marginLeft: 4 }}>″</span></div>
                <div style={{ fontSize: 11, color: "var(--fg-400)", marginTop: 4 }}>Arc-seconds FWHM</div>
                <Sparkline points={[3,2.4,2,1.8,1.5,1.4,1.42]} color="#00f0ff" height={28}/>
              </div>
            </div>
          </div>

          <div className="divider" style={{ margin: "32px 0 24px" }}/>

          {/* Effects + grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>04 · Glass · Glow · Grain</div>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="glass" style={{ flex: 1, height: 90, padding: 14 }}>
                  <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)" }}>.glass</span>
                </div>
                <div className="frame" style={{ flex: 1, height: 90, padding: 14, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(200px 100px at 50% 110%, rgba(168,85,247,0.4), transparent 60%)"}}/>
                  <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)" }}>.glow</span>
                </div>
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>05 · Spacing · 4px base</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {[4,8,12,16,24,32,48].map(n => (
                  <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: n, height: n, background: "var(--cyan)", borderRadius: 2, boxShadow: `0 0 ${n/2}px var(--cyan-glow)` }}/>
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 14 }}>06 · Radii</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                {[4,8,12,16,20,28].map(n => (
                  <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(168,85,247,0.2))", borderRadius: n, border: "1px solid rgba(255,255,255,0.1)" }}/>
                    <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)" }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.DesignSystemArtboard = DesignSystemArtboard;
