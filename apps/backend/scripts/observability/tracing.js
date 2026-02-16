#!/usr/bin/env node
/**
 * Sistema de Tracing - Observabilidade Avançada
 *
 * Implementa tracing distribuído com OpenTelemetry
 */

import { getMetricsCollector } from '../swarm/metrics_collector.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'tracing' });

/**
 * Sistema de Tracing Distribuído
 */
export class TracingSystem {
    constructor(options = {}) {
        this.serviceName = options.serviceName || 'corporacao-senciente';
        this.serviceVersion = options.serviceVersion || '7.0.0';
        this.environment = options.environment || 'development';

        // Spans ativos
        this.activeSpans = new Map();
        this.spanCounter = 0;

        // Estatísticas
        this.stats = {
            totalSpans: 0,
            activeSpans: 0,
            completedSpans: 0,
            erroredSpans: 0,
            avgSpanDuration: 0
        };

        // Configuração de sampling
        this.samplingRate = options.samplingRate || 1.0; // 100% por padrão

        // Export destinations
        this.exporters = {
            console: options.consoleExport || true,
            file: options.fileExport || false,
            jaeger: options.jaegerExport || false,
            tempo: options.tempoExport || false
        };

        log.info('TracingSystem initialized', {
            service: this.serviceName,
            version: this.serviceVersion,
            sampling: this.samplingRate
        });
    }

    /**
     * Inicia um novo span
     *
     * @param {string} name - Nome do span
     * @param {object} attributes - Atributos do span
     * @param {string} parentSpanId - ID do span pai (opcional)
     * @returns {object} Span criado
     */
    startSpan(name, attributes = {}, parentSpanId = null) {
        const spanId = this.generateSpanId();
        const traceId = parentSpanId ? this.getTraceId(parentSpanId) : this.generateTraceId();

        const span = {
            id: spanId,
            traceId: traceId,
            parentId: parentSpanId,
            name: name,
            startTime: Date.now(),
            endTime: null,
            duration: null,
            status: 'started',
            attributes: {
                service: this.serviceName,
                version: this.serviceVersion,
                environment: this.environment,
                ...attributes
            },
            events: [],
            children: [],
            tags: new Set()
        };

        // Adicionar ao span pai se existir
        if (parentSpanId && this.activeSpans.has(parentSpanId)) {
            const parentSpan = this.activeSpans.get(parentSpanId);
            parentSpan.children.push(spanId);
        }

        // Registrar span ativo
        this.activeSpans.set(spanId, span);
        this.stats.totalSpans++;
        this.stats.activeSpans++;

        // Aplicar sampling
        if (Math.random() > this.samplingRate) {
            span.sampled = false;
            span.tags.add('sampled_out');
        } else {
            span.sampled = true;
        }

        log.debug('Span started', {
            spanId,
            traceId,
            name,
            parentId: parentSpanId,
            sampled: span.sampled
        });

        return span;
    }

    /**
     * Adiciona um evento ao span
     *
     * @param {string} spanId - ID do span
     * @param {string} name - Nome do evento
     * @param {object} attributes - Atributos do evento
     */
    addEvent(spanId, name, attributes = {}) {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            log.warn('Span not found for event', { spanId, event: name });
            return;
        }

        const event = {
            name,
            timestamp: Date.now(),
            attributes: {
                ...attributes,
                span_id: spanId,
                trace_id: span.traceId
            }
        };

        span.events.push(event);

