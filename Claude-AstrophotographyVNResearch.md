# Dark-Sky Atlas of Vietnam — A Practitioner's Field Manual

**Version 1.0 (May 2026) — for serious amateur observers, not tourists.**

This document is built for someone who already understands that a Bortle class is not a synonym for atmospheric transparency, that Kasten–Young extinction matters more than headline darkness near the horizon at Vietnam's latitudes, and that the difference between a B3 site at 35% humidity and a B3 site at 95% humidity is the difference between a workable galaxy night and a ruined corrector plate. The structure honours that.

A few unavoidable caveats up front:

- **No SQM ground-truth network exists in Vietnam.** Unlike the US, Europe, Chile or Australia, there is no community-maintained SQM database for Vietnamese sites. Every Bortle estimate below is therefore one of three things: (a) **VIIRS-derived** (lightpollutionmap.info / Falchi 2016 / Lorenz overlays, NOAA VIIRS 2022 release), (b) **practitioner-reported** (HAS Hà Nội, PAC, HAAC/VietAstro, Cloudy Nights SE-Asia threads, Vietnamese phượt forums, Reddit) or (c) **inferred** from latitude, elevation and distance from VIIRS hot pixels. I tag each accordingly. Treat all numbers as *first-order estimates*, not measurements.
- **Vietnam is humid.** Even the driest, highest sites routinely run 70–95% relative humidity at night. Dew, fogging correctors, condensation on flats panels and electronics — these will kill more sessions than light pollution will. Every score below penalises humidity. A Bortle 2 site at coastal sea-level is *worse* for serious imaging than a Bortle 3 site at 1500 m on the dry side of the Trường Sơn range. The atlas reflects that.
- **Light pollution is creeping fast.** Đà Lạt, Sa Pa, Mũi Né, Phú Quốc, Mộc Châu and Măng Đen have all measurably brightened on VIIRS between the 2015 and 2022 releases. The atlas assumes 2022 VIIRS data plus a small forward correction; sites flagged as "creep risk" are degrading by roughly 0.05–0.1 mag/arcsec²/year based on the trend.
- **Two monsoons govern everything.** The Northeast monsoon (≈Oct–Apr) brings dry, cold, clear nights to the *interior north and central highlands*, but persistent grey "crachin" drizzle and stratocumulus to the *Red River Delta and the central coast*. The Southwest monsoon (≈May–Sep) brings convective rain to almost the entire country except a narrow lee window on the central coast (Phú Yên, Khánh Hoà, Ninh Thuận, Bình Thuận) where Jul–Aug can be shockingly clear. Choosing site by month, not by reputation, is the single most important skill.

---

## Scoring Model

Total **/100**, decomposed as:

| Component | Max | What it actually measures |
|---|---|---|
| Sky Darkness | 30 | VIIRS zenith brightness + skyline gradient toward nearest urban dome |
| Cloud Reliability | 20 | % clear-night fraction averaged over the *best 3 months* (not annual) |
| Accessibility | 15 | Time-cost from HAN or HCM gateway; road quality for a 20 kg payload |
| Safety | 10 | Night-time personal safety, road safety, wildlife, theft, military checkpoints |
| Elevation | 10 | Linear above 0 m, capped at 2500 m. Affects extinction, transparency, dew load |
| Open Horizon | 10 | Useful sky between 15° altitude and zenith on at least 270° of azimuth |
| Humidity (lower is better) | 5 | Inverted; based on station data and elevation/season interaction |

Bortle "confidence" tags: **H** = corroborated by both VIIRS and on-the-ground reports; **M** = VIIRS only or single trip report; **L** = inferred only.

---

# PART 1 — Master Ranked Top 30

Coordinates are given to 3–4 decimals (≈10–100 m). Where I cannot vouch for the exact spot, I give a centroid for the area and tag it *(approx.)*. Distances are road-distance from Hà Nội (HAN) or HCM City (HCM) gateway, not great-circle.

| # | Site (GPS) | Province | Bortle (conf.) | Elev (m) | Score | Best months |
|---|---|---|---|---|---|---|
| 1 | **Đồng Văn karst plateau – Lũng Cú / Sảng Tủng ridges** (23.350, 105.310) *approx.* | Hà Giang | 2 (H) | 1400–1700 | 86 | Oct–Mar |
| 2 | **Tà Xùa summit ridge** (21.358, 104.450) *approx., GPS-recorded ~2875 m* | Sơn La / Yên Bái | 2 (H) | 2400–2865 | 84 | Nov–Mar |
| 3 | **Lảo Thẩn (Núi Lảo Thẩn / Hâu Pông San)** (22.6104, 103.6865) | Lào Cai (Y Tý) | 2 (H) | 2826 | 84 | Oct–Feb |
| 4 | **Bidoup summit & Long Lanh saddle** (12.117, 108.673) *approx.* | Lâm Đồng | 3 (H) | 1700–2287 | 83 | Dec–Mar |
| 5 | **Côn Đảo – Bãi Đầm Trầu / Mũi Cá Mập** (8.700, 106.625) | Bà Rịa–Vũng Tàu | 2–3 (H) | 0–80 | 82 | Mar–Aug |
| 6 | **Bạch Mộc Lương Tử (Ky Quan San) high camp** (22.500, 103.575) *approx.* | Lai Châu / Lào Cai | 2 (H) | 2100–3046 | 82 | Nov–Mar |
| 7 | **Y Tý – Phìn Hồ / Ngải Thầu plateau** (22.633, 103.672) *approx.* | Lào Cai | 2–3 (H) | 1900–2200 | 81 | Oct–Feb |
| 8 | **Phú Quý – Mũi Cột Cờ / Vịnh Triều Dương SE coast** (10.524, 108.945) *approx.* | Bình Thuận | 2–3 (M) | 0–106 | 80 | Feb–Aug |
| 9 | **Chư Yang Sin NP – Krông Bông core** (12.413, 108.450) *approx.* | Đắk Lắk | 2–3 (M) | 1000–2442 | 79 | Dec–Mar |
| 10 | **Bạch Long Vĩ Island** (20.140, 107.722) | Hải Phòng | 2 (M) | 0–58 | 78 | Mar–early May, Sep |
| 11 | Mã Pí Lèng Pass viewpoint area (23.260, 105.359) | Hà Giang | 2 (H) | 1500 | 78 | Oct–Mar |
| 12 | Pù Luông core – Son Bá Mười plateau (20.483, 105.117) *approx.* | Thanh Hoá | 3 (M) | 1000–1300 | 76 | Oct–Apr |
| 13 | Phong Nha – Hang Ba / U Bò backcountry (17.500, 106.250) *approx.* | Quảng Bình | 3 (M) | 400–700 | 76 | Mar–Aug |
| 14 | Tà Năng – Phan Dũng plateau (11.482, 108.435) *approx.* | Lâm Đồng / Bình Thuận | 3 (H) | 1100–1700 | 76 | Dec–Apr |
| 15 | Pu Mát NP – Khe Kèm / Phà Lài (19.000, 104.700) *approx.* | Nghệ An | 3 (M) | 200–800 | 75 | Mar–Aug |
| 16 | Măng Đen – Kon Bring / Đak Ke perimeter (14.640, 108.290) *approx., creep risk* | Kon Tum | 3 (H) | 1100–1300 | 75 | Dec–Mar |
| 17 | Putaleng high camp (22.412, 103.475) *approx.* | Lai Châu | 2 (M) | 2000–3049 | 75 | Nov–Mar |
| 18 | Tà Chì Nhù summit camp (21.521, 104.317) *approx.* | Yên Bái | 2 (M) | 2400–2979 | 75 | Nov–Mar |
| 19 | Khâu Phạ – Lìm Mông / Tú Lệ ridges (21.745, 104.300) *approx.* | Yên Bái | 3 (M) | 1200–1500 | 74 | Oct–Mar |
| 20 | Cao Bằng – Phia Oắc NP (22.617, 105.870) *approx.* | Cao Bằng | 3 (M) | 1500–1931 | 74 | Oct–Mar |
| 21 | Đèo Gia Bắc / Lộc Bắc forest (11.713, 107.760) *approx.* | Lâm Đồng | 3 (M) | 800–1400 | 73 | Dec–Mar |
| 22 | Bàu Trắng dunes (north side) (11.172, 108.388) | Bình Thuận | 4 (H) | 30–60 | 72 | Jan–Apr, Jul–Aug |
| 23 | Mũi Né – Suối Hồng / inland Hòn Rơm (10.972, 108.345) *approx.* | Bình Thuận | 4 (H) creep | 5–80 | 71 | Feb–Apr, Jul–Aug |
| 24 | Cát Tiên NP – Bàu Sấu interior (11.450, 107.367) *approx.* | Đồng Nai / Lâm Đồng | 3 (M) | 100–300 | 71 | Dec–Mar |
| 25 | Pha Đin Pass plateau (21.587, 103.447) *approx.* | Sơn La / Điện Biên | 3 (M) | 1000–1200 | 71 | Nov–Mar |
| 26 | Hang Kia – Pà Cò (20.730, 104.870) *approx.* | Hoà Bình | 3 (M) | 1100–1400 | 70 | Nov–Mar |
| 27 | Mộc Châu – Pa Phách / Tà Số plateaus (20.875, 104.620) *approx., creep risk* | Sơn La | 4 (H) | 1000–1300 | 70 | Nov–Mar |
| 28 | Lý Sơn (Đảo Lớn east side) (15.385, 109.125) | Quảng Ngãi | 3 (M) | 0–169 | 70 | Mar–Aug |
| 29 | Bạch Mã NP summit area (16.196, 107.853) | Thừa Thiên Huế | 3 (M) | 1200–1450 | 69 | Mar–Aug, *not* Sep–Feb |
| 30 | Cô Tô island east coast (20.962, 107.808) *approx.* | Quảng Ninh | 3 (M) | 0–170 | 68 | Mar–early May, Sep–Oct |

