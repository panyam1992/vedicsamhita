/* ═══════════════════════════════════════════════════════════════
   JYOTISHYAM — Birth Horoscope Engine
   Computes: Graha Sphuta, Navamsha, Vimshottari Dasha, Doshas
   Uses astronomical functions from panchangam-v15.js
   ═══════════════════════════════════════════════════════════════ */

/* ── Constants ── */

// Vimshottari Dasha sequence: Nakshatra lord → Duration in years
const DASHA_SEQ = [
    { name: 'Ketu',   full: 'Ketu',           years: 7  },
    { name: 'Shukra', full: 'Shukra (Venus)',  years: 20 },
    { name: 'Surya',  full: 'Surya (Sun)',     years: 6  },
    { name: 'Chandra',full: 'Chandra (Moon)',  years: 10 },
    { name: 'Kuja',   full: 'Kuja (Mars)',     years: 7  },
    { name: 'Rahu',   full: 'Rahu',            years: 18 },
    { name: 'Guru',   full: 'Guru (Jupiter)',  years: 16 },
    { name: 'Shani',  full: 'Shani (Saturn)',  years: 19 },
    { name: 'Budha',  full: 'Budha (Mercury)', years: 17 },
];

// Nakshatra → Dasha lord index (0=Ketu, 1=Shukra, ... 8=Budha)
// Ashwini=Ketu, Bharani=Shukra, Krittika=Surya, ...repeating every 9
const NAK_DASHA_LORD = [0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8, 0,1,2,3,4,5,6,7,8];

// Janma Namakshara (birth syllables) for each Nakshatra Pada
const NAMAKSHARA = [
    // 0: Ashwini
    ['Chu (చు)','Che (చే)','Cho (చో)','La (లా)'],
    // 1: Bharani
    ['Li (లి)','Lu (లు)','Le (లే)','Lo (లో)'],
    // 2: Krittika
    ['A (అ)','I (ఈ)','U (ఉ)','E (ఏ)'],
    // 3: Rohini
    ['O (ఓ)','Va (వా)','Vi (వి)','Vu (వు)'],
    // 4: Mrigashira
    ['Ve (వే)','Vo (వో)','Ka (కా)','Ki (కి)'],
    // 5: Ardra
    ['Ku (కు)','Gha (ఘ)','Ng (ఙ)','Chha (ఛ)'],
    // 6: Punarvasu
    ['Ke (కే)','Ko (కో)','Ha (హా)','Hi (హి)'],
    // 7: Pushya
    ['Hu (హు)','He (హే)','Ho (హో)','Da (డా)'],
    // 8: Ashlesha
    ['Di (డి)','Du (డు)','De (డే)','Do (డో)'],
    // 9: Magha
    ['Ma (మా)','Mi (మి)','Mu (ము)','Me (మే)'],
    // 10: Purva Phalguni
    ['Mo (మో)','Ta (టా)','Ti (టి)','Tu (టు)'],
    // 11: Uttara Phalguni
    ['Te (టే)','To (టో)','Pa (పా)','Pi (పి)'],
    // 12: Hasta
    ['Pu (పు)','Sha (ష)','Na (ణ)','Tha (ఠ)'],
    // 13: Chitra
    ['Pe (పే)','Po (పో)','Ra (రా)','Ri (రి)'],
    // 14: Swati
    ['Ru (రు)','Re (రే)','Ro (రో)','Ta (తా)'],
    // 15: Vishakha
    ['Ti (తి)','Tu (తు)','Te (తే)','To (తో)'],
    // 16: Anuradha
    ['Na (నా)','Ni (ని)','Nu (ను)','Ne (నే)'],
    // 17: Jyeshtha
    ['No (నో)','Ya (యా)','Yi (యి)','Yu (యు)'],
    // 18: Moola
    ['Ye (యే)','Yo (యో)','Bha (భా)','Bhi (భి)'],
    // 19: Purva Ashadha
    ['Bhu (భు)','Dha (ధా)','Pha (ఫా)','Dha (ఢా)'],
    // 20: Uttara Ashadha
    ['Bhe (భే)','Bho (భో)','Ja (జా)','Ji (జి)'],
    // 21: Shravana
    ['Ju (జు)','Je (జే)','Jo (జో)','Gha (ఘా)'],
    // 22: Dhanishtha
    ['Ga (గా)','Gi (గి)','Gu (గు)','Ge (గే)'],
    // 23: Shatabhisha
    ['Go (గో)','Sa (సా)','Si (సి)','Su (సు)'],
    // 24: Purva Bhadrapada
    ['Se (సే)','So (సో)','Da (దా)','Di (ది)'],
    // 25: Uttara Bhadrapada
    ['Du (దు)','Tha (థ)','Jha (ఝ)','Tra (త్ర)'],
    // 26: Revati
    ['De (దే)','Do (దో)','Cha (చా)','Chi (చి)'],
];

// Sign nature for Navamsha calculation
// 0=Chara(Movable), 1=Sthira(Fixed), 2=Dvisvabhava(Dual)
const SIGN_NATURE = [0,1,2, 0,1,2, 0,1,2, 0,1,2];

// Planetary dignities
const EXALTATION  = { 0:0, 1:1, 2:9, 3:5, 4:3, 5:11, 6:6, 7:2, 8:8 }; // graha idx -> exalted sign
const DEBILITATION= { 0:6, 1:7, 2:3, 3:11, 4:9, 5:5, 6:0, 7:8, 8:2 }; // graha idx -> debilitated sign
const OWN_SIGNS   = {
    0: [4],       // Sun owns Leo
    1: [3],       // Moon owns Cancer
    2: [0,7],     // Mars owns Aries, Scorpio
    3: [2,5],     // Mercury owns Gemini, Virgo
    4: [8,11],    // Jupiter owns Sagittarius, Pisces
    5: [1,6],     // Venus owns Taurus, Libra
    6: [9,10],    // Saturn owns Capricorn, Aquarius
};

/* ── Navamsha (D-9) Computation ── */

function computeNavamsha(signIdx, degInSign) {
    // Each navamsha = 3°20' = 200 arcminutes
    const arcMin = degInSign * 60;
    const navNum = Math.floor(arcMin / 200); // 0-8

    // Starting sign for navamsha count
    const nature = SIGN_NATURE[signIdx];
    let startSign;
    if (nature === 0) startSign = signIdx;          // Chara: from itself
    else if (nature === 1) startSign = (signIdx + 8) % 12; // Sthira: from 9th
    else startSign = (signIdx + 4) % 12;           // Dual: from 5th

    return (startSign + navNum) % 12;
}

/* ── House Placement from Lagna ── */

function getHouse(grahaSign, lagnaSign) {
    return ((grahaSign - lagnaSign + 12) % 12) + 1; // 1-12
}

/* ── Planetary Dignity ── */

function getDignity(grahaIdx, signIdx) {
    // grahaIdx: 0=Sun,1=Moon,2=Mars,3=Mercury,4=Jupiter,5=Venus,6=Saturn (Rahu/Ketu=7,8 skip)
    if (grahaIdx >= 7) return '—';
    if (EXALTATION[grahaIdx] === signIdx) return 'Exalted (ఉచ్ఛ)';
    if (DEBILITATION[grahaIdx] === signIdx) return 'Debilitated (నీచ)';
    if (OWN_SIGNS[grahaIdx] && OWN_SIGNS[grahaIdx].includes(signIdx)) return 'Own Sign (స్వక్షేత్రం)';
    // Mitra/Shatru (simplified)
    return 'Neutral';
}

/* ── Nakshatra Pada ── */

function getNakshatraPada(nirDeg) {
    const nakIdx = Math.floor(nirDeg / (13 + 1/3));
    const degInNak = nirDeg - nakIdx * (13 + 1/3);
    const pada = Math.floor(degInNak / (3 + 1/3)) + 1;
    return { nakIdx: nakIdx % 27, pada: Math.min(pada, 4) };
}

/* ── Vimshottari Dasha Engine ── */

