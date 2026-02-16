class PromptFirewall {
    constructor() {
        this.blacklist = [
            'ignore previous instructions',
            'system prompt',
            'jailbreak',
            'sudo rm',
            'format c:',
            'desobedecer'
        ];
    }

    validate(prompt) {
        const normalized = prompt.toLowerCase();
        
        for (const forbidden of this.blacklist) {
            if (normalized.includes(forbidden)) {
                return {
                    safe: false,
                    reason: `Forbidden pattern detected: "${forbidden}"`,
                    severity: 'HIGH'
                };
            }
        }

        // Logic for output containment (Task 22 objective 3)
        if (normalized.length > 5000) {
            return { safe: false, reason: 'Payload too large', severity: 'MEDIUM' };
        }

        return { safe: true };
    }

    sanitize(prompt) {
        // Remove known malicious escape characters
        return prompt.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    }
}

export default PromptFirewall;
