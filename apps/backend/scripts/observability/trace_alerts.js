#!/usr/bin/env node
/**
 * Trace Alerts - Alertas Baseados em Traces
 *
 * Sistema de alertas inteligentes baseado na análise de traces
 * distribuídos para detectar problemas de performance e confiabilidade
 */

import { getMetricsCollector } from '../swarm/metrics_collector.js';
import { logger } from '../utils/logger.js';
import { getDistributedTracer } from './distributed_tracer.js';

const log = logger.child({ module: 'trace_alerts' });

/**
 * Sistema de Alertas Baseados em Traces
 */
export class TraceAlerts {
    constructor(options = {}) {
        this.distributedTracer = getDistributedTracer();
        this.metricsCollector = getMetricsCollector();

        // Configurações de alertas
        this.alertThresholds = {
            latency: {
                warning: options.latencyWarning || 5000,    // 5 segundos
                critical: options.latencyCritical || 15000  // 15 segundos
            },
            errorRate: {
                warning: options.errorRateWarning || 0.05,  // 5%
                critical: options.errorRateCritical || 0.15 // 15%
            },
            spanCount: {
                warning: options.spanCountWarning || 50,    // 50 spans por trace
                critical: options.spanCountCritical || 100  // 100 spans por trace
            },
            memoryUsage: {
                warning: options.memoryWarning || 0.8,      // 80%
                critical: options.memoryCritical || 0.95    // 95%
            }
        };

        // Estado dos alertas
        this.activeAlerts = new Map();
        this.alertHistory = [];
        this.alertCooldowns = new Map(); // Evitar spam de alertas

        // Configurações
        this.alertCooldownMs = options.alertCooldown || 300000; // 5 minutos
        this.maxHistorySize = options.maxHistory || 1000;

        // Canais de notificação (em produção seria configurado)
        this.notificationChannels = {
            slack: options.slackWebhook || null,
            email: options.emailConfig || null,
            pagerDuty: options.pagerDutyKey || null
        };

        log.info('TraceAlerts initialized', {
            thresholds: Object.keys(this.alertThresholds).length,
            cooldown: this.alertCooldownMs
        });
    }

    /**
     * Analisar trace e gerar alertas
     */
    async analyzeTrace(traceInfo) {
        const alerts = [];

        try {
            // Análise de latência
            const latencyAlerts = this.analyzeLatency(traceInfo);
            alerts.push(...latencyAlerts);

            // Análise de taxa de erro
            const errorAlerts = this.analyzeErrorRate(traceInfo);
            alerts.push(...errorAlerts);

            // Análise de complexidade (número de spans)
            const complexityAlerts = this.analyzeComplexity(traceInfo);
            alerts.push(...complexityAlerts);

            // Análise de recursos
            const resourceAlerts = this.analyzeResourceUsage(traceInfo);
            alerts.push(...resourceAlerts);

            // Análise de padrões anômalos
            const anomalyAlerts = await this.analyzeAnomalies(traceInfo);
            alerts.push(...anomalyAlerts);

            // Processar alertas encontrados
            for (const alert of alerts) {
                await this.processAlert(alert, traceInfo);
            }

            if (alerts.length > 0) {
                log.info('Alerts generated from trace analysis', {
                    traceId: traceInfo.traceId,
                    alertCount: alerts.length,
                    alertTypes: alerts.map(a => a.type)
                });
            }

        } catch (error) {
            log.error('Error analyzing trace for alerts', {
                error: error.message,
                traceId: traceInfo.traceId
            });
        }

        return alerts;
    }

    /**
     * Analisar latência do trace
     */
    analyzeLatency(traceInfo) {
        const alerts = [];
        const duration = Date.now() - traceInfo.startTime;

        if (duration > this.alertThresholds.latency.critical) {
            alerts.push({
                type: 'latency_critical',
                severity: 'critical',
                title: 'Latência Crítica Detectada',
                description: `Trace ${traceInfo.operationName} excedeu ${this.alertThresholds.latency.critical}ms (${duration}ms)`,
                metric: 'latency',
                value: duration,
                threshold: this.alertThresholds.latency.critical,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName
            });
        } else if (duration > this.alertThresholds.latency.warning) {
            alerts.push({
                type: 'latency_warning',
                severity: 'warning',
                title: 'Latência Elevada Detectada',
                description: `Trace ${traceInfo.operationName} excedeu ${this.alertThresholds.latency.warning}ms (${duration}ms)`,
                metric: 'latency',
                value: duration,
                threshold: this.alertThresholds.latency.warning,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName
            });
        }

        return alerts;
    }

