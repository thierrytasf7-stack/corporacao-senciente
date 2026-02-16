#!/usr/bin/env node
/**
 * Sistema de Métricas - Coleta e Análise Inteligente
 *
 * Coleta métricas do sistema usando aprendizado do feedback loop
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getEmbeddingsService } from '../utils/embeddings_service.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'metrics_collector' });

/**
 * Coletor de Métricas Inteligente
 */
export class MetricsCollector {
    constructor(options = {}) {
        this.llbProtocol = getLLBProtocol();
        this.embeddings = getEmbeddingsService();
        this.metrics = new Map(); // Métricas em tempo real
        this.history = []; // Histórico de métricas
        this.alerts = new Map(); // Alertas ativos
        this.thresholds = {
            successRate: options.successRateThreshold || 0.7,
            latency: options.latencyThreshold || 5000, // 5 segundos
            cost: options.costThreshold || 1000, // tokens
            confidence: options.confidenceThreshold || 0.6,
            cacheHitRate: options.cacheHitRateThreshold || 0.3
        };
        this.collectionInterval = options.collectionInterval || 60000; // 1 minuto
        this.historyRetention = options.historyRetention || 1000; // Últimas 1000 medições

        // Iniciar coleta automática
        this.startAutoCollection();

        log.info('MetricsCollector initialized', {
            thresholds: this.thresholds,
            collectionInterval: this.collectionInterval
        });
    }

    /**
     * Registrar métrica de execução
     *
     * @param {string} metricType - Tipo de métrica
     * @param {object} data - Dados da métrica
     * @param {object} context - Contexto adicional
     */
    async recordMetric(metricType, data, context = {}) {
        const metric = {
            type: metricType,
            data: data,
            context: context,
            timestamp: new Date().toISOString(),
            id: this.generateMetricId()
        };

        // Armazenar em tempo real
        this.metrics.set(metric.id, metric);

        // Adicionar ao histórico
        this.history.push(metric);
        if (this.history.length > this.historyRetention) {
            this.history.shift(); // Manter apenas as últimas N
        }

        // Verificar alertas
        await this.checkAlerts(metric);

        // Armazenar aprendizado no LangMem
        await this.storeMetricLearning(metric);

        // Atualizar agregações em tempo real
        this.updateRealtimeAggregations(metric);

        log.debug('Metric recorded', { type: metricType, id: metric.id });
    }

    /**
     * Registrar execução de prompt
     *
     * @param {object} executionData - Dados da execução
     */
    async recordPromptExecution(executionData) {
        const {
            agent,
            task,
            prompt,
            response,
            success,
            duration,
            tokens,
            confidence,
            cacheHit,
            error
        } = executionData;

        await this.recordMetric('prompt_execution', {
            agent,
            task: task?.substring(0, 100),
            promptLength: prompt?.length || 0,
            responseLength: response?.length || 0,
            success,
            duration,
            tokens: tokens || 0,
            confidence: confidence || 0,
            cacheHit: cacheHit || false,
            error: error?.substring(0, 200)
        }, {
            agent,
            task_type: this.categorizeTask(task),
            has_cache: cacheHit,
            error_type: error ? this.categorizeError(error) : null
        });
    }

    /**
     * Registrar operação de cache
     *
     * @param {object} cacheData - Dados da operação de cache
     */
    async recordCacheOperation(cacheData) {
        const { operation, key, hit, duration, size } = cacheData;

        await this.recordMetric('cache_operation', {
            operation, // 'get', 'set', 'evict'
            key: key?.substring(0, 50),
            hit,
            duration,
            size: size || 0
        }, {
            operation_type: operation,
            cache_performance: hit ? 'hit' : 'miss'
        });
    }

    /**
     * Registrar operação de memória
     *
     * @param {object} memoryData - Dados da operação de memória
     */
    async recordMemoryOperation(memoryData) {
        const { operation, component, duration, success, size } = memoryData;

        await this.recordMetric('memory_operation', {
            operation, // 'store', 'retrieve', 'search'
            component, // 'langmem', 'letta', 'byterover'
            duration,
            success,
            size: size || 0
        }, {
            memory_component: component,
            operation_success: success
        });
    }

    /**
     * Registrar operação de feedback
     *
     * @param {object} feedbackData - Dados da operação de feedback
     */
    async recordFeedbackOperation(feedbackData) {
        const { operation, patterns, improvements, duration } = feedbackData;

        await this.recordMetric('feedback_operation', {
            operation, // 'collect', 'analyze', 'ab_test'
            patternsFound: patterns || 0,
            improvementsSuggested: improvements || 0,
            duration
        }, {
            feedback_type: operation,
            has_improvements: (improvements || 0) > 0
        });
    }

