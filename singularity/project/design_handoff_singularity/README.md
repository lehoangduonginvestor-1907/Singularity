# Handoff: Singularity Observatory Forecast System

## Overview

**Singularity** is a physics-first observatory forecast engine for professional astronomers and serious amateurs. The design includes three primary pages:

1. **Location Entry** — Lock a site (city search, coordinates, GPS, map)
2. **Scanning** — Real-time atmospheric physics computation with Gargantua black hole visualization
3. **Dashboard** — Post-computation Layer 1 dashboard with 24h forecast, metrics, and target planning

The system is built around a **Hybrid aesthetic**: Cinematic nebula backgrounds + editorial typography (Instrument Serif) + technical interface (Roboto Mono + Plus Jakarta) + glass-morphism cards with restrained motion.

## Fidelity

**High-fidelity (hifi)**: Pixel-perfect interactive prototypes with final colors, typography, spacing, interactions, and Red Vision (dark red) filter for preserving night vision during outdoor observations.

These are **design reference files created in HTML/React** — prototypes showing intended look, behavior, and information architecture. The task is to **recreate these designs in your target framework** (React, Vue, native, etc.) using your codebase's existing patterns and libraries — not to ship the HTML directly.

## Screens

### 1. Location Entry (1440×1280)

**Purpose**: User locks an observation site before running the physics engine.

**Layout**:
- **Nebula background**: Layered SVG (warm/cyan/violet radial gradients + soft filaments + star field + diffraction stars + vignette)
- **Top bar** (22px padding, sticky): Logo + "Singularity · OBSERVATORY ENGINE" + nav + UTC + Red Vision toggle
- **Hero section** (2-column grid, gap 72px):
  - **Left** (max-width 720px):
    - Badge: "STEP 01 · LOCK A SITE" (inline-flex, Roboto Mono, uppercase, purple dot)
    - Heading: "Where are you *observing* tonight?" (Instrument Serif, 112px, italic on "observing", -0.035em letter-spacing, -40% text-shadow)
    - Body: Explainer text (17px, 1.55 line-height, 560px max-width)
    - Mode chips (4): Place name / Coordinates / Use GPS / From map (the first is active)
    - Search input (refined glass card, 640px max-width):
      - Search icon on left, placeholder "Search a city, observatory, or paste 22.337, 103.844"
      - Right side: GPS button (38×38, borderRadius 11) + Lock site CTA button
      - Helper text below with ↵/⌘K/⌘G hints + green dot "Geocoder online · 38 ms"
  - **Right** (sticky-top):
    - Card "TONIGHT · GLOBAL AVERAGE":
      - Headline with timestamp
      - "62% *viable*" (Instrument Serif 56px, cyan on "62%", italic on "viable")
      - Subtext: "1,243 of 2,008 indexed sites tonight. Moon waning..."
      - Divider
      - 4 metric mini-tiles (2×2 grid, gap 20px):
        - MEDIAN SEEING: 1.6″ + sparkline (cyan)
        - TRANSPARENCY: 74% + sparkline (violet)
        - MEDIAN SQM: 20.4 + sparkline (violet)
        - DEW RISK: 18% + sparkline (green)
      - Footer: "5 sources · 12 models · next poll · 02:19"
- **Bottom section** (padding 72px 56px, margin-top 72px):
  - Headline: "Your sites · Tonight's outlook" (Instrument Serif 28px, italic on "familiar")
  - 5-card horizontal strip (grid 1fr ×5, gap 12px):
    - **3× Quick Sites** (Sa Pa, Tam Đảo, Mộc Châu): Site name (Instrument Serif 22px), region + alt, Bortle bar (9 segments), Score (Instrument Serif 36px, color-coded by score >= 7 cyan / >= 5 violet / < 5 orange)
    - **Moon card**: 3D moon (CSS radial gradient + craters), 86% illumination, Rise/Transit/Set times
    - **Featured Target** (M51): "M51 *Whirlpool*" (Instrument Serif 46px, italic on "Whirlpool"), galaxy info, Alt/Mag/Score grid
- **Footer** (position absolute bottom, single row): Data sources (ECMWF, GFS, 7TIMER, METAR, OSM, ESP32)

