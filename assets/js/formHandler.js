// assets/js/formHandler.js
import CONFIG from './config.js';
import cacheHandler from './cacheHandler.js';
import networkMonitor from './networkMonitor.js';

class FormHandler {
    constructor() {
        this.formFrame = null;
        this.formData = null;
        this.lastAutoSave = null;
        this.autoSaveInterval = null;
        this.isSubmitting = false;
    }

    initialize(formFrame) {
        this.formFrame = formFrame;
        this.setupFormInterception();
        this.startAutoSave();
        this.loadSavedProgress();
    }

    setupFormInterception() {
        try {
            this.formFrame.addEventListener('load', () => {
                const formDoc = this.formFrame.contentDocument;
                if (!formDoc) return;

                // Intercept form submission
                const form = formDoc.querySelector('form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.handleSubmission();
                    });

                    // Monitor form changes
                    this.attachChangeListeners(form);
                }
            });
        } catch (error) {
            console.error('Form interception error:', error);
        }
    }

    attachChangeListeners(form) {
        // Monitor all input elements
        form.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('change', () => {
                this.formData = this.getFormData();
                this.triggerAutoSave();
            });

            element.addEventListener('input', () => {
                this.formData = this.getFormData();
                this.triggerAutoSave();
            });
        });
    }

    getFormData() {
        try {
            const form = this.formFrame.contentDocument.querySelector('form');
            if (!form) return null;

            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            return data;
        } catch (error) {
            console.error('Error getting form data:', error);
            return null;
        }
    }

    async startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.triggerAutoSave();
        }, CONFIG.TIMER.AUTO_SAVE_INTERVAL);
    }

    async triggerAutoSave() {
        if (!this.formData || this.isSubmitting) return;

        try {
            const saved = await cacheHandler.saveToCache('formProgress', this.formData);
            if (saved) {
                this.lastAutoSave = new Date();
                document.dispatchEvent(new CustomEvent('autoSave', {
                    detail: { 
                        success: true,
                        timestamp: this.lastAutoSave
                    }
                }));
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    // Lanjutan assets/js/formHandler.js

    async loadSavedProgress() {
        try {
            const savedData = await cacheHandler.getFromCache('formProgress');
            if (savedData) {
                await this.restoreFormData(savedData);
                document.dispatchEvent(new CustomEvent('progressRestored', {
                    detail: {
                        timestamp: cacheHandler.getLastSaveTime()
                    }
                }));
            }
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }

    async restoreFormData(savedData) {
        try {
            const form = this.formFrame.contentDocument.querySelector('form');
            if (!form || !savedData) return false;

            Object.entries(savedData).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    // Handle different input types
                    switch(input.type) {
                        case 'radio':
                            const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                            if (radio) radio.checked = true;
                            break;
                        case 'checkbox':
                            input.checked = value === 'on';
                            break;
                        default:
                            input.value = value;
                    }
                }
            });

            return true;
        } catch (error) {
            console.error('Error restoring form data:', error);
            return false;
        }
    }

    async handleSubmission() {
        if (this.isSubmitting) return;

        try {
            this.isSubmitting = true;
            document.dispatchEvent(new CustomEvent('submissionStart'));

            // Final save before submit
            await this.triggerAutoSave();

            // Get all form data
            const finalData = this.getFormData();
            if (!finalData) {
                throw new Error('No form data available');
            }

            // Submit to server
            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submitExam',
                    data: {
                        token: sessionStorage.getItem('examToken'),
                        answers: finalData
                    }
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Clear cache after successful submission
                await cacheHandler.clearCache('formProgress');
                
                document.dispatchEvent(new CustomEvent('submissionComplete', {
                    detail: { success: true }
                }));

                // Redirect to completion page
                window.location.href = 'end.html';
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Submission error:', error);
            document.dispatchEvent(new CustomEvent('submissionComplete', {
                detail: { 
                    success: false,
                    error: error.message
                }
            }));
        } finally {
            this.isSubmitting = false;
        }
    }

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

export default new FormHandler();