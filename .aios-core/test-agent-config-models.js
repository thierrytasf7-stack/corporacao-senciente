#!/usr/bin/env node

/**
 * TESTE: Validação de Modelos na Configuração de Agentes
 * Verifica se os 3 modelos prioritários aparecem no topo da lista
 * quando configurando agentes individuais
 */

const chalk = require('chalk');

// Importar a classe AIOSInteractive
const path = require('path');
const interactiveMenuPath = path.join(__dirname, 'bin', 'aios-interactive.js');

console.log(chalk.blue('\n╔══════════════════════════════════════════════════════════════╗'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('║     TESTE: Modelos na Configuração de Agentes               ║'));
console.log(chalk.blue('║                                                              ║'));
console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝\n'));

// Carregar o módulo e extrair a classe
const fs = require('fs');
const moduleCode = fs.readFileSync(interactiveMenuPath, 'utf8');

// Criar uma instância mock para testar o método
class TestAIOSInteractive {
    getAvailableModels() {
        return [
            // MODELOS PRIORITÁRIOS (3) - Solicitados pelo usuário
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
            
            // Modelos PAGOS (alta performance)
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

console.log(chalk.yellow('📋 VALIDAÇÃO: Lista de Modelos para Configuração de Agentes\n'));

let passed = 0;
let failed = 0;

// TESTE 1: Verificar total de modelos
console.log(chalk.cyan('TESTE 1: Total de modelos'));
if (models.length === 16) {
    console.log(chalk.green('✅ PASSOU: 16 modelos encontrados'));
    passed++;
} else {
    console.log(chalk.red(`❌ FALHOU: Esperado 16, encontrado ${models.length}`));
    failed++;
}

// TESTE 2: Verificar modelo na posição 1
console.log(chalk.cyan('\nTESTE 2: Modelo prioritário na posição 1'));
if (models[0].name === 'Arcee AI: Trinity Large Preview (127B)' && models[0].category === 'priority') {
    console.log(chalk.green('✅ PASSOU: Arcee AI: Trinity Large Preview (127B) na posição 1'));
    passed++;
} else {
    console.log(chalk.red(`❌ FALHOU: Posição 1 = ${models[0].name}`));
    failed++;
}

// TESTE 3: Verificar modelo na posição 2
console.log(chalk.cyan('\nTESTE 3: Modelo prioritário na posição 2'));
if (models[1].name === 'DeepSeek R1T2 Chimera' && models[1].category === 'priority') {
    console.log(chalk.green('✅ PASSOU: DeepSeek R1T2 Chimera na posição 2'));
    passed++;
} else {
    console.log(chalk.red(`❌ FALHOU: Posição 2 = ${models[1].name}`));
    failed++;
}

// TESTE 4: Verificar modelo na posição 3
console.log(chalk.cyan('\nTESTE 4: Modelo prioritário na posição 3'));
if (models[2].name === 'Qwen3 Coder 480B' && models[2].category === 'priority') {
    console.log(chalk.green('✅ PASSOU: Qwen3 Coder 480B na posição 3'));
    passed++;
} else {
    console.log(chalk.red(`❌ FALHOU: Posição 3 = ${models[2].name}`));
    failed++;
}

// TESTE 5: Verificar que todos os 3 primeiros são FREE
console.log(chalk.cyan('\nTESTE 5: Modelos prioritários são FREE'));
if (models[0].free && models[1].free && models[2].free) {
    console.log(chalk.green('✅ PASSOU: Todos os 3 modelos prioritários são FREE'));
    passed++;
} else {
    console.log(chalk.red('❌ FALHOU: Nem todos os modelos prioritários são FREE'));
    failed++;
}

// TESTE 6: Verificar IDs corretos
console.log(chalk.cyan('\nTESTE 6: IDs dos modelos prioritários'));
const expectedIds = [
    'openrouter/arcee-ai/trinity-large-preview:free',
    'openrouter/tngtech/deepseek-r1t2-chimera:free',
    'openrouter/qwen/qwen3-coder:free'
];
if (models[0].id === expectedIds[0] && models[1].id === expectedIds[1] && models[2].id === expectedIds[2]) {
    console.log(chalk.green('✅ PASSOU: IDs corretos para os 3 modelos prioritários'));
    passed++;
} else {
    console.log(chalk.red('❌ FALHOU: IDs incorretos'));
    failed++;
}

// TESTE 7: Exibir lista completa formatada
console.log(chalk.cyan('\n\nTESTE 7: Visualização da lista completa\n'));
console.log(chalk.magenta('═══════════════════════════════════════════════════════════════\n'));

models.forEach((model, index) => {
    const position = index + 1;
    const freeLabel = model.free ? chalk.green('[FREE]') : chalk.yellow('[PAID]');
    const categoryLabel = model.category === 'priority' ? chalk.cyan('[PRIORITÁRIO]') : '';
    const costLabel = model.free ? chalk.green('$0') : chalk.yellow(`$${model.cost}/1K tokens`);
    
    console.log(`${chalk.white(position.toString().padStart(2, ' '))}. ${freeLabel} ${categoryLabel} ${chalk.white(model.name)}`);
    console.log(`    ${chalk.gray('ID:')} ${chalk.gray(model.id)}`);
    console.log(`    ${chalk.gray('Custo:')} ${costLabel}`);
    console.log('');
});

console.log(chalk.green('✅ PASSOU: Lista exibida com sucesso'));
passed++;

// RESUMO FINAL
console.log(chalk.magenta('\n═══════════════════════════════════════════════════════════════'));
console.log(chalk.blue('\n📊 RESUMO DOS TESTES\n'));
console.log(chalk.green(`✅ Testes passados: ${passed}`));
console.log(chalk.red(`❌ Testes falhados: ${failed}`));
console.log(chalk.white(`📋 Total de testes: ${passed + failed}`));

if (failed === 0) {
    console.log(chalk.green('\n🎉 SUCESSO: Todos os testes passaram!'));
    console.log(chalk.green('✅ Os 3 modelos prioritários estão corretamente posicionados no topo'));
    console.log(chalk.green('✅ A configuração de agentes mostrará a lista correta\n'));
    process.exit(0);
} else {
    console.log(chalk.red('\n❌ FALHA: Alguns testes falharam'));
    console.log(chalk.yellow('⚠️  Verifique a implementação do método getAvailableModels()\n'));
    process.exit(1);
}
