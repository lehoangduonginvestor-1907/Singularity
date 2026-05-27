/* Mount + Tweaks panel for the Scanning prototype */

const App = () => {
  const [red, setRed] = useState(false);
  const [runId, setRunId] = useState(0);    // remount key to replay
  const [finished, setFinished] = useState(false);
  const [showTweaks, setShowTweaks] = useState(true);

  // Listen for Esc to "abort"
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { setFinished(true); }
      if (e.key === "r" || e.key === "R") { replay(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const replay = () => { setFinished(false); setRunId(r => r + 1); };

  return (
    <>
      {!finished && (
        <ScanningScreen
          key={runId}
          red={red}
          setRed={setRed}
          onComplete={() => setFinished(true)}
          lat={22.337} lon={103.844}
        />
      )}

      {finished && (
        <div style={{
          position: "fixed", inset: 0,
          background: red ? "linear-gradient(180deg, #1a0010, #050003)" : "linear-gradient(180deg, #0a0a0c, #050608)",
          display: "grid", placeItems: "center",
          color: red ? "rgba(255,140,160,0.9)" : "#fff",
          fontFamily: "'Plus Jakarta Sans'",
          animation: "fade-in-bg 0.5s ease-out"
        }}>
          <style>{`@keyframes fade-in-bg { from { opacity: 0 } to { opacity: 1 } }`}</style>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Roboto Mono'", fontSize: 11, letterSpacing: "0.22em",
              color: red ? "rgba(255,90,110,0.7)" : "rgba(255,255,255,0.5)",
              marginBottom: 12
            }}>LAYER 1 · DASHBOARD READY</div>
            <div style={{
              fontFamily: "'Instrument Serif'", fontSize: 64, lineHeight: 1, letterSpacing: "-0.02em",
              color: red ? "rgba(255,140,160,1)" : "#fff"
            }}>
              Conditions improve to <span style={{ fontStyle: "italic", color: red ? "#ff8aa0" : "#7bf6ff" }}>excellent</span> at <span style={{ fontFamily: "'Roboto Mono'", fontSize: 48, color: red ? "#ff8aa0" : "#7bf6ff" }}>00:30</span>.
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={replay} style={{
                padding: "12px 24px", borderRadius: 999,
                background: red ? "rgba(255,80,96,0.16)" : "rgba(0,240,255,0.16)",
                border: red ? "1px solid rgba(255,80,96,0.4)" : "1px solid rgba(0,240,255,0.4)",
                color: red ? "#ff8aa0" : "#7bf6ff",
                fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, fontSize: 13,
                cursor: "pointer"
              }}>↻ Replay scan</button>
              <button onClick={() => setRed(!red)} style={{
                padding: "12px 24px", borderRadius: 999,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Plus Jakarta Sans'", fontWeight: 500, fontSize: 13,
                cursor: "pointer"
              }}>Toggle Red Vision</button>
            </div>
          </div>
        </div>
      )}

      {/* Tweaks pill — bottom-right */}
      <div style={{
        position: "fixed", right: 16, bottom: 16, zIndex: 100,
        display: "flex", gap: 8, alignItems: "center",
        padding: "8px 12px", borderRadius: 999,
        background: "rgba(8,10,14,0.85)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "'Roboto Mono'", fontSize: 11, color: "rgba(255,255,255,0.6)"
      }}>
        <span style={{ letterSpacing: "0.14em" }}>TWEAKS</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <button onClick={replay} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", padding: "3px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>↻ replay</button>
        <button onClick={() => setRed(!red)} style={{
          background: red ? "rgba(255,80,96,0.18)" : "rgba(255,255,255,0.06)",
          border: red ? "1px solid rgba(255,80,96,0.4)" : "1px solid rgba(255,255,255,0.1)",
          color: red ? "#ff8aa0" : "rgba(255,255,255,0.8)",
          padding: "3px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 11
        }}>red vision {red ? "ON" : "OFF"}</button>
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
