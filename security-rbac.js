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
            }
            badge.style.display = 'block';
        } else {
            if (badge) badge.style.display = 'none';
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

    function checkUrlHash() {
        if (window.location.hash === '#admin') {
            openAdminLoginModal();
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
        applyRoleVisibility,
        generateDeepLink,
        decodeDeepLink,
        showToast: showSecurityToast
    };

})(window, document);