**Typography**:
- Headings: Instrument Serif, font-weight 400, letter-spacing -0.01em to -0.035em
- Body: Plus Jakarta Sans, font-weight 400-500, 15-17px
- Mono/Tech: Roboto Mono, font-weight 400-600, 10-13px, letter-spacing +0.12em to +0.18em
- Eyebrows: Roboto Mono, 9.5-10.5px, uppercase, letter-spacing 0.18em, color rgba(255,255,255,0.45)

**Colors**:
- Background: #0a0a0c
- Text primary: #fff
- Text secondary: rgba(255,255,255,0.55-0.7)
- Accent cyan: #7bf6ff (RGB 123, 246, 255)
- Accent violet: #c4a0fb (RGB 196, 160, 251)
- Accent orange: #ff9b4d (RGB 255, 155, 77)
- Accent green: #5cf2bd (RGB 92, 242, 189)
- Card background: linear-gradient(180deg, rgba(20,20,28,0.6), rgba(10,10,14,0.75))
- Card border: 1px solid rgba(255,255,255,0.06)
- Glow overlays: radial-gradient(..., transparent 60%)

**Interactions**:
- Lock site button: Hover increases background brightness
- GPS button: Click triggers location permission flow
- Mode chips: Click switches input mode (styling updates)
- Red Vision toggle (top-right): Applies hue-rotate(-30deg) saturate(1.45) brightness(0.88) contrast(1.08) to entire body

---

### 2. Scanning (1440×1080)

**Purpose**: Real-time computation display while the system processes atmospheric physics.

**Layout**:
- **Background**: Dark space with subtle nebula glow (no full-bleed SVG rect — lets page bg show through)
- **Top bar** (sticky): Same structure as Location Entry
- **Gargantua visualization** (centered, upper 50% of viewport):
  - SVG black hole with:
    - Background gradient + nebula glow (nebula as circular radial gradients, not full-screen rects)
    - Twinkling starfield (140 stars + 8 diffraction stars with ×/+ spikes)
    - Polar jets (subtle, ry=220, not oversized)
    - Main system rotated 6°:
      - Gravitational lensing (Einstein ring, outer halo + hot photon ring + sharp inner ring, all masked by event horizon)
      - Accretion disk BACK (scale 1 ×0.45, warped upward, 3 stroke, masked)
      - Event horizon (pure black, r=118-122)
      - Accretion disk FRONT (scale 1 ×0.22, flat, 2-3 stroke + counter-rotating dust lanes)
      - Relativistic beaming (left side brighter via radial gradient)
    - Soft glow filters (userSpaceOnUse, no clipping)
    - Animation: Continuous rotation (spin-slow, spin-med, spin-fast, spin-ccw)
- **Telemetry log** (below Gargantua, left-aligned, monospace):
  - SINGULARITY · COMPUTING
  - 6 log lines with timestamps and status (INIT, PHYSICS, PHYSICS, MODEL, AI, OK)
  - Progress bar below (cyan, animated)
  - Hint: "PRESS ESC TO ABORT · R TO REPLAY"
- **Top-right corner**: Red Vision toggle
- **Bottom-right corner**: TWEAKS · retry · red vision OFF

**Typography**: Same as Location Entry
**Colors**: Same as Location Entry
**Interactions**:
  - ESC key: Abort + return to Location Entry
  - R key: Replay animation
  - Red Vision toggle: Apply filter
  - Gargantua animation: ~6s timeline, breathing ease-in-out

---

### 3. Dashboard (1440×1080)

**Purpose**: Post-computation Layer 1 dashboard showing comprehensive forecast and observability metrics.

**Layout**:
- **Nebula background**: Circular nebula glow (not full-screen), ~1400 starfield
- **Top bar** (sticky): 
  - Left: Logo + "Singularity" + Layer tab group (4 tabs, first active with cyan highlight)
  - Center: Coords pill (pin icon + lat/lon + UTC+7)
  - Right: Synced chip (green) + Sync button (cyan gradient, uppercase) + Lang switcher (EN/VI) + Red Vision toggle
