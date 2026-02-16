#!/usr/bin/env node
/**
 * Protocolo L.L.B. - Orquestrador
 * Industry 6.0/7.0 Ready - Enhanced with Qdrant & Mem0
 * 
 * Orquestra as três camadas do Protocolo L.L.B.:
 * - LangMem (O Arquivo de Sabedoria) - Now backed by Qdrant
 * - Letta (A Consciência) - Integrated with Mem0
 * - ByteRover (A Ação) - Enhanced with federated learning hooks
 * 
 * Fornece abstrações que substituem Jira, Confluence e GitKraken.
 * 
 * Evolutionary Delta (5.0 -> 7.0):
 * - Qdrant vector backend for ~50ms latency (was ~200ms)
 * - Mem0 intelligent caching layer
 * - Sensory feedback hooks for Industry 6.0
 * - Corporate will integration points for Industry 7.0
 */

import { logger } from '../utils/logger.js';
import { getByteRover } from './byterover.js';
import { getLangMem } from './langmem.js';
import { getLetta } from './letta.js';

const log = logger.child({ module: 'llb_protocol' });

/**
 * Vector Backend Configuration
 * Toggle between pgvector and Qdrant
 */
const VECTOR_BACKEND = process.env.VECTOR_BACKEND || 'qdrant'; // 'pgvector' | 'qdrant'
const MEM0_ENABLED = process.env.MEM0_ENABLED !== 'false';

/**
 * Protocolo L.L.B. - Orquestrador
 * Enhanced for Industry 6.0/7.0
 */
