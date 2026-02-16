
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import EmbeddingsService from './utils/embeddings_service.js';
import { logger } from './utils/logger.js';

config();
logger.level = 'info';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const svc = new EmbeddingsService();

async function reinsertMemories() {
    console.log('🔄 REINSERÇÃO FORÇADA DE MEMÓRIAS TRAVADAS...');

    // 1. Ler dados atuais
    const { data: oldData, error: readError } = await supabase
        .from('corporate_memory')
        .select('*')
        .in('id', [285, 286]);

    if (readError || !oldData || oldData.length === 0) {
        console.error('❌ Não foi possível ler os registros originais.', readError);
        return;
    }

    // 2. Deletar antigos
    console.log(`🗑️ Deletando IDs: ${oldData.map(d => d.id).join(', ')}`);
    await supabase.from('corporate_memory').delete().in('id', oldData.map(d => d.id));

    // 3. Reinserir como novos
    for (const item of oldData) {
        console.log(`✨ Recriando memória: ${item.category}`);

        // Gerar embedding fresco garantido
        const newVector = await svc.generateEmbedding(item.content);

        const { data: newData, error: insertError } = await supabase
            .from('corporate_memory')
            .insert({
                content: item.content,
                category: item.category,
                embedding: newVector,
                created_at: new Date().toISOString() // Atualiza timestamp
            })
            .select()
            .single();

        if (insertError) {
            console.error(`   ❌ Erro ao inserir: ${insertError.message}`);
        } else {
            console.log(`   ✅ Nova memória criada. ID Antigo: ${item.id} -> ID Novo: ${newData.id}`);
        }
    }

    console.log('✅ Operação concluída.');
}

reinsertMemories();