    /**
     * Obter métricas agregadas
     *
     * @param {string} timeRange - Período ('1h', '24h', '7d')
     * @param {object} filters - Filtros opcionais
     * @returns {object} Métricas agregadas
     */
    getAggregatedMetrics(timeRange = '1h', filters = {}) {
        const cutoffTime = this.getCutoffTime(timeRange);
        const relevantMetrics = this.history.filter(m =>
            new Date(m.timestamp) >= cutoffTime &&
            this.matchesFilters(m, filters)
        );

        if (relevantMetrics.length === 0) {
            return { error: 'No metrics available for the specified time range' };
        }

        return {
            timeRange,
            totalMetrics: relevantMetrics.length,
            aggregations: {
                prompt_execution: this.aggregatePromptMetrics(relevantMetrics),
                cache_operation: this.aggregateCacheMetrics(relevantMetrics),
                memory_operation: this.aggregateMemoryMetrics(relevantMetrics),
                feedback_operation: this.aggregateFeedbackMetrics(relevantMetrics)
            },
            alerts: Array.from(this.alerts.values()),
            trends: this.calculateTrends(relevantMetrics),
            insights: this.generateInsights(relevantMetrics)
        };
    }

    /**
     * Agregar métricas de prompt
     *
     * @param {array} metrics - Métricas a agregar
     * @returns {object} Agregação
     */
    aggregatePromptMetrics(metrics) {
        const promptMetrics = metrics.filter(m => m.type === 'prompt_execution');

        if (promptMetrics.length === 0) return null;

        const successful = promptMetrics.filter(m => m.data.success);
        const cacheHits = promptMetrics.filter(m => m.data.cacheHit);

        return {
            count: promptMetrics.length,
            successRate: successful.length / promptMetrics.length,
            avgDuration: promptMetrics.reduce((sum, m) => sum + (m.data.duration || 0), 0) / promptMetrics.length,
            avgTokens: promptMetrics.reduce((sum, m) => sum + (m.data.tokens || 0), 0) / promptMetrics.length,
            avgConfidence: promptMetrics.reduce((sum, m) => sum + (m.data.confidence || 0), 0) / promptMetrics.length,
            cacheHitRate: cacheHits.length / promptMetrics.length,
            agentBreakdown: this.breakdownByField(promptMetrics, 'data.agent'),
            taskBreakdown: this.breakdownByField(promptMetrics, 'context.task_type'),
            errorBreakdown: this.breakdownByField(promptMetrics.filter(m => !m.data.success), 'context.error_type')
        };
    }

    /**
     * Agregar métricas de cache
     *
     * @param {array} metrics - Métricas a agregar
     * @returns {object} Agregação
     */
    aggregateCacheMetrics(metrics) {
        const cacheMetrics = metrics.filter(m => m.type === 'cache_operation');

        if (cacheMetrics.length === 0) return null;

        const hits = cacheMetrics.filter(m => m.data.hit);

        return {
            count: cacheMetrics.length,
            hitRate: hits.length / cacheMetrics.length,
            avgDuration: cacheMetrics.reduce((sum, m) => sum + (m.data.duration || 0), 0) / cacheMetrics.length,
            operationBreakdown: this.breakdownByField(cacheMetrics, 'data.operation'),
            performanceBreakdown: this.breakdownByField(cacheMetrics, 'context.cache_performance')
        };
    }

    /**
     * Agregar métricas de memória
     *
     * @param {array} metrics - Métricas a agregar
     * @returns {object} Agregação
     */
    aggregateMemoryMetrics(metrics) {
        const memoryMetrics = metrics.filter(m => m.type === 'memory_operation');

        if (memoryMetrics.length === 0) return null;

        const successful = memoryMetrics.filter(m => m.data.success);

        return {
            count: memoryMetrics.length,
            successRate: successful.length / memoryMetrics.length,
            avgDuration: memoryMetrics.reduce((sum, m) => sum + (m.data.duration || 0), 0) / memoryMetrics.length,
            componentBreakdown: this.breakdownByField(memoryMetrics, 'data.component'),
            operationBreakdown: this.breakdownByField(memoryMetrics, 'data.operation')
        };
    }

