/* Scanning page — full viewport loading state
   - Centered Gargantua
   - Telemetry log with typing effect below
   - Top bar: logo + coords + Red Vision toggle
   - Progress ring + abort hint
   - Entry/exit transitions */

const LOG_LINES = [
  { tag: "INIT",       text: "Accessing ECMWF & GFS global grid datasets",                         dur: 1400 },
  { tag: "PHYSICS",    text: "Constructing 5-layer atmospheric column model (1000hPa → 300hPa)",  dur: 1600 },
  { tag: "TURBULENCE", text: "Computing wind shear & refractive index structure (Cn²)",            dur: 1500 },
  { tag: "MODEL",      text: "Integrating Hufnagel-Valley (HV57) for Seeing (r₀)",                 dur: 1400 },
  { tag: "AI",         text: "Calibrating residual errors with Physics-Informed XGBoost",          dur: 1500 },
  { tag: "OK",         text: "Forecast ready · engaging Layer 1",                                   dur: 800  },
];

const TAG_COLORS = {
  warm: {
    INIT: "#7bf6ff", PHYSICS: "#c4a0fb", TURBULENCE: "#ffba50", MODEL: "#5cf2bd", AI: "#ff9b4d", OK: "#5cf2bd"
  },
  red: {
    INIT: "#ff5060", PHYSICS: "#ff5060", TURBULENCE: "#ff5060", MODEL: "#ff5060", AI: "#ff5060", OK: "#ff8090"
  }
};

const useTypewriter = (active, text, speed = 16, onDone) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!active) { setIdx(0); return; }
    if (idx >= text.length) { onDone && onDone(); return; }
    const t = setTimeout(() => setIdx(idx + 1), speed);
    return () => clearTimeout(t);
  }, [active, idx, text, speed]);
  return text.slice(0, idx);
};

const LogLine = ({ tag, text, active, done, red }) => {
  const colors = red ? TAG_COLORS.red : TAG_COLORS.warm;
  const typed = useTypewriter(active, text);
  return (
    <div style={{
      display: "flex", gap: 14, alignItems: "baseline",
      opacity: done ? 0.55 : (active ? 1 : 0),
      transition: "opacity 0.6s ease",
      animation: active ? "line-in 0.4s ease-out both" : "none",
      fontFamily: "'Roboto Mono', monospace",
      fontSize: 12.5,
      letterSpacing: "0.03em",
      lineHeight: 1.6
    }}>
      <span style={{
        display: "inline-flex",
        minWidth: 110, padding: "2px 8px",
        borderRadius: 4,
        background: `${colors[tag]}22`,
        border: `1px solid ${colors[tag]}55`,
        color: colors[tag],
        fontSize: 10.5, letterSpacing: "0.16em",
        justifyContent: "center"
      }}>{tag}</span>
      <span style={{ color: red ? "rgba(255,90,110,0.85)" : "rgba(255,255,255,0.72)", flex: 1 }}>
        {typed}
        {active && !done && <span className="cursor-blink" style={{ background: red ? "#ff5060" : "#7bf6ff" }}/>}
      </span>
    </div>
  );
};

const ProgressRing = ({ progress = 0, red = false }) => {
  const r = 96;
  const c = 2 * Math.PI * r;
  const dash = c * progress;
  const color = red ? "#ff5060" : "#7bf6ff";
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
      <circle cx="110" cy="110" r={r} fill="none" stroke={red ? "rgba(255,80,96,0.08)" : "rgba(255,255,255,0.06)"} strokeWidth="1.5"/>
      <circle cx="110" cy="110" r={r} fill="none" stroke={color} strokeWidth="1.5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        transform="rotate(-90 110 110)"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray 0.4s ease" }}/>
      {/* Tick marks every 30° */}
      {Array.from({length: 12}).map((_,i) => {
        const a = (i/12) * Math.PI * 2 - Math.PI/2;
        const x1 = 110 + Math.cos(a) * (r + 10);
        const y1 = 110 + Math.sin(a) * (r + 10);
        const x2 = 110 + Math.cos(a) * (r + 16);
        const y2 = 110 + Math.sin(a) * (r + 16);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red ? "rgba(255,80,96,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="1"/>;
      })}
    </svg>
  );
};

