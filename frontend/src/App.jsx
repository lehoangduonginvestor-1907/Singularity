import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Target, Eye, EyeOff, Sparkles, Navigation, Globe, 
  Search, Compass, RefreshCw, Star, Info, Sun, Moon, Droplet, 
  Wind, Terminal, Calendar, ChevronDown, ChevronUp, AlertCircle, Loader
} from 'lucide-react';
import DebugConsole from './DebugConsole';
import VisibilityWindow from './VisibilityWindow';
import GearPanel from './GearPanel';
import SitePlanner from './SitePlanner';
import TargetLocator from './TargetLocator';
import { DICT, formatLocalTime, formatTzLabel, formatUtcStamp, getTzOffset } from './utils';
import { API_URL } from './api';

const PRESET_SITES = [
  { name: "Sa Pa Observatory", region: "Lào Cai", lat: 22.337, lon: 103.844, score: 8.6, bortle: 2, alt: "1,650m" },
  { name: "Tam Đảo Plateau",   region: "Vĩnh Phúc", lat: 21.467, lon: 105.642, score: 6.4, bortle: 4, alt: "1,140m" },
  { name: "Mộc Châu Highland", region: "Sơn La",    lat: 20.836, lon: 104.638, score: 5.4, bortle: 5, alt: "1,050m" },
  { name: "Cúc Phương · Bãi Trống", region: "Ninh Bình", lat: 20.255, lon: 105.722, score: 4.1, bortle: 6, alt: "350m" },
  { name: "Đà Lạt Observatory", region: "Lâm Đồng",  lat: 11.945, lon: 108.479, score: 7.8, bortle: 3, alt: "1,500m" },
];

/* ─── NEBULA SVG BACKDROP ─────────────────────────────────────────────── */
const NebulaArtHybrid = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 1280" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 pointer-events-none z-0">
    <defs>
      <radialGradient id="hyb-warm" cx="0.62" cy="0.28" r="0.55">
        <stop offset="0%" stopColor="rgba(var(--orange-raw),0.10)"/>
        <stop offset="30%" stopColor="rgba(var(--orange-raw),0.10)"/>
        <stop offset="60%" stopColor="rgba(var(--violet-raw),0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-cyan" cx="0.18" cy="0.55" r="0.5">
        <stop offset="0%" stopColor="rgba(var(--cyan-raw),0.14)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-violet" cx="0.88" cy="0.75" r="0.45">
        <stop offset="0%" stopColor="rgba(var(--violet-raw),0.14)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hyb-vignette" cx="0.5" cy="0.5" r="0.7">
        <stop offset="60%" stopColor="rgba(10,10,12,0)"/>
        <stop offset="100%" stopColor="rgba(2,2,4,0.85)"/>
      </radialGradient>
      <filter id="hyb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="38"/>
      </filter>
    </defs>

    <rect width="1440" height="1280" fill="#0a0a0c"/>
    <rect width="1440" height="1280" fill="url(#hyb-cyan)"/>
    <rect width="1440" height="1280" fill="url(#hyb-violet)"/>
    <rect width="1440" height="1280" fill="url(#hyb-warm)"/>

    <g filter="url(#hyb-soft)" opacity="0.5">
      <path d="M 100 360 Q 480 320 760 380 Q 1080 440 1340 420" stroke="rgba(var(--orange-raw),0.32)" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M 0 880 Q 360 820 700 880 Q 1040 940 1440 880" stroke="rgba(var(--violet-raw),0.28)" strokeWidth="32" fill="none" strokeLinecap="round"/>
    </g>

    <g filter="url(#hyb-soft)" opacity="0.55">
      <path d="M 0 1080 Q 280 970 500 1040 Q 720 1110 940 1030 Q 1180 940 1440 1040 L 1440 1280 L 0 1280 Z" fill="rgba(var(--violet-raw),0.15)"/>
    </g>

    {Array.from({length: 180}).map((_,i) => {
      const x = (i * 137.5 + (i*i)%80) % 1440;
      const y = (i * 263 + (i*i*3)%60) % 1280;
      const r = ((i * 7) % 10) / 10 * 1.2 + 0.2;
      const op = ((i * 11) % 10) / 10 * 0.6 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op}/>;
    })}

    {[[260,200],[920,160],[1180,500],[420,640],[760,290],[140,460],[1330,820],[680,1020]].map(([x,y],i) => (
      <g key={i} opacity={0.65 + (i%3)*0.1}>
        <circle cx={x} cy={y} r={1.5 + i%2} fill="#fff"/>
        <circle cx={x} cy={y} r={4 + i%2} fill="rgba(255,255,255,0.25)"/>
        <line x1={x-14} y1={y} x2={x+14} y2={y} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
        <line x1={x} y1={y-14} x2={x} y2={y+14} stroke="#fff" strokeWidth="0.5" opacity="0.7"/>
      </g>
    ))}

    <rect width="1440" height="1280" fill="url(#hyb-vignette)"/>
  </svg>
);

const NebulaBg = () => (
  <svg width="100%" height="100%" viewBox="0 0 1440 1080" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 pointer-events-none z-0">
    <defs>
      <radialGradient id="hb-warm" cx="0.62" cy="0.18" r="0.55">
        <stop offset="0%"   stopColor="rgba(var(--orange-raw),0.10)"/>
        <stop offset="50%"  stopColor="rgba(var(--violet-raw),0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hb-cyan" cx="0.15" cy="0.55" r="0.45">
        <stop offset="0%"   stopColor="rgba(var(--cyan-raw),0.12)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <radialGradient id="hb-violet" cx="0.88" cy="0.78" r="0.42">
        <stop offset="0%"   stopColor="rgba(var(--violet-raw),0.10)"/>
        <stop offset="100%" stopColor="rgba(10,10,12,0)"/>
      </radialGradient>
      <filter id="hb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="40"/>
      </filter>
    </defs>
    <rect width="1440" height="1080" fill="#0a0a0c"/>
    <rect width="1440" height="1080" fill="url(#hb-cyan)"/>
    <rect width="1440" height="1080" fill="url(#hb-violet)"/>
    <rect width="1440" height="1080" fill="url(#hb-warm)"/>
    
    <g filter="url(#hb-soft)" opacity="0.4">
      <path d="M 100 280 Q 500 240 800 320 Q 1100 400 1360 360" stroke="rgba(var(--orange-raw),0.25)" strokeWidth="18" fill="none" strokeLinecap="round"/>
    </g>

    {Array.from({length: 120}).map((_,i) => {
      const x = (i * 137.5 + (i*i)%80) % 1440;
      const y = (i * 263 + (i*i*3)%60) % 1080;
      const r = ((i * 7) % 10) / 10 * 1.2 + 0.2;
      const op = ((i * 11) % 10) / 10 * 0.6 + 0.2;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={op}/>;
    })}
    {[[200,160],[920,120],[1280,420],[480,720],[1100,820]].map(([x,y],i) => (
      <g key={i} opacity="0.55">
        <circle cx={x} cy={y} r="1.2" fill="#fff"/>
        <line x1={x-9} y1={y} x2={x+9} y2={y} stroke="#fff" strokeWidth="0.4"/>
        <line x1={x} y1={y-9} x2={x} y2={y+9} stroke="#fff" strokeWidth="0.4"/>
      </g>
    ))}
  </svg>
);

/* ─── LOADING SKELETON ───────────────────────────────────────────────── */
const Skeleton = ({ w = "100%", h = 12, className = '' }) => (
  <span className={`skeleton ${className}`} style={{ width: w, height: h }} />
);

