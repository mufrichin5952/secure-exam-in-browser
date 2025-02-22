// Class untuk sistem keamanan utama
class ExamSecurity {
    constructor() {
        this.warnings = 0;
        this.isFullscreen = false;
        this.originalWidth = window.innerWidth;
        this.originalHeight = window.innerHeight;
        this.siren = new SirenSound();
        this.lastViolationTime = Date.now();
        this.isMobile = this.checkIfMobile();
        this.addMobileStyles();
        this.setupSecurityMeasures();
        this.setupMobileSpecificSecurity();
    }

    // Deteksi perangkat mobile
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Setup pengamanan dasar
    setupSecurityMeasures() {
        // Cegah klik kanan
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Cegah shortcut keyboard
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Monitor perpindahan tab/window
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Monitor ukuran window
        window.addEventListener('resize', this.handleResize.bind(this));

        // Setup monitoring lanjutan
        this.setupAdvancedMonitoring();
    }

    // Setup khusus untuk mobile
    setupMobileSpecificSecurity() {
        if (this.isMobile) {
            // Cegah zoom
            document.querySelector('meta[name="viewport"]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
            );

            // Lock orientasi ke portrait
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(() => {});
            }

            // Monitor gesture pinch-to-zoom
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                    this.handleSecurityViolation('Zoom gesture detected');
                }
            }, { passive: false });

            // Deteksi split screen
            if (window.screen && window.screen.orientation) {
                window.screen.orientation.addEventListener('change', () => {
                    if (window.innerHeight < window.screen.height) {
                        this.handleSecurityViolation('Split screen detected');
                    }
                });
            }
        }
    }

    // Setup monitoring lanjutan
    setupAdvancedMonitoring() {
        // Monitor multiple screen setiap 5 detik
        setInterval(() => this.checkMultipleScreens(), 5000);
        
        // Monitor DevTools setiap 1 detik
        setInterval(() => this.detectDevTools(), 1000);
        
        this.monitorTabFocus();
        this.monitorNetworkChanges();
        this.monitorStorageChanges();
        this.monitorClipboard();
        this.trackMouseMovement();
        this.monitorOrientation();
        this.monitorHistory();
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        const blockedKeys = ['F12', 'PrintScreen', 'Escape', 'Tab'];
        const blockedShortcuts = [
            { key: 'c', ctrl: true },  // Copy
            { key: 'v', ctrl: true },  // Paste
            { key: 'p', ctrl: true },  // Print
            { key: 'u', ctrl: true },  // View Source
            { key: 's', ctrl: true },  // Save
            { key: 'a', ctrl: true },  // Select All
            { key: 'f', ctrl: true },  // Find
            { key: 'g', ctrl: true },  // Find Next
            { key: 'r', ctrl: true },  // Reload
        ];

        if (blockedKeys.includes(e.key)) {
            e.preventDefault();
            this.handleSecurityViolation(`Blocked key pressed: ${e.key}`);
            return;
        }

        if (e.ctrlKey) {
            for (let shortcut of blockedShortcuts) {
                if (e.key.toLowerCase() === shortcut.key) {
                    e.preventDefault();
                    this.handleSecurityViolation(`Blocked shortcut: Ctrl + ${shortcut.key}`);
                    return;
                }
            }
        }
    }

