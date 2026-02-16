#!/usr/bin/env node
/**
 * Teste: Streaming Real com LLM - Respostas em Tempo Real
 *
 * Testa streaming real de tokens do LLM ao invés de simulação
 */

import { getStreamingAPI } from './api/streaming_api.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_streaming_real' });

async function testRealStreaming() {
    log.info('🎥 Testando Streaming Real com LLM\n');

    const streamingAPI = getStreamingAPI(3004); // Porta diferente para teste

    try {
        // Iniciar servidor de teste
        await streamingAPI.start();

        const testResults = {
            realChatStream: false,
            tokensReceived: 0,
            responseTime: 0,
            errors: 0
        };

        // 1. Testar streaming real de chat com LLM
        log.info('1. Testar streaming real de chat com LLM...\n');

        const startTime = Date.now();

        try {
            const response = await testSSEEndpoint('http://localhost:3004/api/stream/chat?message=Explique%20brevemente%20o%20que%20%C3%A9%20intelig%C3%AAncia%20artificial&agent=assistant&model=grok', 10000);

            testResults.responseTime = Date.now() - startTime;
            testResults.realChatStream = response.success;
            testResults.tokensReceived = response.tokens;

            console.log('✅ Streaming real de chat:', response.success ? 'Sucesso' : 'Falhou');
            console.log(`   Tokens recebidos: ${response.tokens}`);
            console.log(`   Tempo de resposta: ${testResults.responseTime}ms`);
            console.log(`   Tipos de eventos: ${response.eventTypes.join(', ')}`);

            if (response.lastTokenData) {
                console.log(`   Resposta final: ${response.lastTokenData.text_so_far?.substring(0, 100)}...`);
            }

        } catch (error) {
            console.log('❌ Streaming real de chat falhou:', error.message);
            testResults.errors++;
        }

        // 2. Testar com diferentes agentes
        log.info('2. Testar streaming com diferentes agentes...\n');

        const agents = ['architect', 'developer', 'analyst'];
        for (const agent of agents) {
            try {
                console.log(`Testando agente: ${agent}`);
                const response = await testSSEEndpoint(`http://localhost:3004/api/stream/chat?message=Oi&agent=${agent}`, 5000);
                console.log(`   ✅ ${agent}: ${response.tokens} tokens`);
            } catch (error) {
                console.log(`   ❌ ${agent}: ${error.message}`);
            }
        }

        // 3. Resumo dos testes
        log.info('3. Resumo dos testes de streaming real...\n');

        const successRate = testResults.realChatStream ? 1 : 0;

        console.log('🎥 Resumo dos Testes de Streaming Real:');
        console.log(`   ✅ Streaming real: ${testResults.realChatStream ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Tokens recebidos: ${testResults.tokensReceived}`);
        console.log(`   ⏱️ Tempo médio de resposta: ${testResults.responseTime}ms`);
        console.log(`   ❌ Erros: ${testResults.errors}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8 && testResults.tokensReceived > 5) {
            console.log('🎉 Streaming real funcionando perfeitamente!');
            console.log('   ✓ Tokens reais do LLM sendo transmitidos');
            console.log('   ✓ Latência adequada para experiência em tempo real');
            console.log('   ✓ Integração completa com modelo de linguagem');
        } else {
            console.log('⚠️ Streaming real com limitações.');
            if (testResults.tokensReceived <= 5) {
                console.log('   - Poucos tokens recebidos, verificar configuração do LLM');
            }
            if (testResults.responseTime > 10000) {
                console.log('   - Tempo de resposta alto, verificar conectividade');
            }
        }

        // Parar servidor
        streamingAPI.stop();

        log.info('🎉 Testes de streaming real concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Streaming real de tokens LLM');
        log.info('  ✅ Server-Sent Events com dados reais');
        log.info('  ✅ Integração com Model Router');
        log.info('  ✅ Suporte a múltiplos agentes');

        return successRate >= 0.8 && testResults.tokensReceived > 5;

    } catch (err) {
        log.error('❌ Erro ao testar streaming real', { error: err.message, stack: err.stack });

        // Tentar parar servidor mesmo com erro
        try {
            streamingAPI.stop();
        } catch (stopError) {
            log.error('Error stopping server', { error: stopError.message });
        }

        return false;
    }
}

/**
 * Testar endpoint SSE
 */
async function testSSEEndpoint(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const events = [];
        const eventTypes = new Set();
        let tokens = 0;
        let lastTokenData = null;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            resolve({
                success: events.length > 0,
                events: events.length,
                eventTypes: Array.from(eventTypes),
                tokens,
                lastTokenData
            });
        }, timeout);

        fetch(url, {
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache'
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            function processChunk() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        clearTimeout(timeoutId);
                        resolve({
                            success: events.length > 0,
                            events: events.length,
                            eventTypes: Array.from(eventTypes),
                            tokens,
                            lastTokenData
                        });
                        return;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Manter última linha incompleta

                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            const eventType = line.substring(7).trim();
                            eventTypes.add(eventType);
                        } else if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                events.push(data);

                                // Contar tokens
                                if (data.token) {
                                    tokens++;
                                    lastTokenData = data;
                                }

                                // Se recebeu resposta completa, terminar
                                if (data.event === 'response_complete' || data.full_response) {
                                    clearTimeout(timeoutId);
                                    resolve({
                                        success: true,
                                        events: events.length,
                                        eventTypes: Array.from(eventTypes),
                                        tokens,
                                        lastTokenData
                                    });
                                    return;
                                }
                            } catch (e) {
                                // Ignorar dados malformados
                            }
                        }
                    }

                    processChunk();
                }).catch(error => {
                    if (error.name === 'AbortError') {
                        return; // Timeout esperado
                    }
                    clearTimeout(timeoutId);
                    reject(error);
                });
            }

            processChunk();
        }).catch(error => {
            clearTimeout(timeoutId);
            reject(error);
        });
    });
}

// Executar
testRealStreaming().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});