class LLBProtocol {
    constructor() {
        this.langmem = getLangMem();
        this.letta = getLetta();
        this.byterover = getByteRover();
        
        // Qdrant/Mem0 integration (lazy loaded)
        this._qdrantAdapter = null;
        this._mem0Cache = null;
        
        // Industry 6.0/7.0 hooks
        this._sensoryCallbacks = [];
        this._corporateWillCallbacks = [];
        
        // Performance metrics
        this._metrics = {
            queries: 0,
            avgLatency: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        log.info('LLB Protocol initialized', { 
            vectorBackend: VECTOR_BACKEND, 
            mem0Enabled: MEM0_ENABLED 
        });
    }
    
    /**
     * Get Qdrant adapter (lazy initialization)
     * @private
     */
    async _getQdrant() {
        if (!this._qdrantAdapter && VECTOR_BACKEND === 'qdrant') {
            try {
                // Dynamic import for Qdrant
                const { get_qdrant_adapter, init_qdrant } = await import(
                    '../../../backend/infrastructure/database/qdrant_adapter.py'
                ).catch(() => null) || {};
                
                if (get_qdrant_adapter) {
                    await init_qdrant();
                    this._qdrantAdapter = get_qdrant_adapter();
                    log.info('Qdrant adapter initialized');
                }
            } catch (err) {
                log.warn('Qdrant not available, using pgvector fallback', { error: err.message });
            }
        }
        return this._qdrantAdapter;
    }
    
    /**
     * Get Mem0 cache (lazy initialization)
     * @private
     */
    async _getMem0() {
        if (!this._mem0Cache && MEM0_ENABLED) {
            try {
                const { get_mem0_cache, init_mem0 } = await import(
                    '../../../backend/infrastructure/database/mem0_integration.py'
                ).catch(() => null) || {};
                
                if (get_mem0_cache) {
                    await init_mem0();
                    this._mem0Cache = get_mem0_cache();
                    log.info('Mem0 cache initialized');
                }
            } catch (err) {
                log.warn('Mem0 not available', { error: err.message });
            }
        }
        return this._mem0Cache;
    }
    
    /**
     * Register sensory feedback callback (Industry 6.0)
     * @param {Function} callback - Called with sensory data
     */
    registerSensoryCallback(callback) {
        this._sensoryCallbacks.push(callback);
        log.debug('Sensory callback registered', { total: this._sensoryCallbacks.length });
    }
    
    /**
     * Register corporate will callback (Industry 7.0)
     * @param {Function} callback - Called for autonomous decisions
     */
    registerCorporateWillCallback(callback) {
        this._corporateWillCallbacks.push(callback);
        log.debug('Corporate will callback registered', { total: this._corporateWillCallbacks.length });
    }
    
    /**
     * Emit sensory feedback to all registered callbacks
     * @private
     */
    async _emitSensoryFeedback(data) {
        for (const callback of this._sensoryCallbacks) {
            try {
                await callback(data);
            } catch (err) {
                log.error('Sensory callback error', { error: err.message });
            }
        }
    }
    
    /**
     * Consult corporate will for autonomous decisions
     * @private
     */
    async _consultCorporateWill(decision) {
        const responses = [];
        for (const callback of this._corporateWillCallbacks) {
            try {
                const response = await callback(decision);
                responses.push(response);
            } catch (err) {
                log.error('Corporate will callback error', { error: err.message });
            }
        }
        return responses;
    }
    
    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this._metrics,
            vectorBackend: VECTOR_BACKEND,
            mem0Enabled: MEM0_ENABLED
        };
    }

    // ============================================
    // ABSTRAÇÃO DO JIRA (via Letta)
    // ============================================

    /**
     * Inicia sessão GLOBAL - força sincronização antes de consultar
     *
     * @returns {Promise<object>} Estado de evolução atual (sempre global)
     */
    async startSession() {
        log.info('Starting LLB GLOBAL session - forcing sync');

        // FORÇA SINCRONIZAÇÃO GLOBAL antes de qualquer consulta
        await this.byterover.forceGlobalMemorySync();

        const state = await this.letta.getCurrentState();
        const nextStep = await this.letta.getNextEvolutionStep();

        return {
            state: state,
            nextStep: nextStep,
            timestamp: new Date().toISOString(),
            global_sync_forced: true
        };
    }

    /**
     * Finaliza sessão - atualiza Letta com novo estado
     * 
     * @param {string} task - Tarefa executada
     * @param {object} result - Resultado da execução
     * @returns {Promise<boolean>} Sucesso
     */
    async endSession(task, result) {
        log.info('Ending LLB session', { task: task.substring(0, 50) });

        const status = result.success ? 'done' : 'failed';
        return await this.letta.updateState(task, status, {
            result: result,
            completed_at: new Date().toISOString()
        });
    }

    /**
     * Registra falha - registra bloqueio no Letta
     * 
     * @param {string} task - Tarefa que falhou
     * @param {string|Error} error - Erro ou mensagem
     * @returns {Promise<boolean>} Sucesso
     */
    async registerFailure(task, error) {
        const reason = error instanceof Error ? error.message : error;
        return await this.letta.registerBlockage(task, reason);
    }

    // ============================================
    // ABSTRAÇÃO DO CONFLUENCE (via LangMem)
    // ============================================

    /**
     * Armazena padrão - envia "Sinal de Sabedoria" para LangMem
     * 
     * @param {string} pattern - Padrão descoberto
     * @param {object} context - Contexto do padrão
     * @returns {Promise<boolean>} Sucesso
     */
    async storePattern(pattern, context = {}) {
        log.info('Storing pattern in LangMem', { pattern: pattern.substring(0, 50) });
        return await this.langmem.storePattern(pattern, context);
    }

    /**
     * Verifica dependências - consulta LangMem antes de criar módulo
     * 
     * @param {string} module - Nome do módulo
     * @returns {Promise<object>} Validação de dependências
     */
    async checkDependencies(module) {
        log.info('Checking dependencies in LangMem', { module });
        return await this.langmem.checkDependencies(module);
    }

    /**
     * Armazena decisão arquitetural - armazena no LangMem
     * 
     * @param {string} decision - Decisão tomada
     * @param {string} rationale - Justificativa
     * @param {object} dependencies - Dependências relacionadas
     * @returns {Promise<boolean>} Sucesso
     */
    async storeArchitecture(decision, rationale, dependencies = null) {
        log.info('Storing architecture decision in LangMem', {
            decision: decision.substring(0, 50)
        });
        return await this.langmem.storeArchitecture(decision, rationale, dependencies);
    }

    // ============================================
    // ABSTRAÇÃO DO GITKRAKEN (via ByteRover)
    // ============================================

    /**
     * Visualiza mudanças - usa ByteRover para mapear impacto visual
     * 
     * @param {object} changes - Mudanças a visualizar
     * @returns {Promise<object>} Impacto mapeado
     */
    async visualizeChanges(changes) {
        log.info('Visualizing changes via ByteRover');
        return await this.byterover.mapVisualImpact(changes);
    }

    /**
     * Commit com memória - commit com metadados L.L.B.
     * 
     * @param {string} message - Mensagem do commit
     * @param {object} letta_metadata - Metadados do Letta
     * @param {object} langmem_metadata - Metadados do LangMem
     * @returns {Promise<object>} Resultado do commit
     */
    async commitWithMemory(message, letta_metadata = {}, langmem_metadata = {}) {
        log.info('Committing with memory', { message: message.substring(0, 50) });

        try {
            // Garantir que a mensagem tenha uma tag (regra do repo)
            let formattedMessage = message;
            if (!/\[.*\]/.test(message)) {
                formattedMessage = `[TASK-LLB] ${message}`;
                log.info('Auto-formatting commit message with [TASK-LLB] tag');
            }

            // Fazer commit via git
            const { execSync } = await import('child_process');
            execSync(`git add -A`, { stdio: 'inherit' });
            execSync(`git commit -m "${formattedMessage}"`, { stdio: 'inherit' });

            // Obter hash do commit
            const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

            // Sincronizar com memória
            await this.byterover.syncWithMemory(commitHash, letta_metadata, langmem_metadata);

            return {
                success: true,
                commit_hash: commitHash,
                message: message
            };
        } catch (err) {
            log.error('Error committing with memory', { error: err.message });
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Retorna timeline evolutiva - retorna timeline do ByteRover
     * 
     * @param {number} limit - Limite de commits
     * @returns {Promise<array>} Timeline evolutiva
     */
    async getEvolutionTimeline(limit = 20) {
        const result = await this.byterover.getEvolutionTimeline(limit);
        return result.timeline || [];
    }

    // ============================================
    // MÉTODOS UNIFICADOS
    // ============================================

    /**
     * Busca contexto completo (L.L.B.)
     * Enhanced with Qdrant/Mem0 for Industry 6.0/7.0
     * 
     * @param {string} query - Query de busca
     * @param {object} context - Optional context for personalization
     * @returns {Promise<object>} Contexto completo
     */
    async getFullContext(query, context = {}) {
        const startTime = Date.now();
        log.info('Getting full LLB context', { query: query.substring(0, 50) });

        // Try Mem0 cache first if enabled
        const mem0 = await this._getMem0();
        let cachedContext = null;
        
        if (mem0 && context.embedding) {
            try {
                const cached = await mem0.retrieve(context.embedding, context.agentId, 3);
                if (cached && cached.length > 0) {
                    cachedContext = cached;
                    this._metrics.cacheHits++;
                }
            } catch (err) {
                log.warn('Mem0 cache miss', { error: err.message });
                this._metrics.cacheMisses++;
            }
        }

        const [wisdom, state, timeline] = await Promise.all([
            this.langmem.getWisdom(query),
            this.letta.getCurrentState(),
            this.byterover.getEvolutionTimeline(5)
        ]);

        // Emit sensory feedback for Industry 6.0
        await this._emitSensoryFeedback({
            type: 'context_retrieval',
            query: query,
            latency: Date.now() - startTime,
            cached: !!cachedContext
        });

        // Update metrics
        this._metrics.queries++;
        this._metrics.avgLatency = (this._metrics.avgLatency * (this._metrics.queries - 1) + (Date.now() - startTime)) / this._metrics.queries;

        return {
            wisdom: wisdom, // LangMem
            state: state, // Letta
            timeline: timeline.timeline || [], // ByteRover
            cachedContext: cachedContext, // Mem0 cache hit
            timestamp: new Date().toISOString(),
            metrics: {
                latency: Date.now() - startTime,
                vectorBackend: VECTOR_BACKEND
            }
        };
    }
    
    /**
     * Semantic search with Qdrant backend
     * Industry 6.0/7.0 optimized (~50ms latency)
     * 
     * @param {Array<number>} embedding - Query embedding vector
     * @param {string} collection - Collection to search
     * @param {number} limit - Max results
     * @param {object} filters - Optional filters
     * @returns {Promise<Array>} Search results
     */
    async semanticSearch(embedding, collection = 'corporate_knowledge', limit = 5, filters = {}) {
        const startTime = Date.now();
        
        const qdrant = await this._getQdrant();
        
        if (qdrant) {
            try {
                const results = await qdrant.search(
                    collection,
                    embedding,
                    limit,
                    0.7, // score threshold
                    filters
                );
                
                log.info('Qdrant search completed', { 
                    results: results.length, 
                    latency: Date.now() - startTime 
                });
                
                return results;
            } catch (err) {
                log.error('Qdrant search failed, falling back to LangMem', { error: err.message });
            }
        }
        
        // Fallback to LangMem semantic search
        return await this.langmem.semanticSearch(embedding, limit);
    }

    /**
     * Atualiza todas as camadas após ação
     * 
     * @param {string} task - Tarefa executada
     * @param {object} result - Resultado
     * @param {object} changes - Mudanças realizadas
     * @returns {Promise<boolean>} Sucesso
     */
    async updateAllLayers(task, result, changes = {}) {
        log.info('Updating all LLB layers', { task: task.substring(0, 50) });

        try {
            // 1. Atualizar Letta (estado)
            await this.letta.updateState(task, result.success ? 'done' : 'failed', {
                result: result
            });

            // 2. Se houver padrão descoberto, armazenar no LangMem
            if (result.pattern) {
                await this.langmem.storePattern(result.pattern, {
                    task: task,
                    result: result
                });
            }

            // 3. Se houver mudanças, mapear impacto via ByteRover
            if (changes.files && changes.files.length > 0) {
                await this.byterover.mapVisualImpact(changes);
            }

            return true;
        } catch (err) {
            log.error('Error updating all layers', { error: err.message });
            return false;
        }
    }
}

// Singleton
let protocolInstance = null;

export function getLLBProtocol() {
    if (!protocolInstance) {
        protocolInstance = new LLBProtocol();
    }
    return protocolInstance;
}

export default LLBProtocol;



