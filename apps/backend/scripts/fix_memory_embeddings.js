#!/usr/bin/env node
/**
 * CORREÇÃO DE EMBEDDINGS DAS MEMÓRIAS EXISTENTES
 *
 * Recria embeddings das memórias existentes para compatibilidade com Supabase (768 dimensões)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { getEmbeddingsService } from './utils/embeddings_service.js';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

async function fixMemoryEmbeddings() {
    console.log('🔧 CORRIGINDO EMBEDDINGS DAS MEMÓRIAS EXISTENTES...\n');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Credenciais Supabase não encontradas');
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const embeddingsService = getEmbeddingsService();

    try {
        // 1. Buscar todas as memórias que precisam de correção
        console.log('1️⃣ Buscando memórias existentes...');
        const { data: memories, error } = await supabase
            .from('corporate_memory')
            .select('id, content, embedding')
            .not('embedding', 'is', null)
            .order('created_at', { ascending: false })
            .limit(50); // Últimas 50 memórias

        if (error) {
            console.error('❌ Erro ao buscar memórias:', error);
            return;
        }

        console.log(`✅ Encontradas ${memories?.length || 0} memórias com embeddings`);

        // 2. Verificar quais precisam de correção
        const memoriesToFix = [];
        for (const memory of memories || []) {
            if (memory.embedding) {
                const embeddingLength = memory.embedding.length;
                if (embeddingLength !== 768) {
                    memoriesToFix.push({
                        id: memory.id,
                        content: memory.content,
                        oldDimensions: embeddingLength
                    });
                }
            }
        }

        console.log(`\n2️⃣ Memórias que precisam de correção: ${memoriesToFix.length}`);

        if (memoriesToFix.length === 0) {
            console.log('✅ Nenhuma memória precisa de correção!');
            return;
        }

        // 3. Corrigir embeddings um por um
        console.log('\n3️⃣ Corrigindo embeddings...\n');

        for (let i = 0; i < memoriesToFix.length; i++) {
            const memory = memoriesToFix[i];
            console.log(`   [${i+1}/${memoriesToFix.length}] Corrigindo ID ${memory.id} (${memory.oldDimensions} → 768 dimensões)`);

            try {
                // Extrair texto da memória
                const content = typeof memory.content === 'string'
                    ? memory.content
                    : JSON.stringify(memory.content);

                // Gerar novo embedding (será automaticamente padronizado para 768)
                const newEmbedding = await embeddingsService.generateEmbedding(content);

                // Atualizar no banco
                const { error: updateError } = await supabase
                    .from('corporate_memory')
                    .update({ embedding: newEmbedding })
                    .eq('id', memory.id);

                if (updateError) {
                    console.log(`      ❌ Erro ao atualizar: ${updateError.message}`);
                } else {
                    console.log(`      ✅ Corrigido com sucesso`);
                }

            } catch (error) {
                console.log(`      ❌ Erro ao processar: ${error.message}`);
            }

            // Pequena pausa para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 4. Verificar correção
        console.log('\n4️⃣ Verificando correção...');

        const { data: fixedMemories, error: verifyError } = await supabase
            .from('corporate_memory')
            .select('id, embedding')
            .in('id', memoriesToFix.map(m => m.id));

        if (verifyError) {
            console.error('❌ Erro na verificação:', verifyError);
        } else {
            let correctCount = 0;
            for (const memory of fixedMemories || []) {
                if (memory.embedding && memory.embedding.length === 768) {
                    correctCount++;
                }
            }
            console.log(`✅ ${correctCount}/${fixedMemories?.length || 0} memórias corrigidas`);
        }

        console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
        console.log('💡 Agora as buscas vetoriais devem funcionar corretamente');

    } catch (error) {
        console.error('❌ ERRO GERAL:', error.message);
        console.error(error.stack);
    }
}

// Executar correção
fixMemoryEmbeddings();

