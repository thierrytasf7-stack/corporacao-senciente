
import EmbeddingsService from './utils/embeddings_service.js';
import { logger } from './utils/logger.js';

logger.level = 'error'; // Silence info logs

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function testSanity() {
    const svc = new EmbeddingsService();
    console.log('🧪 Teste de Sanidade de Embeddings (Xenova/bge-small-en-v1.5)');

    const e1 = await svc.generateEmbedding("gato");
    const e2 = await svc.generateEmbedding("gato");
    const e3 = await svc.generateEmbedding("felino");
    const e4 = await svc.generateEmbedding("constituição federal");

    console.log(`\nDimensões do vetor: ${e1.length}`);

    // Test 1: Determinism
    const sim1_2 = cosineSimilarity(e1, e2);
    console.log(`1. Determinismo ("gato" vs "gato"): ${(sim1_2 * 100).toFixed(4)}% (Esperado: 100%)`);

    if (sim1_2 < 0.9999) console.error('   ❌ FALHA: Embeddings não determinísticos!');
    else console.log('   ✅ OK');

    // Test 2: Semantics
    const sim1_3 = cosineSimilarity(e1, e3);
    console.log(`2. Semântica ("gato" vs "felino"): ${(sim1_3 * 100).toFixed(4)}% (Esperado: > 60%)`);

    if (sim1_3 < 0.5) console.warn('   ⚠️ ALERTA: Similaridade semântica baixa.');
    else console.log('   ✅ OK');

    // Test 3: Distinction
    const sim1_4 = cosineSimilarity(e1, e4);
    console.log(`3. Distinção ("gato" vs "constituição federal"): ${(sim1_4 * 100).toFixed(4)}% (Esperado: < 40%)`);

    if (sim1_4 > 0.6) console.warn('   ⚠️ ALERTA: Diferenciação ruim.');
    else console.log('   ✅ OK');
}

testSanity();
