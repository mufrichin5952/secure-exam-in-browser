// tests/unit/ui.test.js
import uiHandler from '../../assets/js/uiHandler';

describe('UI Handler Tests', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        // Create required elements
        document.body.innerHTML = `
            <div id="timer"></div>
            <div class="status-container"></div>
            <div class="warning-container"></div>
            <div class="loading-overlay hidden"></div>
        `;
    });

    test('should show warning message', () => {
        const warningMessage = 'Test Warning';
        const warningId = uiHandler.showWarning(warningMessage, 'warning');
        
        const warningElement = document.querySelector('.warning-message');
        expect(warningElement).not.toBeNull();
        expect(warningElement.textContent).toContain(warningMessage);
        expect(uiHandler.activeWarnings.has(warningId)).toBe(true);
    });

    test('should remove warning message', () => {
        const warningId = uiHandler.showWarning('Test Warning');
        uiHandler.removeWarning(warningId);
        
        const warningElement = document.querySelector('.warning-message');
        expect(warningElement).toBeNull();
        expect(uiHandler.activeWarnings.has(warningId)).toBe(false);
    });

    test('should show and hide loading overlay', () => {
        const loadingMessage = 'Loading Test';
        uiHandler.showLoading(loadingMessage);
        
        const overlay = document.querySelector('.loading-overlay');
        const messageElement = overlay.querySelector('.loading-message');
        
        expect(overlay.classList.contains('hidden')).toBe(false);
        expect(messageElement.textContent).toBe(loadingMessage);
        
        uiHandler.hideLoading();
        expect(overlay.classList.contains('hidden')).toBe(true);
    });

    test('should update timer display', () => {
        const timeLeft = 300000; // 5 minutes in milliseconds
        uiHandler.updateTimer(timeLeft);
        
        const timerElement = document.getElementById('timer');
        expect(timerElement.textContent).toBe('5:00');
    });

    test('should show warning when time is low', () => {
        const lowTime = 240000; // 4 minutes
        uiHandler.updateTimer(lowTime);
        
        const timerElement = document.getElementById('timer');
        expect(timerElement.classList.contains('warning')).toBe(true);
    });

    test('should show status message', () => {
        const statusMessage = 'Test Status';
        uiHandler.showStatus(statusMessage, 'success');
        
        const statusElement = document.querySelector('.status-message');
        expect(statusElement).not.toBeNull();
        expect(statusElement.textContent).toBe(statusMessage);
        expect(statusElement.classList.contains('success')).toBe(true);
    });

    test('should handle confirmation dialog', async () => {
        const confirmResult = uiHandler.confirm('Test Confirmation');
        
        const modalElement = document.querySelector('.modal-overlay');
        expect(modalElement).not.toBeNull();
        
        // Simulate confirm click
        const confirmButton = modalElement.querySelector('[data-action="confirm"]');
        confirmButton.click();
        
        const result = await confirmResult;
        expect(result).toBe(true);
    });
});