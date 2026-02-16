#!/usr/bin/env node
/**
 * Advanced Model Router - Roteamento Avançado de Modelos
 *
 * Sistema inteligente de roteamento baseado em múltiplas estratégias avançadas:
 * - CARGO: Category-Aware Routing com embeddings e regressores
 * - HierRouter: Hierarchical Routing com MDP e RL
 * - xRouter: Cost-Aware Orchestration com tool-calling
 * - MasRouter: Multi-Agent System Routing
 */

import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';
import { getCostOptimizer } from './cost_optimizer.js';
import { getModelRouter } from './model_router.js';

const log = logger.child({ module: 'advanced_model_router' });

/**
 * Advanced Model Router - Sistema de Roteamento Inteligente
 */
export class AdvancedModelRouter {
    constructor(options = {}) {
        this.embeddingsService = getEmbeddingsService();
        this.modelRouter = getModelRouter();
        this.costOptimizer = getCostOptimizer();
        this.distributedTracer = getDistributedTracer();

        // Estratégias de roteamento
        this.routingStrategies = {
            cargo: new CategoryAwareRouter(options.cargo),
            hierRouter: new HierarchicalRouter(options.hierRouter),
            xRouter: new CostAwareRouter(options.xRouter),
            masRouter: new MultiAgentRouter(options.masRouter)
        };

        // Configurações
        this.primaryStrategy = options.primaryStrategy || 'cargo';
        this.fallbackStrategies = options.fallbackStrategies || ['hierRouter', 'xRouter', 'masRouter'];
        this.confidenceThreshold = options.confidenceThreshold || 0.7;

        // Estado de aprendizado
        this.routingHistory = [];
        this.performanceMetrics = new Map();
        this.strategyWeights = {
            cargo: 1.0,
            hierRouter: 1.0,
            xRouter: 1.0,
            masRouter: 1.0
        };

        // Cache de decisões
        this.decisionCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutos

        log.info('AdvancedModelRouter initialized', {
            primaryStrategy: this.primaryStrategy,
            fallbackStrategies: this.fallbackStrategies.length,
            confidenceThreshold: this.confidenceThreshold
        });
    }

    /**
     * Inicializar router avançado
     */
    async initialize() {
        log.info('Initializing Advanced Model Router...');

        // Inicializar todas as estratégias
        for (const [name, strategy] of Object.entries(this.routingStrategies)) {
            try {
                await strategy.initialize();
                log.debug(`Strategy ${name} initialized`);
            } catch (error) {
                log.warn(`Failed to initialize strategy ${name}`, { error: error.message });
            }
        }

        // Carregar dados de aprendizado se existirem
        await this.loadLearningData();

        log.info('Advanced Model Router initialized successfully');
    }