function computeVimshottariDasha(moonDeg, birthDate) {
    const np = getNakshatraPada(moonDeg);
    const lordIdx = NAK_DASHA_LORD[np.nakIdx]; // 0-8 into DASHA_SEQ

    // Nakshatra span: 13°20' = 800 arcminutes
    const nakStart = np.nakIdx * (13 + 1/3);
    const nakEnd = nakStart + (13 + 1/3);
    const bhuktaArc = moonDeg - nakStart;   // elapsed
    const bhogyaArc = nakEnd - moonDeg;     // remaining
    const totalArc = 13 + 1/3;

    const lordYears = DASHA_SEQ[lordIdx].years;
    const balanceYears = (bhogyaArc / totalArc) * lordYears;
    const balanceDays = balanceYears * 365.25;

    // Build full 120-year timeline
    const timeline = [];
    let currentDate = new Date(birthDate.getTime());

    // First: balance of birth lord
    const endFirst = new Date(currentDate.getTime() + balanceDays * 86400000);
    timeline.push({
        lord: DASHA_SEQ[lordIdx],
        lordIdx: lordIdx,
        start: new Date(currentDate.getTime()),
        end: endFirst,
        duration: balanceYears,
        isBalance: true,
    });
    currentDate = endFirst;

    // Remaining 8 lords in sequence
    for (let i = 1; i <= 8; i++) {
        const idx = (lordIdx + i) % 9;
        const yrs = DASHA_SEQ[idx].years;
        const endDate = new Date(currentDate.getTime() + yrs * 365.25 * 86400000);
        timeline.push({
            lord: DASHA_SEQ[idx],
            lordIdx: idx,
            start: new Date(currentDate.getTime()),
            end: endDate,
            duration: yrs,
            isBalance: false,
        });
        currentDate = endDate;
    }

    return { lordIdx, balanceYears, nakIdx: np.nakIdx, pada: np.pada, timeline };
}

function computeAntardasha(mahadasha) {
    const dm = mahadasha.lord.years;
    const antars = [];
    let currentDate = new Date(mahadasha.start.getTime());

    // If balance period, proportionally reduce all antardashas
    const scale = mahadasha.isBalance ? (mahadasha.duration / dm) : 1;

    for (let i = 0; i < 9; i++) {
        const idx = (mahadasha.lordIdx + i) % 9;
        const da = DASHA_SEQ[idx].years;
        const durationYears = (dm * da / 120) * scale;
        const durationDays = durationYears * 365.25;
        const endDate = new Date(currentDate.getTime() + durationDays * 86400000);
        antars.push({
            lord: DASHA_SEQ[idx],
            lordIdx: idx,
            start: new Date(currentDate.getTime()),
            end: endDate,
            durationYears,
            mahaLord: mahadasha.lord,
        });
        currentDate = endDate;
    }
    return antars;
}

function computePratyantardasha(antardasha, mahaLordYears) {
    const dm = mahaLordYears;
    const da = antardasha.lord.years;
    const pratyantars = [];
    let currentDate = new Date(antardasha.start.getTime());
    const totalAntar = antardasha.durationYears;

    for (let i = 0; i < 9; i++) {
        const idx = (antardasha.lordIdx + i) % 9;
        const dp = DASHA_SEQ[idx].years;
        const durationYears = (dm * da * dp / 14400) * (totalAntar / (dm * da / 120));
        const durationDays = durationYears * 365.25;
        const endDate = new Date(currentDate.getTime() + durationDays * 86400000);
        pratyantars.push({
            lord: DASHA_SEQ[idx],
            start: new Date(currentDate.getTime()),
            end: endDate,
            durationDays,
        });
        currentDate = endDate;
    }
    return pratyantars;
}

/* ── Dosha Detection ── */

function detectDoshas(grahas, lagnaSign) {
    const doshas = [];
    const houses = {};
    grahas.forEach((g, i) => { houses[g.name] = getHouse(g.rashi, lagnaSign); });

    // 1. Kuja Dosha: Mars in 1,2,4,7,8,12 from Lagna
    const marsHouse = houses['Ma'];
    const kujaHouses = [1,2,4,7,8,12];
    const isKuja = kujaHouses.includes(marsHouse);

    // Check cancellations
    let kujaCancelled = false;
    if (isKuja) {
        const marsSign = grahas.find(g=>g.name==='Ma').rashi;
        // Own/Exalted cancellation
        if ([0,7,9].includes(marsSign)) kujaCancelled = true; // Aries, Scorpio, Capricorn
        // Jupiter aspect on Mars (Jupiter in 1,5,7,9 from Mars house cancels)
        const jupHouse = houses['Ju'];
        if (jupHouse === marsHouse) kujaCancelled = true;
    }

    doshas.push({
        name: 'Kuja Dosha (కుజ దోషం)',
        detected: isKuja && !kujaCancelled,
        detail: isKuja
            ? (kujaCancelled
                ? `Mars in ${marsHouse}th house — Dosha cancelled (Dosha Bhangam) due to own/exalted sign or benefic aspect.`
                : `Mars in ${marsHouse}th house from Lagna. Affects marriage compatibility.`)
            : `Mars in ${marsHouse}th house — No Kuja Dosha.`,
        remedies: [
            'Recite Subrahmanya Ashtakam / Angaraka Stotram on Tuesdays.',
            'Kuja Shanti Homa at Vaitheeswaran Koil.',
            'Match charts with equal Kuja balance partner.',
        ],
    });

    // 2. Kala Sarpa Dosha: All 7 planets between Rahu-Ketu axis
    const rahuSign = grahas.find(g=>g.name==='Ra').rashi;
    const ketuSign = grahas.find(g=>g.name==='Ke').rashi;
    const classicalPlanets = grahas.filter(g => !['Ra','Ke'].includes(g.name));
    let allBetween = true;
    classicalPlanets.forEach(g => {
        const dist = ((g.rashi - rahuSign + 12) % 12);
        const ketuDist = ((ketuSign - rahuSign + 12) % 12);
        if (dist === 0 || dist > ketuDist) allBetween = false;
    });

    doshas.push({
        name: 'Kala Sarpa Dosha (కాలసర్ప దోషం)',
        detected: allBetween,
        detail: allBetween
            ? 'All 7 classical planets are hemmed between the Rahu-Ketu axis.'
            : 'Planets are NOT hemmed between Rahu-Ketu — No Kala Sarpa Dosha.',
        remedies: [
            'Perform Naga Pratishtha / Rahu-Ketu Shanti at Srikalahasti or Trimbakeshwar.',
            'Recite Maha Mrityunjaya Mantra daily (108 times).',
            'Regular worship of Lord Subrahmanya.',
        ],
    });

    // 3. Guru Chandal Dosha: Jupiter conjoined with Rahu
    const jupSign = grahas.find(g=>g.name==='Ju').rashi;
    const guruChandal = (jupSign === rahuSign);
    doshas.push({
        name: 'Guru Chandal Dosha (గురు చండాల దోషం)',
        detected: guruChandal,
        detail: guruChandal
            ? 'Jupiter and Rahu are conjoined in the same sign.'
            : 'Jupiter and Rahu are in different signs — No Guru Chandal.',
        remedies: [
            'Worship Lord Dakshinamurthy on Thursdays.',
            'Chant Brihaspati Gayatri Mantra.',
            'Feed yellow lentils to cows.',
        ],
    });

    // 4. Punarphoo Dosha: Saturn-Moon conjunction
    const satSign = grahas.find(g=>g.name==='Sa').rashi;
    const moonSign = grahas.find(g=>g.name==='Mo').rashi;
    const punarphoo = (satSign === moonSign) || ((satSign + 6) % 12 === moonSign);
    doshas.push({
        name: 'Punarphoo Dosha (పునర్ఫూ దోషం)',
        detected: punarphoo,
        detail: punarphoo
            ? 'Saturn and Moon are conjoined or in mutual 7th aspect.'
            : 'Saturn and Moon are not in conjunction or 7th aspect.',
        remedies: [
            'Perform Ksheera Abhishekam to Shiva Lingam on Mondays.',
            'Recite Hanuman Chalisa and Chandra Kavacham.',
            'Donate silver ring or square silver piece.',
        ],
    });

    // 5. Gandanta Dosha: Birth at water-fire sign junction
    const moonDeg = grahas.find(g=>g.name==='Mo').deg;
    const gandantaZones = [
        [353.33, 360], [0, 0.56],     // Revati-Ashwini (Pisces-Aries)
        [113.33, 120], [120, 120.56], // Ashlesha-Magha (Cancer-Leo)
        [233.33, 240], [240, 240.56], // Jyeshtha-Moola (Scorpio-Sagittarius)
    ];
    let isGandanta = false;
    gandantaZones.forEach(([s,e]) => { if (moonDeg >= s && moonDeg <= e) isGandanta = true; });
    doshas.push({
        name: 'Gandanta Dosha (గండాంత దోషం)',
        detected: isGandanta,
        detail: isGandanta
            ? 'Birth Moon at water-fire sign junction (Gandanta zone).'
            : 'Moon is not in Gandanta zone.',
        remedies: [
            'Perform Gandanta Shanti Homa after the 27th day.',
            'Ayushya Homa for vitality and health.',
            'Chhaya Dana (ghee offering in bronze vessel).',
        ],
    });

    // 6. Grahana Dosha: Sun/Moon conjoined Rahu/Ketu
    const sunSign = grahas.find(g=>g.name==='Su').rashi;
    const grahana = (sunSign === rahuSign || sunSign === ketuSign || moonSign === rahuSign || moonSign === ketuSign);
    doshas.push({
        name: 'Grahana Dosha (గ్రహణ దోషం)',
        detected: grahana,
        detail: grahana
            ? 'Sun or Moon conjoined with Rahu/Ketu (eclipse combination).'
            : 'No Sun/Moon conjunction with Rahu/Ketu.',
        remedies: [
            'Offer Arghya to Sun daily with Aditya Hridaya Stotram.',
            'Recite Shiva Panchakshari Mantra (Om Namah Shivaya).',
            'Donate wheat/copper (Sun) or rice/silver (Moon) on eclipse days.',
        ],
    });

    return doshas;
}

