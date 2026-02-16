#!/usr/bin/env node

/**
 * Teste de Independência do AIOS-Core
 * Valida que o sistema funciona sem dependências externas
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class IndependenceTest {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.aiosCore = __dirname;
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }
    
    log(message, type = 'info') {
        const colors = {
            info: chalk.blue,
            success: chalk.green,
            error: chalk.red,
            warning: chalk.yellow
        };
        console.log(colors[type](message));
    }
    
    async test(name, fn) {
        try {
            this.log(`\n🧪 Testando: ${name}`, 'info');
            await fn();
            this.results.passed.push(name);
            this.log(`✅ ${name}`, 'success');
        } catch (error) {
            this.results.failed.push({ name, error: error.message });
            this.log(`❌ ${name}: ${error.message}`, 'error');
        }
    }
    
    async run() {
        this.log('\n' + '='.repeat(80), 'info');
        this.log('🔬 TESTE DE INDEPENDÊNCIA DO AIOS-CORE', 'info');
        this.log('='.repeat(80) + '\n', 'info');
        
        // Teste 1: Estrutura de diretórios
        await this.test('Estrutura de diretórios', async () => {
            const dirs = [
                'bin',
                'cli/agents',
                'cli/commands',
                'workflow-intelligence'
            ];
            
            for (const dir of dirs) {
                const fullPath = path.join(this.aiosCore, dir);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`Diretório não encontrado: ${dir}`);
                }
            }
        });
        
        // Teste 2: Arquivos essenciais
        await this.test('Arquivos essenciais', async () => {
            const files = [
                'bin/aios-core.js',
                'cli/agents/agent-executor.js',
                'cli/commands/workflow.js',
                'workflow-intelligence/refactor-metricas.yaml',
                '.env.example'
            ];
            
            for (const file of files) {
                const fullPath = path.join(this.aiosCore, file);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`Arquivo não encontrado: ${file}`);
                }
            }
        });
        
        // Teste 3: Dependências Node.js
        await this.test('Dependências Node.js', async () => {
            const packageJson = require('./package.json');
            const requiredDeps = ['chalk', 'commander', 'fs-extra', 'js-yaml'];
            
            for (const dep of requiredDeps) {
                if (!packageJson.dependencies[dep]) {
                    throw new Error(`Dependência não encontrada: ${dep}`);
                }
            }
        });
        
        // Teste 4: CLI executável
        await this.test('CLI executável', async () => {
            const cliPath = path.join(this.aiosCore, 'bin/aios-core.js');
            const content = fs.readFileSync(cliPath, 'utf8');
            
            if (!content.startsWith('#!/usr/bin/env node')) {
                throw new Error('CLI não tem shebang correto');
            }
            
            if (!content.includes('program.parse(process.argv)')) {
                throw new Error('CLI não processa argumentos');
            }
        });
        
        // Teste 5: Agent Executor
        await this.test('Agent Executor', async () => {
            const AgentExecutor = require('./cli/agents/agent-executor');
            
            if (typeof AgentExecutor !== 'function') {
                throw new Error('AgentExecutor não é uma classe');
            }
            
            const executor = new AgentExecutor();
            
            if (typeof executor.execute !== 'function') {
                throw new Error('AgentExecutor não tem método execute');
            }
        });
        
        // Teste 6: Workflow Command
        await this.test('Workflow Command', async () => {
            const WorkflowCommand = require('./cli/commands/workflow');
            
            if (typeof WorkflowCommand !== 'function') {
                throw new Error('WorkflowCommand não é uma classe');
            }
            
            const workflow = new WorkflowCommand();
            
            if (typeof workflow.run !== 'function') {
                throw new Error('WorkflowCommand não tem método run');
            }
            
            if (typeof workflow.list !== 'function') {
                throw new Error('WorkflowCommand não tem método list');
            }
        });
        
        // Teste 7: Workflow YAML
        await this.test('Workflow YAML válido', async () => {
            const yaml = require('js-yaml');
            const workflowPath = path.join(
                this.aiosCore,
                'workflow-intelligence/refactor-metricas.yaml'
            );
            
            const content = fs.readFileSync(workflowPath, 'utf8');
            const workflow = yaml.load(content);
            
            if (!workflow.name) throw new Error('Workflow sem nome');
            if (!workflow.tasks) throw new Error('Workflow sem tasks');
            if (!workflow.agents) throw new Error('Workflow sem agentes');
            if (workflow.tasks.length !== 4) {
                throw new Error(`Esperado 4 tasks, encontrado ${workflow.tasks.length}`);
            }
        });
        
        // Teste 8: Configuração de ambiente
        await this.test('Configuração de ambiente', async () => {
            const envExample = path.join(this.aiosCore, '.env.example');
            const content = fs.readFileSync(envExample, 'utf8');
            
            if (!content.includes('OPENROUTER_API_KEY')) {
                throw new Error('.env.example não tem OPENROUTER_API_KEY');
            }
        });
        
        // Teste 9: Documentos de referência
        await this.test('Documentos de referência', async () => {
            const docs = [
                'METRICAS_DIRECAO_EVOLUCAO/01_Evolucao_Ontologica_Senciencia.md',
                'METRICAS_DIRECAO_EVOLUCAO/02_Evolucao_Mitologia_Senciencia.md'
            ];
            
            for (const doc of docs) {
                const fullPath = path.join(this.projectRoot, doc);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`Documento de referência não encontrado: ${doc}`);
                }
            }
        });
        
        // Teste 10: Documentos a refatorar
        await this.test('Documentos a refatorar', async () => {
            const docs = [
                'METRICAS_DIRECAO_EVOLUCAO/05_Evolucao_Cerebro_Senciencia.md',
                'METRICAS_DIRECAO_EVOLUCAO/06_Evolucao_Cognitiva_Senciencia.md',
                'METRICAS_DIRECAO_EVOLUCAO/07_Evolucao_Do_CORPO_Senciencia.md',
                'METRICAS_DIRECAO_EVOLUCAO/08_Evolucao_Metabolismo_Obra_Senciencia.md'
            ];
            
            for (const doc of docs) {
                const fullPath = path.join(this.projectRoot, doc);
                if (!fs.existsSync(fullPath)) {
                    throw new Error(`Documento não encontrado: ${doc}`);
                }
            }
        });
        
        // Relatório final
        this.printReport();
    }
    
    printReport() {
        this.log('\n' + '='.repeat(80), 'info');
        this.log('📊 RELATÓRIO DE INDEPENDÊNCIA', 'info');
        this.log('='.repeat(80) + '\n', 'info');
        
        this.log(`✅ Testes passados: ${this.results.passed.length}`, 'success');
        
        if (this.results.failed.length > 0) {
            this.log(`❌ Testes falhos: ${this.results.failed.length}`, 'error');
            this.results.failed.forEach(f => {
                this.log(`   • ${f.name}: ${f.error}`, 'error');
            });
        }
        
        if (this.results.warnings.length > 0) {
            this.log(`⚠️ Avisos: ${this.results.warnings.length}`, 'warning');
            this.results.warnings.forEach(w => {
                this.log(`   • ${w}`, 'warning');
            });
        }
        
        const total = this.results.passed.length + this.results.failed.length;
        const percentage = ((this.results.passed.length / total) * 100).toFixed(1);
        
        this.log(`\n📈 Taxa de sucesso: ${percentage}%`, 'info');
        
        if (this.results.failed.length === 0) {
            this.log('\n🎉 AIOS-CORE ESTÁ INDEPENDENTE E PRONTO!', 'success');
            this.log('\n💡 Próximo passo:', 'info');
            this.log('   1. Configure .env com OPENROUTER_API_KEY', 'info');
            this.log('   2. Execute: node bin/aios-core.js workflow run refactor-metricas', 'info');
        } else {
            this.log('\n⚠️ Corrija os erros antes de executar workflows', 'warning');
        }
        
        this.log('\n' + '='.repeat(80) + '\n', 'info');
    }
}

// Executar testes
const test = new IndependenceTest();
test.run().catch(error => {
    console.error(chalk.red(`\n❌ Erro fatal: ${error.message}`));
    process.exit(1);
});
