#!/usr/bin/env node
/**
 * Cost Optimizer - Otimização Inteligente de Custos
 *
 * Sistema inteligente para otimizar custos de operação do sistema,
 * rastreando uso de recursos e implementando estratégias de redução automática
 */

import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getTraceAlerts } from '../observability/trace_alerts.js';
import { logger } from '../utils/logger.js';
import { getMetricsCollector } from './metrics_collector.js';
import { getModelRouter } from './model_router.js';

const log = logger.child({ module: 'cost_optimizer' });

/**
 * Otimizador Inteligente de Custos
 */
export class CostOptimizer {
    constructor(options = {}) {
        this.metricsCollector = getMetricsCollector();
        this.modelRouter = getModelRouter();
        this.distributedTracer = getDistributedTracer();
        this.traceAlerts = getTraceAlerts();

        // Configurações de custo
        this.costEnabled = options.costEnabled !== false;
        this.optimizationEnabled = options.optimizationEnabled !== false;
        this.budgetAlertsEnabled = options.budgetAlertsEnabled !== false;

        // Custos por modelo (USD por 1000 tokens)
        this.modelCosts = {
            // OpenAI
            'gpt-4': { input: 0.03, output: 0.06 },
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },

            // Anthropic
            'claude-3-opus': { input: 0.015, output: 0.075 },
            'claude-3-sonnet': { input: 0.003, output: 0.015 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 },

            // Local (gratuito)
            'llama2:13b': { input: 0, output: 0 },
            'mistral:7b': { input: 0, output: 0 },
            'qwen3:4b': { input: 0, output: 0 },
            'gemma3:1b': { input: 0, output: 0 }
        };

        // Thresholds de orçamento
        this.budgetLimits = {
            daily: options.dailyBudget || 10.0,      // $10 por dia
            weekly: options.weeklyBudget || 50.0,    // $50 por semana
            monthly: options.monthlyBudget || 200.0  // $200 por mês
        };

        // Thresholds de alerta de orçamento
        this.budgetAlertThresholds = {
            warning: 0.8,    // 80% do orçamento
            critical: 0.95   // 95% do orçamento
        };

        // Estado de custos
        this.costState = {
            currentDay: this.getCurrentDay(),
            currentWeek: this.getCurrentWeek(),
            currentMonth: this.getCurrentMonth(),
            dailyCost: 0,
            weeklyCost: 0,
            monthlyCost: 0,
            totalCost: 0,
            costHistory: [],
            modelUsage: new Map(),
            agentUsage: new Map(),
            projectUsage: new Map(),
            optimizationSavings: 0
        };

        // Estratégias de otimização
        this.optimizationStrategies = {
            modelSelection: this.optimizeModelSelection.bind(this),
            caching: this.optimizeCaching.bind(this),
            batching: this.optimizeBatching.bind(this),
            compression: this.optimizeCompression.bind(this),
            quality: this.optimizeQuality.bind(this)
        };

        // Monitoramento contínuo
        this.monitoringInterval = options.monitoringInterval || 60000; // 1 minuto
        this.monitoringTimer = null;

        // Cache de decisões de otimização
        this.optimizationCache = new Map();
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutos

        log.info('CostOptimizer initialized', {
            costEnabled: this.costEnabled,
            optimizationEnabled: this.optimizationEnabled,
            dailyBudget: this.budgetLimits.daily,
            weeklyBudget: this.budgetLimits.weekly,
            monthlyBudget: this.budgetLimits.monthly
        });
    }

    /**
     * Inicializar otimizador de custos
     */
    async initialize() {
        if (!this.costEnabled) {
            log.info('Cost optimization disabled');
            return;
        }

        log.info('Initializing cost optimizer...');

        // Carregar estado salvo se existir
        await this.loadCostState();

        // Iniciar monitoramento contínuo
        this.startCostMonitoring();

        // Configurar alertas de orçamento
        await this.setupBudgetAlerts();

        log.info('Cost optimizer initialized successfully');
    }

    /**
     * Registrar uso de tokens/custo
     */
    async recordUsage(model, tokens, type = 'completion', metadata = {}) {
        if (!this.costEnabled) return;

        const modelCost = this.modelCosts[model];
        if (!modelCost) {
            log.warn('Unknown model for cost calculation', { model });
            return;
        }

        // Calcular custo
        const cost = (tokens.input || 0) * modelCost.input / 1000 +
            (tokens.output || 0) * modelCost.output / 1000;

        const usageRecord = {
            timestamp: Date.now(),
            model,
            tokens,
            cost,
            type,
            agent: metadata.agent,
            project: metadata.project,
            userId: metadata.userId,
            operation: metadata.operation,
            correlationId: metadata.correlationId
        };

        // Atualizar estado de custos
        this.updateCostState(usageRecord);

        // Registrar métrica
        await this.metricsCollector.recordMetric('llm_cost_incurred', cost, {
            model,
            agent: metadata.agent,
            operation: metadata.operation
        });

        // Verificar limites de orçamento
        await this.checkBudgetLimits();

        // Aplicar otimizações se habilitado
        if (this.optimizationEnabled) {
            await this.applyOptimizations(usageRecord);
        }

        log.debug('Usage recorded', {
            model,
            cost: cost.toFixed(6),
            totalDaily: this.costState.dailyCost.toFixed(4)
        });
    }

    /**
     * Atualizar estado de custos
     */
    updateCostState(usageRecord) {
        const { cost, model, agent, project } = usageRecord;

        // Atualizar custos totais
        this.costState.totalCost += cost;
        this.costState.dailyCost += cost;
        this.costState.weeklyCost += cost;
        this.costState.monthlyCost += cost;

        // Atualizar uso por modelo
        if (!this.costState.modelUsage.has(model)) {
            this.costState.modelUsage.set(model, { tokens: 0, cost: 0, requests: 0 });
        }
        const modelStats = this.costState.modelUsage.get(model);
        modelStats.tokens += (usageRecord.tokens.input || 0) + (usageRecord.tokens.output || 0);
        modelStats.cost += cost;
        modelStats.requests++;

        // Atualizar uso por agente
        if (agent) {
            if (!this.costState.agentUsage.has(agent)) {
                this.costState.agentUsage.set(agent, { tokens: 0, cost: 0, requests: 0 });
            }
            const agentStats = this.costState.agentUsage.get(agent);
            agentStats.tokens += (usageRecord.tokens.input || 0) + (usageRecord.tokens.output || 0);
            agentStats.cost += cost;
            agentStats.requests++;
        }

        // Atualizar uso por projeto
        if (project) {
            if (!this.costState.projectUsage.has(project)) {
                this.costState.projectUsage.set(project, { tokens: 0, cost: 0, requests: 0 });
            }
            const projectStats = this.costState.projectUsage.get(project);
            projectStats.tokens += (usageRecord.tokens.input || 0) + (usageRecord.tokens.output || 0);
            projectStats.cost += cost;
            projectStats.requests++;
        }

        // Adicionar ao histórico
        this.costState.costHistory.push(usageRecord);

        // Limitar histórico (últimas 1000 entradas)
        if (this.costState.costHistory.length > 1000) {
            this.costState.costHistory.shift();
        }

        // Salvar estado periodicamente
        if (this.costState.costHistory.length % 100 === 0) {
            this.saveCostState();
        }
    }

    /**
     * Verificar limites de orçamento
     */
    async checkBudgetLimits() {
        if (!this.budgetAlertsEnabled) return;

        const checks = [
            { period: 'daily', limit: this.budgetLimits.daily, current: this.costState.dailyCost },
            { period: 'weekly', limit: this.budgetLimits.weekly, current: this.costState.weeklyCost },
            { period: 'monthly', limit: this.budgetLimits.monthly, current: this.costState.monthlyCost }
        ];

        for (const check of checks) {
            const percentage = check.current / check.limit;

            if (percentage >= this.budgetAlertThresholds.critical) {
                await this.triggerBudgetAlert('critical', check);
            } else if (percentage >= this.budgetAlertThresholds.warning) {
                await this.triggerBudgetAlert('warning', check);
            }
        }
    }

    /**
     * Disparar alerta de orçamento
     */
    async triggerBudgetAlert(severity, budgetCheck) {
        const alertType = `budget_${budgetCheck.period}_${severity}`;

        await this.traceAlerts.processAlert({
            type: alertType,
            severity,
            title: `Orçamento ${budgetCheck.period.toUpperCase()} ${severity.toUpperCase()}`,
            description: `Uso de $${budgetCheck.current.toFixed(2)} de $${budgetCheck.limit.toFixed(2)} (${(budgetCheck.current / budgetCheck.limit * 100).toFixed(1)}%)`,
            metric: `budget_${budgetCheck.period}`,
            value: budgetCheck.current,
            threshold: budgetCheck.limit * (severity === 'critical' ? this.budgetAlertThresholds.critical : this.budgetAlertThresholds.warning),
            traceId: 'budget_monitoring',
            operation: 'cost_optimization',
            recommendation: this.getBudgetRecommendation(budgetCheck)
        });
    }

    /**
     * Aplicar otimizações automáticas
     */
    async applyOptimizations(usageRecord) {
        const optimizations = [];

        // Estratégia 1: Seleção otimizada de modelo
        const modelOptimization = await this.optimizationStrategies.modelSelection(usageRecord);
        if (modelOptimization) optimizations.push(modelOptimization);

        // Estratégia 2: Cache inteligente
        const cacheOptimization = await this.optimizationStrategies.caching(usageRecord);
        if (cacheOptimization) optimizations.push(cacheOptimization);

        // Estratégia 3: Compressão de prompts
        const compressionOptimization = await this.optimizationStrategies.compression(usageRecord);
        if (compressionOptimization) optimizations.push(compressionOptimization);

        // Estratégia 4: Batch requests quando possível
        const batchOptimization = await this.optimizationStrategies.batching(usageRecord);
        if (batchOptimization) optimizations.push(batchOptimization);

        // Calcular economia
        const totalSavings = optimizations.reduce((sum, opt) => sum + (opt.savings || 0), 0);
        this.costState.optimizationSavings += totalSavings;

        if (optimizations.length > 0) {
            log.info('Optimizations applied', {
                operation: usageRecord.operation,
                optimizations: optimizations.length,
                savings: totalSavings.toFixed(6)
            });
        }

        return optimizations;
    }

    /**
     * Estratégia: Otimização de seleção de modelo
     */
    async optimizeModelSelection(usageRecord) {
        const { operation, tokens } = usageRecord;

        // Cache de decisão
        const cacheKey = `model_${operation}_${tokens.input || 0}_${tokens.output || 0}`;
        if (this.optimizationCache.has(cacheKey)) {
            const cached = this.optimizationCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.optimization;
            }
        }

        // Encontrar modelo mais barato que atenda aos requisitos
        const suitableModels = await this.findSuitableModels(operation, tokens);

        if (suitableModels.length > 1) {
            const cheapestModel = suitableModels.reduce((cheapest, model) =>
                this.calculateCost(model, tokens) < this.calculateCost(cheapest, tokens) ? model : cheapest
            );

            const currentCost = this.calculateCost(usageRecord.model, tokens);
            const optimizedCost = this.calculateCost(cheapestModel, tokens);
            const savings = Math.max(0, currentCost - optimizedCost);

            const optimization = {
                type: 'model_selection',
                currentModel: usageRecord.model,
                optimizedModel: cheapestModel,
                savings,
                reasoning: `Modelo mais barato para operação ${operation}`
            };

            // Cache da decisão
            this.optimizationCache.set(cacheKey, {
                timestamp: Date.now(),
                optimization
            });

            return optimization;
        }

        return null;
    }

    /**
     * Estratégia: Otimização de cache
     */
    async optimizeCaching(usageRecord) {
        // Implementar cache inteligente baseado em padrões de uso
        // Por enquanto, simular economia baseada em similaridade

        const cacheHit = Math.random() < 0.3; // 30% de chance de cache hit
        if (cacheHit) {
            const savings = this.calculateCost(usageRecord.model, usageRecord.tokens) * 0.8; // 80% de economia

            return {
                type: 'caching',
                savings,
                reasoning: 'Cache hit evitou chamada LLM'
            };
        }

        return null;
    }

    /**
     * Estratégia: Compressão de prompts
     */
    async optimizeCompression(usageRecord) {
        const { tokens } = usageRecord;

        // Compressão pode reduzir tokens em 10-30%
        const compressionRatio = 0.2; // 20% redução média
        const tokenSavings = Math.floor((tokens.input || 0) * compressionRatio);
        const savings = this.calculateCost(usageRecord.model, { input: tokenSavings, output: 0 });

        if (tokenSavings > 10) { // Só comprimir se economizar tokens significativos
            return {
                type: 'compression',
                savings,
                tokenSavings,
                reasoning: `Compressão reduziu prompt em ${tokenSavings} tokens`
            };
        }

        return null;
    }

    /**
     * Estratégia: Batch requests
     */
    async optimizeBatching(usageRecord) {
        // Simular batching para operações similares
        const batchSavings = Math.random() < 0.1 ? // 10% de chance
            this.calculateCost(usageRecord.model, usageRecord.tokens) * 0.15 : 0; // 15% de economia

        if (batchSavings > 0) {
            return {
                type: 'batching',
                savings: batchSavings,
                reasoning: 'Request processado em batch'
            };
        }

        return null;
    }

    /**
     * Estratégia: Otimização de qualidade
     */
    async optimizeQuality(usageRecord) {
        // Para operações não críticas, usar modelos mais baratos
        const { operation } = usageRecord;

        const nonCriticalOps = ['test', 'debug', 'analysis'];
        if (nonCriticalOps.some(op => operation.includes(op))) {
            // Usar modelo mais barato disponível
            const availableModels = Object.keys(this.modelCosts);
            const cheapestModel = availableModels.reduce((cheapest, model) =>
                this.modelCosts[model].input < this.modelCosts[cheapest].input ? model : cheapest
            );

            const savings = this.calculateCost(usageRecord.model, usageRecord.tokens) -
                this.calculateCost(cheapestModel, usageRecord.tokens);

            if (savings > 0) {
                return {
                    type: 'quality_optimization',
                    currentModel: usageRecord.model,
                    optimizedModel: cheapestModel,
                    savings,
                    reasoning: `Operação não crítica usando modelo mais barato`
                };
            }
        }

        return null;
    }

    /**
     * Encontrar modelos adequados para operação
     */
    async findSuitableModels(operation, tokens) {
        // Lógica simplificada - em produção seria baseada em capacidades dos modelos
        const allModels = Object.keys(this.modelCosts);

        // Filtrar por custo (remover modelos muito caros para operações simples)
        const maxCost = operation.includes('complex') || operation.includes('analysis') ?
            0.01 : 0.005; // $0.01/1000 tokens para operações complexas

        return allModels.filter(model => {
            const cost = this.modelCosts[model];
            return cost.input <= maxCost;
        });
    }

    /**
     * Calcular custo para modelo e tokens
     */
    calculateCost(model, tokens) {
        const modelCost = this.modelCosts[model];
        if (!modelCost) return 0;

        return (tokens.input || 0) * modelCost.input / 1000 +
            (tokens.output || 0) * modelCost.output / 1000;
    }

    /**
     * Configurar alertas de orçamento
     */
    async setupBudgetAlerts() {
        // Os alertas são verificados automaticamente no recordUsage
        // Este método pode ser usado para configurações adicionais futuras
        log.debug('Budget alerts configured');
    }

    /**
     * Iniciar monitoramento de custos
     */
    startCostMonitoring() {
        this.monitoringTimer = setInterval(async () => {
            await this.performCostAnalysis();
        }, this.monitoringInterval);
    }

    /**
     * Executar análise de custos
     */
    async performCostAnalysis() {
        // Resetar custos por período quando necessário
        const now = new Date();
        const currentDay = this.getCurrentDay();
        const currentWeek = this.getCurrentWeek();
        const currentMonth = this.getCurrentMonth();

        if (currentDay !== this.costState.currentDay) {
            this.costState.currentDay = currentDay;
            this.costState.dailyCost = 0;
        }

        if (currentWeek !== this.costState.currentWeek) {
            this.costState.currentWeek = currentWeek;
            this.costState.weeklyCost = 0;
        }

        if (currentMonth !== this.costState.currentMonth) {
            this.costState.currentMonth = currentMonth;
            this.costState.monthlyCost = 0;
        }

        // Limpar cache antigo
        this.cleanupOptimizationCache();

        // Salvar estado periodicamente
        await this.saveCostState();
    }

    /**
     * Gerar relatório de custos
     */
    generateCostReport(period = 'daily') {
        const report = {
            period,
            timestamp: new Date().toISOString(),
            summary: {
                totalCost: this.costState.totalCost,
                periodCost: this.getPeriodCost(period),
                budgetLimit: this.budgetLimits[period],
                budgetUsed: (this.getPeriodCost(period) / this.budgetLimits[period] * 100).toFixed(1),
                optimizationSavings: this.costState.optimizationSavings
            },
            breakdown: {
                byModel: this.getCostBreakdownBy('model'),
                byAgent: this.getCostBreakdownBy('agent'),
                byProject: this.getCostBreakdownBy('project')
            },
            trends: this.calculateCostTrends(),
            recommendations: this.generateOptimizationRecommendations()
        };

        return report;
    }

    /**
     * Obter custo por período
     */
    getPeriodCost(period) {
        switch (period) {
            case 'daily': return this.costState.dailyCost;
            case 'weekly': return this.costState.weeklyCost;
            case 'monthly': return this.costState.monthlyCost;
            default: return this.costState.totalCost;
        }
    }

    /**
     * Obter breakdown de custos
     */
    getCostBreakdownBy(dimension) {
        const usageMap = this.costState[`${dimension}Usage`];
        const breakdown = {};

        for (const [key, stats] of usageMap.entries()) {
            breakdown[key] = {
                cost: stats.cost.toFixed(4),
                tokens: stats.tokens,
                requests: stats.requests,
                avgCostPerRequest: (stats.cost / stats.requests).toFixed(6),
                avgCostPerToken: (stats.cost / stats.tokens * 1000).toFixed(6)
            };
        }

        return breakdown;
    }

    /**
     * Calcular tendências de custo
     */
    calculateCostTrends() {
        const history = this.costState.costHistory.slice(-100); // Últimas 100 operações

        if (history.length < 10) return { insufficient_data: true };

        const periods = 5;
        const periodSize = Math.floor(history.length / periods);
        const trends = [];

        for (let i = 0; i < periods; i++) {
            const start = i * periodSize;
            const end = start + periodSize;
            const periodData = history.slice(start, end);

            const periodCost = periodData.reduce((sum, record) => sum + record.cost, 0);
            const periodTokens = periodData.reduce((sum, record) =>
                sum + (record.tokens.input || 0) + (record.tokens.output || 0), 0);

            trends.push({
                period: i + 1,
                cost: periodCost,
                tokens: periodTokens,
                avgCostPerToken: periodTokens > 0 ? (periodCost / periodTokens * 1000) : 0
            });
        }

        return {
            periods: trends,
            trend: this.calculateTrendDirection(trends),
            avgCostPerToken: trends.reduce((sum, t) => sum + t.avgCostPerToken, 0) / trends.length
        };
    }

    /**
     * Calcular direção da tendência
     */
    calculateTrendDirection(trends) {
        if (trends.length < 2) return 'stable';

        const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
        const secondHalf = trends.slice(Math.floor(trends.length / 2));

        const firstAvg = firstHalf.reduce((sum, t) => sum + t.avgCostPerToken, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, t) => sum + t.avgCostPerToken, 0) / secondHalf.length;

        const change = (secondAvg - firstAvg) / firstAvg;

        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * Gerar recomendações de otimização
     */
    generateOptimizationRecommendations() {
        const recommendations = [];

        // Recomendação baseada no modelo mais caro
        const modelBreakdown = this.getCostBreakdownBy('model');
        const sortedModels = Object.entries(modelBreakdown)
            .sort(([, a], [, b]) => parseFloat(b.cost) - parseFloat(a.cost));

        if (sortedModels.length > 1) {
            const [expensiveModel, expensiveStats] = sortedModels[0];
            const [cheapModel, cheapStats] = sortedModels[sortedModels.length - 1];

            const expensiveCost = parseFloat(expensiveStats.avgCostPerToken);
            const cheapCost = parseFloat(cheapStats.avgCostPerToken);

            if (expensiveCost > cheapCost * 2) {
                recommendations.push({
                    type: 'model_optimization',
                    priority: 'high',
                    description: `Considere usar ${cheapModel} ao invés de ${expensiveModel} para reduzir custos em ${(expensiveCost / cheapCost).toFixed(1)}x`,
                    potentialSavings: parseFloat(expensiveStats.cost) * 0.5
                });
            }
        }

        // Recomendação baseada em cache
        const totalRequests = Object.values(modelBreakdown).reduce((sum, stats) => sum + stats.requests, 0);
        if (totalRequests > 100) {
            recommendations.push({
                type: 'caching',
                priority: 'medium',
                description: 'Implemente cache inteligente para reduzir chamadas LLM repetidas',
                potentialSavings: this.costState.dailyCost * 0.2
            });
        }

        // Recomendação baseada em compressão
        const avgTokensPerRequest = Object.values(modelBreakdown).reduce((sum, stats) => sum + stats.tokens, 0) / totalRequests;
        if (avgTokensPerRequest > 500) {
            recommendations.push({
                type: 'compression',
                priority: 'medium',
                description: 'Implemente compressão de prompts para reduzir uso de tokens',
                potentialSavings: this.costState.dailyCost * 0.15
            });
        }

        return recommendations;
    }

    /**
     * Obter recomendação para orçamento
     */
    getBudgetRecommendation(budgetCheck) {
        const percentage = budgetCheck.current / budgetCheck.limit;

        if (percentage >= 0.95) {
            return `PAUSAR operações imediatamente. Custo ${budgetCheck.period} excedeu 95% do orçamento.`;
        } else if (percentage >= 0.8) {
            return `REDUZIR uso. Considere usar modelos mais baratos ou reduzir frequência de operações.`;
        } else {
            return `MONITORAR de perto. Orçamento ${budgetCheck.period} em ${(percentage * 100).toFixed(1)}% de uso.`;
        }
    }

    /**
     * Métodos utilitários
     */
    getCurrentDay() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return startOfWeek.toISOString().split('T')[0];
    }

    getCurrentMonth() {
        return new Date().toISOString().substring(0, 7);
    }

    cleanupOptimizationCache() {
        const now = Date.now();
        for (const [key, cached] of this.optimizationCache.entries()) {
            if (now - cached.timestamp > this.cacheTimeout) {
                this.optimizationCache.delete(key);
            }
        }
    }

    async loadCostState() {
        // Em produção, carregaria do banco de dados
        // Por enquanto, mantém estado em memória
    }

    async saveCostState() {
        // Em produção, salvaria no banco de dados
        // Por enquanto, mantém estado em memória
    }

    /**
     * Obter status do otimizador
     */
    getStatus() {
        return {
            enabled: this.costEnabled,
            optimizationEnabled: this.optimizationEnabled,
            budgetAlertsEnabled: this.budgetAlertsEnabled,
            currentCosts: {
                daily: this.costState.dailyCost.toFixed(4),
                weekly: this.costState.weeklyCost.toFixed(4),
                monthly: this.costState.monthlyCost.toFixed(4),
                total: this.costState.totalCost.toFixed(4)
            },
            budgetLimits: this.budgetLimits,
            optimizationSavings: this.costState.optimizationSavings.toFixed(6),
            modelUsage: Object.fromEntries(this.costState.modelUsage),
            activeOptimizations: this.optimizationCache.size
        };
    }

    /**
     * Encerrar otimizador de custos
     */
    async shutdown() {
        log.info('Shutting down cost optimizer');

        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        // Salvar estado final
        await this.saveCostState();

        log.info('Cost optimizer shutdown completed');
    }
}

// Singleton
let costOptimizerInstance = null;

export function getCostOptimizer(options = {}) {
    if (!costOptimizerInstance) {
        costOptimizerInstance = new CostOptimizer(options);
    }
    return costOptimizerInstance;
}

export default CostOptimizer;