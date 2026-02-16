#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: 'env.local' });
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const embeddingsService = getEmbeddingsService();

async function quickFix() {
    console.log('🚀 CORREÇÃO RÁPIDA DOS EMBEDDINGS PROBLEMÁTICOS\n');

    const targetIds = [286, 285];

    for (const id of targetIds) {
        console.log(`🔧 Corrigindo ID ${id}...`);

        // Buscar memória
        const { data: memory, error: fetchError } = await supabase
            .from('corporate_memory')
            .select('content, embedding')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.log(`   ❌ Erro ao buscar: ${fetchError.message}`);
            continue;
        }

        console.log(`   📏 Dimensões atuais: ${memory.embedding?.length || 0}`);

        // Usar apenas o início do conteúdo para gerar embedding melhor
        const content = typeof memory.content === 'string'
            ? memory.content
            : memory.content.content || JSON.stringify(memory.content);

        // Limitar tamanho e usar apenas o início mais relevante
        const relevantContent = content.substring(0, 2000);

        // Gerar novo embedding
        const newEmbedding = await embeddingsService.generateEmbedding(relevantContent);

        console.log(`   🆕 Novas dimensões: ${newEmbedding.length}`);

        if (newEmbedding.length === 384) {
            // Atualizar
            const { error: updateError } = await supabase
                .from('corporate_memory')
                .update({ embedding: newEmbedding })
                .eq('id', id);

            if (updateError) {
                console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
            } else {
                console.log(`   ✅ Atualizado com sucesso`);
            }
        } else {
            console.log(`   ⚠️ Embedding gerado com dimensões incorretas: ${newEmbedding.length}`);
        }

        console.log('');
    }

    // Verificar resultado
    console.log('🔍 VERIFICANDO RESULTADO FINAL...');
    const { data: checkData, error: checkError } = await supabase
        .from('corporate_memory')
        .select('id, embedding')
        .in('id', targetIds);

    if (checkError) {
        console.error('Erro na verificação:', checkError);
    } else {
        checkData.forEach(mem => {
            console.log(`ID ${mem.id}: ${mem.embedding?.length || 0} dimensões`);
        });
    }

    console.log('\n🎯 TESTE A BUSCA VETORIAL AGORA!');
}

quickFix().catch(console.error);

