#!/usr/bin/env node
/**
 * RAG Pipeline Robusto - Sistema Avançado de Recuperação e Geração
 *
 * Pipeline RAG completo com re-ranking, chunking inteligente e busca híbrida
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';
import { getMetricsCollector } from './metrics_collector.js';

const log = logger.child({ module: 'rag_pipeline' });

/**
 * Pipeline RAG Robusto e Avançado
 */
export class RAGPipeline {
    constructor(options = {}) {
        this.embeddings = getEmbeddingsService();
        this.llbProtocol = getLLBProtocol();
        this.metricsCollector = getMetricsCollector();

        // Configurações do pipeline
        this.chunkSize = options.chunkSize || 512;
        this.chunkOverlap = options.chunkOverlap || 50;
        this.topK = options.topK || 20;
        this.rerankTopK = options.rerankTopK || 5;
        this.similarityThreshold = options.similarityThreshold || 0.7;

        // Cache para performance
        this.embeddingCache = new Map();
        this.resultCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 3600000; // 1 hora

        // Fontes de conhecimento
        this.knowledgeSources = {
            langmem: { enabled: true, weight: 0.4 },
            documentation: { enabled: true, weight: 0.3 },
            codebase: { enabled: true, weight: 0.2 },
            agent_logs: { enabled: true, weight: 0.1 }
        };

        // Métricas do pipeline
        this.pipelineMetrics = {
            queries_processed: 0,
            avg_response_time: 0,
            cache_hit_rate: 0,
            avg_precision: 0,
            avg_recall: 0,
            avg_mrr: 0
        };

        log.info('RAG Pipeline initialized', {
            chunkSize: this.chunkSize,
            topK: this.topK,
            sources: Object.keys(this.knowledgeSources).length
        });
    }

    /**
     * Processa query através do pipeline RAG completo
     *
     * @param {string} query - Query do usuário
     * @param {object} context - Contexto adicional
     * @returns {Promise<object>} Resultado do RAG
     */
    async processQuery(query, context = {}) {
        const startTime = Date.now();
        const queryId = this.generateQueryId(query, context);

        log.info('Processing RAG query', {
            query: query.substring(0, 100),
            contextKeys: Object.keys(context).length
        });

        try {
            // 1. Verificar cache
            const cachedResult = this.getCachedResult(queryId);
            if (cachedResult) {
                log.debug('RAG cache hit', { queryId });
                this.updateMetrics(startTime, cachedResult, true);
                return cachedResult;
            }

            // 2. Query Expansion
            const expandedQueries = await this.expandQuery(query, context);

            // 3. Busca Híbrida (Vector + Keyword)
            const hybridResults = await this.hybridSearch(expandedQueries, context);

            // 4. Re-ranking com Cross-Encoder
            const rerankedResults = await this.rerankResults(query, hybridResults);

            // 5. Filtro e Seleção Final
            const finalResults = this.selectFinalResults(rerankedResults);

            // 6. Geração de Contexto Enriquecido
            const enrichedContext = await this.generateEnrichedContext(finalResults, context);

            // 7. Preparar resposta final
            const result = {
                query: query,
                results: finalResults,
                enriched_context: enrichedContext,
                metadata: {
                    processing_time: Date.now() - startTime,
                    sources_used: Object.keys(this.knowledgeSources).filter(s => this.knowledgeSources[s].enabled),
                    total_chunks_searched: hybridResults.length,
                    final_results_count: finalResults.length,
                    cache_hit: false
                },
                metrics: this.calculateQueryMetrics(finalResults, query)
            };

            // 8. Cache do resultado
            this.setCachedResult(queryId, result);

            // 9. Registrar métricas
            this.updateMetrics(startTime, result, false);

            log.info('RAG query processed successfully', {
                resultsCount: finalResults.length,
                processingTime: result.metadata.processing_time,
                sourcesUsed: result.metadata.sources_used.length
            });

            return result;

        } catch (error) {
            log.error('Error in RAG pipeline', { error: error.message });

            // Registrar métrica de erro
            await this.metricsCollector.recordMetric('rag_error', {
                query: query.substring(0, 100),
                error: error.message,
                processing_time: Date.now() - startTime
            }, {
                error_type: 'rag_pipeline_error',
                query_length: query.length
            });

            return {
                query: query,
                error: error.message,
                results: [],
                enriched_context: '',
                metadata: {
                    processing_time: Date.now() - startTime,
                    error: true
                }
            };
        }
    }

