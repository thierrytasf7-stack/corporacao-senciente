/**
 * AIOS-Core Squad Command
 * Gerenciamento de squads de agentes
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class SquadCommand {
    constructor() {
        this.squadsDir = path.join(process.cwd(), '.aios-core', 'squads');
        this.agentsDir = path.join(process.cwd(), '.aios-core', 'cli', 'agents');
        
        // Criar diretório se não existir
        fs.ensureDirSync(this.squadsDir);
    }

    async create(name, options = {}) {
        console.log(chalk.blue(`\n👥 Criando squad: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome do squad é obrigatório'));
            return false;
        }
        
        const squadFile = path.join(this.squadsDir, `${name}.json`);
        
        if (fs.existsSync(squadFile)) {
            console.log(chalk.yellow(`⚠️ Squad ${name} já existe`));
            return false;
        }
        
        const squadConfig = {
            name: name,
            description: options.description || `Squad ${name}`,
            agents: [],
            created_at: new Date().toISOString(),
            status: 'active',
            tasks_completed: 0,
            tasks_failed: 0
        };
        
        fs.writeJsonSync(squadFile, squadConfig, { spaces: 2 });
        
        console.log(chalk.green(`✅ Squad ${name} criado com sucesso`));
        console.log(chalk.gray(`   Arquivo: ${squadFile}`));
        
        return true;
    }

    list() {
        console.log(chalk.blue('\n👥 Squads Disponíveis\n'));
        
        if (!fs.existsSync(this.squadsDir)) {
            console.log(chalk.yellow('   Nenhum squad encontrado'));
            return;
        }
        
        const entries = fs.readdirSync(this.squadsDir, { withFileTypes: true });
        const squads = [];
        
        // Buscar arquivos .json (squads criados pelo menu)
        const jsonFiles = entries.filter(e => e.isFile() && e.name.endsWith('.json'));
        jsonFiles.forEach(file => {
            try {
                const squad = fs.readJsonSync(path.join(this.squadsDir, file.name));
                squads.push({ type: 'json', name: squad.name, data: squad });
            } catch (error) {
                console.log(chalk.red(`   ❌ Erro ao ler ${file.name}: ${error.message}`));
            }
        });
        
        // Buscar diretórios (squads importados dos repositórios)
        const dirs = entries.filter(e => e.isDirectory());
        dirs.forEach(dir => {
            // Tentar ler config.yaml ou squad.yaml
            const configPath = path.join(this.squadsDir, dir.name, 'config.yaml');
            const squadYamlPath = path.join(this.squadsDir, dir.name, 'squad.yaml');
            
            if (fs.existsSync(configPath) || fs.existsSync(squadYamlPath)) {
                squads.push({ 
                    type: 'directory', 
                    name: dir.name,
                    data: { 
                        name: dir.name, 
                        description: `Squad importado: ${dir.name}`,
                        agents: [],
                        status: 'active'
                    }
                });
            }
        });
        
        if (squads.length === 0) {
            console.log(chalk.yellow('   Nenhum squad encontrado'));
            return;
        }
        
        squads.forEach(({ type, name, data }) => {
            const status = data.status === 'active' ? '🟢' : '🔴';
            const typeIcon = type === 'json' ? '📄' : '📁';
            
            console.log(chalk.green(`${status} ${typeIcon} ${data.name}`));
            console.log(chalk.gray(`   Descrição: ${data.description}`));
            if (type === 'json') {
                console.log(chalk.gray(`   Agentes: ${data.agents.length}`));
                console.log(chalk.gray(`   Tasks: ${data.tasks_completed} completadas, ${data.tasks_failed} falhadas`));
            } else {
                console.log(chalk.gray(`   Tipo: Squad importado (diretório)`));
            }
            console.log('');
        });
    }

    async addAgent(squadName, agentName) {
        console.log(chalk.blue(`\n➕ Adicionando agente ${agentName} ao squad ${squadName}\n`));
        
        if (!squadName || !agentName) {
            console.log(chalk.red('❌ Nome do squad e agente são obrigatórios'));
            return false;
        }
        
        const squadFile = path.join(this.squadsDir, `${squadName}.json`);
        
        if (!fs.existsSync(squadFile)) {
            console.log(chalk.yellow(`⚠️ Squad ${squadName} não encontrado`));
            return false;
        }
        
        // Verificar se agente existe
        const agentExists = this.agentExists(agentName);
        if (!agentExists) {
            console.log(chalk.yellow(`⚠️ Agente ${agentName} não encontrado`));
            return false;
        }
        
        const squad = fs.readJsonSync(squadFile);
        
        // Verificar se agente já está no squad
        if (squad.agents.includes(agentName)) {
            console.log(chalk.yellow(`⚠️ Agente ${agentName} já está no squad`));
            return false;
        }
        
        squad.agents.push(agentName);
        squad.updated_at = new Date().toISOString();
        
        fs.writeJsonSync(squadFile, squad, { spaces: 2 });
        
        console.log(chalk.green(`✅ Agente ${agentName} adicionado ao squad ${squadName}`));
        console.log(chalk.gray(`   Total de agentes: ${squad.agents.length}`));
        
        return true;
    }

    async removeAgent(squadName, agentName) {
        console.log(chalk.blue(`\n➖ Removendo agente ${agentName} do squad ${squadName}\n`));
        
        if (!squadName || !agentName) {
            console.log(chalk.red('❌ Nome do squad e agente são obrigatórios'));
            return false;
        }
        
        const squadFile = path.join(this.squadsDir, `${squadName}.json`);
        
        if (!fs.existsSync(squadFile)) {
            console.log(chalk.yellow(`⚠️ Squad ${squadName} não encontrado`));
            return false;
        }
        
        const squad = fs.readJsonSync(squadFile);
        
        const agentIndex = squad.agents.indexOf(agentName);
        if (agentIndex === -1) {
            console.log(chalk.yellow(`⚠️ Agente ${agentName} não está no squad`));
            return false;
        }
        
        squad.agents.splice(agentIndex, 1);
        squad.updated_at = new Date().toISOString();
        
        fs.writeJsonSync(squadFile, squad, { spaces: 2 });
        
        console.log(chalk.green(`✅ Agente ${agentName} removido do squad ${squadName}`));
        console.log(chalk.gray(`   Total de agentes: ${squad.agents.length}`));
        
        return true;
    }

    async run(squadName, taskName) {
        console.log(chalk.blue(`\n🚀 Executando task ${taskName} com squad ${squadName}\n`));
        
        if (!squadName || !taskName) {
            console.log(chalk.red('❌ Nome do squad e task são obrigatórios'));
            return false;
        }
        
        const squadFile = path.join(this.squadsDir, `${squadName}.json`);
        
        if (!fs.existsSync(squadFile)) {
            console.log(chalk.yellow(`⚠️ Squad ${squadName} não encontrado`));
            return false;
        }
        
        const squad = fs.readJsonSync(squadFile);
        
        if (squad.agents.length === 0) {
            console.log(chalk.yellow(`⚠️ Squad ${squadName} não tem agentes`));
            return false;
        }
        
        console.log(chalk.green(`Squad: ${squad.name}`));
        console.log(chalk.gray(`Agentes: ${squad.agents.join(', ')}`));
        console.log(chalk.gray(`Task: ${taskName}\n`));
        
        // Executar task com cada agente do squad
        const results = [];
        for (const agentName of squad.agents) {
            console.log(chalk.yellow(`\n🤖 Executando com agente: ${agentName}`));
            
            try {
                // Aqui seria a integração com o AgentExecutor
                const result = await this.executeWithAgent(agentName, taskName);
                results.push(result);
                
                if (result.success) {
                    console.log(chalk.green(`   ✅ Sucesso`));
                } else {
                    console.log(chalk.red(`   ❌ Falha`));
                }
            } catch (error) {
                console.log(chalk.red(`   ❌ Erro: ${error.message}`));
                results.push({ success: false, error: error.message });
            }
        }
        
        // Atualizar estatísticas do squad
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        squad.tasks_completed += successCount;
        squad.tasks_failed += failCount;
        squad.last_run = new Date().toISOString();
        
        fs.writeJsonSync(squadFile, squad, { spaces: 2 });
        
        console.log(chalk.blue(`\n📊 Resultado:`));
        console.log(chalk.green(`   ✅ Sucesso: ${successCount}/${results.length}`));
        console.log(chalk.red(`   ❌ Falhas: ${failCount}/${results.length}`));
        
        return successCount > 0;
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

    async executeWithAgent(agentName, taskName) {
        // Simulação de execução
        // Em produção, isso chamaria o AgentExecutor
        return {
            success: true,
            agent: agentName,
            task: taskName,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SquadCommand;
