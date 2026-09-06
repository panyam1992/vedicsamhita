/**
 * Vedic Samhita — Telegram Bot Listener (Native Node.js)
 * 
 * Allows the Super Admin to send notes, rules, audio, and JSON files from their phone
 * via Telegram directly into the local project's ADMIN_RULES_VAULT.json.
 * 
 * Zero external dependencies (uses native Node.js 18+ fetch).
 */

const fs = require('fs');
const path = require('path');

const VAULT_PATH = path.join(__dirname, 'ADMIN_RULES_VAULT.json');
const CONFIG_PATH = path.join(__dirname, 'telegram_config.json');
const AUDIO_DIR = path.join(__dirname, 'telegram_audio');

if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        const template = {
            bot_token: "",
            allowed_chat_ids: [],
            note: "Get bot_token from @BotFather on Telegram. Leave allowed_chat_ids empty to automatically bind to your first message."
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(template, null, 2), 'utf8');
        return template;
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
        console.error("❌ Error parsing telegram_config.json:", e);
        return { bot_token: "" };
    }
}

function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

function loadVault() {
    if (!fs.existsSync(VAULT_PATH)) return [];
    try {
        return JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'));
    } catch (e) {
        console.error("❌ Error reading ADMIN_RULES_VAULT.json:", e);
        return [];
    }
}

function saveVault(vault) {
    fs.writeFileSync(VAULT_PATH, JSON.stringify(vault, null, 2), 'utf8');
}

async function tgApi(token, method, params = {}) {
    const url = `https://api.telegram.org/bot${token}/${method}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    return await res.json();
}

async function sendMessage(token, chatId, text, parseMode = 'Markdown') {
    try {
        await tgApi(token, 'sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: parseMode
        });
    } catch (e) {
        console.error("❌ Failed to send Telegram message:", e);
    }
}

async function downloadFile(token, fileId, destPath) {
    const fileInfo = await tgApi(token, 'getFile', { file_id: fileId });
    if (!fileInfo.ok || !fileInfo.result.file_path) {
        throw new Error("Could not retrieve file path from Telegram");
    }
    const downloadUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.result.file_path}`;
    const res = await fetch(downloadUrl);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
}

