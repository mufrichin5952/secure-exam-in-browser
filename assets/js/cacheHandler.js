// assets/js/cacheHandler.js
import CONFIG from './config.js';

class CacheHandler {
    constructor() {
        this.localCache = new Map();
        this.lastSaveTime = null;
    }

    async saveToCache(key, data) {
        try {
            // Simpan ke localStorage
            localStorage.setItem(key, JSON.stringify({
                timestamp: new Date().toISOString(),
                data: data
            }));

            // Update memory cache
            this.localCache.set(key, data);
            this.lastSaveTime = new Date();

            return true;
        } catch (error) {
            console.error('Cache save error:', error);
            return false;
        }
    }

    async getFromCache(key) {
        try {
            // Cek memory cache dulu
            if (this.localCache.has(key)) {
                return this.localCache.get(key);
            }

            // Cek localStorage
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                this.localCache.set(key, parsedCache.data);
                return parsedCache.data;
            }

            return null;
        } catch (error) {
            console.error('Cache retrieval error:', error);
            return null;
        }
    }

    async clearCache(key) {
        try {
            localStorage.removeItem(key);
            this.localCache.delete(key);
            return true;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }

    getLastSaveTime() {
        return this.lastSaveTime;
    }
}

export default new CacheHandler();