/* ── Main Generate Function ── */


/* ── Place Search via OpenStreetMap Nominatim ── */

async function searchPlace() {
    const query = document.getElementById('birthPlace').value.trim();
    if (!query) { alert('Please type a place name to search.'); return; }

    const resultsDiv = document.getElementById('placeSearchResults');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div style="padding:6px 10px;color:#666;">Searching...</div>';

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();

        if (!data.length) {
            resultsDiv.innerHTML = '<div style="padding:6px 10px;color:#c00;">No results found. Try a more specific name.</div>';
            return;
        }

        resultsDiv.innerHTML = data.map((r, i) =>
            `<div onclick="selectPlace(${i})" data-idx="${i}" style="padding:6px 10px;cursor:pointer;border-bottom:1px solid #eee;"
              onmouseover="this.style.background='#f5e6c8'" onmouseout="this.style.background=''"
              data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.display_name.replace(/"/g,'&quot;')}">
                ${r.display_name}
            </div>`
        ).join('');

        // Store results globally for selectPlace
        window._geoResults = data;
    } catch(e) {
        resultsDiv.innerHTML = `<div style="padding:6px 10px;color:#c00;">Search failed. Check internet connection.</div>`;
    }
}

function selectPlace(idx) {
    const r = window._geoResults[idx];
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);

    // Estimate UTC offset from longitude (rough: 1 hour per 15 degrees)
    // More precise: use known country offsets
    let tz = Math.round(lon / 15 * 2) / 2; // round to nearest 0.5
    // Country-based overrides
    const country = (r.address && r.address.country_code) ? r.address.country_code.toUpperCase() : '';
    if (country === 'IN') tz = 5.5;
    else if (country === 'US') {
        if (lon > -75) tz = -5;
        else if (lon > -90) tz = -6;
        else if (lon > -105) tz = -7;
        else tz = -8;
    }
    else if (country === 'GB') tz = 0;
    else if (country === 'AU') {
        if (lon > 135) tz = 10;
        else if (lon > 125) tz = 9.5;
        else tz = 8;
    }
    else if (['DE','FR','IT','ES','NL','BE','DK','SE','NO'].includes(country)) tz = 1;
    else if (['JP','KR'].includes(country)) tz = 9;
    else if (['CN','PH','MY','SG'].includes(country)) tz = 8;
    else if (['NP'].includes(country)) tz = 5.75;
    else if (['LK','BD'].includes(country)) tz = 5.5;
    else if (['PK','UZ'].includes(country)) tz = 5;
    else if (['AE','OM'].includes(country)) tz = 4;
    else if (['SA','QA','KW','BH','IQ'].includes(country)) tz = 3;
    else if (['EG','ZA','GR','TR','FI','EE','LV','LT'].includes(country)) tz = 2;

    document.getElementById('birthLat').value = lat.toFixed(4);
    document.getElementById('birthLon').value = lon.toFixed(4);
    document.getElementById('birthTz').value = tz;

    const shortName = r.display_name.split(',').slice(0,3).join(',');
    document.getElementById('birthPlace').value = shortName;
    document.getElementById('placeFoundInfo').style.display = 'block';
    document.getElementById('placeFoundInfo').innerHTML =
        `✅ ${shortName}<br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}, UTC${tz >= 0 ? '+' : ''}${tz}`;
    document.getElementById('placeSearchResults').style.display = 'none';
}

// Allow pressing Enter to search
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('birthPlace');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') searchPlace(); });
});

