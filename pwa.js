// Vedic Samhita PWA Installation & Service Worker Manager
(function() {
    let deferredPrompt = null;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => {
                    console.log('✅ Vedic Samhita PWA Service Worker Registered:', reg.scope);
                })
                .catch(err => {
                    console.warn('⚠️ Service Worker Registration failed:', err);
                });
        });
    }

    // 2. Capture PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallUi();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.style.display = 'none';
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.style.display = 'none';
        console.log('🎉 Vedic Samhita App was successfully installed!');
    });

    function isIos() {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    }

    function isInStandaloneMode() {
        return ('standalone' in window.navigator && window.navigator.standalone) || (window.matchMedia('(display-mode: standalone)').matches);
    }

    function showInstallUi() {
        if (isInStandaloneMode()) return;

        let banner = document.getElementById('pwaInstallBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'pwaInstallBanner';
            banner.style.cssText = 'position:fixed; bottom:16px; left:50%; transform:translateX(-50%); z-index:99999; background:linear-gradient(135deg, #161b22, #0d1117); border:1.5px solid #d4af37; border-radius:30px; padding:8px 18px; box-shadow:0 8px 24px rgba(0,0,0,0.6); display:flex; align-items:center; gap:12px; font-family:"Inter",sans-serif; animation:slideUp 0.4s ease-out;';
            banner.innerHTML = `
                <img src="logo.jpg" style="width:28px; height:28px; border-radius:50%; border:1px solid #d4af37;" alt="Logo">
                <span style="color:#ffffff; font-size:13px; font-weight:600;">వేదిక్ సంహిత మొబైల్ యాప్</span>
                <button id="pwaInstallBtnTrigger" style="background:#d4af37; color:#1a0f00; border:none; border-radius:20px; padding:6px 14px; font-size:12px; font-weight:bold; cursor:pointer;">📲 ఇన్‌స్టాల్ (Install)</button>
                <button id="pwaCloseBanner" style="background:transparent; color:#8b949e; border:none; font-size:16px; cursor:pointer; padding:0 4px;">✕</button>
            `;
            document.body.appendChild(banner);

            document.getElementById('pwaInstallBtnTrigger').addEventListener('click', triggerInstall);
            document.getElementById('pwaCloseBanner').addEventListener('click', () => {
                banner.style.display = 'none';
            });
        } else {
            banner.style.display = 'flex';
        }
    }

    window.triggerPwaInstall = function() {
        triggerInstall();
    };

    function triggerInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the PWA install prompt');
                } else {
                    console.log('User dismissed the PWA install prompt');
                }
                deferredPrompt = null;
            });
        } else if (isIos()) {
            alert('🍎 iPhone / iPad లో యాప్ ఇన్‌స్టాల్ చేయడానికి:\n\n1. క్రింద ఉన్న Share బటన్ [ ⎋ ] పై నొక్కండి.\n2. జాబితాలో క్రిందికి స్క్రోల్ చేసి "Add to Home Screen" (హోమ్ స్క్రీన్‌కు జోడించు) ఎంచుకోండి.\n3. పైన కుడివైపున "Add" పై నొక్కండి.');
        } else {
            alert('📱 యాప్ ఇన్‌స్టాల్ చేయడానికి:\n\nబ్రౌజర్ పైన కుడివైపున ఉన్న 3 చుక్కలు (⋮ Menu) పై నొక్కి "Install App" లేదా "Add to Home screen" ఎంచుకోండి!');
        }
    }

    // Auto-check on load for iOS helper or general install button
    window.addEventListener('DOMContentLoaded', () => {
        if (!isInStandaloneMode()) {
            // Show install button in nav if exists
            const navBtn = document.getElementById('navInstallBtn');
            if (navBtn) navBtn.style.display = 'inline-flex';
        }
    });
})();
