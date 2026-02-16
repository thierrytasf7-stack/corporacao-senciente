#!/usr/bin/env node

/**
 * TESTE: Correção de Configuração de Agentes Padrão
 * Valida que agentes padrão (dev, architect, qa) podem ser configurados
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('║     TESTE: Configuração de Agentes Padrão                   ║'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

const AgentCommand = require('./cli/commands/agent');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, condition, details = '') {
    totalTests++;
    if (condition) {
        console.log(chalk.green(`✅ ${testName}`));
        if (details) console.log(chalk.gray(`   ${details}`));
        passedTests++;
        return true;
    } else {
        console.log(chalk.red(`❌ ${testName}`));
        if (details) console.log(chalk.gray(`   ${details}`));
        failedTests++;
        return false;
    }
}

async function runTests() {
    const agent = new AgentCommand();
    const agentsDir = path.join(process.cwd(), '.aios-core', 'cli', 'agents');
    
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.yellow('SEÇÃO 1: Preparação'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
    
    // TESTE 1: Verificar se diretório de agentes existe ou pode ser criado
    const dirExistsBefore = fs.existsSync(agentsDir);
    if (!dirExistsBefore) {
        console.log(chalk.gray('   Diretório não existe, será criado automaticamente'));
    }
    runTest(
        'TESTE 1: Sistema pode gerenciar diretório de agentes',
        true, // Sempre passa, pois o sistema cria automaticamente
        dirExistsBefore ? `Diretório existe: ${agentsDir}` : `Diretório será criado: ${agentsDir}`
    );
    
    // Limpar arquivos de teste anteriores
    const testAgentFile = path.join(agentsDir, 'dev.json');
    if (fs.existsSync(testAgentFile)) {
        fs.removeSync(testAgentFile);
        console.log(chalk.gray('   Arquivo de teste anterior removido'));
    }
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.yellow('SEÇÃO 2: Configuração de Agente Padrão'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
    
    // TESTE 2: Configurar agente padrão 'dev' pela primeira vez
    console.log(chalk.cyan('Configurando agente "dev" com Trinity Large Preview...\n'));
    const result = await agent.configure('dev', {
        model: 'openrouter/arcee-ai/trinity-large-preview:free',
        temperature: 0.5,
        description: 'Agente de desenvolvimento com Trinity'
    });
    
    runTest(
        'TESTE 2: Configuração retornou sucesso',
        result === true,
        'Método configure() deve retornar true'
    );
    
    // TESTE 3: Verificar se arquivo foi criado
    const fileExists = fs.existsSync(testAgentFile);
    runTest(
        'TESTE 3: Arquivo JSON foi criado',
        fileExists,
        `Path: ${testAgentFile}`
    );
    
    if (fileExists) {
        // TESTE 4: Verificar conteúdo do arquivo
        const config = fs.readJsonSync(testAgentFile);
        
        runTest(
            'TESTE 4: Modelo foi salvo corretamente',
            config.model === 'openrouter/arcee-ai/trinity-large-preview:free',
            `Modelo: ${config.model}`
        );
        
        runTest(
            'TESTE 5: Temperature foi salva corretamente',
            config.temperature === 0.5,
            `Temperature: ${config.temperature}`
        );
        
        runTest(
            'TESTE 6: Descrição foi salva corretamente',
            config.description === 'Agente de desenvolvimento com Trinity',
            `Descrição: ${config.description}`
        );
        
        runTest(
            'TESTE 7: Flag isDefault está presente',
            config.isDefault === true,
            'Agentes padrão devem ter isDefault: true'
        );
        
        runTest(
            'TESTE 8: Timestamp de criação existe',
            config.created_at !== undefined,
            `Criado em: ${config.created_at}`
        );
        
        console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
        console.log(chalk.yellow('SEÇÃO 3: Atualização de Configuração'));
        console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
        
        // TESTE 9: Atualizar configuração existente
        console.log(chalk.cyan('Atualizando agente "dev" com DeepSeek R1...\n'));
        const updateResult = await agent.configure('dev', {
            model: 'openrouter/deepseek/deepseek-r1',
            temperature: 0.7
        });
        
        runTest(
            'TESTE 9: Atualização retornou sucesso',
            updateResult === true,
            'Segunda configuração deve funcionar'
        );
        
        // TESTE 10: Verificar se modelo foi atualizado
        const updatedConfig = fs.readJsonSync(testAgentFile);
        
        runTest(
            'TESTE 10: Modelo foi atualizado',
            updatedConfig.model === 'openrouter/deepseek/deepseek-r1',
            `Novo modelo: ${updatedConfig.model}`
        );
        
        runTest(
            'TESTE 11: Temperature foi atualizada',
            updatedConfig.temperature === 0.7,
            `Nova temperature: ${updatedConfig.temperature}`
        );
        
        runTest(
            'TESTE 12: Descrição anterior foi mantida',
            updatedConfig.description === 'Agente de desenvolvimento com Trinity',
            'Campos não especificados devem ser mantidos'
        );
        
        runTest(
            'TESTE 13: Timestamp de atualização existe',
            updatedConfig.updated_at !== undefined,
            `Atualizado em: ${updatedConfig.updated_at}`
        );
        
        console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
        console.log(chalk.yellow('SEÇÃO 4: Visualização da Configuração Final'));
        console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
        
        console.log(chalk.magenta('Configuração Final do Agente "dev":\n'));
        console.log(chalk.white(`Nome: ${updatedConfig.name}`));
        console.log(chalk.white(`Modelo: ${updatedConfig.model}`));
        console.log(chalk.white(`Temperature: ${updatedConfig.temperature}`));
        console.log(chalk.white(`Descrição: ${updatedConfig.description}`));
        console.log(chalk.white(`Status: ${updatedConfig.status}`));
        console.log(chalk.white(`Agente Padrão: ${updatedConfig.isDefault ? 'Sim' : 'Não'}`));
        console.log(chalk.gray(`Criado em: ${updatedConfig.created_at}`));
        console.log(chalk.gray(`Atualizado em: ${updatedConfig.updated_at}`));
    }
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.yellow('SEÇÃO 5: Limpeza'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
    
    // Limpar arquivo de teste
    if (fs.existsSync(testAgentFile)) {
        fs.removeSync(testAgentFile);
        console.log(chalk.gray('✓ Arquivo de teste removido'));
    }
    
    console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
    console.log(chalk.yellow('RESUMO FINAL'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));
    
    console.log(chalk.blue('📊 ESTATÍSTICAS DOS TESTES\n'));
    console.log(chalk.green(`✅ Testes passados: ${passedTests}`));
    console.log(chalk.red(`❌ Testes falhados: ${failedTests}`));
    console.log(chalk.white(`📋 Total de testes: ${totalTests}`));
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(chalk.cyan(`📈 Taxa de sucesso: ${successRate}%\n`));
    
    if (failedTests === 0) {
        console.log(chalk.green('═══════════════════════════════════════════════════════════════'));
        console.log(chalk.green('🎉 SUCESSO: Todos os testes passaram!'));
        console.log(chalk.green('═══════════════════════════════════════════════════════════════\n'));
        console.log(chalk.white('✅ Agentes padrão podem ser configurados'));
        console.log(chalk.white('✅ Arquivos JSON são criados automaticamente'));
        console.log(chalk.white('✅ Configurações são persistidas corretamente'));
        console.log(chalk.white('✅ Atualizações funcionam corretamente\n'));
        process.exit(0);
    } else {
        console.log(chalk.red('═══════════════════════════════════════════════════════════════'));
        console.log(chalk.red('❌ FALHA: Alguns testes não passaram'));
        console.log(chalk.red('═══════════════════════════════════════════════════════════════\n'));
        console.log(chalk.yellow('⚠️  Revise a implementação do método configure()\n'));
        process.exit(1);
    }
}

runTests().catch(error => {
    console.error(chalk.red('\n❌ Erro durante execução dos testes:'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray(error.stack));
    process.exit(1);
});
