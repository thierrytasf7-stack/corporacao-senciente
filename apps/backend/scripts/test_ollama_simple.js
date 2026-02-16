/**
 * Teste Simples do Ollama
 * Valida se está funcionando com prompts curtos
 */

import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b';

async function testOllamaSimple() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTE SIMPLES OLLAMA');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Modelo: ${OLLAMA_MODEL}`);
    console.log(`URL: ${OLLAMA_BASE_URL}\n`);

    // Teste 1: Verificar se está rodando
    console.log('1️⃣ Verificando se Ollama está rodando...');
    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
            const data = await res.json();
            const models = data.models || [];
            console.log(`✅ Ollama está rodando (${models.length} modelos instalados)`);
            if (models.length > 0) {
                console.log(`   Modelos: ${models.map(m => m.name).join(', ')}`);
            }
        } else {
            console.log('❌ Ollama não respondeu corretamente');
            return;
        }
    } catch (error) {
        console.log(`❌ Erro ao conectar: ${error.message}`);
        console.log('   Verifique se Ollama está rodando: ollama serve');
        return;
    }

    // Teste 2: Prompt muito simples
    console.log('\n2️⃣ Testando prompt muito simples (5s timeout)...');
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [{ role: 'user', content: 'Diga apenas: OK' }],
                options: {
                    num_predict: 10, // Apenas 10 tokens
                    temperature: 0.1,
                },
                stream: false,
            }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const response = data?.message?.content || '';
            console.log(`✅ Resposta recebida: "${response.trim()}"`);
        } else {
            const errorText = await res.text();
            console.log(`❌ Erro: ${res.status} - ${errorText}`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('❌ Timeout após 5s - modelo muito lento');
        } else {
            console.log(`❌ Erro: ${error.message}`);
        }
    }

    // Teste 3: Prompt médio com timeout maior
    console.log('\n3️⃣ Testando prompt médio (30s timeout)...');
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const startTime = Date.now();
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                messages: [{ 
                    role: 'user', 
                    content: 'Responda em uma frase: O que é copywriting?' 
                }],
                options: {
                    num_predict: 50, // 50 tokens
                    temperature: 0.7,
                },
                stream: false,
            }),
        });

        clearTimeout(timeoutId);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (res.ok) {
            const data = await res.json();
            const response = data?.message?.content || '';
            console.log(`✅ Resposta recebida em ${elapsed}s:`);
            console.log(`   "${response.trim().substring(0, 100)}..."`);
        } else {
            const errorText = await res.text();
            console.log(`❌ Erro: ${res.status} - ${errorText}`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('❌ Timeout após 30s - modelo muito lento para este prompt');
        } else {
            console.log(`❌ Erro: ${error.message}`);
        }
    }

    // Resumo
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   RESUMO');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('✅ Ollama está configurado');
    console.log('⚠️  Se deu timeout, o modelo pode estar muito lento');
    console.log('💡 Dica: Use prompts mais curtos ou aumente o timeout\n');
}

testOllamaSimple().catch(error => {
    console.error('❌ Erro no teste:', error);
    process.exit(1);
});



























