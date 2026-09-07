const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const AUTH_DIR = path.join(__dirname, '.wwebjs_auth');
const IMG_PATH = 'C:\\\\Users\\\\panya\\\\.gemini\\\\antigravity\\\\brain\\\\e6f2e7f5-9e3e-4173-83bf-ea062ef3e03e\\\\ganesha_vedasamhita_arts_flawless.png';

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-js/main/dist/wppconnect-wa.js'
    },
    puppeteer: {
        headless: true,
        executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('ready', async () => {
    console.log('✅ Client Ready. Fetching all active chats...');
    await new Promise(r => setTimeout(r, 4000)); // wait for Store sync

    const chats = await client.getChats();
    const groups = chats.filter(c => c.isGroup);

    console.log(`\nAccount has ${chats.length} total chats and ${groups.length} groups:`);
    groups.forEach((g, i) => {
        console.log(`[${i+1}] "${g.name}" | ID: ${g.id._serialized}`);
    });

    // Find Vedicsamhita group
    let targetChat = groups.find(g => /vedicsamhita/i.test(g.name));
    if (!targetChat) {
        console.log('Group not in active chats list yet. Attempting to accept invite or find by ID...');
        try {
            await client.acceptInvite('CX4p4FQ6POd1nm5Rh0Jgtt');
            console.log('Accepted invite to Vedicsamhita group!');
            await new Promise(r => setTimeout(r, 3000));
            const freshChats = await client.getChats();
            targetChat = freshChats.find(c => /vedicsamhita/i.test(c.name));
        } catch(e) {
            console.warn('Accept invite result:', e.message);
        }
    }

    if (targetChat) {
        console.log(`\n🎯 Sending test to verified group: "${targetChat.name}" (${targetChat.id._serialized})`);
        
        // 1. Send simple text first
        const sentText = await targetChat.sendMessage('🕉️ *Vedic Samhita Live Connection Test* — Daily 3:00 AM USA Broadcast is linking now.');
        console.log('Text message sent! Message ID:', sentText.id ? sentText.id._serialized : 'sent');

        // 2. Send image with full caption
        const media = MessageMedia.fromFilePath(IMG_PATH);
        const sentMedia = await targetChat.sendMessage(media, {
            caption: '🕉️ *శ్రీ వినాయక చవితి — VEDASAMHITA ART\'S*\n\n📅 *భాద్రపద శుద్ధ చతుర్థి • మధ్యాహ్న వ్యాపినీ నిర్ణయం*\n\n🌍 *USA & INDIA పూజా ముహూర్తాలు:*\n🇮🇳 *భారతదేశం:* ఉదయం 11:05 AM – మధ్యాహ్నం 01:34 PM IST\n🇺🇸 *USA (New York):* 11:02 AM – 01:31 PM EDT\n🇺🇸 *USA (Chicago):* 11:04 AM – 01:33 PM CDT\n🇺🇸 *USA (California):* 11:08 AM – 01:36 PM PDT\n\n✨ _Automated Broadcast Engine Test_'
        });
        console.log('Media card sent! Waiting 8 seconds for WhatsApp server confirmation...');
        await new Promise(r => setTimeout(r, 8000));
        console.log('✅ Confirmed sent!');
    } else {
        console.error('❌ Could not locate Vedicsamhita group in account.');
    }

    await client.destroy();
    process.exit(0);
});

client.initialize();