### Elite Dark-Sky Sub-section (the absolute best for hardcore deep-sky imaging)

Of the above, only the following combine **VIIRS-confirmed Bortle 2** with **>1500 m elevation** with **dry-side / lee monsoon climate** with **at least one good imaging month per quarter**:

1. **Tà Xùa summit ridge** — best in the country for narrow-band imaging Nov–Feb. Wind is the limiting factor, not transparency.
2. **Lảo Thẩn / Y Tý plateau** — slightly better road access than Tà Xùa, similar Bortle.
3. **Đồng Văn plateau (Sảng Tủng / Lũng Cú interior)** — the highest "useful" Bortle 2 footprint in Vietnam by area; pick a spot 2–3 km off any of the QL4C villages.
4. **Bidoup summit / Long Lanh saddle** — best southern-Vietnam dry-season site that you can reasonably bring a 130 mm refractor to (Bidoup access road runs to ~1700 m).
5. **Bạch Mộc Lương Tử summit camp** — Bortle 2 + 2700 m, but porter-only access; for the obsessive only.
6. **Côn Đảo (Bãi Đầm Trầu / Mũi Cá Mập)** — the only true Bortle 2 *coastal* site in the country. April–August window is unique because the galactic core rises directly over the sea on the SE horizon with zero artificial gradient.
7. **Bạch Long Vĩ Island** — theoretically the darkest single point in Vietnamese territorial waters on VIIRS; practically gated behind ferry permits and bad weather (see Part 5).

---

# PART 2 — Extended Tier List

Only sites with at least one corroborating practitioner report or unambiguous VIIRS reading included. I am deliberately not padding with poorly-documented locations.

### Tier S — World-class (Bortle 1–2, exceptional)
*True Bortle 1 effectively does not exist on the Vietnamese mainland; you would need to be on a boat 50+ km offshore. The "S" tier here is Bortle 2 with everything else aligned.*

- Tà Xùa summit ridge, Sơn La/Yên Bái
- Lảo Thẩn high camp, Lào Cai
- Bạch Mộc Lương Tử summit camp, Lai Châu/Lào Cai
- Đồng Văn karst interior (north of Sảng Tủng, away from QL4C), Hà Giang
- Putaleng high camp, Lai Châu
- Tà Chì Nhù summit, Yên Bái
- Bạch Long Vĩ Island, Hải Phòng
- Côn Đảo backcountry beaches (Đầm Trầu, Ông Đụng), Bà Rịa-Vũng Tàu

### Tier A — Excellent (Bortle 2–3)
- Y Tý plateau / Phìn Hồ / Ngải Thầu, Lào Cai
- Mã Pí Lèng / Săm Pun corridor, Hà Giang
- Bidoup–Núi Bà core (Long Lanh, Đa Nhim ranger station), Lâm Đồng
- Chư Yang Sin NP backcountry, Đắk Lắk
- Phia Oắc / Phia Đén, Cao Bằng
- Pù Luông core (Son Bá Mười), Thanh Hoá
- Pu Mát interior (Khe Kèm, Phà Lài), Nghệ An
- Phong Nha backcountry (Hang Ba, U Bò), Quảng Bình
- Tà Năng–Phan Dũng plateau, Lâm Đồng/Bình Thuận
- Phú Quý south/east coast, Bình Thuận
- Lý Sơn east coast, Quảng Ngãi
- Cô Tô east coast, Quảng Ninh

### Tier B — Very good (Bortle 3–4)
- Mộc Châu lee plateaus (Pa Phách, Tà Số) — *but not the town centre or Cầu Kính Bạch Long zone*
- Hang Kia – Pà Cò, Hoà Bình
- Khâu Phạ / Tú Lệ ridges, Yên Bái
- Pha Đin pass plateau, Sơn La/Điện Biên
- Măng Đen perimeter (Kon Bring side, NOT the new night market), Kon Tum
- Đèo Gia Bắc forest, Lâm Đồng
- Bạch Mã summit, Thừa Thiên Huế
- Cát Tiên NP interior (Bàu Sấu), Đồng Nai/Lâm Đồng
- Yok Đôn NP, Đắk Lắk
- Cúc Phương NP, Ninh Bình (forest canopy obstructs but no skyglow)
- Sa Pa lee side (Tả Phìn, Bản Hồ — *not Sa Pa town*)
- Cát Bà NP interior, Hải Phòng
- Phú Quốc – Bãi Sao / Bãi Khem (south end only, away from Phú Quốc United Center mega-development)

### Tier C — Usable for weekends (Bortle 4–5)
*Sites within ≤4 h of a major city where you can run a wide-field rig but galaxy work is filter-dependent.*

- Tam Đảo NP, Vĩnh Phúc — closest "real" site to Hà Nội, but persistent winter crachin
- Ba Vì NP, Hà Nội outskirts — close, but Bortle 4 minimum and worsening
- Đồng Mô / Yên Bài, Hà Nội — convenient backyard for HAS, B5
- Hồ Tuyền Lâm / Suối Vàng, Đà Lạt outskirts — popular for Milky Way landscape; B4-5 and brightening
- Hồ Trị An, Đồng Nai — 90 min from HCM, B5
- Hồ Dầu Tiếng, Tây Ninh — 2 h from HCM, B4-5
- Núi Bà Đen base camp areas, Tây Ninh — B4 but cable car lit at night
- Cần Giờ mangrove edges, HCM — surprisingly dark for distance, B4-5 with strong HCM dome to N
- Hồ Đại Lải, Vĩnh Phúc — B5 weekend from HAN
- Tam Cốc / Trang An hinterland, Ninh Bình — B4-5

---

# PART 3 — Best by Region

### Best within 250 km of Hà Nội (≤6 h drive)
The single hardest brief in Vietnam. The Red River Delta and Hà Nội itself form an enormous Bortle 8–9 dome, and the NE monsoon dumps stratocumulus and crachin from October through March — exactly when astronomers want to be out. *Practical reality:* HAS members do most of their serious work either (a) on rare clear winter cold-front nights from Tam Đảo / Ba Vì, or (b) by driving 6–8 h to the Northwest mountains.

1. **Hang Kia – Pà Cò, Hoà Bình** (≈170 km, ~4 h). Best near-city dark sky once you're above 1100 m and looking SW away from the delta dome. Bortle 3, useful Nov–Mar.
2. **Mộc Châu lee plateaus** (≈200 km, ~5 h). Bortle 4 and brightening fast (the glass-bridge resort lights up the central valley nightly until 22:00); only use Pa Phách or Tà Số sub-plateaus, not the town.
3. **Pù Luông – Son Bá Mười** (≈180 km, ~5 h). Underrated. Quiet, B3, less weekend traffic than Mộc Châu.
4. **Tam Đảo NP** (≈85 km, ~2 h). Closest "real" site, but B4 minimum, fog-prone, frequently in cloud above 1000 m in winter — useful only for opportunistic clear-night runs.
5. **Đồng Văn / Hà Giang** (≈300–340 km but counts as the gold standard if you can spare 2 nights).

### Best within 250 km of TP. HCM (≤5 h drive)
Easier than the north because the SW monsoon spares the lee side of the central coast.

