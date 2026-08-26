
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

let prev = '';
for(let m=10; m<=12; m++) {
    for(let d=1; d<=28; d+=7) {
        let jd = dateToJD(2028, m, d) + 0.5;
        let res = getLunarCalendar(jd);
        if(res.masam !== prev) {
            console.log('2028-' + m + '-' + d, res.masam, 'Samsarpa:', res.isSamsarpa, 'Amhaspati:', res.isAmhaspati);
            prev = res.masam;
        }
    }
}

