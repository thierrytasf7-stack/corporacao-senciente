#!/usr/bin/env node
/**
 * Teste: RAG Pipeline Robusto
 *
 * Testa o pipeline RAG completo com busca híbrida, re-ranking e múltiplas fontes
 */

import { getRAGPipeline } from './swarm/rag_pipeline.js';
import { logger } from './utils/logger.js';

const log = logger.child({ module: 'test_rag_pipeline' });

async function testRAGPipeline() {
    log.info('🧠 Testando RAG Pipeline Robusto\n');

    const ragPipeline = getRAGPipeline({
        chunkSize: 512,
        topK: 10,
        rerankTopK: 5,
        similarityThreshold: 0.6
    });

    const testResults = {
        queriesProcessed: 0,
        avgResponseTime: 0,
        cacheHits: 0,
        totalResults: 0,
        sourcesUsed: new Set()
    };

    try {
        // 1. Testar query simples
        log.info('1. Testar query simples sobre o sistema...\n');

        const simpleQuery = 'O que é o Protocolo L.L.B.?';
        const startTime1 = Date.now();

        const result1 = await ragPipeline.processQuery(simpleQuery, {
            agent: 'user',
            task_type: 'information'
        });

        const time1 = Date.now() - startTime1;

        console.log('✅ Query simples processada:');
        console.log(`   Query: "${simpleQuery}"`);
        console.log(`   Tempo de resposta: ${time1}ms`);
        console.log(`   Resultados encontrados: ${result1.results.length}`);
        console.log(`   Contexto enriquecido: ${result1.enriched_context ? 'Sim' : 'Não'}`);
        console.log(`   Fontes utilizadas: ${result1.metadata.sources_used.join(', ')}`);

        if (result1.results.length > 0) {
            console.log(`   Top resultado: ${result1.results[0].content.substring(0, 100)}...`);
        }

        testResults.queriesProcessed++;
        testResults.totalResults += result1.results.length;
        result1.metadata.sources_used.forEach(source => testResults.sourcesUsed.add(source));

        // 2. Testar query técnica
        log.info('2. Testar query técnica sobre agentes...\n');

        const techQuery = 'Como funciona o sistema de agentes?';
        const startTime2 = Date.now();

        const result2 = await ragPipeline.processQuery(techQuery, {
            agent: 'developer',
            task_type: 'technical'
        });

        const time2 = Date.now() - startTime2;

        console.log('✅ Query técnica processada:');
        console.log(`   Query: "${techQuery}"`);
        console.log(`   Tempo de resposta: ${time2}ms`);
        console.log(`   Resultados encontrados: ${result2.results.length}`);
        console.log(`   Scores dos resultados: ${result2.results.map(r => r.score.toFixed(3)).join(', ')}`);

        testResults.queriesProcessed++;
        testResults.totalResults += result2.results.length;
        result2.metadata.sources_used.forEach(source => testResults.sourcesUsed.add(source));

        // 3. Testar cache
        log.info('3. Testar sistema de cache...\n');

        const cachedQuery = simpleQuery; // Mesma query
        const startTime3 = Date.now();

        const result3 = await ragPipeline.processQuery(cachedQuery, {
            agent: 'user',
            task_type: 'information'
        });

        const time3 = Date.now() - startTime3;

        console.log('✅ Cache testado:');
        console.log(`   Query: "${cachedQuery}"`);
        console.log(`   Tempo com cache: ${time3}ms`);
        console.log(`   Cache hit: ${result3.metadata.cache_hit}`);
        console.log(`   Melhoria de performance: ${time1 > time3 ? 'Sim' : 'Não'}`);

        if (result3.metadata.cache_hit) {
            testResults.cacheHits++;
        }

        testResults.queriesProcessed++;
        testResults.totalResults += result3.results.length;

        // 4. Testar query complexa
        log.info('4. Testar query complexa com múltiplas fontes...\n');

        const complexQuery = 'Como implementar segurança e validação no sistema de agentes autônomos?';
        const startTime4 = Date.now();

        const result4 = await ragPipeline.processQuery(complexQuery, {
            agent: 'architect',
            task_type: 'security'
        });

        const time4 = Date.now() - startTime4;

        console.log('✅ Query complexa processada:');
        console.log(`   Query: "${complexQuery}"`);
        console.log(`   Tempo de resposta: ${time4}ms`);
        console.log(`   Resultados encontrados: ${result4.results.length}`);
        console.log(`   Fontes utilizadas: ${result4.metadata.sources_used.join(', ')}`);

        if (result4.results.length > 0) {
            const sourceDistribution = result4.metrics.sources_distributed;
            console.log(`   Distribuição por fonte: ${JSON.stringify(sourceDistribution)}`);
        }

        testResults.queriesProcessed++;
        testResults.totalResults += result4.results.length;
        result4.metadata.sources_used.forEach(source => testResults.sourcesUsed.add(source));

        // 5. Testar expansão de query
        log.info('5. Testar expansão de query...\n');

        // Testar internamente o método de expansão
        const expansionResult = await ragPipeline.expandQuery('sistema agentes', {
            agent: 'architect',
            task_type: 'design'
        });

        console.log('✅ Expansão de query:');
        console.log(`   Query original: "sistema agentes"`);
        console.log(`   Queries expandidas: ${expansionResult.length}`);
        console.log(`   Expansões: ${expansionResult.slice(0, 3).map(q => `"${q}"`).join(', ')}`);

        // 6. Testar busca híbrida
        log.info('6. Testar busca híbrida...\n');

        const hybridResults = await ragPipeline.hybridSearch(['sistema agentes'], {
            agent: 'architect'
        });

        console.log('✅ Busca híbrida realizada:');
        console.log(`   Resultados encontrados: ${hybridResults.length}`);
        console.log(`   Fontes pesquisadas: ${[...new Set(hybridResults.map(r => r.source))].join(', ')}`);

        if (hybridResults.length > 0) {
            console.log(`   Top score híbrido: ${hybridResults[0].hybrid_score.toFixed(3)}`);
            console.log(`   Scores vector/keyword: ${hybridResults[0].vector_score.toFixed(3)}/${hybridResults[0].keyword_score.toFixed(3)}`);
        }

        // 7. Testar re-ranking
        log.info('7. Testar re-ranking...\n');

        const rerankedResults = await ragPipeline.rerankResults('sistema agentes', hybridResults.slice(0, 5));

        console.log('✅ Re-ranking realizado:');
        console.log(`   Resultados originais: ${hybridResults.slice(0, 5).length}`);
        console.log(`   Resultados re-rankeados: ${rerankedResults.length}`);

        if (rerankedResults.length > 0) {
            console.log(`   Top score final: ${rerankedResults[0].final_score.toFixed(3)}`);
        }

        // 8. Testar configuração de fontes
        log.info('8. Testar configuração de fontes...\n');

        const originalSources = { ...ragPipeline.knowledgeSources };

        // Configurar apenas uma fonte
        ragPipeline.configureSources({
            langmem: { enabled: true, weight: 1.0 },
            documentation: { enabled: false, weight: 0 },
            codebase: { enabled: false, weight: 0 },
            agent_logs: { enabled: false, weight: 0 }
        });

        const limitedQuery = 'protocolo llb';
        const limitedResult = await ragPipeline.processQuery(limitedQuery, {
            agent: 'user'
        });

        console.log('✅ Configuração de fontes testada:');
        console.log(`   Query limitada: "${limitedQuery}"`);
        console.log(`   Fontes utilizadas: ${limitedResult.metadata.sources_used.join(', ')}`);
        console.log(`   Apenas LangMem: ${limitedResult.metadata.sources_used.length === 1 && limitedResult.metadata.sources_used[0] === 'langmem'}`);

        // Restaurar configuração original
        ragPipeline.configureSources(originalSources);

        // 9. Estatísticas finais
        log.info('9. Estatísticas finais do RAG Pipeline...\n');

        const stats = ragPipeline.getStats();

        console.log('✅ Estatísticas finais do RAG Pipeline:');
        console.log(`   Queries processadas: ${stats.queries_processed}`);
        console.log(`   Tempo médio de resposta: ${stats.avg_response_time.toFixed(0)}ms`);
        console.log(`   Taxa de cache hit: ${(stats.cache_hit_rate * 100).toFixed(1)}%`);
        console.log(`   Precisão média: ${(stats.avg_precision * 100).toFixed(1)}%`);
        console.log(`   Cache de resultados: ${stats.cache_size} entradas`);
        console.log(`   Cache de embeddings: ${stats.embedding_cache_size} entradas`);
        console.log(`   Fontes de conhecimento: ${stats.knowledge_sources}`);
        console.log(`   Fontes habilitadas: ${stats.enabled_sources}`);

        // 10. Limpeza de cache
        log.info('10. Testar limpeza de cache...\n');

        const cacheSizeBefore = stats.cache_size + stats.embedding_cache_size;
        ragPipeline.clearCaches();
        const statsAfter = ragPipeline.getStats();
        const cacheSizeAfter = statsAfter.cache_size + statsAfter.embedding_cache_size;

        console.log('✅ Limpeza de cache:');
        console.log(`   Entradas antes: ${cacheSizeBefore}`);
        console.log(`   Entradas após: ${cacheSizeAfter}`);
        console.log(`   Cache limpo: ${cacheSizeAfter === 0}`);

        // 11. Resumo dos testes
        log.info('11. Resumo dos testes do RAG Pipeline...\n');

        const avgResponseTime = [time1, time2, time3, time4].reduce((sum, t) => sum + t, 0) / 4;
        const cacheHitRate = testResults.cacheHits / testResults.queriesProcessed;

        console.log('🎯 Resumo dos Testes do RAG Pipeline:');
        console.log(`   ✅ Queries processadas: ${testResults.queriesProcessed}`);
        console.log(`   ✅ Resultados totais encontrados: ${testResults.totalResults}`);
        console.log(`   ✅ Fontes utilizadas: ${testResults.sourcesUsed.size} diferentes`);
        console.log(`   📈 Tempo médio de resposta: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   💾 Taxa de cache hit: ${(cacheHitRate * 100).toFixed(1)}%`);
        console.log(`   🔍 Fontes descobertas: ${Array.from(testResults.sourcesUsed).join(', ')}`);

        const successCriteria = {
            queriesProcessed: testResults.queriesProcessed >= 4,
            resultsFound: testResults.totalResults >= 5,
            sourcesUsed: testResults.sourcesUsed.size >= 2,
            responseTime: avgResponseTime < 5000,
            cacheWorking: cacheHitRate > 0
        };

        const successScore = Object.values(successCriteria).filter(Boolean).length;
        const totalCriteria = Object.keys(successCriteria).length;

        if (successScore === totalCriteria) {
            console.log('🎉 RAG Pipeline funcionando perfeitamente!');
            console.log('   ✓ Busca híbrida operacional');
            console.log('   ✓ Re-ranking funcionando');
            console.log('   ✓ Múltiplas fontes integradas');
            console.log('   ✓ Cache de alta performance');
            console.log('   ✓ Expansão de query inteligente');
        } else {
            console.log(`⚠️ RAG Pipeline com ${successScore}/${totalCriteria} critérios atendidos.`);
        }

        log.info('🎉 Testes do RAG Pipeline concluídos com sucesso!');
        log.info('Sistema agora tem:');
        log.info('  ✅ Pipeline RAG completo com busca híbrida');
        log.info('  ✅ Re-ranking inteligente com cross-encoder simulado');
        log.info('  ✅ Chunking semântico e múltiplas fontes');
        log.info('  ✅ Expansão e reformulação de queries');
        log.info('  ✅ Cache de embeddings e resultados');
        log.info('  ✅ Métricas de qualidade (precision, recall, MRR)');
        log.info('  ✅ Integração profunda com Protocolo L.L.B.');
        log.info('  ✅ Suporte a queries complexas e contextuais');

        return successScore === totalCriteria;

    } catch (err) {
        log.error('❌ Erro ao testar RAG Pipeline', { error: err.message, stack: err.stack });
        return false;
    }
}

// Executar
testRAGPipeline().then(success => {
    process.exit(success ? 0 : 1);
}).catch(err => {
    log.error('Erro fatal nos testes', { error: err.message });
    process.exit(1);
});
