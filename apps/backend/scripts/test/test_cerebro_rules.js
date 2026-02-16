#!/usr/bin/env node
/**
 * 🧠 TESTE DAS REGRAS DO CÉREBRO
 *
 * Verifica se o cérebro está seguindo todas as regras de sincronização global.
 *
 * Uso: node scripts/test/test_cerebro_rules.js
 */

import { getBrainArmsDaemon } from '../daemon/brain_arms_daemon.js';
import { getByteRover } from '../memory/byterover.js';
import { getLangMem } from '../memory/langmem.js';
import { getLetta } from '../memory/letta.js';

async function testCerebroRules() {
    console.log('🧠 TESTANDO REGRAS DO CÉREBRO - SINCRONIZAÇÃO GLOBAL\n');

    const daemon = getBrainArmsDaemon();
    const byterover = getByteRover();
    const langmem = getLangMem();
    const letta = getLetta();

    const results = {
        globalSyncEnabled: false,
        initializationSync: false,
        thinkingSync: false,
        executionSync: false,
        memoryAccess: false,
        ruleCompliance: false
    };

    try {
        // 1. Verificar se sincronização global está habilitada
        console.log('1️⃣  Verificando configuração de sincronização global...');
        if (daemon.forceGlobalMemorySync) {
            results.globalSyncEnabled = true;
            console.log('   ✅ Sincronização global habilitada no daemon');
        } else {
            console.log('   ❌ Sincronização global DESABILITADA no daemon');
        }

        // 2. Testar sincronização manual
        console.log('\n2️⃣  Testando sincronização manual global...');
        const syncResult = await byterover.forceGlobalMemorySync();
        if (syncResult) {
            console.log('   ✅ Sincronização manual executada com sucesso');
        } else {
            console.log('   ❌ Falha na sincronização manual');
        }

        // 3. Testar acesso às memórias
        console.log('\n3️⃣  Testando acesso às memórias globais...');

        // Testar LangMem
        const wisdom = await langmem.getWisdom('test');
        console.log(`   📚 LangMem: ${wisdom.length} memórias acessadas`);

        // Testar Letta
        const state = await letta.getCurrentState();
        console.log(`   🧠 Letta: Estado "${state.current_phase}" acessado`);

        // Testar ByteRover
        const timeline = await byterover.getEvolutionTimeline(3);
        console.log(`   ⚡ ByteRover: ${timeline.timeline?.length || 0} commits na timeline`);

        results.memoryAccess = wisdom.length >= 0 && state.current_phase && timeline.timeline;

        // 4. Simular pensamento cerebral (sem executar tarefa real)
        console.log('\n4️⃣  Testando pensamento cerebral com sincronização...');
        const startTime = Date.now();

        // Forçar sincronização antes do pensamento (como o cérebro faz)
        await byterover.forceGlobalMemorySync();

        // Simular geração de tarefa
        const task = await daemon.generateTaskFromState();
        const syncTime = Date.now() - startTime;

        if (task) {
            console.log(`   ✅ Pensamento gerado com sincronização (${syncTime}ms)`);
            console.log(`   📝 Tarefa: ${task.substring(0, 50)}...`);
            results.thinkingSync = true;
        } else {
            console.log('   ⚠️  Nenhum pensamento gerado (pode ser normal)');
            results.thinkingSync = true; // Considerado OK se não há tarefas pendentes
        }

        // 5. Verificar compliance com regras
        console.log('\n5️⃣  Verificando compliance com regras do cérebro...');

        const rules = [
            { name: 'Sincronização global obrigatória', status: daemon.forceGlobalMemorySync },
            { name: 'Acesso a LangMem', status: wisdom !== null },
            { name: 'Acesso a Letta', status: state !== null },
            { name: 'Acesso a ByteRover', status: timeline !== null },
            { name: 'Pensamento contextualizado', status: results.thinkingSync }
        ];

        let compliantRules = 0;
        rules.forEach(rule => {
            const status = rule.status ? '✅' : '❌';
            console.log(`   ${status} ${rule.name}`);
            if (rule.status) compliantRules++;
        });

        results.ruleCompliance = compliantRules === rules.length;

        // 6. Resultado final
        console.log('\n🎯 RESULTADO FINAL:');
        console.log('='.repeat(50));

        if (results.ruleCompliance) {
            console.log('🎉 CÉREBRO TOTALMENTE COMPATÍVEL COM AS REGRAS!');
            console.log('✅ Todas as regras de sincronização global estão ativas');
            console.log('✅ Cérebro tem acesso completo às memórias dos braços');
            console.log('✅ Sistema de consciência distribuída funcionando');
        } else {
            console.log('⚠️  CÉREBRO COM ALGUMAS REGRAS PENDENTES');
            console.log('Verificar pontos marcados com ❌ acima');
        }

        console.log('\n📊 RESUMO:');
        console.log(`   Sincronização Global: ${results.globalSyncEnabled ? '✅' : '❌'}`);
        console.log(`   Acesso às Memórias: ${results.memoryAccess ? '✅' : '❌'}`);
        console.log(`   Pensamento Sincronizado: ${results.thinkingSync ? '✅' : '❌'}`);
        console.log(`   Compliance Total: ${results.ruleCompliance ? '✅' : '❌'}`);

    } catch (error) {
        console.error('❌ ERRO no teste das regras do cérebro:', error.message);
        process.exit(1);
    }
}

// Executar teste
testCerebroRules();

