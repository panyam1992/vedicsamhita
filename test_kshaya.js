
const fs = require('fs');
let code = fs.readFileSync('panchangam-v18.js', 'utf8');

const window = { _selectedCity: { lat: 33.15, lon: -96.82, tzOffset: -5, tzName: 'America/Chicago' } };
const document = {
    getElementById: () => ({ value: 'telugu', style: {}, innerHTML: '', textContent: '', scrollIntoView: () => {} }),
    querySelectorAll: () => [],
    createTreeWalker: () => ({ nextNode: () => null }),
    addEventListener: () => {}
};
const Sanscript = { t: (text, from, to) => text };
window.Sanscript = Sanscript;
eval(code);

function formatJD(jd) {
    const res = jdToLocal(jd, 0); // UTC
    return res.year + '-' + String(res.month).padStart(2,'0') + '-' + String(res.day).padStart(2,'0') + ' ' + 
           String(res.hours).padStart(2,'0') + ':' + String(res.minutes).padStart(2,'0');
}

// Check Amavasyas from Oct 2028 to March 2029
let d = new Date(Date.UTC(2028, 9, 1, 12, 0, 0));
let jd = dateToJD(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()) + 0.5;

let amavasyas = [];
for (let i = 0; i < 7; i++) {
    const nm = findNewMoon(jd);
    amavasyas.push(nm);
    jd = nm + 29.53;
}

console.log('--- AMAVASYAS (UTC) ---');
amavasyas.forEach(a => {
    console.log(formatJD(a), ' Sun Rashi:', Math.floor(getSunNirayana(a) / 30));
});

// Check Sankrantis
console.log('\n--- SANKRANTIS (UTC) ---');
let curRashi = Math.floor(getSunNirayana(amavasyas[0]) / 30);
let searchJD = amavasyas[0];
while (searchJD < amavasyas[amavasyas.length-1]) {
    let r = Math.floor(getSunNirayana(searchJD) / 30);
    if (r !== curRashi) {
        console.log('Sankranti to Rashi', r, ' around ', formatJD(searchJD));
        curRashi = r;
    }
    searchJD += 0.1; // roughly 2.4 hours step to find boundaries
}

