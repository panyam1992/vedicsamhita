/**
 * Vedic Samhita — Unified USA 3:00 AM Daily Broadcast Engine
 * 
 * Automatically sends the VEDASAMHITA ART'S festival card with US & India timings
 * directly to Telegram AND WhatsApp Business group ("Vedicsamhita").
 */

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const TG_CONFIG_PATH = path.join(__dirname, 'telegram_config.json');
const WA_CONFIG_PATH = path.join(__dirname, 'whatsapp_config.json');
const AUTH_DIR = path.join(__dirname, '.wwebjs_auth');

function getConfigs() {
    let tg = {}, wa = {};
    try { tg = JSON.parse(fs.readFileSync(TG_CONFIG_PATH, 'utf8')); } catch(e) {}
    try { wa = JSON.parse(fs.readFileSync(WA_CONFIG_PATH, 'utf8')); } catch(e) {}
    return { tg, wa };
}

// 1. Send to Telegram
async function broadcastTelegram(imagePath, caption) {
    const { tg } = getConfigs();
    if (!tg.bot_token || !tg.allowed_chat_ids || tg.allowed_chat_ids.length === 0) {
        console.warn('⚠️ Telegram not configured.');
        return { ok: false, error: 'Not configured' };
    }

    const fileBytes = fs.readFileSync(imagePath);
    const blob = new Blob([fileBytes], { type: 'image/png' });
    const formData = new FormData();
    formData.append('chat_id', tg.allowed_chat_ids[0]);
    formData.append('photo', blob, 'festival_card.png');
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');

    try {
        const res = await fetch(`https://api.telegram.org/bot${tg.bot_token}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
        const d = await res.json();
        console.log('📱 Telegram Broadcast:', d.ok ? '✅ SUCCESS' : '❌ ' + d.description);
        return d;
    } catch(err) {
        console.error('❌ Telegram error:', err.message);
        return { ok: false, error: err.message };
    }
}

const puppeteer = require('puppeteer');

// 2. Send to WhatsApp
async function broadcastWhatsApp(imagePath, caption) {
    const { wa } = getConfigs();
    console.log('💬 Launching WhatsApp browser engine for group:', wa.target_group_name || 'Vedicsamhita');

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        userDataDir: path.join(__dirname, '.wwebjs_auth', 'session'),
        defaultViewport: { width: 1200, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,900']
    });

    try {
        const page = (await browser.pages())[0] || await browser.newPage();
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 4000));

        // Dismiss dialog if any
        const closeBtn = await page.$('div[role="dialog"] button, span[data-icon="x"], span[data-icon="close"]');
        if (closeBtn) {
            await closeBtn.click();
            await new Promise(r => setTimeout(r, 1000));
        }

        // Locate Vedicsamhita
        const rect = await page.evaluate(() => {
            const span = document.querySelector('span[title="Vedicsamhita"]');
            if (!span) return null;
            const r = span.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        });

        if (!rect) {
            console.error('❌ Could not find Vedicsamhita group');
            await browser.close();
            return { ok: false, error: 'Group not found' };
        }

        await page.mouse.click(rect.x, rect.y);
        await new Promise(r => setTimeout(r, 3000));

        // Attach image
        const attachBtn = await page.$('#main span[data-icon="plus"], #main span[data-icon="attach-menu-plus"], #main [data-icon="clip"]');
        if (attachBtn) {
            await attachBtn.click();
            await new Promise(r => setTimeout(r, 1500));
        }

        const fileInput = await page.$('input[type="file"]');
        if (!fileInput) {
            console.error('❌ File input not found');
            await browser.close();
            return { ok: false, error: 'File input missing' };
        }

        await fileInput.uploadFile(imagePath);
        await new Promise(r => setTimeout(r, 3500));

        // Enter caption
        const captionBox = await page.$('div[contenteditable="true"][data-tab="10"], div[contenteditable="true"]');
        if (captionBox) {
            await captionBox.click();
            await page.keyboard.type("🕉️ *శ్రీ వినాయక చవితి — VEDASAMHITA ART'S* - Puja Muhurthams (India & USA)");
        }
        await new Promise(r => setTimeout(r, 1500));

        // Click Send button
        const btnInfo = await page.evaluate(() => {
            const allButtons = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
            for (const b of allButtons) {
                const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                const icon = b.querySelector('[data-icon*="send"]');
                if (aria.includes('send') || icon || b.getAttribute('data-icon') === 'send') {
                    const r = b.getBoundingClientRect();
                    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
                }
            }
            const candidates = allButtons.filter(b => {
                const r = b.getBoundingClientRect();
                return r.x > 1000 && r.y > 750 && r.width > 30 && r.height > 30;
            });
            if (candidates.length > 0) {
                const best = candidates[candidates.length - 1];
                const r = best.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
            }
            return { x: 1154, y: 851 };
        });

        await page.mouse.click(btnInfo.x, btnInfo.y);
        console.log('💬 WhatsApp Card sent!');
        await new Promise(r => setTimeout(r, 12000));

        // Send detailed message text
        const chatInput = await page.$('#main footer div[contenteditable="true"]');
        if (chatInput && caption) {
            await chatInput.click();
            await page.evaluate((text) => {
                const input = document.querySelector('#main footer div[contenteditable="true"]');
                if (input) {
                    input.focus();
                    document.execCommand('insertText', false, text);
                }
            }, caption);
            await new Promise(r => setTimeout(r, 1000));
            await page.keyboard.press('Enter');
            console.log('💬 WhatsApp detailed message sent!');
            await new Promise(r => setTimeout(r, 3000));
        }

        await browser.close();
        return { ok: true };
    } catch(err) {
        console.error('❌ WhatsApp send error:', err);
        await browser.close();
        return { ok: false, error: err.message };
    }
}

// 3. Unified Dispatch
async function runQuickTest() {
    console.log('\n======================================================');
    console.log('🚀 RUNNING SIMULTANEOUS BROADCAST TEST (TELEGRAM & WHATSAPP)');
    console.log('======================================================');

    const imagePath = 'C:\\Users\\panya\\.gemini\\antigravity\\brain\\e6f2e7f5-9e3e-4173-83bf-ea062ef3e03e\\ganesha_vedasamhita_arts_flawless.png';

    const caption = `🕉️ *శ్రీ వినాయక చవితి — VEDASAMHITA ART'S* (Live Test)

📅 *భాద్రపద శుద్ధ చతుర్థి • మధ్యాహ్న వ్యాపినీ నిర్ణయం*
───────────────────────────
🌍 *ప్రాంతాల వారీ పూజా ముహూర్తాలు (USA & INDIA):*

🇮🇳 *భారతదేశం (INDIA - IST):*
• **పూజా సమయం:** ఉదయం 11:05 AM – మధ్యాహ్నం 01:34 PM IST (2 గం॥ 29 ని॥)
• **చంద్ర దర్శన నిషేధం:** రాత్రి 08:32 PM వరకు

🇺🇸 *అమెరికా (USA - EDT / CDT / PDT):*
• 🗽 **New York / East Coast (EDT):** 11:02 AM – 01:31 PM EDT
• 🏙️ **Chicago / Central (CDT):** 11:04 AM – 01:33 PM CDT
• 🌉 **California / West Coast (PDT):** 11:08 AM – 01:36 PM PDT

📜 *శాస్త్రీయ విశేషాలు:*
• 'మధ్యాహ్న వ్యాపినీ గ్రాహ్యా పూర్వవిద్ధా తు పూజనే' — చతుర్థి తిథి మధ్యాహ్న కాలంలో వ్యాపించిన రోజే పూజార్హం.
• ఏకవింశతి పత్ర పూజ (21 రకాల పవిత్ర పత్ర సమర్పణ).
• మిథ్యాపవాద నివారణార్థం శ్రీమద్భాగవత శమంతకోపాఖ్యాన పఠనం.

✨ _Automated USA 3:00 AM Broadcast System: Connected to Telegram & WhatsApp (Vedicsamhita)_`;

    // 1. Send Telegram
    await broadcastTelegram(imagePath, caption);

    // 2. Send WhatsApp
    await broadcastWhatsApp(imagePath, caption);

    console.log('\n🎉 SIMULTANEOUS BROADCAST COMPLETE!\n');
}

if (require.main === module) {
    runQuickTest().then(() => process.exit(0));
}

module.exports = {
    broadcastTelegram,
    broadcastWhatsApp,
    runQuickTest
};
