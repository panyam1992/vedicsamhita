const P = require('./panchangam_node.js');

function testTimings(y, m, d) {
    const srJD = P.dateToJD(y, m, d);
    const tIdx = P.getTithiIdx(srJD);
    const tithis = P.getDayElements(srJD, srJD + 1, P.getTithiIdx, i => P.TITHI[i], 3, 'tithi');
    
    let activeTithi = -1;
    let exactJD = srJD;
    for (const t of tithis) {
        const idx = P.TITHI.indexOf(t.name);
        if (idx === 14 || idx === 29) { activeTithi = idx; exactJD = t.endJD; }
    }
    if (activeTithi === -1 && (tIdx === 14 || tIdx === 29)) {
        activeTithi = tIdx; exactJD = srJD + 0.5;
    }
    
    if (activeTithi === -1) return;

    const beta = Math.abs(P.getMoonLatitude(exactJD)) * 60; // in arcminutes
    let type = activeTithi === 14 ? "CHANDRA" : "SURYA";
    
    // Average speeds (arcminutes per day)
    const relMotion = 790.56 - 59.14; 
    
    // Chandra Bimbam ~ 31', BhooChaya ~ 84', Surya ~ 32'
    let manaikyardha = type === "CHANDRA" ? (84 + 31) / 2 : (32 + 31) / 2;
    
    // For Solar, we should ideally apply parallax. If we don't, it's a global max eclipse.
    // Let's just do a naive Geocentric sthityardha for display.
    if (beta < manaikyardha) {
        let sthityardhaHours = 0;
        if (manaikyardha > beta) {
            const sthityardhaMin = (Math.sqrt(Math.pow(manaikyardha, 2) - Math.pow(beta, 2)) * 24 * 60) / relMotion;
            sthityardhaHours = sthityardhaMin / 60;
        }
        
        // Convert exactJD to local time
        // The Indian timezone offset is +5.5 hours, but we assume default tz logic
        const tz = 5.5; 
        const jdToLocal = (jd) => {
            const unix = (jd - 2440587.5) * 86400000;
            return new Date(unix + tz * 3600000); // Very naive for test script
        };
        
        const madhya = exactJD;
        const sparsha = madhya - (sthityardhaHours / 24);
        const moksha = madhya + (sthityardhaHours / 24);
        
        console.log(`Eclipse: ${type}`);
        console.log(`Beta: ${beta.toFixed(2)}' | Sthityardha: ${sthityardhaHours.toFixed(2)} hrs`);
        console.log(`Sparsha: ${(sparsha - 2440587.5)*24 % 24}`); // roughly
    }
}

testTimings(2023, 10, 28);
