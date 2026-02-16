/**
 * Testa diferentes modelos do Ollama para encontrar o mais rápido
 */

import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODELS = ['qwen3:8b', 'llama3.1:8b', 'llama3.2:latest'];

async function testModel(modelName, timeout = 20000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const startTime = Date.now();
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: 'Diga: OK' }],
                options: {
                    num_predict: 5,
                    temperature: 0.1,
                },
                stream: false,
            }),
        });

        clearTimeout(timeoutId);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        if (res.ok) {
            const data = await res.json();
            const response = data?.message?.content || '';
            return { success: true, time: elapsed, response: response.trim() };
        } else {
            return { success: false, time: elapsed, error: res.status };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            return { success: false, time: (timeout / 1000).toFixed(1), error: 'Timeout' };
        }
        return { success: false, time: '0', error: error.message };
    }
}

async function testAllModels() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTE DE MODELOS OLLAMA');
    console.log('═══════════════════════════════════════════════════\n');

    const results = [];

    for (const model of MODELS) {
        console.log(`🧪 Testando ${model}...`);
        const result = await testModel(model, 20000);
        results.push({ model, ...result });
        
        if (result.success) {
            console.log(`   ✅ Sucesso em ${result.time}s: "${result.response}"`);
        } else {
            console.log(`   ❌ Falhou: ${result.error} (${result.time}s)`);
        }
        console.log('');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('   RESULTADOS');
    console.log('═══════════════════════════════════════════════════\n');

    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
        successful.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
        console.log('✅ Modelos funcionando (ordenados por velocidade):');
        successful.forEach(r => {
            console.log(`   ${r.model}: ${r.time}s`);
        });
        console.log(`\n💡 Recomendação: Use "${successful[0].model}" (mais rápido)`);
    } else {
        console.log('❌ Nenhum modelo funcionou dentro do timeout de 20s');
        console.log('💡 Tente aumentar o timeout ou verificar se os modelos estão carregados');
    }
    console.log('');
}

testAllModels().catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
});



























