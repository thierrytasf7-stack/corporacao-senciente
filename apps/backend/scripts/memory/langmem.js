#!/usr/bin/env node
/**
 * LangMem - O Arquivo de Sabedoria
 * 
 * Memória de longo prazo que substitui Confluence.
 * Armazena arquitetura, regras de negócio imutáveis, grafos de dependência.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'langmem' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * LangMem - Memória de Longo Prazo GLOBAL
 */
class LangMem {
    constructor() {
        this.cache = new Map(); // Cache em memória (apenas otimização)
        this.cacheTimeout = 60 * 1000; // 1 minuto (força sincronização frequente)
        this.embeddingsService = getEmbeddingsService();
        this.forceGlobalSync = true; // Sempre forçar sincronização global
    }

    /**
     * Armazena sabedoria arquitetural
     * 
     * @param {string} content - Conteúdo da sabedoria
     * @param {string} category - Categoria (architecture, business_rules, patterns)
     * @param {object} graph_dependencies - Grafos de dependência (opcional)
     * @returns {Promise<boolean>} Sucesso
     */
    async storeWisdom(content, category = 'architecture', graph_dependencies = null) {
        if (!supabase) {
            log.warn('Supabase not available, wisdom not stored');
            return false;
        }

        try {
            // Criar embedding do conteúdo usando serviço avançado
            const contentEmbedding = await this.embeddingsService.generateEmbedding(content);
            const embeddingStr = `[${contentEmbedding.join(',')}]`;

            // Preparar dados
            const wisdomData = {
                content: content,
                category: category,
                embedding: embeddingStr,
                graph_dependencies: graph_dependencies ? JSON.stringify(graph_dependencies) : null,
                created_at: new Date().toISOString()
            };

            // Armazenar em corporate_memory (categoria específica)
            const { error } = await supabase
                .from('corporate_memory')
                .insert({
                    content: content,
                    category: category,
                    embedding: embeddingStr,
                    // Armazenar graph_dependencies como JSONB se coluna existir
                    // Por enquanto, armazenar em content como JSON
                    ...(graph_dependencies && {
                        content: JSON.stringify({
                            content: content,
                            graph_dependencies: graph_dependencies
                        })
                    })
                });

            if (error) {
                log.error('Error storing wisdom', { error: error.message });
                return false;
            }

            log.info('Wisdom stored', { category, contentLength: content.length });
            return true;
        } catch (err) {
            log.error('Exception storing wisdom', { error: err.message });
            return false;
        }
    }

