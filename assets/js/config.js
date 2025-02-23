// config.js
const CONFIG = {
    // URL Google Apps Script yang sudah di-deploy
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxQMCzXZzvYeP7wanplG4Wh8Cs6rXBp3uqz3aiwiJGdKzfixjJMghHH_y-3Q1epTXfS_A/exec',

    // Timer configuration
    TIMER: {
        WARNING_TIME: 5, // menit
        CHECK_INTERVAL: 1000, // milliseconds
        WARNING_THRESHOLD: 0.1, // 10% dari total waktu
        AUTO_SAVE_INTERVAL: 30000 // 30 detik
    },

    // Security configuration
    SECURITY: {
        VIOLATION_TYPES: {
            TAB_SWITCH: 'TAB_SWITCH',
            FULLSCREEN_EXIT: 'FULLSCREEN_EXIT',
            COPY_PASTE: 'COPY_PASTE',
            NETWORK_ANOMALY: 'NETWORK_ANOMALY',
            VM_DETECTED: 'VM_DETECTED',
            AUTOMATION_DETECTED: 'AUTOMATION_DETECTED'
        },
        MAX_RETRIES: 3,
        CHECK_INTERVAL: 5000 // 5 detik
    },

    // Message templates
    MESSAGES: {
        WARNING: {
            TAB_SWITCH: "Peringatan: Tab switching terdeteksi!",
            FULLSCREEN_EXIT: "Peringatan: Mohon kembali ke mode fullscreen!",
            TIME_WARNING: "Peringatan: Waktu tersisa kurang dari {minutes} menit!",
            COPY_PASTE: "Peringatan: Copy-paste tidak diizinkan!",
            NETWORK: "Peringatan: Koneksi internet tidak stabil!"
        },
        ERROR: {
            SUBMIT: "Gagal mengirim ujian. Mohon coba lagi.",
            NETWORK: "Koneksi terputus. Menyimpan progress...",
            BLOCKED: "Akses diblokir karena pelanggaran keamanan."
        },
        SUCCESS: {
            SAVE: "Progress berhasil disimpan",
            SUBMIT: "Ujian berhasil diselesaikan"
        }
    }
};

export default CONFIG;