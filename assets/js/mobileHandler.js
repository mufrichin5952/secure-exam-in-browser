// assets/js/mobileHandler.js
import CONFIG from './config.js';
import examSecurity from './security.js';
import uiHandler from './uiHandler.js';

class MobileHandler {
    constructor() {
        this.touchStartX = null;
        this.touchStartY = null;
        this.isPortrait = window.innerHeight > window.innerWidth;
        this.orientationWarning = null;
    }

    initialize() {
        this.createOrientationWarning();
        this.setupEventListeners();
        this.checkOrientation();
        this.setupTouchHandling();
    }

    createOrientationWarning() {
        this.orientationWarning = document.createElement('div');
        this.orientationWarning.className = 'orientation-warning hidden';
        this.orientationWarning.innerHTML = `
            <div class="warning-content">
                <div class="warning-icon">📱</div>
                <h2>Please Rotate Your Device</h2>
                <p>This exam must be taken in portrait mode.</p>
            </div>
        `;
        document.body.appendChild(this.orientationWarning);
    }

    setupEventListeners() {
        // Orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkOrientation(), 100);
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.isPortrait = window.innerHeight > window.innerWidth;
            this.checkOrientation();
        });

        // Handle screen orientation lock
        if (screen.orientation) {
            try {
                screen.orientation.lock('portrait').catch(() => {
                    console.log('Orientation lock not supported');
                });
            } catch (error) {
                console.log('Orientation API not supported');
            }
        }
    }

    setupTouchHandling() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // Detect swipe gestures
            if (Math.abs(deltaX) > 100 || Math.abs(deltaY) > 100) {
                examSecurity.logViolation('SWIPE_GESTURE', 'Suspicious swipe gesture detected');
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            this.touchStartX = null;
            this.touchStartY = null;
        }, { passive: true });

        // Prevent pinch zoom
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
            examSecurity.logViolation('ZOOM_ATTEMPT', 'Pinch zoom attempted');
        }, { passive: false });
    }

    checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (!isPortrait) {
            this.orientationWarning.classList.remove('hidden');
            examSecurity.logViolation('WRONG_ORIENTATION', 'Landscape orientation detected');
            return false;
        } else {
            this.orientationWarning.classList.add('hidden');
            return true;
        }
    }

    // Mobile-specific security checks
    checkMobileEnvironment() {
        // Check for mobile debugging tools
        if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' ||
            typeof window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
            examSecurity.logViolation('MOBILE_DEVTOOLS', 'Mobile dev tools detected');
        }

        // Check for WebView
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('wv') || userAgent.includes('webview')) {
            examSecurity.logViolation('WEBVIEW_DETECTED', 'WebView environment detected');
        }

        // Check for mobile automation frameworks
        if (window.appium || window.calabash) {
            examSecurity.logViolation('MOBILE_AUTOMATION', 'Mobile automation framework detected');
        }
    }

    // Handle mobile back button
    setupBackButtonPrevention() {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', () => {
            window.history.pushState(null, null, window.location.href);
            uiHandler.showWarning('Back button is disabled during exam', 'warning');
        });
    }
}

export default new MobileHandler();