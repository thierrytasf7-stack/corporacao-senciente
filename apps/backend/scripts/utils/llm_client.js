/**
 * LLM Client Wrapper
 * 
 * Centraliza chamadas para múltiplos LLMs com fallback inteligente:
 * - Grok (principal)
 * - Gemini (fallback)
 * - Ollama (local, sem rate limits) - ideal para treinamento
 * - Together AI (alternativa sem rate limits)
 * 
 * Compatível com frameworks ReAct, ToT, etc.
 */

import { config } from 'dotenv';
import fs from 'fs';

// Carregar env.local primeiro (tem as chaves reais), depois .env
const envLocalPath = './env.local';
const envPath = './.env';

if (fs.existsSync(envLocalPath)) {
    config({ path: envLocalPath });
    console.log('✅ Carregado env.local');
} else {
    console.warn('⚠️ env.local não encontrado');
}

if (fs.existsSync(envPath)) {
    config({ path: envPath });
    console.log('✅ Carregado .env');
} else {
    console.warn('⚠️ .env não encontrado');
}

const {
    GROK_API_KEY,
    GROK_MODEL = 'grok-beta',
    GEMINI_API_KEY,
    GEMINI_MODEL = 'gemini-1.5-flash',
    GROK_TIMEOUT_MS = '20000',
    GROK_MAX_RETRIES = '2',
    // Ollama (local)
    OLLAMA_ENABLED = 'false',
    OLLAMA_BASE_URL = 'http://localhost:11434',
    OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b',
    OLLAMA_MODEL_FALLBACK = process.env.OLLAMA_MODEL_FALLBACK || 'qwen3:4b',
    // Together AI (alternativa sem rate limits)
    TOGETHER_API_KEY,
    TOGETHER_MODEL = 'meta-llama/Llama-3-8b-chat-hf',
    // Configuração de fallback - Prioridade: Grok > Gemini > Ollama
    LLM_PRIORITY = 'grok,gemini,ollama', // Ordem de prioridade
    USE_LOCAL_FOR_TRAINING = 'true', // Usar Ollama para treinamento se disponível
} = process.env;

const grokTimeout = Number(GROK_TIMEOUT_MS);
const grokMaxRetries = Number(GROK_MAX_RETRIES);
const ollamaEnabled = OLLAMA_ENABLED === 'true';
const useLocalForTraining = USE_LOCAL_FOR_TRAINING === 'true';

/**
 * Chama Grok API com tratamento melhorado de rate limits
 */
async function callGrok(prompt, systemPrompt = '', temperature = 0.7, options = {}) {
    if (!GROK_API_KEY) {
        throw new Error('GROK_API_KEY não configurado');
    }

    let attempt = 0;
    let lastErr;
    const modelsToTry = [GROK_MODEL].filter(v => v);

    for (const model of modelsToTry) {
        attempt = 0;
        while (attempt <= grokMaxRetries) {
            attempt += 1;
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), grokTimeout);

            try {
                const messages = [];
                if (systemPrompt) {
                    messages.push({ role: 'system', content: systemPrompt });
                }
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${GROK_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model,
                        temperature,
                        messages,
                        max_tokens: options.maxTokens || 4000,
                        ...options,
                    }),
                });

                clearTimeout(to);

                if (!res.ok) {
                    const errTxt = await res.text();
                    const status = res.status;

                    // Tratamento específico para rate limits
                    if (status === 429) {
                        const retryAfter = res.headers.get('retry-after');
                        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // 1 minuto padrão
                        console.warn(`⚠️ Grok rate limit atingido. Aguardando ${waitTime / 1000}s...`);

                        if (attempt <= grokMaxRetries) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue; // Retry
                        }
                        throw new Error(`Grok rate limit: ${errTxt}`);
                    }

                    // Outros erros
                    if (status >= 500) {
                        // Erro do servidor, tentar novamente
                        if (attempt <= grokMaxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Backoff exponencial
                            continue;
                        }
                    }

                    throw new Error(`Grok API error: ${status} ${errTxt}`);
                }

                const data = await res.json();
                const content = data?.choices?.[0]?.message?.content;
                if (content) {
                    return content;
                } else {
                    throw new Error('Resposta vazia do Grok');
                }

            } catch (error) {
                lastErr = error;
                clearTimeout(to);

                if (error.name === 'AbortError') {
                    if (attempt <= grokMaxRetries) {
                        console.warn(`⚠️ Grok timeout, tentativa ${attempt}/${grokMaxRetries + 1}`);
                        continue;
                    }
                    throw new Error(`Grok timeout após ${grokMaxRetries + 1} tentativas`);
                }

                // Se é o último modelo e última tentativa, não continuar
                if (model === modelsToTry[modelsToTry.length - 1] && attempt > grokMaxRetries) {
                    break;
                }
            }
        }
    }

    throw lastErr || new Error('Grok falhou em todos os modelos');
}

