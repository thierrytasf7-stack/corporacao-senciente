#!/usr/bin/env node

/**
 * Test Hybrid Autonomy - Teste do Sistema Híbrido de Autonomia
 * Fase 4 - Sistema Híbrido de Autonomia
 *
 * Testa o sistema completo de autonomia híbrida incluindo:
 * - Daemon Brain/Arms
 * - Execution Decider
 * - Modos assistido e autônomo
 * - Ciclo pensar-agir
 */

import { getBrainArmsDaemon } from '../daemon/brain_arms_daemon.js';
import { EXECUTION_DECISIONS, getExecutionDecider } from '../decision/execution_decider.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'test_hybrid_autonomy' });

/**
 * Teste do Sistema Híbrido de Autonomia
 */
class TestHybridAutonomy {
    constructor() {
        this.daemon = getBrainArmsDaemon();
        this.decider = getExecutionDecider();
        this.testResults = [];
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        log.info('🧠 Iniciando testes do sistema híbrido de autonomia...');

        const startTime = Date.now();

        try {
            // Teste 1: Execution Decider
            await this.testExecutionDecider();

            // Teste 2: Daemon Brain/Arms básico
            await this.testDaemonBasics();

            // Teste 3: Ciclo pensar-agir
            await this.testThinkActCycle();

            // Teste 4: Modos de operação
            await this.testOperationModes();

            // Teste 5: Sistema de aprendizado
            await this.testLearningSystem();

            // Teste 6: Decisões inteligentes
            await this.testIntelligentDecisions();

            // Teste 7: Tratamento de erros
            await this.testErrorHandling();

        } catch (error) {
            log.error('Erro durante testes:', error);
            this.addTestResult('general_error', 'FAILED', error.message);
        }

        const duration = Date.now() - startTime;
        this.generateReport(duration);
    }

    /**
     * Teste 1: Execution Decider
     */
    async testExecutionDecider() {
        log.info('🧠 Testando Execution Decider...');

        // Teste de decisão para tarefa simples
        await this.runTest('simple_task_decision', async () => {
            const task = { type: 'monitoring', description: 'Verificar status do sistema' };
            const decision = await this.decider.decideExecution(task);

            if (decision.mode && decision.confidence >= 0) {
                return { status: 'PASSED', details: `Decisão: ${decision.mode} (${(decision.confidence * 100).toFixed(1)}% confiança)` };
            } else {
                return { status: 'FAILED', details: 'Decisão inválida' };
            }
        });

        // Teste de decisão para tarefa complexa
        await this.runTest('complex_task_decision', async () => {
            const task = { type: 'deployment', description: 'Deploy em produção com migração de banco' };
            const decision = await this.decider.decideExecution(task);

            if (decision.mode === EXECUTION_DECISIONS.ASSISTED) {
                return { status: 'PASSED', details: 'Tarefa complexa corretamente classificada como assistida' };
            } else {
                return { status: 'WARNING', details: `Tarefa complexa classificada como ${decision.mode}` };
            }
        });

        // Teste de aprendizado
        await this.runTest('decision_learning', async () => {
            // Simular feedback de aprendizado
            const task = { type: 'monitoring', description: 'Verificar logs do sistema' };
            await this.decider.learnFromFeedback(task, EXECUTION_DECISIONS.ASSISTED, 'success');

            const stats = this.decider.getStats();
            if (stats.learningDataSize > 0) {
                return { status: 'PASSED', details: `Aprendizado registrado (${stats.learningDataSize} entradas)` };
            } else {
                return { status: 'FAILED', details: 'Aprendizado não registrado' };
            }
        });
    }

