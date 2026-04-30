import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DebugConsole from './DebugConsole';
import VisibilityWindow from './VisibilityWindow';
import GearPanel from './GearPanel';
import SitePlanner from './SitePlanner';

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const G = {
  card: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '28px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease',
  },
};

/* ─── STARFIELD ──────────────────────────────────────────────────────────── */
const stars = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 5,
  dur: Math.random() * 3 + 2,
}));

const Starfield = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {stars.map(s => (
      <div key={s.id} style={{
        position: 'absolute', top: s.top, left: s.left,
        width: s.size, height: s.size, borderRadius: '50%',
        background: 'white', opacity: 0.6,
        animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
      }} />
    ))}
    {/* Nebula glows */}
    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,40,190,0.22) 0%, transparent 70%)', filter:'blur(60px)' }} />
    <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', filter:'blur(80px)' }} />
    <div style={{ position:'absolute', top:'40%', right:'20%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(30,58,138,0.2) 0%, transparent 70%)', filter:'blur(60px)' }} />
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      @keyframes twinkle { 0%,100%{opacity:.2} 50%{opacity:.9} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes scanline { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
      * { box-sizing: border-box; }
    `}</style>
  </div>
);

/* ─── METRIC CARD ────────────────────────────────────────────────────────── */
const MetricCard = ({ label, value, unit='', color='#22d3ee', sub='', float=false, delay=0 }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...G.card,
        animation: float ? `float 6s ${delay}s ease-in-out infinite` : 'none',
        boxShadow: hov ? `0 0 40px rgba(${color === '#22d3ee' ? '34,211,238' : '167,139,250'},0.15), 0 20px 60px rgba(0,0,0,0.4)` : '0 8px 32px rgba(0,0,0,0.3)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div style={{ position:'absolute', inset:0, borderRadius:24, background:`radial-gradient(circle at 30% 20%, ${color}10 0%, transparent 60%)`, pointerEvents:'none' }} />
      <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:'0.15em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>{label}</p>
      <div style={{ marginTop:14, display:'flex', alignItems:'baseline', gap:6 }}>
        <span style={{ fontSize:42, fontWeight:700, lineHeight:1, color:'white', fontVariantNumeric:'tabular-nums' }}>{value}</span>
        {unit && <span style={{ fontSize:18, color:'rgba(255,255,255,0.35)', fontWeight:300 }}>{unit}</span>}
      </div>
      {sub && <p style={{ margin:'10px 0 0', fontSize:12, color }}>{sub}</p>}
    </div>
  );
};

/* ─── GLOWING BUTTON ─────────────────────────────────────────────────────── */
const GlowBtn = ({ children, onClick, loading=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: 'none', cursor: 'pointer', borderRadius: 14,
        padding: '12px 28px', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
        letterSpacing: '0.08em', color: 'white',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
        boxShadow: hov ? '0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(14,165,233,0.3)' : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hov ? 'translateY(-2px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        display: 'flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
      }}
    >
      {loading && (
        <div style={{ position:'absolute', top:0, bottom:0, left:0, width:'40%', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation:'scanline 1.2s ease-in-out infinite' }} />
      )}
      {children}
    </button>
  );
};

/* ─── TOOLTIP ────────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(15,15,30,0.9)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'12px 18px' }}>
      <p style={{ margin:'0 0 8px', fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>{label} UTC</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i < payload.length-1 ? 4 : 0 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: p.color }} />
          <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', flex:1 }}>{p.name}</span>
          <span style={{ fontSize:14, fontWeight:700, color:'white', fontVariantNumeric:'tabular-nums' }}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── TARGET CARD ────────────────────────────────────────────────────────── */
const TargetCard = ({ target, onClick }) => {
  const [hov, setHov] = useState(false);
  const pct = (target.Score / 10) * 100;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...G.card, padding: '18px 22px', cursor: 'pointer',
        background: hov ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.02)',
        borderColor: hov ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)',
        transform: hov ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: hov ? '0 0 20px rgba(34,211,238,0.08)' : 'none',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <p style={{ margin:0, fontSize:14, fontWeight:600, color:'white' }}>{target.Target}</p>
          <p style={{ margin:'4px 0 0', fontSize:11, color:'rgba(255,255,255,0.35)' }}>
            {target.Type} &nbsp;·&nbsp; Mag {target.Mag} &nbsp;·&nbsp; Alt {target.Altitude}°
          </p>
        </div>
        <div style={{ background:'rgba(34,211,238,0.1)', border:'1px solid rgba(34,211,238,0.2)', borderRadius:10, padding:'4px 10px', fontSize:14, fontWeight:700, color:'#22d3ee', fontVariantNumeric:'tabular-nums' }}>
          {target.Score}
        </div>
      </div>
      <div style={{ height:3, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:'linear-gradient(90deg, #22d3ee, #6366f1)', boxShadow:'0 0 8px rgba(34,211,238,0.5)', transition:'width 0.8s cubic-bezier(0.23,1,0.32,1)' }} />
      </div>
    </div>
  );
};

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: '🔭 Dashboard', icon: '🔭' },
  { id: 'planner',   label: '🗺 Site Planner', icon: '🗺' },
];

export default function App() {
  const [lat, setLat] = useState(20.886355);
  const [lon, setLon] = useState(105.755763);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalData, setGlobalData] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fLoading, setFLoading] = useState(false);
  const [error, setError] = useState('');

  const scan = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`http://localhost:8000/api/global-sky?lat=${lat}&lon=${lon}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setGlobalData(d);
      if (d.catalog_names?.length) setTargetName(d.catalog_names[0]);
    } catch(e) { setError(`Backend error: ${e.message}. Is FastAPI running on port 8000?`); }
    setLoading(false);
  };

  const fetchForecast = async (name) => {
    if (!name) return;
    setFLoading(true);
    try {
      const r = await fetch(`http://localhost:8000/api/target-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(name)}`);
      const d = await r.json();
      setForecast(d.forecast);
    } catch(e) { console.error(e); }
    setFLoading(false);
  };

  useEffect(() => { scan(); }, []);
  useEffect(() => { fetchForecast(targetName); }, [targetName]);

  const zm = globalData?.zenith_metrics;

  return (
    <div style={{ minHeight:'100vh', background:'#050812', fontFamily:"'Inter', sans-serif", color:'white', position:'relative' }}>
      <Starfield />

      <div style={{ position:'relative', zIndex:1, maxWidth:1280, margin:'0 auto', padding:'32px 24px' }}>

        {/* ── HEADER ── */}
        <div style={{ ...G.card, marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, padding:'20px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg, #0ea5e9, #6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 0 24px rgba(99,102,241,0.5)' }}>🔭</div>
            <div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, background:'linear-gradient(135deg, #e0f2fe, #c7d2fe)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>INTERSTELLAR</h1>
              <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.2em', fontWeight:600 }}>FORECAST ENGINE V3</p>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'10px 16px' }}>
              <span style={{ fontSize:14 }}>📍</span>
              <input type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value))} style={{ background:'none', border:'none', outline:'none', color:'white', width:80, textAlign:'center', fontFamily:'inherit', fontSize:13 }} />
              <div style={{ width:1, height:20, background:'rgba(255,255,255,0.1)' }} />
              <input type="number" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} style={{ background:'none', border:'none', outline:'none', color:'white', width:80, textAlign:'center', fontFamily:'inherit', fontSize:13 }} />
            </div>
            <GlowBtn onClick={scan} loading={loading}>
              {loading ? '⟳ SCANNING...' : '⚡ SCAN'}
            </GlowBtn>
          </div>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: activeTab === tab.id ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '8px 18px', fontFamily: 'inherit',
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab.id ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab.id ? '#00e5ff' : 'rgba(255,255,255,0.45)',
                boxShadow: activeTab === tab.id ? '0 0 16px rgba(0,229,255,0.15)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            {error && (
              <div style={{ ...G.card, marginBottom:24, borderColor:'rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.05)', color:'#fca5a5', fontSize:13 }}>
                ⚠ {error}
              </div>
            )}

            {loading && !globalData && (
              <div style={{ textAlign:'center', padding:'80px 0', color:'rgba(255,255,255,0.2)', fontSize:14 }}>Scanning the cosmos...</div>
            )}

            {globalData && (
              <>
                {/* ── BENTO GRID TOP ── */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:16 }}>
                  <MetricCard label="Global Sky Score" value={zm.global_score} unit="/ 10" color="#22d3ee" float delay={0} sub={zm.global_score >= 7 ? '✦ Excellent conditions' : zm.global_score >= 4 ? '◈ Moderate conditions' : '⊗ Poor conditions'} />
                  <MetricCard label="Zenith Seeing" value={zm.seeing_arcsec + '"'} color="#a78bfa" float delay={0.5} sub="Arc-seconds FWHM" />
                  <MetricCard label="Transparency" value={(zm.transparency * 100).toFixed(0) + '%'} color="#34d399" float delay={1} sub="Atmospheric clarity" />
                  <MetricCard
                    label="Dew Risk"
                    value={zm.dew_danger ? 'DANGER' : 'SAFE'}
                    color={zm.dew_danger ? '#f87171' : '#34d399'}
                    float delay={1.5}
                    sub={zm.dew_danger ? '⚠ Condensation risk' : '✓ Lens protected'}
                  />
                </div>

                {/* ── BENTO GRID BOTTOM ── */}
                <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:16 }}>
                  <div style={{ ...G.card }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✦</div>
                      <div>
                        <h2 style={{ margin:0, fontSize:15, fontWeight:700 }}>Tonight's Best</h2>
                        <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.3)' }}>AI-curated targets</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {globalData.tonights_best.length === 0 ? (
                        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, textAlign:'center', padding:'24px 0' }}>No visible targets tonight.<br/>Moon phase or cloud cover too high.</p>
                      ) : globalData.tonights_best.map((t, i) => (
                        <TargetCard key={i} target={t} onClick={() => setTargetName(t.Target)} />
                      ))}
                    </div>
                  </div>

                  <div style={{ ...G.card }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                      <div>
                        <h2 style={{ margin:0, fontSize:15, fontWeight:700 }}>Target Explorer</h2>
                        <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.3)' }}>12-hour physics forecast</p>
                      </div>
                      <select value={targetName} onChange={e => setTargetName(e.target.value)}
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px', color:'white', fontFamily:'inherit', fontSize:13, outline:'none', cursor:'pointer', minWidth:240 }}>
                        {globalData.catalog_names.map(n => <option key={n} value={n} style={{ background:'#0f0f1e' }}>{n}</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', gap:24, marginBottom:20 }}>
                      {[{color:'#22d3ee', label:'Interstellar Physics'}, {color:'#818cf8', label:'7Timer Benchmark', dashed:true}].map((l,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:24, height:2, borderRadius:99, background: l.dashed ? 'none' : l.color, backgroundImage: l.dashed ? `repeating-linear-gradient(90deg, ${l.color} 0px, ${l.color} 6px, transparent 6px, transparent 10px)` : 'none' }} />
                          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                    {fLoading ? (
                      <div style={{ height:320, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ width:40, height:40, border:'2px solid rgba(34,211,238,0.2)', borderTop:'2px solid #22d3ee', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      </div>
                    ) : forecast && (
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={forecast} margin={{ top:10, right:10, left:-24, bottom:0 }}>
                          <defs>
                            <linearGradient id="gPhysics" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gBench" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.1} />
                              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={{ stroke:'rgba(255,255,255,0.06)' }} tickLine={false} />
                          <YAxis domain={[0,10]} stroke="rgba(255,255,255,0.1)" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke:'rgba(255,255,255,0.06)', strokeWidth:1 }} />
                          <Area type="monotone" dataKey="physics_score" name="Interstellar" stroke="#22d3ee" strokeWidth={2} fill="url(#gPhysics)" dot={false} />
                          <Area type="monotone" dataKey="benchmark_score" name="7Timer" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="6 4" fill="url(#gBench)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            )}

            {globalData && targetName && (
              <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:24, padding:24, marginTop:16 }}>
                <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase' }}>🛠 Developer & Observer Tools</p>
                <VisibilityWindow targetName={targetName} lat={lat} lon={lon} />
                <GearPanel lat={lat} lon={lon} />
                <DebugConsole targetName={targetName} lat={lat} lon={lon} />
              </div>
            )}
          </>
        )}

        {/* ── SITE PLANNER TAB ── */}
        {activeTab === 'planner' && (
          <div style={{ ...G.card }}>
            <SitePlanner userLat={lat} userLon={lon} />
          </div>
        )}

        <p style={{ textAlign:'center', marginTop:32, fontSize:11, color:'rgba(255,255,255,0.15)', letterSpacing:'0.1em' }}>
          INTERSTELLAR ENGINE V3 &nbsp;·&nbsp; OPEN-METEO + 7TIMER + ASTROPY &nbsp;·&nbsp; REAL-TIME PHYSICS
        </p>
      </div>
    </div>
  );
}
