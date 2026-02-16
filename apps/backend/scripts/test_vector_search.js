#!/usr/bin/env node
/**
 * TESTE DE BUSCA VETORIAL - DIAGNÓSTICO DE PROBLEMAS
 *
 * Verifica se as memórias novas estão sendo indexadas corretamente
 * e se a busca vetorial está funcionando.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

async function testVectorSearch() {
    console.log('🔍 TESTANDO BUSCA VETORIAL - DIAGNÓSTICO COMPLETO\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Credenciais Supabase não encontradas');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const embeddingsService = getEmbeddingsService();

    try {
        // 1. Verificar memórias mais recentes no banco
        console.log('1️⃣ MEMÓRIAS MAIS RECENTES NO BANCO:');
        const { data: memories, error: memError } = await supabase
            .from('corporate_memory')
            .select('id, content, category, created_at, embedding')
            .order('created_at', { ascending: false })
            .limit(5);

        if (memError) {
            console.error('❌ Erro ao buscar memórias:', memError);
            return;
        }

        memories.forEach((mem, i) => {
            const content = typeof mem.content === 'string' ? mem.content : JSON.stringify(mem.content);
            const hasEmbedding = mem.embedding && mem.embedding.length > 10;
            console.log(`   [${i+1}] ID ${mem.id} - ${content.substring(0, 60)}...`);
            console.log(`       📅 Criado: ${new Date(mem.created_at).toLocaleString()}`);
            console.log(`       🏷️  Categoria: ${mem.category}`);
            console.log(`       🧮 Embedding: ${hasEmbedding ? '✅ Presente' : '❌ AUSENTE'} (${mem.embedding ? mem.embedding.length : 0} chars)`);
            console.log('');
        });

        // 2. Testar geração de embeddings
        console.log('2️⃣ TESTANDO GERAÇÃO DE EMBEDDINGS:');

        const testQueries = [
            'Reestruturação Completa Corporação',
            'AUDITORIA FINAL E OTIMIZAÇÃO',
            'status atual projeto'
        ];

        for (const query of testQueries) {
            console.log(`   Testando query: "${query}"`);

            try {
                // Gerar embedding usando o serviço real
                const embedding = await embeddingsService.generateEmbedding(query);
                console.log(`   ✅ Embedding gerado: ${embedding.length} dimensões`);

                // Testar busca vetorial
                const { data: results, error: searchError } = await supabase.rpc('match_corporate_memory', {
                    query_embedding: embedding,
                    match_count: 5
                });

                if (searchError) {
                    console.log(`   ❌ Erro na busca: ${searchError.message}`);
                } else {
                    console.log(`   ✅ Busca retornou ${results?.length || 0} resultados:`);
                    results?.forEach((r, i) => {
                        console.log(`      [${i+1}] ID ${r.id} - ${(r.similarity * 100).toFixed(1)}% similar`);
                    });
                }

            } catch (embedError) {
                console.log(`   ❌ Erro ao gerar embedding: ${embedError.message}`);
            }

            console.log('');
        }

        // 3. Verificar especificamente IDs problemáticos
        console.log('3️⃣ VERIFICAÇÃO ESPECÍFICA DOS IDs PROBLEMÁTICOS:');

        const problematicIds = [286, 285, 244];
        const { data: specificMemories, error: specError } = await supabase
            .from('corporate_memory')
            .select('id, content, embedding')
            .in('id', problematicIds);

        if (specError) {
            console.error('❌ Erro ao buscar memórias específicas:', specError);
        } else {
            for (const mem of specificMemories) {
                console.log(`   ID ${mem.id}:`);
                const content = typeof mem.content === 'string' ? mem.content : JSON.stringify(mem.content);
                console.log(`     📝 Conteúdo: ${content.substring(0, 100)}...`);
                console.log(`     🧮 Embedding: ${mem.embedding ? `${mem.embedding.length} chars` : 'NULO'}`);

                // Testar similaridade com o próprio conteúdo
                if (mem.embedding) {
                    try {
                        const selfSimilarity = await calculateSimilarity(mem.embedding, mem.embedding);
                        console.log(`     🔍 Auto-similaridade: ${(selfSimilarity * 100).toFixed(1)}%`);
                    } catch (simError) {
                        console.log(`     ❌ Erro na auto-similaridade: ${simError.message}`);
                    }
                }
                console.log('');
            }
        }

        // 4. Verificar função RPC do Supabase
        console.log('4️⃣ TESTANDO FUNÇÃO RPC DO SUPABASE:');

        try {
            // Teste simples com embedding zero
            const zeroEmbedding = new Array(768).fill(0);
            const { data: rpcTest, error: rpcError } = await supabase.rpc('match_corporate_memory', {
                query_embedding: zeroEmbedding,
                match_count: 3
            });

            if (rpcError) {
                console.log(`   ❌ Função RPC com erro: ${rpcError.message}`);
            } else {
                console.log(`   ✅ Função RPC funcionando: ${rpcTest?.length || 0} resultados`);
            }
        } catch (rpcTestError) {
            console.log(`   ❌ Erro no teste RPC: ${rpcTestError.message}`);
        }

        console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO');

    } catch (error) {
        console.error('❌ ERRO GERAL NO TESTE:', error.message);
        console.error(error.stack);
    }
}

// Função auxiliar para calcular similaridade de cosseno
function calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
        return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
        dotProduct += embedding1[i] * embedding2[i];
        norm1 += embedding1[i] * embedding1[i];
        norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    return dotProduct / (norm1 * norm2);
}

// Executar teste
testVectorSearch().catch(console.error);
