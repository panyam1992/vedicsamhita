const P = require('./panchangam_node.js');

function isGrahanamVisibleLocally(exactJD, type, lat, lon) {
    const latRad = lat * Math.PI / 180;
    
    // Calculate LST
    const D = exactJD - 2451545.0;
    let GMST = (18.697374558 + 24.06570982441908 * D) % 24;
    if (GMST < 0) GMST += 24;
    let LST = (GMST + lon / 15) % 24;
    
    // Sun & Moon equatorial approx
    // We already have getSunTropical and getMoonTropical inside P
    // Wait, P doesn't export getSunTropical. I'll write simplified ones.
    // L = mean longitude. For approx ZD, tropical is fine.
    
    const T = D / 36525.0;
    const sunLong = (280.46646 + 36000.76983 * T) % 360 * Math.PI/180; // simplified
    const obliq = 23.439 * Math.PI/180;
    
    let targetRA, targetDec;
    
    if (type === "SURYA") {
        targetDec = Math.asin(Math.sin(obliq) * Math.sin(sunLong));
        targetRA = Math.atan2(Math.cos(obliq)*Math.sin(sunLong), Math.cos(sunLong)) * 180/Math.PI / 15;
    } else {
        // Moon is opposite to Sun
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
    const ZD = Math.acos(cosZD) * 180 / Math.PI; // in degrees
    
    if (type === "CHANDRA") {
        // Lunar eclipse is visible if Moon is above horizon (ZD < 90)
        // Since eclipse lasts ~3 hours, if ZD < 110, it's likely visible at some point during the night
        return ZD < 110;
    } else {
        // Solar eclipse
        // If Sun is below horizon, definitely not visible
        if (ZD > 90) return false;
        
        // Use user's Surya Siddhanta parallax check
        const beta = Math.abs(P.getMoonLatitude(exactJD)) * 60; // in arcminutes
        const P_parallax = 54.0; // horizontal parallax in arcminutes
        const zenRad = ZD * Math.PI / 180;
        
        // Parallax in latitude (Nati)
        const nati = P_parallax * Math.sin(zenRad);
        
        // Assume worst-case apparent beta (simplification of spherical trig)
        const apparentBeta1 = Math.abs(beta - nati);
        const apparentBeta2 = Math.abs(beta + nati);
        const minApparentBeta = Math.min(apparentBeta1, apparentBeta2);
        
        const manaikyardha = 31.5; // (Sun bimbam + Moon bimbam)/2
        const localGrasa = manaikyardha - minApparentBeta;
        
        return localGrasa > 0;
    }
}

// Test with Oct 14 2023 Solar Eclipse (Visible in Americas, NOT in India)
console.log("Oct 14 2023, India:", isGrahanamVisibleLocally(2460232.25, "SURYA", 14.68, 77.6));
console.log("Oct 14 2023, USA:", isGrahanamVisibleLocally(2460232.25, "SURYA", 35.0, -90.0));

// Test with April 8 2024 Solar Eclipse (Visible in USA, NOT in India)
console.log("Apr 8 2024, India:", isGrahanamVisibleLocally(2460409.25, "SURYA", 14.68, 77.6));
console.log("Apr 8 2024, USA:", isGrahanamVisibleLocally(2460409.25, "SURYA", 35.0, -90.0));