    /**
     * Agregar métricas de feedback
     *
     * @param {array} metrics - Métricas a agregar
     * @returns {object} Agregação
     */
    aggregateFeedbackMetrics(metrics) {
        const feedbackMetrics = metrics.filter(m => m.type === 'feedback_operation');

        if (feedbackMetrics.length === 0) return null;

        return {
            count: feedbackMetrics.length,
            avgDuration: feedbackMetrics.reduce((sum, m) => sum + (m.data.duration || 0), 0) / feedbackMetrics.length,
            totalPatterns: feedbackMetrics.reduce((sum, m) => sum + (m.data.patternsFound || 0), 0),
            totalImprovements: feedbackMetrics.reduce((sum, m) => sum + (m.data.improvementsSuggested || 0), 0),
            operationBreakdown: this.breakdownByField(feedbackMetrics, 'data.operation')
        };
    }

    /**
     * Calcular tendências
     *
     * @param {array} metrics - Métricas para análise
     * @returns {object} Tendências calculadas
     */
    calculateTrends(metrics) {
        if (metrics.length < 10) return { note: 'Insufficient data for trend analysis' };

        // Dividir em períodos
        const midPoint = Math.floor(metrics.length / 2);
        const firstHalf = metrics.slice(0, midPoint);
        const secondHalf = metrics.slice(midPoint);

        const firstHalfSuccess = this.calculateSuccessRate(firstHalf);
        const secondHalfSuccess = this.calculateSuccessRate(secondHalf);

        const firstHalfLatency = this.calculateAvgLatency(firstHalf);
        const secondHalfLatency = this.calculateAvgLatency(secondHalf);

        return {
            successRate: {
                firstHalf: firstHalfSuccess,
                secondHalf: secondHalfSuccess,
                change: secondHalfSuccess - firstHalfSuccess,
                trend: this.getTrend(secondHalfSuccess - firstHalfSuccess)
            },
            latency: {
                firstHalf: firstHalfLatency,
                secondHalf: secondHalfLatency,
                change: secondHalfLatency - firstHalfLatency,
                trend: this.getTrend(firstHalfLatency - secondHalfLatency) // Inverso para latência
            }
        };
    }

    /**
     * Gerar insights baseados em métricas
     *
     * @param {array} metrics - Métricas para análise
     * @returns {array} Insights gerados
     */
    generateInsights(metrics) {
        const insights = [];

        // Calcular agregações diretamente sem chamar getAggregatedMetrics para evitar recursão
        const relevantMetrics = metrics;
        const promptMetrics = relevantMetrics.filter(m => m.type === 'prompt_execution');

        if (promptMetrics.length > 0) {
            // Calcular métricas básicas
            const successful = promptMetrics.filter(m => m.data.success);
            const successRate = successful.length / promptMetrics.length;
            const avgDuration = promptMetrics.reduce((sum, m) => sum + (m.data.duration || 0), 0) / promptMetrics.length;
            const cacheHits = promptMetrics.filter(m => m.data.cacheHit);
            const cacheHitRate = cacheHits.length / promptMetrics.length;

            // Insight: Taxa de sucesso baixa
            if (successRate < this.thresholds.successRate) {
                insights.push({
                    type: 'warning',
                    title: 'Taxa de Sucesso Baixa',
                    description: `Taxa de sucesso de ${(successRate * 100).toFixed(1)}% está abaixo do threshold de ${(this.thresholds.successRate * 100).toFixed(1)}%`,
                    recommendation: 'Revisar prompts e validações',
                    severity: 'high'
                });
            }

            // Insight: Cache pouco utilizado
            if (cacheHitRate < this.thresholds.cacheHitRate) {
                insights.push({
                    type: 'optimization',
                    title: 'Cache Subutilizado',
                    description: `Taxa de cache hit de ${(cacheHitRate * 100).toFixed(1)}% está baixa`,
                    recommendation: 'Otimizar estratégia de cache ou aumentar similaridade',
                    severity: 'medium'
                });
            }

            // Insight: Latência alta
            if (avgDuration > this.thresholds.latency) {
                insights.push({
                    type: 'performance',
                    title: 'Latência Elevada',
                    description: `Latência média de ${avgDuration.toFixed(0)}ms está acima do limite`,
                    recommendation: 'Otimizar prompts ou implementar cache',
                    severity: 'medium'
                });
            }
        }

        // Calcular tendências diretamente
        const trends = this.calculateTrends(metrics);
        if (trends && trends.successRate) {
            const successChange = trends.successRate.change;
            if (Math.abs(successChange) > 0.05) { // Mudança significativa >5%
                insights.push({
                    type: successChange > 0 ? 'improvement' : 'degradation',
                    title: successChange > 0 ? 'Melhoria Detectada' : 'Degradação Detectada',
                    description: `Taxa de sucesso ${successChange > 0 ? 'aumentou' : 'diminuiu'} ${(Math.abs(successChange) * 100).toFixed(1)}%`,
                    recommendation: successChange > 0 ? 'Continuar otimizações' : 'Investigar causas',
                    severity: successChange > 0 ? 'low' : 'high'
                });
            }
        }

        return insights;
    }

