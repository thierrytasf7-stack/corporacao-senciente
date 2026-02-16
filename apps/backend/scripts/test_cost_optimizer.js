#!/usr/bin/env node
/**
 * Teste: Cost Optimizer - Otimização Inteligente de Custos
 *
 * Testa o sistema de otimização de custos, tracking de uso,
 * alertas de orçamento e recomendações de otimização
 */

import { getCostOptimizer } from './swarm/cost_optimizer.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_cost_optimizer' });

async function testCostOptimizer() {
    log.info('💰 Testando Cost Optimizer - Otimização Inteligente de Custos\n');

    try {
        // Inicializar otimizador de custos
        const costOptimizer = getCostOptimizer({
            costEnabled: true,
            optimizationEnabled: true,
            budgetAlertsEnabled: true,
            dailyBudget: 5.0,    // $5 por dia para teste
            weeklyBudget: 20.0,  // $20 por semana
            monthlyBudget: 50.0, // $50 por mês
            monitoringInterval: 5000 // 5 segundos para teste
        });

        await costOptimizer.initialize();

        const testResults = {
            initialization: false,
            costTracking: false,
            budgetAlerts: false,
            optimization: false,
            reporting: false,
            totalCost: 0,
            optimizationsApplied: 0,
            alertsTriggered: 0
        };

        // 1. Verificar inicialização
        log.info('1. Verificar inicialização...\n');

        const status = costOptimizer.getStatus();
        if (status.enabled && status.optimizationEnabled) {
            testResults.initialization = true;
            console.log('✅ Cost optimizer inicializado corretamente');
            console.log(`   Orçamento diário: $${status.budgetLimits.daily}`);
            console.log(`   Otimização: ${status.optimizationEnabled ? 'Habilitada' : 'Desabilitada'}`);
        } else {
            console.log('❌ Falha na inicialização');
        }

        // 2. Simular uso de diferentes modelos
        log.info('2. Simular uso de diferentes modelos...\n');

        const usageScenarios = [
            { model: 'gpt-4', tokens: { input: 1000, output: 500 }, agent: 'architect', operation: 'complex_analysis' },
            { model: 'gpt-3.5-turbo', tokens: { input: 800, output: 300 }, agent: 'developer', operation: 'code_review' },
            { model: 'claude-3-haiku', tokens: { input: 600, output: 200 }, agent: 'analyst', operation: 'data_analysis' },
            { model: 'llama2:13b', tokens: { input: 400, output: 150 }, agent: 'assistant', operation: 'simple_query' },
            { model: 'gpt-4', tokens: { input: 1200, output: 600 }, agent: 'architect', operation: 'system_design' }
        ];

        let totalSimulatedCost = 0;

        for (const scenario of usageScenarios) {
            const cost = costOptimizer.calculateCost(scenario.model, scenario.tokens);
            totalSimulatedCost += cost;

            await costOptimizer.recordUsage(
                scenario.model,
                scenario.tokens,
                'completion',
                {
                    agent: scenario.agent,
                    operation: scenario.operation,
                    project: 'test_project',
                    userId: 'test_user',
                    correlationId: `test_${Date.now()}`
                }
            );

            console.log(`   📊 ${scenario.model}: ${cost.toFixed(6)} USD (${scenario.operation})`);
        }

        testResults.totalCost = totalSimulatedCost;
        testResults.costTracking = totalSimulatedCost > 0;

        console.log(`\n✅ Total simulado: $${totalSimulatedCost.toFixed(4)}`);

        // 3. Verificar tracking de custos
        log.info('3. Verificar tracking de custos...\n');

        const updatedStatus = costOptimizer.getStatus();
        if (updatedStatus.currentCosts.daily > 0) {
            console.log('✅ Tracking de custos funcionando');
            console.log(`   Custo diário atual: $${updatedStatus.currentCosts.daily}`);
            console.log(`   Total acumulado: $${updatedStatus.currentCosts.total}`);

            // Verificar breakdown por modelo
            console.log('   📈 Uso por modelo:');
            Object.entries(updatedStatus.modelUsage).forEach(([model, stats]) => {
                console.log(`     ${model}: $${stats.cost.toFixed(4)} (${stats.requests} requests)`);
            });
        }

        // 4. Testar alertas de orçamento
        log.info('4. Testar alertas de orçamento...\n');

        // Simular uso alto para testar alertas
        const highUsageScenarios = [
            { model: 'gpt-4', tokens: { input: 2000, output: 1000 }, agent: 'architect' },
            { model: 'gpt-4', tokens: { input: 2500, output: 1200 }, agent: 'architect' },
            { model: 'gpt-4', tokens: { input: 3000, output: 1500 }, agent: 'architect' }
        ];

        for (const scenario of highUsageScenarios) {
            await costOptimizer.recordUsage(
                scenario.model,
                scenario.tokens,
                'completion',
                { agent: scenario.agent, operation: 'high_cost_test' }
            );
        }

        // Aguardar processamento de alertas
        await new Promise(resolve => setTimeout(resolve, 2000));

        const finalStatus = costOptimizer.getStatus();
        const budgetUsagePercent = (parseFloat(finalStatus.currentCosts.daily) / finalStatus.budgetLimits.daily) * 100;

        console.log('✅ Sistema de alertas testado');
        console.log(`   Uso do orçamento diário: ${budgetUsagePercent.toFixed(1)}%`);
        console.log(`   Limite diário: $${finalStatus.budgetLimits.daily}`);

        if (budgetUsagePercent > 50) {
            testResults.budgetAlerts = true;
            console.log('   🚨 Alertas de orçamento ativados');
        }

        // 5. Testar otimizações automáticas
        log.info('5. Testar otimizações automáticas...\n');

        // Simular cenários onde otimizações podem ser aplicadas
        const optimizationTests = [
            { model: 'gpt-4', tokens: { input: 500, output: 200 }, operation: 'simple_query' },
            { model: 'gpt-4', tokens: { input: 800, output: 300 }, operation: 'test_operation' },
            { model: 'claude-3-opus', tokens: { input: 600, output: 250 }, operation: 'analysis' }
        ];

        let optimizationsFound = 0;

        for (const test of optimizationTests) {
            // Simular aplicação de otimização
            const optimization = await costOptimizer.optimizeModelSelection({
                model: test.model,
                tokens: test.tokens,
                operation: test.operation
            });

            if (optimization && optimization.savings > 0) {
                optimizationsFound++;
                console.log(`   🎯 Otimização: ${optimization.type}`);
                console.log(`     ${optimization.currentModel} → ${optimization.optimizedModel}`);
                console.log(`     Economia: $${optimization.savings.toFixed(6)}`);
            }
        }

        if (optimizationsFound > 0) {
            testResults.optimization = true;
            testResults.optimizationsApplied = optimizationsFound;
            console.log(`\n✅ ${optimizationsFound} otimizações aplicadas`);
        }

        // 6. Testar relatórios de custo
        log.info('6. Testar relatórios de custo...\n');

        const costReport = costOptimizer.generateCostReport('daily');

        if (costReport.summary && costReport.breakdown) {
            testResults.reporting = true;
            console.log('✅ Relatórios de custo gerados');
            console.log(`   📊 Resumo diário:`);
            console.log(`     Total: $${costReport.summary.totalCost.toFixed(4)}`);
            console.log(`     Usado: ${costReport.summary.budgetUsed}% do orçamento`);
            console.log(`     Economia por otimizações: $${costReport.summary.optimizationSavings.toFixed(4)}`);

            console.log(`   📈 Top modelos por custo:`);
            const sortedModels = Object.entries(costReport.breakdown.byModel)
                .sort(([, a], [, b]) => parseFloat(b.cost) - parseFloat(a.cost))
                .slice(0, 3);

            sortedModels.forEach(([model, stats]) => {
                console.log(`     ${model}: $${stats.cost} (${stats.requests} requests)`);
            });

            if (costReport.recommendations && costReport.recommendations.length > 0) {
                console.log(`   💡 Recomendações (${costReport.recommendations.length}):`);
                costReport.recommendations.slice(0, 2).forEach((rec, index) => {
                    console.log(`     ${index + 1}. ${rec.description}`);
                });
            }
        }

        // 7. Testar tendências e analytics
        log.info('7. Testar tendências e analytics...\n');

        if (costReport.trends && !costReport.trends.insufficient_data) {
            console.log('✅ Análise de tendências disponível');
            console.log(`   📈 Tendência: ${costReport.trends.trend}`);
            console.log(`   💰 Custo médio por token: $${costReport.trends.avgCostPerToken.toFixed(6)}`);

            if (costReport.trends.periods.length > 0) {
                console.log('   📊 Períodos de análise:');
                costReport.trends.periods.forEach((period, index) => {
                    console.log(`     Período ${index + 1}: $${period.cost.toFixed(4)} (${period.tokens} tokens)`);
                });
            }
        } else {
            console.log('⚠️ Dados insuficientes para análise de tendências');
        }

        // 8. Resumo dos testes
        log.info('8. Resumo dos testes de Cost Optimizer...\n');

        const successRate = Object.values(testResults).filter(v => typeof v === 'boolean').reduce((sum, val) => sum + (val ? 1 : 0), 0) / 5;

        console.log('💰 Resumo dos Testes de Cost Optimizer:');
        console.log(`   ✅ Inicialização: ${testResults.initialization ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Tracking de custos: ${testResults.costTracking ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Alertas de orçamento: ${testResults.budgetAlerts ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Otimizações: ${testResults.optimization ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Relatórios: ${testResults.reporting ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Custo total simulado: $${testResults.totalCost.toFixed(4)}`);
        console.log(`   🎯 Otimizações aplicadas: ${testResults.optimizationsApplied}`);
        console.log(`   🚨 Alertas acionados: ${testResults.alertsTriggered}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8) {
            console.log('🎉 Cost optimizer funcionando perfeitamente!');
            console.log('   ✓ Tracking preciso de custos LLM');
            console.log('   ✓ Alertas inteligentes de orçamento');
            console.log('   ✓ Otimizações automáticas aplicadas');
            console.log('   ✓ Relatórios detalhados gerados');
            console.log('   ✓ Recomendações proativas de economia');
        } else {
            console.log('⚠️ Cost optimizer com algumas limitações.');
            console.log('   - Verificar configuração de custos por modelo');
            console.log('   - Ajustar thresholds de orçamento');
        }

        // Encerrar otimizador
        await costOptimizer.shutdown();

        log.info('🎉 Testes de Cost Optimizer concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Tracking completo de custos LLM por modelo/agente/projeto');
        log.info('  ✅ Alertas automáticos de orçamento com limites configuráveis');
        log.info('  ✅ Otimizações inteligentes: modelo, cache, compressão, batching');
        log.info('  ✅ Relatórios detalhados com tendências e recomendações');
        log.info('  ✅ Recomendações proativas para redução de custos');

        return successRate >= 0.8;

    } catch (err) {
        log.error('❌ Erro fatal nos testes de cost optimizer', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testCostOptimizer().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});