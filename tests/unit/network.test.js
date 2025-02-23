// tests/unit/network.test.js
import networkMonitor from '../../assets/js/networkMonitor';

describe('Network Monitor Tests', () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = jest.fn();
        // Reset network status
        networkMonitor.isOnline = true;
    });

    test('should detect network disconnection', () => {
        window.dispatchEvent(new Event('offline'));
        expect(networkMonitor.isOnline).toBe(false);
    });

    test('should monitor network speed', async () => {
        const startTime = Date.now();
        global.fetch.mockResolvedValueOnce({ ok: true });
        
        await networkMonitor.checkConnection();
        
        expect(networkMonitor.pingHistory.length).toBeGreaterThan(0);
        expect(networkMonitor.lastPingTime).toBeGreaterThan(0);
    });

    test('should detect network anomalies', () => {
        // Simulate normal pings
        networkMonitor.pingHistory = [100, 120, 110, 105, 115];
        
        // Add anomaly
        networkMonitor.updatePingHistory(500);
        
        expect(networkMonitor.detectAnomalies()).toBe(true);
    });
});