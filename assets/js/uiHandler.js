// assets/js/uiHandler.js
import CONFIG from './config.js';

class UIHandler {
    constructor() {
        this.warningContainer = null;
        this.statusContainer = null;
        this.activeWarnings = new Set();
        this.warningTimeout = null;
    }

    initialize() {
        this.createUIElements();
        this.setupEventListeners();
    }

    createUIElements() {
        // Create warning container
        this.warningContainer = document.createElement('div');
        this.warningContainer.className = 'warning-container';
        document.body.appendChild(this.warningContainer);

        // Create status container
        this.statusContainer = document.createElement('div');
        this.statusContainer.className = 'status-container';
        document.body.appendChild(this.statusContainer);

        // Create loading overlay
        this.createLoadingOverlay();
    }

    createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay hidden';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">Loading...</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    showWarning(message, type = 'warning', duration = 5000) {
        const warningId = Date.now();
        const warningElement = document.createElement('div');
        warningElement.className = `warning-message ${type}`;
        warningElement.innerHTML = `
            <span class="warning-text">${message}</span>
            <button class="warning-close">&times;</button>
        `;

        // Add close button functionality
        warningElement.querySelector('.warning-close').addEventListener('click', () => {
            this.removeWarning(warningId);
        });

        this.warningContainer.appendChild(warningElement);
        this.activeWarnings.add(warningId);

        // Auto remove after duration
        setTimeout(() => {
            this.removeWarning(warningId);
        }, duration);

        return warningId;
    }

    removeWarning(warningId) {
        if (this.activeWarnings.has(warningId)) {
            const warnings = this.warningContainer.children;
            for (let i = 0; i < warnings.length; i++) {
                if (warnings[i].dataset.warningId === warningId.toString()) {
                    warnings[i].remove();
                    break;
                }
            }
            this.activeWarnings.delete(warningId);
        }
    }

    // Lanjutan assets/js/uiHandler.js

    showStatus(message, type = 'info', duration = 3000) {
        const statusElement = document.createElement('div');
        statusElement.className = `status-message ${type}`;
        statusElement.textContent = message;

        this.statusContainer.appendChild(statusElement);

        // Animate in
        requestAnimationFrame(() => {
            statusElement.classList.add('show');
        });

        // Auto remove after duration
        setTimeout(() => {
            statusElement.classList.remove('show');
            setTimeout(() => {
                statusElement.remove();
            }, 300); // Match CSS transition duration
        }, duration);
    }

    showLoading(message = 'Loading...') {
        const overlay = document.querySelector('.loading-overlay');
        const messageElement = overlay.querySelector('.loading-message');
        messageElement.textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        overlay.classList.add('hidden');
    }

    updateTimer(timeLeft) {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Add warning class when time is running low
        if (minutes <= CONFIG.TIMER.WARNING_TIME) {
            timerElement.classList.add('warning');
            if (!timerElement.dataset.warningShown) {
                this.showWarning(CONFIG.MESSAGES.WARNING.TIME_WARNING.replace('{minutes}', CONFIG.TIMER.WARNING_TIME));
                timerElement.dataset.warningShown = 'true';
            }
        }
    }

    setupEventListeners() {
        // Listen for auto-save events
        document.addEventListener('autoSave', (event) => {
            const { success, timestamp } = event.detail;
            if (success) {
                this.showStatus(CONFIG.MESSAGES.SUCCESS.SAVE, 'success');
            }
        });

        // Listen for network status changes
        document.addEventListener('networkStatus', (event) => {
            const { status, message } = event.detail;
            this.showStatus(message, status === 'online' ? 'success' : 'error');
        });

        // Listen for submission events
        document.addEventListener('submissionStart', () => {
            this.showLoading('Submitting exam...');
        });

        document.addEventListener('submissionComplete', (event) => {
            this.hideLoading();
            const { success, error } = event.detail;
            if (!success) {
                this.showWarning(error || CONFIG.MESSAGES.ERROR.SUBMIT, 'error');
            }
        });
    }

    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-message">${message}</div>
                    <div class="modal-buttons">
                        <button class="btn-primary" data-action="confirm">
                            ${options.confirmText || 'Yes'}
                        </button>
                        <button class="btn-secondary" data-action="cancel">
                            ${options.cancelText || 'No'}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    modal.remove();
                    resolve(action === 'confirm');
                }
            });
        });
    }
}

export default new UIHandler();