    /**
     * Roteamento principal com múltiplas estratégias
     */
    async routeRequest(request, context = {}) {
        const requestId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return await this.distributedTracer.traceCriticalOperation(
            'advanced_model_routing',
            async () => {
                // Verificar cache primeiro
                const cacheKey = this.generateCacheKey(request, context);
                if (this.decisionCache.has(cacheKey)) {
                    const cached = this.decisionCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < this.cacheTimeout) {
                        log.debug('Using cached routing decision', { requestId });
                        return cached.decision;
                    }
                }

                // Aplicar estratégia primária
                const primaryResult = await this.routingStrategies[this.primaryStrategy].route(request, context);

                if (primaryResult.confidence >= this.confidenceThreshold) {
                    return await this.finalizeRoutingDecision(primaryResult, requestId, 'primary');
                }

                // Aplicar estratégias de fallback
                for (const strategyName of this.fallbackStrategies) {
                    try {
                        const fallbackResult = await this.routingStrategies[strategyName].route(request, context);

                        if (fallbackResult.confidence >= this.confidenceThreshold) {
                            log.info('Fallback strategy succeeded', {
                                requestId,
                                primary: this.primaryStrategy,
                                fallback: strategyName,
                                confidence: fallbackResult.confidence
                            });

                            return await this.finalizeRoutingDecision(fallbackResult, requestId, 'fallback');
                        }
                    } catch (error) {
                        log.warn(`Fallback strategy ${strategyName} failed`, {
                            requestId,
                            error: error.message
                        });
                    }
                }

                // Estratégia final: usar router básico
                const basicDecision = await this.modelRouter.findBestAgent(request, context);
                const finalResult = {
                    model: basicDecision.model || 'gpt-4',
                    agent: basicDecision.agent || 'architect',
                    confidence: 0.5,
                    reasoning: 'Fallback to basic routing',
                    strategy: 'basic',
                    metadata: {
                        requestId,
                        routingPath: [this.primaryStrategy, ...this.fallbackStrategies, 'basic']
                    }
                };

                log.warn('All advanced strategies failed, using basic routing', { requestId });

                return await this.finalizeRoutingDecision(finalResult, requestId, 'basic_fallback');
            },
            {
                type: 'model_routing',
                strategy: 'advanced',
                requestComplexity: request.complexity || 'medium',
                userId: context.userId
            }
        );
    }

    /**
     * Finalizar decisão de roteamento
     */
    async finalizeRoutingDecision(result, requestId, routingType) {
        // Registrar decisão
        const decisionRecord = {
            requestId,
            timestamp: Date.now(),
            result,
            routingType
        };

        this.routingHistory.push(decisionRecord);

        // Cache da decisão
        const cacheKey = this.generateCacheKey(result.originalRequest || {}, result.context || {});
        this.decisionCache.set(cacheKey, {
            timestamp: Date.now(),
            decision: result
        });

        // Limpar cache antigo
        this.cleanupCache();

        // Aprendizado contínuo
        await this.updateLearning(result);

        // Tracing
        await this.distributedTracer.createChildSpan(
            'advanced_routing_trace',
            'routing_decision_finalized',
            {
                'routing.request_id': requestId,
                'routing.strategy': result.strategy,
                'routing.model': result.model,
                'routing.confidence': result.confidence,
                'routing.type': routingType
            }
        );

        log.info('Routing decision finalized', {
            requestId,
            model: result.model,
            confidence: result.confidence,
            strategy: result.strategy
        });

        return result;
    }

    /**
     * Atualizar aprendizado baseado em resultado
     */
    async updateLearning(result) {
        // Atualizar métricas de performance por estratégia
        const strategy = result.strategy;
        if (!this.performanceMetrics.has(strategy)) {
            this.performanceMetrics.set(strategy, {
                requests: 0,
                successes: 0,
                avgConfidence: 0,
                avgLatency: 0
            });
        }

        const metrics = this.performanceMetrics.get(strategy);
        metrics.requests++;

        if (result.confidence >= 0.7) {
            metrics.successes++;
        }

        // Atualizar pesos das estratégias baseado em performance
        this.updateStrategyWeights();
    }

    /**
     * Atualizar pesos das estratégias
     */
    updateStrategyWeights() {
        for (const [strategy, metrics] of this.performanceMetrics.entries()) {
            if (metrics.requests > 10) { // Mínimo de amostras
                const successRate = metrics.successes / metrics.requests;
                const avgConfidence = metrics.avgConfidence || 0.5;

                // Peso baseado em taxa de sucesso e confiança média
                this.strategyWeights[strategy] = successRate * 0.7 + avgConfidence * 0.3;
            }
        }

        // Normalizar pesos
        const totalWeight = Object.values(this.strategyWeights).reduce((sum, w) => sum + w, 0);
        Object.keys(this.strategyWeights).forEach(strategy => {
            this.strategyWeights[strategy] /= totalWeight;
        });
    }

    /**
     * Obter estatísticas do router
     */
    getStats() {
        const strategyStats = {};
        for (const [name, strategy] of Object.entries(this.routingStrategies)) {
            strategyStats[name] = strategy.getStats ? strategy.getStats() : {};
        }

        return {
            primaryStrategy: this.primaryStrategy,
            strategyWeights: this.strategyWeights,
            routingHistorySize: this.routingHistory.length,
            cacheSize: this.decisionCache.size,
            performanceMetrics: Object.fromEntries(this.performanceMetrics.entries()),
            strategyStats
        };
    }

    /**
     * Métodos auxiliares
     */
    generateCacheKey(request, context) {
        // Criar chave baseada em características principais
        const key = {
            complexity: request.complexity,
            type: request.type,
            userId: context.userId,
            agent: context.agent
        };
        return JSON.stringify(key);
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, cached] of this.decisionCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.decisionCache.delete(key);
            }
        }
    }

    async loadLearningData() {
        // Em produção, carregaria dados de aprendizado persistidos
        // Por enquanto, começa com dados vazios
    }
}

/**
 * Category-Aware Router (CARGO-inspired)
 * Baseado no paper CARGO: Category-Aware Routing usando embeddings e regressores
 */