const TopBar = ({ red, setRed, lat, lon }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "22px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 30 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <SingularityMarkInline size={24}/>
      <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.01em" }}>Singularity</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "'Roboto Mono'", fontSize: 11, color: red ? "rgba(255,90,110,0.75)" : "rgba(255,255,255,0.55)", letterSpacing: "0.1em" }}>
      <span><span style={{ opacity: 0.55, marginRight: 8 }}>LAT</span>{lat.toFixed(4)}°N</span>
      <span><span style={{ opacity: 0.55, marginRight: 8 }}>LON</span>{lon.toFixed(4)}°E</span>
      <span><span style={{ opacity: 0.55, marginRight: 8 }}>UTC</span>02:14:38</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div onClick={() => setRed(!red)} style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 12px 5px 10px", borderRadius: 999, cursor: "pointer",
        background: red ? "rgba(255,59,92,0.12)" : "rgba(255,255,255,0.04)",
        border: red ? "1px solid rgba(255,59,92,0.4)" : "1px solid rgba(255,255,255,0.08)",
        color: red ? "#ff8aa0" : "rgba(255,255,255,0.5)"
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 500 }}>Red vision</span>
        <div style={{ width: 22, height: 12, borderRadius: 999, background: red ? "rgba(255,59,92,0.4)" : "rgba(255,255,255,0.1)", position: "relative" }}>
          <div style={{ position: "absolute", top: 1, left: red ? 11 : 1, width: 10, height: 10, borderRadius: 999, background: red ? "#ff8aa0" : "#fff", transition: "all .2s" }}/>
        </div>
      </div>
    </div>
  </div>
);

// Inline mark (avoids needing primitives.jsx)
const SingularityMarkInline = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <radialGradient id="sm-core" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#fff" stopOpacity="1"/>
        <stop offset="40%" stopColor="#00f0ff" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="sm-ring" x1="0" x2="1"><stop offset="0%" stopColor="#00f0ff"/><stop offset="100%" stopColor="#a855f7"/></linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14" stroke="url(#sm-ring)" strokeWidth="1" opacity="0.5"/>
    <ellipse cx="16" cy="16" rx="14" ry="5" stroke="url(#sm-ring)" strokeWidth="1" opacity="0.7" transform="rotate(-20 16 16)"/>
    <circle cx="16" cy="16" r="4" fill="url(#sm-core)"/>
  </svg>
);

