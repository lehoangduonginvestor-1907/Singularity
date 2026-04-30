import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { MapPin, Target, Eye, EyeOff, Sparkles, Navigation } from 'lucide-react';
import DebugConsole from './DebugConsole';
import VisibilityWindow from './VisibilityWindow';
import GearPanel from './GearPanel';
import SitePlanner from './SitePlanner';

/* ─── METRIC CARD ────────────────────────────────────────────────────────── */
const MetricCard = ({ label, value, unit = '', color = '#00e5ff', sub = '', highlight = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${highlight ? color : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: highlight ? `0 0 30px ${color}20` : 'none',
    }}
  >
    {highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }} />}
    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{label}</p>
    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: highlight ? color : '#fff', fontFamily: 'Roboto Mono' }}>{value}</span>
      {unit && <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && <p style={{ margin: '12px 0 0', fontSize: '12px', color: highlight ? color : 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{sub}</p>}
  </motion.div>
);

/* ─── TOOLTIP ────────────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Roboto Mono' }}>{label} UTC</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < payload.length - 1 ? '6px' : 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', flex: 1, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'Roboto Mono' }}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: 'Layer 1: Dashboard', icon: Target },
  { id: 'planner',   label: 'Site Planner', icon: Navigation },
];

export default function App() {
  const [lat, setLat] = useState(20.886355);
  const [lon, setLon] = useState(105.755763);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalData, setGlobalData] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redVision, setRedVision] = useState(false);

  const scan = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/global-sky?lat=${lat}&lon=${lon}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setGlobalData(d);
      if (d.catalog_names?.length && !targetName) setTargetName(d.catalog_names[0]);
    } catch(e) { setError(`Backend error: ${e.message}`); }
    setLoading(false);
  };

  const fetchForecast = async (name) => {
    if (!name) return;
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/target-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(name)}`);
      const d = await r.json();
      setForecast(d.forecast);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { scan(); }, []);
  useEffect(() => { fetchForecast(targetName); }, [targetName, lat, lon]);

  const zm = globalData?.zenith_metrics;

  return (
    <div className={redVision ? 'red-vision' : ''} style={{ minHeight: '100vh', transition: 'filter 0.4s' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── HEADER ── */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles color="#a78bfa" size={28} /> Project Interstellar
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.05em' }}>OBSERVATORY DIAGNOSTICS & FORECAST</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setRedVision(!redVision)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: redVision ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${redVision ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: redVision ? '#f87171' : 'rgba(255,255,255,0.6)',
                borderRadius: '12px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
              }}
            >
              {redVision ? <EyeOff size={16} /> : <Eye size={16} />}
              Red Vision
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 12px' }}>
              <MapPin size={16} color="rgba(255,255,255,0.4)" />
              <input type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value))} style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '70px', fontFamily: 'Roboto Mono', fontSize: '13px' }} />
              <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
              <input type="number" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '70px', fontFamily: 'Roboto Mono', fontSize: '13px' }} />
            </div>
            <button onClick={scan} disabled={loading} style={{ background: 'linear-gradient(135deg, #00e5ff, #3b82f6)', border: 'none', borderRadius: '12px', color: '#000', padding: '10px 24px', fontSize: '13px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(0,229,255,0.2)' }}>
              {loading ? 'SCANNING...' : 'SYNC'}
            </button>
          </div>
        </header>

        {/* ── TAB NAV ── */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  border: 'none', background: 'none',
                  padding: '8px 16px', fontFamily: 'inherit',
                  fontSize: '14px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  position: 'relative'
                }}
              >
                <Icon size={16} color={active ? '#00e5ff' : 'currentColor'} />
                {tab.label}
                {active && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: '#00e5ff', boxShadow: '0 0 10px #00e5ff' }} />}
              </button>
            );
          })}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '16px', color: '#f87171', marginBottom: '24px' }}>⚠ {error}</div>}

            {globalData && (
              <>
                {/* HERO SECTION */}
                <div style={{ marginBottom: '48px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>
                    {zm.global_score >= 7 ? 'Conditions are excellent tonight.' : zm.global_score >= 4 ? 'Conditions are moderate tonight.' : 'Conditions are poor tonight.'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <MetricCard label="Global Sky Score" value={zm.global_score} unit="/ 10" color={zm.global_score >= 7 ? '#00e5ff' : zm.global_score >= 4 ? '#fbbf24' : '#f87171'} highlight delay={0} sub={zm.global_score >= 7 ? 'Clear skies ahead' : 'Proceed with caution'} />
                    <MetricCard label="Zenith Seeing" value={zm.seeing_arcsec} unit='"' color="#a78bfa" delay={0.1} sub="Arc-seconds FWHM" />
                    <MetricCard label="Transparency" value={(zm.transparency * 100).toFixed(0)} unit="%" color="#34d399" delay={0.2} sub="Atmospheric clarity" />
                    <MetricCard label="Dew Risk" value={zm.dew_danger ? 'DANGER' : 'SAFE'} color={zm.dew_danger ? '#f87171' : '#34d399'} delay={0.3} sub={zm.dew_danger ? '⚠ Condensation risk' : '✓ Lens protected'} />
                  </div>
                </div>

                {/* TARGET EXPLORER */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Target Explorer</h2>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>12-hour physics forecast trace</p>
                    </div>
                    <select value={targetName} onChange={e => setTargetName(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', color: 'white', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, outline: 'none', cursor: 'pointer', minWidth: '240px', appearance: 'none' }}>
                      {globalData.catalog_names.map(n => <option key={n} value={n} style={{ background: '#050505' }}>{n}</option>)}
                    </select>
                  </div>
                  
                  {forecast && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '360px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gPhysics" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gBench" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                          <YAxis domain={[0,10]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                          <Area type="monotone" dataKey="physics_score" name="Interstellar Score" stroke="#00e5ff" strokeWidth={3} fill="url(#gPhysics)" dot={false} activeDot={{ r: 6, fill: '#00e5ff', stroke: '#000', strokeWidth: 2 }} />
                          <Area type="monotone" dataKey="benchmark_score" name="7Timer Benchmark" stroke="#a78bfa" strokeWidth={2} strokeDasharray="6 6" fill="url(#gBench)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </div>

                {/* PROGRESSIVE DISCLOSURE TOOLS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <VisibilityWindow targetName={targetName} lat={lat} lon={lon} />
                  <DebugConsole targetName={targetName} lat={lat} lon={lon} />
                  <GearPanel lat={lat} lon={lon} />
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── SITE PLANNER TAB ── */}
        {activeTab === 'planner' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <SitePlanner userLat={lat} userLon={lon} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
