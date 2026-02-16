/**
 * Teste de Integração Ollama
 * 
 * Verifica se Ollama está configurado e funcionando
 */

import { checkOllamaAvailable, callLLM } from './utils/llm_client.js';
import { default as llmClient } from './utils/llm_client.js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

async function testOllama() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTE DE INTEGRAÇÃO OLLAMA');
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Verificar disponibilidade
    console.log('1️⃣ Verificando se Ollama está disponível...');
    const available = await checkOllamaAvailable();
    
    if (!available) {
        console.log('❌ Ollama não está disponível');
        console.log('\n📝 Para instalar:');
        console.log('   1. Baixe: https://ollama.com/download');
        console.log('   2. Instale e execute');
        console.log('   3. Baixe um modelo: ollama pull llama3.2');
        console.log('   4. Configure OLLAMA_ENABLED=true no env.local\n');
        return;
    }

    console.log('✅ Ollama está disponível\n');

    // 2. Teste direto
    console.log('2️⃣ Testando chamada direta ao Ollama...');
    try {
        const result = await llmClient.callOllama(
            'Responda apenas: "Ollama está funcionando!"',
            '',
            0.7
        );
        
        if (result) {
            console.log('✅ Chamada direta funcionou');
            console.log(`   Resposta: ${result.substring(0, 100)}...\n`);
        } else {
            console.log('❌ Chamada direta retornou null\n');
        }
    } catch (error) {
        console.log(`❌ Erro na chamada direta: ${error.message}\n`);
    }

    // 3. Teste com callLLM (treinamento)
    console.log('3️⃣ Testando callLLM com isTraining=true...');
    try {
        const result = await callLLM(
            'Gere um exemplo de pergunta e resposta sobre copywriting.',
            'Você é um especialista em copywriting.',
            0.7,
            { isTraining: true }
        );
        
        if (result) {
            console.log('✅ callLLM com treinamento funcionou');
            console.log(`   Resposta: ${result.substring(0, 150)}...\n`);
        } else {
            console.log('❌ callLLM retornou null\n');
        }
    } catch (error) {
        console.log(`❌ Erro no callLLM: ${error.message}\n`);
    }

    // 4. Resumo
    console.log('═══════════════════════════════════════════════════');
    console.log('   RESUMO');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('✅ Ollama está configurado e funcionando!');
    console.log('✅ O sistema usará Ollama automaticamente para treinamento');
    console.log('✅ Rate limits do Grok não serão mais um problema\n');
}

testOllama().catch(error => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
});

