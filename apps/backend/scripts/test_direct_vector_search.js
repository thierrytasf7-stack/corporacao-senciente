#!/usr/bin/env node
/**
 * TESTE DE BUSCA VETORIAL DIRETA
 * Testa busca sem usar função RPC do Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function testDirectSearch() {
    console.log('🧪 TESTANDO BUSCA VETORIAL DIRETA (SEM RPC)...\n');

    // Gerar embedding para a query
    const query = 'Reestruturação Completa Corporação';
    console.log(`🔍 Query: "${query}"\n`);

    const queryEmbedding = await embeddingsService.generateEmbedding(query);
    console.log(`✅ Embedding gerado: ${queryEmbedding.length} dimensões\n`);

    // Buscar diretamente na tabela
    console.log('📊 BUSCANDO DIRETAMENTE NA TABELA:\n');

    const { data: memories, error } = await supabase
        .from('corporate_memory')
        .select('id, content, embedding')
        .limit(10);

    if (error) {
        console.error('❌ Erro na busca direta:', error);
        return;
    }

    console.log(`Encontrados ${memories?.length || 0} registros\n`);

    // Calcular similaridade manualmente
    const results = [];
    for (const memory of memories || []) {
        if (memory.embedding && memory.embedding.length === queryEmbedding.length) {
            const similarity = cosineSimilarity(queryEmbedding, memory.embedding);
            results.push({
                id: memory.id,
                similarity: similarity,
                content: memory.content.substring(0, 100) + '...'
            });
        }
    }

    // Ordenar por similaridade
    results.sort((a, b) => b.similarity - a.similarity);

    console.log('🔝 TOP 5 RESULTADOS POR SIMILARIDADE:\n');
    results.slice(0, 5).forEach((result, i) => {
        console.log(`${i+1}. ID ${result.id} - ${(result.similarity * 100).toFixed(1)}% similar`);
        console.log(`   ${result.content}\n`);
    });

    // Verificar se IDs específicos estão sendo encontrados
    const targetIds = [286, 285];
    console.log('🎯 VERIFICAÇÃO DE IDs ESPECÍFICOS:\n');

    targetIds.forEach(targetId => {
        const found = results.find(r => r.id === targetId);
        if (found) {
            console.log(`✅ ID ${targetId} encontrado - ${(found.similarity * 100).toFixed(1)}% similar`);
        } else {
            console.log(`❌ ID ${targetId} NÃO encontrado nos resultados`);
        }
    });
}

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

testDirectSearch().catch(console.error);

