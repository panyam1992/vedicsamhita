/* ═══════════════════════════════════════════════════════════════
   PANYAM PANCHAN AI — Worldwide Sidereal Panchangam Engine v2
   Full Meeus Chapter 47 Lunar Model (50 terms) + NOAA Solar
   ═══════════════════════════════════════════════════════════════ */

const CITIES = {
    frisco:    { name:"Frisco / Dallas, TX, USA",  lat:33.1507,  lon:-96.8236, stdTz:-6, dstTz:-5, dst:'US' },
    newyork:   { name:"New York, NY, USA",         lat:40.7128,  lon:-74.0060, stdTz:-5, dstTz:-4, dst:'US' },
    losangeles:{ name:"Los Angeles, CA, USA",       lat:34.0522,  lon:-118.2437,stdTz:-8, dstTz:-7, dst:'US' },
    chicago:   { name:"Chicago, IL, USA",           lat:41.8781,  lon:-87.6298, stdTz:-6, dstTz:-5, dst:'US' },
    // ── Canada ──
    toronto:   { name:"Toronto, ON, Canada",        lat:43.6532,  lon:-79.3832, stdTz:-5, dstTz:-4, dst:'US' },
    montreal:  { name:"Montreal, QC, Canada",       lat:45.5017,  lon:-73.5673, stdTz:-5, dstTz:-4, dst:'US' },
    vancouver: { name:"Vancouver, BC, Canada",      lat:49.2827,  lon:-123.1207,stdTz:-8, dstTz:-7, dst:'US' },
    calgary:   { name:"Calgary, AB, Canada",        lat:51.0447,  lon:-114.0719,stdTz:-7, dstTz:-6, dst:'US' },
    edmonton:  { name:"Edmonton, AB, Canada",       lat:53.5461,  lon:-113.4938,stdTz:-7, dstTz:-6, dst:'US' },
    ottawa:    { name:"Ottawa, ON, Canada",         lat:45.4215,  lon:-75.6972, stdTz:-5, dstTz:-4, dst:'US' },
    winnipeg:  { name:"Winnipeg, MB, Canada",       lat:49.8951,  lon:-97.1384, stdTz:-6, dstTz:-5, dst:'US' },
    halifax:   { name:"Halifax, NS, Canada",        lat:44.6488,  lon:-63.5752, stdTz:-4, dstTz:-3, dst:'US' },
    victoria:  { name:"Victoria, BC, Canada",       lat:48.4284,  lon:-123.3656,stdTz:-8, dstTz:-7, dst:'US' },
    saskatoon: { name:"Saskatoon, SK, Canada",      lat:52.1579,  lon:-106.6702,stdTz:-6, dstTz:-6, dst:'none' },
    regina:    { name:"Regina, SK, Canada",         lat:50.4452,  lon:-104.6189,stdTz:-6, dstTz:-6, dst:'none' },
    stjohns:   { name:"St. John's, NL, Canada",    lat:47.5615,  lon:-52.7126, stdTz:-3.5,dstTz:-2.5,dst:'US' },
    // ── International ──
    london:    { name:"London, UK",                lat:51.5074,  lon:-0.1278,  stdTz:0,  dstTz:1,  dst:'UK' },
    delhi:     { name:"New Delhi, India",          lat:28.6139,  lon:77.2090,  stdTz:5.5,dstTz:5.5,dst:'none' },
    hyderabad: { name:"Hyderabad, India",          lat:17.3850,  lon:78.4867,  stdTz:5.5,dstTz:5.5,dst:'none' },
    chennai:   { name:"Chennai, India",            lat:13.0827,  lon:80.2707,  stdTz:5.5,dstTz:5.5,dst:'none' },
    mumbai:    { name:"Mumbai, India",             lat:19.0760,  lon:72.8777,  stdTz:5.5,dstTz:5.5,dst:'none' },
    bangalore: { name:"Bangalore, India",          lat:12.9716,  lon:77.5946,  stdTz:5.5,dstTz:5.5,dst:'none' },
    tokyo:     { name:"Tokyo, Japan",              lat:35.6762,  lon:139.6503, stdTz:9,  dstTz:9,  dst:'none' },
    sydney:    { name:"Sydney, Australia",         lat:-33.8688, lon:151.2093, stdTz:10, dstTz:11, dst:'AU' },
    // ── Europe ──
    aarhus:    { name:"Aarhus, Denmark",           lat:56.2639,  lon:9.5018,   stdTz:1,  dstTz:2,  dst:'UK' },
};

const SAMVATSARAM = [
    "Prabhava","Vibhava","Sukla","Pramodyuta","Prajothpatthi","Angirasa","Srimukha","Bhava","Yuva","Dhatha",
    "Eeswara","Bahudhanya","Pramadi","Vikrama","Vrusha","Chitrabhanu","Svabhanu","Tharana","Parthiva","Vyaya",
    "Sarvajitthu","Sarvadhari","Virodhi","Vikruthi","Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi",
    "Hevilambi","Vilambi","Vikari","Sarvari","Plava","Subhakruthu","Sobhakruthu","Krodhi","Visvavasu","Parabhava",
    "Plavanga","Kilaka","Saumya","Sadharana","Virodhikruth","Paridhavi","Pramadicha","Ananda","Rakshasa","Nala",
    "Pingala","Kalayukthi","Siddharthi","Raudri","Durmathi","Dundubhi","Rudhirodgari","Rakthaksha","Krodhana","Akshaya"
];
const TITHI = [
    "Shukla Padyami","Shukla Vidiya","Shukla Thadiya","Shukla Chavithi","Shukla Panchami",
    "Shukla Shashthi","Shukla Saptami","Shukla Ashtami","Shukla Navami","Shukla Dashami",
    "Shukla Ekadashi","Shukla Dwadashi","Shukla Trayodashi","Shukla Chaturdashi","Pournami",
    "Krishna Padyami","Krishna Vidiya","Krishna Thadiya","Krishna Chavithi","Krishna Panchami",
    "Krishna Shashthi","Krishna Saptami","Krishna Ashtami","Krishna Navami","Krishna Dashami",
    "Krishna Ekadashi","Krishna Dwadashi","Krishna Trayodashi","Krishna Chaturdashi","Amavasya"
];
const NAKSHATRA = [
    "Aswini","Bharani","Kriththika","Rohini","Mrigasira","Arudra","Punarvasu","Pushyami","Ashlesha",
    "Makha","Pubba","Uththara","Hastha","Chiththa","Swathi","Visakha","Anuradha","Jyestha",
    "Moola","Poorvashadha","Uttharashadha","Sravanamu","Dhanishta","Shathabhisha","Poorvabhadra","Uttharabhadra","Revathi"
];
const YOGA = [
    "Vishkambha","Priti","Ayushmana","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula",
    "Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana",
    "Paridha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Aindra","Vaidhriti"
];
const VARA = ["Bhanu Vasaram (Sunday)","Indu Vasaram (Monday)","Bhouma Vasaram (Tuesday)","Soumya Vasaram (Wednesday)",
              "Bruhaspati Vasaram (Thursday)","Bhrugu Vasaram (Friday)","Sthira Vasaram (Saturday)"];
const MASAM = ["Chaithramu","Vaisakhamu","Jyesthamu","Ashadhamu","Sravanamu","Bhadhrapadamu",
               "Asvayujamu","Karthikamu","Margasiramu","Pushyamu","Maghamu","Phalgunamu"];
const RUTU = ["Vasanta Rutu","Vasanta Rutu","Grishma Rutu","Grishma Rutu","Varsha Rutu","Varsha Rutu",
              "Sharad Rutu","Sharad Rutu","Hemanta Rutu","Hemanta Rutu","Shishira Rutu","Shishira Rutu"];
