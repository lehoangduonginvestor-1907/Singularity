import React, { useState } from 'react';

const C = {
  dim: 'rgba(255,255,255,0.3)',
  bright: 'rgba(255,255,255,0.85)',
  cyan: '#22d3ee',
  purple: '#a78bfa',
  green: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
  card: {
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
  },
};

const Tag = ({ children, color = C.cyan }) => (
  <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
    {children}
  </span>
);

const Row = ({ label, value, unit = '', highlight = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ fontSize: 12, color: C.dim }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 600, color: highlight ? C.cyan : C.bright, fontVariantNumeric: 'tabular-nums' }}>{value}{unit}</span>
  </div>
);

const Section = ({ title, icon, children, accent = C.cyan }) => (
  <div style={{ ...C.card, padding: '14px 18px', flex: 1, minWidth: 220 }}>
    <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: accent, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{icon}</span>{title}
    </p>
    {children}
  </div>
);

const DeltaBadge = ({ diff }) => {
  const color = Math.abs(diff) <= 1 ? C.green : diff > 0 ? C.cyan : C.amber;
  const label = Math.abs(diff) <= 1 ? '≈ Agreement' : diff > 0 ? `▲ +${diff} Interstellar` : `▼ ${diff} 7Timer`;
  return <Tag color={color}>{label}</Tag>;
};

