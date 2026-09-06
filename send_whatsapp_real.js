const puppeteer = require('puppeteer');
const path = require('path');

const AUTH_DIR = path.join(__dirname, '.wwebjs_auth', 'session');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const IMG_PATH = 'C:\\Users\\panya\\.gemini\\antigravity\\brain\\e6f2e7f5-9e3e-4173-83bf-ea062ef3e03e\\ganesha_vedasamhita_arts_flawless.png';

async function sendToVedicsamhita() {
    console.log('Starting WhatsApp DOM sender...');
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: CHROME_PATH,
        userDataDir: AUTH_DIR,
        defaultViewport: { width: 1200, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,900']
    });

    const page = (await browser.pages())[0] || await browser.newPage();
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));

    // Dismiss any dialog if present
    const closeBtn = await page.$('div[role="dialog"] button, span[data-icon="x"], span[data-icon="close"]');
    if (closeBtn) {
        console.log('Dismissing dialog...');
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 1000));
    }

    // Get exact coordinates of Vedicsamhita
    const rect = await page.evaluate(() => {
        const span = document.querySelector('span[title="Vedicsamhita"]');
        if (!span) return null;
        const r = span.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
    });

    if (!rect) {
        console.error('Could not find span[title="Vedicsamhita"]');
        await browser.close();
        return;
    }

    console.log('Clicking Vedicsamhita chat at:', rect);
    await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await new Promise(r => setTimeout(r, 3000));

    // Verify header
    const currentHeader = await page.evaluate(() => {
        const h = document.querySelector('#main header');
        return h ? h.textContent : 'none';
    });
    console.log('Active Chat:', currentHeader.substring(0, 30));

    // Find attachment button
    console.log('Opening attachment menu...');
    const attachBtn = await page.$('#main span[data-icon="plus"], #main span[data-icon="attach-menu-plus"], #main [data-icon="clip"]');
    if (attachBtn) {
        await attachBtn.click();
        await new Promise(r => setTimeout(r, 1500));
    }

    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
        console.error('File input not found');
        await browser.close();
        return;
    }

    console.log('Uploading card image...');
    await fileInput.uploadFile(IMG_PATH);
    await new Promise(r => setTimeout(r, 3500));

    // Look for caption box and type
    console.log('Entering sacred caption...');
    const captionBox = await page.$('div[contenteditable="true"][data-tab="10"], div[contenteditable="true"]');
    if (captionBox) {
        await captionBox.click();
        await page.keyboard.type('🕉️ *శ్రీ వినాయక చవితి — VEDASAMHITA ART\'S* - Puja Muhurthams (India & USA)');
    }
    await new Promise(r => setTimeout(r, 1500));

    // Find the Send button
    console.log('Locating Send button on media preview screen...');
    const btnInfo = await page.evaluate(() => {
        // Look for send button by icon or aria-label
        const allButtons = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
        for (const b of allButtons) {
            const aria = (b.getAttribute('aria-label') || '').toLowerCase();
            const icon = b.querySelector('[data-icon*="send"]');
            if (aria.includes('send') || icon || b.getAttribute('data-icon') === 'send') {
                const r = b.getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2, match: 'aria/icon', aria: b.getAttribute('aria-label'), html: b.outerHTML.substring(0, 100) };
            }
        }
        // Fallback: look at bottom right quadrant (width 1200, height 900)
        const candidates = allButtons.filter(b => {
            const r = b.getBoundingClientRect();
            return r.x > 1000 && r.y > 750 && r.width > 30 && r.height > 30;
        });
        if (candidates.length > 0) {
            const best = candidates[candidates.length - 1];
            const r = best.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2, match: 'quadrant', aria: best.getAttribute('aria-label'), html: best.outerHTML.substring(0, 100) };
        }
        return null;
    });

    console.log('Send button detection result:', btnInfo);

    if (btnInfo) {
        console.log(`Clicking Send button at (${btnInfo.x}, ${btnInfo.y})...`);
        await page.mouse.click(btnInfo.x, btnInfo.y);
    } else {
        console.log('Fallback: clicking coordinates (1140, 840)...');
        await page.mouse.click(1140, 840);
    }

    console.log('Waiting 12 seconds for WhatsApp media upload & delivery...');
    await new Promise(r => setTimeout(r, 12000));

    // Also send the detailed timings text message directly into the chat!
    console.log('Now typing full detailed timings message in chat...');
    const chatInput = await page.$('#main footer div[contenteditable="true"]');
    if (chatInput) {
        await chatInput.click();
        const fullMessage = `🕉️ *శ్రీ వినాయక చవితి విశేష పంచాంగ నిర్ణయం* 🕉️\n*భాద్రపద శుద్ధ చతుర్థి — మధ్యాహ్న వ్యాపినీ నిర్ణయం*\n───────────────────────────\n\n🇮🇳 *భారతదేశం (INDIA - IST):*\n• *పూజా సమయం:* ఉదయం 11:05 AM – మధ్యాహ్నం 01:34 PM IST\n• *చంద్ర దర్శన నిషేధం:* రాత్రి 08:32 PM వరకు\n\n🇺🇸 *అమెరికా (USA - EDT / CDT / PDT):*\n🏙️ *New York / East Coast (EDT):* 11:02 AM – 01:31 PM EDT\n🏙️ *Chicago / Central (CDT):* 11:04 AM – 01:33 PM CDT\n🏙️ *California / West Coast (PDT):* 11:08 AM – 01:36 PM PDT\n\n📜 *శాస్త్రీయ విశేషాలు:*\n• *మధ్యాహ్న వ్యాపినీ గ్రాహ్యః పూర్వవిద్ధా తు పూజనే*\n• 21 రకాల పవిత్ర పత్ర సమర్పణ (ఏకవింశతి పత్ర పూజ)\n• మిథ్యాపవాద నివారణార్థం శ్రీమద్భాగవత శ్యమంతకోపాఖ్యాన శ్రవణం తప్పనిసరి.\n\n✨ *VEDASAMHITA ART\'S — Daily Festival Broadcast*`;
        
        // Use clipboard paste or evaluate to paste fast without breaking
        await page.evaluate((text) => {
            const input = document.querySelector('#main footer div[contenteditable="true"]');
            if (input) {
                input.focus();
                document.execCommand('insertText', false, text);
            }
        }, fullMessage);

        await new Promise(r => setTimeout(r, 1000));
        await page.keyboard.press('Enter');
        console.log('Detailed timings text message sent!');
        await new Promise(r => setTimeout(r, 3000));
    }

    await page.screenshot({ path: 'whatsapp_final_sent_proof.png' });
    console.log('Saved proof screenshot to whatsapp_final_sent_proof.png');

    await browser.close();
    console.log('Delivery cycle complete!');
}

sendToVedicsamhita().catch(console.error);
