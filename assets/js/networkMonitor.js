// assets/js/networkMonitor.js
import CONFIG from './config.js';
import examSecurity from './security.js';

class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.lastPingTime = null;
        this.pingHistory = [];
        this.maxPingHistory = 10;
        this.checkInterval = null;
        this.retryCount = 0;
    }

    initialize() {
        // Setup network event listeners
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Start periodic connection checking
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, CONFIG.SECURITY.CHECK_INTERVAL);

        // Initial check
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const start = performance.now();
            const response = await fetch(CONFIG.SCRIPT_URL + '?ping=' + Date.now(), {
                method: 'HEAD'
            });
            const end = performance.now();

            if (response.ok) {
                this.updatePingHistory(end - start);
                this.retryCount = 0;
                this.isOnline = true;
            }
        } catch (error) {
            this.handleConnectionError();
        }
    }

    updatePingHistory(pingTime) {
        this.lastPingTime = pingTime;
        this.pingHistory.push(pingTime);
        
        if (this.pingHistory.length > this.maxPingHistory) {
            this.pingHistory.shift();
        }

        // Check for network anomalies
        this.detectAnomalies();
    }

    detectAnomalies() {
        if (this.pingHistory.length < 3) return;

        const avgPing = this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length;
        const lastPing = this.pingHistory[this.pingHistory.length - 1];

        // Check for sudden ping spikes
        if (lastPing > avgPing * 3) {
            examSecurity.logViolation('NETWORK_ANOMALY', 'Unusual network latency detected');
        }
    }

    handleOnline() {
        this.isOnline = true;
        document.dispatchEvent(new CustomEvent('networkStatus', {
            detail: { 
                status: 'online',
                message: 'Connection restored'
            }
        }));
    }

    handleOffline() {
        this.isOnline = false;
        document.dispatchEvent(new CustomEvent('networkStatus', {
            detail: { 
                status: 'offline',
                message: 'Connection lost'
            }
        }));
        examSecurity.logViolation('NETWORK_DISCONNECT', 'Internet connection lost');
    }

    handleConnectionError() {
        this.retryCount++;
        if (this.retryCount >= CONFIG.SECURITY.MAX_RETRIES) {
            this.isOnline = false;
            examSecurity.logViolation('NETWORK_FAILURE', 'Persistent connection failure');
        }
    }

    getNetworkStatus() {
        return {
            isOnline: this.isOnline,
            lastPing: this.lastPingTime,
            avgPing: this.pingHistory.length ? 
                this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length : 
                null
        };
    }
}

export default new NetworkMonitor();