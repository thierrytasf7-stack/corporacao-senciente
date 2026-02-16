#!/usr/bin/env node
/**
 * ANÁLISE DETALHADA DOS EMBEDDINGS DAS MEMÓRIAS
 * Verifica por que as memórias específicas não estão sendo encontradas
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function analyzeMemoryEmbeddings() {
    console.log('🔬 ANÁLISE DETALHADA DOS EMBEDDINGS...\n');

    // Buscar memórias específicas
    const { data: specificMemories, error } = await supabase
        .from('corporate_memory')
        .select('id, content, embedding')
        .in('id', [286, 285]);

    if (error) {
        console.error('❌ Erro ao buscar memórias:', error);
        return;
    }

    console.log('📄 ANÁLISE DAS MEMÓRIAS ESPECÍFICAS:\n');

    for (const mem of specificMemories || []) {
        console.log(`🔍 ID ${mem.id}:`);
        const content = typeof mem.content === 'string' ? mem.content : JSON.stringify(mem.content);
        console.log(`   📏 Tamanho do conteúdo: ${content.length} caracteres`);
        console.log(`   🧮 Embedding presente: ${mem.embedding ? '✅' : '❌'}`);
        console.log(`   📐 Dimensões do embedding: ${mem.embedding ? mem.embedding.length : 0}`);

        // Analisar o conteúdo
        const lines = content.split('\n');
        console.log(`   📝 Número de linhas: ${lines.length}`);
        console.log(`   🎯 Primeira linha: "${lines[0].substring(0, 100)}..."`);

        // Verificar se o conteúdo é JSON estruturado
        try {
            const parsed = JSON.parse(content);
            console.log(`   📊 Conteúdo é JSON válido: ✅`);
            if (parsed.content) {
                console.log(`   📝 Conteúdo real (primeiros 100 chars): "${parsed.content.substring(0, 100)}..."`);
            }
        } catch (e) {
            console.log(`   📊 Conteúdo é texto simples: ✅`);
        }

        console.log('');
    }

    // Testar queries específicas
    console.log('🔍 TESTANDO QUERIES ESPECÍFICAS:\n');

    const testQueries = [
        'Reestruturação Completa Corporação',
        'Plano ultra-detalhado para reestruturar',
        'AUDITORIA FINAL E OTIMIZAÇÃO',
        'MASTER PLAN',
        'Senciente',
        'Corporação'
    ];

    for (const query of testQueries) {
        console.log(`Query: "${query}"`);

        try {
            const queryEmbedding = await embeddingsService.generateEmbedding(query);

            // Calcular similaridade com memórias específicas
            for (const mem of specificMemories || []) {
                if (mem.embedding && mem.embedding.length === queryEmbedding.length) {
                    const similarity = cosineSimilarity(queryEmbedding, mem.embedding);
                    console.log(`   ID ${mem.id}: ${(similarity * 100).toFixed(2)}% similar`);
                }
            }

        } catch (err) {
            console.log(`   ❌ Erro: ${err.message}`);
        }

        console.log('');
    }

    // Comparar com uma memória que FUNCIONA
    console.log('🔄 COMPARANDO COM MEMÓRIA QUE FUNCIONA:\n');

    const { data: workingMemories } = await supabase
        .from('corporate_memory')
        .select('id, content, embedding')
        .in('id', [284]) // Memória que apareceu nos resultados anteriores
        .limit(1);

    if (workingMemories && workingMemories[0]) {
        const working = workingMemories[0];
        console.log(`✅ Memória funcional (ID ${working.id}):`);
        const workingContent = typeof working.content === 'string' ? working.content : JSON.stringify(working.content);
        console.log(`   📝 Conteúdo: "${workingContent.substring(0, 100)}..."`);
        console.log(`   📏 Tamanho: ${workingContent.length} caracteres`);

        // Testar similaridade com query que funcionou
        const testQuery = 'status atual projeto';
        const testEmbedding = await embeddingsService.generateEmbedding(testQuery);
        const similarity = cosineSimilarity(testEmbedding, working.embedding);

        console.log(`   🔍 Similaridade com "${testQuery}": ${(similarity * 100).toFixed(2)}%`);
    }

    console.log('\n🎯 CONCLUSÃO DA ANÁLISE:');
    console.log('As memórias estão no banco com embeddings, mas podem ter conteúdo');
    console.log('muito longo ou semanticamente distante das queries de teste.');
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

analyzeMemoryEmbeddings().catch(console.error);