    /**
     * Busca sabedoria GLOBAL (sempre sincronizada)
     *
     * @param {string} query - Query de busca
     * @param {string} category - Categoria específica (opcional)
     * @returns {Promise<array>} Sabedoria encontrada (sempre do banco)
     */
    async getWisdom(query, category = null) {
        if (!supabase) {
            return [];
        }

        // FORÇA SINCRONIZAÇÃO GLOBAL: Sempre consultar banco primeiro
        log.info('🔄 Forçando sincronização global de memórias', { query: query.substring(0, 50) });

        try {
            // Criar embedding da query
            const queryEmbedding = await this.embeddingsService.generateEmbedding(query);
            const embeddingStr = `[${queryEmbedding.join(',')}]`;

            // Buscar DIRETAMENTE do banco (sempre fresh)
            let query_builder = supabase
                .rpc('match_corporate_memory', {
                    query_embedding: embeddingStr,
                    match_count: 10
                });

            const { data, error } = await query_builder;

            if (error) {
                log.error('Error getting wisdom from global sync', { error: error.message });
                return [];
            }

            let results = data || [];

            // --- SELF-HEALING: DEEP SCAN FALLBACK ---
            // Se o índice do servidor estiver falhando (retornando poucos ou maus resultados),
            // baixamos os dados recentes e fazemos a busca vetorial localmente.
            const isWeakResult = results.length === 0 || (results[0] && results[0].similarity < 0.65);

            if (this.forceGlobalSync && isWeakResult) {
                log.warn('⚠️ RPC Vector Search returned weak results. Engaging Client-Side Deep Scan...', {
                    rpcCount: results.length,
                    topSim: results[0]?.similarity || 0
                });

                // Baixar últimas 200 memórias (buffer seguro para contexto recente)
                const deepLimit = 200;
                const { data: rawRows, error: rawError } = await supabase
                    .from('corporate_memory')
                    .select('id, content, category, embedding')
                    .order('created_at', { ascending: false })
                    .limit(deepLimit);

                if (!rawError && rawRows && rawRows.length > 0) {
                    const localResults = rawRows.map(row => {
                        let vec = null;
                        try {
                            vec = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
                        } catch (e) { /* ignore */ }

                        if (!vec) return null;

                        const sim = this.embeddingsService.cosineSimilarity(queryEmbedding, vec);
                        return {
                            id: row.id,
                            content: row.content,
                            category: row.category,
                            similarity: sim
                        };
                    })
                        .filter(r => r !== null && r.similarity > 0.5) // Filtro mínimo
                        .sort((a, b) => b.similarity - a.similarity)
                        .slice(0, 10); // Top 10

                    if (localResults.length > 0) {
                        log.info(`✅ Deep Scan rescued ${localResults.length} memories! Top Sim: ${(localResults[0].similarity * 100).toFixed(1)}%`);
                        // Se o Top 1 do local for melhor que o do RPC, usamos o local
                        if (localResults[0].similarity > (results[0]?.similarity || 0)) {
                            results = localResults;
                        } else {
                            // Merge results uniquely
                            const combined = [...results, ...localResults];
                            const unique = combined.filter((item, index, self) =>
                                index === self.findIndex((t) => t.id === item.id)
                            );
                            unique.sort((a, b) => b.similarity - a.similarity);
                            results = unique.slice(0, 10);
                        }
                    }
                }
            }
            // ----------------------------------------

            // Filtrar por categoria se especificada
            if (category) {
                results = results.filter(r => r.category === category);
            }

            // Parsear graph_dependencies se existir
            results = results.map(r => {
                try {
                    const parsed = JSON.parse(r.content);
                    if (parsed.graph_dependencies) {
                        r.graph_dependencies = parsed.graph_dependencies;
                        r.content = parsed.content || r.content;
                    }
                } catch (e) {
                    // Não é JSON, manter como está
                }
                return r;
            });

            // Cache apenas como fallback (não prioridade)
            if (this.forceGlobalSync) {
                const cacheKey = `wisdom_${query}_${category || 'all'}`;
                this.cache.set(cacheKey, {
                    data: results,
                    timestamp: Date.now()
                });

                // Manter cache pequeno para emergência
                if (this.cache.size > 20) {
                    const entries = Array.from(this.cache.entries());
                    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                    this.cache = new Map(entries.slice(0, 20));
                }
            }

            log.info('✅ Memória global sincronizada', { resultsCount: results.length });
            return results;

        } catch (err) {
            log.error('Exception in global wisdom sync', { error: err.message });

            // Fallback: tentar cache se falhar
            if (this.forceGlobalSync) {
                const cacheKey = `wisdom_${query}_${category || 'all'}`;
                const cached = this.cache.get(cacheKey);
                if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                    log.warn('Usando cache local como fallback', { cacheAge: Date.now() - cached.timestamp });
                    return cached.data;
                }
            }

            return [];
        }
    }

    /**
     * Verifica grafos de dependência antes de criar módulo
     * 
     * @param {string} module - Nome do módulo a criar
     * @returns {Promise<object>} Dependências encontradas e validação
     */
    async checkDependencies(module) {
        log.info('Checking dependencies', { module });

        try {
            // Buscar sabedoria sobre dependências
            const wisdom = await this.getWisdom(`dependencies ${module}`, 'architecture');

            const dependencies = {
                required: [],
                optional: [],
                conflicts: [],
                warnings: []
            };

            // Analisar sabedoria encontrada
            for (const w of wisdom) {
                try {
                    const parsed = JSON.parse(w.content);
                    if (parsed.graph_dependencies) {
                        const deps = parsed.graph_dependencies[module];
                        if (deps) {
                            if (deps.required) dependencies.required.push(...deps.required);
                            if (deps.optional) dependencies.optional.push(...deps.optional);
                            if (deps.conflicts) dependencies.conflicts.push(...deps.conflicts);
                            if (deps.warnings) dependencies.warnings.push(...deps.warnings);
                        }
                    }
                } catch (e) {
                    // Não é JSON estruturado, continuar
                }
            }

            // Verificar conflitos
            const hasConflicts = dependencies.conflicts.length > 0;
            const hasWarnings = dependencies.warnings.length > 0;

            return {
                module: module,
                dependencies: dependencies,
                canCreate: !hasConflicts,
                hasWarnings: hasWarnings,
                message: hasConflicts
                    ? `Conflitos detectados: ${dependencies.conflicts.join(', ')}`
                    : hasWarnings
                        ? `Avisos: ${dependencies.warnings.join(', ')}`
                        : 'Sem conflitos detectados'
            };
        } catch (err) {
            log.error('Error checking dependencies', { error: err.message });
            return {
                module: module,
                dependencies: { required: [], optional: [], conflicts: [], warnings: [] },
                canCreate: true,
                hasWarnings: false,
                message: 'Erro ao verificar dependências, permitindo criação'
            };
        }
    }

    /**
     * Armazena padrão técnico descoberto
     * 
     * @param {string} pattern - Padrão descoberto
     * @param {object} context - Contexto do padrão
     * @returns {Promise<boolean>} Sucesso
     */
    async storePattern(pattern, context = {}) {
        const content = `Padrão Técnico: ${pattern}\n\nContexto: ${JSON.stringify(context, null, 2)}`;
        return await this.storeWisdom(content, 'patterns', {
            pattern: pattern,
            context: context
        });
    }

    /**
     * Armazena decisão arquitetural
     * 
     * @param {string} decision - Decisão tomada
     * @param {string} rationale - Justificativa
     * @param {object} dependencies - Dependências relacionadas
     * @returns {Promise<boolean>} Sucesso
     */
    async storeArchitecture(decision, rationale, dependencies = null) {
        const content = `Decisão Arquitetural: ${decision}\n\nJustificativa: ${rationale}`;
        return await this.storeWisdom(content, 'architecture', dependencies);
    }
}

// Singleton
let langmemInstance = null;

export function getLangMem() {
    if (!langmemInstance) {
        langmemInstance = new LangMem();
    }
    return langmemInstance;
}

export default LangMem;