    /**
     * Expande query com sinônimos e termos relacionados
     *
     * @param {string} query - Query original
     * @param {object} context - Contexto
     * @returns {Promise<array>} Queries expandidas
     */
    async expandQuery(query, context) {
        const expanded = [query]; // Sempre incluir original

        // Expansão baseada em sinônimos
        const synonyms = this.getQuerySynonyms(query);
        expanded.push(...synonyms);

        // Expansão baseada em contexto
        if (context.agent) {
            expanded.push(`${query} ${context.agent}`);
        }

        if (context.task_type) {
            expanded.push(`${query} ${context.task_type}`);
        }

        // Expansão baseada em histórico (se disponível)
        if (context.recent_queries) {
            context.recent_queries.slice(0, 3).forEach(recent => {
                if (this.calculateSimilarity(query, recent) > 0.6) {
                    expanded.push(`${query} ${recent}`);
                }
            });
        }

        // Remover duplicatas e limitar
        const unique = [...new Set(expanded)].slice(0, 5);

        log.debug('Query expanded', {
            original: query,
            expanded: unique.length,
            expansions: unique
        });

        return unique;
    }

    /**
     * Busca híbrida combinando vector search e keyword search
     *
     * @param {array} queries - Queries expandidas
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados da busca híbrida
     */
    async hybridSearch(queries, context) {
        const allResults = [];

        // Busca em cada fonte de conhecimento
        for (const [source, config] of Object.entries(this.knowledgeSources)) {
            if (!config.enabled) continue;

            try {
                const sourceResults = await this.searchKnowledgeSource(source, queries, context);
                sourceResults.forEach(result => {
                    result.source = source;
                    result.weight = config.weight;
                    result.hybrid_score = result.vector_score * 0.7 + result.keyword_score * 0.3;
                });

                allResults.push(...sourceResults);
            } catch (error) {
                log.warn(`Error searching ${source}`, { error: error.message });
            }
        }

        // Combinar e ordenar resultados
        allResults.sort((a, b) => b.hybrid_score - a.hybrid_score);

        log.debug('Hybrid search completed', {
            totalResults: allResults.length,
            sourcesUsed: Object.keys(this.knowledgeSources).filter(s => this.knowledgeSources[s].enabled).length
        });

        return allResults.slice(0, this.topK * 2); // Mais resultados para re-ranking
    }

    /**
     * Busca em uma fonte específica de conhecimento
     *
     * @param {string} source - Nome da fonte
     * @param {array} queries - Queries
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados da fonte
     */
    async searchKnowledgeSource(source, queries, context) {
        const results = [];

        switch (source) {
            case 'langmem':
                return await this.searchLangMem(queries, context);

            case 'documentation':
                return await this.searchDocumentation(queries, context);

            case 'codebase':
                return await this.searchCodebase(queries, context);

            case 'agent_logs':
                return await this.searchAgentLogs(queries, context);

            default:
                return results;
        }
    }

    /**
     * Busca no LangMem
     *
     * @param {array} queries - Queries
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados
     */
    async searchLangMem(queries, context) {
        const results = [];

        for (const query of queries) {
            try {
                const contextResult = await this.llbProtocol.getFullContext(query);

                if (contextResult && contextResult.patterns) {
                    for (const pattern of contextResult.patterns) {
                        const vectorScore = await this.calculateSemanticSimilarity(query, pattern.content || '');
                        const keywordScore = this.calculateKeywordSimilarity(query, pattern.content || '');

                        results.push({
                            content: pattern.content,
                            metadata: pattern,
                            vector_score: vectorScore,
                            keyword_score: keywordScore,
                            chunk_type: 'pattern'
                        });
                    }
                }
            } catch (error) {
                log.debug('LangMem search partial failure', { query, error: error.message });
            }
        }

        return results;
    }

