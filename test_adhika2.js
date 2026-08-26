
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

let prevMasam = null;
let y = 2031;
for (let m = 1; m <= 12; m++) {
    for (let day = 1; day <= 28; day += 7) {
        const jd = dateToJD(y, m, day) + (12 / 24); 
        const res = getLunarCalendar(jd);
        if (res.masam !== prevMasam) {
            console.log(y + '-' + String(m).padStart(2,'0') + '-' + String(day).padStart(2,'0'), '=> Masam:', res.masam);
            prevMasam = res.masam;
        }
    }
}

