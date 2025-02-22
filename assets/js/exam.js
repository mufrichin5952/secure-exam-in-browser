// Sistem Exam Handler
class ExamHandler {
    constructor() {
        this.examData = this.getExamData();
        if (!this.examData) return; // Jika tidak ada data, kembali ke halaman login

        this.timeLeft = this.examData.duration * 60; // Konversi ke detik
        this.isMobile = this.examData.isMobile;
        this.isSubmitted = false;
        this.security = new ExamSecurity();
        this.setupExam();
    }

    // Ambil data exam dari session storage
    getExamData() {
        const data = sessionStorage.getItem('examData');
        if (!data) {
            window.location.href = 'index.html';
            return null;
        }
        return JSON.parse(data);
    }

    // Setup halaman exam
    setupExam() {
        this.createExamInterface();
        this.loadGoogleForm();
        this.startTimer();
        this.setupEventListeners();
        this.setupBeforeUnload();
    }

    // Buat interface exam
    createExamInterface() {
        const examContainer = document.createElement('div');
        examContainer.className = 'exam-container';
        examContainer.innerHTML = `
            <div class="exam-header">
                <div class="student-info">
                    <span>Student ID: ${this.examData.studentId}</span>
                </div>
                <div class="timer">Time Left: <span id="timer">Loading...</span></div>
                <button id="submit-exam" class="submit-button">Submit Exam</button>
            </div>
            <div class="form-container">
                <iframe id="google-form" class="exam-frame" sandbox="allow-same-origin allow-scripts allow-forms" referrerpolicy="no-referrer"></iframe>
            </div>
        `;
        document.body.appendChild(examContainer);
    }

    // Load Google Form
    loadGoogleForm() {
        const iframe = document.getElementById('google-form');
        iframe.src = this.examData.formUrl;
        
        iframe.onload = () => {
            this.handleFormLoad();
        };
    }

    // Handle saat form selesai loading
    handleFormLoad() {
        const iframe = document.getElementById('google-form');
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Auto-fill student ID jika ada field yang sesuai
            const inputs = iframeDoc.getElementsByTagName('input');
            for (let input of inputs) {
                if (input.type === 'text' && 
                    (input.name.toLowerCase().includes('id') || 
                     input.placeholder.toLowerCase().includes('id'))) {
                    input.value = this.examData.studentId;
                }
            }

            // Monitor form submission
            const forms = iframeDoc.getElementsByTagName('form');
            if (forms.length > 0) {
                forms[0].addEventListener('submit', (e) => {
                    this.handleFormSubmit(e);
                });
            }
        } catch (error) {
            console.warn('Cannot access iframe content due to same-origin policy');
        }
    }

    // Timer ujian
    startTimer() {
        const timerElement = document.getElementById('timer');
        
        const updateTimer = () => {
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
                return;
            }

            const hours = Math.floor(this.timeLeft / 3600);
            const minutes = Math.floor((this.timeLeft % 3600) / 60);
            const seconds = this.timeLeft % 60;

            timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Warning saat waktu hampir habis
            if (this.timeLeft === 300) { // 5 menit terakhir
                this.security.showWarning('5 minutes remaining!');
                this.security.provideFeedback();
            }

            this.timeLeft--;
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('submit-exam').addEventListener('click', () => {
            if (confirm('Are you sure you want to submit the exam?')) {
                this.submitExam();
            }
        });
    }

    // Setup warning sebelum menutup halaman
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (!this.isSubmitted) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    // Handle waktu habis
    handleTimeUp() {
        clearInterval(this.timerInterval);
        alert('Time is up! Your exam will be submitted automatically.');
        this.submitExam();
    }

    // Submit exam
    submitExam() {
        this.isSubmitted = true;
        
        // Simpan log completion
        const completionData = {
            studentId: this.examData.studentId,
            token: this.examData.token,
            completionTime: new Date().toISOString(),
            timeUsed: (this.examData.duration * 60) - this.timeLeft,
            violations: JSON.parse(localStorage.getItem('violations') || '[]')
        };

        localStorage.setItem('examCompletion', JSON.stringify(completionData));

        // Redirect ke halaman selesai
        window.location.href = 'end.html?status=completed';
    }

    // Handle form submission
    handleFormSubmit(e) {
        if (!this.isSubmitted) {
            this.submitExam();
        }
    }
}

// Inisialisasi exam handler saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    new ExamHandler();
});