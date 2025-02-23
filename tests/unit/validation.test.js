// tests/unit/validation.test.js
import { validateToken, validateExamData } from '../../assets/js/validation';

describe('Data Validation Tests', () => {
    test('should validate correct token format', () => {
        const validTokens = ['ABC123', 'TEST456', 'EXAM_2024'];
        validTokens.forEach(token => {
            expect(validateToken(token)).toBe(true);
        });
    });

    test('should reject invalid token format', () => {
        const invalidTokens = ['abc', '', null, '12*&^%', 'TOO_LONG_TOKEN_123456'];
        invalidTokens.forEach(token => {
            expect(() => validateToken(token)).toThrow();
        });
    });

    test('should validate exam data correctly', () => {
        const validData = {
            token: 'TEST123',
            duration: 60,
            studentId: '12345'
        };
        expect(validateExamData(validData)).toBe(true);
    });
});