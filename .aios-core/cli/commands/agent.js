/**
 * AIOS-Core Agent Command
 * Gerenciamento completo de agentes
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class AgentCommand {
    constructor() {
        this.agentsDir = path.join(process.cwd(), '.aios-core', 'cli', 'agents');
        this.configFile = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
    }

    list() {
        console.log(chalk.blue('\n🤖 AIOS-Core Agents\n'));
        
        const config = this.loadConfig();
        const agents = config.agents || {};
        
        console.log(chalk.green('Agentes disponíveis:'));
        console.log(chalk.gray('  • dev - Desenvolvimento e refatoração'));
        console.log(chalk.gray('  • architect - Validação arquitetural'));
        console.log(chalk.gray('  • qa - Quality assurance'));
        
        // Listar agentes customizados
        const customAgents = this.getCustomAgents();
        if (customAgents.length > 0) {
            console.log(chalk.yellow('\nAgentes customizados:'));
            customAgents.forEach(agent => {
                console.log(chalk.gray(`  • ${agent.name} - ${agent.description}`));
            });
        }
    }

    async create(name, options = {}) {
        console.log(chalk.blue(`\n🔧 Criando agente: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome do agente é obrigatório'));
            return false;
        }
        
        const agentFile = path.join(this.agentsDir, `${name}.json`);
        
        if (fs.existsSync(agentFile)) {
            console.log(chalk.yellow(`⚠️ Agente ${name} já existe`));
            return false;
        }
        
        const agentConfig = {
            name: name,
            description: options.description || `Agente ${name}`,
            model: options.model || 'claude-3.5-sonnet',
            temperature: options.temperature || 0.3,
            capabilities: options.capabilities || ['code', 'documentation'],
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        fs.writeJsonSync(agentFile, agentConfig, { spaces: 2 });
        
        console.log(chalk.green(`✅ Agente ${name} criado com sucesso`));
        console.log(chalk.gray(`   Arquivo: ${agentFile}`));
        
        return true;
    }

    async delete(name) {
        console.log(chalk.blue(`\n🗑️ Removendo agente: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome do agente é obrigatório'));
            return false;
        }
        
        // Proteger agentes padrão
        const defaultAgents = ['dev', 'architect', 'qa'];
        if (defaultAgents.includes(name)) {
            console.log(chalk.red(`❌ Não é possível remover agente padrão: ${name}`));
            return false;
        }
        
        const agentFile = path.join(this.agentsDir, `${name}.json`);
        
        if (!fs.existsSync(agentFile)) {
            console.log(chalk.yellow(`⚠️ Agente ${name} não encontrado`));
            return false;
        }
        
        fs.removeSync(agentFile);
        
        console.log(chalk.green(`✅ Agente ${name} removido com sucesso`));
        
        return true;
    }

    async configure(name, options = {}) {
        console.log(chalk.blue(`\n⚙️ Configurando agente: ${name}\n`));
        
        if (!name) {
            console.log(chalk.red('❌ Nome do agente é obrigatório'));
            return false;
        }
        
        // Garantir que o diretório de agentes existe
        fs.ensureDirSync(this.agentsDir);
        
        const agentFile = path.join(this.agentsDir, `${name}.json`);
        
        let agentConfig;
        
        // Se o agente não existe, criar configuração padrão
        if (!fs.existsSync(agentFile)) {
            // Verificar se é um agente padrão
            const defaultAgents = {
                'dev': { description: 'Desenvolvimento e refatoração', capabilities: ['code', 'refactoring', 'debugging'] },
                'architect': { description: 'Validação arquitetural', capabilities: ['architecture', 'design', 'validation'] },
                'qa': { description: 'Quality assurance', capabilities: ['testing', 'quality', 'validation'] }
            };
            
            if (defaultAgents[name]) {
                // Criar arquivo para agente padrão
                agentConfig = {
                    name: name,
                    description: defaultAgents[name].description,
                    model: 'anthropic/claude-3.5-sonnet',
                    temperature: 0.3,
                    capabilities: defaultAgents[name].capabilities,
                    created_at: new Date().toISOString(),
                    status: 'active',
                    isDefault: true
                };
                console.log(chalk.gray(`📝 Criando configuração para agente padrão: ${name}`));
            } else {
                console.log(chalk.yellow(`⚠️ Agente ${name} não encontrado`));
                return false;
            }
        } else {
            // Carregar configuração existente
            agentConfig = fs.readJsonSync(agentFile);
        }
        
        // Atualizar configurações
        if (options.model) agentConfig.model = options.model;
        if (options.temperature !== undefined) agentConfig.temperature = options.temperature;
        if (options.description) agentConfig.description = options.description;
        if (options.capabilities) agentConfig.capabilities = options.capabilities;
        
        agentConfig.updated_at = new Date().toISOString();
        
        fs.writeJsonSync(agentFile, agentConfig, { spaces: 2 });
        
        console.log(chalk.green(`✅ Agente ${name} configurado com sucesso`));
        console.log(chalk.gray(`   Modelo: ${agentConfig.model}`));
        console.log(chalk.gray(`   Temperature: ${agentConfig.temperature}`));
        
        return true;
    }

    status() {
        console.log(chalk.blue('\n📊 Status dos Agentes\n'));
        
        const customAgents = this.getCustomAgents();
        const totalAgents = 3 + customAgents.length; // 3 padrão + customizados
        
        console.log(chalk.green(`Total de agentes: ${totalAgents}`));
        console.log(chalk.gray(`  • Padrão: 3 (dev, architect, qa)`));
        console.log(chalk.gray(`  • Customizados: ${customAgents.length}`));
        
        if (customAgents.length > 0) {
            console.log(chalk.yellow('\nAgentes customizados:'));
            customAgents.forEach(agent => {
                const status = agent.status === 'active' ? '🟢' : '🔴';
                console.log(chalk.gray(`  ${status} ${agent.name} - ${agent.model}`));
            });
        }
        
        return true;
    }

    // Métodos auxiliares
    loadConfig() {
        if (!fs.existsSync(this.configFile)) {
            return {};
        }
        return yaml.load(fs.readFileSync(this.configFile, 'utf8'));
    }

    getCustomAgents() {
        if (!fs.existsSync(this.agentsDir)) {
            return [];
        }
        
        // Buscar em DOIS diretórios (estrutura original AIOS + CLI)
        const agentsDirs = [
            path.join(process.cwd(), '.aios-core', 'development', 'agents'),  // Estrutura original AIOS
            this.agentsDir                                                      // Estrutura CLI
        ];
        
        // Nomes dos agentes padrão que não devem ser incluídos
        const defaultAgentNames = ['dev.json', 'architect.json', 'qa.json', 'dev.md', 'architect.md', 'qa.md'];
        
        const agents = [];
        const seenAgents = new Set(); // Evitar duplicatas
        
        agentsDirs.forEach(agentsDir => {
            if (!fs.existsSync(agentsDir)) {
                return;
            }
            
            // Buscar arquivos .json
            const jsonFiles = fs.readdirSync(agentsDir)
                .filter(f => f.endsWith('.json') && f !== 'agent-executor.js')
                .filter(f => !defaultAgentNames.includes(f));
            
            jsonFiles.forEach(file => {
                const agentName = file.replace('.json', '');
                if (seenAgents.has(agentName)) return;
                
                try {
                    const agent = fs.readJsonSync(path.join(agentsDir, file));
                    agents.push(agent);
                    seenAgents.add(agentName);
                } catch (error) {
                    // Ignorar arquivos com erro
                }
            });
            
            // Buscar arquivos .md
            const mdFiles = fs.readdirSync(agentsDir)
                .filter(f => f.endsWith('.md') && !f.startsWith('._'))
                .filter(f => !defaultAgentNames.includes(f));
            
            mdFiles.forEach(file => {
                const agentName = file.replace('.md', '');
                if (seenAgents.has(agentName)) return;
                
                agents.push({
                    name: agentName,
                    description: `Agente importado: ${agentName}`,
                    model: 'anthropic/claude-3.5-sonnet',
                    temperature: 0.7,
                    isImported: true,
                    source: agentsDir.includes('development') ? 'development' : 'cli'
                });
                seenAgents.add(agentName);
            });
        });
        
        return agents;
    }
}

module.exports = AgentCommand;
