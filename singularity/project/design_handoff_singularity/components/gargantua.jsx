/* Gargantua — cleaner build using user-provided code as framework
   Keeping the architecture:
     · background gradient + nebula glow + starfield
     · polar relativistic jets (subtle)
     · main system rotated 6°
       1. Gravitational lensing (Einstein ring) — masked by event horizon
       2. Accretion disk BACK — warped upward, back-mask + EH mask, scale(1, 0.45)
       3. Event horizon
       4. Accretion disk FRONT — front-mask, scale(1, 0.22) so flatter in front
       5. Relativistic beaming — left side brighter
   Tuned for our scanning page: cleaner rings, fewer dashes, restrained motion */

const { useState, useEffect, useMemo } = React;

const Gargantua = ({ size = 560, red = false, phase = "main" }) => {
  const entrance =
    phase === "enter" ? "garg-entrance 1.4s cubic-bezier(0.16, 1, 0.3, 1) both" :
    phase === "exit"  ? "garg-exit 0.7s cubic-bezier(0.7, 0, 0.84, 0) both" :
    "garg-breathe 6s ease-in-out infinite";

  const redFilter = red
    ? "hue-rotate(-30deg) saturate(1.45) brightness(0.88) contrast(1.08)"
    : "none";

  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      width: size, height: size,
      animation: entrance,
      willChange: "transform, opacity, filter"
    }}>
      <div style={{ width: "100%", height: "100%", filter: redFilter, transition: "filter 0.6s ease" }}>
        <svg xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 1000 1000"
             width="100%" height="100%"
             preserveAspectRatio="xMidYMid meet"
             style={{ display: "block" }}>
          <defs>
            {/* Backdrop */}
            <radialGradient id="g-bg" cx="50%" cy="50%" r="70%">
              <stop offset="0%"   stopColor="#060212"/>
              <stop offset="60%"  stopColor="#020005"/>
              <stop offset="100%" stopColor="#000000"/>
            </radialGradient>
            <radialGradient id="g-neb1" cx="32%" cy="36%" r="55%">
              <stop offset="0%"   stopColor="#3b1154" stopOpacity="0.22"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="g-neb2" cx="70%" cy="64%" r="50%">
              <stop offset="0%"   stopColor="#0a2d54" stopOpacity="0.18"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </radialGradient>

            {/* Disk gradients — cleaner, fewer color stops */}
            <radialGradient id="g-disk-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="22%"  stopColor="#ffe699" stopOpacity="1"/>
              <stop offset="55%"  stopColor="#ff7a1a" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#ff2200" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="g-disk-outer" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff9900" stopOpacity="0.5"/>
              <stop offset="60%"  stopColor="#ff3300" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </radialGradient>

            {/* Polar jet */}
            <linearGradient id="g-jet" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.35"/>
              <stop offset="30%"  stopColor="#3a86ff" stopOpacity="0.18"/>
              <stop offset="70%"  stopColor="#8338ec" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
            </linearGradient>

            {/* Beaming */}
            <radialGradient id="g-beam" cx="25%" cy="50%" r="42%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.28"/>
              <stop offset="55%"  stopColor="#ffaa00" stopOpacity="0.10"/>
              <stop offset="100%" stopColor="#ff0000" stopOpacity="0"/>
            </radialGradient>

            {/* Glow filters with userSpaceOnUse to avoid clipping */}
            <filter id="f-heavy" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1600" height="1600">
              <feGaussianBlur stdDeviation="22" result="b1"/>
              <feGaussianBlur stdDeviation="55" result="b2"/>
              <feMerge>
                <feMergeNode in="b2"/>
                <feMergeNode in="b1"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="f-med" filterUnits="userSpaceOnUse" x="-200" y="-200" width="1400" height="1400">
              <feGaussianBlur stdDeviation="12"/>
            </filter>
            <filter id="f-light" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="1200">
              <feGaussianBlur stdDeviation="4"/>
            </filter>

            {/* Soft front/back masks for seamless overlap */}
            <linearGradient id="g-frontMask" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="42%" stopColor="black"/>
              <stop offset="50%" stopColor="white"/>
              <stop offset="100%" stopColor="white"/>
            </linearGradient>
            <mask id="m-front">
              <rect width="1000" height="1000" fill="url(#g-frontMask)"/>
            </mask>

            <linearGradient id="g-backMask" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"  stopColor="white"/>
              <stop offset="50%" stopColor="white"/>
              <stop offset="58%" stopColor="black"/>
            </linearGradient>
            <mask id="m-back">
              <rect width="1000" height="1000" fill="url(#g-backMask)"/>
            </mask>

            {/* Event-horizon protection — block light from inside the BH */}
            <mask id="m-eh">
              <rect width="1000" height="1000" fill="white"/>
              <circle cx="500" cy="500" r="118" fill="black"/>
            </mask>
          </defs>

          <style>{`
            @keyframes g-cw { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
            @keyframes g-ccw { 0% { transform: rotate(360deg);} 100% { transform: rotate(0deg);} }
            @keyframes g-pulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
            @keyframes g-twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
            .spin-slow   { transform-origin: 500px 500px; animation: g-cw 60s linear infinite; }
            .spin-med    { transform-origin: 500px 500px; animation: g-cw 32s linear infinite; }
            .spin-fast   { transform-origin: 500px 500px; animation: g-cw 18s linear infinite; }
            .spin-ccw    { transform-origin: 500px 500px; animation: g-ccw 22s linear infinite; }
            .pulse       { animation: g-pulse 5s ease-in-out infinite; }
            .twinkle     { fill: #fff; animation: g-twinkle 4s ease-in-out infinite; }
            .twinkle2    { fill: #fff; animation: g-twinkle 4s ease-in-out infinite; animation-delay: 1.8s; }
          `}</style>

          {/* 1. Backdrop — soft circular nebula glow only (no full-bleed rect so page bg shows through) */}
          <circle cx="500" cy="500" r="480" fill="url(#g-neb1)"/>
          <circle cx="500" cy="500" r="480" fill="url(#g-neb2)"/>

          {/* 2. Starfield — clipped to circle area */}
          <g>
            {[[150,200,1,0.5],[850,150,1.5,0.6],[220,750,1,0.4],[900,800,1,0.5],
              [450,100,1.2,0.3],[100,600,1.5,0.5],[780,650,1,0.4],
              [60,420,1,0.35],[940,300,1.2,0.4],[520,920,1,0.3]].map(([x,y,r,o],i) =>
              <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o}/>
            )}
            <circle className="twinkle"  cx="300" cy="250" r="1.4"/>
            <circle className="twinkle2" cx="700" cy="280" r="1.8"/>
            <circle className="twinkle"  cx="80"  cy="380" r="1.4"/>
            <circle className="twinkle"  cx="800" cy="720" r="1.2"/>
            <circle className="twinkle2" cx="180" cy="850" r="1.4"/>
            <circle className="twinkle"  cx="600" cy="80"  r="1.6"/>
            <circle className="twinkle2" cx="920" cy="400" r="1"/>
          </g>

          {/* 3. Polar jets — short stubs so they don't stab through the layout */}
          <g opacity="0.22" filter="url(#f-heavy)">
            <ellipse cx="500" cy="500" rx="18" ry="220" fill="url(#g-jet)" transform="rotate(15 500 500)"/>
            <ellipse cx="500" cy="500" rx="18" ry="220" fill="url(#g-jet)" transform="rotate(195 500 500)"/>
          </g>

          {/* === MAIN SYSTEM — tilted 6° === */}
          <g transform="rotate(6 500 500)">

            {/* 4. Gravitational lensing — Einstein ring (masked by EH) */}
            <g mask="url(#m-eh)">
              {/* Outer halo */}
              <circle cx="500" cy="500" r="175" fill="none" stroke="#ff5a1a" strokeWidth="46"
                opacity="0.30" filter="url(#f-heavy)"/>
              {/* Hot photon ring */}
              <circle className="pulse" cx="500" cy="500" r="148" fill="none" stroke="#ffba50" strokeWidth="20"
                opacity="0.75" filter="url(#f-med)"/>
              {/* Sharp inner ring */}
              <circle cx="500" cy="500" r="132" fill="none" stroke="#ffe699" strokeWidth="3"
                opacity="0.9" filter="url(#f-light)"/>
            </g>

            {/* 5. Accretion disk BACK — warped upward, more vertical */}
            <g mask="url(#m-back)">
              <g mask="url(#m-eh)">
                <g transform="translate(500 485) scale(1 0.45) translate(-500 -500)">
                  {/* Soft body */}
                  <g className="spin-med" filter="url(#f-med)" opacity="0.85">
                    <circle cx="500" cy="500" r="360" fill="none"
                      stroke="url(#g-disk-outer)" strokeWidth="140"/>
                    <circle cx="500" cy="500" r="280" fill="none"
                      stroke="url(#g-disk-core)" strokeWidth="80"/>
                  </g>
                  {/* Hot inner streaks */}
                  <g className="spin-fast" filter="url(#f-light)" opacity="0.9">
                    <circle cx="500" cy="500" r="220" fill="none"
                      stroke="#ffffff" strokeWidth="6" strokeDasharray="320 180" opacity="0.8"/>
                  </g>
                </g>
              </g>
            </g>

            {/* 6. Event horizon — pure black core with faint inner shadow */}
            <g filter="url(#f-light)">
              <circle cx="500" cy="500" r="122" fill="#0a0204" opacity="0.85"/>
              <circle cx="500" cy="500" r="118" fill="#000000"/>
            </g>

            {/* 7. Accretion disk FRONT — flat in front of BH */}
            <g mask="url(#m-front)">
              <g transform="translate(500 500) scale(1 0.22) translate(-500 -500)">
                {/* Outer hazy glow */}
                <g className="spin-slow" filter="url(#f-heavy)" opacity="0.55">
                  <circle cx="500" cy="500" r="440" fill="none"
                    stroke="url(#g-disk-outer)" strokeWidth="160"/>
                </g>
                {/* Main glowing body */}
                <g className="spin-med" filter="url(#f-med)">
                  <circle cx="500" cy="500" r="360" fill="none"
                    stroke="url(#g-disk-core)" strokeWidth="100" opacity="0.92"/>
                  <circle cx="500" cy="500" r="285" fill="none"
                    stroke="#ffe699" strokeWidth="38" opacity="0.95"/>
                </g>
                {/* Sharp hot streaks */}
                <g className="spin-fast" filter="url(#f-light)">
                  <circle cx="500" cy="500" r="245" fill="none"
                    stroke="#ffffff" strokeWidth="14" opacity="1"/>
                  <circle cx="500" cy="500" r="320" fill="none"
                    stroke="#ff8a20" strokeWidth="10" strokeDasharray="280 160" opacity="0.7"/>
                </g>
                {/* Counter-rotating dust lanes for depth */}
                <g className="spin-ccw" filter="url(#f-light)" opacity="0.55">
                  <circle cx="500" cy="500" r="380" fill="none"
                    stroke="#ff3300" strokeWidth="6" strokeDasharray="180 140" opacity="0.8"/>
                  <circle cx="500" cy="500" r="300" fill="none"
                    stroke="#ffaa00" strokeWidth="4" strokeDasharray="80 220" opacity="0.7"/>
                </g>
              </g>
            </g>

            {/* 8. Relativistic beaming — left side brighter (gas moving toward viewer) */}
            <g transform="translate(500 500) scale(1 0.22) translate(-500 -500)" pointerEvents="none">
              <circle cx="300" cy="500" r="240" fill="url(#g-beam)" filter="url(#f-heavy)"
                style={{ mixBlendMode: "screen" }}/>
            </g>

          </g>
        </svg>
      </div>
    </div>
  );
};

window.Gargantua = Gargantua;