const RASHI = ["Mesham","Vrushabham","Mithunam","Karkatakam","Simham","Kanya","Tula","Vruschikam","Dhanussu","Makaram","Kumbham","Meenam"];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const RAHU_PARTS     = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_PARTS= [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PARTS   = [7, 6, 5, 4, 3, 2, 1];
// Durmuhuratam: positive = daytime muhurta (1-15), negative = nighttime muhurta (1-15)
// Sun:14th | Mon:9th,12th | Tue:4th day + 7th night | Wed:8th | Thu:6th,12th | Fri:4th,9th | Sat:3rd
const DURMUHURAT = [[14],[9,12],[4,-7],[8],[6,12],[4,9],[3]];
const VARJYAM_GHATI = [50,24,30,40,14,21,30,20,32, 30,20,18,21,20,14,14,10,14, 20,24,20,10,10,18,16,24,30];
const AMRIT_GHATI   = [2,50,4,16,40,47,6,36,8, 6,36,34,17,36,10,37,46,10, 36,32,36,46,46,38,40,32,6];

/*  ════════════════════════════════════════════════
    Meeus Chapter 47 — Full Lunar Longitude Model
    Each term: [D_mult, M_mult, Mprime_mult, F_mult, coefficient_degrees]
    Terms involving M are scaled by E factor at runtime.
    ════════════════════════════════════════════════ */
const MOON_L_TERMS = [
    [0,0,1,0,  6.288774],  [2,0,-1,0, 1.274027],  [2,0,0,0,  0.658314],
    [0,0,2,0,  0.213618],  [0,1,0,0, -0.185116],  [0,0,0,2, -0.114332],
    [2,0,-2,0, 0.058793],  [2,-1,-1,0,0.057066],  [2,0,1,0,  0.053322],
    [2,-1,0,0, 0.045758],  [0,1,-1,0,-0.040923],  [1,0,0,0, -0.034720],
    [0,1,1,0, -0.030383],  [2,0,0,-2, 0.015327],  [0,0,1,2, -0.012528],
    [0,0,1,-2, 0.010980],  [4,0,-1,0, 0.010675],  [0,0,3,0,  0.010034],
    [4,0,-2,0, 0.008548],  [2,1,-1,0,-0.007888],  [2,1,0,0, -0.006766],
    [1,0,-1,0,-0.005163],  [1,1,0,0,  0.004987],  [2,-1,1,0, 0.004036],
    [2,0,2,0,  0.003994],  [4,0,0,0,  0.003861],  [2,0,-3,0, 0.003665],
    [0,1,-2,0,-0.002689],  [2,0,-1,2,-0.002602],  [2,-1,-2,0,0.002390],
    [1,0,1,0, -0.002348],  [2,-2,0,0, 0.002236],  [0,1,2,0, -0.002120],
    [0,2,0,0, -0.002069],  [2,-2,-1,0,0.002048],  [2,0,1,-2,-0.001773],
    [2,0,0,2, -0.001595],  [4,-1,-1,0,0.001215],  [0,0,2,2, -0.001110],
    [3,0,-1,0,-0.000892],  [2,1,1,0, -0.000810],  [4,-1,-2,0,0.000759],
    [0,2,-1,0,-0.000713],  [2,2,-1,0,-0.000700],  [2,1,-2,0, 0.000691],
    [2,-1,0,-2,0.000596],  [4,0,1,0,  0.000549],  [0,0,4,0,  0.000537],
    [4,-1,0,0, 0.000520],  [1,0,-2,0,-0.000487],
];

/*  Moon Ecliptic Latitude Terms — Meeus Table 47.B (top 20)
    Each: [D, M, M', F, coefficient_degrees]                */
const MOON_B_TERMS = [
    [0,0,0,1,  5.128122],  [0,0,1,1,  0.280602],  [0,0,1,-1, 0.277693],
    [2,0,0,-1, 0.173237],  [2,0,-1,1, 0.055413],  [2,0,-1,-1,0.046271],
    [2,0,0,1,  0.032573],  [0,0,2,1,  0.017198],  [2,0,1,-1, 0.009266],
    [0,0,2,-1, 0.008822],  [2,-1,0,-1,0.008216],  [2,0,-2,-1,0.004324],
    [2,0,1,1,  0.004200],  [2,1,0,-1,-0.003359],  [2,-1,-1,1,0.002463],
    [2,-1,0,1, 0.002211],  [2,-1,-1,-1,0.002065], [0,1,-1,-1,-0.001870],
    [4,0,-1,-1,0.001828],  [0,1,0,1, -0.001794],
];

function getDayOfYear(y, m, d) {
    return Math.floor((new Date(y, m-1, d) - new Date(y, 0, 1)) / 86400000) + 1;
}
function dateToJD(y, m, d) {
    if (m <= 2) { y--; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function localToJD(y, m, d, localHrs, tz) { return dateToJD(y, m, d) + (localHrs - tz) / 24; }

function jdToLocal(jd, tz) {
    const localJD = jd + tz / 24;
    const z = Math.floor(localJD + 0.5);
    const f = (localJD + 0.5) - z;
    let A;
    if (z < 2299161) A = z;
    else { const al = Math.floor((z - 1867216.25) / 36524.25); A = z + 1 + al - Math.floor(al / 4); }
    const B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    const tH = f * 24; const hrs = Math.floor(tH);
    const tM = (tH - hrs) * 60; const mins = Math.floor(tM);
    const secs = Math.floor((tM - mins) * 60);
    return { year, month, day, hours: hrs, minutes: mins, seconds: secs };
}

function fmtHMS(decHrs) {
    decHrs = ((decHrs % 24) + 24) % 24;
    const h = Math.floor(decHrs), rm = (decHrs - h) * 60, m = Math.floor(rm), s = Math.floor((rm - m) * 60);
    const ap = h >= 12 ? 'PM' : 'AM'; let h12 = h % 12; if (!h12) h12 = 12;
    return `${h12}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ap}`;
}
function fmtDateTime(o) {
    const ap = o.hours >= 12 ? 'PM' : 'AM'; let h = o.hours % 12; if (!h) h = 12;
    return `${MONTH_ABBR[o.month-1]} ${o.day}, ${o.year} ${h}:${String(o.minutes).padStart(2,'0')}:${String(o.seconds).padStart(2,'0')} ${ap}`;
}
function fmtRange(h1, h2) { return `${fmtHMS(h1)} — ${fmtHMS(h2)}`; }


/* ═══════════ DST DETECTION ═══════════ */

function getNthSunday(y, m, n) {
    let d = new Date(y, m - 1, 1); let first = d.getDay();
    let firstSun = first === 0 ? 1 : 8 - first;
    return firstSun + (n - 1) * 7;
}
function getLastSunday(y, m) { let d = new Date(y, m, 0); return d.getDate() - d.getDay(); }

function isDST(y, m, d, rule) {
    if (rule === 'none') return false;
    const dt = new Date(y, m - 1, d).getTime();
    if (rule === 'US') {
        return dt >= new Date(y, 2, getNthSunday(y, 3, 2)).getTime() &&
               dt < new Date(y, 10, getNthSunday(y, 11, 1)).getTime();
    }
    if (rule === 'UK') {
        return dt >= new Date(y, 2, getLastSunday(y, 3)).getTime() &&
               dt < new Date(y, 9, getLastSunday(y, 10)).getTime();
    }
    if (rule === 'AU') {
        const octStart = new Date(y, 9, getNthSunday(y, 10, 1)).getTime();
        const aprEnd   = new Date(y, 3, getNthSunday(y, 4, 1)).getTime();
        return dt >= octStart || dt < aprEnd;
    }
    return false;
}


/* ═══════════════════════════════════════════════
   ASTRONOMICAL CALCULATIONS  — Meeus Algorithms
   ═══════════════════════════════════════════════ */

function getAyanamsa(jd) {
    const yrsSince2000 = (jd - 2451545.0) / 365.25;
    return 23.853 + yrsSince2000 * 50.29 / 3600;
}

/* ── Sun's Tropical & Nirayana Longitude (Meeus Ch. 25) ── */
function getSunTropical(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
    if (L0 < 0) L0 += 360;
    const M = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360) * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
            + (0.019993 - 0.000101 * T) * Math.sin(2*M)
            + 0.000289 * Math.sin(3*M);
    let sunT = (L0 + C) % 360;
    if (sunT < 0) sunT += 360;
    return sunT;
}
function getSunNirayana(jd) {
    return ((getSunTropical(jd) - getAyanamsa(jd)) % 360 + 360) % 360;
}

/* ── Moon's Tropical Longitude (Meeus Ch. 47, 50 terms) ── */
function getMoonTropical(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const T2 = T * T;

    // Fundamental arguments (degrees)
    const Lp_deg = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2;
    const D_deg  = 297.8501921 + 445267.1114034  * T - 0.0018819 * T2;
    const M_deg  = 357.5291092 + 35999.0502909   * T - 0.0001536 * T2;
    const Mp_deg = 134.9633964 + 477198.8675055  * T + 0.0087414  * T2;
    const F_deg  = 93.2720950  + 483202.0175233  * T - 0.0036539  * T2;

    // Convert to radians for trig
    const D  = D_deg  * Math.PI / 180;
    const M  = M_deg  * Math.PI / 180;
    const Mp = Mp_deg * Math.PI / 180;
    const F  = F_deg  * Math.PI / 180;

    // E factor (eccentricity correction for terms involving Sun's anomaly M)
    const E  = 1 - 0.002516 * T - 0.0000074 * T2;
    const E2 = E * E;

    // Sum longitude perturbation terms
    let sumL = 0;
    for (const term of MOON_L_TERMS) {
        const [dM, mM, mpM, fM, coeff] = term;
        const angle = dM * D + mM * M + mpM * Mp + fM * F;

        // Apply E factor based on |mM| (sun anomaly multiplier)
        let eFactor = 1;
        const absM = Math.abs(mM);
        if (absM === 1) eFactor = E;
        else if (absM === 2) eFactor = E2;

        sumL += coeff * eFactor * Math.sin(angle);
    }

    // Additional corrections (Venus, Jupiter, flat Earth terms from Meeus)
    const A1 = (119.75 + 131.849 * T) * Math.PI / 180;
    const A2 = (53.09  + 479264.290 * T) * Math.PI / 180;
    const Lp_rad = Lp_deg * Math.PI / 180;
    sumL += 0.003958 * Math.sin(A1);
    sumL += 0.001962 * Math.sin(Lp_rad - F);
    sumL += 0.000318 * Math.sin(A2);

    let moonT = ((Lp_deg + sumL) % 360 + 360) % 360;
    return moonT;
}

function getMoonNirayana(jd) {
    return ((getMoonTropical(jd) - getAyanamsa(jd)) % 360 + 360) % 360;
}

/* ── Moon's Ecliptic Latitude (Meeus Ch. 47, 20 terms) ── */
function getMoonLatitude(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const T2 = T * T;
    const D  = (297.8501921 + 445267.1114034  * T - 0.0018819 * T2) * Math.PI / 180;
    const M  = (357.5291092 + 35999.0502909   * T - 0.0001536 * T2) * Math.PI / 180;
    const Mp = (134.9633964 + 477198.8675055  * T + 0.0087414  * T2) * Math.PI / 180;
    const F  = (93.2720950  + 483202.0175233  * T - 0.0036539  * T2) * Math.PI / 180;
    const E  = 1 - 0.002516 * T - 0.0000074 * T2;
    const E2 = E * E;

    let sumB = 0;
    for (const term of MOON_B_TERMS) {
        const [dM, mM, mpM, fM, coeff] = term;
        const angle = dM * D + mM * M + mpM * Mp + fM * F;
        let eFactor = 1;
        const absM = Math.abs(mM);
        if (absM === 1) eFactor = E;
        else if (absM === 2) eFactor = E2;
        sumB += coeff * eFactor * Math.sin(angle);
    }
    // Additional correction
    const A1 = (119.75 + 131.849 * T) * Math.PI / 180;
    const A3 = (313.45 + 481266.484 * T) * Math.PI / 180;
    const Lp = (218.3164477 + 481267.88123421 * T) * Math.PI / 180;
    sumB += -0.002235 * Math.sin(Lp);
    sumB += 0.000382 * Math.sin(A3);
    sumB += 0.000175 * Math.sin(A1 - F);
    sumB += 0.000175 * Math.sin(A1 + F);
    sumB += 0.000127 * Math.sin(Lp - Mp);
    sumB += -0.000115 * Math.sin(Lp + Mp);
    return sumB; // degrees
}

/* ── Moon's Declination (including ecliptic latitude) ── */
function getMoonDeclination(jd) {
    const moonLong = getMoonTropical(jd) * Math.PI / 180;
    const moonLat  = getMoonLatitude(jd)  * Math.PI / 180;
    const obliquity = 23.44 * Math.PI / 180;
    // Full spherical formula: dec = asin(sin(β)cos(ε) + cos(β)sin(ε)sin(λ))
    return Math.asin(
        Math.sin(moonLat) * Math.cos(obliquity) +
        Math.cos(moonLat) * Math.sin(obliquity) * Math.sin(moonLong)
    );
}


/* ── Element index functions ── */
function getTithiIdx(jd) {
    return Math.floor(((getMoonNirayana(jd) - getSunNirayana(jd) + 360) % 360) / 12);
}
function getNakIdx(jd) {
    return Math.floor(getMoonNirayana(jd) / (360/27));
}
function getPadamIdx(jd) {
    // Global padam index 0-107 (108 padams total)
    const moonNir = getMoonNirayana(jd);
    return Math.floor((moonNir * 60) / 200);
}

function computePadamEnd(refJD) {
    // Find when the Moon crosses the next 3°20' (200 arc-min) boundary
    // Each padam = 360/108 = 3.3333°
    const padamSpan = 360 / 108;  // 3.3333°

    const moon0 = getMoonNirayana(refJD);
    const idx0 = Math.floor(moon0 / padamSpan);
    let RD = padamSpan - (moon0 % padamSpan);
    if (RD < 0.001) RD = padamSpan;

    // Moon's daily motion (speed)
    const m0 = getMoonNirayana(refJD);
    const m1 = getMoonNirayana(refJD + 1);
    let dmc = m1 - m0; if (dmc < -180) dmc += 360; if (dmc > 180) dmc -= 360;

    let endJD = refJD + RD / dmc;

    // Iterative refinement (4 passes)
    for (let iter = 0; iter < 4; iter++) {
        const moonNow = getMoonNirayana(endJD);
        const idxNow = Math.floor(moonNow / padamSpan);
        if (idxNow === idx0) {
            // Haven't crossed yet — add remaining
            let rd = padamSpan - (moonNow % padamSpan);
            if (rd < 0.0001) rd = padamSpan;
            const sp = getMoonNirayana(endJD + 1) - getMoonNirayana(endJD);
            let spd = sp; if (spd < -180) spd += 360; if (spd > 180) spd -= 360;
            endJD += rd / spd;
        } else {
            // Overshot — pull back
            let overshoot = moonNow % padamSpan;
            if ((idxNow - idx0 + 108) % 108 >= 2) overshoot += padamSpan;
            const sp = getMoonNirayana(endJD + 1) - getMoonNirayana(endJD);
            let spd = sp; if (spd < -180) spd += 360; if (spd > 180) spd -= 360;
            endJD -= overshoot / spd;
        }
    }
    return endJD;
}

function getDayPadams(srJD, nextSrJD) {
    // Collect all padams active between sunrise and next sunrise
    const padams = [];
    let jd = srJD;

    for (let safety = 0; safety < 20 && jd < nextSrJD; safety++) {
        const moonNir = getMoonNirayana(jd);
        const arcMin = moonNir * 60;
        const globalPadam = Math.floor(arcMin / 200);
        const nakIdx = Math.floor(globalPadam / 4);
        const padamNum = (globalPadam % 4) + 1;
        const ordinal = ['1st','2nd','3rd','4th'][padamNum - 1];

        const endJD = computePadamEnd(jd);

        padams.push({
            name: NAKSHATRA[nakIdx],
            padam: ordinal,
            padamNum: padamNum,
            endJD: endJD
        });

        jd = endJD + 0.001;  // move past this padam boundary
    }
    return padams;
}
function getMoonRashi(jd) {
    const moonNir = getMoonNirayana(jd);
    const ri = Math.floor(moonNir / 30);
    return RASHI[ri];
}
function getYogaIdx(jd) {
    return Math.floor(((getSunNirayana(jd) + getMoonNirayana(jd)) % 360) / (360/27));
}
function getKaranaIdx(jd) {
    return Math.floor(((getMoonNirayana(jd) - getSunNirayana(jd) + 360) % 360) / 6);
}

function getKaranaName(ki) {
    if (ki === 0) return "Kinstughna";
    if (ki === 57) return "Shakuni";
    if (ki === 58) return "Chatushpada";
    if (ki === 59) return "Naga";
    const moving = ["Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti"];
    return moving[(ki - 1) % 7];
}


/* ═══════════ SUNRISE / SUNSET (NOAA) ═══════════ */

function computeSunTimes(y, m, d, lat, lon, tz) {
    const doy = getDayOfYear(y, m, d);
    const gamma = 2 * Math.PI / 365 * (doy - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868*Math.cos(gamma) - 0.032077*Math.sin(gamma)
                   - 0.014615*Math.cos(2*gamma) - 0.04089*Math.sin(2*gamma));
    const decl = 0.006918 - 0.399912*Math.cos(gamma) + 0.070257*Math.sin(gamma)
                 - 0.006758*Math.cos(2*gamma) + 0.000907*Math.sin(2*gamma)
                 - 0.002697*Math.cos(3*gamma) + 0.00148*Math.sin(3*gamma);
    const latR = lat * Math.PI / 180;
    const cosHA = Math.cos(90.833 * Math.PI / 180) / (Math.cos(latR)*Math.cos(decl)) - Math.tan(latR)*Math.tan(decl);
    if (cosHA > 1 || cosHA < -1) return null;
    const HA = Math.acos(cosHA) * 180 / Math.PI;
    const srUTC = 720 - 4*(lon + HA) - eqtime;
    const ssUTC = 720 - 4*(lon - HA) - eqtime;
    const nnUTC = 720 - 4*lon - eqtime;
    return {
        sunrise: (srUTC + tz*60)/60,
        sunset:  (ssUTC + tz*60)/60,
        noon:    (nnUTC + tz*60)/60
    };
}


/* ═══════════ MOONRISE / MOONSET (Altitude-Bisection, Surya Siddhanta style) ═══════════ */
/*  Modern implementation of the iterative successive approximation:
    - Compute Moon's true RA & Dec (including ecliptic latitude) at each test time
    - Compute local sidereal time → hour angle → geometric altitude
    - Bisect to find exact horizon crossing (h₀ ≈ 0.125°)
    This naturally handles the Moon's rapid ~13°/day motion.             */

function computeMoonTimes(y, m, d, lat, lon, tz) {
    const latRad = lat * Math.PI / 180;
    const h0_rad = 0.125 * Math.PI / 180;  // Moon's apparent altitude at rise/set
    const obliquity = 23.44 * Math.PI / 180;
    const DEG2RAD = Math.PI / 180;

    // JD at local midnight in UT
    const jd_local_midnight = dateToJD(y, m, d) - tz / 24;

    // Compute Moon's geometric altitude at a given local hour
    function moonAltAtLocalHour(localHrs) {
        const jd = jd_local_midnight + localHrs / 24;

        // Moon's tropical longitude & ecliptic latitude
        const moonLong = getMoonTropical(jd) * DEG2RAD;
        const moonLat  = getMoonLatitude(jd)  * DEG2RAD;

        // Moon's equatorial coordinates (RA, Dec) from ecliptic
        const sinDec = Math.sin(moonLat) * Math.cos(obliquity)
                     + Math.cos(moonLat) * Math.sin(obliquity) * Math.sin(moonLong);
        const dec = Math.asin(sinDec);
        const ra  = Math.atan2(
            Math.sin(moonLong) * Math.cos(obliquity) - Math.tan(moonLat) * Math.sin(obliquity),
            Math.cos(moonLong)
        );

        // Greenwich Mean Sidereal Time (continuous formula, Meeus Ch. 12)
        const T = (jd - 2451545.0) / 36525.0;
        const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)
                     + 0.000387933 * T * T - T * T * T / 38710000.0) * DEG2RAD;

        // Local Sidereal Time
        const lst = gmst + lon * DEG2RAD;

        // Hour angle
        const H = lst - ra;

        // Geometric altitude of Moon
        return Math.asin(
            Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(H)
        );
    }

    // Scan from 0h to 30h local in 10-minute steps to find all rise/set events
    const step = 10 / 60;  // 10 minutes in hours
    const events = [];
    let prevAlt = moonAltAtLocalHour(0);

    for (let t = step; t <= 30; t += step) {
        const curAlt = moonAltAtLocalHour(t);

        if (prevAlt < h0_rad && curAlt >= h0_rad) {
            // Rising event — bisect to find exact time
            let lo = t - step, hi = t;
            for (let i = 0; i < 40; i++) {
                const mid = (lo + hi) / 2;
                if (moonAltAtLocalHour(mid) < h0_rad) lo = mid; else hi = mid;
            }
            events.push({ type: 'rise', time: (lo + hi) / 2 });
        }

        if (prevAlt >= h0_rad && curAlt < h0_rad) {
            // Setting event — bisect to find exact time
            let lo = t - step, hi = t;
            for (let i = 0; i < 40; i++) {
                const mid = (lo + hi) / 2;
                if (moonAltAtLocalHour(mid) >= h0_rad) lo = mid; else hi = mid;
            }
            events.push({ type: 'set', time: (lo + hi) / 2 });
        }

        prevAlt = curAlt;
    }

    // Find the first moonrise within the calendar day (0–24h) and the next moonset after it
    let riseLocal = null, setLocal = null;
    for (const ev of events) {
        if (ev.type === 'rise' && riseLocal === null && ev.time < 24) {
            riseLocal = ev.time;
        }
        if (ev.type === 'set' && riseLocal !== null && setLocal === null && ev.time > riseLocal) {
            setLocal = ev.time;
        }
    }

    // Format results
    let mrStr = '—', msStr = '—';
    if (riseLocal !== null) {
        mrStr = (riseLocal >= 24)
            ? fmtHMS(riseLocal - 24) + ` ${MONTH_ABBR[new Date(y,m-1,d+1).getMonth()]} ${new Date(y,m-1,d+1).getDate()}`
            : fmtHMS(riseLocal);
    }
    if (setLocal !== null) {
        if (setLocal >= 24) {
            const nxt = new Date(y, m-1, d+1);
            msStr = fmtHMS(setLocal - 24) + ` ${MONTH_ABBR[nxt.getMonth()]} ${nxt.getDate()}`;
        } else {
            msStr = fmtHMS(setLocal);
        }
    }

    return { moonrise: mrStr, moonset: msStr };
}