class CategoryAwareRouter {
    constructor(options = {}) {
        this.embeddingsService = getEmbeddingsService();
        this.categoryEmbeddings = new Map();
        this.modelEmbeddings = new Map();
        this.categoryRegressor = new Map(); // Modelo simples de regressão
        this.trainingData = [];

        // Configurações CARGO
        this.embeddingDim = options.embeddingDim || 384;
        this.learningRate = options.learningRate || 0.01;
        this.epochs = options.epochs || 100;

        // Dados de categoria
        this.categories = {
            'simple_query': { complexity: 0.2, tokens: 100 },
            'code_generation': { complexity: 0.7, tokens: 500 },
            'analysis': { complexity: 0.8, tokens: 800 },
            'creative': { complexity: 0.6, tokens: 300 },
            'debugging': { complexity: 0.5, tokens: 400 },
            'documentation': { complexity: 0.4, tokens: 200 }
        };
    }

    async initialize() {
        log.info('Initializing Category-Aware Router (CARGO)');

        // Gerar embeddings para categorias
        for (const [category, metadata] of Object.entries(this.categories)) {
            const text = `${category} ${JSON.stringify(metadata)}`;
            const embedding = await this.embeddingsService.generateEmbedding(text);
            this.categoryEmbeddings.set(category, embedding);
        }

        // Inicializar regressor simples
        this.initializeRegressor();

        log.info('Category-Aware Router initialized');
    }

    async route(request, context) {
        const startTime = Date.now();

        // Classificar categoria da requisição
        const category = await this.classifyRequest(request, context);
        const categoryEmbedding = this.categoryEmbeddings.get(category);

        // Encontrar melhor modelo usando regressor
        const modelScores = await this.scoreModelsForCategory(category, categoryEmbedding, request);

        // Selecionar modelo com maior score
        const bestModel = Object.entries(modelScores)
            .sort(([, a], [, b]) => b.score - a.score)[0];

        const confidence = bestModel ? bestModel[1].score : 0.3;

        return {
            model: bestModel ? bestModel[0] : 'gpt-4',
            agent: this.selectAgentForCategory(category, request),
            confidence,
            reasoning: `Category: ${category}, Model selection based on CARGO regressor`,
            strategy: 'cargo',
            category,
            metadata: {
                categoryEmbedding: categoryEmbedding?.slice(0, 5), // Apenas primeiros 5 valores
                modelScores,
                routingTime: Date.now() - startTime
            }
        };
    }

    async classifyRequest(request, context) {
        // Classificação baseada em heurísticas e embeddings
        const text = `${request.type || 'unknown'} ${request.description || ''} ${request.complexity || 'medium'}`;

        let bestCategory = 'simple_query';
        let bestSimilarity = 0;

        for (const [category, embedding] of this.categoryEmbeddings.entries()) {
            const requestEmbedding = await this.embeddingsService.generateEmbedding(text);
            const similarity = this.cosineSimilarity(requestEmbedding, embedding);

            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestCategory = category;
            }
        }

        // Ajustar baseado em complexidade declarada
        if (request.complexity === 'high' && ['analysis', 'code_generation'].includes(bestCategory)) {
            // Manter categoria complexa
        } else if (request.complexity === 'low') {
            bestCategory = 'simple_query';
        }

