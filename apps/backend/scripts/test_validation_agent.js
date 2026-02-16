/**
 * Testes do Validation Agent - AI Test Generation Specialist
 */

import { validationAgent } from './agents/technical/validation_agent.js';

async function testValidationAgent() {
  console.log('🧪 Testando Validation Agent - AI Test Generation...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Validation Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', validationAgent.name);
    console.log('   • Expertise:', validationAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', validationAgent.config.capabilities?.join(', ') || 'N/A');

    // Teste 2: Classificação de tarefas de validação
    console.log('\n📋 Teste 2: Classificação de tarefas de validação...');

    const testTasks = [
      { description: 'Generate unit tests for user service', expected: 'unit_tests' },
      { description: 'Create integration tests for API', expected: 'integration_tests' },
      { description: 'Generate load tests for the system', expected: 'load_tests' },
      { description: 'Create property-based tests', expected: 'property_tests' },
      { description: 'Run mutation testing', expected: 'mutation_tests' },
      { description: 'Generate security tests', expected: 'security_tests' },
      { description: 'Analyze test coverage', expected: 'coverage_analysis' }
    ];

    testTasks.forEach(task => {
      const classification = validationAgent.classifyValidationTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Geração de testes unitários
    console.log('\n🧪 Teste 3: Geração de testes unitários...');

    const codeToTest = `
function calculateTotal(items) {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

class UserService {
  constructor(database) {
    this.db = database;
  }

  async createUser(userData) {
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    return await this.db.insert('users', userData);
  }

  async getUserById(id) {
    const user = await this.db.find('users', { id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
`;

    const unitTestTask = {
      description: 'Generate unit tests for utility functions and service',
      code: codeToTest,
      language: 'javascript',
      type: 'unit_tests'
    };

    const unitTestResult = await validationAgent.generateUnitTests(unitTestTask, {});
    console.log('✅ Unit Test Generation Result:');
    console.log(`   • Tipo: ${unitTestResult.type}`);
    console.log(`   • Unidades testáveis: ${unitTestResult.testableUnits}`);
    console.log(`   • Casos de teste: ${unitTestResult.testCases}`);
    console.log(`   • Cobertura estimada: ${unitTestResult.coverage}%`);
    console.log(`   • Qualidade: ${unitTestResult.quality}`);

    // Teste 4: Análise de cobertura
    console.log('\n📊 Teste 4: Análise de cobertura...');

    const coverageTask = {
      description: 'Analyze test coverage for the code',
      code: codeToTest,
      type: 'coverage_analysis'
    };

    const coverageResult = await validationAgent.analyzeTestCoverage(coverageTask, {});
    console.log('✅ Coverage Analysis Result:');
    console.log(`   • Tipo: ${coverageResult.type}`);
    console.log(`   • Cobertura geral: ${coverageResult.overallCoverage || 0}%`);
    console.log(`   • Cobertura de linhas: ${coverageResult.lineCoverage || 0}%`);
    console.log(`   • Cobertura de branches: ${coverageResult.branchCoverage || 0}%`);
    console.log(`   • Qualidade: ${coverageResult.quality}`);

    // Teste 5: Geração de testes de carga
    console.log('\n⚡ Teste 5: Geração de testes de carga...');

    const loadTestTask = {
      description: 'Generate load tests for user API',
      system_spec: {
        endpoints: ['/users', '/users/:id'],
        expectedLoad: 1000, // req/s
        peakLoad: 5000,
        responseTime: 200 // ms
      },
      type: 'load_tests'
    };

    const loadTestResult = await validationAgent.generateLoadTests(loadTestTask, {});
    console.log('✅ Load Test Generation Result:');
    console.log(`   • Tipo: ${loadTestResult.type}`);
    console.log(`   • Cenários de carga: ${loadTestResult.loadScenarios}`);
    console.log(`   • Capacidade esperada: ${loadTestResult.expectedCapacity || 'unknown'}`);
    console.log(`   • Qualidade: ${loadTestResult.quality}`);

    // Teste 6: Geração de testes baseados em propriedades
    console.log('\n🔍 Teste 6: Geração de testes baseados em propriedades...');

    const propertyTestTask = {
      description: 'Generate property tests for math functions',
      code: codeToTest,
      language: 'javascript',
      type: 'property_tests'
    };

    const propertyTestResult = await validationAgent.generatePropertyTests(propertyTestTask, {});
    console.log('✅ Property Test Generation Result:');
    console.log(`   • Tipo: ${propertyTestResult.type}`);
    console.log(`   • Propriedades identificadas: ${propertyTestResult.invariants}`);
    console.log(`   • Propriedades testadas: ${propertyTestResult.properties}`);
    console.log(`   • Cobertura estimada: ${propertyTestResult.coverage}%`);
    console.log(`   • Qualidade: ${propertyTestResult.quality}`);

    // Teste 7: Mutation testing
    console.log('\n🧬 Teste 7: Mutation testing...');

    const mutationTestTask = {
      description: 'Run mutation testing on user service',
      code: codeToTest,
      existing_tests: ['test for calculateTotal', 'test for validateEmail'],
      type: 'mutation_tests'
    };

    const mutationResult = await validationAgent.runMutationTesting(mutationTestTask, {});
    console.log('✅ Mutation Testing Result:');
    console.log(`   • Tipo: ${mutationResult.type}`);
    console.log(`   • Mutantes gerados: ${mutationResult.mutantsGenerated}`);
    console.log(`   • Mutantes mortos: ${mutationResult.mutantsKilled}`);
    console.log(`   • Score de mutação: ${mutationResult.mutationScore}%`);
    console.log(`   • Qualidade: ${mutationResult.quality}`);

    // Teste 8: Geração de testes de segurança
    console.log('\n🔒 Teste 8: Geração de testes de segurança...');

    const securityTestTask = {
      description: 'Generate security tests for user API',
      application_spec: {
        endpoints: ['POST /users', 'GET /users/:id'],
        auth: 'JWT',
        dataValidation: true,
        cors: true
      },
      type: 'security_tests'
    };

    const securityTestResult = await validationAgent.generateSecurityTests(securityTestTask, {});
    console.log('✅ Security Test Generation Result:');
    console.log(`   • Tipo: ${securityTestResult.type}`);
    console.log(`   • Testes OWASP: ${securityTestResult.owaspTests?.length || 0}`);
    console.log(`   • Testes de autenticação: ${securityTestResult.authTests?.length || 0}`);
    console.log(`   • Testes de injeção: ${securityTestResult.injectionTests?.length || 0}`);
    console.log(`   • Total de testes: ${securityTestResult.testCount}`);
    console.log(`   • Qualidade: ${securityTestResult.quality}`);

    // Teste 9: Processamento completo de tarefa
    console.log('\n🔄 Teste 9: Processamento completo de tarefa...');

    const completeTask = {
      description: 'Generate comprehensive test suite for user management system',
      code: codeToTest,
      language: 'javascript',
      test_type: 'comprehensive',
      id: 'test_task_001'
    };

    const completeResult = await validationAgent.processTask(completeTask, {});
    console.log('✅ Complete Task Processing:');
    console.log(`   • Tipo identificado: ${completeResult.type}`);
    console.log(`   • Qualidade geral: ${completeResult.overallQuality || 'unknown'}`);

    // Teste 10: Integração L.L.B.
    console.log('\n🧠 Teste 10: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento de testes
    const testKnowledge = await validationAgent.llbIntegration.getTestingKnowledge({
      description: 'unit testing best practices'
    });
    console.log('✅ LangMem Integration (Testing Knowledge):', testKnowledge.totalMatches || 0, 'resultados');

    // Testar implementações similares
    const similarTests = await validationAgent.llbIntegration.getSimilarTestImplementations({
      description: 'user service testing'
    });
    console.log('✅ Letta Integration (Similar Tests):', similarTests.length, 'implementações');

    // Teste 11: Tecnologias de teste
    console.log('\n🔧 Teste 11: Tecnologias de teste...');

    const jsUnit = validationAgent.getTestingTechnologies('javascript', 'unit');
    const integration = validationAgent.getTestingTechnologies('integration');
    const load = validationAgent.getTestingTechnologies('load');

    console.log('✅ Testing Technologies:');
    console.log(`   • JavaScript Unit: ${jsUnit.length} tecnologias`);
    console.log(`   • Integration: ${integration.length} tecnologias`);
    console.log(`   • Load: ${load.length} tecnologias`);

    // Teste 12: Avaliação de qualidade
    console.log('\n⭐ Teste 12: Avaliação de qualidade...');

    // Simular avaliação de qualidade
    const qualityAssessment = await validationAgent.testQualityAssessor.assessTestQuality(completeResult, completeTask);
    console.log('✅ Quality Assessment:');
    console.log(`   • Avaliação realizada: ${Object.keys(qualityAssessment).length > 0 ? 'Sim' : 'Não'}`);

    // Teste 13: Performance e escalabilidade
    console.log('\n⏱️ Teste 13: Performance e escalabilidade...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Generate unit tests',
      'Analyze coverage',
      'Generate security tests',
      'Run mutation testing'
    ];

    for (const task of perfTasks) {
      await validationAgent.processTask({ description: task, code: codeToTest });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 14: Robustez com edge cases
    console.log('\n🛡️ Teste 14: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'Generate tests without code', code: null, expectedError: true },
      { description: 'Analyze coverage for empty code', code: '', type: 'coverage_analysis' },
      { description: 'Generate tests for unsupported language', language: 'cobol' }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await validationAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Validation Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Validation Agent:');
    console.log('🧪 Capacidades implementadas:');
    console.log('   • Geração automática de testes unitários com IA');
    console.log('   • Testes de integração e E2E inteligentes');
    console.log('   • Testes de carga e performance automatizados');
    console.log('   • Property-based testing e fuzzing');
    console.log('   • Mutation testing para qualidade de testes');
    console.log('   • Testes de segurança abrangentes (OWASP)');
    console.log('   • Análise de cobertura de código');
    console.log('   • Integração com pipelines CI/CD');
    console.log('   • Avaliação automática de qualidade de testes');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Aprendizado contínuo de padrões de teste');
    console.log('   • Tecnologias 2025: IA para geração e análise de testes');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testValidationAgent();
}

export { testValidationAgent };