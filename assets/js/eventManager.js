// assets/js/eventManager.js
import CONFIG from './config.js';
import formHandler from './formHandler.js';
import networkMonitor from './networkMonitor.js';
import examSecurity from './security.js';
import uiHandler from './uiHandler.js';
import cacheHandler from './cacheHandler.js';
import mobileHandler from './mobileHandler.js';

class EventManager {
    constructor() {
        this.initialized = false;
        this.examActive = false;
        this.examTimer = null;
    }

    initialize() {
        if (this.initialized) return;
        
        try {
            // Initialize all components
            uiHandler.initialize();
            networkMonitor.initialize();
            this.setupExamEnvironment();
            this.attachEventListeners();
            //Tambahkan mobile handler initialization di sini
            if(/Mobi|Android/i.test(navigator.userAgent)){
                mobileHandler.initialize();
                mobileHandler.checkMobileEnvironment();
                mobileHandler.setupBackButtonPrevention();
            }
            this.initialized = true;
        } catch (error) {
            console.error('Event Manager initialization failed:', error);
            uiHandler.showWarning('Failed to initialize exam environment', 'error');
        }
    }

    async setupExamEnvironment() {
        try {
            // Validate session
            const token = sessionStorage.getItem('examToken');
            const formUrl = sessionStorage.getItem('formUrl');
            const duration = parseInt(sessionStorage.getItem('duration'));

            if (!token || !formUrl || !duration) {
                window.location.href = 'index.html';
                return;
            }

            // Initialize form handler
            const formFrame = document.getElementById('examForm');
            if (formFrame) {
                formHandler.initialize(formFrame);
            }

            // Start exam security
            await examSecurity.initialize();

            // Start exam timer
            this.startExamTimer(duration);
            
            this.examActive = true;
        } catch (error) {
            console.error('Exam environment setup failed:', error);
            throw error;
        }
    }

    startExamTimer(duration) {
        const endTime = new Date(Date.now() + duration * 60000);
        
        this.examTimer = setInterval(() => {
            const timeLeft = endTime - Date.now();
            
            if (timeLeft <= 0) {
                this.handleTimeUp();
                return;
            }

            uiHandler.updateTimer(timeLeft);
        }, CONFIG.TIMER.CHECK_INTERVAL);
    }

    // Lanjutan assets/js/eventManager.js

    attachEventListeners() {
        // Window events
        window.addEventListener('beforeunload', (e) => {
            if (this.examActive && !formHandler.isSubmitting) {
                e.preventDefault();
                e.returnValue = CONFIG.MESSAGES.WARNING.EXIT_ATTEMPT;
            }
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.examActive) {
                examSecurity.logViolation('TAB_SWITCH', 'Tab switched during exam');
            }
        });

        // Network status events
        document.addEventListener('networkStatus', (event) => {
            const { status } = event.detail;
            if (status === 'offline' && this.examActive) {
                this.handleNetworkIssue();
            }
        });

        // Form submission events
        document.addEventListener('submissionStart', () => {
            this.examActive = false;
            this.cleanup();
        });

        document.addEventListener('submissionComplete', (event) => {
            if (!event.detail.success) {
                this.examActive = true;
            }
        });

        // Security violation events
        document.addEventListener('securityViolation', async (event) => {
            const { type, details, severity } = event.detail;
            await this.handleSecurityViolation(type, details, severity);
        });
    }

    async handleSecurityViolation(type, details, severity) {
        switch(severity) {
            case 'HIGH':
                await this.handleHighSeverityViolation(type, details);
                break;
            case 'MEDIUM':
                await this.handleMediumSeverityViolation(type, details);
                break;
            case 'LOW':
                await this.handleLowSeverityViolation(type, details);
                break;
        }
    }

    async handleHighSeverityViolation(type, details) {
        // Log violation and show warning
        await examSecurity.logViolation(type, details);
        uiHandler.showWarning(CONFIG.MESSAGES.WARNING[type] || details, 'error');

        // For critical violations, confirm with user before submitting
        const shouldSubmit = await uiHandler.confirm(
            'Critical security violation detected. Your exam will be submitted now.',
            { confirmText: 'OK', cancelText: 'Cancel' }
        );

        if (shouldSubmit) {
            await formHandler.handleSubmission();
        }
    }

    async handleMediumSeverityViolation(type, details) {
        await examSecurity.logViolation(type, details);
        uiHandler.showWarning(CONFIG.MESSAGES.WARNING[type] || details, 'warning');
    }

    async handleLowSeverityViolation(type, details) {
        await examSecurity.logViolation(type, details);
        uiHandler.showStatus(CONFIG.MESSAGES.WARNING[type] || details, 'info');
    }

    async handleTimeUp() {
        clearInterval(this.examTimer);
        this.examActive = false;

        uiHandler.showWarning(CONFIG.MESSAGES.WARNING.TIME_UP, 'error');
        await formHandler.handleSubmission();
    }

    async handleNetworkIssue() {
        // Auto-save current progress
        await formHandler.triggerAutoSave();
        
        uiHandler.showWarning(CONFIG.MESSAGES.ERROR.NETWORK, 'warning');
    }

    cleanup() {
        // Clear timer
        if (this.examTimer) {
            clearInterval(this.examTimer);
        }

        // Clear autosave
        formHandler.destroy();

        // Clear cache after successful submission
        cacheHandler.clearCache('formProgress');
    }
}

export default new EventManager();