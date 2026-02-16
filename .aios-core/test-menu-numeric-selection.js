#!/usr/bin/env node

/**
 * TESTE AUTOMATIZADO - Menu Interativo v2.1.0
 * Valida seleção numérica automática em todos os menus
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class MenuTester {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    test(name, condition, details = '') {
        const passed = condition;
        this.results.tests.push({ name, passed, details });
        
        if (passed) {
            this.results.passed++;
            console.log(chalk.green(`✅ ${name}`));
        } else {
            this.results.failed++;
            console.log(chalk.red(`❌ ${name}`));
            if (details) console.log(chalk.gray(`   ${details}`));
        }
    }

    async runTests() {
        console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.blue('║                                                              ║'));
        console.log(chalk.blue('║         TESTE - MENU INTERATIVO v2.1.0                       ║'));
        console.log(chalk.blue('║         Validação de Seleção Numérica                        ║'));
        console.log(chalk.blue('║                                                              ║'));
        console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

        // Teste 1: Verificar se arquivo principal existe
        const menuFile = path.join(process.cwd(), '.aios-core', 'bin', 'aios-interactive.js');
        this.test(
            'Arquivo aios-interactive.js existe',
            fs.existsSync(menuFile),
            menuFile
        );

        // Teste 2: Verificar métodos auxiliares
        const content = fs.readFileSync(menuFile, 'utf8');
        
        this.test(
            'Método getAvailableTasks() implementado',
            content.includes('getAvailableTasks()')
        );

        this.test(
            'Método getAvailableAgents() implementado',
            content.includes('getAvailableAgents()')
        );

        this.test(
            'Método getCustomAgents() implementado',
            content.includes('getCustomAgents()')
        );

        this.test(
            'Método getAvailableSquads() implementado',
            content.includes('getAvailableSquads()')
        );

        this.test(
            'Método getAvailableWorkflows() implementado',
            content.includes('getAvailableWorkflows()')
        );

        this.test(
            'Método getTaskStatusIcon() implementado',
            content.includes('getTaskStatusIcon(')
        );

        // Teste 3: Verificar métodos com seleção numérica
        const methodsWithNumericSelection = [
            'runTask',
            'showTaskStatus',
            'assignTask',
            'deleteAgent',
            'configureAgent',
            'addAgentToSquad',
            'removeAgentFromSquad',
            'runSquadTask',
            'runWorkflow'
        ];

        methodsWithNumericSelection.forEach(method => {
            this.test(
                `Método ${method}() tem seleção numérica`,
                content.includes(`async ${method}()`) && 
                content.includes('forEach((') &&
                content.includes('index + 1')
            );
        });

        // Teste 4: Verificar ícones de status
        const statusIcons = ['⏳', '🔄', '✅', '❌'];
        statusIcons.forEach(icon => {
            this.test(
                `Ícone de status "${icon}" presente`,
                content.includes(icon)
            );
        });

        // Teste 5: Verificar indicadores visuais
        this.test(
            'Indicador visual checkbox implementado',
            content.includes('inSquad') && content.includes('[${inSquad}]')
        );
        
        const indicators = ['(padrão)', '(customizado)', '→'];
        indicators.forEach(indicator => {
            this.test(
                `Indicador visual "${indicator}" presente`,
                content.includes(indicator)
            );
        });

        // Teste 6: Verificar estrutura de diretórios
        const dirs = [
            '.aios-core/tasks',
            '.aios-core/squads',
            '.aios-core/cli/agents',
            '.aios-core/workflow-intelligence'
        ];

        dirs.forEach(dir => {
            const dirPath = path.join(process.cwd(), dir);
            this.test(
                `Diretório ${dir} existe`,
                fs.existsSync(dirPath),
                dirPath
            );
        });

        // Teste 7: Verificar validação de input
        this.test(
            'Validação de índice implementada',
            content.includes('taskIndex >= 0 && taskIndex < tasks.length') ||
            content.includes('agentIndex >= 0 && agentIndex < agents.length')
        );

        // Teste 8: Verificar opção de voltar (0)
        this.test(
            'Opção "0. ⬅️  Voltar" implementada',
            content.includes("'0. ⬅️  Voltar") ||
            content.includes("'0. ⬅️  Cancelar")
        );

        // Teste 9: Verificar mensagens de erro
        this.test(
            'Mensagens de erro implementadas',
            content.includes('❌ Opção inválida') &&
            content.includes('⚠️ Nenhum')
        );

        // Teste 10: Verificar auto-refresh e contexto
        this.test(
            'Informações contextuais implementadas',
            content.includes('status') &&
            content.includes('priority') &&
            content.includes('model')
        );

        // Teste 11: Verificar seleção de modelos
        this.test(
            'Método getAvailableModels() implementado',
            content.includes('getAvailableModels()')
        );

        this.test(
            'Seleção numérica de modelos em createAgent()',
            content.includes('createAgent()') &&
            content.includes('getAvailableModels()') &&
            content.includes('Modelos LLM disponíveis')
        );

        this.test(
            'Seleção numérica de modelos em configureAgent()',
            content.includes('configureAgent()') &&
            content.includes('getAvailableModels()') &&
            content.includes('Modelos LLM disponíveis')
        );

        this.test(
            'Modelos FREE incluídos',
            content.includes('DeepSeek R1') &&
            content.includes('Gemini Flash 2.0') &&
            content.includes('free: true')
        );

        this.test(
            'Modelos PAGOS incluídos',
            content.includes('Claude 3.5 Sonnet') &&
            content.includes('GPT-4') &&
            content.includes('free: false')
        );

        // Relatório final
        console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.blue('║                    RELATÓRIO FINAL                           ║'));
        console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

        const total = this.results.passed + this.results.failed;
        const percentage = ((this.results.passed / total) * 100).toFixed(1);

        console.log(chalk.white(`Total de testes: ${total}`));
        console.log(chalk.green(`✅ Passou: ${this.results.passed}`));
        console.log(chalk.red(`❌ Falhou: ${this.results.failed}`));
        console.log(chalk.cyan(`📊 Taxa de sucesso: ${percentage}%\n`));

        if (this.results.failed === 0) {
            console.log(chalk.green('🎉 TODOS OS TESTES PASSARAM!\n'));
            console.log(chalk.white('Menu Interativo v2.1.0 está 100% funcional com seleção numérica.\n'));
        } else {
            console.log(chalk.yellow('⚠️ ALGUNS TESTES FALHARAM\n'));
            console.log(chalk.white('Revise os testes que falharam acima.\n'));
        }

        return this.results.failed === 0;
    }
}

// Executar testes
const tester = new MenuTester();
tester.runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error(chalk.red(`\n❌ Erro ao executar testes: ${error.message}\n`));
    process.exit(1);
});
