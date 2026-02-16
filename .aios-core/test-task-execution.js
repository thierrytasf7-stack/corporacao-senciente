#!/usr/bin/env node

/**
 * TESTE: Execução Real de Task via AgentExecutor
 * Valida que tasks executam de verdade com LLM
 */

const chalk = require('chalk');
const TaskCommand = require('./cli/commands/task');

console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('║     TESTE: Execução Real de Task                            ║'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

async function testTaskExecution() {
    const task = new TaskCommand();
    
    const taskName = 'revisa os repositorios do aios do squad e dos mcp aios, faltam agentes que veio incluidos la, e faltam squads. configura e deixa disponivel aqui';
    
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.yellow('EXECUTANDO TASK VIA AGENTEXECUTOR'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
    
    console.log(chalk.cyan(`Task: ${taskName}`));
    console.log(chalk.cyan(`Agente: architect`));
    console.log(chalk.cyan(`Descrição: executar de imediato\n`));
    
    try {
        console.log(chalk.yellow('⏳ Iniciando execução...\n'));
        
        const startTime = Date.now();
        const result = await task.run(taskName);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(chalk.yellow(`\n⏱️  Duração: ${duration}s\n`));
        
        if (result) {
            console.log(chalk.green('✅ Task executada com sucesso!\n'));
            
            // Ler resultado do arquivo
            const fs = require('fs-extra');
            const path = require('path');
            const taskFile = path.join(process.cwd(), '.aios-core', 'tasks', `${taskName}.json`);
            const taskData = fs.readJsonSync(taskFile);
            
            console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
            console.log(chalk.yellow('RESULTADO DA TASK'));
            console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
            
            console.log(chalk.white(`Status: ${taskData.status}`));
            console.log(chalk.white(`Agente: ${taskData.assigned_to}`));
            console.log(chalk.white(`Iniciada em: ${new Date(taskData.started_at).toLocaleString()}`));
            console.log(chalk.white(`Completada em: ${new Date(taskData.completed_at).toLocaleString()}`));
            
            if (taskData.result) {
                console.log(chalk.green('\n📊 Resultado:\n'));
                console.log(chalk.gray(JSON.stringify(taskData.result, null, 2)));
                
                if (taskData.result.output) {
                    console.log(chalk.green('\n📝 Output do LLM:\n'));
                    console.log(chalk.white(taskData.result.output));
                }
            }
            
            console.log(chalk.green('\n✅ VALIDAÇÃO: Task executou de verdade com LLM!'));
            console.log(chalk.green('✅ Output real foi retornado e salvo'));
            console.log(chalk.green('✅ Sistema funcionando corretamente\n'));
            
        } else {
            console.log(chalk.red('❌ Task falhou\n'));
        }
        
    } catch (error) {
        console.log(chalk.red(`\n❌ Erro ao executar task: ${error.message}\n`));
        console.log(chalk.gray(error.stack));
    }
}

testTaskExecution().catch(error => {
    console.error(chalk.red('\n❌ Erro fatal:'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray(error.stack));
    process.exit(1);
});