/* ─── CARD LAYOUT COMPONENT ──────────────────────────────────────────── */
const Card = ({ children, accent = "neutral", padding = 24, className = '', style }) => {
  const accents = {
    neutral: "rgba(var(--cyan-raw), 0.04)",
    cyan:    "rgba(var(--cyan-raw), 0.10)",
    violet:  "rgba(var(--violet-raw), 0.10)",
    orange:  "rgba(var(--orange-raw), 0.08)",
    green:   "rgba(var(--green-raw), 0.08)",
    red:     "rgba(var(--red-raw), 0.08)",
  };
  return (
    <div 
      className={`relative overflow-hidden rounded-[20px] backdrop-blur-xl ${className}`}
      style={{ 
        padding,
        background: 'var(--card-bg)',
        border: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        ...style 
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(320px 200px at 100% 0%, ${accents[accent]}, transparent 60%)` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/* ─── THIN SPARKLINE ─────────────────────────────────────────────────── */
const ThinSparkline = ({ points, color = "#00f0ff", height = 24 }) => {
  if (!points || points.length < 2) return null;
  const w = 200, h = height;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i ? "L" : "M"} ${i * step} ${h - ((p - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <path d={d} stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
      {points.map((p, i) => i === points.length - 1 && (
        <circle key={i} cx={i * step} cy={h - ((p - min) / range) * (h - 4) - 2} r="2" fill={color}/>
      ))}
    </svg>
  );
};

/* ─── MOON 3D GRAPHIC ────────────────────────────────────────────────── */
const Moon3D = ({ size = 72, phase = 0.86 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: "radial-gradient(circle at 62% 36%, #fff, #e8ebf2 22%, #8a8f9e 65%, #3a3d48 90%, #1a1d24)",
      boxShadow: "0 0 28px rgba(255,200,160,0.25), inset 0 0 12px rgba(255,255,255,0.15)"
    }}/>
    <div style={{ position: "absolute", left: "30%", top: "25%", width: 6, height: 6, borderRadius: "50%", background: "rgba(0,0,0,0.15)" }}/>
    <div style={{ position: "absolute", left: "55%", top: "55%", width: 8, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.18)" }}/>
    <div style={{ position: "absolute", left: "70%", top: "32%", width: 4, height: 4, borderRadius: "50%", background: "rgba(0,0,0,0.12)" }}/>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: `linear-gradient(105deg, transparent ${phase * 60}%, rgba(0,0,0,0.78) ${phase * 60 + 18}%)`
    }}/>
  </div>
);

/* ─── RADIAL GAUGE ───────────────────────────────────────────────────── */
const SkyGauge = ({ value = 7.4, max = 10, size = 220 }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 88, c = 2 * Math.PI * r;
  const dash = c * pct;
  const color = value >= 7 ? "#7bf6ff" : (value >= 4 ? "#c4a0fb" : "#ff9b4d");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 220 220">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#00f0ff"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        {Array.from({length: 40}).map((_,i) => {
          const a = (i / 40) * Math.PI * 2 - Math.PI/2;
          const x1 = 110 + Math.cos(a) * 102;
          const y1 = 110 + Math.sin(a) * 102;
          const x2 = 110 + Math.cos(a) * 108;
          const y2 = 110 + Math.sin(a) * 108;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 5 === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"} strokeWidth="1"/>;
        })}
        <circle cx="110" cy="110" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none"/>
        <circle cx="110" cy="110" r={r} stroke="url(#gaugeGrad)" strokeWidth="8" fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 110 110)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div className="text-7xl font-light text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {value.toFixed(1)}
          </div>
          <div className="t-eyebrow mt-1.5">OF 10 · PEAK</div>
        </div>
      </div>
    </div>
  );
};

/* ─── METRIC TILE ────────────────────────────────────────────────────── */
const MetricTile = ({ label, icon: IconComponent, value, unit, sub, tone = "cyan", spark }) => {
  const tones = {
    cyan:   { glow: "rgba(0,240,255,0.4)",  fg: "#7bf6ff", accent: "cyan" },
    violet: { glow: "rgba(168,85,247,0.4)", fg: "#c4a0fb", accent: "violet" },
    orange: { glow: "rgba(255,107,0,0.4)",  fg: "#ff9b4d", accent: "orange" },
    green:  { glow: "rgba(0,214,138,0.4)",  fg: "#5cf2bd", accent: "green" },
  };
  const t = tones[tone];
  return (
    <Card accent={t.accent} padding={20}>
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-7 h-7 rounded-[8px] bg-white/4 border border-white/5 flex items-center justify-center"
          style={{ color: t.fg }}
        >
          <IconComponent size={14} />
        </div>
        <span className="t-eyebrow">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span 
          className="text-5xl font-light text-white leading-none tracking-tight" 
          style={{ fontFamily: "var(--font-display)", textShadow: `0 0 22px ${t.glow}` }}
        >{value}</span>
        {unit && <span className="t-mono text-xs text-white/45">{unit}</span>}
      </div>
      {sub && <div className="mt-2 text-xs text-white/55 font-medium">{sub}</div>}
      {spark && <div className="mt-3"><ThinSparkline points={spark} color={t.fg} height={20}/></div>}
    </Card>
  );
};

/* ─── TARGET SPOTLIGHT ───────────────────────────────────────────────── */
const TargetSpotlight = ({ targetName, catalogNames = [], onTargetChange, lat, lon, lang }) => {
  const isEn = lang === 'en';
  const [vis, setVis] = useState(null);
  const [visLoading, setVisLoading] = useState(false);

  // Real altitude track for the selected target (today), from the ephemeris API.
  useEffect(() => {
    if (!targetName) return;
    let cancelled = false;
    setVisLoading(true);
    setVis(null);
    fetch(`${API_URL}/api/visibility-window?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(targetName)}&days=1`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => { if (!cancelled) setVis(d?.days?.[0] || null); })
      .catch(e => { if (!cancelled) console.warn('Visibility fetch failed:', e.message); })
      .finally(() => { if (!cancelled) setVisLoading(false); });
    return () => { cancelled = true; };
  }, [targetName, lat, lon]);

  // Derive the SVG curve + rise/transit/set in local time from real altitudes.
  const arc = useMemo(() => {
    const ha = vis?.hourly_altitude;
    if (!ha || ha.length < 2) return null;
    const offset = getTzOffset(lon);
    const toLocal = (h) => {
      if (h == null || isNaN(h)) return '--:--';
      let lh = (h + offset) % 24; if (lh < 0) lh += 24;
      let hh = Math.floor(lh), mm = Math.round((lh - hh) * 60);
      if (mm === 60) { mm = 0; hh = (hh + 1) % 24; }
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };
    let riseH = null, setH = null;
    for (let i = 0; i < ha.length - 1; i++) {
      const a1 = ha[i].alt, a2 = ha[i + 1].alt;
      if (a1 <= 0 && a2 > 0) riseH = ha[i].hour + (-a1) / (a2 - a1);
      if (a1 > 0 && a2 <= 0) setH = ha[i].hour + a1 / (a1 - a2);
    }
    const W = 320, baseY = 95, topY = 12;
    const xOf = (hour) => 10 + (hour / 23) * 300;
    const yOf = (alt) => baseY - Math.max(0, Math.min(90, alt)) / 90 * (baseY - topY);
    const linePath = ha.map((p, i) => `${i ? 'L' : 'M'} ${xOf(p.hour).toFixed(1)} ${yOf(p.alt).toFixed(1)}`).join(' ');
    const peakUp = vis.transit_alt > 0;
    return {
      linePath,
      transitX: xOf(vis.transit_hour),
      transitY: yOf(vis.transit_alt),
      transitAlt: Math.round(vis.transit_alt),
      peakUp,
      riseLocal: toLocal(riseH),
      transitLocal: toLocal(vis.transit_hour),
      setLocal: toLocal(setH),
      everUp: ha.some(p => p.alt > 0),
    };
  }, [vis, lon]);

  const visible = arc?.everUp;

  return (
    <Card accent="violet" padding={24}>
      <div className="flex justify-between items-center mb-3.5">
        <span className="t-eyebrow">{isEn ? "PRIME TARGET" : "MỤC TIÊU ƯU TIÊN"}</span>
        <span className={`chip ${visible ? 'violet' : ''} flex items-center gap-1`}>
          <span className={`dot ${visible ? 'pulse bg-[#c4a0fb]' : 'bg-white/40'}`}/>
          {visible ? (isEn ? "VISIBLE" : "TRÊN ĐỈNH TRỜI") : (isEn ? "BELOW HORIZON" : "DƯỚI CHÂN TRỜI")}
        </span>
      </div>

      <div className="flex justify-between items-start gap-4">
        <div className="text-5xl font-light text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {targetName.split(' ')[0]} <span className="italic text-white/55 text-2xl font-normal ml-1">
            {targetName.substring(targetName.indexOf(' ') + 1) || ''}
          </span>
        </div>
        <select
          value={targetName}
          onChange={e => onTargetChange(e.target.value)}
          className="bg-white/4 border border-white/8 rounded-lg px-3 py-1.5 text-white text-xs font-semibold outline-none cursor-pointer hover:bg-white/8 transition-colors max-w-[150px]"
        >
          {catalogNames.map(n => <option key={n} value={n} className="bg-[#0f0f15]">{n}</option>)}
        </select>
      </div>
      <div className="text-xs text-white/55 mt-1.5 font-medium">
        {arc
          ? (isEn ? `Peak altitude ${arc.transitAlt}° tonight` : `Đạt đỉnh ${arc.transitAlt}° đêm nay`)
          : (isEn ? 'Computing altitude track…' : 'Đang tính quỹ đạo độ cao…')}
      </div>

      {/* Real altitude track over the night */}
      <div className="relative h-[115px] my-4">
        <svg width="100%" height="115" viewBox="0 0 320 115">
          <defs>
            <linearGradient id="arc-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(168,85,247,0.35)"/>
              <stop offset="100%" stopColor="rgba(168,85,247,0)"/>
            </linearGradient>
          </defs>
          <line x1="10" y1="95" x2="310" y2="95" stroke="rgba(255,255,255,0.12)"/>
          <text x="10" y="108" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono">{isEn ? 'HORIZON' : 'CHÂN TRỜI'}</text>
          {arc ? (
            <>
              <path d={`${arc.linePath} L 310 95 L 10 95 Z`} fill="url(#arc-fill)" opacity="0.6"/>
              <path d={arc.linePath} stroke="#a855f7" strokeWidth="2" fill="none"
                style={{ filter: "drop-shadow(0 0 5px rgba(168,85,247,0.5))" }}/>
              {arc.peakUp && (
                <>
                  <circle cx={arc.transitX} cy={arc.transitY} r="4.5" fill="#a855f7"/>
                  <circle cx={arc.transitX} cy={arc.transitY} r="9" fill="none" stroke="#a855f7" opacity="0.3"/>
                  <text x={arc.transitX} y={arc.transitY - 11} textAnchor="middle" fontSize="9" fill="#c4a0fb" fontFamily="Roboto Mono" fontWeight="bold">ALT {arc.transitAlt}°</text>
                </>
              )}
            </>
          ) : (
            <text x="160" y="55" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="Roboto Mono">
              {visLoading ? (isEn ? 'loading…' : 'đang tải…') : '--'}
            </text>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-xl bg-white/2 border border-white/5 text-center">
          <div className="t-eyebrow text-[9px]">{isEn ? "RISE" : "MỌC"}</div>
          <div className="t-mono text-sm text-white font-semibold mt-1">{arc ? arc.riseLocal : '--:--'}</div>
        </div>
        <div className="p-2 rounded-xl bg-purple-500/8 border border-purple-500/20 text-center">
          <div className="t-eyebrow text-[9px] text-purple-300">{isEn ? "TRANSIT" : "CỰC CẬN"}</div>
          <div className="t-mono text-sm text-white font-semibold mt-1">{arc ? arc.transitLocal : '--:--'}</div>
        </div>
        <div className="p-2 rounded-xl bg-white/2 border border-white/5 text-center">
          <div className="t-eyebrow text-[9px]">{isEn ? "SET" : "LẶN"}</div>
          <div className="t-mono text-sm text-white font-semibold mt-1">{arc ? arc.setLocal : '--:--'}</div>
        </div>
      </div>
    </Card>
  );
};

/* ─── HOURLY STRIP ───────────────────────────────────────────────────── */
const HourlyStrip = ({ forecast, lon, lang }) => {
  if (!forecast || forecast.length === 0) return null;
  const isEn = lang === 'en';

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
      {forecast.slice(0, 12).map((item, i) => {
        const score = item.physics_score || 0;
        const peak = score >= 7.5;
        const localTime = formatLocalTime(item.time, lon);
        
        let icon = <Sun size={14} className="opacity-50" />;
        if (score >= 7) {
          icon = <Sparkles size={14} className="text-cyan-400" />;
        } else if (score >= 4) {
          icon = <Moon size={14} className="text-purple-300" />;
        } else {
          icon = <Wind size={14} className="opacity-40" />;
        }

        return (
          <div 
            key={i} 
            className="p-3 bg-white/2 border border-white/5 rounded-xl text-center relative transition-all duration-300 hover:bg-white/5 hover:border-white/10"
            style={{
              background: peak ? "linear-gradient(180deg, rgba(0,240,255,0.14), rgba(0,240,255,0.04))" : "rgba(255,255,255,0.02)",
              borderColor: peak ? "rgba(0,240,255,0.35)" : "rgba(255,255,255,0.06)",
            }}
          >
            {peak && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />}
            <div className="t-mono text-[10.5px] font-semibold text-white/50" style={{ color: peak ? '#7bf6ff' : '' }}>{localTime}</div>
            <div className="my-2 flex justify-center">{icon}</div>
            <div className="text-2xl font-light text-white" style={{ fontFamily: "var(--font-display)" }}>{score.toFixed(1)}</div>
            
            {/* Visual physics bar */}
            <div className="mt-2.5 h-7 relative bg-white/3 rounded-[3px] overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 rounded-[3px] opacity-80"
                style={{
                  height: `${(score / 10) * 100}%`,
                  background: peak 
                    ? "linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.1))" 
                    : "linear-gradient(180deg, rgba(168,85,247,0.8), rgba(168,85,247,0.1))",
                }}
              />
            </div>
            
            <div className="t-mono text-[9px] text-white/35 mt-1.5 truncate">
              {item.benchmark_score ? `${item.benchmark_score.toFixed(1)} BM` : '--'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── GARGANTUA ANIMATION ────────────────────────────────────────────── */
const Gargantua = ({ redVision }) => {
  const coreGlow = redVision ? '#ff003c' : '#ff7b00';
  const midGlow = redVision ? '#cc002c' : '#ff9500';
  const outerGlow = redVision ? '#88001b' : '#ff3c00';
  const whiteLight = redVision ? '#ffb3c1' : '#fff3d1';

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="relative w-80 h-80 flex flex-col items-center justify-center scale-110 sm:scale-125"
    >
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full animate-[pulse_6s_ease-in-out_infinite]"
        style={{ filter: 'drop-shadow(0 0 25px rgba(0, 0, 0, 0.95))' }}
      >
        <defs>
          <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="24" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="spaceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={coreGlow} stopOpacity="0.25" />
            <stop offset="60%" stopColor={outerGlow} stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
            <stop offset="65%" stopColor={whiteLight} stopOpacity="1" />
            <stop offset="78%" stopColor={midGlow} stopOpacity="0.8" />
            <stop offset="90%" stopColor={coreGlow} stopOpacity="0.4" />
            <stop offset="100%" stopColor={outerGlow} stopOpacity="0" />
          </radialGradient>

          <linearGradient id="diskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={outerGlow} stopOpacity="0" />
            <stop offset="15%" stopColor={coreGlow} stopOpacity="0.6" />
            <stop offset="35%" stopColor={midGlow} stopOpacity="0.9" />
            <stop offset="50%" stopColor={whiteLight} stopOpacity="1" />
            <stop offset="65%" stopColor={midGlow} stopOpacity="0.9" />
            <stop offset="85%" stopColor={coreGlow} stopOpacity="0.6" />
            <stop offset="100%" stopColor={outerGlow} stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#spaceGlow)" />

        <g transform="rotate(-8 200 200)">
          <ellipse 
            cx="200" 
            cy="200" 
            rx="112" 
            ry="132" 
            fill="none" 
            stroke="url(#ringGrad)" 
            strokeWidth="16" 
            filter="url(#heavyGlow)" 
            opacity="0.8" 
          />
          <ellipse 
            cx="200" 
            cy="200" 
            rx="104" 
            ry="122" 
            fill="none" 
            stroke={whiteLight} 
            strokeWidth="2.5" 
            filter="url(#softGlow)" 
            opacity="0.95" 
          />
        </g>

        <circle cx="200" cy="200" r="82" fill="#000000" />

        <circle 
          cx="200" 
          cy="200" 
          r="83" 
          fill="none" 
          stroke={whiteLight} 
          strokeWidth="1.5" 
          filter="url(#softGlow)" 
          opacity="0.85" 
        />
        <circle 
          cx="200" 
          cy="200" 
          r="85" 
          fill="none" 
          stroke={coreGlow} 
          strokeWidth="4" 
          filter="url(#heavyGlow)" 
          opacity="0.65" 
        />

        <g transform="rotate(-8 200 200)">
          <path 
            d="M 30,205 Q 200,225 370,205 Q 200,195 30,205 Z" 
            fill="url(#diskGrad)" 
            filter="url(#heavyGlow)" 
            opacity="0.95"
          />
          <path 
            d="M 45,205 Q 200,220 355,205" 
            fill="none" 
            stroke={whiteLight} 
            strokeWidth="2.5" 
            filter="url(#softGlow)" 
            opacity="0.9" 
          />
        </g>
      </svg>

      <div 
        className="absolute w-full h-full pointer-events-none animate-[spin_20s_linear_infinite]"
        style={{ transform: 'rotate(-8deg)' }}
      >
        <div className="absolute top-14 left-14 w-1.5 h-1.5 bg-white rounded-full opacity-60 blur-[0.5px]" />
        <div className="absolute bottom-18 right-18 w-2 h-2 bg-orange-200 rounded-full opacity-40 blur-[1px]" />
        <div className="absolute top-48 left-10 w-1.5 h-1.5 bg-yellow-100 rounded-full opacity-50" />
      </div>
    </motion.div>
  );
};

/* ─── CHART TOOLTIP ──────────────────────────────────────────────────── */
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

/* ─── MAIN APP COMPONENT ──────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang] = useState('en');
  const t = DICT[lang];

  const TABS = [
    { id: 'dashboard', label: t.tab_dash, icon: Target },
    { id: 'planner',   label: t.tab_plan, icon: Navigation },
  ];

  const [viewState, setViewState] = useState('landing');
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

  const [landingMetrics, setLandingMetrics] = useState({
    viable_pct: null,
    viable_count: null,
    total_sites: null,
    seeing: null,
    transparency: null,
    sqm: null,
    dew_risk: null
  });
  const [landingSites, setLandingSites] = useState(PRESET_SITES);
  const [liveStatus, setLiveStatus] = useState('syncing'); // 'syncing' | 'live' | 'offline'
  const [now, setNow] = useState(() => new Date());

  // Live UTC clock. Display is minute-precision, so a 30s tick is plenty and
  // avoids re-rendering the whole tree every second.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Fetch real-time global averages + site recommendations, with backend wake-up
  // retries (Render free tier sleeps) and a 5-minute auto-refresh.
  useEffect(() => {
    let cancelled = false;

    const fetchLandingData = async () => {
      // Keep showing the last good numbers while a refresh runs.
      setLiveStatus(prev => (prev === 'live' ? 'live' : 'syncing'));

      // Cheap health ping to wake a sleeping instance before the heavy call.
      try { await fetch(`${API_URL}/api/health`); } catch { /* ignore */ }

      const MAX_RETRIES = 12;
      let gotSky = false;
      for (let attempt = 0; attempt <= MAX_RETRIES && !cancelled; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 4000));
        try {
          const skyRes = await fetch(`${API_URL}/api/global-sky?lat=20.886355&lon=105.755763`);
          if (!skyRes.ok) throw new Error(`HTTP ${skyRes.status}`);
          const skyData = await skyRes.json();
          if (cancelled) return;
          setGlobalData(skyData);
          const zm = skyData.zenith_metrics;
          setLandingMetrics(prev => ({
            ...prev,
            seeing: zm.seeing_arcsec ?? prev.seeing,
            transparency: zm.transparency != null ? Math.round(zm.transparency * 100) : prev.transparency,
            sqm: zm.sqm ?? prev.sqm,
            dew_risk: zm.dew_danger ? 85 : 12,
          }));
          setLiveStatus('live');
          gotSky = true;
          break;
        } catch (e) {
          if (!cancelled) console.warn(`Live sky fetch attempt ${attempt + 1} failed:`, e.message);
        }
      }

      if (cancelled) return;
      if (!gotSky) { setLiveStatus('offline'); return; }

      // Site ranking is best-effort; "live" status already granted by sky data.
      try {
        const rankRes = await fetch(`${API_URL}/api/site-ranker?user_lat=20.886355&user_lon=105.755763`);
        if (rankRes.ok && !cancelled) {
          const rankData = await rankRes.json();
          if (rankData.top5 && rankData.top5.length > 0) {
            setLandingSites(rankData.top5.slice(0, 3).map(site => ({
              name: site.name,
              region: site.description?.split('Tỉnh:')[1]?.split('.')[0]?.trim() || site.region || "Việt Nam",
              lat: site.lat,
              lon: site.lon,
              score: site.v_model || site.s_eff,
              bortle: site.bortle_eff || site.bortle,
              alt: site.elevation ? `${site.elevation}m` : "1,000m"
            })));
          }
          if (rankData.meta) {
            setLandingMetrics(prev => ({
              ...prev,
              viable_pct: Math.round((rankData.meta.passed / rankData.meta.total_evaluated) * 100),
              total_sites: rankData.meta.total_evaluated,
              viable_count: rankData.meta.passed,
            }));
          }
        }
      } catch (e) {
        if (!cancelled) console.warn("Live site ranks fetch failed:", e.message);
      }
    };

    fetchLandingData();
    const id = setInterval(fetchLandingData, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

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
        
        setTimeout(() => {
          setViewState('dashboard');
          setLoading(false);
        }, 1000);
        return;
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
            className="min-h-screen relative overflow-hidden flex flex-col justify-between"
          >
            <NebulaArtHybrid />

            {/* Top Navbar */}
            <div className="relative z-10 flex justify-between items-center px-6 sm:px-14 py-6 border-b border-white/4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white opacity-80 sm:w-7 sm:h-7">
                  <path d="M12 2L2 22h20L12 2z"/><path d="M12 2v20"/><path d="M2 22l10-12"/><path d="M22 22l-10-12"/>
                </svg>
                <span className="text-white text-base font-semibold tracking-wide" style={{ fontFamily: "var(--font-body)" }}>Singularity</span>
                <span className="text-white/30 hidden sm:inline">·</span>
                <span className="t-mono text-[10.5px] text-white/50 tracking-[0.15em] hidden sm:inline">OBSERVATORY ENGINE</span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-white/70 font-mono text-xs font-semibold">
                  <button onClick={() => setLang('en')} className={`transition-colors cursor-pointer ${lang === 'en' ? 'text-white font-bold' : 'hover:text-white text-white/45'}`}>EN</button>
                  <span className="opacity-20">/</span>
                  <button onClick={() => setLang('vi')} className={`transition-colors cursor-pointer ${lang === 'vi' ? 'text-white font-bold' : 'hover:text-white text-white/45'}`}>VI</button>
                </div>

                <div 
                  onClick={() => setRedVision(!redVision)} 
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-300 ${
                    redVision ? 'bg-red-500/10 border-red-500/35 text-red-300' : 'bg-white/3 border-white/6 text-white/55 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  <EyeOff size={13} className={redVision ? 'text-red-400' : 'opacity-70'} />
                  <span className="text-xs font-medium">{lang === 'en' ? 'Red vision' : 'Chế độ đỏ'}</span>
                  <div className={`w-5.5 h-3 rounded-full relative transition-colors ${redVision ? 'bg-red-500/40' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-2 h-2 rounded-full transition-all ${redVision ? 'bg-red-300 right-0.5 left-auto' : 'bg-white/50 left-0.5 right-auto'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Main 2-column Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start w-full">
              {/* Left Column (Search / Headline) */}
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="t-mono text-[10px] text-white/60 tracking-wider">
                    {lang === 'en' ? 'STEP 01 · LOCK A OBSERVING SITE' : 'BƯỚC 01 · CHỌN VỊ TRÍ QUAN SÁT'}
                  </span>
                </div>

                <h1 
                  className="text-6xl sm:text-[96px] font-light leading-[0.95] text-white tracking-tight mt-6"
                  style={{ fontFamily: "var(--font-display)", textShadow: "0 0 50px rgba(0,0,0,0.5)" }}
                >
                  {lang === 'en' ? (
                    <>Where are you<br/><span className="italic text-purple-300/90 font-serif">observing</span> tonight?</>
                  ) : (
                    <>Đêm nay bạn<br/>quan sát ở <span className="italic text-purple-300/90 font-serif">nơi nào?</span></>
                  )}
                </h1>

                <p className="mt-6 text-base sm:text-[17px] text-white/60 leading-relaxed max-w-xl font-normal">
                  {lang === 'en' ? (
                    "Singularity runs a 5-layer atmospheric column through GFS, ECMWF, and local METAR models at your exact coordinates — mapping seeing, transparency, and dew point at minute precision."
                  ) : (
                    "Singularity chạy cột khí quyển 5 lớp thông qua các mô hình GFS, ECMWF và METAR tại tọa độ chính xác của bạn — mô phỏng độ trong suốt, độ nét bầu trời và điểm sương ở độ chính xác từng phút."
                  )}
                </p>

                <div className="mt-9 w-full">
                  <TargetLocator onLocationSelect={handleLocationSelect} lang={lang} />
                </div>

                {error && <p className="text-red-400 mt-6 font-mono text-sm animate-pulse flex items-center gap-1.5">⚠ {error}</p>}
              </div>

              {/* Right Column (Global average outlook) */}
              <div className="lg:col-span-5 w-full">
                <div 
                  className="rounded-[22px] bg-gradient-to-b from-[#14121c]/55 to-[#08080c]/70 border border-white/6 backdrop-blur-2xl p-7 shadow-2xl"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
                >
                  <div className="flex justify-between items-center text-[10.5px] t-mono text-white/45">
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        liveStatus === 'live' ? 'bg-[#5cf2bd]' : liveStatus === 'offline' ? 'bg-[#ff6b6b]' : 'bg-[#ffb454]'
                      } ${liveStatus !== 'offline' ? 'animate-pulse' : ''}`} />
                      {liveStatus === 'live'
                        ? (lang === 'en' ? 'LIVE · GLOBAL OUTLOOK' : 'TRỰC TIẾP · DỰ BÁO CHUNG')
                        : liveStatus === 'offline'
                          ? (lang === 'en' ? 'ENGINE OFFLINE · RETRYING' : 'MẤT KẾT NỐI · ĐANG THỬ LẠI')
                          : (lang === 'en' ? 'SYNCING · WAKING ENGINE' : 'ĐANG KẾT NỐI MÁY CHỦ')}
                    </span>
                    <span>{formatUtcStamp(now)}</span>
                  </div>

                  <div className="mt-4 text-5xl font-light text-white leading-none tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {landingMetrics.viable_pct != null ? (
                      <><span className="text-[#7bf6ff]">{landingMetrics.viable_pct}%</span> <span className="italic text-white/70 text-[32px] font-normal ml-1">{lang === 'en' ? 'viable' : 'đạt'}</span></>
                    ) : (
                      <Skeleton w={190} h={42} />
                    )}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed mt-2.5">
                    {globalData?.moon_metrics ? (
                      lang === 'en' ? (
                        `${landingMetrics.viable_count != null ? `${landingMetrics.viable_count.toLocaleString()} of ${landingMetrics.total_sites.toLocaleString()} indexed sites viable tonight. ` : ''}Moon is ${globalData.moon_metrics.phase_label_en.toLowerCase()} at ${globalData.moon_metrics.illumination}% illumination.`
                      ) : (
                        `${landingMetrics.viable_count != null ? `${landingMetrics.viable_count.toLocaleString()} trên ${landingMetrics.total_sites.toLocaleString()} vị trí đạt điều kiện đêm nay. ` : ''}Mặt Trăng ${globalData.moon_metrics.phase_label_vi.toLowerCase()}, độ sáng ${globalData.moon_metrics.illumination}%.`
                      )
                    ) : liveStatus === 'offline' ? (
                      lang === 'en' ? 'Live engine unreachable — retrying automatically.' : 'Không kết nối được máy chủ — đang tự động thử lại.'
                    ) : (
                      <span className="block space-y-1.5"><Skeleton w="100%" h={9} /><Skeleton w="65%" h={9} /></span>
                    )}
                  </p>

                  <div className="h-[1px] bg-white/8 my-6" />

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {[
                       { l: lang === 'en' ? "MEDIAN SEEING" : "SEEING TRUNG BÌNH", raw: landingMetrics.seeing, v: landingMetrics.seeing?.toFixed(1), unit: "″",  s: [3.4,3.0,2.6,2.2,1.9,1.6,1.5,landingMetrics.seeing], color: "var(--cyan)" },
                       { l: lang === 'en' ? "TRANSPARENCY" : "ĐỘ TRONG SUỐT",  raw: landingMetrics.transparency, v: landingMetrics.transparency?.toFixed(0), unit: "%",   s: [42,55,62,68,74,78,76,landingMetrics.transparency],         color: "var(--violet)" },
                       { l: lang === 'en' ? "MEDIAN SQM" : "BẦU TRỜI (SQM)",    raw: landingMetrics.sqm, v: landingMetrics.sqm?.toFixed(1), unit: "",  s: [18.2,18.8,19.4,20.0,20.4,20.5,20.3,landingMetrics.sqm], color: "var(--violet)" },
                       { l: lang === 'en' ? "DEW RISK" : "NGUY CƠ ĐỌNG SƯƠNG",      raw: landingMetrics.dew_risk, v: landingMetrics.dew_risk?.toFixed(0), unit: "%",   s: [28,24,20,18,17,18,19,landingMetrics.dew_risk],         color: "var(--green)" },
                    ].map(m => (
                      <div key={m.l}>
                        <div className="t-eyebrow text-[9.5px] text-white/40">{m.l}</div>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          {m.raw != null ? (
                            <>
                              <span className="text-3xl font-light text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>{m.v}</span>
                              <span className="t-mono text-xs text-white/40">{m.unit}</span>
                            </>
                          ) : (
                            <Skeleton w={68} h={28} />
                          )}
                        </div>
                        <div className="mt-2.5">
                          {m.raw != null ? <ThinSparkline points={m.s} color={m.color} height={16}/> : <Skeleton w="100%" h={16} />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-[1px] bg-white/8 mt-6 mb-4" />
                  <div className="flex justify-between text-[10.5px] t-mono text-white/30">
                    <span>5 sources · 12 models</span>
                    <span>{lang === 'en' ? 'auto-sync · 5 min' : 'tự đồng bộ · 5 phút'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Vietnamese site presets, Moon & Target spotlight */}
            <div className="relative z-10 px-6 sm:px-14 pb-8 pt-10">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <div className="t-eyebrow text-[10.5px] text-white/45 mb-1">
                    {lang === 'en' ? "YOUR SITES · TONIGHT'S OUTLOOK" : "CÁC VỊ TRÍ · ĐÊM NAY"}
                  </div>
                  <div className="text-3xl font-light text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {lang === 'en' ? (
                      <>Lock somewhere <span className="italic text-white/70">familiar</span>.</>
                    ) : (
                      <>Chọn một địa điểm <span className="italic text-white/70">quen thuộc</span>.</>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 items-center text-xs">
                  <span className="t-mono text-white/40">{landingSites.length} {lang === 'en' ? 'curated sites' : 'vị trí tuyển chọn'}</span>
                </div>
              </div>

              {/* Grid presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* Sa Pa, Tam Dao, Moc Chau */}
                {landingSites.slice(0, 3).map((s, i) => (
                  <div 
                    key={s.name} 
                    onClick={() => handleLocationSelect({ lat: s.lat, lon: s.lon, name: s.name })}
                    className="p-5 bg-gradient-to-b from-[#14141c]/55 to-[#0a0a0e]/70 border border-white/6 backdrop-blur-xl rounded-[18px] cursor-pointer hover:border-purple-500/40 hover:scale-[1.02] transition-all relative overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: `radial-gradient(240px 140px at 100% 0%, ${s.score >= 7 ? "rgba(0,240,255,0.08)" : "rgba(168,85,247,0.08)"}, transparent 60%)` }}
                    />
                    <div className="flex justify-between items-center">
                      <span className="t-mono text-[9px] text-white/40">{lang === 'en' ? 'SITE' : 'VỊ TRÍ'} · 0{i+1}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                          <div 
                            key={n} 
                            className={`w-0.5 h-2 rounded-[1px] ${n <= s.bortle ? 'bg-cyan-400' : 'bg-white/10'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-[22px] font-light text-white tracking-tight mt-3 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {s.name}
                    </div>
                    <div className="t-mono text-[10.5px] text-white/40 mt-1">
                      {s.region} · {s.alt}
                    </div>
                    <div className="h-[1px] bg-white/6 my-3.5" />
                    <div className="flex justify-between items-baseline">
                      <div>
                        <div className="t-mono text-[9px] text-white/30">{lang === 'en' ? 'SCORE' : 'ĐIỂM'}</div>
                        <div className="text-3xl font-light leading-none mt-1" style={{ fontFamily: "var(--font-display)", color: s.score >= 7 ? '#7bf6ff' : '#c4a0fb' }}>
                          {s.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="t-mono text-[9px] text-white/30">BORTLE</div>
                        <div className="t-mono text-sm text-white font-semibold mt-1">{s.bortle}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Moon Preset site card */}
                <div className="p-5 bg-gradient-to-b from-[#1c1612]/55 to-[#0a0a0e]/70 border border-white/6 backdrop-blur-xl rounded-[18px] relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(240px 140px at 100% 0%, rgba(255,107,0,0.10), transparent 60%)" }}/>
                  <span className="t-mono text-[9.5px] text-white/40">
                    {globalData?.moon_metrics 
                      ? (lang === 'en' ? `MOON · ${globalData.moon_metrics.phase_label_en}` : `LỊCH LUNAR · ${globalData.moon_metrics.phase_label_vi}`)
                      : (lang === 'en' ? 'MOON · WAXING GIBBOUS' : 'LỊCH LUNAR · TRĂNG GIBBOUS')}
                  </span>
                  <div className="flex items-center gap-3.5 mt-3">
                    <Moon3D size={48} phase={globalData?.moon_metrics ? (globalData.moon_metrics.phase_angle_deg / 180.0) : 0.86} />
                    <div>
                      <div className="text-3xl font-light text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>
                        {globalData?.moon_metrics ? globalData.moon_metrics.illumination : 86}<span className="text-base text-white/50">%</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{lang === 'en' ? 'illumination' : 'độ sáng'}</div>
                    </div>
                  </div>
                  <div className="h-[1px] bg-white/6 my-3.5" />
                  <div className="flex justify-between text-xs t-mono">
                    <div>
                      <span className="text-[8px] block text-white/30">RISE</span>
                      <span className="text-white font-semibold mt-1 block">
                        {globalData?.moon_metrics ? globalData.moon_metrics.rise_local : '16:42'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-white/30">TRANSIT</span>
                      <span className="text-white font-semibold mt-1 block">
                        {globalData?.moon_metrics ? globalData.moon_metrics.transit_local : '22:08'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-white/30">SET</span>
                      <span className="text-orange-300 font-semibold mt-1 block">
                        {globalData?.moon_metrics ? globalData.moon_metrics.set_local : '04:12'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Featured target */}
                <div className="p-5 bg-gradient-to-b from-[#1c1628]/55 to-[#0a0a0e]/70 border border-[#a855f7]/30 backdrop-blur-xl rounded-[18px] relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(260px 160px at 100% 0%, rgba(168,85,247,0.18), transparent 60%)" }}/>
                  <div className="flex justify-between items-center">
                    <span className="t-mono text-[9px] text-white/40">
                      {globalData?.featured_target 
                        ? (lang === 'en' ? `FEATURED · ${globalData.featured_target.name}` : `TIÊU ĐIỂM · ${globalData.featured_target.name}`)
                        : (lang === 'en' ? 'FEATURED · M51' : 'TIÊU ĐIỂM · M51')}
                    </span>
                    <span className="bg-purple-500/15 border border-purple-500/30 text-[#c4a0fb] text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {globalData?.featured_target ? globalData.featured_target.type : 'DSO'}
                    </span>
                  </div>
                  <div className="text-3xl font-light text-white mt-3 leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    {globalData?.featured_target ? globalData.featured_target.name : 'M51'}{" "}
                    <span className="italic text-white/50 text-base font-normal">
                      {globalData?.featured_target ? globalData.featured_target.sub : 'Whirlpool'}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/45 mt-1 leading-normal">
                    {globalData?.featured_target ? globalData.featured_target.region : 'Canes Venatici'} · {lang === 'en' ? 'transits at' : 'lên đỉnh lúc'}{" "}
                    <span className="text-purple-300/80 font-mono font-semibold">
                      {globalData?.featured_target ? globalData.featured_target.transit_local : '00:30'}
                    </span>
                  </div>
                  <div className="h-[1px] bg-white/6 my-3" />
                  <div className="flex justify-between text-xs t-mono">
                    <div>
                      <span className="text-[8px] block text-white/30">ALT</span>
                      <span className="text-white font-semibold mt-1 block">
                        {globalData?.featured_target ? `${globalData.featured_target.alt}°` : '72°'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-white/30">MAG</span>
                      <span className="text-white font-semibold mt-1 block">
                        {globalData?.featured_target ? globalData.featured_target.mag.toFixed(1) : '8.4'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] block text-[#c4a0fb] opacity-80">{lang === 'en' ? 'SCORE' : 'ĐIỂM'}</span>
                      <span className="text-[#c4a0fb] font-semibold mt-1 block">
                        {globalData?.featured_target ? globalData.featured_target.score.toFixed(1) : '7.8'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Footer Info */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5 text-[10.5px] t-mono text-white/30">
                <div className="flex gap-4">
                  <span>ECMWF</span>
                  <span>GFS</span>
                  <span>7TIMER</span>
                  <span>METAR</span>
                  <span>ESP32 NOMINAL</span>
                </div>
                <span>Singularity v1.0.0 · physics engine v3.1</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SCANNING VIEW ── */}
        {viewState === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden"
          >
            <Gargantua redVision={redVision} />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 font-mono mt-32 tracking-[0.3em] text-sm text-center"
            >
              <span className="animate-pulse inline-block">{scanMessage}</span>
              <br/>
              <span className="text-red-500/50 text-xs mt-3.5 inline-block">LAT: {lat.toFixed(4)} | LON: {lon.toFixed(4)}</span>
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
            className="w-full relative min-h-screen pb-16"
          >
            <NebulaBg />

            {/* TopBar sticky Navbar */}
            <div className="sticky top-0 z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-10 py-4.5 border-b border-white/5 bg-[#0a0a10]/75 backdrop-blur-xl gap-4">
              <div className="flex items-center gap-3.5">
                <svg 
                  width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="text-white opacity-85 cursor-pointer"
                  onClick={() => setViewState('landing')}
                >
                  <path d="M12 2L2 22h20L12 2z"/><path d="M12 2v20"/><path d="M2 22l10-12"/><path d="M22 22l-10-12"/>
                </svg>
                <div 
                  className="font-bold text-sm text-white tracking-wide cursor-pointer hover:opacity-80" 
                  onClick={() => setViewState('landing')}
                >Singularity</div>
                <span className="text-white/20">·</span>
                <div className="flex gap-1.5 p-1 bg-white/3 border border-white/5 rounded-full text-xs">
                  {TABS.map(tab => {
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                          active ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-300' : 'text-white/50 border border-transparent hover:text-white/80'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/3 border border-white/6 text-white/70 font-mono text-xs">
                  <MapPin size={11} className="text-white/40" />
                  <span>{lat.toFixed(3)}°N · {lon.toFixed(3)}°E</span>
                  <span className="text-white/20">·</span>
                  <span>{tzLabel}</span>
                </div>

                <span className="chip green flex items-center gap-1">
                  <span className="dot pulse bg-[#5cf2bd]" />
                  SYNCED · 12 MODELS
                </span>

                <button 
                  onClick={handleManualSync}
                  disabled={loading}
                  className="btn btn-primary py-2 px-4.5 text-xs font-bold flex items-center gap-1.5 hover:scale-105"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  {loading ? t.scanning : t.sync}
                </button>

                <div className="flex items-center gap-4 text-white/70 font-mono text-xs font-semibold px-2">
                  <button onClick={() => setLang('en')} className={`transition-colors cursor-pointer ${lang === 'en' ? 'text-white font-bold' : 'hover:text-white text-white/45'}`}>EN</button>
                  <span className="opacity-20">/</span>
                  <button onClick={() => setLang('vi')} className={`transition-colors cursor-pointer ${lang === 'vi' ? 'text-white font-bold' : 'hover:text-white text-white/45'}`}>VI</button>
                </div>

                <div 
                  onClick={() => setRedVision(!redVision)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-xs transition-colors ${
                    redVision ? 'bg-red-500/10 border-red-500/35 text-red-300' : 'bg-white/3 border-white/6 text-white/55 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  {redVision ? <EyeOff size={13} className="text-red-400" /> : <Eye size={13} />}
                  <span>{t.red_vision}</span>
                  <div className={`w-5 h-2.5 rounded-full relative transition-colors ${redVision ? 'bg-red-500/40' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-1.5 h-1.5 rounded-full transition-all ${redVision ? 'bg-red-300 right-0.5 left-auto' : 'bg-white/50 left-0.5 right-auto'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && globalData && (
              <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 relative z-10">
                {/* Dashboard Hero Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-9 gap-6">
                  <div>
                    <div className="t-eyebrow text-[10.5px] mb-2">
                      TONIGHT · {tzLabel} · COORDINATES ACCESSED
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-light text-white leading-none tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {zm.global_score >= 7 ? t.cond_exc : zm.global_score >= 4 ? t.cond_mod : t.cond_poor}
                    </h1>
                    <div className="mt-3.5 text-white/60 text-sm leading-relaxed max-w-3xl">
                      {globalData.best_time_utc && (
                        <span>
                          {lang === 'en' ? 'PEAK WINDOW: ' : 'GIỜ ĐẸP NHẤT: '}
                          <span className="text-cyan-400 font-mono font-semibold">
                            {formatLocalTime(globalData.best_time_utc, lon)} {tzLabel}
                          </span>
                        </span>
                      )}
                      <span className="mx-2.5">·</span>
                      <span>seeing {zm.seeing_arcsec?.toFixed(2)}″ FWHM</span>
                      <span className="mx-2.5">·</span>
                      <span>Bortle {zm.sqm > 21.7 ? 1 : zm.sqm > 21.5 ? 2 : zm.sqm > 21.3 ? 3 : zm.sqm > 20.8 ? 4 : 5} darkness</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="chip orange flex items-center gap-1"><Moon size={11} />MOON {globalData?.moon_metrics ? `${globalData.moon_metrics.illumination}%` : '--'}</span>
                    <span className="chip cyan flex items-center gap-1"><Wind size={11} />{globalData?.ensemble ? 'ENSEMBLE NWP' : 'GFS MODEL'}</span>
                    <span className="chip violet flex items-center gap-1"><Info size={11} />{formatUtcStamp(now)}</span>
                  </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
                  
                  {/* Global sky score circular gauge */}
                  <div className="lg:col-span-4 h-full">
                    <Card accent="cyan" padding={28} className="h-full flex flex-col justify-between items-center text-center">
                      <div className="w-full flex justify-between items-center">
                        <div className="text-left">
                          <span className="t-eyebrow">{t.global_sky}</span>
                          <div className="text-[17px] italic text-white/55 mt-0.5 leading-none" style={{ fontFamily: "var(--font-display)" }}>
                            {lang === 'en' ? 'physics-first columns' : 'phân tích cột khí quyển'}
                          </div>
                        </div>
                        <Globe size={15} className="text-cyan-400 opacity-80" />
                      </div>
                      <div className="my-5">
                        <SkyGauge value={zm.global_score} max={10} size={210} />
                      </div>
                      <div className="w-full h-[1px] bg-white/8 my-3" />
                      <div className="w-full grid grid-cols-2 text-left gap-4">
                        <div>
                          <div className="t-eyebrow text-[9.5px]">CURRENT</div>
                          <div className="text-2xl font-light text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>
                            {zm.global_score?.toFixed(1)} <span className="text-xs text-white/35">/ 10</span>
                          </div>
                        </div>
                        <div>
                          <div className="t-eyebrow text-[9.5px]">OUTLOOK STATUS</div>
                          <div className="text-xs font-semibold text-[#7bf6ff] mt-2.5 truncate">
                            {zm.global_score >= 7 ? t.clear_skies : t.proceed_caution}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* 2x2 Metric tiles grid */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
                    <MetricTile
                      label={t.zenith_seeing} icon={Eye} tone="cyan"
                      value={zm.seeing_arcsec?.toFixed(2)} unit="″ FWHM"
                      sub={(() => {
                        const s = zm.seeing_arcsec;
                        const q = s == null ? '' : s <= 1.0 ? (lang === 'en' ? 'excellent seeing' : 'nét tuyệt vời')
                          : s <= 1.5 ? (lang === 'en' ? 'good seeing' : 'nét tốt')
                          : s <= 2.5 ? (lang === 'en' ? 'moderate seeing' : 'nét trung bình')
                          : (lang === 'en' ? 'poor seeing' : 'nét kém');
                        return q;
                      })()}
                    />
                    <MetricTile
                      label={t.transparency} icon={Sparkles} tone="violet"
                      value={(zm.transparency * 100).toFixed(0)} unit="%"
                      sub={(() => {
                        const tr = zm.transparency;
                        return tr == null ? '' : tr >= 0.8 ? (lang === 'en' ? 'clean atmosphere' : 'khí quyển trong')
                          : tr >= 0.6 ? (lang === 'en' ? 'some haze' : 'có sương mù nhẹ')
                          : (lang === 'en' ? 'hazy atmosphere' : 'khí quyển mờ đục');
                      })()}
                    />
                    <MetricTile
                      label={t.sqm_darkness} icon={Moon} tone="cyan"
                      value={zm.sqm?.toFixed(2) || '21.00'} unit="mag/arcsec²"
                      sub={`Bortle ${zm.sqm > 21.7 ? 1 : zm.sqm > 21.5 ? 2 : zm.sqm > 21.3 ? 3 : zm.sqm > 20.8 ? 4 : 5} · ${lang === 'en' ? 'dark sky spot' : 'điểm trời tối'}`}
                    />
                    <MetricTile
                      label={t.dew_risk} icon={Droplet} tone={zm.dew_danger ? "orange" : "green"}
                      value={zm.dew_danger ? t.danger : t.safe}
                      sub={zm.dew_danger ? t.cond_risk : t.lens_protected}
                    />
                  </div>

                </div>

                {/* Secondary row - Recharts forecast & Target Spotlight */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
                  {/* 24-Hour Physics Trace Chart */}
                  <div className="lg:col-span-8 h-full">
                    <Card padding={28} className="h-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                        <div>
                          <span className="t-eyebrow">{lang === 'en' ? '24-HOUR PHYSICS TRACE' : 'BIỂU ĐỒ VẬT LÝ 24 GIỜ'}</span>
                          <div className="text-3xl font-light text-white mt-1 leading-none tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                            {lang === 'en' ? 'Tonight\'s observable forecast window' : 'Cột chẩn đoán thiên văn trong đêm'}
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-white/55">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-0.5 bg-[var(--cyan)] inline-block" />
                            <span>SINGULARITY</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-0.5 bg-[var(--violet)] border-t border-dashed inline-block" />
                            <span>7TIMER</span>
                          </div>
                        </div>
                      </div>

                      {/* Recharts responsive AreaChart */}
                      {forecast && (
                        <div className="h-[260px] sm:h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                              <defs>
                                <linearGradient id="gPhysics" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.25} />
                                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gBench" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.12} />
                                  <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="localTime" stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
                              <YAxis domain={[0,10]} stroke="rgba(255,255,255,0.08)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontFamily: 'Roboto Mono' }} axisLine={false} tickLine={false} />
                              <Tooltip content={<ChartTooltip tzLabel={tzLabel} />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                              <Area type="monotone" dataKey="physics_score" name={t.physics_score} stroke="var(--cyan)" strokeWidth={2.5} fill="url(#gPhysics)" dot={false} activeDot={{ r: 5, fill: 'var(--cyan)', stroke: '#000', strokeWidth: 1.5 }} />
                              <Area type="monotone" dataKey="benchmark_score" name={t.bench_score} stroke="var(--violet)" strokeWidth={1.8} strokeDasharray="5 5" fill="url(#gBench)" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Target Spotlight */}
                  <div className="lg:col-span-4 h-full">
                    <TargetSpotlight
                      targetName={targetName}
                      catalogNames={globalData.catalog_names}
                      onTargetChange={setTargetName}
                      lat={lat}
                      lon={lon}
                      lang={lang}
                    />
                  </div>
                </div>

                {/* Hourly strip panel */}
                <Card padding={24} className="mb-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="t-eyebrow">{lang === 'en' ? 'HOURLY · 12H AHEAD' : 'DỰ BÁO TỪNG GIỜ · 12 TIẾNG TỚI'}</span>
                      <div className="text-2xl font-light text-white mt-1" style={{ fontFamily: "var(--font-display)" }}>
                        {lang === 'en' ? 'Minute-stepped atmospheric forecasts' : 'Dữ liệu chẩn đoán chi tiết theo múi giờ địa phương'}
                      </div>
                    </div>
                  </div>
                  <HourlyStrip forecast={forecast} lon={lon} lang={lang} />
                </Card>

                {/* Progressive disclosure tools inside unified custom grid wrapper */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="bg-gradient-to-b from-white/3 to-white/1 border border-white/5 rounded-2xl p-5 hover:bg-white/4 transition-colors">
                    <VisibilityWindow targetName={targetName} lat={lat} lon={lon} />
                  </div>
                  <div className="bg-gradient-to-b from-white/3 to-white/1 border border-white/5 rounded-2xl p-5 hover:bg-white/4 transition-colors">
                    <DebugConsole targetName={targetName} lat={lat} lon={lon} />
                  </div>
                  <div className="bg-gradient-to-b from-white/3 to-white/1 border border-white/5 rounded-2xl p-5 hover:bg-white/4 transition-colors">
                    <GearPanel lat={lat} lon={lon} />
                  </div>
                </div>

                {/* Dashboard Footer info */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4.5 border-t border-white/6 text-[10.5px] t-mono text-white/30 gap-3">
                  <div className="flex gap-4">
                    <span>ECMWF</span>
                    <span>GFS</span>
                    <span>7TIMER</span>
                    <span>METAR</span>
                    <span>ESP32</span>
                  </div>
                  <span>
                    Singularity v1.0.0 · physics engine v3.1 · {formatUtcStamp(now)}
                  </span>
                </div>

              </div>
            )}

            {/* SITE PLANNER TAB */}
            {activeTab === 'planner' && (
              <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 relative z-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <SitePlanner userLat={lat} userLon={lon} redVision={redVision} />
                </motion.div>
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
