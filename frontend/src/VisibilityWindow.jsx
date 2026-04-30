import React, { useState } from 'react';

const C = { cyan:'#22d3ee', purple:'#a78bfa', green:'#34d399', amber:'#fbbf24', red:'#f87171', dim:'rgba(255,255,255,0.3)', bright:'rgba(255,255,255,0.85)' };
const card = { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'20px' };
const Tag = ({c=C.cyan,ch}) => <span style={{background:`${c}18`,border:`1px solid ${c}40`,borderRadius:6,padding:'2px 8px',fontSize:11,fontWeight:600,color:c}}>{ch}</span>;

export default function VisibilityWindow({ targetName, lat, lon }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]     = useState(false);
  const [selDay, setSelDay] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/visibility-window?lat=${lat}&lon=${lon}&target_name=${encodeURIComponent(targetName)}&days=5`);
      const d = await r.json();
      setData(d); setOpen(true); setSelDay(0);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const HOUR_W = 28;

  return (
    <div style={{marginTop:12}}>
      <button
        onClick={open ? ()=>setOpen(false) : load}
        style={{border:'1px solid rgba(34,211,238,0.3)',cursor:'pointer',borderRadius:12,padding:'10px 22px',fontFamily:'inherit',fontWeight:600,fontSize:12,letterSpacing:'0.08em',color:C.cyan,background:'rgba(34,211,238,0.06)',transition:'all 0.3s'}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 20px rgba(34,211,238,0.25)'}
        onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
      >
        {loading ? '⟳ Loading...' : open ? '✕ Close' : '📅 Visibility Window (5 days)'}
      </button>

      {open && data && (
        <div style={{...card, marginTop:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <span style={{fontSize:12,fontWeight:700,letterSpacing:'0.12em',color:C.cyan,textTransform:'uppercase'}}>📅 Visibility Window — {data.target}</span>
            <div style={{flex:1}}/>
            <div style={{display:'flex',gap:8}}>
              {[{c:'#34d399',l:'Ideal ≥50°'},{c:'#fbbf24',l:'Good ≥30°'},{c:'rgba(255,255,255,0.15)',l:'Below 30°'}].map(({c,l},i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:10,height:10,borderRadius:3,background:c}}/>
                  <span style={{fontSize:10,color:C.dim}}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day tabs */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {data.days.map((day,i)=>(
              <button key={i} onClick={()=>setSelDay(i)}
                style={{border:`1px solid ${i===selDay?C.cyan:'rgba(255,255,255,0.08)'}`,cursor:'pointer',borderRadius:10,padding:'7px 14px',background:i===selDay?'rgba(34,211,238,0.1)':'transparent',fontFamily:'inherit',fontSize:12,fontWeight:600,color:i===selDay?C.cyan:C.dim,transition:'all 0.2s'}}>
                {day.day_label}
                <span style={{display:'block',fontSize:10,color:day.confidence==='high'?C.green:day.confidence==='moderate'?C.amber:C.red,marginTop:2}}>
                  {day.confidence_pct}% conf.
                </span>
              </button>
            ))}
          </div>

          {(() => {
            const day = data.days[selDay];
            return (
              <div>
                {/* Summary row */}
                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
                  <Tag c={day.confidence==='high'?C.green:day.confidence==='moderate'?C.amber:C.red} ch={`${day.confidence_pct}% Confidence`}/>
                  <Tag c={C.cyan} ch={`Transit ${day.transit_hour}:00 UTC @ ${day.transit_alt}°`}/>
                  <Tag c={C.purple} ch={`Best window: ${day.best_window}`}/>
                  <Tag c={C.dim} ch={`Astro dark: ${day.twilight.astro_dark_start_utc}:00–${day.twilight.astro_dark_end_utc}:00 UTC`}/>
                </div>

                {/* 24h timeline bars */}
                <div style={{overflowX:'auto'}}>
                  <div style={{display:'flex',alignItems:'flex-end',gap:2,height:100,minWidth:24*HOUR_W}}>
                    {day.hourly_altitude.map(({hour,alt,zone})=>{
                      const pct = Math.max(0, Math.min(100, (alt+90)/180*100));
                      const inVis = day.visibility_window_hours.includes(hour);
                      const bg = inVis ? (zone==='ideal'?'#34d399':zone==='good'?'#fbbf24':'rgba(255,255,255,0.15)') : 'rgba(255,255,255,0.06)';
                      const isTransit = hour === day.transit_hour;
                      return (
                        <div key={hour} title={`${hour}:00 UTC — Alt: ${alt}°`} style={{display:'flex',flexDirection:'column',alignItems:'center',width:HOUR_W,gap:3}}>
                          {isTransit && <span style={{fontSize:8,color:C.cyan,fontWeight:700}}>▼</span>}
                          <div style={{width:HOUR_W-4,height:`${pct}%`,background:bg,borderRadius:'4px 4px 0 0',transition:'height 0.3s',boxShadow:inVis&&zone==='ideal'?`0 0 6px #34d39980`:''}}/>
                          <span style={{fontSize:9,color:C.dim}}>{hour}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:4}}>Hour (UTC) · Hover bar for altitude · ▼ = transit</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
