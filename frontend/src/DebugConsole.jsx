import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown, ChevronUp, Droplet, Wind, Eye, Moon, Activity } from 'lucide-react';
import { formatLocalTime, formatTzLabel } from './utils';
import { API_URL } from './api';

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
};

const Tag = ({ children, color = '#22d3ee' }) => (
  <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color, fontFamily: 'Roboto Mono' }}>
    {children}
  </span>
);

const Row = ({ label, value, unit = '', highlight = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: 600, color: highlight ? '#00e5ff' : 'rgba(255,255,255,0.85)', fontFamily: 'Roboto Mono' }}>{value}{unit}</span>
  </div>
);

const Section = ({ title, icon: Icon, children, accent = '#00e5ff' }) => (
  <div style={{ ...cardStyle, padding: '16px', flex: 1, minWidth: '240px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <Icon size={16} color={accent} />
      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>{title}</span>
    </div>
    {children}
  </div>
);

const HourPanel = ({ row, expanded, onToggle, lon }) => {
  const sc = row.singularity_scores;
  const ph = row.physics;
  const bm = row.benchmark_7timer;
  const localTime = formatLocalTime(row.time, lon);

  return (
    <div style={{ ...cardStyle, overflow: 'hidden', marginBottom: '8px' }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
      >
        <span style={{ fontSize: '16px', fontWeight: 800, color: '#00e5ff', fontFamily: 'Roboto Mono', minWidth: '50px' }}>{localTime}</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
          <Tag color={sc.v_model_final >= 7 ? '#34d399' : sc.v_model_final >= 4 ? '#fbbf24' : '#f87171'}>
            Score: {sc.v_model_final || sc.final_score}
          </Tag>
          <Tag color="rgba(255,255,255,0.4)">Seeing: {ph.seeing_arcsec}"</Tag>
          {ph.dew_danger && <Tag color="#f87171">⚠ Dew Risk</Tag>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Section title="Surface & Physics" icon={Activity} accent="#00e5ff">
                  <Row label="Temperature" value={row.surface.temp_c} unit=" °C" />
                  <Row label="Rel. Humidity" value={row.surface.rh_percent} unit=" %" />
                  <Row label="Cloud Cover" value={row.surface.cloud_cover_pct} unit=" %" />
                  <Row label="Seeing" value={ph.seeing_arcsec} unit='"' highlight />
                  <Row label="Transparency" value={ph.transparency} />
                </Section>

                <Section title="Astrodynamics" icon={Moon} accent="#a78bfa">
                  <Row label="Target Altitude" value={row.target_alt_deg} unit="°" highlight />
                  <Row label="Moon Altitude" value={row.moon_alt_deg} unit="°" />
                  <Row label="Moon Phase" value={row.moon_phase_deg} unit="°" />
                  <Row label="SQM (Darkness)" value={ph.sqm_mag_arcsec2} unit=" mag/arcsec²" />
                  <Row label="Air Mass" value={ph.air_mass} />
                </Section>
              </div>

              {/* Layered Forecast Bands */}
              <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Wind size={16} color="#34d399" />
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399' }}>Atmospheric Layers</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {row.atmos_layers.map(l => {
                    const speed = l.wind_speed_ms;
                    const danger = speed > 20;
                    const warn = speed > 10 && !danger;
                    const wColor = danger ? '#f87171' : warn ? '#fbbf24' : '#34d399';
                    
                    return (
                      <div key={l.pressure_hpa} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', width: '40px', textAlign: 'right', fontFamily: 'Roboto Mono' }}>{l.pressure_hpa}</span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (speed / 30) * 100)}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{ height: '100%', background: wColor, borderRadius: '4px' }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: wColor, width: '45px', textAlign: 'left', fontFamily: 'Roboto Mono' }}>{speed.toFixed(1)}m/s</span>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', width: '35px', textAlign: 'right', fontFamily: 'Roboto Mono' }}>{l.temp_c}°</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DebugConsole({ targetName, lat, lon }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const tzLabel = formatTzLabel(lon);

  const loadDebug = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/debug-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(targetName)}`);
      const d = await r.json();
      setData(d);
      setOpen(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ marginTop: '24px' }}>
      <button
        onClick={loadDebug}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, padding: 0,
        }}
      >
        <Terminal size={18} />
        {loading ? 'Fetching Diagnostic Telemetry...' : 'Layer 3: Deep Nerd Stats (Physics Diagnostics)'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Terminal size={16} color="rgba(255,255,255,0.5)" />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Raw Telemetry — {data.target} ({tzLabel})</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.debug.map((row, i) => (
                  <HourPanel key={i} row={row} expanded={!!expanded[i]} onToggle={() => toggle(i)} lon={lon} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