    /**
     * Analisar taxa de erro
     */
    analyzeErrorRate(traceInfo) {
        const alerts = [];

        // Verificar se há spans com erro
        const errorSpans = traceInfo.spans.filter(span =>
            span.status && span.status.code === 'error'
        );

        if (errorSpans.length > 0) {
            const errorRate = errorSpans.length / traceInfo.spans.length;

            if (errorRate > this.alertThresholds.errorRate.critical) {
                alerts.push({
                    type: 'error_rate_critical',
                    severity: 'critical',
                    title: 'Taxa de Erro Crítica',
                    description: `Trace ${traceInfo.operationName} tem ${Math.round(errorRate * 100)}% de spans com erro`,
                    metric: 'error_rate',
                    value: errorRate,
                    threshold: this.alertThresholds.errorRate.critical,
                    traceId: traceInfo.traceId,
                    operation: traceInfo.operationName,
                    errorSpans: errorSpans.length
                });
            } else if (errorRate > this.alertThresholds.errorRate.warning) {
                alerts.push({
                    type: 'error_rate_warning',
                    severity: 'warning',
                    title: 'Taxa de Erro Elevada',
                    description: `Trace ${traceInfo.operationName} tem ${Math.round(errorRate * 100)}% de spans com erro`,
                    metric: 'error_rate',
                    value: errorRate,
                    threshold: this.alertThresholds.errorRate.warning,
                    traceId: traceInfo.traceId,
                    operation: traceInfo.operationName,
                    errorSpans: errorSpans.length
                });
            }
        }

        return alerts;
    }

    /**
     * Analisar complexidade (número de spans)
     */
    analyzeComplexity(traceInfo) {
        const alerts = [];
        const spanCount = traceInfo.spans.length;

        if (spanCount > this.alertThresholds.spanCount.critical) {
            alerts.push({
                type: 'complexity_critical',
                severity: 'critical',
                title: 'Complexidade Crítica Detectada',
                description: `Trace ${traceInfo.operationName} tem ${spanCount} spans (limite: ${this.alertThresholds.spanCount.critical})`,
                metric: 'span_count',
                value: spanCount,
                threshold: this.alertThresholds.spanCount.critical,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName,
                recommendation: 'Considere dividir a operação em partes menores'
            });
        } else if (spanCount > this.alertThresholds.spanCount.warning) {
            alerts.push({
                type: 'complexity_warning',
                severity: 'warning',
                title: 'Complexidade Elevada Detectada',
                description: `Trace ${traceInfo.operationName} tem ${spanCount} spans (limite: ${this.alertThresholds.spanCount.warning})`,
                metric: 'span_count',
                value: spanCount,
                threshold: this.alertThresholds.spanCount.warning,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName,
                recommendation: 'Considere otimizar o fluxo de execução'
            });
        }

        return alerts;
    }

    /**
     * Analisar uso de recursos
     */
    analyzeResourceUsage(traceInfo) {
        const alerts = [];

        // Verificar atributos de recursos nos spans
        const resourceSpans = traceInfo.spans.filter(span =>
            span.attributes && (
                span.attributes['memory_usage'] ||
                span.attributes['cpu_usage'] ||
                span.attributes['disk_usage']
            )
        );

        for (const span of resourceSpans) {
            const memoryUsage = span.attributes['memory_usage'];
            if (memoryUsage !== undefined) {
                if (memoryUsage > this.alertThresholds.memoryUsage.critical) {
                    alerts.push({
                        type: 'memory_critical',
                        severity: 'critical',
                        title: 'Uso de Memória Crítico',
                        description: `Operação ${span.name} usando ${Math.round(memoryUsage * 100)}% de memória`,
                        metric: 'memory_usage',
                        value: memoryUsage,
                        threshold: this.alertThresholds.memoryUsage.critical,
                        traceId: traceInfo.traceId,
                        operation: traceInfo.operationName,
                        span: span.name
                    });
                } else if (memoryUsage > this.alertThresholds.memoryUsage.warning) {
                    alerts.push({
                        type: 'memory_warning',
                        severity: 'warning',
                        title: 'Uso de Memória Elevado',
                        description: `Operação ${span.name} usando ${Math.round(memoryUsage * 100)}% de memória`,
                        metric: 'memory_usage',
                        value: memoryUsage,
                        threshold: this.alertThresholds.memoryUsage.warning,
                        traceId: traceInfo.traceId,
                        operation: traceInfo.operationName,
                        span: span.name
                    });
                }
            }
        }

        return alerts;
    }

