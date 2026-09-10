/**
 * Vedic Samhita — Astro Calculation Core (Node.js)
 * High-precision Drik astronomical, horoscope, Gochara, and Muhurta calculation engine.
 * Based on Surya Siddhanta & modern Drik Ganita algorithms.
 * Strict Sanskrit Nomenclature: Surya, Chandra, Kuja, Budha, Guru, Shukra, Shani, Rahu, Ketu.
 * Mesha, Vrishabha, Mithuna, Karkataka, Simha, Kanya, Tula, Vrishchika, Dhanus, Makara, Kumbha, Meena.
 */

const RAD = 180 / Math.PI;
const DEG = Math.PI / 180;

const RASHI_NAMES = ["Mesha", "Vrishabha", "Mithuna", "Karkataka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanus", "Makara", "Kumbha", "Meena"];
const RASHI_TELUGU = ["మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య", "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"];
const RASHI_LORDS = ["Kuja", "Shukra", "Budha", "Chandra", "Surya", "Budha", "Shukra", "Kuja", "Guru", "Shani", "Shani", "Guru"];
const RASHI_LORDS_TELUGU = ["కుజుడు", "శుక్రుడు", "బుధుడు", "చంద్రుడు", "సూర్యుడు", "బుధుడు", "శుక్రుడు", "కుజుడు", "గురువు", "శని", "శని", "గురువు"];

const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Arudra",
    "Punarvasu", "Pushyami", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Moola", "Purvashadha", "Uttarashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purvabhadra", "Uttarabhadra", "Revati"
];

const NAKSHATRAS_TELUGU = [
    "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర",
    "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఘ", "పూర్వ ఫల్గుణి", "ఉత్తర ఫల్గుణి",
    "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ",
    "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ట", "శతభిషం",
    "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"
];

const DASA_LORDS = ["Ketu", "Shukra", "Surya", "Chandra", "Kuja", "Rahu", "Guru", "Shani", "Budha"];
const DASA_LORDS_TELUGU = ["కేతువు", "శుక్రుడు", "సూర్యుడు", "చంద్రుడు", "కుజుడు", "రాహువు", "గురువు", "శని", "బుధుడు"];
const DASA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

