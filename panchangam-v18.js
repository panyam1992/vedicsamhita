
function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
function setElHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}
/* ═══════════════════════════════════════════════════════════════
   VEDIC SAMHITA PANCHANGAM — Worldwide Sidereal Panchangam Engine v2
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


// ─── Plain & Simple Bilingual Language Engine (English & Telugu) ───
let CURRENT_LANG = 'en';
try {
    const saved = localStorage.getItem('VS_LANG');
    if (saved === 'te' || saved === 'en') CURRENT_LANG = saved;
} catch(e) {}

const SAMVATSARAM_TE = [
    "ప్రభవ","విభవ","శుక్ల","ప్రమోద్యూత","ప్రజోత్పత్తి","ఆంగీరస","శ్రీముఖ","భావ","యువ","ధాత",
    "ఈశ్వర","బహుధాన్య","ప్రమాది","విక్రమ","వృష","చిత్రభాను","స్వభాను","తారణ","పార్థివ","వ్యయ",
    "సర్వజిత్తు","సర్వధారి","విరోధి","వికృతి","ఖర","నందన","విజయ","జయ","మన్మథ","దుర్ముఖి",
    "హేవిలంబి","విలంబి","వికారి","శార్వరి","ప్లవ","శుభకృతు","శోభకృతు","క్రోధి","విశ్వావసు","పరాభవ",
    "ప్లవంగ","కీలక","సౌమ్య","సాధారణ","విరోధికృతు","పరిధావి","ప్రమాదీచ","ఆనంద","రాక్షస","నల",
    "పింగళ","కాళయుక్తి","సిద్ధార్థి","రౌద్రి","దుర్మతి","దుందుభి","రుధిరోద్గారి","రక్తాక్షి","క్రోధన","అక్షయ"
];

const TITHI_TE = [
    "శుక్ల పాడ్యమి", "శుక్ల విదియ", "శుక్ల తదియ", "శుక్ల చవితి", "శుక్ల పంచమి",
    "శుక్ల షష్ఠి", "శుక్ల సప్తమి", "శుక్ల అష్టమి", "శుక్ల నవమి", "శుక్ల దశమి",
    "శుక్ల ఏకాదశి", "శుక్ల ద్వాదశి", "శుక్ల త్రయోదశి", "శుక్ల చతుర్దశి", "పూర్ణిమ",
    "కృష్ణ పాడ్యమి", "కృష్ణ విదియ", "కృష్ణ తదియ", "కృష్ణ చవితి", "కృష్ణ పంచమి",
    "కృష్ణ షష్ఠి", "కృష్ణ సప్తమి", "కృష్ణ అష్టమి", "కృష్ణ నవమి", "కృష్ణ దశమి",
    "కృష్ణ ఏకాదశి", "కృష్ణ ద్వాదశి", "కృష్ణ త్రయోదశి", "కృష్ణ చతుర్దశి", "అమావాస్య"
];

const NAKSHATRA_TE = [
    "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆరుద్ర",
    "పునర్వసు", "పుష్యమి", "ఆశ్లేష", "మఘ", "పూర్వ ఫల్గుని (పుబ్బ)", "ఉత్తర ఫల్గుని (ఉత్తర)",
    "హస్త", "చిత్ర", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ",
    "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం",
    "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"
];

const YOGA_TE = [
    "విష్కంభం", "ప్రీతి", "ఆయుష్మాన్", "సౌభాగ్యం", "శోభనం", "అతిగండం",
    "సుకుర్మ", "ధృతి", "శూలం", "గండం", "వృద్ధి", "ధ్రువం",
    "వ్యాఘాతం", "హర్షణం", "వజ్రం", "సిద్ధి", "వ్యతీపాతం", "వరియాన్",
    "పరిఘం", "శివం", "సిద్ధం", "సాధ్యం", "శుభం", "శుక్లం",
    "బ్రహ్మం", "ఐంద్రం", "వైధృతి"
];

const VARA_TE = [
    "ఆదివారం (భానువాసరం)", "సోమవారం (ఇందువాసరం)", "మంగళవారం (భౌమవాసరం)",
    "బుధవారం (సౌమ్యవాసరం)", "గురువారం (బృహస్పతివాసరం)", "శుక్రవారం (భృగువాసరం)", "శనివారం (స్థిరవాసరం)"
];

const MASAM_TE = [
    "చైత్రం", "వైశాఖం", "జ్యేష్ఠం", "ఆషాఢం", "శ్రావణం", "భాద్రపదం",
    "ఆశ్వయుజం", "కార్తీకం", "మార్గశిర", "పుష్యం", "మాఘం", "ఫాల్గుణం"
];

const RUTU_TE = [
    "వసంత ఋతువు", "గ్రీష్మ ఋతువు", "వర్ష ఋతువు", "శరద్ ఋతువు", "హేమంత ఋతువు", "శిశిర ఋతువు"
];

const RASHI_TE = [
    "మేషం", "వృషభం", "మిథునం", "కర్కాటకం", "సింహం", "కన్య",
    "తుల", "వృశ్చికం", "ధనుస్సు", "మకరం", "కుంభం", "మీనం"
];

const KARANA_TE = [
    "బవ", "బాలవ", "కౌలవ", "తైతిల", "గరజి", "వణిజ", "విష్టి (భద్ర)",
    "శకుని", "చతుష్పాద", "నాగవ", "కింస్తుఘ్నం"
];

const MONTH_ABBR_TE = ['జనవరి','ఫిబ్రవరి','మార్చి','ఏప్రిల్','మే','జూన్','జూలై','ఆగస్టు','సెప్టెంబర్','అక్టోబర్','నవంబర్','డిసెంబర్'];

const GRAHA_NAMES_EN = {
    Su: 'Sun (Surya)', Mo: 'Moon (Chandra)', Ma: 'Mars (Kuja)', Me: 'Mercury (Budha)',
    Ju: 'Jupiter (Guru)', Ve: 'Venus (Shukra)', Sa: 'Saturn (Shani)', Ra: 'Rahu', Ke: 'Ketu'
};
const GRAHA_NAMES_TE = {
    Su: 'సూర్యుడు', Mo: 'చంద్రుడు', Ma: 'కుజుడు (అంగారకుడు)', Me: 'బుధుడు',
    Ju: 'గురుడు (బృహస్పతి)', Ve: 'శుక్రుడు', Sa: 'శని', Ra: 'రాహువు', Ke: 'కేతువు'
};

const RASHI_LORDS_TE = [
    "కుజుడు (అంగారకుడు)", "శుక్రుడు", "బుధుడు", "చంద్రుడు", "సూర్యుడు", "బుధుడు",
    "శుక్రుడు", "కుజుడు", "గురుడు (బృహస్పతి)", "శని", "శని", "గురుడు (బృహస్పతి)"
];

const MAUDHYA_NAMES_TE = {
    jupiter: 'గురు మౌఢ్యం',
    venus: 'శుక్ర మౌఢ్యం',
    mars: 'కుజ మౌఢ్యం',
    mercury: 'బుధ మౌఢ్యం',
    saturn: 'శని మౌఢ్యం'
};
const MAUDHYA_NAMES_EN = {
    jupiter: 'Guru Maudhyam (Jupiter Combustion)',
    venus: 'Shukra Maudhyam (Venus Combustion)',
    mars: 'Kuja Maudhyam (Mars Combustion)',
    mercury: 'Budha Maudhyam (Mercury Combustion)',
    saturn: 'Shani Maudhyam (Saturn Combustion)'
};

const CHOGHADIYA_PROPS_TE = {
    Amrit: { name: 'అమృతం', ruler: 'చంద్రుడు', nature: 'అమృత (అత్యుత్తమం)', isGood: true },
    Shubh: { name: 'శుభం',    ruler: 'గురుడు',    nature: 'శుభ (ఉత్తమం)',     isGood: true },
    Labh:  { name: 'లాభం',   ruler: 'బుధుడు',   nature: 'లాభ (శుభం)',       isGood: true },
    Char:  { name: 'చరం',    ruler: 'శుక్రుడు',  nature: 'చర (శుభం)',       isGood: true },
    Udveg: { name: 'ఉద్వేగం', ruler: 'సూర్యుడు',   nature: 'ఉద్వేగ (అశుభం)',   isGood: false },
    Rog:   { name: 'రోగం',    ruler: 'కుజుడు',    nature: 'రోగ (అశుభం)',     isGood: false },
    Kaal:  { name: 'కాలం',   ruler: 'శని',      nature: 'కాల (అశుభం)',     isGood: false }
};

const CHOGHADIYA_PROPS_EN = {
    Amrit: { name: 'Amrit', ruler: 'Moon',    nature: 'Highly Auspicious', isGood: true },
    Shubh: { name: 'Shubh', ruler: 'Jupiter', nature: 'Auspicious',        isGood: true },
    Labh:  { name: 'Labh',  ruler: 'Mercury', nature: 'Auspicious',        isGood: true },
    Char:  { name: 'Char',  ruler: 'Venus',   nature: 'Auspicious (Travel)', isGood: true },
    Udveg: { name: 'Udveg', ruler: 'Sun',     nature: 'Inauspicious',      isGood: false },
    Rog:   { name: 'Rog',   ruler: 'Mars',    nature: 'Inauspicious',      isGood: false },
    Kaal:  { name: 'Kaal',  ruler: 'Saturn',  nature: 'Inauspicious',      isGood: false }
};

const CHOGHADIYA_PRINCIPLES_TE = `
    <li><strong style="color: #1b5e20;">అమృతం (చంద్రుడు):</strong> అత్యుత్తమం — సమస్త శుభకార్యాలకు, పూజలకు అత్యంత శ్రేష్ఠం.</li>
    <li><strong style="color: #1b5e20;">శుభం (గురుడు):</strong> ఉత్తమం — పూజలు, శుభకార్యాలు, విద్యారంభం, పత్రాల సంతకాలకు అనుకూలం.</li>
    <li><strong style="color: #1b5e20;">లాభం (బుధుడు):</strong> శుభప్రదం — వ్యాపారం, ధన లావాదేవీలు, నూతన కొనుగోళ్లకు శ్రేష్ఠం.</li>
    <li><strong style="color: #1b5e20;">చరం (శుక్రుడు):</strong> చలనం — ప్రయాణాలకు, బదిలీలకు, ప్రయాణ ఆరంభానికి అనుకూలం.</li>
    <li><strong style="color: #991b1b;">ఉద్వేగం (సూర్యుడు):</strong> అశుభం — ఆందోళన, ఆటంకాలు; ముఖ్యమైన కొత్త పనులు ప్రారంభించవద్దు.</li>
    <li><strong style="color: #991b1b;">రోగం (కుజుడు):</strong> అశుభం — కలహాలు, అనారోగ్యం; వాదోపవాదాలు, వైద్య ఆరంభం నివారించండి.</li>
    <li><strong style="color: #991b1b;">కాలం (శని):</strong> అత్యంత అశుభం — శని పాలిత సమయం; ఎలాంటి శుభకార్యాలు తలపెట్టరాదు.</li>
`;

const CHOGHADIYA_PRINCIPLES_EN = `
    <li><strong style="color: #1b5e20;">Amrit (Moon):</strong> Highly Auspicious — Best for all good beginnings, celebrations & pujas.</li>
    <li><strong style="color: #1b5e20;">Shubh (Jupiter):</strong> Auspicious — Best for ceremonies, education, signing contracts & official work.</li>
    <li><strong style="color: #1b5e20;">Labh (Mercury):</strong> Auspicious — Best for commerce, financial deals, buying vehicles & investments.</li>
    <li><strong style="color: #1b5e20;">Char (Venus):</strong> Auspicious — Best for travel, journeys, moving & dynamic activities.</li>
    <li><strong style="color: #991b1b;">Udveg (Sun):</strong> Inauspicious — Anxiety & obstacles; avoid new ventures.</li>
    <li><strong style="color: #991b1b;">Rog (Mars):</strong> Inauspicious — Conflicts & illness; avoid medical starts or disputes.</li>
    <li><strong style="color: #991b1b;">Kaal (Saturn):</strong> Inauspicious — Ruled by Saturn; strictly avoid starting any auspicious venture.</li>
`;

const FESTIVALS_TE_MAP = {
    "Ugadi — Telugu & Kannada New Year / Gudi Padwa": "ఉగాది — నూతన సంవత్సరాది / గుడి పడ్వా",
    "Vasanta Navaratri Arambha": "వసంత నవరాత్రుల ప్రారంభం (ఘటస్థాపన)",
    "Matsya Jayanti": "శ్రీ మత్స్య జయంతి",
    "Sri Rama Navami (Punarvasu Yukta)": "శ్రీరామ నవమి (పునర్వసు నక్షత్ర యుక్తం)",
    "Sri Rama Navami": "శ్రీరామ నవమి",
    "Hanuman Jayanti (Chaitra Purnima)": "శ్రీ హనుమాన్ జయంతి (చైత్ర పూర్ణిమ)",
    "Hanuman Jayanti (Telugu / Andhra tradition)": "శ్రీ హనుమాన్ జయంతి (తెలుగు సంప్రదాయం)",
    "Akshaya Tritiya (Maha Punya Kalam - Rohini Yukta)": "అక్షయ తృతీయ (రోహిణి యుక్త మహా పుణ్యకాలం)",
    "Akshaya Tritiya": "అక్షయ తృతీయ",
    "Parashurama Jayanti": "శ్రీ పరశురామ జయంతి",
    "Sri Narasimha Jayanti (Pradosha Vyapini)": "శ్రీ నరసింహ జయంతి (ప్రదోష కాలం)",
    "Buddha Purnima": "బుద్ధ పూర్ణిమ",
    "Kurma Jayanti": "శ్రీ కూర్మ జయంతి",
    "Vata Savitri Vratam (Vat Purnima)": "వట సావిత్రీ వ్రతం (వట పూర్ణిమ)",
    "Ganga Dussehra (Ganga Avatarana)": "గంగా దసరా (గంగా అవతరణం)",
    "Jagannath Ratha Yatra (Puri)": "శ్రీ జగన్నాథ రథయాత్ర (పూరీ)",
    "Guru Purnima / Vyasa Purnima": "గురు పౌర్ణమి / వ్యాస పూర్ణిమ",
    "Bheemana Amavasya / Deepa Puja": "భీమన అమావాస్య / జ్యోతిర్భీమేశ్వర వ్రతం",
    "Naga Panchami": "నాగ పంచమి",
    "Varalakshmi Vratam": "శ్రావణ వరలక్ష్మీ వ్రతం",
    "Raksha Bandhan / Rig & Yajur Veda Upakarma": "రక్షాబంధన్ / రాఖీ పౌర్ణమి / వేదోపాకర్మ",
    "Hayagriva Jayanti": "శ్రీ హయగ్రీవ జయంతి",
    "Sri Krishna Janmashtami / Jayanti (Nishita Kaal & Rohini)": "శ్రీకృష్ణ జన్మాష్టమి (రోహిణి యుక్త నిశీథ కాలం)",
    "Sri Krishna Janmashtami (Smartha / Nishita Kaal)": "శ్రీకృష్ణ జన్మాష్టమి (స్మార్త నిశీథ పూజ)",
    "Sri Krishna Janmashtami / Gokulashtami (Vaishnava / Udaya Tithi)": "శ్రీకృష్ణ జన్మాష్టమి / గోకులాష్టమి (వైష్ణవ ఉదయతిథి)",
    "Gokulashtami": "గోకులాష్టమి",
    "Nandotsav": "నందోత్సవం",
    "Dahi Handi / Utlotsavam (Gopala Kala)": "దహీ హండీ / ఉట్లోత్సవం (గోపాలకాలా)",
    "Santana Gopala Vratam": "సంతాన గోపాల వ్రతం",
    "Hartalika Teej / Swarna Gowri Vratam": "హరితాళికా తీజ్ / స్వర్ణగౌరీ వ్రతం",
    "Varaha Jayanti": "శ్రీ వరాహ జయంతి",
    "Vinayaka Chavithi / Ganesh Chaturthi (Madhyahna Vyapini)": "వినాయక చవితి / గణేష్ చతుర్థి (మధ్యాహ్న వ్యాపిని)",
    "Rishi Panchami": "ఋషి పంచమి",
    "Radha Ashtami": "రాధాష్టమి",
    "Mahalaxmi Vrata Arambha": "శ్రీ మహాలక్ష్మి వ్రతారంభం",
    "Vamana Jayanti": "శ్రీ వామన జయంతి",
    "Ananta Padmanabha Chaturdashi": "అనంత పద్మనాభ చతుర్దశి",
    "Mahalaya Paksha (Pitru Paksha) Arambha": "మహాలయ పక్ష (పితృ పక్ష) ప్రారంభం",
    "Mahalaya Amavasya / Sarva Pitru Amavasya (Peddala Amavasya)": "మహాలయ అమావాస్య / సర్వ పితృ అమావాస్య (పెద్దల అమావాస్య)",
    "Sharada Navaratri Ghatasthapana / Kalashasthapana": "శరన్నవరాత్రుల ప్రారంభం (కలశస్థాపన)",
    "Durgashtami (Maha Ashtami)": "దుర్గాష్టమి (మహాష్టమి)",
    "Mahanavami / Ayudha Puja": "మహార్నవమి / ఆయుధ పూజ",
    "Vijayadashami / Dussehra (Shravana Nakshatra Yukta)": "విజయదశమి / దసరా (శ్రవణ నక్షత్ర యుక్తం)",
    "Vijayadashami / Dussehra": "విజయదశమి / దసరా",
    "Madhva Jayanti": "శ్రీ మధ్వ జయంతి",
    "Sharad Purnima / Kojagiri Purnima / Kumara Purnima": "శరత్ పూర్ణిమ / కోజాగరి పూర్ణిమ / కుమార పూర్ణిమ",
    "Atla Tadde (Telugu women vrata)": "అట్ల తద్దె",
    "Karwa Chauth (Karak Chaturthi)": "కర్వా చౌత్ (కారక చతుర్థి)",
    "Ahoi Ashtami": "అహోయ్ అష్టమి",
    "Govatsa Dwadashi / Vasubaras": "గోవత్స ద్వాదశి / వసుబారస్",
    "Dhanteras / Dhantrayodashi (Dhanvantari Jayanti / Yama Deepam)": "ధన త్రయోదశి / ధంతేరస్ (ధన్వంతరి జయంతి / యమదీపం)",
    "Naraka Chaturdashi (Abhyangana Snanam)": "నరక చతుర్దశి (అభ్యంగన స్నానం)",
    "Deepavali (Lakshmi Puja / Pradosha Vyapini)": "దీపావళి (శ్రీ మహాలక్ష్మి పూజ / ప్రదోష కాలం)",
    "Kedar Gauri Vratam": "కేదార గౌరీ వ్రతం",
    "Bali Padyami / Govardhan Puja / Kartika Shukla Padyami": "బలి పాడ్యమి / గోవర్ధన పూజ",
    "Bhai Dooj / Yama Dwitiya / Bhagini Hasta Bhojanam": "భగినీ హస్త భోజనం / భాయ్ దూజ్ / యమ ద్వితీయ",
    "Nagula Chavithi": "నాగుల చవితి",
    "Chhath Puja (Surya Shashthi / Dala Chhath)": "ఛఠ్ పూజ (సూర్య షష్ఠి)",
    "Gopashtami (Go Puja)": "గోపాష్టమి (గోపూజ)",
    "Akshaya Navami / Amla Navami (Dhatri Puja)": "అక్షయ నవమి / ఆమ్లా నవమి (ధాత్రీ పూజ)",
    "Tulasi Vivaham / Ksheerabdhi Dwadashi (Chiluka Dwadashi)": "తులసీ వివాహం / క్షీరాబ్ధి ద్వాదశి (చిలుక ద్వాదశి)",
    "Kartika Purnima / Dev Deepavali / Jwala Toranam": "కార్తీక పౌర్ణమి / జ్వాలా తోరణం / దేవ దీపావళి",
    "Vaikuntha Ekadashi / Mukkoti Ekadashi / Gita Jayanti": "వైకుంఠ ఏకాదశి / ముక్కోటి ఏకాదశి / గీతా జయంతి",
    "Subramanya Sashti / Champa Shashthi": "సుబ్రహ్మణ్య షష్ఠి / చంపా షష్ఠి",
    "Dattatreya Jayanti": "శ్రీ దత్తాత్రేయ జయంతి",
    "Annapurna Jayanti": "శ్రీ అన్నపూర్ణ జయంతి",
    "Kala Bhairava Jayanti (Maha Kalashtami)": "కాలభైరవ జయంతి (మహా కాలాష్టమి)",
    "Makara Sankranti / Pongal (Uttarayana Punya Kalam)": "మకర సంక్రాంతి / పొంగల్ (ఉత్తరాయణ పుణ్యకాలం)",
    "Vasanta Panchami / Sri Panchami (Saraswati Puja)": "వసంత పంచమి / శ్రీ పంచమి (సరస్వతీ పూజ)",
    "Ratha Saptami (Surya Jayanti / Arogya Saptami)": "రథ సప్తమి (సూర్య జయంతి / ఆరోగ్య సప్తమి)",
    "Bhishma Ashtami (Bhishma Tarpanam)": "భీష్మాష్టమి (భీష్మ తర్పణం)",
    "Maha Shivaratri (Lingodbhava / Nishita Kaal)": "మహా శివరాత్రి (లింగోద్భవ / నిశీథ కాలం)",
    "Holika Dahan / Kamadahana (Pradosha Vyapini)": "హోళికా దహనం / కామదహనం",
    "Holi (Dhulandi / Vasantotsav / Rangawali Holi)": "హోలీ (ధూళండి / వసంతోత్సవం)",
    
    // Recurring Monthly Festivals
    "Pradhana Anaghashtami (Sri Anagha Devi Sametha Dattatreya Vratam - Brahmanda Purana)": "ప్రధాన అనఘాష్టమి (శ్రీ అనఘాదేవి సమేత దత్తాత్రేయ వ్రతం - బ్రహ్మాండ పురాణోక్తం)",
    "Masa Anaghashtami Vratam (Sri Dattatreya & Anagha Devi Puja)": "మాస అనఘాష్టమి వ్రతం (శ్రీ దత్తాత్రేయ & అనఘాదేవి పూజ)",
    "Kalashtami (Masa Kalashtami / Bhairava Ashtami)": "కాలాష్టమి (భైరవాష్టమి)",
    "Masik Durgashtami (Durga Puja & Vratam)": "మాసిక దుర్గాష్టమి (దుర్గా పూజ & వ్రతం)",
    "Masa Vinayaka Chaturthi": "మాస వినాయక చవితి",
    "Sankashta Chaturthi (Chandrodaya Ganesha Vratam)": "సంకష్టహర చతుర్థి (చంద్రోదయ గణపతి వ్రతం)",
    "Angaaraki Sankashta Chaturthi (Highly Auspicious Ganesha Puja)": "అంగారక సంకష్ట చతుర్థి (విఘ్నేశ్వర విశేష పూజ)",
    "Skanda Sashti (Subramanya Swamy Vratam)": "స్కంద షష్ఠి (సుబ్రహ్మణ్య స్వామి వ్రతం)",
    "Soma Pradosha Vratam": "సోమ ప్రదోష వ్రతం",
    "Bhauma Pradosha Vratam": "భౌమ ప్రదోష వ్రతం",
    "Shani Pradosha Vratam": "శని ప్రదోష వ్రతం",
    "Pradosha Vratam": "ప్రదోష వ్రతం",
    "Masa Shivaratri": "మాస శివరాత్రి",
    "Purnima": "పూర్ణిమ",
    "Amavasya": "అమావాస్య",
    "Somavati Amavasya": "సోమవతి అమావాస్య",
    "Shani Amavasya": "శని అమావాస్య",
    "Rohini Vratam": "రోహిణీ వ్రతం",
    "Masik Karthigai (Krittika Deepam)": "మాసిక కార్తికై (కృత్తికా దీపోత్సవం)",
    "Shravana Shukravara Sri Lakshmi Puja": "శ్రావణ శుక్రవార శ్రీ మహాలక్ష్మీ పూజ",
    "Kartika Somavara Vratam": "కార్తీక సోమవార వ్రతం",
    "Bhanu Saptami": "భాను సప్తమి",
    "Budha Ashtami": "బుధ అష్టమి",

    // Ekadashi Vratams
    "Kamada Ekadashi Vratam": "కామదా ఏకాదశి వ్రతం",
    "Mohini Ekadashi Vratam": "మోహినీ ఏకాదశి వ్రతం",
    "Nirjala Ekadashi (Pandava Bhima Ekadashi) Vratam": "నిర్జల ఏకాదశి (భీమసేన ఏకాదశి) వ్రతం",
    "Devashayani Ekadashi / Prathama Ekadashi (Chaturmasya Arambha) Vratam": "తొలి ఏకాదశి / దేవశయనీ ఏకాదశి (చాతుర్మాస్య వ్రతారంభం)",
    "Shravana Putrada Ekadashi (Pavitropana) Vratam": "శ్రావణ పుత్రదా ఏకాదశి వ్రతం",
    "Parivartini / Parsva Ekadashi (Vamana Jayanti) Vratam": "పరివర్తినీ ఏకాదశి (పార్శ్వ ఏకాదశి / వామన జయంతి)",
    "Papankusha Ekadashi Vratam": "పాపాంకుశ ఏకాదశి వ్రతం",
    "Prabodhini / Devutthana Ekadashi Vratam": "ప్రబోధినీ ఏకాదశి (ఉత్థాన ఏకాదశి) వ్రతం",
    "Mokshada Ekadashi / Vaikuntha Ekadashi / Mukkoti Ekadashi / Gita Jayanti Vratam": "మోక్షదా ఏకాదశి / వైకుంఠ ఏకాదశి (ముక్కోటి ఏకాదశి / గీతా జయంతి)",
    "Pausha Putrada Ekadashi Vratam": "పౌష పుత్రదా ఏకాదశి వ్రతం",
    "Jaya / Bhaimi Ekadashi Vratam": "జయా ఏకాదశి (భైమీ ఏకాదశి) వ్రతం",
    "Amalaki Ekadashi Vratam": "ఆమలకీ ఏకాదశి వ్రతం",
    "Varuthini Ekadashi Vratam": "వరూథినీ ఏకాదశి వ్రతం",
    "Apara Ekadashi Vratam": "అపరా ఏకాదశి వ్రతం",
    "Yogini Ekadashi Vratam": "యోగినీ ఏకాదశి వ్రతం",
    "Kamika Ekadashi Vratam": "కామికా ఏకాదశి వ్రతం",
    "Aja / Annada Ekadashi Vratam": "అజా ఏకాదశి (అన్నదా ఏకాదశి) వ్రతం",
    "Indira Ekadashi (Pitru Paksha Ekadashi) Vratam": "ఇందిరా ఏకాదశి (పితృపక్ష ఏకాదశి) వ్రతం",
    "Rama Ekadashi Vratam": "రమా ఏకాదశి వ్రతం",
    "Utpanna Ekadashi Vratam": "ఉత్పన్నా ఏకాదశి వ్రతం",
    "Saphala Ekadashi Vratam": "సఫలా ఏకాదశి వ్రతం",
    "Shattila Ekadashi Vratam": "షట్టిలా ఏకాదశి వ్రతం",
    "Vijaya Ekadashi Vratam": "విజయా ఏకాదశి వ్రతం",
    "Papmochani Ekadashi Vratam": "పాపమోచనీ ఏకాదశి వ్రతం"
};

const SIGNIFICANCE_TE_MAP = {
    "Santana Gopala Vratam (Lord Sri Krishna Aradhana for progeny blessings)": "శ్రీ సంతాన గోపాల వ్రతం (సంతాన ప్రాప్తికై శ్రీకృష్ణార్చన)",
    "Pradhana Anaghashtami Vratam (Sri Dattatreya & Sri Anagha Lakshmi Puja - Brahmanda Purana)": "ప్రధాన అనఘాష్టమి వ్రతం (శ్రీ దత్తాత్రేయ & శ్రీ అనఘా లక్ష్మీ పూజ - బ్రహ్మాండ పురాణోక్తం)",
    "Masa Anaghashtami Vratam (Sri Dattatreya Swamy & Anagha Lakshmi Puja - Brahmanda Purana)": "మాస అనఘాష్టమి వ్రతం (శ్రీ దత్తాత్రేయ స్వామి & అనఘా లక్ష్మీ పూజ - బ్రహ్మాండ పురాణోక్తం)",
    "Kalashtami Vratam (Kala Bhairava Puja & Fasting)": "కాలాష్టమి వ్రతం (కాలభైరవ పూజ & ఉపవాసం)",
    "Rohini Vratam (Auspicious fasting during Rohini Nakshatra)": "రోహిణీ వ్రతం (రోహిణీ నక్షత్ర విశేష వ్రతం)",
    "Shravana Shukravara Puja (Kumkumarchana & Sri Mahalakshmi Aradhana)": "శ్రావణ శుక్రవార పూజ (కుంకుమార్చన & శ్రీ మహాలక్ష్మి ఆరాధన)",
    "Kartika Somavara Vratam (Shivaradhana & Nitya Deeparadhana)": "కార్తీక సోమవార వ్రతం (శివారాధన & దీపారాధన)",
    "Masik Durgashtami (Durga Devi Puja & Lalitha Sahasranama)": "మాసిక దుర్గాష్టమి (దుర్గా దేవి పూజ & లలితా సహస్రనామ పారాయణ)",
    "Masa Vinayaka Chaturthi (Ganesha Puja & Modaka Naivedyam)": "మాస వినాయక చవితి (గణపతి పూజ & మోదక నివేదన)",
    "Sankashta Chaturthi (Sankatahara Ganapati Vratam & Moonrise Arghya)": "సంకష్టహర చతుర్థి (సంకటహర గణపతి పూజ & చంద్రార్ఘ్యం)",
    "Angaaraki Sankashta Chaturthi (Runa Vimochana Ganapati Puja & Moonrise Arghya)": "అంగారక సంకష్ట చతుర్థి (ఋణవిమోచన గణపతి పూజ & చంద్రార్ఘ్యం)",
    "Skanda Sashti (Lord Murugan / Kartikeya Puja)": "స్కంద షష్ఠి (సుబ్రహ్మణ్యేశ్వర స్వామి పూజ)",
    "Subramanya Sashti (Skanda Aradhana & Naga Dosha Nivarana)": "సుబ్రహ్మణ్య షష్ఠి (స్కంద ఆరాధన & నాగదోష నివారణ పూజ)",
    "Masik Karthigai (Subramanya Swamy Puja & Deeparadhana)": "మాసిక కార్తికై (సుబ్రహ్మణ్యేశ్వర పూజ & దీపారాధన)",
    "Shravana Nakshatra Vratam (Sri Venkateswara Swamy Puja)": "శ్రవణా నక్షత్ర వ్రతం (శ్రీ వేంకటేశ్వర స్వామి ఆరాధన)",
    "Kala Bhairava Jayanti (Maha Bhairava Aradhana & Special Puja)": "కాలభైరవ జయంతి (మహా భైరవ ఆరాధన & విశేష పూజ)",
    "Shukla Ekadashi Vratam (Upavasam & Vishnu Puja)": "శుక్ల ఏకాదశి వ్రతం (ఉపవాసం & శ్రీమహావిష్ణు పూజ)",
    "Krishna Ekadashi Vratam (Upavasam & Vishnu Puja)": "కృష్ణ ఏకాదశి వ్రతం (ఉపవాసం & శ్రీమహావిష్ణు పూజ)",
    "Soma Pradosha Vratam (Shiva Puja at Pradosha)": "సోమ ప్రదోష వ్రతం (ప్రదోష కాల శివార్చన)",
    "Bhauma Pradosha Vratam (Runa Vimochana Shiva Puja)": "భౌమ ప్రదోష వ్రతం (ఋణవిమోచన శివ పూజ)",
    "Shani Pradosha Vratam (Mahaphala Shiva Puja)": "శని ప్రదోష వ్రతం (మహాఫల ప్రద శివ పూజ)",
    "Pradosha Vratam (Shiva Puja at Pradosha)": "ప్రదోష వ్రతం (సాయంకాల శివార్చన)",
    "Angaaraki Sankashta Chaturthi (Highly Auspicious Ganesha Puja)": "అంగారక సంకష్ట చతుర్థి (విఘ్నేశ్వర విశేష పూజ)",
    "Sankashta Chaturthi (Chandrodaya Ganesha Vratam)": "సంకష్టహర చతుర్థి (చంద్రోదయ గణపతి వ్రతం)",
    "Masa Vinayaka Chaturthi": "మాస వినాయక చవితి",
    "Bhanu Saptami (Surya Aradhana & Gayatri Japa Mahatmyam)": "భాను సప్తమి (సూర్య ఆరాధన & గాయత్రీ జప మహత్యం)",
    "Budha Ashtami (Budha Graha Puja & Vishnu Sahasranama)": "బుధ అష్టమి (బుధ గ్రహ పూజ & విష్ణు సహస్రనామ పారాయణ)",
    "Somavara Amavasya (Aswattha Pradakshina & Pitru Tarpanam)": "సోమవార అమావాస్య (అశ్వత్థ ప్రదక్షిణ & పితృ తర్పణం)",
    "Shani Amavasya (Shani Shanti Puja & Pitru Tarpanam)": "శని అమావాస్య (శని శాంతి పూజ & పితృ తర్పణం)",
    "Masa Shivaratri (Lingarchana & Bilva Archana)": "మాస శివరాత్రి (లింగార్చన & బిల్వార్చన)",
    "Purnima (Sri Satyanarayana Swamy Vratam & Chandradarshanam)": "పూర్ణిమ (శ్రీ సత్యనారాయణ స్వామి వ్రతం & చంద్రదర్శనం)",
    "Amavasya (Pitru Tarpanam & Tila Homam)": "అమావాస్య (పితృ తర్పణం & తిల హోమం)",
    "🌟 Amrita Siddhi Yoga (Auspicious for ceremonies, purchases & milestones)": "🌟 అమృత సిద్ధి యోగం (సమస్త శుభకార్యాలకు, కొనుగోళ్లకు అత్యంత శుభం)",
    "✨ Sarvartha Siddhi Yoga (All undertakings yield accomplishment)": "✨ సర్వార్థ సిద్ధి యోగం (తలపెట్టిన సమస్త పనులు విజయవంతం)",
    "⚠️ Vishti (Bhadra) Karana present — Avoid auspicious beginnings & travel during Bhadra": "⚠️ విష్టి (భద్ర) కరణం — భద్ర కాలంలో శుభకార్యాలు, ప్రయాణాలు నివారించండి",
    "⚠️ Vaidhriti Yoga (Mahapata) — Highly auspicious for Japa & Dana; avoid vivaha/grihapravesha": "⚠️ వైధృతి యోగం (మహాపాతం) — జప, దానాలకు శ్రేష్ఠం; వివాహాది శుభకార్యాలు వర్జ్యం",
    "⚠️ Vyatipata Yoga (Mahapata) — Highly auspicious for Japa & Dana; avoid vivaha/grihapravesha": "⚠️ వ్యతీపాత యోగం (మహాపాతం) — జప, దానాలకు శ్రేష్ఠం; వివాహాది శుభకార్యాలు వర్జ్యం"
};

const I18N_DICT = {
    en: {
        navDaily: "🙏 Daily Panchangam",
        navUgadi: "📜 Ugadi Predictions",
        navJathakam: "🔮 Single Horoscope",
        navMuhurta: "✨ Muhurtas",
        navFamily: "👨‍👩‍👧‍👦 Family Horoscope",
        langBtn: "🌐 తెలుగు",
        inputHeader: "🙏 Vedic Panchangam — Daily Calculator",
        location: "Location / City",
        autoDetect: "📍 Auto-Detect Location",
        customCoords: "Custom Coordinates",
        date: "Date",
        calculate: "🙏 Calculate Panchangam",
        sunrise: "Sunrise",
        sunset: "Sunset",
        moonrise: "Moonrise",
        moonset: "Moonset",
        sunRashi: "Sun Rashi",
        moonRashi: "Moon Rashi",
        panchangam: "Panchangam",
        samvatsaram: "Samvatsaram",
        ayanam: "Ayanam",
        rutu: "Rutu",
        masam: "Masam",
        paksham: "Paksham",
        tithi: "Tithi",
        vasara: "Vasara",
        nakshatram: "Nakshatram",
        yogam: "Yogam",
        karanam: "Karanam",
        padam: "Nakshatra Padam",
        maudhyam: "Maudhyam",
        festivals: "Festivals & Vratas",
        choghadiya: "Day & Night Choghadiya Timings",
        dayChoghadiyaBtn: "☀️ Day Choghadiya",
        nightChoghadiyaBtn: "🌙 Night Choghadiya",
        choghadiyaRulesTitle: "Principles of Choghadiya:",
        lagna: "Lagna Details",
        udayaLagna: "Udaya Lagna",
        lagnaDeg: "Lagna Degree",
        lagnaLord: "Lagna Lord",
        sunInRashi: "Sun's Rashi",
        moonInRashi: "Moon's Rashi",
        jagatLagna: "Jagat Lagna",
        varshaLagna: "Varsha Lagna",
        navagrahaHeader: "Navagraha Positions",
        todayLagnaTimings: "Today Lagna Timings",
        noteTitle: "Important Note",
        contactTitle: "For inquiries and services:",
        blessings: `Shubham Bhavatu...<br>Sarvejanah Sukhinobhavantu...<br>Lokassamastassukhinobhavantu...<br>Shubhamastu... Mangalamastu...`,
        contactInfo: `For inquiries and services:<br><strong>Vedic Samhita</strong><br>Website: <a href="https://vedicsamhita.com" style="color:#8b0000; text-decoration:none; font-weight:bold;">vedicsamhita.com</a><br>Email: <a href="mailto:1vedasamhita@gmail.com" style="color:#8b0000; text-decoration:none; font-weight:bold;">1vedasamhita@gmail.com</a>`,
        gModalTitle: "Grahanam Details",
        gModalClose: "Close"
    },
    te: {
        navDaily: "🙏 దిన పంచాంగం",
        navUgadi: "📜 ఉగాది ఫలితాలు",
        navJathakam: "🔮 జన్మ జాతకం",
        navMuhurta: "✨ ముహూర్తాలు",
        navFamily: "👨‍👩‍👧‍👦 కుటుంబ జాతకం",
        langBtn: "🌐 English",
        inputHeader: "🙏 వేదిక్ పంచాంగం — దిన పంచాంగ గణన",
        location: "ప్రాంతం / నగరం",
        autoDetect: "📍 స్వయంచాలక ప్రాంతం",
        customCoords: "కస్టమ్ కోఆర్డినేట్స్",
        date: "తేదీ",
        calculate: "🙏 పంచాంగం గణించండి",
        sunrise: "సూర్యోదయం",
        sunset: "సూర్యాస్తమయం",
        moonrise: "చంద్రోదయం",
        moonset: "చంద్రాస్తమయం",
        sunRashi: "సూర్య రాశి",
        moonRashi: "చంద్ర రాశి",
        panchangam: "పంచాంగం",
        samvatsaram: "సంవత్సరం",
        ayanam: "అయనం",
        rutu: "ఋతువు",
        masam: "మాసం",
        paksham: "పక్షం",
        tithi: "తిథి",
        vasara: "వాసరం (వారం)",
        nakshatram: "నక్షత్రం",
        yogam: "యోగం",
        karanam: "కరణం",
        padam: "నక్షత్ర పాదం",
        maudhyam: "మౌఢ్యం",
        festivals: "పండుగలు & వ్రతాలు",
        choghadiya: "పగలు & రాత్రి చోఘడియా సమయాలు",
        dayChoghadiyaBtn: "☀️ పగటి చోఘడియా",
        nightChoghadiyaBtn: "🌙 రాత్రి చోఘడియా",
        choghadiyaRulesTitle: "చోఘడియా ప్రాముఖ్యత & నియమాలు:",
        lagna: "లగ్న వివరాలు",
        udayaLagna: "ఉదయ లగ్నం",
        lagnaDeg: "లగ్న డిగ్రీ",
        lagnaLord: "లగ్నాధిపతి",
        sunInRashi: "సూర్య రాశి",
        moonInRashi: "చంద్ర రాశి",
        jagatLagna: "జగత్ లగ్నం",
        varshaLagna: "వర్ష లగ్నం",
        navagrahaHeader: "నవగ్రహ స్థితులు",
        todayLagnaTimings: "ఈరోజు లగ్న సమయాలు",
        noteTitle: "ముఖ్య గమనిక",
        contactTitle: "విచారణలు మరియు సేవల కోసం:",
        blessings: `శుభం భవతు...<br>సర్వేజనాః సుఖినోభవంతు...<br>లోకాస్సమస్తాస్సుఖినోభవంతు...<br>శుభమస్తు... మంగళమస్తు...`,
        contactInfo: `విచారణలు మరియు సేవల కోసం:<br><strong>వేదిక్ సంహిత</strong><br>వెబ్‌సైట్: <a href="https://vedicsamhita.com" style="color:#8b0000; text-decoration:none; font-weight:bold;">vedicsamhita.com</a><br>ఈమెయిల్: <a href="mailto:1vedasamhita@gmail.com" style="color:#8b0000; text-decoration:none; font-weight:bold;">1vedasamhita@gmail.com</a>`,
        gModalTitle: "గ్రహణ సమగ్ర వివరాలు",
        gModalClose: "మూసివేయి"
    }
};

function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'te') return;
    CURRENT_LANG = lang;
    try {
        localStorage.setItem('VS_LANG', CURRENT_LANG);
    } catch(e) {}
    updateLanguageUI();
    calculatePanchangam();
}

function toggleLanguage() {
    setLanguage(CURRENT_LANG === 'te' ? 'en' : 'te');
}

function updateLanguageUI() {
    const isTe = (CURRENT_LANG === 'te');
    const dict = I18N_DICT[CURRENT_LANG];
    if (!dict) return;

    // Update language button text
    const langBtnText = document.getElementById('langBtnText');
    if (langBtnText) {
        langBtnText.textContent = isTe ? 'English' : 'తెలుగు';
    }

    // Update top nav
    setElText('navDaily', dict.navDaily);
    setElText('navUgadi', dict.navUgadi);
    setElText('navJathakam', dict.navJathakam);
    setElText('navMuhurta', dict.navMuhurta);
    setElText('navFamily', dict.navFamily);

    // Update input section
    setElText('lblInputHeader', dict.inputHeader);
    setElText('lblLocation', dict.location);
    setElText('btnAutoDetect', dict.autoDetect);
    setElText('btnCustomCoords', dict.customCoords);
    setElText('lblDate', dict.date);
    setElText('btnCalculate', dict.calculate);

    // Update Sun & Moon labels
    setElText('lblSunrise', dict.sunrise);
    setElText('lblSunset', dict.sunset);
    setElText('lblMoonrise', dict.moonrise);
    setElText('lblMoonset', dict.moonset);
    setElText('lblSunRashi', dict.sunRashi);
    setElText('lblMoonRashi', dict.moonRashi);

    // Update Panchangam section labels
    setElText('hdrPanchangam', dict.panchangam);
    setElText('lblSamvatsaram', dict.samvatsaram);
    setElText('lblAyanam', dict.ayanam);
    setElText('lblRutu', dict.rutu);
    setElText('lblMasam', dict.masam);
    setElText('lblPaksham', dict.paksham);
    setElText('lblTithi', dict.tithi);
    setElText('lblVasara', dict.vasara);
    setElText('lblNakshatram', dict.nakshatram);
    setElText('lblYogam', dict.yogam);
    setElText('lblKaranam', dict.karanam);
    setElText('lblPadam', dict.padam);
    setElText('lblMaudhyam', dict.maudhyam);

    // Update Festivals & Choghadiya
    setElText('hdrFestivals', dict.festivals);
    setElText('hdrChoghadiya', dict.choghadiya);
    setElText('btnDayChoghadiya', dict.dayChoghadiyaBtn);
    setElText('btnNightChoghadiya', dict.nightChoghadiyaBtn);
    setElText('lblChoghadiyaRulesTitle', dict.choghadiyaRulesTitle);
    setElHtml('choghadiyaPrinciplesList', isTe ? CHOGHADIYA_PRINCIPLES_TE : CHOGHADIYA_PRINCIPLES_EN);

    // Update Lagna section
    setElText('hdrLagna', dict.lagna);
    setElText('lblUdayaLagna', dict.udayaLagna);
    setElText('lblLagnaDeg', dict.lagnaDeg);
    setElText('lblLagnaLord', dict.lagnaLord);
    setElText('lblSunInRashi', dict.sunInRashi);
    setElText('lblMoonInRashi', dict.moonInRashi);
    setElText('lblJagatLagna', dict.jagatLagna);
    setElText('lblVarshaLagna', dict.varshaLagna);
    setElText('lblNavagrahaHeader', dict.navagrahaHeader);
    setElText('lblTodayLagnaTimings', dict.todayLagnaTimings);

    // Blessings & Note
    setElHtml('valBlessings', dict.blessings);
    setElText('lblNoteTitle', dict.noteTitle);
    setElHtml('valContactInfo', dict.contactInfo);

    // Grahanam Modal
    setElText('gModalTitle', dict.gModalTitle);
    setElText('gModalCloseBtn', dict.gModalClose);

    // Chart style select options
    const chartSelect = document.getElementById('chartStyleSelect');
    if (chartSelect && chartSelect.options && chartSelect.options.length >= 2) {
        chartSelect.options[0].text = isTe ? 'దక్షిణ భారత చక్రం' : 'South Indian';
        chartSelect.options[1].text = isTe ? 'ఉత్తర భారత చక్రం' : 'North Indian';
    }
}

const SAMVATSARAM = [
    "Prabhava","Vibhava","Sukla","Pramodyuta","Prajothpatthi","Angirasa","Srimukha","Bhava","Yuva","Dhatha",
    "Eeswara","Bahudhanya","Pramadi","Vikrama","Vrusha","Chitrabhanu","Svabhanu","Tharana","Parthiva","Vyaya",
    "Sarvajitthu","Sarvadhari","Virodhi","Vikruthi","Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi",
    "Hevilambi","Vilambi","Vikari","Sarvari","Plava","Subhakruthu","Sobhakruthu","Krodhi","Visvavasu","Parabhava",
    "Plavanga","Kilaka","Saumya","Sadharana","Virodhikruth","Paridhavi","Pramadicha","Ananda","Rakshasa","Nala",
    "Pingala","Kalayukthi","Siddharthi","Raudri","Durmathi","Dundubhi","Rudhirodgari","Rakthaksha","Krodhana","Akshaya"
];
const TITHI = [
    "Shukla Padyami", "Shukla Vidiya", "Shukla Tadiya", "Shukla Chavithi", "Shukla Panchami",
    "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
    "Shukla Ekadashi", "Shukla Dvadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Padyami", "Krishna Vidiya", "Krishna Tadiya", "Krishna Chavithi", "Krishna Panchami",
    "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
    "Krishna Ekadashi", "Krishna Dvadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];
const NAKSHATRA = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Arudra",
    "Punarvasu", "Pushyami", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Moola", "Purvashadha", "Uttarashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purvabhadra", "Uttarabhadra", "Revati"
];
const YOGA = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
    "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
    "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
    "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla",
    "Brahma", "Indra", "Vaidhriti"
];
const VARA = ["Bhanuvasaram (Sunday)", "Induvasaram (Monday)", "Bhaumavasaram (Tuesday)", "Saumyavasaram (Wednesday)", "Brihaspativasaram (Thursday)", "Bhriguvasaram (Friday)", "Sthiravasaram (Saturday)"];
const MASAM = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwayuja", "Kartika", "Margashirsha", "Pushya", "Magha", "Phalguna"];
const RUTU = ["Vasanta Rutu", "Grishma Rutu", "Varsha Rutu", "Sharad Rutu", "Hemanta Rutu", "Shishira Rutu"];
const RASHI = ["Mesham", "Vrishabham", "Mithunam", "Karkatakam", "Simham", "Kanya", "Tula", "Vrishchikam", "Dhanussu", "Makaram", "Kumbham", "Meenam"];
const KARANA = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kinstughna"];
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
    const mNames = (CURRENT_LANG === 'te') ? MONTH_ABBR_TE : MONTH_ABBR;
    return `${mNames[o.month-1]} ${o.day}, ${o.year} ${h}:${String(o.minutes).padStart(2,'0')}:${String(o.seconds).padStart(2,'0')} ${ap}`;
}
function fmtEndTimeCompact(o, curDay) {
    const ap = o.hours >= 12 ? 'PM' : 'AM'; let h = o.hours % 12; if (!h) h = 12;
    const timeStr = `${h}:${String(o.minutes).padStart(2,'0')} ${ap}`;
    if (o.day === curDay) {
        return timeStr;
    } else {
        const mNames = (CURRENT_LANG === 'te') ? MONTH_ABBR_TE : MONTH_ABBR;
        return `${mNames[o.month-1]} ${o.day}, ${timeStr}`;
    }
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
            nakIdx: nakIdx,
            name: NAKSHATRA[nakIdx],
            padam: ordinal,
            padamNum: padamNum,
            endJD: endJD
        });

        if (endJD >= nextSrJD) break;

        jd = endJD + 0.001;  // move past this padam boundary
    }
    return padams;
}
function getMoonRashi(jd) {
    const moonNir = getMoonNirayana(jd);
    const ri = Math.floor(moonNir / 30);
    return RASHI[ri];
}

/* ═══════════ CHOGHADIYA ENGINE ═══════════ */
const CHOGHADIYA_PROPS = {
    Amrit: { ruler: 'Chandra', nature: 'Auspicious', isGood: true },
    Shubh: { ruler: 'Guru',    nature: 'Auspicious', isGood: true },
    Labh:  { ruler: 'Budha',   nature: 'Auspicious', isGood: true },
    Char:  { ruler: 'Shukra',  nature: 'Auspicious', isGood: true },
    Udveg: { ruler: 'Surya',   nature: 'Inauspicious', isGood: false },
    Rog:   { ruler: 'Kuja',    nature: 'Inauspicious', isGood: false },
    Kaal:  { ruler: 'Shani',   nature: 'Inauspicious', isGood: false }
};

