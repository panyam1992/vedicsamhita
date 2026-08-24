const fs = require('fs');
const path = require('path');

const festivalDir = path.join(__dirname, 'Festival');
const outputFile = path.join(__dirname, 'festival_rules.js');

let festivals = [];

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.toml')) {
            parseToml(fullPath);
        }
    }
}

function parseToml(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ignore description_only for now as they lack computation rules
    if (filePath.includes('description_only')) return;

    const festival = {};
    
    // Extract ID
    const idMatch = content.match(/^id\s*=\s*"([^"]+)"/m);
    if (idMatch) festival.id = idMatch[1];
    else festival.id = path.basename(filePath, '.toml');

    // Extract Timing
    const monthTypeMatch = content.match(/^month_type\s*=\s*"([^"]+)"/m);
    if (monthTypeMatch) festival.month_type = monthTypeMatch[1];

    const monthNumMatch = content.match(/^month_number\s*=\s*(\d+)/m);
    if (monthNumMatch) festival.month_number = parseInt(monthNumMatch[1], 10);

    const angaTypeMatch = content.match(/^anga_type\s*=\s*"([^"]+)"/m);
    if (angaTypeMatch) festival.anga_type = angaTypeMatch[1];

    const angaNumMatch = content.match(/^anga_number\s*=\s*(\d+)/m);
    if (angaNumMatch) festival.anga_number = parseInt(angaNumMatch[1], 10);

    const kaalaMatch = content.match(/^kaala\s*=\s*"([^"]+)"/m);
    if (kaalaMatch) festival.kaala = kaalaMatch[1];

    const priorityMatch = content.match(/^priority\s*=\s*"([^"]+)"/m);
    if (priorityMatch) festival.priority = priorityMatch[1];

    // Extract Names (Sanskrit and English)
    const saLine = content.match(/^sa\s*=\s*\[(.*?)\]/m);
    if (saLine) {
        const strings = saLine[1].match(/"([^"]+)"/g);
        if (strings) festival.names_sa = strings.map(s => s.replace(/"/g, ''));
    }

    const enLine = content.match(/^en\s*=\s*\[(.*?)\]/m);
    if (enLine) {
        const strings = enLine[1].match(/"([^"]+)"/g);
        if (strings) festival.names_en = strings.map(s => s.replace(/"/g, ''));
    }

    // Only add if it has some timing info
    if (festival.month_type || filePath.includes('relative_event')) {
        festivals.push(festival);
    }
}

console.log('Scanning Festival directory...');
walkDir(festivalDir);
console.log(`Found ${festivals.length} festival rules.`);

const jsContent = `// Auto-generated from TOML files\nconst FESTIVAL_RULES = ${JSON.stringify(festivals, null, 2)};\n`;

fs.writeFileSync(outputFile, jsContent, 'utf8');
console.log(`Successfully wrote to ${outputFile}`);
