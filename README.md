# Secure Exam Browser

Sistem browser ujian yang aman untuk Google Forms dengan fitur keamanan dan monitoring terintegrasi.

## Fitur Utama
- 🔒 Token-based access control
- ⏲️ Real-time timer dengan auto-submit
- 🛡️ Fitur keamanan komprehensif
- 📱 Kompatibilitas mobile
- 💾 Auto-save progress
- 📊 Sistem monitoring pelanggaran

## Fitur Keamanan
- Pencegahan tab switching
- Enforced fullscreen mode
- Pencegahan copy-paste
- Deteksi multiple display
- Monitor koneksi jaringan
- Deteksi virtual machine
- Proteksi mobile device
- Sistem strike untuk pelanggaran

## Persyaratan Sistem
- Web server
- Google Forms
- Google Spreadsheet
- Browser modern (Chrome, Firefox, Edge)

## Struktur Sistem
```plaintext
├── index.html          # Halaman login
├── exam.html          # Halaman ujian
├── blocked.html       # Halaman blokir
├── end.html          # Halaman selesai
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── security.js
│       ├── exam.js
│       ├── formHandler.js
│       ├── cacheHandler.js
│       ├── networkMonitor.js
│       ├── uiHandler.js
│       └── mobileHandler.js
└── tests/
    └── unit/
        ├── security.test.js
        ├── form.test.js
        ├── validation.test.js
        └── network.test.js