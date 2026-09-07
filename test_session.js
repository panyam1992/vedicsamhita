const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const authPath = 'd:\\OWN PANCHANGAM BUILD\\Panyam AI Panchangam\\.wwebjs_auth';

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: authPath
    }),
    puppeteer: {
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
});

client.on('ready', async () => {
    console.log('✅ READY event fired!');
    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup);
    console.log(`Found ${groups.length} groups:`);
    groups.forEach((g, i) => console.log(`[${i+1}] "${g.name}" (${g.id._serialized})`));
    
    // Save to whatsapp_config.json
    const fs = require('fs');
    const cfgPath = 'd:\\OWN PANCHANGAM BUILD\\Panyam AI Panchangam\\whatsapp_config.json';
    const cfg = {
        is_connected: true,
        available_groups: groups.map(g => ({ name: g.name, id: g.id._serialized }))
    };
    fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
    console.log('Saved to whatsapp_config.json!');
    process.exit(0);
});

client.on('authenticated', () => console.log('🔐 Authenticated!'));
client.on('auth_failure', e => console.log('❌ Auth failure:', e));
client.on('qr', () => console.log('⚠️ Still showing QR (needs scan)'));

console.log('Testing client initialization with existing session at:', authPath);
client.initialize();

setTimeout(() => {
    console.log('Waiting for ready event (30s)...');
}, 15000);
