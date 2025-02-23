// tests/unit/mobile.test.js
import mobileHandler from '../../assets/js/mobileHandler';
import examSecurity from '../../assets/js/security';

jest.mock('../../assets/js/security');

describe('Mobile Handler Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        // Reset orientation
        global.screen = {
            orientation: {
                lock: jest.fn().mockResolvedValue(undefined),
                type: 'portrait-primary'
            }
        };
        // Reset window dimensions
        global.innerWidth = 375;
        global.innerHeight = 667;
    });

    test('should initialize mobile handler', () => {
        mobileHandler.initialize();
        expect(document.querySelector('.orientation-warning')).not.toBeNull();
    });

    test('should detect landscape orientation', () => {
        // Simulate landscape
        global.innerWidth = 667;
        global.innerHeight = 375;
        
        const result = mobileHandler.checkOrientation();
        expect(result).toBe(false);
        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'WRONG_ORIENTATION',
            'Landscape orientation detected'
        );
    });

    test('should handle touch events', () => {
        mobileHandler.initialize();

        // Simulate touch start
        const touchStartEvent = new TouchEvent('touchstart', {
            touches: [{ clientX: 0, clientY: 0 }]
        });
        document.dispatchEvent(touchStartEvent);

        // Simulate touch move (swipe)
        const touchMoveEvent = new TouchEvent('touchmove', {
            touches: [{ clientX: 200, clientY: 0 }]
        });
        document.dispatchEvent(touchMoveEvent);

        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'SWIPE_GESTURE',
            'Suspicious swipe gesture detected'
        );
    });

    test('should prevent zoom gestures', () => {
        mobileHandler.initialize();
        
        const gestureEvent = new Event('gesturestart');
        const preventDefault = jest.fn();
        gestureEvent.preventDefault = preventDefault;
        
        document.dispatchEvent(gestureEvent);
        
        expect(preventDefault).toHaveBeenCalled();
        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'ZOOM_ATTEMPT',
            'Pinch zoom attempted'
        );
    });

    test('should check mobile environment', () => {
        // Simulate dev tools
        global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};
        
        mobileHandler.checkMobileEnvironment();
        
        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'MOBILE_DEVTOOLS',
            'Mobile dev tools detected'
        );
    });

    test('should handle back button prevention', () => {
        mobileHandler.setupBackButtonPrevention();
        
        // Simulate back button
        const popStateEvent = new Event('popstate');
        window.dispatchEvent(popStateEvent);
        
        expect(window.history.pushState).toHaveBeenCalled();
    });

    test('should lock screen orientation', async () => {
        await mobileHandler.initialize();
        expect(screen.orientation.lock).toHaveBeenCalledWith('portrait');
    });

    test('should detect WebView environment', () => {
        // Simulate WebView user agent
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 wv Android',
            writable: true
        });
        
        mobileHandler.checkMobileEnvironment();
        
        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'WEBVIEW_DETECTED',
            'WebView environment detected'
        );
    });
});