/* ═══════════════════════════════════════════════════════════════════════
   PANCHANGAM ELEMENT END TIMES — Direct Formula (Surya Siddhanta Style)
   EndTime = RefTime + RemainingDistance / Speed
   with iterative refinement for the Moon's variable speed.
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Compute the JD when a panchangam element ends, using the traditional
 * direct formula: time = remaining_distance / angular_speed.
 *   type: 'tithi'(12°) | 'nakshatra'(13°20') | 'yoga'(13°20') | 'karana'(6°)
 *
 * Speed formulas (DMC = Moon daily motion, DMR = Sun daily motion):
 *   Tithi / Karana  → DMC − DMR  (relative speed, Moon-Sun separation)
 *   Nakshatra       → DMC        (Moon speed only)
 *   Yoga            → DMC + DMR  (combined speed, Moon+Sun sum)
 */
function computeElementEnd(refJD, type) {
    const span = (type === 'tithi') ? 12 : (type === 'karana') ? 6 : (360 / 27);

    // Get the angular value that defines this element
    function getAngle(jd) {
        const m = getMoonNirayana(jd), s = getSunNirayana(jd);
        if (type === 'tithi' || type === 'karana') return ((m - s + 360) % 360);
        if (type === 'nakshatra') return m;
        return ((m + s) % 360); // yoga
    }

    // Get element index from angle
    function getElIdx(jd) {
        return Math.floor(getAngle(jd) / span);
    }

    // Compute angular speed (degrees per day) using daily motions
    function getSpeed(jd) {
        const m0 = getMoonNirayana(jd), s0 = getSunNirayana(jd);
        const m1 = getMoonNirayana(jd + 1), s1 = getSunNirayana(jd + 1);
        let dmc = m1 - m0; if (dmc < -180) dmc += 360; if (dmc > 180) dmc -= 360;
        let dmr = s1 - s0;  if (dmr < -180) dmr += 360; if (dmr > 180) dmr -= 360;
        if (type === 'tithi' || type === 'karana') return dmc - dmr;
        if (type === 'nakshatra') return dmc;
        return dmc + dmr; // yoga
    }

    // ── Step 1: Remaining Distance (RD) ──
    const angle0 = getAngle(refJD);
    const idx0 = Math.floor(angle0 / span);
    let RD = span - (angle0 % span);           // degrees left in current span
    if (RD < 0.001) RD = span;                  // at exact boundary → next element

    // ── Step 2: Initial Estimate ──
    const speed0 = getSpeed(refJD);
    let endJD = refJD + RD / speed0;            // time = distance / speed (in days)

    // ── Step 3: Iterative Refinement (successive approximation) ──
    for (let iter = 0; iter < 4; iter++) {
        const angleNow = getAngle(endJD);
        const idxNow = Math.floor(angleNow / span);

        let rd;
        if (idxNow === idx0) {
            // Haven't reached boundary yet → remaining distance (positive)
            rd = span - (angleNow % span);
            if (rd < 0.0001) break;              // essentially at boundary
        } else {
            // Overshot past boundary → overshoot distance (negative to go back)
            rd = -(angleNow % span);
            // Handle 360° wraparound: if boundary is at 360° and angle wrapped to 0+
            if ((idx0 + 1) * span >= 360 && angleNow < span) rd = -angleNow;
        }

        if (Math.abs(rd) < 0.0003) break;       // converged (~1 arcsecond)

        const speedNow = getSpeed(endJD);
        endJD += rd / speedNow;
    }

    return endJD;
}


/* ═══════════ BACKWARD SEARCH (for Varjyam / Amrit start) ═══════════ */

function findStart(refJD, getIdx, curIdx, maxDays) {
    maxDays = maxDays || 3;
    const step = 1/48;
    let jd = refJD;
    while (jd > refJD - maxDays) {
        jd -= step;
        if (getIdx(jd) !== curIdx) {
            let lo = jd, hi = jd + step;
            for (let i = 0; i < 50; i++) { const mid = (lo+hi)/2; if (getIdx(mid)!==curIdx) lo=mid; else hi=mid; }
            return hi;
        }
    }
    return refJD - maxDays;
}


/* ═══════════ COLLECT DAY ELEMENTS ═══════════ */

function getDayElements(srJD, nextSrJD, getIdx, namesFn, maxItems, elementType) {
    maxItems = maxItems || 3;
    const items = [];
    let jd = srJD;
    for (let i = 0; i < maxItems; i++) {
        const idx = getIdx(jd);
        const endJD = computeElementEnd(jd, elementType);
        items.push({ idx, name: namesFn(idx), endJD });
        if (endJD >= nextSrJD) break;
        jd = endJD + 0.0001;                    // advance past boundary
    }
    return items;
}


/* ═══════════ CALENDAR ELEMENTS ═══════════ */

function getSamvatsaram(y, m, srJD) {
    // The Hindu year starts at Chaitra Shukla Padyami (Ugadi).
    // Use the current lunar month to find which Gregorian year Chaitra fell in.
    const lunar = getLunarCalendar(srJD);
    // Strip Adhika/Kshaya prefixes to get base masam name
    const baseMasam = lunar.masam.replace('Adhika ', '').split('–')[0].split(' (')[0].trim();
    const masamIdx = MASAM.indexOf(baseMasam);

    // Chaitra (index 0) started approximately 'masamIdx' months ago.
    // Subtract that many months from the current Gregorian date to find
    // the Gregorian year in which Chaitra fell.
    const approxChaitraDate = new Date(y, m - 1 - masamIdx);
    const adj = approxChaitraDate.getFullYear();

    return SAMVATSARAM[((adj - 1987) % 60 + 60) % 60];
}
function getAyanam(sunNir) {
    return ((sunNir >= 270 && sunNir < 360) || (sunNir >= 0 && sunNir < 90)) ? "Uttarayana" : "Dakshinayana";
}
/* ═══════════════════════════════════════════════════════════════════════
   CHANDRAMANA (AMANTA) LUNAR CALENDAR ENGINE
   Handles: Masam, Rutu, Adhika Masam (Mala Masam), Kshaya Masam
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Find the exact Julian Day of a New Moon near the given approximate JD.
 * Uses iterative refinement on the Moon-Sun elongation (→ 0°).
 */
function findNewMoon(approxJD) {
    let jd = approxJD;
    for (let i = 0; i < 5; i++) {
        const e = ((getMoonNirayana(jd) - getSunNirayana(jd) + 360) % 360);
        const corr = e > 180 ? e - 360 : e;
        jd -= corr * 29.53 / 360;
    }
    return jd;
}

/**
 * Compute the full Chandramana calendar for a given sunrise JD:
 *   - Masam (lunar month name, with Adhika/Kshaya prefix if applicable)
 *   - Rutu  (season derived from lunar month mapping)
 *
 * Adhika Masam: No Sankranti in the lunar month (R_start == R_end)
 * Kshaya Masam: Two Sankrantis in one lunar month (R_end - R_start >= 2)
 */
function getLunarCalendar(srJD) {
    // ── Step 1: Find start Amavasya (beginning of current lunar month) ──
    const elong = ((getMoonNirayana(srJD) - getSunNirayana(srJD) + 360) % 360);
    const daysSinceNM = elong * 29.53 / 360;
    const nmStart = findNewMoon(srJD - daysSinceNM);

    // ── Step 2: Find end Amavasya (next New Moon = end of current month) ──
    const nmEnd = findNewMoon(nmStart + 29.53);

    // ── Step 3: Sun's Rashi at start and end Amavasyas ──
    const riStart = Math.floor(getSunNirayana(nmStart) / 30);
    const riEnd   = Math.floor(getSunNirayana(nmEnd) / 30);
    const rDiff   = ((riEnd - riStart) % 12 + 12) % 12;

    // ── Step 4: Determine month name and Adhika/Kshaya status ──
    const baseIdx = (riStart + 1) % 12;    // offset +1: named after Full Moon nakshatra
    let masam;
    let isAdhika = false, isKshaya = false;

    if (rDiff === 0) {
        // NO Sankranti in this lunar month → Adhika Masam (Mala Masam)
        isAdhika = true;
        masam = "Adhika " + MASAM[baseIdx];
    } else if (rDiff >= 2) {
        // TWO+ Sankrantis in one lunar month → Kshaya Masam
        isKshaya = true;
        masam = MASAM[baseIdx] + "–" + MASAM[(baseIdx + 1) % 12] + " (Kshaya)";
    } else {
        // Normal month (exactly one Sankranti)
        masam = MASAM[baseIdx];
    }

    // ── Step 5: Chandramana Rutu from lunar month index ──
    // Vasanta: Chaitra(0) & Vaishakha(1), Grishma: Jyeshtha(2) & Ashadha(3), etc.
    // Adhika month shares the same Rutu as its Nija counterpart.
    const RUTU_LUNAR = [
        "Vasanta Rutu","Vasanta Rutu","Grishma Rutu","Grishma Rutu",
        "Varsha Rutu","Varsha Rutu","Sharad Rutu","Sharad Rutu",
        "Hemanta Rutu","Hemanta Rutu","Shishira Rutu","Shishira Rutu"
    ];
    const rutu = RUTU_LUNAR[baseIdx];

    return { masam, rutu, isAdhika, isKshaya };
}

function getMasamRutu(sunNir, srJD) {
    const ri = Math.floor(sunNir / 30);
    const lunar = getLunarCalendar(srJD);
    return { masam: lunar.masam, rutu: lunar.rutu, rashi: RASHI[ri] };
}
function getPaksham(ti) { return ti < 15 ? "Shukla Paksham" : "Krishna Paksham"; }


/* ═══════════ KALAM & MUHURAT ═══════════ */