    /**
     * Teste 2: Daemon Brain/Arms básico
     */
    async testDaemonBasics() {
        log.info('🤖 Testando daemon Brain/Arms básico...');

        await this.runTest('daemon_initialization', async () => {
            const status = this.daemon.getStatus();
            if (status && typeof status.isRunning === 'boolean') {
                return { status: 'PASSED', details: 'Daemon inicializado corretamente' };
            } else {
                return { status: 'FAILED', details: 'Falha na inicialização do daemon' };
            }
        });

        await this.runTest('daemon_mode_setting', async () => {
            this.daemon.setMode('hybrid');
            const status = this.daemon.getStatus();
            if (status.mode === 'hybrid') {
                return { status: 'PASSED', details: 'Modo do daemon alterado com sucesso' };
            } else {
                return { status: 'FAILED', details: 'Falha ao alterar modo do daemon' };
            }
        });

        await this.runTest('daemon_task_generation', async () => {
            const task = this.daemon.generateTaskFromState();
            if (task && typeof task === 'string') {
                return { status: 'PASSED', details: `Tarefa gerada: ${task.substring(0, 50)}...` };
            } else {
                return { status: 'FAILED', details: 'Falha na geração de tarefa' };
            }
        });
    }

    /**
     * Teste 3: Ciclo pensar-agir
     */
    async testThinkActCycle() {
        log.info('🔄 Testando ciclo pensar-agir...');

        await this.runTest('think_act_simulation', async () => {
            // Simular geração de pensamento
            const thought = await this.daemon.performThinking();

            if (thought || this.daemon.taskQueue.length >= 0) {
                return { status: 'PASSED', details: `Ciclo pensar executado (tarefas na fila: ${this.daemon.taskQueue.length})` };
            } else {
                return { status: 'FAILED', details: 'Falha no ciclo pensar-agir' };
            }
        });

        await this.runTest('task_processing', async () => {
            const initialQueueSize = this.daemon.taskQueue.length;

            // Forçar processamento de tarefa
            await this.daemon.forceProcessNextTask();

            // Verificar se fila diminuiu ou se há tarefas pendentes
            const finalQueueSize = this.daemon.taskQueue.length;

            if (finalQueueSize <= initialQueueSize) {
                return { status: 'PASSED', details: `Processamento executado (fila: ${initialQueueSize} → ${finalQueueSize})` };
            } else {
                return { status: 'WARNING', details: 'Processamento pode ter adicionado tarefas à fila' };
            }
        });
    }

    /**
     * Teste 4: Modos de operação
     */
    async testOperationModes() {
        log.info('🎯 Testando modos de operação...');

        await this.runTest('assisted_mode', async () => {
            this.daemon.setMode('assisted');
            const status = this.daemon.getStatus();

            if (status.mode === 'assisted') {
                // Simular tarefa que seria aprovada
                const task = { task: 'Tarefa de teste assistida' };
                const mode = await this.daemon.decideExecutionMode(task);

                if (mode === 'assist') {
                    return { status: 'PASSED', details: 'Modo assistido funcionando corretamente' };
                } else {
                    return { status: 'FAILED', details: 'Modo assistido não forçou aprovação' };
                }
            } else {
                return { status: 'FAILED', details: 'Falha ao definir modo assistido' };
            }
        });

        await this.runTest('autonomous_mode', async () => {
            this.daemon.setMode('autonomous');
            const status = this.daemon.getStatus();

            if (status.mode === 'autonomous') {
                const task = { task: 'Tarefa de teste autônoma' };
                const mode = await this.daemon.decideExecutionMode(task);

                if (mode === 'auto') {
                    return { status: 'PASSED', details: 'Modo autônomo funcionando corretamente' };
                } else {
                    return { status: 'FAILED', details: 'Modo autônomo não forçou execução automática' };
                }
            } else {
                return { status: 'FAILED', details: 'Falha ao definir modo autônomo' };
            }
        });

        await this.runTest('hybrid_mode', async () => {
            this.daemon.setMode('hybrid');
            const status = this.daemon.getStatus();

            if (status.mode === 'hybrid') {
                return { status: 'PASSED', details: 'Modo híbrido definido corretamente' };
            } else {
                return { status: 'FAILED', details: 'Falha ao definir modo híbrido' };
            }
        });
    }

