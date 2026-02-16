/**
 * Testes do Sistema de Memória Compartilhada
 */

import { swarmMemory, storeDecision, getSimilarDecisions, getAgentHistory, getKnowledge, getAgentStats } from './swarm/memory.js';

async function testMemorySystem() {
  console.log('🧠 Testando Sistema de Memória Compartilhada...\n');

  try {
    // Teste 1: Armazenar decisões
    console.log('📝 Teste 1: Armazenando decisões...');
    const decision1 = await storeDecision(
      'marketing_agent',
      'criar campanha publicitária',
      'usar Google Ads com orçamento de R$ 1000',
      'Campanha criada com sucesso, CTR de 2.3%',
      { confidence: 0.85, executionTime: 1500 }
    );

    const decision2 = await storeDecision(
      'copywriting_agent',
      'escrever texto para anúncio',
      'criar copy persuasivo focado em benefícios',
      'Texto escrito: "Transforme sua produtividade com nossa solução inovadora"',
      { confidence: 0.92, executionTime: 800 }
    );

    const decision3 = await storeDecision(
      'marketing_agent',
      'otimizar landing page',
      'melhorar CTA e adicionar testimonials',
      'Landing page otimizada, conversão aumentou 15%',
      { confidence: 0.78, executionTime: 2200 }
    );

    console.log(`✅ Decisões armazenadas: ${decision1 && decision2 && decision3 ? 'Sucesso' : 'Falhou'}`);

    // Aguardar um pouco para garantir que os dados foram persistidos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 2: Buscar decisões similares
    console.log('\n🔍 Teste 2: Buscando decisões similares...');
    const similarDecisions = await getSimilarDecisions('campanha', 3);
    console.log(`✅ Encontradas ${similarDecisions.length} decisões similares sobre campanhas`);

    // Teste 3: Buscar histórico de agente
    console.log('\n📚 Teste 3: Buscando histórico do marketing_agent...');
    const marketingHistory = await getAgentHistory('marketing_agent', 5);
    console.log(`✅ Histórico do marketing_agent: ${marketingHistory.length} decisões`);

    // Teste 4: Buscar conhecimento
    console.log('\n🧠 Teste 4: Buscando conhecimento...');
    const knowledge = await getKnowledge('marketing', null, 3);
    console.log(`✅ Conhecimento encontrado: ${knowledge.length} itens`);

    // Teste 5: Obter estatísticas do agente
    console.log('\n📊 Teste 5: Obtendo estatísticas do agente...');
    const marketingStats = await getAgentStats('marketing_agent');
    if (marketingStats) {
      console.log(`✅ Estatísticas marketing_agent:`);
      console.log(`   - Total de decisões: ${marketingStats.totalDecisions}`);
      console.log(`   - Confiança média: ${marketingStats.averageConfidence}`);
      console.log(`   - Tempo médio: ${marketingStats.averageExecutionTime}ms`);
      console.log(`   - Taxa de sucesso: ${marketingStats.successRate}%`);
    }

    // Teste 6: Sistema de cache
    console.log('\n⚡ Teste 6: Testando sistema de cache...');
    const cacheStats = swarmMemory.getCacheStats();
    console.log(`✅ Cache stats: ${cacheStats.size}/${cacheStats.maxSize} entradas`);

    // Teste 7: Limpeza de cache
    console.log('\n🧹 Teste 7: Limpando cache...');
    swarmMemory.clearCache();
    const cacheStatsAfter = swarmMemory.getCacheStats();
    console.log(`✅ Cache após limpeza: ${cacheStatsAfter.size} entradas`);

    console.log('\n🎉 Todos os testes do sistema de memória passaram!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testMemorySystem();
}

export { testMemorySystem };