    /**
     * Analisar anomalias e padrões incomuns
     */
    async analyzeAnomalies(traceInfo) {
        const alerts = [];

        // Detectar traces muito rápidas (possível problema de cache)
        const duration = Date.now() - traceInfo.startTime;
        if (duration < 10 && traceInfo.spans.length > 5) {
            alerts.push({
                type: 'anomaly_fast_trace',
                severity: 'info',
                title: 'Trace Excessivamente Rápido',
                description: `Trace ${traceInfo.operationName} completou em ${duration}ms com ${traceInfo.spans.length} spans`,
                metric: 'trace_duration',
                value: duration,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName,
                anomaly: 'too_fast'
            });
        }

        // Detectar traces sem spans filhos (operação muito simples)
        if (traceInfo.spans.length === 1 && traceInfo.operationName.includes('complex')) {
            alerts.push({
                type: 'anomaly_simple_trace',
                severity: 'info',
                title: 'Trace Muito Simples',
                description: `Operação complexa ${traceInfo.operationName} executou apenas 1 span`,
                metric: 'span_count',
                value: traceInfo.spans.length,
                traceId: traceInfo.traceId,
                operation: traceInfo.operationName,
                anomaly: 'too_simple'
            });
        }

        // Detectar padrões de cascade failure
        const errorSpans = traceInfo.spans.filter(span =>
            span.status && span.status.code === 'error'
        );

        if (errorSpans.length > 1) {
            // Verificar se erros são sequenciais (cascade)
            const errorIndices = errorSpans.map(span =>
                traceInfo.spans.indexOf(span)
            ).sort((a, b) => a - b);

            let sequentialErrors = 1;
            for (let i = 1; i < errorIndices.length; i++) {
                if (errorIndices[i] === errorIndices[i - 1] + 1) {
                    sequentialErrors++;
                } else {
                    break;
                }
            }

            if (sequentialErrors >= 3) {
                alerts.push({
                    type: 'cascade_failure',
                    severity: 'critical',
                    title: 'Falha em Cascata Detectada',
                    description: `${sequentialErrors} spans falharam sequencialmente em ${traceInfo.operationName}`,
                    metric: 'error_sequence',
                    value: sequentialErrors,
                    traceId: traceInfo.traceId,
                    operation: traceInfo.operationName,
                    anomaly: 'cascade_failure'
                });
            }
        }

        return alerts;
    }

    /**
     * Processar alerta gerado
     */
    async processAlert(alert, traceInfo) {
        const alertId = `${alert.type}_${alert.traceId}_${Date.now()}`;

        // Verificar cooldown
        const cooldownKey = `${alert.type}_${alert.operation}`;
        const lastAlert = this.alertCooldowns.get(cooldownKey);

        if (lastAlert && (Date.now() - lastAlert) < this.alertCooldownMs) {
            log.debug('Alert suppressed by cooldown', { alertId, type: alert.type });
            return;
        }

        // Registrar alerta ativo
        this.activeAlerts.set(alertId, {
            ...alert,
            id: alertId,
            timestamp: new Date().toISOString(),
            traceInfo: {
                traceId: traceInfo.traceId,
                correlationId: traceInfo.correlationId,
                operationName: traceInfo.operationName
            }
        });

        // Atualizar cooldown
        this.alertCooldowns.set(cooldownKey, Date.now());

        // Adicionar ao histórico
        this.alertHistory.push(this.activeAlerts.get(alertId));
        if (this.alertHistory.length > this.maxHistorySize) {
            this.alertHistory.shift();
        }

        // Registrar métrica
        await this.metricsCollector.recordMetric('trace_alert_generated', 1, {
            alert_type: alert.type,
            alert_severity: alert.severity,
            alert_metric: alert.metric,
            trace_operation: traceInfo.operationName
        });

        // Notificar (simulado)
        await this.notifyAlert(alert);

        log.warn('Trace alert generated', {
            alertId,
            type: alert.type,
            severity: alert.severity,
            traceId: alert.traceId
        });
    }

    /**
     * Notificar alerta (simulado)
     */
    async notifyAlert(alert) {
        // Em produção, isso enviaria notificações reais

        // Slack notification
        if (this.notificationChannels.slack) {
            log.info('Slack alert notification', {
                alertType: alert.type,
                severity: alert.severity,
                message: alert.title
            });
        }

        // Email notification
        if (this.notificationChannels.email) {
            log.info('Email alert notification', {
                alertType: alert.type,
                severity: alert.severity,
                message: alert.title
            });
        }

        // PagerDuty (para alertas críticos)
        if (this.notificationChannels.pagerDuty && alert.severity === 'critical') {
            log.info('PagerDuty alert notification', {
                alertType: alert.type,
                severity: alert.severity,
                message: alert.title
            });
        }

        // Log estruturado
        this.logStructuredAlert(alert);
    }

