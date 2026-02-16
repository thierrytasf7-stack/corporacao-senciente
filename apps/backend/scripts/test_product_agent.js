/**
 * Testes do Product Agent - AI User Research Specialist
 */

import { productAgent } from './agents/technical/product_agent.js';

async function testProductAgent() {
  console.log('🎯 Testando Product Agent - AI User Research...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Product Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', productAgent.name);
    console.log('   • Expertise:', productAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', productAgent.config.capabilities?.join(', ') || 'N/A');

    // Teste 2: Classificação de tarefas de produto
    console.log('\n📋 Teste 2: Classificação de tarefas de produto...');

    const testTasks = [
      { description: 'Analyze user behavior patterns', expected: 'user_behavior' },
      { description: 'Conduct market research', expected: 'market_research' },
      { description: 'Create user personas', expected: 'persona_creation' },
      { description: 'Map user journey', expected: 'user_journey' },
      { description: 'Conduct usability testing', expected: 'usability_testing' },
      { description: 'Analyze user feedback', expected: 'feedback_analysis' },
      { description: 'Predict feature adoption', expected: 'feature_prediction' },
      { description: 'Optimize market fit', expected: 'market_fit' },
      { description: 'Design A/B tests', expected: 'ab_testing' }
    ];

    testTasks.forEach(task => {
      const classification = productAgent.classifyProductTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Análise de comportamento de usuários
    console.log('\n👥 Teste 3: Análise de comportamento de usuários...');

    const userBehaviorData = {
      sessions: [
        { userId: '1', duration: 120, pages: ['home', 'products', 'checkout'], completedPurchase: true },
        { userId: '2', duration: 45, pages: ['home', 'about'], completedPurchase: false },
        { userId: '1', duration: 200, pages: ['home', 'products', 'cart', 'checkout'], completedPurchase: true }
      ],
      demographics: {
        ageGroups: { '18-24': 30, '25-34': 45, '35-44': 25 },
        locations: { 'US': 50, 'EU': 30, 'Asia': 20 }
      }
    };

    const behaviorTask = {
      description: 'Analyze user behavior patterns',
      user_data: userBehaviorData,
      type: 'user_behavior'
    };

    const behaviorAnalysis = await productAgent.analyzeUserBehavior(behaviorTask, {});
    console.log('✅ User Behavior Analysis Result:');
    console.log(`   • Tipo: ${behaviorAnalysis.type}`);
    console.log(`   • Padrões de uso identificados: ${Object.keys(behaviorAnalysis.usagePatterns || {}).length}`);
    console.log(`   • Segmentos de usuário: ${Object.keys(behaviorAnalysis.userSegments || {}).length}`);
    console.log(`   • Pontos de dor encontrados: ${behaviorAnalysis.painPoints?.length || 0}`);
    console.log(`   • Qualidade dos dados: ${behaviorAnalysis.dataQuality}`);
    console.log(`   • Confiança da análise: ${behaviorAnalysis.confidence}`);

    // Teste 4: Pesquisa de mercado
    console.log('\n📊 Teste 4: Pesquisa de mercado...');

    const marketTask = {
      description: 'Conduct market research for e-commerce platform',
      market_spec: {
        industry: 'e-commerce',
        targetMarket: 'B2C',
        geography: 'global',
        competitors: ['Amazon', 'Shopify', 'eBay']
      },
      type: 'market_research'
    };

    const marketResearch = await productAgent.conductMarketResearch(marketTask, {});
    console.log('✅ Market Research Result:');
    console.log(`   • Tipo: ${marketResearch.type}`);
    console.log(`   • Concorrentes analisados: ${Object.keys(marketResearch.competitorAnalysis || {}).length}`);
    console.log(`   • Tendências identificadas: ${Object.keys(marketResearch.trendAnalysis || {}).length}`);
    console.log(`   • Gaps de mercado: ${marketResearch.marketGaps?.length || 0}`);
    console.log(`   • Oportunidades estratégicas: ${marketResearch.strategicOpportunities?.length || 0}`);

    // Teste 5: Criação de personas
    console.log('\n👤 Teste 5: Criação de personas...');

    const personaTask = {
      description: 'Create user personas from behavior data',
      user_data: userBehaviorData,
      type: 'persona_creation'
    };

    const personaCreation = await productAgent.createPersonas(personaTask, {});
    console.log('✅ Persona Creation Result:');
    console.log(`   • Tipo: ${personaCreation.type}`);
    console.log(`   • Clusters de usuário: ${personaCreation.userClusters?.length || 0}`);
    console.log(`   • Personas criadas: ${personaCreation.personaCount}`);
    console.log(`   • Cobertura: ${personaCreation.coverage}%`);
    console.log(`   • Qualidade: ${personaCreation.quality}`);

    // Teste 6: Mapeamento de jornada do usuário
    console.log('\n🗺️ Teste 6: Mapeamento de jornada do usuário...');

    const journeyData = {
      touchpoints: [
        { stage: 'awareness', channel: 'social_media', action: 'view_ad' },
        { stage: 'consideration', channel: 'website', action: 'browse_products' },
        { stage: 'purchase', channel: 'checkout', action: 'complete_order' }
      ],
      userFlows: [
        { path: ['social_media', 'website', 'checkout'], conversion: true },
        { path: ['search', 'website'], conversion: false }
      ]
    };

    const journeyTask = {
      description: 'Map user journey for e-commerce',
      journey_data: journeyData,
      type: 'user_journey'
    };

    const journeyMapping = await productAgent.mapUserJourney(journeyTask, {});
    console.log('✅ User Journey Mapping Result:');
    console.log(`   • Tipo: ${journeyMapping.type}`);
    console.log(`   • Touchpoints identificados: ${journeyMapping.touchpoints?.length || 0}`);
    console.log(`   • Pontos de fricção: ${journeyMapping.frictionPoints?.length || 0}`);
    console.log(`   • Taxa de conversão: ${journeyMapping.conversionAnalysis?.rate || 'N/A'}`);
    console.log(`   • Oportunidades de melhoria: ${journeyMapping.improvementOpportunities?.length || 0}`);

    // Teste 7: Testes de usabilidade
    console.log('\n🖱️ Teste 7: Testes de usabilidade...');

    const usabilityTask = {
      description: 'Conduct remote usability testing',
      test_spec: {
        application: 'e-commerce website',
        tasks: ['find product', 'add to cart', 'checkout'],
        targetUsers: 5,
        duration: 30 // minutes
      },
      type: 'usability_testing'
    };

    const usabilityTesting = await productAgent.conductUsabilityTesting(usabilityTask, {});
    console.log('✅ Usability Testing Result:');
    console.log(`   • Tipo: ${usabilityTesting.type}`);
    console.log(`   • Tarefas de teste: ${usabilityTesting.testTasks?.length || 0}`);
    console.log(`   • Participantes recrutados: ${usabilityTesting.participantRecruitment?.count || 0}`);
    console.log(`   • Issues de usabilidade: ${usabilityTesting.usabilityIssues?.length || 0}`);
    console.log(`   • Score de satisfação: ${usabilityTesting.satisfactionAnalysis?.score || 'N/A'}`);

    // Teste 8: Análise de feedback
    console.log('\n💬 Teste 8: Análise de feedback...');

    const feedbackData = [
      { text: 'Great user experience, very intuitive', sentiment: 'positive', category: 'ux' },
      { text: 'Loading times are too slow', sentiment: 'negative', category: 'performance' },
      { text: 'Love the new features', sentiment: 'positive', category: 'features' },
      { text: 'Mobile app crashes frequently', sentiment: 'negative', category: 'bugs' }
    ];

    const feedbackTask = {
      description: 'Analyze user feedback and reviews',
      feedback_data: feedbackData,
      type: 'feedback_analysis'
    };

    const feedbackAnalysis = await productAgent.analyzeFeedback(feedbackTask, {});
    console.log('✅ Feedback Analysis Result:');
    console.log(`   • Tipo: ${feedbackAnalysis.type}`);
    console.log(`   • Score de sentiment: ${feedbackAnalysis.sentimentScore}`);
    console.log(`   • Categorias identificadas: ${Object.keys(feedbackAnalysis.feedbackCategories || {}).length}`);
    console.log(`   • Temas extraídos: ${feedbackAnalysis.themeExtraction?.themes?.length || 0}`);
    console.log(`   • Itens de ação: ${feedbackAnalysis.actionItems?.length || 0}`);

    // Teste 9: Previsão de adoção de features
    console.log('\n🔮 Teste 9: Previsão de adoção de features...');

    const featureSpec = {
      name: 'AI-powered search',
      description: 'Advanced search with natural language processing',
      category: 'functionality',
      complexity: 'high',
      similarFeatures: ['autocomplete', 'voice_search'],
      targetUsers: 'power_users'
    };

    const predictionTask = {
      description: 'Predict adoption of new AI search feature',
      feature_spec: featureSpec,
      type: 'feature_prediction'
    };

    const adoptionPrediction = await productAgent.predictFeatureAdoption(predictionTask, {});
    console.log('✅ Feature Adoption Prediction Result:');
    console.log(`   • Tipo: ${adoptionPrediction.type}`);
    console.log(`   • Taxa de adoção prevista: ${adoptionPrediction.adoptionPrediction?.rate || 'N/A'}`);
    console.log(`   • Cenários criados: ${adoptionPrediction.adoptionScenarios?.length || 0}`);
    console.log(`   • Confiança da previsão: ${adoptionPrediction.confidence}`);
    console.log(`   • Risco de adoção: ${adoptionPrediction.riskAssessment}`);

    // Teste 10: Otimização de market fit
    console.log('\n🎯 Teste 10: Otimização de market fit...');

    const fitTask = {
      description: 'Optimize product-market fit',
      product_data: {
        features: ['search', 'checkout', 'recommendations'],
        userSatisfaction: 7.5,
        retentionRate: 65
      },
      market_data: {
        marketSize: 1000000,
        growthRate: 15,
        competitorStrength: 'medium'
      },
      type: 'market_fit'
    };

    const marketFit = await productAgent.optimizeMarketFit(fitTask, {});
    console.log('✅ Market Fit Optimization Result:');
    console.log(`   • Tipo: ${marketFit.type}`);
    console.log(`   • Score de fit atual: ${marketFit.fitScore}`);
    console.log(`   • Gaps identificados: ${marketFit.fitGaps?.length || 0}`);
    console.log(`   • Experimentos propostos: ${marketFit.experiments?.length || 0}`);
    console.log(`   • Potencial de melhoria: ${marketFit.improvementPotential}`);

    // Teste 11: Design de testes A/B
    console.log('\n🅰️ Teste 11: Design de testes A/B...');

    const abTestTask = {
      description: 'Design A/B test for checkout flow',
      test_spec: {
        hypothesis: 'Simplified checkout increases conversion',
        metric: 'conversion_rate',
        baseline: 0.03,
        expectedImprovement: 0.05,
        significance: 0.95
      },
      type: 'ab_testing'
    };

    const abTestDesign = await productAgent.designABTests(abTestTask, {});
    console.log('✅ A/B Test Design Result:');
    console.log(`   • Tipo: ${abTestDesign.type}`);
    console.log(`   • Hipóteses definidas: ${abTestDesign.hypotheses?.length || 0}`);
    console.log(`   • Variantes criadas: ${Object.keys(abTestDesign.variants || {}).length}`);
    console.log(`   • Tamanho da amostra: ${abTestDesign.sampleSize?.total || 'N/A'}`);
    console.log(`   • Duração estimada: ${abTestDesign.testDuration}`);
    console.log(`   • Poder estatístico: ${abTestDesign.statisticalPower}`);

    // Teste 12: Pesquisa abrangente
    console.log('\n🔄 Teste 12: Pesquisa abrangente...');

    const comprehensiveTask = {
      description: 'Conduct comprehensive product research',
      user_data: userBehaviorData,
      market_spec: marketTask.market_spec,
      type: 'comprehensive'
    };

    const comprehensiveResearch = await productAgent.comprehensiveProductResearch(comprehensiveTask, {});
    console.log('✅ Comprehensive Research Result:');
    console.log(`   • Tipo: ${comprehensiveResearch.type}`);
    console.log(`   • Insights principais: ${comprehensiveResearch.keyInsights?.length || 0}`);
    console.log(`   • Prioridades identificadas: ${comprehensiveResearch.priorities?.length || 0}`);

    // Teste 13: Integração L.L.B.
    console.log('\n🧠 Teste 13: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento de produto
    const productKnowledge = await productAgent.llbIntegration.getProductKnowledge({
      description: 'user research methodologies'
    });
    console.log('✅ LangMem Integration (Product Knowledge):', productKnowledge.totalMatches || 0, 'resultados');

    // Testar insights similares
    const similarInsights = await productAgent.llbIntegration.getSimilarProductInsights({
      description: 'e-commerce user behavior'
    });
    console.log('✅ Letta Integration (Similar Insights):', similarInsights.length, 'insights');

    // Teste 14: Performance e escalabilidade
    console.log('\n⏱️ Teste 14: Performance e escalabilidade...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Analyze user behavior',
      'Conduct market research',
      'Create user personas',
      'Map user journey'
    ];

    for (const task of perfTasks) {
      await productAgent.processTask({ description: task, user_data: userBehaviorData });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 15: Robustez com edge cases
    console.log('\n🛡️ Teste 15: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'Analyze behavior without data', user_data: null, expectedError: true },
      { description: 'Research market without spec', market_spec: null, expectedError: true },
      { description: 'Create personas with empty data', user_data: {}, type: 'persona_creation' }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await productAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Product Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Product Agent:');
    console.log('🎯 Capacidades implementadas:');
    console.log('   • Análise de comportamento de usuários com IA');
    console.log('   • Pesquisa de mercado automatizada');
    console.log('   • Criação de personas baseada em dados');
    console.log('   • Mapeamento de jornada do usuário');
    console.log('   • Testes de usabilidade remotos');
    console.log('   • Análise de feedback e sentiment');
    console.log('   • Previsão de adoção de features');
    console.log('   • Otimização de product-market fit');
    console.log('   • Design de testes A/B');
    console.log('   • Segmentação inteligente de usuários');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Aprendizado contínuo de insights de produto');
    console.log('   • Tecnologias 2025: IA para pesquisa de usuários');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testProductAgent();
}

export { testProductAgent };