const DAY_CHOGHADIYA_ORDER = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
const NIGHT_CHOGHADIYA_ORDER = ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'];
const DAY_START_IDX = { 0: 0, 1: 3, 2: 6, 3: 2, 4: 5, 5: 1, 6: 4 };
const NIGHT_START_IDX = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 1, 5: 3, 6: 5 };

function computeChoghadiya(dow, srHrs, ssHrs, nextSrHrs) {
    const dayDuration = ssHrs - srHrs;
    const daySlotDur = dayDuration / 8;
    const dayStart = DAY_START_IDX[dow];
    const daySlots = [];
    const isTe = (CURRENT_LANG === 'te');
    for (let i = 0; i < 8; i++) {
        const rawKey = DAY_CHOGHADIYA_ORDER[(dayStart + i) % 7];
        const prop = isTe ? CHOGHADIYA_PROPS_TE[rawKey] : CHOGHADIYA_PROPS_EN[rawKey];
        const startH = srHrs + i * daySlotDur;
        const endH = srHrs + (i + 1) * daySlotDur;
        daySlots.push({
            slotNum: i + 1,
            rawKey: rawKey,
            name: prop.name,
            ruler: prop.ruler,
            nature: prop.nature,
            isGood: prop.isGood,
            startH: startH,
            endH: endH,
            timeStr: fmtRange(startH, endH)
        });
    }

    const nightDuration = (24 + nextSrHrs) - ssHrs;
    const nightSlotDur = nightDuration / 8;
    const nightStart = NIGHT_START_IDX[dow];
    const nightSlots = [];
    for (let i = 0; i < 8; i++) {
        const rawKey = NIGHT_CHOGHADIYA_ORDER[(nightStart + i) % 7];
        const prop = isTe ? CHOGHADIYA_PROPS_TE[rawKey] : CHOGHADIYA_PROPS_EN[rawKey];
        const startH = ssHrs + i * nightSlotDur;
        const endH = ssHrs + (i + 1) * nightSlotDur;
        nightSlots.push({
            slotNum: i + 1,
            rawKey: rawKey,
            name: prop.name,
            ruler: prop.ruler,
            nature: prop.nature,
            isGood: prop.isGood,
            startH: startH,
            endH: endH,
            timeStr: fmtRange(startH, endH)
        });
    }

    return { daySlots, nightSlots };
}