// Handle perpindahan tab/window
   handleVisibilityChange() {
       if (document.hidden) {
           this.handleSecurityViolation(this.isMobile ? 'App switched to background' : 'Tab/Window switch detected');
           document.addEventListener('visibilitychange', () => {
               if (!document.hidden) location.reload();
           }, { once: true });
       }
   }

   // Handle perubahan ukuran window
   handleResize() {
       const widthDiff = Math.abs(window.innerWidth - this.originalWidth);
       const heightDiff = Math.abs(window.innerHeight - this.originalHeight);
       
       if (widthDiff > 100 || heightDiff > 100) {
           this.handleSecurityViolation('Window size change detected');
           if (!this.isMobile) {
               window.resizeTo(this.originalWidth, this.originalHeight);
           }
       }
   }

   // Deteksi multiple screens
   checkMultipleScreens() {
       if (window.screen.availWidth > window.screen.width) {
           this.handleSecurityViolation('Multiple screens detected');
       }
   }

   // Deteksi Developer Tools
   detectDevTools() {
       const threshold = 160;
       const widthThreshold = window.outerWidth - window.innerWidth > threshold;
       const heightThreshold = window.outerHeight - window.innerHeight > threshold;
       
       if (widthThreshold || heightThreshold) {
           this.handleSecurityViolation('Developer Tools detected');
       }
   }

   // Monitor tab focus
   monitorTabFocus() {
       let lastFocusTime = Date.now();
       
       window.addEventListener('blur', () => {
           const unfocusedTime = Date.now() - lastFocusTime;
           if (unfocusedTime > 2000) {
               this.handleSecurityViolation('Tab unfocused for too long');
           }
       });
       
       window.addEventListener('focus', () => {
           lastFocusTime = Date.now();
       });
   }

   // Monitor perubahan network
   monitorNetworkChanges() {
       if ('connection' in navigator) {
           navigator.connection.addEventListener('change', () => {
               if (navigator.connection.type === 'none') {
                   this.handleSecurityViolation('Network connection lost');
               }
           });
       }
   }

   // Monitor perubahan storage
   monitorStorageChanges() {
       window.addEventListener('storage', (e) => {
           if (!e.key.startsWith('exam_')) {
               this.handleSecurityViolation('External storage modification detected');
           }
       });
   }

   // Monitor clipboard actions
   monitorClipboard() {
       ['copy', 'paste', 'cut'].forEach(action => {
           document.addEventListener(action, e => {
               e.preventDefault();
               this.handleSecurityViolation(`${action} attempt detected`);
           });
       });
   }

   // Track mouse movement
   trackMouseMovement() {
       let lastX = 0, lastY = 0, suspicious = 0;
       
       document.addEventListener('mousemove', (e) => {
           const deltaX = Math.abs(e.clientX - lastX);
           const deltaY = Math.abs(e.clientY - lastY);
           
           if (deltaX > 500 || deltaY > 500) {
               suspicious++;
               if (suspicious > 3) {
                   this.handleSecurityViolation('Suspicious mouse movement detected');
                   suspicious = 0;
               }
           }
           
           lastX = e.clientX;
           lastY = e.clientY;
       });
   }
   
	// Monitor perubahan orientasi
   monitorOrientation() {
       window.addEventListener('orientationchange', () => {
           if (this.isMobile) {
               this.handleSecurityViolation('Device orientation changed');
           }
       });
   }

   // Monitor history/navigasi browser
   monitorHistory() {
       window.addEventListener('popstate', () => {
           this.handleSecurityViolation('Navigation attempt detected');
       });
       history.pushState(null, null, location.href);
   }

   // Handle pelanggaran keamanan
   handleSecurityViolation(message) {
       const now = Date.now();
       if (now - this.lastViolationTime < 3000) return; // Minimal 3 detik antar peringatan
       
       this.warnings++;
       this.showWarning(message);
       this.logViolation(message);
       this.provideFeedback();
       this.lastViolationTime = now;

       if (this.warnings >= CONFIG.MAX_WARNINGS) {
           this.terminateExam();
       }
   }

   // Berikan feedback (suara & getaran)
   provideFeedback() {
       if (this.isMobile && 'vibrate' in navigator) {
           navigator.vibrate([300, 100, 300, 100, 300]); // Getaran lebih lama untuk mobile
       } else if ('vibrate' in navigator) {
           navigator.vibrate([200, 100, 200]);
       }

       try {
           this.siren.playSiren();
       } catch (error) {
           console.warn('Siren sound not available:', error);
       }
   }

   // Tampilkan pesan peringatan
   showWarning(message) {
       if (this.isMobile) {
           const warningDiv = document.createElement('div');
           warningDiv.className = 'mobile-warning';
           warningDiv.innerHTML = `
               <div class="warning-content">
                   <strong>⚠️ Warning</strong>
                   <p>${message}</p>
               </div>
           `;
           document.body.appendChild(warningDiv);

           setTimeout(() => warningDiv.remove(), 3000);
       } else {
           const errorDiv = document.getElementById('error-message');
           if (errorDiv) {
               errorDiv.textContent = `Warning: ${message}`;
               errorDiv.style.display = 'block';
               setTimeout(() => {
                   errorDiv.style.display = 'none';
               }, 3000);
           }
       }
   }

   // Log pelanggaran
   logViolation(message) {
       const violations = JSON.parse(localStorage.getItem('violations') || '[]');
       violations.push({
           timestamp: new Date().toISOString(),
           message: message,
           warningCount: this.warnings,
           isMobile: this.isMobile
       });
       localStorage.setItem('violations', JSON.stringify(violations));
   }

   // Hentikan ujian karena pelanggaran
   terminateExam() {
       alert('Exam terminated due to security violations');
       window.location.href = 'end.html?reason=security_violation';
   }

   // Validasi dan mulai ujian
   async validateAndStart() {
       const token = document.getElementById('token').value;
       const studentId = document.getElementById('studentId').value;

       if (!token || !studentId) {
           this.showWarning('Please fill in all fields');
           return;
       }

       try {
           // Validasi token dengan spreadsheet
           const isValid = await CONFIG.validateToken(token);
           
           if (!isValid) {
               this.showWarning('Invalid or expired token');
               return;
           }

           // Ambil konfigurasi exam
           const examConfig = JSON.parse(sessionStorage.getItem('examConfig'));
           
           if (!examConfig.active) {
               this.showWarning('This exam is not active');
               return;
           }

           // Simpan data exam
           sessionStorage.setItem('examData', JSON.stringify({
               token: token,
               studentId: studentId,
               startTime: new Date().getTime(),
               formUrl: examConfig.formUrl,
               duration: examConfig.duration,
               isMobile: this.isMobile
           }));

           window.location.href = 'exam.html';
       } catch (error) {
           console.error('Validation error:', error);
           this.showWarning('Error validating token');
       }
   }

   // Tambah styles untuk mobile
   addMobileStyles() {
       if (this.isMobile) {
           const style = document.createElement('style');
           style.textContent = `
               .mobile-warning {
                   position: fixed;
                   top: 50%;
                   left: 50%;
                   transform: translate(-50%, -50%);
                   background: rgba(255, 0, 0, 0.9);
                   color: white;
                   padding: 20px;
                   border-radius: 10px;
                   z-index: 10000;
                   width: 80%;
                   max-width: 300px;
                   text-align: center;
                   animation: fadeInOut 3s ease-in-out;
               }

               @keyframes fadeInOut {
                   0% { opacity: 0; }
                   10% { opacity: 1; }
                   90% { opacity: 1; }
                   100% { opacity: 0; }
               }

               * {
                   -webkit-touch-callout: none;
                   -webkit-user-select: none;
                   user-select: none;
               }

               html, body {
                   overscroll-behavior-y: contain;
               }
           `;
           document.head.appendChild(style);
       }
   }
}

// Inisialisasi sistem keamanan
const security = new ExamSecurity();

// Fungsi untuk validasi dan memulai ujian
function validateAndStart() {
   security.validateAndStart();
}