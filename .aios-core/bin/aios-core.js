#!/usr/bin/env node

/**
 * AIOS-Core CLI Entry Point
 * Ponto de entrada independente para o AIOS-Core
 */

const { Command } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

const program = new Command();

program
    .name('aios-core')
    .description('AIOS-Core CLI - Sistema autônomo de orquestração de agentes')
    .version('4.31.0');

// Comando: workflow
program
    .command('workflow <action> [name]')
    .description('Gerenciar e executar workflows')
    .option('-v, --verbose', 'Modo verbose')
    .action(async (action, name, options) => {
        const WorkflowCommand = require('../cli/commands/workflow');
        const workflow = new WorkflowCommand();
        
        switch (action) {
            case 'list':
                workflow.list();
                break;
            case 'run':
                if (!name) {
                    console.log(chalk.red('❌ Nome do workflow é obrigatório'));
                    process.exit(1);
                }
                const success = await workflow.run(name);
                process.exit(success ? 0 : 1);
                break;
            default:
                console.log(chalk.red(`❌ Ação desconhecida: ${action}`));
                console.log(chalk.gray('Ações disponíveis: list, run'));
                process.exit(1);
        }
    });

// Comando: agent
program
    .command('agent <action>')
    .description('Gerenciar agentes')
    .action((action) => {
        console.log(chalk.blue(`\n🤖 AIOS-Core Agents\n`));
        
        switch (action) {
            case 'list':
                console.log(chalk.green('Agentes disponíveis:'));
                console.log(chalk.gray('  • dev - Desenvolvimento e refatoração'));
                console.log(chalk.gray('  • architect - Validação arquitetural'));
                console.log(chalk.gray('  • qa - Quality assurance'));
                break;
            default:
                console.log(chalk.red(`❌ Ação desconhecida: ${action}`));
        }
    });

// Comando: config
program
    .command('config <action> [key] [value]')
    .description('Gerenciar configuração')
    .action((action, key, value) => {
        const configFile = path.join(process.cwd(), '.aios-core', 'core-config.yaml');
        
        switch (action) {
            case 'show':
                if (fs.existsSync(configFile)) {
                    const config = fs.readFileSync(configFile, 'utf8');
                    console.log(chalk.blue('\n📋 Configuração AIOS-Core:\n'));
                    console.log(config);
                } else {
                    console.log(chalk.yellow('⚠️ Arquivo de configuração não encontrado'));
                }
                break;
            case 'set':
                if (!key || !value) {
                    console.log(chalk.red('❌ Key e value são obrigatórios'));
                    process.exit(1);
                }
                console.log(chalk.green(`✅ ${key} = ${value}`));
                break;
            default:
                console.log(chalk.red(`❌ Ação desconhecida: ${action}`));
        }
    });

// Comando: init
program
    .command('init')
    .description('Inicializar AIOS-Core no projeto')
    .action(() => {
        console.log(chalk.blue('\n🚀 Inicializando AIOS-Core...\n'));
        
        const aiosCoreDir = path.join(process.cwd(), '.aios-core');
        
        if (fs.existsSync(aiosCoreDir)) {
            console.log(chalk.yellow('⚠️ AIOS-Core já inicializado'));
            return;
        }
        
        // Criar estrutura
        fs.mkdirSync(path.join(aiosCoreDir, 'workflow-intelligence'), { recursive: true });
        fs.mkdirSync(path.join(aiosCoreDir, 'cli', 'agents'), { recursive: true });
        fs.mkdirSync(path.join(aiosCoreDir, 'cli', 'commands'), { recursive: true });
        fs.mkdirSync(path.join(aiosCoreDir, 'logs'), { recursive: true });
        
        // Criar config padrão
        const defaultConfig = `# AIOS-Core Configuration
version: 4.31.0
project_name: My Project

agents:
  default_model: claude-3.5-sonnet
  default_temperature: 0.3
  
workflows:
  max_concurrent: 1
  timeout: 600
  
logging:
  level: info
  directory: .aios-core/logs
`;
        
        fs.writeFileSync(
            path.join(aiosCoreDir, 'core-config.yaml'),
            defaultConfig
        );
        
        console.log(chalk.green('✅ AIOS-Core inicializado com sucesso'));
        console.log(chalk.gray(`   Diretório: ${aiosCoreDir}`));
    });

program.parse(process.argv);

// Se nenhum comando foi fornecido, mostrar help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
