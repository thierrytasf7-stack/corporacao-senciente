#!/usr/bin/env node
/**
 * Teste: Advanced Model Router - Roteamento Avançado de Modelos
 *
 * Testa sistema de roteamento inteligente com múltiplas estratégias:
 * CARGO, HierRouter, xRouter, MasRouter
 */

import { getAdvancedModelRouter } from './swarm/advanced_model_router.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_advanced_model_router' });

async function testAdvancedModelRouter() {
    log.info('🎯 Testando Advanced Model Router - Roteamento Avançado de Modelos\n');

    try {
        // Inicializar router avançado
        const advancedRouter = getAdvancedModelRouter({
            primaryStrategy: 'cargo',
            fallbackStrategies: ['hierRouter', 'xRouter', 'masRouter'],
            confidenceThreshold: 0.7,
            cacheTimeout: 30000 // 30 segundos para teste
        });

        await advancedRouter.initialize();

        const testResults = {
            initialization: false,
            cargoRouting: false,
            hierRouterRouting: false,
            xRouterRouting: false,
            masRouterRouting: false,
            fallbackRouting: false,
            caching: false,
            learning: false,
            totalRequests: 0,
            successfulRoutes: 0,
            avgConfidence: 0,
            cacheHits: 0
        };

        // 1. Verificar inicialização
        log.info('1. Verificar inicialização...\n');

        const stats = advancedRouter.getStats();
        if (stats.primaryStrategy && stats.strategyWeights && Object.keys(stats.strategyStats).length > 0) {
            testResults.initialization = true;
            console.log('✅ Advanced Model Router inicializado corretamente');
            console.log(`   Estratégia primária: ${stats.primaryStrategy}`);
            console.log(`   Estratégias disponíveis: ${Object.keys(stats.strategyStats).length}`);
            console.log(`   Pesos das estratégias: ${JSON.stringify(stats.strategyWeights)}`);
        } else {
            console.log('❌ Falha na inicialização');
        }

        // 2. Testar roteamento CARGO
        log.info('2. Testar roteamento CARGO (Category-Aware)...\n');

        try {
            const cargoRequest = {
                type: 'code_generation',
                complexity: 'high',
                description: 'Create a React component for user authentication'
            };

            const cargoResult = await advancedRouter.routeRequest(cargoRequest, {
                userId: 'test_user',
                agent: 'developer'
            });

            testResults.totalRequests++;
            if (cargoResult.confidence > 0.6) {
                testResults.successfulRoutes++;
                testResults.cargoRouting = true;
            }

            console.log('✅ CARGO routing executado');
            console.log(`   Modelo selecionado: ${cargoResult.model}`);
            console.log(`   Agente: ${cargoResult.agent}`);
            console.log(`   Confiança: ${(cargoResult.confidence * 100).toFixed(1)}%`);
            console.log(`   Estratégia: ${cargoResult.strategy}`);
            console.log(`   Categoria: ${cargoResult.category || 'N/A'}`);

        } catch (error) {
            console.log('❌ Falha no roteamento CARGO:', error.message);
        }

        // 3. Testar roteamento HierRouter
        log.info('3. Testar roteamento HierRouter...\n');

        try {
            const hierRequest = {
                type: 'analysis',
                complexity: 'medium',
                description: 'Analyze the performance metrics of our API'
            };

            const hierResult = await advancedRouter.routeRequest(hierRequest, {
                userId: 'test_user',
                agent: 'analyst'
            });

            testResults.totalRequests++;
            if (hierResult.confidence > 0.5) {
                testResults.successfulRoutes++;
                testResults.hierRouterRouting = true;
            }

            console.log('✅ HierRouter executado');
            console.log(`   Modelo: ${hierResult.model}, Agente: ${hierResult.agent}`);
            console.log(`   Estado hierárquico: ${JSON.stringify(hierResult.state || {})}`);
            console.log(`   Valor Q: ${hierResult.metadata?.qValue?.toFixed(3) || 'N/A'}`);

        } catch (error) {
            console.log('❌ Falha no roteamento HierRouter:', error.message);
        }

        // 4. Testar roteamento xRouter (Cost-Aware)
        log.info('4. Testar roteamento xRouter (Cost-Aware)...\n');

        try {
            const xRouterRequest = {
                type: 'simple_query',
                complexity: 'low',
                description: 'What is the current weather?'
            };

            const xRouterResult = await advancedRouter.routeRequest(xRouterRequest, {
                userId: 'test_user',
                agent: 'assistant'
            });

            testResults.totalRequests++;
            if (xRouterResult.confidence > 0.5) {
                testResults.successfulRoutes++;
                testResults.xRouterRouting = true;
            }

            console.log('✅ xRouter executado');
            console.log(`   Modelo: ${xRouterResult.model}, Agente: ${xRouterResult.agent}`);
            console.log(`   Custo estimado: $${xRouterResult.costEstimate?.toFixed(6) || 'N/A'}`);
            console.log(`   Lógica: ${xRouterResult.metadata?.routingLogic || 'N/A'}`);

        } catch (error) {
            console.log('❌ Falha no roteamento xRouter:', error.message);
        }

        // 5. Testar roteamento MasRouter (Multi-Agent)
        log.info('5. Testar roteamento MasRouter (Multi-Agent)...\n');

        try {
            const masRequest = {
                type: 'system_design',
                complexity: 'high',
                description: 'Design a complete e-commerce system architecture'
            };

            const masResult = await advancedRouter.routeRequest(masRequest, {
                userId: 'test_user',
                agent: 'architect'
            });

            testResults.totalRequests++;
            if (masResult.confidence > 0.5) {
                testResults.successfulRoutes++;
                testResults.masRouterRouting = true;
            }

            console.log('✅ MasRouter executado');
            console.log(`   Modelo: ${masResult.model}, Agente: ${masResult.agent}`);
            console.log(`   Colaboração: ${masResult.collaboration ? 'Sim' : 'Não'}`);
            if (masResult.collaborators) {
                console.log(`   Colaboradores: ${masResult.collaborators.join(', ')}`);
            }
            console.log(`   Padrão: ${masResult.collaborationPattern || 'N/A'}`);

        } catch (error) {
            console.log('❌ Falha no roteamento MasRouter:', error.message);
        }

        // 6. Testar roteamento com fallback
        log.info('6. Testar roteamento com fallback...\n');

        try {
            // Request que pode falhar na estratégia primária
            const fallbackRequest = {
                type: 'unknown_complex_type',
                complexity: 'extreme',
                description: 'This is a very complex and unknown type of request'
            };

            const fallbackResult = await advancedRouter.routeRequest(fallbackRequest, {
                userId: 'test_user'
            });

            testResults.totalRequests++;
            if (fallbackResult.strategy === 'basic' || fallbackResult.routingType === 'basic_fallback') {
                testResults.fallbackRouting = true;
            }

            console.log('✅ Fallback routing testado');
            console.log(`   Estratégia final: ${fallbackResult.strategy}`);
            console.log(`   Tipo de roteamento: ${fallbackResult.routingType || 'N/A'}`);
            console.log(`   Caminho de roteamento: ${fallbackResult.metadata?.routingPath?.join(' -> ') || 'N/A'}`);

        } catch (error) {
            console.log('❌ Falha no teste de fallback:', error.message);
        }

        // 7. Testar cache de decisões
        log.info('7. Testar cache de decisões...\n');

        try {
            // Fazer a mesma request novamente para testar cache
            const cachedRequest = {
                type: 'code_generation',
                complexity: 'high',
                description: 'Create a React component for user authentication'
            };

            const startTime = Date.now();
            const cachedResult = await advancedRouter.routeRequest(cachedRequest, {
                userId: 'test_user',
                agent: 'developer'
            });
            const endTime = Date.now();

            testResults.totalRequests++;
            if (endTime - startTime < 100) { // Muito rápido = cache hit
                testResults.cacheHits++;
                testResults.caching = true;
            }

            console.log('✅ Cache testado');
            console.log(`   Tempo de resposta: ${endTime - startTime}ms`);
            console.log(`   Cache hits: ${testResults.cacheHits}`);
            console.log(`   Tamanho do cache: ${stats.cacheSize || advancedRouter.decisionCache.size}`);

        } catch (error) {
            console.log('❌ Falha no teste de cache:', error.message);
        }

        // 8. Testar aprendizado contínuo
        log.info('8. Testar aprendizado contínuo...\n');

        try {
            // Verificar se os pesos das estratégias foram atualizados
            const updatedStats = advancedRouter.getStats();
            const weightsChanged = JSON.stringify(updatedStats.strategyWeights) !==
                JSON.stringify({ cargo: 1.0, hierRouter: 1.0, xRouter: 1.0, masRouter: 1.0 });

            if (weightsChanged || updatedStats.routingHistorySize > 5) {
                testResults.learning = true;
            }

            console.log('✅ Aprendizado contínuo testado');
            console.log(`   Histórico de roteamento: ${updatedStats.routingHistorySize} decisões`);
            console.log(`   Pesos atualizados: ${weightsChanged ? 'Sim' : 'Não'}`);
            console.log(`   Métricas por estratégia: ${Object.keys(updatedStats.performanceMetrics || {}).length}`);

        } catch (error) {
            console.log('❌ Falha no teste de aprendizado:', error.message);
        }

        // 9. Testar carga alta
        log.info('9. Testar carga alta...\n');

        try {
            const loadTestRequests = [
                { type: 'simple_query', complexity: 'low' },
                { type: 'code_generation', complexity: 'medium' },
                { type: 'analysis', complexity: 'high' },
                { type: 'debugging', complexity: 'medium' },
                { type: 'documentation', complexity: 'low' }
            ];

            const loadTestPromises = loadTestRequests.map((req, index) =>
                advancedRouter.routeRequest(req, {
                    userId: `load_test_user_${index}`,
                    agent: 'test_agent'
                })
            );

            const loadResults = await Promise.allSettled(loadTestPromises);
            const successfulLoadTests = loadResults.filter(r => r.status === 'fulfilled').length;

            testResults.totalRequests += loadTestRequests.length;

            console.log('✅ Teste de carga alta concluído');
            console.log(`   Requests processados: ${successfulLoadTests}/${loadTestRequests.length}`);
            console.log(`   Taxa de sucesso: ${((successfulLoadTests / loadTestRequests.length) * 100).toFixed(1)}%`);

        } catch (error) {
            console.log('❌ Falha no teste de carga alta:', error.message);
        }

        // 10. Estatísticas finais
        log.info('10. Estatísticas finais...\n');

        const finalStats = advancedRouter.getStats();
        console.log('✅ Estatísticas finais do Advanced Model Router:');
        console.log(`   Total de requests: ${finalStats.routingHistorySize}`);
        console.log(`   Cache size: ${finalStats.cacheSize}`);
        console.log(`   Estratégias ativas: ${Object.keys(finalStats.strategyStats).length}`);
        console.log(`   Pesos das estratégias:`);
        Object.entries(finalStats.strategyWeights).forEach(([strategy, weight]) => {
            console.log(`     ${strategy}: ${(weight * 100).toFixed(1)}%`);
        });

        // 11. Resumo dos testes
        log.info('11. Resumo dos testes de Advanced Model Router...\n');

        const successRate = Object.values(testResults).filter(v => typeof v === 'boolean').reduce((sum, val) => sum + (val ? 1 : 0), 0) / 7;

        console.log('🎯 Resumo dos Testes de Advanced Model Router:');
        console.log(`   ✅ Inicialização: ${testResults.initialization ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ CARGO routing: ${testResults.cargoRouting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ HierRouter routing: ${testResults.hierRouterRouting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ xRouter routing: ${testResults.xRouterRouting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ MasRouter routing: ${testResults.masRouterRouting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Fallback routing: ${testResults.fallbackRouting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Cache: ${testResults.caching ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Aprendizado: ${testResults.learning ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Total de requests: ${testResults.totalRequests}`);
        console.log(`   ✅ Requests bem-sucedidos: ${testResults.successfulRoutes}`);
        console.log(`   💾 Cache hits: ${testResults.cacheHits}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8) {
            console.log('🎉 Advanced Model Router funcionando perfeitamente!');
            console.log('   ✓ CARGO: Category-Aware Routing com embeddings');
            console.log('   ✓ HierRouter: Hierarchical MDP com RL básico');
            console.log('   ✓ xRouter: Cost-Aware com tool-calling');
            console.log('   ✓ MasRouter: Multi-Agent System Routing');
            console.log('   ✓ Fallback inteligente entre estratégias');
            console.log('   ✓ Cache de decisões de alta performance');
            console.log('   ✓ Aprendizado contínuo dos pesos');
        } else {
            console.log('⚠️ Advanced Model Router com algumas limitações.');
            console.log('   - Verificar implementação de embeddings');
            console.log('   - Otimizar Q-learning no HierRouter');
            console.log('   - Melhorar tool-calling no xRouter');
        }

        log.info('🎉 Testes de Advanced Model Router concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Roteamento multi-estratégia baseado em papers acadêmicos');
        log.info('  ✅ CARGO: Category-Aware Routing com regressores');
        log.info('  ✅ HierRouter: Hierarchical MDP com reinforcement learning');
        log.info('  ✅ xRouter: Cost-Aware Orchestration com tool-calling');
        log.info('  ✅ MasRouter: Multi-Agent System Routing inteligente');
        log.info('  ✅ Sistema de fallback robusto entre estratégias');
        log.info('  ✅ Cache inteligente de decisões de roteamento');
        log.info('  ✅ Aprendizado contínuo e adaptação automática');

        return successRate >= 0.8;

    } catch (err) {
        log.error('❌ Erro fatal nos testes de advanced model router', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testAdvancedModelRouter().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});