function getKalam(srHrs, ssHrs, parts, dow) {
    const dur = (ssHrs - srHrs) / 8;
    const p = parts[dow];
    return { start: srHrs + (p-1)*dur, end: srHrs + p*dur };
}
function getDurmuhuratam(srHrs, ssHrs, dow) {
    const dayMuhDur   = (ssHrs - srHrs) / 15;                // 1 daytime muhurta
    const nightDur    = 24 - (ssHrs - srHrs);                 // Ratrimana in hours
    const nightMuhDur = nightDur / 15;                        // 1 nighttime muhurta

    return DURMUHURAT[dow].map(mi => {
        if (mi > 0) {
            // Daytime muhurta: start = SR + (mi-1) × dayMuhDur
            return { start: srHrs + (mi-1)*dayMuhDur, end: srHrs + mi*dayMuhDur };
        } else {
            // Nighttime muhurta: start = SS + (ni-1) × nightMuhDur
            const ni = -mi;
            return { start: ssHrs + (ni-1)*nightMuhDur, end: ssHrs + ni*nightMuhDur };
        }
    });
}
function getAbhijitMuhurat(srHrs, ssHrs, dow) {
    const muhDur = (ssHrs - srHrs) / 15;
    // Abhijit is the 8th muhurta of the day
    const start = srHrs + 7 * muhDur;
    const end = start + muhDur;
    // Abhijit is nullified when the 8th muhurta is also a Durmuhuratam period
    if (DURMUHURAT[dow].includes(8)) return null;
    return { start, end };
}
function getBrahmaMuhurat(srHrs, prevSsHrs) {
    // Night = previous day's sunset to today's sunrise
    const nightDur = srHrs + (24 - prevSsHrs); // hours
    const nightMuhurta = nightDur / 15;
    // Brahma Muhurat = 2nd-to-last muhurta of the night (14th of 15)
    return { start: srHrs - 2 * nightMuhurta, end: srHrs - nightMuhurta };
}
function getVijayaMuhurtam(srHrs, ssHrs) {
    // 11th muhurta of daytime (Md = D/15)
    const muhDur = (ssHrs - srHrs) / 15;
    return { start: srHrs + 10 * muhDur, end: srHrs + 11 * muhDur };
}
function getGodhuliMuhurtam(ssHrs) {
    // Sunset ± 24 minutes (2 ghatis = 48 min centered on sunset)
    return { start: ssHrs - 24/60, end: ssHrs + 24/60 };
}
function getAparhnaKalam(srHrs, ssHrs) {
    // 4th of 5 equal parts (Kalas) of daytime
    const D = ssHrs - srHrs;
    return { start: srHrs + 3*D/5, end: srHrs + 4*D/5 };
}
function getPratahSandhya(srHrs) {
    // Sunrise ± 24 minutes (2 ghatis centered on sunrise)
    return { start: srHrs - 24/60, end: srHrs + 24/60 };
}
function getSayamSandhya(ssHrs) {
    // Sunset ± 24 minutes (2 ghatis centered on sunset)
    return { start: ssHrs - 24/60, end: ssHrs + 24/60 };
}

function computeVarjyamAmrit(srJD, nextSrJD, tz) {
    const nakIdx = getNakIdx(srJD);
    const nakStart = findStart(srJD, getNakIdx, nakIdx, 3);
    const nakEnd   = computeElementEnd(srJD, 'nakshatra');

    const naks = [{ idx: nakIdx, start: nakStart, end: nakEnd }];
    if (nakEnd < nextSrJD) {
        const nakIdx2 = getNakIdx(nakEnd + 0.0001);
        const nakEnd2 = computeElementEnd(nakEnd + 0.0001, 'nakshatra');
        naks.push({ idx: nakIdx2, start: nakEnd, end: nakEnd2 });
    }

    let varjyam = null, amrit = null;
    for (const nk of naks) {
        const gd = (nk.end - nk.start) / 60;
        const vs = nk.start + VARJYAM_GHATI[nk.idx] * gd;
        const ve = vs + 4 * gd;
        if (ve > srJD && vs < nextSrJD && !varjyam) varjyam = { start: vs, end: ve };

        const as = nk.start + AMRIT_GHATI[nk.idx] * gd;
        const ae = as + 4 * gd;
        if (ae > srJD && as < nextSrJD && !amrit) amrit = { start: as, end: ae };
    }
    return { varjyam, amrit };
}

/* ═══════════ LAGNA (ASCENDANT) ═══════════ */

const RASHI_LORDS = ["Kuja (Mars)","Shukra (Venus)","Budha (Mercury)","Chandra (Moon)",
                     "Surya (Sun)","Budha (Mercury)","Shukra (Venus)","Kuja (Mars)",
                     "Guru (Jupiter)","Shani (Saturn)","Shani (Saturn)","Guru (Jupiter)"];

/* ═══════════ NAVAGRAHA PLANETARY POSITIONS ═══════════ */

// Keplerian orbital elements [value_at_J2000, rate_per_century]
// Source: Standish (1992) via JPL Horizons
const PLANET_ELEMENTS = {
    mercury: { a:[0.38709927,0.00000037], e:[0.20563593,0.00001906], L:[252.25032,149472.67411], w:[77.45780,0.16048] },
    venus:   { a:[0.72333566,0.00000390], e:[0.00677672,-0.00004107], L:[181.97910,58517.81539], w:[131.60247,0.00268] },
    mars:    { a:[1.52371034,0.00001847], e:[0.09339410,0.00007882], L:[355.44656,19140.30268], w:[336.04084,0.44441] },
    jupiter: { a:[5.20288700,-0.00011607], e:[0.04838624,-0.00013253], L:[34.39644,3034.74613], w:[14.72848,0.21253] },
    saturn:  { a:[9.53667594,-0.00125060], e:[0.05386179,-0.00050991], L:[49.95424,1222.49362], w:[92.59888,-0.41897] },
};

// Solve Kepler's equation M = E - e*sin(E) via Newton's method
function solveKepler(M_rad, e) {
    let E = M_rad + e * Math.sin(M_rad);
    for (let i = 0; i < 12; i++) {
        const dE = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
        E -= dE;
        if (Math.abs(dE) < 1e-9) break;
    }
    return E;
}

// Compute heliocentric ecliptic longitude and distance for a planet
function getPlanetHelio(jd, el) {
    const T = (jd - 2451545.0) / 36525.0;
    const D2R = Math.PI / 180;
    const a = el.a[0] + el.a[1] * T;
    const e = el.e[0] + el.e[1] * T;
    const L = ((el.L[0] + el.L[1] * T) % 360 + 360) % 360;
    const w = el.w[0] + el.w[1] * T;
    const M = ((L - w) % 360 + 360) % 360 * D2R;
    const E = solveKepler(M, e);
    const nu = 2 * Math.atan2(Math.sqrt(1+e) * Math.sin(E/2), Math.sqrt(1-e) * Math.cos(E/2));
    return { lon: ((w + nu / D2R) % 360 + 360) % 360, r: a * (1 - e * Math.cos(E)) };
}

// Earth's heliocentric position (from Sun)
function getEarthHelio(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const M = ((357.52911 + 35999.05029 * T) % 360) * Math.PI / 180;
    const R = 1.00014 - 0.01671 * Math.cos(M) - 0.00014 * Math.cos(2*M);
    return { lon: (getSunTropical(jd) + 180) % 360, r: R };
}

// Geocentric tropical longitude for a planet
function getGeocentricLong(jd, planetKey) {
    const D2R = Math.PI / 180;
    const p = getPlanetHelio(jd, PLANET_ELEMENTS[planetKey]);
    const e = getEarthHelio(jd);
    const xp = p.r * Math.cos(p.lon * D2R), yp = p.r * Math.sin(p.lon * D2R);
    const xe = e.r * Math.cos(e.lon * D2R), ye = e.r * Math.sin(e.lon * D2R);
    let geo = Math.atan2(yp - ye, xp - xe) / D2R;
    return ((geo % 360) + 360) % 360;
}

// Nirayana longitude for a planet
function getPlanetNirayana(jd, planetKey) {
    return ((getGeocentricLong(jd, planetKey) - getAyanamsa(jd)) % 360 + 360) % 360;
}

// Rahu — Mean Lunar Ascending Node (Meeus)
function getRahuNirayana(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T*T + T*T*T / 467441;
    return ((omega - getAyanamsa(jd)) % 360 + 360) % 360;
}

// Ketu = Rahu + 180°
function getKetuNirayana(jd) { return (getRahuNirayana(jd) + 180) % 360; }

// All 9 Navagraha positions
function getNavagrahaPositions(jd) {
    return [
        { name:'Su', full:'Surya',  deg: getSunNirayana(jd),             color:'#d4a017' },
        { name:'Mo', full:'Chandra',deg: getMoonNirayana(jd),            color:'#2e7d32' },
        { name:'Ma', full:'Kuja',   deg: getPlanetNirayana(jd,'mars'),   color:'#c0392b' },
        { name:'Me', full:'Budha',  deg: getPlanetNirayana(jd,'mercury'),color:'#16a085' },
        { name:'Ju', full:'Guru',   deg: getPlanetNirayana(jd,'jupiter'),color:'#e67e22' },
        { name:'Ve', full:'Shukra', deg: getPlanetNirayana(jd,'venus'),  color:'#9b59b6' },
        { name:'Sa', full:'Shani',  deg: getPlanetNirayana(jd,'saturn'), color:'#2c3e50' },
        { name:'Ra', full:'Rahu',   deg: getRahuNirayana(jd),           color:'#7f8c8d' },
        { name:'Ke', full:'Ketu',   deg: getKetuNirayana(jd),           color:'#95a5a6' },
    ].map(g => ({ ...g, rashi: Math.floor(g.deg / 30), rashiName: RASHI[Math.floor(g.deg / 30)] }));
}

/* ═══════════ JAGAT & VARSHA LAGNA ═══════════ */

// Find Mesha Sankranti (Sun enters 0° Nirayana Aries)
function findMeshaSankranti(year, lat, lon) {
    // Sun is near 0° Mesha around April 13-15
    let jd = dateToJD(year, 4, 10);
    for (let i = 0; i < 20; i++) {
        const sunNir = getSunNirayana(jd);
        let corr = sunNir > 180 ? sunNir - 360 : sunNir; // handle wrap
        jd -= corr / 0.9856; // Sun moves ~0.9856°/day
        if (Math.abs(corr) < 0.0001) break;
    }
    return { jd, lagna: computeLagna(jd, lat, lon) };
}

// Find Chaitra Amavasya (new moon before Chaitra Shukla Pratipada)
function findChaitraAmavasya(year, lat, lon) {
    // Chaitra month starts after new moon near Mesha Sankranti
    // Search for new moon in March-April
    let approxJD = dateToJD(year, 3, 25);
    const nm = findNewMoon(approxJD);
    // If this new moon is too early (before March 15), try next one
    const nmDate = jdToLocal(nm, 0);
    let finalNM = nm;
    if (nmDate.month < 3 || (nmDate.month === 3 && nmDate.day < 10)) {
        finalNM = findNewMoon(nm + 30);
    }
    return { jd: finalNM, lagna: computeLagna(finalNM, lat, lon) };
}

/* ═══════════ CHART SVG GENERATORS ═══════════ */

// Generate South Indian Rasi Kundali SVG with all 9 Navagrahas
function generateSouthIndianChartSVG(lagnaRashiIdx, grahas) {
    const W = 320, H = 320;
    const cellW = W / 4, cellH = H / 4;

    const RASHI_POS = [
        [0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0]
    ];
    const RASHI_SHORT = ["Mes","Vrs","Mit","Kar","Sim","Kan","Tul","Vru","Dha","Mak","Kum","Mee"];

    // Group grahas by rashi
    const rashiGrahas = {};
    grahas.forEach(g => {
        if (!rashiGrahas[g.rashi]) rashiGrahas[g.rashi] = [];
        rashiGrahas[g.rashi].push(g);
    });

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;width:100%;">`;
    svg += `<rect width="${W}" height="${H}" fill="#fdf6e3" stroke="#4a0e0e" stroke-width="2" rx="4"/>`;

    for (let i = 1; i < 4; i++) {
        svg += `<line x1="${i*cellW}" y1="0" x2="${i*cellW}" y2="${H}" stroke="#8b6914" stroke-width="0.5"/>`;
        svg += `<line x1="0" y1="${i*cellH}" x2="${W}" y2="${i*cellH}" stroke="#8b6914" stroke-width="0.5"/>`;
    }
    svg += `<rect x="${cellW}" y="${cellH}" width="${cellW*2}" height="${cellH*2}" fill="none" stroke="#8b6914" stroke-width="1"/>`;
    svg += `<text x="${W/2}" y="${H/2-4}" text-anchor="middle" font-size="10" fill="#4a0e0e" font-family="Cinzel,serif" font-weight="600">Rasi</text>`;
    svg += `<text x="${W/2}" y="${H/2+10}" text-anchor="middle" font-size="10" fill="#4a0e0e" font-family="Cinzel,serif" font-weight="600">Kundali</text>`;

    for (let r = 0; r < 12; r++) {
        const [row, col] = RASHI_POS[r];
        const x = col * cellW, y = row * cellH;

        if (r === lagnaRashiIdx) {
            svg += `<rect x="${x+1}" y="${y+1}" width="${cellW-2}" height="${cellH-2}" fill="#f5e6c8" rx="2"/>`;
        }
        svg += `<text x="${x+4}" y="${y+13}" font-size="8.5" fill="#888" font-family="'EB Garamond',serif">${RASHI_SHORT[r]}</text>`;

        // Place grahas
        const gList = rashiGrahas[r] || [];
        if (r === lagnaRashiIdx && !gList.find(g => g.name === 'As')) {
            gList.unshift({ name: 'As', color: '#4a0e0e' });
        }
        const cols = Math.min(gList.length, 3);
        const rows2 = Math.ceil(gList.length / 3);
        gList.forEach((g, i) => {
            const gc = i % 3, gr = Math.floor(i / 3);
            const gx = x + 12 + gc * 24;
            const gy = y + 28 + gr * 16;
            svg += `<text x="${gx}" y="${gy}" font-size="11" fill="${g.color}" font-weight="bold" font-family="'EB Garamond',serif">${g.name}</text>`;
        });
    }
    svg += `</svg>`;
    return svg;
}

