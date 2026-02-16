class IntentParser {
    constructor() {
        this.intents = {
            'CREATE_AGENT': ['criar agente', 'novo agente', 'spawn', 'deploy'],
            'CHECK_STATUS': ['status', 'como esta', 'health', 'saude'],
            'READ_LOGS': ['ler logs', 'mostrar logs', 'erro', 'debug'],
            'SYSTEM_HALT': ['parar', 'stop', 'halt', 'desligar']
        };
    }

    parse(inputText) {
        const normalized = inputText.toLowerCase();
        let bestMatch = 'UNKNOWN';
        let maxScore = 0;

        for (const [intent, keywords] of Object.entries(this.intents)) {
            let score = 0;
            keywords.forEach(k => {
                if (normalized.includes(k)) score += 1;
            });
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = intent;
            }
        }

        return {
            original: inputText,
            intent: maxScore > 0 ? bestMatch : 'UNKNOWN',
            confidence: maxScore > 0 ? (maxScore > 1 ? 0.9 : 0.6) : 0.0,
            params: this.extractParams(normalized)
        };
    }

    extractParams(text) {
        // Naive extraction (everything after command)
        // In prod: use regex or named entity recognition
        return { raw_args: text.split(' ').slice(1) };
    }
}

export default IntentParser;