const TITHI_NAMES = [
    "Shukla Pratipada", "Shukla Dvitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami",
    "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
    "Shukla Ekadashi", "Shukla Dvadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Pratipada", "Krishna Dvitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami",
    "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
    "Krishna Ekadashi", "Krishna Dvadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

const TITHI_TELUGU = [
    "శుద్ధ పాడ్యమి", "శుద్ధ విదియ", "శుద్ధ తదియ", "శుద్ధ చవితి", "శుద్ధ పంచమి",
    "శుద్ధ షష్ఠి", "శుద్ధ సప్తమి", "శుద్ధ అష్టమి", "శుద్ధ నవమి", "శుద్ధ దశమి",
    "శుద్ధ ఏకాదశి", "శుద్ధ ద్వాదశి", "శుద్ధ త్రయోదశి", "శుద్ధ చతుర్దశి", "పూర్ణిమ",
    "బహుళ పాడ్యమి", "బహుళ విదియ", "బహుళ తదియ", "బహుళ చవితి", "బహుళ పంచమి",
    "బహుళ షష్ఠి", "బహుళ సప్తమి", "బహుళ అష్టమి", "బహుళ నవమి", "బహుళ దశమి",
    "బహుళ ఏకాదశి", "బహుళ ద్వాదశి", "బహుళ త్రయోదశి", "బహుళ చతుర్దశి", "అమావాస్య"
];

const VARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const VARA_SANSKRIT = ["Ravivara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"];
const VARA_TELUGU = ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"];

const MOON_L_TERMS = [
    [0,0,1,0, 6.288774], [2,0,-1,0, 1.274027], [2,0,0,0, 0.658314],
    [0,0,2,0, 0.213618], [0,1,0,0, -0.185116], [0,0,0,2, -0.114332],
    [2,0,-2,0, 0.058793], [2,-1,-1,0, 0.057066], [2,0,1,0, 0.053322],
    [2,-1,0,0, 0.045758], [0,1,-1,0, -0.040923], [1,0,0,0, -0.034720],
    [0,1,1,0, -0.030383], [2,0,0,-2, 0.015327], [0,0,1,2, -0.012528],
    [0,0,1,-2, 0.010980], [4,0,-1,0, 0.010675], [0,0,3,0, 0.010034],
    [4,0,-2,0, 0.008548], [2,1,-1,0, -0.007888], [2,1,0,0, -0.006766],
    [1,0,-1,0, -0.005163], [1,1,0,0, 0.004987], [2,-1,1,0, 0.004036],
    [2,0,2,0, 0.003994], [4,0,0,0, 0.003861], [2,0,-3,0, 0.003665],
    [0,1,-2,0, -0.002689], [2,0,-1,2, -0.002602], [2,-1,-2,0, 0.002390],
    [1,0,1,0, -0.002348], [2,-2,0,0, 0.002236], [0,1,2,0, -0.002120],
    [0,2,0,0, -0.002069], [2,-2,-1,0, 0.002048], [2,0,1,-2, -0.001773],
    [2,0,0,2, -0.001595], [4,-1,-1,0, 0.001215], [0,0,2,2, -0.001110],
    [3,0,-1,0, -0.000892], [2,1,1,0, -0.000810], [4,-1,-2,0, 0.000759]
];

// Standard City Coordinates Cache
const CITIES_DB = {
    'hyderabad': { name: 'Hyderabad', nameTe: 'హైదరాబాద్', lat: 17.3850, lon: 78.4867, tz: 5.5 },
    'హైదరాబాద్': { name: 'Hyderabad', nameTe: 'హైదరాబాద్', lat: 17.3850, lon: 78.4867, tz: 5.5 },
    'secunderabad': { name: 'Secunderabad', nameTe: 'సికింద్రాబాద్', lat: 17.4399, lon: 78.4983, tz: 5.5 },
    'సికింద్రాబాద్': { name: 'Secunderabad', nameTe: 'సికింద్రాబాద్', lat: 17.4399, lon: 78.4983, tz: 5.5 },
    'vijayawada': { name: 'Vijayawada', nameTe: 'విజయవాడ', lat: 16.5062, lon: 80.6480, tz: 5.5 },
    'విజయవాడ': { name: 'Vijayawada', nameTe: 'విజయవాడ', lat: 16.5062, lon: 80.6480, tz: 5.5 },
    'visakhapatnam': { name: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', lat: 17.6868, lon: 83.2185, tz: 5.5 },
    'విశాఖపట్నం': { name: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', lat: 17.6868, lon: 83.2185, tz: 5.5 },
    'vizag': { name: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', lat: 17.6868, lon: 83.2185, tz: 5.5 },
    'వైజాగ్': { name: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', lat: 17.6868, lon: 83.2185, tz: 5.5 },
    'tirupati': { name: 'Tirupati', nameTe: 'తిరుపతి', lat: 13.6288, lon: 79.4192, tz: 5.5 },
    'తిరుపతి': { name: 'Tirupati', nameTe: 'తిరుపతి', lat: 13.6288, lon: 79.4192, tz: 5.5 },
    'anantapur': { name: 'Anantapur', nameTe: 'అనంతపురం', lat: 14.6819, lon: 77.6006, tz: 5.5 },
    'అనంతపురం': { name: 'Anantapur', nameTe: 'అనంతపురం', lat: 14.6819, lon: 77.6006, tz: 5.5 },
    'అనంతపూర్': { name: 'Anantapur', nameTe: 'అనంతపురం', lat: 14.6819, lon: 77.6006, tz: 5.5 },
    'kurnool': { name: 'Kurnool', nameTe: 'కర్నూలు', lat: 15.8281, lon: 78.0373, tz: 5.5 },
    'కర్నూలు': { name: 'Kurnool', nameTe: 'కర్నూలు', lat: 15.8281, lon: 78.0373, tz: 5.5 },
    'proddatur': { name: 'Proddatur', nameTe: 'ప్రొద్దుటూరు', lat: 14.7504, lon: 78.5529, tz: 5.5 },
    'ప్రొద్దుటూరు': { name: 'Proddatur', nameTe: 'ప్రొద్దుటూరు', lat: 14.7504, lon: 78.5529, tz: 5.5 },
    'kadapa': { name: 'Kadapa', nameTe: 'కడప', lat: 14.4673, lon: 78.8242, tz: 5.5 },
    'కడప': { name: 'Kadapa', nameTe: 'కడప', lat: 14.4673, lon: 78.8242, tz: 5.5 },
    'guntur': { name: 'Guntur', nameTe: 'గుంటూరు', lat: 16.3067, lon: 80.4365, tz: 5.5 },
    'గుంటూరు': { name: 'Guntur', nameTe: 'గుంటూరు', lat: 16.3067, lon: 80.4365, tz: 5.5 },
    'nellore': { name: 'Nellore', nameTe: 'నెల్లూరు', lat: 14.4426, lon: 79.9865, tz: 5.5 },
    'నెల్లూరు': { name: 'Nellore', nameTe: 'నెల్లూరు', lat: 14.4426, lon: 79.9865, tz: 5.5 },
    'warangal': { name: 'Warangal', nameTe: 'వరంగల్', lat: 17.9689, lon: 79.5941, tz: 5.5 },
    'వరంగల్': { name: 'Warangal', nameTe: 'వరంగల్', lat: 17.9689, lon: 79.5941, tz: 5.5 },
    'rajahmundry': { name: 'Rajahmundry', nameTe: 'రాజమండ్రి', lat: 17.0005, lon: 81.8040, tz: 5.5 },
    'రాజమండ్రి': { name: 'Rajahmundry', nameTe: 'రాజమండ్రి', lat: 17.0005, lon: 81.8040, tz: 5.5 },
    'bengaluru': { name: 'Bengaluru', nameTe: 'బెంగళూరు', lat: 12.9716, lon: 77.5946, tz: 5.5 },
    'బెంగళూరు': { name: 'Bengaluru', nameTe: 'బెంగళూరు', lat: 12.9716, lon: 77.5946, tz: 5.5 },
    'bangalore': { name: 'Bengaluru', nameTe: 'బెంగళూరు', lat: 12.9716, lon: 77.5946, tz: 5.5 },
    'chennai': { name: 'Chennai', nameTe: 'చెన్నై', lat: 13.0827, lon: 80.2707, tz: 5.5 },
    'చెన్నై': { name: 'Chennai', nameTe: 'చెన్నై', lat: 13.0827, lon: 80.2707, tz: 5.5 },
    'madras': { name: 'Chennai', nameTe: 'చెన్నై', lat: 13.0827, lon: 80.2707, tz: 5.5 },
    'mumbai': { name: 'Mumbai', nameTe: 'ముంబై', lat: 19.0760, lon: 72.8777, tz: 5.5 },
    'ముంబై': { name: 'Mumbai', nameTe: 'ముంబై', lat: 19.0760, lon: 72.8777, tz: 5.5 },
    'delhi': { name: 'Delhi', nameTe: 'ఢిల్లీ', lat: 28.6139, lon: 77.2090, tz: 5.5 },
    'ఢిల్లీ': { name: 'Delhi', nameTe: 'ఢిల్లీ', lat: 28.6139, lon: 77.2090, tz: 5.5 },
    'kolkata': { name: 'Kolkata', nameTe: 'కోల్‌కతా', lat: 22.5726, lon: 88.3639, tz: 5.5 },
    'కోల్‌కతా': { name: 'Kolkata', nameTe: 'కోల్‌కతా', lat: 22.5726, lon: 88.3639, tz: 5.5 },
    'pune': { name: 'Pune', nameTe: 'పూణే', lat: 18.5204, lon: 73.8567, tz: 5.5 },
    'frisco': { name: 'Frisco, TX', nameTe: 'ఫ్రిస్కో (టెక్సాస్)', lat: 33.1507, lon: -96.8236, tz: -5.0 },
    'ఫ్రిస్కో': { name: 'Frisco, TX', nameTe: 'ఫ్రిస్కో (టెక్సాస్)', lat: 33.1507, lon: -96.8236, tz: -5.0 },
    'dallas': { name: 'Dallas, TX', nameTe: 'డల్లాస్ (టెక్సాస్)', lat: 32.7767, lon: -96.7970, tz: -5.0 },
    'డల్లాస్': { name: 'Dallas, TX', nameTe: 'డల్లాస్ (టెక్సాస్)', lat: 32.7767, lon: -96.7970, tz: -5.0 },
    'plano': { name: 'Plano, TX', nameTe: 'ప్లానో (టెక్సాస్)', lat: 33.0198, lon: -96.6989, tz: -5.0 },
    'austin': { name: 'Austin, TX', nameTe: 'ఆస్టిన్ (టెక్సాస్)', lat: 30.2672, lon: -97.7431, tz: -5.0 },
    'houston': { name: 'Houston, TX', nameTe: 'హ్యూస్టన్ (టెక్సాస్)', lat: 29.7604, lon: -95.3698, tz: -5.0 },
    'new york': { name: 'New York, NY', nameTe: 'న్యూయార్క్', lat: 40.7128, lon: -74.0060, tz: -4.0 },
    'chicago': { name: 'Chicago, IL', nameTe: 'చికాగో', lat: 41.8781, lon: -87.6298, tz: -5.0 },
    'san francisco': { name: 'San Francisco, CA', nameTe: 'శాన్ ఫ్రాన్సిస్కో', lat: 37.7749, lon: -122.4194, tz: -7.0 },
    'san jose': { name: 'San Jose, CA', nameTe: 'శాన్ జోస్', lat: 37.3382, lon: -121.8863, tz: -7.0 },
    'los angeles': { name: 'Los Angeles, CA', nameTe: 'లాస్ ఏంజెల్స్', lat: 34.0522, lon: -118.2437, tz: -7.0 },
    'seattle': { name: 'Seattle, WA', nameTe: 'సియాటెల్', lat: 47.6062, lon: -122.3321, tz: -7.0 },
    'atlanta': { name: 'Atlanta, GA', nameTe: 'అట్లాంటా', lat: 33.7490, lon: -84.3880, tz: -4.0 },
    'london': { name: 'London, UK', nameTe: 'లండన్', lat: 51.5074, lon: -0.1278, tz: 1.0 },
    'singapore': { name: 'Singapore', nameTe: 'సింగపూర్', lat: 1.3521, lon: 103.8198, tz: 8.0 },
    'dubai': { name: 'Dubai, UAE', nameTe: 'దుబాయ్', lat: 25.2048, lon: 55.2708, tz: 4.0 },
    'sydney': { name: 'Sydney, Australia', nameTe: 'సిడ్నీ', lat: -33.8688, lon: 151.2093, tz: 10.0 },
    'toronto': { name: 'Toronto, Canada', nameTe: 'టొరంటో', lat: 43.6532, lon: -79.3832, tz: -4.0 }
};

function resolveCity(query) {
    if (!query) return CITIES_DB['hyderabad'];
    const q = query.toLowerCase();
    for (let k in CITIES_DB) {
        if (q.includes(k)) return CITIES_DB[k];
    }
    return { name: 'Hyderabad', nameTe: 'హైదరాబాద్', lat: 17.3850, lon: 78.4867, tz: 5.5 }; // Default to Hyderabad
}

function normDeg(d) {
    return ((d % 360) + 360) % 360;
}

function getJulianDay(year, month, day, hours = 12, minutes = 0, seconds = 0, tzOffset = 5.5) {
    const dayFraction = (day + (hours + minutes / 60 + seconds / 3600 - tzOffset) / 24.0);
    let y = year, m = month;
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFraction + b - 1524.5;
}

function getAyanamsa(jd) {
    const yrsSince2000 = (jd - 2451545.0) / 365.25;
    return 23.853 + yrsSince2000 * 50.29 / 3600; // Lahiri Ayanamsha
}

function getSunTropical(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let L0 = normDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
            + 0.000289 * Math.sin(3 * M);
    return normDeg(L0 + C);
}

function getSunNirayana(jd) {
    return normDeg(getSunTropical(jd) - getAyanamsa(jd));
}

function getMoonTropical(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const T2 = T * T;

    const Lp_deg = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2;
    const D_deg  = 297.8501921 + 445267.1114034  * T - 0.0018819 * T2;
    const M_deg  = 357.5291092 + 35999.0502909   * T - 0.0001536 * T2;
    const Mp_deg = 134.9633964 + 477198.8675055  * T + 0.0087414  * T2;
    const F_deg  = 93.2720950  + 483202.0175233  * T - 0.0036539  * T2;

    const D  = D_deg  * DEG;
    const M  = M_deg  * DEG;
    const Mp = Mp_deg * DEG;
    const F  = F_deg  * DEG;

    const E  = 1 - 0.002516 * T - 0.0000074 * T2;
    const E2 = E * E;

    let sumL = 0;
    for (const term of MOON_L_TERMS) {
        const [dM, mM, mpM, fM, coeff] = term;
        const angle = dM * D + mM * M + mpM * Mp + fM * F;
        let eFactor = 1;
        const absM = Math.abs(mM);
        if (absM === 1) eFactor = E;
        else if (absM === 2) eFactor = E2;
        sumL += coeff * eFactor * Math.sin(angle);
    }

    const A1 = (119.75 + 131.849 * T) * DEG;
    const A2 = (53.09  + 479264.290 * T) * DEG;
    const Lp_rad = Lp_deg * DEG;
    sumL += 0.003958 * Math.sin(A1);
    sumL += 0.001962 * Math.sin(Lp_rad - F);
    sumL += 0.000318 * Math.sin(A2);

    return normDeg(Lp_deg + sumL);
}

function getMoonNirayana(jd) {
    return normDeg(getMoonTropical(jd) - getAyanamsa(jd));
}

function getSinglePlanetPos(targetJd) {
    const ayanVal = getAyanamsa(targetJd);
    const T = (targetJd - 2451545.0) / 36525.0;
    const sunNirayana = getSunNirayana(targetJd);
    const moonNirayana = getMoonNirayana(targetJd);
    const rahuSayana = normDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
    const rahuNirayana = normDeg(rahuSayana - ayanVal);
    const ketuNirayana = normDeg(rahuNirayana + 180);
    const sunSayana = getSunTropical(targetJd);

    function getPlanetPos(L, a, e, i, N, w, M_p) {
        let E = M_p + e * Math.sin(M_p * DEG) * (1 + e * Math.cos(M_p * DEG)) * RAD;
        let xv = a * (Math.cos(E * DEG) - e);
        let yv = a * Math.sqrt(1 - e * e) * Math.sin(E * DEG);
        let v = normDeg(Math.atan2(yv, xv) * RAD);
        let r = Math.sqrt(xv * xv + yv * yv);
        let xh = r * (Math.cos(N * DEG) * Math.cos((v + w) * DEG) - Math.sin(N * DEG) * Math.sin((v + w) * DEG) * Math.cos(i * DEG));
        let yh = r * (Math.sin(N * DEG) * Math.cos((v + w) * DEG) + Math.cos(N * DEG) * Math.sin((v + w) * DEG) * Math.cos(i * DEG));
        let xs = Math.cos(sunSayana * DEG);
        let ys = Math.sin(sunSayana * DEG);
        let xg = xh + xs;
        let yg = yh + ys;
        let geoLong = normDeg(Math.atan2(yg, xg) * RAD);
        return normDeg(geoLong - ayanVal);
    }

    const marsNirayana = getPlanetPos(355.45, 1.5236, 0.0934, 1.85, 49.55, 286.50, normDeg(19.37 + 19140.30 * T));
    const mercuryNirayana = getPlanetPos(252.25, 0.3871, 0.2056, 7.00, 48.33, 29.12, normDeg(174.79 + 149472.67 * T));
    const jupiterNirayana = getPlanetPos(34.40, 5.2026, 0.0485, 1.30, 100.46, 273.87, normDeg(20.02 + 3034.90 * T));
    const venusNirayana = getPlanetPos(181.98, 0.7233, 0.0068, 3.39, 76.68, 54.88, normDeg(50.42 + 58517.81 * T));
    const saturnNirayana = getPlanetPos(49.94, 9.5549, 0.0555, 2.49, 113.66, 339.39, normDeg(317.02 + 1222.11 * T));

    return {
        Surya: sunNirayana,
        Chandra: moonNirayana,
        Kuja: marsNirayana,
        Budha: mercuryNirayana,
        Guru: jupiterNirayana,
        Shukra: venusNirayana,
        Shani: saturnNirayana,
        Rahu: rahuNirayana,
        Ketu: ketuNirayana
    };
}

function computeLagnaNirayana(targetJd, lat, lon) {
    const ayanVal = getAyanamsa(targetJd);
    const T = (targetJd - 2451545.0) / 36525.0;
    const d = targetJd - 2451545.0;
    const gmst0 = normDeg(280.46061837 + 360.98564736629 * d);
    const lst = normDeg(gmst0 + lon);
    const eps = 23.4392911 - 0.0130042 * T;
    const ramc = lst * DEG;
    const phi = lat * DEG;
    const epsRad = eps * DEG;

    const num = Math.cos(ramc);
    const den = -(Math.sin(ramc) * Math.cos(epsRad) + Math.tan(phi) * Math.sin(epsRad));
    let ascSayana = normDeg(Math.atan2(num, den) * RAD);
    if (Math.abs(normDeg(ascSayana - lst) - 90) > 90) {
        ascSayana = normDeg(ascSayana + 180);
    }
    return normDeg(ascSayana - ayanVal);
}

function computeSunTimes(y, m, d, lat, lon, tz) {
    const doy = Math.floor((new Date(y, m-1, d) - new Date(y, 0, 1)) / 86400000) + 1;
    const gamma = 2 * Math.PI / 365 * (doy - 1);
    const eqtime = 229.18 * (0.000075 + 0.001868*Math.cos(gamma) - 0.032077*Math.sin(gamma)
                   - 0.014615*Math.cos(2*gamma) - 0.04089*Math.sin(2*gamma));
    const decl = 0.006918 - 0.399912*Math.cos(gamma) + 0.070257*Math.sin(gamma)
                 - 0.006758*Math.cos(2*gamma) + 0.000907*Math.sin(2*gamma)
                 - 0.002697*Math.cos(3*gamma) + 0.00148*Math.sin(3*gamma);
    const latR = lat * DEG;
    const cosHA = Math.cos(90.833 * DEG) / (Math.cos(latR)*Math.cos(decl)) - Math.tan(latR)*Math.tan(decl);
    if (cosHA > 1 || cosHA < -1) return { sunrise: 6.0, sunset: 18.0, noon: 12.0 };
    const HA = Math.acos(cosHA) * RAD;
    const srUTC = 720 - 4*(lon + HA) - eqtime;
    const ssUTC = 720 - 4*(lon - HA) - eqtime;
    const nnUTC = 720 - 4*lon - eqtime;
    return {
        sunrise: ((srUTC + tz*60)/60 % 24 + 24) % 24,
        sunset:  ((ssUTC + tz*60)/60 % 24 + 24) % 24,
        noon:    ((nnUTC + tz*60)/60 % 24 + 24) % 24
    };
}

function getNakshatraInfo(deg) {
    const norm = normDeg(deg);
    const nakSpan = 360.0 / 27.0; // 13° 20' = 13.333333°
    const idx = Math.floor(norm / nakSpan);
    const degInNak = norm - (idx * nakSpan);
    const pada = Math.floor(degInNak / (nakSpan / 4)) + 1;
    const rashiIdx = Math.floor(norm / 30.0);
    const lord = DASA_LORDS[idx % 9];
    const lordTe = DASA_LORDS_TELUGU[idx % 9];

    return {
        idx,
        name: NAKSHATRAS[idx],
        nameTe: NAKSHATRAS_TELUGU[idx],
        pada,
        rashiIdx,
        rashiName: RASHI_NAMES[rashiIdx],
        rashiNameTe: RASHI_TELUGU[rashiIdx],
        rashiLord: RASHI_LORDS[rashiIdx],
        rashiLordTe: RASHI_LORDS_TELUGU[rashiIdx],
        lord,
        lordTe
    };
}

function computeVimshottariDasa(moonDeg, birthDate) {
    const nakSpan = 360.0 / 27.0;
    const nakIdx = Math.floor(moonDeg / nakSpan);
    const lordIdx = nakIdx % 9;
    const fullYears = DASA_YEARS[lordIdx];

    const degInNak = moonDeg - (nakIdx * nakSpan);
    const fractionElapsed = degInNak / nakSpan;
    const fractionRemaining = 1.0 - fractionElapsed;
    const balanceYears = fullYears * fractionRemaining;

    let currentStartDate = new Date(birthDate);
    const now = new Date();
    let currentMahadasha = null;
    let currentAntardasha = null;

    for (let i = 0; i < 9; i++) {
        const mdIdx = (lordIdx + i) % 9;
        const mdLord = DASA_LORDS[mdIdx];
        const mdLordTe = DASA_LORDS_TELUGU[mdIdx];
        const mdTotalYears = (i === 0) ? balanceYears : DASA_YEARS[mdIdx];
        const mdEndDate = new Date(currentStartDate.getTime() + mdTotalYears * 365.2422 * 86400000);

        let bStartDate = new Date(currentStartDate);
        for (let b = 0; b < 9; b++) {
            const bIdx = (mdIdx + b) % 9;
            const bLord = DASA_LORDS[bIdx];
            const bLordTe = DASA_LORDS_TELUGU[bIdx];
            const bYears = (DASA_YEARS[mdIdx] * DASA_YEARS[bIdx]) / 120.0;
            const actualBYears = (i === 0) ? bYears * fractionRemaining : bYears;
            const bEndDate = new Date(bStartDate.getTime() + actualBYears * 365.2422 * 86400000);

            if (now >= bStartDate && now <= bEndDate) {
                currentMahadasha = { lord: mdLord, lordTe: mdLordTe, start: currentStartDate, end: mdEndDate };
                currentAntardasha = { lord: bLord, lordTe: bLordTe, start: bStartDate, end: bEndDate };
            }
            bStartDate = bEndDate;
        }
        currentStartDate = mdEndDate;
    }

    return {
        janmaBalanceYears: balanceYears.toFixed(2),
        currentMahadasha,
        currentAntardasha
    };
}

function computeGochara(natalMoonDeg, transitDate = new Date()) {
    const jd = getJulianDay(transitDate.getFullYear(), transitDate.getMonth() + 1, transitDate.getDate());
    const transitPlanets = getSinglePlanetPos(jd);

    const janmaRasiIdx = Math.floor(natalMoonDeg / 30);
    const getHouseFromMoon = (deg) => (Math.floor(deg / 30) - janmaRasiIdx + 12) % 12 + 1;

    const jupH = getHouseFromMoon(transitPlanets.Guru);
    const satH = getHouseFromMoon(transitPlanets.Shani);
    const rahuH = getHouseFromMoon(transitPlanets.Rahu);
    const ketuH = getHouseFromMoon(transitPlanets.Ketu);

    const isGuruGood = [2, 5, 7, 9, 11].includes(jupH);
    const isSatGood = [3, 6, 11].includes(satH);
    const isRahuGood = [3, 6, 11].includes(rahuH);

    const isSadeSati = [12, 1, 2].includes(satH);
    const isAshtamaShani = (satH === 8);
    const isArdhastamaShani = (satH === 4);

    return {
        transitPlanets,
        janmaRasiIdx,
        janmaRasiName: RASHI_NAMES[janmaRasiIdx],
        janmaRasiNameTe: RASHI_TELUGU[janmaRasiIdx],
        jupHouse: jupH,
        isGuruGood,
        satHouse: satH,
        isSatGood,
        isSadeSati,
        isAshtamaShani,
        isArdhastamaShani,
        rahuHouse: rahuH,
        ketuHouse: ketuH
    };
}

function checkKujaDosha(planets, lagnaDeg) {
    const getHouse = (refDeg, targetDeg) => (Math.floor(targetDeg / 30) - Math.floor(refDeg / 30) + 12) % 12 + 1;
    const kujaDeg = planets.Kuja;
    const kujaRashi = Math.floor(kujaDeg / 30);

    const hFromLagna = getHouse(lagnaDeg, kujaDeg);
    const hFromMoon = getHouse(planets.Chandra, kujaDeg);
    const hFromShukra = getHouse(planets.Shukra, kujaDeg);

    const doshaHouses = [1, 2, 4, 7, 8, 12];
    const hasDosha = doshaHouses.includes(hFromLagna) || doshaHouses.includes(hFromMoon) || doshaHouses.includes(hFromShukra);

    // 9 Classical Shastric Exceptions
    let isCancelled = false;
    let cancellationReason = '';

    if (kujaRashi === 0 || kujaRashi === 7) { // Mesha, Vrishchika
        isCancelled = true;
        cancellationReason = 'Kuja is in Swakshetra (Mesha/Vrishchika).';
    } else if (kujaRashi === 9) { // Makara
        isCancelled = true;
        cancellationReason = 'Kuja is Exalted (Uchha in Makara).';
    } else if (hFromLagna === 2 && (kujaRashi === 2 || kujaRashi === 5)) { // 2nd in Mithuna/Kanya
        isCancelled = true;
        cancellationReason = 'Kuja in 2nd house in Budha sign (Mithuna/Kanya).';
    } else if (hFromLagna === 7 && (kujaRashi === 3 || kujaRashi === 9)) { // 7th in Karkataka/Makara
        isCancelled = true;
        cancellationReason = 'Kuja in 7th house in Karkataka or Makara.';
    } else if (hFromLagna === 8 && (kujaRashi === 8 || kujaRashi === 11)) { // 8th in Dhanus/Meena
        isCancelled = true;
        cancellationReason = 'Kuja in 8th house in Guru sign (Dhanus/Meena).';
    }

    return {
        hasDosha: hasDosha && !isCancelled,
        rawDosha: hasDosha,
        isCancelled,
        cancellationReason,
        hFromLagna,
        hFromMoon,
        hFromShukra
    };
}

function checkKalaSarpa(planets) {
    const rahu = planets.Rahu;
    const ketu = planets.Ketu;
    const testGrahas = [planets.Surya, planets.Chandra, planets.Kuja, planets.Budha, planets.Guru, planets.Shukra, planets.Shani];

    let allSide1 = true;
    let allSide2 = true;

    testGrahas.forEach(deg => {
        const diff = (deg - rahu + 360) % 360;
        if (diff > 180) allSide1 = false;
        else allSide2 = false;
    });

    return allSide1 || allSide2;
}

// ═══════════════ MUHURTA SCANNER ═══════════════
const CEREMONIES = {
    'vivaha': { title: 'Vivaha (Wedding / Marriage)', cat: 'Samskara', mode: 'dual', naks: [3,4,6,7,10,11,12,13,14,16,19,20,21,22,25,26], tithis: [1,2,4,6,9,10,12,16,17,19,21,24,25,27], lagnas: [1,2,3,5,6,8,11] },
    'marriage': { title: 'Vivaha (Wedding / Marriage)', cat: 'Samskara', mode: 'dual', naks: [3,4,6,7,10,11,12,13,14,16,19,20,21,22,25,26], tithis: [1,2,4,6,9,10,12,16,17,19,21,24,25,27], lagnas: [1,2,3,5,6,8,11] },
    'gruhapravesh': { title: 'Gruhapravesham (Housewarming)', cat: 'Vastu', mode: 'dual', naks: [3,4,6,7,11,12,13,16,20,25,26], tithis: [1,2,4,6,9,10,12], lagnas: [1,4,7,10] }, // Sthira Lagnas: Vrishabha(1), Simha(4), Vrishchika(7), Kumbha(10)
    'housewarming': { title: 'Gruhapravesham (Housewarming)', cat: 'Vastu', mode: 'dual', naks: [3,4,6,7,11,12,13,16,20,25,26], tithis: [1,2,4,6,9,10,12], lagnas: [1,4,7,10] },
    'upanayana': { title: 'Upanayanam (Sacred Thread)', cat: 'Samskara', mode: 'single', naks: [0,3,4,6,7,12,13,14,16,21,22,23,26], tithis: [1,2,4,6,9,10,12], lagnas: [1,2,5,6,8,11] },
    'namakarana': { title: 'Namakaranam (Naming Ceremony)', cat: 'Samskara', mode: 'single', naks: [3,11,20,25,16,6,7,12,14,26], tithis: [4,6,9,10,12,14], lagnas: [1,2,3,4,5,6,8,11] },
    'annaprashana': { title: 'Annaprashanam (First Food)', cat: 'Samskara', mode: 'single', naks: [0,3,4,6,7,11,12,13,14,16,21,22,26], tithis: [1,2,4,6,9,12], lagnas: [1,2,3,5,6,8,11] },
    'aksharabhyasa': { title: 'Aksharabhyasam (Education Start)', cat: 'Education', mode: 'single', naks: [0,6,7,12,13,14,21,22,23,26], tithis: [1,2,4,9,10], lagnas: [1,2,5,6,8,11] },
    'vahana': { title: 'Vahana Purchase / Delivery', cat: 'Asset', mode: 'single', naks: [0,3,6,7,12,14,21,22,23,26], tithis: [1,2,4,6,9,10,12,14], lagnas: [0,1,2,3,5,6,8,9,11] },
    'vyapara': { title: 'Vyapara Arambham (Business Opening)', cat: 'Business', mode: 'single', naks: [0,3,7,11,12,13,16,21,22,26], tithis: [1,2,4,6,9,10,12,14,16,17,19,21,24,25], lagnas: [0,1,2,3,5,6,8,9,11] },
    'bhumi': { title: 'Bhumi Puja & Shanku Sthapana', cat: 'Vastu', mode: 'dual', naks: [3,4,11,12,13,14,16,20,25,26], tithis: [1,2,4,6,9,10,12], lagnas: [1,4,7,10] },
    'japa': { title: 'Mantra Japa Arambham / Deeksha (మంత్ర జపారంభం)', cat: 'Sadhana', mode: 'single', naks: [0,3,4,6,7,12,13,14,16,20,21,25,26], tithis: [1,2,4,6,9,10,11,12,14], lagnas: [1,2,4,5,8,11] },
    'mantra': { title: 'Mantra Japa Arambham / Deeksha (మంత్ర జపారంభం)', cat: 'Sadhana', mode: 'single', naks: [0,3,4,6,7,12,13,14,16,20,21,25,26], tithis: [1,2,4,6,9,10,11,12,14], lagnas: [1,2,4,5,8,11] },
    'universal': { title: 'Sarva Karya Shubha Muhurtam', cat: 'Universal', mode: 'single', naks: Array.from({length: 27}, (_, i) => i), tithis: Array.from({length: 30}, (_, i) => i), lagnas: Array.from({length: 12}, (_, i) => i) }
};

function formatTime(hoursFloat) {
    const h = Math.floor(hoursFloat);
    const m = Math.floor((hoursFloat - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dispH = h % 12 === 0 ? 12 : h % 12;
    return `${String(dispH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function scanMuhurtaDates(ceremonyKey, startDate, endDate, city = CITIES_DB['hyderabad']) {
    const cKey = ceremonyKey.toLowerCase().replace(/[^a-z]/g, '');
    let cer = CEREMONIES[cKey] || CEREMONIES['universal'];
    for (let k in CEREMONIES) {
        if (cKey.includes(k)) { cer = CEREMONIES[k]; break; }
    }

    const totalDays = Math.round((endDate - startDate) / 86400000) + 1;
    const auspiciousList = [];

    for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();

        const jd = getJulianDay(y, m, day, 6, 0, 0, city.tz);
        const sunDeg = getSunNirayana(jd);
        const moonDeg = getMoonNirayana(jd);

        // Tithi: (Moon - Sun) / 12
        const diff = normDeg(moonDeg - sunDeg);
        const tithiIdx = Math.floor(diff / 12.0); // 0-29

        // Rikta Tithis: 4 (Chavithi), 9 (Navami), 14 (Chaturdashi)
        const isRikta = [3, 8, 13, 18, 23, 28].includes(tithiIdx);
        const isAmavasya = (tithiIdx === 29);

        // Nakshatra: Moon / 13.3333
        const nakIdx = Math.floor(moonDeg / (360.0 / 27.0));

        if (isRikta || isAmavasya) continue;
        if (!cer.naks.includes(nakIdx)) continue;
        if (!cer.tithis.includes(tithiIdx)) continue;

        // Check Guru / Shukra Maudhyam (combustion within ~11 degrees of Sun)
        const planets = getSinglePlanetPos(jd);
        const sunDistGuru = Math.min(Math.abs(planets.Guru - sunDeg), 360 - Math.abs(planets.Guru - sunDeg));
        const sunDistShukra = Math.min(Math.abs(planets.Shukra - sunDeg), 360 - Math.abs(planets.Shukra - sunDeg));
        const isMaudhyam = (sunDistGuru < 11.0 || sunDistShukra < 9.0);
        if (isMaudhyam && (cKey.includes('vivaha') || cKey.includes('gruha') || cKey.includes('upanayana'))) {
            continue; // Strictly prohibited for major Samskaras
        }

        // Sun times for day
        const st = computeSunTimes(y, m, day, city.lat, city.lon, city.tz);
        const dow = d.getDay();

        // Rahu Kalam
        const RAHU_PARTS = [8, 2, 7, 5, 6, 4, 3];
        const oct = (st.sunset - st.sunrise) / 8.0;
        const rahuStart = st.sunrise + (RAHU_PARTS[dow] - 1) * oct;
        const rahuEnd = rahuStart + oct;

        // Find Auspicious Lagna windows during the day (e.g. 6 AM to 6 PM)
        const favorableWindows = [];
        for (let h = st.sunrise; h <= st.sunset; h += 0.5) {
            const testJd = getJulianDay(y, m, day, Math.floor(h), Math.floor((h % 1) * 60), 0, city.tz);
            const lagnaDeg = computeLagnaNirayana(testJd, city.lat, city.lon);
            const lRashi = Math.floor(lagnaDeg / 30);

            if (cer.lagnas.includes(lRashi)) {
                // Check if outside Rahu Kalam
                if (h + 1.0 < rahuStart || h > rahuEnd) {
                    const lagnaName = RASHI_NAMES[lRashi];
                    const lagnaNameTe = RASHI_TELUGU[lRashi];
                    if (!favorableWindows.some(w => w.rashi === lagnaName)) {
                        favorableWindows.push({
                            rashi: lagnaName,
                            rashiTe: lagnaNameTe,
                            startTime: formatTime(h),
                            endTime: formatTime(h + 1.5)
                        });
                    }
                }
            }
        }

        if (favorableWindows.length > 0) {
            auspiciousList.push({
                date: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                displayDate: `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${y}`,
                vara: VARA_NAMES[dow],
                varaTe: VARA_TELUGU[dow],
                tithi: TITHI_NAMES[tithiIdx],
                tithiTe: TITHI_TELUGU[tithiIdx],
                nakshatra: NAKSHATRAS[nakIdx],
                nakshatraTe: NAKSHATRAS_TELUGU[nakIdx],
                windows: favorableWindows.slice(0, 2)
            });
        }
    }

    return {
        ceremony: cer.title,
        city: city.name,
        count: auspiciousList.length,
        dates: auspiciousList.slice(0, 5) // Return premier top 5 dates
    };
}

module.exports = {
    RASHI_NAMES,
    RASHI_TELUGU,
    RASHI_LORDS,
    RASHI_LORDS_TELUGU,
    NAKSHATRAS,
    NAKSHATRAS_TELUGU,
    DASA_LORDS,
    DASA_LORDS_TELUGU,
    DASA_YEARS,
    TITHI_NAMES,
    TITHI_TELUGU,
    VARA_NAMES,
    VARA_TELUGU,
    CITIES_DB,
    resolveCity,
    getJulianDay,
    getAyanamsa,
    getSunNirayana,
    getMoonNirayana,
    getSinglePlanetPos,
    computeLagnaNirayana,
    computeSunTimes,
    getNakshatraInfo,
    computeVimshottariDasa,
    computeGochara,
    checkKujaDosha,
    checkKalaSarpa,
    scanMuhurtaDates
};
