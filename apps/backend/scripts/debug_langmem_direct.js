
import { getLangMem } from './memory/langmem.js';
import { logger } from './utils/logger.js';

async function main() {
    console.log('🔍 Acessando LangMem diretamente...');

    // Ensure we see logs
    logger.level = 'debug';

    const langmem = getLangMem();

    try {
        // Query 1
        console.log('\n--- Tentando Query "status" ---');
        const wisdom = await langmem.getWisdom('status', 'architecture');
        console.log(`Encontrados: ${wisdom.length}`);
        wisdom.forEach(w => console.log(`- ${w.content.substring(0, 100)}...`));

        // Query 2: Try to store a test memory to verify write access
        console.log('\n--- Tentando Gravar Memória de Teste ---');
        const success = await langmem.storeWisdom('Teste de acesso à memória Byterover em ' + new Date().toISOString(), 'test');
        console.log(`Gravação: ${success ? 'SUCESSO' : 'FALHA'}`);

        if (success) {
            console.log('\n--- Verificando Memória Gravada ---');
            const check = await langmem.getWisdom('Teste de acesso', 'test');
            console.log(`Recuperado: ${check.length > 0 ? check[0].content : 'NADA'}`);
        }

    } catch (error) {
        console.error('Erro crítico:', error);
    }
}

main();
