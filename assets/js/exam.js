// Tambahan properti di class ExamManager
class ExamManager {
    constructor() {
        // Properti yang sudah ada
        this.token = sessionStorage.getItem('examToken');
        this.formUrl = sessionStorage.getItem('formUrl');
        this.duration = parseInt(sessionStorage.getItem('duration'));
        this.studentId = sessionStorage.getItem('studentId');
        
        // Properti baru
        this.autoSaveInterval = null;
        this.lastSaveTime = null;
        this.isSubmitting = false;
        this.hasChanges = false;
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.confirmModal = document.getElementById('confirmSubmit');
        this.saveStatus = document.getElementById('saveStatus');
        
        if (!this.token || !this.formUrl || !this.duration) {
            window.location.href = 'index.html';
            return;
        }

        this.initialize();
    }

    async initialize() {
        try {
            this.showLoading('Initializing exam...');
            await examSecurity.initialize();

            // Setup exam environment
            await this.setupExamForm();
            await this.loadSavedProgress();
            await this.startExam();
            this.setupEventListeners();
            this.setupAutoSave();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing exam:', error);
            this.showError('Failed to initialize exam');
            this.hideLoading();
        }
    }

    showLoading(message) {
        this.loadingOverlay.querySelector('.loading-text').textContent = message || 'Loading...';
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.hasChanges) {
                this.saveProgress();
            }
        }, 30000); // Auto save setiap 30 detik jika ada perubahan
    }

    async saveProgress() {
        if (!this.hasChanges) return;

        try {
            this.updateSaveStatus('saving');
            const examFrame = document.getElementById('examForm');
            const formData = await this.getFormData(examFrame);

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveProgress',
                    data: {
                        token: this.token,
                        progress: formData
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                this.lastSaveTime = new Date();
                this.hasChanges = false;
                this.updateSaveStatus('saved');
            } else {
                throw new Error('Failed to save progress');
            }
        } catch (error) {
            console.error('Error saving progress:', error);
            this.updateSaveStatus('error');
        }
    }

    async loadSavedProgress() {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getProgress',
                    data: { token: this.token }
                })
            });

            const result = await response.json();
            if (result.success && result.data) {
                await this.restoreFormData(result.data.progress);
                this.lastSaveTime = new Date(result.data.timestamp);
                this.updateSaveStatus('saved');
            }
        } catch (error) {
            console.error('Error loading saved progress:', error);
            this.showError('Failed to load saved progress');
        }
    }

    updateSaveStatus(status) {
        const statusDiv = this.saveStatus;
        statusDiv.className = 'save-status';
        
        switch(status) {
            case 'saving':
                statusDiv.textContent = 'Saving...';
                statusDiv.classList.add('saving');
                break;
            case 'saved':
                statusDiv.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
                statusDiv.classList.add('saved');
                setTimeout(() => {
                    statusDiv.classList.remove('saved');
                }, 3000);
                break;
            case 'error':
                statusDiv.textContent = 'Failed to save';
                statusDiv.classList.add('error');
                break;
        }
    }

    setupEventListeners() {
        // Event listeners yang sudah ada
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Event listeners baru
        document.getElementById('confirmYes').addEventListener('click', () => {
            this.confirmModal.classList.add('hidden');
            this.submitExam('NORMAL');
        });

        document.getElementById('confirmNo').addEventListener('click', () => {
            this.confirmModal.classList.add('hidden');
        });

        // Monitor form changes
        const examFrame = document.getElementById('examForm');
        examFrame.addEventListener('load', () => {
            try {
                examFrame.contentDocument.addEventListener('change', () => {
                    this.hasChanges = true;
                });
                examFrame.contentDocument.addEventListener('input', () => {
                    this.hasChanges = true;
                });
            } catch (error) {
                console.error('Error setting up form change detection:', error);
            }
        });
    }

    handleBeforeUnload(e) {
        if (this.hasChanges && !this.isSubmitting) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    }

    async submitExam(submitType) {
        if (this.isSubmitting) return;
        
        try {
            this.isSubmitting = true;
            this.showLoading('Submitting exam...');

            // Save progress satu kali terakhir
            await this.saveProgress();

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'submitExam',
                    data: {
                        token: this.token,
                        submitType: submitType,
                        studentId: this.studentId
                    }
                })
            });

            const result = await response.json();
            if (result.success) {
                // Clear intervals
                clearInterval(this.timerInterval);
                clearInterval(this.autoSaveInterval);
                
                // Clear flags
                this.hasChanges = false;
                this.isSubmitting = false;
                
                // Redirect ke end page
                sessionStorage.setItem('examStatus', 'COMPLETED');
                window.location.href = 'end.html';
            } else {
                throw new Error(result.message || 'Failed to submit exam');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            this.isSubmitting = false;
            this.hideLoading();
            this.showError(`Failed to submit exam: ${error.message}`);
        }
    }

    async getFormData(examFrame) {
        try {
            const formElement = examFrame.contentDocument.querySelector('form');
            if (!formElement) return null;

            const formData = new FormData(formElement);
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

    async restoreFormData(savedData) {
        try {
            const examFrame = document.getElementById('examForm');
            const formElement = examFrame.contentDocument.querySelector('form');
            if (!formElement || !savedData) return;

            Object.entries(savedData).forEach(([key, value]) => {
                const input = formElement.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
        } catch (error) {
            console.error('Error restoring form data:', error);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize exam when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.examManager = new ExamManager();
});

export default ExamManager;