        return bestCategory;
    }

    async scoreModelsForCategory(category, categoryEmbedding, request) {
        const modelCosts = {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 },
            'llama2:13b': { input: 0, output: 0 }
        };

        const scores = {};

        for (const [model, costs] of Object.entries(modelCosts)) {
            // Score baseado em adequação à categoria (regressor CARGO)
            const categoryScore = this.categoryRegressor.get(category)?.[model] || 0.5;

            // Penalização por custo
            const estimatedTokens = this.categories[category]?.tokens || 300;
            const estimatedCost = estimatedTokens * costs.input / 1000;
            const costPenalty = Math.max(0, (estimatedCost - 0.01) / 0.01); // Penalizar custos > $0.01

            // Score final
            const finalScore = categoryScore * 0.8 - costPenalty * 0.2;

            scores[model] = {
                score: Math.max(0.1, Math.min(1.0, finalScore)),
                categoryScore,
                costPenalty,
                estimatedCost
            };
        }

        return scores;
    }

    selectAgentForCategory(category, request) {
        const agentMapping = {
            'code_generation': 'developer',
            'analysis': 'analyst',
            'debugging': 'developer',
            'documentation': 'analyst',
            'creative': 'architect',
            'simple_query': 'assistant'
        };

        return agentMapping[category] || 'architect';
    }

    initializeRegressor() {
        // Regressor simples baseado em regras
        const baseScores = {
            'simple_query': { 'gpt-3.5-turbo': 0.9, 'claude-3-haiku': 0.8, 'llama2:13b': 0.7, 'gpt-4': 0.4 },
            'code_generation': { 'gpt-4': 0.95, 'claude-3-sonnet': 0.9, 'gpt-3.5-turbo': 0.6, 'llama2:13b': 0.3 },
            'analysis': { 'gpt-4': 0.9, 'claude-3-opus': 0.95, 'claude-3-sonnet': 0.8, 'gpt-3.5-turbo': 0.5 },
            'creative': { 'claude-3-opus': 0.9, 'gpt-4': 0.85, 'claude-3-sonnet': 0.7, 'gpt-3.5-turbo': 0.6 },
            'debugging': { 'gpt-4': 0.9, 'claude-3-haiku': 0.8, 'gpt-3.5-turbo': 0.7, 'llama2:13b': 0.5 },
            'documentation': { 'claude-3-haiku': 0.9, 'gpt-3.5-turbo': 0.8, 'llama2:13b': 0.7, 'gpt-4': 0.6 }
        };

        for (const [category, modelScores] of Object.entries(baseScores)) {
            this.categoryRegressor.set(category, modelScores);
        }
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

/**
 * Hierarchical Router (HierRouter-inspired)
 * Baseado no paper HierRouter usando MDP simplificado e reinforcement learning
 */
class HierarchicalRouter {
    constructor(options = {}) {
        this.stateSpace = new Map(); // Estados do MDP
        this.actionSpace = ['gpt-4', 'gpt-3.5-turbo', 'claude-3-haiku', 'llama2:13b'];
        this.qTable = new Map(); // Tabela Q para RL
        this.learningRate = options.learningRate || 0.1;
        this.discountFactor = options.discountFactor || 0.9;
        this.explorationRate = options.explorationRate || 0.1;

        // Estados hierárquicos
        this.hierarchyLevels = {
            task_type: ['simple', 'medium', 'complex'],
            user_context: ['new', 'experienced', 'expert'],
            time_pressure: ['low', 'medium', 'high']
        };
    }

    async initialize() {
        log.info('Initializing Hierarchical Router (HierRouter)');

        // Inicializar Q-table com valores aleatórios
        this.initializeQTable();

        log.info('Hierarchical Router initialized');
    }

    async route(request, context) {
        const startTime = Date.now();

        // Determinar estado atual baseado na hierarquia
        const state = this.determineHierarchicalState(request, context);

        // Selecionar ação usando política epsilon-greedy
        const action = this.selectAction(state);

        // Calcular confiança baseada no valor Q
        const qValue = this.getQValue(state, action);
        const confidence = Math.min(1.0, Math.max(0.1, (qValue + 1) / 2)); // Normalizar para 0.1-1.0

        // Selecionar agente baseado na ação
        const agent = this.selectAgentForAction(action, request);

        return {
            model: action,
            agent,
            confidence,
            reasoning: `Hierarchical state: ${JSON.stringify(state)}, Selected action: ${action}`,
            strategy: 'hierRouter',
            state,
            metadata: {
                qValue,
                explorationUsed: Math.random() < this.explorationRate,
                routingTime: Date.now() - startTime,
                hierarchyLevel: this.getHierarchyLevel(state)
            }
        };
    }

    determineHierarchicalState(request, context) {
        return {
            task_type: this.classifyTaskType(request),
            user_context: this.classifyUserContext(context),
            time_pressure: this.classifyTimePressure(request, context)
        };
    }

    classifyTaskType(request) {
        const complexity = request.complexity || 'medium';
        const type = request.type || 'unknown';

        if (complexity === 'high' || ['analysis', 'code_generation', 'debugging'].includes(type)) {
            return 'complex';
        } else if (complexity === 'low' || ['simple_query', 'basic'].includes(type)) {
            return 'simple';
        }
        return 'medium';
    }

    classifyUserContext(context) {
        // Lógica simplificada baseada em histórico do usuário
        // Em produção, seria baseado em dados reais do usuário
        return 'experienced'; // Padrão
    }

    classifyTimePressure(request, context) {
        // Lógica baseada em deadline ou urgência
        if (request.deadline && new Date(request.deadline) - Date.now() < 3600000) { // < 1 hora
            return 'high';
        } else if (request.priority === 'high') {
            return 'medium';
        }
        return 'low';
    }

    selectAction(state) {
        const stateKey = JSON.stringify(state);

        if (Math.random() < this.explorationRate) {
            // Exploração: escolher ação aleatória
            return this.actionSpace[Math.floor(Math.random() * this.actionSpace.length)];
        } else {
            // Explotação: escolher melhor ação baseada em Q-table
            let bestAction = this.actionSpace[0];
            let bestValue = this.getQValue(stateKey, bestAction);

            for (const action of this.actionSpace) {
                const value = this.getQValue(stateKey, action);
                if (value > bestValue) {
                    bestValue = value;
                    bestAction = action;
                }
            }

            return bestAction;
        }
    }

    getQValue(stateKey, action) {
        const key = `${stateKey}_${action}`;
        return this.qTable.get(key) || 0;
    }

    selectAgentForAction(action, request) {
        const agentMapping = {
            'gpt-4': 'architect',
            'gpt-3.5-turbo': 'developer',
            'claude-3-haiku': 'analyst',
            'llama2:13b': 'assistant'
        };

        return agentMapping[action] || 'architect';
    }

    getHierarchyLevel(state) {
        // Determinar nível hierárquico baseado no estado
        if (state.task_type === 'complex' && state.time_pressure === 'high') {
            return 'high_priority';
        } else if (state.task_type === 'complex') {
            return 'complex_task';
        } else if (state.user_context === 'expert') {
            return 'expert_user';
        }
        return 'standard';
    }

    initializeQTable() {
        // Inicializar Q-table com valores baseados em heurísticas
        const baseValues = {
            'gpt-4': 0.8,        // Melhor para tarefas complexas
            'gpt-3.5-turbo': 0.6, // Bom para tarefas padrão
            'claude-3-haiku': 0.7, // Bom custo-benefício
            'llama2:13b': 0.4    // Melhor para tarefas simples
        };

        // Para cada combinação possível de estado
        const allStates = this.generateAllStates();

        for (const state of allStates) {
            const stateKey = JSON.stringify(state);

            for (const action of this.actionSpace) {
                const key = `${stateKey}_${action}`;
                let initialValue = baseValues[action] || 0.5;

                // Ajustar baseado no estado
                if (state.task_type === 'complex' && action === 'gpt-4') {
                    initialValue += 0.2;
                } else if (state.task_type === 'simple' && action === 'llama2:13b') {
                    initialValue += 0.1;
                }

                this.qTable.set(key, initialValue);
            }
        }
    }

    generateAllStates() {
        const states = [];
        for (const taskType of this.hierarchyLevels.task_type) {
            for (const userContext of this.hierarchyLevels.user_context) {
                for (const timePressure of this.hierarchyLevels.time_pressure) {
                    states.push({
                        task_type: taskType,
                        user_context: userContext,
                        time_pressure: timePressure
                    });
                }
            }
        }
        return states;
    }

    // Método para atualizar Q-table (seria chamado após completar tarefas)
    updateQValue(state, action, reward, nextState) {
        const stateKey = JSON.stringify(state);
        const currentQ = this.getQValue(stateKey, action);

        // Encontrar melhor ação para o próximo estado
        const nextActions = this.actionSpace.map(a => this.getQValue(JSON.stringify(nextState), a));
        const maxNextQ = Math.max(...nextActions);

        // Atualizar Q-value usando Q-learning
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);

        const key = `${stateKey}_${action}`;
        this.qTable.set(key, newQ);
    }
}

