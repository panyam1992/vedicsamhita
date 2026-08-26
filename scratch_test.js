const fs = require('fs');
let code = fs.readFileSync('panchangam-v18.js', 'utf8');

// Wrap in a module
code += `
module.exports = {
    getTithiIdx, getMoonLatitude, getMoonNirayana, getRahuNirayana, getKetuNirayana, computeDayData, getDayElements, TITHI, dateToJD
};
`;

fs.writeFileSync('panchangam_node.js', code);

const P = require('./panchangam_node.js');

function testEclipse(y, m, d) {
    const srJD = P.dateToJD(y, m, d);
    const tithis = P.getDayElements(srJD, srJD + 1, P.getTithiIdx, i => P.TITHI[i], 3, 'tithi');
    const tIdx = P.getTithiIdx(srJD);
    
    // Check if Amavasya or Purnima is active today or ends today
    let activeTithi = -1;
    let exactJD = -1;
    
    // Check if any tithi ending today is 14 or 29
    for (const t of tithis) {
        const idx = P.TITHI.indexOf(t.name);
        if (idx === 14 || idx === 29) {
            activeTithi = idx;
            exactJD = t.endJD;
        }
    }
    
    if (activeTithi === -1) {
        if (tIdx === 14 || tIdx === 29) {
            activeTithi = tIdx;
            exactJD = srJD + 0.5; // approx middle of day
        } else {
            console.log(`${y}-${m}-${d}: No Purnima or Amavasya`);
            return;
        }
    }
    
    const moonLat = Math.abs(P.getMoonLatitude(exactJD));
    let isGrahanam = false;
    let type = "";
    if (activeTithi === 14 && moonLat < 1.2) {
        isGrahanam = true;
        type = "CHANDRA";
    } else if (activeTithi === 29 && moonLat < 1.6) {
        isGrahanam = true;
        type = "SURYA";
    }

    if (isGrahanam) {
        const moonDeg = P.getMoonNirayana(exactJD);
        const rahuDeg = P.getRahuNirayana(exactJD);
        const ketuDeg = P.getKetuNirayana(exactJD);
        
        const getCircDist = (a, b) => {
            let d = Math.abs(a - b);
            return d > 180 ? 360 - d : d;
        };
        
        const distRahu = getCircDist(moonDeg, rahuDeg);
        const distKetu = getCircDist(moonDeg, ketuDeg);
        const grasta = distRahu < distKetu ? "RAHU" : "KETU";
        
        console.log(`${y}-${m}-${d}: ?? ${grasta}GRASTA ${type} GRAHANAM (Lat: ${moonLat.toFixed(3)} deg)`);
    } else {
        console.log(`${y}-${m}-${d}: No Grahanam (Lat: ${moonLat.toFixed(3)} deg)`);
    }
}

// Known eclipses
testEclipse(2023, 10, 28); // Lunar
testEclipse(2023, 10, 14); // Solar
testEclipse(2024, 4, 8);   // Solar
testEclipse(2024, 9, 17);  // Lunar (Sept 17/18)
testEclipse(2025, 3, 14);  // Lunar
testEclipse(2025, 3, 29);  // Solar
testEclipse(2024, 5, 1);   // Random day
