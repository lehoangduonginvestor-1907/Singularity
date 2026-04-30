import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
};

export default function VisibilityWindow({ targetName, lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selDay, setSelDay] = useState(0);

  const load = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/visibility-window?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(targetName)}&days=5`);
      const d = await r.json();
      setData(d);
      setOpen(true);
      setSelDay(0);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const getConfColor = (conf) => {
    if (conf === 'high') return '#34d399';
    if (conf === 'moderate') return '#fbbf24';
    return '#f87171';
  };

  const getConfIcon = (conf) => {
    if (conf === 'high') return <CheckCircle size={14} color="#34d399" />;
    if (conf === 'moderate') return <AlertTriangle size={14} color="#fbbf24" />;
    return <XCircle size={14} color="#f87171" />;
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={load}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#a78bfa', fontSize: '14px', fontWeight: 600, padding: 0,
        }}
      >
        <Calendar size={18} />
        {loading ? 'Analyzing 5-Day Horizon...' : 'Layer 2: 5-Day Visibility Horizon'}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {open && data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ overflow: 'hidden', marginTop: '16px' }}
          >
            <div style={{ ...cardStyle, padding: '24px' }}>
              {/* Day Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {data.days.map((day, i) => {
                  const isSel = i === selDay;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelDay(i)}
                      style={{
                        background: isSel ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
                        border: `1px solid ${isSel ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px', padding: '12px 16px',
                        color: isSel ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '110px'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{day.day_label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        {getConfIcon(day.confidence)}
                        <span style={{ fontSize: '11px', color: getConfColor(day.confidence) }}>{day.confidence_pct}% conf</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Timeline */}
              {(() => {
                const day = data.days[selDay];
                return (
                  <motion.div
                    key={selDay}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Transit: </span>
                        <span style={{ color: '#00e5ff', fontWeight: 600, fontFamily: 'Roboto Mono' }}>{day.transit_hour}:00 UTC @ {day.transit_alt}°</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Best Window: </span>
                        <span style={{ color: '#a78bfa', fontWeight: 600, fontFamily: 'Roboto Mono' }}>{day.best_window}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Astro Dark: </span>
                        <span style={{ color: '#e2e8f0', fontFamily: 'Roboto Mono' }}>{day.twilight.astro_dark_start_utc}:00–{day.twilight.astro_dark_end_utc}:00 UTC</span>
                      </div>
                    </div>

                    <div style={{ position: 'relative', height: '140px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '2px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1px' }}>
                      {day.hourly_altitude.map(({hour, alt, zone}) => {
                        const pct = Math.max(0, Math.min(100, (alt + 90) / 180 * 100));
                        const inVis = day.visibility_window_hours.includes(hour);
                        const isTransit = hour === day.transit_hour;
                        
                        let barColor = 'rgba(255,255,255,0.06)';
                        if (inVis) {
                          if (zone === 'ideal') barColor = '#34d399';
                          else if (zone === 'good') barColor = '#fbbf24';
                          else barColor = 'rgba(255,255,255,0.15)';
                        }

                        return (
                          <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', group: 'true' }}>
                            {/* Hover Tooltip (CSS based) */}
                            <div className="opacity-0 hover:opacity-100 absolute bottom-full mb-2 bg-black border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-10 transition-opacity pointer-events-none font-mono">
                              {hour}:00 | {alt.toFixed(1)}°
                            </div>

                            {isTransit && <div style={{ position: 'absolute', top: '-16px', color: '#00e5ff', fontSize: '10px' }}>▼</div>}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.5, delay: hour * 0.02 }}
                              style={{
                                width: '100%',
                                background: barColor,
                                borderRadius: '4px 4px 0 0',
                                opacity: inVis ? 1 : 0.4,
                                boxShadow: inVis && zone === 'ideal' ? '0 0 12px rgba(52,211,153,0.3)' : 'none'
                              }}
                            />
                            <div style={{ position: 'absolute', bottom: '-20px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'Roboto Mono' }}>
                              {hour % 3 === 0 ? hour : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
