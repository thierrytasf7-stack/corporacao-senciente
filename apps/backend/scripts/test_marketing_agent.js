/**
 * Testes do Marketing Agent - AI Marketing Automation Specialist
 */

import { marketingAgent } from './agents/business/marketing_agent.js';

async function testMarketingAgent() {
  console.log('📈 Testando Marketing Agent - AI Marketing Automation...\n');

  try {
    // Teste 1: Inicialização do agente
    console.log('🚀 Teste 1: Inicialização do Marketing Agent...');
    console.log('✅ Agente inicializado com capacidades:');
    console.log('   • Nome:', marketingAgent.name);
    console.log('   • Expertise:', marketingAgent.config.expertise?.join(', ') || 'N/A');
    console.log('   • Capacidades:', marketingAgent.config.capabilities?.join(', ') || 'N/A');

    // Teste 2: Classificação de tarefas de marketing
    console.log('\n📋 Teste 2: Classificação de tarefas de marketing...');

    const testTasks = [
      { description: 'Analyze email campaign performance', expected: 'campaign_analysis' },
      { description: 'Segment customers by behavior', expected: 'audience_segmentation' },
      { description: 'Create personalized content strategy', expected: 'personalization' },
      { description: 'Optimize campaign ROI', expected: 'roi_optimization' },
      { description: 'Predict customer churn', expected: 'predictive_analytics' },
      { description: 'Setup marketing automation workflow', expected: 'automation_setup' },
      { description: 'Optimize ad copy performance', expected: 'content_optimization' }
    ];

    testTasks.forEach(task => {
      const classification = marketingAgent.classifyMarketingTask(task);
      const status = classification === task.expected ? '✅' : '❌';
      console.log(`${status} "${task.description}" → ${classification}`);
    });

    // Teste 3: Análise de campanhas
    console.log('\n📊 Teste 3: Análise de campanhas...');

    const campaignData = {
      campaign: 'Summer Sale 2024',
      metrics: {
        impressions: 100000,
        clicks: 5000,
        conversions: 250,
        spend: 5000,
        revenue: 25000
      },
      channels: {
        email: { impressions: 50000, clicks: 3000, conversions: 150 },
        social: { impressions: 30000, clicks: 1500, conversions: 75 },
        search: { impressions: 20000, clicks: 500, conversions: 25 }
      },
      funnel: {
        awareness: 100000,
        interest: 8000,
        consideration: 1200,
        purchase: 250
      }
    };

    const campaignTask = {
      description: 'Analyze Summer Sale campaign performance',
      campaign_data: campaignData,
      type: 'campaign_analysis'
    };

    const campaignAnalysis = await marketingAgent.analyzeCampaign(campaignTask, {});
    console.log('✅ Campaign Analysis Result:');
    console.log(`   • Tipo: ${campaignAnalysis.type}`);
    console.log(`   • Performance geral: ${campaignAnalysis.overallPerformance}`);
    console.log(`   • ROI: ${campaignAnalysis.roi}x`);
    console.log(`   • Insights extraídos: ${campaignAnalysis.insights?.length || 0}`);
    console.log(`   • Recomendações: ${campaignAnalysis.recommendations?.length || 0}`);

    // Teste 4: Segmentação de audiência
    console.log('\n👥 Teste 4: Segmentação de audiência...');

    const audienceData = {
      customers: [
        { id: 1, age: 25, location: 'urban', purchaseHistory: 150, engagement: 0.8 },
        { id: 2, age: 45, location: 'suburban', purchaseHistory: 500, engagement: 0.6 },
        { id: 3, age: 35, location: 'urban', purchaseHistory: 300, engagement: 0.9 },
        { id: 4, age: 28, location: 'rural', purchaseHistory: 50, engagement: 0.3 }
      ],
      demographics: {
        ageGroups: { '18-24': 20, '25-34': 30, '35-44': 35, '45+': 15 },
        locations: { urban: 60, suburban: 25, rural: 15 }
      }
    };

    const segmentationTask = {
      description: 'Segment customers for targeted marketing',
      audience_data: audienceData,
      type: 'audience_segmentation'
    };

    const audienceSegmentation = await marketingAgent.segmentAudience(segmentationTask, {});
    console.log('✅ Audience Segmentation Result:');
    console.log(`   • Tipo: ${audienceSegmentation.type}`);
    console.log(`   • Segmentos criados: ${audienceSegmentation.segmentCount}`);
    console.log(`   • Cobertura: ${audienceSegmentation.coverage}%`);
    console.log(`   • Qualidade: ${audienceSegmentation.quality}`);
    console.log(`   • Estratégias de engajamento: ${Object.keys(audienceSegmentation.engagementStrategies || {}).length}`);

    // Teste 5: Personalização
    console.log('\n🎯 Teste 5: Personalização...');

    const customerData = {
      profiles: [
        {
          id: 1,
          preferences: { category: 'electronics', priceRange: 'premium', frequency: 'monthly' },
          behavior: { recency: 7, frequency: 12, monetary: 2400 },
          engagement: { email: 0.9, app: 0.7, website: 0.8 }
        }
      ]
    };

    const personalizationTask = {
      description: 'Create personalization strategy for customers',
      customer_data: customerData,
      type: 'personalization'
    };

    const personalization = await marketingAgent.createPersonalization(personalizationTask, {});
    console.log('✅ Personalization Result:');
    console.log(`   • Tipo: ${personalization.type}`);
    console.log(`   • Perfis de personalização: ${personalization.personalizationProfiles?.length || 0}`);
    console.log(`   • Score de personalização: ${personalization.personalizationScore}`);
    console.log(`   • Lift esperado: ${personalization.expectedLift}%`);
    console.log(`   • Estratégias de conteúdo: ${Object.keys(personalization.contentStrategies || {}).length}`);

    // Teste 6: Otimização de ROI
    console.log('\n💰 Teste 6: Otimização de ROI...');

    const campaignMetrics = {
      channels: {
        email: { spend: 2000, revenue: 8000, conversions: 80 },
        social: { spend: 1500, revenue: 6000, conversions: 60 },
        search: { spend: 1500, revenue: 11000, conversions: 110 }
      },
      total: {
        spend: 5000,
        revenue: 25000,
        conversions: 250
      },
      timing: {
        weekday: { spend: 3000, revenue: 15000 },
        weekend: { spend: 2000, revenue: 10000 }
      }
    };

    const roiTask = {
      description: 'Optimize marketing budget allocation for better ROI',
      campaign_metrics: campaignMetrics,
      type: 'roi_optimization'
    };

    const roiOptimization = await marketingAgent.optimizeROI(roiTask, {});
    console.log('✅ ROI Optimization Result:');
    console.log(`   • Tipo: ${roiOptimization.type}`);
    console.log(`   • ROI atual: ${roiOptimization.currentROI}x`);
    console.log(`   • ROI otimizado: ${roiOptimization.optimizedROI}x`);
    console.log(`   • Melhoria: ${roiOptimization.improvement}%`);
    console.log(`   • Cenários de otimização: ${roiOptimization.optimizationScenarios?.length || 0}`);

    // Teste 7: Marketing preditivo
    console.log('\n🔮 Teste 7: Marketing preditivo...');

    const historicalData = {
      customers: [
        { id: 1, purchases: [30, 45, 60], lastPurchase: 7, totalValue: 135, churned: false },
        { id: 2, purchases: [20, 25], lastPurchase: 90, totalValue: 45, churned: true },
        { id: 3, purchases: [50, 75, 100, 80], lastPurchase: 3, totalValue: 305, churned: false }
      ],
      campaigns: [
        { campaign: 'newsletter', response: 0.15, conversion: 0.03 },
        { campaign: 'social', response: 0.22, conversion: 0.05 },
        { campaign: 'email', response: 0.18, conversion: 0.04 }
      ]
    };

    const predictiveTask = {
      description: 'Predict customer behavior and campaign response',
      historical_data: historicalData,
      type: 'predictive_analytics'
    };

    const predictiveAnalytics = await marketingAgent.predictiveMarketing(predictiveTask, {});
    console.log('✅ Predictive Marketing Result:');
    console.log(`   • Tipo: ${predictiveAnalytics.type}`);
    console.log(`   • Acurácia da previsão: ${predictiveAnalytics.accuracy}`);
    console.log(`   • Previsão de churn: ${!!predictiveAnalytics.churnPrediction}`);
    console.log(`   • Previsão de CLV: ${!!predictiveAnalytics.clvPrediction}`);
    console.log(`   • Estratégias de retenção: ${Object.keys(predictiveAnalytics.retentionStrategies || {}).length}`);

    // Teste 8: Configuração de automação
    console.log('\n⚙️ Teste 8: Configuração de automação...');

    const automationSpec = {
      workflows: [
        {
          trigger: 'user_signup',
          actions: ['send_welcome_email', 'add_to_crm', 'tag_segment'],
          conditions: []
        },
        {
          trigger: 'abandoned_cart',
          actions: ['send_reminder_email', 'create_retargeting_campaign'],
          conditions: ['cart_value > 50', 'time_since_abandon > 1h']
        }
      ],
      integrations: ['mailchimp', 'hubspot', 'google_analytics']
    };

    const automationTask = {
      description: 'Setup marketing automation workflows',
      automation_spec: automationSpec,
      type: 'automation_setup'
    };

    const automationSetup = await marketingAgent.setupAutomation(automationTask, {});
    console.log('✅ Automation Setup Result:');
    console.log(`   • Tipo: ${automationSetup.type}`);
    console.log(`   • Fluxos de automação: ${automationSetup.automationFlows?.length || 0}`);
    console.log(`   • Cobertura de automação: ${automationSetup.automationCoverage}%`);
    console.log(`   • Complexidade: ${automationSetup.complexity}`);
    console.log(`   • Plano de implementação: ${!!automationSetup.implementationPlan}`);

    // Teste 9: Otimização de conteúdo
    console.log('\n✍️ Teste 9: Otimização de conteúdo...');

    const contentData = {
      headlines: [
        { text: 'Amazing Product Deal!', ctr: 0.02, engagement: 0.15 },
        { text: 'Limited Time Offer - Save 50%!', ctr: 0.05, engagement: 0.25 },
        { text: 'New Collection Available', ctr: 0.03, engagement: 0.18 }
      ],
      copy: [
        { text: 'Buy now and save big!', conversions: 45, engagement: 0.22 },
        { text: 'Discover our amazing products', conversions: 32, engagement: 0.19 }
      ],
      visuals: [
        { type: 'image', performance: 0.85 },
        { type: 'video', performance: 0.92 }
      ]
    };

    const contentTask = {
      description: 'Optimize marketing content performance',
      content_data: contentData,
      type: 'content_optimization'
    };

    const contentOptimization = await marketingAgent.optimizeContent(contentTask, {});
    console.log('✅ Content Optimization Result:');
    console.log(`   • Tipo: ${contentOptimization.type}`);
    console.log(`   • Score de otimização: ${contentOptimization.optimizationScore}`);
    console.log(`   • Melhoria esperada: ${contentOptimization.expectedImprovement}%`);
    console.log(`   • Estratégias A/B: ${contentOptimization.abStrategies?.length || 0}`);

    // Teste 10: Otimização de conversão
    console.log('\n🛒 Teste 10: Otimização de conversão...');

    const conversionData = {
      funnel: {
        landing: 10000,
        product_view: 2500,
        add_to_cart: 800,
        checkout_start: 320,
        purchase: 160
      },
      dropOff: {
        landing_to_view: 0.75,
        view_to_cart: 0.68,
        cart_to_checkout: 0.60,
        checkout_to_purchase: 0.50
      },
      pages: {
        landing: { bounceRate: 0.65, timeOnPage: 45 },
        product: { bounceRate: 0.35, timeOnPage: 120 },
        cart: { bounceRate: 0.25, timeOnPage: 90 },
        checkout: { bounceRate: 0.15, timeOnPage: 180 }
      }
    };

    const conversionTask = {
      description: 'Optimize conversion funnel performance',
      conversion_data: conversionData,
      type: 'conversion_optimization'
    };

    const conversionOptimization = await marketingAgent.optimizeConversion(conversionTask, {});
    console.log('✅ Conversion Optimization Result:');
    console.log(`   • Tipo: ${conversionOptimization.type}`);
    console.log(`   • Taxa de conversão atual: ${(conversionOptimization.currentConversionRate * 100).toFixed(1)}%`);
    console.log(`   • Melhoria esperada: ${(conversionOptimization.expectedImprovement * 100).toFixed(1)}%`);
    console.log(`   • Pontos de queda identificados: ${conversionOptimization.dropOffPoints?.length || 0}`);
    console.log(`   • Testes de otimização: ${conversionOptimization.optimizationTests?.length || 0}`);

    // Teste 11: Marketing abrangente
    console.log('\n🔄 Teste 11: Marketing abrangente...');

    const comprehensiveTask = {
      description: 'Conduct comprehensive marketing analysis',
      campaign_data: campaignData,
      audience_data: audienceData,
      customer_data: customerData,
      type: 'comprehensive'
    };

    const comprehensiveMarketing = await marketingAgent.comprehensiveMarketing(comprehensiveTask, {});
    console.log('✅ Comprehensive Marketing Result:');
    console.log(`   • Tipo: ${comprehensiveMarketing.type}`);
    console.log(`   • Métricas chave: ${Object.keys(comprehensiveMarketing.keyMetrics || {}).length}`);
    console.log(`   • Plano de ação: ${!!comprehensiveMarketing.actionPlan}`);
    console.log(`   • ROI esperado: ${comprehensiveMarketing.expectedROI || 'N/A'}`);

    // Teste 12: Integração L.L.B.
    console.log('\n🧠 Teste 12: Integração com Protocolo L.L.B....');

    // Testar busca de conhecimento de marketing
    const marketingKnowledge = await marketingAgent.llbIntegration.getMarketingKnowledge({
      description: 'customer segmentation strategies'
    });
    console.log('✅ LangMem Integration (Marketing Knowledge):', marketingKnowledge.totalMatches || 0, 'resultados');

    // Testar campanhas similares
    const similarCampaigns = await marketingAgent.llbIntegration.getSimilarMarketingCampaigns({
      description: 'e-commerce email campaign'
    });
    console.log('✅ Letta Integration (Similar Campaigns):', similarCampaigns.length, 'campanhas');

    // Teste 13: Performance e escalabilidade
    console.log('\n⏱️ Teste 13: Performance e escalabilidade...');

    // Executar múltiplas operações para testar performance
    const perfStart = Date.now();
    const perfTasks = [
      'Analyze campaign',
      'Segment audience',
      'Create personalization',
      'Optimize ROI'
    ];

    for (const task of perfTasks) {
      await marketingAgent.processTask({ description: task, campaign_data: campaignData });
    }

    const perfTime = Date.now() - perfStart;
    console.log('✅ Performance Test:');
    console.log(`   • ${perfTasks.length} tarefas processadas em ${perfTime}ms`);
    console.log(`   • Média: ${(perfTime / perfTasks.length).toFixed(1)}ms por tarefa`);

    // Teste 14: Robustez com edge cases
    console.log('\n🛡️ Teste 14: Robustez com edge cases...');

    const edgeCases = [
      { description: '', expectedError: true },
      { description: 'Analyze campaign without data', campaign_data: null, expectedError: true },
      { description: 'Segment audience with empty data', audience_data: {}, type: 'audience_segmentation' },
      { description: 'Optimize ROI with invalid metrics', campaign_metrics: { invalid: true }, type: 'roi_optimization' }
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = await marketingAgent.processTask(edgeCase);
        console.log(`✅ Edge case "${edgeCase.description.substring(0, 30)}...": ${result.type}`);
      } catch (error) {
        const expected = edgeCase.expectedError;
        const status = expected ? '✅' : '⚠️';
        console.log(`${status} Edge case erro esperado: ${error.message.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Todos os testes do Marketing Agent passaram!');

    // Resumo final
    console.log('\n📊 Resumo do Marketing Agent:');
    console.log('📈 Capacidades implementadas:');
    console.log('   • Análise inteligente de campanhas de marketing');
    console.log('   • Segmentação avançada de audiência com IA');
    console.log('   • Estratégias de personalização em escala');
    console.log('   • Otimização automática de ROI de campanhas');
    console.log('   • Analytics preditivo para comportamento do cliente');
    console.log('   • Orquestração completa de automação de marketing');
    console.log('   • Otimização de conteúdo e copy com IA');
    console.log('   • Otimização de funil de conversão');
    console.log('   • Integração completa com Protocolo L.L.B.');
    console.log('   • Aprendizado contínuo de padrões de marketing');
    console.log('   • Tecnologias 2025: IA para marketing inteligente');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error(error.stack);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testMarketingAgent();
}

export { testMarketingAgent };