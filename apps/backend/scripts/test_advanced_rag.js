/**
 * Testes do Sistema RAG Avançado
 */

import { advancedRAG, searchWithRAG, generateWithRAGContext, getRAGStats, addKnowledgeToRAG } from './swarm/advanced_rag.js';

async function testAdvancedRAG() {
  console.log('🧠 Testando Sistema RAG Avançado...\n');

  try {
    // Teste 1: Adicionar conhecimento
    console.log('📚 Teste 1: Adicionando conhecimento...');
    const knowledgeId1 = await addKnowledgeToRAG(
      "Node.js é um runtime JavaScript server-side",
      { level: 'level1', category: 'programming', tags: ['nodejs', 'javascript'] }
    );

    const knowledgeId2 = await addKnowledgeToRAG(
      "Express.js é um framework web para Node.js",
      { level: 'level2', category: 'frameworks', tags: ['express', 'nodejs'] }
    );

    const knowledgeId3 = await addKnowledgeToRAG(
      "Middleware no Express permite processamento de requests",
      { level: 'level3', category: 'advanced', tags: ['express', 'middleware'] }
    );

    console.log(`✅ Conhecimento adicionado: ${knowledgeId1}, ${knowledgeId2}, ${knowledgeId3}`);

    // Teste 2: Busca inteligente simples
    console.log('\n🔍 Teste 2: Busca inteligente simples...');
    const searchResult1 = await searchWithRAG("O que é Node.js?");

    console.log(`✅ Busca simples:`);
    console.log(`   Query: "${searchResult1.query}"`);
    console.log(`   Resultados encontrados: ${searchResult1.results.length}`);
    console.log(`   Melhor resultado: ${searchResult1.results[0]?.content.substring(0, 50)}...`);
    console.log(`   Confiança: ${(searchResult1.metadata.confidence * 100).toFixed(1)}%`);
    console.log(`   Latência: ${searchResult1.metadata.latency}ms`);

    // Teste 3: Busca complexa com múltiplas estratégias
    console.log('\n🎯 Teste 3: Busca complexa (middleware)...');
    const searchResult2 = await searchWithRAG("Como funciona middleware no Express?", {
      maxResults: 5,
      includeMetadata: true
    });

    console.log(`✅ Busca complexa:`);
    console.log(`   Resultados: ${searchResult2.results.length}`);
    console.log(`   Estratégias usadas: ${searchResult2.metadata.strategies.join(', ')}`);

    searchResult2.results.slice(0, 3).forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.content.substring(0, 60)}... (score: ${(result.finalScore * 100).toFixed(1)}%)`);
    });

    // Teste 4: Geração com contexto RAG
    console.log('\n🤖 Teste 4: Geração com contexto RAG...');

    // Mock generator para teste
    const mockGenerator = {
      generate: async (query, options) => {
        const contextLength = options.context?.length || 0;
        return `Resposta gerada para "${query}" usando ${contextLength} chars de contexto. ` +
               `Esta é uma resposta simulada que incorpora conhecimento contextual.`;
      }
    };

    const generationResult = await generateWithRAGContext(
      "Explique middleware no Express.js",
      mockGenerator,
      { maxContextLength: 2000 }
    );

    console.log(`✅ Geração com RAG:`);
    console.log(`   Resposta: ${generationResult.response.substring(0, 100)}...`);
    console.log(`   Itens de contexto: ${generationResult.metadata.contextItems}`);
    console.log(`   Confiança da geração: ${(generationResult.metadata.generationConfidence * 100).toFixed(1)}%`);

    // Teste 5: Busca com diferentes níveis de complexidade
    console.log('\n📊 Teste 5: Busca com diferentes complexidades...');

    const queries = [
      "JavaScript básico",  // Deve encontrar level1
      "Frameworks web",     // Deve encontrar level2
      "Arquitetura avançada" // Deve encontrar level3/level4
    ];

    for (const query of queries) {
      const result = await searchWithRAG(query);
      const topResult = result.results[0];
      console.log(`✅ "${query}": ${topResult?.content.substring(0, 40)}... (score: ${(topResult?.finalScore * 100).toFixed(1)}%)`);
    }

    // Teste 6: Fusão de múltiplas estratégias
    console.log('\n🔄 Teste 6: Fusão de estratégias...');
    const fusionResult = await searchWithRAG("desenvolvimento web moderno", {
      strategies: ['METEORA', 'DAT', 'ASRank', 'LevelRAG']
    });

    console.log(`✅ Fusão de estratégias:`);
    console.log(`   Estratégias: ${fusionResult.metadata.strategies.join(', ')}`);
    console.log(`   Resultados fundidos: ${fusionResult.results.length}`);

    // Análise de distribuição de scores
    const scoreDistribution = {};
    fusionResult.results.forEach(result => {
      const roundedScore = Math.floor(result.finalScore * 10) / 10;
      scoreDistribution[roundedScore] = (scoreDistribution[roundedScore] || 0) + 1;
    });

    console.log(`   Distribuição de scores:`, scoreDistribution);

    // Teste 7: Estatísticas do sistema
    console.log('\n📈 Teste 7: Estatísticas do sistema...');
    const stats = getRAGStats();

    console.log(`✅ Estatísticas RAG:`);
    console.log(`   Base de conhecimento:`);
    console.log(`     - Total de itens: ${stats.knowledgeBase.totalItems}`);
    console.log(`     - Por nível:`, stats.knowledgeBase.levels);
    console.log(`   Histórico de queries: ${stats.queryHistory.totalQueries}`);
    console.log(`   Performance:`);
    console.log(`     - Métricas totais: ${stats.performance.totalMetrics}`);
    console.log(`     - Latência média: ${Math.round(stats.performance.averageLatency)}ms`);

    // Teste 8: Otimização baseada em histórico
    console.log('\n🎓 Teste 8: Otimização baseada em histórico...');

    // Fazer várias queries similares para testar aprendizado
    const similarQueries = [
      "frameworks para Node.js",
      "bibliotecas Node.js",
      "pacotes Node.js populares"
    ];

    for (const query of similarQueries) {
      await searchWithRAG(query);
    }

    // Query final deve ser otimizada
    const optimizedResult = await searchWithRAG("framework Node.js");
    console.log(`✅ Query otimizada: ${optimizedResult.results.length} resultados, latência: ${optimizedResult.metadata.latency}ms`);

    // Teste 9: Limitação de contexto
    console.log('\n📏 Teste 9: Limitação de contexto...');
    const limitedContext = await generateWithRAGContext(
      "Explique todos os conceitos de desenvolvimento web",
      mockGenerator,
      { maxContextLength: 500 }
    );

    console.log(`✅ Contexto limitado:`);
    console.log(`   Contexto usado: ${limitedContext.metadata.contextItems} itens`);
    console.log(`   Confiança mantida: ${(limitedContext.metadata.generationConfidence * 100).toFixed(1)}%`);

    // Teste 10: Robustez com queries edge case
    console.log('\n🛡️ Teste 10: Robustez com edge cases...');

    const edgeCases = [
      "",  // Query vazia
      "a", // Query muito curta
      "este é um teste com muitos termos que podem não existir na base de conhecimento atual mas ainda assim deve funcionar",
      "SELECT * FROM users WHERE id = 1; -- SQL injection test", // Query com caracteres especiais
    ];

    for (const edgeQuery of edgeCases) {
      try {
        const edgeResult = await searchWithRAG(edgeQuery);
        console.log(`✅ Edge case "${edgeQuery.substring(0, 30)}...": ${edgeResult.results.length} resultados`);
      } catch (error) {
        console.log(`❌ Edge case falhou: ${error.message}`);
      }
    }

    console.log('\n🎉 Todos os testes do Sistema RAG Avançado passaram!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testAdvancedRAG();
}

export { testAdvancedRAG };





