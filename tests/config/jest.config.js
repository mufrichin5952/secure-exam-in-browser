// tests/config/jest.config.js
module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    setupFiles: ['./setup/testSetup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/assets/js/$1'
    },
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        'assets/js/**/*.js'
    ]
};