function generateHoroscope() {
    const name = document.getElementById('birthName').value || 'Native';
    const sex = document.getElementById('birthSex').value;
    const dateStr = document.getElementById('birthDate').value;
    const timeStr = document.getElementById('birthTime').value;

    if (!dateStr || !timeStr) { alert('Please enter Date and Time of Birth.'); return; }

    const lat = parseFloat(document.getElementById('birthLat').value);
    const lon = parseFloat(document.getElementById('birthLon').value);
    const tz  = parseFloat(document.getElementById('birthTz').value);
    const locName = document.getElementById('birthPlace').value || `(${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;

    if (isNaN(lat) || isNaN(lon) || isNaN(tz)) {
        alert('Please search for a Place of Birth or enter Latitude, Longitude and UTC Offset manually.');
        return;
    }

    const [yy, mm, dd] = dateStr.split('-').map(Number);
    const [hh, mi] = timeStr.split(':').map(Number);

    // Birth time as decimal hours (local)
    const birthHrs = hh + mi / 60;

    // Julian Day at birth
    const jd = dateToJD(yy, mm, dd) + (birthHrs - tz) / 24;

    // Sunrise at birth location on birth date
    const st = computeSunTimes(yy, mm, dd, lat, lon, tz);
    const srHrs = st ? st.sunrise : 6.0;
    const ssHrs = st ? st.sunset : 18.0;

    // ═══ GRAHA SPHUTA ═══
    const grahas = getNavagrahaPositions(jd);
    const lagnaAtBirth = computeLagna(jd, lat, lon);
    const lagnaSign = lagnaAtBirth.rashiIdx;

    // ═══ BIRTH PANCHANGA ═══
    const tithiIdx = getTithiIdx(jd);
    const nakIdx = getNakIdx(jd);
    const yogaIdx = getYogaIdx(jd);
    const karanaIdx = getKaranaIdx(jd);
    const dow = new Date(yy, mm-1, dd).getDay();
    const moonNp = getNakshatraPada(getMoonNirayana(jd));
    const namakshara = NAMAKSHARA[moonNp.nakIdx] ? NAMAKSHARA[moonNp.nakIdx][moonNp.pada - 1] : '—';

    // Ishta Kala
    const ishtaKalaHrs = birthHrs - srHrs;
    const ishtaGhati = Math.floor(ishtaKalaHrs * 2.5);
    const ishtaViGhati = Math.round((ishtaKalaHrs * 2.5 - ishtaGhati) * 60);

    // LMT correction
    const stdMeridian = tz * 15; // Standard meridian longitude
    const lmtCorr = (lon - stdMeridian) * 4; // minutes
    const lmtH = hh + Math.floor((mi + lmtCorr) / 60);
    const lmtM = Math.round(((mi + lmtCorr) % 60 + 60) % 60);

    // Header
    document.getElementById('birthHeader').innerHTML =
        `Jataka Kundali for <strong>${name}</strong> (${sex === 'male' ? '♂' : '♀'})<br>
         <span style="font-size:0.85rem;color:#666;">${locName} · ${dateStr} · ${timeStr} · UTC${tz>=0?'+':''}${tz}</span>`;

    // Birth Panchanga
    const paksham = getPaksham(tithiIdx);
    const tithiName = TITHI[tithiIdx];
    const panchHTML = `
        <div class="pitem"><span class="plabel">Samvatsaram</span><span class="pval">${getSamvatsaram(yy, mm, jd)}</span></div>
        <div class="pitem"><span class="plabel">Masam</span><span class="pval">${getLunarCalendar(jd).masam}</span></div>
        <div class="pitem"><span class="plabel">Paksham</span><span class="pval">${paksham}</span></div>
        <div class="pitem"><span class="plabel">Tithi</span><span class="pval">${paksham.replace(' Paksham','')} ${tithiName}</span></div>
        <div class="pitem"><span class="plabel">Vasara</span><span class="pval">${VARA[dow]}</span></div>
        <div class="pitem"><span class="plabel">Nakshatra</span><span class="pval">${NAKSHATRA[nakIdx]} — Pada ${moonNp.pada}</span></div>
        <div class="pitem"><span class="plabel">Yoga</span><span class="pval">${YOGA[yogaIdx]}</span></div>
        <div class="pitem"><span class="plabel">Karana</span><span class="pval">${getKaranaName(karanaIdx)}</span></div>
        <div class="pitem"><span class="plabel">Ishta Kala</span><span class="pval">${ishtaGhati} Ghati ${ishtaViGhati} Vighati</span></div>
        <div class="pitem"><span class="plabel">LMT at Birth</span><span class="pval">${String(lmtH).padStart(2,'0')}:${String(lmtM).padStart(2,'0')}</span></div>
    `;
    document.getElementById('birthPanchang').innerHTML = panchHTML;

    // Namakshara
    const nBox = document.getElementById('namaksharaBox');
    nBox.style.display = 'block';
    nBox.innerHTML = `Janma Namakshara (జన్మ నామాక్షరం):<br><span class="syllable">${namakshara}</span>`;

    // ═══ GRAHA SPHUTA TABLE ═══
    const grahaMap = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];
    const grahaIdxMap = { Su:0, Mo:1, Ma:2, Me:3, Ju:4, Ve:5, Sa:6, Ra:7, Ke:8 };
    let gtHTML = `<tr><th>Graha</th><th>Nirayana Longitude</th><th>Rashi</th><th>House</th><th>Nakshatra & Pada</th><th>Dignity</th></tr>`;

    // Lagna row first
    const lagDeg = lagnaAtBirth.degree % 30;
    const lagNp = getNakshatraPada(lagnaAtBirth.degree);
    const lagDW = Math.floor(lagDeg);
    let lagMP = Math.round((lagDeg - lagDW) * 60);
    if (lagMP >= 60) { lagMP = 0; }
    gtHTML += `<tr style="background:#f5e6c8;font-weight:600">
        <td style="color:#4a0e0e">Lagna (Ascendant)</td>
        <td>${lagnaAtBirth.rashiName} ${lagDW}°${String(lagMP).padStart(2,'0')}'</td>
        <td>${lagnaAtBirth.rashiName}</td>
        <td>1st</td>
        <td>${NAKSHATRA[lagNp.nakIdx]} — ${lagNp.pada}</td>
        <td>Rising Sign</td>
    </tr>`;

    grahas.forEach((g, i) => {
        const degInR = g.deg % 30;
        const dW = Math.floor(degInR);
        let mP = Math.round((degInR - dW) * 60);
        if (mP >= 60) mP = 0;
        const house = getHouse(g.rashi, lagnaSign);
        const np = getNakshatraPada(g.deg);
        const dignity = getDignity(grahaIdxMap[g.name], g.rashi);
        const navSign = computeNavamsha(g.rashi, degInR);

        gtHTML += `<tr>
            <td style="color:${g.color};font-weight:bold">${g.full}</td>
            <td>${g.rashiName} ${dW}°${String(mP).padStart(2,'0')}'</td>
            <td>${g.rashiName}</td>
            <td>${house}${house===1?'st':house===2?'nd':house===3?'rd':'th'}</td>
            <td>${NAKSHATRA[np.nakIdx]} — ${np.pada}</td>
            <td>${dignity}</td>
        </tr>`;
    });
    document.getElementById('grahaSphutaTable').innerHTML = gtHTML;

    // ═══ CHARTS ═══
    // D-1 Rashi Chart
    document.getElementById('rashiChart').innerHTML = generateSouthIndianChartSVG(lagnaSign, grahas);

    // D-9 Navamsha Chart — compute navamsha signs for all grahas
    const navGrahas = grahas.map(g => {
        const degInR = g.deg % 30;
        const navSign = computeNavamsha(g.rashi, degInR);
        return { ...g, rashi: navSign, rashiName: RASHI[navSign] };
    });
    const lagNavSign = computeNavamsha(lagnaSign, lagnaAtBirth.degree % 30);
    document.getElementById('navamshaChart').innerHTML = generateSouthIndianChartSVG(lagNavSign, navGrahas);

    // ═══ VIMSHOTTARI DASHA ═══
    const birthDate = new Date(yy, mm-1, dd, hh, mi);
    const moonDeg = getMoonNirayana(jd);
    const dasha = computeVimshottariDasha(moonDeg, birthDate);
    const today = new Date();

    // Balance display
    const balY = Math.floor(dasha.balanceYears);
    const balM = Math.floor((dasha.balanceYears - balY) * 12);
    const balD = Math.round(((dasha.balanceYears - balY) * 12 - balM) * 30);
    document.getElementById('dashaBalance').innerHTML =
        `<strong>Janma Nakshatra:</strong> ${NAKSHATRA[dasha.nakIdx]} — Pada ${dasha.pada}<br>
         <strong>Nakshatra Lord:</strong> ${DASHA_SEQ[dasha.lordIdx].full}<br>
         <strong>Dasha Balance at Birth:</strong> ${DASHA_SEQ[dasha.lordIdx].name} — ${balY} Years, ${balM} Months, ${balD} Days`;

    // Mahadasha table
    let mdHTML = '<tr><th>Mahadasha Lord</th><th>Duration</th><th>Start</th><th>End</th><th>Status</th></tr>';
    let currentMaha = null;
    dasha.timeline.forEach(md => {
        const isActive = today >= md.start && today < md.end;
        const isCompleted = today >= md.end;
        if (isActive) currentMaha = md;
        const durStr = md.isBalance ? `${balY}y ${balM}m ${balD}d (Balance)` : `${md.duration} Years`;
        const cls = isActive ? 'dasha-active' : (isCompleted ? 'dasha-completed' : '');
        const status = isActive ? '▶ Active' : (isCompleted ? 'Completed' : 'Upcoming');
        mdHTML += `<tr class="${cls}">
            <td><strong>${md.lord.full}</strong></td>
            <td>${durStr}</td>
            <td>${fmtDate(md.start)}</td>
            <td>${fmtDate(md.end)}</td>
            <td>${status}</td>
        </tr>`;
    });
    document.getElementById('mahadashaTable').innerHTML = mdHTML;

    // Antardasha for current Mahadasha
    if (currentMaha) {
        const antars = computeAntardasha(currentMaha);
        let adHTML = `<tr><th>${currentMaha.lord.name} –</th><th>Duration</th><th>Start</th><th>End</th><th>Status</th></tr>`;
        let currentAntar = null;
        antars.forEach(a => {
            const isActive = today >= a.start && today < a.end;
            const isCompleted = today >= a.end;
            if (isActive) currentAntar = a;
            const durM = Math.floor(a.durationYears * 12);
            const durD = Math.round((a.durationYears * 12 - durM) * 30);
            const durY = Math.floor(durM / 12);
            const remM = durM % 12;
            const cls = isActive ? 'dasha-active' : (isCompleted ? 'dasha-completed' : '');
            const status = isActive ? '▶ Active' : (isCompleted ? 'Completed' : 'Upcoming');
            adHTML += `<tr class="${cls}">
                <td>${currentMaha.lord.name} – <strong>${a.lord.name}</strong></td>
                <td>${durY}y ${remM}m ${durD}d</td>
                <td>${fmtDate(a.start)}</td>
                <td>${fmtDate(a.end)}</td>
                <td>${status}</td>
            </tr>`;
        });
        document.getElementById('antardashaTable').innerHTML = adHTML;

        // Pratyantardasha for current Antardasha
        if (currentAntar) {
            const pratys = computePratyantardasha(currentAntar, currentMaha.lord.years);
            let pdHTML = `<tr><th>${currentMaha.lord.name} – ${currentAntar.lord.name} –</th><th>Duration</th><th>Start</th><th>End</th><th>Status</th></tr>`;
            pratys.forEach(p => {
                const isActive = today >= p.start && today < p.end;
                const isCompleted = today >= p.end;
                const durDays = Math.round(p.durationDays);
                const cls = isActive ? 'dasha-active' : (isCompleted ? 'dasha-completed' : '');
                const status = isActive ? '▶ Active' : (isCompleted ? 'Completed' : 'Upcoming');
                pdHTML += `<tr class="${cls}">
                    <td>${currentMaha.lord.name} – ${currentAntar.lord.name} – <strong>${p.lord.name}</strong></td>
                    <td>${durDays} Days</td>
                    <td>${fmtDate(p.start)}</td>
                    <td>${fmtDate(p.end)}</td>
                    <td>${status}</td>
                </tr>`;
            });
            document.getElementById('pratyantardashaTable').innerHTML = pdHTML;
        }
    }

    // ═══ DOSHA ANALYSIS ═══
    const doshas = detectDoshas(grahas, lagnaSign);
    let doshaHTML = '';
    doshas.forEach(d => {
        const cls = d.detected ? 'dosha-card detected' : 'dosha-card clear';
        const icon = d.detected ? '⚠️' : '✅';
        doshaHTML += `<div class="${cls}">
            <div class="dosha-title">${icon} ${d.name}</div>
            <div>${d.detail}</div>
        </div>`;
    });
    document.getElementById('doshaResults').innerHTML = doshaHTML;

    // Remedies for detected doshas
    const detectedDoshas = doshas.filter(d => d.detected);
    if (detectedDoshas.length > 0) {
        let remHTML = '';
        detectedDoshas.forEach(d => {
            remHTML += `<div style="margin:10px 0"><strong>${d.name}:</strong><ul class="remedy-list">`;
            d.remedies.forEach(r => { remHTML += `<li>${r}</li>`; });
            remHTML += '</ul></div>';
        });
        document.getElementById('remedyResults').innerHTML = remHTML;
    } else {
        document.getElementById('remedyResults').innerHTML =
            '<p style="color:#27ae60;font-family:\'EB Garamond\',serif;">✅ No major Doshas detected. Chart is generally favorable.</p>';
    }

    // Store kundali data for AI analysis
    window._kundaliData = {
        grahas, lagnaSign, currentMaha, currentAntar,
        currentPratyantar: null, antardashas: currentMaha ? computeAntardasha(currentMaha) : [],
        name, sex, dateStr, locName
    };
    // Find current pratyantardasha
    if (currentAntar) {
        const pratys = computePratyantardasha(currentAntar, currentMaha.lord.years);
        window._kundaliData.currentPratyantar = pratys.find(p => today >= p.start && today < p.end) || null;
    }

    // Show results and chat
    document.getElementById('jyotishResults').style.display = 'block';
    document.getElementById('jyotishChatSection').style.display = 'block';
    addChatMsg('ai', `🙏 Namaste <strong>${name}</strong>! Your Jataka Kundali for <strong>${dateStr}</strong> from <strong>${locName}</strong> has been computed.<br><br>Currently running: <strong>${currentMaha ? currentMaha.lord.name : '—'} Mahadasha – ${currentAntar ? currentAntar.lord.name : '—'} Antardasha</strong>.<br><br>Ask me about your <strong>finances, career, health, marriage, travel</strong>, or anything else about your life! Use the quick buttons below or type your question.`);
    document.getElementById('jyotishResults').scrollIntoView({ behavior: 'smooth' });
}

// Helper: format Date to readable string
function fmtDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* ═══════════════════════════════════════════════════════════
   JYOTISH AI ANALYSIS ENGINE
   Vedic astrology analysis for Finance, Career, Health etc.
   ═══════════════════════════════════════════════════════════ */

// Store kundali data globally after generation
window._kundaliData = null;

// House lord mapping: sign index → lord graha name code
const SIGN_LORD = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ma','Ju','Sa','Sa','Ju'];
// Refined: 0=Aries/Ma, 1=Taurus/Ve, 2=Gemini/Me, 3=Cancer/Mo, 4=Leo/Su,
//          5=Virgo/Me, 6=Libra/Ve, 7=Scorpio/Ma, 8=Sag/Ju, 9=Cap/Sa, 10=Aqu/Sa, 11=Pis/Ju
const SIGN_LORD_CORRECT = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Ju','Sa','Sa','Ju'];

// Graha full names for AI responses
const GRAHA_FULL_NAME = {
    Su:'Surya (Sun)', Mo:'Chandra (Moon)', Ma:'Mangal (Mars)', Me:'Budha (Mercury)',
    Ju:'Guru (Jupiter)', Ve:'Shukra (Venus)', Sa:'Shani (Saturn)', Ra:'Rahu', Ke:'Ketu'
};

// Nature of houses
const HOUSE_NATURE = {
    1:'self, health, personality',
    2:'wealth, family, speech',
    3:'courage, siblings, short travel',
    4:'home, mother, property, vehicles',
    5:'children, intelligence, past merit, speculation',
    6:'enemies, disease, debts, litigation',
    7:'marriage, partnerships, business',
    8:'longevity, inheritance, hidden matters, research',
    9:'fortune, father, religion, higher education, long travel',
    10:'career, profession, status, government',
    11:'income, gains, social circle, fulfillment of desires',
    12:'foreign lands, expenses, liberation, sleep, loss'
};

// Benefic/Malefic nature
const IS_BENEFIC = { Su:false, Mo:true, Ma:false, Me:true, Ju:true, Ve:true, Sa:false, Ra:false, Ke:false };

function getHouseLord(houseNum, lagnaSign) {
    const signOfHouse = (lagnaSign + houseNum - 1) % 12;
    return SIGN_LORD_CORRECT[signOfHouse];
}

function getGrahaHouse(grahaName, grahas, lagnaSign) {
    const g = grahas.find(x => x.name === grahaName);
    if (!g) return null;
    return ((g.rashi - lagnaSign + 12) % 12) + 1;
}

function getGrahaSign(grahaName, grahas) {
    const g = grahas.find(x => x.name === grahaName);
    return g ? g.rashi : null;
}

function isGrahaBeneficForLagna(grahaName, lagnaSign) {
    // Simplified: natural benefics owning trines (1,5,9) or kendras (1,4,7,10) are positive
    return IS_BENEFIC[grahaName];
}

function getStrengthDesc(grahaName, grahas) {
    const g = grahas.find(x => x.name === grahaName);
    if (!g) return '';
    const exSigns = { Su:0, Mo:1, Ma:9, Me:5, Ju:3, Ve:11, Sa:6 };
    const debSigns = { Su:6, Mo:7, Ma:3, Me:11, Ju:9, Ve:5, Sa:0 };
    const ownS = { Su:[4], Mo:[3], Ma:[0,7], Me:[2,5], Ju:[8,11], Ve:[1,6], Sa:[9,10] };
    if (exSigns[grahaName] !== undefined && exSigns[grahaName] === g.rashi) return '(Exalted ✦)';
    if (debSigns[grahaName] !== undefined && debSigns[grahaName] === g.rashi) return '(Debilitated ✗)';
    if (ownS[grahaName] && ownS[grahaName].includes(g.rashi)) return '(Own Sign ✓)';
    return '';
}

/* ── Main Analysis Functions ── */

function analyzeFinance(data) {
    const { grahas, lagnaSign, currentMaha, currentAntar, currentPratyantar } = data;
    const d2Lord = getHouseLord(2, lagnaSign);
    const d11Lord = getHouseLord(11, lagnaSign);
    const d10Lord = getHouseLord(10, lagnaSign);
    const d2House = getGrahaHouse(d2Lord, grahas, lagnaSign);
    const d11House = getGrahaHouse(d11Lord, grahas, lagnaSign);
    const d10House = getGrahaHouse(d10Lord, grahas, lagnaSign);
    const d2Str = getStrengthDesc(d2Lord, grahas);
    const d11Str = getStrengthDesc(d11Lord, grahas);

    const mahaName = currentMaha ? currentMaha.lord.name : '—';
    const antarName = currentAntar ? currentAntar.lord.name : '—';
    const pratyName = currentPratyantar ? currentPratyantar.lord.name : '—';

    // Determine financial strength
    const goodHouses = [1,2,5,9,10,11];
    const badHouses = [6,8,12];
    const d2Good = goodHouses.includes(d2House);
    const d11Good = goodHouses.includes(d11House);
    const overallGood = d2Good && d11Good;

    // Dasha analysis for finance
    const financeGrahas = ['Ju','Ve','Mo','Me'];
    const mahaIsFinancial = financeGrahas.includes(mahaName);
    const antarIsFinancial = financeGrahas.includes(antarName);

    let result = `<strong>💰 Financial Analysis</strong><br><br>`;

    result += `<strong>Your Natal Financial Strengths:</strong><br>`;
    result += `• 2nd House (Dhana/Wealth) lord: <strong>${GRAHA_FULL_NAME[d2Lord]}</strong> ${d2Str} in ${d2House}th house (${HOUSE_NATURE[d2House]})<br>`;
    result += `• 11th House (Labha/Income) lord: <strong>${GRAHA_FULL_NAME[d11Lord]}</strong> ${d11Str} in ${d11House}th house (${HOUSE_NATURE[d11House]})<br>`;
    result += `• 10th House (Career/Earnings) lord: <strong>${GRAHA_FULL_NAME[d10Lord]}</strong> in ${d10House}th house<br><br>`;

    result += `<strong>Current Dasha Period:</strong><br>`;
    result += `• Mahadasha: <strong>${mahaName}</strong> ${currentMaha ? `(until ${fmtDate(currentMaha.end)})` : ''}<br>`;
    result += `• Antardasha: <strong>${antarName}</strong> ${currentAntar ? `(until ${fmtDate(currentAntar.end)})` : ''}<br>`;
    if (currentPratyantar) result += `• Pratyantardasha: <strong>${pratyName}</strong> (until ${fmtDate(currentPratyantar.end)})<br>`;
    result += `<br>`;

    result += `<strong>5-Year Financial Forecast:</strong><br>`;
    if (d11Good && d2Good) {
        result += `✅ Your natal chart shows <strong>strong financial indicators</strong>. Both the 2nd and 11th house lords are well-placed. `;
    } else if (d11Good || d2Good) {
        result += `⚡ Your chart shows <strong>moderate financial prospects</strong>. Income potential is good but savings need attention. `;
    } else {
        result += `⚠️ Your chart indicates <strong>financial challenges</strong> requiring effort and discipline. `;
    }

    if (mahaIsFinancial) {
        result += `The ongoing <strong>${mahaName} Mahadasha</strong> is favorable for financial growth — ${mahaName === 'Ju' ? 'Jupiter brings expansion, wisdom-based gains, and prosperity' : mahaName === 'Ve' ? 'Venus brings luxury, comfort, and artistic/material gains' : mahaName === 'Mo' ? 'Moon brings fluctuating but often positive liquid income' : 'Mercury brings business, trade, and communication-based income'}.<br><br>`;
    } else if (['Sa','Ra'].includes(mahaName)) {
        result += `The ongoing <strong>${mahaName} Mahadasha</strong> requires patience — gains come through hard work and perseverance rather than quick windfalls. Avoid speculation and risky investments.<br><br>`;
    } else {
        result += `<br>`;
    }

    // Year-by-year if we have upcoming dashas
    result += `<strong>Period-wise Outlook:</strong><br>`;
    if (currentMaha) {
        const upcoming = data.antardashas || [];
        upcoming.slice(0,5).forEach(a => {
            const aGood = financeGrahas.includes(a.lord.name);
            const aIcon = aGood ? '✅' : ['Sa','Ra','Ke','Ma'].includes(a.lord.name) ? '⚠️' : '🔶';
            result += `${aIcon} <strong>${mahaName}–${a.lord.name}</strong> (${fmtDate(a.start)} → ${fmtDate(a.end)}): `;
            if (a.lord.name === 'Ju') result += 'Excellent for investments, savings, and financial expansion.<br>';
            else if (a.lord.name === 'Ve') result += 'Good for income from business, property, or luxury goods.<br>';
            else if (a.lord.name === 'Mo') result += 'Moderate gains; avoid emotional financial decisions.<br>';
            else if (a.lord.name === 'Me') result += 'Good for trade, communication-based income, and commerce.<br>';
            else if (a.lord.name === 'Su') result += 'Government-related income, promotions possible.<br>';
            else if (a.lord.name === 'Ma') result += 'Cautious period — avoid impulsive spending; real estate gains possible.<br>';
            else if (a.lord.name === 'Sa') result += 'Slow but steady growth; disciplined savings give long-term results.<br>';
            else if (a.lord.name === 'Ra') result += 'Unconventional income sources; foreign gains possible but be wary of speculation.<br>';
            else if (a.lord.name === 'Ke') result += 'Detachment from materialism; focus on inner growth over wealth accumulation.<br>';
        });
    }

    result += `<br><strong>🪬 Remedies for Financial Prosperity:</strong><br>`;
    if (!overallGood || !mahaIsFinancial) {
        result += `• Recite <strong>Sri Suktam</strong> or <strong>Kubera Mantra</strong> ("Om Shreem Hreem Kleem Shreem Kleem Vitteshvaraya Namaha") on Fridays.<br>`;
        result += `• Light a ghee lamp facing East every Friday morning.<br>`;
        result += `• Donate yellow items (turmeric, yellow cloth) on Thursdays for Jupiter's blessings.<br>`;
        result += `• Keep a <strong>Sri Yantra</strong> in the prayer room or office for Lakshmi's grace.<br>`;
        result += `• Remedy period: Perform Lakshmi Puja on every Purnima (Full Moon) for 3 months.`;
    } else {
        result += `• Your chart is naturally strong for finances. Continue <strong>Sandhyavandanam</strong> daily to maintain planetary blessings.<br>`;
        result += `• Donate 1/10th of income to charitable causes — this activates the 11th house further.<br>`;
        result += `• Wear a <strong>Yellow Sapphire</strong> (Guru ratna) if Jupiter is strong in your chart for enhanced prosperity.`;
    }
    return result;
}

