// tests/setup/testSetup.js
global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.CONFIG = {
    SCRIPT_URL: 'http://test-url.com',
    SECURITY: {
        VIOLATION_TYPES: {
            TAB_SWITCH: 'TAB_SWITCH',
            FULLSCREEN_EXIT: 'FULLSCREEN_EXIT',
            COPY_PASTE: 'COPY_PASTE'
        }
    }
};