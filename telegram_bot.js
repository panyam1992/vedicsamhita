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
const shastraEngine = require('./shastra_knowledge_base/shastra_engine.js');
const geminiAI = require('./shastra_knowledge_base/gemini_shastra_ai.js');

// Conversational Session State per Chat ID (remembers context of recent consultation)
const userChatSessions = {
    44714988: { topic: 'santana_gopala_japa', timestamp: Date.now() } // Pre-seeded with Sree Rama & Lalitha Santana consultation
};

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
    if (!text) return;
    try {
        // Auto chunk if text > 4000 chars
        const MAX_LEN = 3900;
        if (text.length > MAX_LEN) {
            let remaining = text;
            while (remaining.length > 0) {
                let chunk = remaining.substring(0, MAX_LEN);
                let splitIdx = chunk.lastIndexOf('\n\n');
                if (splitIdx > 2000) {
                    chunk = remaining.substring(0, splitIdx);
                    remaining = remaining.substring(splitIdx + 2);
                } else {
                    remaining = remaining.substring(MAX_LEN);
                }
                await sendMessage(token, chatId, chunk, parseMode);
            }
            return;
        }

        const params = {
            chat_id: chatId,
            text: text
        };
        if (parseMode) params.parse_mode = parseMode;

        const res = await tgApi(token, 'sendMessage', params);
        if (!res.ok && parseMode) {
            // Fallback plain text if markdown formatting failed
            await tgApi(token, 'sendMessage', {
                chat_id: chatId,
                text: text
            });
        }
    } catch (e) {
        console.error("❌ Failed to send Telegram message:", e.message);
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
            `Welcome to your private *Vedic Samhita Shastra Copilot & AI Brain Bot* 🕉️\n\n` +
            `📚 *Devotee Q&A Assistant (24 Shastra Books Engine):*\n` +
            `Ask ANY question devotees ask you, and receive an authentic, ready-to-forward answer signed by Siddhanti Ramachandra shastry Munimadugu:\n\n` +
            `🔮 *Horoscope / Jatakam (జాతక పరిశీలన):*\n` +
            `• "check this jatakam: 15-Aug-1995 10:30 AM Hyderabad"\n` +
            `• "ఈ జాతకం చూడండి 20-10-1998 11:15 AM ప్రొద్దుటూరు"\n` +
            `• "మకర రాశి ఉత్తరాషాఢ నక్షత్రం జాతక పరిశీలన"\n\n` +
            `🗓️ *Auspicious Muhurtam (శుభ ముహూర్తాలు):*\n` +
            `• "give muhurtam for Gruhapravesham in May 2026 Dallas"\n` +
            `• "వివాహ ముహూర్తాలు నవంబర్ 2026 హైదరాబాద్"\n` +
            `• "give muhurtam for vehicle purchase next month"\n\n` +
            `👶 *Baby Names & Shantis (నామాక్షరాలు & శాంతి):*\n` +
            `• "what is baby name letter for Rohini"\n` +
            `• "Moola nakshatra dosha shanti"\n\n` +
            `💍 *Marriage Matching (వివాహ పొంతన):*\n` +
            `• "boy star uttarashadha and girl star chitta can do marrage"\n\n` +
            `🌾 *Dharma Shastra Rules (ధర్మ శాస్త్రం):*\n` +
            `• "Ekadashi parana rules", "Shraddha tithi rules", "Kuja dosha exemptions"\n\n` +
            `*Language Controls:*\n` +
            `• \`/te <question>\` — Force reply in Telugu (తెలుగు)\n` +
            `• \`/en <question>\` — Force reply in English\n` +
            `• Or simply ask directly in Telugu or English!\n\n` +
            `*Vault Rules to Laptop:*\n` +
            `• \`/note <rule>\` or \`/vault <rule>\` — Save custom rule note to laptop vault\n` +
            `• \`/status\` — View vault rules status\n` +
            `• \`/pending\` — List pending rules.`;
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

    // ══════════════ DEVOTEE SHASTRA COPILOT ══════════════
    if (!text.startsWith('/note') && !text.startsWith('/vault')) {
        let cleanQuery = text;
        let forcedLang = null;
        if (text.startsWith('/ask')) cleanQuery = text.replace('/ask', '').trim();
        else if (text.startsWith('/jatakam')) cleanQuery = text.replace('/jatakam', '').trim() || 'check this jatakam';
        else if (text.startsWith('/muhurtam')) cleanQuery = text.replace('/muhurtam', '').trim() || 'give muhurtam';
        else if (text.startsWith('/match')) cleanQuery = text.replace('/match', '').trim();
        else if (text.startsWith('/te')) { cleanQuery = text.replace('/te', '').trim(); forcedLang = 'te'; }
        else if (text.startsWith('/en')) { cleanQuery = text.replace('/en', '').trim(); forcedLang = 'en'; }
        else if (text.startsWith('/shastra')) cleanQuery = text.replace('/shastra', '').trim();

        // Immediate visual feedback on Telegram
        await tgApi(token, 'sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => {});

        const session = userChatSessions[chatId] || { topic: 'santana_gopala_japa' };

        // 1. High-Precision Check: Does the local Shastra Engine have a specific astronomical calculation or verified rule?
        // (E.g. Exact Japa Muhurtam dates with hours, Naga Pratishta, Marriage matching, Naming letters, Menses/Diet rules)
        const specificLocalAnswer = shastraEngine.getSpecificAnswer(cleanQuery, forcedLang, session);
        if (specificLocalAnswer) {
            console.log(`🎯 Answering Devotee Query via Authoritative Shastra Engine for ${fromUser}: "${cleanQuery}"`);
            
            const qLower = cleanQuery.toLowerCase();
            if (qLower.includes('pratishta') || qLower.includes('pratishtha') || qLower.includes('naga') || qLower.includes('sarpa') || specificLocalAnswer.includes('నాగ ప్రతిష్ఠ') || specificLocalAnswer.includes('ఆశ్లేష బలి') || specificLocalAnswer.includes('Naga Pratishta')) {
                userChatSessions[chatId] = { topic: 'naga_pratishta', timestamp: Date.now() };
            } else if (qLower.includes('japa') || qLower.includes('mantra') || specificLocalAnswer.includes('సంతాన గోపాల మహామంత్ర') || specificLocalAnswer.includes('Santana Gopala')) {
                userChatSessions[chatId] = { topic: 'santana_gopala_japa', timestamp: Date.now() };
            } else if (specificLocalAnswer.includes('సంతాన') || specificLocalAnswer.includes('గర్భ') || specificLocalAnswer.includes('Santana') || specificLocalAnswer.includes('Gopala')) {
                userChatSessions[chatId] = { topic: 'santana_gopala_japa', timestamp: Date.now() };
            } else if (specificLocalAnswer.includes('వివాహ') || specificLocalAnswer.includes('Marriage')) {
                userChatSessions[chatId] = { topic: 'vivaha', timestamp: Date.now() };
            } else if (specificLocalAnswer.includes('గృహప్రవేశ') || specificLocalAnswer.includes('Gruhapravesh')) {
                userChatSessions[chatId] = { topic: 'gruhapravesh', timestamp: Date.now() };
            }

            await sendMessage(token, chatId, specificLocalAnswer, '');
            return;
        }

        // 2. Google Gemini Shastra AI (For conversational, emotional, and complex unscripted astrological queries)
        try {
            console.log(`🤖 Consulting Gemini Shastra AI for ${fromUser}: "${cleanQuery}"`);
            const geminiAnswer = await geminiAI.askGeminiShastra(chatId, cleanQuery, forcedLang);
            if (geminiAnswer) {
                console.log(`✨ Gemini Shastra AI replied for ${fromUser}`);
                await sendMessage(token, chatId, geminiAnswer, '');
                return;
            }
        } catch (e) {
            console.warn(`⚠️ Gemini Shastra AI exception:`, e.message);
        }

        // 3. Fallback to Local Universal Shastra Engine
        const fallbackAnswer = shastraEngine.answerDevoteeQuery(cleanQuery, forcedLang, session);
        if (fallbackAnswer) {
            await sendMessage(token, chatId, fallbackAnswer, '');
            return;
        }
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

    // Case 3: Explicit Rule / Note Saving
    const isExplicitRule = text.startsWith('/rule') || text.startsWith('/note') || 
                           text.startsWith('/vault') || text.startsWith('/addrule') ||
                           text.toLowerCase().startsWith('rule:') || text.toLowerCase().startsWith('note:') ||
                           text.startsWith('సూత్రం:') || text.startsWith('నియమం:');

    if (isExplicitRule && text && text.trim().length > 0) {
        const vault = loadVault();

        let cleanText = text
            .replace(/^\/rule\s*/i, '')
            .replace(/^\/note\s*/i, '')
            .replace(/^\/addrule\s*/i, '')
            .replace(/^rule:\s*/i, '')
            .replace(/^note:\s*/i, '')
            .replace(/^సూత్రం:\s*/, '')
            .replace(/^నియమం:\s*/, '')
            .trim();

        const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
        let title = lines[0] || 'Custom Rule';
        if (title.length > 70) title = title.substring(0, 67) + '...';
        
        let category = 'custom';
        const lower = cleanText.toLowerCase();
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
            body: cleanText,
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
        return;
    }

    // Default Friendly Copilot Guidance if query wasn't matched
    if (text && text.trim().length > 0) {
        const isTe = /[\u0C00-\u0C7F]/.test(text);
        let reply = '';
        if (isTe) {
            reply = `నమస్కారం! మీ సందేశం అందింది.\n\n` +
                `📜 *వేదికసంహిత ధర్మశాస్త్ర & జ్యోతిష సహాయం:*\n\n` +
                `• 🔮 *జాతక పరిశీలన:* "జాతకం: 15-Aug-1995 10:30 AM Hyderabad"\n` +
                `• 🗓️ *ముహూర్తం:* "ముహూర్తం గృహప్రవేశం May 2026 Hyderabad"\n` +
                `• 💍 *వివాహ పొంతన:* "వధూవర నక్షత్రాలు రోహిణి మరియు మృగశిర"\n` +
                `• 🪔 *వ్రత కథలు:* "వినాయక చవితి వ్రత కథ", "ఋషి పంచమి", "వరలక్ష్మీ వ్రతం"\n\n` +
                `💡 నూతన సిద్ధాంత సూత్రం సేవ్ చేయడానికి: \`/rule <సూత్రం>\` అని పంపండి.`;
        } else {
            reply = `Namaskaram! We received your message.\n\n` +
                `📜 *Vedic Samhita Shastra & Jyotisha Copilot:*\n\n` +
                `• 🔮 *Horoscope:* "check this jatakam: 15-Aug-1995 10:30 AM Hyderabad"\n` +
                `• 🗓️ *Muhurtam:* "give muhurtam for Gruhapravesham in May 2026 Dallas"\n` +
                `• 💍 *Matching:* "boy star uttarashadha and girl star chitta can do marrage"\n` +
                `• 🪔 *Vratas:* "Vinayaka Chaturthi katha", "Rishi Panchami", "Varalakshmi Vratam"\n\n` +
                `💡 To save a new Siddhanta rule to laptop vault: send \`/rule <your rule>\`.`;
        }
        await sendMessage(token, chatId, reply);
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
                        try {
                            const sender = update.message.from ? (update.message.from.first_name || update.message.from.username) : 'User';
                            console.log(`📩 [${new Date().toLocaleTimeString()}] Incoming from ${sender}: "${update.message.text || update.message.caption || '[media]'}"`);
                            await handleMessage(token, config, update.message);
                        } catch (msgErr) {
                            console.error("❌ Error in handleMessage:", msgErr);
                            if (update.message.chat && update.message.chat.id) {
                                await sendMessage(token, update.message.chat.id, "నమస్కారం. మీ సందేశాన్ని విశ్లేషించుటలో సమస్య ఏర్పడింది. దయచేసి మరలా పంపండి.");
                            }
                        }
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
