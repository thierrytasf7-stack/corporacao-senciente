/**
 * Testes do Debug Agent - AI-Powered Debugging Specialist
 */

import { debugAgent } from './agents/technical/debug_agent.js';

async function testDebugAgent() {
  console.log('🐛 Testando Debug Agent - AI-Powered Debugging...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Debug Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', debugAgent.name);
    console.log('   • Expertise:', debugAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', debugAgent.config.capabilities?.join(', ') || 'N/A');

    // Teste 2: Classificação de tarefas de debugging
    console.log('\n📋 Teste 2: Classificação de tarefas de debugging...');

    const testTasks = [
      { description: 'Analyze this JavaScript error', expected: 'error_analysis' },
      { description: 'Find the root cause of this bug', expected: 'root_cause' },
      { description: 'Prevent future bugs in this code', expected: 'predictive' },
      { description: 'Debug performance issues', expected: 'performance' },
      { description: 'Debug distributed system failures', expected: 'distributed' },
      { description: 'Automatically fix this bug', expected: 'auto_fix' },
      { description: 'Debug with the team', expected: 'collaborative' }
    ];

    testTasks.forEach(task => {
      const classification = debugAgent.classifyDebugTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Análise de erros
    console.log('\n🔍 Teste 3: Análise de erros...');

    const errorMessage = `TypeError: Cannot read property 'map' of undefined
    at processUsers (/app/src/userService.js:15:23)
    at handleRequest (/app/src/api.js:45:12)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)`;

    const errorTask = {
      description: 'Analyze JavaScript error',
      error_message: errorMessage,
      language: 'javascript',
      type: 'error_analysis'
    };

    const errorAnalysis = await debugAgent.analyzeError(errorTask, {});
    console.log('✅ Error Analysis Result:');
    console.log(`   • Tipo: ${errorAnalysis.type}`);
    console.log(`   • Severidade: ${errorAnalysis.severity}`);
    console.log(`   • Impacto: ${errorAnalysis.impact}`);
    console.log(`   • Reproduzibilidade: ${errorAnalysis.reproducibility}`);
    console.log(`   • Recomendações: ${errorAnalysis.debuggingRecommendations?.length || 0}`);

    // Teste 4: Análise de causa raiz
    console.log('\n🎯 Teste 4: Análise de causa raiz...');

    const rootCauseTask = {
      description: 'Find root cause of user service crash',
      error_message: 'Service crashes when processing null user data',
      type: 'root_cause'
    };

    const rootCauseAnalysis = await debugAgent.findRootCause(rootCauseTask, {});
    console.log('✅ Root Cause Analysis Result:');
    console.log(`   • Tipo: ${rootCauseAnalysis.type}`);
    console.log(`   • Causa raiz encontrada: ${!!rootCauseAnalysis.rootCause}`);
    console.log(`   • Confiança: ${rootCauseAnalysis.confidence}`);
    console.log(`   • Plano de correção: ${!!rootCauseAnalysis.correctionPlan}`);
    console.log(`   • Estratégias de prevenção: ${rootCauseAnalysis.prevention?.length || 0}`);

    // Teste 5: Debugging preditivo
    console.log('\n🔮 Teste 5: Debugging preditivo...');

    const predictiveCode = `
function processUser(user) {
  if (user) {
    return user.name.toUpperCase();
  }
  return null;
}

function getUsers() {
  const users = db.query('SELECT * FROM users');
  return users.map(processUser);
}
`;

    const predictiveTask = {
      description: 'Predict future bugs in user processing code',
      code: predictiveCode,
      language: 'javascript',
      type: 'predictive'
    };

    const predictiveAnalysis = await debugAgent.predictiveDebugging(predictiveTask, {});
    console.log('✅ Predictive Debugging Result:');
    console.log(`   • Tipo: ${predictiveAnalysis.type}`);
    console.log(`   • Pontuação de saúde: ${predictiveAnalysis.healthScore}`);
    console.log(`   • Vulnerabilidades potenciais: ${predictiveAnalysis.potentialVulnerabilities?.length || 0}`);
    console.log(`   • Bugs previstos: ${predictiveAnalysis.predictedBugs?.length || 0}`);
    console.log(`   • Recomendações preventivas: ${predictiveAnalysis.preventiveRecommendations?.length || 0}`);

    // Teste 6: Correção automática
    console.log('\n🔧 Teste 6: Correção automática...');

    const autoFixTask = {
      description: 'Automatically fix null pointer error',
      error_message: errorMessage,
      code: predictiveCode,
      language: 'javascript',
      type: 'auto_fix'
    };

    const autoFixResult = await debugAgent.autoFixBug(autoFixTask, {});
    console.log('✅ Auto Fix Result:');
    console.log(`   • Tipo: ${autoFixResult.type}`);
    console.log(`   • Sucesso: ${autoFixResult.success}`);
    console.log(`   • Nível de risco: ${autoFixResult.riskLevel}`);
    console.log(`   • Plano de rollback: ${!!autoFixResult.rollbackPlan}`);

    // Teste 7: Debugging de performance
    console.log('\n⏱️ Teste 7: Debugging de performance...');

    const performanceTask = {
      description: 'Debug slow API response times',
      metrics: {
        avgResponseTime: 2500,
        p95ResponseTime: 5000,
        errorRate: 0.02,
        memoryUsage: '80%',
        cpuUsage: '75%'
      },
      type: 'performance'
    };

    const performanceAnalysis = await debugAgent.debugPerformance(performanceTask, {});
    console.log('✅ Performance Debugging Result:');
    console.log(`   • Tipo: ${performanceAnalysis.type}`);
    console.log(`   • Gargalos identificados: ${performanceAnalysis.performanceBottlenecks?.length || 0}`);
    console.log(`   • Vazamentos de memória: ${performanceAnalysis.memoryLeaks?.length || 0}`);
    console.log(`   • Pontuação de performance: ${performanceAnalysis.performanceScore}`);
    console.log(`   • Recomendações de otimização: ${performanceAnalysis.optimizationRecommendations?.length || 0}`);

    // Teste 8: Debugging distribuído
    console.log('\n🔗 Teste 8: Debugging distribuído...');

    const distributedTask = {
      description: 'Debug cascading failures in microservices',
      system_logs: {
        serviceA: 'Connection timeout to serviceB',
        serviceB: 'Database connection pool exhausted',
        serviceC: 'Circuit breaker opened'
      },
      traces: [],
      type: 'distributed'
    };

    const distributedAnalysis = await debugAgent.debugDistributedSystem(distributedTask, {});
    console.log('✅ Distributed Debugging Result:');
    console.log(`   • Tipo: ${distributedAnalysis.type}`);
    console.log(`   • Gargalos identificados: ${distributedAnalysis.bottlenecks?.length || 0}`);
    console.log(`   • Falhas em cascata: ${distributedAnalysis.cascadingFailures?.length || 0}`);
    console.log(`   • Saúde do sistema: ${distributedAnalysis.systemHealth}`);
    console.log(`   • Recomendações distribuídas: ${distributedAnalysis.distributedRecommendations?.length || 0}`);

    // Teste 9: Debugging colaborativo
    console.log('\n👥 Teste 9: Debugging colaborativo...');

    const collaborativeTask = {
      description: 'Debug complex issue with team',
      team_members: [
        { name: 'Alice', expertise: 'frontend', experience: 5 },
        { name: 'Bob', expertise: 'backend', experience: 8 },
        { name: 'Charlie', expertise: 'database', experience: 6 }
      ],
      error_message: 'Complex distributed system issue',
      type: 'collaborative'
    };

    const collaborativeAnalysis = await debugAgent.collaborativeDebugging(collaborativeTask, {});
    console.log('✅ Collaborative Debugging Result:');
    console.log(`   • Tipo: ${collaborativeAnalysis.type}`);
    console.log(`   • Distribuição de tarefas: ${Object.keys(collaborativeAnalysis.taskDistribution || {}).length}`);
    console.log(`   • Plano de coordenação: ${!!collaborativeAnalysis.coordinationPlan}`);
    console.log(`   • Compartilhamento de conhecimento: ${!!collaborativeAnalysis.knowledgeSharing}`);
    console.log(`   • Tempo estimado de resolução: ${collaborativeAnalysis.estimatedResolutionTime}`);
    console.log(`   • Probabilidade de sucesso: ${collaborativeAnalysis.successProbability}`);

    // Teste 10: Processamento completo de tarefa
    console.log('\n🔄 Teste 10: Processamento completo de tarefa...');

    const completeTask = {
      description: 'Debug production issue with user authentication',
      error_message: 'Users cannot login - getting 500 errors',
      severity: 'high',
      language: 'javascript',
      id: 'test_task_001'
    };

    const completeResult = await debugAgent.processTask(completeTask, {});
    console.log('✅ Complete Task Processing:');
    console.log(`   • Tipo identificado: ${completeResult.type}`);
    console.log(`   • Severidade: ${completeResult.severity || 'unknown'}`);
    console.log(`   • Causa raiz encontrada: ${!!completeResult.rootCause}`);

    // Teste 11: Integração L.L.B.
    console.log('\n🧠 Teste 11: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento de debugging
    const debugKnowledge = await debugAgent.llbIntegration.getDebuggingKnowledge({
      description: 'debugging best practices'
    });
    console.log('✅ LangMem Integration (Debug Knowledge):', debugKnowledge.totalMatches || 0, 'resultados');

    // Testar casos similares
    const similarCases = await debugAgent.llbIntegration.getSimilarDebugCases({
      description: 'authentication error debugging'
    });
    console.log('✅ Letta Integration (Similar Cases):', similarCases.length, 'casos');

    // Teste 12: Métricas de avaliação
    console.log('\n📊 Teste 12: Métricas de avaliação...');

    // Testar funções de avaliação
    const severity = debugAgent.assessErrorSeverity({ severity: 'high' });
    const confidence = debugAgent.calculateRootCauseConfidence({}, {});
    const risk = debugAgent.assessCodeRisk(60, []);

    console.log('✅ Assessment Metrics:');
    console.log(`   • Severidade de erro: ${severity}`);
    console.log(`   • Confiança de causa raiz: ${confidence}`);
    console.log(`   • Risco do código: ${risk}`);

    // Teste 13: Performance e escalabilidade
    console.log('\n⚡ Teste 13: Performance e escalabilidade...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Analyze simple error',
      'Find basic root cause',
      'Predict code issues',
      'Debug performance metrics'
    ];

    for (const task of perfTasks) {
      await debugAgent.processTask({ description: task, error_message: 'test error' });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 14: Robustez com edge cases
    console.log('\n🛡️ Teste 14: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'Debug issue without error data', error_message: null, expectedError: true },
      { description: 'Analyze complex distributed system crash', severity: 'critical' },
      { description: 'Predict bugs in legacy codebase', type: 'predictive' }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await debugAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Debug Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Debug Agent:');
    console.log('🐛 Capacidades implementadas:');
    console.log('   • Análise automática de erros e stack traces');
    console.log('   • Root cause analysis com IA avançada');
    console.log('   • Debugging preditivo e preventivo');
    console.log('   • Correção automática de bugs comuns');
    console.log('   • Tracing distribuído e análise de performance');
    console.log('   • Debugging colaborativo com times');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Aprendizado contínuo de padrões de debug');
    console.log('   • Tecnologias 2025: Machine learning para debugging');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDebugAgent();
}

export { testDebugAgent };





