class LogZero {
    constructor() {
        this.silentMode = false;
    }

    setSilent(enable) {
        this.silentMode = enable;
        console.log(enable ? "🔇 MODO LOG ZERO ATIVADO: Apenas falhas fatais serão registradas." : "🔊 MODO VERBOSO ATIVADO.");
    }

    shouldLog(level) {
        if (!this.silentMode) return true;
        return ['ERROR', 'FATAL'].includes(level.toUpperCase());
    }

    anonymize(data) {
        // Regex simple for PII (emails, IPs)
        if (typeof data !== 'string') return data;
        return data
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]")
            .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_REDACTED]");
    }
}

export default LogZero;
