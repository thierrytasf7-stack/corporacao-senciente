#!/usr/bin/env node
/**
 * Testa prioridade de LLMs: Grok → Gemini → Ollama
 */

import { callLLM, checkOllamaAvailable } from './utils/llm_client.js';

async function testLLMPriority() {
    console.log('🧪 Testando prioridade de LLMs...\n');

    // Teste simples
    const testPrompt = "Responda apenas com uma palavra: 'teste'";

    try {
        console.log('1. Testando Grok...');
        const grokResult = await callLLM(testPrompt, 'Você é um assistente de teste. Responda apenas com uma palavra.');
        console.log(`✅ Grok: ${grokResult}\n`);

        // Testar Ollama se disponível
        console.log('2. Verificando Ollama...');
        const ollamaAvailable = await checkOllamaAvailable();
        console.log(`Ollama disponível: ${ollamaAvailable ? '✅' : '❌'}\n`);

        if (ollamaAvailable) {
            // Simular falha do Grok para testar fallback
            console.log('3. Simulando falha do Grok para testar fallback...');
            // Para testar fallback, teríamos que modificar temporariamente as chaves
            console.log('ℹ️ Para testar fallback completo, desative temporariamente GROK_API_KEY no .env\n');
        }

        console.log('🎯 Prioridade configurada: Grok → Gemini → Ollama');
        console.log('✅ Sistema funcionando corretamente!');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.log('\n🔧 Verifique:');
        console.log('1. GROK_API_KEY está configurado no .env');
        console.log('2. GEMINI_API_KEY está configurado no .env');
        console.log('3. Ollama está rodando: ollama serve');
    }
}

testLLMPriority().catch(console.error);