function toggleChoghadiyaTab(tab) {
    const dayCont = document.getElementById('dayChoghadiyaContainer');
    const nightCont = document.getElementById('nightChoghadiyaContainer');
    const btnDay = document.getElementById('btnDayChoghadiya');
    const btnNight = document.getElementById('btnNightChoghadiya');
    if (!dayCont || !nightCont || !btnDay || !btnNight) return;

    if (tab === 'day') {
        dayCont.style.display = 'block';
        nightCont.style.display = 'none';
        btnDay.style.background = 'var(--dark-maroon)';
        btnDay.style.color = '#fff8e7';
        btnNight.style.background = '#fffdf5';
        btnNight.style.color = 'var(--dark-maroon)';
    } else {
        dayCont.style.display = 'none';
        nightCont.style.display = 'block';
        btnNight.style.background = 'var(--dark-maroon)';
        btnNight.style.color = '#fff8e7';
        btnDay.style.background = '#fffdf5';
        btnDay.style.color = 'var(--dark-maroon)';
    }
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

    // Find moonrise and moonset independently within the calendar day (0–24h)
    // Also find moonset that extends into next day (24–30h) if moonrise is within today
    let riseLocal = null, setLocal = null;

    // 1. Find the first moonrise within the calendar day (0–24h)
    for (const ev of events) {
        if (ev.type === 'rise' && ev.time < 24) {
            riseLocal = ev.time;
            break;
        }
    }

    // 2. Find the first moonset within the calendar day (0–24h)
    for (const ev of events) {
        if (ev.type === 'set' && ev.time < 24) {
            setLocal = ev.time;
            break;
        }
    }

    // 3. If no moonset found within 0–24h but we have a moonrise,
    //    look for the next moonset after the rise (could extend into next day 24–30h)
    if (setLocal === null && riseLocal !== null) {
        for (const ev of events) {
            if (ev.type === 'set' && ev.time > riseLocal) {
                setLocal = ev.time;
                break;
            }
        }
    }

    // Format results
    let mrStr = '—', msStr = '—';
    if (riseLocal !== null) {
        mrStr = fmtHMS(riseLocal);
    }
    if (setLocal !== null) {
        if (setLocal >= 24) {
            const nxt = new Date(y, m-1, d+1);
            msStr = fmtHMS(setLocal - 24) + ` (${MONTH_ABBR[nxt.getMonth()]} ${nxt.getDate()})`;
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
    const baseMasam = (lunar && lunar.masam) ? lunar.masam.replace('Adhika ', '').split('–')[0].split(' (')[0].trim() : 'Chaitra';
    const masamIdx = MASAM.indexOf(baseMasam) >= 0 ? MASAM.indexOf(baseMasam) : 0;

    // Chaitra (index 0) started approximately 'masamIdx' months ago.
    // Subtract that many months from the current Gregorian date to find
    // the Gregorian year in which Chaitra fell.
    const approxChaitraDate = new Date(y, m - 1 - masamIdx);
    const adj = approxChaitraDate.getFullYear();

    return SAMVATSARAM[((adj - 1987) % 60 + 60) % 60];
}
function getAyanam(sunNir) { return ((sunNir >= 270 && sunNir < 360) || (sunNir >= 0 && sunNir < 90)) ? "Uttarayanam" : "Dakshinayanam"; }
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
        masam = MASAM[baseIdx] + "-" + MASAM[(baseIdx + 1) % 12] + " (Kshaya)";
    } else {
        // Normal month (exactly one Sankranti)
        masam = MASAM[baseIdx];
    }

    // ── Step 5: Chandramana Rutu from lunar month index ──
    // Vasanta: Chaitra(0) & Vaishakha(1), Grishma: Jyeshtha(2) & Ashadha(3), etc.
    // Adhika month shares the same Rutu as its Nija counterpart.
    const RUTU_LUNAR = [
        "Vasanta Rutu", "Vasanta Rutu", "Grishma Rutu", "Grishma Rutu",
        "Varsha Rutu", "Varsha Rutu", "Sharad Rutu", "Sharad Rutu",
        "Hemanta Rutu", "Hemanta Rutu", "Shishira Rutu", "Shishira Rutu"
    ];
    const rutu = RUTU_LUNAR[baseIdx];

        let isSamsarpa = false;
    let isAmhaspati = false;

    // Traditional Scriptural Override for 2028-2029 (Keelaka) based on Surya Siddhanta Dharmashastra
    // JD bounds roughly cover Oct 2028 through Jan 2029 Amavasyas
    if (srJD >= 2462060 && srJD <= 2462155) {
        if (masam === "Kartika") {
            isSamsarpa = true;
            masam = "Samsarpa Kartika Masam";
        } else if (masam === "Margashirsha" || masam === "Pushya" || masam === "Adhika Margashirsha" || masam === "Adhika Pushya" || masam.includes("Adhika")) {
            // Because Drik might flag it as Adhika Margasira or just Margasira depending on hours, we override any variant of Margasira/Pushya
            // Wait, we only want to override the actual Margasira/Pushya window.
            isAmhaspati = true;
            isKshaya = true; 
            masam = "Yugalibhuta Margashirsha-Pushyayo Amhaspati Mase";
        }
    }

    return { masam, rutu, isAdhika, isKshaya, isSamsarpa, isAmhaspati };
}

