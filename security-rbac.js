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
                        font-family: 'Cinzel', 'Mandali', serif;
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
            id: 'rule-seed-1',
            timestamp: '2026-09-04T18:45:00.000Z',
            category: 'festival',
            title: 'Masa Anaghashtami & Margashira Pradhana Anaghashtami',
            body: 'Every Krishna Paksha Ashtami is Masa Anaghashtami Vratam for Lord Dattatreya Swamy and Sri Anagha Devi (Anagha Lakshmi). Margashira Krishna Ashtami is the Pradhana Anaghashtami of the year.',
            reference: 'Brahmanda Purana (Dattatreya Samhita)',
            status: 'applied'
        },
        {
            id: 'rule-seed-2',
            timestamp: '2026-09-04T18:55:00.000Z',
            category: 'festival',
            title: 'Kanchi Jagadguru Aradhana (50th Acharya)',
            body: 'Kanchi Kamakoti Peetham 50th Acharya Pujyasri Chandrachudendra Saraswati I Aradhana on Shravana Krishna Ashtami.',
            reference: 'Kanchi Matha Guru Parampara Charitra',
            status: 'applied'
        },
        {
            id: 'rule-seed-3',
            timestamp: '2026-09-04T18:55:00.000Z',
            category: 'festival',
            title: 'Emperor Sri Krishnadevaraya Rajyabhishekam',
            body: 'Historical coronation of Sri Krishnadevaraya took place on Sri Krishna Janmashtami (Shravana Krishna Ashtami) in 1509 CE.',
            reference: 'Vijayanagara Epigraphica & Temple Records',
            status: 'applied'
        },
        {
            id: 'rule-seed-4',
            timestamp: '2026-09-04T19:00:00.000Z',
            category: 'graha',
            title: 'Budha Maudhyam (Mercury Combustion) Surya Siddhanta 14° Limit',
            body: 'Surya Siddhanta VII.13-14 strictly sets 14° for direct Mercury and 12° for retrograde Mercury. Atichara motion uses 12° threshold in reference panchangams.',
            reference: 'Surya Siddhanta VII.13-14 & Muhurta Chintamani',
            status: 'applied'
        }
    ];

    function getStoredRules() {
        try {
            const raw = localStorage.getItem(RULES_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RULES));
                return INITIAL_SEED_RULES;
            }
            return JSON.parse(raw) || [];
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
            font-family: 'EB Garamond', 'Mandali', serif;
            backdrop-filter: blur(4px);
        `;

        modal.innerHTML = `
            <div style="background:#FFFDF5; border:2px solid #d4a853; border-radius:12px; padding:20px; max-width:580px; width:92%; max-height:90vh; overflow-y:auto; position:relative; box-shadow:0 12px 35px rgba(0,0,0,0.6); box-sizing:border-box;">
                <button id="vs-rules-close" style="position:absolute; top:12px; right:15px; background:none; border:none; font-size:22px; cursor:pointer; color:#4a0e0e; font-weight:bold;">✕</button>
                
                <div style="text-align:center; margin-bottom:14px; border-bottom:1.5px solid #d4a853; padding-bottom:8px;">
                    <h3 style="font-family:'Cinzel',serif; color:#4a0e0e; margin:0; font-size:1.25rem;">📝 Super Admin Rules & AI Brain Intake</h3>
                    <p style="font-size:12px; color:#6b5b4e; margin:3px 0 0;">సూపర్‌ అడ్మిన్ సిద్ధాంత నియమాలు & నోట్స్ — మొబైల్ వాయిస్ / టెక్స్ట్ ఇన్టేక్</p>
                </div>

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
                    <h4 style="margin:0; font-family:'Cinzel',serif; color:#4a0e0e; font-size:14px;">
                        📚 Logged Rules & Brain Notes (<span id="vs-rules-count">0</span>)
                    </h4>
                    <div style="display:flex; gap:6px;">
                        <button id="vs-rules-copy-ai-btn" style="background:#1B5E20; color:#fff; border:none; border-radius:4px; padding:5px 10px; font-size:11px; font-weight:bold; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Copy all pending notes formatted for AI assistant chat">
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

    function handleAddRule() {
        const cat = document.getElementById('vs-rule-cat').value;
        const title = document.getElementById('vs-rule-title').value.trim();
        const body = document.getElementById('vs-rule-body').value.trim();
        const ref = document.getElementById('vs-rule-ref').value.trim();

        if (!title && !body) {
            alert('దయచేసి శీర్షిక లేదా వివరాలను నమోదు చేయండి (Please enter a rule title or details).');
            return;
        }

        const newRule = {
            id: 'rule-' + Date.now(),
            timestamp: new Date().toISOString(),
            category: cat,
            title: title || 'Custom Siddhanta Rule',
            body: body,
            reference: ref || 'Siddhanta Tradition',
            status: 'pending'
        };

        const list = getStoredRules();
        list.unshift(newRule);
        saveStoredRules(list);

        resetRuleForm();
        renderRulesList();
        showSecurityToast('✅ Rule saved to AI Brain! Ready to sync.');
    }

    function resetRuleForm() {
        document.getElementById('vs-rule-title').value = '';
        document.getElementById('vs-rule-body').value = '';
        document.getElementById('vs-rule-ref').value = '';
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

            return `
                <div style="background:#fff; border:1px solid ${isApplied ? '#c3e6cb' : '#ffeeba'}; border-left:4px solid ${statusColor}; border-radius:6px; padding:10px; font-size:12.5px; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                        <div>
                            <strong style="color:#4a0e0e; font-size:13.5px;">${icon} ${escapeHtml(r.title)}</strong>
                            <div style="font-size:11px; color:#777; margin:2px 0;">${dateStr} | <em>${escapeHtml(r.reference || 'Custom')}</em></div>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <button onclick="window.VedicSecurity.toggleRuleStatus('${r.id}')" style="background:${statusColor}; color:#fff; border:none; border-radius:12px; padding:2px 8px; font-size:10.5px; cursor:pointer; font-weight:bold;" title="Click to toggle status">
                                ${statusLabel}
                            </button>
                            <button onclick="window.VedicSecurity.deleteRule('${r.id}')" style="background:none; border:none; color:#c00; font-size:14px; cursor:pointer; padding:0 3px;" title="Delete rule">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div style="margin-top:6px; color:#2d1810; line-height:1.4; white-space:pre-wrap;">${escapeHtml(r.body)}</div>
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

    // Expose global controller
    window.VedicSecurity = {
        isSuperAdmin: () => isSuperAdmin,
        adminEmail: ADMIN_EMAIL,
        adminUsername: ADMIN_USERNAME,
        openAdminModal: openAdminLoginModal,
        openRulesModal: openRulesModal,
        toggleRuleStatus: toggleRuleStatus,
        deleteRule: deleteRule,
        applyRoleVisibility,
        generateDeepLink,
        decodeDeepLink,
        showToast: showSecurityToast
    };

})(window, document);