/**
 * Chama Grok API com suporte a streaming
 */
async function callGrokStream(prompt, systemPrompt = '', temperature = 0.7, options = {}, onToken) {
    if (!GROK_API_KEY) {
        throw new Error('GROK_API_KEY não configurado');
    }

    let attempt = 0;
    let lastErr;
    const modelsToTry = [GROK_MODEL].filter(v => v);

    for (const model of modelsToTry) {
        attempt = 0;
        while (attempt <= grokMaxRetries) {
            attempt += 1;
            const controller = new AbortController();
            const to = setTimeout(() => controller.abort(), grokTimeout);

            try {
                const messages = [];
                if (systemPrompt) {
                    messages.push({ role: 'system', content: systemPrompt });
                }
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${GROK_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model,
                        temperature,
                        messages,
                        ...options,
                    }),
                });

                clearTimeout(to);

                if (!res.ok) {
                    const errTxt = await res.text();
                    const status = res.status;

                    // Tratamento específico para rate limits
                    if (status === 429) {
                        const retryAfter = res.headers.get('retry-after');
                        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // 1 minuto padrão
                        throw new Error(`RATE_LIMIT:${waitTime}:${errTxt}`);
                    }

                    throw new Error(`Grok API error: ${status} ${errTxt}`);
                }

                const data = await res.json();
                return data?.choices?.[0]?.message?.content ?? '';
            } catch (err) {
                lastErr = err;

                // Se for rate limit, aguardar tempo específico
                if (err.message?.startsWith('RATE_LIMIT:')) {
                    const [, waitTime] = err.message.split(':');
                    const waitMs = parseInt(waitTime) || 60000;
                    console.warn(`⚠️ Rate limit do Grok. Aguardando ${waitMs / 1000}s...`);
                    await new Promise(r => setTimeout(r, waitMs));
                    continue; // Tentar novamente
                }

                if (attempt > grokMaxRetries) break;
                const backoff = 200 * attempt;
                await new Promise(r => setTimeout(r, backoff));
            }
        }
    }

    throw lastErr || new Error('Grok API falhou após todas as tentativas');
}


/**
 * Chama Gemini API
 */
async function callGemini(prompt, systemPrompt = '', temperature = 0.7) {
    if (!GEMINI_API_KEY) {
        return null;
    }

    try {
        const contents = [];
        if (systemPrompt) {
            contents.push({
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
            });
        } else {
            contents.push({
                role: 'user',
                parts: [{ text: prompt }],
            });
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: { temperature },
                }),
            }
        );

        if (!res.ok) return null;

        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        return null;
    }
}

/**
 * Chama Ollama (modelo local, sem rate limits)
 * Otimizado para performance: timeout, num_predict limitado, etc
 */
async function callOllama(prompt, systemPrompt = '', temperature = 0.7, options = {}) {
    if (!ollamaEnabled) {
        return null;
    }

    const {
        maxTokens = 500,
        timeout = 60000,
        useFallback = true, // Tentar modelo fallback se o principal falhar
    } = options;

    const models = useFallback ? [OLLAMA_MODEL, OLLAMA_MODEL_FALLBACK] : [OLLAMA_MODEL];

    for (const model of models) {
        try {
            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages,
                    options: {
                        temperature,
                        num_predict: maxTokens,
                        num_ctx: 4096,
                    },
                    stream: false,
                }),
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                const content = data?.message?.content || null;
                if (content) {
                    if (model !== OLLAMA_MODEL) {
                        console.log(`✅ Usando modelo fallback: ${model}`);
                    }
                    return content;
                }
            } else if (res.status === 404 && model === OLLAMA_MODEL && useFallback) {
                // Modelo não encontrado, tentar fallback
                console.warn(`⚠️ Modelo ${model} não encontrado, tentando fallback...`);
                continue;
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                if (model === OLLAMA_MODEL && useFallback) {
                    console.warn(`⚠️ ${model} timeout, tentando fallback...`);
                    continue; // Tentar próximo modelo
                } else {
                    console.warn(`⚠️ Ollama timeout - resposta muito longa (${model})`);
                }
            }
            // Se não for o último modelo, continuar para o próximo
            if (model !== models[models.length - 1]) {
                continue;
            }
        }
    }

    return null; // Todos os modelos falharam
}

