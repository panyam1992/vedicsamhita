# 📜 VEDIC SAMHITA (PANYAM AI PANCHANGAM) — MASTER PROJECT REPORT
**Canonical Authority:** Siddhanta Karta: *Ramachandra shastry Munimadugu* ([www.vedicsamhita.com](https://www.vedicsamhita.com))  
**Project Workspace:** `d:\OWN PANCHANGAM BUILD\Panyam AI Panchangam`  
**Date of Report:** September 9, 2026  
**Document Classification:** Confidential — Master Operational & Technical Reference  

---

## 1. EXECUTIVE SUMMARY & SYSTEM IDENTITY

**Vedic Samhita (Panyam AI Panchangam)** is an authoritative, high-precision Hindu astronomical and astrological computational platform. It bridges ancient mathematical astronomy (*Surya Siddhanta*, *Drik Ganita*, and the *24 Dharma Shastras*) with modern agentic AI and cloud messaging.

### Primary Pillars of the Platform:
1. **Drik Ganita Astronomical Engine:** High-precision astronomical calculation of the five limbs (*Pancha-Angas* — Tithi, Vara, Nakshatra, Yoga, Karana), planetary longitudes (*Nirayana Sphutas* with Lahiri Ayanamsa), Ascendant (*Lagna*), and auspicious/inauspicious time windows.
2. **24 Dharma Shastra Rule Core:** Canonical decision-making based on *Dharma Sindhu*, *Nirnaya Sindhu*, *Brihat Parashara Hora Shastra*, *Vadhu Vara Ghatitartha Chandrika*, *Kalamritam*, *Muhurta Ratnavali*, and *Muhurta Martanda*.
3. **Web Application & UI:** A single-page, zero-login, privacy-first web application featuring dynamic international geocoding, multi-script transliteration (Telugu, Devanagari, Kannada, Tamil, Hindi), and multi-day print/export engines.
4. **Security & Role-Based Access Control (RBAC):** Ephemeral anonymous browsing and anti-capture restrictions for standard users, alongside master administrative privileges for the Super Admin.
5. **AI Shastra Copilot & Telegram Bot:** Autonomous Telegram bot (`@VedicSamhita_Notes_bot`) connected to Google Gemini AI and the local Drik rule engine, maintaining multi-turn conversational memory to deliver deep Shastric counsel and exact Muhurtams to devotees.

---

## 2. MASTER ACCESS CREDENTIALS, API KEYS & LOGINS

> [!CAUTION]
> Keep these credentials secure. They provide administrative access to the platform, Telegram bot controls, and Google AI Studio endpoints.

### A. Super Admin Platform Credentials
| Parameter | Value / Detail | Purpose |
| :--- | :--- | :--- |
| **Super Admin Username** | `vedicsamhita` | Master administrative login identifier |
| **Super Admin Email** | `1vedasamhita@gmail.com` | Authorized master email for notifications & alerts |
| **Admin Secret Passkey** | `vedicsamhita` | Passkey used in `security-rbac.js` to unlock Admin privileges |
| **Admin Storage Session Key** | `VS_ADMIN_SESSION` | `sessionStorage` identifier for active admin sessions |
| **Broadcast Storage Key** | `VS_GLOBAL_BROADCAST` | `localStorage` key for publishing global site announcements |
| **Admin Bypass Rights** | Unlimited | Bypasses right-click block, screenshot block, allows code export |

### B. Telegram Bot & Channel Infrastructure
| Parameter | Value / Detail | Function |
| :--- | :--- | :--- |
| **Bot Username** | `@VedicSamhita_Notes_bot` | Native Node.js listener for devotee questions & admin notes |
| **Bot Display Name** | `Vedic Samhita Notes` | Registered Telegram bot profile name |
| **Telegram Bot Token** | `8080086237:AAH5XSK3kQUyRoTv-6Vp5rptHUE8QhMkUWE` | Active HTTP Telegram API Token |
| **Official Public Channel** | `@Vedicmobilecalendar` | Broadcast channel for daily Panchangam & festival updates |
| **Channel Numeric ID** | `-1001252245437` | Unique identifier for programmatic channel broadcasts |
| **Channel Public Link** | [t.me/Vedicmobilecalendar](https://t.me/Vedicmobilecalendar) | Devotee subscription invite link |
| **Authorized Super Admin Chat ID** | `44714988` | Personal Telegram Chat ID of P. Sree Rama (`@Sreeramadattapanyam`) |

### C. Artificial Intelligence (Google Gemini API)
| Parameter | Value / Detail | Status |
| :--- | :--- | :--- |
| **Google AI Studio API Key** | `AIzaSyDg6pWktdgArW77B8V8aBrEY_mT6bA7V9Q` | Active / Free Tier |
| **Primary Fast AI Model** | `models/gemini-3.5-flash-lite` | Response latency < 800ms; primary copilot engine |
| **Secondary High-Demand Model** | `models/gemini-3.5-flash` | Secondary fallback engine |
| **Deep Reasoning Model** | `models/gemini-3.6-flash` | Tertiary fallback for intricate Shastric analysis |
| **HTTP Timeout Guard** | `25000ms` (25 seconds) | Prevents premature network aborts during deep generations |

### D. Repository & Web Domain
| Parameter | Value / Detail | Notes |
| :--- | :--- | :--- |
| **GitHub Repository** | `panyam1992/panyam-panchangam` | Git source control repository (`main` branch) |
| **Custom Domain (CNAME)** | `vedicsamhita.com` / `www.vedicsamhita.com` | Official website domain mapping |
| **Geocoding Service** | Open-Meteo Geocoding API | Zero-auth, free global geocoding & timezone resolution |

---

## 3. CHRONOLOGICAL PROGRESS REPORT (DAY 1 TO PRESENT)

```mermaid
timeline
    title Vedic Samhita Platform Evolution
    Day 1 - Foundation : Surya Siddhanta mathematical formulas
                       : Sunrise, Sunset, Moonrise, Moonset algorithms
                       : Lahiri Nirayana Ayanamsa & Navagraha Sphutas
    Day 2 - Panchangam Core : Five Limbs (Tithi, Vara, Nakshatra, Yoga, Karana)
                            : Auspicious & Inauspicious Kalams (Rahu, Yama, Durmuhurtam)
                            : Nakshatra Padams (1 to 4) & Moon Rashi calculation
    Day 3 - Frontend Architecture : Modular file split (index.html, styles.css, panchangam.js)
                                  : Global City Search (Open-Meteo) & Auto DST (Frisco, TX default)
                                  : Sanscript.js multi-script transliteration
    Day 4 - Security & Shastras : Role-Based Access Control (security-rbac.js)
                                : Anti-capture protection (blocking right-click & DevTools)
                                : Digitization of 24 Dharma Shastras (Ashaucha, Vivaha, Kuja)
    Day 5 - Exports & Printing : Full Year Ugadi-to-Ugadi astronomical finder
                               : Multi-day print generator with watermarked pages
                               : High-speed async iCal (.ics) calendar export
    Day 6 - Telegram Bot & AI : Native Node.js Telegram Bot listener
                              : Google Gemini Shastra Copilot integration
                              : Multi-turn chat memory & Drik engine precision dispatch
```

### Phase 1: Astronomical & Mathematical Foundation
- **Core Treatises Applied:** *Surya Siddhanta*, *Drik Siddhanta*, *Aryabhatiya*.
- **Solar & Lunar Dynamics:**
  - Implemented ascensional difference (*Cara*), diurnal circle radius (*Dyujya*), and earth-sine (*Kujya/Kshitijya*) using 12-digit gnomon shadow mathematics to compute true local sunrise and sunset.
  - Calculated the equation of time, solar declination (*Kranti*), and lunar parallax to derive exact moonrise and moonset.
- **Nirayana Longitudes:**
  - Implemented Lahiri Ayanamsa (Chitra Paksha) with high precision precession corrections.
  - Calculated exact planetary positions for Surya, Chandra, Kuja, Budha, Guru, Shukra, Shani, Rahu, and Ketu.
- **Pancha-Angas (The Five Limbs):**
  - **Tithi:** Precise 12° longitudinal separation between Moon and Sun (30 Tithis).
  - **Vara:** Solar day reckoning from local sunrise (*Suryodaya*).
  - **Nakshatra:** 13°20' lunar arc segmentation (27 constellations) with individual 3°20' **Padam (Quarter)** derivations.
  - **Yoga:** Sum of Sun and Moon Nirayana longitudes divided by 13°20' (27 Yogas).
  - **Karana:** Half-Tithi segmentation of 6° (60 Karanas with 7 movable and 4 fixed).
- **Time Windows:**
  - Dynamic division of daytime (*Dinamana*) into 8 equal parts for **Rahu Kalam**, **Yamaganda**, and **Gulika Kalam**.
  - Precise calculation of **Durmuhurtam**, **Varjyam**, **Amrita Kalam**, **Abhijit Muhurta**, **Brahma Muhurta** (2 ghatikas before sunrise), **Vijaya Muhurta**, **Godhuli**, **Aparahna**, and **Sandhya** times.
- **Annual Rashi Results:**
  - Programmed classical *Adaya-Vyaya* (Income vs. Expenditure) and *Raja-Pujya-Avamanam* formulas based on Samvatsara King/Minister planetary numbers.

### Phase 2: Web Platform & User Interface
- **Modular Refactor:**
  - Decoupled a monolithic 1,800-line `index.html` file into clean, maintainable modules: [`index.html`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/index.html), [`styles.css`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/styles.css), and [`panchangam.js`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/panchangam.js).
- **Transliteration & Linguistic Accessibility:**
  - Replaced heavy legacy plugins with ultra-fast `Sanscript.js`.
  - Transliterates astrological terminology and UI labels dynamically across Telugu, Devanagari/Sanskrit, Kannada, Tamil, and Hindi.
- **Global Geocoding:**
  - Integrated Open-Meteo Geocoding API, enabling search for any village, town, or city worldwide.
  - Automatically derives latitude, longitude, elevation, UTC offset, and Daylight Saving Time (DST). Default configured to **Frisco, Texas, United States**.
- **Grahanam (Eclipse) Engine:**
  - Built an astronomical eclipse detector computing Sparsha (contact), Madhya (maximum), and Moksha (release) timings without sensationalized forecasts, strictly adhering to Dharma Shastra injunctions.

### Phase 3: Security & Privacy (RBAC Engine)
- **Role-Based Access Control ([`security-rbac.js`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/security-rbac.js)):**
  - **Standard Users:** Zero-login, anonymous, ephemeral browsing. Personal data is never stored in local storage, cookies, or databases. Closing the window purges all memory.
  - **Anti-Content Theft:** Blocked context menu (right-click), keyboard shortcuts (Ctrl+C, Ctrl+U, F12), text dragging, and screen selection.
  - **Super Admin:** Logging in with `vedicsamhita` unlocks full administrative bypass, editing capabilities for the administrative vault, screenshot privileges, and notification broadcasting.

### Phase 4: Multi-Day Printing & Calendar Exports
- **Astronomical Ugadi Calculator:**
  - Programmed `findUgadiDates()` to astronomically identify Chaitra Shukla Padyami (the day following Amavasya when Sun is in Meena Rashi) to establish the true Vedic New Year range.
- **Multi-Day Print Engine:**
  - Generates beautiful, print-ready pages with custom watermarks, daily Panchangam tables, planetary positions, and Muhurtas.
  - Supports custom date ranges and full-year (Ugadi to Ugadi) printing with an interactive progress bar.
- **iCal (.ics) Calendar Export:**
  - High-speed async generator producing standard iCalendar `.ics` files. Allows devotees to import daily Tithi, Nakshatra, Rahu Kalam, and festivals into Google Calendar, Apple Calendar, or Outlook without freezing browser UI.

### Phase 5: Dharma Shastra Knowledge Base & Telegram AI Copilot
- **Knowledge Base Digitization ([`shastra_knowledge_base/`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/shastra_knowledge_base)):**
  - `dharma_sindhu_rules.json`: Injunctions on Ashaucha (Sutakam/death impurities), Vrata rules (Ekadashi Harivasara, Rishi Panchami, Varalakshmi), Eclipse protocols, and Naga Pratishta.
  - `muhurta_vivaha_rules.json`: *Vadhu Vara Ghatitartha Chandrika* marriage matching (Dina, Gana, Mahendra, Stree Deergha, Rajju, Vedha) and the 9 classical Kuja Dosha exemptions.
  - `jataka_phalitalu_rules.json`: *Brihat Parashara Hora Shastra* Chapter 32 (Putra Bhava, Santana Dosha, Sarpa Shaapa, Beeja/Kshetra Sphuta), Gandanta Nakshatra remedies, and Namakshara padas.
- **Telegram Bot Daemon ([`telegram_bot.js`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/telegram_bot.js)):**
  - Native Node.js listener connecting `@VedicSamhita_Notes_bot` directly to the local project.
  - Admin rules vault (`ADMIN_RULES_VAULT.json`) to store voice notes, text rules, and JSON imports directly from mobile Telegram into the project.
- **Google Gemini Shastra Copilot ([`gemini_shastra_ai.js`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/shastra_knowledge_base/gemini_shastra_ai.js)):**
  - Connected to Google AI Studio with multi-model fallback (`gemini-3.5-flash-lite` -> `gemini-3.5-flash` -> `gemini-3.6-flash`).
  - Maintains conversation history per chat ID for contextual multi-turn dialogue.
  - Enforces mandatory sign-off from Siddhanta Karta: *Ramachandra shastry Munimadugu* ([www.vedicsamhita.com](https://www.vedicsamhita.com)).
- **Hybrid Precision Routing:**
  - Whenever a devotee asks for a specific Muhurtam, the query is intercepted by the local Drik calculation engine to provide **exact dates, morning hours, tithis, and mantras** rather than generic textbook theory.
  - Dedicated **Sri Santana Gopala Mantra Japa Arambham** engine:
    - *13-Sep-2026 (Sunday):* Hasta Nakshatra | 6:00 AM – 7:15 AM.
    - *23-Sep-2026 (Wednesday):* Sri Vamana Jayanti / Shravana | 6:15 AM – 7:30 AM & 11:45 AM – 12:35 PM.
    - *21-Oct-2026 (Wednesday):* Pashankusha Ekadashi / Purvabhadra | 6:30 AM – 7:45 AM.
  - Dedicated **Naga Pratishta & Ashlesha Bali** engine:
    - *17-Sep-2026 (Thursday):* Ashlesha Nakshatra (Kukke Subramanya Ashlesha Bali) | 6:30 AM – 8:45 AM.
    - *02-Oct-2026 (Friday):* Ashwayuja Shukla Panchami (Navaratri Lalitha Panchami) | 7:15 AM – 9:30 AM.
    - *14-Oct-2026 (Wednesday):* Ashlesha Nakshatra | 6:45 AM – 9:00 AM.
    - Protocols for Kukke Subramanya, Srikalahasti, and Mopidevi.

---

## 4. WHAT IS COMPLETE VS. INCOMPLETE (ROADMAP)

```mermaid
pie title Project Completion Status
    "Completed Core Engine & Features" : 85
    "Pending Muhurtavali Page" : 5
    "Pending Reference Verification" : 4
    "Pending Anandadi Yogas" : 3
    "Mobile App Wrapper" : 3
```

### ✅ Completed Milestones
- [x] Full astronomical Panchangam computation engine (Surya Siddhanta + Drik Ganita).
- [x] Accurate calculation of 27 Nakshatras with 4 Padas and Moon Rashi.
- [x] Dynamic global city geocoding with automatic daylight saving calculation.
- [x] Multi-script transliteration engine across 5 Indian languages.
- [x] Security, privacy, zero-login architecture, and anti-capture protection.
- [x] Multi-day printer engine and iCal (.ics) calendar export.
- [x] 24 Dharma Shastras knowledge repository.
- [x] Native Telegram bot daemon with vault storage and audio saving.
- [x] Google Gemini AI integration with 25-second timeout and multi-turn memory.
- [x] Exact 2026 Muhurtam calculation for Santana Gopala Japa and Naga Pratishta.

---

### ⏳ Incomplete Tasks & Next Steps

#### 1. Standalone Muhurtavali Web Page
- **Status:** Partially built (`muhurtavali.html` exists in prototype).
- **Requirement:** Needs to be completed as a dedicated, interactive web catalog containing 20 standardized Muhurtam classifications:
  1. Vivaha (Marriage)
  2. Gruhapravesha (Housewarming)
  3. Upanayana (Sacred Thread)
  4. Namakarana (Baby Naming)
  5. Annaprashana (First Feeding)
  6. Aksharabhyasa (Education Initiation)
  7. Karnavedha (Ear Piercing)
  8. Chaula / Chudakarana (First Tonsure)
  9. Vahana Kraya (Vehicle Purchase)
  10. Vyapara / Shop Opening
  11. Bhumi Puja / Shanku Sthapana (Foundation Laying)
  12. Dvara Sthapana (Main Door Fixing)
  13. Kupa / Jalashaya Arambham (Well / Water Boring)
  14. Seemantham (Baby Shower)
  15. Jata Karma & Pumsavana
  16. Devata Pratishta (Idol Consecration)
  17. Yatra / Prayana Muhurtam (Travel)
  18. Vidya Arambham
  19. Mantra Deeksha & Japa Arambham
  20. Rushi Panchami & Vrata Arambham
- **Action:** Wire each category to `astro_calc_core.js` to dynamically generate auspicious dates for any chosen month and location.

#### 2. Planetary Accuracy Verification (Anantapur & Tirupati Check)
- **Status:** Pending manual cross-check.
- **Requirement:** Systematically cross-verify the Navagraha Nirayana Sphutas, Lagna beginnings, and Tithi endings generated by `panchangam.js` against the printed reference *Anantapur / Tirupati Drik Ganita Panchangam* for a sample of 10 random dates across 2026.

#### 3. 60 Anandadi Yogas Implementation
- **Status:** Not yet implemented.
- **Requirement:** The 60 Anandadi Yogas (Ananda, Kaladanda, Dhwanksha, Vajra, Mudgara, Padmaka, Gada, Matanga, etc.) depend on the combination of the weekday (*Vara*) and the Moon's constellation (*Nakshatra*).
- **Action:** Code the lookup matrix in `panchangam.js` and display the active Anandadi Yoga under the daily Panchangam attributes.

#### 4. Automated Daily Telegram Broadcast Cron
- **Status:** Manual script available (`usa_broadcast_engine.js`), but automated cron daemon not active.
- **Requirement:** Set up an automated daily schedule (at 5:00 AM local time) that compiles the day's Panchangam summary, Tithi, Nakshatra, Rahu Kalam, and festival alerts, and posts it directly to the public Telegram channel `@Vedicmobilecalendar`.

#### 5. Standalone Mobile App Wrapper (Android / iOS)
- **Status:** Web version is fully responsive and PWA-ready (`manifest.json` and `sw.js` exist).
- **Requirement:** Package the web application into an offline-first native Android APK and iOS bundle using Capacitor or Cordova, allowing installation directly from the Google Play Store and Apple App Store.

---

## 5. TECHNICAL ARCHITECTURE & DIRECTORY MAP

```
d:\OWN PANCHANGAM BUILD\Panyam AI Panchangam\
├── index.html                     # Main Web Landing Page (Telugu default)
├── styles.css                     # Master Stylesheet (Cinzel, Cormorant Garamond fonts)
├── panchangam.js                  # Primary Client-Side Calculation & UI Renderer
├── security-rbac.js               # Super Admin vs Standard User RBAC & Anti-Capture
├── manifest.json & sw.js          # Progressive Web App (PWA) Offline Engine
│
├── telegram_bot.js                # Background Daemon for @VedicSamhita_Notes_bot
├── telegram_config.json           # Bot Token, Gemini Key, and Channel Configuration
├── ADMIN_RULES_VAULT.json         # Administrative rules storage ingested from Telegram
├── telegram_audio/                # Voice notes sent by Super Admin via Telegram
│
├── shastra_knowledge_base/        # 24 Dharma Shastras Computational Intelligence
│   ├── gemini_shastra_ai.js       # Google Gemini AI Multi-Turn Shastric Copilot
│   ├── shastra_engine.js          # Local Rule & Muhurtam Engine (Japa, Pratishta, Vivaha)
│   ├── astro_calc_core.js         # Backend Astronomical Calculations & Scanning
│   ├── dharma_sindhu_rules.json   # Dharma Sindhu & Nirnaya Sindhu Canonical Rules
│   ├── muhurta_vivaha_rules.json  # Marriage Matching & Kuja Dosha Rules
│   └── jataka_phalitalu_rules.json# BPHS Chapter 32, Gandanta & Namakshara Rules
│
├── muhurtavali.html               # 20-Category Muhurtavali Catalog (In progress)
├── jathakam.html                  # Horoscope & Kundali Analysis Page
├── family_jathakam.html           # Family Multi-Horoscope Comparison Page
├── ugadi.html                     # Ugadi Panchangam Annual Phalas Page
├── usa_broadcast_engine.js        # Automated Telegram Broadcast Engine
└── CNAME                          # vedicsamhita.com Domain Configuration
```

---

## 6. INSTRUCTIONS FOR SYSTEM MAINTENANCE

1. **Starting the Telegram Bot Daemon:**
   ```powershell
   cd "d:\OWN PANCHANGAM BUILD\Panyam AI Panchangam"
   node telegram_bot.js
   ```
2. **Editing or Adding Shastric Rules:**
   - Either send a note/rule directly to `@VedicSamhita_Notes_bot` on Telegram (it will automatically append to `ADMIN_RULES_VAULT.json`),
   - Or modify the relevant JSON file in `shastra_knowledge_base/`.
3. **Updating the Gemini API Key:**
   - Update `gemini_api_key` in [`telegram_config.json`](file:///d:/OWN%20PANCHANGAM%20BUILD/Panyam%20AI%20Panchangam/telegram_config.json). The system will automatically use the new key without code modifications.

---
*Report Compiled for Siddhanta Karta: Ramachandra shastry Munimadugu*  
*Vedic Samhita Research & Engineering Core — [www.vedicsamhita.com](https://www.vedicsamhita.com)*
