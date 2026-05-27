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
import { API_URL } from './api';

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
const MetricCard = ({ label, value, unit = '', color = '#00e5ff', sub = '', icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
    className="bg-[#171717] border border-[#2a2a2a] rounded-2xl p-5 sm:p-6 relative overflow-hidden"
  >
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={16} color={color} />}
      <p className="m-0 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase">{label}</p>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-4xl sm:text-5xl font-extrabold leading-none text-white font-mono">{value}</span>
      {unit && <span className="text-base sm:text-lg text-white/40 font-medium">{unit}</span>}
    </div>
    {sub && <p className="m-0 mt-3 text-[11px] sm:text-xs font-medium" style={{ color }}>{sub}</p>}
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
  const [scanMessage, setScanMessage] = useState('CALCULATING ATMOSPHERIC PHYSICS...');

  const tzLabel = formatTzLabel(lon);

  const scan = async (scanLat, scanLon, retries = 10) => {
    setLoading(true); setError('');
    setScanMessage('CALCULATING ATMOSPHERIC PHYSICS...');
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          setScanMessage(`WAKING BACKEND... (ATTEMPT ${attempt}/${retries})`);
          await new Promise(res => setTimeout(res, 5000));
        }
        const r = await fetch(`${API_URL}/api/global-sky?lat=${scanLat}&lon=${scanLon}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        setGlobalData(d);
        if (d.catalog_names?.length && !targetName) setTargetName(d.catalog_names[0]);
        
        // Delay slightly for smooth transition
        setTimeout(() => {
          setViewState('dashboard');
          setLoading(false);
        }, 1000);
        return; // Break out of loop on success
      } catch(e) { 
        if (attempt === retries) {
          setError(`Backend error: ${e.message} (Max retries reached. Server might be asleep.)`); 
          setViewState('landing');
          setLoading(false);
        } else {
          console.warn(`Scan attempt ${attempt + 1} failed, retrying...`);
        }
      }
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

  const fetchForecast = async (name, retries = 10) => {
    if (!name) return;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) await new Promise(res => setTimeout(res, 5000));
        const r = await fetch(`${API_URL}/api/target-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(name)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const localForecast = d.forecast.map(item => ({
          ...item,
          localTime: formatLocalTime(item.time, lon)
        }));
        setForecast(localForecast);
        return;
      } catch(e) { 
        if (attempt === retries) {
          console.error('Failed to fetch forecast:', e);
        } else {
          console.warn(`Forecast fetch attempt ${attempt + 1} failed, retrying...`);
        }
      }
    }
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
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{
              backgroundImage: "url('/src/assets/Anh1.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Top Navbar (Glassmorphism) */}
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-2 sm:p-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-80 sm:w-8 sm:h-8"><path d="M12 2L2 22h20L12 2z"/><path d="M12 2v20"/><path d="M2 22l10-12"/><path d="M22 22l-10-12"/></svg>
                <span className="text-white font-sans text-sm sm:text-xl font-medium tracking-wide whitespace-nowrap shrink-0">{lang === 'en' ? 'Project Singularity' : 'Dự Án Singularity'}</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-6 text-white/70 font-mono text-[10px] sm:text-sm">
                <div className="flex gap-2">
                  <button onClick={() => setLang('en')} className={`transition-colors ${lang === 'en' ? 'text-white font-bold' : 'hover:text-white'}`}>EN</button>
                  <span className="opacity-50">/</span>
                  <button onClick={() => setLang('vi')} className={`transition-colors ${lang === 'vi' ? 'text-white font-bold' : 'hover:text-white'}`}>VI</button>
                </div>
                <div onClick={() => setRedVision(!redVision)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${redVision ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                  {redVision ? <EyeOff size={14} className="text-red-400" /> : <Eye size={14} className="opacity-70" />}
                  <span className={`hidden sm:inline ${redVision ? 'text-red-300 font-bold' : ''}`}>Red Vision</span>
                  <div className={`w-6 h-3 rounded-full relative ml-1 transition-colors ${redVision ? 'bg-red-500/50' : 'bg-white/20'}`}>
                    <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${redVision ? 'bg-red-300 right-0.5 left-auto' : 'bg-white/60 left-0.5 right-auto'}`} />
                  </div>
                  <span className={`text-[10px] font-bold ${redVision ? 'text-red-400' : 'text-white/70'}`}>{redVision ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-center z-10 w-full max-w-2xl mt-16 sm:mt-0"
            >
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-[0.25em] text-cyan-50 mb-6 font-sans leading-tight" style={{ textShadow: '0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.3)' }}>
                PROJECT<br/>SINGULARITY
              </h1>
              <p className="text-white/70 tracking-[0.2em] text-xs sm:text-sm mb-12 font-mono uppercase">
                Global Astro-Physics Forecast Engine
              </p>
              
              <TargetLocator onLocationSelect={handleLocationSelect} />
              
              {error && <p className="text-red-400 mt-8 font-mono animate-pulse">⚠ {error}</p>}
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
            className="w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-6 md:py-10"
          >
            {/* ── HEADER ── */}
            <header className="flex flex-col gap-5 mb-8 sm:mb-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div 
                  className="cursor-pointer" 
                  onClick={() => setViewState('landing')}
                  title="Return to Main Search"
                >
                  <h1 className="m-0 text-xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <Sparkles color="#a78bfa" size={28} className="shrink-0" /> {t.app_title}
                  </h1>
                  <p className="m-0 mt-1 text-xs sm:text-sm text-white/40 font-medium tracking-wide">{t.app_sub}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#171717] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-[#2a2a2a] w-full sm:w-auto">
                  {/* Language Switcher */}
                  <div className="flex rounded-lg overflow-hidden shrink-0">
                    <button onClick={() => setLang('en')} className={`px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold transition-colors ${lang === 'en' ? 'bg-[#2a2a2a] text-white' : 'bg-transparent text-[#888]'}`}>EN</button>
                    <button onClick={() => setLang('vi')} className={`px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold transition-colors ${lang === 'vi' ? 'bg-[#2a2a2a] text-white' : 'bg-transparent text-[#888]'}`}>VI</button>
                  </div>

                  <div className="w-[1px] h-6 bg-[#2a2a2a] hidden sm:block" />

                  <button
                    onClick={() => setRedVision(!redVision)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${redVision ? 'bg-red-400/10 text-red-400' : 'bg-transparent text-[#888]'}`}
                    title={t.red_vision}
                  >
                    {redVision ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="hidden md:inline">{t.red_vision}</span>
                  </button>
                  
                  <div className="w-[1px] h-6 bg-[#2a2a2a] hidden sm:block" />

                  <div className="flex items-center gap-2 px-2 py-2 sm:px-3 grow sm:grow-0 shrink-0">
                    <MapPin size={16} color="#888" className="shrink-0" />
                    <input type="number" value={lat} onChange={e=>setLat(parseFloat(e.target.value))} className="bg-transparent border-none outline-none text-white w-14 sm:w-16 font-mono text-xs sm:text-sm" />
                    <div className="w-[1px] h-4 bg-[#2a2a2a] shrink-0" />
                    <input type="number" value={lon} onChange={e=>setLon(parseFloat(e.target.value))} className="bg-transparent border-none outline-none text-white w-14 sm:w-16 font-mono text-xs sm:text-sm" />
                  </div>
                  
                  <button onClick={handleManualSync} disabled={loading} className="bg-blue-600 rounded-lg text-white px-4 py-2 sm:px-5 text-xs sm:text-sm font-bold cursor-pointer shrink-0 grow sm:grow-0 flex justify-center w-full sm:w-auto mt-1 sm:mt-0 disabled:opacity-50">
                    {loading ? t.scanning : t.sync}
                  </button>
                </div>
              </div>
            </header>

            {/* ── TAB NAV ── */}
            <div className="flex flex-nowrap gap-3 mb-8 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar w-full">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap relative transition-colors bg-transparent border-none outline-none cursor-pointer ${active ? 'text-white font-bold' : 'text-white/40 font-medium hover:text-white/70'}`}
                  >
                    <Icon size={16} color={active ? '#00e5ff' : 'currentColor'} className="shrink-0" />
                    {tab.label}
                    {active && <motion.div layoutId="tab" className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
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
                    <div className="mb-12">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">
                        {zm.global_score >= 7 ? t.cond_exc : zm.global_score >= 4 ? t.cond_mod : t.cond_poor}
                      </h2>
                      <p className="text-sm text-cyan-400 mb-6 font-mono">
                        {globalData.best_time_utc && `PEAK WINDOW: ${formatLocalTime(globalData.best_time_utc, lon)} ${tzLabel}`}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        <MetricCard icon={Globe} label={t.global_sky} value={zm.global_score} unit="/ 10" color={zm.global_score >= 7 ? '#00e5ff' : zm.global_score >= 4 ? '#fbbf24' : '#f87171'} delay={0} sub={zm.global_score >= 7 ? t.clear_skies : t.proceed_caution} />
                        <MetricCard icon={Eye} label={t.zenith_seeing} value={zm.seeing_arcsec} unit='"' color="#a78bfa" delay={0.1} sub={t.arcsec_fwhm} />
                        <MetricCard icon={Sparkles} label={t.transparency} value={(zm.transparency * 100).toFixed(0)} unit="%" color="#34d399" delay={0.2} sub={t.atmos_clarity} />
                        <MetricCard icon={Navigation} label={t.sqm_darkness} value={zm.sqm?.toFixed(2) || '21.00'} unit={t.mag_arcsec2} color="#facc15" delay={0.3} sub={`Bortle ${zm.sqm > 21.7 ? 1 : zm.sqm > 21.5 ? 2 : zm.sqm > 21.3 ? 3 : zm.sqm > 20.8 ? 4 : 5}`} />
                        <MetricCard icon={Target} label={t.dew_risk} value={zm.dew_danger ? t.danger : t.safe} color={zm.dew_danger ? '#f87171' : '#34d399'} delay={0.4} sub={zm.dew_danger ? t.cond_risk : t.lens_protected} />
                      </div>
                    </div>

                    {/* TARGET EXPLORER */}
                    <div className="bg-[#171717] border border-[#2a2a2a] rounded-2xl p-5 sm:p-8 mb-8 overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div>
                          <h2 className="m-0 text-lg sm:text-xl font-extrabold">{t.target_exp}</h2>
                          <p className="m-0 mt-1 text-xs sm:text-sm text-white/40">{t.physics_trace} ({tzLabel})</p>
                        </div>
                        <select value={targetName} onChange={e => setTargetName(e.target.value)}
                          className="bg-[#222] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm font-medium outline-none cursor-pointer w-full sm:w-auto min-w-[200px] appearance-none"
                        >
                          {globalData.catalog_names.map(n => <option key={n} value={n} className="bg-[#050505]">{n}</option>)}
                        </select>
                      </div>
                      
                      {forecast && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[300px] sm:h-[360px]">
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
