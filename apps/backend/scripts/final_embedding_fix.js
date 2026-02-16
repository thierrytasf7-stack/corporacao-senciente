#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function finalEmbeddingFix() {
    console.log('🛠️ CORREÇÃO FINAL DEFINITIVA DOS EMBEDDINGS\n');

    const targetIds = [286, 285];

    for (const id of targetIds) {
        console.log(`🎯 Processando ID ${id}...`);

        // 1. Buscar a memória sem embedding
        const { data: memory, error: fetchError } = await supabase
            .from('corporate_memory')
            .select('content, category, created_at')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.log(`   ❌ Erro ao buscar memória: ${fetchError.message}`);
            continue;
        }

        // 2. Extrair conteúdo relevante (limitado)
        const content = typeof memory.content === 'string'
            ? memory.content
            : memory.content.content || JSON.stringify(memory.content);

        // Usar apenas o início mais relevante
        const relevantContent = content.substring(0, 1000);
        console.log(`   📝 Conteúdo a processar: ${relevantContent.length} chars`);

        // 3. Gerar embedding completamente novo
        const newEmbedding = await embeddingsService.generateEmbedding(relevantContent);
        console.log(`   🧮 Embedding gerado: ${newEmbedding.length} dimensões`);

        // 4. Verificar se está correto
        if (newEmbedding.length !== 384) {
            console.log(`   ⚠️ AVISO: Embedding com ${newEmbedding.length} dimensões (esperado: 384)`);
        }

        // 5. Converter para string JSON (como no LangMem) e atualizar
        const embeddingStr = `[${newEmbedding.join(',')}]`;
        const { error: updateError } = await supabase
            .from('corporate_memory')
            .update({ embedding: embeddingStr })
            .eq('id', id);

        if (updateError) {
            console.log(`   ❌ Erro ao atualizar embedding: ${updateError.message}`);
        } else {
            console.log(`   ✅ Embedding atualizado com sucesso`);
        }

        console.log('');
    }

    // Verificação final
    console.log('🔍 VERIFICAÇÃO FINAL:');
    const { data: finalCheck, error: checkError } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .in('id', targetIds);

    if (checkError) {
        console.error('❌ Erro na verificação:', checkError);
    } else {
        finalCheck.forEach(mem => {
            const dims = mem.embedding?.length || 0;
            const status = dims === 384 ? '✅' : '❌';
            console.log(`${status} ID ${mem.id}: ${dims} dimensões`);
        });
    }

    console.log('\n🎉 CORREÇÃO FINAL CONCLUÍDA!');
    console.log('🧪 Execute: node scripts/test_vector_search.js');
}

finalEmbeddingFix().catch(console.error);