    /**
     * Log estruturado do alerta
     */
    logStructuredAlert(alert) {
        const logData = {
            alert_id: alert.id,
            alert_type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            trace_id: alert.traceId,
            operation: alert.operation,
            timestamp: new Date().toISOString(),
            recommendation: alert.recommendation || null
        };

        log.error('🚨 TRACE ALERT', logData);
    }

    /**
     * Resolver alerta
     */
    resolveAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.resolvedAt = new Date().toISOString();
            alert.status = 'resolved';

            // Mover para histórico resolvido
            this.alertHistory.push({ ...alert });

            // Remover dos ativos
            this.activeAlerts.delete(alertId);

            log.info('Alert resolved', { alertId, type: alert.type });
        }
    }

    /**
     * Obter alertas ativos
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }

    /**
     * Obter histórico de alertas
     */
    getAlertHistory(hours = 24) {
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));

        return this.alertHistory.filter(alert =>
            new Date(alert.timestamp) >= cutoffTime
        );
    }

    /**
     * Obter estatísticas de alertas
     */
    getAlertStats() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const last1h = now - (60 * 60 * 1000);

        const alerts24h = this.alertHistory.filter(a => new Date(a.timestamp).getTime() >= last24h);
        const alerts1h = this.alertHistory.filter(a => new Date(a.timestamp).getTime() >= last1h);

        const severityCount = {};
        alerts24h.forEach(alert => {
            severityCount[alert.severity] = (severityCount[alert.severity] || 0) + 1;
        });

        return {
            active_alerts: this.activeAlerts.size,
            alerts_last_24h: alerts24h.length,
            alerts_last_1h: alerts1h.length,
            severity_breakdown: severityCount,
            most_common_types: this.getMostCommonAlertTypes(alerts24h, 5),
            avg_resolution_time: this.calculateAvgResolutionTime(alerts24h)
        };
    }

    /**
     * Obter tipos de alerta mais comuns
     */
    getMostCommonAlertTypes(alerts, limit = 5) {
        const typeCount = {};
        alerts.forEach(alert => {
            typeCount[alert.type] = (typeCount[alert.type] || 0) + 1;
        });

        return Object.entries(typeCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([type, count]) => ({ type, count }));
    }

    /**
     * Calcular tempo médio de resolução
     */
    calculateAvgResolutionTime(alerts) {
        const resolvedAlerts = alerts.filter(alert =>
            alert.resolvedAt && alert.status === 'resolved'
        );

        if (resolvedAlerts.length === 0) return 0;

        const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
            const created = new Date(alert.timestamp).getTime();
            const resolved = new Date(alert.resolvedAt).getTime();
            return sum + (resolved - created);
        }, 0);

        return totalResolutionTime / resolvedAlerts.length;
    }

    /**
     * Limpar alertas antigos
     */
    cleanupOldAlerts(maxAgeHours = 24) {
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

        // Limpar cooldowns antigos
        for (const [key, timestamp] of this.alertCooldowns.entries()) {
            if (timestamp < cutoffTime) {
                this.alertCooldowns.delete(key);
            }
        }

        // Limpar histórico antigo
        const initialSize = this.alertHistory.length;
        this.alertHistory = this.alertHistory.filter(alert =>
            new Date(alert.timestamp).getTime() >= cutoffTime
        );

        const removed = initialSize - this.alertHistory.length;
        if (removed > 0) {
            log.info('Cleaned up old alerts', { removed });
        }
    }

    /**
     * Configurar thresholds de alertas
     */
    configureThresholds(thresholds) {
        Object.assign(this.alertThresholds, thresholds);
        log.info('Alert thresholds updated', { thresholds });
    }

    /**
     * Configurar canais de notificação
     */
    configureNotifications(channels) {
        Object.assign(this.notificationChannels, channels);
        log.info('Notification channels updated', {
            channels: Object.keys(channels)
        });
    }
}

// Singleton
let traceAlertsInstance = null;

export function getTraceAlerts(options = {}) {
    if (!traceAlertsInstance) {
        traceAlertsInstance = new TraceAlerts(options);
    }
    return traceAlertsInstance;
}

export default TraceAlerts;