function analyzeCareer(data) {
    const { grahas, lagnaSign, currentMaha, currentAntar } = data;
    const d10Lord = getHouseLord(10, lagnaSign);
    const d6Lord = getHouseLord(6, lagnaSign);
    const d10House = getGrahaHouse(d10Lord, grahas, lagnaSign);
    const d10Str = getStrengthDesc(d10Lord, grahas);
    const saHouse = getGrahaHouse('Sa', grahas, lagnaSign);
    const suHouse = getGrahaHouse('Su', grahas, lagnaSign);
    const mahaName = currentMaha ? currentMaha.lord.name : '—';
    const antarName = currentAntar ? currentAntar.lord.name : '—';

    let result = `<strong>💼 Career & Profession Analysis</strong><br><br>`;
    result += `<strong>Career Indicators:</strong><br>`;
    result += `• 10th House lord: <strong>${GRAHA_FULL_NAME[d10Lord]}</strong> ${d10Str} in ${d10House}th house<br>`;
    result += `• Shani (Saturn, career karaka) in ${saHouse}th house<br>`;
    result += `• Surya (Sun, authority karaka) in ${suHouse}th house<br><br>`;

    result += `<strong>Current Dasha Influence on Career:</strong><br>`;
    result += `• Running: <strong>${mahaName}–${antarName}</strong> period<br>`;

    const careerDashas = { Su:'authority, government, leadership roles', Ju:'teaching, advisory, management expansion',
        Sa:'steady discipline, technical/blue-collar growth', Me:'communication, IT, finance, trade',
        Ma:'engineering, real estate, military, surgery', Ve:'arts, luxury, diplomacy, design',
        Mo:'public work, travel, hospitality, nursing', Ra:'foreign work, technology, unconventional careers',
        Ke:'spiritual work, research, isolation-based professions' };

    result += `<br>The <strong>${mahaName} Mahadasha</strong> favors: ${careerDashas[mahaName] || 'general growth'}.<br>`;
    result += `The <strong>${antarName} Antardasha</strong> will bring opportunities related to: ${careerDashas[antarName] || 'steady progress'}.<br><br>`;

    const goodCareerHouses = [1,2,10,11];
    if (goodCareerHouses.includes(d10House)) {
        result += `✅ Your 10th lord is well-placed, indicating <strong>good professional standing</strong> and recognition in your field. Career growth in next 2 years is <strong>positive</strong>.<br>`;
    } else if ([6,12].includes(d10House)) {
        result += `⚠️ 10th lord in ${d10House}th house suggests <strong>service-oriented careers</strong> (medicine, law, foreign employment) with challenges that require extra effort for recognition.<br>`;
    } else {
        result += `🔶 Moderate career growth expected. Focus on skill development and networking during ${antarName} period.<br>`;
    }

    result += `<br><strong>🪬 Career Remedies:</strong><br>`;
    result += `• Chant <strong>Aditya Hridayam</strong> every Sunday morning for professional recognition.<br>`;
    result += `• For Saturn (career discipline): Light sesame oil lamp on Saturdays and recite <strong>Shani Stotram</strong>.<br>`;
    result += `• Remedy period: Perform Surya Namaskar (12 rounds) daily for 40 days before a job change or promotion attempt.`;
    return result;
}

