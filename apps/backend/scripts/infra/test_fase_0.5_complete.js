#!/usr/bin/env node

/**
 * Test Fase 0.5 Complete - Validação Completa da Infraestrutura Multi-PC
 * Fase 0.5 - Infraestrutura Multi-PC
 *
 * Testa e valida todos os componentes da infraestrutura multi-PC
 * antes de considerar a fase completa.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);
const log = logger.child({ module: 'test_fase_0.5_complete' });

/**
 * Classe Test Fase 0.5 Complete
 */
class TestFase05Complete {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Executa todos os testes da Fase 0.5
     */
    async runAllTests() {
        this.startTime = Date.now();
        log.info('🧪 Iniciando testes completos da Fase 0.5 - Infraestrutura Multi-PC...');

        try {
            // Testes de infraestrutura base
            await this.testInfrastructureBase();

            // Testes de especialização de PCs
            await this.testPCSpecialization();

            // Testes de comunicação
            await this.testCommunication();

            // Testes de monitoramento
            await this.testMonitoring();

            // Testes de dashboard
            await this.testDashboard();

            // Testes de integração com arquitetura senciente
            await this.testSencientArchitectureIntegration();

            // Testes de distribuição de tarefas
            await this.testTaskDistribution();

            // Testes de segurança
            await this.testSecurity();

            // Testes de performance
            await this.testPerformance();

        } catch (error) {
            log.error('Erro durante execução dos testes:', error);
            this.addTestResult('global_error', 'FAILED', error.message);
        }

        this.endTime = Date.now();
        this.generateReport();
    }

    /**
     * Testa infraestrutura base (WSL2 + SSH)
     */
    async testInfrastructureBase() {
        log.info('🔧 Testando infraestrutura base...');

        // Teste 1: WSL2 instalado e funcionando
        await this.runTest('wsl2_installed', async () => {
            try {
                const result = await execAsync('wsl --version');
                if (result.stdout.includes('WSL version')) {
                    return { status: 'PASSED', details: 'WSL2 instalado e funcionando' };
                } else {
                    return { status: 'FAILED', details: 'WSL2 não detectado' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao verificar WSL2: ${error.message}` };
            }
        });

        // Teste 2: Ubuntu WSL2 configurado
        await this.runTest('ubuntu_wsl_configured', async () => {
            try {
                const result = await execAsync('wsl -l -q');
                if (result.stdout.toLowerCase().includes('ubuntu')) {
                    return { status: 'PASSED', details: 'Ubuntu WSL2 configurado' };
                } else {
                    return { status: 'FAILED', details: 'Ubuntu WSL2 não encontrado' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao verificar Ubuntu: ${error.message}` };
            }
        });

        // Teste 3: SSH Server funcionando
        await this.runTest('ssh_server_running', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- systemctl is-active ssh');
                if (result.stdout.trim() === 'active') {
                    return { status: 'PASSED', details: 'SSH Server ativo' };
                } else {
                    return { status: 'FAILED', details: 'SSH Server não está ativo' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao verificar SSH: ${error.message}` };
            }
        });

        // Teste 4: Conectividade SSH local
        await this.runTest('ssh_local_connectivity', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no localhost -p 2222 "echo SSH_OK"');
                if (result.stdout.includes('SSH_OK')) {
                    return { status: 'PASSED', details: 'Conectividade SSH local funcionando' };
                } else {
                    return { status: 'FAILED', details: 'Conectividade SSH local falhou' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na conectividade SSH: ${error.message}` };
            }
        });

        // Teste 5: Dependências instaladas
        await this.runTest('dependencies_installed', async () => {
            const dependencies = ['node', 'python3', 'git'];
            let allInstalled = true;
            let details = [];

            for (const dep of dependencies) {
                try {
                    const result = await execAsync(`wsl -d Ubuntu -- ${dep} --version`);
                    if (result.stdout) {
                        details.push(`${dep}: OK`);
                    }
                } catch (error) {
                    allInstalled = false;
                    details.push(`${dep}: FALHA`);
                }
            }

            if (allInstalled) {
                return { status: 'PASSED', details: details.join(', ') };
            } else {
                return { status: 'FAILED', details: details.join(', ') };
            }
        });
    }

