// Konfigurasi Sistem
const CONFIG = {
    // Google Apps Script URL untuk validasi token
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxywwZYnmL1WxRmkhq8IJPfn3y_ASjQT4fkx3-ZqEqilqf3UM9v0R9N25E9URLHpC_Khw/exec',

    // Konfigurasi ujian
    EXAM_DURATION: 60,    // Durasi default dalam menit (akan di-override oleh spreadsheet)
    MAX_WARNINGS: 3,      // Maksimal peringatan sebelum terminate
    
    // Status ujian
    STATUS: {
        NOT_STARTED: 'not_started',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        TERMINATED: 'terminated'
    },

    // Konfigurasi keamanan
    SECURITY: {
        CHECK_INTERVAL: 1000,      // Interval pengecekan keamanan (ms)
        FORCE_FULLSCREEN: true,    // Paksa mode fullscreen
        PREVENT_COPY: true,        // Cegah copy-paste
        PREVENT_PRINT: true,       // Cegah print screen
        PREVENT_TAB_CHANGE: true,  // Cegah perpindahan tab
        PREVENT_RIGHT_CLICK: true  // Cegah klik kanan
    },

    // Validasi token dengan Google Spreadsheet
    validateToken: async function(token) {
        try {
            const response = await fetch(`${this.SCRIPT_URL}?token=${token}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Simpan data form ke session storage
                sessionStorage.setItem('examConfig', JSON.stringify({
                    formUrl: data.formUrl,
                    duration: data.duration,
                    active: data.active
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }
};

// Export konfigurasi jika dibutuhkan
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}