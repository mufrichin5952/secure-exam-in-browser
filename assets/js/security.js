// Tambahan di class ExamSecurity
class ExamSecurity {
    constructor() {
        // Properti yang sudah ada
        this.settings = null;
        this.warningCount = 0;
        this.isFullscreen = false;
        this.lastFocusTime = Date.now();
        this.violations = [];

        // Properti baru untuk fitur keamanan tambahan
        this.networkSpeedHistory = [];
        this.lastNetworkCheck = Date.now();
        this.virtualMachineIndicators = [
            'vmware',
            'virtualbox',
            'qemu',
            'xen',
            'parallels'
        ];
        this.automationIndicators = [
            'selenium',
            'webdriver',
            '__selenium_evaluate',
            '__webdriver_evaluate',
            'chrome.automation'
        ];
    }

    async checkNetworkSpeed() {
        const start = Date.now();
        try {
            const response = await fetch(SCRIPT_URL + '?ping=' + Date.now());
            const end = Date.now();
            const speed = end - start;
            
            this.networkSpeedHistory.push(speed);
            if (this.networkSpeedHistory.length > 10) {
                this.networkSpeedHistory.shift();
            }

            // Deteksi anomali kecepatan
            if (this.detectNetworkAnomaly()) {
                this.logViolation('NETWORK_ANOMALY', 'Unusual network behavior detected');
            }
        } catch (error) {
            this.logViolation('NETWORK_ERROR', 'Network check failed');
        }
    }

    detectNetworkAnomaly() {
        if (this.networkSpeedHistory.length < 5) return false;
        
        const avgSpeed = this.networkSpeedHistory.reduce((a, b) => a + b, 0) / this.networkSpeedHistory.length;
        const currentSpeed = this.networkSpeedHistory[this.networkSpeedHistory.length - 1];
        
        return Math.abs(currentSpeed - avgSpeed) > avgSpeed * 2;
    }

    detectVirtualMachine() {
        // Check navigator properties
        const userAgent = navigator.userAgent.toLowerCase();
        const hasVMIndicator = this.virtualMachineIndicators.some(
            indicator => userAgent.includes(indicator)
        );

        // Check screen properties
        const screenProps = {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };

        const isCommonVMResolution = 
            (screenProps.width === 800 && screenProps.height === 600) ||
            (screenProps.width === 1024 && screenProps.height === 768);

        // Check hardware concurrency
        const lowConcurrency = navigator.hardwareConcurrency <= 1;

        if (hasVMIndicator || (isCommonVMResolution && lowConcurrency)) {
            this.logViolation('VM_DETECTED', 'Virtual machine environment detected');
            return true;
        }

        return false;
    }

    detectAutomation() {
        // Check for automation objects
        const hasAutomation = this.automationIndicators.some(
            indicator => window[indicator] !== undefined
        );

        // Check for inconsistent properties
        const inconsistentProps = 
            !('ontouchstart' in window) !== !navigator.maxTouchPoints ||
            !('onmousemove' in window) !== !navigator.maxTouchPoints;

        // Check for WebDriver
        const hasWebDriver = navigator.webdriver;

        if (hasAutomation || inconsistentProps || hasWebDriver) {
            this.logViolation('AUTOMATION_DETECTED', 'Browser automation detected');
            return true;
        }

        return false;
    }

    checkHardwareAcceleration() {
        const canvas = document.createElement('canvas');
        let gl;
        try {
            gl = canvas.getContext('webgl') || 
                 canvas.getContext('experimental-webgl');
        } catch (e) {
            return false;
        }

        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                const isEmulated = renderer.toLowerCase().includes('swiftshader') || 
                                 renderer.toLowerCase().includes('software');
                
                if (isEmulated) {
                    this.logViolation('SOFTWARE_RENDERING', 'Hardware acceleration disabled');
                    return false;
                }
            }
        }
        return true;
    }

    enhancedSecurityChecks() {
        // Check browser fingerprint consistency
        this.checkBrowserFingerprint();
        
        // Enhanced keyboard monitoring
        document.addEventListener('keydown', (e) => {
            // Detect common debugging shortcuts
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || // Chrome DevTools
                (e.ctrlKey && e.shiftKey && e.key === 'J') || // Chrome DevTools Console
                (e.ctrlKey && e.shiftKey && e.key === 'C') || // Chrome DevTools Elements
                (e.key === 'F12')) {                          // DevTools
                e.preventDefault();
                this.logViolation('DEVTOOLS_SHORTCUT', 'Developer tools shortcut detected');
            }
        });

        // Check recording indicators
        setInterval(() => {
            this.checkRecordingIndicators();
        }, 10000);
    }

    checkBrowserFingerprint() {
        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const fingerprintStr = JSON.stringify(fingerprint);
        const storedFingerprint = sessionStorage.getItem('browserFingerprint');

        if (!storedFingerprint) {
            sessionStorage.setItem('browserFingerprint', fingerprintStr);
        } else if (storedFingerprint !== fingerprintStr) {
            this.logViolation('FINGERPRINT_MISMATCH', 'Browser fingerprint changed');
        }
    }

    checkRecordingIndicators() {
        // Check MediaRecorder API
        if (typeof MediaRecorder !== 'undefined') {
            if (MediaRecorder.isTypeSupported && 
                document.visibilityState === 'visible') {
                navigator.mediaDevices.enumerateDevices()
                    .then(devices => {
                        const activeDevices = devices.filter(device => 
                            device.kind === 'videoinput' && device.label
                        );
                        if (activeDevices.length > 0) {
                            this.logViolation('RECORDING_DEVICE', 'Active recording device detected');
                        }
                    })
                    .catch(() => {});
            }
        }
    }

    // Override initialize method
    initialize() {
        super.initialize();
        this.enhancedSecurityChecks();
        
        // Start periodic checks
        setInterval(() => {
            this.checkNetworkSpeed();
            this.detectVirtualMachine();
            this.detectAutomation();
            this.checkHardwareAcceleration();
        }, 30000);

        // Save initial secure state
        this.saveSecureState();
    }

    saveSecureState() {
        const secureState = {
            timestamp: Date.now(),
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        sessionStorage.setItem('secureState', JSON.stringify(secureState));
    }
}

// Re-export enhanced security
export default new ExamSecurity();