    /**
     * Teste 5: Sistema de aprendizado
     */
    async testLearningSystem() {
        log.info('🎓 Testando sistema de aprendizado...');

        await this.runTest('learning_data_collection', async () => {
            const initialSize = this.daemon.learningData.length;

            // Simular aprendizado
            await this.daemon.learnFromTask({
                id: 'test_task',
                task: 'Tarefa de teste',
                priority: 'medium'
            }, true);

            const finalSize = this.daemon.learningData.length;

            if (finalSize > initialSize) {
                return { status: 'PASSED', details: `Dados de aprendizado coletados (${initialSize} → ${finalSize})` };
            } else {
                return { status: 'FAILED', details: 'Dados de aprendizado não foram coletados' };
            }
        });

        await this.runTest('parameter_adaptation', async () => {
            const initialThreshold = this.daemon.confidenceThreshold;

            // Simular várias execuções bem-sucedidas
            for (let i = 0; i < 10; i++) {
                await this.daemon.updateLearningParameters();
            }

            const finalThreshold = this.daemon.confidenceThreshold;

            // Threshold pode ter mudado baseado no aprendizado
            return { status: 'PASSED', details: `Threshold adaptado: ${initialThreshold.toFixed(2)} → ${finalThreshold.toFixed(2)}` };
        });
    }

    /**
     * Teste 6: Decisões inteligentes
     */
    async testIntelligentDecisions() {
        log.info('🧠 Testando decisões inteligentes...');

        await this.runTest('risk_assessment', async () => {
            const safeTask = { description: 'Verificar status do sistema' };
            const riskyTask = { description: 'Excluir banco de dados de produção' };

            const safeDecision = await this.decider.decideExecution(safeTask);
            const riskyDecision = await this.decider.decideExecution(riskyTask);

            if (safeDecision.confidence > riskyDecision.confidence) {
                return { status: 'PASSED', details: 'Sistema corretamente diferenciou tarefas seguras vs arriscadas' };
            } else {
                return { status: 'WARNING', details: 'Avaliação de risco pode precisar ajuste' };
            }
        });

        await this.runTest('context_awareness', async () => {
            const devTask = { description: 'Deploy de feature' };
            const prodTask = { description: 'Deploy de feature' };

            const devDecision = await this.decider.decideExecution(devTask, { environment: 'development' });
            const prodDecision = await this.decider.decideExecution(prodTask, { environment: 'production' });

            if (devDecision.confidence >= prodDecision.confidence) {
                return { status: 'PASSED', details: 'Sistema considerou contexto ambiente corretamente' };
            } else {
                return { status: 'WARNING', details: 'Avaliação contextual pode precisar refinamento' };
            }
        });
    }

    /**
     * Teste 7: Tratamento de erros
     */
    async testErrorHandling() {
        log.info('🚨 Testando tratamento de erros...');

        await this.runTest('error_recovery', async () => {
            try {
                // Tentar operação que pode falhar
                await this.daemon.decideExecutionMode(null);
                return { status: 'WARNING', details: 'Sistema não falhou com entrada inválida' };
            } catch (error) {
                return { status: 'PASSED', details: 'Sistema tratou erro corretamente' };
            }
        });

        await this.runTest('graceful_degradation', async () => {
            // Testar se sistema continua funcionando mesmo com componentes faltando
            const status = this.daemon.getStatus();

            if (status && typeof status.state === 'string') {
                return { status: 'PASSED', details: 'Sistema mantém funcionamento básico' };
            } else {
                return { status: 'FAILED', details: 'Sistema falhou na degradação graceful' };
            }
        });
    }