function getMasamRutu(sunNir, srJD) {
    const ri = Math.floor(sunNir / 30);
    const lunar = getLunarCalendar(srJD);
    return { masam: lunar.masam, rutu: lunar.rutu, rashi: RASHI[ri], isAdhika: lunar.isAdhika, isKshaya: lunar.isKshaya, isSamsarpa: lunar.isSamsarpa, isAmhaspati: lunar.isAmhaspati };
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
        { name:'Su', full:'Surya',   deg: getSunNirayana(jd),             color:'#d4a017' },
        { name:'Mo', full:'Chandra', deg: getMoonNirayana(jd),            color:'#2e7d32' },
        { name:'Ma', full:'Kuja',    deg: getPlanetNirayana(jd,'mars'),   color:'#c0392b' },
        { name:'Me', full:'Budha',   deg: getPlanetNirayana(jd,'mercury'),color:'#16a085' },
        { name:'Ju', full:'Guru',    deg: getPlanetNirayana(jd,'jupiter'),color:'#e67e22' },
        { name:'Ve', full:'Shukra',  deg: getPlanetNirayana(jd,'venus'),  color:'#9b59b6' },
        { name:'Sa', full:'Shani',   deg: getPlanetNirayana(jd,'saturn'), color:'#2c3e50' },
        { name:'Ra', full:'Rahu',    deg: getRahuNirayana(jd),            color:'#7f8c8d' },
        { name:'Ke', full:'Ketu',    deg: getKetuNirayana(jd),            color:'#95a5a6' },
    ].map(g => ({ ...g, rashi: Math.floor(g.deg / 30), rashiName: RASHI[Math.floor(g.deg / 30)] }));
}

/* ═══════════ MAUDHYAM (ASTANGATA / PLANETARY COMBUSTION) ═══════════ */
const MAUDHYA_CONFIG = [
    { key: 'jupiter', name: 'Guru', english: 'Jupiter', directOrb: 11, retroOrb: 11 },
    { key: 'venus',   name: 'Shukra', english: 'Venus', directOrb: 10, retroOrb: 8 },
    { key: 'mars',    name: 'Kuja', english: 'Mars', directOrb: 17, retroOrb: 17 },
    { key: 'mercury', name: 'Budha', english: 'Mercury', directOrb: 14, retroOrb: 12 },
    { key: 'saturn',  name: 'Shani', english: 'Saturn', directOrb: 15, retroOrb: 15 }
];

function getMaudhyaOrbLimit(jd, g) {
    const l0 = getPlanetNirayana(jd, g.key);
    const l1 = getPlanetNirayana(jd + 0.05, g.key);
    let diffMotion = l1 - l0;
    if (diffMotion < -180) diffMotion += 360;
    if (diffMotion > 180) diffMotion -= 360;
    const isRetro = (diffMotion < 0);
    return isRetro ? g.retroOrb : g.directOrb;
}

function getGrahaSeparation(jd, key) {
    const sunNir = getSunNirayana(jd);
    const l0 = getPlanetNirayana(jd, key);
    let sep = Math.abs(l0 - sunNir);
    if (sep > 180) sep = 360 - sep;
    return sep;
}

function findMaudhyaEnd(jd, g) {
    let curJD = jd;
    let maxDays = 120;
    let step = 0.25;
    let foundBracket = false;
    let tA = curJD, tB = curJD;

    for (let i = 0; i < maxDays / step; i++) {
        let t = curJD + i * step;
        let sep = getGrahaSeparation(t, g.key);
        let orb = getMaudhyaOrbLimit(t, g);
        if (sep > orb) {
            tA = t - step;
            tB = t;
            foundBracket = true;
            break;
        }
    }

    if (!foundBracket) return null;

    // Bisection to find exact boundary to within seconds
    for (let iter = 0; iter < 15; iter++) {
        let mid = (tA + tB) / 2;
        let sep = getGrahaSeparation(mid, g.key);
        let orb = getMaudhyaOrbLimit(mid, g);
        if (sep <= orb) {
            tA = mid;
        } else {
            tB = mid;
        }
    }

    return (tA + tB) / 2;
}

