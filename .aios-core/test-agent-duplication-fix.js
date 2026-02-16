#!/usr/bin/env node

/**
 * TESTE: Correção de Duplicação de Agentes
 * Valida que agentes padrão não aparecem duplicados na lista
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('║     TESTE: Correção de Duplicação de Agentes                ║'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

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

// Mock da classe para testar
class TestAIOSInteractive {
    getCustomAgents() {
        const fs = require('fs-extra');
        const path = require('path');
        const agentsDir = path.join(process.cwd(), 'Diana-Corporacao-Senciente', '.aios-core', 'cli', 'agents');
        
        if (!fs.existsSync(agentsDir)) {
            return [];
        }
        
        // Nomes dos agentes padrão que não devem ser incluídos
        const defaultAgentNames = ['dev.json', 'architect.json', 'qa.json'];
        
        const files = fs.readdirSync(agentsDir)
            .filter(f => f.endsWith('.json') && f !== 'agent-executor.js')
            .filter(f => !defaultAgentNames.includes(f)); // Filtrar agentes padrão
        
        return files.map(file => {
            try {
                return fs.readJsonSync(path.join(agentsDir, file));
            } catch (error) {
                return null;
            }
        }).filter(Boolean);
    }
    
    getAvailableAgents() {
        const fs = require('fs-extra');
        const path = require('path');
        
        const defaultModel = 'Claude 3.5 Sonnet';
        const agentsDir = path.join(process.cwd(), 'Diana-Corporacao-Senciente', '.aios-core', 'cli', 'agents');
        
        const defaultAgentNames = ['dev', 'architect', 'qa'];
        const defaultAgents = defaultAgentNames.map(name => {
            const agentFile = path.join(agentsDir, `${name}.json`);
            
            if (fs.existsSync(agentFile)) {
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
                    return { name, model: defaultModel, description: name, useDefault: true };
                }
            } else {
                return { name, model: defaultModel, description: name, useDefault: true };
            }
        });
        
        const customAgents = this.getCustomAgents();
        
        return [...defaultAgents, ...customAgents];
    }
}

const tester = new TestAIOSInteractive();

console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 1: Verificação de Agentes Customizados'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

const customAgents = tester.getCustomAgents();

console.log(chalk.cyan(`Total de agentes customizados: ${customAgents.length}\n`));

if (customAgents.length > 0) {
    console.log(chalk.white('Agentes customizados encontrados:'));
    customAgents.forEach((agent, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${agent.name} - ${agent.model}`));
    });
    console.log('');
}

// TESTE 1: Verificar que agentes padrão NÃO estão em customAgents
const hasDefaultAgents = customAgents.some(agent => 
    agent.name === 'dev' || agent.name === 'architect' || agent.name === 'qa'
);

runTest(
    'TESTE 1: Agentes padrão NÃO estão em customAgents',
    !hasDefaultAgents,
    hasDefaultAgents ? 'ERRO: Agentes padrão encontrados em customAgents' : 'Agentes padrão corretamente excluídos'
);

console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 2: Verificação de Lista Completa'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

const allAgents = tester.getAvailableAgents();

console.log(chalk.cyan(`Total de agentes disponíveis: ${allAgents.length}\n`));
console.log(chalk.white('Lista completa de agentes:'));
allAgents.forEach((agent, index) => {
    const type = agent.useDefault === false ? '(configurado)' : '(padrão)';
    console.log(chalk.gray(`  ${index + 1}. ${agent.name} - ${agent.model} ${type}`));
});
console.log('');

// TESTE 2: Verificar que não há duplicatas
const agentNames = allAgents.map(a => a.name);
const uniqueNames = [...new Set(agentNames)];

runTest(
    'TESTE 2: Não há agentes duplicados',
    agentNames.length === uniqueNames.length,
    agentNames.length === uniqueNames.length 
        ? `${uniqueNames.length} agentes únicos` 
        : `ERRO: ${agentNames.length} agentes, mas apenas ${uniqueNames.length} únicos`
);

// TESTE 3: Verificar que os 3 agentes padrão estão presentes
const hasAllDefaults = uniqueNames.includes('dev') && 
                       uniqueNames.includes('architect') && 
                       uniqueNames.includes('qa');

runTest(
    'TESTE 3: Todos os 3 agentes padrão estão presentes',
    hasAllDefaults,
    hasAllDefaults ? 'dev, architect, qa encontrados' : 'ERRO: Algum agente padrão está faltando'
);

// TESTE 4: Verificar que cada agente padrão aparece apenas 1 vez
const devCount = agentNames.filter(n => n === 'dev').length;
const architectCount = agentNames.filter(n => n === 'architect').length;
const qaCount = agentNames.filter(n => n === 'qa').length;

runTest(
    'TESTE 4: Agente "dev" aparece apenas 1 vez',
    devCount === 1,
    `Aparições: ${devCount}`
);

runTest(
    'TESTE 5: Agente "architect" aparece apenas 1 vez',
    architectCount === 1,
    `Aparições: ${architectCount}`
);

runTest(
    'TESTE 6: Agente "qa" aparece apenas 1 vez',
    qaCount === 1,
    `Aparições: ${qaCount}`
);

// TESTE 7: Verificar ordem (padrão primeiro, depois customizados)
const firstThree = allAgents.slice(0, 3).map(a => a.name);
const isCorrectOrder = firstThree.includes('dev') && 
                       firstThree.includes('architect') && 
                       firstThree.includes('qa');

runTest(
    'TESTE 7: Agentes padrão aparecem primeiro na lista',
    isCorrectOrder,
    isCorrectOrder ? 'Ordem correta: padrão → customizados' : 'ERRO: Ordem incorreta'
);

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
    console.log(chalk.white('✅ Agentes padrão não estão duplicados'));
    console.log(chalk.white('✅ Lista de agentes está correta'));
    console.log(chalk.white('✅ Cada agente aparece apenas 1 vez'));
    console.log(chalk.white('✅ Ordem está correta (padrão → customizados)\n'));
    process.exit(0);
} else {
    console.log(chalk.red('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.red('❌ FALHA: Alguns testes não passaram'));
    console.log(chalk.red('═══════════════════════════════════════════════════════════════\n'));
    console.log(chalk.yellow('⚠️  Revise a implementação do método getCustomAgents()\n'));
    process.exit(1);
}
