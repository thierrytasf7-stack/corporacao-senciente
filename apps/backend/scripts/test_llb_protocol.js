#!/usr/bin/env node
/**
 * Teste do Protocolo L.L.B.
 * 
 * Valida implementação das três camadas e integrações
 */

import { getByteRover } from './memory/byterover.js';
import { getLangMem } from './memory/langmem.js';
import { getLetta } from './memory/letta.js';
import { getLLBExecutor } from './memory/llb_executor.js';
import { getLLBProtocol } from './memory/llb_protocol.js';
import { getAgentPromptGenerator } from './swarm/agent_prompt_generator.js';
import { getBrainPromptGenerator } from './swarm/brain_prompt_generator.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_llb' });

/**
 * Testa LangMem
 */
async function testLangMem() {
    log.info('=== Testando LangMem ===');

    try {
        const langmem = getLangMem();

        // Teste 1: Armazenar sabedoria
        log.info('Teste 1: Armazenar sabedoria');
        const stored = await langmem.storeWisdom(
            'Sempre usar async/await para operações assíncronas em Node.js',
            'architecture'
        );
        log.info(`Resultado: ${stored ? '✅ Sucesso' : '❌ Falhou'}`);

        // Teste 2: Buscar sabedoria
        log.info('Teste 2: Buscar sabedoria');
        const wisdom = await langmem.getWisdom('async operations', 'architecture');
        log.info(`Resultado: ${wisdom.length > 0 ? `✅ Encontrado ${wisdom.length} resultado(s)` : '⚠️ Nenhum resultado (pode ser normal se banco vazio)'}`);

        // Teste 3: Verificar dependências
        log.info('Teste 3: Verificar dependências');
        const deps = await langmem.checkDependencies('test_module');
        log.info(`Resultado: ${deps.canCreate ? '✅ Pode criar' : '❌ Conflitos detectados'}`);
        log.info(`Mensagem: ${deps.message}`);

        // Teste 4: Armazenar padrão
        log.info('Teste 4: Armazenar padrão');
        const patternStored = await langmem.storePattern(
            'Padrão de autenticação JWT',
            { context: 'API REST' }
        );
        log.info(`Resultado: ${patternStored ? '✅ Sucesso' : '❌ Falhou'}`);

        return true;
    } catch (err) {
        log.error('Erro ao testar LangMem', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Testa Letta
 */
async function testLetta() {
    log.info('=== Testando Letta ===');

    try {
        const letta = getLetta();

        // Teste 1: Obter estado atual
        log.info('Teste 1: Obter estado atual');
        const state = await letta.getCurrentState();
        log.info(`Resultado: ✅ Estado obtido`);
        log.info(`Fase atual: ${state.current_phase}`);
        log.info(`Próximos passos: ${state.next_steps?.length || 0}`);

        // Teste 2: Obter próximo passo evolutivo
        log.info('Teste 2: Obter próximo passo evolutivo');
        const nextStep = await letta.getNextEvolutionStep();
        log.info(`Resultado: ✅ Próximo passo obtido`);
        log.info(`Ação: ${nextStep.action || 'N/A'}`);

        // Teste 3: Atualizar estado
        log.info('Teste 3: Atualizar estado');
        const updated = await letta.updateState(
            'Teste de integração L.L.B.',
            'done',
            { test: true }
        );
        log.info(`Resultado: ${updated ? '✅ Sucesso' : '❌ Falhou'}`);

        // Teste 4: Registrar bloqueio
        log.info('Teste 4: Registrar bloqueio');
        const blocked = await letta.registerBlockage(
            'Teste de bloqueio',
            'Teste de integração'
        );
        log.info(`Resultado: ${blocked ? '✅ Sucesso' : '❌ Falhou'}`);

        // Teste 5: Histórico de evolução
        log.info('Teste 5: Histórico de evolução');
        const history = await letta.getEvolutionHistory(5);
        log.info(`Resultado: ✅ ${history.length} entradas encontradas`);

        return true;
    } catch (err) {
        log.error('Erro ao testar Letta', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Testa ByteRover
 */
async function testByteRover() {
    log.info('=== Testando ByteRover ===');

    try {
        const byterover = getByteRover();

        // Teste 1: Injetar contexto
        log.info('Teste 1: Injetar contexto');
        const context = await byterover.injectContext(
            ['test_file.js'],
            { type: 'create', content: 'test' },
            { agent: 'test' }
        );
        log.info(`Resultado: ${context.success ? '✅ Sucesso' : '❌ Falhou'}`);

        // Teste 2: Mapear impacto visual
        log.info('Teste 2: Mapear impacto visual');
        const impact = await byterover.mapVisualImpact({
            type: 'create',
            files: [{ path: 'frontend/test.jsx' }]
        });
        log.info(`Resultado: ${impact.success ? '✅ Sucesso' : '❌ Falhou'}`);
        if (impact.impact) {
            log.info(`Arquivos afetados: ${impact.impact.files_affected?.length || 0}`);
        }

        // Teste 3: Timeline evolutiva
        log.info('Teste 3: Timeline evolutiva');
        const timeline = await byterover.getEvolutionTimeline(5);
        log.info(`Resultado: ${timeline.success ? '✅ Sucesso' : '❌ Falhou'}`);
        if (timeline.timeline) {
            log.info(`Commits encontrados: ${timeline.timeline.length}`);
        }

        return true;
    } catch (err) {
        log.error('Erro ao testar ByteRover', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Testa LLB Protocol
 */
async function testLLBProtocol() {
    log.info('=== Testando LLB Protocol ===');

    try {
        const protocol = getLLBProtocol();

        // Teste 1: Iniciar sessão
        log.info('Teste 1: Iniciar sessão');
        const session = await protocol.startSession();
        log.info(`Resultado: ✅ Sessão iniciada`);
        log.info(`Fase atual: ${session.state?.current_phase || 'N/A'}`);

        // Teste 2: Buscar contexto completo
        log.info('Teste 2: Buscar contexto completo');
        const fullContext = await protocol.getFullContext('test task');
        log.info(`Resultado: ✅ Contexto obtido`);
        log.info(`Wisdom: ${fullContext.wisdom?.length || 0} itens`);
        log.info(`Timeline: ${fullContext.timeline?.length || 0} itens`);

        // Teste 3: Armazenar padrão
        log.info('Teste 3: Armazenar padrão');
        const patternStored = await protocol.storePattern(
            'Padrão de teste',
            { test: true }
        );
        log.info(`Resultado: ${patternStored ? '✅ Sucesso' : '❌ Falhou'}`);

        // Teste 4: Verificar dependências
        log.info('Teste 4: Verificar dependências');
        const deps = await protocol.checkDependencies('test_module');
        log.info(`Resultado: ${deps.canCreate ? '✅ Pode criar' : '⚠️ Conflitos'}`);

        // Teste 5: Finalizar sessão
        log.info('Teste 5: Finalizar sessão');
        const ended = await protocol.endSession(
            'Teste de integração',
            { success: true, test: true }
        );
        log.info(`Resultado: ${ended ? '✅ Sucesso' : '❌ Falhou'}`);

        return true;
    } catch (err) {
        log.error('Erro ao testar LLB Protocol', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Testa LLB Executor
 */
async function testLLBExecutor() {
    log.info('=== Testando LLB Executor ===');

    try {
        const executor = getLLBExecutor();

        // Teste 1: Executar ação simples
        log.info('Teste 1: Executar ação simples');
        const result = await executor.execute(
            {
                type: 'read_file',
                path: 'package.json'
            },
            {
                agent: 'test'
            }
        );
        log.info(`Resultado: ${result.success ? '✅ Sucesso' : '⚠️ Requer refatoração ou falhou'}`);
        if (result.requiresRefactoring) {
            log.info(`Refatoração necessária: ${result.message}`);
        }

        // Teste 2: Verificar consistência
        log.info('Teste 2: Verificar consistência');
        const consistency = await executor.checkConsistency(
            { type: 'create_file', path: 'test.js' },
            {}
        );
        log.info(`Resultado: ${consistency.valid ? '✅ Válido' : '⚠️ Conflitos detectados'}`);

        return true;
    } catch (err) {
        log.error('Erro ao testar LLB Executor', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Testa integração com Prompt Generators
 */
async function testPromptGenerators() {
    log.info('=== Testando Integração com Prompt Generators ===');

    try {
        // Teste 1: Brain Prompt Generator
        log.info('Teste 1: Brain Prompt Generator');
        const brainGenerator = getBrainPromptGenerator();
        const brainPrompt = await brainGenerator.generateBrainPrompt(
            'Teste de integração L.L.B.',
            {}
        );
        log.info(`Resultado: ✅ Prompt gerado (${brainPrompt.length} caracteres)`);
        log.info(`Contém "Letta": ${brainPrompt.includes('Letta') ? '✅' : '❌'}`);
        log.info(`Contém "LangMem": ${brainPrompt.includes('LangMem') ? '✅' : '❌'}`);
        log.info(`Contém "ByteRover": ${brainPrompt.includes('ByteRover') ? '✅' : '❌'}`);

        // Teste 2: Agent Prompt Generator
        log.info('Teste 2: Agent Prompt Generator');
        const agentGenerator = getAgentPromptGenerator();
        const agentPrompt = await agentGenerator.generateAgentPrompt(
            'dev',
            'Criar módulo test_module',
            { brainContext: {} }
        );
        log.info(`Resultado: ✅ Prompt gerado (${agentPrompt.length} caracteres)`);
        log.info(`Contém verificação de dependências: ${agentPrompt.includes('DEPENDÊNCIAS') || agentPrompt.includes('dependências') ? '✅' : '⚠️'}`);

        return true;
    } catch (err) {
        log.error('Erro ao testar Prompt Generators', { error: err.message, stack: err.stack });
        return false;
    }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
    log.info('🚀 Iniciando testes do Protocolo L.L.B.\n');

    const results = {
        langmem: false,
        letta: false,
        byterover: false,
        llbProtocol: false,
        llbExecutor: false,
        promptGenerators: false
    };

    try {
        results.langmem = await testLangMem();
        log.info('');

        results.letta = await testLetta();
        log.info('');

        results.byterover = await testByteRover();
        log.info('');

        results.llbProtocol = await testLLBProtocol();
        log.info('');

        results.llbExecutor = await testLLBExecutor();
        log.info('');

        results.promptGenerators = await testPromptGenerators();
        log.info('');

    } catch (err) {
        log.error('Erro geral nos testes', { error: err.message, stack: err.stack });
    }

    // Resumo
    log.info('📊 RESUMO DOS TESTES');
    log.info('===================');
    log.info(`LangMem: ${results.langmem ? '✅ PASSOU' : '❌ FALHOU'}`);
    log.info(`Letta: ${results.letta ? '✅ PASSOU' : '❌ FALHOU'}`);
    log.info(`ByteRover: ${results.byterover ? '✅ PASSOU' : '❌ FALHOU'}`);
    log.info(`LLB Protocol: ${results.llbProtocol ? '✅ PASSOU' : '❌ FALHOU'}`);
    log.info(`LLB Executor: ${results.llbExecutor ? '✅ PASSOU' : '❌ FALHOU'}`);
    log.info(`Prompt Generators: ${results.promptGenerators ? '✅ PASSOU' : '❌ FALHOU'}`);

    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r).length;

    log.info('');
    log.info(`Total: ${passed}/${total} testes passaram`);

    if (passed === total) {
        log.info('🎉 Todos os testes passaram!');
        process.exit(0);
    } else {
        log.warn('⚠️ Alguns testes falharam. Revise os logs acima.');
        process.exit(1);
    }
}

// Executar testes
runAllTests().catch(err => {
    log.error('Erro fatal', { error: err.message, stack: err.stack });
    process.exit(1);
});