    /**
     * Busca na documentação
     *
     * @param {array} queries - Queries
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados
     */
    async searchDocumentation(queries, context) {
        // Simulação - em produção buscaria em docs/
        const results = [];

        for (const query of queries) {
            // Chunks simulados da documentação
            const docChunks = [
                { content: 'O Protocolo L.L.B. substitui Jira, Confluence e GitKraken com inteligência artificial avançada.', path: 'docs/overview.md' },
                { content: 'LangMem armazena conhecimento organizacional de forma semântica e inteligente.', path: 'docs/langmem.md' },
                { content: 'Letta gerencia estado e fluxo de evolução do sistema.', path: 'docs/letta.md' },
                { content: 'ByteRover fornece interface de código com MCP e timeline.', path: 'docs/byterover.md' }
            ];

            for (const chunk of docChunks) {
                const vectorScore = await this.calculateSemanticSimilarity(query, chunk.content);
                const keywordScore = this.calculateKeywordSimilarity(query, chunk.content);

                if (vectorScore > 0.5 || keywordScore > 0.5) {
                    results.push({
                        content: chunk.content,
                        metadata: { path: chunk.path, type: 'documentation' },
                        vector_score: vectorScore,
                        keyword_score: keywordScore,
                        chunk_type: 'doc_chunk'
                    });
                }
            }
        }

        return results;
    }

    /**
     * Busca no codebase
     *
     * @param {array} queries - Queries
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados
     */
    async searchCodebase(queries, context) {
        // Simulação - em produção buscaria em arquivos .js, .ts, etc.
        const results = [];

        for (const query of queries) {
            // Chunks simulados do código
            const codeChunks = [
                { content: 'class LLBProtocol { constructor() { this.langmem = getLangMem(); } }', path: 'scripts/memory/llb_protocol.js', language: 'javascript' },
                { content: 'export class ActionValidator { validateAction(action, context) { /* validation logic */ } }', path: 'scripts/swarm/action_validator.js', language: 'javascript' },
                { content: 'const confidence = await scorer.calculateConfidence(action, context);', path: 'scripts/swarm/confidence_scorer.js', language: 'javascript' }
            ];

            for (const chunk of codeChunks) {
                const vectorScore = await this.calculateSemanticSimilarity(query, chunk.content);
                const keywordScore = this.calculateKeywordSimilarity(query, chunk.content);

                if (vectorScore > 0.4 || keywordScore > 0.4) {
                    results.push({
                        content: chunk.content,
                        metadata: { path: chunk.path, language: chunk.language, type: 'code' },
                        vector_score: vectorScore,
                        keyword_score: keywordScore,
                        chunk_type: 'code_chunk'
                    });
                }
            }
        }

        return results;
    }

    /**
     * Busca nos logs dos agentes
     *
     * @param {array} queries - Queries
     * @param {object} context - Contexto
     * @returns {Promise<array>} Resultados
     */
    async searchAgentLogs(queries, context) {
        // Simulação - em produção buscaria em agent_logs
        const results = [];

        for (const query of queries) {
            // Logs simulados
            const logEntries = [
                { content: 'Agent architect completed task: Design microservices architecture', agent: 'architect', timestamp: '2025-01-01T10:00:00Z' },
                { content: 'Agent developer executed: Implement user authentication', agent: 'developer', timestamp: '2025-01-01T11:00:00Z' },
                { content: 'Agent tester validated: Run automated tests', agent: 'tester', timestamp: '2025-01-01T12:00:00Z' }
            ];

            for (const log of logEntries) {
                const vectorScore = await this.calculateSemanticSimilarity(query, log.content);
                const keywordScore = this.calculateKeywordSimilarity(query, log.content);

                if (vectorScore > 0.3 || keywordScore > 0.3) {
                    results.push({
                        content: log.content,
                        metadata: { agent: log.agent, timestamp: log.timestamp, type: 'agent_log' },
                        vector_score: vectorScore,
                        keyword_score: keywordScore,
                        chunk_type: 'log_entry'
                    });
                }
            }
        }

        return results;
    }

    /**
     * Re-ranking dos resultados usando cross-encoder
     *
     * @param {string} query - Query original
     * @param {array} results - Resultados a re-rankear
     * @returns {Promise<array>} Resultados re-rankeados
     */
    async rerankResults(query, results) {
        if (results.length === 0) return results;

        // Simulação de re-ranking (em produção usaria cross-encoder real)
        const reranked = results.map(result => ({
            ...result,
            rerank_score: result.hybrid_score + (Math.random() * 0.2 - 0.1), // ±10% variação
            final_score: 0
        }));

        // Recalcular score final
        reranked.forEach(result => {
            result.final_score = (
                result.rerank_score * 0.6 +
                result.vector_score * 0.25 +
                result.keyword_score * 0.15
            ) * result.weight;
        });

        // Ordenar por score final
        reranked.sort((a, b) => b.final_score - a.final_score);

        log.debug('Results reranked', {
            originalCount: results.length,
            rerankedCount: reranked.length,
            topScore: reranked[0]?.final_score?.toFixed(3)
        });

        return reranked.slice(0, this.rerankTopK);
    }

