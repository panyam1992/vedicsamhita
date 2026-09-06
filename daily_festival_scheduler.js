/**
 * Vedic Samhita — Daily 3:00 AM USA Eastern Broadcast Scheduler
 * 
 * Automatically sends the sacred VEDASAMHITA ART'S festival card
 * and festival timings for India (IST) & USA (EDT/CDT/PDT)
 * simultaneously to:
 * 1. Telegram (@VedicSamhita_Notes_bot)
 * 2. WhatsApp Business Group ("Vedicsamhita")
 * 
 * Runs every minute to check if local USA Eastern time is 03:00 AM.
 * Can also be run on-demand with: node daily_festival_scheduler.js --now
 */

const fs = require('fs');
const path = require('path');
const { broadcastTelegram, broadcastWhatsApp, runQuickTest } = require('./usa_broadcast_engine');

const LOG_FILE = path.join(__dirname, 'daily_broadcast_history.log');

function log(msg) {
    const ts = new Date().toISOString();
    const entry = `[${ts}] ${msg}\n`;
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, entry, 'utf8');
    } catch(e) {}
}

function getUSAEasternTime() {
    const now = new Date();
    // Format to America/New_York
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    
    return {
        dateStr: `${map.year}-${map.month}-${map.day}`,
        hour: parseInt(map.hour, 10),
        minute: parseInt(map.minute, 10),
        second: parseInt(map.second, 10)
    };
}

let lastBroadcastDate = null;

async function executeDailyBroadcast() {
    const et = getUSAEasternTime();
    log(`⏰ Triggering 3:00 AM USA Eastern Daily Broadcast for ${et.dateStr}...`);
    try {
        await runQuickTest();
        lastBroadcastDate = et.dateStr;
        log(`✅ Daily broadcast completed successfully for ${et.dateStr}`);
    } catch (err) {
        log(`❌ Daily broadcast error: ${err.message}`);
    }
}

async function startScheduler() {
    log('🌟 Vedic Samhita Daily Broadcast Scheduler Started.');
    log('🎯 Target Schedule: 3:00 AM USA Eastern Time (New York / EDT-EST)');
    log('📱 Target Channels: Telegram & WhatsApp Group ("Vedicsamhita")');

    // If run with --now flag, trigger immediately
    if (process.argv.includes('--now')) {
        log('🚀 Immediate broadcast requested via --now flag');
        await executeDailyBroadcast();
        return;
    }

    // Check every 30 seconds
    setInterval(async () => {
        const et = getUSAEasternTime();
        // At 03:00 AM USA Eastern Time
        if (et.hour === 3 && et.minute === 0 && lastBroadcastDate !== et.dateStr) {
            await executeDailyBroadcast();
        }
    }, 30000);
}

if (require.main === module) {
    startScheduler().catch(console.error);
}

module.exports = {
    getUSAEasternTime,
    executeDailyBroadcast,
    startScheduler
};
