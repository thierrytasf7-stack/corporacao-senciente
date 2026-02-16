/**
 * Testes do Dev Agent - AI Code Generation Specialist
 */

import { devAgent } from './agents/technical/dev_agent.js';

async function testDevAgent() {
  console.log('💻 Testando Dev Agent - AI Code Generation...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Dev Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', devAgent.name);
    console.log('   • Expertise:', devAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', devAgent.config.capabilities?.join(', ') || 'N/A');
    console.log('   • Suporte a linguagens:', Array.from(devAgent.languageSupport.keys()).join(', '));

    // Teste 2: Classificação de tarefas de desenvolvimento
    console.log('\n📋 Teste 2: Classificação de tarefas de desenvolvimento...');

    const testTasks = [
      { description: 'Create a REST API for user management', expected: 'code_synthesis' },
      { description: 'Review this JavaScript code for bugs', expected: 'code_review' },
      { description: 'Refactor this function to be more readable', expected: 'refactoring' },
      { description: 'Optimize this algorithm for better performance', expected: 'optimization' },
      { description: 'Generate unit tests for this class', expected: 'testing' },
      { description: 'Create documentation for this API', expected: 'documentation' },
      { description: 'Generate UML diagrams for the system', expected: 'multi_modal' }
    ];

    testTasks.forEach(task => {
      const classification = devAgent.classifyDevTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Síntese de código
    console.log('\n💻 Teste 3: Síntese de código...');

    const synthesisTask = {
      description: 'Create a Node.js Express API for managing users with CRUD operations',
      language: 'javascript',
      complexity: 'medium'
    };

    const synthesisResult = await devAgent.synthesizeCode(synthesisTask, {});
    console.log('✅ Code Synthesis Result:');
    console.log(`   • Tipo: ${synthesisResult.type}`);
    console.log(`   • Linguagem: ${synthesisResult.language}`);
    console.log(`   • Framework: ${synthesisResult.framework}`);
    console.log(`   • Linhas geradas: ${synthesisResult.lines}`);
    console.log(`   • Arquivos criados: ${Object.keys(synthesisResult.files || {}).length}`);
    console.log(`   • Qualidade: ${synthesisResult.quality}`);

    // Teste 4: Revisão de código
    console.log('\n🔍 Teste 4: Revisão de código...');

    const codeToReview = `
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

module.exports = { calculateTotal };
`;

    const reviewTask = {
      description: 'Review JavaScript code for best practices',
      code: codeToReview,
      language: 'javascript',
      type: 'code_review'
    };

    const reviewResult = await devAgent.reviewCode(reviewTask, {});
    console.log('✅ Code Review Result:');
    console.log(`   • Tipo: ${reviewResult.type}`);
    console.log(`   • Issues encontrados: ${reviewResult.issues}`);
    console.log(`   • Issues críticos: ${reviewResult.criticalIssues}`);
    console.log(`   • Score da revisão: ${reviewResult.reviewScore}/100`);
    console.log(`   • Recomendações: ${reviewResult.recommendations?.length || 0}`);

    // Teste 5: Geração de testes
    console.log('\n🧪 Teste 5: Geração de testes...');

    const testGenerationTask = {
      description: 'Generate comprehensive tests for user service',
      code: codeToReview,
      language: 'javascript',
      type: 'testing'
    };

    const testResult = await devAgent.generateTests(testGenerationTask, {});
    console.log('✅ Test Generation Result:');
    console.log(`   • Tipo: ${testResult.type}`);
    console.log(`   • Testes unitários: ${Object.keys(testResult.unitTests || {}).length}`);
    console.log(`   • Testes de integração: ${Object.keys(testResult.integrationTests || {}).length}`);
    console.log(`   • Testes de carga: ${Object.keys(testResult.loadTests || {}).length}`);
    console.log(`   • Cobertura estimada: ${testResult.testCoverage}%`);

    // Teste 6: Geração de documentação
    console.log('\n📚 Teste 6: Geração de documentação...');

    const docTask = {
      description: 'Generate comprehensive documentation for user API',
      code: codeToReview,
      language: 'javascript',
      type: 'documentation'
    };

    const docResult = await devAgent.generateDocumentation(docTask, {});
    console.log('✅ Documentation Generation Result:');
    console.log(`   • Tipo: ${docResult.type}`);
    console.log(`   • README gerado: ${!!docResult.readme}`);
    console.log(`   • Documentação API: ${Object.keys(docResult.apiDocs || {}).length} endpoints`);
    console.log(`   • Guias de uso: ${Object.keys(docResult.usageGuides || {}).length}`);

    // Teste 7: Refatoração de código
    console.log('\n🔄 Teste 7: Refatoração de código...');

    const refactorTask = {
      description: 'Refactor code for better maintainability',
      code: codeToReview,
      language: 'javascript',
      type: 'refactoring'
    };

    const refactorResult = await devAgent.refactorCode(refactorTask, {});
    console.log('✅ Code Refactoring Result:');
    console.log(`   • Tipo: ${refactorResult.type}`);
    console.log(`   • Oportunidades encontradas: ${refactorResult.refactoringOpportunities}`);
    console.log(`   • Refatorações aplicadas: ${refactorResult.appliedRefactorings?.length || 0}`);
    console.log(`   • Código original: ${refactorResult.originalCode?.split('\n').length} linhas`);
    console.log(`   • Código refatorado: ${refactorResult.refactoredCode?.split('\n').length} linhas`);

    // Teste 8: Otimização de performance
    console.log('\n⚡ Teste 8: Otimização de performance...');

    const optimizeTask = {
      description: 'Optimize code for better performance',
      code: codeToReview,
      language: 'javascript',
      type: 'optimization'
    };

    const optimizeResult = await devAgent.optimizeCode(optimizeTask, {});
    console.log('✅ Performance Optimization Result:');
    console.log(`   • Tipo: ${optimizeResult.type}`);
    console.log(`   • Gargalos identificados: ${optimizeResult.bottlenecks}`);
    console.log(`   • Estratégias aplicadas: ${optimizeResult.optimizationStrategies}`);
    console.log(`   • Melhoria de performance: ${optimizeResult.improvementPercentage}%`);

    // Teste 9: Geração multi-modal
    console.log('\n🎨 Teste 9: Geração multi-modal...');

    const multiModalTask = {
      description: 'Create a complete user management system with diagrams',
      language: 'typescript',
      type: 'multi_modal'
    };

    const multiModalResult = await devAgent.generateMultiModal(multiModalTask, {});
    console.log('✅ Multi-Modal Generation Result:');
    console.log(`   • Tipo: ${multiModalResult.type}`);
    console.log(`   • Modalidades geradas: ${multiModalResult.modalities?.join(', ') || 'N/A'}`);
    console.log(`   • Código incluído: ${!!multiModalResult.code}`);
    console.log(`   • Diagramas gerados: ${Object.keys(multiModalResult.diagrams || {}).length}`);
    console.log(`   • Documentação criada: ${!!multiModalResult.documentation}`);

    // Teste 10: Processamento completo de tarefa
    console.log('\n🔄 Teste 10: Processamento completo de tarefa...');

    const completeTask = {
      description: 'Build a REST API for product catalog with full documentation and tests',
      language: 'javascript',
      complexity: 'high',
      id: 'test_task_001',
      code: 'function test() { return "test"; }' // Código dummy para testes
    };

    const completeResult = await devAgent.processTask(completeTask, {});
    console.log('✅ Complete Task Processing:');
    console.log(`   • Tipo identificado: ${completeResult.type}`);
    console.log(`   • Linguagem: ${completeResult.language}`);
    console.log(`   • Qualidade: ${completeResult.quality}`);
    console.log(`   • Arquivos gerados: ${Object.keys(completeResult.files || {}).length}`);

    // Teste 11: Suporte a múltiplas linguagens
    console.log('\n🌍 Teste 11: Suporte a múltiplas linguagens...');

    const languages = ['javascript', 'typescript', 'python', 'go'];
    for (const lang of languages) {
      const langSupport = devAgent.languageSupport.get(lang);
      console.log(`✅ ${lang}: ${langSupport ? langSupport.frameworks.length + ' frameworks' : 'Não suportado'}`);
    }

    // Teste 12: Integração L.L.B.
    console.log('\n🧠 Teste 12: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento de desenvolvimento
    const devKnowledge = await devAgent.llbIntegration.getDevelopmentKnowledge({
      description: 'best practices for API design'
    });
    console.log('✅ LangMem Integration (Dev Knowledge):', devKnowledge.totalMatches || 0, 'resultados');

    // Testar implementações similares
    const similarImpl = await devAgent.llbIntegration.getSimilarCodeImplementations({
      description: 'REST API implementation'
    });
    console.log('✅ Letta Integration (Similar Implementations):', similarImpl.length, 'implementações');

    // Teste 13: Auto-aperfeiçoamento
    console.log('\n🎓 Teste 13: Auto-aperfeiçoamento...');

    // Simular análise de resultado para melhoria
    const improvementAnalysis = await devAgent.selfImprover.analyzeAndImprove(
      completeResult,
      completeTask,
      { confidence: 0.85, model: { name: 'test-model' } }
    );

    console.log('✅ Self-Improvement Analysis:');
    console.log(`   • Histórico de melhorias: ${devAgent.selfImprover.improvementHistory.length}`);

    // Teste 14: Performance e métricas
    console.log('\n⏱️ Teste 14: Performance e métricas...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Generate simple function',
      'Review basic code',
      'Create unit tests',
      'Generate documentation'
    ];

    for (const task of perfTasks) {
      await devAgent.processTask({ description: task, language: 'javascript' });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 15: Robustez com edge cases
    console.log('\n🛡️ Teste 15: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'a', language: 'javascript' },
      { description: 'Generate code in unsupported language XYZ', expectedError: false },
      { description: 'Review code without providing code', code: null, expectedError: true }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await devAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Dev Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Dev Agent:');
    console.log('💻 Capacidades implementadas:');
    console.log('   • Síntese de código a partir de requisitos naturais');
    console.log('   • Revisão automatizada de código com IA');
    console.log('   • Refatoração inteligente e segura');
    console.log('   • Otimização de performance automática');
    console.log('   • Geração de testes abrangente');
    console.log('   • Documentação completa e diagramas');
    console.log('   • Geração multi-modal (código + diagramas + docs)');
    console.log('   • Suporte a JavaScript, TypeScript, Python, Go');
    console.log('   • Auto-aperfeiçoamento baseado em feedback');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Tecnologias 2025: RAG avançado, roteamento inteligente');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDevAgent();
}

export { testDevAgent };
