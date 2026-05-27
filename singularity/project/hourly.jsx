/* Hourly forecast table — detailed */

const HourlyArtboard = () => {
  const rows = [
    {hr:"18:00", icon:"cloud", score:1.2, see:3.4, trans:32, sqm:18.2, dew:48, wind:18, temp:24.2, humid:88, cloud:72, jet:42, veto:"cloud cover > 50%", tone:"red"},
    {hr:"19:00", icon:"cloud", score:2.1, see:2.8, trans:45, sqm:18.6, dew:42, wind:14, temp:22.8, humid:82, cloud:48, jet:38, tone:"red"},
    {hr:"20:00", icon:"sparkle", score:4.0, see:2.2, trans:58, sqm:19.4, dew:34, wind:10, temp:21.4, humid:74, cloud:24, jet:32, tone:"orange"},
    {hr:"21:00", icon:"sparkle", score:5.6, see:1.9, trans:68, sqm:20.0, dew:24, wind:8, temp:19.8, humid:66, cloud:14, jet:28, tone:"orange"},
    {hr:"22:00", icon:"sparkle", score:6.8, see:1.6, trans:76, sqm:20.4, dew:18, wind:7, temp:18.6, humid:60, cloud:8, jet:24, tone:"violet"},
    {hr:"23:00", icon:"sparkle", score:7.4, see:1.4, trans:82, sqm:20.6, dew:14, wind:6, temp:17.8, humid:56, cloud:4, jet:22, tone:"cyan"},
    {hr:"00:00", icon:"sparkle", score:7.8, see:1.3, trans:88, sqm:20.8, dew:12, wind:6, temp:17.4, humid:54, cloud:2, jet:20, peak:true, tone:"cyan"},
    {hr:"01:00", icon:"sparkle", score:7.6, see:1.4, trans:86, sqm:20.7, dew:14, wind:7, temp:17.2, humid:55, cloud:4, jet:22, peak:true, tone:"cyan"},
    {hr:"02:00", icon:"sparkle", score:6.9, see:1.6, trans:78, sqm:20.4, dew:18, wind:8, temp:17.0, humid:60, cloud:12, jet:26, tone:"violet"},
    {hr:"03:00", icon:"moon", score:5.2, see:1.9, trans:64, sqm:20.0, dew:28, wind:10, temp:17.0, humid:68, cloud:24, jet:30, tone:"orange"},
    {hr:"04:00", icon:"moon", score:3.4, see:2.4, trans:48, sqm:19.4, dew:42, wind:12, temp:17.2, humid:78, cloud:48, jet:34, tone:"orange"},
    {hr:"05:00", icon:"cloud", score:1.8, see:3.1, trans:31, sqm:18.6, dew:58, wind:16, temp:17.6, humid:88, cloud:74, jet:42, veto:"dew risk > 50%", tone:"red"},
  ];

  const ScoreBar = ({ v, peak }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="h-display" style={{ fontSize: 22, color: peak ? "#7bf6ff" : "#fff", textShadow: peak ? "0 0 12px rgba(0,240,255,0.5)" : "none" }}>{v.toFixed(1)}</span>
      <div style={{ position: "relative", width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${v*10}%`,
          background: peak ? "linear-gradient(90deg, #00f0ff, #a855f7)" : (v >= 5 ? "rgba(168,85,247,0.6)" : "rgba(255,107,0,0.6)"),
          borderRadius: 3, boxShadow: peak ? "0 0 8px rgba(0,240,255,0.5)" : "none"
        }}/>
      </div>
    </div>
  );

  const Cell = ({ v, unit, color, good, bad }) => {
    const isGood = good ? v <= good : (bad ? v >= bad : false);
    return (
      <span style={{ color: color || (isGood ? "var(--fg-200)" : "var(--fg-300)") }}>
        <span className="t-mono" style={{ fontSize: 13 }}>{v}</span>
        {unit && <span className="t-mono" style={{ fontSize: 10, color: "var(--fg-500)", marginLeft: 2 }}>{unit}</span>}
      </span>
    );
  };

  const toneColor = {
    cyan: "#7bf6ff", violet: "#c4a0fb", orange: "#ff9b4d", red: "#ff8aa0"
  };

  return (
    <div className="sg-bg" style={{ width: "100%", height: "100%", fontFamily: "var(--f-body)", overflow: "hidden" }}>
      <DashboardTopBar/>

      <div style={{ padding: "32px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>HOURLY FORECAST · MINUTE PRECISION</div>
            <div className="h-display" style={{ fontSize: 48, color: "#fff", lineHeight: 1 }}>
              <span className="t-mono" style={{ color: "#7bf6ff", fontSize: 48 }}>22:14 → 02:48</span> · viable.
            </div>
            <div style={{ marginTop: 12, color: "var(--fg-300)", fontSize: 14 }}>
              12 model agreement <span className="t-mono" style={{ color: "#c4a0fb" }}>94%</span> · last poll <span className="t-mono">02:14 UTC</span> · next poll <span className="t-mono">02:19</span>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost"><Icon name="calendar" size={13}/> 27 May</button>
            <button className="btn btn-ghost"><Icon name="share" size={13}/> Export CSV</button>
            <button className="btn btn-primary"><Icon name="refresh" size={13}/> Re-poll models</button>
          </div>
        </div>

        {/* Summary banner */}
        <div className="frame" style={{ padding: "18px 24px", marginBottom: 20, display: "flex", gap: 36, alignItems: "center", background: "linear-gradient(90deg, rgba(0,240,255,0.06), rgba(168,85,247,0.04) 60%, transparent)" }}>
          <div>
            <div className="t-eyebrow">VIABLE WINDOW</div>
            <div className="h-display" style={{ fontSize: 24, color: "#7bf6ff" }}>4h 34m</div>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }}/>
          <div>
            <div className="t-eyebrow">PEAK · 00:30</div>
            <div className="h-display" style={{ fontSize: 24, color: "#fff" }}>Sky 7.8 · See 1.3″</div>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }}/>
          <div>
            <div className="t-eyebrow">MOON · TONIGHT</div>
            <div className="h-display" style={{ fontSize: 24, color: "#ff9b4d" }}>86% · sets 04:12</div>
          </div>
          <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }}/>
          <div>
            <div className="t-eyebrow">VETOES</div>
            <div className="h-display" style={{ fontSize: 24, color: "#ff8aa0" }}>2 hrs · cloud · dew</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <span className="chip cyan"><span className="dot pulse"/>LIVE</span>
            <span className="chip violet">12 / 12 MODELS</span>
          </div>
        </div>

        {/* Table */}
        <div className="frame" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "70px 64px 1.2fr 70px 70px 70px 70px 70px 70px 70px 70px 60px", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--fg-500)", textTransform: "uppercase" }}>
            <span>HOUR</span><span></span><span>SKY SCORE</span><span>SEEING</span><span>TRANS</span><span>SQM</span><span>DEW</span><span>WIND</span><span>TEMP</span><span>HUMID</span><span>CLOUD</span><span style={{textAlign:"right"}}>JET</span>
          </div>

          {rows.map((r,i) => (
            <div key={r.hr} style={{
              display: "grid",
              gridTemplateColumns: "70px 64px 1.2fr 70px 70px 70px 70px 70px 70px 70px 70px 60px",
              padding: "16px 24px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: r.peak ? "linear-gradient(90deg, rgba(0,240,255,0.06), transparent)" : "transparent",
              alignItems: "center",
              position: "relative"
            }}>
              {r.peak && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg, #00f0ff, #a855f7)", boxShadow: "0 0 14px #00f0ff" }}/>}
              <span className="t-mono" style={{ fontSize: 14, color: r.peak ? "#7bf6ff" : "#fff", fontWeight: 500 }}>{r.hr}</span>
              <span style={{ color: toneColor[r.tone] }}><Icon name={r.icon} size={18}/></span>
              <ScoreBar v={r.score} peak={r.peak}/>
              <Cell v={r.see} unit="″" color={r.see <= 1.5 ? "#7bf6ff" : (r.see >= 2.5 ? "#ff9b4d" : null)}/>
              <Cell v={r.trans} unit="%" color={r.trans >= 80 ? "#7bf6ff" : (r.trans <= 40 ? "#ff9b4d" : null)}/>
              <Cell v={r.sqm}/>
              <Cell v={r.dew} unit="%" color={r.dew >= 50 ? "#ff8aa0" : null}/>
              <Cell v={r.wind} unit="km/h"/>
              <Cell v={r.temp} unit="°"/>
              <Cell v={r.humid} unit="%"/>
              <Cell v={r.cloud} unit="%" color={r.cloud >= 50 ? "#ff8aa0" : (r.cloud <= 10 ? "#5cf2bd" : null)}/>
              <Cell v={r.jet} unit="kt"/>
            </div>
          ))}
        </div>

        {/* Footer notes */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11.5, color: "var(--fg-500)" }} className="t-mono">
          <span>Sources · ECMWF · GFS · METAR · SAT-A · ATM-7.2</span>
          <span>Veto thresholds · cloud {">"} 50% · dew {">"} 50% · wind {">"} 30km/h · seeing {">"} 4″</span>
        </div>
      </div>
    </div>
  );
};

window.HourlyArtboard = HourlyArtboard;
