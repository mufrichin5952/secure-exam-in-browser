// tests/unit/events.test.js
import eventManager from '../../assets/js/eventManager';
import formHandler from '../../assets/js/formHandler';
import examSecurity from '../../assets/js/security';
import uiHandler from '../../assets/js/uiHandler';

// Mock dependencies
jest.mock('../../assets/js/formHandler');
jest.mock('../../assets/js/security');
jest.mock('../../assets/js/uiHandler');

describe('Event Manager Tests', () => {
    beforeEach(() => {
        // Reset mocks and storage
        jest.clearAllMocks();
        sessionStorage.clear();
        
        // Setup session data
        sessionStorage.setItem('examToken', 'TEST123');
        sessionStorage.setItem('formUrl', 'https://test.com/form');
        sessionStorage.setItem('duration', '60');
    });

    test('should initialize exam environment', () => {
        eventManager.initialize();
        
        expect(uiHandler.initialize).toHaveBeenCalled();
        expect(formHandler.initialize).toHaveBeenCalled();
        expect(examSecurity.initialize).toHaveBeenCalled();
    });

    test('should handle security violations', async () => {
        eventManager.initialize();
        
        const securityEvent = new CustomEvent('securityViolation', {
            detail: {
                type: 'TAB_SWITCH',
                details: 'Tab switching detected',
                severity: 'HIGH'
            }
        });
        
        document.dispatchEvent(securityEvent);
        
        expect(examSecurity.logViolation).toHaveBeenCalledWith(
            'TAB_SWITCH',
            'Tab switching detected'
        );
        expect(uiHandler.showWarning).toHaveBeenCalled();
    });

    test('should handle exam timer', () => {
        jest.useFakeTimers();
        eventManager.initialize();
        
        // Fast forward 1 minute
        jest.advanceTimersByTime(60000);
        
        expect(uiHandler.updateTimer).toHaveBeenCalled();
        jest.useRealTimers();
    });

    test('should handle exam submission', async () => {
        eventManager.initialize();
        
        const submissionEvent = new CustomEvent('submissionStart');
        document.dispatchEvent(submissionEvent);
        
        expect(eventManager.examActive).toBe(false);
        expect(formHandler.handleSubmission).toHaveBeenCalled();
    });

    test('should cleanup on completion', () => {
        eventManager.initialize();
        eventManager.cleanup();
        
        expect(formHandler.destroy).toHaveBeenCalled();
    });
});