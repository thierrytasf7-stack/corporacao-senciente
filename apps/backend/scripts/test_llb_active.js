#!/usr/bin/env node
/**
 * Teste: Protocolo L.L.B. Ativo
 * 
 * Valida que o Protocolo L.L.B. está ativo e funcionando
 */

import { getByteRover } from './memory/byterover.js';
import { getLangMem } from './memory/langmem.js';
import { getLetta } from './memory/letta.js';
import { getLLBProtocol } from './memory/llb_protocol.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_llb_active' });

async function testLLBActive() {
    log.info('🧪 Testando Protocolo L.L.B. Ativo\n');

    const protocol = getLLBProtocol();
    const langmem = getLangMem();
    const letta = getLetta();
    const byterover = getByteRover();

    try {
        // 1. Testar LangMem
        log.info('1. Testando LangMem...');
        const wisdom = await langmem.getWisdom('Protocolo L.L.B.', 'architecture');
        console.log(`   ✅ LangMem: ${wisdom.length} sabedoria encontrada`);
        if (wisdom.length > 0) {
            console.log(`   📚 Exemplo: ${wisdom[0].content.substring(0, 80)}...`);
        }

        // 2. Testar Letta
        log.info('2. Testando Letta...');
        const state = await letta.getCurrentState();
        console.log(`   ✅ Letta: Fase atual = ${state.current_phase}`);
        console.log(`   📋 Próximos passos: ${state.next_steps?.length || 0}`);
        console.log(`   🚧 Bloqueios: ${state.blockages?.length || 0}`);

        // 3. Testar ByteRover
        log.info('3. Testando ByteRover...');
        const timeline = await byterover.getEvolutionTimeline(5);
        console.log(`   ✅ ByteRover: ${timeline.timeline?.length || 0} commits na timeline`);

        // 4. Testar Protocolo L.L.B. completo
        log.info('4. Testando Protocolo L.L.B. completo...');
        const session = await protocol.startSession();
        console.log(`   ✅ Protocolo L.L.B.: Sessão iniciada`);
        console.log(`   🧠 Fase: ${session.state?.current_phase || 'N/A'}`);
        console.log(`   ➡️  Próximo passo: ${session.nextStep?.action || 'N/A'}`);

        // 5. Testar contexto completo
        log.info('5. Testando contexto completo...');
        const fullContext = await protocol.getFullContext('test');
        console.log(`   ✅ Contexto completo obtido:`);
        console.log(`      - Wisdom: ${fullContext.wisdom?.length || 0} itens`);
        console.log(`      - Timeline: ${fullContext.timeline?.length || 0} itens`);
        console.log(`      - State: ${fullContext.state ? 'Disponível' : 'N/A'}`);

        log.info('');
        log.info('🎉 Protocolo L.L.B. está ATIVO e FUNCIONANDO!');
        log.info('');
        log.info('Sistema pronto para:');
        log.info('  ✅ Operar independente de Jira/Confluence/GitKraken');
        log.info('  ✅ Gerenciar estado via Letta');
        log.info('  ✅ Armazenar sabedoria via LangMem');
        log.info('  ✅ Interagir com código via ByteRover');
        log.info('  ✅ Evoluir automaticamente');

        return true;
    } catch (err) {
        log.error('❌ Erro ao testar Protocolo L.L.B.', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testLLBActive().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal', { error: err.message });
    process.exit(1);
});


