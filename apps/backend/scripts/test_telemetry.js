/**
 * Testes do Sistema de Telemetria e Observabilidade
 */

import { telemetry, requestCounter, requestDuration, errorCounter, traceFunction, measureExecutionTime } from './swarm/telemetry.js';

async function testTelemetrySystem() {
  console.log('📊 Testando Sistema de Telemetria...\n');

  try {
    // Teste 1: Tracing básico
    console.log('🔍 Teste 1: Tracing básico...');
    const span = telemetry.startSpan('test_operation', {
      agent: 'test_agent',
      operation: 'telemetry_test'
    });

    span.setAttribute('test_param', 'value123');
    span.addEvent('operation_started', { details: 'Starting test' });

    await new Promise(resolve => setTimeout(resolve, 100));

    span.addEvent('operation_completed', { result: 'success' });
    span.end();

    console.log(`✅ Span criado: ${span.spanId}`);

    // Teste 2: Métricas
    console.log('\n📈 Teste 2: Métricas...');
    requestCounter.add(1, { method: 'GET', endpoint: '/api/test' });
    requestCounter.add(2, { method: 'POST', endpoint: '/api/test' });

    requestDuration.record(150, { method: 'GET', status: '200' });
    requestDuration.record(250, { method: 'POST', status: '201' });
    requestDuration.record(500, { method: 'GET', status: '500' });

    errorCounter.add(1, { type: 'validation_error', endpoint: '/api/test' });

    console.log('✅ Métricas registradas');

    // Teste 3: Health checks
    console.log('\n❤️ Teste 3: Health checks...');
    const healthResults = await telemetry.runHealthChecks();
    console.log('✅ Health checks executados:', Object.keys(healthResults));

    // Teste 4: Funções traceadas
    console.log('\n🔗 Teste 4: Funções traceadas...');

    const tracedFunction = traceFunction(
      async (param) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return `Result: ${param}`;
      },
      'traced_test_function',
      { category: 'test' }
    );

    const result = await tracedFunction('test_param');
    console.log(`✅ Função traceada executada: ${result}`);

    // Teste 5: Funções medidas
    console.log('\n⏱️ Teste 5: Funções medidas...');

    const measuredFunction = measureExecutionTime(
      async (delay) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        if (delay > 200) throw new Error('Simulated error');
        return `Delayed result: ${delay}ms`;
      },
      'measured_test_function',
      { type: 'delay_test' }
    );

    await measuredFunction(100);
    try {
      await measuredFunction(300);
    } catch (error) {
      console.log('✅ Erro esperado capturado');
    }

    console.log('✅ Função medida executada');

    // Teste 6: Estatísticas do sistema
    console.log('\n📊 Teste 6: Estatísticas do sistema...');
    const stats = telemetry.getSystemStats();
    console.log('✅ Estatísticas obtidas:');
    console.log(`   - Spans: ${stats.spans.total} (${stats.spans.active} ativos)`);
    console.log(`   - Métricas: ${stats.metrics.total}`);
    console.log(`   - Health checks: ${stats.healthChecks.total}`);
    console.log(`   - Uptime: ${Math.round(stats.uptime)}s`);

    // Teste 7: Exportação de dados
    console.log('\n📤 Teste 7: Exportação de dados...');
    const exportData = telemetry.exportData();
    console.log(`✅ Dados exportados: ${exportData.spans.length} spans, ${exportData.metrics.length} métricas`);

    // Teste 8: Limpeza
    console.log('\n🧹 Teste 8: Limpeza de dados...');
    telemetry.cleanup(10, 0); // Manter apenas 10 spans, nenhum tempo limite
    const statsAfterCleanup = telemetry.getSystemStats();
    console.log(`✅ Após limpeza: ${statsAfterCleanup.spans.total} spans restantes`);

    console.log('\n🎉 Todos os testes de telemetria passaram!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testTelemetrySystem();
}

export { testTelemetrySystem };