    /**
     * Verificar alertas baseado em métricas
     *
     * @param {object} metric - Métrica a verificar
     */
    async checkAlerts(metric) {
        const alertsTriggered = [];

        if (metric.type === 'prompt_execution') {
            const data = metric.data;

            // Alerta: Taxa de sucesso baixa
            if (!data.success) {
                const recentFailures = this.history
                    .filter(m => m.type === 'prompt_execution' && !m.data.success)
                    .slice(-10); // Últimas 10 falhas

                if (recentFailures.length >= 5) {
                    alertsTriggered.push({
                        id: `low_success_rate_${Date.now()}`,
                        type: 'success_rate',
                        severity: 'high',
                        message: `${recentFailures.length} falhas consecutivas detectadas`,
                        metric: metric,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // Alerta: Latência muito alta
            if (data.duration > this.thresholds.latency * 2) {
                alertsTriggered.push({
                    id: `high_latency_${Date.now()}`,
                    type: 'latency',
                    severity: 'medium',
                    message: `Latência de ${data.duration}ms excede 2x o limite`,
                    metric: metric,
                    timestamp: new Date().toISOString()
                });
            }

            // Alerta: Custo alto
            if (data.tokens > this.thresholds.cost) {
                alertsTriggered.push({
                    id: `high_cost_${Date.now()}`,
                    type: 'cost',
                    severity: 'low',
                    message: `${data.tokens} tokens excede limite de custo`,
                    metric: metric,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Registrar alertas
        alertsTriggered.forEach(alert => {
            this.alerts.set(alert.id, alert);

            // Armazenar alerta no LangMem como aprendizado
            this.llbProtocol.storePattern(
                `Alerta de métrica: ${alert.message} (Severidade: ${alert.severity})`,
                {
                    category: 'system_alerts',
                    source: 'metrics_collector',
                    alert_type: alert.type,
                    severity: alert.severity
                }
            );
        });

        // Limpar alertas antigos (manter apenas últimos 100)
        if (this.alerts.size > 100) {
            const oldestKeys = Array.from(this.alerts.keys()).slice(0, this.alerts.size - 100);
            oldestKeys.forEach(key => this.alerts.delete(key));
        }
    }

    /**
     * Iniciar coleta automática de métricas do sistema
     */
    startAutoCollection() {
        setInterval(async () => {
            try {
                await this.collectSystemMetrics();
            } catch (error) {
                log.warn('Error in auto collection', { error: error.message });
            }
        }, this.collectionInterval);
    }

    /**
     * Coletar métricas do sistema
     */
    async collectSystemMetrics() {
        // Métricas de sistema (simuladas por enquanto)
        await this.recordMetric('system_health', {
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            timestamp: Date.now()
        }, {
            system_type: 'node_process'
        });

        // Métricas agregadas do período
        const recentMetrics = this.getAggregatedMetrics('5m');
        if (recentMetrics.aggregations) {
            await this.recordMetric('system_aggregates', {
                promptSuccessRate: recentMetrics.aggregations.prompt_execution?.successRate || 0,
                cacheHitRate: recentMetrics.aggregations.cache_operation?.hitRate || 0,
                activeAlerts: this.alerts.size
            }, {
                aggregate_type: '5min_summary'
            });
        }
    }

    /**
     * Armazenar aprendizado de métricas no LangMem
     *
     * @param {object} metric - Métrica para armazenar
     */
    async storeMetricLearning(metric) {
        // Só armazenar aprendizados significativos
        if (metric.type === 'prompt_execution' && !metric.data.success) {
            const learningContent = `
Aprendizado de falha: ${metric.context.agent || 'Agente'} falhou em ${metric.context.task_type || 'task'}
Erro: ${metric.data.error || 'Desconhecido'}
Duração: ${metric.data.duration || 0}ms
Lições: ${this.generateErrorLessons(metric)}
            `.trim();

            await this.llbProtocol.storePattern(learningContent, {
                category: 'metric_patterns',
                source: 'metrics_collector',
                error_type: metric.context.error_type,
                agent: metric.context.agent
            });
        }
    }

    /**
     * Gerar lições aprendidas de erro
     *
     * @param {object} metric - Métrica de erro
     * @returns {string} Lições aprendidas
     */
    generateErrorLessons(metric) {
        const lessons = [];

        if (metric.data.duration > 10000) {
            lessons.push('Tempo de execução muito alto - considerar otimização');
        }

        if (metric.data.tokens > 2000) {
            lessons.push('Alto consumo de tokens - simplificar prompt');
        }

        if (!metric.data.cacheHit) {
            lessons.push('Cache miss - melhorar estratégia de cache');
        }

        return lessons.join('; ') || 'Investigar causa raiz';
    }

    // Métodos auxiliares

    generateMetricId() {
        return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCutoffTime(timeRange) {
        const now = new Date();
        switch (timeRange) {
            case '1h': now.setHours(now.getHours() - 1); break;
            case '24h': now.setHours(now.getHours() - 24); break;
            case '7d': now.setDate(now.getDate() - 7); break;
            case '30d': now.setDate(now.getDate() - 30); break;
            default: now.setHours(now.getHours() - 1);
        }
        return now;
    }

    matchesFilters(metric, filters) {
        for (const [key, value] of Object.entries(filters)) {
            if (metric[key] !== value && metric.context?.[key] !== value) {
                return false;
            }
        }
        return true;
    }

    breakdownByField(metrics, fieldPath) {
        const breakdown = {};
        metrics.forEach(metric => {
            const value = this.getNestedValue(metric, fieldPath);
            if (value) {
                breakdown[value] = (breakdown[value] || 0) + 1;
            }
        });
        return breakdown;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    calculateSuccessRate(metrics) {
        const executions = metrics.filter(m => m.type === 'prompt_execution');
        if (executions.length === 0) return 0;
        const successful = executions.filter(m => m.data.success);
        return successful.length / executions.length;
    }

    calculateAvgLatency(metrics) {
        const executions = metrics.filter(m => m.type === 'prompt_execution' && m.data.duration);
        if (executions.length === 0) return 0;
        return executions.reduce((sum, m) => sum + m.data.duration, 0) / executions.length;
    }

    getTrend(change) {
        if (change > 0.05) return 'improving';
        if (change < -0.05) return 'degrading';
        return 'stable';
    }

    categorizeTask(task) {
        if (!task) return 'unknown';
        const lower = task.toLowerCase();
        if (lower.includes('test') || lower.includes('teste')) return 'testing';
        if (lower.includes('code') || lower.includes('implement')) return 'coding';
        if (lower.includes('analyze') || lower.includes('analis')) return 'analysis';
        if (lower.includes('document') || lower.includes('doc')) return 'documentation';
        return 'general';
    }

    categorizeError(error) {
        if (!error) return 'unknown';
        const lower = error.toLowerCase();
        if (lower.includes('timeout') || lower.includes('time')) return 'timeout';
        if (lower.includes('network') || lower.includes('connection')) return 'network';
        if (lower.includes('validation') || lower.includes('invalid')) return 'validation';
        if (lower.includes('permission') || lower.includes('access')) return 'permission';
        return 'other';
    }

    updateRealtimeAggregations(metric) {
        // Atualizar agregações em tempo real (simplificado)
        // Em produção, isso poderia usar estruturas de dados mais eficientes
    }

    /**
     * Obter estatísticas gerais
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        return {
            totalMetrics: this.history.length,
            activeAlerts: this.alerts.size,
            realtimeMetrics: this.metrics.size,
            collectionInterval: this.collectionInterval,
            retentionLimit: this.historyRetention,
            thresholds: this.thresholds
        };
    }

    /**
     * Limpar métricas antigas
     *
     * @param {number} days - Dias para manter
     */
    cleanupOldMetrics(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const initialCount = this.history.length;
        this.history = this.history.filter(m => new Date(m.timestamp) >= cutoffDate);

        log.info('Cleaned up old metrics', {
            before: initialCount,
            after: this.history.length,
            removed: initialCount - this.history.length
        });
    }
}

// Singleton
let metricsCollectorInstance = null;

export function getMetricsCollector(options = {}) {
    if (!metricsCollectorInstance) {
        metricsCollectorInstance = new MetricsCollector(options);
    }
    return metricsCollectorInstance;
}

export default MetricsCollector;