/**
 * Cost-Aware Router (xRouter-inspired)
 * Baseado no conceito xRouter usando tool-calling e cost tracking
 */
class CostAwareRouter {
    constructor(options = {}) {
        this.costOptimizer = getCostOptimizer();
        this.toolRegistry = new Map();
        this.routingRules = new Map();
        this.costHistory = [];

        // Configurações
        this.costWeight = options.costWeight || 0.4;
        this.qualityWeight = options.qualityWeight || 0.6;
        this.maxCostPerRequest = options.maxCostPerRequest || 0.1; // $0.10 máximo
    }

    async initialize() {
        log.info('Initializing Cost-Aware Router (xRouter)');

        // Registrar ferramentas/modelos disponíveis
        this.registerTools();

        // Configurar regras de roteamento baseadas em custo
        this.setupRoutingRules();

        log.info('Cost-Aware Router initialized');
    }

    async route(request, context) {
        const startTime = Date.now();

        // Estimar custo da requisição
        const costEstimate = await this.estimateRequestCost(request, context);

        // Verificar se está dentro do orçamento
        if (costEstimate > this.maxCostPerRequest) {
            // Usar modelo mais barato disponível
            const cheapestModel = await this.findCheapestModel(request);
            const cheapestCost = await this.calculateCost(cheapestModel, request);

            return {
                model: cheapestModel,
                agent: this.selectAgentForCost(cheapestModel, request),
                confidence: 0.6,
                reasoning: `Cost optimization: estimated cost $${costEstimate.toFixed(4)} > limit $${this.maxCostPerRequest.toFixed(4)}`,
                strategy: 'xRouter',
                costEstimate: cheapestCost,
                metadata: {
                    originalEstimate: costEstimate,
                    costSavings: costEstimate - cheapestCost,
                    routingTime: Date.now() - startTime
                }
            };
        }

        // Usar tool-calling para determinar melhor rota
        const toolResult = await this.callRoutingTool(request, context, costEstimate);

        return {
            model: toolResult.model,
            agent: toolResult.agent,
            confidence: toolResult.confidence,
            reasoning: `Tool-based routing: ${toolResult.reasoning}`,
            strategy: 'xRouter',
            costEstimate: toolResult.estimatedCost,
            metadata: {
                toolUsed: 'cost_aware_router',
                routingLogic: toolResult.logic,
                routingTime: Date.now() - startTime
            }
        };
    }