- **Hero section** (display flex, justify-between):
  - Left: Eyebrow "TONIGHT · 27 MAY · UTC+7 · SA PA" + Heading "Conditions are *excellent* tonight." (Instrument Serif 64px, italic on "excellent", -0.025em letter-spacing)
  - Body: Context ("Window 22:14 → 02:48 · seeing dips to 1.3″ FWHM · moon sets 04:12 · jet stream easing") — Roboto Mono snippets highlighted
  - Right: 3 chips (Moon 86%, Jet Easing, 12/12 Models Agree)
- **Metric grid** (display grid, gridTemplateColumns "340px 1fr", gap 20px):
  - **Left card** — Global Sky Score (featured):
    - Eyebrow "GLOBAL SKY SCORE" + italic sub "physics-first" + up-right arrow
    - Radial gauge (220×220, 88px ring, progress track, ticks):
      - Center value: "7.4" (Instrument Serif 72px) + "OF 10 · PEAK" (eyebrow below)
      - Gradient from cyan → violet
      - Glow drop-shadow
    - Divider
    - 2-col grid: NOW "3.2 / 10" + DELTA "4H +4.6 ↑" (cyan)
  - **Right section** (2×2 grid, gap 14px) — 4 metric tiles:
    - **Zenith Seeing** (cyan): 1.42″ FWHM + "↓ 0.4″ vs 24h avg · excellent" + sparkline (8 points, cyan)
    - **Transparency** (violet): 87% + "aerosol τ 0.12 · clean atmosphere" + sparkline (violet)
    - **Sky Darkness SQM** (cyan): 20.8 mag/arcsec² + "Bortle 4 · suburban-dark" + sparkline (cyan)
    - **Dew Risk** (green): 12% + "✓ Lens protected · ΔT 4.2°C margin" + sparkline (green)
  - Each metric tile:
    - Icon + label (Roboto Mono eyebrow)
    - Large value (Instrument Serif 52px, -0.02em)
    - Unit (Roboto Mono 13px)
    - Sub text (12.5px)
    - Sparkline (ThinSparkline: 200×24px, 1.2px stroke, thin terminal dot)
- **Forecast + Target** (grid gridTemplateColumns "1.55fr 1fr", gap 20px):
  - **Left card** — 24-Hour Physics Trace:
    - Eyebrow + Heading "Tonight's *observable* window." (Instrument Serif 26px, italic)
    - Legend: Singularity (cyan line) / 7Timer (violet dashed)
    - Chart (SVG, 800×280 canvas):
      - Twilight band (orange, 5.5h–18.5h range, light fill)
      - Optimal window (22h–24h, cyan dashed border, label)
      - Y-axis: 0-10 score grid (ticks, major every 2.5)
      - X-axis: 0-23 hours (labels every 4h)
      - Benchmark line (7Timer, violet dashed, 1.5px)
      - Physics score area fill (cyan gradient) + line (cyan, 2px, glow drop-shadow)
      - Counter-rotating dust layer (subtle)
      - Peak marker at x=0 (00:30): circle + spike line + tooltip "PEAK · 00:30 · 7.8"
      - Now line (x=14.2, 14:14 UTC, violet dashed)
    - Below chart (4-col grid):
      - PEAK · 00:30: 7.8 / 10
      - MIN SEEING: 1.3″ FWHM
      - MAX TRANS: 88% aerosol τ 0.10
      - WINDOW: 4h 34m continuous viable
  - **Right card** — Prime Target Spotlight (violet accent):
    - Eyebrow "PRIME TARGET" + Chip "VISIBLE"
    - Heading "M51 *Whirlpool*" (Instrument Serif 48px, italic on "Whirlpool")
    - Sub: "Sb galaxy · Canes Venatici · mag 8.4"
    - Transit arc SVG (320×130):
      - Compass line (SE → S → SW)
      - Altitude arc (dashed, violet)
      - Observed path (solid, violet, 2.5px, glow)
      - Peak at S, ALT 72° marker
      - Rise/Transit/Set timeline labels
    - Below (3-col grid):
      - RISE: 20:42
      - TRANSIT (violet bg): 00:30
      - SET: 04:18
