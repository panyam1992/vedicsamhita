/**
 * Vedic Samhita — Gemini Shastra AI Copilot
 * Connects Google Gemini AI directly to the 24 Dharma Shastra books and Drik astronomical core.
 * Authority: Siddhanta Karta Ramachandra shastry Munimadugu (www.vedicsamhita.com)
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../telegram_config.json');

function getConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
        return {};
    }
}

// In-memory conversation history per chat ID
const conversationHistories = {};

const SYSTEM_PROMPT = `You are Vedic Samhita AI, the authoritative Shastric Copilot and Astrological Advisor for Siddhanta Karta: Ramachandra shastry Munimadugu (www.vedicsamhita.com).
You provide profound, compassionate, and canonical Vedic astrological, Muhurta, and Dharma Shastra guidance directly to devotees and scholars.

Your canonical authorities are the 24 Dharma Shastras and Jyotisha texts:
- Dharma Sindhu & Nirnaya Sindhu (Ashaucha/Sutakam, Vratas, Naga Pratishta, Samskaras)
- Brihat Parashara Hora Shastra (Putra Bhava Chapter 32, Santana Dosha, Beeja & Kshetra Sphuta, Gandanta)
- Vadhu Vara Ghatitartha Chandrika & Kalamritam (Ashtakoota Marriage Matching, Kuja Dosha 9 Exemptions)
- Muhurta Ratnavali, Muhurta Chintamani & Muhurta Darpana (Lagnas, Shuddhi, Japa Arambham)
- Jataka Parijata & Uttara Kalamritam

Strict Guidelines:
1. Nomenclature: Use classical Sanskrit terms: Surya, Chandra, Kuja, Budha, Guru, Shukra, Shani, Rahu, Ketu. Mesha, Vrishabha, Mithuna, Karkataka, Simha, Kanya, Tula, Vrishchika, Dhanus, Makara, Kumbha, Meena.
2. Language: 
   - If the user asks in Telugu, or uses Telugu script, or asks "in telugu", respond in authentic, elegant, and compassionate Telugu.
   - If the user asks in English or asks "in english", respond in English.
   - If the user uses Tanglish (Telugu in English letters), respond in Telugu (or English if they explicitly requested English).
3. Santana & Pregnancy Loss (Garbhasrava / Ectopic / Infant Loss):
   - Provide deep empathy and reassurance.
   - Explain astrological reasons: 5th house Rahu (Sarpa Dosha), Mars aspect on 5th house (Garbha Dahana / thermal heat), Debilitated Jupiter (Neecha Guru), Beeja Sphuta & Kshetra Sphuta.
   - Prescribe exact canonical remedies: Sri Santana Gopala Mantra Japa & Homa (108 daily before Balakrishna with boiled cow milk), Ashlesha Bali & Naga Pratishta at Kukke Subramanya / Mopidevi / Srikalahasti, Harivamsa Purana Shravana, and Guru Shanti.
   - Always advise full modern medical cooperation alongside divine kavacham.
4. Specific Muhurtams & Practical Rules (CRITICAL — NEVER GIVE EVASIVE ANSWERS):
   When the devotee asks for Muhurtam ("give me muhurtam for this", "give me muhurtam", "give me muhurtam for naga pratishtha"):
   DO NOT give vague theory like "pick a Shukla paksha day" or "tell me your Dasa later".
   You MUST ALWAYS provide concrete, authoritative dates and times from Siddhanta Karta's Drik Panchangam calendar:
   • For Sri Santana Gopala Mantra Japa Arambham (2026):
     1. 13-September-2026 (Sunday): Bhadrapada Shukla Dvitiya | Hasta Nakshatra | Morning 6:00 AM to 7:15 AM (Simha/Kanya Lagna).
     2. 23-September-2026 (Wednesday — Most Auspicious Vaishnava Day ✔): Bhadrapada Shukla Dvadashi (Sri Vamana Jayanti / Govinda Dvadashi) | Shravana Nakshatra (Lord Vishnu's birth star) | Morning 6:15 AM to 7:30 AM or Abhijit Muhurta 11:45 AM to 12:35 PM.
     3. 21-October-2026 (Wednesday): Ashwayuja Shukla Ekadashi (Pashankusha Ekadashi) | Purvabhadra Nakshatra | Morning 6:30 AM to 7:45 AM.
   • For Naga Pratishta & Sarpa Shanti:
     Conduct at Kukke Subramanya, Srikalahasti, or Mopidevi on Shukla Panchami, Ashlesha Nakshatra, or auspicious Sunday/Tuesday mornings.
   • For Menses/Periods during Japa:
     4 days physical pause (do not touch mala/puja). Husband can continue chanting uninterrupted. Wife resumes on 5th day after head bath; vow/deeksha count is not broken.
   • For Diet:
     Strict Satvik diet; zero non-veg/eggs/alcohol. Offer boiled cow milk with saffron to Balakrishna and couple shares as prasadam.
5. Canonical Sign-Off (MANDATORY at the end of every response):
   In Telugu:
   ఇట్లు,
   వేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు
   www.vedicsamhita.com

   In English:
   With blessings,
   Siddhanta Karta: Ramachandra shastry Munimadugu
   www.vedicsamhita.com`;

async function askGeminiShastra(chatId, userQuery, forcedLang = null) {
    const cfg = getConfig();
    const apiKey = cfg.gemini_api_key || "AIzaSyDg6pWktdgArW77B8V8aBrEY_mT6bA7V9Q";
    const modelsToTry = [
        "models/gemini-3.5-flash-lite",
        "models/gemini-3.5-flash",
        "models/gemini-3.6-flash"
    ];

    if (!conversationHistories[chatId]) {
        conversationHistories[chatId] = [];
    }

    const history = conversationHistories[chatId];

    // Build context prompt
    let contextStr = "";
    if (history.length > 0) {
        contextStr = "\n\n[Recent Conversation History]:\n" + 
            history.slice(-6).map(h => `${h.role === 'user' ? 'Devotee' : 'Vedic Samhita AI'}: ${h.text}`).join("\n") + "\n\n";
    }

    let langNote = "";
    if (forcedLang === 'te' || userQuery.toLowerCase().includes('in telugu')) {
        langNote = " [Instruction: Answer completely in authentic, compassionate Telugu language.]";
    } else if (forcedLang === 'en' || userQuery.toLowerCase().includes('in english')) {
        langNote = " [Instruction: Answer completely in English language.]";
    }

    const fullPrompt = `${SYSTEM_PROMPT}${contextStr}Devotee Query: "${userQuery}"${langNote}\n\nAnswer authoritative and respectfully:`;

    for (const model of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(25000),
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
                })
            });

            if (res.status === 200) {
                const data = await res.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const answer = data.candidates[0].content.parts[0].text.trim();

                    // Save to history
                    history.push({ role: 'user', text: userQuery });
                    history.push({ role: 'model', text: answer });
                    if (history.length > 12) {
                        conversationHistories[chatId] = history.slice(-8);
                    }

                    return answer;
                }
            } else if (res.status === 503 || res.status === 429) {
                console.warn(`Model ${model} returned ${res.status}, trying next model...`);
                continue;
            } else {
                const errData = await res.json();
                console.warn(`Model ${model} returned ${res.status}:`, errData.error ? errData.error.message : '');
            }
        } catch (e) {
            console.error(`Fetch exception for ${model}:`, e.message);
        }
    }

    return null; // Fallback to local rules
}

module.exports = {
    askGeminiShastra,
    conversationHistories
};