// Generate North Indian Kundali SVG with all 9 Navagrahas
function generateNorthIndianChartSVG(lagnaRashiIdx, grahas) {
    const S = 320, h = S/2;
    // Key points
    const O = [h, h]; // center
    const A = [0,0], B = [S,0], C = [S,S], D = [0,S]; // corners
    const E = [h,0], F = [S,h], G = [h,S], H = [0,h]; // midpoints
    const P1 = [S/4,S/4], P2 = [3*S/4,S/4], P3 = [3*S/4,3*S/4], P4 = [S/4,3*S/4]; // intersections

    // 12 house polygons [vertices] — houses are FIXED positions
    const HOUSES = [
        /* H1  top kite    */ [E, P2, O, P1],
        /* H2  TR upper    */ [E, B, P2],
        /* H3  TR lower    */ [B, F, P2],
        /* H4  right kite  */ [F, P3, O, P2],
        /* H5  BR upper    */ [F, C, P3],
        /* H6  BR lower    */ [C, G, P3],
        /* H7  bottom kite */ [G, P4, O, P3],
        /* H8  BL upper    */ [G, D, P4],
        /* H9  BL lower    */ [D, H, P4],
        /* H10 left kite   */ [H, P1, O, P4],
        /* H11 TL lower    */ [H, A, P1],
        /* H12 TL upper    */ [A, E, P1],
    ];

    // Signs placed in houses: H1 = lagnaRashiIdx, H2 = lagna+1, etc.
    const signInHouse = [];
    for (let i = 0; i < 12; i++) signInHouse[i] = (lagnaRashiIdx + i) % 12;

    // Group grahas by rashi
    const rashiGrahas = {};
    grahas.forEach(g => { if (!rashiGrahas[g.rashi]) rashiGrahas[g.rashi] = []; rashiGrahas[g.rashi].push(g); });

    const RASHI_SHORT = ["Mes","Vrs","Mit","Kar","Sim","Kan","Tul","Vru","Dha","Mak","Kum","Mee"];

    let svg = `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;width:100%;">`;
    svg += `<rect width="${S}" height="${S}" fill="#fdf6e3" stroke="#4a0e0e" stroke-width="2" rx="4"/>`;

    // Draw all lines
    const lines = [[E,P2],[P2,O],[O,P1],[P1,E], [P2,F],[F,P3],[P3,O], [P3,G],[G,P4],[P4,O], [P4,H],[H,P1],
                   [A,P1],[B,P2],[C,P3],[D,P4], [E,B],[B,F],[F,C],[C,G],[G,D],[D,H],[H,A],[A,E]];
    lines.forEach(([a,b]) => {
        svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#8b6914" stroke-width="0.8"/>`;
    });

    // Draw each house
    HOUSES.forEach((verts, hIdx) => {
        const rashiIdx = signInHouse[hIdx];
        // Centroid for placing text
        let cx = 0, cy = 0;
        verts.forEach(v => { cx += v[0]; cy += v[1]; });
        cx /= verts.length; cy /= verts.length;

        // Highlight lagna house (H1)
        if (hIdx === 0) {
            svg += `<polygon points="${verts.map(v => v.join(',')).join(' ')}" fill="#f5e6c8" stroke="none"/>`;
        }

        // Rashi label (small)
        svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="8" fill="#888" font-family="'EB Garamond',serif">${RASHI_SHORT[rashiIdx]}</text>`;

        // Grahas in this rashi
        const gList = rashiGrahas[rashiIdx] || [];
        if (hIdx === 0) gList.unshift({ name: 'As', color: '#4a0e0e' });
        gList.forEach((g, i) => {
            const gx = cx - 12 + (i % 3) * 18;
            const gy = cy + 6 + Math.floor(i / 3) * 13;
            svg += `<text x="${gx}" y="${gy}" font-size="10" fill="${g.color}" font-weight="bold" font-family="'EB Garamond',serif">${g.name}</text>`;
        });
    });

    // Center label
    svg += `<text x="${h}" y="${h-4}" text-anchor="middle" font-size="9" fill="#4a0e0e" font-family="Cinzel,serif">Kundali</text>`;
    svg += `<text x="${h}" y="${h+8}" text-anchor="middle" font-size="8" fill="#999" font-family="'EB Garamond',serif">(North)</text>`;
    svg += `</svg>`;
    return svg;
}

// Compute Nirayana Lagna (Ascendant) at a given JD for geographic lat/lon (degrees)
function computeLagna(jd, lat, lon) {
    const DEG = Math.PI / 180;
    const RAD = 180 / Math.PI;
    const epsilon = 23.44 * DEG;  // Mean obliquity

    // Greenwich Mean Sidereal Time (Meeus Ch. 12)
    const T = (jd - 2451545.0) / 36525.0;
    let gmstDeg = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
                + 0.000387933 * T * T - T * T * T / 38710000.0;
    gmstDeg = ((gmstDeg % 360) + 360) % 360;

    // Local Sidereal Time
    let lstDeg = ((gmstDeg + lon) % 360 + 360) % 360;

    // RAMC in radians
    const RAMC = lstDeg * DEG;
    const phi  = lat * DEG;

    // Sayana (Tropical) Ascendant
    // tan(Asc) = -cos(RAMC) / [sin(RAMC)*cos(ε) + tan(φ)*sin(ε)]
    const numerator   = -Math.cos(RAMC);
    const denominator = Math.sin(RAMC) * Math.cos(epsilon) + Math.tan(phi) * Math.sin(epsilon);
    let ascSayana = Math.atan2(numerator, denominator) * RAD;

    // atan2 gives -180 to +180; convert to 0-360
    // The ascendant must be in the correct quadrant based on RAMC
    ascSayana = ((ascSayana % 360) + 360) % 360;

    // Quadrant correction: Ascendant should be ~180° ahead of RAMC for midheaven
    // More precisely, the ascendant is roughly RAMC + 90° (east point)
    // We check if the result needs 180° shift
    const ramcDeg = lstDeg;
    let diff = ((ascSayana - ramcDeg) % 360 + 360) % 360;
    // The ascendant should be roughly 60-120° east of MC for mid-latitudes
    // If it's more than 180° off, add 180°
    if (diff > 180) {
        ascSayana = (ascSayana + 180) % 360;
    }

    // Nirayana Lagna
    const ayanamsa = getAyanamsa(jd);
    let lagnaDeg = ((ascSayana - ayanamsa) % 360 + 360) % 360;

    const rashiIdx = Math.floor(lagnaDeg / 30);
    const degInRashi = lagnaDeg % 30;
    let degWhole = Math.floor(degInRashi);
    let minPart = Math.round((degInRashi - degWhole) * 60);
    if (minPart >= 60) { minPart = 0; degWhole++; }

    return {
        degree: lagnaDeg,
        rashiIdx: rashiIdx,
        rashiName: RASHI[rashiIdx],
        degStr: `${degWhole}°${String(minPart).padStart(2,'0')}'`,
        lord: RASHI_LORDS[rashiIdx]
    };
}

// Compute Lagna transitions: find when each new rashi rises during the day
function getLagnaTransitions(srJD, nextSrJD, lat, lon, tz) {
    const rawTransitions = [];
    const step = 0.005;  // ~7.2 minutes
    let prevRashi = computeLagna(srJD, lat, lon).rashiIdx;

    for (let jd = srJD + step; jd <= nextSrJD + 0.02; jd += step) {
        const lagna = computeLagna(jd, lat, lon);
        if (lagna.rashiIdx !== prevRashi) {
            // Bisect to find exact transition
            let lo = jd - step, hi = jd;
            for (let i = 0; i < 15; i++) {
                const mid = (lo + hi) / 2;
                if (computeLagna(mid, lat, lon).rashiIdx === prevRashi) lo = mid;
                else hi = mid;
            }
            rawTransitions.push((lo + hi) / 2);
            prevRashi = lagna.rashiIdx;
        }
    }

    // Build periods with start and end times
    const periods = [];
    const firstRashi = computeLagna(srJD, lat, lon);
    
    // First period: sunrise to first transition
    const firstEnd = rawTransitions.length > 0 ? rawTransitions[0] : nextSrJD;
    periods.push({
        rashiIdx: firstRashi.rashiIdx,
        rashiName: RASHI[firstRashi.rashiIdx],
        startJD: srJD,
        endJD: firstEnd,
        startTime: 'Sunrise',
        endTime: fmtDateTime(jdToLocal(firstEnd, tz))
    });

    // Subsequent periods
    for (let i = 0; i < rawTransitions.length; i++) {
        const startJD = rawTransitions[i];
        const endJD = (i + 1 < rawTransitions.length) ? rawTransitions[i + 1] : nextSrJD;
        const rashi = computeLagna(startJD + 0.001, lat, lon);
        periods.push({
            rashiIdx: rashi.rashiIdx,
            rashiName: RASHI[rashi.rashiIdx],
            startJD: startJD,
            endJD: endJD,
            startTime: fmtDateTime(jdToLocal(startJD, tz)),
            endTime: fmtDateTime(jdToLocal(endJD, tz))
        });
    }
    return periods;
}

// ── Pushkaramsha (Pushkara Navamsha) ──
// Pushkara Navamsha numbers (1-9) for each element:
// Fire (Mesha=0, Simha=4, Dhanussu=8): 7th and 9th navamsha
// Earth (Vrushabham=1, Kanya=5, Makaram=9): 3rd and 5th navamsha
// Air (Mithunam=2, Tula=6, Kumbham=10): 6th and 8th navamsha
// Water (Karkatakam=3, Vruschikam=7, Meenam=11): 1st and 3rd navamsha

const PUSHKARA_NAVAMSHAS = {
    0: [7, 9],   // Mesha (Fire)
    1: [3, 5],   // Vrushabham (Earth)
    2: [6, 8],   // Mithunam (Air)
    3: [1, 3],   // Karkatakam (Water)
    4: [7, 9],   // Simham (Fire)
    5: [3, 5],   // Kanya (Earth)
    6: [6, 8],   // Tula (Air)
    7: [1, 3],   // Vruschikam (Water)
    8: [7, 9],   // Dhanussu (Fire)
    9: [3, 5],   // Makaram (Earth)
    10: [6, 8],  // Kumbham (Air)
    11: [1, 3],  // Meenam (Water)
};

// Pushkara Bhaga — single most auspicious degree per sign
const PUSHKARA_BHAGA = [21, 14, 18, 8, 19, 9, 24, 11, 23, 14, 19, 9];

function getPushkaramsha(rashiIdx, degInRashi) {
    // Calculate navamsha number (1-9), each navamsha = 3°20' = 200 arcmin
    const arcMin = degInRashi * 60;
    const navamshaNum = Math.floor(arcMin / 200) + 1;
    
    const pushkaraNavs = PUSHKARA_NAVAMSHAS[rashiIdx];
    const isPushkara = pushkaraNavs.includes(navamshaNum);
    const pushkaraBhaga = PUSHKARA_BHAGA[rashiIdx];
    const isNearBhaga = Math.abs(degInRashi - pushkaraBhaga) < 0.5; // within ~30'
    
    return {
        navamshaNum: navamshaNum,
        isPushkaramsha: isPushkara,
        pushkaraBhaga: pushkaraBhaga,
        isNearBhaga: isNearBhaga
    };
}

// Find Pushkaramsha windows during a lagna period
function getPushkaraWindows(period, lat, lon, tz) {
    const windows = [];
    const rashiIdx = period.rashiIdx;
    const pushkaraNavs = PUSHKARA_NAVAMSHAS[rashiIdx];
    
    // For each pushkara navamsha, find the time window within this period
    for (const nav of pushkaraNavs) {
        // Navamsha arc: (nav-1)*3°20' to nav*3°20' within the sign
        const navStartDeg = (nav - 1) * (200 / 60);  // in degrees
        const navEndDeg = nav * (200 / 60);
        
        // Search for when lagna degree passes through this arc
        const step = 0.001; // ~1.4 minutes
        let windowStart = null, windowEnd = null;
        
        for (let jd = period.startJD; jd <= period.endJD; jd += step) {
            const l = computeLagna(jd, lat, lon);
            if (l.rashiIdx !== rashiIdx) continue;
            const deg = l.degree % 30;
            
            if (deg >= navStartDeg && deg < navEndDeg) {
                if (!windowStart) windowStart = jd;
                windowEnd = jd + step;
            } else if (windowStart) {
                break;
            }
        }
        
        if (windowStart) {
            windows.push({
                navamsha: nav,
                startTime: fmtDateTime(jdToLocal(windowStart, tz)),
                endTime: fmtDateTime(jdToLocal(windowEnd, tz)),
                arcSpan: `${Math.floor(navStartDeg)}°${String(Math.round((navStartDeg % 1) * 60)).padStart(2,'0')}' – ${Math.floor(navEndDeg)}°${String(Math.round((navEndDeg % 1) * 60)).padStart(2,'0')}'`
            });
        }
    }
    return windows;
}

// Generate South Indian Rasi Kundali SVG

/* ═══════════ DAY SIGNIFICANCE ═══════════ */


// Map Telugu MASAM names → jyotisham month number (1-12)
const MASAM_TO_NUM = {
    'Chaithramu':1, 'Vaisakhamu':2, 'Jyesthamu':3, 'Ashadhamu':4,
    'Sravanamu':5, 'Bhadhrapadamu':6, 'Asvayujamu':7, 'Karthikamu':8,
    'Margasiramu':9, 'Pushyamu':10, 'Maghamu':11, 'Phalgunamu':12
};

function getMasamNum(masam) {
    // Strip "Adhika " prefix and any "(Kshaya)" suffix to get base name
    const base = masam.replace('Adhika ', '').split('-')[0].split(' (')[0].trim();
    return MASAM_TO_NUM[base] || 0;
}

function getDaySignificance(masam, tithiIdx, nakIdx, gregMonth, gregDay, dow) {
    const sig = [];
    
    // === FESTIVALS lookup from festivals.js ===
    if (typeof FESTIVALS !== 'undefined') {
        const lunarMonth = getMasamNum(masam);
        // tithiIdx is 0-29 in our code; jyotisham uses 1-30
        const tithiNum = tithiIdx + 1;
        // nakIdx is 0-26 in our code; jyotisham uses 1-27
        const nakNum = nakIdx + 1;
        
        // 1) Lunar month + tithi (specific month)
        const ltKey = lunarMonth + ':' + tithiNum;
        if (FESTIVALS.lunar_tithi && FESTIVALS.lunar_tithi[ltKey]) {
            sig.push(...FESTIVALS.lunar_tithi[ltKey]);
        }
        
        // 2) Tithi for every month (month_number=0)
        if (FESTIVALS.lunar_tithi_every && FESTIVALS.lunar_tithi_every[tithiNum]) {
            sig.push(...FESTIVALS.lunar_tithi_every[tithiNum]);
        }
        
        // 3) Lunar month + nakshatra (specific month)
        const lnKey = lunarMonth + ':' + nakNum;
        if (FESTIVALS.lunar_nak && FESTIVALS.lunar_nak[lnKey]) {
            sig.push(...FESTIVALS.lunar_nak[lnKey]);
        }
        
        // 4) Nakshatra for every month
        if (FESTIVALS.lunar_nak_every && FESTIVALS.lunar_nak_every[nakNum]) {
            sig.push(...FESTIVALS.lunar_nak_every[nakNum]);
        }
        
        // 5) Gregorian date
        if (gregMonth && gregDay) {
            const gKey = gregMonth + ':' + gregDay;
            if (FESTIVALS.gregorian && FESTIVALS.gregorian[gKey]) {
                sig.push(...FESTIVALS.gregorian[gKey]);
            }
        }
    }
    
    // === Vara (day-of-week) + Tithi combination festivals ===
    // These have complex timing rules not in the JSON lookup
    // dow: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    
    // Varalakshmi Vratam: Friday (dow=5) in Shravana (month 5) Shukla Paksha
    // (Friday before or on Purnima, i.e. Shukla Paksha tithiIdx 0-14)
    const lunarMonth = getMasamNum(masam);
    if (dow === 5 && lunarMonth === 5 && tithiIdx >= 0 && tithiIdx <= 14) {
        // Check if this is the last Friday before Purnima
        // Purnima (tithiIdx 14) is at most 14 days away
        // The Friday closest to (and before/on) Purnima is the one where
        // remaining tithis to Purnima < 7 (i.e., tithiIdx >= 8)
        if (tithiIdx >= 8 && tithiIdx <= 14) {
            sig.push("Varalakshmi Vratam");
        }
    }
    
    // Angaaraki Chaturthi: Tuesday (dow=2) + Krishna Chaturthi (tithiIdx=18)
    if (dow === 2 && tithiIdx === 18) sig.push("Angaaraki Chaturthi");
    
    // Soma Pradosha: Monday (dow=1) + Trayodashi (tithiIdx=12 Shukla or 27 Krishna)
    if (dow === 1 && (tithiIdx === 12 || tithiIdx === 27)) sig.push("Soma Pradosha Vratam");
    
    // Shani Pradosha: Saturday (dow=6) + Trayodashi
    if (dow === 6 && (tithiIdx === 12 || tithiIdx === 27)) sig.push("Shani Pradosha Vratam");
    
    // Bhanu Saptami: Sunday (dow=0) + Shukla Saptami (tithiIdx=6)
    if (dow === 0 && tithiIdx === 6) sig.push("Bhanu Saptami");
    
    // Budha Ashtami: Wednesday (dow=3) + Krishna Ashtami (tithiIdx=22)
    if (dow === 3 && tithiIdx === 22) sig.push("Budha Ashtami");
    
    // Sankashta/Sankatahara Chaturthi: Krishna Chaturthi (tithiIdx=18) every month
    if (tithiIdx === 18) sig.push("Sankashta Chaturthi");
    
    // Vinayaka Chaturthi: Shukla Chaturthi (tithiIdx=3) every month
    if (tithiIdx === 3) sig.push("Vinayaka Chaturthi");
    
    // Pradosha Vratam: Trayodashi (both Shukla=12, Krishna=27) every month
    if (tithiIdx === 12 || tithiIdx === 27) sig.push("Pradosha Vratam");
    
    // Ekadashi: Every month
    if (tithiIdx === 10) sig.push("Shukla Ekadashi");
    if (tithiIdx === 25) sig.push("Krishna Ekadashi");
    
    // Purnima / Amavasya
    if (tithiIdx === 14) sig.push("Purnima");
    if (tithiIdx === 29) sig.push("Amavasya — Pitru Tarpanam");
    
    // Masa Shivaratri: Krishna Chaturdashi (tithiIdx=28) every month
    if (tithiIdx === 28) sig.push("Masa Shivaratri");
    
    // === Major named festivals (hardcoded for reliability) ===
    if (lunarMonth === 7 && tithiIdx >= 0 && tithiIdx <= 8) sig.push("Navaratri");
    if (lunarMonth === 7 && tithiIdx === 9) sig.push("Vijayadashami / Dussehra");
    if (lunarMonth === 1 && tithiIdx === 0) sig.push("Ugadi — Telugu New Year");
    if (lunarMonth === 1 && tithiIdx === 8) sig.push("Sri Rama Navami");
    if (lunarMonth === 5 && tithiIdx === 22) sig.push("Sri Krishna Janmashtami");
    if (lunarMonth === 6 && tithiIdx === 3) sig.push("Ganesh Chaturthi");
    if (lunarMonth === 11 && tithiIdx === 28) sig.push("Maha Shivaratri");
    if (lunarMonth === 7 && tithiIdx === 29) sig.push("Deepavali");
    if (lunarMonth === 5 && tithiIdx === 14) sig.push("Raksha Bandhan");
    if (lunarMonth === 5 && tithiIdx === 4) sig.push("Naga Panchami");
    if (lunarMonth === 2 && tithiIdx === 2) sig.push("Akshaya Tritiya");
    if (lunarMonth === 8 && tithiIdx === 14) sig.push("Kartika Purnima / Dev Deepavali");
    if (lunarMonth === 4 && tithiIdx === 14) sig.push("Guru Purnima");
    if (lunarMonth === 12 && tithiIdx === 14) sig.push("Holi");
    if (lunarMonth === 2 && tithiIdx === 14) sig.push("Buddha Purnima");
    if (lunarMonth === 11 && tithiIdx === 29) sig.push("Mauni Amavasya");
    if (lunarMonth === 10 && tithiIdx === 6) sig.push("Ratha Saptami");
    if (lunarMonth === 1 && tithiIdx >= 0 && tithiIdx <= 8) sig.push("Vasanta Navaratri");
    if (lunarMonth === 6 && tithiIdx === 13) sig.push("Ananta Chaturdashi");
    if (lunarMonth === 5 && tithiIdx === 11) sig.push("Putrada Ekadashi / Shravana Dvadashi");
    
    if (sig.length === 0) sig.push("No special significance noted for this day");
    return [...new Set(sig)];
}


/* ═══════════ MAIN CALCULATION ═══════════ */

function calculatePanchangam() {
    const dateVal = document.getElementById('datePicker').value;
    if (!dateVal) return;
    const [y, m, d] = dateVal.split('-').map(Number);
    const cityKey = document.getElementById('citySelect').value;

    let lat, lon, tz, locName;
    if (cityKey === 'custom') {
        lat = parseFloat(document.getElementById('latInput').value);
        lon = parseFloat(document.getElementById('lonInput').value);
        tz  = parseFloat(document.getElementById('tzInput').value);
        locName = `Custom (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;
    } else {
        const c = CITIES[cityKey];
        lat = c.lat; lon = c.lon;
        tz = isDST(y, m, d, c.dst) ? c.dstTz : c.stdTz;
        locName = c.name;
    }

    const st = computeSunTimes(y, m, d, lat, lon, tz);
    if (!st) { alert("Cannot compute sunrise/sunset for this location and date."); return; }
    const srHrs = st.sunrise, ssHrs = st.sunset, noonHrs = st.noon;

    const tom = new Date(y, m-1, d+1);
    const st2 = computeSunTimes(tom.getFullYear(), tom.getMonth()+1, tom.getDate(), lat, lon, tz);
    const nextSrHrs = st2 ? st2.sunrise : srHrs;

    const srJD     = localToJD(y, m, d, srHrs, tz);
    const nextSrJD = localToJD(tom.getFullYear(), tom.getMonth()+1, tom.getDate(), nextSrHrs, tz);

    const sunNir  = getSunNirayana(srJD);
    const moonNir = getMoonNirayana(srJD);
    const elongation = ((moonNir - sunNir + 360) % 360);
    const dow = new Date(y, m-1, d).getDay();

    // Calendar elements
    const samvatsaram = getSamvatsaram(y, m, srJD);
    const ayanam = getAyanam(sunNir);
    const { masam, rutu, rashi } = getMasamRutu(sunNir, srJD);
    const tithiAtSr = getTithiIdx(srJD);
    const paksham = getPaksham(tithiAtSr);

    // Multiple elements (direct formula: EndTime = RD / Speed)
    const tithis  = getDayElements(srJD, nextSrJD, getTithiIdx,  i => TITHI[i],  3, 'tithi');
    const naks    = getDayElements(srJD, nextSrJD, getNakIdx,    i => NAKSHATRA[i], 3, 'nakshatra');
    // Compute Nakshatra Padams with independent end times
    const padams  = getDayPadams(srJD, nextSrJD);
    const yogas   = getDayElements(srJD, nextSrJD, getYogaIdx,   i => YOGA[i],   3, 'yoga');
    const karanas = getDayElements(srJD, nextSrJD, getKaranaIdx, i => getKaranaName(i), 4, 'karana');

    // Moonrise / Moonset (altitude-bisection, Surya Siddhanta style)
    const mt = computeMoonTimes(y, m, d, lat, lon, tz);

    // Kalams
    const rahu = getKalam(srHrs, ssHrs, RAHU_PARTS, dow);
    const yama = getKalam(srHrs, ssHrs, YAMAGANDA_PARTS, dow);
    const guli = getKalam(srHrs, ssHrs, GULIKA_PARTS, dow);
    const durm = getDurmuhuratam(srHrs, ssHrs, dow);
    const va = computeVarjyamAmrit(srJD, nextSrJD, tz);
    const abhijit = getAbhijitMuhurat(srHrs, ssHrs, dow);
    // Previous day sunset for Brahma Muhurat night-muhurta calculation
    const prev = new Date(y, m-1, d-1);
    const stPrev = computeSunTimes(prev.getFullYear(), prev.getMonth()+1, prev.getDate(), lat, lon, tz);
    const prevSsHrs = stPrev ? stPrev.sunset : ssHrs;
    const brahma  = getBrahmaMuhurat(srHrs, prevSsHrs);

    // Day significance
    const significance = getDaySignificance(masam, tithiAtSr, naks[0].idx, m, d, dow);

    // ══════ RENDER ══════
    const dstLabel = (cityKey !== 'custom' && isDST(y, m, d, CITIES[cityKey]?.dst || 'none')) ? ' (DST)' : '';
    const tzStr = `UTC${tz >= 0 ? '+' : ''}${tz}${dstLabel}`;

    document.getElementById('dateLocationBar').innerHTML =
        `${locName} &nbsp;|&nbsp; Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}° &nbsp;|&nbsp; ${MONTH_ABBR[m-1]} ${d}, ${y} &nbsp;|&nbsp; ${tzStr}`;

    document.getElementById('valSunrise').textContent  = fmtHMS(srHrs);
    document.getElementById('valSunset').textContent   = fmtHMS(ssHrs);
    document.getElementById('valMoonrise').textContent = mt.moonrise;
    document.getElementById('valMoonset').textContent  = mt.moonset;
    document.getElementById('valSunRashi').textContent = rashi;
    document.getElementById('valMoonRashi').textContent = getMoonRashi(srJD);

    document.getElementById('valSamvatsaram').textContent = samvatsaram;
    document.getElementById('valAyanam').textContent      = ayanam;
    document.getElementById('valRutu').textContent        = rutu;
    document.getElementById('valMasam').textContent       = `${masam} (${rashi})`;
    document.getElementById('valPaksham').textContent     = paksham;
    document.getElementById('valVasara').textContent      = VARA[dow];

    renderList('valTithi', tithis, tz);
    renderList('valNakshatra', naks, tz);

    // Render Nakshatra Padams with their own end times
    const padamEl = document.getElementById('valPadam');
    padamEl.innerHTML = padams.map(p => {
        const endLocal = jdToLocal(p.endJD, tz);
        return `<li><strong>${p.name} — ${p.padam} Padam</strong> <span class="end-info">— ends ${fmtDateTime(endLocal)}</span></li>`;
    }).join('');

    renderList('valYoga', yogas, tz);
    renderList('valKarana', karanas, tz);

    document.getElementById('valRahu').textContent = fmtRange(rahu.start, rahu.end);
    document.getElementById('valYamaganda').textContent = fmtRange(yama.start, yama.end);
    document.getElementById('valGulika').textContent = fmtRange(guli.start, guli.end);

    const dEl = document.getElementById('valDurmuhurat');
    dEl.innerHTML = durm.map(dd => `<li>${fmtRange(dd.start, dd.end)}</li>`).join('');

    if (va.varjyam) {
        const vs = jdToLocal(va.varjyam.start, tz), ve = jdToLocal(va.varjyam.end, tz);
        document.getElementById('valVarjyam').textContent = `${fmtDateTime(vs)} — ${fmtDateTime(ve)}`;
    } else {
        document.getElementById('valVarjyam').textContent = 'None during this day';
    }

    document.getElementById('valAbhijit').textContent = abhijit ? fmtRange(abhijit.start, abhijit.end) : 'None during this day';

    if (va.amrit) {
        const as = jdToLocal(va.amrit.start, tz), ae = jdToLocal(va.amrit.end, tz);
        document.getElementById('valAmrit').textContent = `${fmtDateTime(as)} — ${fmtDateTime(ae)}`;
    } else {
        document.getElementById('valAmrit').textContent = 'None during this day';
    }

    document.getElementById('valBrahma').textContent = fmtRange(brahma.start, brahma.end);
    const vijaya = getVijayaMuhurtam(srHrs, ssHrs);
    document.getElementById('valVijaya').textContent = fmtRange(vijaya.start, vijaya.end);
    const godhuli = getGodhuliMuhurtam(ssHrs);
    document.getElementById('valGodhuli').textContent = fmtRange(godhuli.start, godhuli.end);
    const aparhna = getAparhnaKalam(srHrs, ssHrs);
    document.getElementById('valAparhna').textContent = fmtRange(aparhna.start, aparhna.end);
    const pratah = getPratahSandhya(srHrs);
    document.getElementById('valPratah').textContent = fmtRange(pratah.start, pratah.end);
    const sayam = getSayamSandhya(ssHrs);
    document.getElementById('valSayam').textContent = fmtRange(sayam.start, sayam.end);
    document.getElementById('valImportance').innerHTML = significance.map(s => `• ${s}`).join('<br>');

    // ══════ LAGNA RENDERING ══════
    const lagnaAtSr = computeLagna(srJD, lat, lon);
    const grahas = getNavagrahaPositions(srJD);

    // Lagna details
    document.getElementById('valLagnaRashi').textContent = lagnaAtSr.rashiName;
    document.getElementById('valLagnaDeg').textContent = `${lagnaAtSr.rashiName} ${lagnaAtSr.degStr}`;
    document.getElementById('valLagnaLord').textContent = lagnaAtSr.lord;
    document.getElementById('valSunInRashi').textContent = grahas[0].rashiName;
    document.getElementById('valMoonInRashi').textContent = grahas[1].rashiName;

    // Jagat Lagna & Varsha Lagna
    const jagatInfo = findChaitraAmavasya(y, lat, lon);
    const varshaInfo = findMeshaSankranti(y, lat, lon);
    document.getElementById('valJagatLagna').textContent = `${jagatInfo.lagna.rashiName} ${jagatInfo.lagna.degStr}`;
    document.getElementById('valVarshaLagna').textContent = `${varshaInfo.lagna.rashiName} ${varshaInfo.lagna.degStr}`;

    // SVG Chart — store grahas globally for chart toggle
    window._lagnaChartData = { lagnaIdx: lagnaAtSr.rashiIdx, grahas: grahas };
    const chartStyle = document.getElementById('chartStyleSelect')?.value || 'south';
    if (chartStyle === 'north') {
        document.getElementById('lagnaChart').innerHTML = generateNorthIndianChartSVG(lagnaAtSr.rashiIdx, grahas);
    } else {
        document.getElementById('lagnaChart').innerHTML = generateSouthIndianChartSVG(lagnaAtSr.rashiIdx, grahas);
    }

    // Graha positions table
    let grahaHTML = '<table><tr><th>Graha</th><th>Rashi</th><th>Degree</th></tr>';
    grahas.forEach(g => {
        const degInR = g.deg % 30;
        let dW = Math.floor(degInR);
        let mP = Math.round((degInR - dW) * 60);
        if (mP >= 60) { mP = 0; dW++; }
        grahaHTML += `<tr><td style="color:${g.color};font-weight:bold">${g.full}</td><td>${g.rashiName}</td><td>${dW}°${String(mP).padStart(2,'0')}'</td></tr>`;
    });
    grahaHTML += '</table>';
    document.getElementById('grahaPositions').innerHTML = grahaHTML;

    // Lagna transitions table with start-end times and Pushkaramsha
    const periods = getLagnaTransitions(srJD, nextSrJD, lat, lon, tz);

    // Helper: extract "9:15 AM" from "Aug 21, 2026 9:15:23 AM"
    function extractTime(dtStr) {
        if (dtStr === 'Sunrise') return 'Sunrise';
        const parts = dtStr.split(' ');
        const timeFull = parts[3] || '';
        const ampm = parts[4] || '';
        const hm = timeFull.split(':').slice(0, 2).join(':');
        return `${hm} ${ampm}`;
    }

    let transHTML = '<table><tr><th>Rashi</th><th>Start</th><th>End</th><th>Pushkaramsha</th></tr>';
    periods.forEach(p => {
        const pushWins = getPushkaraWindows(p, lat, lon, tz);
        let pushCol = '—';
        if (pushWins.length > 0) {
            pushCol = pushWins.map(w => 
                `<span class="pushkara-tag" title="Navamsha ${w.navamsha}: ${w.arcSpan}">✦ ${extractTime(w.startTime)} – ${extractTime(w.endTime)}</span>`
            ).join('<br>');
        }
        transHTML += `<tr>
            <td>${p.rashiName}</td>
            <td>${extractTime(p.startTime)}</td>
            <td>${extractTime(p.endTime)}</td>
            <td>${pushCol}</td>
        </tr>`;
    });
    transHTML += '</table>';
    document.getElementById('lagnaTransitions').innerHTML = transHTML;

    document.getElementById('valNote').innerHTML =
        `Panchang timings are calculated for <strong>${locName}</strong> (${tzStr}) with DST adjustment where applicable.`;

    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function renderList(elId, items, tz, showPadam) {
    const el = document.getElementById(elId);
    el.innerHTML = items.map(it => {
        const endLocal = jdToLocal(it.endJD, tz);
        const padamStr = (showPadam && it.padam) ? ` — ${it.padam} Padam` : '';
        return `<li><strong>${it.name}${padamStr}</strong> <span class="end-info">— ends ${fmtDateTime(endLocal)}</span></li>`;
    }).join('');
}

function openPrintModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('printStartDate').value = today;
    // Default end date = 7 days later
    const endD = new Date(); endD.setDate(endD.getDate() + 7);
    document.getElementById('printEndDate').value = endD.toISOString().split('T')[0];
    // Show Ugadi info
    const ugadiDates = findUgadiDates();
    document.getElementById('ugadiInfo').textContent =
        `Current: ${ugadiDates.current.toDateString()} → Next: ${ugadiDates.next.toDateString()}`;
    const modal = document.getElementById('printModal');
    modal.style.display = 'flex';
}
function closePrintModal() {
    document.getElementById('printModal').style.display = 'none';
}

function findUgadiDates() {
    const now = new Date();
    const y = now.getFullYear();

    function findChaitraNewMoon(year) {
        // Chaitra starts after New Moon when Sun is in Meena (Pisces, 330°-360°)
        // Search Feb-April for the New Moon (minimum elongation day)
        let bestJD = null, bestElong = 999;
        for (let m = 2; m <= 4; m++) {
            for (let d = 1; d <= 31; d++) {
                try {
                    const dt = new Date(year, m - 1, d);
                    if (dt.getMonth() !== m - 1) continue;
                    const jd = dateToJD(year, m, d) + 0.25;
                    const moonNir = getMoonNirayana(jd);
                    const sunNir = getSunNirayana(jd);
                    const elong = ((moonNir - sunNir + 360) % 360);
                    const sunRi = Math.floor(sunNir / 30);
                    // Sun must be in Meena (index 11) and elongation near minimum
                    if (sunRi === 11 && elong < bestElong && elong < 15) {
                        bestElong = elong;
                        bestJD = { year, m, d };
                    }
                } catch(e) { continue; }
            }
        }
        // Also check when elongation wraps (Moon just passed Sun, elong > 345°)
        for (let m = 2; m <= 4; m++) {
            for (let d = 1; d <= 31; d++) {
                try {
                    const dt = new Date(year, m - 1, d);
                    if (dt.getMonth() !== m - 1) continue;
                    const jd = dateToJD(year, m, d) + 0.25;
                    const moonNir = getMoonNirayana(jd);
                    const sunNir = getSunNirayana(jd);
                    const elong = ((moonNir - sunNir + 360) % 360);
                    const sunRi = Math.floor(sunNir / 30);
                    if (sunRi === 11 && elong > 345 && (360 - elong) < bestElong) {
                        bestElong = 360 - elong;
                        bestJD = { year, m, d };
                    }
                } catch(e) { continue; }
            }
        }
        if (bestJD) {
            // Ugadi = day after Amavasya
            return new Date(bestJD.year, bestJD.m - 1, bestJD.d + 1);
        }
        return new Date(year, 2, 22); // fallback
    }

    const current = findChaitraNewMoon(y);
    const next = findChaitraNewMoon(y + 1);

    if (current > now) {
        return { current: findChaitraNewMoon(y - 1), next: current };
    }
    return { current, next };
}