- **Hourly strip** (full-width card):
  - Eyebrow "HOURLY · 12H AHEAD" + Heading "Minute-stepped *forecast*." (italic)
  - Tab group (right): 12H [active cyan] / 24H / 5D
  - 12-hour cards (grid 12 columns, gap 6px):
    - Each card:
      - Time "18:00" (Roboto Mono, centered, 11px)
      - Icon (cloud / sparkle / moon, 14px)
      - Score number (Instrument Serif 26px, peak hours cyan)
      - Bar chart within card (0–60px height, scaled to score/10, peak cyan gradient, others violet)
      - Seeing + Transparency (Roboto Mono 9.5px, small text)
      - Peak hours (23:00 + 00:00) highlighted with cyan border + top-right dot glow
- **Progressive disclosure row** (3 equal columns, gap 12px):
  - Each row contains icon + label + sub + count + chevron-down:
    - "Layer 2 · 5-Day Visibility Horizon" (violet tone)
    - "Layer 3 · Deep Nerd Stats" (orange tone)
    - "Gear Check · 80ED + ASI2600" (neutral tone)
- **Footer** (single row, justify-between):
  - Left: "ECMWF · 02:14 · GFS · 02:08 · 7TIMER · 02:00 · METAR · 02:13 · ESP32 · 02:11" (Roboto Mono)
  - Right: "Singularity v1.0.0 · physics engine v3.1 · last poll 02:14 UTC"

**Typography**: Same as Location Entry
**Colors**: Same + additional for layer backgrounds (violet slight tint, orange slight tint)
**Interactions**:
- Sync button: Click triggers refresh animation
- Layer tabs: Click switches view (not fully built in prototype)
- 12H / 24H / 5D tabs: Click switches hourly/daily/5day view
- Progressive disclosure rows: Click expands (not built in prototype)
- Red Vision toggle: Applies filter to entire page

---

## Interactions & Behavior

### Location Entry
- **Search input**:
  - Type place name → live geocoding with 38ms response
  - Paste coordinates (e.g., "22.337, 103.844") → auto-parse
  - Focus + ⌘K anywhere → opens search (global shortcut)
  - ⌘G → GPS permission flow
  - ↵ → Lock site (same as button click)
- **GPS button**: Click → request geolocation → populate input
- **Lock site button**: Disable until input is valid; click → navigate to Scanning page
- **Mode chips**: Click → switch between Place/Coordinates/GPS/Map input modes (visual feedback)
- **Red Vision toggle**: Click → apply hue-rotate filter to body; persist in localStorage

### Scanning
- **Page load**: Gargantua animation plays (6s breathe loop + entrance transition)
- **Telemetry log**: Auto-scroll as lines appear (staggered timing)
- **Progress bar**: Animated fill 0 → 100% over ~5–8s
- **ESC key**: Stop animation → fade to black → navigate back to Location Entry
- **R key**: Reset animation + replay (entrance → breathe loop)
- **Red Vision toggle**: Same as Location Entry
- **Layout**: Gargantua sized responsively (capped at viewport_height − 380) so telemetry always visible

### Dashboard
- **Sync button**: Click → animate button (icon spin) → refresh all cards with slight fade transition
- **Layer tabs**: Click → fade transition + update hero + recalculate metrics (UI built, data switching not)
- **Hourly tabs** (12H/24H/5D): Click → swap cards (only 12H populated in prototype)
- **Red Vision toggle**: Same as Location Entry
- **Chart interactions** (not built): Hover on hourly cells → tooltip; click → detail popup
- **All cards**: Subtle glow on hover (optional, hifi mockup only)

---

## State Management

### Location Entry
- `site`: { name, lat, lon, region, alt, bortle, tzOffset }
- `mode`: "place" | "coords" | "gps" | "map"
- `inputValue`: string (live search)
- `red`: boolean (Red Vision on/off, persisted localStorage)
- `geolocationPending`: boolean

### Scanning
- `phase`: "enter" | "main" | "exit" (Gargantua animation state)
- `logLines`: array of { timestamp, tag, text } (telemetry)
- `progress`: 0–100 (progress bar fill)
- `red`: boolean (Red Vision toggle, persisted)
- Timing: Pre-timed reveal of log lines + progress bar over ~6–8s

### Dashboard
- `site`: (from Location Entry or persisted)
- `metrics`: { seeing, transparency, sqm, dewRisk, skyScore, ... } (static in prototype, would be live in prod)
- `forecastData`: array of 24 hourly points (score, seeing, trans, etc.)
- `targetData`: { name, coords, rise, transit, set, altitude, magnitude, ... }
- `activeTab`: "layer1" | "layer2" | "layer3" (only layer1 shown in prototype)
- `forecastRange`: "12h" | "24h" | "5d"
- `red`: boolean (Red Vision toggle, persisted)