const LayerTable = ({ layers }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
    <thead>
      <tr style={{ color: C.dim }}>
        {['hPa', 'Temp (°C)', 'U (m/s)', 'V (m/s)', 'Speed (m/s)'].map(h => (
          <th key={h} style={{ textAlign: 'right', padding: '3px 6px', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {layers.map(l => (
        <tr key={l.pressure_hpa} style={{ color: C.bright }}>
          <td style={{ padding: '4px 6px', textAlign: 'right', color: C.purple, fontWeight: 700 }}>{l.pressure_hpa}</td>
          <td style={{ padding: '4px 6px', textAlign: 'right' }}>{l.temp_c}</td>
          <td style={{ padding: '4px 6px', textAlign: 'right', color: l.wind_u_ms > 15 ? C.amber : C.bright }}>{l.wind_u_ms}</td>
          <td style={{ padding: '4px 6px', textAlign: 'right', color: l.wind_v_ms > 15 ? C.amber : C.bright }}>{l.wind_v_ms}</td>
          <td style={{ padding: '4px 6px', textAlign: 'right', color: l.wind_speed_ms > 20 ? C.red : l.wind_speed_ms > 10 ? C.amber : C.green, fontWeight: 700 }}>{l.wind_speed_ms}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ScoreBar = ({ label, score, weight, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: C.dim }}>{label} <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>({weight})</span></span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{score.toFixed(2)} / 10</span>
    </div>
    <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${(score / 10) * 100}%`, background: color, borderRadius: 99, boxShadow: `0 0 8px ${color}80`, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

const HourPanel = ({ row, expanded, onToggle }) => {
  const sc = row.interstellar_scores;
  const ph = row.physics;
  const bm = row.benchmark_7timer;

  return (
    <div style={{ ...C.card, overflow: 'hidden', marginBottom: 8 }}>
      {/* ── Header / Toggle ── */}
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: 15, fontWeight: 800, color: C.cyan, fontVariantNumeric: 'tabular-nums', minWidth: 48 }}>{row.time}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          <Tag color={sc.v_model_final >= 7 ? C.green : sc.v_model_final >= 4 ? C.amber : C.red}>
            ⚡ {sc.v_model_final} / 10
          </Tag>
          <Tag color={C.purple}>🔭 {bm.v_model_benchmark} / 10 (7Timer)</Tag>
          <DeltaBadge diff={row.delta.score_diff} />
          <Tag color={C.dim}>Alt {row.target_alt_deg}°</Tag>
          <Tag color={C.dim}>Seeing {ph.seeing_arcsec}"</Tag>
          {ph.dew_danger && <Tag color={C.red}>⚠ DEW</Tag>}
          {ph.air_mass_warning && <Tag color={C.amber}>⚠ AIR MASS</Tag>}
        </div>

        <span style={{ fontSize: 12, color: C.dim, transition: 'transform 0.3s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
      </div>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: 20 }}>

          {/* Row 1: Geometry + Surface + Physics */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>

            <Section title="Geometry (Astropy)" icon="🌐" accent={C.purple}>
              <Row label="Target Altitude" value={row.target_alt_deg} unit="°" highlight />
              <Row label="Target Azimuth" value={row.target_az_deg} unit="°" />
              <Row label="Moon Altitude" value={row.moon_alt_deg} unit="°" />
              <Row label="Moon Separation" value={row.moon_sep_deg} unit="°" />
              <Row label="Moon Phase" value={row.moon_phase_deg} unit="°" />
            </Section>

            <Section title="Surface Inputs (Open-Meteo)" icon="🌡" accent={C.amber}>
              <Row label="Temperature" value={row.surface.temp_c} unit=" °C" />
              <Row label="Rel. Humidity" value={row.surface.rh_percent} unit=" %" />
              <Row label="Pressure" value={row.surface.pressure_hpa} unit=" hPa" />
              <Row label="Cloud Cover" value={row.surface.cloud_cover_pct} unit=" %" />
              <Row label="AQI (EU Index)" value={row.surface.aqi} highlight />
            </Section>

            <Section title="Core Physics Output" icon="⚛" accent={C.cyan}>
              <Row label="Seeing" value={ph.seeing_arcsec} unit='"' highlight />
              <Row label="Transparency" value={ph.transparency} />
              <Row label="SQM (Sky Darkness)" value={ph.sqm_mag_arcsec2} unit=" mag/arcsec²" />
              <Row label="Air Mass" value={ph.air_mass} />
              <Row label="ΔT Dew Point" value={ph.delta_t_dew_c} unit=" °C" />
              <Row label="Dew Danger" value={ph.dew_danger ? '⚠ YES' : '✓ NO'} />
              <Row label="Air Mass Warning" value={ph.air_mass_warning ? '⚠ YES' : '✓ NO'} />
            </Section>
          </div>

          {/* Row 2: Atmospheric Layers */}
          <div style={{ ...C.card, padding: '14px 18px', marginBottom: 12 }}>
            <p style={{ margin: '0 0 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.green }}>
              🌬 Atmospheric Profile — Open-Meteo (5 pressure layers)
            </p>
            <LayerTable layers={row.atmos_layers} />
          </div>

          {/* Row 3: Score Breakdown + 7Timer */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Section title="Interstellar Score Breakdown" icon="📐" accent={C.cyan}>
              <ScoreBar label="Seeing Quality" score={sc.seeing_score} weight="50%" color={C.cyan} />
              <ScoreBar label="Transparency" score={sc.transparency_score} weight="30%" color={C.purple} />
              <ScoreBar label="Sky Darkness (Lunar)" score={sc.lunar_score} weight="20%" color={C.amber} />
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: C.dim, fontWeight: 600 }}>V-Model Final</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: sc.v_model_final >= 7 ? C.green : sc.v_model_final >= 4 ? C.amber : C.red }}>
                    {sc.v_model_final} <span style={{ fontSize: 14, color: C.dim }}>/ 10</span>
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                  = ({sc.seeing_score}×0.5) + ({sc.transparency_score}×0.3) + ({sc.lunar_score}×0.2)
                </p>
              </div>
            </Section>

            <Section title="7Timer Benchmark" icon="📡" accent={C.purple}>
              <Row label="Seeing (1=best, 8=worst)" value={bm.seeing_raw_1to8} highlight />
              <Row label="Transparency (1=best, 8=worst)" value={bm.transparency_raw_1to8} highlight />
              <Row label="V-Model Benchmark" value={bm.v_model_benchmark} unit=" / 10" />
              <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                  formula: {bm.formula}
                </p>
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Row label="Score Difference (Δ)" value={row.delta.score_diff > 0 ? `+${row.delta.score_diff}` : row.delta.score_diff} />
                <p style={{ margin: '8px 0 0', fontSize: 11, color: C.amber }}>{row.delta.interpretation}</p>
              </div>
            </Section>
          </div>

        </div>
      )}
    </div>
  );
};

export default function DebugConsole({ targetName, lat, lon }) {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [open, setOpen] = useState(false);

  const loadDebug = async () => {
    if (!targetName) return;
    setLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/debug-forecast?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(targetName)}`);
      const d = await r.json();
      setDebugData(d);
      setOpen(true);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ marginTop: 16 }}>
      {/* Toggle button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={open ? () => setOpen(false) : loadDebug}
          style={{
            border: '1px solid rgba(167,139,250,0.3)', cursor: 'pointer', borderRadius: 12,
            padding: '10px 22px', fontFamily: 'inherit', fontWeight: 600, fontSize: 12,
            letterSpacing: '0.08em', color: C.purple, background: 'rgba(167,139,250,0.08)',
            transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(167,139,250,0.3)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {loading ? '⟳ Loading Physics...' : open ? '✕ Close Debug Console' : '⚙ Open Physics Debug Console'}
        </button>
        {open && debugData && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Showing 12-hour physics trace for <strong style={{ color: C.purple }}>{debugData.target}</strong>
          </span>
        )}
      </div>

      {/* Console */}
      {open && debugData && (
        <div style={{ marginTop: 16, ...C.card, padding: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            <span style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Physics Debug Console — Live Trace</span>
            <div style={{ flex: 1 }} />
            <Tag color={C.dim}>Open-Meteo API</Tag>
            <Tag color={C.dim}>Astropy Ephemeris</Tag>
            <Tag color={C.dim}>7Timer Benchmark</Tag>
          </div>

          {/* Hour rows */}
          {debugData.debug.map((row, i) => (
            <HourPanel key={i} row={row} expanded={!!expanded[i]} onToggle={() => toggle(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