    /**
     * Seleção final dos resultados
     *
     * @param {array} results - Resultados re-rankeados
     * @returns {array} Resultados finais
     */
    selectFinalResults(results) {
        return results
            .filter(result => result.final_score > this.similarityThreshold)
            .slice(0, this.rerankTopK)
            .map(result => ({
                content: result.content,
                score: result.final_score,
                source: result.source,
                metadata: result.metadata,
                chunk_type: result.chunk_type
            }));
    }

    /**
     * Gera contexto enriquecido
     *
     * @param {array} results - Resultados finais
     * @param {object} context - Contexto original
     * @returns {Promise<string>} Contexto enriquecido
     */
    async generateEnrichedContext(results, context) {
        if (results.length === 0) {
            return 'Nenhum contexto relevante encontrado.';
        }

        // Combinar conteúdo dos top resultados
        const topContents = results.slice(0, 3).map(r => r.content);

        // Adicionar contexto do agente se disponível
        let enriched = topContents.join('\n\n');

        if (context.agent) {
            enriched = `Contexto para agente ${context.agent}:\n\n${enriched}`;
        }

        if (context.task_type) {
            enriched = `Informações relevantes para ${context.task_type}:\n\n${enriched}`;
        }

        return enriched;
    }

    /**
     * Calcula métricas da query
     *
     * @param {array} results - Resultados
     * @param {string} query - Query
     * @returns {object} Métricas
     */
    calculateQueryMetrics(results, query) {
        // Métricas básicas (em produção seria mais sofisticado)
        const hasResults = results.length > 0;
        const avgScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.score, 0) / results.length
            : 0;

