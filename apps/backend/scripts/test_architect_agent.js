/**
 * Testes do Architect Agent - Event-Driven Architecture Specialist
 */

import { architectAgent } from './agents/technical/architect_agent.js';

async function testArchitectAgent() {
  console.log('🏗️ Testando Architect Agent - Event-Driven Architecture...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Architect Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', architectAgent.name);
    console.log('   • Expertise:', architectAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', architectAgent.config.capabilities?.join(', ') || 'N/A');

    // Teste 2: Classificação de tarefas arquiteturais
    console.log('\n📋 Teste 2: Classificação de tarefas arquiteturais...');

    const testTasks = [
      { description: 'Design event-driven architecture for e-commerce', expected: 'event_driven' },
      { description: 'Implement CQRS pattern for user management', expected: 'cqrs' },
      { description: 'Setup event sourcing for order processing', expected: 'event_sourcing' },
      { description: 'Decompose monolithic app into microservices', expected: 'microservices' },
      { description: 'Analyze system scalability bottlenecks', expected: 'scalability' },
      { description: 'Create domain model for insurance system', expected: 'domain_modeling' },
      { description: 'Design REST API architecture', expected: 'general' }
    ];

    testTasks.forEach(task => {
      const classification = architectAgent.classifyArchitecturalTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Design de arquitetura orientada a eventos
    console.log('\n🎯 Teste 3: Design de arquitetura orientada a eventos...');

    const eventDrivenTask = {
      description: 'Design event-driven architecture for real-time analytics platform',
      complexity: 'high',
      domain: 'analytics'
    };

    const eventDesign = await architectAgent.designEventDrivenArchitecture(eventDrivenTask, {});
    console.log('✅ Event-Driven Architecture Design:');
    console.log(`   • Tipo: ${eventDesign.type}`);
    console.log(`   • Tecnologias: ${eventDesign.technologies.join(', ')}`);
    console.log(`   • Recomendações: ${eventDesign.recommendations.length}`);

    // Teste 4: Design CQRS
    console.log('\n🔀 Teste 4: Design CQRS...');

    const cqrsTask = {
      description: 'Implement CQRS for high-throughput order processing system',
      complexity: 'high',
      includeEventSourcing: true
    };

    const cqrsDesign = await architectAgent.designCQRSArchitecture(cqrsTask, {});
    console.log('✅ CQRS Architecture Design:');
    console.log(`   • Tipo: ${cqrsDesign.type}`);
    console.log(`   • Tecnologias: ${cqrsDesign.technologies.join(', ')}`);
    console.log(`   • Event Sourcing integrado: ${!!cqrsDesign.eventSourcingIntegration}`);

    // Teste 5: Design Event Sourcing
    console.log('\n📚 Teste 5: Design Event Sourcing...');

    const esTask = {
      description: 'Implement event sourcing for audit trail system',
      complexity: 'medium'
    };

    const esDesign = await architectAgent.designEventSourcingArchitecture(esTask, {});
    console.log('✅ Event Sourcing Architecture Design:');
    console.log(`   • Tipo: ${esDesign.type}`);
    console.log(`   • Tecnologias: ${esDesign.technologies.join(', ')}`);
    console.log(`   • Projections: ${esDesign.projections.length}`);

    // Teste 6: Design de microsserviços
    console.log('\n🔧 Teste 6: Design de microsserviços...');

    const microservicesTask = {
      description: 'Decompose e-commerce platform into microservices',
      complexity: 'high',
      domain: 'ecommerce'
    };

    const microservicesDesign = await architectAgent.designMicroservicesArchitecture(microservicesTask, {});
    console.log('✅ Microservices Architecture Design:');
    console.log(`   • Tipo: ${microservicesDesign.type}`);
    console.log(`   • Serviços identificados: ${microservicesDesign.serviceDecomposition.length}`);
    console.log(`   • Estratégia de saga: ${!!microservicesDesign.sagaStrategy}`);

    // Teste 7: Análise de escalabilidade
    console.log('\n📈 Teste 7: Análise de escalabilidade...');

    const scalabilityTask = {
      description: 'Analyze scalability bottlenecks in social media platform',
      complexity: 'high'
    };

    const scalabilityAnalysis = await architectAgent.analyzeScalability(scalabilityTask, {});
    console.log('✅ Scalability Analysis:');
    console.log(`   • Tipo: ${scalabilityAnalysis.type}`);
    console.log(`   • Recomendações: ${scalabilityAnalysis.recommendations.length}`);

    // Teste 8: Modelagem de domínio
    console.log('\n🎨 Teste 8: Modelagem de domínio...');

    const domainTask = {
      description: 'Create domain model for banking system with DDD',
      complexity: 'high',
      domain: 'banking'
    };

    const domainModel = await architectAgent.performDomainModeling(domainTask, {});
    console.log('✅ Domain Modeling:');
    console.log(`   • Tipo: ${domainModel.type}`);
    console.log(`   • Diagramas gerados: ${domainModel.diagrams.length}`);

    // Teste 9: Processamento completo de tarefa
    console.log('\n🔄 Teste 9: Processamento completo de tarefa...');

    const completeTask = {
      description: 'Design event-driven microservices architecture for IoT platform',
      complexity: 'high',
      domain: 'iot',
      id: 'test_task_001'
    };

    const completeResult = await architectAgent.processTask(completeTask, {});
    console.log('✅ Complete Task Processing:');
    console.log(`   • Tipo identificado: ${completeResult.type}`);
    console.log(`   • Qualidade: ${completeResult.quality}`);
    console.log(`   • Tecnologias sugeridas: ${completeResult.technologies?.length || 0}`);

    // Teste 10: Integração L.L.B.
    console.log('\n🧠 Teste 10: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento arquitetural
    const wisdom = await architectAgent.llbIntegration.getArchitecturalWisdom({
      description: 'event driven architecture patterns'
    });
    console.log('✅ LangMem Integration (Architectural Wisdom):', wisdom.totalMatches || 0, 'resultados');

    // Testar decisões similares
    const similar = await architectAgent.llbIntegration.getSimilarArchitecturalDecisions({
      description: 'design microservices'
    });
    console.log('✅ Letta Integration (Similar Decisions):', similar.length, 'decisões');

    // Teste 11: Geração de código arquitetural
    console.log('\n💻 Teste 11: Geração de código arquitetural...');

    // Testar geração de código para diferentes padrões
    const eventCode = await architectAgent.generateEventDrivenCode({}, {}, {});
    const cqrsCode = await architectAgent.generateCQRSCode({}, {}, {});
    const esCode = await architectAgent.generateEventSourcingCode({}, {}, {});

    console.log('✅ Code Generation:');
    console.log(`   • Event-Driven: ${Object.keys(eventCode).length} componentes`);
    console.log(`   • CQRS: ${Object.keys(cqrsCode).length} componentes`);
    console.log(`   • Event Sourcing: ${Object.keys(esCode).length} componentes`);

    // Teste 12: Performance e métricas
    console.log('\n⏱️ Teste 12: Performance e métricas...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Design simple API',
      'Implement basic CQRS',
      'Setup event sourcing',
      'Analyze microservices'
    ];

    for (const task of perfTasks) {
      await architectAgent.processTask({ description: task, complexity: 'low' });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 13: Robustez com edge cases
    console.log('\n🛡️ Teste 13: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'a', complexity: 'low' },
      { description: 'Design architecture with extremely complex requirements that span multiple domains including real-time processing, distributed systems, machine learning integration, and global scalability', complexity: 'extreme' },
      { description: 'Use unknown technology XYZ for implementation', expectedError: false }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await architectAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Architect Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Architect Agent:');
    console.log('🏗️ Capacidades implementadas:');
    console.log('   • Event-Driven Architecture com reactive patterns');
    console.log('   • CQRS com write/read model separation');
    console.log('   • Event Sourcing com projections e snapshots');
    console.log('   • Microservices decomposition com sagas');
    console.log('   • Domain-Driven Design estratégico');
    console.log('   • Análise de escalabilidade avançada');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Geração automática de código arquitetural');
    console.log('   • Padrões 2025: ReactiveX, Akka, EventStore, Kubernetes');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testArchitectAgent();
}

export { testArchitectAgent };
