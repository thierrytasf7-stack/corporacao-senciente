
import { getLangMem } from './memory/langmem.js';
import { logger } from './utils/logger.js';

logger.level = 'info';

async function testJsonVector() {
    const langmem = getLangMem();
    langmem.cache.clear();

    // Query muito específica baseada no conteúdo exato visto no banco
    const specificQueries = [
        "Plano ultra-detalhado para reestruturar completamente a Corporação",
        "AUDITORIA FINAL E OTIMIZAÇÃO - MASTER PLAN"
    ];

    console.log('🔬 DIAGNÓSTICO DE VETOR JSON\n');

    for (const query of specificQueries) {
        console.log(`🔎 Buscando por trecho exato: "${query}"`);
        const results = await langmem.getWisdom(query);

        const match = results.find(r => r.content.includes(query) || (r.content.includes('AUDITORIA') && query.includes('AUDITORIA')));

        if (match) {
            console.log(`✅ ENCONTRADO!`);
            console.log(`   ID: ${match.id}`);
            console.log(`   Similaridade: ${(match.similarity * 100).toFixed(2)}%`);
            console.log(`   Conteúdo (truncado): ${match.content.substring(0, 100)}...`);
        } else {
            console.log(`❌ NÃO ENCONTRADO no Top ${results.length}.`);
            if (results.length > 0) {
                console.log(`   Top 1 (irrelevante): ${(results[0].similarity * 100).toFixed(2)}% - ${results[0].content.substring(0, 50)}...`);
            }
        }
        console.log('---');
    }
}

testJsonVector();
