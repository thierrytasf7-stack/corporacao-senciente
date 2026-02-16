/**
 * AIOS-Core Workflow Command
 * Implementado por Kiro Orchestrator para executar workflows YAML
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class WorkflowCommand {
    constructor() {
        this.workflowDir = path.join(process.cwd(), '.aios-core', 'workflow-intelligence');
    }

    async run(workflowName) {
        console.log(chalk.blue('\n🚀 AIOS-Core Workflow Executor\n'));
        
        const workflowFile = path.join(this.workflowDir, `${workflowName}.yaml`);
        
        if (!fs.existsSync(workflowFile)) {
            console.log(chalk.red(`❌ Workflow não encontrado: ${workflowName}`));
            return false;
        }
        
        // Carregar workflow
        const workflow = yaml.load(fs.readFileSync(workflowFile, 'utf8'));
        
        console.log(chalk.green(`📋 Workflow: ${workflow.name}`));
        console.log(chalk.gray(`   Versão: ${workflow.version}`));
        console.log(chalk.gray(`   Descrição: ${workflow.description}\n`));
        
        // Executar tasks
        const results = [];
        for (const task of workflow.tasks) {
            console.log(chalk.yellow(`\n📝 Executando: ${task.name}`));
            
            const result = await this.executeTask(task, workflow);
            results.push(result);
            
            if (!result.success) {
                console.log(chalk.red(`❌ Falha na task: ${task.id}`));
                if (workflow.execution.retry_on_failure) {
                    console.log(chalk.yellow(`🔄 Tentando novamente...`));
                    // Retry logic aqui
                }
            } else {
                console.log(chalk.green(`✅ Task concluída: ${task.id}`));
            }
        }
        
        // Relatório final
        const successCount = results.filter(r => r.success).length;
        console.log(chalk.blue(`\n📊 Relatório Final:`));
        console.log(chalk.green(`   ✅ Sucesso: ${successCount}/${results.length}`));
        
        return successCount === results.length;
    }
    
    async executeTask(task, workflow) {
        console.log(chalk.gray(`   Agente: ${task.agent}`));
        console.log(chalk.gray(`   Arquivo: ${task.input.file}`));
        console.log(chalk.gray(`   Tema: ${task.input.theme}`));
        
        try {
            // Usar AgentExecutor para executar a task
            const AgentExecutor = require('../agents/agent-executor');
            const executor = new AgentExecutor({
                model: workflow.agents.find(a => a.name === task.agent)?.model || 'claude-3.5-sonnet',
                temperature: workflow.agents.find(a => a.name === task.agent)?.temperature || 0.3
            });
            
            const result = await executor.execute(task, workflow);
            
            return result;
            
        } catch (error) {
            console.log(chalk.red(`   ❌ Erro na execução: ${error.message}`));
            
            return {
                success: false,
                task_id: task.id,
                message: error.message,
                error: error
            };
        }
    }
    
    list() {
        console.log(chalk.blue('\n📋 Workflows Disponíveis:\n'));
        
        if (!fs.existsSync(this.workflowDir)) {
            console.log(chalk.yellow('   Nenhum workflow encontrado'));
            return;
        }
        
        const files = fs.readdirSync(this.workflowDir).filter(f => f.endsWith('.yaml'));
        
        files.forEach(file => {
            const workflow = yaml.load(fs.readFileSync(path.join(this.workflowDir, file), 'utf8'));
            console.log(chalk.green(`   • ${workflow.name}`));
            console.log(chalk.gray(`     Arquivo: ${file}`));
            console.log(chalk.gray(`     Descrição: ${workflow.description}\n`));
        });
    }
}

module.exports = WorkflowCommand;