    async estimateRequestCost(request, context) {
        // Estimativa baseada em complexidade e tipo
        const baseCosts = {
            'gpt-4': 0.0009,        // por token
            'gpt-3.5-turbo': 0.000035,
            'claude-3-haiku': 0.000015,
            'llama2:13b': 0
        };

        const estimatedTokens = this.estimateTokenCount(request);
        const avgCostPerToken = Object.values(baseCosts).reduce((sum, cost) => sum + cost, 0) / Object.values(baseCosts).length;

        return estimatedTokens * avgCostPerToken;
    }

    estimateTokenCount(request) {
        // Estimativa simples baseada no texto
        const text = `${request.type || ''} ${request.description || ''}`.trim();
        return Math.max(100, Math.min(2000, text.length * 0.3)); // 100-2000 tokens
    }

    async findCheapestModel(request) {
        // Sempre preferir modelos gratuitos primeiro
        if (this.canHandleLocally(request)) {
            return 'llama2:13b';
        }

        // Depois modelos pagos baratos
        return 'claude-3-haiku';
    }

    canHandleLocally(request) {
        // Verificar se a requisição pode ser tratada localmente
        const simpleTypes = ['simple_query', 'basic', 'documentation'];
        return simpleTypes.includes(request.type) && request.complexity !== 'high';
    }

    async calculateCost(model, request) {
        const modelCosts = {
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 },
            'llama2:13b': { input: 0, output: 0 }
        };

        const costs = modelCosts[model];
        if (!costs) return 0;

        const tokens = this.estimateTokenCount(request);
        return tokens * costs.input / 1000;
    }

    selectAgentForCost(model, request) {
        const agentMapping = {
            'gpt-4': 'architect',
            'gpt-3.5-turbo': 'developer',
            'claude-3-haiku': 'analyst',
            'llama2:13b': 'assistant'
        };

        return agentMapping[model] || 'architect';
    }

    async callRoutingTool(request, context, costEstimate) {
        // Simulação de tool-calling para decisão de roteamento
        // Em produção, seria uma chamada real a um LLM com tools

        const decision = await this.makeRoutingDecision(request, context, costEstimate);

        return {
            model: decision.model,
            agent: decision.agent,
            confidence: decision.confidence,
            reasoning: decision.reasoning,
            estimatedCost: decision.cost,
            logic: 'cost_quality_balance'
        };
    }

    async makeRoutingDecision(request, context, costEstimate) {
        // Lógica de decisão baseada em custo vs qualidade

        if (request.complexity === 'high' || request.type === 'code_generation') {
            return {
                model: 'gpt-4',
                agent: 'architect',
                confidence: 0.9,
                reasoning: 'High complexity requires best model',
                cost: costEstimate * 3 // GPT-4 é ~3x mais caro
            };
        }

        if (costEstimate < 0.01) { // Muito barato
            return {
                model: 'claude-3-haiku',
                agent: 'analyst',
                confidence: 0.8,
                reasoning: 'Cost-effective model for standard tasks',
                cost: costEstimate
            };
        }

        if (this.canHandleLocally(request)) {
            return {
                model: 'llama2:13b',
                agent: 'assistant',
                confidence: 0.7,
                reasoning: 'Local model for simple tasks (cost = $0)',
                cost: 0
            };
        }

        return {
            model: 'gpt-3.5-turbo',
            agent: 'developer',
            confidence: 0.75,
            reasoning: 'Balanced cost-quality ratio',
            cost: costEstimate * 0.7
        };
    }

    registerTools() {
        // Registrar ferramentas disponíveis
        this.toolRegistry.set('cost_calculator', {
            name: 'calculate_request_cost',
            description: 'Calculate estimated cost for a request',
            parameters: {
                request: 'object',
                model: 'string'
            }
        });

        this.toolRegistry.set('quality_assessor', {
            name: 'assess_model_quality',
            description: 'Assess quality fit for a specific request',
            parameters: {
                request: 'object',
                model: 'string'
            }
        });
    }

    setupRoutingRules() {
        // Regras de roteamento baseadas em custo
        this.routingRules.set('budget_conscious', {
            condition: (request, cost) => cost > 0.05,
            action: 'use_cheapest_available'
        });

        this.routingRules.set('quality_first', {
            condition: (request, cost) => request.complexity === 'high',
            action: 'use_best_available'
        });

        this.routingRules.set('local_preferred', {
            condition: (request, cost) => request.privacy === 'high',
            action: 'prefer_local_models'
        });
    }
}