function computeDayData(y, m, d) {
    const cityKey = document.getElementById('citySelect').value;
    let lat, lon, tz, locName;
    if (cityKey === 'custom') {
        lat = parseFloat(document.getElementById('latInput').value);
        lon = parseFloat(document.getElementById('lonInput').value);
        tz  = parseFloat(document.getElementById('tzInput').value);
        locName = 'Custom Location';
    } else {
        const c = CITIES[cityKey];
        lat = c.lat; lon = c.lon;
        tz = isDST(y, m, d, c.dst || 'none') ? c.dstTz : c.stdTz;
        locName = c.name;
    }

    const srJD = localToJD(y, m, d, 6, tz);
    const st = computeSunTimes(y, m, d, lat, lon, tz);
    if (!st) return null;
    const srHrs = st.sunrise, ssHrs = st.sunset;
    const sunNir = getSunNirayana(srJD);
    const dow = new Date(y, m-1, d).getDay();
    const nextSrJD = localToJD(y, m, d+1, 6, tz);

    let samvatsaram='', ayanam='', masam='', rutu='', rashi='', paksham='';
    try { samvatsaram = getSamvatsaram(y, m, srJD); } catch(e) { samvatsaram = '\u2014'; }
    try { ayanam = getAyanam(sunNir); } catch(e) { ayanam = '\u2014'; }
    try {
        const mr = getMasamRutu(sunNir, srJD);
        masam = mr.masam; rutu = mr.rutu; rashi = mr.rashi;
    } catch(e) {
        masam = '\u2014'; rutu = '\u2014';
        try { rashi = RASHI[Math.floor(sunNir / 30)]; } catch(e2) { rashi = '\u2014'; }
    }

    let tithiAtSr = 0;
    try { tithiAtSr = getTithiIdx(srJD); } catch(e) {}
    try { paksham = getPaksham(tithiAtSr); } catch(e) { paksham = '\u2014'; }

    let tithis=[], naks=[], yogas=[], karanas=[];
    try { tithis = getDayElements(srJD, nextSrJD, getTithiIdx, i => TITHI[i], 3, 'tithi'); } catch(e) { tithis = [{name:'\u2014', endJD:nextSrJD}]; }
    try { naks = getDayElements(srJD, nextSrJD, getNakIdx, i => NAKSHATRA[i], 3, 'nakshatra'); } catch(e) { naks = [{name:'\u2014', endJD:nextSrJD}]; }
    try { yogas = getDayElements(srJD, nextSrJD, getYogaIdx, i => YOGA[i], 3, 'yoga'); } catch(e) { yogas = [{name:'\u2014', endJD:nextSrJD}]; }
    try { karanas = getDayElements(srJD, nextSrJD, getKaranaIdx, i => getKaranaName(i), 4, 'karana'); } catch(e) { karanas = [{name:'\u2014', endJD:nextSrJD}]; }

    let mt = { moonrise: '\u2014', moonset: '\u2014' };
    try { mt = computeMoonTimes(y, m, d, lat, lon, tz); } catch(e) {}

    let rahu={start:0,end:0}, yama={start:0,end:0}, durm=[], abhijit=null, va={};
    try { rahu = getKalam(srHrs, ssHrs, RAHU_PARTS, dow); } catch(e) {}
    try { yama = getKalam(srHrs, ssHrs, YAMAGANDA_PARTS, dow); } catch(e) {}
    try { durm = getDurmuhuratam(srHrs, ssHrs, dow); } catch(e) { durm = []; }
    try { abhijit = getAbhijitMuhurat(srHrs, ssHrs, dow); } catch(e) {}
    try { va = computeVarjyamAmrit(srJD, nextSrJD, tz); } catch(e) { va = {}; }

    let moonRashi = '\u2014';
    try { moonRashi = getMoonRashi(srJD); } catch(e) {}

    return {
        y, m, d, tz, locName, dow, srHrs, ssHrs, srJD,
        samvatsaram, ayanam, masam, rutu, rashi, paksham,
        tithis, naks, yogas, karanas, mt, moonRashi,
        rahu, yama, durm, abhijit, va, VARA_name: VARA[dow]
    };
}