async function handleMessage(token, config, msg) {
    const chatId = msg.chat.id;
    const fromUser = msg.from ? (msg.from.username || msg.from.first_name || 'Admin') : 'Admin';

    if (!config.allowed_chat_ids || config.allowed_chat_ids.length === 0) {
        config.allowed_chat_ids = [chatId];
        saveConfig(config);
        console.log(`🔐 Auto-authorized Telegram Chat ID: ${chatId} (${fromUser})`);
    } else if (!config.allowed_chat_ids.includes(chatId)) {
        await sendMessage(token, chatId, "⛔ *Unauthorized*. This is a private Vedic Samhita Admin bot.");
        return;
    }

    const text = msg.text || msg.caption || '';

    if (text === '/start' || text === '/help') {
        const helpText = `🙏 *Namaste ${fromUser}!*\n\n` +
            `Welcome to your private *Vedic Samhita AI Brain Bot* 🕉️\n\n` +
            `Everything you send here is saved directly to your laptop repository in \`ADMIN_RULES_VAULT.json\`.\n\n` +
            `*What you can send:*\n` +
            `1️⃣ *Text message*: Dictate or type any rule, festival date, or correction.\n` +
            `2️⃣ *Exported JSON file*: Send the JSON file downloaded from your app.\n` +
            `3️⃣ *Voice note*: Record voice notes on the go.\n\n` +
            `*Commands:*\n` +
            `• \`/status\` — View total & pending rules in the vault.\n` +
            `• \`/pending\` — List all rules waiting for AI implementation.\n` +
            `• \`/help\` — Show this help message.`;
        await sendMessage(token, chatId, helpText);
        return;
    }

    if (text === '/status') {
        const vault = loadVault();
        const pending = vault.filter(r => r.status === 'pending').length;
        const applied = vault.filter(r => r.status === 'applied').length;
        const reply = `📊 *Vedic Samhita Vault Status:*\n\n` +
            `• 📦 *Total Rules in Vault:* ${vault.length}\n` +
            `• ⏳ *Pending Implementation:* ${pending}\n` +
            `• ✅ *Applied Live in Code:* ${applied}\n\n` +
            `Ask Antigravity on your laptop: _"Did you see my new rules?"_ to implement pending rules!`;
        await sendMessage(token, chatId, reply);
        return;
    }

    if (text === '/pending') {
        const vault = loadVault();
        const pending = vault.filter(r => r.status === 'pending');
        if (pending.length === 0) {
            await sendMessage(token, chatId, "✨ *All caught up!* There are currently zero pending rules.");
            return;
        }
        let reply = `⏳ *Pending Rules (${pending.length}):*\n\n`;
        pending.slice(0, 10).forEach((r, idx) => {
            reply += `${idx + 1}. *${r.title}*\n_${r.body.substring(0, 80)}${r.body.length > 80 ? '...' : ''}_\n\n`;
        });
        if (pending.length > 10) reply += `_...and ${pending.length - 10} more._`;
        await sendMessage(token, chatId, reply);
        return;
    }

    // Case 1: JSON Document attached
    if (msg.document && msg.document.file_name && msg.document.file_name.endsWith('.json')) {
        try {
            const tempFile = path.join(__dirname, 'temp_import.json');
            await downloadFile(token, msg.document.file_id, tempFile);
            const imported = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
            fs.unlinkSync(tempFile);

            if (!Array.isArray(imported)) {
                await sendMessage(token, chatId, "⚠️ Received JSON is not an array of rules.");
                return;
            }

            const vault = loadVault();
            const existingIds = new Set(vault.map(r => r.id));
            let addedCount = 0;

            for (const item of imported) {
                if (!item.id || !existingIds.has(item.id)) {
                    item.id = item.id || ('rule-import-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
                    item.status = item.status || 'pending';
                    item.source = 'telegram_import';
                    vault.unshift(item);
                    existingIds.add(item.id);
                    addedCount++;
                }
            }

            saveVault(vault);
            await sendMessage(token, chatId, `🎉 *Successfully imported ${addedCount} new rules from JSON!*\n\nTotal in Vault: ${vault.length}.\nAll saved to laptop!`);
        } catch (err) {
            await sendMessage(token, chatId, `❌ Failed to import JSON: ${err.message}`);
        }
        return;
    }

    // Case 2: Voice Note
    if (msg.voice || msg.audio) {
        const audioObj = msg.voice || msg.audio;
        const ext = msg.voice ? 'ogg' : 'mp3';
        const filename = `voice_${Date.now()}.${ext}`;
        const destPath = path.join(AUDIO_DIR, filename);

        try {
            await downloadFile(token, audioObj.file_id, destPath);

            const vault = loadVault();
            const newRule = {
                id: 'rule-audio-' + Date.now(),
                timestamp: new Date().toISOString(),
                category: 'voice_note',
                title: `🎙️ Voice Note from Phone (${new Date().toLocaleDateString()})`,
                body: `Voice audio saved locally as: telegram_audio/${filename}. Caption: ${text || 'None'}`,
                reference: 'Telegram Voice Recording',
                status: 'pending',
                source: 'telegram_voice',
                audioFile: filename
            };
            vault.unshift(newRule);
            saveVault(vault);

            const reply = `🎙️ *Voice Note Saved to Laptop!*\n\n` +
                `📁 File: \`telegram_audio/${filename}\`\n` +
                `🆔 Rule ID: \`${newRule.id}\`\n\n` +
                `The audio file has been saved to your workspace!`;
            await sendMessage(token, chatId, reply);
        } catch (err) {
            await sendMessage(token, chatId, `❌ Failed to save voice note: ${err.message}`);
        }
        return;
    }

    // Case 3: Standard Text Message / Rule Note
    if (text && text.trim().length > 0) {
        const vault = loadVault();

        const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
        let title = lines[0];
        if (title.length > 70) title = title.substring(0, 67) + '...';
        
        let category = 'custom';
        const lower = text.toLowerCase();
        if (lower.includes('వ్రతం') || lower.includes('పండుగ') || lower.includes('festival') || lower.includes('vrata')) {
            category = 'festival';
        } else if (lower.includes('మౌఢ్య') || lower.includes('గ్రహ') || lower.includes('maudhyam') || lower.includes('planet')) {
            category = 'graha';
        } else if (lower.includes('సిద్ధాంత') || lower.includes('ముహూర్త') || lower.includes('siddhanta') || lower.includes('muhurta')) {
            category = 'siddhanta';
        }

        const newRule = {
            id: 'rule-tg-' + Date.now(),
            timestamp: new Date().toISOString(),
            category: category,
            title: title,
            body: text.trim(),
            reference: 'Telegram Note',
            status: 'pending',
            source: 'telegram_chat'
        };

        vault.unshift(newRule);
        saveVault(vault);

        const reply = `🙏 *Rule Saved to Laptop Vault!*\n\n` +
            `📌 *Title:* ${title}\n` +
            `🏷️ *Category:* ${category.toUpperCase()}\n` +
            `🆔 *ID:* \`${newRule.id}\`\n` +
            `⏰ *Logged:* ${new Date().toLocaleTimeString()}\n\n` +
            `💻 *Live in Laptop:* \`ADMIN_RULES_VAULT.json\`\n\n` +
            `Ask Antigravity on your laptop: _"Did you see my new rules?"_ and it will implement them right away! 🚀`;

        await sendMessage(token, chatId, reply);
        console.log(`📥 Saved new rule from Telegram: "${title}"`);
    }
}

async function startBot() {
    const config = loadConfig();
    if (!config.bot_token || config.bot_token.trim() === "" || config.bot_token.includes("PUT_YOUR_BOT_TOKEN_HERE")) {
        console.log("==================================================================");
        console.log("⚠️  TELEGRAM BOT TOKEN REQUIRED");
        console.log("==================================================================");
        console.log("1. Open Telegram on your phone or desktop.");
        console.log("2. Search for @BotFather and send /newbot");
        console.log("3. Follow the prompt to name your bot (e.g. 'VedicSamhitaNotesBot').");
        console.log("4. Copy the HTTP API token provided by @BotFather.");
        console.log("5. Paste it into telegram_config.json or run: node telegram_bot.js <YOUR_TOKEN>");
        console.log("==================================================================");
        return;
    }

    const token = config.bot_token.trim();
    console.log("🚀 Vedic Samhita Telegram Bot is connecting...");

    try {
        const me = await tgApi(token, 'getMe');
        if (!me.ok) {
            console.error("❌ Telegram Token Invalid:", me);
            return;
        }
        console.log(`✅ Connected as: @${me.result.username} (${me.result.first_name})`);
        console.log(`📡 Listening for rules, notes, voice messages, and JSON files...`);
        console.log(`📁 Target Vault: ${VAULT_PATH}`);
    } catch (e) {
        console.error("❌ Network error connecting to Telegram API:", e.message);
        return;
    }

    let offset = 0;

    while (true) {
        try {
            const updates = await tgApi(token, 'getUpdates', {
                offset: offset,
                timeout: 25
            });

            if (updates.ok && Array.isArray(updates.result)) {
                for (const update of updates.result) {
                    offset = update.update_id + 1;
                    if (update.message) {
                        await handleMessage(token, config, update.message);
                    }
                }
            }
        } catch (err) {
            console.warn("⚠️ Network interruption, retrying in 5 seconds...", err.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

const cliToken = process.argv[2];
if (cliToken) {
    const config = loadConfig();
    config.bot_token = cliToken;
    saveConfig(config);
}

startBot();