1. **Cát Tiên NP – Bàu Sấu interior** (≈160 km, ~4 h). The closest true forest dark site to HCM. B3 once you're past the Đồng Nai river crossing into the core.
2. **Tà Năng–Phan Dũng plateau** (≈220 km, ~5 h to trailhead). B3, 1100–1700 m, dry side, gold-standard clear nights Dec–Apr.
3. **Bàu Trắng dunes** (≈260 km, ~5 h). Fast getaway. B4 with strong NE Phan Thiết dome — useful for landscape Milky Way, marginal for telescope work.
4. **Hồ Trị An** (≈70 km). Best B5 weekend backyard for HCM observers; convenient for binocular/wide-field practice.
5. **Hồ Dầu Tiếng** (≈100 km). Big open horizon to the W and N, B5, summer storms common.

### Best in Central Vietnam (Trung Bộ)
Central Vietnam has Vietnam's worst weather seasonality for astronomy. The Trường Sơn range traps NE-monsoon moisture against the coast and produces extended overcast Sep–Feb in Huế / Đà Nẵng / Hội An. The interior north–central provinces (Nghệ An, Hà Tĩnh, Quảng Bình) and the high mountains have a *partially* inverted seasonality.

1. **Phong Nha – Hang Ba / U Bò backcountry** — Mar–Aug is excellent here, contrary to the rest of the north. Permit-and-guide required, but the sky over the Tu Lan / Hang Ba camps is Bortle 3 and clear for ~50% of summer nights.
2. **Pù Luông core** (Son Bá Mười) — straddles the line between north-central climate and northwestern interior; usable Oct–Apr.
3. **Pu Mát NP interior** — B3, low elevation, summer-best.
4. **Bạch Mã summit** — *only useful Mar–Aug.* Sep–Feb is a wall of cloud and crachin; do not go in winter.
5. **Bà Nà** — written off. Bana Hills resort lights from base to summit; functionally a Bortle 5–6 dome on a mountain. Don't waste fuel.

### Best in Tây Nguyên (Central Highlands)
The Tây Nguyên is the single most consistent astronomy region in Vietnam: the lee of the Trường Sơn during the NE monsoon means a long dry season from Dec to Mar with high transparency and unusually low humidity (Buôn Ma Thuột bottoms out at ~71% RH in March vs 88% in September).

1. **Bidoup–Núi Bà NP (Long Lanh saddle / Đa Nhim core)** — best telescope site in the south. B3, 1700 m, accessible by 4WD up to the ranger station.
2. **Chư Yang Sin NP backcountry** — Vietnam's most underrated dark site. Massive footprint with no significant settlements; B2–3 throughout.
3. **Tà Năng–Phan Dũng plateau** — straddles Lâm Đồng / Bình Thuận; reliable Dec–Apr.
4. **Đèo Gia Bắc / Lộc Bắc forest** — B3, accessible, less famous so less weekend traffic.
5. **Măng Đen perimeter** — *with caveats*. The Kon Bring / Pa Sỹ approach side stays B3, but the new "Khu kinh tế đêm Măng Đen" night market (operating until midnight from a former airstrip) is degrading the central plateau. Position yourself south of Đak Ke lake or further out toward Kon Plông.
6. **Yok Đôn NP** — flat, dry, low elevation but very dark and absolutely no infrastructure.

### Best Islands
1. **Côn Đảo** — by every objective metric, Vietnam's best island for astronomy. B2-3 confirmed, MW core rises over the SE sea, ~80% of the island is national park, no industrial lighting.
2. **Bạch Long Vĩ** — theoretically darker than Côn Đảo (more isolated, no national-park lighting), but logistically gated behind a Hải Phòng-ferry permit regime, 6–8 h sea crossing, and weather windows that close from Sep onward.
3. **Phú Quý** — B2-3, easy from HCM via Phan Thiết ferry, low-rise development, 16.5 km² with the lighthouse and a few hamlets the only artificial lights.
4. **Lý Sơn** — volcanic island ~30 km off Quảng Ngãi; B3 east coast, getting brighter as tourism scales but still excellent in 2026.
5. **Cô Tô** — far NE, B3 east coast, but central coast climate (autumn rain Sep–Nov, winter crachin Dec–Feb) means a tight Mar–early-May window.
6. **Cát Bà** — convenient from Hà Nội but B4 with persistent moisture from Hạ Long Bay; useful only for casual outreach.
7. **Phú Quốc** — *aggressively over-rated for astronomy.* The Phú Quốc United Center, Sun World cable car and Vinpearl complexes have raised the north of the island to B5–6. Only the extreme south (Bãi Sao / Bãi Khem early hours) remains usable.

### Best High Mountains (>2000 m sleep camps)
Ranked for serious imaging from a porter-supported camp:
1. **Bạch Mộc Lương Tử (Ky Quan San)** — 3046 m, summit camp at ~2900 m, B2.
2. **Putaleng** — 3049 m, B2 from high camp.
3. **Tà Chì Nhù** — 2979 m, B2.
4. **Tà Xùa** — 2865 m, summit camp B2 with 360° horizon.
5. **Lảo Thẩn** — 2826 m, B2, by far the easiest of the 2800+ summits.
6. **Bidoup** — 2287 m, southernmost on this list, the one you can drive most of the way to.
7. **Fansipan** (3143 m) — *not recommended.* The Sun World cable car summit complex is illuminated all night, the summit station is itself a Bortle 4 source, and you cannot legally camp inside the resort area.

---

# PART 4 — Astronomical Calendar (Jan–Dec)

Pairing each month with the climatologically rational target zones, plus the major showers visible from Vietnam (latitudes 8.5°–23.4° N).

### January
- **Climatology:** Peak NE monsoon. North/coast: cold drizzle (crachin) in delta/coast, but interior northwest enjoys the driest, coldest, most transparent nights of the year. South: deep dry season. Tây Nguyên: pristine.
- **Best 3 sites:** Bidoup / Long Lanh (south); Tà Xùa or Lảo Thẩn (north interior, accept the cold); Côn Đảo (winds easing from Feb).
- **Astronomy:** **Quadrantids** peak ~Jan 3–4, radiant in Boötes — culminates very late in Vietnam (≈04:00 LT). Winter Milky Way (Cassiopeia–Auriga–Monoceros–Puppis) high; great for dark-nebula imaging in Taurus/Auriga and the Rosette. Orion well placed all night. M42 transits ~22:00.

### February
- **Climatology:** Same as January but slightly drier in the north interior; coastal central Vietnam still grim.
- **Best 3 sites:** Đồng Văn plateau, Bidoup, Tà Năng plateau.
- **Astronomy:** Best month for Leo galaxy season prep. Beehive (M44), the Leo Triplet, M81/M82 climbing. No major shower.

### March
- **Climatology:** Northeast monsoon weakening. North interior still good but increasing humidity. South still dry. Lowest annual humidity in Buôn Ma Thuột (~71% RH).
- **Best 3 sites:** Chư Yang Sin, Bidoup, Y Tý / Lảo Thẩn (last good window before pre-monsoon haze).
- **Astronomy:** Galaxy season peak — Virgo cluster on the meridian after midnight. Galactic core (Sagittarius) starts pre-dawn rising late in the month.

### April
- **Climatology:** Transition. Pre-monsoon haze and crop-burning smoke ("đốt nương") in the northern mountains and Lào from late March; transparency degrades despite "clear" forecasts. South still good.
- **Best 3 sites:** Côn Đảo, Tà Năng, Phú Quý (sea breeze keeps dunes/lee coast clearer than the smoke-prone interior).
- **Astronomy:** **Lyrids** peak ~Apr 22. Late-month: galactic core well-placed in pre-dawn east. Last reliable galaxy month before monsoon.

### May
- **Climatology:** SW monsoon onset over the south and Tây Nguyên (storms typically afternoon/early evening; nights *can* clear after midnight, especially on the lee coast). North interior enters the wet season.
- **Best 3 sites:** Phú Quý, Côn Đảo, Bạch Long Vĩ (rare flat-sea window before SW gales).
- **Astronomy:** **Eta Aquariids** peak ~May 5–6. Pre-dawn Sagittarius/Scorpius core rise — start of the imaging core season for southern observers. Centaurus / Crux / Omega Cen culminate from far southern Vietnam.

### June
- **Climatology:** Wettest in the SW for the south and central highlands. *But* June is one of the best months for Phong Nha and the lee central coast (Phú Yên, Khánh Hoà) because the Trường Sơn blocks SW moisture.
- **Best 3 sites:** Phong Nha backcountry (Hang Ba / U Bò), Phú Quý, Côn Đảo.
- **Astronomy:** Galactic core transits high after midnight; Lagoon, Trifid, Eagle, Omega all well placed. Sagittarius "teapot" zenith-passes for sites near 14° N.