        log.debug('Event added to span', {
            spanId,
            event: name,
            attributes: Object.keys(attributes)
        });
    }

    /**
     * Define atributos no span
     *
     * @param {string} spanId - ID do span
     * @param {object} attributes - Atributos a definir
     */
    setAttributes(spanId, attributes) {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            log.warn('Span not found for attributes', { spanId });
            return;
        }

        Object.assign(span.attributes, attributes);

        log.debug('Attributes set on span', {
            spanId,
            attributes: Object.keys(attributes)
        });
    }

    /**
     * Define tag no span
     *
     * @param {string} spanId - ID do span
     * @param {string} tag - Tag a adicionar
     */
    addTag(spanId, tag) {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            log.warn('Span not found for tag', { spanId, tag });
            return;
        }

        span.tags.add(tag);
    }

    /**
     * Finaliza um span
     *
     * @param {string} spanId - ID do span
     * @param {string} status - Status final ('ok', 'error')
     * @param {string} errorMessage - Mensagem de erro (opcional)
     */
    endSpan(spanId, status = 'ok', errorMessage = null) {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            log.warn('Span not found for ending', { spanId });
            return;
        }

        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = status;

        if (status === 'error' && errorMessage) {
            span.attributes.error = errorMessage;
            span.tags.add('error');
            this.stats.erroredSpans++;
        }

        // Atualizar estatísticas
        this.stats.completedSpans++;
        this.stats.activeSpans--;

        // Calcular duração média
        const totalDuration = this.stats.avgSpanDuration * (this.stats.completedSpans - 1) + span.duration;
        this.stats.avgSpanDuration = totalDuration / this.stats.completedSpans;

        // Exportar span se foi sampled
        if (span.sampled) {
            this.exportSpan(span);
        }

        // Registrar métricas
        this.recordSpanMetrics(span);

        log.debug('Span ended', {
            spanId,
            duration: span.duration,
            status,
            sampled: span.sampled
        });

        // Remover da lista ativa (manter por enquanto para referência)
        // this.activeSpans.delete(spanId);
    }

    /**
     * Cria span filho
     *
     * @param {string} parentSpanId - ID do span pai
     * @param {string} name - Nome do span filho
     * @param {object} attributes - Atributos do span filho
     * @returns {object} Span filho criado
     */
    createChildSpan(parentSpanId, name, attributes = {}) {
        const parentSpan = this.activeSpans.get(parentSpanId);
        if (!parentSpan) {
            log.warn('Parent span not found', { parentSpanId });
            // Criar span órfão
            return this.startSpan(name, attributes);
        }

        attributes.parent_name = parentSpan.name;
        attributes.parent_service = parentSpan.attributes.service;

        return this.startSpan(name, attributes, parentSpanId);
    }

    /**
     * Cria spans para operações críticas do sistema
     */
    createSystemSpans() {
        return {
            // Prompt generation span
            promptGeneration: (attributes = {}) =>
                this.startSpan('prompt_generation', {
                    operation: 'generate_prompt',
                    component: 'brain_prompt_generator',
                    ...attributes
                }),

            // Incorporation span
            incorporation: (attributes = {}) =>
                this.startSpan('incorporation', {
                    operation: 'incorporate_with_agent',
                    component: 'llb_executor',
                    ...attributes
                }),

            // Action execution span
            actionExecution: (attributes = {}) =>
                this.startSpan('action_execution', {
                    operation: 'execute_action',
                    component: 'llb_executor',
                    ...attributes
                }),

            // Agent communication span
            agentCommunication: (attributes = {}) =>
                this.startSpan('agent_communication', {
                    operation: 'call_agent',
                    component: 'base_agent',
                    ...attributes
                }),

            // LLM call span
            llmCall: (attributes = {}) =>
                this.startSpan('llm_call', {
                    operation: 'call_model',
                    component: 'model_router',
                    ...attributes
                }),

            // Database operation span
            databaseOperation: (attributes = {}) =>
                this.startSpan('database_operation', {
                    operation: 'db_query',
                    component: 'memory_system',
                    ...attributes
                }),

            // Cache operation span
            cacheOperation: (attributes = {}) =>
                this.startSpan('cache_operation', {
                    operation: 'cache_access',
                    component: 'cache_system',
                    ...attributes
                }),

            // Validation span
            validation: (attributes = {}) =>
                this.startSpan('validation', {
                    operation: 'validate_action',
                    component: 'action_validator',
                    ...attributes
                }),

            // Confidence scoring span
            confidenceScoring: (attributes = {}) =>
                this.startSpan('confidence_scoring', {
                    operation: 'calculate_confidence',
                    component: 'confidence_scorer',
                    ...attributes
                })
        };
    }

    /**
     * Cria span com contexto de request completo
     *
     * @param {string} requestId - ID único do request
     * @param {string} operation - Operação sendo executada
     * @param {object} context - Contexto adicional
     * @returns {object} Span raiz do request
     */
    createRequestSpan(requestId, operation, context = {}) {
        return this.startSpan(`${operation}_request`, {
            request_id: requestId,
            operation,
            user_id: context.userId,
            agent: context.agent,
            correlation_id: context.correlationId || requestId,
            source: context.source || 'unknown',
            priority: context.priority || 'normal',
            ...context
        });
    }

    /**
     * Exporta span para os destinos configurados
     *
     * @param {object} span - Span a exportar
     */
    async exportSpan(span) {
        try {
            // Export para console
            if (this.exporters.console) {
                this.exportToConsole(span);
            }

            // Export para arquivo
            if (this.exporters.file) {
                await this.exportToFile(span);
            }

            // Export para Jaeger
            if (this.exporters.jaeger) {
                await this.exportToJaeger(span);
            }

            // Export para Tempo
            if (this.exporters.tempo) {
                await this.exportToTempo(span);
            }

        } catch (error) {
            log.error('Error exporting span', { error: error.message, spanId: span.id });
        }
    }

    /**
     * Exporta para console
     *
     * @param {object} span - Span a exportar
     */
    exportToConsole(span) {
        const exportData = {
            traceId: span.traceId,
            spanId: span.id,
            parentId: span.parentId,
            name: span.name,
            duration: span.duration,
            status: span.status,
            attributes: span.attributes,
            events: span.events.length,
            children: span.children.length,
            tags: Array.from(span.tags)
        };

        log.info('Span exported to console', exportData);
    }

    /**
     * Exporta para arquivo (simulado)
     *
     * @param {object} span - Span a exportar
     */
    async exportToFile(span) {
        // Em produção, escreveria para arquivo ou buffer rotativo
        log.debug('Span exported to file', {
            spanId: span.id,
            traceId: span.traceId,
            filename: `traces/${span.traceId}.json`
        });
    }

    /**
     * Exporta para Jaeger (simulado)
     *
     * @param {object} span - Span a exportar
     */
    async exportToJaeger(span) {
        // Em produção, enviaria para Jaeger via UDP/TCP
        log.debug('Span exported to Jaeger', {
            spanId: span.id,
            traceId: span.traceId,
            endpoint: 'jaeger-collector:14268'
        });
    }

    /**
     * Exporta para Tempo (simulado)
     *
     * @param {object} span - Span a exportar
     */
    async exportToTempo(span) {
        // Em produção, enviaria para Tempo via HTTP/gRPC
        log.debug('Span exported to Tempo', {
            spanId: span.id,
            traceId: span.traceId,
            endpoint: 'tempo:4318'
        });
    }

    /**
     * Registra métricas do span
     *
     * @param {object} span - Span para registrar métricas
     */
    recordSpanMetrics(span) {
        getMetricsCollector().recordMetric('tracing_span', {
            span_name: span.name,
            duration: span.duration,
            status: span.status,
            events_count: span.events.length,
            children_count: span.children.length,
            trace_id: span.traceId,
            sampled: span.sampled
        }, {
            metric_type: 'tracing_performance',
            span_type: span.name.split('_')[0], // prompt, incorporation, etc.
            has_error: span.status === 'error'
        });
    }

    /**
     * Obtém estatísticas de tracing
     *
     * @returns {object} Estatísticas
     */
    getStats() {
        return {
            ...this.stats,
            activeSpansCount: this.activeSpans.size,
            samplingRate: this.samplingRate,
            exporters: this.exporters
        };
    }

    /**
     * Obtém spans ativos
     *
     * @returns {array} Lista de spans ativos
     */
    getActiveSpans() {
        return Array.from(this.activeSpans.values()).map(span => ({
            id: span.id,
            traceId: span.traceId,
            name: span.name,
            startTime: span.startTime,
            duration: Date.now() - span.startTime,
            attributes: span.attributes,
            events: span.events.length,
            children: span.children.length
        }));
    }

    /**
     * Força limpeza de spans antigos
     *
     * @param {number} maxAge - Idade máxima em ms
     */
    cleanupOldSpans(maxAge = 3600000) { // 1 hora
        const now = Date.now();
        const toRemove = [];

        for (const [spanId, span] of this.activeSpans.entries()) {
            if (span.endTime && (now - span.endTime) > maxAge) {
                toRemove.push(spanId);
            }
        }

        toRemove.forEach(spanId => this.activeSpans.delete(spanId));

        if (toRemove.length > 0) {
            log.info('Cleaned up old spans', { count: toRemove.length });
        }
    }

    // Métodos auxiliares

    generateSpanId() {
        return `span_${++this.spanCounter}_${Date.now()}`;
    }

    generateTraceId() {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getTraceId(spanId) {
        const span = this.activeSpans.get(spanId);
        return span ? span.traceId : this.generateTraceId();
    }
}

// Singleton
let tracingSystemInstance = null;

export function getTracingSystem(options = {}) {
    if (!tracingSystemInstance) {
        tracingSystemInstance = new TracingSystem(options);
    }
    return tracingSystemInstance;
}

// Funções utilitárias para tracing automático
export function withTracing(spanName, attributes = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const tracer = getTracingSystem();
            const span = tracer.startSpan(spanName, attributes);

            try {
                const result = await originalMethod.apply(this, args);
                tracer.endSpan(span.id, 'ok');
                return result;
            } catch (error) {
                tracer.addEvent(span.id, 'error', { error: error.message });
                tracer.endSpan(span.id, 'error', error.message);
                throw error;
            }
        };

        return descriptor;
    };
}

export function traceMethod(spanName, attributes = {}) {
    return withTracing(spanName, attributes);
}

export default TracingSystem;