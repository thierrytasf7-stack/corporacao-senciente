// LLM CLIENT FACTORY & BASE ADAPTERS
// Squad: Logos

class BaseLLM {
    constructor(config) {
        this.config = config;
    }
    async complete(prompt) { throw new Error("Method 'complete' must be implemented"); }
}

class OpenAIMockAdapter extends BaseLLM {
    async complete(prompt) {
        // Simulation for offline/test mode
        return {
            text: `[OpenAI Mock] Processed: ${prompt.substring(0, 20)}...`,
            usage: { total_tokens: 50 },
            model: "gpt-mock"
        };
    }
}

class AnthropicMockAdapter extends BaseLLM {
    async complete(prompt) {
        return {
            text: `[Claude Mock] Reasoned: ${prompt.substring(0, 20)}...`,
            usage: { total_tokens: 50 },
            model: "claude-mock"
        };
    }
}

class LLMFactory {
    static createEngine(provider = 'openai', config = {}) {
        console.log(`🏭 Initializing LLM Engine: ${provider.toUpperCase()}`);
        
        switch(provider.toLowerCase()) {
            case 'openai': return new OpenAIMockAdapter(config);
            case 'anthropic': return new AnthropicMockAdapter(config);
            case 'local': return new OpenAIMockAdapter({ ...config, local: true }); // Mock for now
            default: throw new Error(`Provider ${provider} not supported`);
        }
    }

    // Exponential Backoff Retry Logic
    static async executeWithRetry(engine, prompt, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await engine.complete(prompt);
            } catch (e) {
                const waitTime = Math.pow(2, i) * 1000;
                console.warn(`⚠️ LLM Fail (Attempt ${i+1}/${retries}). Retrying in ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime));
            }
        }
        throw new Error("LLM Execution Failed after retries");
    }
}

export default LLMFactory;