const ScanningScreen = ({ red, setRed, onComplete, lat = 22.337, lon = 103.844 }) => {
  // Phase: enter (1.4s) → scanning (telemetry plays through) → exit (0.7s) → done
  const [phase, setPhase] = useState("enter");
  const [currentLine, setCurrentLine] = useState(-1);
  const [doneLines, setDoneLines] = useState([]);

  // Enter → scanning
  useEffect(() => {
    if (phase === "enter") {
      const t = setTimeout(() => { setPhase("main"); setCurrentLine(0); }, 1300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Play log lines in sequence
  useEffect(() => {
    if (phase !== "main" || currentLine < 0) return;
    if (currentLine >= LOG_LINES.length) {
      // All done — kick off exit transition
      const t = setTimeout(() => setPhase("exit"), 600);
      return () => clearTimeout(t);
    }
    const line = LOG_LINES[currentLine];
    const totalDur = line.text.length * 16 + 200; // typing time + pause
    const t = setTimeout(() => {
      setDoneLines(d => [...d, currentLine]);
      setCurrentLine(c => c + 1);
    }, Math.max(line.dur, totalDur));
    return () => clearTimeout(t);
  }, [phase, currentLine]);

  // Exit → callback
  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => { onComplete && onComplete(); }, 650);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const progress = Math.min(1, (doneLines.length + (currentLine >= 0 ? 0.5 : 0)) / LOG_LINES.length);

  const gargPhase = phase === "enter" ? "enter" : (phase === "exit" ? "exit" : "main");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      animation: phase === "exit" ? "fadeOutBg 0.7s ease forwards" : "none"
    }}>
      {/* Subtle background nebula */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: red
          ? "radial-gradient(900px 600px at 50% 45%, rgba(255,30,50,0.10), transparent 60%), radial-gradient(700px 500px at 20% 80%, rgba(120,10,20,0.08), transparent 60%)"
          : "radial-gradient(900px 600px at 50% 45%, rgba(255,140,40,0.07), transparent 60%), radial-gradient(700px 500px at 80% 80%, rgba(168,85,247,0.06), transparent 60%)",
        opacity: phase === "exit" ? 0 : 1, transition: "opacity 0.7s"
      }}/>

      <TopBar red={red} setRed={setRed} lat={lat} lon={lon}/>

      {/* Gargantua centered in upper area */}
      <div style={{ flex: "1 1 auto", position: "relative", minHeight: 0, marginTop: 8 }}>
        <Gargantua
          size={typeof window !== "undefined"
            ? Math.max(360, Math.min(520, Math.min(window.innerWidth * 0.5, window.innerHeight - 380)))
            : 480}
          red={red}
          phase={gargPhase}/>
      </div>

      {/* Telemetry log */}
      <div style={{
        flex: "0 0 auto",
        width: 760, maxWidth: "92vw",
        margin: "0 auto",
        padding: "0 0 64px",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.4s"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <div>
            <div style={{
              fontFamily: "'Roboto Mono'", fontSize: 10.5, letterSpacing: "0.22em",
              color: red ? "rgba(255,90,110,0.65)" : "rgba(255,255,255,0.45)"
            }}>SINGULARITY ENGINE · v3.1</div>
            <div style={{
              fontFamily: "'Instrument Serif', serif", fontSize: 26, marginTop: 4,
              color: red ? "rgba(255,120,140,0.95)" : "rgba(255,255,255,0.92)",
              letterSpacing: "-0.01em"
            }}>
              Computing the night sky<span style={{ fontStyle: "italic" }}>…</span>
            </div>
          </div>
          <div style={{
            fontFamily: "'Roboto Mono'", fontSize: 11, letterSpacing: "0.1em",
            color: red ? "rgba(255,90,110,0.6)" : "rgba(255,255,255,0.45)"
          }}>
            {Math.round(progress * 100)}% · {doneLines.length}/{LOG_LINES.length}
          </div>
        </div>

        {/* Lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 180 }}>
          {LOG_LINES.map((l, i) => (
            <LogLine key={i}
              tag={l.tag}
              text={l.text}
              active={i <= currentLine}
              done={doneLines.includes(i)}
              red={red}/>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 18, height: 2, borderRadius: 1, background: red ? "rgba(255,80,96,0.1)" : "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress * 100}%`,
            background: red ? "linear-gradient(90deg, #ff2040, #ff8aa0)" : "linear-gradient(90deg, #00f0ff, #a855f7, #ff6b00)",
            boxShadow: red ? "0 0 8px #ff5060" : "0 0 8px #00f0ff",
            transition: "width 0.4s ease"
          }}/>
        </div>

        {/* Abort hint */}
        <div style={{
          marginTop: 22, textAlign: "center",
          fontFamily: "'Roboto Mono'", fontSize: 10.5, letterSpacing: "0.18em",
          color: red ? "rgba(255,90,110,0.4)" : "rgba(255,255,255,0.3)"
        }}>
          PRESS <span style={{ padding: "1px 6px", borderRadius: 3, background: red ? "rgba(255,80,96,0.08)" : "rgba(255,255,255,0.08)", color: red ? "rgba(255,140,160,0.7)" : "rgba(255,255,255,0.5)" }}>ESC</span> TO ABORT · <span style={{ padding: "1px 6px", borderRadius: 3, background: red ? "rgba(255,80,96,0.08)" : "rgba(255,255,255,0.08)", color: red ? "rgba(255,140,160,0.7)" : "rgba(255,255,255,0.5)" }}>R</span> TO REPLAY
        </div>
      </div>
    </div>
  );
};

window.ScanningScreen = ScanningScreen;
