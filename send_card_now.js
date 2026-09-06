const { broadcastWhatsApp } = require('./usa_broadcast_engine');
const path = require('path');

const IMG_PATH = 'C:\\Users\\panya\\.gemini\\antigravity\\brain\\e6f2e7f5-9e3e-4173-83bf-ea062ef3e03e\\ganesha_vedasamhita_arts_flawless.png';

async function main() {
    console.log('Sending card to Vedicsamhita WhatsApp group...');
    const res = await broadcastWhatsApp(IMG_PATH, '🕉️ శ్రీ వినాయక చవితి — VEDASAMHITA ART\'S');
    console.log('Finished with status:', res);
}

main().catch(console.error);
