class SensoryCortex {
    constructor() {
        this.stressLevel = 0; // 0 to 100
        this.errorCount = 0;
        this.startTime = Date.now();
    }

    perceiveError(errorMsg, severity = 'LOW') {
        this.errorCount++;
        const impact = severity === 'CRITICAL' ? 20 : (severity === 'HIGH' ? 10 : 2);
        this.stressLevel = Math.min(100, this.stressLevel + impact);
        
        console.error(`⚡ DOR SENSORIAL DETECTADA: ${severity} | Stress: ${this.stressLevel}%`);
        
        if (this.stressLevel > 80) {
            this.triggerPanicProtocol();
        }
    }

    perceiveSuccess() {
        // Healing over time
        this.stressLevel = Math.max(0, this.stressLevel - 5);
    }

    triggerPanicProtocol() {
        console.warn("🚨 ALERTA DE SOBRECARGA COGNITIVA: Pausando para resfriamento.");
        // Logic to pause execution would go here
    }

    getHealthStatus() {
        return {
            stress: this.stressLevel,
            uptime: (Date.now() - this.startTime) / 1000,
            status: this.stressLevel < 50 ? 'HEALTHY' : 'STRESSED'
        };
    }
}

export default SensoryCortex;