function analyzeHealth(data) {
    const { grahas, lagnaSign, currentMaha } = data;
    const lagnaLord = getHouseLord(1, lagnaSign);
    const d6Lord = getHouseLord(6, lagnaSign);
    const d8Lord = getHouseLord(8, lagnaSign);
    const lagnaLordHouse = getGrahaHouse(lagnaLord, grahas, lagnaSign);
    const moHouse = getGrahaHouse('Mo', grahas, lagnaSign);
    const mahaName = currentMaha ? currentMaha.lord.name : '—';
    const LAGNA_NAMES = ['Mesha','Vrishabha','Mithuna','Kataka','Simha','Kanya','Tula','Vruschika','Dhanus','Makara','Kumbha','Meena'];

    let result = `<strong>❤️ Health & Wellbeing Analysis</strong><br><br>`;
    result += `<strong>Key Health Indicators:</strong><br>`;
    result += `• Lagna (${LAGNA_NAMES[lagnaSign]}): Constitution and overall vitality<br>`;
    result += `• Lagna lord (${GRAHA_FULL_NAME[lagnaLord]}) in ${lagnaLordHouse}th house<br>`;
    result += `• Moon (mind/emotions) in ${moHouse}th house<br><br>`;

    const healthAreas = {
        0:'head, brain, eyes', 1:'throat, neck, thyroid', 2:'shoulders, arms, lungs',
        3:'chest, stomach, breasts', 4:'heart, spine, back', 5:'digestive system, intestines',
        6:'kidneys, lower back', 7:'reproductive system, bladder', 8:'thighs, hips, liver',
        9:'knees, joints, bones', 10:'ankles, circulatory system', 11:'feet, lymphatic system'
    };
    result += `• Watch health area based on Lagna (${LAGNA_NAMES[lagnaSign]}): <strong>${healthAreas[lagnaSign]}</strong><br><br>`;

    const mahaHealth = { Sa:'joints, bones, chronic conditions (patience needed)',
        Ra:'mysterious ailments, skin, neurological (get proper diagnosis)',
        Ke:'infections, sudden illness, spiritual health important',
        Ma:'injuries, inflammation, blood pressure',
        Su:'eyes, heart, vitality',
        Mo:'mind, emotions, fluid balance',
        Ju:'liver, weight, expansion-related',
        Ve:'kidney, reproductive health, sugar',
        Me:'nervous system, respiratory, skin' };

    result += `<strong>Current Period Health Notes:</strong><br>`;
    result += `During <strong>${mahaName} Mahadasha</strong>, watch: ${mahaHealth[mahaName] || 'general health'}.<br><br>`;

    if ([6,8,12].includes(lagnaLordHouse)) {
        result += `⚠️ Lagna lord in ${lagnaLordHouse}th house: Take care of your health proactively. Regular medical check-ups recommended.<br>`;
    } else {
        result += `✅ Lagna lord is well-placed indicating <strong>generally good health</strong> and strong recovery capacity.<br>`;
    }

    result += `<br><strong>🪬 Health Remedies:</strong><br>`;
    result += `• Recite <strong>Maha Mrityunjaya Mantra</strong> ("Om Tryambakam Yajamahe...") 108 times daily for vitality.<br>`;
    result += `• Practice <strong>Pranayama</strong> (alternate nostril breathing) every morning for 15 minutes.<br>`;
    result += `• Fast on the weekday ruled by your 6th lord for disease prevention.<br>`;
    result += `• Remedy period: Perform Dhanvantari Puja on Dhanvantari Trayodashi (Dhanteras) for health blessings.`;
    return result;
}