---

## Design Tokens

### Color Palette
```
Primary BG:         #0a0a0c
Text Primary:       #ffffff
Text Secondary:     rgba(255,255,255,0.55)
Text Tertiary:      rgba(255,255,255,0.35)

Accent Cyan:        #7bf6ff (0, 240, 255)
Accent Violet:      #c4a0fb (168, 85, 247)
Accent Orange:      #ff9b4d (255, 155, 77)
Accent Green:       #5cf2bd (0, 214, 138)
Accent Red:         #ff8aa0 (255, 138, 160)

Card BG:            linear-gradient(180deg, rgba(20,20,28,0.6), rgba(10,10,14,0.75))
Card Border:        1px solid rgba(255,255,255,0.06)
Card Glow Overlay:  radial-gradient(..., transparent 60%)

Glassmorphism:      backdrop-filter: blur(18–24px)
                    border: 1px solid rgba(255,255,255,0.04–0.06)
                    background: rgba(20,20,28,0.5–0.75)
                    box-shadow: 0 24px 60px rgba(0,0,0,0.35–0.45), inset 0 1px 0 rgba(255,255,255,0.04)

Red Vision Filter:  body.red-vision { filter: hue-rotate(-30deg) saturate(1.45) brightness(0.88) contrast(1.08); }
```

### Typography Scale
```
Display:            Instrument Serif, 112px, font-weight 400, letter-spacing -0.035em
Heading 1:          Instrument Serif, 64px, font-weight 400, letter-spacing -0.025em
Heading 2:          Instrument Serif, 48px, font-weight 400, letter-spacing -0.02em
Heading 3:          Instrument Serif, 26–28px, font-weight 400, letter-spacing -0.01em
Body Large:         Plus Jakarta, 17px, font-weight 400, line-height 1.55, letter-spacing 0
Body Regular:       Plus Jakarta, 15px, font-weight 400, line-height 1.5
Body Small:         Plus Jakarta, 13px, font-weight 400, line-height 1.4
Label:              Plus Jakarta, 12–13px, font-weight 500
Eyebrow:            Roboto Mono, 9.5–10.5px, uppercase, letter-spacing 0.18em, font-weight 500
Caption:            Roboto Mono, 9–11px, font-weight 400, letter-spacing 0.12em
Mono (Technical):   Roboto Mono, 11–14px, font-weight 400–600, letter-spacing 0.02–0.14em
```

### Spacing Scale
```
4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 22px, 24px, 28px, 32px, 36px, 40px, 56px, 72px, 80px
(Prefer multiples of 4 + 6; use 6 for subtle tweaks)
```

### Border Radius
```
999px (pills, badges)
20–22px (large cards)
14–18px (medium cards, input fields)
10–12px (small buttons, tiles)
7px (icon containers)
3–5px (micro elements, dividers)
```

### Shadows
```
Subtle Lift:        0 6px 20px rgba(0,0,0,0.25)
Card:               0 24px 60px rgba(0,0,0,0.35–0.45), inset 0 1px 0 rgba(255,255,255,0.04)
Glow (Cyan):        0 0 22px rgba(0,240,255,0.4–0.5)
Glow (Violet):      0 0 22px rgba(168,85,247,0.4)
Glow (Orange):      0 0 22px rgba(255,107,0,0.4)
Glow (Green):       0 0 22px rgba(0,214,138,0.4)
```

### Animation Easing
```
Standard:           ease-in-out (0.4s–0.6s for transitions)
Entrance:           cubic-bezier(0.16, 1, 0.3, 1) (1.4s)
Exit:               cubic-bezier(0.7, 0, 0.84, 0) (0.7s)
Breathe:            ease-in-out (6s loop)
Sparkle:            ease-in-out (4s–5s)
Rotation:           linear (18s–60s for continuous)
```

---

## Assets

### Icons
- Icons used throughout: search, pin, lock, compass, globe, cloud, sparkle, moon, droplet, eye, check, star, chevron-down, arrow-right, arrow-up-right, wind, layers, refresh, gear, calendar, etc.
- Source: Custom inline SVG (see `primitives.jsx` for Icon component)
- No external icon library bundled — implement using your codebase's icon system

