/**
 * Utilitário de Embedding
 * 
 * Gera embeddings usando Xenova/bge-small-en-v1.5 (384 dimensões)
 */

import { pipeline } from '@xenova/transformers';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    MCP_EMBEDDING_MODEL = 'Xenova/bge-small-en-v1.5',
} = process.env;

let embedder = null;
const embedCache = new Map();

/**
 * Obtém o modelo de embedding (lazy loading)
 */
async function getEmbedder() {
    if (embedder) return embedder;

    try {
        embedder = await pipeline('feature-extraction', MCP_EMBEDDING_MODEL, {
            quantized: true,
        });
        return embedder;
    } catch (error) {
        console.error('❌ Erro ao carregar modelo de embedding:', error.message);
        throw error;
    }
}

/**
 * Gera embedding para um texto
 */
export async function embed(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.warn('⚠️  Texto vazio fornecido para embedding');
        return null;
    }

    // Verificar cache
    const cacheKey = text.trim().toLowerCase();
    if (embedCache.has(cacheKey)) {
        return embedCache.get(cacheKey);
    }

    try {
        const model = await getEmbedder();
        const output = await model(text, {
            pooling: 'mean',
            normalize: true,
        });

        // Converter tensor para array
        const embedding = Array.from(output.data);

        // Validar dimensão (deve ser 384)
        if (embedding.length !== 384) {
            console.warn(`⚠️  Embedding tem ${embedding.length} dimensões, esperado 384`);
        }

        // Armazenar no cache
        embedCache.set(cacheKey, embedding);

        return embedding;
    } catch (error) {
        console.error('❌ Erro ao gerar embedding:', error.message);
        return null;
    }
}

/**
 * Gera embeddings em batch
 */
export async function embedBatch(texts, batchSize = 10) {
    const embeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
            batch.map(text => embed(text))
        );
        embeddings.push(...batchEmbeddings);
    }

    return embeddings;
}

/**
 * Limpa o cache de embeddings
 */
export function clearEmbedCache() {
    embedCache.clear();
}

/**
 * Obtém estatísticas do cache
 */
export function getCacheStats() {
    return {
        size: embedCache.size,
        keys: Array.from(embedCache.keys()).slice(0, 10), // Primeiras 10 chaves
    };
}

export default {
    embed,
    embedBatch,
    clearEmbedCache,
    getCacheStats,
};

























