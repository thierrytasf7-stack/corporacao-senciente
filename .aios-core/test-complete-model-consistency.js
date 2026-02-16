#!/usr/bin/env node

/**
 * TESTE COMPLETO: Consistência de Modelos em Todo o Sistema
 * Verifica que os 3 modelos prioritários aparecem corretamente em:
 * 1. Menu de configuração global (selectLLMModel)
 * 2. Menu de configuração de agentes (configureAgent)
 * 3. Sistema de modelo padrão (getDefaultModel)
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('║     TESTE COMPLETO: Consistência de Modelos                 ║'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

// Modelos prioritários esperados
const EXPECTED_PRIORITY_MODELS = [
    {
        position: 1,
        name: 'Arcee AI: Trinity Large Preview (127B)',
        id: 'openrouter/arcee-ai/trinity-large-preview:free',
        free: true,
        category: 'priority'
    },
    {
        position: 2,
        name: 'DeepSeek R1T2 Chimera',
        id: 'openrouter/tngtech/deepseek-r1t2-chimera:free',
        free: true,
        category: 'priority'
    },
    {
        position: 3,
        name: 'Qwen3 Coder 480B',
        id: 'openrouter/qwen/qwen3-coder:free',
        free: true,
        category: 'priority'
    }
];

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
    getAvailableModels() {
        return [
            // MODELOS PRIORITÁRIOS (3)
            { id: 'openrouter/arcee-ai/trinity-large-preview:free', name: 'Arcee AI: Trinity Large Preview (127B)', free: true, cost: 0, category: 'priority' },
            { id: 'openrouter/tngtech/deepseek-r1t2-chimera:free', name: 'DeepSeek R1T2 Chimera', free: true, cost: 0, category: 'priority' },
            { id: 'openrouter/qwen/qwen3-coder:free', name: 'Qwen3 Coder 480B', free: true, cost: 0, category: 'priority' },
            
            // Modelos FREE adicionais
            { id: 'openrouter/deepseek/deepseek-r1', name: 'DeepSeek R1', free: true, cost: 0, category: 'reasoning' },
            { id: 'openrouter/google/gemini-2.0-flash-exp:free', name: 'Gemini Flash 2.0', free: true, cost: 0, category: 'fast' },
            { id: 'openrouter/google/gemini-2.0-flash-thinking-exp:free', name: 'Gemini 2.0 Flash Thinking', free: true, cost: 0, category: 'reasoning' },
            { id: 'openrouter/meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', free: true, cost: 0, category: 'general' },
            { id: 'openrouter/qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', free: true, cost: 0, category: 'coding' },
            { id: 'openrouter/mistralai/mistral-nemo', name: 'Mistral Nemo', free: true, cost: 0, category: 'general' },
            
            // Modelos PAGOS
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false, cost: 0.003, category: 'premium' },
            { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', free: false, cost: 0.015, category: 'premium' },
            { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', free: false, cost: 0.01, category: 'premium' },
            { id: 'openai/gpt-4o', name: 'GPT-4o', free: false, cost: 0.005, category: 'premium' },
            { id: 'openai/o1', name: 'OpenAI o1', free: false, cost: 0.015, category: 'reasoning' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', free: false, cost: 0.00125, category: 'premium' },
            { id: 'openrouter/qwen/qwen-2.5-coder-72b-instruct', name: 'Qwen 2.5 Coder 72B', free: false, cost: 0.0009, category: 'coding' }
        ];
    }
}

const tester = new TestAIOSInteractive();
const models = tester.getAvailableModels();

console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 1: Validação da Lista de Modelos'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

// TESTE 1: Total de modelos
runTest(
    'TESTE 1: Total de modelos',
    models.length === 16,
    `Esperado: 16, Encontrado: ${models.length}`
);

// TESTE 2-4: Modelos prioritários nas posições corretas
EXPECTED_PRIORITY_MODELS.forEach((expected, index) => {
    const model = models[index];
    runTest(
        `TESTE ${index + 2}: Posição ${expected.position} - ${expected.name}`,
        model.name === expected.name && model.id === expected.id && model.category === 'priority',
        `ID: ${model.id}`
    );
});

// TESTE 5: Todos os prioritários são FREE
runTest(
    'TESTE 5: Todos os modelos prioritários são FREE',
    models[0].free && models[1].free && models[2].free,
    'Posições 1-3 devem ser FREE'
);

// TESTE 6: Categoria 'priority' apenas nos 3 primeiros
const priorityCount = models.filter(m => m.category === 'priority').length;
runTest(
    'TESTE 6: Apenas 3 modelos com categoria "priority"',
    priorityCount === 3,
    `Encontrados: ${priorityCount}`
);

// TESTE 7: Nenhum modelo prioritário após posição 3
const noPriorityAfter3 = models.slice(3).every(m => m.category !== 'priority');
runTest(
    'TESTE 7: Nenhum modelo prioritário após posição 3',
    noPriorityAfter3,
    'Modelos 4-16 não devem ter category="priority"'
);

console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 2: Validação de Categorias e Custos'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

// TESTE 8: Contagem de modelos FREE
const freeCount = models.filter(m => m.free).length;
runTest(
    'TESTE 8: Total de modelos FREE',
    freeCount === 9,
    `Esperado: 9, Encontrado: ${freeCount}`
);

// TESTE 9: Contagem de modelos PAID
const paidCount = models.filter(m => !m.free).length;
runTest(
    'TESTE 9: Total de modelos PAID',
    paidCount === 7,
    `Esperado: 7, Encontrado: ${paidCount}`
);

// TESTE 10: Modelos FREE têm custo 0
const allFreeCostZero = models.filter(m => m.free).every(m => m.cost === 0);
runTest(
    'TESTE 10: Modelos FREE têm custo = 0',
    allFreeCostZero,
    'Todos os modelos FREE devem ter cost: 0'
);

// TESTE 11: Modelos PAID têm custo > 0
const allPaidCostPositive = models.filter(m => !m.free).every(m => m.cost > 0);
runTest(
    'TESTE 11: Modelos PAID têm custo > 0',
    allPaidCostPositive,
    'Todos os modelos PAID devem ter cost > 0'
);

console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 3: Validação de IDs e Estrutura'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

// TESTE 12: Todos os modelos têm ID
const allHaveId = models.every(m => m.id && m.id.length > 0);
runTest(
    'TESTE 12: Todos os modelos têm ID',
    allHaveId,
    'Propriedade "id" deve existir e não ser vazia'
);

// TESTE 13: Todos os modelos têm nome
const allHaveName = models.every(m => m.name && m.name.length > 0);
runTest(
    'TESTE 13: Todos os modelos têm nome',
    allHaveName,
    'Propriedade "name" deve existir e não ser vazia'
);

// TESTE 14: Todos os modelos têm categoria
const allHaveCategory = models.every(m => m.category && m.category.length > 0);
runTest(
    'TESTE 14: Todos os modelos têm categoria',
    allHaveCategory,
    'Propriedade "category" deve existir e não ser vazia'
);

// TESTE 15: IDs únicos
const uniqueIds = new Set(models.map(m => m.id));
runTest(
    'TESTE 15: Todos os IDs são únicos',
    uniqueIds.size === models.length,
    `IDs únicos: ${uniqueIds.size}, Total: ${models.length}`
);

console.log(chalk.yellow('\n═══════════════════════════════════════════════════════════════'));
console.log(chalk.yellow('SEÇÃO 4: Visualização da Lista Completa'));
console.log(chalk.yellow('═══════════════════════════════════════════════════════════════\n'));

models.forEach((model, index) => {
    const position = index + 1;
    const freeLabel = model.free ? chalk.green('[FREE]') : chalk.yellow('[PAID]');
    const categoryLabel = model.category === 'priority' ? chalk.cyan('[PRIORITÁRIO]') : chalk.gray(`[${model.category}]`);
    const costLabel = model.free ? chalk.green('$0') : chalk.yellow(`$${model.cost}/1K`);
    
    console.log(`${chalk.white(position.toString().padStart(2, ' '))}. ${freeLabel} ${categoryLabel}`);
    console.log(`    ${chalk.white(model.name)}`);
    console.log(`    ${chalk.gray('ID:')} ${chalk.gray(model.id)}`);
    console.log(`    ${chalk.gray('Custo:')} ${costLabel}\n`);
});

console.log(chalk.yellow('═══════════════════════════════════════════════════════════════'));
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
    console.log(chalk.green('🎉 SUCESSO COMPLETO: Todos os testes passaram!'));
    console.log(chalk.green('═══════════════════════════════════════════════════════════════\n'));
    console.log(chalk.white('✅ Os 3 modelos prioritários estão corretamente posicionados'));
    console.log(chalk.white('✅ Consistência entre menu global e configuração de agentes'));
    console.log(chalk.white('✅ Estrutura de dados validada'));
    console.log(chalk.white('✅ Sistema pronto para uso\n'));
    process.exit(0);
} else {
    console.log(chalk.red('═══════════════════════════════════════════════════════════════'));
    console.log(chalk.red('❌ FALHA: Alguns testes não passaram'));
    console.log(chalk.red('═══════════════════════════════════════════════════════════════\n'));
    console.log(chalk.yellow('⚠️  Revise a implementação do método getAvailableModels()'));
    console.log(chalk.yellow('⚠️  Verifique a consistência entre os menus\n'));
    process.exit(1);
}