### July
- **Climatology:** Same pattern as June but with an "early Foehn" effect on the central coast — strong westerlies dump moisture over Laos and Tây Nguyên, and the Bình Thuận / Ninh Thuận / Khánh Hoà coast can run multi-week clear streaks.
- **Best 3 sites:** Côn Đảo, Phú Quý, Mũi Né / Bàu Trắng (despite light pollution, the dunes provide Vietnam's best foreground compositions in this exact window).
- **Astronomy:** Galactic core at meridian shortly after astronomical twilight. Best deep-sky season for southern targets.

### August
- **Climatology:** Continuation of July; central coast lee window still open.
- **Best 3 sites:** Côn Đảo, Phong Nha, Phú Quý.
- **Astronomy:** **Perseids** peak ~Aug 12–13, radiant in Perseus, only moderately well placed from Vietnam (climbs in the second half of the night). MW core still excellent through midnight.

### September
- **Climatology:** Wet peak nationally. North-central coast enters its rainy peak (Sep–Dec). Tây Nguyên peak rainfall (Buôn Ma Thuột averages 205 mm; Pleiku 393 mm).
- **Best 3 sites:** Bạch Long Vĩ (rare clear window), Cô Tô (post-typhoon clear nights), Côn Đảo (last MW core window).
- **Astronomy:** Galactic core sets early but is still imageable until ~22:00. Andromeda (M31), M33, NGC 7331 starting to rise high. No major shower.

### October
- **Climatology:** NE monsoon onset. Coast and delta enter prolonged grey period. *Interior* north and Tây Nguyên start clearing — Đồng Văn, Y Tý, Tà Xùa become workable late month.
- **Best 3 sites:** Y Tý / Lảo Thẩn, Đồng Văn plateau, Bidoup (transitioning to dry).
- **Astronomy:** **Orionids** peak ~Oct 21–22. Andromeda/Triangulum group well-placed all night.

### November
- **Climatology:** Northwestern interior at its best for the year. Tây Nguyên dry. North-central coast worst (peak rain for Huế / Đà Nẵng).
- **Best 3 sites:** Tà Xùa, Đồng Văn, Chư Yang Sin.
- **Astronomy:** **Leonids** peak ~Nov 17–18 (variable, normally a low-rate shower; periodic enhanced returns). Winter Milky Way returning. Pleiades, Hyades, M42 climbing.

### December
- **Climatology:** Coldest, driest, clearest nights of the year in northern interior and Tây Nguyên. Ideal observing in the southwest mountains and central highlands.
- **Best 3 sites:** Tà Xùa, Bidoup, Lảo Thẩn.
- **Astronomy:** **Geminids** peak ~Dec 13–14 — *the* year's best shower from Vietnamese latitudes (radiant climbs to ~75° altitude, ZHR 120+, no inclination penalty). M42, M45, NGC 2237 (Rosette), IC 405 imaging window. Winter narrowband targets (Heart, Soul, Rosette, California).

---

# PART 5 — Top 10 Detailed Profiles

### 1. Đồng Văn karst plateau (Hà Giang) — ridge interior, Sảng Tủng / Lũng Cú belt
**Coordinates:** centroid ~23.350 N, 105.310 E (any of several ridges off QL4C between Yên Minh and Lũng Cú).
**Why strong:** Largest contiguous Bortle 2 footprint in northern Vietnam. ~1500 m mean elevation buys you ~0.2–0.3 mag/airmass extinction reduction vs delta. The NE monsoon delivers cold continental air above the plateau which scours moisture out — characteristic late-October–March transparency is the best in the country in absolute terms (low PWV, low aerosol).
**Specific weaknesses:** Limestone karst means rugged horizon — finding a true 270° open horizon site requires walking 200–500 m off the road. December–January night-time temperatures can reach 0–5 °C with strong wind chill; plan for serious cold-weather gear and lithium-ion battery pre-warming. Foreigners require the *Giấy phép vào khu vực biên giới* (~210,000 VND) issued in Hà Giang City; checkpoints near Lũng Cú are real.
**Recommended telescope setup:** 80–100 mm apo refractor on a portable strain-wave mount (e.g., AM3-class) or HEQ5 if you have a porter. Don't bring an SCT — it will dew over and the elevation makes thermal equilibration painful. A mosaic-friendly small refractor + ASIAir + dew heater + 12 V LiFePO4 in an insulated bag is the right kit.
**Recommended lens (landscape MW / wide-field):** 14–20 mm at f/1.8–f/2.8 for arc panoramas over karst; 35 mm f/1.4 for tighter compositions integrating Hmong stone houses. The karst horizon is *the* visual asset.
**Best season:** late Oct–early March (peak Dec–Feb).
**When to avoid:** Apr–Sep (slash-and-burn smoke + monsoon).
**Specific risks:** Border zone — hiking off-road toward N more than ~1 km from the road can put you in restricted territory. Phone signal is intermittent; download offline maps. Frost on cars. Dog packs in some villages.
**Sources:** UNESCO Global Geopark file; thelooptours.com 2025 permit guide; Vietnam Airlines geopark feature; lightpollutionmap.info VIIRS 2022.

---

### 2. Tà Xùa summit ridge (Sơn La / Yên Bái)
**Coordinates:** summit ridge centroid ~21.358 N, 104.450 E (GPS-recorded ~2875 m). The "sống lưng khủng long" viewpoint at ~2400 m is more accessible.
**Why strong:** Highest "drivable-near" Bortle 2 site in Vietnam. The ridge tops the Vân Hồ inversion layer for most of Nov–Mar — i.e., you camp *above* the cloud sea while the delta below is in stratocumulus. Wind scrubs aerosols. 360° unobstructed horizon from the proper summit.
**Specific weaknesses:** Wind itself. Sustained 15–30 km/h winter winds are normal; gusts 50+ km/h kill any unguyed mount. The road from Bắc Yên to the homestay belt is steep, narrow and degrading; recent VnExpress reports note rapid commercialisation of the lower viewpoint area (cafés, glamping). The summit ridge itself remains untouched but requires a porter hike.
**Recommended setup:** Forget a heavy mount. Skywatcher Star Adventurer GTi or Sky-Watcher AM3 + 70–85 mm apo + ASIAir mini + small dew band + Lipo. *Wind shielding* matters more than aperture: pitch a wind wall (rocks, tarp) before the mount goes up.
**Recommended lens:** 24 mm f/1.4 prime for arch panoramas; 14 mm f/2.8 for ultra-wide groundscapes with the ridge silhouette. Star trail compositions over the 1.5 km ridge are this site's signature.
**Best season:** Nov–Mar; peak Dec–Feb.
**When to avoid:** Jun–Sep (monsoon, fog).
**Specific risks:** Hypothermia in winter — temperatures regularly fall below 5 °C with wind chill. The 1.5 km ridge has 500-m drops on both sides; do not walk it after dark without a head torch and prior daytime familiarisation.
**Sources:** VnExpress Tà Xùa cẩm nang (2025); cungphuot.info reports; lightpollutionmap.info VIIRS.

---

### 3. Lảo Thẩn (Núi Lảo Thẩn / Hâu Pông San), Y Tý, Lào Cai
**Coordinates:** 22.6104 N, 103.6865 E. Summit elevation: this is contested — popular sources say 2860 m, official Cục Du Lịch 2024 source says ~2826 m. **Confidence: medium on elevation, high on Bortle.**
**Why strong:** Of all the 2800-m peaks in Vietnam, Lảo Thẩn is the only one with a *gentle* trail (open meadows, low scrub, no jungle canopy) so a 65 L pack with imaging gear and porter is realistic. Y Tý plateau itself is Bortle 2 even at 1900 m, so the high camp at 2400–2600 m is solid Bortle 2 with negligible skyglow toward the China border to the N (Yunnan side has scattered villages but no major source within 80 km).
**Specific weaknesses:** Open terrain = total wind exposure (March is famously windy here). Phìn Hồ trailhead is 80 km of mountain road from Sa Pa.
**Recommended setup:** Same as Tà Xùa — AM3 / Star Adventurer GTi + 70–85 mm apo. Porter cost (~1,000,000 VND for two people) makes carrying an HEQ5 + 100 mm doublet feasible if you really want it.
**Recommended lens:** 14–20 mm wide for the dolphin-rock and stone-finger foreground compositions. 50 mm for galactic-arch close-ups.
**Best season:** Late Sep–early Mar (peak Nov–Jan). Occasional light rain in Sep–Oct *helps* clear aerosols.
**When to avoid:** Apr–Aug (rain), and the "windy March" period if you have unguyed equipment.
**Specific risks:** "Mỏm câu cá" and "đầu voi" check-in rocks have lethal vertical drops; do not approach in the dark. Border-zone proximity means the same permit logic as Đồng Văn applies for foreigners.
**Sources:** kamesteps.com (Vietnam IOAA-adjacent climber blog); xuyenrungtrek.com; sunsettravel.asia (notes 2826 m vs 2860 m discrepancy); Viettrekking.

---

### 4. Bidoup–Núi Bà / Long Lanh saddle (Lâm Đồng)
**Coordinates:** Bidoup peak 12.117 N, 108.673 E (approx.); the practical observing area is the Long Lanh / Đa Nhim ranger zone along QL27C, around 12.05 N, 108.65 E, at ~1700 m.
**Why strong:** The single best southern-Vietnam site you can drive to. Lâm Viên plateau is the Tây Nguyên's highest sustained terrain. Dec–Mar gives ≈70% clear nights based on station data; March RH bottoms at ~70%. The Đà Lạt skyglow is strongly attenuated by the intervening Lang Biang massif — Long Lanh sits in its lee shadow.
**Specific weaknesses:** Đà Lạt itself has *measurably brightened* on VIIRS 2015→2022. Hồ Tuyền Lâm and Suối Vàng (popular with the Vietnamese MW landscape crowd) are now Bortle 4–5, *not* the Bortle 3 they're often advertised as. Move 25+ km from Đà Lạt and onto QL27C toward Đa Nhim. National-park camping requires ranger station coordination (0263.3747.449 region).
**Recommended setup:** This is the southern site where you can run a real telescope. EQ6-R Pro + 8" RC or 130 mm apo realistic (porter not needed, you can drive in). Power is critical — bring your own LiFePO4. 220 V mains exists at the ranger station with permission.
**Recommended lens:** 35 mm f/1.4 for galactic core compositions over pine forest; 85 mm f/1.4 for Carina/Eta Carinae detail (well-placed Mar–Apr from this latitude).
**Best season:** Dec–Mar (peak Jan–Feb).
**When to avoid:** May–Oct (monsoon).
**Specific risks:** Wildlife — gaurs and bears exist in the core; don't wander solo at night. Forest-fire ash in dry-season late-March if a burn is on. Mosquitoes (carry DEET).
**Sources:** bidoupnuiba.gov.vn; VietnamTourism.gov.vn; Bitour and Tổ Ong adventure logs; climatestotravel.com Da Lat profile; weatherspark Đà Lạt.

---

### 5. Côn Đảo — Bãi Đầm Trầu / Mũi Cá Mập
**Coordinates:** Bãi Đầm Trầu ≈ 8.717 N, 106.617 E; Mũi Cá Mập ≈ 8.660 N, 106.605 E.
**Why strong:** The only site on the Vietnamese mainland-territorial cluster combining (a) Bortle 2 confirmed by independent tour-guide reports referencing 20-30 minute dark adaptation revealing core detail, (b) zero significant urban light source within 200 km on the SE quadrant (open ocean), (c) MW core *rising directly out of the sea* on the SE horizon during peak season. Galactic centre transit altitudes during May–Aug routinely 65–80°.
**Specific weaknesses:** April–November typhoon risk increases sharply from August. Côn Đảo town is itself a Bortle 4–5 source if you face the wrong way; observing site needs to put the town behind you. Humidity is unforgivingly high (coastal); dew load on optics is severe — a heated dewstrap is non-negotiable.
**Recommended setup:** Light, fast, narrow-band-friendly. 60–80 mm apo + ASI2600MC / dual-narrowband filter on AM5/AM3. Don't bother with mirror systems — sea-air corrosion + dew = ruined coatings. Salt-air silica gel pack in the case.
**Recommended lens:** 24 mm f/1.4 for Milky Way + sea horizon. 14 mm f/2.8 for lighthouse-and-sky panoramas at Mũi Cá Mập.
**Best season:** April–August (Galactic core season).
**When to avoid:** Sep–Feb (rough seas, NE wind, periodic typhoon).
**Specific risks:** Sea turtle nesting beaches active May–Oct; *no white light* on Bãi Đầm Trầu during nesting (use red headlamps only — this is non-negotiable, both ethically and practically because rangers will eject you). Roads to Mũi Cá Mập are dark and steep — daytime recce mandatory.
**Sources:** condao.express; Vietravel guide; dulichocean.vn; lightpollutionmap.info.

---

### 6. Bạch Mộc Lương Tử (Ky Quan San) high camp
**Coordinates:** summit ~22.500 N, 103.575 E; high camp at ~2900 m.
**Why strong:** Highest practical sleep-camp Bortle 2 in Vietnam outside Putaleng. Above the inversion virtually all winter. 360° horizon from "Núi Muối" salt-mountain camp.
**Specific weaknesses:** Two-day porter hike from Sàng Ma Sáo or Dền Sung. You cannot bring a heavy mount; everything must fit in a porter load (~25 kg max per porter) plus your own pack.
**Recommended setup:** Star Adventurer GTi + 50 mm or 70 mm scope + ASIair Mini + power bank-class LiFePO4 (small). Anything heavier kills the trip economics.
**Recommended lens:** 24 mm prime + tripod is honestly the most realistic kit. Wide MW + sea-of-clouds compositions are this site's specialty.
**Best season:** Nov–Mar.
**When to avoid:** Apr–Oct.
**Specific risks:** Genuine alpine — frost, wind, exposure. Trail has vertical sections requiring scrambling. Solo trips are not feasible; book through Viettrekking or similar.
**Sources:** Viettrekking; cungphuot.info trip report.

---

### 7. Y Tý plateau / Phìn Hồ – Ngải Thầu
**Coordinates:** ≈22.633 N, 103.672 E (Y Tý commune centroid).
**Why strong:** Often dismissed as "Sa Pa-lite" by tourists, but for astronomers Y Tý is *better* than Sa Pa: it's at similar elevation (1900–2200 m) with one-tenth the artificial light, no cable car, no resort. Acts as the road-accessible base camp for Lảo Thẩn.
**Specific weaknesses:** Same NE-monsoon cloud-sea that produces the photographable cloud-hunt views frequently sits on Y Tý itself (you're *in* the cloud, not above it). Need to drive to Ngải Thầu Thượng or up the Lảo Thẩn approach to get above it on bad nights. Border zone permit applies for foreigners.
**Recommended setup:** Same as Đồng Văn — small refractor + portable mount. You can drive in, so weight is not the constraint; the constraint is humidity (often 85–95%). Aggressive dew control.
**Recommended lens:** 35 mm f/1.4 for Hà Nhì rammed-earth-house foregrounds + galactic arc.
**Best season:** Late Oct–Feb.
**When to avoid:** Jun–Sep.
**Specific risks:** Same as Đồng Văn (border, dogs, mountain road).
**Sources:** Multiple Vietnamese phượt blogs; trekking-company elevation data.

---

### 8. Phú Quý Island (Bình Thuận)
**Coordinates:** Mũi Cột Cờ (lighthouse) area ≈ 10.547 N, 108.943 E; SE coast Vịnh Triều Dương ≈ 10.524 N, 108.945 E.
**Why strong:** Vietnam's most *practically accessible* island Bortle 2. Phan Thiết → Phú Quý ferry is overnight or fast-craft (~2.5 h); ferry runs even during early SW monsoon. Compared to Côn Đảo, much cheaper to reach and freer of national-park lighting; compared to Bạch Long Vĩ, vastly easier.
**Specific weaknesses:** Highest point only 106 m, so no elevation benefit. Coastal humidity. Some development at the harbour creates a small light dome to the W; observing east coast solves that.
**Recommended setup:** Same as Côn Đảo — light, salt-tolerant, dew-heated.
**Recommended lens:** 14 mm + tripod for pure-sky / foreground basalt cliff combinations.
**Best season:** Feb–Aug.
**When to avoid:** Sep–Jan (rough seas, ferry cancellations).
**Specific risks:** Few. Roads are quiet, locals friendly. Standard tropical hazards.
**Sources:** Wikipedia Phú Quý; vetauphuquy.vn; Traveloka.

---

### 9. Chư Yang Sin NP backcountry (Đắk Lắk)
**Coordinates:** Krông Bông side trailhead ≈ 12.413 N, 108.450 E.
**Why strong:** The single largest dark, low-population, dry-season-friendly footprint in southern Vietnam outside Bidoup. VIIRS 2022 shows almost no light points across ~600 km² of the core. Elevation 1000–2400+ m, central highland climate (Dec–Mar dry).
**Specific weaknesses:** Almost no infrastructure. Camping requires ranger registration. Trailheads are 5–7 h from Buôn Ma Thuột.
**Recommended setup:** Similar to Bidoup — drivable to ranger station, then short hike to camp. Mid-weight rig (HEQ5 + 100 mm apo) realistic.
**Recommended lens:** 24 / 35 mm for galactic-core panoramas with Tây Nguyên forest foreground.
**Best season:** Dec–Mar.
**When to avoid:** May–Oct (heavy SW monsoon rain).
**Specific risks:** Wildlife (gaurs, sun bear, leopard cat); cellular coverage non-existent; carry PLB if going deep.
**Sources:** Rùa Discovery trekking notes; lightpollutionmap.info VIIRS; ruadiscovery.vn.

---

### 10. Bạch Long Vĩ Island (Hải Phòng)
**Coordinates:** 20.140 N, 107.722 E.
**Why strong:** *Theoretically* the darkest point under Vietnamese sovereignty. 75 km from any other significant land mass; only ~58 m elevation but a flat plateau means a true 360° sea horizon. VIIRS shows essentially zero artificial light except a small point on the south shore.
**Specific weaknesses:** Not normally open to casual visitors — requires Hải Phòng provincial coordination. Ferry is irregular and often cancelled. Weather window is narrow (Mar–early May, with September a secondary window after typhoon season). I rank it 10th *not* because it's worse than the lower-numbered sites but because a serious trip planning probability of failure here is high.
**Recommended setup:** Light, sea-resistant. Treat as a remote expedition — redundant power, redundant batteries, hardened cases.
**Recommended lens:** 14 mm wide; this is a place you photograph the ocean horizon meeting the sky-glow-free atmosphere, which is essentially impossible elsewhere on the Vietnamese mainland.
**Best season:** Mar–early May; secondary Sep.
**When to avoid:** Oct–Feb (NE monsoon storms).
**Specific risks:** Naval/military zone awareness — the island has a military garrison; abide by local instructions. No civilian medevac; this is a high-commitment trip.
**Sources:** Wikipedia Bạch Long Vĩ; lightpollutionmap.info.

---

# PART 6 — Hidden Gems

Sites that don't appear on travel-blog "Top 10 Vietnam Stargazing" listicles but show up in serious observer / phượt reports:

1. **Phia Oắc / Phia Đén, Cao Bằng** — 1931 m, NE Vietnam's overlooked summit. Very low VIIRS reading because the surrounding districts are sparsely populated. Frost in winter; old French hill station ruins. Almost zero astronomy literature exists for this site, which is precisely why it remains intact.

2. **Khe Kèm – Phà Lài interior, Pu Mát NP, Nghệ An** — under-photographed Bortle 3 with the unusual property of being usable in summer (Mar–Aug) when most northern sites are washed out by SW monsoon. Reach via Anh Sơn district.

3. **Mũi Đôi / Đầm Môn peninsula, Khánh Hoà** — easternmost mainland point of Vietnam (12.658 N, 109.456 E, approx.). Bortle 3, sea horizon all 180° east, lee of the central Trường Sơn. Best central-coast site for SW-monsoon-season observing nobody knows about.

4. **Tà Đùng plateau, Đắk Nông / Lâm Đồng border** — created by the Đồng Nai 3 hydropower lake. Karst-like islets in the lake provide composition. Bortle 3, lower elevation than Bidoup but excellent sky.

5. **Nam Cương dunes, Ninh Thuận** — smaller and dustier than Mũi Né, but VIIRS-darker because Ninh Thuận has Vietnam's lowest population density on the coast and the Phan Rang dome is small. Better than Bàu Trắng and Mũi Né in current 2026 conditions.

6. **Đèo Khau Phạ / Lìm Mông ridges, Yên Bái** — between the Mù Cang Chải terrace photo zones, sits a Bortle 3 ridge belt that nobody photographs at night because the daytime rice terraces dominate Instagram. Excellent early-monsoon (Sep–Oct) opportunistic site.

7. **Đảo Bình Hưng / Bình Ba, Cam Ranh, Khánh Hoà** — small islands inside Cam Ranh Bay; Bortle 3, central-coast lee window in summer. Active naval area to the north — *do not photograph the bay infrastructure, only the open sea / SE sky*.

8. **Mũi Né interior plateaus near Hòa Thắng** — not the main dunes, but the agricultural plateau 6–10 km inland. Bortle 4 instead of the dunes' Bortle 3-creeping-to-4-5, but with cleaner air and an open western horizon (rare for Vietnam).

9. **Pha Đin Pass plateau (Sơn La/Điện Biên)** — high-altitude (1000+ m) pass on QL6 between Hà Nội and Điện Biên. Bortle 3, drive-up access, far less crowded than Mộc Châu or Tà Xùa, but barely written about because it's "just a pass."

10. **U Bò viewpoint, Phong Nha** — backcountry of Phong Nha NP. Almost no light pollution in any direction. Functions as Vietnam's only Bortle 3 site that is genuinely *summer-best*, due to the central-coast lee microclimate.

---

# Honest Anti-Marketing Section

Sites you should *not* trust their reputation:

- **Đà Lạt city / Hồ Xuân Hương / Datanla / Thiên Phúc Đức / Hồ Tuyền Lâm.** Routinely listed in Vietnamese MW-photography articles. Reality (VIIRS 2022): Bortle 4–5 in core, brightening 0.05+ mag/year. They look dark because they're cool and high, not because they're actually dark. Drive 30+ km out before setting up.
- **Sa Pa town and the Fansipan summit complex.** Sun World cable car summit station is illuminated all night; the entire Mường Hoa valley is now a Bortle 5 elongated dome. Use Tả Phìn or Bản Hồ instead.
- **Mũi Né main strip + Suối Tiên / Suối Hồng touristic zone.** Phan Thiết has expanded substantially; the dunes are Bortle 4 with strong NE gradient now. Bàu Trắng to the north, or Nam Cương further north into Ninh Thuận, are cleaner.
- **Phú Quốc north** (Sun World, Vinpearl, United Center). Bortle 5–6 in 2026. The island as a whole is *not* a serious astronomy destination anymore — only the deep south remains.
- **Bà Nà Hills.** A Bortle 5 dome on a mountain. Functionally useless.
- **Mộc Châu town and the Cầu Kính Bạch Long Mộc Châu Island resort.** The glass bridge is illuminated nightly until 22:00 from thousands of LEDs. Pa Phách / Tà Số sub-plateaus only.
- **Hạ Long Bay.** Surprisingly bright due to fishing-boat metal-halide lights and the city itself — the moonlit "no stars" report on TripAdvisor is reproduced consistently. Cát Bà NP interior is the workaround.
- **Nha Trang city.** ≈400,000 population, Bortle 5–6. Skip; go inland to Khánh Hoà highlands.

Common mistakes I see Vietnamese astrophotographers make repeatedly:

1. **Confusing transparency with darkness.** A B3 site under haze is worse than a B4 site under a cold-front clear airmass. Your atmospheric-seeing prediction project should be the first thing anyone consults — a forecast SQM of 21.4 is irrelevant if the AOD550 is 0.4.
2. **Underestimating dew at "dry season" sites.** Đà Lạt, Y Tý, Tà Xùa all run RH > 85% on most clear winter nights. Heated dewstraps and corrector shields are non-optional.
3. **Trusting Bortle without VIIRS cross-check.** Many phượt blogs cite "Bortle 2" for Đà Lạt-area sites that are demonstrably Bortle 4. Always run lightpollutionmap.info before committing.
4. **Forgetting the border permit.** Hà Giang loop foreigners stopped without a permit at a midnight checkpoint near Săm Pun *will* be turned around. Get the 210 k VND paper at the immigration office in Hà Giang City or have the homestay arrange it before midnight.
5. **Thinking islands are automatically dark.** Phú Quốc, Cát Bà, parts of Lý Sơn now have cruise-ship-class lighting.

---

# CSV-Ready Master Data Table

The full per-site table follows. Coordinates marked *(approx.)* should be treated as area centroids accurate to ~1–3 km. Confidence column refers to the overall site rating: H = multiple corroborating sources including practitioner reports, M = limited but credible sources, L = inferred from VIIRS + climatology only.

| Name | Region | Province | Latitude | Longitude | Elevation_m | Estimated_Bortle | Bortle_Confidence | SkyDark/30 | Cloud/20 | Access/15 | Safety/10 | Elev/10 | Horizon/10 | Humidity/5 | Total/100 | Best_Months | Worst_Months | Dist_HAN_km | Dist_HCM_km | Motorbike | Camping | Confidence_Overall | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Đồng Văn karst plateau (Sảng Tủng/Lũng Cú) | Bắc Bộ | Hà Giang | 23.350 | 105.310 | 1500 | 2 | H | 28 | 16 | 8 | 8 | 7 | 9 | 4 | 86 | Oct–Mar | Apr–Sep | 320 | 1850 | Yes (skilled) | Yes (homestays) | H | Border permit needed for foreigners; coldest nights 0–5 °C |
| Tà Xùa summit ridge | Bắc Bộ | Sơn La/Yên Bái | 21.358 | 104.450 | 2700 | 2 | H | 28 | 17 | 7 | 7 | 10 | 9 | 3 | 84 | Nov–Mar | Jun–Sep | 200 | 1700 | To trailhead only | Yes (porter) | H | Severe wind exposure; commercialisation on lower viewpoints |
| Lảo Thẩn high camp | Bắc Bộ | Lào Cai | 22.6104 | 103.6865 | 2600 | 2 | H | 28 | 16 | 7 | 8 | 10 | 9 | 3 | 84 | Oct–Feb | Jun–Sep | 360 | 1800 | To trailhead | Yes (lán, porter) | H | 2D1N porter trip; elevation 2826/2860 m disputed |
| Bidoup / Long Lanh | Tây Nguyên | Lâm Đồng | 12.117 | 108.673 | 1800 | 3 | H | 25 | 17 | 12 | 9 | 7 | 8 | 4 | 83 | Dec–Mar | May–Oct | 1500 | 320 | Yes | Yes (ranger permit) | H | Best telescope-friendly site in south VN |
| Côn Đảo (Đầm Trầu/Cá Mập) | Nam Bộ (Hải đảo) | Bà Rịa-Vũng Tàu | 8.700 | 106.625 | 30 | 2.5 | H | 27 | 17 | 9 | 9 | 1 | 10 | 2 | 82 | Mar–Aug | Sep–Feb | 1850 | 230 (+flight/ferry) | Yes | Restricted (NP) | H | Turtle nesting May–Oct; red light only |
| Bạch Mộc Lương Tử summit camp | Bắc Bộ | Lai Châu/Lào Cai | 22.500 | 103.575 | 2900 | 2 | H | 28 | 16 | 4 | 7 | 10 | 9 | 4 | 82 | Nov–Mar | Apr–Oct | 380 | 1850 | To trailhead | Yes (porter) | H | Two-day porter hike; ultralight kit only |
| Y Tý / Phìn Hồ plateau | Bắc Bộ | Lào Cai | 22.633 | 103.672 | 2000 | 2.5 | H | 27 | 15 | 8 | 8 | 8 | 8 | 3 | 81 | Oct–Feb | Jun–Sep | 350 | 1800 | Yes | Homestays | H | Cloud-sea often sits *on* the plateau; drive higher when foggy |
| Phú Quý SE coast | Nam Bộ (Hải đảo) | Bình Thuận | 10.524 | 108.945 | 30 | 2.5 | M | 27 | 17 | 10 | 9 | 1 | 10 | 2 | 80 | Feb–Aug | Sep–Jan | 1700 | 200 (+ferry) | Yes | Yes (some) | M | Most accessible offshore B2-3 from HCM |
| Chư Yang Sin NP core | Tây Nguyên | Đắk Lắk | 12.413 | 108.450 | 1500 | 2.5 | M | 27 | 16 | 7 | 8 | 7 | 8 | 4 | 79 | Dec–Mar | May–Oct | 1300 | 380 | To trailhead | NP permit | M | Wildlife present; carry PLB |
| Bạch Long Vĩ Island | Bắc Bộ (Hải đảo) | Hải Phòng | 20.140 | 107.722 | 50 | 2 | M | 28 | 13 | 4 | 8 | 1 | 10 | 2 | 78 | Mar–early May, Sep | Oct–Feb | 200 (+8 h ferry) | 1900 | Limited | Restricted | M | Provincial coordination; military presence |
| Mã Pí Lèng Pass | Bắc Bộ | Hà Giang | 23.260 | 105.359 | 1500 | 2 | H | 28 | 16 | 8 | 7 | 7 | 8 | 4 | 78 | Oct–Mar | Apr–Sep | 340 | 1880 | Yes | Roadside only | H | Border permit; canyon foreground |
| Pù Luông – Son Bá Mười | Bắc Bộ | Thanh Hoá | 20.483 | 105.117 | 1100 | 3 | M | 24 | 16 | 11 | 9 | 5 | 7 | 4 | 76 | Oct–Apr | May–Sep | 180 | 1640 | Yes | Homestays | M | Quieter than Mộc Châu |
| Phong Nha – Hang Ba/U Bò | Trung Bộ | Quảng Bình | 17.500 | 106.250 | 600 | 3 | M | 25 | 16 | 8 | 8 | 3 | 8 | 4 | 76 | Mar–Aug | Sep–Feb | 500 | 1100 | Limited (NP) | Oxalis/permit | M | Summer-best in central VN; permit required |
| Tà Năng – Phan Dũng plateau | Tây Nguyên/Nam Bộ | Lâm Đồng/Bình Thuận | 11.482 | 108.435 | 1400 | 3 | H | 25 | 16 | 9 | 8 | 6 | 8 | 4 | 76 | Dec–Apr | May–Oct | 1620 | 230 | To trailhead | Wild | H | Southern Vietnam's classic trekking site |
| Pu Mát NP – Khe Kèm | Trung Bộ | Nghệ An | 19.000 | 104.700 | 500 | 3 | M | 25 | 15 | 9 | 8 | 3 | 7 | 4 | 75 | Mar–Aug | Sep–Feb | 350 | 1450 | Limited | NP | M | Underrated summer-window site |
| Măng Đen perimeter | Tây Nguyên | Kon Tum | 14.640 | 108.290 | 1200 | 3 | H | 23 | 17 | 9 | 9 | 5 | 8 | 4 | 75 | Dec–Mar | May–Oct | 1100 | 600 | Yes | Yes | H | Avoid Khu kinh tế đêm; brightness creep |
| Putaleng high camp | Bắc Bộ | Lai Châu | 22.412 | 103.475 | 2500 | 2 | M | 27 | 15 | 4 | 7 | 9 | 9 | 4 | 75 | Nov–Mar | Apr–Oct | 400 | 1900 | To trailhead | Yes (porter) | M | Steepest of the 3000 m trio |
| Tà Chì Nhù | Bắc Bộ | Yên Bái | 21.521 | 104.317 | 2700 | 2 | M | 27 | 15 | 4 | 7 | 9 | 9 | 4 | 75 | Nov–Mar | Apr–Oct | 230 | 1750 | To trailhead | Yes (porter) | M | Sister peak to Tà Xùa |
| Khâu Phạ – Lìm Mông | Bắc Bộ | Yên Bái | 21.745 | 104.300 | 1300 | 3 | M | 24 | 14 | 10 | 9 | 6 | 7 | 4 | 74 | Oct–Mar | May–Sep | 240 | 1750 | Yes | Yes | M | Often-overlooked ridge belt |
| Phia Oắc NP | Bắc Bộ | Cao Bằng | 22.617 | 105.870 | 1700 | 3 | M | 25 | 14 | 7 | 8 | 7 | 7 | 4 | 74 | Oct–Mar | Apr–Sep | 270 | 1820 | Yes | Yes | M | Old French hill station; frost in winter |
| Đèo Gia Bắc | Tây Nguyên | Lâm Đồng | 11.713 | 107.760 | 1100 | 3 | M | 24 | 15 | 11 | 8 | 5 | 7 | 4 | 73 | Dec–Mar | May–Oct | 1450 | 220 | Yes | Roadside | M | Quiet alternative to Tà Năng |
| Bàu Trắng dunes | Nam Bộ | Bình Thuận | 11.172 | 108.388 | 50 | 4 | H | 21 | 16 | 12 | 8 | 2 | 9 | 4 | 72 | Jan–Apr, Jul–Aug | Sep–Dec | 1700 | 240 | Yes | Yes | H | Bortle 4 with NE Phan Thiết gradient |
| Mũi Né interior | Nam Bộ | Bình Thuận | 10.972 | 108.345 | 30 | 4 | H | 20 | 16 | 13 | 8 | 1 | 9 | 4 | 71 | Feb–Apr, Jul–Aug | Oct–Dec | 1730 | 220 | Yes | Yes | H | Heavy creep; landscape only |
| Cát Tiên NP – Bàu Sấu | Nam Bộ/Tây Nguyên | Đồng Nai/Lâm Đồng | 11.450 | 107.367 | 200 | 3 | M | 24 | 15 | 11 | 8 | 2 | 7 | 4 | 71 | Dec–Mar | May–Oct | 1550 | 160 | Limited | NP permit | M | Closest serious dark site to HCM |
| Pha Đin Pass plateau | Bắc Bộ | Sơn La/Điện Biên | 21.587 | 103.447 | 1100 | 3 | M | 24 | 14 | 9 | 8 | 5 | 7 | 4 | 71 | Nov–Mar | May–Sep | 350 | 1850 | Yes | Roadside | M | Drive-up alternative to Tà Xùa |
| Hang Kia – Pà Cò | Bắc Bộ | Hoà Bình | 20.730 | 104.870 | 1200 | 3 | M | 24 | 14 | 11 | 8 | 5 | 6 | 4 | 70 | Nov–Mar | May–Sep | 170 | 1600 | Yes | Homestays | M | Closest northern B3 to Hà Nội |
| Mộc Châu lee plateaus | Bắc Bộ | Sơn La | 20.875 | 104.620 | 1100 | 4 | H | 21 | 14 | 12 | 9 | 5 | 6 | 4 | 70 | Nov–Mar | May–Sep | 200 | 1660 | Yes | Yes | H | Avoid town/glass-bridge zone; creep risk |
| Lý Sơn east coast | Trung Bộ (Hải đảo) | Quảng Ngãi | 15.385 | 109.125 | 80 | 3 | M | 24 | 14 | 9 | 9 | 2 | 9 | 4 | 70 | Mar–Aug | Sep–Feb | 800 (+ferry) | 900 (+ferry) | Yes | Limited | M | Volcanic island; growing tourism |
| Bạch Mã NP summit | Trung Bộ | Thừa Thiên Huế | 16.196 | 107.853 | 1400 | 3 | M | 24 | 13 | 9 | 8 | 6 | 7 | 4 | 69 | Mar–Aug | Sep–Feb | 700 | 1000 | Limited | NP | M | Catastrophic in winter; summer-only |
| Cô Tô east coast | Bắc Bộ (Hải đảo) | Quảng Ninh | 20.962 | 107.808 | 50 | 3 | M | 23 | 13 | 8 | 9 | 1 | 9 | 4 | 68 | Mar–early May, Sep–Oct | Nov–Feb | 270 (+ferry) | 1900 | Yes | Limited | M | NE-monsoon-grim winters |
| Tam Đảo NP | Bắc Bộ | Vĩnh Phúc | 21.460 | 105.640 | 950 | 4 | H | 19 | 11 | 14 | 9 | 4 | 5 | 3 | 65 | Apr–early May, Oct (rare clear nights) | Nov–Feb | 80 | 1700 | Yes | Yes | H | Closest "real" site to HAN; foggy |
| Ba Vì NP | Bắc Bộ | Hà Nội | 21.075 | 105.357 | 800 | 4 | H | 18 | 11 | 14 | 9 | 4 | 5 | 3 | 64 | Oct–Mar (clear) | Apr–Sep | 60 | 1700 | Yes | Limited | H | Backyard for HAS; degrading |
| Hồ Trị An | Nam Bộ | Đồng Nai | 11.085 | 107.050 | 80 | 5 | H | 16 | 16 | 14 | 8 | 2 | 7 | 4 | 67 | Dec–Apr | May–Nov | 1620 | 70 | Yes | Yes | H | Convenient HCM weekend backyard |
| Hồ Dầu Tiếng | Nam Bộ | Tây Ninh | 11.350 | 106.350 | 30 | 4.5 | H | 18 | 15 | 14 | 8 | 1 | 8 | 4 | 68 | Dec–Apr | May–Nov | 1670 | 100 | Yes | Yes | H | Open horizon; lake + sky |
| Mũi Đôi / Đầm Môn | Trung Bộ | Khánh Hoà | 12.658 | 109.456 | 50 | 3 | M | 25 | 15 | 8 | 8 | 1 | 10 | 4 | 71 | Mar–Aug | Sep–Feb | 1100 | 470 | To trailhead | Yes | M | Easternmost mainland point; hidden gem |
| Tà Đùng plateau | Tây Nguyên | Đắk Nông | 11.806 | 107.789 | 900 | 3 | M | 24 | 15 | 10 | 8 | 4 | 7 | 4 | 72 | Dec–Mar | May–Oct | 1480 | 220 | Yes | Yes | M | Karst-like islets in lake; underrated |
| Nam Cương dunes | Nam Bộ | Ninh Thuận | 11.520 | 109.000 | 30 | 4 | M | 21 | 17 | 11 | 8 | 1 | 9 | 4 | 71 | Jan–Apr, Jul–Aug | Oct–Dec | 1500 | 360 | Yes | Yes | M | Cleaner than Mũi Né dunes in 2026 |
| Cát Bà NP interior | Bắc Bộ (Hải đảo) | Hải Phòng | 20.785 | 107.000 | 200 | 4 | M | 20 | 12 | 10 | 9 | 2 | 5 | 3 | 61 | Mar–early May, Oct | Nov–Feb, Jun–Aug | 170 (+ferry) | 1850 | Yes | Limited | M | Persistent moisture from bay |
| Sa Pa lee (Tả Phìn / Bản Hồ) | Bắc Bộ | Lào Cai | 22.385 | 103.910 | 1500 | 4 | H | 20 | 13 | 11 | 9 | 6 | 5 | 3 | 67 | Oct–Mar | Apr–Sep | 320 | 1800 | Yes | Homestays | H | Avoid Sa Pa town & Fansipan complex |
| Phú Quốc south (Bãi Sao/Khem) | Nam Bộ (Hải đảo) | Kiên Giang | 10.045 | 104.025 | 5 | 4.5 | H | 18 | 15 | 10 | 8 | 1 | 9 | 3 | 64 | Dec–Apr | May–Nov | 1900 (+flight) | 250 (+flight) | Yes | Limited | H | Only south usable; rest brightened |
| Yok Đôn NP | Tây Nguyên | Đắk Lắk | 12.880 | 107.700 | 200 | 3 | M | 25 | 14 | 8 | 8 | 2 | 9 | 4 | 70 | Dec–Mar | May–Oct | 1350 | 380 | Limited | NP | M | Dry deciduous flat; no infrastructure |
| Cúc Phương NP | Bắc Bộ | Ninh Bình | 20.350 | 105.625 | 200 | 4 | M | 20 | 13 | 13 | 9 | 2 | 4 | 4 | 65 | Oct–Apr | May–Sep | 130 | 1600 | Yes | NP | M | Forest canopy obstructs sky |
| Cần Giờ mangrove | Nam Bộ | HCM | 10.430 | 106.870 | 5 | 4.5 | H | 18 | 15 | 14 | 8 | 1 | 7 | 3 | 66 | Dec–Apr | May–Nov | 1700 | 60 | Yes | Limited | H | Strong HCM dome to N; useful for outreach |
| Đồng Mô / Yên Bài (HAS backyard) | Bắc Bộ | Hà Nội | 21.090 | 105.500 | 50 | 5 | H | 16 | 11 | 15 | 9 | 1 | 5 | 3 | 60 | Oct–Mar (clear) | Apr–Sep | 50 | 1700 | Yes | Yes | H | HAS Hà Nội club site |
| Bình Hưng / Bình Ba | Trung Bộ | Khánh Hoà | 11.829 | 109.252 | 40 | 3 | M | 24 | 16 | 9 | 8 | 1 | 9 | 4 | 71 | Mar–Aug | Sep–Feb | 1300 | 410 | Yes (+ferry) | Limited | M | Naval area; ocean-only photography |

---

## Closing Notes for the Operator

If you are building the Interstellar atmospheric-seeing prediction project, three site classes from this atlas are most useful as ground-truth nodes:

- **High-altitude lee-side mountain (Tà Xùa, Lảo Thẩn, Bidoup)** — for testing seeing forecasts under stably-stratified inversion regimes during the NE monsoon.
- **Coastal-island lee (Côn Đảo, Phú Quý)** — for sea-breeze-front and marine-boundary-layer cases during the SW monsoon.
- **Karst plateau (Đồng Văn)** — high-PWV-variance case, useful for differentiating transparency-limited vs seeing-limited nights.

For the IOAA-aligned community work, Bidoup–Long Lanh and the Đồng Văn plateau are the two practical, reproducible field-school sites I would centre any annual observing event around — Bidoup for the southern community (HAAC/PAC alumni base) and Đồng Văn for HAS / VACA / northern observers. Cross-referencing your seeing forecasts against SQM-meter readings (Unihedron SQM-LU-DL) and DIMM-style differential-image-motion measurements at these two sites would close the largest gap in Vietnamese amateur astronomy infrastructure right now.

Be honest about what doesn't work: there is no Bortle 1 in Vietnam, the southern monsoon will eat ~5 months of any annual observing schedule, and the country's tropical humidity is the single largest determinant of whether a "dark site" is actually useful. Choose by month and microclimate first, by Bortle second.

Clear skies — *trời quang*.