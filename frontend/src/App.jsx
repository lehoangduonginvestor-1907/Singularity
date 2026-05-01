import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Eye, EyeOff, Sparkles, Navigation, Globe } from 'lucide-react';
import DebugConsole from './DebugConsole';
import VisibilityWindow from './VisibilityWindow';
import GearPanel from './GearPanel';
import SitePlanner from './SitePlanner';
import TargetLocator from './TargetLocator';
import { DICT, formatLocalTime, formatTzLabel } from './utils';

/* ─── GARGANTUA ANIMATION ────────────────────────────────────────────────── */
const Gargantua = () => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
    className="relative w-64 h-64 flex flex-col items-center justify-center scale-150"
  >
    {/* Event Horizon & Photon Ring */}
    <div className="absolute w-32 h-32 bg-black rounded-full z-20 shadow-[0_0_20px_4px_rgba(255,100,50,0.8)] border-[1.5px] border-orange-200/80" />
    
    {/* Accretion Disk - Top/Back */}
    <div className="absolute w-64 h-16 border-t-[8px] border-orange-500/80 rounded-[50%] blur-[2px] z-10 transform -rotate-12" />
    
    {/* Accretion Disk - Bottom/Front */}
    <div className="absolute w-64 h-16 border-b-[8px] border-orange-400 rounded-[50%] blur-[1px] z-30 transform -rotate-12 shadow-[0_10px_20px_rgba(255,150,50,0.8)]" />
    
    {/* Vertical Ring (Gravitational Lensing) */}
    <div className="absolute w-40 h-48 border-l-[6px] border-r-[6px] border-orange-400/60 rounded-[50%] blur-[2px] z-10" />

    {/* Spinning particles/dust */}
    <motion.div 
      className="absolute w-64 h-64 z-40 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full blur-[1px]" />
      <div className="absolute bottom-10 right-10 w-3 h-3 bg-orange-200 rounded-full blur-[2px]" />
      <div className="absolute top-32 left-0 w-1.5 h-1.5 bg-yellow-200 rounded-full" />
    </motion.div>
  </motion.div>
);

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
const ChartTooltip = ({ active, payload, label, tzLabel }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
      <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Roboto Mono' }}>{label} {tzLabel}</p>
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
export default function App() {
  const [lang, setLang] = useState('en');
  const t = DICT[lang];

  const TABS = [
    { id: 'dashboard', label: t.tab_dash, icon: Target },
    { id: 'planner',   label: t.tab_plan, icon: Navigation },
  ];

  const [viewState, setViewState] = useState('landing'); // 'landing', 'scanning', 'dashboard'
  const [lat, setLat] = useState(20.886355);
  const [lon, setLon] = useState(105.755763);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalData, setGlobalData] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redVision, setRedVision] = useState(false);

  const tzLabel = formatTzLabel(lon);

  const scan = async (scanLat, scanLon) => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/global-sky?lat=${scanLat}&lon=${scanLon}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setGlobalData(d);
      if (d.catalog_names?.length && !targetName) setTargetName(d.catalog_names[0]);
      
      // Delay slightly for smooth transition
      setTimeout(() => {
        setViewState('dashboard');
        setLoading(false);
      }, 1000);
      
    } catch(e) { 
      setError(`Backend error: ${e.message}`); 
      setViewState('landing');
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc) => {
    setLat(loc.lat);
    setLon(loc.lon);
    setViewState('scanning');
    scan(loc.lat, loc.lon);
  };

  const handleManualSync = () => {
    setViewState('scanning');
    scan(lat, lon);
  };

  const fetchForecast = async (name) => {
    if (!name) return;
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/target-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(name)}`);
      const d = await r.json();
      const localForecast = d.forecast.map(item => ({
        ...item,
        localTime: formatLocalTime(item.time, lon)
      }));
      setForecast(localForecast);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { 
    if (viewState === 'dashboard') {
      fetchForecast(targetName); 
    }
  }, [targetName, lat, lon, viewState]);

  const zm = globalData?.zenith_metrics;

  return (
    <div className={redVision ? 'red-vision' : ''} style={{ minHeight: '100vh', transition: 'filter 0.4s' }}>
      
      <AnimatePresence mode="wait">
        {/* ── LANDING VIEW ── */}
        {viewState === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-center z-10 w-full max-w-2xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-[0.2em] text-red-500 mb-2 font-mono" style={{ textShadow: '0 0 20px rgba(220,38,38,0.4)' }}>
                PROJECT SINGULARITY
              </h1>
              <p className="text-red-500/50 tracking-widest text-sm mb-16 font-mono">GLOBAL ASTRO-PHYSICS FORECAST ENGINE</p>
              
              <TargetLocator onLocationSelect={handleLocationSelect} />
              
              {error && <p className="text-red-500 mt-8 font-mono animate-pulse">⚠ {error}</p>}
            </motion.div>
          </motion.div>
        )}

        {/* ── SCANNING VIEW (GARGANTUA) ── */}
        {viewState === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden"
          >
            <Gargantua />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 font-mono mt-32 tracking-[0.3em] text-sm text-center"
            >
              <span className="animate-pulse inline-block">CALCULATING ATMOSPHERIC PHYSICS...</span>
              <br/>
              <span className="text-red-500/50 text-xs mt-2 inline-block">LAT: {lat.toFixed(4)} | LON: {lon.toFixed(4)}</span>
            </motion.p>
          </motion.div>
        )}

        {/* ── DASHBOARD VIEW ── */}
        {viewState === 'dashboard' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}
          >
            {/* ── HEADER ── */}
            <header style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div 
                  className="cursor-pointer" 
                  onClick={() => setViewState('landing')}
                  title="Return to Main Search"
                >
                  <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles color="#a78bfa" size={28} /> {t.app_title}
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.05em' }}>{t.app_sub}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Language Switcher */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <button onClick={() => setLang('en')} style={{ padding: '8px 12px', background: lang === 'en' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: lang === 'en' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>EN</button>
                    <button onClick={() => setLang('vi')} style={{ padding: '8px 12px', background: lang === 'vi' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: lang === 'vi' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>VI</button>
                  </div>

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
                    {t.red_vision}
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px 12px' }}>
                    <MapPin size={16} color="rgba(255,255,255,0.4)" />
                    <input type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value))} style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '70px', fontFamily: 'Roboto Mono', fontSize: '13px' }} />
                    <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                    <input type="number" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} style={{ background: 'none', border: 'none', outline: 'none', color: 'white', width: '70px', fontFamily: 'Roboto Mono', fontSize: '13px' }} />
                  </div>
                  
                  <button onClick={handleManualSync} disabled={loading} style={{ background: 'linear-gradient(135deg, #00e5ff, #3b82f6)', border: 'none', borderRadius: '12px', color: '#000', padding: '10px 24px', fontSize: '13px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 20px rgba(0,229,255,0.2)' }}>
                    {loading ? t.scanning : t.sync}
                  </button>
                </div>
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
                {globalData && (
                  <>
                    {/* HERO SECTION */}
                    <div style={{ marginBottom: '48px' }}>
                      <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>
                        {zm.global_score >= 7 ? t.cond_exc : zm.global_score >= 4 ? t.cond_mod : t.cond_poor}
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <MetricCard label={t.global_sky} value={zm.global_score} unit="/ 10" color={zm.global_score >= 7 ? '#00e5ff' : zm.global_score >= 4 ? '#fbbf24' : '#f87171'} highlight delay={0} sub={zm.global_score >= 7 ? t.clear_skies : t.proceed_caution} />
                        <MetricCard label={t.zenith_seeing} value={zm.seeing_arcsec} unit='"' color="#a78bfa" delay={0.1} sub={t.arcsec_fwhm} />
                        <MetricCard label={t.transparency} value={(zm.transparency * 100).toFixed(0)} unit="%" color="#34d399" delay={0.2} sub={t.atmos_clarity} />
                        <MetricCard label={t.dew_risk} value={zm.dew_danger ? t.danger : t.safe} color={zm.dew_danger ? '#f87171' : '#34d399'} delay={0.3} sub={zm.dew_danger ? t.cond_risk : t.lens_protected} />
                      </div>
                    </div>

                    {/* TARGET EXPLORER */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>{t.target_exp}</h2>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{t.physics_trace} ({tzLabel})</p>
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
                              <XAxis dataKey="localTime" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
                              <YAxis domain={[0,10]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<ChartTooltip tzLabel={tzLabel} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                              <Area type="monotone" dataKey="physics_score" name={t.physics_score} stroke="#00e5ff" strokeWidth={3} fill="url(#gPhysics)" dot={false} activeDot={{ r: 6, fill: '#00e5ff', stroke: '#000', strokeWidth: 2 }} />
                              <Area type="monotone" dataKey="benchmark_score" name={t.bench_score} stroke="#a78bfa" strokeWidth={2} strokeDasharray="6 6" fill="url(#gBench)" dot={false} />
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

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