    /**
     * Testa especialização de PCs
     */
    async testPCSpecialization() {
        log.info('🎯 Testando especialização de PCs...');

        // Teste 1: Arquivo de especialização existe
        await this.runTest('specialization_file_exists', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- cat /etc/specialization');
                const specialization = result.stdout.trim();
                if (['technical', 'business', 'operations'].includes(specialization)) {
                    return { status: 'PASSED', details: `Especialização detectada: ${specialization}` };
                } else {
                    return { status: 'FAILED', details: `Especialização inválida: ${specialization}` };
                }
            } catch (error) {
                return { status: 'FAILED', details: 'Arquivo de especialização não encontrado' };
            }
        });

        // Teste 2: Arquivo de metadados do PC existe
        await this.runTest('pc_metadata_exists', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- cat /etc/corporacao-pc-info');
                const metadata = JSON.parse(result.stdout);
                if (metadata.hostname && metadata.specialization) {
                    return { status: 'PASSED', details: 'Metadados do PC válidos' };
                } else {
                    return { status: 'FAILED', details: 'Metadados do PC incompletos' };
                }
            } catch (error) {
                return { status: 'FAILED', details: 'Arquivo de metadados não encontrado ou inválido' };
            }
        });
    }

    /**
     * Testa sistema de comunicação
     */
    async testCommunication() {
        log.info('📡 Testando sistema de comunicação...');

        // Teste 1: Módulo de comunicação pode ser carregado
        await this.runTest('communication_module_load', async () => {
            try {
                const { getPCCommunication } = await import('./pc_communication.js');
                const comm = getPCCommunication();
                return { status: 'PASSED', details: 'Módulo de comunicação carregado com sucesso' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao carregar comunicação: ${error.message}` };
            }
        });

        // Teste 2: Comunicação pode ser inicializada
        await this.runTest('communication_initialization', async () => {
            try {
                const { getPCCommunication } = await import('./pc_communication.js');
                const comm = getPCCommunication();
                await comm.initialize();
                const status = comm.getStatus();
                comm.stop();

                if (status.local_pc.hostname) {
                    return { status: 'PASSED', details: 'Comunicação inicializada com sucesso' };
                } else {
                    return { status: 'FAILED', details: 'Falha na inicialização da comunicação' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na inicialização: ${error.message}` };
            }
        });
    }

    /**
     * Testa sistema de monitoramento
     */
    async testMonitoring() {
        log.info('📊 Testando sistema de monitoramento...');

        // Teste 1: Módulo de monitoramento pode ser carregado
        await this.runTest('monitor_module_load', async () => {
            try {
                const PCMonitor = (await import('./pc_monitor.js')).default;
                const monitor = new PCMonitor();
                return { status: 'PASSED', details: 'Módulo de monitoramento carregado com sucesso' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao carregar monitoramento: ${error.message}` };
            }
        });

        // Teste 2: Monitoramento pode ser iniciado
        await this.runTest('monitor_initialization', async () => {
            try {
                const PCMonitor = (await import('./pc_monitor.js')).default;
                const monitor = new PCMonitor();
                await monitor.startMonitoring();

                setTimeout(() => monitor.stopMonitoring(), 2000); // Parar após 2 segundos

                return { status: 'PASSED', details: 'Monitoramento iniciado e parado com sucesso' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro no monitoramento: ${error.message}` };
            }
        });
    }

    /**
     * Testa dashboard
     */
    async testDashboard() {
        log.info('🖥️ Testando dashboard...');

        // Teste 1: Módulo de dashboard pode ser carregado
        await this.runTest('dashboard_module_load', async () => {
            try {
                const PCDashboard = (await import('./pc_dashboard.js')).default;
                const dashboard = new PCDashboard();
                return { status: 'PASSED', details: 'Módulo de dashboard carregado com sucesso' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao carregar dashboard: ${error.message}` };
            }
        });

        // Teste 2: Dashboard pode gerar HTML
        await this.runTest('dashboard_html_generation', async () => {
            try {
                const PCDashboard = (await import('./pc_dashboard.js')).default;
                const dashboard = new PCDashboard();
                const html = dashboard.generateDashboardHTML();

                if (html.includes('Corporação Senciente') && html.includes('<html>')) {
                    return { status: 'PASSED', details: 'HTML do dashboard gerado com sucesso' };
                } else {
                    return { status: 'FAILED', details: 'HTML do dashboard inválido' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao gerar HTML: ${error.message}` };
            }
        });
    }

    /**
     * Testa integração com arquitetura senciente
     */
    async testSencientArchitectureIntegration() {
        log.info('🤖 Testando integração com arquitetura senciente...');

        // Teste 1: Adaptador multi-PC pode ser carregado
        await this.runTest('multi_pc_adapter_load', async () => {
            try {
                const MultiPCAdapter = (await import('./multi_pc_adapter.js')).default;
                const adapter = new MultiPCAdapter();
                return { status: 'PASSED', details: 'Adaptador multi-PC carregado com sucesso' };
            } catch (error) {
                return { status: 'FAILED', details: `Erro ao carregar adaptador: ${error.message}` };
            }
        });

        // Teste 2: Arquivos de agentes existem
        await this.runTest('agent_files_exist', async () => {
            const agentDirs = [
                'scripts/agents/technical',
                'scripts/agents/business',
                'scripts/agents/operations'
            ];

            let totalAgents = 0;
            for (const dir of agentDirs) {
                if (fs.existsSync(dir)) {
                    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
                    totalAgents += files.length;
                }
            }

            if (totalAgents > 0) {
                return { status: 'PASSED', details: `${totalAgents} arquivos de agentes encontrados` };
            } else {
                return { status: 'WARNING', details: 'Nenhum arquivo de agente encontrado' };
            }
        });

        // Teste 3: Brain Prompt Generator existe
        await this.runTest('brain_prompt_generator_exists', async () => {
            const brainPath = 'scripts/swarm/brain_prompt_generator.js';
            if (fs.existsSync(brainPath)) {
                return { status: 'PASSED', details: 'Brain Prompt Generator encontrado' };
            } else {
                return { status: 'WARNING', details: 'Brain Prompt Generator não encontrado' };
            }
        });
    }

    /**
     * Testa distribuição de tarefas
     */
    async testTaskDistribution() {
        log.info('📋 Testando distribuição de tarefas...');

        // Teste 1: Configuração de distribuição válida
        await this.runTest('task_distribution_config', async () => {
            try {
                const MultiPCAdapter = (await import('./multi_pc_adapter.js')).default;
                const adapter = new MultiPCAdapter();

                const config = adapter.taskDistribution;
                const hasValidConfig = config.brain_tasks && config.technical_tasks &&
                    config.business_tasks && config.operations_tasks;

                if (hasValidConfig) {
                    return { status: 'PASSED', details: 'Configuração de distribuição válida' };
                } else {
                    return { status: 'FAILED', details: 'Configuração de distribuição inválida' };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro na configuração: ${error.message}` };
            }
        });
    }

    /**
     * Testa segurança
     */
    async testSecurity() {
        log.info('🔒 Testando configurações de segurança...');

        // Teste 1: SSH não permite root login
        await this.runTest('ssh_root_disabled', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- grep "^PermitRootLogin" /etc/ssh/sshd_config');
                if (result.stdout.includes('PermitRootLogin no')) {
                    return { status: 'PASSED', details: 'Root login desabilitado no SSH' };
                } else {
                    return { status: 'WARNING', details: 'Root login pode estar habilitado' };
                }
            } catch (error) {
                return { status: 'FAILED', details: 'Erro ao verificar configuração SSH' };
            }
        });

        // Teste 2: SSH usa chave ao invés de senha
        await this.runTest('ssh_key_auth_only', async () => {
            try {
                const result = await execAsync('wsl -d Ubuntu -- grep "^PasswordAuthentication" /etc/ssh/sshd_config');
                if (result.stdout.includes('PasswordAuthentication no')) {
                    return { status: 'PASSED', details: 'Autenticação por senha desabilitada' };
                } else {
                    return { status: 'WARNING', details: 'Autenticação por senha pode estar habilitada' };
                }
            } catch (error) {
                return { status: 'FAILED', details: 'Erro ao verificar autenticação SSH' };
            }
        });
    }

    /**
     * Testa performance
     */
    async testPerformance() {
        log.info('⚡ Testando performance...');

        // Teste 1: Tempo de resposta SSH
        await this.runTest('ssh_response_time', async () => {
            try {
                const start = Date.now();
                await execAsync('wsl -d Ubuntu -- ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no localhost -p 2222 "echo test"');
                const responseTime = Date.now() - start;

                if (responseTime < 2000) { // Menos de 2 segundos
                    return { status: 'PASSED', details: `Tempo de resposta SSH: ${responseTime}ms` };
                } else {
                    return { status: 'WARNING', details: `Tempo de resposta SSH alto: ${responseTime}ms` };
                }
            } catch (error) {
                return { status: 'FAILED', details: `Erro no teste de performance SSH: ${error.message}` };
            }
        });
    }

    /**
     * Executa um teste individual
     */
    async runTest(testName, testFunction) {
        try {
            log.debug(`🧪 Executando teste: ${testName}`);
            const result = await testFunction();

            this.results.tests.push({
                name: testName,
                status: result.status,
                details: result.details,
                timestamp: new Date().toISOString()
            });

            switch (result.status) {
                case 'PASSED':
                    this.results.passed++;
                    log.info(`✅ ${testName}: ${result.details}`);
                    break;
                case 'FAILED':
                    this.results.failed++;
                    log.error(`❌ ${testName}: ${result.details}`);
                    break;
                case 'WARNING':
                    this.results.warnings++;
                    log.warn(`⚠️ ${testName}: ${result.details}`);
                    break;
            }

        } catch (error) {
            this.results.tests.push({
                name: testName,
                status: 'ERROR',
                details: `Erro inesperado: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            this.results.failed++;
            log.error(`💥 ${testName}: Erro inesperado - ${error.message}`);
        }
    }

    /**
     * Adiciona resultado de teste
     */
    addTestResult(testName, status, details) {
        this.results.tests.push({
            name: testName,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        });

        switch (status) {
            case 'PASSED':
                this.results.passed++;
                break;
            case 'FAILED':
                this.results.failed++;
                break;
            case 'WARNING':
                this.results.warnings++;
                break;
        }
    }

    /**
     * Gera relatório final
     */
    generateReport() {
        const duration = this.endTime - this.startTime;
        const totalTests = this.results.passed + this.results.failed + this.results.warnings;

        log.info('📊 Gerando relatório final dos testes...');

        const report = {
            summary: {
                total_tests: totalTests,
                passed: this.results.passed,
                failed: this.results.failed,
                warnings: this.results.warnings,
                success_rate: totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0,
                duration_ms: duration,
                timestamp: new Date().toISOString()
            },
            tests: this.results.tests,
            phase_status: this.determinePhaseStatus()
        };

        // Salvar relatório
        const reportPath = path.join(process.cwd(), 'data', 'fase_0.5_test_report.json');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Exibir relatório no console
        console.log('\n' + '='.repeat(80));
        console.log('📋 RELATÓRIO FINAL - FASE 0.5 INFRAESTRUTURA MULTI-PC');
        console.log('='.repeat(80));
        console.log(`Total de testes: ${totalTests}`);
        console.log(`✅ Aprovados: ${this.results.passed}`);
        console.log(`❌ Falhos: ${this.results.failed}`);
        console.log(`⚠️ Avisos: ${this.results.warnings}`);
        console.log(`📊 Taxa de sucesso: ${report.summary.success_rate}%`);
        console.log(`⏱️ Duração: ${duration}ms`);
        console.log('');

        // Status da fase
        const phaseStatus = report.phase_status;
        if (phaseStatus.status === 'COMPLETE') {
            console.log('🎉 FASE 0.5 COMPLETA! Infraestrutura multi-PC validada.');
        } else {
            console.log('⚠️ FASE 0.5 INCOMPLETA. Verificar testes falhos.');
        }
        console.log(`Status: ${phaseStatus.message}`);
        console.log('');

        // Detalhes dos testes
        console.log('📝 DETALHES DOS TESTES:');
        report.tests.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
            console.log(`${icon} ${test.name}: ${test.details}`);
        });

        console.log('');
        console.log(`Relatório salvo em: ${reportPath}`);
        console.log('='.repeat(80));

        // Log final
        if (phaseStatus.status === 'COMPLETE') {
            log.info('🎉 Fase 0.5 completa! Todos os testes passaram.');
        } else {
            log.warn(`⚠️ Fase 0.5 incompleta: ${this.results.failed} testes falharam, ${this.results.warnings} avisos.`);
        }
    }

    /**
     * Determina status da fase baseado nos resultados
     */
    determinePhaseStatus() {
        const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;

        if (this.results.failed === 0 && successRate >= 95) {
            return {
                status: 'COMPLETE',
                message: 'Fase 0.5 100% completa - Infraestrutura multi-PC totalmente funcional'
            };
        } else if (successRate >= 80) {
            return {
                status: 'MOSTLY_COMPLETE',
                message: `Fase 0.5 quase completa (${successRate.toFixed(1)}%) - Pequenos ajustes necessários`
            };
        } else {
            return {
                status: 'INCOMPLETE',
                message: `Fase 0.5 incompleta (${successRate.toFixed(1)}%) - Correções necessárias`
            };
        }
    }
}

// Função main para execução via CLI
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'run':
        case undefined:
            const tester = new TestFase05Complete();
            await tester.runAllTests();
            break;

        case 'summary':
            // Mostrar resumo do último relatório
            const reportPath = path.join(process.cwd(), 'data', 'fase_0.5_test_report.json');
            if (fs.existsSync(reportPath)) {
                const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
                console.log(JSON.stringify(report.summary, null, 2));
            } else {
                console.log('Nenhum relatório encontrado. Execute "run" primeiro.');
            }
            break;

        default:
            console.log('Uso: test_fase_0.5_complete.js [command]');
            console.log('Comandos:');
            console.log('  run     - Executa todos os testes');
            console.log('  summary - Mostra resumo do último relatório');
            break;
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default TestFase05Complete;





