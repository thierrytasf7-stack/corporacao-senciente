#!/usr/bin/env node
/**
 * Prompt Cache - Sistema de Cache de Prompts
 *
 * Cache de prompts eficazes para reduzir latência e custos
 */

import { createHash } from 'crypto';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'prompt_cache' });

/**
 * Classe para cache de prompts
 */
export class PromptCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.maxSize = options.maxSize || 10000;
        this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 horas
        this.minSuccessRate = options.minSuccessRate || 0.8; // 80%
        this.similarityThreshold = options.similarityThreshold || 0.85;
        this.persistencePath = options.persistencePath || './data/prompt_cache.json';
        this.stats = {
            hits: 0,
            misses: 0,
            similarityHits: 0,
            expired: 0,
            size: 0
        };
    }

    /**
     * Gera hash único para um prompt
     *
     * @param {string} prompt - Prompt a ser hasheado
     * @param {object} context - Contexto adicional
     * @returns {string} Hash do prompt
     */
    generatePromptHash(prompt, context = {}) {
        const content = JSON.stringify({
            prompt: prompt,
            context: context,
            // Incluir versão do sistema para invalidar cache quando houver mudanças
            version: process.env.PROMPT_CACHE_VERSION || '1.0'
        });
        return createHash('sha256').update(content).digest('hex');
    }

    /**
     * Verifica se entrada de cache está expirada
     *
     * @param {object} entry - Entrada do cache
     * @returns {boolean} true se expirada
     */
    isExpired(entry) {
        return Date.now() - entry.timestamp > this.ttl;
    }

    /**
     * Armazena resultado de prompt no cache
     *
     * @param {string} prompt - Prompt executado
     * @param {object} context - Contexto
     * @param {object} result - Resultado da execução
     * @param {object} metadata - Metadados (tempo, sucesso, etc.)
     */
    store(prompt, context, result, metadata = {}) {
        // Só armazena se taxa de sucesso for suficiente
        if (metadata.successRate !== undefined && metadata.successRate < this.minSuccessRate) {
            log.debug('Not caching prompt with low success rate', {
                successRate: metadata.successRate,
                minRequired: this.minSuccessRate
            });
            return;
        }

        const hash = this.generatePromptHash(prompt, context);
        const entry = {
            hash,
            prompt: prompt.substring(0, 500), // Limitar tamanho para eficiência
            context,
            result,
            metadata,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now()
        };

        // Manter tamanho máximo do cache
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        this.cache.set(hash, entry);
        this.stats.size = this.cache.size;

        log.debug('Cached prompt', { hash, successRate: metadata.successRate });
    }

    /**
     * Recupera resultado do cache
     *
     * @param {string} prompt - Prompt a buscar
     * @param {object} context - Contexto
     * @returns {object|null} Resultado do cache ou null
     */
    get(prompt, context) {
        const hash = this.generatePromptHash(prompt, context);
        const entry = this.cache.get(hash);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (this.isExpired(entry)) {
            this.cache.delete(hash);
            this.stats.expired++;
            this.stats.size = this.cache.size;
            return null;
        }

        // Atualizar estatísticas de acesso
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        this.stats.hits++;
        log.debug('Cache hit', { hash, accessCount: entry.accessCount });

        return {
            result: entry.result,
            metadata: entry.metadata,
            cached: true,
            hash
        };
    }

    /**
     * Busca resultado similar baseado em similaridade de prompt
     *
     * @param {string} prompt - Prompt atual
     * @param {object} context - Contexto
     * @returns {object|null} Resultado similar ou null
     */
    getSimilar(prompt, context) {
        const currentEmbedding = this.generateEmbedding(prompt + JSON.stringify(context));

        for (const [hash, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(hash);
                continue;
            }

            const entryText = entry.prompt + JSON.stringify(entry.context);
            const entryEmbedding = this.generateEmbedding(entryText);

            const similarity = this.cosineSimilarity(currentEmbedding, entryEmbedding);

            if (similarity >= this.similarityThreshold) {
                // Atualizar estatísticas de acesso
                entry.accessCount++;
                entry.lastAccessed = Date.now();

                this.stats.similarityHits++;
                log.debug('Similarity cache hit', {
                    similarity: similarity.toFixed(3),
                    originalHash: hash
                });

                return {
                    result: entry.result,
                    metadata: entry.metadata,
                    cached: true,
                    similarity,
                    hash
                };
            }
        }

        return null;
    }

    /**
     * Gera embedding simplificado (versão básica)
     * Nota: Em produção, usar um modelo real como OpenAI embeddings
     *
     * @param {string} text - Texto para embedding
     * @returns {array} Vetor de embedding
     */
    generateEmbedding(text) {
        // Implementação simplificada baseada em hash
        // Em produção, substituir por embeddings reais
        const hash = createHash('md5').update(text).digest('hex');
        const vector = [];

        for (let i = 0; i < 10; i++) {
            vector.push(parseInt(hash.substr(i * 2, 2), 16) / 255.0);
        }

        return vector;
    }

    /**
     * Calcula similaridade cosseno entre dois vetores
     *
     * @param {array} a - Vetor A
     * @param {array} b - Vetor B
     * @returns {number} Similaridade (0-1)
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
     * Remove entrada mais antiga do cache
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            log.debug('Evicted oldest cache entry');
        }
    }

    /**
     * Limpa entradas expiradas
     */
    cleanupExpired() {
        const expiredKeys = [];

        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));
        this.stats.size = this.cache.size;

        log.info('Cleaned up expired cache entries', { count: expiredKeys.length });
    }

    /**
     * Obtém estatísticas do cache
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.similarityHits + this.stats.misses > 0
            ? (this.stats.hits + this.stats.similarityHits) / (this.stats.hits + this.stats.similarityHits + this.stats.misses)
            : 0;

        return {
            ...this.stats,
            hitRate: hitRate * 100,
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }

    /**
     * Limpa todo o cache
     */
    clear() {
        this.cache.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            similarityHits: 0,
            expired: 0,
            size: 0
        };
        log.info('Cache cleared');
    }

    /**
     * Persiste cache em disco
     */
    async persist() {
        try {
            const fs = await import('fs/promises');
            const data = {
                cache: Array.from(this.cache.entries()),
                stats: this.stats,
                timestamp: Date.now()
            };

            await fs.writeFile(this.persistencePath, JSON.stringify(data, null, 2));
            log.info('Cache persisted to disk', { path: this.persistencePath });
        } catch (error) {
            log.error('Failed to persist cache', { error: error.message });
        }
    }

    /**
     * Carrega cache do disco
     */
    async load() {
        try {
            const fs = await import('fs/promises');
            const data = JSON.parse(await fs.readFile(this.persistencePath, 'utf8'));

            // Validar dados
            if (data.cache && Array.isArray(data.cache)) {
                this.cache = new Map(data.cache);
                this.stats = data.stats || this.stats;

                // Limpar entradas expiradas após carregamento
                this.cleanupExpired();

                log.info('Cache loaded from disk', {
                    entries: this.cache.size,
                    path: this.persistencePath
                });
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                log.error('Failed to load cache', { error: error.message });
            }
        }
    }
}

// Singleton global
let globalCache = null;

/**
 * Obtém instância global do PromptCache
 *
 * @param {object} options - Opções do cache
 * @returns {PromptCache} Instância global
 */
export function getPromptCache(options = {}) {
    if (!globalCache) {
        globalCache = new PromptCache(options);
    }
    return globalCache;
}

export default PromptCache;