/**
 * Chama Together AI (alternativa sem rate limits)
 */
async function callTogether(prompt, systemPrompt = '', temperature = 0.7) {
    if (!TOGETHER_API_KEY) {
        return null;
    }

    try {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const res = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOGETHER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: TOGETHER_MODEL,
                messages,
                temperature,
            }),
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data?.choices?.[0]?.message?.content || null;
    } catch (error) {
        return null;
    }
}

/**
 * Verifica se Ollama está disponível
 */
export async function checkOllamaAvailable() {
    if (!ollamaEnabled) {
        return false;
    }

    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000),
        });
        return res.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Chama LLM com fallback inteligente
 * Prioridade: Grok -> Ollama (se treinamento) -> Gemini -> Together
 */
export async function callLLM(prompt, systemPrompt = '', temperature = 0.7, options = {}) {
    const isTraining = options.isTraining || false;

    // Se for treinamento e Ollama estiver habilitado, tentar primeiro
    if (isTraining && useLocalForTraining && ollamaEnabled) {
        try {
            const available = await checkOllamaAvailable();
            if (available) {
                // Para treinamento, dar mais liberdade ao Ollama
                const result = await callOllama(prompt, systemPrompt, temperature, {
                    maxTokens: options.maxTokens || 400, // Respostas melhores
                    timeout: options.timeout || 45000, // 45s timeout para treinamento (mais liberdade)
                });
                if (result) {
                    console.log('✅ Usando Ollama (local) para treinamento');
                    return result;
                }
            }
        } catch (error) {
            console.warn('⚠️ Ollama não disponível, usando fallback');
        }
    }

    // Se for treinamento, pular Grok (pode ter key inválida) e ir direto para Ollama/Gemini
    if (isTraining) {
        // Para treinamento, pular Grok e usar Ollama ou Gemini diretamente
        if (ollamaEnabled) {
            try {
                const available = await checkOllamaAvailable();
                if (available) {
                    // Dar mais liberdade ao Ollama - retries e timeouts maiores
                    const ollamaResult = await callOllama(prompt, systemPrompt, temperature, {
                        maxTokens: options.maxTokens || 400, // Respostas melhores
                        timeout: options.timeout || 45000, // 45s timeout para treinamento (muito mais liberdade)
                    });
                    if (ollamaResult) {
                        return ollamaResult;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Ollama falhou no treinamento, tentando Gemini...');
            }
        }

        // Se Ollama falhou, tentar Gemini
        const geminiResult = await callGemini(prompt, systemPrompt, temperature);
        if (geminiResult) {
            console.log('✅ Usando Gemini (fallback para treinamento)');
            return geminiResult;
        }

        // Última tentativa: Together AI
        const togetherResult = await callTogether(prompt, systemPrompt, temperature);
        if (togetherResult) {
            console.log('✅ Usando Together AI (fallback para treinamento)');
            return togetherResult;
        }

        throw new Error('LLM falhou: Ollama, Gemini e Together falharam');
    }

    // Ordem de prioridade: Grok → Gemini → Ollama
    console.log('🎯 Tentando Grok primeiro...');
    try {
        const result = await callGrok(prompt, systemPrompt, temperature, options);
        console.log('✅ Usando Grok');
        return result;
    } catch (error) {
        console.warn(`⚠️ Grok falhou: ${error.message}`);

        // Fallback para Gemini
        console.log('🎯 Tentando Gemini...');
        try {
            const geminiResult = await callGemini(prompt, systemPrompt, temperature);
            if (geminiResult) {
                console.log('✅ Usando Gemini (fallback)');
                return geminiResult;
            }
        } catch (geminiError) {
            console.warn(`⚠️ Gemini falhou: ${geminiError.message}`);
        }

        // Última tentativa: Ollama local
        if (ollamaEnabled) {
            console.log('🎯 Tentando Ollama (local)...');
            try {
                const ollamaResult = await callOllama(prompt, systemPrompt, temperature);
                if (ollamaResult) {
                    console.log('✅ Usando Ollama (fallback local)');
                    return ollamaResult;
                }
            } catch (ollamaError) {
                console.warn(`⚠️ Ollama falhou: ${ollamaError.message}`);
            }
        }

        throw new Error(`Todos os LLMs falharam. Último erro: ${error.message}`);
    }
}

/**
 * Wrapper simples para frameworks que esperam apenas prompt
 */
export async function simpleLLMCall(prompt, options = {}) {
    const { systemPrompt = '', temperature = 0.7 } = options;
    return await callLLM(prompt, systemPrompt, temperature);
}

/**
 * Chama LLM com suporte a streaming e fallback inteligente
 */
export async function callLLMStream(prompt, systemPrompt = '', temperature = 0.7, options = {}, onToken) {
    if (typeof onToken !== 'function') {
        throw new Error('onToken callback deve ser uma função');
    }

    const isTraining = options.isTraining || false;

    // Se for treinamento e Ollama estiver habilitado, tentar primeiro
    if (isTraining && useLocalForTraining && ollamaEnabled) {
        try {
            const available = await checkOllamaAvailable();
            if (available) {
                console.log('✅ Usando Ollama (local) para treinamento com streaming');
                // Nota: Ollama ainda não suporta streaming neste cliente, usar fallback para callLLM normal
                const result = await callLLM(prompt, systemPrompt, temperature, options);
                // Simular streaming token por token
                const words = result.split(' ');
                let currentText = '';
                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
                    currentText += (i > 0 ? ' ' : '') + words[i];
                    onToken(words[i], currentText);
                }
                return result;
            }
        } catch (error) {
            console.warn('⚠️ Ollama streaming falhou, usando fallback');
        }
    }

    // Tentar Grok com streaming
    try {
        console.log('🎯 Tentando Grok com streaming...');
        return await callGrokStream(prompt, systemPrompt, temperature, options, onToken);
    } catch (error) {
        console.warn('⚠️ Grok streaming falhou, tentando fallback:', error.message);

        // Fallback: usar callLLM normal e simular streaming
        try {
            const result = await callLLM(prompt, systemPrompt, temperature, options);

            if (result) {
                // Simular streaming token por token com atraso realista
                const words = result.split(' ');
                let currentText = '';
                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 70)); // 30-100ms por palavra
                    const token = (i > 0 ? ' ' : '') + words[i];
                    currentText += token;
                    onToken(token, currentText);
                }
                return result;
            } else {
                // Se não conseguiu resposta, gerar uma resposta simulada
                const simulatedResponse = `Desculpe, estou tendo dificuldades para conectar com os serviços de IA no momento. Sua pergunta foi: "${prompt}". Como sistema de fallback, posso sugerir algumas alternativas ou tentar novamente em alguns instantes.`;

                const words = simulatedResponse.split(' ');
                let currentText = '';
                for (let i = 0; i < words.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
                    const token = (i > 0 ? ' ' : '') + words[i];
                    currentText += token;
                    onToken(token, currentText);
                }
                return simulatedResponse;
            }
        } catch (fallbackError) {
            console.error('❌ Falha completa no streaming:', fallbackError.message);

            // Último fallback: resposta simulada
            const errorResponse = `Erro no sistema de streaming: ${fallbackError.message}. O sistema está funcionando em modo degradado.`;

            const words = errorResponse.split(' ');
            let currentText = '';
            for (let i = 0; i < words.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 20));
                const token = (i > 0 ? ' ' : '') + words[i];
                currentText += token;
                onToken(token, currentText);
            }
            return errorResponse;
        }
    }
}

export default {
    callLLM,
    callLLMStream,
    simpleLLMCall,
    callGrok,
    callGrokStream,
    callGemini,
    callOllama,
    callTogether,
    checkOllamaAvailable,
};