### Typography
- **Instrument Serif**: Google Fonts (https://fonts.google.com/specimen/Instrument+Serif)
- **Plus Jakarta Sans**: Google Fonts (https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Roboto Mono**: Google Fonts (https://fonts.google.com/specimen/Roboto+Mono)

### Images / Illustrations
- **Nebula backgrounds**: SVG-only (no raster images)
- **Gargantua black hole**: SVG-only (7 layers: background gradient, nebula glow, starfield, polar jets, lensing ring, back disk, event horizon, front disk, beaming asymmetry)
- **Moon 3D**: CSS radial gradient (no image) with craters as overlaid circles
- **Charts**: SVG (sparklines, radial gauge, 24h forecast chart, hourly bar cards, transit arc)

### Files in Project
- `Location Entry.html` — Main entry page (imports React + Babel + component scripts)
- `loc-hybrid.jsx` — Location Entry hybrid design
- `loc-shared.jsx` — Shared primitives (SingularityMark, LangSwitch, RedVisionToggle, Icon component, preset sites)
- `primitives.jsx` — Core UI components (Card, Chip, ThinSparkline, etc.)
- `Scanning.html` — Scanning page
- `scanning.jsx` — Scanning page layout
- `gargantua.jsx` — Gargantua SVG component
- `Dashboard.html` — Dashboard page
- `dashboard-v2.jsx` — Dashboard full design
- `dashboard-app.jsx` — Dashboard React mount
- `singularity.css` — Global styles + typography + design tokens
- `Singularity — Scanning (standalone).html` — Pre-bundled standalone HTML (offline-capable)

---

## Implementation Notes for Developers

1. **These are design prototypes**, not production-ready code. You will be recreating them in your actual app codebase using:
   - Your framework's component patterns
   - Your build system (Vite, Next.js, Create React App, etc.)
   - Your state management (Redux, Zustand, Context, etc.)
   - Your CSS-in-JS or CSS modules, not inline styles

2. **Fonts**: Import from Google Fonts or your CDN. All three fonts are required.

3. **Colors**: Use a design token system (CSS variables, theme provider, token file) — don't hardcode hex values.

4. **Responsive behavior**: These prototypes are optimized for desktop (1440+). Add mobile breakpoints:
   - Mobile (< 640px): Stack columns, reduce font sizes, simplify charts
   - Tablet (640–1024px): 2-column layout in some places
   - Desktop (1024+): Full 3+ column layouts as shown

5. **Icons**: The prototype uses a custom `<Icon name="..." size={...}/>` component. Swap with your icon library (Radix, Feather, Hero Icons, etc.).

6. **Charts**: SVG charts (sparklines, gauge, 24h forecast) use custom D3-like math. Consider:
   - Lightweight charting: Recharts, Nivo, or Visx
   - Or implement custom SVG if performance is critical

7. **API integration**: Prototypes assume static data. Connect to:
   - Location geocoding (Nominatim, Google Maps, or internal service)
   - Physics engine API (compute seeing, transparency, etc. — backend placeholder)
   - Forecast database (24h predictions, target rise/transit/set times)

8. **Real-time updates**: Dashboard metrics auto-refresh. Use WebSocket or polling (every 2–5 minutes).

9. **Red Vision**: Implement via:
   - CSS filter on body (simplest)
   - Or theme toggle + CSS variable color swaps for more granular control

10. **Persistence**: Store in localStorage:
    - Selected site (location entry)
    - Red Vision preference
    - Active dashboard tab
    - Any user preferences

---

## Questions for Implementation

1. What is your target framework? (React web, Vue, native iOS/Android, desktop Electron, etc.)
2. Do you have an existing design system / component library?
3. Will this be a single-page app (SPA) or multi-page?
4. How is the physics engine accessed? (API endpoint, WebAssembly module, external service?)
5. What state management do you use (or plan to use)?
6. Mobile support needed?

---

## Contact & Feedback

If any part of this design is unclear, ambiguous, or conflicts with your codebase's patterns, reach out with specific questions.

---

**Design Date**: May 27, 2026  
**Fidelity**: High-fidelity interactive prototype  
**Status**: Ready for development