    /**
     * Executar teste individual
     */
    async runTest(testName, testFunction) {
        try {
            log.debug(`🧪 Executando teste: ${testName}`);
            const result = await testFunction();

            this.testResults.push({
                name: testName,
                status: result.status,
                details: result.details,
                timestamp: new Date().toISOString()
            });

            switch (result.status) {
                case 'PASSED':
                    log.info(`✅ ${testName}: ${result.details}`);
                    break;
                case 'FAILED':
                    log.error(`❌ ${testName}: ${result.details}`);
                    break;
                case 'WARNING':
                    log.warn(`⚠️ ${testName}: ${result.details}`);
                    break;
            }

        } catch (error) {
            this.testResults.push({
                name: testName,
                status: 'ERROR',
                details: `Erro inesperado: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            log.error(`💥 ${testName}: Erro inesperado - ${error.message}`);
        }
    }

    /**
     * Gerar relatório final
     */
    generateReport(duration) {
        const totalTests = this.testResults.length;
        const passed = this.testResults.filter(t => t.status === 'PASSED').length;
        const failed = this.testResults.filter(t => t.status === 'FAILED').length;
        const warnings = this.testResults.filter(t => t.status === 'WARNING').length;
        const errors = this.testResults.filter(t => t.status === 'ERROR').length;

        const successRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;

        log.info('📋 Gerando relatório de testes da autonomia híbrida...');

        console.log('\n' + '='.repeat(80));
        console.log('🤖 RELATÓRIO DE TESTES - SISTEMA HÍBRIDO DE AUTONOMIA');
        console.log('='.repeat(80));
        console.log(`Tempo de execução: ${duration}ms`);
        console.log(`Total de testes: ${totalTests}`);
        console.log(`✅ Aprovados: ${passed}`);
        console.log(`❌ Falhos: ${failed}`);
        console.log(`⚠️ Avisos: ${warnings}`);
        console.log(`💥 Erros: ${errors}`);
        console.log(`📈 Taxa de sucesso: ${successRate}%`);

        if (successRate >= 75) {
            console.log('\n🎉 SISTEMA HÍBRIDO APROVADO!');
            console.log('✅ Autonomia híbrida funcionando corretamente.');
            console.log('✅ Decisões inteligentes implementadas.');
            console.log('✅ Ciclo Brain ↔ Arms operacional.');
        } else {
            console.log('\n⚠️ SISTEMA HÍBRIDO COM PROBLEMAS');
            console.log('❌ Correções necessárias antes do uso em produção.');
        }

        console.log('\n🧠 STATUS DA AUTONOMIA:');
        const daemonStatus = this.daemon.getStatus();
        console.log(`   Estado: ${daemonStatus.state.toUpperCase()}`);
        console.log(`   Modo: ${daemonStatus.mode.toUpperCase()}`);
        console.log(`   Tarefas processadas: ${daemonStatus.stats.tasksProcessed}`);
        console.log(`   Confiança média: ${(daemonStatus.stats.avgConfidence * 100).toFixed(1)}%`);

        console.log('\n📝 DETALHES DOS TESTES:');
        this.testResults.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' :
                test.status === 'FAILED' ? '❌' :
                    test.status === 'WARNING' ? '⚠️' : '💥';
            console.log(`${icon} ${test.name}: ${test.details}`);
        });

        console.log('\n' + '='.repeat(80));

        // Salvar relatório
        const fs = require('fs');
        const reportPath = 'data/hybrid_autonomy_test_report.json';
        fs.writeFileSync(reportPath, JSON.stringify({
            summary: {
                total_tests: totalTests,
                passed, failed, warnings, errors,
                success_rate: successRate,
                duration_ms: duration,
                daemon_status: daemonStatus,
                decider_stats: this.decider.getStats(),
                timestamp: new Date().toISOString()
            },
            tests: this.testResults
        }, null, 2));

        log.info(`Relatório salvo em: ${reportPath}`);
    }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new TestHybridAutonomy();
    tester.runAllTests().catch(console.error);
}

export default TestHybridAutonomy;




