
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { getLangMem } from './memory/langmem.js';

config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

async function checkLatestMemories() {
    console.log(`📡 Conectando a Memória Global...`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Busca CRONOLÓGICA (Últimas 10 memórias)
    console.log('\n--- 🕒 ÚLTIMAS 10 MEMÓRIAS (Raw SQL) ---');
    const { data, error } = await supabase
        .from('corporate_memory')
        .select('id, content, category, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Erro Supabase:', error);
    } else {
        if (data.length === 0) {
            console.log('⚠️ Nenhuma memória encontrada.');
        } else {
            data.forEach((item, i) => {
                let preview = item.content;
                if (typeof preview !== 'string') preview = JSON.stringify(preview);

                // Clean up newlines for display
                preview = preview.replace(/\n/g, ' ').substring(0, 150);

                console.log(`[${i + 1}] ${item.created_at} | ID: ${item.id} | Cat: ${item.category}`);
                console.log(`    "${preview}..."`);
            });
        }
    }

    // 2. Tentar busca vetorial específica se solicitado
    // Isso valida se a indexação vetorial já processou os novos itens
    console.log('\n--- 🧠 VERIFICAÇÃO DE INDEXAÇÃO VETORIAL ---');
    const langmem = getLangMem();
    langmem.cache.clear();

    // Tenta buscar a memória mais recente encontrada acima para ver se o vetor acha
    if (data && data.length > 0) {
        const latestSample = data[0].content.substring(0, 50);
        console.log(`Buscando semanticamente por: "${latestSample}"...`);

        try {
            const vectorResults = await langmem.getWisdom(latestSample);
            const found = vectorResults.find(r => r.id === data[0].id);

            if (found) {
                console.log(`✅ SUCESSO: Memória ID ${data[0].id} indexada e encontrada via vetor! (Sim: ${(found.similarity * 100).toFixed(1)}%)`);
            } else {
                console.log(`⚠️ ALERTA: Memória ID ${data[0].id} existe no banco mas NÃO apareceu na busca vetorial.`);
                console.log(`   Possível causa: Indexação pendente ou threshold de similaridade.`);
                console.log(`   Resultados retornados: ${vectorResults.length}`);
                if (vectorResults.length > 0) {
                    console.log(`   Top 1: ID ${vectorResults[0].id} (${(vectorResults[0].similarity * 100).toFixed(1)}%)`);
                }
            }
        } catch (e) {
            console.error('Erro na busca vetorial:', e.message);
        }
    }
}

checkLatestMemories();
