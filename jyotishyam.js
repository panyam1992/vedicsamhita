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

function onBirthCityChange() {
    document.getElementById('birthCustomCoords').style.display =
        document.getElementById('birthCity').value === 'custom' ? 'block' : 'none';
}

function generateHoroscope() {
    const name = document.getElementById('birthName').value || 'Native';
    const sex = document.getElementById('birthSex').value;
    const dateStr = document.getElementById('birthDate').value;
    const timeStr = document.getElementById('birthTime').value;
    const cityKey = document.getElementById('birthCity').value;

    if (!dateStr || !timeStr) { alert('Please enter Date and Time of Birth.'); return; }

    const [yy, mm, dd] = dateStr.split('-').map(Number);
    const [hh, mi] = timeStr.split(':').map(Number);

    let lat, lon, tz, locName;
    if (cityKey === 'custom') {
        lat = parseFloat(document.getElementById('birthLat').value);
        lon = parseFloat(document.getElementById('birthLon').value);
        tz = parseFloat(document.getElementById('birthTz').value);
        locName = `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
    } else {
        const c = CITIES[cityKey];
        lat = c.lat; lon = c.lon;
        tz = isDST(yy, mm, dd, c.dst) ? c.dstTz : c.stdTz;
        locName = c.name;
    }

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
    const panchHTML = `
        <div class="pitem"><span class="plabel">Samvatsaram</span><span class="pval">${getSamvatsaram(yy, mm, jd)}</span></div>
        <div class="pitem"><span class="plabel">Masam</span><span class="pval">${getLunarCalendar(jd).masam}</span></div>
        <div class="pitem"><span class="plabel">Paksham</span><span class="pval">${getPaksham(tithiIdx)}</span></div>
        <div class="pitem"><span class="plabel">Tithi</span><span class="pval">${TITHI[tithiIdx]}</span></div>
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
    gtHTML += `<tr style="background:#f5e6c8;font-weight:600">
        <td style="color:#4a0e0e">Lagna</td>
        <td>${lagnaAtBirth.degStr}</td>
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

    // Show results
    document.getElementById('jyotishResults').style.display = 'block';
    document.getElementById('jyotishResults').scrollIntoView({ behavior: 'smooth' });
}

// Helper: format Date to readable string
function fmtDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Override panchangam's window.onload
window.onload = function() {
    // Jyotishyam page — no auto-calculation needed
};
