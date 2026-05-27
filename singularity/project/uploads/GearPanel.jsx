import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Crosshair, Zap, Eye, Search, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from './api';

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
};

const Row = ({ label, value, unit = '', color = 'rgba(255,255,255,0.85)' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <span style={{ fontSize: '13px', fontWeight: 600, color, fontFamily: 'Roboto Mono' }}>{value}{unit}</span>
  </div>
);

export default function GearPanel({ lat, lon }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [aperture, setAperture] = useState(80);
  const [focal, setFocal] = useState(600);
  const [eyepiece, setEyepiece] = useState(25);

  const check = async () => {
    if (!open) setOpen(true);
    setLoading(true);
    try {
      const url = `${API_URL}/api/gear-check?lat=${lat}&lon=${lon}&aperture_mm=${aperture}&focal_length_mm=${focal}&eyepiece_mm=${eyepiece}`;
      const r = await fetch(url);
      const d = await r.json();
      setResult(d);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const Input = ({ val, set, label, icon: Icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon size={14} color="rgba(255,255,255,0.4)" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="number" value={val} onChange={e => set(parseFloat(e.target.value))}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, width: '40px', padding: 0 }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>mm</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Inline Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', ...cardStyle, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
          <Settings size={18} color="#a78bfa" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>Gear Check</span>
        </div>
        
        <Input val={aperture} set={setAperture} label="Aperture" icon={Crosshair} />
        <Input val={focal} set={setFocal} label="Focal" icon={Zap} />
        <Input val={eyepiece} set={setEyepiece} label="Eyepiece" icon={Eye} />

        <button onClick={check} disabled={loading}
          style={{
            marginLeft: 'auto', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '10px', padding: '8px 16px', color: '#a78bfa', fontSize: '12px', fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
          }}
        >
          {loading ? 'Analyzing...' : 'Run Diagnostics'}
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {open && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', marginTop: '12px' }}
          >
            <div style={{ ...cardStyle, padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Resolution block */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Search size={16} color="#00e5ff" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Resolution Limits</span>
                </div>
                <Row label="Current Seeing" value={result.current_seeing_arcsec} unit='"' color={result.current_seeing_arcsec < 1 ? '#34d399' : result.current_seeing_arcsec < 2 ? '#fbbf24' : '#f87171'} />
                <Row label="Rayleigh Limit" value={result.resolution.rayleigh_arcsec} unit='"' />
                <Row label="Dawes Limit" value={result.resolution.dawes_arcsec} unit='"' />
                <Row label="Effective Resol." value={result.resolution.effective_arcsec} unit='"' color="#00e5ff" />
                <Row label="Equiv. Aperture" value={result.resolution.equiv_aperture_mm} unit="mm" color={result.resolution.seeing_limited ? '#fbbf24' : '#34d399'} />
                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '8px', borderLeft: '2px solid #00e5ff' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{result.resolution.verdict}</span>
                </div>
              </div>

              {/* Optics block */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Eye size={16} color="#a78bfa" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Optical Output</span>
                </div>
                <Row label="Magnification" value={result.optics.magnification} unit="×" />
                <Row label="Exit Pupil" value={result.optics.exit_pupil_mm} unit="mm" color={result.optics.exit_pupil_warning === 'Optimal' ? '#34d399' : '#fbbf24'} />
                <Row label="Max Useful Mag" value={result.optics.max_useful_mag} unit="×" />
                <Row label="Min Mag" value={result.optics.min_mag} unit="×" />
                <Row label="Limiting Mag" value={result.limiting_magnitude} color="#a78bfa" />
                {result.optics.exit_pupil_warning !== 'Optimal' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '8px', borderLeft: '2px solid #fbbf24' }}>
                    <AlertCircle size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{result.optics.exit_pupil_warning}</span>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
