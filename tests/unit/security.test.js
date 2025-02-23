// tests/unit/security.test.js
import examSecurity from '../../assets/js/security';

describe('Exam Security Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        // Reset mocks
        jest.clearAllMocks();
    });

    test('should detect tab switching', () => {
        const logViolationSpy = jest.spyOn(examSecurity, 'logViolation');
        
        // Simulate tab switch
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => true
        });
        
        document.dispatchEvent(new Event('visibilitychange'));
        
        expect(logViolationSpy).toHaveBeenCalledWith(
            'TAB_SWITCH',
            'Tab switching detected'
        );
    });

    test('should enforce fullscreen', async () => {
        const mockRequestFullscreen = jest.fn().mockResolvedValue();
        Object.defineProperty(document.documentElement, 'requestFullscreen', {
            value: mockRequestFullscreen
        });

        await examSecurity.requestFullscreen();
        
        expect(mockRequestFullscreen).toHaveBeenCalled();
        expect(examSecurity.isFullscreen).toBe(true);
    });

    test('should prevent copy-paste', () => {
        const logViolationSpy = jest.spyOn(examSecurity, 'logViolation');
        
        // Simulate copy attempt
        document.dispatchEvent(new Event('copy'));
        
        expect(logViolationSpy).toHaveBeenCalledWith(
            'COPY_PASTE',
            'Copy attempted'
        );
    });
});