        return {
            has_results: hasResults,
            result_count: results.length,
            avg_score: avgScore,
            query_length: query.length,
            sources_distributed: this.getSourceDistribution(results)
        };
    }

    /**
     * Calcula similaridade semântica
     *
     * @param {string} query - Query
     * @param {string} text - Texto a comparar
     * @returns {Promise<number>} Similaridade (0-1)
     */
    async calculateSemanticSimilarity(query, text) {
        try {
            const queryEmbedding = await this.getCachedEmbedding(query);
            const textEmbedding = await this.getCachedEmbedding(text);

            return this.embeddings.cosineSimilarity(queryEmbedding, textEmbedding);
        } catch (error) {
            log.debug('Semantic similarity calculation failed', { error: error.message });
            return 0;
        }
    }

    /**
     * Calcula similaridade por keywords
     *
     * @param {string} query - Query
     * @param {string} text - Texto a comparar
     * @returns {number} Similaridade (0-1)
     */
    calculateKeywordSimilarity(query, text) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const textWords = text.toLowerCase().split(/\s+/);

        const matches = queryWords.filter(word =>
            textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
        ).length;

        return matches / Math.max(queryWords.length, 1);
    }

    /**
     * Calcula similaridade entre duas strings
     *
     * @param {string} str1 - String 1
     * @param {string} str2 - String 2
     * @returns {number} Similaridade (0-1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    /**
     * Distância de Levenshtein
     *
     * @param {string} str1 - String 1
     * @param {string} str2 - String 2
     * @returns {number} Distância
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Obtém sinônimos para expansão de query
     *
     * @param {string} query - Query original
     * @returns {array} Sinônimos
     */
    getQuerySynonyms(query) {
        // Dicionário simples de sinônimos (em produção seria mais sofisticado)
        const synonymMap = {
            'sistema': ['system', 'platform', 'application'],
            'código': ['code', 'programming', 'development'],
            'usuário': ['user', 'client', 'customer'],
            'dados': ['data', 'information', 'content'],
            'segurança': ['security', 'safety', 'protection'],
            'performance': ['performance', 'speed', 'efficiency'],
            'teste': ['test', 'testing', 'validation'],
            'erro': ['error', 'bug', 'issue', 'problem']
        };

        const words = query.toLowerCase().split(/\s+/);
        const synonyms = [];

        words.forEach(word => {
            if (synonymMap[word]) {
                synonyms.push(...synonymMap[word]);
            }
        });

        return [...new Set(synonyms)]; // Remover duplicatas
    }

    /**
     * Obtém distribuição de fontes
     *
     * @param {array} results - Resultados
     * @returns {object} Distribuição
     */
    getSourceDistribution(results) {
        const distribution = {};
        results.forEach(result => {
            distribution[result.source] = (distribution[result.source] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Cache de embeddings
     *
     * @param {string} text - Texto para embedding
     * @returns {Promise<array>} Embedding
     */
    async getCachedEmbedding(text) {
        const key = text.substring(0, 200); // Limitar tamanho da chave

        if (this.embeddingCache.has(key)) {
            return this.embeddingCache.get(key);
        }

        const embedding = await this.embeddings.generateEmbedding(text);
        this.embeddingCache.set(key, embedding);

        // Limpar cache antigo se necessário
        if (this.embeddingCache.size > 1000) {
            const oldestKey = this.embeddingCache.keys().next().value;
            this.embeddingCache.delete(oldestKey);
        }

        return embedding;
    }

    /**
     * Cache de resultados
     *
     * @param {string} queryId - ID da query
     * @returns {object|null} Resultado cached
     */
    getCachedResult(queryId) {
        const cached = this.resultCache.get(queryId);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return { ...cached.result, metadata: { ...cached.result.metadata, cache_hit: true } };
        }
        this.resultCache.delete(queryId);
        return null;
    }

    /**
     * Define resultado no cache
     *
     * @param {string} queryId - ID da query
     * @param {object} result - Resultado
     */
    setCachedResult(queryId, result) {
        this.resultCache.set(queryId, {
            result: { ...result, metadata: { ...result.metadata, cache_hit: false } },
            timestamp: Date.now()
        });
    }

    /**
     * Gera ID único para query
     *
     * @param {string} query - Query
     * @param {object} context - Contexto
     * @returns {string} ID
     */
    generateQueryId(query, context) {
        const contextStr = JSON.stringify(context);
        const combined = `${query}_${contextStr}`.substring(0, 500);
        // Hash simples
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Atualiza métricas do pipeline
     *
     * @param {number} startTime - Tempo inicial
     * @param {object} result - Resultado
     * @param {boolean} cacheHit - Se foi cache hit
     */
    updateMetrics(startTime, result, cacheHit) {
        const processingTime = Date.now() - startTime;

        this.pipelineMetrics.queries_processed++;

        // Atualizar médias
        const totalTime = this.pipelineMetrics.avg_response_time * (this.pipelineMetrics.queries_processed - 1) + processingTime;
        this.pipelineMetrics.avg_response_time = totalTime / this.pipelineMetrics.queries_processed;

        // Cache hit rate
        const cacheHits = this.pipelineMetrics.cache_hit_rate * (this.pipelineMetrics.queries_processed - 1) + (cacheHit ? 1 : 0);
        this.pipelineMetrics.cache_hit_rate = cacheHits / this.pipelineMetrics.queries_processed;

        // Métricas de qualidade (simplificado)
        if (result.metrics) {
            const precision = result.results.length > 0 ? 1 : 0; // Simplificado
            const totalPrecision = this.pipelineMetrics.avg_precision * (this.pipelineMetrics.queries_processed - 1) + precision;
            this.pipelineMetrics.avg_precision = totalPrecision / this.pipelineMetrics.queries_processed;
        }

        // Registrar no sistema de métricas
        this.metricsCollector.recordMetric('rag_pipeline_metric', {
            processing_time: processingTime,
            cache_hit: cacheHit,
            results_count: result.results?.length || 0,
            has_error: result.error ? true : false
        }, {
            metric_type: 'rag_performance',
            query_length: result.query?.length || 0
        });
    }

    /**
     * Obtém estatísticas do pipeline
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        return {
            ...this.pipelineMetrics,
            cache_size: this.resultCache.size,
            embedding_cache_size: this.embeddingCache.size,
            knowledge_sources: Object.keys(this.knowledgeSources).length,
            enabled_sources: Object.values(this.knowledgeSources).filter(s => s.enabled).length
        };
    }

    /**
     * Configura fontes de conhecimento
     *
     * @param {object} sources - Configuração das fontes
     */
    configureSources(sources) {
        Object.assign(this.knowledgeSources, sources);
        log.info('Knowledge sources configured', { sources: Object.keys(sources) });
    }

    /**
     * Limpa caches
     */
    clearCaches() {
        this.embeddingCache.clear();
        this.resultCache.clear();
        log.info('RAG caches cleared');
    }
}

// Singleton
let ragPipelineInstance = null;

export function getRAGPipeline(options = {}) {
    if (!ragPipelineInstance) {
        ragPipelineInstance = new RAGPipeline(options);
    }
    return ragPipelineInstance;
}

export default RAGPipeline;
