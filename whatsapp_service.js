/**
 * Vedic Samhita — WhatsApp Business Integration Service
 */

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'whatsapp_config.json');
const AUTH_DIR = path.join(__dirname, '.wwebjs_auth');

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        const def = {
            is_connected: false,
            target_group_name: "",
            target_group_id: "",
            available_groups: []
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(def, null, 2), 'utf8');
        return def;
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch(e) {
        return { is_connected: false, target_group_name: "", target_group_id: "" };
    }
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

function getChromeExecutable() {
    const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (fs.existsSync(chrome)) return chrome;
    if (fs.existsSync(edge)) return edge;
    return undefined;
}

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: AUTH_DIR
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js'
    },
    puppeteer: {
        headless: false,
        executablePath: getChromeExecutable(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=900,900'
        ]
    }
});

let isReady = false;

client.on('qr', (qr) => {
    console.log('\n📲 Chrome window is open. If prompted, please scan the QR code.');
});

client.on('authenticated', () => {
    console.log('🔐 Authenticated! Saving credentials to disk...');
});

client.on('loading_screen', (percent, message) => {
    console.log(`🔄 Loading chats: ${percent}% - ${message}`);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Auth failure:', msg);
});

client.on('ready', async () => {
    isReady = true;
    console.log('\n======================================================');
    console.log('✅ WHATSAPP BUSINESS CONNECTED & READY!');
    console.log('======================================================');

    try {
        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup);

        console.log(`\nFound ${groups.length} WhatsApp Group(s):\n`);
        const groupList = groups.map((g, idx) => {
            console.log(`  [${idx + 1}] "${g.name}" (ID: ${g.id._serialized})`);
            return {
                name: g.name,
                id: g.id._serialized,
                participants_count: g.participants ? g.participants.length : 0
            };
        });

        const cfg = loadConfig();
        cfg.is_connected = true;
        cfg.available_groups = groupList;

        if (!cfg.target_group_id && groupList.length > 0) {
            const match = groupList.find(g => /vedic|panchang|usa|samhita|hindu/i.test(g.name)) || groupList[0];
            cfg.target_group_id = match.id;
            cfg.target_group_name = match.name;
            console.log(`\n🎯 Auto-selected target group: "${match.name}"`);
        }

        saveConfig(cfg);
        console.log('\n✨ WhatsApp Service is active and ready for broadcasts!');
    } catch(err) {
        console.error('Error listing chats:', err);
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Disconnected:', reason);
    const cfg = loadConfig();
    cfg.is_connected = false;
    saveConfig(cfg);
});

async function sendToGroup(groupId, imagePath, caption) {
    if (!isReady) {
        throw new Error('WhatsApp client is not ready. Please wait.');
    }
    const media = MessageMedia.fromFilePath(imagePath);
    const chat = await client.getChatById(groupId);
    return await chat.sendMessage(media, { caption: caption });
}

if (require.main === module) {
    console.log('🚀 Launching WhatsApp client...');
    client.initialize().catch(err => {
        console.error('Init error:', err);
    });
}

module.exports = {
    client,
    sendToGroup,
    loadConfig,
    saveConfig
};
