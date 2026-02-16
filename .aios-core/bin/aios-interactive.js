#!/usr/bin/env node

/**
 * AIOS-Core Interactive Menu
 * Sistema de menu numérico interativo para navegação fácil
 * Compatível com Aider (usa / em vez de @ ou *)
 */

const readline = require('readline');
const chalk = require('chalk');
const AgentCommand = require('../cli/commands/agent');
const SquadCommand = require('../cli/commands/squad');
const TaskCommand = require('../cli/commands/task');
const WorkflowCommand = require('../cli/commands/workflow');

class AIOSInteractive {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.agent = new AgentCommand();
        this.squad = new SquadCommand();
        this.task = new TaskCommand();
        this.workflow = new WorkflowCommand();
        
        this.currentMenu = 'main';
        this.history = [];
    }

    async start() {
        console.clear();
        this.showBanner();
        await this.showMainMenu();
    }

    showBanner() {
        console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
        console.log(chalk.blue('║                                                              ║'));
        console.log(chalk.blue('║              AIOS-CORE INTERACTIVE MENU                      ║'));
        console.log(chalk.blue('║              Sistema de Navegação Numérica                   ║'));
        console.log(chalk.blue('║                                                              ║'));
        console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));
    }

    async showMainMenu() {
        console.log(chalk.green('\n📋 MENU PRINCIPAL\n'));
        console.log(chalk.white('1. 🤖 Gerenciar Agentes'));
        console.log(chalk.white('2. 👥 Gerenciar Squads'));
        console.log(chalk.white('3. 📝 Gerenciar Tasks'));
        console.log(chalk.white('4. 🔄 Gerenciar Workflows'));
        console.log(chalk.white('5. ⚙️  Configurações'));
        console.log(chalk.white('6. 📊 Status Geral'));
        console.log(chalk.white('0. ❌ Sair\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleMainMenu(choice);
    }

    async handleMainMenu(choice) {
        switch (choice) {
            case '1':
                await this.showAgentMenu();
                break;
            case '2':
                await this.showSquadMenu();
                break;
            case '3':
                await this.showTaskMenu();
                break;
            case '4':
                await this.showWorkflowMenu();
                break;
            case '5':
                await this.showConfigMenu();
                break;
            case '6':
                await this.showStatusMenu();
                break;
            case '0':
                console.log(chalk.yellow('\n👋 Até logo!\n'));
                this.rl.close();
                process.exit(0);
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showMainMenu();
        }
    }

    async showAgentMenu() {
        console.log(chalk.green('\n🤖 MENU DE AGENTES\n'));
        console.log(chalk.white('1. 📋 Listar agentes'));
        console.log(chalk.white('2. ➕ Criar novo agente'));
        console.log(chalk.white('3. 🗑️  Remover agente'));
        console.log(chalk.white('4. ⚙️  Configurar agente'));
        console.log(chalk.white('5. 📊 Ver status dos agentes'));
        console.log(chalk.white('0. ⬅️  Voltar ao menu principal\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleAgentMenu(choice);
    }

    async handleAgentMenu(choice) {
        switch (choice) {
            case '1':
                this.agent.list();
                await this.pressEnterToContinue();
                await this.showAgentMenu();
                break;
            case '2':
                await this.createAgent();
                break;
            case '3':
                await this.deleteAgent();
                break;
            case '4':
                await this.configureAgent();
                break;
            case '5':
                this.agent.status();
                await this.pressEnterToContinue();
                await this.showAgentMenu();
                break;
            case '0':
                await this.showMainMenu();
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showAgentMenu();
        }
    }

    async showSquadMenu() {
        console.log(chalk.green('\n👥 MENU DE SQUADS\n'));
        console.log(chalk.white('1. 📋 Listar squads'));
        console.log(chalk.white('2. ➕ Criar novo squad'));
        console.log(chalk.white('3. 👤 Adicionar agente ao squad'));
        console.log(chalk.white('4. ➖ Remover agente do squad'));
        console.log(chalk.white('5. 🚀 Executar task com squad'));
        console.log(chalk.white('0. ⬅️  Voltar ao menu principal\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleSquadMenu(choice);
    }

    async handleSquadMenu(choice) {
        switch (choice) {
            case '1':
                this.squad.list();
                await this.pressEnterToContinue();
                await this.showSquadMenu();
                break;
            case '2':
                await this.createSquad();
                break;
            case '3':
                await this.addAgentToSquad();
                break;
            case '4':
                await this.removeAgentFromSquad();
                break;
            case '5':
                await this.runSquadTask();
                break;
            case '0':
                await this.showMainMenu();
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showSquadMenu();
        }
    }

    async showTaskMenu() {
        console.log(chalk.green('\n📝 MENU DE TASKS\n'));
        console.log(chalk.white('1. 📋 Listar tasks'));
        console.log(chalk.white('2. ➕ Criar nova task'));
        console.log(chalk.white('3. 🚀 Executar task'));
        console.log(chalk.white('4. 📊 Ver status de task'));
        console.log(chalk.white('5. 👤 Atribuir task a agente'));
        console.log(chalk.white('6. 📈 Status geral das tasks'));
        console.log(chalk.white('0. ⬅️  Voltar ao menu principal\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleTaskMenu(choice);
    }

    async handleTaskMenu(choice) {
        switch (choice) {
            case '1':
                this.task.list();
                await this.pressEnterToContinue();
                await this.showTaskMenu();
                break;
            case '2':
                await this.createTask();
                break;
            case '3':
                await this.runTask();
                break;
            case '4':
                await this.showTaskStatus();
                break;
            case '5':
                await this.assignTask();
                break;
            case '6':
                this.task.status();
                await this.pressEnterToContinue();
                await this.showTaskMenu();
                break;
            case '0':
                await this.showMainMenu();
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showTaskMenu();
        }
    }

    async showWorkflowMenu() {
        console.log(chalk.green('\n🔄 MENU DE WORKFLOWS\n'));
        console.log(chalk.white('1. 📋 Listar workflows'));
        console.log(chalk.white('2. 🚀 Executar workflow'));
        console.log(chalk.white('0. ⬅️  Voltar ao menu principal\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleWorkflowMenu(choice);
    }

    async handleWorkflowMenu(choice) {
        switch (choice) {
            case '1':
                this.workflow.list();
                await this.pressEnterToContinue();
                await this.showWorkflowMenu();
                break;
            case '2':
                await this.runWorkflow();
                break;
            case '0':
                await this.showMainMenu();
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showWorkflowMenu();
        }
    }

    async showConfigMenu() {
        console.log(chalk.green('\n⚙️  MENU DE CONFIGURAÇÕES\n'));
        console.log(chalk.white('1. 📋 Ver configuração atual'));
        console.log(chalk.white('2. 🤖 Selecionar modelo LLM'));
        console.log(chalk.white('3. ✏️  Editar configuração'));
        console.log(chalk.white('0. ⬅️  Voltar ao menu principal\n'));

        const choice = await this.prompt('Escolha uma opção: ');
        await this.handleConfigMenu(choice);
    }

    async handleConfigMenu(choice) {
        switch (choice) {
            case '1':
                const fs = require('fs-extra');
                const path = require('path');
                const configFile = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
                if (fs.existsSync(configFile)) {
                    const config = fs.readFileSync(configFile, 'utf8');
                    console.log(chalk.blue('\n📋 Configuração AIOS-Core:\n'));
                    console.log(config);
                } else {
                    console.log(chalk.yellow('\n⚠️ Arquivo de configuração não encontrado\n'));
                }
                await this.pressEnterToContinue();
                await this.showConfigMenu();
                break;
            case '2':
                await this.selectLLMModel();
                break;
            case '3':
                console.log(chalk.yellow('\n⚠️ Edição de configuração não implementada ainda\n'));
                await this.pressEnterToContinue();
                await this.showConfigMenu();
                break;
            case '0':
                await this.showMainMenu();
                break;
            default:
                console.log(chalk.red('\n❌ Opção inválida!\n'));
                await this.showConfigMenu();
        }
    }

    async showStatusMenu() {
        console.log(chalk.green('\n📊 STATUS GERAL DO SISTEMA\n'));
        
        // Status de agentes
        console.log(chalk.blue('🤖 Agentes:'));
        this.agent.status();
        
        // Status de tasks
        console.log(chalk.blue('\n📝 Tasks:'));
        this.task.status();
        
        // Status de squads
        console.log(chalk.blue('\n👥 Squads:'));
        this.squad.list();
        
        await this.pressEnterToContinue();
        await this.showMainMenu();
    }

    // Métodos auxiliares para criar/editar
    async createAgent() {
        console.log(chalk.blue('\n➕ CRIAR NOVO AGENTE\n'));
        const name = await this.prompt('Nome do agente: ');
        const description = await this.prompt('Descrição (opcional): ');
        
        // Seleção de modelo
        const models = this.getAvailableModels();
        console.log(chalk.green('\nModelos LLM disponíveis:\n'));
        models.forEach((model, index) => {
            const cost = model.free ? chalk.green('FREE') : chalk.yellow(`$${model.cost}`);
            console.log(chalk.white(`${index + 1}. ${model.name} (${cost})`));
        });
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const modelChoice = await this.prompt('Escolha o modelo: ');
        
        if (modelChoice === '0') {
            await this.showAgentMenu();
            return;
        }
        
        const modelIndex = parseInt(modelChoice) - 1;
        if (modelIndex < 0 || modelIndex >= models.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showAgentMenu();
            return;
        }
        
        const selectedModel = models[modelIndex].id;
        const temperature = await this.prompt('\nTemperature (padrão: 0.3): ') || '0.3';
        
        await this.agent.create(name, {
            description: description || `Agente ${name}`,
            model: selectedModel,
            temperature: parseFloat(temperature)
        });
        
        await this.pressEnterToContinue();
        await this.showAgentMenu();
    }

    async deleteAgent() {
        console.log(chalk.blue('\n🗑️  REMOVER AGENTE\n'));
        
        // Listar agentes customizados
        const agents = this.getCustomAgents();
        
        if (agents.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhum agente customizado disponível para remover\n'));
            console.log(chalk.gray('(Agentes padrão dev, architect, qa não podem ser removidos)\n'));
            await this.pressEnterToContinue();
            await this.showAgentMenu();
            return;
        }
        
        console.log(chalk.green('Agentes customizados:\n'));
        agents.forEach((agent, index) => {
            console.log(chalk.white(`${index + 1}. ${agent.name} - ${agent.model}`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const choice = await this.prompt('Escolha o agente: ');
        
        if (choice === '0') {
            await this.showAgentMenu();
            return;
        }
        
        const agentIndex = parseInt(choice) - 1;
        if (agentIndex >= 0 && agentIndex < agents.length) {
            await this.agent.delete(agents[agentIndex].name);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showAgentMenu();
    }

    async configureAgent() {
        console.log(chalk.blue('\n⚙️  CONFIGURAR AGENTE\n'));
        
        // Listar todos os agentes
        const agents = this.getAvailableAgents();
        
        console.log(chalk.green('Agentes disponíveis:\n'));
        agents.forEach((agent, index) => {
            const type = ['dev', 'architect', 'qa'].includes(agent.name) ? '(padrão)' : '(customizado)';
            console.log(chalk.white(`${index + 1}. ${agent.name} - ${agent.model || 'padrão'} ${chalk.gray(type)}`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const choice = await this.prompt('Escolha o agente: ');
        
        if (choice === '0') {
            await this.showAgentMenu();
            return;
        }
        
        const agentIndex = parseInt(choice) - 1;
        if (agentIndex < 0 || agentIndex >= agents.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showAgentMenu();
            return;
        }
        
        const selectedAgent = agents[agentIndex];
        
        console.log(chalk.blue(`\nConfigurando: ${selectedAgent.name}\n`));
        
        // Seleção de modelo
        const models = this.getAvailableModels();
        console.log(chalk.green('Modelos LLM disponíveis:\n'));
        models.forEach((model, index) => {
            const current = model.id === selectedAgent.model ? '← atual' : '';
            const cost = model.free ? chalk.green('FREE') : chalk.yellow(`$${model.cost}`);
            console.log(chalk.white(`${index + 1}. ${model.name} (${cost}) ${chalk.gray(current)}`));
        });
        console.log(chalk.white(`${models.length + 1}. ⏭️  Manter modelo atual (${selectedAgent.model || 'padrão'})`));
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const modelChoice = await this.prompt('Escolha o modelo: ');
        
        if (modelChoice === '0') {
            await this.showAgentMenu();
            return;
        }
        
        let selectedModel = null;
        const modelIndex = parseInt(modelChoice) - 1;
        if (modelIndex >= 0 && modelIndex < models.length) {
            selectedModel = models[modelIndex].id;
        } else if (modelChoice === String(models.length + 1)) {
            selectedModel = null; // Manter atual
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showAgentMenu();
            return;
        }
        
        // Temperature
        const temperature = await this.prompt(`\nNova temperature (atual: ${selectedAgent.temperature || '0.3'}, Enter para manter): `);
        
        // Description
        const description = await this.prompt('Nova descrição (Enter para manter): ');
        
        const options = {};
        if (selectedModel) options.model = selectedModel;
        if (temperature) options.temperature = parseFloat(temperature);
        if (description) options.description = description;
        
        if (Object.keys(options).length > 0) {
            await this.agent.configure(selectedAgent.name, options);
        } else {
            console.log(chalk.yellow('\n⚠️ Nenhuma alteração realizada\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showAgentMenu();
    }

    async createSquad() {
        console.log(chalk.blue('\n➕ CRIAR NOVO SQUAD\n'));
        const name = await this.prompt('Nome do squad: ');
        const description = await this.prompt('Descrição (opcional): ');
        
        await this.squad.create(name, {
            description: description || `Squad ${name}`
        });
        
        await this.pressEnterToContinue();
        await this.showSquadMenu();
    }

    async addAgentToSquad() {
        console.log(chalk.blue('\n👤 ADICIONAR AGENTE AO SQUAD\n'));
        
        // Listar squads disponíveis
        const squads = this.getAvailableSquads();
        
        if (squads.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhum squad disponível\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        console.log(chalk.green('Squads disponíveis:\n'));
        squads.forEach((squad, index) => {
            console.log(chalk.white(`${index + 1}. ${squad.name} (${squad.agents.length} agentes)`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const squadChoice = await this.prompt('Escolha o squad: ');
        
        if (squadChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const squadIndex = parseInt(squadChoice) - 1;
        if (squadIndex < 0 || squadIndex >= squads.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        // Listar agentes disponíveis
        const agents = this.getAvailableAgents();
        
        console.log(chalk.green('\nAgentes disponíveis:\n'));
        agents.forEach((agent, index) => {
            const inSquad = squads[squadIndex].agents.includes(agent.name) ? '✓' : ' ';
            console.log(chalk.white(`${index + 1}. [${inSquad}] ${agent.name}`));
        });
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const agentChoice = await this.prompt('Escolha o agente: ');
        
        if (agentChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const agentIndex = parseInt(agentChoice) - 1;
        if (agentIndex >= 0 && agentIndex < agents.length) {
            await this.squad.addAgent(squads[squadIndex].name, agents[agentIndex].name);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showSquadMenu();
    }

    async removeAgentFromSquad() {
        console.log(chalk.blue('\n➖ REMOVER AGENTE DO SQUAD\n'));
        
        // Listar squads disponíveis
        const squads = this.getAvailableSquads();
        
        if (squads.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhum squad disponível\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        console.log(chalk.green('Squads disponíveis:\n'));
        squads.forEach((squad, index) => {
            console.log(chalk.white(`${index + 1}. ${squad.name} (${squad.agents.length} agentes)`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const squadChoice = await this.prompt('Escolha o squad: ');
        
        if (squadChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const squadIndex = parseInt(squadChoice) - 1;
        if (squadIndex < 0 || squadIndex >= squads.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        const selectedSquad = squads[squadIndex];
        
        if (selectedSquad.agents.length === 0) {
            console.log(chalk.yellow('\n⚠️ Squad não tem agentes\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        // Listar agentes do squad
        console.log(chalk.green(`\nAgentes no squad ${selectedSquad.name}:\n`));
        selectedSquad.agents.forEach((agentName, index) => {
            console.log(chalk.white(`${index + 1}. ${agentName}`));
        });
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const agentChoice = await this.prompt('Escolha o agente: ');
        
        if (agentChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const agentIndex = parseInt(agentChoice) - 1;
        if (agentIndex >= 0 && agentIndex < selectedSquad.agents.length) {
            await this.squad.removeAgent(selectedSquad.name, selectedSquad.agents[agentIndex]);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showSquadMenu();
    }

    async runSquadTask() {
        console.log(chalk.blue('\n🚀 EXECUTAR TASK COM SQUAD\n'));
        
        // Listar squads disponíveis
        const squads = this.getAvailableSquads();
        
        if (squads.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhum squad disponível\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        console.log(chalk.green('Squads disponíveis:\n'));
        squads.forEach((squad, index) => {
            console.log(chalk.white(`${index + 1}. ${squad.name} (${squad.agents.length} agentes)`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const squadChoice = await this.prompt('Escolha o squad: ');
        
        if (squadChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const squadIndex = parseInt(squadChoice) - 1;
        if (squadIndex < 0 || squadIndex >= squads.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        // Listar tasks disponíveis
        const tasks = this.getAvailableTasks();
        
        if (tasks.length === 0) {
            console.log(chalk.yellow('\n⚠️ Nenhuma task disponível\n'));
            await this.pressEnterToContinue();
            await this.showSquadMenu();
            return;
        }
        
        console.log(chalk.green('\nTasks disponíveis:\n'));
        tasks.forEach((task, index) => {
            const statusIcon = this.getTaskStatusIcon(task.status);
            console.log(chalk.white(`${index + 1}. ${statusIcon} ${task.name} - ${task.status}`));
        });
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const taskChoice = await this.prompt('Escolha a task: ');
        
        if (taskChoice === '0') {
            await this.showSquadMenu();
            return;
        }
        
        const taskIndex = parseInt(taskChoice) - 1;
        if (taskIndex >= 0 && taskIndex < tasks.length) {
            await this.squad.run(squads[squadIndex].name, tasks[taskIndex].name);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showSquadMenu();
    }

    async createTask() {
        console.log(chalk.blue('\n➕ CRIAR NOVA TASK\n'));
        const name = await this.prompt('Nome da task: ');
        const description = await this.prompt('Descrição (opcional): ');
        const priority = await this.prompt('Prioridade (low/medium/high, padrão: medium): ') || 'medium';
        
        await this.task.create(name, {
            description: description || `Task ${name}`,
            priority: priority
        });
        
        await this.pressEnterToContinue();
        await this.showTaskMenu();
    }

    async runTask() {
        console.log(chalk.blue('\n🚀 EXECUTAR TASK\n'));
        
        // Listar tasks disponíveis
        const tasks = this.getAvailableTasks();
        
        if (tasks.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhuma task disponível\n'));
            await this.pressEnterToContinue();
            await this.showTaskMenu();
            return;
        }
        
        console.log(chalk.green('Tasks disponíveis:\n'));
        tasks.forEach((task, index) => {
            const statusIcon = this.getTaskStatusIcon(task.status);
            console.log(chalk.white(`${index + 1}. ${statusIcon} ${task.name} - ${task.status} (${task.priority})`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const choice = await this.prompt('Escolha a task: ');
        
        if (choice === '0') {
            await this.showTaskMenu();
            return;
        }
        
        const taskIndex = parseInt(choice) - 1;
        if (taskIndex >= 0 && taskIndex < tasks.length) {
            await this.task.run(tasks[taskIndex].name);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showTaskMenu();
    }

    async showTaskStatus() {
        console.log(chalk.blue('\n📊 STATUS DE TASK\n'));
        
        // Listar tasks disponíveis
        const tasks = this.getAvailableTasks();
        
        if (tasks.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhuma task disponível\n'));
            await this.pressEnterToContinue();
            await this.showTaskMenu();
            return;
        }
        
        console.log(chalk.green('Tasks disponíveis:\n'));
        tasks.forEach((task, index) => {
            const statusIcon = this.getTaskStatusIcon(task.status);
            console.log(chalk.white(`${index + 1}. ${statusIcon} ${task.name} - ${task.status}`));
        });
        console.log(chalk.white(`${tasks.length + 1}. 📈 Ver status geral de todas\n`));
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const choice = await this.prompt('Escolha a task: ');
        
        if (choice === '0') {
            await this.showTaskMenu();
            return;
        }
        
        if (choice === String(tasks.length + 1)) {
            this.task.status();
        } else {
            const taskIndex = parseInt(choice) - 1;
            if (taskIndex >= 0 && taskIndex < tasks.length) {
                this.task.status(tasks[taskIndex].name);
            } else {
                console.log(chalk.red('\n❌ Opção inválida!\n'));
            }
        }
        
        await this.pressEnterToContinue();
        await this.showTaskMenu();
    }

    async assignTask() {
        console.log(chalk.blue('\n👤 ATRIBUIR TASK A AGENTE\n'));
        
        // Listar tasks disponíveis
        const tasks = this.getAvailableTasks();
        
        if (tasks.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhuma task disponível\n'));
            await this.pressEnterToContinue();
            await this.showTaskMenu();
            return;
        }
        
        console.log(chalk.green('Tasks disponíveis:\n'));
        tasks.forEach((task, index) => {
            const assigned = task.assigned_to ? `→ ${task.assigned_to}` : '(não atribuída)';
            console.log(chalk.white(`${index + 1}. ${task.name} ${chalk.gray(assigned)}`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const taskChoice = await this.prompt('Escolha a task: ');
        
        if (taskChoice === '0') {
            await this.showTaskMenu();
            return;
        }
        
        const taskIndex = parseInt(taskChoice) - 1;
        if (taskIndex < 0 || taskIndex >= tasks.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.showTaskMenu();
            return;
        }
        
        // Listar agentes disponíveis
        const agents = this.getAvailableAgents();
        
        console.log(chalk.green('\nAgentes disponíveis:\n'));
        agents.forEach((agent, index) => {
            console.log(chalk.white(`${index + 1}. ${agent.name} - ${agent.model || 'padrão'}`));
        });
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const agentChoice = await this.prompt('Escolha o agente: ');
        
        if (agentChoice === '0') {
            await this.showTaskMenu();
            return;
        }
        
        const agentIndex = parseInt(agentChoice) - 1;
        if (agentIndex >= 0 && agentIndex < agents.length) {
            await this.task.assign(tasks[taskIndex].name, agents[agentIndex].name);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showTaskMenu();
    }

    async runWorkflow() {
        console.log(chalk.blue('\n🚀 EXECUTAR WORKFLOW\n'));
        
        // Listar workflows disponíveis
        const workflows = this.getAvailableWorkflows();
        
        if (workflows.length === 0) {
            console.log(chalk.yellow('⚠️ Nenhum workflow disponível\n'));
            await this.pressEnterToContinue();
            await this.showWorkflowMenu();
            return;
        }
        
        console.log(chalk.green('Workflows disponíveis:\n'));
        workflows.forEach((workflow, index) => {
            console.log(chalk.white(`${index + 1}. ${workflow.name}`));
            console.log(chalk.gray(`   ${workflow.description}\n`));
        });
        console.log(chalk.white('0. ⬅️  Voltar\n'));
        
        const choice = await this.prompt('Escolha o workflow: ');
        
        if (choice === '0') {
            await this.showWorkflowMenu();
            return;
        }
        
        const workflowIndex = parseInt(choice) - 1;
        if (workflowIndex >= 0 && workflowIndex < workflows.length) {
            await this.workflow.run(workflows[workflowIndex].file);
        } else {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
        }
        
        await this.pressEnterToContinue();
        await this.showWorkflowMenu();
    }

    async selectLLMModel() {
        console.log(chalk.blue('\n🤖 SELECIONAR MODELO LLM\n'));
        
        const models = [
            // MODELOS PRIORITÁRIOS (3) - Solicitados pelo usuário
            {
                name: 'Arcee AI: Trinity Large Preview (127B)',
                id: 'arcee-ai/trinity-large-preview:free',
                description: 'Modelo de 127B parâmetros - Alta capacidade',
                cost: 'FREE',
                price: '$0',
                category: 'priority'
            },
            {
                name: 'DeepSeek R1T2 Chimera',
                id: 'tngtech/deepseek-r1t2-chimera:free',
                description: 'Segunda geração Chimera - Roleplay e raciocínio',
                cost: 'FREE',
                price: '$0',
                category: 'priority'
            },
            {
                name: 'Qwen3 Coder',
                id: 'qwen/qwen3-coder:free',
                description: 'Especializado em código',
                cost: 'FREE',
                price: '$0',
                category: 'priority'
            },
            // Modelos FREE adicionais (3)
            {
                name: 'DeepSeek R1',
                id: 'deepseek/deepseek-r1-0528:free',
                description: 'Raciocínio avançado - Excelente qualidade',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            {
                name: 'Qwen3 Next 80B',
                id: 'qwen/qwen3-next-80b-a3b-instruct:free',
                description: 'Modelo avançado Qwen3 - 80B parâmetros',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            {
                name: 'Qwen3 4B',
                id: 'qwen/qwen3-4b:free',
                description: 'Modelo compacto e rápido - 4B parâmetros',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            {
                name: 'Llama 3.3 70B',
                id: 'meta-llama/llama-3.3-70b-instruct:free',
                description: 'Meta - 70B parâmetros',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            {
                name: 'Qwen 2.5 Coder 32B',
                id: 'qwen/qwen-2.5-coder-32b-instruct:free',
                description: 'Especializado em código - 32B',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            {
                name: 'Mistral Nemo',
                id: 'mistralai/mistral-nemo:free',
                description: 'Mistral AI - Balanceado',
                cost: 'FREE',
                price: '$0',
                category: 'free'
            },
            // Modelos PAGOS (7)
            {
                name: 'Claude 3.5 Sonnet',
                id: 'anthropic/claude-3.5-sonnet',
                description: 'Anthropic - Melhor qualidade',
                cost: 'PAGO',
                price: '$0.003',
                category: 'paid'
            },
            {
                name: 'Claude 3 Opus',
                id: 'anthropic/claude-3-opus',
                description: 'Anthropic - Máxima capacidade',
                cost: 'PAGO',
                price: '$0.015',
                category: 'paid'
            },
            {
                name: 'GPT-4 Turbo',
                id: 'openai/gpt-4-turbo',
                description: 'OpenAI - Rápido e poderoso',
                cost: 'PAGO',
                price: '$0.01',
                category: 'paid'
            },
            {
                name: 'GPT-4o',
                id: 'openai/gpt-4o',
                description: 'OpenAI - Otimizado',
                cost: 'PAGO',
                price: '$0.005',
                category: 'paid'
            },
            {
                name: 'OpenAI o1',
                id: 'openai/o1',
                description: 'OpenAI - Raciocínio avançado',
                cost: 'PAGO',
                price: '$0.015',
                category: 'paid'
            },
            {
                name: 'Gemini Pro 1.5',
                id: 'google/gemini-pro-1.5',
                description: 'Google - Profissional',
                cost: 'PAGO',
                price: '$0.00125',
                category: 'paid'
            },
            {
                name: 'Qwen 2.5 Coder 72B',
                id: 'qwen/qwen-2.5-coder-72b-instruct',
                description: 'Especializado em código - 72B',
                cost: 'PAGO',
                price: '$0.0009',
                category: 'paid'
            }
        ];
        
        console.log(chalk.green('Modelos LLM disponíveis:\n'));
        
        let displayNumber = 1;
        
        // Mostrar modelos PRIORITÁRIOS (1, 2, 3)
        const priorityModels = models.filter(m => m.category === 'priority');
        priorityModels.forEach((model) => {
            console.log(chalk.cyan(`${displayNumber}. ${model.name}`));
            console.log(chalk.gray(`   ${model.description}`));
            console.log(chalk.green(`   💰 ${model.cost} (${model.price})`));
            console.log('');
            displayNumber++;
        });
        
        // Separar modelos FREE e PAGOS (restantes)
        const freeModels = models.filter(m => m.category === 'free');
        const paidModels = models.filter(m => m.category === 'paid');
        
        // Mostrar modelos FREE restantes
        freeModels.forEach((model) => {
            console.log(chalk.white(`${displayNumber}. ${model.name}`));
            console.log(chalk.gray(`   ${model.description}`));
            console.log(chalk.green(`   💰 ${model.cost} (${model.price})`));
            console.log('');
            displayNumber++;
        });
        
        // Mostrar modelos PAGOS
        paidModels.forEach((model) => {
            console.log(chalk.white(`${displayNumber}. ${model.name}`));
            console.log(chalk.gray(`   ${model.description}`));
            console.log(chalk.yellow(`   💰 ${model.cost} (${model.price}/1K tokens)`));
            console.log('');
            displayNumber++;
        });
        
        // Opção de manter atual
        const keepCurrentNumber = models.length + 1;
        const currentDefaultModel = this.getDefaultModel();
        console.log(chalk.cyan(`${keepCurrentNumber}. ⏭️  Manter modelo atual (${currentDefaultModel})`));
        console.log(chalk.white('0. ⬅️  Cancelar\n'));
        
        const choice = await this.prompt('Escolha o modelo: ');
        
        if (choice === '0') {
            await this.showConfigMenu();
            return;
        }
        
        // Opção de manter atual
        if (choice === String(keepCurrentNumber)) {
            console.log(chalk.cyan('\n✅ Mantendo modelo atual\n'));
            await this.pressEnterToContinue();
            await this.showConfigMenu();
            return;
        }
        
        const modelIndex = parseInt(choice) - 1;
        if (modelIndex < 0 || modelIndex >= models.length) {
            console.log(chalk.red('\n❌ Opção inválida!\n'));
            await this.pressEnterToContinue();
            await this.selectLLMModel();
            return;
        }
        
        const selectedModel = models[modelIndex];
        
        // Confirmar seleção
        console.log(chalk.blue(`\n✅ Modelo selecionado: ${selectedModel.name}\n`));
        console.log(chalk.white('Este modelo será configurado como:'));
        console.log(chalk.white('1. Modelo principal no Aider (.aider.conf.yml)'));
        console.log(chalk.white('2. Modelo padrão no AIOS-Core (agent-executor.js)\n'));
        
        if (selectedModel.category === 'free') {
            console.log(chalk.green('💰 Custo: $0/mês (100% FREE)\n'));
        } else {
            console.log(chalk.yellow(`💰 Custo: ${selectedModel.price}/1K tokens (modelo pago)\n`));
            console.log(chalk.gray('   Consulte OpenRouter para estimativa de custo mensal\n'));
        }
        
        const confirm = await this.prompt('Confirmar? (s/n): ');
        
        if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'sim') {
            console.log(chalk.yellow('\n❌ Operação cancelada\n'));
            await this.pressEnterToContinue();
            await this.selectLLMModel();
            return;
        }
        
        // Atualizar configurações
        await this.updateModelConfiguration(selectedModel);
        
        console.log(chalk.green(`\n✅ Modelo ${selectedModel.name} configurado com sucesso!\n`));
        console.log(chalk.white('Arquivos atualizados:'));
        console.log(chalk.gray('  - .aider.conf.yml'));
        console.log(chalk.gray('  - .aios-core/cli/commands/agent-executor.js\n'));
        
        await this.pressEnterToContinue();
        await this.showConfigMenu();
    }

    async updateModelConfiguration(model) {
        const fs = require('fs-extra');
        const path = require('path');
        
        // Salvar como modelo padrão global
        this.setDefaultModel(model.id, model.name);
        console.log(chalk.gray('  ✓ Modelo padrão global atualizado'));
        
        // Atualizar .aider.conf.yml
        const aiderConfigPath = path.join(process.cwd(), '.aider.conf.yml');
        if (fs.existsSync(aiderConfigPath)) {
            let config = fs.readFileSync(aiderConfigPath, 'utf8');
            
            // Atualizar modelo principal
            config = config.replace(
                /model:\s+[^\s]+/,
                `model: ${model.id}`
            );
            
            // Adicionar comentário sobre a mudança
            const timestamp = new Date().toISOString();
            config = `# Última atualização: ${timestamp}\n# Modelo selecionado: ${model.name}\n\n` + config;
            
            fs.writeFileSync(aiderConfigPath, config, 'utf8');
            console.log(chalk.gray('  ✓ .aider.conf.yml atualizado'));
        }
        
        // Atualizar agent-executor.js (modelo padrão do AIOS-Core)
        const executorPath = path.join(process.cwd(), '.aios-core', 'cli', 'commands', 'agent-executor.js');
        if (fs.existsSync(executorPath)) {
            let executor = fs.readFileSync(executorPath, 'utf8');
            
            // Atualizar modelo padrão
            executor = executor.replace(
                /const\s+DEFAULT_MODEL\s*=\s*['"][^'"]+['"]/,
                `const DEFAULT_MODEL = '${model.id}'`
            );
            
            fs.writeFileSync(executorPath, executor, 'utf8');
            console.log(chalk.gray('  ✓ agent-executor.js atualizado'));
        }
        
        // Criar arquivo de log da mudança
        const logPath = path.join(process.cwd(), '.aios-core', 'data', 'model-changes.log');
        const logEntry = `${new Date().toISOString()} - Modelo alterado para: ${model.name} (${model.id})\n`;
        fs.ensureDirSync(path.dirname(logPath));
        fs.appendFileSync(logPath, logEntry, 'utf8');
        console.log(chalk.gray('  ✓ Log de mudanças atualizado'));
    }

    // Métodos auxiliares para listar recursos
    getAvailableModels() {
        return [
            // MODELOS PRIORITÁRIOS (3) - Solicitados pelo usuário
            { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee AI: Trinity Large Preview (127B)', free: true, cost: 0, category: 'priority' },
            { id: 'tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera', free: true, cost: 0, category: 'priority' },
            { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder', free: true, cost: 0, category: 'priority' },
            
            // Modelos FREE adicionais
            { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1', free: true, cost: 0, category: 'reasoning' },
            { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen3 Next 80B', free: true, cost: 0, category: 'fast' },
            { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', free: true, cost: 0, category: 'reasoning' },
            { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', free: true, cost: 0, category: 'general' },
            { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen 2.5 Coder 32B', free: true, cost: 0, category: 'coding' },
            { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo', free: true, cost: 0, category: 'general' },
            
            // Modelos PAGOS (alta performance)
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false, cost: 0.003, category: 'premium' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', free: false, cost: 0.015, category: 'premium' },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', free: false, cost: 0.01, category: 'premium' },
            { id: 'openai/gpt-4o', name: 'GPT-4o', free: false, cost: 0.005, category: 'premium' },
            { id: 'openai/o1', name: 'OpenAI o1', free: false, cost: 0.015, category: 'reasoning' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', free: false, cost: 0.00125, category: 'premium' },
            { id: 'qwen/qwen-2.5-coder-72b-instruct', name: 'Qwen 2.5 Coder 72B', free: false, cost: 0.0009, category: 'coding' }
        ];
    }

    getAvailableTasks() {
        const fs = require('fs-extra');
        const path = require('path');
        const tasksDir = path.join(process.cwd(), '.aios-core', 'tasks');
        
        if (!fs.existsSync(tasksDir)) {
            return [];
        }
        
        const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.json'));
        return files.map(file => {
            try {
                return fs.readJsonSync(path.join(tasksDir, file));
            } catch (error) {
                return null;
            }
        }).filter(Boolean);
    }

    getAvailableAgents() {
        const fs = require('fs-extra');
        const path = require('path');
        
        // Ler modelo padrão global
        const defaultModel = this.getDefaultModel();
        
        // Diretório de agentes
        const agentsDir = path.join(process.cwd(), '.aios-core', 'cli', 'agents');
        
        // Verificar se existem arquivos JSON para agentes padrão
        const defaultAgentNames = ['dev', 'architect', 'qa'];
        const defaultAgents = defaultAgentNames.map(name => {
            const agentFile = path.join(agentsDir, `${name}.json`);
            
            if (fs.existsSync(agentFile)) {
                // Ler configuração do arquivo
                try {
                    const config = fs.readJsonSync(agentFile);
                    return {
                        name: config.name,
                        model: config.model,
                        description: config.description,
                        temperature: config.temperature,
                        useDefault: false
                    };
                } catch (error) {
                    // Se erro ao ler, usar padrão
                    return { name, model: defaultModel, description: name, useDefault: true };
                }
            } else {
                // Usar modelo padrão global
                return { name, model: defaultModel, description: name, useDefault: true };
            }
        });
        
        const customAgents = this.getCustomAgents();
        
        return [...defaultAgents, ...customAgents];
    }

    getDefaultModel() {
        const fs = require('fs-extra');
        const path = require('path');
        const configFile = path.join(process.cwd(), '.aios-core', 'data', 'default-model.json');
        
        // Se não existe, criar com Claude 3.5 Sonnet como padrão
        if (!fs.existsSync(configFile)) {
            const defaultConfig = {
                model: 'anthropic/claude-3.5-sonnet',
                modelName: 'Claude 3.5 Sonnet',
                updatedAt: new Date().toISOString()
            };
            fs.ensureDirSync(path.dirname(configFile));
            fs.writeJsonSync(configFile, defaultConfig, { spaces: 2 });
            return defaultConfig.modelName;
        }
        
        try {
            const config = fs.readJsonSync(configFile);
            return config.modelName || 'Claude 3.5 Sonnet';
        } catch (error) {
            return 'Claude 3.5 Sonnet';
        }
    }

    setDefaultModel(modelId, modelName) {
        const fs = require('fs-extra');
        const path = require('path');
        const configFile = path.join(process.cwd(), '.aios-core', 'data', 'default-model.json');
        
        const config = {
            model: modelId,
            modelName: modelName,
            updatedAt: new Date().toISOString()
        };
        
        fs.ensureDirSync(path.dirname(configFile));
        fs.writeJsonSync(configFile, config, { spaces: 2 });
    }

    getCustomAgents() {
        const fs = require('fs-extra');
        const path = require('path');
        
        // Buscar em DOIS diretórios (estrutura original AIOS + CLI)
        const agentsDirs = [
            path.join(process.cwd(), '.aios-core', 'development', 'agents'),  // Estrutura original AIOS
            path.join(process.cwd(), '.aios-core', 'cli', 'agents')           // Estrutura CLI
        ];
        
        // Nomes dos agentes padrão que não devem ser incluídos aqui
        const defaultAgentNames = ['dev.json', 'architect.json', 'qa.json', 'dev.md', 'architect.md', 'qa.md'];
        
        const agents = [];
        const seenAgents = new Set(); // Evitar duplicatas
        
        agentsDirs.forEach(agentsDir => {
            if (!fs.existsSync(agentsDir)) {
                return;
            }
            
            // Buscar arquivos .json (agentes customizados criados pelo menu)
            const jsonFiles = fs.readdirSync(agentsDir)
                .filter(f => f.endsWith('.json') && f !== 'agent-executor.js')
                .filter(f => !defaultAgentNames.includes(f));
            
            jsonFiles.forEach(file => {
                const agentName = file.replace('.json', '');
                if (seenAgents.has(agentName)) return; // Evitar duplicatas
                
                try {
                    const agent = fs.readJsonSync(path.join(agentsDir, file));
                    agents.push(agent);
                    seenAgents.add(agentName);
                } catch (error) {
                    // Ignorar arquivos com erro
                }
            });
            
            // Buscar arquivos .md (agentes importados dos repositórios)
            const mdFiles = fs.readdirSync(agentsDir)
                .filter(f => f.endsWith('.md') && !f.startsWith('._')) // Ignorar arquivos temporários
                .filter(f => !defaultAgentNames.includes(f));
            
            mdFiles.forEach(file => {
                const agentName = file.replace('.md', '');
                if (seenAgents.has(agentName)) return; // Evitar duplicatas
                
                agents.push({
                    name: agentName,
                    model: this.getDefaultModel(),
                    description: `Agente importado: ${agentName}`,
                    temperature: 0.7,
                    isImported: true,
                    source: agentsDir.includes('development') ? 'development' : 'cli'
                });
                seenAgents.add(agentName);
            });
        });
        
        return agents;
    }

    getAvailableSquads() {
        const fs = require('fs-extra');
        const path = require('path');
        const squadsDir = path.join(process.cwd(), '.aios-core', 'squads');
        
        if (!fs.existsSync(squadsDir)) {
            return [];
        }
        
        const files = fs.readdirSync(squadsDir).filter(f => f.endsWith('.json'));
        return files.map(file => {
            try {
                return fs.readJsonSync(path.join(squadsDir, file));
            } catch (error) {
                return null;
            }
        }).filter(Boolean);
    }

    getAvailableWorkflows() {
        const fs = require('fs-extra');
        const path = require('path');
        const yaml = require('js-yaml');
        
        // Buscar em dois diretórios
        const workflowDirs = [
            path.join(process.cwd(), '.aios-core', 'workflow-intelligence'),
            path.join(process.cwd(), '.aios-core', 'workflows')
        ];
        
        const workflows = [];
        
        workflowDirs.forEach(workflowDir => {
            if (!fs.existsSync(workflowDir)) {
                return;
            }
            
            // Buscar arquivos .yaml, .yml e .md
            const files = fs.readdirSync(workflowDir)
                .filter(f => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.md'));
            
            files.forEach(file => {
                try {
                    const filePath = path.join(workflowDir, file);
                    const fileName = file.replace(/\.(yaml|yml|md)$/, '');
                    
                    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                        // Tentar ler como YAML
                        const workflow = yaml.load(fs.readFileSync(filePath, 'utf8'));
                        workflows.push({
                            file: fileName,
                            name: workflow.name || fileName,
                            description: workflow.description || `Workflow: ${fileName}`,
                            type: 'yaml'
                        });
                    } else if (file.endsWith('.md')) {
                        // Workflow em markdown (importado)
                        workflows.push({
                            file: fileName,
                            name: fileName,
                            description: `Workflow importado: ${fileName}`,
                            type: 'markdown'
                        });
                    }
                } catch (error) {
                    // Ignorar arquivos com erro
                }
            });
        });
        
        return workflows;
    }

    getTaskStatusIcon(status) {
        const icons = {
            pending: '⏳',
            running: '🔄',
            completed: '✅',
            failed: '❌'
        };
        return icons[status] || '❓';
    }

    // Utilitários
    prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan(question), (answer) => {
                resolve(answer.trim());
            });
        });
    }

    async pressEnterToContinue() {
        await this.prompt('\nPressione Enter para continuar...');
        console.clear();
        this.showBanner();
    }
}

// Iniciar menu interativo
const menu = new AIOSInteractive();
menu.start().catch(error => {
    console.error(chalk.red(`\n❌ Erro: ${error.message}\n`));
    process.exit(1);
});
