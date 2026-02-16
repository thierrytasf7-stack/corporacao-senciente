
import { getLangMem } from './memory/langmem.js';
import { logger } from './utils/logger.js';

// Configure logger to info
logger.level = 'info';

async function readStatus() {
    const langmem = getLangMem();

    // Força limpeza de cache para garantir leitura fresca
    langmem.cache.clear();

    const queries = [
        'AUDITORIA FINAL E OTIMIZAÇÃO - MASTER PLAN',
        'Plano ultra-detalhado para reestruturar completamente'
    ];

    for (const query of queries) {
        console.log(`\n🔍 Consultando Memória para: "${query}"...\n`);
        const results = await langmem.getWisdom(query);

        if (results && results.length > 0) {
            console.log(`✅ Encontrados ${results.length} registros relevantes:\n`);

            results.forEach((item, index) => {
                if (index < 3) { // Show top 3 only to avoid spam
                    console.log(`--- Memória #${index + 1} (${item.category}) ---`);
                    console.log(`Similardade: ${(item.similarity * 100).toFixed(1)}%`);
                    // Check if content is string or object/JSON string
                    let displayContent = item.content;
                    if (typeof displayContent !== 'string') {
                        displayContent = JSON.stringify(displayContent);
                    }
                    console.log(`Conteúdo: ${displayContent.substring(0, 200)}...`);
                    console.log('\n');
                }
            });
        } else {
            console.log('⚠️ Nenhum registro encontrado via busca vetorial.');
        }
    }
}

readStatus();