/**
 * Multi-Agent Router (MasRouter-inspired)
 * Sistema de roteamento para múltiplos agentes baseado em colaboração
 */
class MultiAgentRouter {
    constructor(options = {}) {
        this.agentRegistry = new Map();
        this.collaborationPatterns = new Map();
        this.routingHistory = [];

        // Configurações
        this.maxCollaborationDepth = options.maxDepth || 3;
        this.confidenceThreshold = options.confidenceThreshold || 0.6;
    }

    async initialize() {
        log.info('Initializing Multi-Agent Router (MasRouter)');

        // Registrar agentes disponíveis
        this.registerAgents();

        // Configurar padrões de colaboração
        this.setupCollaborationPatterns();

        log.info('Multi-Agent Router initialized');
    }

    async route(request, context) {
        const startTime = Date.now();

        // Determinar se precisa de colaboração
        const collaborationNeeded = this.assessCollaborationNeed(request, context);

        if (!collaborationNeeded) {
            // Roteamento single-agent
            const singleResult = await this.routeSingleAgent(request, context);
            singleResult.metadata.routingTime = Date.now() - startTime;
            return singleResult;
        }

        // Roteamento multi-agent com colaboração
        const multiResult = await this.routeMultiAgent(request, context);
        multiResult.metadata.routingTime = Date.now() - startTime;

        return multiResult;
    }

    assessCollaborationNeed(request, context) {
        // Avaliar se a tarefa requer múltiplos agentes
        const complexTypes = ['system_design', 'architecture_review', 'business_analysis'];
        const highComplexity = request.complexity === 'high';

        return complexTypes.includes(request.type) || highComplexity;
    }

    async routeSingleAgent(request, context) {
        // Encontrar melhor agente single para a tarefa
        const agentScores = await this.scoreAgentsForTask(request, context);

        const bestAgent = Object.entries(agentScores)
            .sort(([, a], [, b]) => b.score - a.score)[0];

        return {
            model: this.selectModelForAgent(bestAgent[0], request),
            agent: bestAgent[0],
            confidence: bestAgent[1].score,
            reasoning: `Single agent routing: ${bestAgent[0]} best suited`,
            strategy: 'masRouter',
            collaboration: false,
            metadata: {
                agentScores,
                routingType: 'single'
            }
        };
    }

    async routeMultiAgent(request, context) {
        // Determinar padrão de colaboração
        const collaborationPattern = this.selectCollaborationPattern(request);

        // Selecionar agentes para colaboração
        const selectedAgents = await this.selectCollaborationAgents(request, collaborationPattern);

        // Determinar agente principal (orchestrator)
        const primaryAgent = selectedAgents[0];

        return {
            model: this.selectModelForAgent(primaryAgent, request),
            agent: primaryAgent,
            confidence: 0.75,
            reasoning: `Multi-agent collaboration: ${selectedAgents.join(', ')} (${collaborationPattern})`,
            strategy: 'masRouter',
            collaboration: true,
            collaborators: selectedAgents.slice(1),
            collaborationPattern,
            metadata: {
                selectedAgents,
                pattern: collaborationPattern,
                routingType: 'multi'
            }
        };
    }

    selectCollaborationPattern(request) {
        const patterns = {
            'system_design': 'architect_developer_analyst',
            'architecture_review': 'architect_analyst',
            'business_analysis': 'analyst_developer',
            'complex_debugging': 'developer_architect'
        };

        return patterns[request.type] || 'architect_developer';
    }