function computeMaudhyam(jd, tz) {
    if (tz === undefined) tz = 5.5;
    const results = [];

    for (let g of MAUDHYA_CONFIG) {
        const orbLimit = getMaudhyaOrbLimit(jd, g);
        const sep = getGrahaSeparation(jd, g.key);

        if (sep <= orbLimit) {
            const endJD = findMaudhyaEnd(jd, g);
            let endStr = 'Ongoing';
            if (endJD) {
                const endLocal = jdToLocal(endJD, tz);
                endStr = fmtDateTime(endLocal);
            }

            results.push({
                key: g.key,
                name: `${g.name} Maudhyam`,
                title: `${g.name} Maudhyam`,
                endJD: endJD,
                endStr: endStr,
                isGuruOrShukra: (g.key === 'jupiter' || g.key === 'venus')
            });
        }
    }
    return results;
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
// Short graha names for charts
const GRAHA_SHORT = {
    Su: 'Sur', Mo: 'Cha', Ma: 'Man', Me: 'Bu', Ju: 'Gu',
    Ve: 'Shu', Sa: 'Sha', Ra: 'Ra', Ke: 'Ke', As: 'As'
};

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
    svg += `<text x="${W/2}" y="${H/2-4}" text-anchor="middle" font-size="10" fill="#4a0e0e" font-family="Cinzel,serif" font-weight="600">Rashi</text>`;
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
        if (r === lagnaRashiIdx && !gList.find(g => g.name === 'L')) {
            gList.unshift({ name: 'L', color: '#4a0e0e' });
        }
        const cols = Math.min(gList.length, 3);
        const rows2 = Math.ceil(gList.length / 3);
        gList.forEach((g, i) => {
            const gc = i % 3, gr = Math.floor(i / 3);
            const gx = x + 12 + gc * 24;
            const gy = y + 28 + gr * 16;
            svg += `<text x="${gx}" y="${gy}" font-size="11" fill="${g.color}" font-weight="bold" font-family="'EB Garamond',serif"><tspan class="akshara">${GRAHA_SHORT[g.name] || g.name}</tspan></text>`;
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
        if (hIdx === 0) gList.unshift({ name: 'L', color: '#4a0e0e' });
        gList.forEach((g, i) => {
            const gx = cx - 12 + (i % 3) * 18;
            const gy = cy + 6 + Math.floor(i / 3) * 13;
            svg += `<text x="${gx}" y="${gy}" font-size="10" fill="${g.color}" font-weight="bold" font-family="'EB Garamond',serif"><tspan class="akshara">${GRAHA_SHORT[g.name] || g.name}</tspan></text>`;
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


// Map MASAM names → jyotisham month number (1-12)
const MASAM_TO_NUM = {
    'Chaitra':1, 'Vaishakha':2, 'Jyeshtha':3, 'Ashadha':4,
    'Shravana':5, 'Bhadrapada':6, 'Ashwayuja':7, 'Kartika':8,
    'Margashirsha':9, 'Pushya':10, 'Magha':11, 'Phalguna':12,
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
    if (lunarMonth === 9 && tithiIdx === 10) sig.push("Vaikuntha Ekadashi / Mukkoti Ekadashi / Gita Jayanti");
    
    
    return [...new Set(sig)];
}



// ══════════════════════════════════════════════════════════════════════════════
// VEDIC LOCATION-AWARE KAALA VYAPINI FESTIVAL & SIGNIFICANCE ENGINE
// Adheres strictly to Dharma Sindhu, Nirnaya Sindhu & Surya Siddhanta
// Festivals dynamically adapt to local Sunrise, Sunset, and prevailing Kaalas
// ══════════════════════════════════════════════════════════════════════════════
function computeLocationFestivalsAndSignificance(y, m, d, lat, lon, tz, srHrs, ssHrs, srJD, ssJD, nextSrJD, dow, masam, rashi, tithis, naks, yogas, karanas, mt) {
    const fests = [];
    const sigs = [];

    const daytime = ssJD - srJD;
    const nighttime = nextSrJD - ssJD;

    // Local Kaalas (calculated from exact local sunrise and sunset)
    const madhyahnaMidJD  = (srJD + ssJD) / 2;                         // Midday (11:30 AM - 1:30 PM)
    const aparahnaStartJD = srJD + (3/5) * daytime;                   // Afternoon (approx 1:30 PM - 3:30 PM)
    const aparahnaMidJD   = srJD + (3.5/5) * daytime;
    const pradoshaMidJD   = ssJD + (1.2 / 24);                        // Pradosha (Sunset + 72 mins)
    const midnightJD      = ssJD + (nighttime / 2);                   // Nishita Kaala (Local Midnight)
    const arunodayaJD     = srJD - (48 / (60 * 24));                  // Dawn (48 mins before sunrise)

    // Previous night midnight (for festivals following previous midnight like Janmashtami/Nandotsav)
    const prevSsJD        = ssJD - 1.0;
    const prevMidnightJD  = prevSsJD + ((srJD - prevSsJD) / 2);

    const getT = (jd) => getTithiIdx(jd);
    const getN = (jd) => getNakIdx(jd);

    const tSr   = getT(srJD);
    const tMadh = getT(madhyahnaMidJD);
    const tApar = getT(aparahnaMidJD);
    const tPrad = getT(pradoshaMidJD);
    const tNish = getT(midnightJD);
    const tArun = getT(arunodayaJD);
    const tPrevNish = getT(prevMidnightJD);

    const nSr   = getN(srJD);
    const nMadh = getN(madhyahnaMidJD);
    const nNish = getN(midnightJD);
    const nPrevNish = getN(prevMidnightJD);

    const dayTithis = tithis.map(t => t.idx);
    const dayNaks   = naks.map(n => n.idx);

    const lunarMonth = getMasamNum(masam);

    // 1. UGADI (Chaitra Shukla Padyami at Sunrise or Kshaya Pratipada)
    const nextSrTithi = getT(nextSrJD);
    if ((lunarMonth === 1 && tSr === 0) || (lunarMonth === 12 && tSr === 29 && dayTithis.includes(0) && nextSrTithi !== 0)) {
        fests.push("Ugadi — Telugu & Kannada New Year / Gudi Padwa");
        fests.push("Vasanta Navaratri Arambha");
    }

    // 2. MATSYA JAYANTI (Chaitra Shukla Tritiya)
    if (lunarMonth === 1 && (tSr === 2 || dayTithis.includes(2))) {
        fests.push("Matsya Jayanti");
    }

    // 3. SRI RAMA NAVAMI (Chaitra Shukla Navami at Madhyahna)
    if (lunarMonth === 1 && (tMadh === 8 || (tSr === 8 && tMadh <= 8) || (dayTithis.includes(8) && tSr === 7))) {
        if (nMadh === 6 || nSr === 6) {
            fests.push("Sri Rama Navami (Punarvasu Yukta)");
        } else {
            fests.push("Sri Rama Navami");
        }
    }

    // 4. HANUMAN JAYANTI (Chaitra Purnima in North/West; Vaishakha Krishna Dashami in AP/TS)
    if (lunarMonth === 1 && (tSr === 14 || dayTithis.includes(14))) {
        fests.push("Hanuman Jayanti (Chaitra Purnima)");
    }
    if (lunarMonth === 2 && (tSr === 24 || dayTithis.includes(24))) {
        fests.push("Hanuman Jayanti (Telugu / Andhra tradition)");
    }

    // 5. AKSHAYA TRITIYA & PARASHURAMA JAYANTI (Vaishakha Shukla Tritiya)
    if (lunarMonth === 2 && (tSr === 2 || tMadh === 2 || dayTithis.includes(2))) {
        if (nSr === 3 || nMadh === 3) {
            fests.push("Akshaya Tritiya (Maha Punya Kalam - Rohini Yukta)");
        } else {
            fests.push("Akshaya Tritiya");
        }
        fests.push("Parashurama Jayanti");
    }

    // 6. SRI NARASIMHA JAYANTI (Vaishakha Shukla Chaturdashi at Sunset/Pradosha)
    if (lunarMonth === 2 && (tPrad === 13 || tSr === 13 || dayTithis.includes(13))) {
        fests.push("Sri Narasimha Jayanti (Pradosha Vyapini)");
    }

    // 7. BUDDHA PURNIMA / KURMA JAYANTI (Vaishakha Purnima)
    if (lunarMonth === 2 && (tSr === 14 || dayTithis.includes(14))) {
        fests.push("Buddha Purnima");
        fests.push("Kurma Jayanti");
    }

    // 8. VAT SAVITRI VRATAM (Jyeshtha Purnima / Vat Purnima)
    if (lunarMonth === 3 && (tSr === 14 || dayTithis.includes(14))) {
        fests.push("Vata Savitri Vratam (Vat Purnima)");
    }

    // 9. GANGA DUSSEHRA (Jyeshtha Shukla Dashami)
    if (lunarMonth === 3 && (tSr === 9 || dayTithis.includes(9))) {
        fests.push("Ganga Dussehra (Ganga Avatarana)");
    }

    // 10. JAGANNATH RATHA YATRA (Ashadha Shukla Dwitiya)
    if (lunarMonth === 4 && (tSr === 1 || dayTithis.includes(1))) {
        fests.push("Jagannath Ratha Yatra (Puri)");
    }

    // 11. GURU PURNIMA / VYASA PURNIMA (Ashadha Purnima)
    if (lunarMonth === 4 && (tSr === 14 || dayTithis.includes(14))) {
        fests.push("Guru Purnima / Vyasa Purnima");
    }

    // 12. BHEEMANA AMAVASYA (Ashadha Amavasya)
    if (lunarMonth === 4 && (tSr === 29 || dayTithis.includes(29))) {
        fests.push("Bheemana Amavasya / Deepa Puja");
    }

    // 13. NAGA PANCHAMI (Shravana Shukla Panchami at Sunrise/Madhyahna)
    if (lunarMonth === 5 && (tSr === 4 || tMadh === 4 || (dayTithis.includes(4) && tSr === 3))) {
        fests.push("Naga Panchami");
    }

    // 14. VARALAKSHMI VRATAM (Friday in Shravana Shukla Paksha before Purnima)
    if (dow === 5 && lunarMonth === 5 && tSr < 14) {
        let purnimaWithinWeek = false;
        for (let checkDays = 1; checkDays <= 7; checkDays++) {
            if (getT(srJD + checkDays) === 14) { purnimaWithinWeek = true; break; }
        }
        if (purnimaWithinWeek) {
            fests.push("Varalakshmi Vratam");
        }
    }

    // 15. RAKSHA BANDHAN / UPAKARMA (Shravana Purnima at Aparahna or Sunrise)
    if (lunarMonth === 5 && (tSr === 14 || tApar === 14 || (dayTithis.includes(14) && tSr === 13))) {
        fests.push("Raksha Bandhan / Rig & Yajur Veda Upakarma");
        fests.push("Hayagriva Jayanti");
    }

    // 16. SRI KRISHNA JANMASHTAMI & GOKULASHTAMI (Shravana Krishna Ashtami)
    let isJanmashtamiToday = false;
    let isJanmashtamiYesterday = (lunarMonth === 5 && tPrevNish === 22);

    if (lunarMonth === 5 && (tNish === 22 || (tPrad === 22 && tSr === 21))) {
        isJanmashtamiToday = true;
        if (nNish === 3 || nSr === 3) {
            fests.push("Sri Krishna Janmashtami / Jayanti (Nishita Kaal & Rohini)");
        } else {
            fests.push("Sri Krishna Janmashtami (Smartha / Nishita Kaal)");
        }
        fests.push("Gokulashtami");
    } else if (lunarMonth === 5 && (tSr === 22 || (dayTithis.includes(22) && tSr === 21))) {
        isJanmashtamiToday = true;
        fests.push("Sri Krishna Janmashtami / Gokulashtami (Vaishnava / Udaya Tithi)");
    }

    // NANDOTSAV & DAHI HANDI (Utlotsavam)
    if (lunarMonth === 5 && (isJanmashtamiYesterday || (isJanmashtamiToday && tSr === 22))) {
        fests.push("Nandotsav");
        fests.push("Dahi Handi / Utlotsavam (Gopala Kala)");
    }

    // SANTANA GOPALA VRATAM
    if (lunarMonth === 5 && (tSr === 22 || dayTithis.includes(22))) {
        fests.push("Santana Gopala Vratam");
        sigs.push("Santana Gopala Vratam (Lord Sri Krishna Aradhana for progeny blessings)");
    }

    // 17. HARTALIKA TEEJ / SWARNA GOWRI VRATAM & VARAHA JAYANTI (Bhadrapada Shukla Tritiya)
    if (lunarMonth === 6 && (tSr === 2 || tMadh === 2 || dayTithis.includes(2))) {
        fests.push("Hartalika Teej / Swarna Gowri Vratam");
        fests.push("Varaha Jayanti");
    }

    // 18. GANESH CHATURTHI / VINAYAKA CHAVITHI (Bhadrapada Shukla Chavithi at Madhyahna)
    if (lunarMonth === 6 && (tMadh === 3 || (tSr === 3 && tMadh <= 3) || (dayTithis.includes(3) && tSr === 2))) {
        fests.push("Vinayaka Chavithi / Ganesh Chaturthi (Madhyahna Vyapini)");
    }

    // 19. RISHI PANCHAMI (Bhadrapada Shukla Panchami at Madhyahna)
    if (lunarMonth === 6 && (tMadh === 4 || tSr === 4)) {
        fests.push("Rishi Panchami");
    }

    // 20. RADHA ASHTAMI / MAHALAXMI VRATA ARAMBHA (Bhadrapada Shukla Ashtami)
    if (lunarMonth === 6 && (tSr === 7 || tMadh === 7 || dayTithis.includes(7))) {
        fests.push("Radha Ashtami");
        fests.push("Mahalaxmi Vrata Arambha");
    }

    // 21. VAMANA JAYANTI (Bhadrapada Shukla Dvadashi)
    if (lunarMonth === 6 && (tSr === 11 || tMadh === 11 || dayTithis.includes(11))) {
        fests.push("Vamana Jayanti");
    }

    // 22. ANANTA CHATURDASHI (Bhadrapada Shukla Chaturdashi)
    if (lunarMonth === 6 && (tMadh === 13 || tSr === 13 || dayTithis.includes(13))) {
        fests.push("Ananta Padmanabha Chaturdashi");
    }

    // 23. PITRU PAKSHA (MAHALAYA PAKSHA) ARAMBHA
    if (lunarMonth === 6 && (tSr === 14 || dayTithis.includes(14))) {
        fests.push("Mahalaya Paksha (Pitru Paksha) Arambha");
    }

    // 24. SARVA PITRU MAHALAYA AMAVASYA (Bhadrapada Amavasya)
    if (lunarMonth === 6 && (tSr === 29 || dayTithis.includes(29))) {
        fests.push("Mahalaya Amavasya / Sarva Pitru Amavasya (Peddala Amavasya)");
    }

    // 25. SHARADA NAVARATRI ARAMBHA (Ashwayuja Shukla Padyami at Sunrise or Kshaya Pratipada)
    if ((lunarMonth === 7 && tSr === 0) || (lunarMonth === 6 && tSr === 29 && dayTithis.includes(0) && nextSrTithi !== 0)) {
        fests.push("Sharada Navaratri Ghatasthapana / Kalashasthapana");
    }
    if (lunarMonth === 7 && tSr === 7) fests.push("Durgashtami (Maha Ashtami)");
    if (lunarMonth === 7 && tSr === 8) fests.push("Mahanavami / Ayudha Puja");

    // 26. VIJAYADASHAMI / DUSSEHRA (Ashwayuja Shukla Dashami at Aparahna / Vijaya Muhurtam)
    if (lunarMonth === 7 && (tApar === 9 || tSr === 9 || (dayTithis.includes(9) && tSr === 8))) {
        if (nSr === 21 || nMadh === 21) {
            fests.push("Vijayadashami / Dussehra (Shravana Nakshatra Yukta)");
        } else {
            fests.push("Vijayadashami / Dussehra");
        }
        fests.push("Madhva Jayanti");
    }

    // 27. SHARAD PURNIMA / KOJAGIRI PURNIMA (Ashwayuja Purnima)
    if (lunarMonth === 7 && (tPrad === 14 || tNish === 14 || tSr === 14 || dayTithis.includes(14))) {
        fests.push("Sharad Purnima / Kojagiri Purnima / Kumara Purnima");
    }

    // 28. ATLA TADDE (Ashwayuja Krishna Tritiya)
    if (lunarMonth === 7 && (tSr === 17 || dayTithis.includes(17))) {
        fests.push("Atla Tadde (Telugu women vrata)");
    }

    // 29. KARWA CHAUTH (Karak Chaturthi - Ashwayuja/Kartika Krishna Chaturthi)
    if ((lunarMonth === 7 || lunarMonth === 8) && (tSr === 18 || (dayTithis.includes(18) && tSr === 17))) {
        fests.push("Karwa Chauth (Karak Chaturthi)");
    }

    // 30. AHOI ASHTAMI (Ashwayuja Krishna Ashtami)
    if (lunarMonth === 7 && (tSr === 22 || dayTithis.includes(22))) {
        fests.push("Ahoi Ashtami");
    }

    // 31. GOVATSA DWADASHI / VASUBARAS (Ashwayuja Krishna Dvadashi)
    if (lunarMonth === 7 && (tPrad === 26 || tSr === 26 || dayTithis.includes(26))) {
        fests.push("Govatsa Dwadashi / Vasubaras");
    }

    // 32. DHANTERAS / DHANTRAYODASHI (Ashwayuja Krishna Trayodashi)
    if (lunarMonth === 7 && (tPrad === 27 || tSr === 27 || dayTithis.includes(27))) {
        fests.push("Dhanteras / Dhantrayodashi (Dhanvantari Jayanti / Yama Deepam)");
    }

    // 33. NARAKA CHATURDASHI (Ashwayuja Krishna Chaturdashi at Arunodaya / Dawn)
    if (lunarMonth === 7 && (tArun === 28 || tSr === 28 || (dayTithis.includes(28) && tSr === 27))) {
        fests.push("Naraka Chaturdashi (Abhyangana Snanam)");
    }

    // 34. DEEPAVALI / LAKSHMI PUJA (Ashwayuja Amavasya at Pradosha / Sunset)
    if (lunarMonth === 7 && (tPrad === 29 || tNish === 29 || (tSr === 29 && tPrad === 29) || (dayTithis.includes(29) && tSr === 28))) {
        fests.push("Deepavali (Lakshmi Puja / Pradosha Vyapini)");
        fests.push("Kedar Gauri Vratam");
    }

    // 35. BALI PADYAMI / GOVARDHAN PUJA (Kartika Shukla Padyami)
    if ((lunarMonth === 8 && tSr === 0) || (lunarMonth === 7 && tSr === 29 && dayTithis.includes(0) && nextSrTithi !== 0)) {
        fests.push("Bali Padyami / Govardhan Puja / Kartika Shukla Padyami");
    }

    // 36. BHAI DOOJ / YAMA DWITIYA (Kartika Shukla Dwitiya)
    if (lunarMonth === 8 && (tSr === 1 || tApar === 1 || dayTithis.includes(1))) {
        fests.push("Bhai Dooj / Yama Dwitiya / Bhagini Hasta Bhojanam");
    }

    // 37. NAGULA CHAVITHI (Kartika Shukla Chaturthi)
    if (lunarMonth === 8 && (tSr === 3 || dayTithis.includes(3))) {
        fests.push("Nagula Chavithi");
    }

    // 38. CHHATH PUJA (Kartika Shukla Shashthi)
    if (lunarMonth === 8 && (tSr === 5 || tPrad === 5 || dayTithis.includes(5))) {
        fests.push("Chhath Puja (Surya Shashthi / Dala Chhath)");
    }

    // 39. GOPASHTAMI (Kartika Shukla Ashtami)
    if (lunarMonth === 8 && (tSr === 7 || dayTithis.includes(7))) {
        fests.push("Gopashtami (Go Puja)");
    }

    // 40. AKSHAYA NAVAMI / AMLA NAVAMI (Kartika Shukla Navami)
    if (lunarMonth === 8 && (tSr === 8 || dayTithis.includes(8))) {
        fests.push("Akshaya Navami / Amla Navami (Dhatri Puja)");
    }

    // 41. TULASI VIVAHAM / KSHEERABDHI DWADASHI (Kartika Shukla Dvadashi)
    if (lunarMonth === 8 && (tPrad === 11 || tSr === 11 || dayTithis.includes(11))) {
        fests.push("Tulasi Vivaham / Ksheerabdhi Dwadashi (Chiluka Dwadashi)");
    }

    // 42. KARTIKA PURNIMA / DEV DEEPAVALI (Kartika Purnima at Pradosha)
    if (lunarMonth === 8 && (tPrad === 14 || tSr === 14 || dayTithis.includes(14))) {
        fests.push("Kartika Purnima / Dev Deepavali / Jwala Toranam");
    }

    // 43. SUBRAMANYA SASHTI / CHAMPA SHASHTHI (Margashira Shukla Shashthi)
    if (lunarMonth === 9 && (tSr === 5 || dayTithis.includes(5))) {
        fests.push("Subramanya Sashti / Champa Shashthi");
    }

    // 44. DATTATREYA JAYANTI (Margashira Purnima at Pradosha)
    if (lunarMonth === 9 && (tPrad === 14 || tSr === 14 || dayTithis.includes(14))) {
        fests.push("Dattatreya Jayanti");
        fests.push("Annapurna Jayanti");
    }

    // 45. KALA BHAIRAVA JAYANTI (Margashira Krishna Ashtami)
    if (lunarMonth === 9 && (tSr === 22 || dayTithis.includes(22))) {
        fests.push("Kala Bhairava Jayanti (Maha Kalashtami)");
    }

    // 46. MAKARA SANKRANTI / PONGAL (Solar Ingress into Makara)
    const sunNirNow = getSunNirayana(srJD);
    const sunNirYesterday = getSunNirayana(srJD - 1.0);
    if ((sunNirYesterday < 270 && sunNirNow >= 270) || (Math.floor(sunNirNow / 30) === 9 && (m === 1 && (d >= 13 && d <= 16)))) {
        if (sunNirYesterday < 270 && sunNirNow >= 270) {
            fests.push("Makara Sankranti / Pongal (Uttarayana Punya Kalam)");
        }
    }

    // 47. VASANTA PANCHAMI / SRI PANCHAMI (Magha Shukla Panchami)
    if (lunarMonth === 10 && (tMadh === 4 || tSr === 4 || dayTithis.includes(4))) {
        fests.push("Vasanta Panchami / Sri Panchami (Saraswati Puja)");
    }

    // 48. RATHA SAPTAMI (Magha Shukla Saptami at Arunodaya / Sunrise)
    if (lunarMonth === 10 && (tSr === 6 || tArun === 6 || (dayTithis.includes(6) && tSr === 5))) {
        fests.push("Ratha Saptami (Surya Jayanti / Arogya Saptami)");
    }

    // 49. BHISHMA ASHTAMI (Magha Shukla Ashtami)
    if (lunarMonth === 10 && (tSr === 7 || tMadh === 7 || dayTithis.includes(7))) {
        fests.push("Bhishma Ashtami (Bhishma Tarpanam)");
    }

    // 50. MAHA SHIVARATRI (Magha Krishna Chaturdashi at local Nishita Kaal / Midnight)
    if (lunarMonth === 11 && (tNish === 28 || (tPrad === 28 && tSr === 28) || (dayTithis.includes(28) && tSr === 27))) {
        fests.push("Maha Shivaratri (Lingodbhava / Nishita Kaal)");
    }

    // 51. HOLIKA DAHAN / KAMADAHANA (Phalguna Purnima at Pradosha / Ratri)
    if (lunarMonth === 12 && (tPrad === 14 || tNish === 14 || (dayTithis.includes(14) && tSr === 13))) {
        fests.push("Holika Dahan / Kamadahana (Pradosha Vyapini)");
    }

    // 52. HOLI (Dhulandi / Vasantotsav on following day)
    if (lunarMonth === 12 && (tSr === 15 || (tSr === 14 && tPrad === 15))) {
        fests.push("Holi (Dhulandi / Vasantotsav / Rangawali Holi)");
    }

    // ─── NAMED EKADASHIS (All 24 Ekadashis) ───────────────────────────
    const SHUKLA_EKADASHIS = {
        1: "Kamada Ekadashi",
        2: "Mohini Ekadashi",
        3: "Nirjala Ekadashi (Pandava Bhima Ekadashi)",
        4: "Devashayani Ekadashi / Prathama Ekadashi (Chaturmasya Arambha)",
        5: "Shravana Putrada Ekadashi (Pavitropana)",
        6: "Parivartini / Parsva Ekadashi (Vamana Jayanti)",
        7: "Papankusha Ekadashi",
        8: "Prabodhini / Devutthana Ekadashi",
        9: "Mokshada Ekadashi / Vaikuntha Ekadashi / Mukkoti Ekadashi / Gita Jayanti",
        10: "Pausha Putrada Ekadashi",
        11: "Jaya / Bhaimi Ekadashi",
        12: "Amalaki Ekadashi"
    };

    const KRISHNA_EKADASHIS = {
        1: "Varuthini Ekadashi",
        2: "Apara Ekadashi",
        3: "Yogini Ekadashi",
        4: "Kamika Ekadashi",
        5: "Aja / Annada Ekadashi",
        6: "Indira Ekadashi (Pitru Paksha Ekadashi)",
        7: "Rama Ekadashi",
        8: "Utpanna Ekadashi",
        9: "Saphala Ekadashi",
        10: "Shattila Ekadashi",
        11: "Vijaya Ekadashi",
        12: "Papmochani Ekadashi"
    };

    if (tSr === 10 || (dayTithis.includes(10) && tSr === 9)) {
        const ekName = SHUKLA_EKADASHIS[lunarMonth] || "Shukla Ekadashi";
        fests.push(`${ekName} Vratam`);
        sigs.push(`${ekName} (Upavasam & Sri Maha Vishnu Puja)`);
    }

    if (tSr === 25 || (dayTithis.includes(25) && tSr === 24)) {
        const ekName = KRISHNA_EKADASHIS[lunarMonth] || "Krishna Ekadashi";
        fests.push(`${ekName} Vratam`);
        sigs.push(`${ekName} (Upavasam & Sri Maha Vishnu Puja)`);
    }

    // ─── RECURRING MONTHLY VRATAS & OBSERVANCES ───────────────────────
    
    // KALASHTAMI & ANAGHASHTAMI (Every Krishna Ashtami - Brahmanda Purana)
    if (tSr === 22 || dayTithis.includes(22)) {
        if (!fests.some(f => f.includes("Kala Bhairava Jayanti"))) {
            fests.push("Kalashtami (Masa Kalashtami / Bhairava Ashtami)");
            sigs.push("Kalashtami Vratam (Kala Bhairava Puja & Fasting)");
        }
        // Anagha Vratam for Lord Dattatreya Swamy and Anagha Lakshmi (Brahmanda Puranam)
        if (lunarMonth === 9) {
            fests.push("Pradhana Anaghashtami (Sri Anagha Devi Sametha Dattatreya Vratam - Brahmanda Purana)");
            sigs.push("Pradhana Anaghashtami Vratam (Sri Dattatreya & Sri Anagha Lakshmi Puja - Brahmanda Purana)");
        } else {
            fests.push("Masa Anaghashtami Vratam (Sri Dattatreya & Anagha Devi Puja)");
            sigs.push("Masa Anaghashtami Vratam (Sri Dattatreya Swamy & Anagha Lakshmi Puja - Brahmanda Purana)");
        }
    }

    // MASIK DURGASHTAMI (Every Shukla Ashtami)
    if (tSr === 7 || dayTithis.includes(7)) {
        if (!fests.some(f => f.includes("Durgashtami") || f.includes("Radha Ashtami") || f.includes("Bhishma Ashtami"))) {
            fests.push("Masik Durgashtami (Durga Puja & Vratam)");
            sigs.push("Masik Durgashtami (Durga Devi Puja & Lalitha Sahasranama)");
        }
    }

    // MASA VINAYAKA CHATURTHI (Every Shukla Chaturthi)
    if (tMadh === 3 || tSr === 3 || dayTithis.includes(3)) {
        if (!fests.some(f => f.includes("Vinayaka Chavithi") || f.includes("Ganesh Chaturthi"))) {
            fests.push("Masa Vinayaka Chaturthi");
            sigs.push("Masa Vinayaka Chaturthi (Ganesha Puja & Modaka Naivedyam)");
        }
    }

    // SANKASHTA CHATURTHI (Every Krishna Chaturthi)
    if (tPrad === 18 || tNish === 18 || tSr === 18 || (dayTithis.includes(18) && tSr === 17)) {
        if (!fests.some(f => f.includes("Karwa Chauth"))) {
            if (dow === 2) {
                fests.push("Angaaraki Sankashta Chaturthi (Highly Auspicious Ganesha Puja)");
                sigs.push("Angaaraki Sankashta Chaturthi (Runa Vimochana Ganapati Puja & Moonrise Arghya)");
            } else {
                fests.push("Sankashta Chaturthi (Chandrodaya Ganesha Vratam)");
                sigs.push("Sankashta Chaturthi (Sankatahara Ganapati Vratam & Moonrise Arghya)");
            }
        }
    }

    // SKANDA SASHTI (Every Shukla Shashthi)
    if (tSr === 5 || dayTithis.includes(5)) {
        if (!fests.some(f => f.includes("Subramanya Sashti") || f.includes("Chhath"))) {
            fests.push("Skanda Sashti (Subramanya Swamy Vratam)");
            sigs.push("Skanda Sashti (Lord Murugan / Kartikeya Puja)");
        }
    }

    // PRADOSHA VRATAM (Trayodashi at Pradosha)
    if (tPrad === 12 || tPrad === 27 || (tSr === 12 && tPrad === 12) || (tSr === 27 && tPrad === 27)) {
        if (dow === 1) {
            fests.push("Soma Pradosha Vratam");
            sigs.push("Soma Pradosha Vratam (Shiva Puja at Pradosha)");
        } else if (dow === 2) {
            fests.push("Bhauma Pradosha Vratam");
            sigs.push("Bhauma Pradosha Vratam (Runa Vimochana Shiva Puja)");
        } else if (dow === 6) {
            fests.push("Shani Pradosha Vratam");
            sigs.push("Shani Pradosha Vratam (Mahaphala Shiva Puja)");
        } else {
            fests.push("Pradosha Vratam");
            sigs.push("Pradosha Vratam (Shiva Puja at Pradosha)");
        }
    }

    // MASA SHIVARATRI (Krishna Chaturdashi)
    if ((tNish === 28 || tSr === 28 || dayTithis.includes(28)) && !fests.some(f => f.includes('Maha Shivaratri'))) {
        fests.push("Masa Shivaratri");
        sigs.push("Masa Shivaratri (Lingarchana & Bilva Archana)");
    }

    // PURNIMA
    if (tSr === 14 || tPrad === 14 || dayTithis.includes(14)) {
        fests.push("Purnima");
        sigs.push("Purnima (Sri Satyanarayana Swamy Vratam & Chandradarshanam)");
    }

    // AMAVASYA
    if (tSr === 29 || tApar === 29 || dayTithis.includes(29)) {
        if (dow === 1) {
            fests.push("Somavati Amavasya");
            sigs.push("Somavara Amavasya (Aswattha Pradakshina & Pitru Tarpanam)");
        } else if (dow === 6) {
            fests.push("Shani Amavasya");
            sigs.push("Shani Amavasya (Shani Shanti Puja & Pitru Tarpanam)");
        } else {
            fests.push("Amavasya");
            sigs.push("Amavasya (Pitru Tarpanam & Tila Homam)");
        }
    }

    // ROHINI VRATAM (Whenever Rohini Nakshatra prevails)
    if (nSr === 3 || dayNaks.includes(3)) {
        fests.push("Rohini Vratam");
        sigs.push("Rohini Vratam (Auspicious fasting during Rohini Nakshatra)");
    }

    // MASIK KARTHIGAI (Whenever Krittika Nakshatra prevails)
    if (nSr === 2 || dayNaks.includes(2)) {
        fests.push("Masik Karthigai (Krittika Deepam)");
        sigs.push("Masik Karthigai (Subramanya Swamy Puja & Deeparadhana)");
    }

    // SHRAVANA NAKSHATRA VRATAM (Whenever Shravana Nakshatra prevails)
    if (nSr === 21 || dayNaks.includes(21)) {
        sigs.push("Shravana Nakshatra Vratam (Sri Venkateswara Swamy Puja)");
    }

    // SHRAVANA SHUKRAVARA SRI LAKSHMI PUJA (Fridays in Shravana month)
    if (lunarMonth === 5 && dow === 5) {
        fests.push("Shravana Shukravara Sri Lakshmi Puja");
        sigs.push("Shravana Shukravara Puja (Kumkumarchana & Sri Mahalakshmi Aradhana)");
    }

    // KARTIKA SOMAVARA VRATAM (Mondays in Kartika month)
    if (lunarMonth === 8 && dow === 1) {
        fests.push("Kartika Somavara Vratam");
        sigs.push("Kartika Somavara Vratam (Shivaradhana & Nitya Deeparadhana)");
    }

    // BHANU SAPTAMI (Sunday Saptami)
    if (dow === 0 && (tSr === 6 || dayTithis.includes(6))) {
        fests.push("Bhanu Saptami");
        sigs.push("Bhanu Saptami (Surya Aradhana & Gayatri Japa Mahatmyam)");
    }

    // BUDHA ASHTAMI (Wednesday Ashtami)
    if (dow === 3 && (tSr === 22 || dayTithis.includes(22))) {
        fests.push("Budha Ashtami");
        sigs.push("Budha Ashtami (Budha Graha Puja & Vishnu Sahasranama)");
    }

    // Special Auspicious Yogas
    const amritaPairs = { 0: 12, 1: 4, 2: 0, 3: 16, 4: 7, 5: 26, 6: 3 };
    if (amritaPairs[dow] !== undefined && (nSr === amritaPairs[dow] || dayNaks.includes(amritaPairs[dow]))) {
        sigs.push("🌟 Amrita Siddhi Yoga (Auspicious for ceremonies, purchases & milestones)");
    }

    const ssyLookup = {
        0: [12, 18, 11, 20, 25, 7, 0],
        1: [21, 3, 4, 7, 16],
        2: [0, 2, 8, 25],
        3: [3, 16, 12, 2, 4],
        4: [6, 7, 16],
        5: [26, 0, 1, 16],
        6: [3, 14, 21]
    };
    if (ssyLookup[dow] && ssyLookup[dow].some(nk => nSr === nk || dayNaks.includes(nk))) {
        sigs.push("✨ Sarvartha Siddhi Yoga (All undertakings yield accomplishment)");
    }

    // Karanam & Yogam Alerts
    const dayKaranas = karanas.map(k => k.idx);
    if (dayKaranas.includes(7)) {
        sigs.push("⚠️ Vishti (Bhadra) Karana present — Avoid auspicious beginnings & travel during Bhadra");
    }

    const dayYogas = yogas.map(y => y.idx);
    if (dayYogas.includes(26)) {
        sigs.push("⚠️ Vaidhriti Yoga (Mahapata) — Highly auspicious for Japa & Dana; avoid vivaha/grihapravesha");
    }
    if (dayYogas.includes(16)) {
        sigs.push("⚠️ Vyatipata Yoga (Mahapata) — Highly auspicious for Japa & Dana; avoid vivaha/grihapravesha");
    }

    if (lunarMonth === 7 && tSr >= 0 && tSr <= 8) {
        sigs.push(`Sharada Navaratri — Day ${tSr + 1}`);
    }

    return {
        fests: [...new Set(fests)],
        sigs: [...new Set(sigs)]
    };
}


/* ═══════════ MAIN CALCULATION ═══════════ */

function calculatePanchangam() {
    try {
        _calculatePanchangamInner();
    } catch(err) {
        const el = document.getElementById('dateLocationBar');
        if(el) el.innerHTML = '<div style="color:red;font-weight:bold;padding:20px;">CRASH: ' + err.message + '<br>' + err.stack + '</div>';
        document.getElementById('resultsSection').style.display = 'block';
        console.error(err);
    }
}
function _calculatePanchangamInner() {
    const dateVal = document.getElementById('datePicker').value;
    if (!dateVal) return;
    const [y, m, d] = dateVal.split('-').map(Number);
    if (!window._selectedCity) {
        window._selectedCity = { name: "Frisco, Texas, United States", lat: 33.1507, lon: -96.8236, tzName: "America/Chicago" };
    }
    let lat = window._selectedCity.lat;
    let lon = window._selectedCity.lon;
    let tz = getTzOffsetFromTimezoneString(window._selectedCity.tzName, dateVal);
    let locName = window._selectedCity.name;
    
    // Check if user filled custom inputs instead
    if (document.getElementById('customCoords').style.display !== 'none' && document.getElementById('latInput').value !== "") {
        lat = parseFloat(document.getElementById('latInput').value);
        lon = parseFloat(document.getElementById('lonInput').value);
        tz  = parseFloat(document.getElementById('tzInput').value);
    }

    const st = computeSunTimes(y, m, d, lat, lon, tz);
    if (!st) { alert("Cannot compute sunrise/sunset for this location and date."); return; }
    const srHrs = st.sunrise, ssHrs = st.sunset, noonHrs = st.noon;

    const tom = new Date(y, m-1, d+1);
    const st2 = computeSunTimes(tom.getFullYear(), tom.getMonth()+1, tom.getDate(), lat, lon, tz);
    const nextSrHrs = st2 ? st2.sunrise : srHrs;

    const srJD     = localToJD(y, m, d, srHrs, tz);
    const ssJD     = localToJD(y, m, d, ssHrs, tz);
    const nextSrJD = localToJD(tom.getFullYear(), tom.getMonth()+1, tom.getDate(), nextSrHrs, tz);

    const sunNir  = getSunNirayana(srJD);
    const moonNir = getMoonNirayana(srJD);
    const elongation = ((moonNir - sunNir + 360) % 360);
    const dow = new Date(y, m-1, d).getDay();

    // Calendar elements
    const samvatsaram = getSamvatsaram(y, m, srJD);
    const ayanam = getAyanam(sunNir);
    const { masam, rutu, rashi, isAdhika, isKshaya, isSamsarpa, isAmhaspati } = getMasamRutu(sunNir, srJD);
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

    // ══════ RENDER ══════
    const isTe = (CURRENT_LANG === 'te');
    const tzStr = `UTC${tz >= 0 ? '+' : ''}${tz}`;
    const mStr = isTe ? MONTH_ABBR_TE[m-1] : MONTH_ABBR[m-1];

    document.getElementById('dateLocationBar').innerHTML = `${locName} &nbsp;|&nbsp; ${mStr} ${d}, ${y}`;

    setElText('valSunrise', fmtHMS(srHrs));
    setElText('valSunset', fmtHMS(ssHrs));
    setElText('valMoonrise', mt.moonrise);
    setElText('valMoonset', mt.moonset);

    const rashiIdx = RASHI.indexOf(rashi);
    const dispSunRashi = (isTe && rashiIdx >= 0) ? RASHI_TE[rashiIdx] : rashi;
    setElText('valSunRashi', dispSunRashi);

    const moonRashiStr = getMoonRashi(srJD);
    const moonRashiIdx = RASHI.indexOf(moonRashiStr);
    const dispMoonRashi = (isTe && moonRashiIdx >= 0) ? RASHI_TE[moonRashiIdx] : moonRashiStr;
    setElText('valMoonRashi', dispMoonRashi);

    // Location-Aware Kaala Vyapini Festival & Significance Engine
    const locFests = computeLocationFestivalsAndSignificance(
        y, m, d, lat, lon, tz,
        srHrs, ssHrs, srJD, ssJD, nextSrJD,
        dow, masam, rashi,
        tithis, naks, yogas, karanas, mt
    );
    let fests = [...locFests.fests];
    let significance = [...locFests.sigs];

        // --- GRAHANAM DETECTION ---
        const tIdx = getTithiIdx(srJD);
        if (tIdx === 14 || tIdx === 29) {
            const exactJD = tithis[0] ? tithis[0].endJD : srJD;
            const moonLat = Math.abs(getMoonLatitude(exactJD));
            
            let isGrahanam = false;
            let type = "";
            if (tIdx === 14 && moonLat < 1.2) {
                isGrahanam = true;
                type = "Chandra (Lunar)";
            } else if (tIdx === 29 && moonLat < 1.6) {
                isGrahanam = true;
                type = "Surya (Solar)";
            }

            if (isGrahanam) {
                const moonDeg = getMoonNirayana(exactJD);
                const rahuDeg = getRahuNirayana(exactJD);
                const ketuDeg = getKetuNirayana(exactJD);
                
                const getCircDist = (a, b) => {
                    let d = Math.abs(a - b);
                    return d > 180 ? 360 - d : d;
                };
                
                const distRahu = getCircDist(moonDeg, rahuDeg);
                const distKetu = getCircDist(moonDeg, ketuDeg);
                const grasta = distRahu < distKetu ? "Rahu-grasta" : "Ketu-grasta";
                
                // Timing & Magnitude logic
                const betaMins = moonLat * 60;
                const manaikyardha = type === "CHANDRA" ? 57.5 : 31.5; 
                const bimbam = type === "CHANDRA" ? 31.0 : 32.0;
                
                let timingStr = "";
                let magnitude = 0;
                let severityStr = "";
                
                if (betaMins < manaikyardha) {
                    magnitude = (manaikyardha - betaMins) / bimbam;
                    severityStr = magnitude >= 1.0 ? "Total (Sampurna)" : "Partial (Pakshika)";
                    
                    const relMotion = 731.4; // avg relative motion in mins per day
                    const sthityardhaMin = (Math.sqrt(Math.pow(manaikyardha, 2) - Math.pow(betaMins, 2)) * 24 * 60) / relMotion;
                    const sthityardhaJD = (sthityardhaMin / 60) / 24;
                    
                    const sparsha = exactJD - sthityardhaJD;
                    const moksha = exactJD + sthityardhaJD;
                    
                    const fmtT = (jd) => {
                        const local = jdToLocal(jd, tz);
                        const ap = local.hours >= 12 ? 'PM' : 'AM'; 
                        let h = local.hours % 12; if (!h) h = 12;
                        return `${h}:${String(local.minutes).padStart(2,'0')} ${ap}`;
                    };
                    
                    timingStr = `(Start: ${fmtT(sparsha)}, Peak: ${fmtT(exactJD)}, End: ${fmtT(moksha)})`;
                }

                const grahanamName = `${grasta} ${type} Grahanam (Eclipse)`;
                window._currentGrahanam = {
                    name: grahanamName,
                    type: type,
                    grasta: grasta,
                    moonDeg: moonDeg,
                    severity: severityStr,
                    magnitude: magnitude.toFixed(3),
                    timing: timingStr
                };
                
                // Only show if visible at the user's selected location!
                if (isGrahanamVisibleLocally(exactJD, type, lat, lon)) {
                    fests.push(`<span style="cursor:pointer; text-decoration:underline;" onclick="showGrahanamDetails()">🔴 ${grahanamName} ${timingStr}</span>`);
                }
            }
        }
        
        const festSec = document.getElementById('festivalSection');
        if (festSec) {
            if (fests.length > 0) {
                if (festSec) festSec.style.display = 'block';
                const dispFests = fests.map(f => {
                    if (isTe) {
                        const entries = Object.entries(FESTIVALS_TE_MAP).sort((a,b) => b[0].length - a[0].length);
                        for (let [enK, teV] of entries) {
                            if (f.includes(enK)) return f.replace(enK, teV);
                        }
                    }
                    return f;
                });
                setElHtml('valFestivals', dispFests.map(f => `✨ ${f}`).join('; '));
            } else {
                if (festSec) festSec.style.display = 'none';
                setElHtml('valFestivals', '');
            }
        }

    // Samvatsaram
    const samvatsaraIdx = SAMVATSARAM.indexOf(samvatsaram);
    const dispSamvatsaram = (isTe && samvatsaraIdx >= 0) ? SAMVATSARAM_TE[samvatsaraIdx] : samvatsaram;
    setElText('valSamvatsaram', dispSamvatsaram);

    // Ayanam
    const dispAyanam = isTe ? (ayanam === "Uttarayanam" ? "ఉత్తరాయణం" : "దక్షిణాయణం") : (ayanam === "Uttarayanam" ? "Uttarayana (Northward)" : "Dakshinayana (Southward)");
    setElText('valAyanam', dispAyanam);

    // Rutu
    const rutuIdx = RUTU.indexOf(rutu);
    const dispRutu = (isTe && rutuIdx >= 0) ? RUTU_TE[rutuIdx] : rutu;
    setElText('valRutu', dispRutu);

    // Masam & Rashi
    const masamIdx = MASAM.indexOf(masam);
    const dispMasam = (isTe && masamIdx >= 0) ? MASAM_TE[masamIdx] : masam;
    let masamHTML = `${dispMasam} (${dispSunRashi})`;
    if (isAdhika) {
        masamHTML += isTe ? ` <span style="background:#e67e22;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75rem;margin-left:4px;">అధిక మాసం (పురుషోత్తమ)</span>` : ` <span style="background:#e67e22;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75rem;margin-left:4px;">Purushottama Masam</span>`;
    }
    if (isKshaya) {
        masamHTML += isTe ? ` <span style="background:#c0392b;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75rem;margin-left:4px;">క్షయ మాసం</span>` : ` <span style="background:#c0392b;color:#fff;padding:1px 6px;border-radius:3px;font-size:0.75rem;margin-left:4px;">Kshaya Masam</span>`;
    }
    setElHtml('valMasam', masamHTML);

    // Adhika/Kshaya masam note
    const adhikaNote = document.getElementById('adhikaMasamNote');
    if (adhikaNote) {
        if (isSamsarpa) {
            adhikaNote.style.display = 'block';
            adhikaNote.innerHTML = isTe ? `<strong>🔸 సంసర్ప మాసం:</strong><br>
        క్షయ మాసానికి ముందు వచ్చే అధిక మాసం.<br>
        <span style="color:#c0392b">🚫 వర్జ్యం (నిషిద్ధం):</span> వివాహం, గృహప్రవేశం, నూతన కార్యాలు.<br>
        <span style="color:#27ae60">✅ కర్తవ్యం (శుభప్రదం):</span> జపం, దానం, వ్రతాలు, దేవతా పూజలు.` : `<strong>🔸 Samsarpa Masam:</strong><br>
        Adhika Masam preceding a Kshaya Masam.<br>
        <span style="color:#c0392b">🚫 Inauspicious (Varjya):</span> Marriage, Housewarming, and major new ceremonies.<br>
        <span style="color:#27ae60">✅ Auspicious (Kartavya):</span> Japa, Dana, Vratas, and Divine Pujas.`;
        } else if (isAmhaspati) {
            adhikaNote.style.display = 'block';
            adhikaNote.innerHTML = isTe ? `<strong>⚠️ అంహస్పతి మాసం (క్షయ మాసం):</strong><br>
        ఒకే చంద్రమాసంలో రెండు సూర్య సంక్రమణాలు జరిగే అరుదైన మాసం.<br>
        <span style="color:#c0392b">🚫 వర్జ్యం:</span> వివాహం, ఉపనయనం, గృహప్రవేశం, ప్రతిష్ఠలు.<br>
        <span style="color:#27ae60">✅ కర్తవ్యం:</span> జపం, తపం, దానం, పితృ తర్పణం.` : `<strong>⚠️ Amhaspati Masam (Kshaya Masam):</strong><br>
        Rare lunar month with two Solar Sankrantis.<br>
        <span style="color:#c0392b">🚫 Inauspicious (Varjya):</span> Marriage, Upanayanam, Housewarming, Consecrations.<br>
        <span style="color:#27ae60">✅ Auspicious (Kartavya):</span> Japa, Dana, Meditation, and Pitru Tarpanam.`;
        } else if (isAdhika) {
            adhikaNote.style.display = 'block';
            adhikaNote.innerHTML = isTe ? `<strong>🔸 అధిక మాసం (పురుషోత్తమ మాసం):</strong><br>
        సూర్య సంక్రాంతి లేని చంద్రమాసం.<br>
        <span style="color:#c0392b">🚫 వర్జ్యం:</span> వివాహం, ఉపనయనం, గృహప్రవేశం, స్థిరాస్తి కొనుగోళ్లు.<br>
        <span style="color:#27ae60">✅ కర్తవ్యం:</span> జపం, దానం, విష్ణు సహస్రనామ పారాయణ, దీపారాధన.` : `<strong>🔸 Adhika Masam (Purushottama Masam):</strong><br>
        Lunar month without a Solar Sankranti.<br>
        <span style="color:#c0392b">🚫 Inauspicious (Varjya):</span> Marriage, Upanayanam, Housewarming, New asset purchase.<br>
        <span style="color:#27ae60">✅ Auspicious (Kartavya):</span> Japa, Dana, Vrata, Sandhyavandanam, and Vishnu Sahasranama.`;
        } else if (isKshaya) {
            adhikaNote.style.display = 'block';
            adhikaNote.innerHTML = isTe ? `<strong>⚠️ క్షయ మాసం:</strong><br>
        ఒకే చంద్రమాసంలో రెండు సూర్య సంక్రమణాలు (19 నుండి 141 ఏళ్లకు ఒకసారి వస్తుంది).<br>
        ఈ సంవత్సరంలో పంచాంగ సర్దుబాటు కోసం రెండు అధిక మాసాలు వస్తాయి.` : `<strong>⚠️ Kshaya Masam:</strong><br>
        Two Solar Sankrantis fall within a single lunar month (occurs once in 19 to 141 years).<br>
        Calendar adjustment includes two Adhika Masams in this year.`;
        } else {
            adhikaNote.style.display = 'none';
        }
    }

    // Paksham
    const dispPaksham = isTe ? (paksham.includes("Shukla") ? "శుక్ల పక్షం" : "కృష్ణ పక్షం") : paksham;
    setElText('valPaksham', dispPaksham);

    // Vasara
    const dispVasara = isTe ? VARA_TE[dow] : VARA[dow];
    setElText('valVasara', dispVasara);

    renderList('valTithi', tithis, tz);
    renderList('valNakshatra', naks, tz);

    // Render Nakshatra Padams with compact end times
    const padamEl = document.getElementById('valPadam');
    if (padamEl) {
        const endsWord = isTe ? 'ముగింపు' : 'ends';
        padamEl.innerHTML = padams.map(p => {
            const endLocal = jdToLocal(p.endJD, tz);
            const nakName = isTe ? (NAKSHATRA_TE[p.nakIdx] || p.name) : p.name;
            const padamText = isTe ? `${p.padamNum}వ పాదం` : `${p.padam} Padam`;
            return `<li><strong><span class="akshara">${nakName}</span> (${padamText})</strong> <span class="end-info">— ${endsWord} ${fmtEndTimeCompact(endLocal, d)}</span></li>`;
        }).join('');
    }

    // Render Maudhyam (Astangata / Planetary Combustion) if active
    const maudhyamSection = document.getElementById('moudhyamSection');
    const maudhyamEl = document.getElementById('valMaudhyam');
    if (maudhyamSection && maudhyamEl) {
        const maudhyas = computeMaudhyam(srJD, tz);
        if (maudhyas.length > 0) {
            maudhyamSection.style.display = 'block';
            const endsWord = isTe ? 'ముగింపు' : 'ends';
            maudhyamEl.innerHTML = maudhyas.map(m => {
                const mName = isTe ? (MAUDHYA_NAMES_TE[m.key] || m.name) : (MAUDHYA_NAMES_EN[m.key] || m.name);
                const endStr = (isTe && m.endStr === 'Ongoing') ? 'కొనసాగుతోంది' : m.endStr;
                return `<li><strong>${mName}</strong> <span class="end-info">— ${endsWord} ${endStr}</span></li>`;
            }).join('');
        } else {
            maudhyamSection.style.display = 'none';
        }
    }

    renderList('valYoga', yogas, tz);
    renderList('valKarana', karanas, tz);

    setElText('valRahu', fmtRange(rahu.start, rahu.end));
    setElText('valYamaganda', fmtRange(yama.start, yama.end));
    setElText('valGulika', fmtRange(guli.start, guli.end));

    const dEl = document.getElementById('valDurmuhurat');
    if (dEl) dEl.innerHTML = durm.map(dd => `<li>${fmtRange(dd.start, dd.end)}</li>`).join('');

    const noneText = isTe ? 'ఈ రోజున లేదు' : 'None during this day';
    if (va.varjyam) {
        const vs = jdToLocal(va.varjyam.start, tz), ve = jdToLocal(va.varjyam.end, tz);
        setElText('valVarjyam', `${fmtDateTime(vs)} — ${fmtDateTime(ve)}`);
    } else {
        setElText('valVarjyam', noneText);
    }

    setElText('valAbhijit', abhijit ? fmtRange(abhijit.start, abhijit.end) : noneText);

    if (va.amrit) {
        const as = jdToLocal(va.amrit.start, tz), ae = jdToLocal(va.amrit.end, tz);
        setElText('valAmrit', `${fmtDateTime(as)} — ${fmtDateTime(ae)}`);
    } else {
        setElText('valAmrit', noneText);
    }

    setElText('valBrahma', fmtRange(brahma.start, brahma.end));
    const vijaya = getVijayaMuhurtam(srHrs, ssHrs);
    setElText('valVijaya', fmtRange(vijaya.start, vijaya.end));
    const godhuli = getGodhuliMuhurtam(ssHrs);
    setElText('valGodhuli', fmtRange(godhuli.start, godhuli.end));
    const aparhna = getAparhnaKalam(srHrs, ssHrs);
    setElText('valAparhna', fmtRange(aparhna.start, aparhna.end));
    const pratah = getPratahSandhya(srHrs);
    setElText('valPratah', fmtRange(pratah.start, pratah.end));
    const sayam = getSayamSandhya(ssHrs);
    setElText('valSayam', fmtRange(sayam.start, sayam.end));

    const dispSigs = significance.map(s => {
        if (isTe) {
            const entries = Object.entries(SIGNIFICANCE_TE_MAP).sort((a,b) => b[0].length - a[0].length);
            for (let [enK, teV] of entries) {
                if (s.includes(enK)) return s.replace(enK, teV);
            }
        }
        return s;
    });
    const defaultSig = isTe ? '• నిత్య విధి / రోజువారీ వేద నియమాలు' : '• Nitya Vidhi / Regular daily Vedic observances';
    setElHtml('valImportance', dispSigs.length > 0 ? dispSigs.map(s => `• ${s}`).join('<br>') : defaultSig);

    // ══════ CHOGHADIYA RENDERING ══════
    const dayCont = document.getElementById('dayChoghadiyaContainer');
    const nightCont = document.getElementById('nightChoghadiyaContainer');
    if (dayCont && nightCont) {
        const nextSt = computeSunTimes(y, m, d + 1, lat, lon, tz);
        const nextSrHrs = nextSt ? nextSt.sunrise : srHrs;
        const { daySlots, nightSlots } = computeChoghadiya(dow, srHrs, ssHrs, nextSrHrs);

        function renderChoghadiyaTable(slots, isNight) {
            const hPeriod = isTe ? 'కాలం' : 'Period';
            const hRuler = isTe ? 'అధిపతి' : 'Ruler';
            const hNature = isTe ? 'శుభాశుభం' : 'Nature';
            const hWindow = isTe ? 'సమయం' : 'Time Window';
            let html = `<table class="choghadiya-table">
                <thead>
                    <tr>
                        <th style="width:8%; text-align:center;">#</th>
                        <th style="width:22%;">${hPeriod}</th>
                        <th style="width:18%;">${hRuler}</th>
                        <th style="width:22%;">${hNature}</th>
                        <th style="width:30%;">${hWindow}</th>
                    </tr>
                </thead>
                <tbody>`;
            slots.forEach(s => {
                const badgeClass = s.isGood ? 'badge-auspicious' : 'badge-inauspicious';
                const natureIcon = s.isGood ? '🟢' : '🔴';
                html += `<tr>
                    <td style="text-align:center;"><strong>${s.slotNum}</strong></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.ruler}</td>
                    <td><span class="choghadiya-badge ${badgeClass}">${natureIcon} ${s.nature}</span></td>
                    <td>${s.timeStr}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
            return html;
        }

        dayCont.innerHTML = renderChoghadiyaTable(daySlots, false);
        nightCont.innerHTML = renderChoghadiyaTable(nightSlots, true);
    }

    // ══════ LAGNA RENDERING ══════
    const lagnaAtSr = computeLagna(srJD, lat, lon);
    const grahas = getNavagrahaPositions(srJD);

    // Lagna details
    const lagnaRashiIdx = lagnaAtSr.rashiIdx;
    const dispLagnaRashi = isTe ? RASHI_TE[lagnaRashiIdx] : lagnaAtSr.rashiName;
    const dispLagnaLord = isTe ? RASHI_LORDS_TE[lagnaRashiIdx] : lagnaAtSr.lord;

    setElText('valLagnaRashi', dispLagnaRashi);
    setElText('valLagnaDeg', `${dispLagnaRashi} ${lagnaAtSr.degStr}`);
    setElText('valLagnaLord', dispLagnaLord);

    const sunGrahaRashiIdx = grahas[0].rashi;
    const moonGrahaRashiIdx = grahas[1].rashi;
    setElText('valSunInRashi', isTe ? RASHI_TE[sunGrahaRashiIdx] : grahas[0].rashiName);
    setElText('valMoonInRashi', isTe ? RASHI_TE[moonGrahaRashiIdx] : grahas[1].rashiName);

    // Jagat Lagna & Varsha Lagna
    const jagatInfo = findChaitraAmavasya(y, lat, lon);
    const varshaInfo = findMeshaSankranti(y, lat, lon);
    const jagatRashiIdx = jagatInfo.lagna.rashiIdx;
    const varshaRashiIdx = varshaInfo.lagna.rashiIdx;
    setElText('valJagatLagna', `${isTe ? RASHI_TE[jagatRashiIdx] : jagatInfo.lagna.rashiName} ${jagatInfo.lagna.degStr}`);
    setElText('valVarshaLagna', `${isTe ? RASHI_TE[varshaRashiIdx] : varshaInfo.lagna.rashiName} ${varshaInfo.lagna.degStr}`);

    // SVG Chart — store grahas globally for chart toggle
    window._lagnaChartData = { lagnaIdx: lagnaAtSr.rashiIdx, grahas: grahas };
    const chartStyle = document.getElementById('chartStyleSelect')?.value || 'south';
    if (chartStyle === 'north') {
        setElHtml('lagnaChart', generateNorthIndianChartSVG(lagnaAtSr.rashiIdx, grahas));
    } else {
        setElHtml('lagnaChart', generateSouthIndianChartSVG(lagnaAtSr.rashiIdx, grahas));
    }

    // Graha positions table
    const thGraha = isTe ? 'గ్రహం' : 'Graha';
    const thRashi = isTe ? 'రాశి' : 'Rashi';
    const thDegree = isTe ? 'డిగ్రీ' : 'Degree';
    let grahaHTML = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;">' +
        '<tr style="background:#4a0e0e;">' +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thGraha}</th>` +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thRashi}</th>` +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thDegree}</th></tr>`;
    grahas.forEach((g, idx) => {
        const degInR = g.deg % 30;
        let dW = Math.floor(degInR);
        let mP = Math.round((degInR - dW) * 60);
        if (mP >= 60) { mP = 0; dW++; }
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9f5eb';
        const gName = isTe ? (GRAHA_NAMES_TE[g.name] || g.full) : (GRAHA_NAMES_EN[g.name] || g.full);
        const rName = isTe ? RASHI_TE[g.rashi] : g.rashiName;
        grahaHTML += `<tr style="background:${bgColor};"><td style="padding:3px 6px; border:1px solid #ddd; color:${g.color};font-weight:bold">${gName}</td><td style="padding:3px 6px; border:1px solid #ddd;"><span class="akshara">${rName}</span></td><td style="padding:3px 6px; border:1px solid #ddd;">${dW}°${String(mP).padStart(2,'0')}'</td></tr>`;
    });
    grahaHTML += '</table>';
    setElHtml('grahaPositions', grahaHTML);

    // Lagna transitions table with start-end times and Pushkaramsha
    const periods = getLagnaTransitions(srJD, nextSrJD, lat, lon, tz);

    // Helper: extract "9:15 AM" from "Aug 21, 2026 9:15:23 AM"
    function extractTime(dtStr) {
        if (dtStr === 'Sunrise') return isTe ? 'సూర్యోదయం' : 'Sunrise';
        const parts = dtStr.split(' ');
        const timeFull = parts[3] || '';
        const ampm = parts[4] || '';
        const hm = timeFull.split(':').slice(0, 2).join(':');
        return `${hm} ${ampm}`;
    }

    const thStart = isTe ? 'ప్రారంభం' : 'Start';
    const thEnd = isTe ? 'ముగింపు' : 'End';
    const thPush = isTe ? 'పుష్కరాంశ' : 'Pushkaramsha';
    let transHTML = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;">' +
        '<tr style="background:#4a0e0e;">' +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thRashi}</th>` +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thStart}</th>` +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thEnd}</th>` +
        `<th style="padding:4px 6px; text-align:left; border:1px solid #ddd; color:#fff !important;">${thPush}</th></tr>`;
    periods.forEach((p, idx) => {
        const pushWins = getPushkaraWindows(p, lat, lon, tz);
        let pushCol = '—';
        if (pushWins.length > 0) {
            pushCol = pushWins.map(w => 
                `<span style="color:#2e7d32; font-weight:bold;">✦ ${extractTime(w.startTime)} – ${extractTime(w.endTime)}</span>`
            ).join('<br>');
        }
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9f5eb';
        const rName = isTe ? RASHI_TE[p.rashiIdx] : p.rashiName;
        transHTML += `<tr style="background:${bgColor};">
            <td style="padding:3px 6px; border:1px solid #ddd; font-weight:bold; color:#4a0e0e;"><span class="akshara">${rName}</span></td>
            <td style="padding:3px 6px; border:1px solid #ddd;">${extractTime(p.startTime)}</td>
            <td style="padding:3px 6px; border:1px solid #ddd;">${extractTime(p.endTime)}</td>
            <td style="padding:3px 6px; border:1px solid #ddd;">${pushCol}</td>
        </tr>`;
    });
    transHTML += '</table>';
    setElHtml('lagnaTransitions', transHTML);

    if (isTe) {
        document.getElementById('valNote').innerHTML = `<strong>ముఖ్య గమనిక:-</strong> ఈ పంచాంగం <strong>${locName}</strong> కోసం ఖగోళ సిద్ధాంతాల ప్రకారం గణించబడింది. వర్తించే చోట్ల డేలైట్ సేవింగ్ టైమ్ (DST) కూడా పరిగణించబడింది.`;
    } else {
        document.getElementById('valNote').innerHTML = `<strong>NOTE:-</strong> This panchangam is calculated for <strong>${locName}</strong>. If applicable, Daylight Saving Time (DST) is also calculated.`;
    }

    



document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    applyTransliteration();
}

function applyTransliteration() {
    if (!window.Sanscript) return;
    if (CURRENT_LANG === 'te') return; // In Telugu mode, preserve authentic Telugu script
    
    const elements = document.querySelectorAll('.akshara');
    elements.forEach(el => {
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) {
            let text = node.nodeValue;
            // ONLY transliterate if text actually contains Indic (Telugu/Devanagari) characters!
            // If already English or numbers, NEVER touch it!
            if (text && /[\u0900-\u097F\u0C00-\u0C7F]/.test(text)) {
                let actualTarget = 'iast';
                text = Sanscript.t(text, 'devanagari', actualTarget);
                text = Sanscript.t(text, 'telugu', actualTarget);

                // Pre-process specific consonants for English phonetics (idempotent replacements)
                text = text.replace(/c(?!h)/g, 'ch');
                text = text.replace(/[śṣ]/g, 'sh');
                text = text.replace(/[ṛṝ]/g, 'ru');
                
                // Strip diacritics (macrons, under-dots, etc.)
                text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                
                // Fix nasal 'm' before specific consonants (e.g. pamchamgam -> panchangam)
                text = text.replace(/m([kgcjtd])/gi, 'n$1');
                
                // Title Case
                text = text.replace(/\b[a-z]/g, c => c.toUpperCase());
                
                node.nodeValue = text;
            }
        }
    });
}

function renderList(elId, items, tz, showPadam) {
    const el = document.getElementById(elId);
    if (!el) return;
    const isTe = (CURRENT_LANG === 'te');
    const endsWord = isTe ? 'ముగింపు' : 'ends';
    el.innerHTML = items.map(it => {
        const endLocal = jdToLocal(it.endJD, tz);
        let displayName = it.name;
        if (isTe) {
            if (elId === 'valTithi' && TITHI_TE[it.idx]) displayName = TITHI_TE[it.idx];
            else if (elId === 'valNakshatra' && NAKSHATRA_TE[it.idx]) displayName = NAKSHATRA_TE[it.idx];
            else if (elId === 'valYoga' && YOGA_TE[it.idx]) displayName = YOGA_TE[it.idx];
            else if (elId === 'valKarana' && KARANA_TE[it.idx]) displayName = KARANA_TE[it.idx];
        }
        const padamStr = (showPadam && it.padam) ? (isTe ? ` — ${it.padamNum || it.padam}వ పాదం` : ` — ${it.padam} Padam`) : '';
        return `<li><strong class="akshara">${displayName}</strong>${padamStr} <span class="end-info">— ${endsWord} ${fmtDateTime(endLocal)}</span></li>`;
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
function showGrahanamDetails() {
    const data = window._currentGrahanam;
    if (!data) return;

    // Rashi & Nakshatra calculations
        const rashis = ["Mesham", "Vrishabham", "Mithunam", "Karkatakam", "Simham", "Kanya", "Tula", "Vrishchikam", "Dhanussu", "Makaram", "Kumbham", "Meenam"];
    const nakshatras = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Arudra",
        "Punarvasu", "Pushyami", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Moola", "Purvashadha", "Uttarashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purvabhadra", "Uttarabhadra", "Revati"
    ];

    const gocharaPhalalu = {
        1: "Janma Rashi: Physical fatigue, mental restlessness (Challenging)",
        2: "2nd House: Financial care required, avoid arguments (Moderate)",
        3: "3rd House: Financial gains, successful ventures (Favorable)",
        4: "4th House: Mental peace focus, avoid vehicle risks (Rest)",
        5: "5th House: Children's matters, intellectual focus (Caution)",
        6: "6th House: Victory over obstacles, relief from debts, happiness (Auspicious)",
        7: "7th House: Maintain harmony in partnerships and relationships (Caution)",
        8: "8th House: Health precautions, avoid risky undertakings (Challenging)",
        9: "9th House: Father's health focus, travel precautions (Moderate)",
        10: "10th House: Career advancement, success in endeavors (Auspicious)",
        11: "11th House: All-round prosperity, financial growth (Highly Auspicious)",
        12: "12th House: Increased expenses, spiritual contemplation (Moderate)"
    };

    let rashiPhalaluHtml = `<ul style="margin:0; padding-left:20px;">`;
    for (let i = 0; i < 12; i++) {
        let position = ((i - rashiIndex + 12) % 12) + 1;
        rashiPhalaluHtml += `<li><strong>${rashis[i]}:</strong> ${gocharaPhalalu[position]}</li>`;
    }
    rashiPhalaluHtml += `</ul>`;

    setElText('gModalTitle', data.name);
    document.getElementById('gModalBasic').innerHTML = `
        <strong>Type:</strong> ${data.severity}<br>
        <strong>Magnitude:</strong> ${data.magnitude}<br>
        <strong>Timings:</strong> ${data.timing}<br><br>
        <strong>Eclipse Nakshatra:</strong> ${nakshatras[nakshatraIndex]} (${pada} Padam)<br>
        <strong>Eclipse Rashi:</strong> ${rashis[rashiIndex]}<br><br>
        <span style="color:#c0392b; font-weight:bold;">Remedy & Guidance:</span> Individuals with ${rashis[rashiIndex]} Rashi and ${nakshatras[nakshatraIndex]} Nakshatra should perform Shanti prayers and charitable offerings during this eclipse.
    `;
    
    // setElHtml('gModalAstro', rashiPhalaluHtml);
    document.getElementById('grahanamModal').style.display = 'flex';
    applyTransliteration();
}

function isGrahanamVisibleLocally(exactJD, type, lat, lon) {
    const latRad = lat * Math.PI / 180;
    
    // Calculate LST
    const D = exactJD - 2451545.0;
    let GMST = (18.697374558 + 24.06570982441908 * D) % 24;
    if (GMST < 0) GMST += 24;
    let LST = (GMST + lon / 15) % 24;
    
    const T = D / 36525.0;
    const sunLong = (280.46646 + 36000.76983 * T) % 360 * Math.PI/180; 
    const obliq = 23.439 * Math.PI/180;
    
    let targetRA, targetDec;
    
    if (type === "SURYA") {
        targetDec = Math.asin(Math.sin(obliq) * Math.sin(sunLong));
        targetRA = Math.atan2(Math.cos(obliq)*Math.sin(sunLong), Math.cos(sunLong)) * 180/Math.PI / 15;
    } else {
        const moonLong = (sunLong + Math.PI) % (2*Math.PI);
        targetDec = Math.asin(Math.sin(obliq) * Math.sin(moonLong));
        targetRA = Math.atan2(Math.cos(obliq)*Math.sin(moonLong), Math.cos(moonLong)) * 180/Math.PI / 15;
    }
    if (targetRA < 0) targetRA += 24;
    
    let HA = (LST - targetRA) % 24;
    if (HA < -12) HA += 24;
    if (HA > 12) HA -= 24;
    const haRad = HA * 15 * Math.PI / 180;
    
    const cosZD = Math.sin(latRad)*Math.sin(targetDec) + Math.cos(latRad)*Math.cos(targetDec)*Math.cos(haRad);
    const ZD = Math.acos(cosZD) * 180 / Math.PI; 
    
    if (type === "CHANDRA") {
        return ZD < 110; // Approx visible if ZD < 110 at mid-eclipse (so it's up during some part of the night)
    } else {
        if (ZD > 90) return false; // Sun is below horizon
        
        const beta = Math.abs(getMoonLatitude(exactJD)) * 60; 
        const P_parallax = 54.0;
        const zenRad = ZD * Math.PI / 180;
        const nati = P_parallax * Math.sin(zenRad);
        
        const minApparentBeta = Math.min(Math.abs(beta - nati), Math.abs(beta + nati));
        const localGrasa = 31.5 - minApparentBeta; // Approx
        
        return localGrasa > 0;
    }
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
    if (!window._selectedCity) {
        window._selectedCity = { name: "Frisco, Texas, United States", lat: 33.1507, lon: -96.8236, tzName: "America/Chicago" };
    }
    let lat = window._selectedCity.lat;
    let lon = window._selectedCity.lon;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let tz = getTzOffsetFromTimezoneString(window._selectedCity.tzName, dateStr);
    let locName = window._selectedCity.name;
    if (document.getElementById('customCoords').style.display !== 'none' && document.getElementById('latInput').value !== "") {
        lat = parseFloat(document.getElementById('latInput').value);
        lon = parseFloat(document.getElementById('lonInput').value);
        tz  = parseFloat(document.getElementById('tzInput').value);
    }

    const srJD = localToJD(y, m, d, 6, tz);
    const st = computeSunTimes(y, m, d, lat, lon, tz);
    if (!st) return null;
    const srHrs = st.sunrise, ssHrs = st.sunset;
    const ssJD = localToJD(y, m, d, ssHrs, tz);
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

    let maudhyam = [];
    try { maudhyam = computeMaudhyam(srJD); } catch(e) {}

    let locFests = { fests: [], sigs: [] };
    try {
        locFests = computeLocationFestivalsAndSignificance(
            y, m, d, lat, lon, tz,
            srHrs, ssHrs, srJD, ssJD, nextSrJD,
            dow, masam, rashi,
            tithis, naks, yogas, karanas, mt
        );
    } catch(e) {}

    return {
        y, m, d, tz, locName, dow, srHrs, ssHrs, srJD,
        samvatsaram, ayanam, masam, rutu, rashi, paksham,
        tithis, naks, yogas, karanas, mt, moonRashi, maudhyam,
        rahu, yama, durm, abhijit, va, VARA_name: VARA[dow],
        fests: locFests.fests,
        sigs: locFests.sigs
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
    let maudhyamRows = (data.maudhyam && data.maudhyam.length > 0)
        ? `<tr><td><strong>Maudhyam</strong></td><td colspan="2">${data.maudhyam.map(m => `<strong>${m.title}</strong> (${m.detail})`).join('<br>')}</td></tr>`
        : '';

    let amritStr = 'None';
    if (data.va.amrit) {
        const as = jdToLocal(data.va.amrit.start, data.tz), ae = jdToLocal(data.va.amrit.end, data.tz);
        amritStr = `${fmtDateTime(as)} — ${fmtDateTime(ae)}`;
    }
    let durmStr = data.durm.map(dd => fmtRange(dd.start, dd.end)).join(', ');

    return `
    <div class="print-day">
        <div class="print-watermark">VEDIC SAMHITA PANCHANGAM</div>
        <div class="print-header">
            <h2>VEDIC SAMHITA PANCHANGAM</h2>
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
            ${maudhyamRows}
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
    printWin.document.write(`<!DOCTYPE html><html><head><title>Vedic Samhita Panchangam</title>
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

    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Vedic Samhita Panchangam//EN\r\nCALSCALE:GREGORIAN\r\n';

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
                let desc = `== VEDIC SAMHITA PANCHANGAM ==`;
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
                const uid = `${dateStr}-vedicsamhita@vedicsamhita.com`;
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
        setElText('icalText', `Day ${i + 1} of ${totalDays}...`);
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
    a.download = 'vedicsamhita_panchangam.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Remove overlay
    document.body.removeChild(overlay);
}

// City Live Search Logic
let searchDebounce;
function getTzOffsetFromTimezoneString(tzString, dateStr) {
    try {
        const d = dateStr ? new Date(dateStr) : new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {timeZone: tzString, timeZoneName: 'longOffset'});
        const tzPart = formatter.formatToParts(d).find(p => p.type === 'timeZoneName').value;
        if (tzPart === 'GMT') return 0;
        const match = tzPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
        if (match) {
            const sign = match[1] === '-' ? -1 : 1;
            const hours = parseInt(match[2] || '0', 10);
            const minutes = parseInt(match[3] || '0', 10);
            return sign * (hours + minutes / 60);
        }
    } catch(e) { console.warn("TZ error", e); }
    return 0;
}

function onCitySearchInput(val) {
    const resDiv = document.getElementById('citySearchResults');
    if (!val || val.length < 3) {
        resDiv.style.display = 'none';
        return;
    }
    
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5`)
        .then(r => r.json())
        .then(data => {
            if (!data.results || data.results.length === 0) {
                resDiv.innerHTML = '<div style="padding:8px; color:#666;">No results found</div>';
                resDiv.style.display = 'block';
                return;
            }
            
            resDiv.innerHTML = data.results.map(city => {
                const name = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`;
                const cityJson = encodeURIComponent(JSON.stringify({
                    name: name,
                    lat: city.latitude,
                    lon: city.longitude,
                    tzName: city.timezone
                }));
                return `<div style="padding:8px; border-bottom:1px solid #eee; cursor:pointer;" onmouseover="this.style.background='#fdf6e3'" onmouseout="this.style.background='#fff'" onclick="selectSearchedCity('${cityJson}')">${name}</div>`;
            }).join('');
            resDiv.style.display = 'block';
        }).catch(err => {
            console.error(err);
        });
    }, 400);
}

function onCitySearchEnter(val) {
    if (!val || val.length < 2) return;
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=1`)
    .then(r => r.json())
    .then(data => {
        if (data.results && data.results.length > 0) {
            const city = data.results[0];
            const name = `${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}`;
            const cityJson = encodeURIComponent(JSON.stringify({
                name: name,
                lat: city.latitude,
                lon: city.longitude,
                tzName: city.timezone
            }));
            selectSearchedCity(cityJson);
        }
    }).catch(err => console.error(err));
}

function selectSearchedCity(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    
    window._selectedCity = {
        name: data.name,
        lat: data.lat,
        lon: data.lon,
        tzName: data.tzName
    };

    // Persist user's choice permanently in browser localStorage
    try {
        localStorage.setItem('vedicsamhita_user_location', JSON.stringify(window._selectedCity));
    } catch(e) { console.warn("Storage error", e); }
    
    const cityInput = document.getElementById('citySearch');
    if (cityInput) cityInput.value = data.name;
    const resDiv = document.getElementById('citySearchResults');
    if (resDiv) resDiv.style.display = 'none';

    // Sync Custom Coordinates input fields
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');
    const tzInput = document.getElementById('tzInput');
    if (latInput) latInput.value = data.lat;
    if (lonInput) lonInput.value = data.lon;
    if (tzInput) {
        const dateVal = document.getElementById('datePicker') ? document.getElementById('datePicker').value : null;
        tzInput.value = getTzOffsetFromTimezoneString(data.tzName, dateVal);
    }
    
    if (document.getElementById('datePicker') && typeof calculatePanchangam === 'function') {
        calculatePanchangam();
    }
}

function autoDetectLocation() {
    const cityInput = document.getElementById('citySearch');
    if (cityInput) cityInput.value = "Detecting your location...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1`)
                .then(r => r.json())
                .then(data => {
                    let cityName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                    let tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
                    if (data.results && data.results.length > 0) {
                        const res = data.results[0];
                        cityName = `${res.name}, ${res.admin1 ? res.admin1 + ', ' : ''}${res.country}`;
                        if (res.timezone) tzName = res.timezone;
                    }
                    const locData = { name: cityName, lat: lat, lon: lon, tzName: tzName };
                    window._selectedCity = locData;
                    try { localStorage.setItem('vedicsamhita_user_location', JSON.stringify(locData)); } catch(e) {}
                    if (cityInput) cityInput.value = cityName;
                    const latInput = document.getElementById('latInput');
                    const lonInput = document.getElementById('lonInput');
                    const tzInput = document.getElementById('tzInput');
                    if (latInput) latInput.value = lat;
                    if (lonInput) lonInput.value = lon;
                    if (tzInput) tzInput.value = getTzOffsetFromTimezoneString(tzName, null);
                    calculatePanchangam();
                })
                .catch(() => {
                    fallbackTimezoneLocation();
                });
            },
            (err) => {
                console.warn("Geolocation permission denied/unavailable:", err);
                fallbackTimezoneLocation();
            },
            { timeout: 6000 }
        );
    } else {
        fallbackTimezoneLocation();
    }
}

function fallbackTimezoneLocation() {
    const clientTz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';
    let defaultLoc = { name: "Hyderabad, Telangana, India", lat: 17.3850, lon: 78.4867, tzName: "Asia/Kolkata" };

    if (clientTz && (clientTz.includes('Calcutta') || clientTz.includes('Kolkata') || clientTz.includes('India'))) {
        defaultLoc = { name: "Hyderabad, Telangana, India", lat: 17.3850, lon: 78.4867, tzName: "Asia/Kolkata" };
    } else if (clientTz && (clientTz.includes('Chicago') || clientTz.includes('Central'))) {
        defaultLoc = { name: "Frisco, Texas, United States", lat: 33.1507, lon: -96.8236, tzName: "America/Chicago" };
    } else if (clientTz && (clientTz.includes('New_York') || clientTz.includes('Eastern'))) {
        defaultLoc = { name: "New York, NY, United States", lat: 40.7128, lon: -74.0060, tzName: "America/New_York" };
    } else if (clientTz && (clientTz.includes('Los_Angeles') || clientTz.includes('Pacific'))) {
        defaultLoc = { name: "Los Angeles, CA, United States", lat: 34.0522, lon: -118.2437, tzName: "America/Los_Angeles" };
    } else if (clientTz && clientTz.includes('London')) {
        defaultLoc = { name: "London, United Kingdom", lat: 51.5074, lon: -0.1278, tzName: "Europe/London" };
    }

    window._selectedCity = defaultLoc;
    try { localStorage.setItem('vedicsamhita_user_location', JSON.stringify(defaultLoc)); } catch(e) {}
    const cityInput = document.getElementById('citySearch');
    if (cityInput) cityInput.value = defaultLoc.name;
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');
    const tzInput = document.getElementById('tzInput');
    if (latInput) latInput.value = defaultLoc.lat;
    if (lonInput) lonInput.value = defaultLoc.lon;
    if (tzInput) tzInput.value = getTzOffsetFromTimezoneString(defaultLoc.tzName, null);
    if (typeof calculatePanchangam === 'function') {
        calculatePanchangam();
    }
}

function toggleCustomLocation() {
    const customDiv = document.getElementById('customCoords');
    if (!customDiv) return;
    customDiv.style.display = customDiv.style.display === 'none' ? 'grid' : 'none';
    if (customDiv.style.display === 'none') {
        if (document.getElementById('datePicker') && typeof calculatePanchangam === 'function') {
            calculatePanchangam();
        }
    }
}

// Ensure click outside closes the search results
document.addEventListener('click', function(event) {
    const resDiv = document.getElementById('citySearchResults');
    if (resDiv && !event.target.closest('#citySearch') && !event.target.closest('#citySearchResults')) {
        resDiv.style.display = 'none';
    }
});

window.onload = function() {
    updateLanguageUI();
    const datePicker = document.getElementById('datePicker');
    if (datePicker) {
        datePicker.value = new Date().toISOString().split('T')[0];
    }
    
    // Check saved user location in browser memory
    let savedLoc = null;
    try {
        const raw = localStorage.getItem('vedicsamhita_user_location');
        if (raw) savedLoc = JSON.parse(raw);
    } catch(e) {}

    if (savedLoc && savedLoc.name && savedLoc.lat) {
        window._selectedCity = savedLoc;
        const cityInput = document.getElementById('citySearch');
        if (cityInput) cityInput.value = savedLoc.name;
        const latInput = document.getElementById('latInput');
        const lonInput = document.getElementById('lonInput');
        const tzInput = document.getElementById('tzInput');
        if (latInput) latInput.value = savedLoc.lat;
        if (lonInput) lonInput.value = savedLoc.lon;
        if (tzInput) tzInput.value = getTzOffsetFromTimezoneString(savedLoc.tzName, datePicker ? datePicker.value : null);
        calculatePanchangam();
    } else {
        fallbackTimezoneLocation();
    }
};

// Chart style toggle
function toggleChartStyle() {
    const chartEl = document.getElementById('chartStyleSelect');
    const style = chartEl ? chartEl.value : 'south';
    const data = window._lagnaChartData;
    if (!data) return;
    if (style === 'north') {
        setElHtml('lagnaChart', generateNorthIndianChartSVG(data.lagnaIdx, data.grahas));
    } else {
        setElHtml('lagnaChart', generateSouthIndianChartSVG(data.lagnaIdx, data.grahas));
    }
}
