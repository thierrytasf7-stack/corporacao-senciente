/**
 * Agent Zero v2.0 - OpenRouter LLM Client
 * Key rotation, model cascade, retry with backoff
 */
const https = require('https');
const path = require('path');
const fs = require('fs');

class LLMClient {
  constructor(config) {
    this.config = config;
    this.keys = this._loadKeys();
    this.keyIndex = 0;
    this.stats = { calls: 0, tokens_in: 0, tokens_out: 0, errors: 0, retries: 0 };
  }

  _loadKeys() {
    // Load from .aios-core/.env
    const envPath = path.resolve(__dirname, '..', '..', '..', '.aios-core', '.env');
    const keys = [];

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const envVars = {};
      for (const line of envContent.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.+)$/);
        if (match) envVars[match[1]] = match[2].trim();
      }

      // Add free keys
      for (const keyName of this.config.openrouter.keys.free) {
        if (envVars[keyName]) keys.push(envVars[keyName]);
      }
      // Add primary as last resort
      if (envVars[this.config.openrouter.keys.primary]) {
        keys.push(envVars[this.config.openrouter.keys.primary]);
      }
    }

    // Fallback: check root .env
    if (keys.length === 0) {
      const rootEnv = path.resolve(__dirname, '..', '..', '..', '.env');
      if (fs.existsSync(rootEnv)) {
        const content = fs.readFileSync(rootEnv, 'utf-8');
        const match = content.match(/OPENROUTER_FREE_KEYS=(.+)/);
        if (match) {
          keys.push(...match[1].split(',').map(k => k.trim()));
        }
        const mainKey = content.match(/OPENROUTER_API_KEY=(.+)/);
        if (mainKey) keys.push(mainKey[1].trim());
      }
    }

    if (keys.length === 0) throw new Error('No API keys found in .env files');
    return keys;
  }

  _nextKey() {
    const key = this.keys[this.keyIndex % this.keys.length];
    this.keyIndex++;
    return key;
  }

  /**
   * Call OpenRouter API with model cascade, key rotation, and optional tool use
   * @param {string[]} modelCascade - Models to try in order
   * @param {Array} messages - Chat messages
   * @param {object} opts - max_tokens, temperature, tools, tool_choice
   * @returns {Promise<{content, tool_calls, model, tokens_in, tokens_out, elapsed_ms}>}
   */
  async call(modelCascade, messages, opts = {}) {
    const maxTokens = opts.max_tokens || undefined;
    const temperature = opts.temperature ?? 0.3;
    const timeout = this.config.openrouter.timeout_ms || 120000;
    const maxRetries = this.config.openrouter.max_retries || 3;

    for (const model of modelCascade) {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const key = this._nextKey();
        try {
          const result = await this._request(model, messages, maxTokens, temperature, key, timeout, opts.tools);
          this.stats.calls++;
          this.stats.tokens_in += result.tokens_in;
          this.stats.tokens_out += result.tokens_out;
          return result;
        } catch (err) {
          this.stats.errors++;
          const isRateLimit = err.message.includes('429') || err.message.includes('rate');
          const isTimeout = err.message.includes('Timeout') || err.message.includes('ETIMEDOUT');

          if (isRateLimit && attempt < maxRetries - 1) {
            // Rotate key and retry with backoff
            this.stats.retries++;
            const delay = this.config.openrouter.retry_delay_ms * (attempt + 1);
            await this._sleep(delay);
            continue;
          }

          if (isTimeout || (isRateLimit && attempt === maxRetries - 1)) {
            // Move to next model in cascade
            break;
          }

          // Unknown error - try next model
          break;
        }
      }
    }

    throw new Error(`All models in cascade failed: ${modelCascade.join(', ')}`);
  }

  _request(model, messages, maxTokens, temperature, apiKey, timeout, tools) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const payload = { model, messages, temperature };
      if (maxTokens) payload.max_tokens = maxTokens;
      if (tools && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = 'auto';
      }
      const data = JSON.stringify(payload);

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://diana-corp.local',
          'X-Title': 'Agent Zero v2'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          const elapsed = Date.now() - startTime;
          try {
            const json = JSON.parse(body);
            if (json.error) {
              reject(new Error(`API ${res.statusCode}: ${json.error.message || JSON.stringify(json.error)}`));
              return;
            }
            // DeepSeek R1 / reasoning models put thinking in reasoning_content
            // OpenRouter may also wrap it differently
            const msg = json.choices?.[0]?.message || {};
            let content = msg.content || '';
            const reasoning = msg.reasoning_content || msg.reasoning || '';

            // If content is empty but reasoning exists, extract answer from reasoning
            if (!content && reasoning) {
              // Try to extract final answer after thinking
              const answerMatch = reasoning.match(/(?:final answer|answer|result|output)[:\s]*\n([\s\S]+)$/i);
              content = answerMatch ? answerMatch[1].trim() : reasoning;
            }

            const usage = json.usage || {};
            resolve({
              content,
              reasoning: reasoning || undefined,
              tool_calls: msg.tool_calls || [],
              model: json.model || model,
              tokens_in: usage.prompt_tokens || 0,
              tokens_out: usage.completion_tokens || 0,
              elapsed_ms: elapsed,
              finish_reason: json.choices?.[0]?.finish_reason || 'unknown'
            });
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.setTimeout(timeout, () => {
        req.destroy();
        reject(new Error(`Timeout ${timeout}ms for ${model}`));
      });
      req.write(data);
      req.end();
    });
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { ...this.stats };
  }
}

module.exports = { LLMClient };
