
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';
import { logger } from './utils/logger.js';

config();
logger.level = 'info';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const svc = getEmbeddingsService();

function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
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

async function debugSimilarity() {
    console.log('🕵️‍♀️ INVESTIGAÇÃO DE SIMILARIDADE LOCAL v2');

    const targetId = 290;
    console.log(`Targeting ID: ${targetId}`);

    // 1. Pegar vetor do banco
    const { data, error } = await supabase
        .from('corporate_memory')
        .select('id, content, embedding')
        .eq('id', targetId)
        .single();

    if (error) {
        console.error('Erro Supabase:', error);
        return;
    }

    const vectorDB = JSON.parse(data.embedding);
    console.log(`\nVetor DB (ID ${targetId}): ${vectorDB.length} dimensões.`);
    console.log(`DB Amostra: [${vectorDB.slice(0, 5).join(', ')}...]`);

    // 2. Gerar vetor da query
    const query = "Plano ultra-detalhado";
    console.log(`\nQuery: "${query}"`);
    const vectorQuery = await svc.generateEmbedding(query);
    console.log(`Vetor Query: ${vectorQuery.length} dimensões.`);
    console.log(`Query Amostra: [${vectorQuery.slice(0, 5).join(', ')}...]`);

    // 3. Comparar
    const similarity = cosineSimilarity(vectorDB, vectorQuery);
    console.log(`\n📊 SIMILARIDADE LOCAL CALCULADA: ${(similarity * 100).toFixed(4)}%`);

    // 4. Calcular diferença média
    let sumDiff = 0;
    for (let i = 0; i < vectorDB.length; i++) sumDiff += Math.abs(vectorDB[i] - vectorQuery[i]);
    console.log(`Diferença média por elemento: ${sumDiff / vectorDB.length}`);
}

debugSimilarity();