function analyzeMarriage(data) {
    const { grahas, lagnaSign, currentMaha, currentAntar } = data;
    const d7Lord = getHouseLord(7, lagnaSign);
    const d7House = getGrahaHouse(d7Lord, grahas, lagnaSign);
    const d7Str = getStrengthDesc(d7Lord, grahas);
    const veHouse = getGrahaHouse('Ve', grahas, lagnaSign);
    const juHouse = getGrahaHouse('Ju', grahas, lagnaSign);
    const maHouse = getGrahaHouse('Ma', grahas, lagnaSign);
    const mahaName = currentMaha ? currentMaha.lord.name : '—';
    const antarName = currentAntar ? currentAntar.lord.name : '—';

    // Kuja dosha
    const kujaHouses = [1,2,4,7,8,12];
    const isKujaDosha = kujaHouses.includes(maHouse);

    let result = `<strong>💑 Marriage & Relationships Analysis</strong><br><br>`;
    result += `<strong>Marriage Indicators:</strong><br>`;
    result += `• 7th House lord: <strong>${GRAHA_FULL_NAME[d7Lord]}</strong> ${d7Str} in ${d7House}th house<br>`;
    result += `• Shukra (Venus, relationship karaka) in ${veHouse}th house<br>`;
    result += `• Guru (Jupiter, spouse significator) in ${juHouse}th house<br>`;
    result += `• Mangal in ${maHouse}th house ${isKujaDosha ? '— ⚠️ Kuja Dosha present' : '— ✅ No Kuja Dosha'}<br><br>`;

    const goodMarriageHouses = [1,2,4,7,9,11];
    if (goodMarriageHouses.includes(d7House) && goodMarriageHouses.includes(veHouse)) {
        result += `✅ Strong marriage indicators — a <strong>harmonious and lasting relationship</strong> is indicated. Good compatibility and mutual understanding.<br><br>`;
    } else if ([6,8,12].includes(d7House)) {
        result += `⚡ 7th lord in ${d7House}th house: Marriage may come with <strong>delays or challenges</strong>. Requires patience and understanding from both partners.<br><br>`;
    } else {
        result += `🔶 Moderate marriage indicators. Relationship will develop steadily with mutual effort.<br><br>`;
    }

    result += `<strong>Favorable Marriage Periods:</strong><br>`;
    const marriageDashas = ['Ju','Ve','Mo'];
    if (marriageDashas.includes(mahaName) || marriageDashas.includes(antarName)) {
        result += `✅ Current ${mahaName}–${antarName} period is <strong>favorable for marriage events</strong> and relationship development.<br>`;
    } else {
        result += `🔶 Current period is not the strongest for marriage events. Look forward to upcoming Venus or Jupiter sub-periods.<br>`;
    }

    if (currentAntar) {
        const upcoming = data.antardashas || [];
        const goodPeriods = upcoming.filter(a => marriageDashas.includes(a.lord.name));
        if (goodPeriods.length > 0) {
            result += `<br>Upcoming favorable periods:<br>`;
            goodPeriods.slice(0,3).forEach(p => {
                result += `• <strong>${mahaName}–${p.lord.name}</strong>: ${fmtDate(p.start)} to ${fmtDate(p.end)}<br>`;
            });
        }
    }

    result += `<br><strong>🪬 Marriage Remedies:</strong><br>`;
    if (isKujaDosha) {
        result += `• ⚠️ Kuja Dosha present — match charts carefully; partner should have equal or cancelling Kuja status.<br>`;
        result += `• Perform <strong>Kuja Shanti Puja</strong> at Vaitheeswaran Koil or recite Mangala Kavacham on Tuesdays.<br>`;
    }
    result += `• Recite <strong>Kanakadhara Stotram</strong> on Fridays for Venus blessings in relationships.<br>`;
    result += `• Offer white flowers to Goddess Parvati on Mondays for harmonious marriage.<br>`;
    result += `• Remedy period: Perform Gauri Shankar Puja on 3 consecutive Mondays for happy married life.`;
    return result;
}

function analyzeTravel(data) {
    const { grahas, lagnaSign, currentMaha } = data;
    const d9Lord = getHouseLord(9, lagnaSign);
    const d12Lord = getHouseLord(12, lagnaSign);
    const raHouse = getGrahaHouse('Ra', grahas, lagnaSign);
    const d12House = getGrahaHouse(d12Lord, grahas, lagnaSign);
    const mahaName = currentMaha ? currentMaha.lord.name : '—';

    let result = `<strong>✈️ Travel & Foreign Settlement Analysis</strong><br><br>`;
    result += `• 9th House lord (long journeys): ${GRAHA_FULL_NAME[d9Lord]} in ${getGrahaHouse(d9Lord, grahas, lagnaSign)}th house<br>`;
    result += `• 12th House lord (foreign lands): ${GRAHA_FULL_NAME[d12Lord]} in ${d12House}th house<br>`;
    result += `• Rahu (foreign travel significator) in ${raHouse}th house<br><br>`;

    const travelIndicators = raHouse === 9 || raHouse === 12 || raHouse === 7 || [1,9,12].includes(d12House);
    if (travelIndicators) {
        result += `✅ Strong foreign travel and settlement indicators in your chart. Rahu in ${raHouse}th house indicates <strong>excellent prospects for foreign lands</strong>, especially during Rahu Mahadasha/Antardasha.<br><br>`;
    } else {
        result += `🔶 Moderate travel prospects. Local and domestic travel is more prominent. Foreign travel is possible but not the primary theme.<br><br>`;
    }

    result += `<strong>Favorable Travel Periods:</strong><br>`;
    result += `• Rahu Mahadasha/Antardasha periods are <strong>best for foreign travel and settlement</strong>.<br>`;
    result += `• Jupiter sub-periods bring <strong>spiritual journeys and pilgrimages</strong>.<br>`;
    result += `• Saturn periods bring <strong>work-related relocation</strong>.<br><br>`;

    result += `<strong>🪬 Travel Remedies:</strong><br>`;
    result += `• Recite <strong>Rahu Beeja Mantra</strong> ("Om Raam Rahave Namaha") 108 times before long journeys.<br>`;
    result += `• Offer coconut to Ganesha before any important trip.<br>`;
    result += `• Carry a <strong>Gomed (Hessonite)</strong> stone during foreign travel for Rahu's protection.<br>`;
    result += `• Remedy period: Perform Navagraha Shanti before settling in a new country.`;
    return result;
}

