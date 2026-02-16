#!/usr/bin/env node
/**
 * Embeddings Service - Serviço de Embeddings Avançado
 *
 * Suporte a múltiplos provedores: OpenAI, Ollama, Xenova, etc.
 */

import { createHash } from 'crypto';
import { config } from 'dotenv';
import fs from 'fs';
import { logger } from './logger.js';

const log = logger.child({ module: 'embeddings_service' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    OPENAI_API_KEY,
    OLLAMA_BASE_URL = 'http://localhost:11434',
    EMBEDDINGS_PROVIDER = 'xenova', // xenova | openai | ollama
    EMBEDDINGS_MODEL = 'Xenova/bge-small-en-v1.5'
} = process.env;

/**
 * Serviço de Embeddings
 */
class EmbeddingsService {
    constructor() {
        this.provider = EMBEDDINGS_PROVIDER;
        this.model = EMBEDDINGS_MODEL;
        this.cache = new Map(); // Cache em memória
        this.cacheFile = './data/embeddings_cache.json';
        this.loadCache();

        log.info('EmbeddingsService initialized', { provider: this.provider, model: this.model });
    }

    /**
     * Gera embeddings para texto
     *
     * @param {string} text - Texto para gerar embeddings
     * @returns {Promise<array>} Vetor de embeddings
     */
    async generateEmbedding(text) {
        if (!text || text.trim().length === 0) {
            throw new Error('Text cannot be empty');
        }

        // Verificar cache primeiro
        const hash = this.generateTextHash(text);
        if (this.cache.has(hash)) {
            log.debug('Embedding cache hit', { hash });
            return this.cache.get(hash);
        }

        let embedding;

        try {
            switch (this.provider.toLowerCase()) {
                case 'openai':
                    embedding = await this.generateOpenAIEmbedding(text);
                    break;
                case 'ollama':
                    embedding = await this.generateOllamaEmbedding(text);
                    break;
                case 'xenova':
                default:
                    embedding = await this.generateXenovaEmbedding(text);
                    break;
            }

            // Manter dimensões originais (384) - compatível com configuração atual do Supabase

            // Armazenar no cache
            this.cache.set(hash, embedding);
            this.saveCache();

            return embedding;
        } catch (error) {
            log.error('Error generating embedding', {
                error: error.message,
                provider: this.provider,
                textLength: text.length
            });

            // Fallback para implementação básica
            return this.generateFallbackEmbedding(text);
        }
    }

    /**
     * Gera embedding usando OpenAI
     */
    async generateOpenAIEmbedding(text) {
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: text,
                model: 'text-embedding-3-small', // 1536 dimensions
                encoding_format: 'float'
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    }

    /**
     * Gera embedding usando Ollama
     */
    async generateOllamaEmbedding(text) {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                prompt: text
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.embedding;
    }

    /**
     * Gera embedding usando Xenova/transformers
     */
    async generateXenovaEmbedding(text) {
        try {
            // Usar Xenova/transformers via CDN ou implementação local
            const { pipeline } = await import('@xenova/transformers');

            // Inicializar pipeline de embeddings (cache automático)
            const extractor = await pipeline('feature-extraction', this.model);

            // Gerar embedding
            const output = await extractor(text, { pooling: 'mean', normalize: true });

            // Converter para array
            return Array.from(output.data);
        } catch (error) {
            log.warn('Xenova/transformers not available, using fallback', { error: error.message });
            throw error; // Deixar cair para fallback
        }
    }

    /**
     * Fallback: implementação básica baseada em hash
     */
    generateFallbackEmbedding(text) {
        log.warn('Using fallback embedding implementation');

        const hash = createHash('md5').update(text).digest('hex');
        const vector = [];

        // Gerar vetor de 384 dimensões (compatível com Xenova)
        for (let i = 0; i < 384; i++) {
            const byte = parseInt(hash.substr((i % 32) * 2, 2), 16);
            vector.push((byte / 255.0) * 2 - 1); // Normalizar para [-1, 1]
        }

        return vector;
    }

    /**
     * Calcula similaridade cosseno entre dois vetores
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (normA * normB);
    }

    /**
     * Busca textos similares baseado em embeddings
     */
    async findSimilar(text, candidates, limit = 5) {
        const queryEmbedding = await this.generateEmbedding(text);
        const similarities = [];

        for (const candidate of candidates) {
            try {
                const candidateEmbedding = await this.generateEmbedding(candidate.text);
                const similarity = this.cosineSimilarity(queryEmbedding, candidateEmbedding);

                similarities.push({
                    ...candidate,
                    similarity
                });
            } catch (error) {
                log.warn('Error computing similarity for candidate', {
                    candidate: candidate.text?.substring(0, 50),
                    error: error.message
                });
            }
        }

        // Ordenar por similaridade decrescente
        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, limit);
    }

    /**
     * Gera hash único para texto
     */
    generateTextHash(text) {
        return createHash('sha256').update(text).digest('hex');
    }

    /**
     * Carrega cache do disco
     */
    loadCache() {
        try {
            if (fs.existsSync(this.cacheFile)) {
                const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
                this.cache = new Map(Object.entries(data.cache || {}));
                log.info('Embeddings cache loaded', { entries: this.cache.size });
            }
        } catch (error) {
            log.warn('Failed to load embeddings cache', { error: error.message });
        }
    }

    /**
     * Salva cache no disco
     */
    saveCache() {
        try {
            const data = {
                cache: Object.fromEntries(this.cache),
                timestamp: new Date().toISOString(),
                provider: this.provider,
                model: this.model
            };

            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
            log.debug('Embeddings cache saved', { entries: this.cache.size });
        } catch (error) {
            log.warn('Failed to save embeddings cache', { error: error.message });
        }
    }

    /**
     * Limpa cache
     */
    clearCache() {
        this.cache.clear();
        this.saveCache();
        log.info('Embeddings cache cleared');
    }

    /**
     * Obtém estatísticas
     */
    getStats() {
        return {
            provider: this.provider,
            model: this.model,
            cacheSize: this.cache.size,
            cacheFile: this.cacheFile
        };
    }

    /**
     * Padroniza dimensões do embedding para compatibilidade com Supabase
     *
     * @param {array} embedding - Embedding original
     * @param {number} targetDimensions - Dimensões desejadas (768)
     * @returns {array} Embedding padronizado
     */
    standardizeEmbeddingDimensions(embedding, targetDimensions) {
        // CORREÇÃO (Via Sync Global): Não forçar expansão para 768 se for 384.
        // O sistema agora opera nativamente em 384 dimensões (Xenova bge-small).
        return embedding;
    }


}

// Singleton
let embeddingsInstance = null;


export default EmbeddingsService;

export function getEmbeddingsService() {
    if (!embeddingsInstance) {
        embeddingsInstance = new EmbeddingsService();
    }
    return embeddingsInstance;
}