function fmtEndTimeSimple(endJD, tz) {
    const d = jdToLocal(endJD, tz);
    return fmtDateTime(d);
}

function generatePrintPage(data) {
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateStr = `${MONTH_NAMES[data.m-1]} ${data.d}, ${data.y}`;

    let tithiRows = data.tithis.map(t => `<tr><td>Tithi</td><td>${t.name}</td><td>ends ${fmtEndTimeSimple(t.endJD, data.tz)}</td></tr>`).join('');
    let nakRows = data.naks.map(n => `<tr><td>Nakshatra</td><td>${n.name}</td><td>ends ${fmtEndTimeSimple(n.endJD, data.tz)}</td></tr>`).join('');
    let yogaRows = data.yogas.map(y => `<tr><td>Yoga</td><td>${y.name}</td><td>ends ${fmtEndTimeSimple(y.endJD, data.tz)}</td></tr>`).join('');
    let karanaRows = data.karanas.map(k => `<tr><td>Karana</td><td>${k.name}</td><td>ends ${fmtEndTimeSimple(k.endJD, data.tz)}</td></tr>`).join('');

    let amritStr = 'None';
    if (data.va.amrit) {
        const as = jdToLocal(data.va.amrit.start, data.tz), ae = jdToLocal(data.va.amrit.end, data.tz);
        amritStr = `${fmtDateTime(as)} — ${fmtDateTime(ae)}`;
    }
    let durmStr = data.durm.map(dd => fmtRange(dd.start, dd.end)).join(', ');

    return `
    <div class="print-day">
        <div class="print-watermark">PANYAM PANCHANGAM</div>
        <div class="print-header">
            <h2>PANYAM PANCHANGAM</h2>
            <p class="print-date">${dateStr}</p>
            <p class="print-indian">${data.masam} | ${data.paksham} | ${data.samvatsaram}</p>
            <p class="print-loc">${data.locName}</p>
        </div>
        <table class="print-table">
            <tr><td><strong>Vasara</strong></td><td colspan="2">${data.VARA_name}</td></tr>
            ${tithiRows}
            ${nakRows}
            ${yogaRows}
            ${karanaRows}
        </table>
        <h4>Sun & Moon</h4>
        <table class="print-table">
            <tr><td>Sunrise</td><td>${fmtHMS(data.srHrs)}</td><td>Sunset</td><td>${fmtHMS(data.ssHrs)}</td></tr>
            <tr><td>Moonrise</td><td>${data.mt.moonrise}</td><td>Moonset</td><td>${data.mt.moonset}</td></tr>
            <tr><td>Sun Rashi</td><td>${data.rashi}</td><td>Moon Rashi</td><td>${data.moonRashi}</td></tr>
        </table>
        <h4>Times</h4>
        <table class="print-table">
            <tr><td>❌ Rahu Kalam</td><td>${fmtRange(data.rahu.start, data.rahu.end)}</td></tr>
            <tr><td>❌ Yamaganda</td><td>${fmtRange(data.yama.start, data.yama.end)}</td></tr>
            <tr><td>❌ Durmuhuratam</td><td>${durmStr}</td></tr>
            <tr><td>✔ Abhijit Muhurat</td><td>${data.abhijit ? fmtRange(data.abhijit.start, data.abhijit.end) : 'None'}</td></tr>
            <tr><td>✔ Amrit Kalam</td><td>${amritStr}</td></tr>
        </table>
    </div>`;
}

async function printDateRange() {
    const start = new Date(document.getElementById('printStartDate').value);
    const end = new Date(document.getElementById('printEndDate').value);
    if (isNaN(start) || isNaN(end) || start > end) {
        alert('Please select valid start and end dates.');
        return;
    }
    await generateAndPrint(start, end);
}

async function printFullYear() {
    const ugadi = findUgadiDates();
    await generateAndPrint(ugadi.current, ugadi.next);
}

async function generateAndPrint(startDate, endDate) {
    const progress = document.getElementById('printProgress');
    const bar = document.getElementById('printProgressBar');
    const text = document.getElementById('printProgressText');
    progress.style.display = 'block';

    const totalDays = Math.round((endDate - startDate) / 86400000) + 1;
    let pages = '';

    for (let i = 0; i < totalDays; i++) {
        const dt = new Date(startDate);
        dt.setDate(dt.getDate() + i);
        const y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate();

        try {
            const data = computeDayData(y, m, d);
            if (data) pages += generatePrintPage(data);
        } catch(e) {
            console.warn(`Skipping ${y}-${m}-${d}:`, e);
        }

        const pct = Math.round(((i + 1) / totalDays) * 100);
        bar.style.width = pct + '%';
        text.textContent = `Generating day ${i + 1} of ${totalDays}...`;

        // Yield to UI every 5 days
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
    }

    // Open print window
    const printWin = window.open('', '_blank');
    printWin.document.write(`<!DOCTYPE html><html><head><title>Panyam Panchangam</title>
    <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Georgia', 'Times New Roman', serif; color: #000; margin: 0; padding: 0; }
        .print-day { position: relative; page-break-after: always; padding: 20px 0; overflow: hidden; }
        .print-day:last-child { page-break-after: auto; }
        .print-watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px; font-weight: bold; color: rgba(0,0,0,0.06);
            white-space: nowrap; pointer-events: none; z-index: 0;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .print-header { text-align: center; position: relative; z-index: 1; margin-bottom: 15px; }
        .print-header h2 { margin: 0 0 5px; font-size: 22px; letter-spacing: 2px; }
        .print-date { font-size: 16px; margin: 2px 0; }
        .print-indian { font-size: 14px; color: #333; margin: 2px 0; }
        .print-loc { font-size: 13px; color: #555; margin: 2px 0; }
        .print-table { width: 100%; border-collapse: collapse; position: relative; z-index: 1; margin-bottom: 12px; }
        .print-table td { padding: 5px 8px; border: 1px solid #ccc; font-size: 13px; }
        .print-table tr:nth-child(even) { background: #f9f9f9; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        h4 { margin: 10px 0 5px; font-size: 14px; position: relative; z-index: 1; }
    </style></head><body>${pages}</body></html>`);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);

    progress.style.display = 'none';
    bar.style.width = '0%';
    closePrintModal();
}

async function exportICal() {
    const ugadi = findUgadiDates();
    const start = ugadi.current;
    const end = ugadi.next;
    const totalDays = Math.round((end - start) / 86400000) + 1;

    // Debug: show what dates we found
    console.log('Ugadi Current:', start.toDateString(), 'Next:', end.toDateString(), 'Total days:', totalDays);

    // Show progress in a simple overlay
    const overlay = document.createElement('div');
    overlay.id = 'icalOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `<div style="background:#fff;padding:30px;border-radius:10px;text-align:center;font-family:'EB Garamond',serif;"><h3 style="color:#4a0e0e;margin-bottom:10px;">Generating iCal (${totalDays} days)...</h3><div style="background:#eee;border-radius:4px;height:20px;overflow:hidden;width:300px;"><div id="icalBar" style="background:#4a0e0e;height:100%;width:0%;transition:width 0.3s;"></div></div><p id="icalText" style="font-size:0.85rem;color:#666;margin-top:6px;">Starting...</p></div>`;
    document.body.appendChild(overlay);

    let eventCount = 0, skipCount = 0, firstError = '';

    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Panyam Panchangam//EN\r\nCALSCALE:GREGORIAN\r\n';

    for (let i = 0; i < totalDays; i++) {
        const dt = new Date(start);
        dt.setDate(dt.getDate() + i);
        const y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate();

        try {
            const data = computeDayData(y, m, d);
            if (data) {
                const dateStr = `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
                const tithiName = data.tithis[0] ? data.tithis[0].name : '';
                const nakName = data.naks[0] ? data.naks[0].name : '';
                const yogaName = data.yogas[0] ? data.yogas[0].name : '';
                const karanaName = data.karanas[0] ? data.karanas[0].name : '';
                const varaShort = VARA[data.dow].split(' (')[0];
                const summary = `${varaShort} | ${tithiName} | ${nakName}`;
                let desc = `== PANYAM PANCHANGAM ==`;
                desc += `\\n${data.samvatsaram} | ${data.masam} | ${data.paksham} | ${data.rutu}`;
                desc += `\\n`;
                desc += `\\n-- Pancha Angam --`;
                desc += `\\nVasara: ${data.VARA_name}`;
                desc += `\\nTithi: ${tithiName}`;
                desc += `\\nNakshatra: ${nakName}`;
                desc += `\\nYoga: ${yogaName}`;
                desc += `\\nKarana: ${karanaName}`;
                desc += `\\n`;
                desc += `\\n-- Sun & Moon --`;
                desc += `\\nSunrise: ${fmtHMS(data.srHrs)} | Sunset: ${fmtHMS(data.ssHrs)}`;
                desc += `\\nMoonrise: ${data.mt.moonrise} | Moonset: ${data.mt.moonset}`;
                desc += `\\nSun Rashi: ${data.rashi} | Moon Rashi: ${data.moonRashi}`;
                desc += `\\n`;
                desc += `\\n-- Inauspicious --`;
                const durmStr = data.durm.map(dd => fmtRange(dd.start, dd.end)).join(', ');
                desc += `\\nRahu Kalam: ${fmtRange(data.rahu.start, data.rahu.end)}`;
                desc += `\\nYamaganda: ${fmtRange(data.yama.start, data.yama.end)}`;
                desc += `\\nDurmuhuratam: ${durmStr}`;
                desc += `\\n`;
                desc += `\\n-- Auspicious --`;
                desc += `\\nAbhijit: ${data.abhijit ? fmtRange(data.abhijit.start, data.abhijit.end) : 'None'}`;
                try {
                    if (data.va && data.va.amrit && data.va.amrit.start && data.va.amrit.end) {
                        const as2 = jdToLocal(data.va.amrit.start, data.tz);
                        const ae2 = jdToLocal(data.va.amrit.end, data.tz);
                        if (as2 && ae2 && typeof as2.getHours === "function") {
                            desc += `\\\\nAmrit Kalam: ${fmtHMS(as2.getHours()+as2.getMinutes()/60+as2.getSeconds()/3600)} - ${fmtHMS(ae2.getHours()+ae2.getMinutes()/60+ae2.getSeconds()/3600)}`;
                        }
                    }
                } catch(ev) {}
                try {
                    if (data.va && data.va.varjyam && data.va.varjyam.start && data.va.varjyam.end) {
                        const vs2 = jdToLocal(data.va.varjyam.start, data.tz);
                        const ve2 = jdToLocal(data.va.varjyam.end, data.tz);
                        if (vs2 && ve2 && typeof vs2.getHours === "function") {
                            desc += `\\\\nVarjyam: ${fmtHMS(vs2.getHours()+vs2.getMinutes()/60+vs2.getSeconds()/3600)} - ${fmtHMS(ve2.getHours()+ve2.getMinutes()/60+ve2.getSeconds()/3600)}`;
                        }
                    }
                } catch(ev) {}
                const uid = `${dateStr}-panyam@vedicsamhita.com`;
                ical += 'BEGIN:VEVENT\r\n';
                ical += 'DTSTART;VALUE=DATE:' + dateStr + '\r\n';
                ical += 'DTEND;VALUE=DATE:' + dateStr + '\r\n';
                ical += 'UID:' + uid + '\r\n';
                ical += 'SUMMARY:' + summary + '\r\n';
                ical += 'DESCRIPTION:' + desc + '\r\n';
                ical += 'LOCATION:' + data.locName + '\r\n';
                ical += 'END:VEVENT\r\n';
                eventCount++;
            }
        } catch(e) {
            console.warn(`Skipping ${y}-${m}-${d}:`, e);
            skipCount++;
            if (skipCount === 1) firstError = `${y}-${m}-${d}: ${e.message}`;
        }

        // Update progress
        const pct = Math.round(((i + 1) / totalDays) * 100);
        document.getElementById('icalBar').style.width = pct + '%';
        document.getElementById('icalText').textContent = `Day ${i + 1} of ${totalDays}...`;
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
    }

    ical += 'END:VCALENDAR\r\n';

    console.log(`iCal complete: ${eventCount} events, ${skipCount} skipped out of ${totalDays} days`);
    let msg = `iCal Generated!\n\nUgadi: ${start.toDateString()} → ${end.toDateString()}\nTotal days: ${totalDays}\nEvents created: ${eventCount}\nSkipped (errors): ${skipCount}`;
    if (firstError) msg += `\n\nFirst error:\n${firstError}`;
    alert(msg);

    // Download the file
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panyam_panchangam.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Remove overlay
    document.body.removeChild(overlay);
}

function onCityChange() {
    document.getElementById('customCoords').style.display =
        document.getElementById('citySelect').value === 'custom' ? 'grid' : 'none';
}

window.onload = function() {
    document.getElementById('datePicker').value = new Date().toISOString().split('T')[0];
    calculatePanchangam();
};

// Chart style toggle
function toggleChartStyle() {
    const style = document.getElementById('chartStyleSelect').value;
    const data = window._lagnaChartData;
    if (!data) return;
    if (style === 'north') {
        document.getElementById('lagnaChart').innerHTML = generateNorthIndianChartSVG(data.lagnaIdx, data.grahas);
    } else {
        document.getElementById('lagnaChart').innerHTML = generateSouthIndianChartSVG(data.lagnaIdx, data.grahas);
    }
}
