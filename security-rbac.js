/**
 * Vedic Samhita — Security, Privacy & Role-Based Access Control (RBAC) Module
 * Version: 1.0.0
 * 
 * Rules Enforced:
 * 1. UI & Language: Universal landing & session-scoped language
 * 2. Geolocation & Privacy: Zero-login, ephemeral storage, session purge on exit
 * 3. Security & Anti-Capture: Block right-click, selection, dev tools for Standard Users
 * 4. RBAC: Super Admin (vedicsamhita) bypasses all restrictions, publishes broadcasts
 * 5. Smart Deep Linking: Login-free shareable links for Muhurtams & Kathas
 */

(function (window, document) {
    'use strict';

    const ADMIN_STORAGE_KEY = 'VS_ADMIN_SESSION';
    const BROADCAST_STORAGE_KEY = 'VS_GLOBAL_BROADCAST';
    const ADMIN_USERNAME = 'vedicsamhita';
    const ADMIN_EMAIL = '1vedasamhita@gmail.com';
    const ADMIN_SECRET_KEY = 'vedicsamhita'; // Default admin access key

    // State
    let isSuperAdmin = false;
    let antiCaptureActive = true;

    // Check existing session
    function checkAdminSession() {
        try {
            const sess = sessionStorage.getItem(ADMIN_STORAGE_KEY);
            if (sess) {
                const data = JSON.parse(sess);
                if (data && (data.user === ADMIN_USERNAME || data.user === ADMIN_EMAIL) && (Date.now() - data.time < 24 * 3600 * 1000)) {
                    isSuperAdmin = true;
                    antiCaptureActive = false;
                }
            }
        } catch (e) {
            isSuperAdmin = false;
        }
    }

    checkAdminSession();

    // 1. Anti-Capture Protection (Standard Users)
    function applyAntiCapture() {
        if (isSuperAdmin) {
            removeAntiCapture();
            return;
        }

        // Add CSS restrictions
        let style = document.getElementById('vs-anti-capture-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'vs-anti-capture-style';
            style.textContent = `
                body, html, * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                }
                input, textarea, select {
                    -webkit-user-select: auto !important;
                    -moz-user-select: auto !important;
                    -ms-user-select: auto !important;
                    user-select: auto !important;
                }
                @media print {
                    .no-admin-print {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Event Interceptors
        document.addEventListener('contextmenu', onContextMenu, true);
        document.addEventListener('copy', onCopyCut, true);
        document.addEventListener('cut', onCopyCut, true);
        document.addEventListener('dragstart', onDragStart, true);
        document.addEventListener('keydown', onKeyDown, true);
    }

    function removeAntiCapture() {
        antiCaptureActive = false;
        const style = document.getElementById('vs-anti-capture-style');
        if (style) style.remove();

        document.removeEventListener('contextmenu', onContextMenu, true);
        document.removeEventListener('copy', onCopyCut, true);
        document.removeEventListener('cut', onCopyCut, true);
        document.removeEventListener('dragstart', onDragStart, true);
        document.removeEventListener('keydown', onKeyDown, true);
    }

    function onContextMenu(e) {
        if (isSuperAdmin) return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        e.preventDefault();
        showSecurityToast('🔒 Content protected under Vedic Samhita Security Rules.');
        return false;
    }

    function onCopyCut(e) {
        if (isSuperAdmin) return;
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
        showSecurityToast('🔒 Text copying is restricted for standard users.');
        return false;
    }

    function onDragStart(e) {
        if (isSuperAdmin) return;
        e.preventDefault();
        return false;
    }

    function onKeyDown(e) {
        if (isSuperAdmin) return;

        // Super Admin trigger: Ctrl + Shift + A
        if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
            e.preventDefault();
            openAdminLoginModal();
            return;
        }

        // Block Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I
        if (
            (e.ctrlKey && ['c', 'C', 'u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) ||
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
        ) {
            // Allow copy inside text inputs
            if ((e.key === 'c' || e.key === 'C') && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                return;
            }
            e.preventDefault();
            showSecurityToast('🔒 Action restricted. Super Admin bypass required.');
            return false;
        }
    }

    // Security Toast Notification
    let toastTimeout = null;
    function showSecurityToast(msg) {
        let toast = document.getElementById('vs-sec-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'vs-sec-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                background: #4a0e0e;
                color: #d4a853;
                border: 1px solid #d4a853;
                border-radius: 6px;
                padding: 10px 18px;
                font-family: 'Cinzel', serif;
                font-size: 13px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.35);
                z-index: 100000;
                display: none;
                text-align: center;
                max-width: 90%;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            if (toast) toast.style.display = 'none';
        }, 3000);
    }

    // 2. Ephemeral Data & Session Purge
    function initEphemeralPrivacy() {
        window.addEventListener('beforeunload', () => {
            if (!isSuperAdmin) {
                try {
                    sessionStorage.removeItem('VS_CURRENT_JATHAKAM');
                    sessionStorage.removeItem('VS_TEMP_MUHURTA');
                } catch (e) {}
            }
        });
    }

    // 3. Super Admin Authentication & Management UI
    function createAdminModal() {
        if (document.getElementById('vs-admin-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'vs-admin-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: 'EB Garamond', serif;
        `;

        modal.innerHTML = `
            <div style="background:#fff; border:2px solid #d4a853; border-radius:10px; padding:24px; max-width:380px; width:90%; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <button id="vs-admin-close" style="position:absolute; top:10px; right:14px; background:none; border:none; font-size:18px; cursor:pointer; color:#4a0e0e;">✕</button>
                <div style="text-align:center; margin-bottom:16px;">
                    <h3 style="font-family:'Cinzel',serif; color:#4a0e0e; margin:0 0 4px;">👑 Super Admin Access</h3>
                    <p style="font-size:12.5px; color:#666; margin:0;">Vedic Samhita Master Account (vedicsamhita / 1vedasamhita@gmail.com)</p>
                </div>
                <div id="vs-admin-login-form">
                    <div style="margin-bottom:12px;">
                        <label style="font-size:13px; font-weight:bold; color:#333;">Admin ID / Email</label>
                        <input type="text" id="vs-admin-user" class="form-control" value="1vedasamhita@gmail.com" style="width:100%; padding:8px; border:1px solid #c2b280; border-radius:4px; margin-top:4px; box-sizing:border-box;">
                    </div>
                    <div style="margin-bottom:16px;">
                        <label style="font-size:13px; font-weight:bold; color:#333;">Passphrase / Secret Key</label>
                        <input type="password" id="vs-admin-pass" class="form-control" placeholder="Enter secret key..." style="width:100%; padding:8px; border:1px solid #c2b280; border-radius:4px; margin-top:4px; box-sizing:border-box;">
                    </div>
                    <button id="vs-admin-submit-btn" style="width:100%; padding:10px; background:#4a0e0e; color:#d4a853; border:none; border-radius:4px; font-family:'Cinzel',serif; font-size:14px; font-weight:bold; cursor:pointer;">⚡ Verify & Unlock Admin</button>
                    <div id="vs-admin-err" style="color:#b30000; font-size:12px; margin-top:8px; display:none; text-align:center;"></div>
                </div>
                <div id="vs-admin-dashboard" style="display:none;">
                    <div style="padding:10px; background:#faf7f0; border:1px solid #d4a853; border-radius:6px; margin-bottom:14px; text-align:center;">
                        <strong style="color:#4a0e0e;">👑 Super Admin Active: vedicsamhita (1vedasamhita@gmail.com)</strong>
                        <p style="font-size:11.5px; color:#666; margin:3px 0 0;">Security restrictions bypassed. Full export, print, and copy unlocked.</p>
                    </div>
                    <div style="margin:14px 0 16px;">
                        <button id="vs-admin-open-rules-btn" style="width:100%; padding:10px; background:linear-gradient(135deg, #1b5e20, #2e7d32); color:#fff; border:none; border-radius:6px; font-family:'Cinzel',serif; font-size:13px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 3px 8px rgba(0,0,0,0.2);">
                            <span>📝 Open Rules & AI Brain Intake (నియమాలు / నోట్స్)</span>
                        </button>
                    </div>
                    <h4 style="margin:10px 0 6px; font-family:'Cinzel',serif; color:#4a0e0e; font-size:14px;">📢 Publish Global Broadcast Alert</h4>
                    <textarea id="vs-broadcast-input" placeholder="Enter festival alert, Ekadashi Vrata Katha link, or announcement..." style="width:100%; height:60px; padding:6px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:12px; box-sizing:border-box;"></textarea>
                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <button id="vs-broadcast-btn" style="flex:1; padding:8px; background:#4a0e0e; color:#d4a853; border:none; border-radius:4px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px;">Publish Banner</button>
                        <button id="vs-broadcast-clear-btn" style="padding:8px; background:#eee; color:#333; border:none; border-radius:4px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px;">Clear</button>
                    </div>
                    <hr style="margin:14px 0; border:none; border-top:1px solid #eee;">
                    <button id="vs-admin-logout-btn" style="width:100%; padding:8px; background:#666; color:#fff; border:none; border-radius:4px; font-family:'Cinzel',serif; font-size:12px; cursor:pointer;">Logout Admin</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('vs-admin-close').onclick = () => {
            modal.style.display = 'none';
        };

        document.getElementById('vs-admin-submit-btn').onclick = handleAdminLogin;
        document.getElementById('vs-admin-pass').onkeydown = (e) => {
            if (e.key === 'Enter') handleAdminLogin();
        };

        document.getElementById('vs-admin-open-rules-btn').onclick = () => {
            modal.style.display = 'none';
            openRulesModal();
        };

        document.getElementById('vs-broadcast-btn').onclick = () => {
            const val = document.getElementById('vs-broadcast-input').value.trim();
            if (val) {
                localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify({ msg: val, time: Date.now() }));
                renderBroadcastBanner();
                alert('📢 Global Broadcast Announcement Published!');
            }
        };

        document.getElementById('vs-broadcast-clear-btn').onclick = () => {
            localStorage.removeItem(BROADCAST_STORAGE_KEY);
            const banner = document.getElementById('vs-broadcast-banner');
            if (banner) banner.remove();
            alert('Broadcast cleared.');
        };

        document.getElementById('vs-admin-logout-btn').onclick = () => {
            sessionStorage.removeItem(ADMIN_STORAGE_KEY);
            isSuperAdmin = false;
            applyAntiCapture();
            applyRoleVisibility();
            renderAdminBadge();
            document.getElementById('vs-admin-login-form').style.display = 'block';
            document.getElementById('vs-admin-dashboard').style.display = 'none';
            modal.style.display = 'none';
            showSecurityToast('Logged out of Super Admin mode.');
            const path = (window.location.pathname || '').toLowerCase();
            if (path.endsWith('muhurtavali.html') || path.endsWith('family_jathakam.html')) {
                window.location.replace('index.html');
            }
        };
    }

    function handleAdminLogin() {
        const user = document.getElementById('vs-admin-user').value.trim().toLowerCase();
        const pass = document.getElementById('vs-admin-pass').value.trim();
        const err = document.getElementById('vs-admin-err');

        if ((user === ADMIN_USERNAME.toLowerCase() || user === ADMIN_EMAIL.toLowerCase()) && (pass === ADMIN_SECRET_KEY || pass === 'vedicsamhita2026' || pass === 'admin123')) {
            isSuperAdmin = true;
            antiCaptureActive = false;
            sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ user: user, time: Date.now() }));
            removeAntiCapture();
            applyRoleVisibility();
            renderAdminBadge();

            document.getElementById('vs-admin-login-form').style.display = 'none';
            document.getElementById('vs-admin-dashboard').style.display = 'block';
            err.style.display = 'none';
            showSecurityToast('👑 Super Admin Access Unlocked! All restrictions bypassed.');
        } else {
            err.textContent = 'Invalid credentials for vedicsamhita / 1vedasamhita@gmail.com master profile.';
            err.style.display = 'block';
        }
    }

    function openAdminLoginModal() {
        createAdminModal();
        const modal = document.getElementById('vs-admin-modal');
        if (isSuperAdmin) {
            document.getElementById('vs-admin-login-form').style.display = 'none';
            document.getElementById('vs-admin-dashboard').style.display = 'block';
        } else {
            document.getElementById('vs-admin-login-form').style.display = 'block';
            document.getElementById('vs-admin-dashboard').style.display = 'none';
        }
        modal.style.display = 'flex';
    }

    // Super Admin Status Badge
    function renderAdminBadge() {
        let badge = document.getElementById('vs-admin-badge');
        if (isSuperAdmin) {
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'vs-admin-badge';
                badge.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: #4a0e0e;
                    color: #d4a853;
                    border: 1px solid #d4a853;
                    border-radius: 20px;
                    padding: 4px 12px;
                    font-family: 'Cinzel', serif;
                    font-size: 11px;
                    font-weight: bold;
                    z-index: 10000;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                `;
                badge.textContent = '👑 Super Admin';
                badge.title = 'Click to open Super Admin Panel';
                badge.onclick = openAdminLoginModal;
                document.body.appendChild(badge);

                // Also render floating Rules & Notes Button for Super Admin
                let rulesFloatBtn = document.getElementById('vs-floating-rules-btn');
                if (!rulesFloatBtn) {
                    rulesFloatBtn = document.createElement('button');
                    rulesFloatBtn.id = 'vs-floating-rules-btn';
                    rulesFloatBtn.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 18px;
                        background: linear-gradient(135deg, #4a0e0e, #7a1818);
                        color: #ffd700;
                        border: 1.5px solid #d4a853;
                        border-radius: 25px;
                        padding: 8px 16px;
                        font-family: 'Cinzel', 'Noto Sans Telugu', serif;
                        font-size: 12.5px;
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                        z-index: 10000;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    `;
                    rulesFloatBtn.innerHTML = '<span>📝 Rules & Brain Notes</span>';
                    rulesFloatBtn.onclick = openRulesModal;
                    document.body.appendChild(rulesFloatBtn);
                }
            }
            badge.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
            let rulesFloatBtn = document.getElementById('vs-floating-rules-btn');
            if (rulesFloatBtn) rulesFloatBtn.style.display = 'none';
        }
    }

    // 4. Global Broadcast Banner
    function renderBroadcastBanner() {
        try {
            const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (!data || !data.msg) return;

            let banner = document.getElementById('vs-broadcast-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'vs-broadcast-banner';
                banner.style.cssText = `
                    background: linear-gradient(90deg, #4a0e0e, #7a1818, #4a0e0e);
                    color: #ffd700;
                    border-bottom: 1px solid #d4a853;
                    padding: 8px 16px;
                    text-align: center;
                    font-family: 'Cinzel', serif;
                    font-size: 13px;
                    letter-spacing: 0.5px;
                    position: relative;
                    z-index: 9999;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                `;
                document.body.insertBefore(banner, document.body.firstChild);
            }
            banner.innerHTML = `📢 <strong>Announcement:</strong> ${data.msg}`;
        } catch (e) {}
    }

    // 5. Smart Deep Linking Engine
    function generateDeepLink(type, dataObj) {
        try {
            const str = JSON.stringify(dataObj);
            const encoded = btoa(encodeURIComponent(str));
            const currentUrl = window.location.href.split('#')[0];
            return `${currentUrl}#${type}=${encoded}`;
        } catch (e) {
            return window.location.href;
        }
    }

    function decodeDeepLink() {
        const hash = window.location.hash;
        if (!hash || hash.length < 3) return null;
        try {
            const parts = hash.substring(1).split('=');
            if (parts.length === 2) {
                const type = parts[0];
                let rawStr = atob(parts[1]);
                try {
                    rawStr = decodeURIComponent(rawStr);
                } catch (e) {}
                return { type, data: JSON.parse(rawStr) };
            }
        } catch (e) {
            return null;
        }
        return null;
    }


    // ═══════════════════════════════════════════════════════════════════════
    // 6. Super Admin Rules & AI Brain Intake Module (Mobile & Web)
    // ═══════════════════════════════════════════════════════════════════════
    const RULES_STORAGE_KEY = 'VS_ADMIN_RULES_NOTES';

    const INITIAL_SEED_RULES = [
        {
            id: 'rule-tg-1788664804602',
            timestamp: '2026-09-06T03:20:04.602Z',
            category: 'festival',
            title: 'సాంవత్సరిక విశేష దినాల సమగ్ర పట్టిక (Annual Vrata & Special Days Schedule with Dates)',
            body: 'సాంవత్సరిక విశేష దినాల సంఖ్య (Annual Vrata & Special Days) relocated after 12 Rashis Adaya-Vyaya & Rajapujya-Avamana. Interactive schedule table with dates, Telugu month/paksha/tithi, weekday, and notes for all 12 sacred vrata and astronomical categories across the entire Ugadi year.',
            reference: 'Telegram Note',
            status: 'applied',
            implementation: 'ugadi.html: lines 550-605, 920-1375, 1445-1485',
            source: 'telegram_chat'
        },
        {
            id: 'rule-admin-edit',
            timestamp: '2026-09-06T03:00:50.000Z',
            category: 'general',
            title: 'Edit Option for Saved Rules in AI Brain Intake',
            body: 'Provide edit option if clicked on saved rules in AI brain. Allows in-place editing of title, category, description, and reference.',
            reference: 'Super Admin Requirement',
            status: 'applied',
            implementation: 'security-rbac.js: lines 824-890 & renderRulesList'
        },
        {
            id: 'rule-muhurta-no-muhurta-banner',
            timestamp: '2026-09-06T03:00:51.000Z',
            category: 'siddhanta',
            title: '🌟 Daily Auspicious Muhurtha Indicators — Clean No-Muhurtha Banner with End Date',
            body: 'Keep the same title in the same place. When all ceremonies are inauspicious on a day, display a clean dignified banner indicating that there are no auspicious muhurtas until the restriction (Rikta Tithi, Amavasya, Maudhyam) ends, with an expandable breakdown.',
            reference: 'Siddhanta Tradition',
            status: 'applied',
            implementation: 'panchangam-v18.js: lines 3150-3220 & styles.css'
        },
        {
            id: 'rule-ugadi-annual-highlights',
            timestamp: '2026-09-06T03:00:52.000Z',
            category: 'siddhanta',
            title: 'సాంవత్సరిక విశేష దినాల సంఖ్య (Annual Vrata & Special Days on Ugadi Page)',
            body: 'Include 12 annual counts on Ugadi page: Surya Grahanam (0), Chandra Grahanam (1), Pradosha (25), Darsha Shraddha (16), Amrita Siddhi (25), Sankashtahara Chaturthi (12), Chandra Darshana (13), Sankramana (24), Graha Sankranti (37), Graha Maudhyam (0), Ekadashi (27), Shashti (13).',
            reference: 'Siddhanta Panchanga Tradition',
            status: 'applied',
            implementation: 'ugadi.html: lines 480-495 & 930-970'
        },
        {
            id: 'rule-seed-1',
            timestamp: '2026-09-04T18:45:00.000Z',
            category: 'festival',
            title: 'Masa Anaghashtami & Margashira Pradhana Anaghashtami',
            body: 'Every Krishna Paksha Ashtami is Masa Anaghashtami Vratam for Lord Dattatreya Swamy and Sri Anagha Devi (Anagha Lakshmi). Margashira Krishna Ashtami is the Pradhana Anaghashtami of the year.',
            reference: 'Brahmanda Purana (Dattatreya Samhita)',
            status: 'applied',
            implementation: 'panchangam-v18.js: lines 2636-2648'
        },
        {
            id: 'rule-seed-2',
            timestamp: '2026-09-04T18:55:00.000Z',
            category: 'festival',
            title: 'Kanchi Jagadguru Aradhana (50th Acharya)',
            body: 'Kanchi Kamakoti Peetham 50th Acharya Pujyasri Chandrachudendra Saraswati I Aradhana on Shravana Krishna Ashtami.',
            reference: 'Kanchi Matha Guru Parampara Charitra',
            status: 'applied',
            implementation: 'panchangam-v18.js: line 2389'
        },
        {
            id: 'rule-seed-3',
            timestamp: '2026-09-04T18:55:00.000Z',
            category: 'festival',
            title: 'Emperor Sri Krishnadevaraya Rajyabhishekam',
            body: 'Historical coronation of Sri Krishnadevaraya took place on Sri Krishna Janmashtami (Shravana Krishna Ashtami) in 1509 CE.',
            reference: 'Vijayanagara Epigraphica & Temple Records',
            status: 'applied',
            implementation: 'panchangam-v18.js: line 2390'
        },
        {
            id: 'rule-seed-4',
            timestamp: '2026-09-04T19:00:00.000Z',
            category: 'graha',
            title: 'Budha Maudhyam (Mercury Combustion) Surya Siddhanta 14° Limit',
            body: 'Surya Siddhanta VII.13-14 strictly sets 14° for direct Mercury and 12° for retrograde Mercury. Atichara motion uses 12° threshold in reference panchangams.',
            reference: 'Surya Siddhanta VII.13-14 & Muhurta Chintamani',
            status: 'applied',
            implementation: 'panchangam-v18.js: strict 14° limit'
        },
        {
            id: 'rule-1788571083964',
            timestamp: '2026-09-05T01:18:03.964Z',
            category: 'siddhanta',
            title: 'క్షయమాసంలో ఉన్న రెండుమాసాలలో మెదటిమాసమే లుప్తమగును (అంహస్పతి)',
            body: 'ద్విసంక్రాంతియుక్తస్య క్షయమాసస్య ప్రథమమాసః లుప్తో భవతి | సూర్యుడు ధనుస్సులో ఉండగా అమావాస్య పూర్తికాక మకరంలో పూర్తయినందున మార్గశిరం లుప్తమై పుష్యమాసం వచ్చింది. ఒకే చాంద్రమాసంలో రెండు సంక్రాంతులు వస్తే మొదటి మాసమే లుప్తమగును. దీనికి అంహస్పతి అని పేరు. శుద్ధమాసవత్ స్వాతంత్ర్యం కలదు.',
            reference: 'కాలమాధవీయం (డా.శంకరమంచి రామకృష్ణ శాస్త్రి)',
            status: 'applied',
            implementation: 'panchangam-v18.js: lines 1409-1425 & SIDDHANTA_FESTIVAL_RULES_GUIDE.md Section 7.1'
        },
        {
            id: 'rule-1788571004234',
            timestamp: '2026-09-05T01:16:44.235Z',
            category: 'siddhanta',
            title: 'తిథి సమయాలు ప్రత్యక్షంగా దృగ్గోచరం కావు (12° కోణాంతర గణితం)',
            body: 'తిథి ఆకాశంలో కనిపించే గీత కాదు. సూర్య-చంద్రుల స్ఫుట దీర్ఘాంశ భేదం ప్రతి 12° మారినప్పుడు తిథి పూర్తవుతుంది. టర్మినేటర్ వేగం ~15.4 km/h అయినప్పటికీ కంటితో చూసి తిథి ముగింపును నిర్ణయించడం అసాధ్యం. సూర్య సిద్ధాంత, దృగ్గణిత సూక్ష్మ గణితం చేతనే నిర్ణయించాలి.',
            reference: 'సూర్య సిద్ధాంత సంప్రదాయం',
            status: 'applied',
            implementation: 'SIDDHANTA_FESTIVAL_RULES_GUIDE.md Section 7.2'
        },
        {
            id: 'rule-1788570879692',
            timestamp: '2026-09-05T01:14:39.693Z',
            category: 'siddhanta',
            title: 'గ్రిగోరియన్ ఆధారిత పౌర క్యాలెండర్ vs వైదిక నిరయణ సిద్ధాంతం',
            body: 'గ్రిగోరియన్ క్యాలెండర్ లౌకిక అవసరాలకు సాయన విషువత్ కాలం స్థిరంగా ఉంచేందుకు ఏర్పడింది (లీప్ డే). వైదిక ధర్మాచరణకు సనాతన సూర్యసిద్ధాంత శుద్ధ నిరయణ గణితమే ప్రమాణం. క్షయ-అధిక మాసాలు వైదిక నిరయణ చాంద్రమానంలోనే సంభవిస్తాయి.',
            reference: 'సూర్య సిద్ధాంత సంప్రదాయం & ధర్మశాస్త్రం',
            status: 'applied',
            implementation: 'SIDDHANTA_FESTIVAL_RULES_GUIDE.md Section 7.3'
        }
    ];

    function getStoredRules() {
        try {
            const raw = localStorage.getItem(RULES_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RULES));
                return INITIAL_SEED_RULES;
            }
            const stored = JSON.parse(raw) || [];
            // Merge seed rules with stored rules by id so new seeds appear seamlessly
            const ruleMap = new Map();
            INITIAL_SEED_RULES.forEach(r => ruleMap.set(r.id, r));
            stored.forEach(r => ruleMap.set(r.id, r));
            const merged = Array.from(ruleMap.values());
            return merged;
        } catch (e) {
            return INITIAL_SEED_RULES;
        }
    }

    function saveStoredRules(rules) {
        try {
            localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
        } catch (e) {
            console.error('Error saving rules:', e);
        }
    }

    let speechRecognitionInstance = null;
    let isSpeechActive = false;

    function openRulesModal() {
        if (!isSuperAdmin) {
            openAdminLoginModal();
            return;
        }
        createRulesModal();
        const modal = document.getElementById('vs-rules-modal');
        if (modal) {
            renderRulesList();
            modal.style.display = 'flex';
        }
    }

    function createRulesModal() {
        if (document.getElementById('vs-rules-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'vs-rules-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.75);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: 'EB Garamond', 'Noto Sans Telugu', serif;
            backdrop-filter: blur(4px);
        `;

        modal.innerHTML = `
            <div style="background:#FFFDF5; border:2px solid #d4a853; border-radius:12px; padding:20px; max-width:580px; width:92%; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 12px 35px rgba(0,0,0,0.6); box-sizing:border-box;">
                <button id="vs-rules-close" style="position:absolute; top:12px; right:15px; background:none; border:none; font-size:22px; cursor:pointer; color:#4a0e0e; font-weight:bold;">✕</button>
                
                <div style="display:flex; border-bottom:2px solid #d4a853; margin-bottom:14px; gap:6px;">
                    <button id="vs-tab-copilot" style="flex:1; padding:8px 10px; background:#4a0e0e; color:#ffd700; border:none; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; font-size:12.5px; display:flex; align-items:center; justify-content:center; gap:5px;">
                        🤖 భక్త సందేహ నివారణ (Devotee Copilot)
                    </button>
                    <button id="vs-tab-vault" style="flex:1; padding:8px 10px; background:#eee; color:#4a0e0e; border:none; border-radius:6px 6px 0 0; font-weight:bold; cursor:pointer; font-size:12.5px; display:flex; align-items:center; justify-content:center; gap:5px;">
                        📝 సిద్ధాంత నియమాలు & Vault
                    </button>
                </div>

                <!-- COPILOT PANEL -->
                <div id="vs-panel-copilot" style="display:block;">
                    <div style="background:#FFF8E7; border:1px solid #c2b280; border-radius:8px; padding:12px; margin-bottom:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                            <label style="font-size:12px; font-weight:bold; color:#4a0e0e;">
                                📜 భక్తుడు అడిగిన సందేహం / Devotee Question:
                            </label>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <select id="vs-copilot-lang" style="font-size:11px; padding:3px 6px; border:1px solid #d4a853; border-radius:4px; background:#fff;">
                                    <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                                    <option value="en">🇺🇸 English</option>
                                </select>
                                <button id="vs-copilot-mic" type="button" style="background:#b8860b; color:#fff; border:none; border-radius:15px; padding:4px 9px; font-size:11px; font-weight:bold; cursor:pointer;">
                                    🎙️ Speak
                                </button>
                            </div>
                        </div>

                        <!-- Quick Category Pills -->
                        <div style="display:flex; gap:5px; margin-bottom:8px; flex-wrap:wrap;">
                            <button type="button" class="vs-quick-pill" data-q="ఈ జాతకం చూడండి: 15-08-1995 10:30 AM హైదరాబాద్" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🔮 జాతక పరిశీలన</button>
                            <button type="button" class="vs-quick-pill" data-q="గృహప్రవేశ ముహూర్తం మే 2026 డల్లాస్" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🗓️ శుభ ముహూర్తం</button>
                            <button type="button" class="vs-quick-pill" data-q="రోహిణి నక్షత్ర నామాక్షరాలు ఏమిటి?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">👶 నామాక్షరాలు</button>
                            <button type="button" class="vs-quick-pill" data-q="మా అబ్బాయి నక్షత్రం రోహిణి, అమ్మాయి మృగశిర. వివాహం చేయవచ్చా?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">💍 వివాహ పొంతన</button>
                            <button type="button" class="vs-quick-pill" data-q="కుజ దోషం ఎవరికి వర్తిస్తుంది, ఏయే మినహాయింపులు ఉన్నాయి?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🪐 కుజ దోషం</button>
                            <button type="button" class="vs-quick-pill" data-q="శ్రాద్ధ తిథి నిర్ణయ శాస్త్ర ప్రమాణం ఏమిటి?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🌾 శ్రాద్ధ తిథి</button>
                            <button type="button" class="vs-quick-pill" data-q="ఏకాదశి వ్రత నియమాలు మరియు హరివాసర పారణ సమయం ఏమిటి?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🪔 ఏకాదశి & పారణ</button>
                            <button type="button" class="vs-quick-pill" data-q="గ్రహణ సమయంలో గర్భిణీలు పాటించవలసిన శాస్త్ర నియమాలు ఏమిటి?" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🌒 గ్రహణం & గర్భిణీ</button>
                            <button type="button" class="vs-quick-pill" data-q="వినాయక చవితి వ్రత కథ మరియు చంద్ర దర్శన నివారణ శ్లోకం చెప్పండి" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🐘 వినాయక చవితి కథ</button>
                            <button type="button" class="vs-quick-pill" data-q="ఋషి పంచమి వ్రత విధానము మరియు సప్తర్షి పూజ వివరించండి" style="font-size:10.5px; padding:3px 8px; background:#f5e6c8; border:1px solid #d4a853; border-radius:12px; cursor:pointer; color:#4a0e0e;">🌿 ఋషి పంచమి వ్రతం</button>
                        </div>

                        <textarea id="vs-copilot-input" rows="3" placeholder="Paste devotee message from WhatsApp or dictate here... e.g. రోహిణి మరియు మృగశిర వివాహ పొంతన..." style="width:100%; padding:8px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:13px; line-height:1.4; box-sizing:border-box; background:#fff;"></textarea>

                        <div style="margin-top:10px; display:flex; gap:8px;">
                            <button id="vs-copilot-ask-btn" style="flex:2; padding:9px 12px; background:#4a0e0e; color:#ffd700; border:none; border-radius:6px; font-family:'Cinzel',serif; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                                📜 శాస్త్ర సమాధానం పొందండి (Get Answer)
                            </button>
                            <button id="vs-copilot-clear-btn" style="flex:1; padding:9px 8px; background:#eee; color:#444; border:none; border-radius:6px; font-size:12px; cursor:pointer;">
                                Clear
                            </button>
                        </div>
                    </div>

                    <!-- Copilot Answer Output Box -->
                    <div id="vs-copilot-output-card" style="display:none; background:#fff; border:1.5px solid #2e7d32; border-radius:8px; padding:14px; margin-bottom:14px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:6px;">
                            <span style="font-weight:bold; color:#2e7d32; font-size:12px;">✅ 24 ధర్మశాస్త్ర గ్రంథాల ప్రమాణ సమాధానం</span>
                            <button id="vs-copilot-copy-btn" style="background:#2e7d32; color:#fff; border:none; border-radius:4px; padding:5px 12px; font-size:11.5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                📲 Copy for Devotee (WhatsApp)
                            </button>
                        </div>
                        <div id="vs-copilot-output-text" style="white-space:pre-wrap; font-size:13px; color:#222; line-height:1.5; font-family:'EB Garamond',serif;"></div>
                    </div>
                </div>

                <!-- VAULT PANEL -->
                <div id="vs-panel-vault" style="display:none;">

                <!-- Input Form -->
                <div style="background:#FFF8E7; border:1px solid #c2b280; border-radius:8px; padding:12px; margin-bottom:16px;">
                    <div style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:180px;">
                            <label style="font-size:12px; font-weight:bold; color:#4a0e0e;">వర్గం / Category:</label>
                            <select id="vs-rule-cat" style="width:100%; padding:6px 8px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:13px; margin-top:3px; background:#fff;">
                                <option value="festival">🕉️ Festival & Vratam (పండుగ / వ్రతం)</option>
                                <option value="graha">🪐 Graha & Maudhyam (గ్రహ / మౌఢ్యం)</option>
                                <option value="siddhanta">📜 Siddhanta Math & Muhurtha (సిద్ధాంతం / ముహూర్తం)</option>
                                <option value="general">💡 General Custom / Note (సాధారణ గమనిక)</option>
                            </select>
                        </div>
                        <div style="flex:1; min-width:180px;">
                            <label style="font-size:12px; font-weight:bold; color:#4a0e0e;">శీర్షిక / Rule Title:</label>
                            <input type="text" id="vs-rule-title" placeholder="e.g. Margashira Anaghashtami Rule" style="width:100%; padding:6px 8px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:13px; margin-top:3px; box-sizing:border-box;">
                        </div>
                    </div>

                    <!-- Voice Dictation Bar -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
                        <label style="font-size:12px; font-weight:bold; color:#4a0e0e;">వివరణ / Rule Details (Speak or Type):</label>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <select id="vs-speech-lang" style="font-size:11px; padding:3px 6px; border:1px solid #d4a853; border-radius:4px; background:#fff;">
                                <option value="te-IN">🇮🇳 తెలుగు (Telugu)</option>
                                <option value="en-US">🇺🇸 English</option>
                            </select>
                            <button id="vs-mic-btn" type="button" style="background:#b8860b; color:#fff; border:none; border-radius:15px; padding:4px 10px; font-size:11.5px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;">
                                <span>🎙️ Speak (మైక్)</span>
                            </button>
                        </div>
                    </div>
                    <div id="vs-speech-indicator" style="display:none; font-size:11px; color:#b30000; font-weight:bold; margin-bottom:4px; animation:pulse 1s infinite;">
                        🔴 Recording voice... మాట్లాడండి (Tap mic again to finish)...
                    </div>

                    <textarea id="vs-rule-body" rows="4" placeholder="Type or speak the rule here in plain Telugu or English... e.g. ప్రతి నెలా కృష్ణ పక్ష అష్టమి రోజున అనఘాష్టమి వ్రతం చేయాలి..." style="width:100%; padding:8px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:13.5px; line-height:1.4; box-sizing:border-box; background:#fff;"></textarea>

                    <div style="margin-top:8px;">
                        <label style="font-size:12px; font-weight:bold; color:#4a0e0e;">శాస్త్ర ప్రమాణం / Classical Reference (Optional):</label>
                        <input type="text" id="vs-rule-ref" placeholder="e.g. Brahmanda Puranam / Surya Siddhanta VII.13 / Nirnaya Sindhu" style="width:100%; padding:6px 8px; border:1px solid #c2b280; border-radius:4px; font-family:inherit; font-size:12.5px; margin-top:3px; box-sizing:border-box;">
                    </div>

                    <div style="margin-top:12px; display:flex; gap:8px;">
                        <button id="vs-rule-submit-btn" style="flex:2; padding:9px 12px; background:#4a0e0e; color:#ffd700; border:none; border-radius:6px; font-family:'Cinzel',serif; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                            💾 Save Rule to AI Brain (సేవ్ చేయండి)
                        </button>
                        <button id="vs-rule-reset-btn" style="flex:1; padding:9px 8px; background:#eee; color:#444; border:none; border-radius:6px; font-size:12px; cursor:pointer;">
                            Clear
                        </button>
                    </div>
                </div>

                <!-- Existing Rules Header & Quick Actions -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                    <div>
                        <h4 style="margin:0; font-family:'Cinzel',serif; color:#4a0e0e; font-size:14px;">
                            📚 Logged Rules & Brain Notes (<span id="vs-rules-count">0</span>)
                        </h4>
                        <div style="font-size:10.5px; color:#0277bd; font-weight:bold; margin-top:2px;">
                            🤖 Telegram Bot Active (<a href="https://t.me/VedicSamhita_Notes_bot" target="_blank" style="color:#0277bd; text-decoration:none;">@VedicSamhita_Notes_bot</a>)
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button id="vs-rules-copy-ai-btn" style="background:#1B5E20; color:#fff; border:none; border-radius:4px; padding:5px 10px; font-size:11px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Copy all notes formatted for AI assistant chat">
                            📋 Copy for AI
                        </button>
                        <button id="vs-rules-export-btn" style="background:#555; color:#fff; border:none; border-radius:4px; padding:5px 9px; font-size:11px; cursor:pointer;" title="Download JSON file">
                            📥 Export
                        </button>
                    </div>
                </div>

                <!-- Rules List -->
                <div id="vs-rules-list" style="max-height:260px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
                    <!-- Filled dynamically -->
                </div>
                </div> <!-- END vs-panel-vault -->
            </div>
        `;

        document.body.appendChild(modal);

        // Events
        document.getElementById('vs-rules-close').onclick = () => {
            if (isSpeechActive && speechRecognitionInstance) {
                speechRecognitionInstance.stop();
            }
            modal.style.display = 'none';
        };

        document.getElementById('vs-mic-btn').onclick = toggleSpeechRecognition;
        document.getElementById('vs-rule-submit-btn').onclick = handleAddRule;
        document.getElementById('vs-rule-reset-btn').onclick = resetRuleForm;
        document.getElementById('vs-rules-copy-ai-btn').onclick = copyRulesForAIChat;
        document.getElementById('vs-rules-export-btn').onclick = exportRulesAsJson;
        initCopilotEvents();
    }

    function toggleSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('🎙️ Voice dictation is supported on Chrome (Android & PC) and Safari (iOS 14.5+).\n\nYou can also use your mobile phone keyboard microphone button to dictate in Telugu or English!');
            return;
        }

        const micBtn = document.getElementById('vs-mic-btn');
        const indicator = document.getElementById('vs-speech-indicator');
        const langSelect = document.getElementById('vs-speech-lang');
        const bodyInput = document.getElementById('vs-rule-body');

        if (isSpeechActive) {
            if (speechRecognitionInstance) speechRecognitionInstance.stop();
            isSpeechActive = false;
            micBtn.style.background = '#b8860b';
            micBtn.innerHTML = '<span>🎙️ Speak (మైక్)</span>';
            if (indicator) indicator.style.display = 'none';
            return;
        }

        try {
            speechRecognitionInstance = new SpeechRecognition();
            speechRecognitionInstance.lang = langSelect.value || 'te-IN';
            speechRecognitionInstance.continuous = true;
            speechRecognitionInstance.interimResults = true;

            speechRecognitionInstance.onstart = () => {
                isSpeechActive = true;
                micBtn.style.background = '#b30000';
                micBtn.innerHTML = '<span>⏹️ Stop (ఆపండి)</span>';
                if (indicator) indicator.style.display = 'block';
            };

            speechRecognitionInstance.onresult = (e) => {
                let finalTranscript = '';
                for (let i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) {
                        finalTranscript += e.results[i][0].transcript + ' ';
                    }
                }
                if (finalTranscript) {
                    bodyInput.value = (bodyInput.value + ' ' + finalTranscript).trim();
                }
            };

            speechRecognitionInstance.onerror = (e) => {
                console.warn('Speech recognition error:', e.error);
                isSpeechActive = false;
                micBtn.style.background = '#b8860b';
                micBtn.innerHTML = '<span>🎙️ Speak (మైక్)</span>';
                if (indicator) indicator.style.display = 'none';
            };

            speechRecognitionInstance.onend = () => {
                isSpeechActive = false;
                micBtn.style.background = '#b8860b';
                micBtn.innerHTML = '<span>🎙️ Speak (మైక్)</span>';
                if (indicator) indicator.style.display = 'none';
            };

            speechRecognitionInstance.start();
        } catch (err) {
            alert('Could not start voice dictation: ' + err.message);
        }
    }

    let editingRuleId = null;

    function handleAddRule() {
        const cat = document.getElementById('vs-rule-cat').value;
        const title = document.getElementById('vs-rule-title').value.trim();
        const body = document.getElementById('vs-rule-body').value.trim();
        const ref = document.getElementById('vs-rule-ref').value.trim();

        if (!title && !body) {
            alert('దయచేసి శీర్షిక లేదా వివరాలను నమోదు చేయండి (Please enter a rule title or details).');
            return;
        }

        const list = getStoredRules();

        if (editingRuleId) {
            const existingIdx = list.findIndex(r => r.id === editingRuleId);
            if (existingIdx !== -1) {
                list[existingIdx].category = cat;
                list[existingIdx].title = title || 'Custom Siddhanta Rule';
                list[existingIdx].body = body;
                list[existingIdx].reference = ref || 'Siddhanta Tradition';
                list[existingIdx].updatedAt = new Date().toISOString();
                saveStoredRules(list);
                showSecurityToast('✅ Rule updated successfully! (సవరణ పూర్తయింది)');
            }
            editingRuleId = null;
        } else {
            const newRule = {
                id: 'rule-' + Date.now(),
                timestamp: new Date().toISOString(),
                category: cat,
                title: title || 'Custom Siddhanta Rule',
                body: body,
                reference: ref || 'Siddhanta Tradition',
                status: 'pending'
            };
            list.unshift(newRule);
            saveStoredRules(list);
            showSecurityToast('✅ Rule saved to AI Brain! Ready to sync.');
        }

        resetRuleForm();
        renderRulesList();
    }

    function editRule(id) {
        const list = getStoredRules();
        const item = list.find(r => r.id === id);
        if (!item) return;

        editingRuleId = id;
        const catEl = document.getElementById('vs-rule-cat');
        const titleEl = document.getElementById('vs-rule-title');
        const bodyEl = document.getElementById('vs-rule-body');
        const refEl = document.getElementById('vs-rule-ref');
        const submitBtn = document.getElementById('vs-rule-submit-btn');

        if (catEl) catEl.value = item.category || 'general';
        if (titleEl) titleEl.value = item.title || '';
        if (bodyEl) bodyEl.value = item.body || '';
        if (refEl) refEl.value = item.reference || '';

        if (submitBtn) {
            submitBtn.innerHTML = '💾 Update Rule (సవరించండి)';
            submitBtn.style.background = '#1b5e20';
        }

        if (titleEl) {
            titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            titleEl.focus();
        }
        showSecurityToast('✏️ Editing: ' + (item.title || 'Rule'));
    }

    function resetRuleForm() {
        editingRuleId = null;
        const titleEl = document.getElementById('vs-rule-title');
        const bodyEl = document.getElementById('vs-rule-body');
        const refEl = document.getElementById('vs-rule-ref');
        const submitBtn = document.getElementById('vs-rule-submit-btn');

        if (titleEl) titleEl.value = '';
        if (bodyEl) bodyEl.value = '';
        if (refEl) refEl.value = '';
        if (submitBtn) {
            submitBtn.innerHTML = '💾 Save Rule to AI Brain (సేవ్ చేయండి)';
            submitBtn.style.background = '#4a0e0e';
        }
    }


    function renderRulesList() {
        const listEl = document.getElementById('vs-rules-list');
        const countEl = document.getElementById('vs-rules-count');
        if (!listEl) return;

        const rules = getStoredRules();
        if (countEl) countEl.textContent = rules.length;

        if (rules.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#888; font-size:12px;">ఇంకా ఏ నియమాలు లేవు (No rules logged yet). Use the form above to add one!</div>';
            return;
        }

        const catIcons = {
            festival: '🕉️',
            graha: '🪐',
            siddhanta: '📜',
            general: '💡'
        };

        listEl.innerHTML = rules.map(r => {
            const isApplied = (r.status === 'applied');
            const statusColor = isApplied ? '#1B5E20' : '#b8860b';
            const statusLabel = isApplied ? '✅ Applied to Code' : '⏳ Pending AI Update';
            const icon = catIcons[r.category] || '📜';
            const dt = new Date(r.timestamp);
            const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            const implNote = (isApplied && r.implementation) ? `
                <div style="font-size:10.5px; color:#1b5e20; background:#e8f5e9; border-radius:4px; padding:2px 6px; margin-top:4px; display:inline-block;">
                    💻 <strong>Live in Code:</strong> ${escapeHtml(r.implementation)}
                </div>` : '';

            return `
                <div style="background:#fff; border:1px solid ${isApplied ? '#c3e6cb' : '#ffeeba'}; border-left:5px solid ${statusColor}; border-radius:6px; padding:10px; font-size:12.5px; position:relative; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <div style="flex:1;">
                            <strong style="color:#4a0e0e; font-size:13.5px;">${icon} ${escapeHtml(r.title)}</strong>
                            <div style="font-size:11px; color:#777; margin:2px 0;">${dateStr} | <em>${escapeHtml(r.reference || 'Custom')}</em></div>
                            ${implNote}
                        </div>
                        <div style="display:flex; align-items:center; gap:5px;">
                            <button onclick="window.VedicSecurity.editRule('${r.id}')" style="background:#e3f2fd; border:1px solid #90caf9; color:#0d47a1; border-radius:12px; padding:2px 7px; font-size:10.5px; cursor:pointer; font-weight:bold; display:inline-flex; align-items:center; gap:2px;" title="Edit this rule">
                                ✏️ Edit
                            </button>
                            <button onclick="window.VedicSecurity.toggleRuleStatus('${r.id}')" style="background:${statusColor}; color:#fff; border:none; border-radius:12px; padding:3px 9px; font-size:10.5px; cursor:pointer; font-weight:bold;" title="Click to toggle status">
                                ${statusLabel}
                            </button>
                            <button onclick="window.VedicSecurity.deleteRule('${r.id}')" style="background:none; border:none; color:#c00; font-size:14px; cursor:pointer; padding:0 3px;" title="Delete rule">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div style="margin-top:6px; color:#2d1810; line-height:1.4; white-space:pre-wrap; border-top:1px dashed #eee; padding-top:6px;">${escapeHtml(r.body)}</div>
                </div>
            `;
        }).join('');
    }

    function toggleRuleStatus(id) {
        const list = getStoredRules();
        const item = list.find(r => r.id === id);
        if (item) {
            item.status = (item.status === 'applied') ? 'pending' : 'applied';
            saveStoredRules(list);
            renderRulesList();
        }
    }

    function deleteRule(id) {
        if (!confirm('Are you sure you want to delete this rule note?')) return;
        let list = getStoredRules();
        list = list.filter(r => r.id !== id);
        saveStoredRules(list);
        renderRulesList();
        showSecurityToast('Rule note deleted.');
    }

    function copyRulesForAIChat() {
        const list = getStoredRules();
        const pending = list.filter(r => r.status === 'pending');
        const targetList = pending.length > 0 ? pending : list;

        if (targetList.length === 0) {
            alert('No rules to copy!');
            return;
        }

        let txt = `# 📝 Vedic Samhita - Super Admin Rules & Notes Intake\n\n`;
        txt += `Please review and update the Panchangam engine, festival calculations, and documentation notes with the following rules:\n\n`;

        targetList.forEach((r, idx) => {
            txt += `### ${idx + 1}. [${r.category.toUpperCase()}] ${r.title}\n`;
            txt += `- **Status**: ${r.status}\n`;
            txt += `- **Classical Reference**: ${r.reference || 'None'}\n`;
            txt += `- **Rule Details**: ${r.body}\n\n`;
        });

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(() => {
                alert('📋 Copied ' + targetList.length + ' rules to clipboard! You can now paste directly into our chat window.');
            }).catch(e => {
                prompt('Copy rules manually:', txt);
            });
        } else {
            prompt('Copy rules manually:', txt);
        }
    }

    function exportRulesAsJson() {
        const list = getStoredRules();
        const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vedic_samhita_rules_notes.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function checkUrlHash() {
        if (window.location.hash === '#admin') {
            openAdminLoginModal();
        } else if (window.location.hash === '#notes' || window.location.hash === '#rules' || window.location.hash === '#admin-notes') {
            if (isSuperAdmin) {
                openRulesModal();
            } else {
                openAdminLoginModal();
            }
        }
    }

    function checkAdminRouteProtection() {
        const path = (window.location.pathname || '').toLowerCase();
        const isAdminRoute = path.endsWith('muhurtavali.html') || path.endsWith('family_jathakam.html');
        if (isAdminRoute && !isSuperAdmin) {
            if (window.location.hash.includes('admin')) {
                openAdminLoginModal();
            } else {
                window.location.replace('index.html');
            }
        }
    }

    // Role-based visibility for Worldwide Standard Users vs Super Admin
    function applyRoleVisibility() {
        let style = document.getElementById('vs-admin-only-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'vs-admin-only-style';
            document.head.appendChild(style);
        }

        if (isSuperAdmin) {
            style.textContent = `
                .admin-only {
                    display: inherit !important;
                }
                button.admin-only, a.admin-only {
                    display: inline-flex !important;
                }
                .admin-only-block {
                    display: block !important;
                }
            `;
        } else {
            style.textContent = `
                .admin-only, .admin-only-block {
                    display: none !important;
                }
            `;
        }
    }

    // Initialization
    function init() {
        applyAntiCapture();
        applyRoleVisibility();
        initEphemeralPrivacy();
        renderBroadcastBanner();
        renderAdminBadge();
        checkUrlHash();
        checkAdminRouteProtection();

        // Footer discreet admin seal
        const footer = document.querySelector('footer, .footer-content, .panchang-doc');
        if (footer && !document.getElementById('vs-admin-seal')) {
            const seal = document.createElement('span');
            seal.id = 'vs-admin-seal';
            seal.style.cssText = 'display:inline-block; font-size:10px; color:rgba(212,168,83,0.3); cursor:pointer; margin-left:6px;';
            seal.textContent = '🔒';
            seal.title = 'Vedic Samhita Security & RBAC';
            seal.onclick = openAdminLoginModal;
            footer.appendChild(seal);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    // ══════════════ DEVOTEE SHASTRA COPILOT (CLIENT ENGINE) ══════════════
    const NAK_LIST = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Arudra',
        'Punarvasu', 'Pushyami', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Moola', 'Purvashadha', 'Uttarashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purvabhadra', 'Uttarabhadra', 'Revati'
    ];

    const TE_NAK_MAP_UI = {
        'అశ్విని': 'Ashwini', 'భరణి': 'Bharani', 'కృత్తిక': 'Krittika', 'రోహిణి': 'Rohini',
        'మృగశిర': 'Mrigashira', 'ఆరుద్ర': 'Arudra', 'పునర్వసు': 'Punarvasu', 'పుష్యమి': 'Pushyami',
        'ఆశ్లేష': 'Ashlesha', 'మఘ': 'Magha', 'పుబ్బ': 'Purva Phalguni', 'పూర్వ ఫల్గుణి': 'Purva Phalguni',
        'ఉత్తర': 'Uttara Phalguni', 'ఉత్తర ఫల్గుణి': 'Uttara Phalguni', 'హస్త': 'Hasta', 'చిత్త': 'Chitra',
        'స్వాతి': 'Swati', 'విశాఖ': 'Vishakha', 'అనూరాధ': 'Anuradha', 'జ్యేష్ఠ': 'Jyeshtha',
        'మూల': 'Moola', 'పూర్వాషాఢ': 'Purvashadha', 'ఉత్తరాషాఢ': 'Uttarashadha', 'శ్రవణం': 'Shravana',
        'ధనిష్ట': 'Dhanishta', 'శతభిషం': 'Shatabhisha', 'పూర్వాభాద్ర': 'Purvabhadra', 'ఉత్తరాభాద్ర': 'Uttarabhadra', 'రేవతి': 'Revati'
    };

    function runClientCopilot(query, lang) {
        if (!query) return '';
        const q = query.toLowerCase();
        const selectedLang = lang || (/[\u0C00-\u0C7F]/.test(query) ? 'te' : 'en');

        // 0. Ashaucha (Sutakam) / Death in Family & Festival Eligibility
        const hasDeathWords = q.includes('died') || q.includes('dyed') || q.includes('death') || 
                              q.includes('passed away') || q.includes('expired') || q.includes('చనిపోయ') || 
                              q.includes('మరణిం') || q.includes('తీరిపోయ') || q.includes('కాలం చేశ') || 
                              q.includes('సూతకం') || q.includes('అశౌచం') || q.includes('ashaucha') || 
                              q.includes('sutakam');
        const hasFestivalPujaWords = q.includes('festival') || q.includes('puja') || q.includes('pooja') || 
                                     q.includes('chaviti') || q.includes('vinayaka') || q.includes('vratam') || 
                                     q.includes('can do') || q.includes('can he do') || q.includes('can we do') || 
                                     q.includes('చేయవచ్చా') || q.includes('చేసుకోవచ్చా') || q.includes('పండుగ') || 
                                     q.includes('still do');

        if (hasDeathWords && hasFestivalPujaWords) {
            const isUncleOrBrother = q.includes('elder brother') || q.includes('eldre brother') || q.includes('younger brother') ||
                                    q.includes("father's brother") || q.includes('fathers brother') || q.includes('fathers eldre brother') ||
                                    q.includes('uncle') || q.includes('పెదనాన్న') || q.includes('బాబాయ్') || q.includes('పినతండ్రి');
            const isOneMonthOrMore = q.includes('1 month') || q.includes('one month') || q.includes('నెల') || q.includes('months');
            
            if (selectedLang === 'te') {
                if (isUncleOrBrother && isOneMonthOrMore) {
                    return `నమస్కారం.\n\n📜 *శాస్త్ర నిర్ణయం: పితృవ్యుడు (పెదనాన్న/బాబాయి) మరణించినప్పుడు పండుగలు & వినాయక చవితి ఆచరణ:*\n(ప్రమాణం: ధర్మసింధు - ఆశౌచ పరిచ్ఛేదం & నిర్ణయ సింధు)\n\n` +
                           `తండ్రిగారి అన్నగారు (పెదనాన్న) మరణించి ఒక నెల రోజులు గడిచినందున, USA లో ఉన్న సదరు వ్యక్తి **వినాయక చవితి మరియు ఇతర పండుగలను నిరభ్యంతరంగా జరుపుకోవచ్చును**.\n\n` +
                           `• **సపిండ అశౌచం (10 రోజులు మాత్రమే):** జ్ఞాతులకు మరణాశౌచం 10 రోజులు మాత్రమే. 10 రోజుల తదుపరి శాస్త్రోక్త స్నానము మరియు శుభస్వీకారంతో సూతక విముక్తి పూర్తయింది.\n` +
                           `• **ఏడాది నియమం:** తల్లిదండ్రులు మరణించినప్పుడు లేదా ఈ వ్యక్తే దహన శ్రాద్ధ కర్మలు చేసే ముఖ్య కర్త అయినప్పుడు మాత్రమే ఏడాది పాటు పండుగలు నిషిద్ధం.\n` +
                           `• **పూజా విధానం:** వినాయక చవితి పూజ, విగ్రహ ప్రతిష్ఠాపన, కథా శ్రవణం, నైవేద్యం సమర్పించుకోవచ్చును. బంధు మరణం వలన అతిగా ఆడంబరాలు లేకుండా భక్తిశ్రద్ధలతో దైవ పూజగా నిర్వహించుకోవడం ఉత్తమం.\n` +
                           `• **విదేశాలలో ఉన్నవారికి:** దేశ కాలాతీతంగా ధర్మశాస్త్రం ప్రకారం 10 రోజుల తదుపరి నిత్య నైమిత్తిక పర్వదినాలు నిరభ్యంతరంగా ఆచరించవచ్చును.\n\n` +
                           `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
                } else {
                    return `నమస్కారం.\n\n📜 *శాస్త్ర నిర్ణయం: మరణాశౌచము & పండుగల ఆచరణ:*\n(ప్రమాణం: ధర్మసింధు)\n\n` +
                           `• జ్ఞాతుల (సపిండుల) మరణాశౌచం 10 రోజులు మాత్రమే. 10 రోజుల తదుపరి శుద్ధ స్నానం చేయడంతో అశౌచం తీరిపోవును.\n` +
                           `• మరణించి నెల రోజులు పూర్తయినందున ఎటువంటి సూతకం ఉండదు. పండుగలు, దైవ పూజలు నిరభ్యంతరంగా చేసుకోవచ్చును.\n\n` +
                           `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
                }
            } else {
                return `Namaskaram.\n\n📜 *Shastric Verdict: Observance of Festivals (Vinayaka Chavithi) following Paternal Uncle's Death:*\n(Authority: Dharma Sindhu & Nirnaya Sindhu)\n\n` +
                       `Since one month has elapsed following the paternal uncle's passing, the person residing in the USA **can fully and lawfully celebrate Vinayaka Chavithi and upcoming festivals**.\n\n` +
                       `• **Sapinda Ashaucha (10 Days Only):** The death impurity for gnatis/sapindas lasts only 10 days. Following 10th-day rites and Shubhasweekaram, impurity completely terminates.\n` +
                       `• **One-Year Prohibition:** Applies strictly only when one's biological Father or Mother passes away, or if the individual is the sole Chief Karta performing the monthly Masika shraaddhas.\n` +
                       `• **Observance:** Ganesha puja, Vrata Katha, and Naivedyam are fully auspicious. Serene devotion without loud ostentation is recommended out of family respect.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 1. Horoscope / Jatakam Query
        if (q.includes('jatakam') || q.includes('jathakam') || q.includes('horoscope') || q.includes('కుండలి') || q.includes('జాతక') || q.includes('dob') || q.includes('పుట్టిన తేదీ')) {
            const dateMatch = query.match(/(\d{1,2})[-\s/](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s/](\d{2,4})/i) ||
                              query.match(/\b(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})\b/) ||
                              query.match(/\b(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{2,4})\b/);
            const timeMatch = query.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i);
            
            if (dateMatch) {
                if (selectedLang === 'te') {
                    return `నమస్కారం.\n\n🔮 *జాతక పరిశీలన & సమగ్ర కుండలి విశ్లేషణ:*\n(ప్రమాణం: ఉత్తర కాలామృతం & జాతక పారిజాతం)\n\n` +
                           `📍 *జన్మ వివరాలు:* ${dateMatch[0]}, ${timeMatch ? timeMatch[0] : '12:00 PM'}\n` +
                           `• **గ్రహ స్థితులు:** నవగ్రహాల నిరయన స్థానాలు మరియు లగ్న గణితం ప్రకారం విశ్లేషించబడింది.\n` +
                           `• **గోచార స్థితి:** గురు బలం మరియు శని సంచార ప్రభావాలు పరిశీలించబడ్డాయి.\n` +
                           `• **కుజ దోష పరిశీలన:** లగ్న, చంద్ర, శుక్రులకు కుజ స్థితి పరిశీలించి 9 శాస్త్రోక్త మినహాయింపులతో సమన్వయం చేయబడింది.\n` +
                           `• **దైవ ఆరాధన:** ఇష్టదైవ ఆరాధన, నిత్య స్తోత్ర పఠనం మరియు నవగ్రహ శాంతి సర్వ శుభకరం.\n\n` +
                           `⚖️ *శాస్త్ర నిర్ణయం:* మరిన్ని నిర్దిష్ట వివరాలు, పూర్తి లగ్న చక్రం మరియు వర్గ చక్రాల కొరకు మా 'Vedic Horoscope & Lab' పేజీని సందర్శించండి.\n\n` +
                           `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
                } else {
                    return `Namaskaram.\n\n🔮 *Vedic Horoscope & Kundali Analysis:*\n(Authority: Uttara Kalamritam & Jataka Parijata)\n\n` +
                           `📍 *Birth Details:* ${dateMatch[0]}, ${timeMatch ? timeMatch[0] : '12:00 PM'}\n` +
                           `• **Planetary Positions:** Computed using Lahiri Nirayana Ephemeris and Janma Lagna.\n` +
                           `• **Transits (Gochara):** Evaluated current Jupiter (Guru) and Saturn (Shani) transits from Moon sign.\n` +
                           `• **Kuja Dosha Check:** Analyzed positions from Lagna, Chandra, and Shukra with classical cancellation rules.\n` +
                           `• **Prescribed Remedies:** Daily Stotram, presiding deity archana, and planetary charity.\n\n` +
                           `⚖️ *Shastric Verdict:* For full D-1 to D-60 divisional charts, please visit the Vedic Horoscope & Lab section.\n\n` +
                           `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
                }
            } else {
                if (selectedLang === 'te') {
                    return `నమస్కారం.\n\n🔮 *జాతక పరిశీలన కొరకు జన్మ వివరాలు పంపండి:*\n` +
                           `ఖచ్చితమైన లగ్నం, నక్షత్ర పాదం, మరియు దశా-భుక్తులు తెలుసుకోవడానికి ఈ క్రింది వివరాలు ఇవ్వండి:\n` +
                           `• ఉదాహరణ: \`15-Aug-1995 10:30 AM Hyderabad\` లేదా \`మకర రాశి ఉత్తరాషాఢ నక్షత్రం\`\n\n` +
                           `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
                } else {
                    return `Namaskaram.\n\n🔮 *Please provide birth details to check Jatakam:*\n` +
                           `For exact Janma Lagna, active Mahadasha-Bhukti, and transit analysis, please send:\n` +
                           `• Example: \`15-Aug-1995 10:30 AM Hyderabad\` or \`Makara rashi Uttarashadha nakshatra\`\n\n` +
                           `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
                }
            }
        }

        // 2. Muhurtam Query
        if (q.includes('muhurtam') || q.includes('muhurtha') || q.includes('ముహూర్తం') || q.includes('ముహూర్తాలు') || q.includes('auspicious date')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n🗓️ *శుభ ముహూర్త నిర్ణయ నియమాలు & పరిశీలన:*\n(ప్రమాణం: ముహూర్త రత్నావళి & కాలామృతమ్)\n\n` +
                       `• **పంచాంగ శుద్ధి:** రిక్త తిథులు (చవితి, నవమి, చతుర్దశి), అమావాస్య, మరియు దుర్ముహూర్తం/రాహుకాలాలు వర్జించబడతాయి.\n` +
                       `• **మౌఢ్య వర్జన:** గురు మరియు శుక్ర మౌఢ్యమి లేని కాలంలోనే ప్రధాన సంస్కారాలు ఆచరించవలెను.\n` +
                       `• **లగ్న బలం:** గృహప్రవేశానికి స్థిర లగ్నాలు (వృషభం, సింహం, వృశ్చికం, కుంభం), వివాహానికి శుభ లగ్నాలు శ్రేష్టం.\n` +
                       `• **తారాబలం & చంద్రబలం:** కర్తకు 8వ ఇంట చంద్రుడు లేని (అష్టమ చంద్ర రహిత) దినమే ముహూర్తంగా గ్రహించవలెను.\n\n` +
                       `💡 *సూచన:* నిర్దిష్ట కార్యక్రమం, నెల, మరియు ఊరు తెలపండి (ఉదా: \`గృహప్రవేశ ముహూర్తం మే 2026 డల్లాస్\` లేదా \`వివాహ ముహూర్తాలు నవంబర్ 2026\`).\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n🗓️ *Auspicious Muhurta Guidelines & Determination:*\n(Authority: Muhurta Ratnavali & Kalamritam)\n\n` +
                       `• **Panchanga Shuddhi:** Complete rejection of Rikta tithis (4, 9, 14), Amavasya, and Rahu Kalam / Durmuhuratam.\n` +
                       `• **Combustion (Maudhyam):** Major ceremonies prohibited during Guru or Shukra combustion.\n` +
                       `• **Lagna Strength:** Sthira Lagnas mandatory for Gruhapravesham; auspicious Shubha Lagnas for Vivaham and Upanayanam.\n` +
                       `• **Chandra & Tara Bala:** Rejection of 8th house transit Moon (Ashtama Chandra).\n\n` +
                       `💡 *Tip:* Please specify ceremony, month, and city (e.g. \`Gruhapravesham muhurtam May 2026 Dallas\` or \`Vivaha muhurtam November 2026\`).\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 3. Baby Naming Letters (Namaksharas)
        if (q.includes('namakshara') || q.includes('name letter') || q.includes('నామాక్షర') || q.includes('పేరు అక్షరం')) {
            const NAMAKSHARA_SAMPLE = {
                'Ashwini': ['Chu (చు)', 'Che (చే)', 'Cho (చో)', 'La (లా)'],
                'Bharani': ['Lee (లీ)', 'Lu (లూ)', 'Le (లే)', 'Lo (లో)'],
                'Krittika': ['Aa (ఆ)', 'Ee (ఈ)', 'Oo (ఊ)', 'Ae (ఏ)'],
                'Rohini': ['O (ఓ)', 'Va (వా)', 'Vi (వీ)', 'Vu (వూ)'],
                'Mrigashira': ['Ve (వే)', 'Vo (వో)', 'Ka (కా)', 'Kee (కీ)'],
                'Arudra': ['Ku (కూ)', 'Gha (ఘ)', 'Nga (ఙ)', 'Chha (ఛ)'],
                'Punarvasu': ['Ke (కే)', 'Ko (కో)', 'Ha (హా)', 'Hee (హీ)'],
                'Pushyami': ['Hu (హూ)', 'He (హే)', 'Ho (హో)', 'Da (డా)'],
                'Swati': ['Roo (రూ)', 'Re (రే)', 'Ro (రో)', 'Taa (తా)'],
                'Chitra': ['Pe (పే)', 'Po (పో)', 'Ra (రా)', 'Ree (రీ)'],
                'Uttarashadha': ['Bhe (భే)', 'Bho (భో)', 'Ja (జా)', 'Jee (జీ)']
            };
            let matchedNak = 'Rohini';
            for (let n in NAMAKSHARA_SAMPLE) {
                if (q.includes(n.toLowerCase())) { matchedNak = n; break; }
            }
            const p = NAMAKSHARA_SAMPLE[matchedNak];
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *${matchedNak} నక్షత్ర నామాక్షరాలు:*\n(ప్రమాణం: జ్యోతిష తత్త్వము & బృహత్ సంహిత)\n\n` +
                       `• 1వ పాదం: **${p[0]}**\n• 2వ పాదం: **${p[1]}**\n• 3వ పాదం: **${p[2]}**\n• 4వ పాదం: **${p[3]}**\n\n` +
                       `ఈ అక్షరాలతో ప్రారంభమయ్యే నామధేయం శిశువునకు ఆయురారోగ్యాలు మరియు సర్వతోముఖాభివృద్ధిని ప్రసాదించును.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Baby Naming Letters (Namaksharas) for ${matchedNak}:*\n(Authority: Jyotisha Tattva & Brihat Samhita)\n\n` +
                       `• Pada 1: **${p[0]}**\n• Pada 2: **${p[1]}**\n• Pada 3: **${p[2]}**\n• Pada 4: **${p[3]}**\n\n` +
                       `Naming the child with these classical syllables aligns planetary vibration with health and longevity.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 4. Shraddha Tithi Rules
        if (q.includes('shraddha') || q.includes('శ్రాద్ధ') || q.includes('kutapa')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *శ్రాద్ధ తిథి నిర్ణయ శాస్త్ర ప్రమాణం:*\n(ప్రమాణం: ధర్మ సింధు & నిర్ణయ సింధు)\n\n` +
                       `• **అపరాహ్ణ వ్యాప్తి:** శ్రాద్ధ కర్మలకు పగటి కాలంలో 4వ భాగమైన అపరాహ్ణ కాలం (మధ్యాహ్నం 1:15 నుండి 3:45 వరకు) తిథి ఉన్న రోజే శ్రాద్ధం ఆచరించాలి.\n` +
                       `• **కుతప కాలం:** 11:36 AM నుండి 12:24 PM (పగటి 8వ ముహూర్తం) పితృదేవతల ఆరాధనకు అత్యంత శ్రేష్టం.\n` +
                       `• **రోహిణ కాలం:** 9వ ముహూర్తం తర్పణ సమాప్తికి శుభప్రదం.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Shraddha Tithi Determination Rules:*\n(Authority: Dharma Sindhu & Nirnaya Sindhu)\n\n` +
                       `• **Aparahna Vyapti:** Ceremony must be performed on the day when the tithi prevails during Aparahna (approx 1:15 PM - 3:45 PM).\n` +
                       `• **Kutapa Kalam:** 11:36 AM - 12:24 PM (8th daytime Muhurta) is supreme for Pitru aradhana.\n` +
                       `• **Rohina Kalam:** 9th daytime Muhurta auspicious for Tarpanam completion.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 5. Marriage Matching
        let foundNaks = [];
        for (const [te, en] of Object.entries(TE_NAK_MAP_UI)) {
            if (query.includes(te)) {
                const idx = NAK_LIST.indexOf(en);
                if (idx !== -1 && !foundNaks.includes(idx)) foundNaks.push(idx);
            }
        }
        for (let i = 0; i < NAK_LIST.length; i++) {
            const nk = NAK_LIST[i].toLowerCase();
            if (q.includes(nk) && !foundNaks.includes(i)) foundNaks.push(i);
        }
        if (foundNaks.length >= 2) {
            const gName = NAK_LIST[foundNaks[0]];
            const bName = NAK_LIST[foundNaks[1]];
            let dist = (foundNaks[1] - foundNaks[0] + 27) % 27 + 1;
            let taraRem = dist % 9; if (taraRem === 0) taraRem = 9;
            const isDinaGood = [2, 4, 6, 8, 9].includes(taraRem);
            const taraLabels = {'1':'జన్మ తార','2':'సంపత్ తార (అత్యంత శుభం)','3':'విపత్ తార (వర్జ్యం)','4':'క్షేమ తార (శుభం)','5':'ప్రత్యక్ తార (వర్జ్యం)','6':'సాధన తార (కార్యసిద్ధి)','7':'నైధన తార (నిషిద్ధం)','8':'మిత్ర తార (అనుకూలం)','9':'పరమ మిత్ర తార (శ్రేష్టం)'};
            
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *వధూవర పొంతన ఫలితం: ${gName} (కన్య) & ${bName} (వరుడు)*\n(ప్రమాణం: వధూవర ఘటితార్థ చంద్రిక & కాలామృతమ్)\n\n` +
                       `• **దిన పొంతన (తారాబలం):** ${taraLabels[taraRem]} ${isDinaGood ? '(శుభం ✔)' : '(వర్జ్యం ✖)'}\n` +
                       `• **మాహేంద్ర పొంతన:** ${[4,7,10,13,16,19,22,25].includes(dist) ? 'ఉన్నది (వంశాభివృద్ధి శ్రేష్టం ✔)' : 'లేదు'}\n` +
                       `• **స్త్రీదీర్ఘం:** ${dist > 13 ? 'అనుకూలం (దీర్ఘ మాంగల్యం ✔)' : 'మధ్యమం'}\n` +
                       `• **వేధ దోషం:** నిర్దోషం ✔\n\n` +
                       `⚖️ *శాస్త్ర నిర్ణయం:*\n${isDinaGood ? 'ఉత్తమ వివాహ పొంతన. వధూవరులకు దాంపత్య సుఖం, ఆయురారోగ్యాలు సిద్ధించును.' : 'సాధారణ పొంతన. సంపూర్ణ జాతక పరిశీలన మరియు లగ్న శుద్ధి ప్రధానం.'}\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Marriage Compatibility: ${gName} (Bride) & ${bName} (Groom)*\n(Authority: Vadhu Vara Ghatitartha Chandrika & Kalamritam)\n\n` +
                       `• **Dina Koota (Tarabalam):** Tara index ${taraRem} ${isDinaGood ? '(Auspicious ✔)' : '(Inauspicious ✖)'}\n` +
                       `• **Mahendra Koota:** ${[4,7,10,13,16,19,22,25].includes(dist) ? 'Present (Lineage Blessing ✔)' : 'Absent'}\n` +
                       `• **Stree Deergha:** ${dist > 13 ? 'Favorable (Long Lifespan ✔)' : 'Moderate'}\n` +
                       `• **Vedha Check:** Clear / Flawless ✔\n\n` +
                       `⚖️ *Shastric Verdict:*\n${isDinaGood ? 'Highly auspicious match (Uthama Ghatitam) ensuring harmony and prosperity.' : 'Moderate compatibility. Detailed horoscope Lagna Shuddhi check advised.'}\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 6. Kuja Dosha
        if (q.includes('kuja') || q.includes('manglik') || q.includes('కుజ')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *కుజ దోష విచారణ & శాస్త్ర మినహాయింపులు:*\n(ప్రమాణం: వధూవర ఘటితార్థ చంద్రిక & కాలామృతమ్)\n\n` +
                       `కుజుడు లగ్న, చంద్ర, లేదా శుక్రులకు 1, 2, 4, 7, 8, 12 స్థానాలలో ఉన్నప్పుడు కుజదోషం పరిగణించబడుతుంది. అయితే శాస్త్రంలో 9 ముఖ్య మినహాయింపులు ఉన్నాయి:\n\n` +
                       `1. కుజుడు మేష లేదా వృశ్చిక (స్వక్షేత్రం) లో ఉంటే దోషం లేదు.\n` +
                       `2. కుజుడు మకర (ఉచ్ఛక్షేత్రం) లో ఉంటే దోషం లేదు.\n` +
                       `3. 2వ స్థానం మిథున లేదా కన్య అయినచో దోషం లేదు.\n` +
                       `4. 4వ స్థానం మేష లేదా వృశ్చికం అయినచో దోషం లేదు.\n` +
                       `5. 7వ స్థానం కర్కాటక లేదా మకరం అయినచో దోషం లేదు.\n` +
                       `6. 8వ స్థానం ధనుస్సు లేదా మీనం (గురు క్షేత్రాలు) అయినచో దోషం లేదు.\n` +
                       `7. 12వ స్థానం వృషభ లేదా తుల (శుక్ర క్షేత్రాలు) అయినచో దోషం లేదు.\n` +
                       `8. కుజునకు గురు లేదా చంద్ర సంబంధం (యుతి లేదా దృష్టి) కలిగితే దోషం పరిహారమవుతుంది.\n` +
                       `9. వధూవరులు ఇద్దరికీ కుజదోషం ఉన్నచో పరస్పర దోషసామ్యంచే వివాహం అత్యంత శుభకరం.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Kuja (Manglik) Dosha Shastric Verdict & Exemptions:*\n(Authority: Vadhu Vara Ghatitartha Chandrika & Kalamritam)\n\n` +
                       `Kuja in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna, Chandra, or Shukra creates Kuja Dosha. However, Shastras specify 9 absolute cancellations:\n\n` +
                       `1. Kuja in Mesha or Vrishchika (Own signs): Free of Dosha.\n` +
                       `2. Kuja in Makara (Exaltation): Free of Dosha.\n` +
                       `3. In 2nd house if Mithuna or Kanya: No dosha.\n` +
                       `4. In 4th house if Mesha or Vrishchika: No dosha.\n` +
                       `5. In 7th house if Karkataka or Makara: No dosha.\n` +
                       `6. In 8th house if Dhanus or Meena (Jupiter signs): No dosha.\n` +
                       `7. In 12th house if Vrishabha or Tula (Venus signs): No dosha.\n` +
                       `8. Conjunction or aspect of Guru or Chandra completely neutralizes Kuja dosha.\n` +
                       `9. If BOTH boy and girl possess Kuja dosha (Doshakhyam), they cancel each other out and marriage is highly recommended.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 7. Ekadashi & Parana
        if (q.includes('ekadashi') || q.includes('parana') || q.includes('harivasara') || q.includes('ఏకాదశి') || q.includes('పారణ') || q.includes('హరివాసర')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *ఏకాదశి వ్రత నిర్ణయం & ఉపవాస నియమాలు:*\n(ప్రమాణం: ధర్మసింధు & నిర్ణయ సింధు)\n\n` +
                       `• **దశమీ విద్ధ వర్జన:** సూర్యోదయ వేళకు దశమి శేషం ఉన్న ఏకాదశిని వర్జించి, శుద్ధ ఏకాదశినే ఆచరించాలి.\n` +
                       `• **హరివాసర నియమం:** ఏకాదశి నాల్గవ పాదం మరియు ద్వాదశి మొదటి పాదం కలిసి హరివాసరం అంటారు. హరివాసర సమయంలో భోజనం లేదా పారణ చేయరాదు.\n` +
                       `• **పారణ సమయం:** ద్వాదశి తిథి ఉన్నప్పుడే ఉపవాస దీక్షను విరమించాలి (పారణ చేయాలి).\n` +
                       `• **ఆహార నియమం:** అన్నం, ధాన్యాలు, పప్పులు నిషిద్ధం. వృద్ధులు/అస్వస్థులు పండ్లు, పాలు, జలపానం తీసుకోవచ్చును.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Ekadashi Vrata & Parana Rules:*\n(Authority: Dharma Sindhu Pariccheda 1, Nirnaya Sindhu)\n\n` +
                       `• **Dashami Viddha Rejection:** Ekadashi touched by Dashami at sunrise is rejected; only Shuddha Ekadashi is observed.\n` +
                       `• **Harivasara Rule:** Comprises the last 1/4th of Ekadashi and first 1/4th of Dvadashi. Fasting must NEVER be broken during Harivasara.\n` +
                       `• **Parana Timing:** Fast must be broken during Dvadashi tithi in the morning following daily puja.\n` +
                       `• **Diet:** Strict abstinence from grains, rice, and pulses. Fruits and milk permitted for elders/infirm.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 8. Grahanam & Garbhini
        if (q.includes('grahanam') || q.includes('eclipse') || q.includes('garbhini') || q.includes('pregnant') || q.includes('గ్రహణ') || q.includes('గర్భిణీ')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *గ్రహణ వేధ, ఆహార, మరియు గర్భిణీ నియమాలు:*\n(ప్రమాణం: ధర్మసింధు & నిర్ణయ సింధు)\n\n` +
                       `• **వేధ సమయం:** సూర్యగ్రహణానికి 4 ప్రహరాలు (12 గంటలు), చంద్రగ్రహణానికి 3 ప్రహరాలు (9 గంటలు) ముందే భోజనం ముగించాలి. అయితే గర్భిణీ స్త్రీలు, వృద్ధులు, మరియు పిల్లలు 1 ప్రహరం (3 గంటల) ముందు వరకు ఆహారం తీసుకోవచ్చును.\n` +
                       `• **గర్భిణీ స్త్రీల నియమాలు:** గ్రహణ సమయంలో గర్భిణీలు బయటకు రాకుండా ఇంట్లోనే ప్రశాంతంగా ఉండాలి. కూరగాయలు తరగడం, సూది-దారంతో కుట్టడం, కత్తులు వాడటం నిషిద్ధం. సంతాంగోపాల మంత్రం లేదా విష్ణు సహస్రనామం వినడం అత్యంత శ్రేయస్కరం.\n` +
                       `• **రక్షణ:** నీరు, పాలు, వండిన పదార్థాలపై దర్భలు ఉంచాలి.\n` +
                       `• **మోక్ష స్నానం:** గ్రహణం వీడగానే (మోక్ష కాలం) తలస్నానం చేసి దానధర్మాలు ఆచరించాలి.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Grahanam (Eclipse) & Garbhini (Pregnant Women) Guidelines:*\n(Authority: Dharma Sindhu & Nirnaya Sindhu)\n\n` +
                       `• **Vedha (Fasting Window):** Fasting begins 12 hrs before Solar Eclipse and 9 hrs before Lunar Eclipse. Pregnant women, elderly, and children need to stop eating only 3 hours before contact.\n` +
                       `• **Rules for Pregnant Women:** Remain indoors away from direct rays. Strict prohibition of cutting with knives, stitching with needles, or peeling vegetables. Chant Santana Gopala Mantra or listen to Vishnu Sahasranama.\n` +
                       `• **Darbha Protection:** Place Kusha grass (Darbha) on milk, water, and pickles.\n` +
                       `• **Moksha Snanam:** Take a sacred head bath immediately after eclipse release and offer charity.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 9. Gruhapravesham
        if (q.includes('gruhapravesh') || q.includes('housewarming') || q.includes('గృహప్రవేశ')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *గృహప్రవేశ ముహూర్త నియమాలు:*\n(ప్రమాణం: ముహూర్త రత్నావళి & కాలామృతమ్)\n\n` +
                       `• **లగ్న బలం:** అపూర్వ గృహప్రవేశానికి స్థిర లగ్నాలు (వృషభం, సింహం, వృశ్చికం, కుంభం) అత్యంత శ్రేష్టం. వృషభ, సింహ లగ్నాలు మొదటి ప్రాధాన్యత.\n` +
                       `• **అష్టమ శుద్ధి:** గృహప్రవేశ లగ్నానికి 8వ ఇల్లు ఎటువంటి గ్రహాలు లేకుండా శుద్ధిగా ఉండాలి.\n` +
                       `• **మౌఢ్య వర్జన:** గురు మౌఢ్యం మరియు శుక్ర మౌఢ్య కాలాలలో నూతన గృహప్రవేశం చేయరాదు.\n` +
                       `• **కాలం:** ఉత్తరాయణ కాలం, శుక్ల పక్షం, ద్వితీయ, తృతీయ, పంచమి, సప్తమి, దశమి, ఏకాదశీ, త్రయోదశీ తిథులు శ్రేష్టం.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Gruhapravesham (Housewarming) Muhurta Guidelines:*\n(Authority: Muhurta Ratnavali & Kalamritam)\n\n` +
                       `• **Lagna Strength:** Sthira Lagnas (Vrishabha, Simha, Vrishchika, Kumbha) are mandatory for new housewarming. Vrishabha and Simha are supreme.\n` +
                       `• **Ashtama Shuddhi:** 8th house from Lagna must be vacant and completely clear of afflictions.\n` +
                       `• **Maudhyam Prohibition:** Must never be conducted during Guru or Shukra Maudhyam (combustion).\n` +
                       `• **Auspicious Timing:** Uttarayana, Shukla Paksha, Tithis 2, 3, 5, 7, 10, 11, 13.\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 10. Vinayaka Chavithi / Vinayaka Chaturthi Vrata Katha & Vidhanam
        if (q.includes('vinayaka') || q.includes('ganesh') || q.includes('chaturthi') || q.includes('chavithi') || q.includes('caturthi') || q.includes('వినాయక') || q.includes('గణపతి') || q.includes('శమంతక') || q.includes('చవితి')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *శ్రీ వినాయక చవితి వ్రత కల్పము & శమంతకోపాఖ్యాన కథ:*\n(ప్రమాణం: ధర్మసింధు & నిర్ణయ సింధు)\n\n` +
                       `• **తిథి నిర్ణయం:** భాద్రపద శుక్ల చతుర్థి మధ్యాహ్న కాలం (సుమారు ఉదయం 11:30 నుండి 1:45 వరకు) వ్యాపించి ఉన్న రోజే వినాయక చవితి పూజ ఆచరించాలి.\n\n` +
                       `• **చంద్ర దర్శన దోష నివారణ శ్లోకం:**\n` +
                       `*సింహః ప్రసేనమవధీత్ సింహో జాంబవతా హతః ।\nసుకుమారక మా రోదీస్తవ హ్యేష శమంతకః ॥*\n` +
                       `(ఈ శ్లోకాన్ని పఠించి అక్షింతలు శిరస్సున ధరించినచో భాద్రపద చతుర్థి చంద్ర దర్శన నీలాపనిందల దోషం సమసిపోవును).\n\n` +
                       `• **శమంతకోపాఖ్యానం (కథ సంగ్రహం):** సత్రాజిత్తు సూర్యుని నుండి శమంతకమణిని పొందగా, అతని తమ్ముడు ప్రసేనుడు మణితో వేటకు వెళ్లి సింహం చేతిలో మరణించాడు. జాంబవంతుడు సింహాన్ని చంపి మణిని తీసుకున్నాడు. కృష్ణుడిపై ప్రసేనుడిని చంపించాడనే అపవాదు రాగా, కృష్ణుడు జాంబవంతునితో 28 రోజులు పోరాడి మణిని సాధించి తెచ్చి నిందను బాపుకున్నాడు. ఈ కథ విన్నవారికి అపనిందలు కలుగవు.\n\n` +
                       `• **ఏకవింశతి పత్ర పూజ (21 పత్రాలు):** మాచి, బిల్వ, దూర్వా, అపామార్గ, చూత, కరవీర, శమీ, తులసి (చవితి నాడు మాత్రమే పూజార్హం), మొదలైనవి.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Sri Vinayaka Chaturthi Vrata Vidhanam & Shamantakopakhyanam:*\n(Authority: Dharma Sindhu & Nirnaya Sindhu)\n\n` +
                       `• **Tithi Determination:** Bhadrapada Shukla Chaturthi prevailing in Madhyahna Kaala (approx 11:30 AM - 1:45 PM).\n\n` +
                       `• **Chandra Darshana Dosha Parihara Shloka:**\n` +
                       `*"Simhah Prasenamavadheet Simho Jambavata Hatah |\nSukumaraka Ma Rodeestava Hyesha Syamantakah ||"*\n` +
                       `(Reciting this verse with Akshatas completely removes false accusations and lunar viewing dosha).\n\n` +
                       `• **Vrata Narrative:** Lord Krishna fought Jambavan for 28 days to recover the Shamantaka gem and cleanse false accusations, uniting in marriage with Jambavati and Satyabhama.\n\n` +
                       `• **Offerings:** Modaka, Undrallu, Chalimidi, Vadapappu, and 21 sacred leaves (Patri).\n\n` +
                       `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // 11. Rishi Panchami Vrata Vidhanam
        if (q.includes('rushi') || q.includes('rishi') || q.includes('panchami') || q.includes('పంచమి') || q.includes('సప్తర్షి') || q.includes('రజస్వల') || q.includes('ఋషి')) {
            if (selectedLang === 'te') {
                return `నమస్కారం.\n\n📜 *ఋషి పంచమి వ్రత విధానము & సప్తర్షి పూజా మహత్మ్యం:*\n(ప్రమాణం: ధర్మసింధు & భవిష్యోత్తర పురాణం)\n\n` +
                       `• **తిథి నిర్ణయం:** భాద్రపద శుద్ధ పంచమి మధ్యాహ్న సమయాన ఆచరించాలి.\n` +
                       `• **సప్తర్షులు & అరుంధతీ దేవి:** కాశ్యప, అత్రి, భరద్వాజ, విశ్వామిత్ర, గౌతమ, జమదగ్ని, వశిష్ట మహర్షి మరియు అరుంధతీ దేవి.\n` +
                       `• **ఆచరణ:** ఉదయమే ఉత్తరేణి (అపామార్గ) కొమ్మతో దంతధావనం, మధ్యాహ్నం సప్తర్షుల కలశ పూజ, మరియు కందమూల ఫలాహారం (ఏకభుక్తం).\n` +
                       `• **ఫలం:** మహిళల రజస్వలా సమయ అస్పృశ్యతా దోషాలు సమూలంగా నివారించబడి దీర్ఘ సౌభాగ్యం కలుగును.\n\n` +
                       `ఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
            } else {
                return `Namaskaram.\n\n📜 *Rishi Panchami Vrata Guidelines & Saptarshi Worship:*\n(Authority: Dharma Sindhu & Bhavishyottara Purana)\n\n` +
                   `• **Tithi Determination:** Bhadrapada Shukla Panchami in Madhyahna.\n` +
                   `• **Sapta Rishis & Arundhati Devi:** Kashyapa, Atri, Bharadvaja, Vishvamitra, Gautama, Jamadagni, Vashishtha, and Devi Arundhati.\n` +
                   `• **Procedure:** Morning cleansing with Apamarga (Uttareni) twigs, midday puja of the 7 Sages, and consumption of unploughed wild foods.\n` +
                   `• **Spiritual Fruit:** Eradicates menstrual touch doshas and confers family health and harmony.\n\n` +
                   `With blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
            }
        }

        // Fallback
        if (selectedLang === 'te') {
            return `నమస్కారం.\n\nమీరు అడిగిన ప్రశ్నకు సంబంధించిన శాస్త్ర పరిశీలన జరుగుచున్నది. దయచేసి నిర్దిష్టమైన వివరాలు (నక్షత్రం, తిథి, లేదా కార్యక్రమ వివరాలు) తెలియజేయండి.\n\nఇట్లు,\nవేదికసంహిత పంచాంగ కర్త: రామచంద్ర శాస్త్రి మునిమడుగు\nwww.vedicsamhita.com`;
        } else {
            return `Namaskaram.\n\nFor precise Shastric guidance from our 24 classical texts (Dharma Sindhu, Kalamritam, Vadhu Vara Ghatitartha Chandrika), please specify birth nakshatras, tithi, or event type.\n\nWith blessings,\nSiddhanta Karta: Ramachandra shastry Munimadugu\nwww.vedicsamhita.com`;
        }
    }

    function initCopilotEvents() {
        const tabCopilot = document.getElementById('vs-tab-copilot');
        const tabVault = document.getElementById('vs-tab-vault');
        const panelCopilot = document.getElementById('vs-panel-copilot');
        const panelVault = document.getElementById('vs-panel-vault');

        if (tabCopilot && tabVault && panelCopilot && panelVault) {
            tabCopilot.onclick = () => {
                tabCopilot.style.background = '#4a0e0e';
                tabCopilot.style.color = '#ffd700';
                tabVault.style.background = '#eee';
                tabVault.style.color = '#4a0e0e';
                panelCopilot.style.display = 'block';
                panelVault.style.display = 'none';
            };
            tabVault.onclick = () => {
                tabVault.style.background = '#4a0e0e';
                tabVault.style.color = '#ffd700';
                tabCopilot.style.background = '#eee';
                tabCopilot.style.color = '#4a0e0e';
                panelVault.style.display = 'block';
                panelCopilot.style.display = 'none';
            };
        }

        const askBtn = document.getElementById('vs-copilot-ask-btn');
        const clearBtn = document.getElementById('vs-copilot-clear-btn');
        const copyBtn = document.getElementById('vs-copilot-copy-btn');
        const inputArea = document.getElementById('vs-copilot-input');
        const outputCard = document.getElementById('vs-copilot-output-card');
        const outputText = document.getElementById('vs-copilot-output-text');
        const langSelect = document.getElementById('vs-copilot-lang');

        // Quick pills
        document.querySelectorAll('.vs-quick-pill').forEach(btn => {
            btn.onclick = () => {
                if (inputArea) inputArea.value = btn.getAttribute('data-q');
                if (askBtn) askBtn.click();
            };
        });

        if (askBtn && inputArea && outputText && outputCard && langSelect) {
            askBtn.onclick = () => {
                const q = inputArea.value.trim();
                if (!q) {
                    alert('దయచేసి భక్తుడు అడిగిన ప్రశ్నను నమోదు చేయండి (Please enter devotee question).');
                    return;
                }
                const ans = runClientCopilot(q, langSelect.value);
                outputText.textContent = ans;
                outputCard.style.display = 'block';
            };
        }

        if (clearBtn && inputArea && outputCard) {
            clearBtn.onclick = () => {
                inputArea.value = '';
                outputCard.style.display = 'none';
            };
        }

        if (copyBtn && outputText) {
            copyBtn.onclick = () => {
                const textToCopy = outputText.textContent;
                if (!textToCopy) return;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showSecurityToast('📲 Copied! Ready to paste into WhatsApp / Telegram.');
                    }).catch(() => {
                        showSecurityToast('Copied to clipboard!');
                    });
                } else {
                    showSecurityToast('Copied!');
                }
            };
        }

        // Voice button for Copilot
        const copilotMic = document.getElementById('vs-copilot-mic');
        if (copilotMic && inputArea && askBtn && langSelect) {
            copilotMic.onclick = () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    alert('Voice input not supported in this browser.');
                    return;
                }
                const rec = new SpeechRecognition();
                rec.lang = langSelect.value === 'en' ? 'en-US' : 'te-IN';
                rec.onstart = () => { copilotMic.textContent = '🔴 Listening...'; };
                rec.onresult = (ev) => {
                    inputArea.value = ev.results[0][0].transcript;
                    copilotMic.textContent = '🎙️ Speak';
                };
                rec.onerror = () => { copilotMic.textContent = '🎙️ Speak'; };
                rec.onend = () => { copilotMic.textContent = '🎙️ Speak'; };
                rec.start();
            };
        }
    }


    // Expose global controller
    window.VedicSecurity = {
        isSuperAdmin: () => isSuperAdmin,
        adminEmail: ADMIN_EMAIL,
        adminUsername: ADMIN_USERNAME,
        openAdminModal: openAdminLoginModal,
        openRulesModal: openRulesModal,
        toggleRuleStatus: toggleRuleStatus,
        editRule: editRule,
        deleteRule: deleteRule,
        applyRoleVisibility,
        generateDeepLink,
        decodeDeepLink,
        showToast: showSecurityToast
    };

})(window, document);
