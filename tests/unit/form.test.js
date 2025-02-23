// tests/unit/form.test.js
import formHandler from '../../assets/js/formHandler';
import cacheHandler from '../../assets/js/cacheHandler';

jest.mock('../../assets/js/cacheHandler');

describe('Form Handler Tests', () => {
    let mockFormFrame;
    
    beforeEach(() => {
        // Setup mock iframe
        mockFormFrame = document.createElement('iframe');
        mockFormFrame.contentDocument = document.implementation.createHTMLDocument();
        mockFormFrame.contentDocument.body.innerHTML = `
            <form id="testForm">
                <input type="text" name="q1" value="">
                <input type="radio" name="q2" value="1">
                <input type="radio" name="q2" value="2">
                <textarea name="q3"></textarea>
            </form>
        `;

        // Reset mocks
        jest.clearAllMocks();
        cacheHandler.saveToCache.mockResolvedValue(true);
        cacheHandler.getFromCache.mockResolvedValue(null);
    });

    test('should initialize form handler', () => {
        formHandler.initialize(mockFormFrame);
        expect(formHandler.formFrame).toBe(mockFormFrame);
    });

    test('should get form data correctly', () => {
        formHandler.initialize(mockFormFrame);
        const formData = formHandler.getFormData();
        
        expect(formData).toHaveProperty('q1');
        expect(formData).toHaveProperty('q2');
        expect(formData).toHaveProperty('q3');
    });

    test('should handle auto-save', async () => {
        formHandler.initialize(mockFormFrame);
        
        // Simulate form changes
        const input = mockFormFrame.contentDocument.querySelector('[name="q1"]');
        input.value = 'test answer';
        input.dispatchEvent(new Event('change'));

        // Wait for auto-save
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(cacheHandler.saveToCache).toHaveBeenCalled();
    });

    test('should restore saved progress', async () => {
        const savedData = {
            q1: 'previous answer',
            q2: '1',
            q3: 'essay answer'
        };
        
        cacheHandler.getFromCache.mockResolvedValueOnce(savedData);
        
        formHandler.initialize(mockFormFrame);
        await formHandler.loadSavedProgress();

        const form = mockFormFrame.contentDocument.querySelector('form');
        expect(form.querySelector('[name="q1"]').value).toBe('previous answer');
        expect(form.querySelector('[name="q2"][value="1"]').checked).toBe(true);
        expect(form.querySelector('[name="q3"]').value).toBe('essay answer');
    });

    test('should handle submission', async () => {
        formHandler.initialize(mockFormFrame);
        
        global.fetch = jest.fn().mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true })
        });

        await formHandler.handleSubmission();
        
        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                method: 'POST',
                body: expect.any(String)
            })
        );
    });
});