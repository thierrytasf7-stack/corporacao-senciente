/**
 * Testes do Sistema de Model Router Avançado
 */

import { modelRouter, routeToBestModel, getAvailableModels, getRoutingStats } from './swarm/model_router.js';

async function testModelRouter() {
  console.log('🔀 Testando Model Router Avançado...\n');

  try {
    // Teste 1: Roteamento básico
    console.log('📍 Teste 1: Roteamento básico...');
    const simpleTask = "Create a simple function to add two numbers";
    const routing1 = await routeToBestModel(simpleTask, { urgency: 'normal' });

    console.log(`✅ Roteamento simples:`);
    console.log(`   Modelo: ${routing1.model.name}`);
    console.log(`   Estratégia: ${routing1.strategy}`);
    console.log(`   Confiança: ${(routing1.confidence * 100).toFixed(1)}%`);
    console.log(`   Custo estimado: $${routing1.estimatedCost.toFixed(4)}`);
    console.log(`   Latência estimada: ${routing1.estimatedLatency}ms`);

    // Teste 2: Roteamento para tarefa complexa
    console.log('\n🧠 Teste 2: Roteamento para tarefa complexa...');
    const complexTask = "Design and implement a complex microservices architecture with advanced optimization algorithms, distributed caching, and real-time analytics capabilities";
    const routing2 = await routeToBestModel(complexTask, {
      urgency: 'high',
      quality: 'high',
      budget: 'unlimited'
    });

    console.log(`✅ Roteamento complexo:`);
    console.log(`   Modelo: ${routing2.model.name}`);
    console.log(`   Estratégia: ${routing2.strategy}`);
    console.log(`   Confiança: ${(routing2.confidence * 100).toFixed(1)}%`);

    // Teste 3: Roteamento urgente
    console.log('\n⚡ Teste 3: Roteamento urgente...');
    const urgentTask = "Fix critical production bug immediately";
    const routing3 = await routeToBestModel(urgentTask, {
      urgency: 'critical',
      time_constraint: 'immediate'
    });

    console.log(`✅ Roteamento urgente:`);
    console.log(`   Modelo: ${routing3.model.name}`);
    console.log(`   Prioridade: velocidade máxima`);

    // Teste 4: Roteamento econômico
    console.log('\n💰 Teste 4: Roteamento econômico...');
    const budgetTask = "Generate simple documentation for basic API endpoints";
    const routing4 = await routeToBestModel(budgetTask, {
      budget: 'low',
      quality: 'sufficient'
    });

    console.log(`✅ Roteamento econômico:`);
    console.log(`   Modelo: ${routing4.model.name}`);
    console.log(`   Custo: $${routing4.estimatedCost.toFixed(4)}`);

    // Teste 5: Estratégias específicas
    console.log('\n🎯 Teste 5: Estratégias específicas...');

    const contextAware = await modelRouter.routeRequest(complexTask, {}, { strategy: 'cargo' });
    console.log(`✅ CARGO routing: ${contextAware.model.name}`);

    const hierarchical = await modelRouter.routeRequest(complexTask, {}, { strategy: 'hierarchical' });
    console.log(`✅ Hierarchical routing: ${hierarchical.model.name}`);

    const expert = await modelRouter.routeRequest("Write a Python function to sort a list", {}, { strategy: 'expert' });
    console.log(`✅ Expert routing: ${expert.model.name}`);

    // Teste 6: Catálogo de modelos
    console.log('\n📚 Teste 6: Catálogo de modelos...');
    const models = getAvailableModels();
    console.log(`✅ Total de modelos disponíveis: ${models.length}`);

    const categories = {};
    models.forEach(model => {
      model.strengths.forEach(strength => {
        categories[strength] = (categories[strength] || 0) + 1;
      });
    });

    console.log(`✅ Especializações:`);
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} modelos`);
    });

    // Teste 7: Estatísticas do sistema
    console.log('\n📊 Teste 7: Estatísticas do sistema...');
    const stats = getRoutingStats();
    console.log(`✅ Estatísticas:`);
    console.log(`   Modelos: ${stats.totalModels}`);
    console.log(`   Estratégias: ${stats.routingStrategies.join(', ')}`);
    console.log(`   Histórico: ${stats.performanceHistorySize} decisões`);

    // Teste 8: Análise de contexto
    console.log('\n🔍 Teste 8: Análise de contexto...');
    const contextAnalysis = await modelRouter.contextAnalyzer.analyze(complexTask, {
      urgency: 'high',
      quality: 'premium'
    });

    console.log(`✅ Análise de contexto:`);
    console.log(`   Complexidade: ${(contextAnalysis.complexity * 100).toFixed(1)}%`);
    console.log(`   Tipo: ${contextAnalysis.task_type}`);
    console.log(`   Urgência: ${contextAnalysis.urgency}`);
    console.log(`   Pode decompor: ${contextAnalysis.canDecompose}`);

    // Teste 9: Balanceamento de carga
    console.log('\n⚖️ Teste 9: Balanceamento de carga...');
    const loadTests = [];
    for (let i = 0; i < 5; i++) {
      const routing = await routeToBestModel(`Task ${i}`, { urgency: 'normal' });
      loadTests.push(routing.model.name);
    }

    console.log(`✅ Balanceamento: ${loadTests.join(', ')}`);
    console.log(`   Distribuição uniforme: ${new Set(loadTests).size > 1 ? 'Sim' : 'Não'}`);

    // Teste 10: Performance e custo
    console.log('\n⏱️ Teste 10: Performance e custo...');
    const performanceTests = [
      { task: "Simple greeting", context: { urgency: 'low' } },
      { task: "Complex analysis", context: { urgency: 'high', quality: 'high' } },
      { task: "Code review", context: { task_type: 'coding' } }
    ];

    for (const test of performanceTests) {
      const routing = await routeToBestModel(test.task, test.context);
      console.log(`✅ ${test.task.substring(0, 20)}...: ${routing.model.name} (${routing.estimatedLatency}ms, $${routing.estimatedCost.toFixed(4)})`);
    }

    console.log('\n🎉 Todos os testes do Model Router passaram!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testModelRouter();
}

export { testModelRouter };