    async selectCollaborationAgents(request, pattern) {
        const patternAgents = {
            'architect_developer_analyst': ['architect', 'developer', 'analyst'],
            'architect_analyst': ['architect', 'analyst'],
            'analyst_developer': ['analyst', 'developer'],
            'architect_developer': ['architect', 'developer']
        };

        const agents = patternAgents[pattern] || ['architect', 'developer'];

        // Filtrar baseado em disponibilidade e expertise
        return agents.filter(agent => this.isAgentAvailable(agent, request));
    }

    isAgentAvailable(agent, request) {
        // Lógica simplificada - em produção seria baseada em carga atual
        return true; // Todos disponíveis para teste
    }

    async scoreAgentsForTask(request, context) {
        const agentCapabilities = {
            architect: {
                strengths: ['system_design', 'architecture', 'planning'],
                weaknesses: ['detailed_coding', 'data_analysis']
            },
            developer: {
                strengths: ['coding', 'debugging', 'implementation'],
                weaknesses: ['business_analysis', 'high_level_design']
            },
            analyst: {
                strengths: ['data_analysis', 'business_logic', 'documentation'],
                weaknesses: ['complex_coding', 'system_architecture']
            },
            assistant: {
                strengths: ['simple_queries', 'basic_help', 'coordination'],
                weaknesses: ['complex_tasks', 'specialized_work']
            }
        };

        const scores = {};

        for (const [agentName, capabilities] of Object.entries(agentCapabilities)) {
            let score = 0.5; // Score base

            // Pontuar strengths
            if (capabilities.strengths.includes(request.type)) {
                score += 0.3;
            }

            // Penalizar weaknesses
            if (capabilities.weaknesses.includes(request.type)) {
                score -= 0.2;
            }

            // Ajustar por complexidade
            if (request.complexity === 'high' && agentName === 'architect') {
                score += 0.1;
            } else if (request.complexity === 'low' && agentName === 'assistant') {
                score += 0.1;
            }

            scores[agentName] = {
                score: Math.max(0.1, Math.min(1.0, score)),
                capabilities: capabilities.strengths
            };
        }

        return scores;
    }

    selectModelForAgent(agent, request) {
        const agentModels = {
            architect: 'gpt-4',           // Melhor para design complexo
            developer: 'gpt-3.5-turbo',   // Rápido para código
            analyst: 'claude-3-haiku',    // Bom para análise
            assistant: 'llama2:13b'       // Local para queries simples
        };

        // Ajustar baseado em complexidade
        if (request.complexity === 'high' && agent !== 'architect') {
            return 'gpt-4'; // Escalar para modelo melhor
        }

        return agentModels[agent] || 'gpt-4';
    }

    registerAgents() {
        // Registrar capacidades dos agentes
        this.agentRegistry.set('architect', {
            name: 'Architect',
            capabilities: ['system_design', 'architecture', 'planning', 'code_review'],
            models: ['gpt-4', 'claude-3-opus'],
            maxLoad: 3
        });

        this.agentRegistry.set('developer', {
            name: 'Developer',
            capabilities: ['coding', 'debugging', 'implementation', 'testing'],
            models: ['gpt-3.5-turbo', 'claude-3-sonnet'],
            maxLoad: 5
        });

        this.agentRegistry.set('analyst', {
            name: 'Analyst',
            capabilities: ['data_analysis', 'business_logic', 'documentation', 'requirements'],
            models: ['claude-3-haiku', 'gpt-4'],
            maxLoad: 4
        });

        this.agentRegistry.set('assistant', {
            name: 'Assistant',
            capabilities: ['simple_queries', 'basic_help', 'coordination', 'information'],
            models: ['llama2:13b', 'claude-3-haiku'],
            maxLoad: 10
        });
    }

    setupCollaborationPatterns() {
        // Padrões de colaboração entre agentes
        this.collaborationPatterns.set('architect_developer', {
            description: 'Architect designs, Developer implements',
            agents: ['architect', 'developer'],
            workflow: ['design', 'implement', 'review']
        });

        this.collaborationPatterns.set('architect_developer_analyst', {
            description: 'Full system development with analysis',
            agents: ['architect', 'developer', 'analyst'],
            workflow: ['analyze', 'design', 'implement', 'validate']
        });

        this.collaborationPatterns.set('analyst_developer', {
            description: 'Analysis-driven development',
            agents: ['analyst', 'developer'],
            workflow: ['analyze_requirements', 'implement', 'validate']
        });
    }
}

// Singleton
let advancedModelRouterInstance = null;

export function getAdvancedModelRouter(options = {}) {
    if (!advancedModelRouterInstance) {
        advancedModelRouterInstance = new AdvancedModelRouter(options);
    }
    return advancedModelRouterInstance;
}

export default AdvancedModelRouter;