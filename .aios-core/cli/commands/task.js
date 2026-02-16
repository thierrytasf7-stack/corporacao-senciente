/**
 * AIOS-Core Task Command
 * Gerenciamento de tasks
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class TaskCommand {
    constructor() {
        this.tasksDir = path.join(process.cwd(), '.aios-core', 'tasks');
        this.agentsDir = path.join(process.cwd(), '.aios-core', 'cli', 'agents');
        
        // Criar diretório se não existir
        fs.ensureDirSync(this.tasksDir);
    }

    async create(name, options = {}) {
        console.log(chalk.blue(`\n📝 Criando task: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome da task é obrigatório'));
            return false;
        }
        
        const taskFile = path.join(this.tasksDir, `${name}.json`);
        
        if (fs.existsSync(taskFile)) {
            console.log(chalk.yellow(`⚠️ Task ${name} já existe`));
            return false;
        }
        
        const taskConfig = {
            id: name,
            name: name,
            description: options.description || `Task ${name}`,
            status: 'pending',
            priority: options.priority || 'medium',
            assigned_to: null,
            created_at: new Date().toISOString(),
            started_at: null,
            completed_at: null,
            result: null,
            error: null
        };
        
        fs.writeJsonSync(taskFile, taskConfig, { spaces: 2 });
        
        console.log(chalk.green(`✅ Task ${name} criada com sucesso`));
        console.log(chalk.gray(`   Arquivo: ${taskFile}`));
        console.log(chalk.gray(`   Status: ${taskConfig.status}`));
        console.log(chalk.gray(`   Prioridade: ${taskConfig.priority}`));
        
        return true;
    }

    list() {
        console.log(chalk.blue('\n📋 Tasks Disponíveis\n'));
        
        if (!fs.existsSync(this.tasksDir)) {
            console.log(chalk.yellow('   Nenhuma task encontrada'));
            return;
        }
        
        const files = fs.readdirSync(this.tasksDir).filter(f => f.endsWith('.json'));
        
        if (files.length === 0) {
            console.log(chalk.yellow('   Nenhuma task encontrada'));
            return;
        }
        
        // Agrupar por status
        const tasks = files.map(file => 
            fs.readJsonSync(path.join(this.tasksDir, file))
        );
        
        const byStatus = {
            pending: tasks.filter(t => t.status === 'pending'),
            running: tasks.filter(t => t.status === 'running'),
            completed: tasks.filter(t => t.status === 'completed'),
            failed: tasks.filter(t => t.status === 'failed')
        };
        
        // Exibir por status
        if (byStatus.pending.length > 0) {
            console.log(chalk.yellow('⏳ Pendentes:'));
            byStatus.pending.forEach(task => {
                console.log(chalk.gray(`   • ${task.name} - ${task.priority} priority`));
            });
            console.log();
        }
        
        if (byStatus.running.length > 0) {
            console.log(chalk.blue('🔄 Em execução:'));
            byStatus.running.forEach(task => {
                console.log(chalk.gray(`   • ${task.name} - ${task.assigned_to || 'sem agente'}`));
            });
            console.log();
        }
        
        if (byStatus.completed.length > 0) {
            console.log(chalk.green('✅ Completadas:'));
            byStatus.completed.forEach(task => {
                console.log(chalk.gray(`   • ${task.name}`));
            });
            console.log();
        }
        
        if (byStatus.failed.length > 0) {
            console.log(chalk.red('❌ Falhadas:'));
            byStatus.failed.forEach(task => {
                console.log(chalk.gray(`   • ${task.name} - ${task.error || 'erro desconhecido'}`));
            });
            console.log();
        }
        
        console.log(chalk.gray(`Total: ${tasks.length} tasks`));
    }

    async run(name) {
        console.log(chalk.blue(`\n🚀 Executando task: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome da task é obrigatório'));
            return false;
        }
        
        const taskFile = path.join(this.tasksDir, `${name}.json`);
        
        if (!fs.existsSync(taskFile)) {
            console.log(chalk.yellow(`⚠️ Task ${name} não encontrada`));
            return false;
        }
        
        const task = fs.readJsonSync(taskFile);
        
        if (task.status === 'running') {
            console.log(chalk.yellow(`⚠️ Task ${name} já está em execução`));
            return false;
        }
        
        // Atualizar status para running
        task.status = 'running';
        task.started_at = new Date().toISOString();
        fs.writeJsonSync(taskFile, task, { spaces: 2 });
        
        console.log(chalk.green(`Task: ${task.name}`));
        console.log(chalk.gray(`Descrição: ${task.description}`));
        console.log(chalk.gray(`Agente: ${task.assigned_to || 'não atribuído'}\n`));
        
        try {
            // Executar task
            console.log(chalk.yellow('⏳ Executando...'));
            
            const result = await this.executeTask(task);
            
            // Atualizar status para completed
            task.status = 'completed';
            task.completed_at = new Date().toISOString();
            task.result = result;
            task.error = null; // Limpar erro anterior
            fs.writeJsonSync(taskFile, task, { spaces: 2 });
            
            console.log(chalk.green('\n✅ Task completada com sucesso'));
            
            // Exibir relatório detalhado
            this.showTaskReport(task, result);
            
            return true;
            
        } catch (error) {
            // Atualizar status para failed
            task.status = 'failed';
            task.completed_at = new Date().toISOString();
            task.error = error.message;
            fs.writeJsonSync(taskFile, task, { spaces: 2 });
            
            console.log(chalk.red(`\n❌ Task falhou: ${error.message}`));
            
            return false;
        }
    }

    status(name) {
        if (name) {
            // Status de uma task específica
            return this.showTaskStatus(name);
        } else {
            // Status geral de todas as tasks
            return this.showAllTasksStatus();
        }
    }

    showTaskStatus(name) {
        console.log(chalk.blue(`\n📊 Status da Task: ${name}\n`));
        
        const taskFile = path.join(this.tasksDir, `${name}.json`);
        
        if (!fs.existsSync(taskFile)) {
            console.log(chalk.yellow(`⚠️ Task ${name} não encontrada`));
            return false;
        }
        
        const task = fs.readJsonSync(taskFile);
        
        const statusIcon = {
            pending: '⏳',
            running: '🔄',
            completed: '✅',
            failed: '❌'
        }[task.status] || '❓';
        
        console.log(chalk.green(`${statusIcon} Status: ${task.status}`));
        console.log(chalk.gray(`   Nome: ${task.name}`));
        console.log(chalk.gray(`   Descrição: ${task.description}`));
        console.log(chalk.gray(`   Prioridade: ${task.priority}`));
        console.log(chalk.gray(`   Agente: ${task.assigned_to || 'não atribuído'}`));
        console.log(chalk.gray(`   Criada em: ${new Date(task.created_at).toLocaleString()}`));
        
        if (task.started_at) {
            console.log(chalk.gray(`   Iniciada em: ${new Date(task.started_at).toLocaleString()}`));
        }
        
        if (task.completed_at) {
            console.log(chalk.gray(`   Completada em: ${new Date(task.completed_at).toLocaleString()}`));
            
            const duration = new Date(task.completed_at) - new Date(task.started_at);
            console.log(chalk.gray(`   Duração: ${Math.round(duration / 1000)}s`));
        }
        
        if (task.error) {
            console.log(chalk.red(`   Erro: ${task.error}`));
        }
        
        return true;
    }

    showAllTasksStatus() {
        console.log(chalk.blue('\n📊 Status Geral das Tasks\n'));
        
        if (!fs.existsSync(this.tasksDir)) {
            console.log(chalk.yellow('   Nenhuma task encontrada'));
            return;
        }
        
        const files = fs.readdirSync(this.tasksDir).filter(f => f.endsWith('.json'));
        
        if (files.length === 0) {
            console.log(chalk.yellow('   Nenhuma task encontrada'));
            return;
        }
        
        const tasks = files.map(file => 
            fs.readJsonSync(path.join(this.tasksDir, file))
        );
        
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            running: tasks.filter(t => t.status === 'running').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            failed: tasks.filter(t => t.status === 'failed').length
        };
        
        console.log(chalk.green(`Total de tasks: ${stats.total}`));
        console.log(chalk.yellow(`  ⏳ Pendentes: ${stats.pending}`));
        console.log(chalk.blue(`  🔄 Em execução: ${stats.running}`));
        console.log(chalk.green(`  ✅ Completadas: ${stats.completed}`));
        console.log(chalk.red(`  ❌ Falhadas: ${stats.failed}`));
        
        const successRate = stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100) 
            : 0;
        
        console.log(chalk.gray(`\nTaxa de sucesso: ${successRate}%`));
        
        return true;
    }

    async assign(taskName, agentName) {
        console.log(chalk.blue(`\n👤 Atribuindo task ${taskName} ao agente ${agentName}\n`));
        
        if (!taskName || !agentName) {
            console.log(chalk.red('❌ Nome da task e agente são obrigatórios'));
            return false;
        }
        
        const taskFile = path.join(this.tasksDir, `${taskName}.json`);
        
        if (!fs.existsSync(taskFile)) {
            console.log(chalk.yellow(`⚠️ Task ${taskName} não encontrada`));
            return false;
        }
        
        // Verificar se agente existe
        const agentExists = this.agentExists(agentName);
        if (!agentExists) {
            console.log(chalk.yellow(`⚠️ Agente ${agentName} não encontrado`));
            return false;
        }
        
        const task = fs.readJsonSync(taskFile);
        
        task.assigned_to = agentName;
        task.updated_at = new Date().toISOString();
        
        fs.writeJsonSync(taskFile, task, { spaces: 2 });
        
        console.log(chalk.green(`✅ Task ${taskName} atribuída ao agente ${agentName}`));
        
        return true;
    }

    // Métodos auxiliares
    agentExists(agentName) {
        const defaultAgents = ['dev', 'architect', 'qa'];
        if (defaultAgents.includes(agentName)) {
            return true;
        }
        
        const agentFile = path.join(this.agentsDir, `${agentName}.json`);
        return fs.existsSync(agentFile);
    }

    async executeTask(task) {
        // Executar task chamando LLM diretamente
        // Nota: AgentExecutor é muito complexo e específico para workflows
        // Vamos fazer uma chamada direta ao LLM para tasks simples
        
        try {
            // Carregar dotenv
            require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
            
            // Determinar qual agente usar
            const agentName = task.assigned_to || 'dev';
            
            // Carregar configuração do agente se existir
            const agentFile = require('path').join(this.agentsDir, `${agentName}.json`);
            let agentConfig = { model: 'anthropic/claude-3.5-sonnet', temperature: 0.3 };
            
            if (require('fs-extra').existsSync(agentFile)) {
                agentConfig = require('fs-extra').readJsonSync(agentFile);
            }
            
            // Preparar API key (usar keys gratuitas com rotação)
            const freeKeys = [
                process.env.OPENROUTER_API_KEY_FREE_1,
                process.env.OPENROUTER_API_KEY_FREE_2,
                process.env.OPENROUTER_API_KEY_FREE_3,
                process.env.OPENROUTER_API_KEY_FREE_4,
                process.env.OPENROUTER_API_KEY_FREE_5
            ].filter(Boolean);
            
            const apiKey = freeKeys[0] || process.env.OPENROUTER_API_KEY;
            
            if (!apiKey) {
                throw new Error('API Key não configurada. Defina OPENROUTER_API_KEY no .env');
            }
            
            // Montar prompt
            const prompt = `Task: ${task.name}\n\nDescrição: ${task.description}\n\nExecute esta task e retorne o resultado detalhado.`;
            
            // Chamar LLM
            console.log(chalk.gray(`   🌐 Chamando LLM: ${agentConfig.model}`));
            
            const fetch = require('node-fetch');
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/aios-core',
                    'X-Title': 'AIOS-Core Task Execution'
                },
                body: JSON.stringify({
                    model: agentConfig.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: agentConfig.temperature || 0.3,
                    max_tokens: 8000
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`LLM API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            const output = data.choices[0].message.content;
            
            console.log(chalk.gray(`   ✅ Resposta recebida (${output.length} caracteres)`));
            
            return {
                success: true,
                task_id: task.id,
                agent: agentName,
                model: agentConfig.model,
                output: output,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Falha ao executar task: ${error.message}`);
        }
    }

    /**
     * Exibir relatório detalhado da task completada
     */
    showTaskReport(task, result) {
        const duration = new Date(task.completed_at) - new Date(task.started_at);
        const durationSeconds = Math.round(duration / 1000);
        
        console.log(chalk.cyan('\n' + '='.repeat(70)));
        console.log(chalk.cyan.bold('📊 RELATÓRIO DE EXECUÇÃO DA TASK'));
        console.log(chalk.cyan('='.repeat(70)));
        
        // Informações básicas
        console.log(chalk.white('\n📝 INFORMAÇÕES BÁSICAS:'));
        console.log(chalk.gray(`   Task: ${task.name}`));
        console.log(chalk.gray(`   Descrição: ${task.description}`));
        console.log(chalk.gray(`   Prioridade: ${task.priority}`));
        console.log(chalk.gray(`   Agente: ${task.assigned_to || 'não atribuído'}`));
        
        // Status e timing
        console.log(chalk.white('\n⏱️  TIMING:'));
        console.log(chalk.gray(`   Criada em: ${new Date(task.created_at).toLocaleString()}`));
        console.log(chalk.gray(`   Iniciada em: ${new Date(task.started_at).toLocaleString()}`));
        console.log(chalk.gray(`   Completada em: ${new Date(task.completed_at).toLocaleString()}`));
        console.log(chalk.green(`   ⚡ Duração: ${durationSeconds}s`));
        
        // Resultado da execução
        console.log(chalk.white('\n✅ RESULTADO:'));
        console.log(chalk.green(`   Status: ${result.success ? 'SUCESSO' : 'FALHA'}`));
        console.log(chalk.gray(`   Modelo LLM: ${result.model}`));
        console.log(chalk.gray(`   Agente executado: ${result.agent}`));
        console.log(chalk.gray(`   Tamanho do output: ${result.output.length} caracteres`));
        
        // Output do LLM (primeiras 500 caracteres)
        console.log(chalk.white('\n📄 OUTPUT DO LLM:'));
        console.log(chalk.cyan('─'.repeat(70)));
        
        const outputPreview = result.output.length > 500 
            ? result.output.substring(0, 500) + '\n\n' + chalk.yellow('[... output truncado, veja o arquivo JSON completo ...]')
            : result.output;
        
        console.log(chalk.white(outputPreview));
        console.log(chalk.cyan('─'.repeat(70)));
        
        // Estatísticas
        console.log(chalk.white('\n📈 ESTATÍSTICAS:'));
        console.log(chalk.gray(`   Caracteres gerados: ${result.output.length}`));
        console.log(chalk.gray(`   Palavras aproximadas: ${Math.round(result.output.length / 5)}`));
        console.log(chalk.gray(`   Linhas aproximadas: ${result.output.split('\n').length}`));
        console.log(chalk.gray(`   Velocidade: ${Math.round(result.output.length / durationSeconds)} caracteres/segundo`));
        
        // Arquivo salvo
        console.log(chalk.white('\n💾 ARQUIVO SALVO:'));
        const taskFile = path.join(this.tasksDir, `${task.id}.json`);
        console.log(chalk.gray(`   Localização: ${taskFile}`));
        console.log(chalk.gray(`   Formato: JSON`));
        console.log(chalk.gray(`   Campo error: ${task.error === null ? 'null (sem erros)' : 'preenchido'}`));
        
        // Próximos passos
        console.log(chalk.white('\n🎯 PRÓXIMOS PASSOS:'));
        console.log(chalk.gray(`   1. Revisar o output completo no arquivo JSON`));
        console.log(chalk.gray(`   2. Validar se o resultado atende aos requisitos`));
        console.log(chalk.gray(`   3. Executar ações recomendadas pelo agente`));
        
        console.log(chalk.cyan('\n' + '='.repeat(70)));
        console.log(chalk.green.bold('✅ RELATÓRIO COMPLETO GERADO COM SUCESSO'));
        console.log(chalk.cyan('='.repeat(70) + '\n'));
    }
}

module.exports = TaskCommand;
