// tests/unit/cache.test.js
import cacheHandler from '../../assets/js/cacheHandler';

describe('Cache Handler Tests', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset memory cache
        cacheHandler.localCache.clear();
    });

    test('should save data to cache', async () => {
        const testData = { 
            answer1: 'test',
            answer2: 'sample'
        };

        const saved = await cacheHandler.saveToCache('testKey', testData);
        expect(saved).toBe(true);

        // Verify localStorage
        const storedData = JSON.parse(localStorage.getItem('testKey'));
        expect(storedData.data).toEqual(testData);
    });

    test('should retrieve data from cache', async () => {
        const testData = { 
            answer1: 'test',
            answer2: 'sample'
        };

        // Save first
        await cacheHandler.saveToCache('testKey', testData);
        
        // Retrieve
        const retrieved = await cacheHandler.getFromCache('testKey');
        expect(retrieved).toEqual(testData);
    });

    test('should clear specific cache', async () => {
        await cacheHandler.saveToCache('testKey', { data: 'test' });
        const cleared = await cacheHandler.clearCache('testKey');
        
        expect(cleared).toBe(true);
        expect(localStorage.getItem('testKey')).toBeNull();
        expect(cacheHandler.localCache.has('testKey')).toBe(false);
    });

    test('should handle invalid cache data', async () => {
        localStorage.setItem('invalidKey', 'invalid json');
        
        const result = await cacheHandler.getFromCache('invalidKey');
        expect(result).toBeNull();
    });

    test('should track last save time', async () => {
        await cacheHandler.saveToCache('testKey', { data: 'test' });
        
        const lastSaveTime = cacheHandler.getLastSaveTime();
        expect(lastSaveTime).toBeInstanceOf(Date);
    });
});