/* Gear Check & Resolution Limits */

const GearArtboard = () => {

  const ResLimitDial = ({ label, value, max, color, sub, big }) => {
    const pct = Math.min(1, value / max);
    const r = big ? 78 : 62, c = 2 * Math.PI * r;
    const dash = c * pct;
    return (
      <div style={{ position: "relative", width: big ? 200 : 160, height: big ? 200 : 160 }}>
        <svg width={big?200:160} height={big?200:160} viewBox={`0 0 ${big?200:160} ${big?200:160}`}>
          <circle cx={big?100:80} cy={big?100:80} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none"/>
          <circle cx={big?100:80} cy={big?100:80} r={r} stroke={color} strokeWidth="6" fill="none" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform={`rotate(-90 ${big?100:80} ${big?100:80})`} style={{filter: `drop-shadow(0 0 6px ${color})`}}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="h-display" style={{ fontSize: big ? 32 : 24, color: "#fff" }}>{value}</div>
            <div className="t-mono" style={{ fontSize: 10, color: "var(--fg-400)", marginTop: 2 }}>{sub}</div>
          </div>
        </div>
        <div className="t-eyebrow" style={{ position: "absolute", top: -12, left: 0, right: 0, textAlign: "center" }}>{label}</div>
      </div>
    );
  };

  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", fontFamily: "var(--f-body)", overflow: "hidden" }}>
      <DashboardTopBar/>

      <div style={{ padding: "32px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>GEAR CHECK · RESOLUTION LIMITS</div>
            <div className="h-display" style={{ fontSize: 48, color: "#fff", lineHeight: 1 }}>
              Your rig pulls <span style={{ background: "linear-gradient(90deg,#a855f7,#00f0ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>1.45″/px</span> tonight.
            </div>
            <div style={{ marginTop: 12, color: "var(--fg-300)", fontSize: 14 }}>
              Seeing-limited · Dawes 1.45″ · sampling matches atmosphere within <span className="t-mono" style={{color: "#5cf2bd"}}>±0.05″</span>. Run diagnostics for full stack.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span className="chip green"><Icon name="check" size={11}/>WELL-MATCHED</span>
            <button className="btn btn-violet"><Icon name="telescope" size={13}/> Run diagnostics</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24, marginBottom: 24 }}>
          {/* Gear configurator */}
          <div className="frame" style={{ padding: 28 }}>
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>01 · CONFIGURATION</div>
            <div className="h-title" style={{ fontSize: 22, color: "#fff", marginBottom: 22 }}>Optical train</div>

            {[
              {label:"APERTURE", v:"80", unit:"mm", spec:"FPL-53 triplet · APM"},
              {label:"FOCAL LENGTH", v:"600", unit:"mm", spec:"f/7.5 native"},
              {label:"EYEPIECE / SENSOR", v:"25", unit:"mm", spec:"3.76 µm · IMX571"},
              {label:"BARLOW", v:"1.0", unit:"×", spec:"none active"},
            ].map(r => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ flex: 1 }}>
                  <div className="t-eyebrow">{r.label}</div>
                  <div className="t-mono" style={{ fontSize: 11, color: "var(--fg-500)", marginTop: 4 }}>{r.spec}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", minWidth: 130, justifyContent: "space-between" }}>
                  <button style={{ background: "none", border: "none", color: "var(--fg-400)", cursor: "pointer", fontSize: 16 }}>−</button>
                  <div style={{ textAlign: "center" }}>
                    <span className="t-mono" style={{ fontSize: 18, color: "#fff" }}>{r.v}</span>
                    <span className="t-mono" style={{ fontSize: 11, color: "var(--fg-400)", marginLeft: 4 }}>{r.unit}</span>
                  </div>
                  <button style={{ background: "none", border: "none", color: "var(--fg-400)", cursor: "pointer", fontSize: 16 }}>+</button>
                </div>
              </div>
            ))}

            <div className="divider" style={{ margin: "16px 0" }}/>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>PRESETS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Visual · 80ED","Wide · Samyang 135","Planetary · C8","Deep · RC10","Mosaic · ASI2600"].map((p,i)=>(
                <span key={p} className="chip" style={{ background: i===0 ? "rgba(168,85,247,0.14)" : "rgba(255,255,255,0.03)", borderColor: i===0 ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)", color: i===0 ? "#c4a0fb" : "var(--fg-300)" }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Limits & diagnostics */}
          <div className="frame" style={{ padding: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(500px 300px at 100% 0%, rgba(0,240,255,0.08), transparent 60%)"}}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div className="t-eyebrow">02 · COMPUTED LIMITS</div>
                <div className="h-title" style={{ fontSize: 22, color: "#fff", marginTop: 4 }}>Resolution stack</div>
              </div>
              <span className="chip cyan"><span className="dot"/>SEEING-LIMITED</span>
            </div>

            <div style={{ display: "flex", gap: 28, alignItems: "center", justifyContent: "space-between", marginTop: 28, marginBottom: 28, flexWrap: "wrap" }}>
              <ResLimitDial label="DAWES" value="1.45″" max={3} color="#a855f7" sub="theoretical · 80mm" big/>
              <ResLimitDial label="RAYLEIGH" value="1.74″" max={3} color="#a855f7" sub="diffraction"/>
              <ResLimitDial label="SAMPLING" value="1.29″/px" max={3} color="#00f0ff" sub="3.76 µm @ 600mm"/>
              <ResLimitDial label="ATMOSPHERE" value="1.30″" max={3} color="#00f0ff" sub="tonight @ 00:30"/>
            </div>

            <div className="divider" style={{ margin: "10px 0 22px" }}/>

            {/* Match band */}
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>SAMPLING ↔ SEEING MATCH</div>
            <div style={{ position: "relative", height: 64, borderRadius: 12, background: "linear-gradient(90deg, rgba(255,107,0,0.2), rgba(0,214,138,0.2) 30%, rgba(0,214,138,0.2) 70%, rgba(255,107,0,0.2))", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "20%", right: "20%", top: 0, bottom: 0, background: "rgba(0,240,255,0.06)", borderLeft: "1px dashed rgba(0,240,255,0.4)", borderRight: "1px dashed rgba(0,240,255,0.4)" }}/>
              <div style={{ position: "absolute", left: "45%", top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg, #00f0ff, #a855f7)", boxShadow: "0 0 12px rgba(0,240,255,0.8)" }}/>
              <div style={{ position: "absolute", left: "calc(45% + 14px)", top: 14, color: "#7bf6ff" }} className="t-mono">
                <div style={{ fontSize: 11 }}>YOU · 1.45″/PX</div>
                <div style={{ fontSize: 10, color: "var(--fg-400)", marginTop: 2 }}>Δ 0.05″ from optimal</div>
              </div>
              <div style={{ position: "absolute", left: 12, bottom: 6, fontSize: 9.5, color: "var(--fg-500)" }} className="t-mono">UNDER 0.5″/PX</div>
              <div style={{ position: "absolute", right: 12, bottom: 6, fontSize: 9.5, color: "var(--fg-500)" }} className="t-mono">OVER 3″/PX</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 }}>
              {[
                {l: "FIELD OF VIEW", v:"3.5°", s:"diagonal"},
                {l: "PIXEL SCALE", v:"1.29″/px", s:"native"},
                {l: "EXP / SUB", v:"180 s", s:"recommended @ ISO 200"},
              ].map(s => (
                <div key={s.l} style={{ padding: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}>
                  <div className="t-eyebrow">{s.l}</div>
                  <div className="h-display" style={{ fontSize: 22, color: "#fff", marginTop: 4 }}>{s.v}</div>
                  <div className="t-mono" style={{ fontSize: 10.5, color: "var(--fg-500)", marginTop: 2 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostics output */}
        <div className="frame" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="t-eyebrow">03 · DIAGNOSTICS · LIVE</div>
              <div className="h-title" style={{ fontSize: 20, color: "#fff", marginTop: 2 }}>System advisory</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="chip green"><Icon name="check" size={11}/>3 PASS</span>
              <span className="chip orange"><Icon name="alert" size={11}/>1 ADVISORY</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[
              {tone:"green", icon:"check", t:"Sampling matches atmosphere", d:"1.29″/px against 1.30″ seeing — Nyquist within 0.05″. No drizzle needed."},
              {tone:"green", icon:"check", t:"Dew point 4.2°C below ambient", d:"Heater band optional. Optics safe through 04:30."},
              {tone:"green", icon:"check", t:"Field rotation < 0.4°/min", d:"Unguided 180s exposures viable at f/7.5. PHD2 not required."},
              {tone:"orange", icon:"alert", t:"Light pollution gradient", d:"Bortle 4 zone · 16% gradient SE. Recommend dithering ≥ 5 px / sub."},
            ].map((a,i) => {
              const colorMap = {green:{bg:"rgba(0,214,138,0.06)", border:"rgba(0,214,138,0.3)", fg:"#5cf2bd"}, orange:{bg:"rgba(255,107,0,0.06)", border:"rgba(255,107,0,0.3)", fg:"#ff9b4d"}};
              const c = colorMap[a.tone];
              return (
                <div key={i} style={{ padding: "16px 18px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, display: "flex", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", color: c.fg, flexShrink: 0 }}>
                    <Icon name={a.icon} size={16}/>
                  </div>
                  <div>
                    <div className="h-title" style={{ fontSize: 14.5, color: "#fff" }}>{a.t}</div>
                    <div style={{ fontSize: 12.5, color: "var(--fg-300)", marginTop: 4 }}>{a.d}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Console output */}
          <div style={{ marginTop: 16, padding: 16, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontFamily: "var(--f-mono)", fontSize: 11.5, lineHeight: 1.8 }}>
            <div style={{ color: "var(--fg-500)" }}>$ singularity diagnostics --target=M51 --gear=80ED --exp=180</div>
            <div style={{ color: "#7bf6ff" }}>[02:14:08] ✓ Optics: 80mm f/7.5 · 600mm focal · 3.76µm sensor</div>
            <div style={{ color: "#7bf6ff" }}>[02:14:08] ✓ Pixel scale: 1.29″/px · target 1.0–1.5″/px</div>
            <div style={{ color: "#c4a0fb" }}>[02:14:09] · Atmosphere: 1.30″ seeing @ 00:30 (Kolmogorov fit r=0.98)</div>
            <div style={{ color: "#c4a0fb" }}>[02:14:09] · Sky: SQM 20.8 · Bortle 4 · transparency 88%</div>
            <div style={{ color: "#5cf2bd" }}>[02:14:10] ✓ Dew margin: 4.2°C · safe</div>
            <div style={{ color: "#ff9b4d" }}>[02:14:10] ! Gradient: +16% SE · recommend dither ≥ 5px</div>
            <div style={{ color: "#fff" }}>[02:14:11] → Final score: <span style={{ color: "#7bf6ff" }}>7.8 / 10</span> · OPTIMAL</div>
            <div style={{ color: "var(--fg-500)", marginTop: 6 }}>$ <span className="flicker" style={{ background: "#7bf6ff", display: "inline-block", width: 8, height: 14, verticalAlign: "middle" }}/></div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.GearArtboard = GearArtboard;
