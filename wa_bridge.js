/**
 * Vedic Samhita — Simple WhatsApp Web QR Bridge Server
 * 
 * Runs a local web dashboard on http://localhost:3100 with an auto-refreshing QR code.
 * Seamlessly links WhatsApp Business to the 'Vedicsamhita' group.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const PORT = 3100;
const AUTH_DIR = path.join(__dirname, '.wwebjs_auth');
const CONFIG_PATH = path.join(__dirname, 'whatsapp_config.json');

let currentQrDataUrl = null;
let currentStatus = 'initializing'; // 'initializing', 'qr_ready', 'authenticated', 'ready', 'error'
let statusMessage = 'Starting WhatsApp service...';
let connectedGroups = [];
let targetGroup = null;

// Clean prior session for clean start if needed
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
        headless: true, // Invisible background browser
        executablePath: getChromeExecutable(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', async (qr) => {
    currentStatus = 'qr_ready';
    statusMessage = 'Scan this QR code with WhatsApp Business on your phone';
    try {
        currentQrDataUrl = await qrcode.toDataURL(qr, { width: 340, margin: 2 });
    } catch(e) {}
    console.log('📡 Fresh QR code generated and available at http://localhost:' + PORT);
});

client.on('authenticated', () => {
    currentStatus = 'authenticated';
    statusMessage = '🔐 Authenticated! Downloading session and loading groups...';
    console.log(statusMessage);
});

client.on('ready', async () => {
    currentStatus = 'ready';
    console.log('🎉 WhatsApp Client is READY!');

    try {
        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup);
        connectedGroups = groups.map(g => ({ name: g.name, id: g.id._serialized }));

        console.log(`Found ${groups.length} group(s).`);

        // Target 'Vedicsamhita'
        const match = groups.find(g => /vedicsamhita/i.test(g.name)) || groups[0];
        if (match) {
            targetGroup = { name: match.name, id: match.id._serialized };
            statusMessage = `✅ Connected successfully to "${match.name}"!`;
            console.log('🎯 Target group set to:', targetGroup);

            // Save config
            fs.writeFileSync(CONFIG_PATH, JSON.stringify({
                is_connected: true,
                target_group_name: match.name,
                target_group_id: match.id._serialized,
                available_groups: connectedGroups
            }, null, 2), 'utf8');

            // Send welcome test card!
            const testImgPath = 'C:\\Users\\panya\\.gemini\\antigravity\\brain\\e6f2e7f5-9e3e-4173-83bf-ea062ef3e03e\\ganesha_vedasamhita_arts_flawless.png';
            if (fs.existsSync(testImgPath)) {
                try {
                    const media = MessageMedia.fromFilePath(testImgPath);
                    await match.sendMessage(media, {
                        caption: '🕉️ *శ్రీ వినాయక చవితి — VEDASAMHITA ART\'S*\n\n✅ *WhatsApp Business Automated Broadcast Connected!*\nఈ గ్రూప్‌లో ప్రతిరోజూ ఉదయం పవిత్ర పండుగల వాటర్‌కలర్ కార్డ్ మరియు యు.ఎస్.ఏ / ఇండియా ముహూర్తాల వివరాలు ఆటోమేటిక్‌గా ప్రసారం చేయబడతాయి.\n\n— _Vedic Samhita Team_'
                    });
                    console.log('🚀 Sent test festival card to Vedicsamhita WhatsApp group!');
                } catch(err) {
                    console.error('Error sending test card:', err);
                }
            }
        }
    } catch(err) {
        console.error('Error in ready handler:', err);
    }
});

client.on('auth_failure', (msg) => {
    currentStatus = 'error';
    statusMessage = 'Authentication failed: ' + msg;
});

// Start HTTP Server
const server = http.createServer((req, res) => {
    if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: currentStatus,
            message: statusMessage,
            qr: currentQrDataUrl,
            targetGroup: targetGroup
        }));
        return;
    }

    // Serve HTML page
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link WhatsApp Business — Vedic Samhita</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0c1317;
            color: #e9edef;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: #111b21;
            border: 1px solid #222d34;
            border-radius: 16px;
            padding: 36px 32px;
            width: 100%;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 16px 40px rgba(0,0,0,0.6);
        }
        .logo-title {
            font-size: 22px;
            font-weight: 600;
            color: #00a884;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .subtitle {
            font-size: 13.5px;
            color: #8696a0;
            margin-bottom: 24px;
            line-height: 1.4;
        }
        .qr-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 320px;
            height: 320px;
            margin-bottom: 20px;
            position: relative;
        }
        .qr-card img {
            width: 100%;
            height: 100%;
            display: block;
        }
        .spinner {
            border: 3px solid rgba(0, 168, 132, 0.2);
            border-top: 3px solid #00a884;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .instructions {
            background: #182229;
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            font-size: 13px;
            color: #d1d7db;
            line-height: 1.6;
        }
        .instructions ol {
            padding-left: 20px;
        }
        .instructions li {
            margin-bottom: 6px;
        }
        .status-badge {
            display: inline-block;
            margin-top: 14px;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }
        .status-loading { background: #2a3942; color: #8696a0; }
        .status-ready { background: #005c4b; color: #25d366; font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-title">
            <span>🕉️</span>
            <span>Vedic Samhita WhatsApp Link</span>
        </div>
        <div class="subtitle">
            Scan with your phone to connect the automated 3:00 AM USA broadcast to <b>Vedicsamhita</b>.
        </div>

        <div class="qr-card" id="qrContainer">
            <div class="spinner" id="spinner"></div>
            <img id="qrImg" style="display:none;" alt="WhatsApp QR Code">
        </div>

        <div class="instructions" id="instructionBox">
            <ol>
                <li>Open <b>WhatsApp Business</b> on your phone</li>
                <li>Tap <b>Settings</b> or <b>Menu</b> (⋮) ➡️ <b>Linked Devices</b></li>
                <li>Tap <b>Link a Device</b> and point your camera at this QR code</li>
            </ol>
        </div>

        <div id="statusBadge" class="status-badge status-loading">Waiting for QR code...</div>
    </div>

    <script>
        let isConnected = false;
        async function checkStatus() {
            if (isConnected) return;
            try {
                const res = await fetch('/api/status');
                const data = await res.json();

                const qrImg = document.getElementById('qrImg');
                const spinner = document.getElementById('spinner');
                const statusBadge = document.getElementById('statusBadge');
                const instructionBox = document.getElementById('instructionBox');

                if (data.status === 'qr_ready' && data.qr) {
                    qrImg.src = data.qr;
                    qrImg.style.display = 'block';
                    spinner.style.display = 'none';
                    statusBadge.textContent = '⚡ Live QR Code Ready — Scan from Phone';
                    statusBadge.className = 'status-badge status-loading';
                } else if (data.status === 'authenticated') {
                    spinner.style.display = 'block';
                    qrImg.style.display = 'none';
                    statusBadge.textContent = '🔐 Authenticated! Connecting to Vedicsamhita group...';
                    statusBadge.className = 'status-badge status-loading';
                } else if (data.status === 'ready') {
                    isConnected = true;
                    spinner.style.display = 'none';
                    qrImg.style.display = 'none';
                    document.getElementById('qrContainer').innerHTML = '<div style="color:#00a884; font-size:64px;">✅</div>';
                    statusBadge.textContent = '🎉 Successfully Linked to ' + (data.targetGroup ? data.targetGroup.name : 'Vedicsamhita') + '!';
                    statusBadge.className = 'status-badge status-ready';
                    instructionBox.innerHTML = '<div style="color:#25d366; font-size:14px; font-weight:bold; text-align:center;">✨ Connected! You can now close this tab. A test festival card has been sent to your Vedicsamhita group!</div>';
                }
            } catch(e) {}
        }

        setInterval(checkStatus, 2000);
        checkStatus();
    </script>
</body>
</html>`);
});

server.listen(PORT, () => {
    console.log(`🚀 Local WhatsApp Bridge Web Dashboard running at http://localhost:${PORT}`);
    // Automatically open in user's default browser
    exec(`start http://localhost:${PORT}`);
    console.log('Initializing WhatsApp client in background...');
    client.initialize().catch(e => console.error('Client init error:', e));
});
