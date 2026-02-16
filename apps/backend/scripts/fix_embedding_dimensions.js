#!/usr/bin/env node
/**
 * CORREÇÃO DEFINITIVA DOS EMBEDDINGS
 * Regenera embeddings com dimensões corretas (384)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function fixEmbeddingDimensions() {
    console.log('🔧 CORRIGINDO DIMENSÕES DOS EMBEDDINGS...\n');

    // Buscar memórias com embeddings incorretos
    const { data: memories, error } = await supabase
        .from('corporate_memory')
        .select('id, content, embedding')
        .not('embedding', 'is', null);

    if (error) {
        console.error('❌ Erro ao buscar memórias:', error);
        return;
    }

    console.log(`📊 Encontradas ${memories?.length || 0} memórias com embeddings\n`);

    const toFix = [];
    for (const memory of memories || []) {
        if (memory.embedding && memory.embedding.length !== 384) {
            toFix.push(memory);
        }
    }

    console.log(`🎯 ${toFix.length} memórias precisam de correção:\n`);

    toFix.forEach((mem, i) => {
        console.log(`${i+1}. ID ${mem.id}: ${mem.embedding.length} → 384 dimensões`);
    });

    if (toFix.length === 0) {
        console.log('✅ Todas as memórias já têm dimensões corretas!');
        return;
    }

    console.log('\n🔄 REGENERANDO EMBEDDINGS...\n');

    for (let i = 0; i < toFix.length; i++) {
        const memory = toFix[i];
        console.log(`[${i+1}/${toFix.length}] Processando ID ${memory.id}...`);

        try {
            // Extrair texto real da memória
            const content = typeof memory.content === 'string'
                ? memory.content
                : JSON.stringify(memory.content);

            // Regenerar embedding com dimensões corretas
            const newEmbedding = await embeddingsService.generateEmbedding(content);

            // Verificar se está correto
            if (newEmbedding.length !== 384) {
                console.log(`   ⚠️  Embedding gerado com ${newEmbedding.length} dimensões (esperado: 384)`);
                continue;
            }

            // Atualizar no banco
            const { error: updateError } = await supabase
                .from('corporate_memory')
                .update({ embedding: newEmbedding })
                .eq('id', memory.id);

            if (updateError) {
                console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
            } else {
                console.log(`   ✅ Corrigido: ${memory.embedding.length} → ${newEmbedding.length} dimensões`);
            }

        } catch (error) {
            console.log(`   ❌ Erro ao processar: ${error.message}`);
        }

        // Pequena pausa
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Verificação final
    console.log('\n🔍 VERIFICAÇÃO FINAL...\n');

    const { data: fixedMemories, error: verifyError } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .in('id', toFix.map(m => m.id));

    if (verifyError) {
        console.error('❌ Erro na verificação:', verifyError);
    } else {
        let correct = 0;
        let incorrect = 0;

        for (const mem of fixedMemories || []) {
            if (mem.embedding && mem.embedding.length === 384) {
                correct++;
            } else {
                incorrect++;
                console.log(`❌ ID ${mem.id}: ainda ${mem.embedding?.length || 0} dimensões`);
            }
        }

        console.log(`\n✅ RESULTADO: ${correct}/${correct + incorrect} memórias corrigidas`);
        console.log(`🎯 Taxa de sucesso: ${((correct / (correct + incorrect)) * 100).toFixed(1)}%`);
    }

    console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
    console.log('💡 Agora teste novamente: node scripts/test_vector_search.js');
}

fixEmbeddingDimensions().catch(console.error);