function analyzeChildren(data) {
    const { grahas, lagnaSign, currentMaha } = data;
    const d5Lord = getHouseLord(5, lagnaSign);
    const d5House = getGrahaHouse(d5Lord, grahas, lagnaSign);
    const d5Str = getStrengthDesc(d5Lord, grahas);
    const juHouse = getGrahaHouse('Ju', grahas, lagnaSign);
    const mahaName = currentMaha ? currentMaha.lord.name : '—';

    let result = `<strong>👨‍👩‍👧 Children & Family Life Analysis</strong><br><br>`;
    result += `• 5th House lord (children/progeny): <strong>${GRAHA_FULL_NAME[d5Lord]}</strong> ${d5Str} in ${d5House}th house<br>`;
    result += `• Guru (Jupiter, children karaka) in ${juHouse}th house<br><br>`;

    const goodChildHouses = [1,4,5,9,10,11];
    if (goodChildHouses.includes(d5House) && goodChildHouses.includes(juHouse)) {
        result += `✅ <strong>Excellent indicators for children</strong>. 5th lord well-placed and Jupiter strong. Blessed with good children who will bring honor to the family.<br>`;
    } else if ([6,8,12].includes(d5House)) {
        result += `⚡ 5th lord in ${d5House}th house: May face some <strong>delays or challenges</strong> in having children. Medical consultation recommended if delayed beyond expected timeframe.<br>`;
    } else {
        result += `🔶 Moderate indicators. Children are expected but timing depends on favorable dasha periods.<br>`;
    }

    result += `<br><strong>Favorable Periods for Children:</strong><br>`;
    const childDashas = ['Ju','Mo','Ve'];
    result += `• Jupiter and Moon periods are most favorable for progeny.<br>`;
    result += `• Current ${mahaName} period: ${childDashas.includes(mahaName) ? '✅ Favorable for family expansion' : '🔶 Not the primary period for children events'}<br><br>`;

    result += `<strong>🪬 Remedies for Progeny Blessings:</strong><br>`;
    result += `• Recite <strong>Santana Gopala Mantra</strong> ("Om Devaki Suta Govinda...") daily for blessed progeny.<br>`;
    result += `• Worship Lord Vishnu or Krishna on Thursdays with yellow flowers.<br>`;
    result += `• Donate yellow food items (yellow lentils, turmeric rice) to Brahmins on Ekadashi.<br>`;
    result += `• Remedy period: Perform Putra Kameshti Yagna or Santana Gopala Homam on a Thursday during Jupiter's sub-period.`;
    return result;
}

function analyzeGeneral(question, data) {
    const { grahas, lagnaSign, currentMaha, currentAntar, currentPratyantar } = data;
    const mahaName = currentMaha ? currentMaha.lord.name : '—';
    const antarName = currentAntar ? currentAntar.lord.name : '—';
    const pratyName = currentPratyantar ? currentPratyantar.lord.name : '—';
    const LAGNA_NAMES = ['Mesha','Vrishabha','Mithuna','Kataka','Simha','Kanya','Tula','Vruschika','Dhanus','Makara','Kumbha','Meena'];

    let result = `<strong>✨ Kundali Analysis</strong><br><br>`;
    result += `Your Lagna is <strong>${LAGNA_NAMES[lagnaSign]}</strong>.<br>`;
    result += `Currently running: <strong>${mahaName} – ${antarName} – ${pratyName}</strong><br><br>`;

    result += `<strong>General Life Overview:</strong><br>`;
    const overviewByDasha = {
        Ju:'This is a <strong>Jupiter Mahadasha</strong> — a period of wisdom, expansion, spiritual growth, higher education, and overall prosperity. Generally one of the most auspicious periods in life.',
        Ve:'This is a <strong>Venus Mahadasha</strong> — a period of comfort, luxury, relationships, arts, and material enjoyment. Social life flourishes.',
        Sa:'This is a <strong>Saturn Mahadasha</strong> — a period of discipline, hard work, karma, and eventual rewards. Patience is the key word. What you sow now, you reap strongly.',
        Mo:'This is a <strong>Moon Mahadasha</strong> — a period of emotional sensitivity, public dealings, travel, and mind-related experiences. Mind management is key.',
        Su:'This is a <strong>Sun Mahadasha</strong> — a period of authority, self-realization, government dealings, and vitality. Leadership opportunities arise.',
        Ma:'This is a <strong>Mars Mahadasha</strong> — a period of energy, ambition, property matters, and action. Drive and courage define this period.',
        Me:'This is a <strong>Mercury Mahadasha</strong> — a period of intellect, communication, business, and learning. Excellent for studies and trade.',
        Ra:'This is a <strong>Rahu Mahadasha</strong> — an unconventional period full of unexpected turns, foreign influences, and material ambitions. Remarkable growth possible with proper guidance.',
        Ke:'This is a <strong>Ketu Mahadasha</strong> — a period of spirituality, introspection, detachment from materialism, and mystical experiences. Inner transformation.'
    };
    result += `${overviewByDasha[mahaName] || 'Your dasha period brings mixed experiences.'}<br><br>`;

    result += `<em>For specific analysis, please ask about: Finance, Career, Health, Marriage, Travel, or Children using the quick buttons below.</em>`;
    return result;
}

/* ── Chat Interface ── */

function askKundali() {
    const input = document.getElementById('chatInput');
    const question = input.value.trim();
    if (!question) return;
    askQuick(question);
    input.value = '';
}

function askQuick(question) {
    if (!window._kundaliData) {
        addChatMsg('ai', '🙏 Please generate a Jatakam first by filling the birth details and clicking "Generate Jatakam".');
        return;
    }

    addChatMsg('user', question);

    const q = question.toLowerCase();
    let response;

    if (q.includes('financ') || q.includes('money') || q.includes('wealth') || q.includes('income') || q.includes('savings') || q.includes('invest') || q.includes('dhana') || q.includes('lakshmi')) {
        response = analyzeFinance(window._kundaliData);
    } else if (q.includes('career') || q.includes('job') || q.includes('profession') || q.includes('work') || q.includes('business') || q.includes('promotion')) {
        response = analyzeCareer(window._kundaliData);
    } else if (q.includes('health') || q.includes('disease') || q.includes('illness') || q.includes('medical') || q.includes('body') || q.includes('wellbeing')) {
        response = analyzeHealth(window._kundaliData);
    } else if (q.includes('marriage') || q.includes('wedding') || q.includes('spouse') || q.includes('partner') || q.includes('love') || q.includes('relationship') || q.includes('vivaha')) {
        response = analyzeMarriage(window._kundaliData);
    } else if (q.includes('travel') || q.includes('foreign') || q.includes('abroad') || q.includes('settle') || q.includes('immigrat') || q.includes('visa')) {
        response = analyzeTravel(window._kundaliData);
    } else if (q.includes('child') || q.includes('children') || q.includes('son') || q.includes('daughter') || q.includes('baby') || q.includes('family') || q.includes('progeny')) {
        response = analyzeChildren(window._kundaliData);
    } else {
        response = analyzeGeneral(question, window._kundaliData);
    }

    setTimeout(() => addChatMsg('ai', response), 400);
}

function addChatMsg(from, html) {
    const chat = document.getElementById('chatMessages');
    const div = document.createElement('div');
    if (from === 'user') {
        div.className = 'chat-msg-user';
        div.innerHTML = `<span>${html}</span>`;
    } else {
        div.className = 'chat-msg-ai';
        div.innerHTML = `<div class="ai-label">✦ Jyotish Analysis</div><div class="ai-bubble">${html}</div>`;
    }
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Override panchangam's window.onload
window.onload = function() {
    // Jyotishyam page — no auto-calculation needed
    document.getElementById('jyotishChatSection').style.display = 'none';
};
