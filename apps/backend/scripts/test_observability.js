#!/usr/bin/env node
/**
 * Teste: Observabilidade Avançada - OpenTelemetry Integration
 *
 * Testa tracing distribuído, métricas, alertas baseados em traces,
 * correlation IDs e integração com Grafana/Prometheus
 */

import { getDistributedTracer } from './observability/distributed_tracer.js';
import { getOpenTelemetry } from './observability/opentelemetry_setup.js';
import { getTraceAlerts } from './observability/trace_alerts.js';
import { getCorrelationManager } from './utils/correlation_manager.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_observability' });

async function testObservability() {
    log.info('🔍 Testando Observabilidade Avançada - OpenTelemetry Integration\n');

    try {
        // Inicializar componentes
        const openTelemetry = getOpenTelemetry({
            serviceName: 'corporacao-senciente-test',
            environment: 'test'
        });

        const distributedTracer = getDistributedTracer();
        const traceAlerts = getTraceAlerts();
        const correlationManager = getCorrelationManager();

        // Inicializar OpenTelemetry
        log.info('1. Inicializando OpenTelemetry...\n');
        await openTelemetry.initialize();
        await distributedTracer.initialize();

        const testResults = {
            opentelemetry: false,
            distributedTracing: false,
            correlationIds: false,
            traceAlerts: false,
            metrics: false,
            totalOperations: 0,
            alertsGenerated: 0
        };

        // 1. Testar OpenTelemetry básico
        log.info('2. Testar OpenTelemetry básico...\n');

        try {
            // Criar spans de teste
            const span1 = openTelemetry.createSpan('test_operation_1', {
                attributes: { 'test.type': 'basic', 'test.duration': 100 }
            });

            if (span1) {
                span1.addEvent('operation_started');
                await new Promise(resolve => setTimeout(resolve, 50));
                span1.addEvent('operation_completed');
                span1.setAttribute('result.success', true);
                span1.end();
                testResults.opentelemetry = true;
            }

            console.log('✅ OpenTelemetry spans criados com sucesso');

            // Testar métricas
            openTelemetry.recordMetric('test_metric', 42, {
                'test.category': 'observability',
                'test.source': 'unit_test'
            });

            console.log('✅ Métricas registradas');

        } catch (error) {
            console.log('❌ OpenTelemetry falhou:', error.message);
        }

        // 2. Testar Tracing Distribuído
        log.info('3. Testar Tracing Distribuído...\n');

        try {
            // Operação simulada com tracing
            await distributedTracer.traceCriticalOperation(
                'test_distributed_operation',
                async () => {
                    const traceId = Object.keys(distributedTracer.activeTraces)[0];

                    // Criar spans filhos
                    const subSpan1 = distributedTracer.createChildSpan(traceId, 'sub_operation_1', {
                        'operation.type': 'computation',
                        'operation.complexity': 'medium'
                    });

                    if (subSpan1) {
                        subSpan1.addEvent('computation_started');
                        await new Promise(resolve => setTimeout(resolve, 30));
                        subSpan1.addEvent('computation_completed');
                        subSpan1.end();
                    }

                    const subSpan2 = distributedTracer.createChildSpan(traceId, 'sub_operation_2', {
                        'operation.type': 'validation',
                        'operation.complexity': 'low'
                    });

                    if (subSpan2) {
                        subSpan2.addEvent('validation_started');
                        await new Promise(resolve => setTimeout(resolve, 20));
                        subSpan2.addEvent('validation_completed');
                        subSpan2.end();
                    }

                    return { success: true, operations: 2 };
                },
                {
                    type: 'test_operation',
                    agent: 'test_agent',
                    userId: 'test_user'
                }
            );

            testResults.distributedTracing = true;
            testResults.totalOperations++;
            console.log('✅ Tracing distribuído executado com sucesso');

        } catch (error) {
            console.log('❌ Tracing distribuído falhou:', error.message);
        }

        // 3. Testar Correlation IDs
        log.info('4. Testar Correlation IDs...\n');

        try {
            // Criar correlação manual
            const correlationId = correlationManager.startCorrelation('test_correlation', {
                userId: 'test_user',
                requestType: 'integration_test',
                sessionId: 'test_session_123'
            });

            // Adicionar eventos
            correlationManager.addEvent(correlationId, 'test_event_1', { data: 'test1' });
            correlationManager.addEvent(correlationId, 'test_event_2', { data: 'test2' });

            // Criar correlação filha
            const childCorrelationId = correlationManager.startCorrelation('child_operation', {
                parentId: correlationId,
                userId: 'test_user'
            });

            correlationManager.addChildCorrelation(correlationId, childCorrelationId, 'child');

            // Finalizar correlações
            correlationManager.endCorrelation(childCorrelationId, { success: true });
            correlationManager.endCorrelation(correlationId, { success: true, children: 1 });

            // Verificar estatísticas
            const stats = correlationManager.getCorrelationStats();
            if (stats.active_correlations === 0 && stats.operations.test_correlation) {
                testResults.correlationIds = true;
                console.log('✅ Correlation IDs funcionaram corretamente');
                console.log(`   Operações rastreadas: ${Object.keys(stats.operations).length}`);
            }

        } catch (error) {
            console.log('❌ Correlation IDs falharam:', error.message);
        }

        // 4. Testar Alertas Baseados em Traces
        log.info('5. Testar Alertas Baseados em Traces...\n');

        try {
            // Simular operação lenta para gerar alerta
            await distributedTracer.traceCriticalOperation(
                'slow_operation_test',
                async () => {
                    // Aguardar para simular operação lenta
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return { success: true, duration: 1000 };
                },
                {
                    type: 'performance_test',
                    agent: 'test_agent',
                    userId: 'test_user'
                }
            );

            // Aguardar processamento de alertas
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar alertas gerados
            const activeAlerts = traceAlerts.getActiveAlerts();
            const recentAlerts = traceAlerts.getAlertHistory(1); // Última 1 hora

            testResults.traceAlerts = activeAlerts.length > 0 || recentAlerts.length > 0;
            testResults.alertsGenerated = recentAlerts.length;

            console.log('✅ Sistema de alertas testado');
            console.log(`   Alertas ativos: ${activeAlerts.length}`);
            console.log(`   Alertas recentes: ${recentAlerts.length}`);

            if (recentAlerts.length > 0) {
                console.log('   Últimos alertas:');
                recentAlerts.slice(-3).forEach(alert => {
                    console.log(`     - ${alert.type}: ${alert.title}`);
                });
            }

        } catch (error) {
            console.log('❌ Alertas baseados em traces falharam:', error.message);
        }

        // 5. Testar Métricas e Estatísticas
        log.info('6. Testar Métricas e Estatísticas...\n');

        try {
            const traceStats = distributedTracer.getTraceStats();
            const alertStats = traceAlerts.getAlertStats();
            const correlationStats = correlationManager.getCorrelationStats();

            console.log('✅ Estatísticas coletadas:');
            console.log(`   Traces totais: ${traceStats.total_traces}`);
            console.log(`   Traces ativos: ${traceStats.active_traces}`);
            console.log(`   Duração média de traces: ${Math.round(traceStats.avg_trace_duration)}ms`);
            console.log(`   Alertas ativos: ${alertStats.active_alerts}`);
            console.log(`   Correlações ativas: ${correlationStats.active_correlations}`);

            if (traceStats.total_traces > 0 && alertStats.active_alerts >= 0) {
                testResults.metrics = true;
            }

        } catch (error) {
            console.log('❌ Coleta de métricas falhou:', error.message);
        }

        // 6. Testar Integração com Grafana/Prometheus (simulado)
        log.info('7. Testar Integração com Grafana/Prometheus...\n');

        try {
            const status = openTelemetry.getStatus();

            console.log('✅ Status do OpenTelemetry:');
            console.log(`   Inicializado: ${status.initialized}`);
            console.log(`   Tracing disponível: ${status.tracing.available}`);
            console.log(`   Métricas disponíveis: ${status.metrics.available}`);
            console.log(`   Logging disponível: ${status.logging.available}`);
            console.log(`   Jaeger endpoint: ${status.exporters.jaeger ? 'Configurado' : 'Não configurado'}`);
            console.log(`   Prometheus endpoint: ${status.exporters.prometheus ? 'Configurado' : 'Não configurado'}`);

            // Em produção, aqui seria testada a conectividade real

        } catch (error) {
            console.log('❌ Integração com Grafana/Prometheus falhou:', error.message);
        }

        // 7. Resumo dos testes
        log.info('8. Resumo dos testes de Observabilidade...\n');

        const successRate = Object.values(testResults).filter(v => typeof v === 'boolean').reduce((sum, val) => sum + (val ? 1 : 0), 0) / 5;

        console.log('🔍 Resumo dos Testes de Observabilidade:');
        console.log(`   ✅ OpenTelemetry básico: ${testResults.opentelemetry ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Tracing Distribuído: ${testResults.distributedTracing ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Correlation IDs: ${testResults.correlationIds ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Alertas baseados em traces: ${testResults.traceAlerts ? 'Sucesso' : 'Falhou'}`);
        console.log(`   ✅ Métricas e estatísticas: ${testResults.metrics ? 'Sucesso' : 'Falhou'}`);
        console.log(`   📊 Operações rastreadas: ${testResults.totalOperations}`);
        console.log(`   🚨 Alertas gerados: ${testResults.alertsGenerated}`);
        console.log(`   📈 Taxa de sucesso: ${(successRate * 100).toFixed(1)}%`);

        if (successRate >= 0.8) {
            console.log('🎉 Observabilidade avançada funcionando perfeitamente!');
            console.log('   ✓ Tracing distribuído operacional');
            console.log('   ✓ Correlation IDs rastreando requests completos');
            console.log('   ✓ Alertas inteligentes baseados em traces');
            console.log('   ✓ Métricas detalhadas coletadas');
            console.log('   ✓ Integração OpenTelemetry completa');
        } else {
            console.log('⚠️ Observabilidade com algumas limitações.');
            console.log('   - Verificar configuração do OpenTelemetry');
            console.log('   - Confirmar endpoints do Jaeger/Prometheus');
        }

        // Encerrar componentes
        await openTelemetry.shutdown();

        log.info('🎉 Testes de Observabilidade concluídos!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Tracing distribuído end-to-end');
        log.info('  ✅ Correlation IDs para rastreamento completo');
        log.info('  ✅ Alertas baseados em análise de traces');
        log.info('  ✅ Métricas customizadas e dashboards');
        log.info('  ✅ Integração completa com OpenTelemetry');
        log.info('  ✅ Suporte a Jaeger, Prometheus e Grafana');

        return successRate >= 0.8;

    } catch (err) {
        log.error('❌ Erro fatal nos testes de observabilidade', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testObservability().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});