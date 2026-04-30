import React, { useState } from 'react';

const C = { cyan:'#22d3ee', purple:'#a78bfa', green:'#34d399', amber:'#fbbf24', red:'#f87171', dim:'rgba(255,255,255,0.3)' };
const card = { background:'rgba(255,255,255,0.03)', backdropFilter:'blur(30px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'20px' };
const Row = ({label,value,color,unit=''}) => (
  <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
    <span style={{fontSize:12,color:C.dim}}>{label}</span>
    <span style={{fontSize:12,fontWeight:700,color:color||'rgba(255,255,255,0.85)',fontVariantNumeric:'tabular-nums'}}>{value}{unit}</span>
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
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/gear-check?lat=${lat}&lon=${lon}&aperture_mm=${aperture}&focal_length_mm=${focal}&eyepiece_mm=${eyepiece}`;
      const r = await fetch(url);
      const d = await r.json();
      setResult(d); setOpen(true);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const inp = (val,set,label,unit) => (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      <span style={{fontSize:10,color:C.dim,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase'}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'8px 12px',gap:6}}>
        <input type="number" value={val} onChange={e=>set(parseFloat(e.target.value))}
          style={{background:'none',border:'none',outline:'none',color:'white',fontFamily:'inherit',fontSize:14,fontWeight:700,width:70}}/>
        <span style={{fontSize:12,color:C.dim}}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{marginTop:12}}>
      {/* Input row */}
      <div style={{...card, display:'flex',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
        <span style={{fontSize:14,marginBottom:4}}>🔭</span>
        {inp(aperture,setAperture,'Aperture','mm')}
        {inp(focal,setFocal,'Focal Length','mm')}
        {inp(eyepiece,setEyepiece,'Eyepiece','mm')}
        <button onClick={check}
          style={{border:'none',cursor:'pointer',borderRadius:12,padding:'12px 24px',background:'linear-gradient(135deg,#a78bfa,#6366f1)',fontFamily:'inherit',fontWeight:700,fontSize:12,color:'white',letterSpacing:'0.08em',transition:'all 0.3s',marginBottom:2}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 24px rgba(167,139,250,0.5)'}
          onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
        >
          {loading ? '⟳ Analyzing...' : '⚙ Check Gear'}
        </button>
      </div>

      {open && result && (
        <div style={{...card,marginTop:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <span style={{fontSize:12,fontWeight:700,letterSpacing:'0.12em',color:C.purple,textTransform:'uppercase'}}>⚙ Gear Analysis — {aperture}mm f/{(focal/aperture).toFixed(1)}</span>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
            {/* Resolution */}
            <div style={{background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.15)',borderRadius:14,padding:'16px'}}>
              <p style={{margin:'0 0 12px',fontSize:10,fontWeight:700,color:C.purple,letterSpacing:'0.12em',textTransform:'uppercase'}}>🔬 Resolution</p>
              <Row label="Current Seeing" value={result.current_seeing_arcsec} unit='"' color={result.current_seeing_arcsec < 1 ? C.green : result.current_seeing_arcsec < 2 ? C.amber : C.red}/>
              <Row label="Rayleigh Limit" value={result.resolution.rayleigh_arcsec} unit='"'/>
              <Row label="Dawes Limit" value={result.resolution.dawes_arcsec} unit='"'/>
              <Row label="Effective Resolution" value={result.resolution.effective_arcsec} unit='"' color={C.cyan}/>
              <Row label="Equiv. Aperture" value={result.resolution.equiv_aperture_mm} unit="mm" color={result.resolution.seeing_limited ? C.amber : C.green}/>
              <p style={{margin:'10px 0 0',fontSize:11,color:result.resolution.seeing_limited?C.amber:C.green}}>{result.resolution.verdict}</p>
            </div>

            {/* Optics */}
            <div style={{background:'rgba(34,211,238,0.05)',border:'1px solid rgba(34,211,238,0.15)',borderRadius:14,padding:'16px'}}>
              <p style={{margin:'0 0 12px',fontSize:10,fontWeight:700,color:C.cyan,letterSpacing:'0.12em',textTransform:'uppercase'}}>🔭 Optics</p>
              <Row label="Magnification" value={result.optics.magnification} unit="×"/>
              <Row label="Exit Pupil" value={result.optics.exit_pupil_mm} unit="mm" color={result.optics.exit_pupil_warning==='Optimal'?C.green:C.amber}/>
              <Row label="Max Useful Mag" value={result.optics.max_useful_mag} unit="×"/>
              <Row label="Min Mag" value={result.optics.min_mag} unit="×"/>
              <Row label="Limiting Magnitude" value={result.limiting_magnitude} color={C.purple}/>
              <p style={{margin:'10px 0 0',fontSize:11,color:result.optics.exit_pupil_warning==='Optimal'?C.green:C.amber}}>
                Exit pupil: {result.optics.exit_pupil_warning}
              </p>
            </div>

            {/* Double Stars */}
            <div style={{background:'rgba(251,191,36,0.05)',border:'1px solid rgba(251,191,36,0.15)',borderRadius:14,padding:'16px'}}>
              <p style={{margin:'0 0 12px',fontSize:10,fontWeight:700,color:C.amber,letterSpacing:'0.12em',textTransform:'uppercase'}}>⭐ Double Stars</p>
              {result.double_stars.map((ds,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',alignItems:'center'}}>
                  <div>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>{ds.name}</span>
                    <span style={{fontSize:10,color:C.dim,marginLeft:6}}>{ds.sep}"</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:ds.resolvable?C.green:C.red}}>{ds.verdict}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
