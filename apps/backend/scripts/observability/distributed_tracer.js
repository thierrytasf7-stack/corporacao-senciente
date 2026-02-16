#!/usr/bin/env node
/**
 * Distributed Tracer - Tracing Distribuído para Operações Críticas
 *
 * Sistema de tracing completo para rastrear fluxo end-to-end através
 * de agentes, LLB Executor, e operações do sistema
 */

import { getLLBProtocol } from '../memory/llb_protocol.js';
import { getCorrelationManager } from '../utils/correlation_manager.js';
import { logger } from '../utils/logger.js';
import { getOpenTelemetry } from './opentelemetry_setup.js';

const log = logger.child({ module: 'distributed_tracer' });

/**
 * Tracer Distribuído para Operações Críticas
 */
export class DistributedTracer {
    constructor(options = {}) {
        this.openTelemetry = getOpenTelemetry(options);
        this.llbProtocol = getLLBProtocol();
        this.correlationManager = getCorrelationManager();

        // Configurações de tracing
        this.traceOperations = options.traceOperations || [
            'llb_execution',
            'agent_interaction',
            'model_routing',
            'rag_search',
            'validation_check',
            'memory_operation',
            'cache_operation'
        ];

        this.traceLevel = options.traceLevel || 'detailed'; // 'basic' | 'detailed' | 'comprehensive'

        // Estado de traces ativos
        this.activeTraces = new Map();
        this.correlationIds = new Map();

        // Métricas de tracing
        this.traceMetrics = {
            total_traces: 0,
            active_traces: 0,
            avg_trace_duration: 0,
            error_traces: 0,
            spans_per_trace: 0
        };

        log.info('DistributedTracer initialized', {
            traceOperations: this.traceOperations.length,
            traceLevel: this.traceLevel
        });
    }

    /**
     * Inicializar tracing
     */
    async initialize() {
        await this.openTelemetry.initialize();

        // Configurar spans para operações críticas
        this.setupCriticalOperationSpans();

        log.info('Distributed tracing initialized');
    }

    /**
     * Iniciar trace para operação
     */
    startTrace(operationName, context = {}) {
        const traceId = this.generateTraceId();
        const correlationId = context.correlationId || this.correlationManager.startCorrelation(operationName, {
            userId: context.userId || 'anonymous',
            agent: context.agent || 'system',
            requestType: context.type || 'unknown',
            sessionId: context.sessionId
        });

        // Criar span principal
        const span = this.openTelemetry.createSpan(operationName, {
            attributes: {
                'trace.id': traceId,
                'correlation.id': correlationId,
                'operation.name': operationName,
                'operation.type': context.type || 'unknown',
                'agent.name': context.agent || 'system',
                'user.id': context.userId || 'anonymous',
                'timestamp.start': Date.now()
            }
        });

        // Registrar trace ativo
        const traceInfo = {
            traceId,
            correlationId,
            operationName,
            startTime: Date.now(),
            spans: [span],
            context
        };

        this.activeTraces.set(traceId, traceInfo);
        this.correlationIds.set(correlationId, traceId);
        this.traceMetrics.total_traces++;
        this.traceMetrics.active_traces++;

        // Adicionar eventos iniciais
        span.addEvent('trace_started', {
            operation: operationName,
            context: JSON.stringify(context)
        });

        log.debug('Trace started', { traceId, correlationId, operationName });

        return { traceId, correlationId, span };
    }

    /**
     * Finalizar trace
     */
    endTrace(traceId, result = null, error = null) {
        const traceInfo = this.activeTraces.get(traceId);
        if (!traceInfo) {
            log.warn('Trace not found for ending', { traceId });
            return;
        }

        const duration = Date.now() - traceInfo.startTime;

        // Finalizar spans
        traceInfo.spans.forEach(span => {
            try {
                if (error) {
                    span.recordException(error);
                    span.setStatus({ code: 'error', message: error.message });
                } else {
                    span.setStatus({ code: 'ok' });
                }

                span.setAttribute('duration_ms', duration);
                span.setAttribute('spans_count', traceInfo.spans.length);

                if (result) {
                    span.setAttribute('result.success', result.success !== false);
                    span.setAttribute('result.size', JSON.stringify(result).length);
                }

                span.addEvent('trace_completed', {
                    duration,
                    spans: traceInfo.spans.length,
                    success: !error
                });

                span.end();
            } catch (spanError) {
                log.warn('Error ending span', { spanError: spanError.message });
            }
        });

        // Finalizar correlação
        this.correlationManager.endCorrelation(traceInfo.correlationId, result, error);

        // Atualizar métricas
        this.updateTraceMetrics(duration, error, traceInfo.spans.length);

        // Limpar trace ativo
        this.activeTraces.delete(traceId);
        this.correlationIds.delete(traceInfo.correlationId);
        this.traceMetrics.active_traces--;

        log.debug('Trace completed', {
            traceId,
            correlationId: traceInfo.correlationId,
            duration,
            spans: traceInfo.spans.length,
            success: !error
        });
    }

    /**
     * Criar span filho para operação específica
     */
    createChildSpan(traceId, spanName, attributes = {}) {
        const traceInfo = this.activeTraces.get(traceId);
        if (!traceInfo) {
            log.warn('Parent trace not found for child span', { traceId, spanName });
            return null;
        }

        const childSpan = this.openTelemetry.createSpan(spanName, {
            attributes: {
                'trace.id': traceId,
                'correlation.id': traceInfo.correlationId,
                'parent.operation': traceInfo.operationName,
                'span.type': 'child',
                ...attributes
            }
        });

        // Adicionar ao trace
        traceInfo.spans.push(childSpan);

        return childSpan;
    }

    /**
     * Trace operação crítica com span automático
     */
    async traceCriticalOperation(operationName, operationFn, context = {}) {
        const { traceId, span } = this.startTrace(operationName, context);

        try {
            // Adicionar spans para suboperações críticas
            await this.addCriticalOperationSpans(traceId, operationName, context);

            const result = await operationFn();

            // Span de sucesso
            const successSpan = this.createChildSpan(traceId, 'operation_success', {
                'result.type': typeof result,
                'result.success': true
            });

            if (successSpan) {
                successSpan.end();
            }

            return result;

        } catch (error) {
            // Span de erro
            const errorSpan = this.createChildSpan(traceId, 'operation_error', {
                'error.type': error.constructor.name,
                'error.message': error.message
            });

            if (errorSpan) {
                errorSpan.recordException(error);
                errorSpan.end();
            }

            throw error;

        } finally {
            this.endTrace(traceId, null, null);
        }
    }

    /**
     * Adicionar spans para operações críticas
     */
    async addCriticalOperationSpans(traceId, operationName, context) {
        // Geração de prompts
        if (operationName.includes('prompt') || operationName.includes('generate')) {
            const promptSpan = this.createChildSpan(traceId, 'prompt_generation', {
                'prompt.type': context.promptType || 'unknown',
                'prompt.length': context.promptLength || 0
            });

            if (promptSpan) {
                promptSpan.addEvent('prompt_analysis_started');
                // Simular análise de prompt
                await this.delay(50);
                promptSpan.addEvent('prompt_analysis_completed');
                promptSpan.end();
            }
        }

        // Incorporação no chat
        if (operationName.includes('incorporate') || operationName.includes('chat')) {
            const chatSpan = this.createChildSpan(traceId, 'chat_incorporation', {
                'chat.agent': context.agent || 'unknown',
                'chat.message_length': context.messageLength || 0
            });

            if (chatSpan) {
                chatSpan.addEvent('agent_selection');
                chatSpan.addEvent('context_injection');
                chatSpan.addEvent('response_generation');
                chatSpan.end();
            }
        }

        // Execução de ações
        if (operationName.includes('execute') || operationName.includes('action')) {
            const actionSpan = this.createChildSpan(traceId, 'action_execution', {
                'action.type': context.actionType || 'unknown',
                'action.agent': context.agent || 'system'
            });

            if (actionSpan) {
                actionSpan.addEvent('validation_started');
                actionSpan.addEvent('confidence_check');
                actionSpan.addEvent('execution_started');
                actionSpan.addEvent('result_processing');
                actionSpan.end();
            }
        }

        // Chamadas agent-to-agent
        if (operationName.includes('agent_call') || operationName.includes('handoff')) {
            const agentSpan = this.createChildSpan(traceId, 'agent_interaction', {
                'agent.caller': context.callerAgent || 'unknown',
                'agent.target': context.targetAgent || 'unknown',
                'agent.depth': context.depth || 0
            });

            if (agentSpan) {
                agentSpan.addEvent('agent_resolution');
                agentSpan.addEvent('permission_check');
                agentSpan.addEvent('context_transfer');
                agentSpan.end();
            }
        }
    }

    /**
     * Trace operação LLB completa
     */
    async traceLLBOperation(action, context = {}) {
        return this.traceCriticalOperation('llb_execution', async () => {
            const traceId = this.activeTraces.keys().next().value;
            const llbSpan = this.createChildSpan(traceId, 'llb_full_execution', {
                'llb.action_type': action.type,
                'llb.agent': context.agent
            });

            try {
                llbSpan.addEvent('llb_started', {
                    action: JSON.stringify(action),
                    context: JSON.stringify(context)
                });

                // Sub-spans para cada etapa do LLB
                const validationSpan = this.createChildSpan(traceId, 'llb_validation', {
                    'validation.type': 'security_and_safety'
                });

                if (validationSpan) {
                    validationSpan.addEvent('action_validation');
                    validationSpan.addEvent('security_checks');
                    validationSpan.end();
                }

                const confidenceSpan = this.createChildSpan(traceId, 'llb_confidence', {
                    'confidence.calculation': 'multi_factor'
                });

                if (confidenceSpan) {
                    confidenceSpan.addEvent('factor_analysis');
                    confidenceSpan.addEvent('decision_making');
                    confidenceSpan.end();
                }

                const executionSpan = this.createChildSpan(traceId, 'llb_execution_core', {
                    'execution.type': 'protocol_llb'
                });

                if (executionSpan) {
                    executionSpan.addEvent('protocol_execution');
                    executionSpan.addEvent('result_processing');
                    executionSpan.end();
                }

                const feedbackSpan = this.createChildSpan(traceId, 'llb_feedback', {
                    'feedback.type': 'learning_loop'
                });

                if (feedbackSpan) {
                    feedbackSpan.addEvent('feedback_collection');
                    feedbackSpan.addEvent('learning_update');
                    feedbackSpan.end();
                }

                llbSpan.addEvent('llb_completed', {
                    success: true,
                    timestamp: Date.now()
                });

                return { success: true, message: 'LLB execution completed' };

            } finally {
                if (llbSpan) {
                    llbSpan.end();
                }
            }
        }, {
            type: 'llb_execution',
            agent: context.agent,
            actionType: action.type
        });
    }

    /**
     * Trace operação de RAG
     */
    async traceRAGOperation(query, context = {}) {
        return this.traceCriticalOperation('rag_search', async () => {
            const traceId = this.activeTraces.keys().next().value;

            // Span para expansão de query
            const expansionSpan = this.createChildSpan(traceId, 'rag_query_expansion', {
                'query.original_length': query.length,
                'expansion.type': 'synonym_and_context'
            });

            if (expansionSpan) {
                expansionSpan.addEvent('synonym_expansion');
                expansionSpan.addEvent('context_expansion');
                expansionSpan.end();
            }

            // Span para busca híbrida
            const searchSpan = this.createChildSpan(traceId, 'rag_hybrid_search', {
                'search.type': 'vector_plus_keyword',
                'search.sources': ['langmem', 'documentation', 'codebase']
            });

            if (searchSpan) {
                searchSpan.addEvent('vector_search');
                searchSpan.addEvent('keyword_search');
                searchSpan.addEvent('result_merging');
                searchSpan.end();
            }

            // Span para re-ranking
            const rerankSpan = this.createChildSpan(traceId, 'rag_reranking', {
                'rerank.algorithm': 'cross_encoder_simulation',
                'rerank.top_k': 5
            });

            if (rerankSpan) {
                rerankSpan.addEvent('cross_encoder_scoring');
                rerankSpan.addEvent('result_reordering');
                rerankSpan.end();
            }

            // Span para geração de contexto
            const contextSpan = this.createChildSpan(traceId, 'rag_context_generation', {
                'context.enrichment': 'multi_source',
                'context.length': 'optimized'
            });

            if (contextSpan) {
                contextSpan.addEvent('result_aggregation');
                contextSpan.addEvent('context_formatting');
                contextSpan.end();
            }

            return {
                success: true,
                results: [{ content: 'Mock RAG result', score: 0.85 }],
                enriched_context: 'Mock enriched context'
            };

        }, {
            type: 'rag_search',
            queryLength: query.length,
            agent: context.agent
        });
    }

    /**
     * Configurar spans automáticos para operações críticas
     */
    setupCriticalOperationSpans() {
        // Este método seria chamado durante a inicialização
        // para configurar instrumentação automática

        log.debug('Critical operation spans configured');
    }

    /**
     * Obter trace por correlation ID
     */
    getTraceByCorrelationId(correlationId) {
        const traceId = this.correlationIds.get(correlationId);
        return traceId ? this.activeTraces.get(traceId) : null;
    }

    /**
     * Obter estatísticas de tracing
     */
    getTraceStats() {
        return {
            ...this.traceMetrics,
            active_traces: this.activeTraces.size,
            correlation_ids: this.correlationIds.size,
            trace_operations: this.traceOperations,
            trace_level: this.traceLevel
        };
    }

    /**
     * Limpar traces antigos (fallback se OpenTelemetry falhar)
     */
    cleanupOldTraces(maxAge = 3600000) { // 1 hora
        const cutoffTime = Date.now() - maxAge;
        const toRemove = [];

        for (const [traceId, traceInfo] of this.activeTraces.entries()) {
            if (traceInfo.startTime < cutoffTime) {
                toRemove.push(traceId);
            }
        }

        toRemove.forEach(traceId => {
            const traceInfo = this.activeTraces.get(traceId);
            this.correlationIds.delete(traceInfo.correlationId);
            this.activeTraces.delete(traceId);
        });

        if (toRemove.length > 0) {
            log.info('Cleaned up old traces', { count: toRemove.length });
        }
    }

    /**
     * Atualizar métricas de trace
     */
    updateTraceMetrics(duration, error, spanCount) {
        // Atualizar duração média
        const totalDuration = this.traceMetrics.avg_trace_duration * (this.traceMetrics.total_traces - 1) + duration;
        this.traceMetrics.avg_trace_duration = totalDuration / this.traceMetrics.total_traces;

        // Atualizar spans por trace
        const totalSpans = this.traceMetrics.spans_per_trace * (this.traceMetrics.total_traces - 1) + spanCount;
        this.traceMetrics.spans_per_trace = totalSpans / this.traceMetrics.total_traces;

        // Contar erros
        if (error) {
            this.traceMetrics.error_traces++;
        }

        // Registrar métrica no OpenTelemetry
        this.openTelemetry.recordMetric('trace_completed', 1, {
            duration_ms: duration,
            spans_count: spanCount,
            has_error: !!error,
            trace_level: this.traceLevel
        });
    }

    /**
     * Gerar ID único para trace
     */
    generateTraceId() {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gerar correlation ID
     */
    generateCorrelationId() {
        return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Delay utilitário
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Encerrar tracing
     */
    async shutdown() {
        log.info('Shutting down distributed tracer');

        // Finalizar traces ativos
        for (const [traceId, traceInfo] of this.activeTraces.entries()) {
            this.endTrace(traceId, null, new Error('System shutdown'));
        }

        await this.openTelemetry.shutdown();
    }
}

// Singleton
let distributedTracerInstance = null;

export function getDistributedTracer(options = {}) {
    if (!distributedTracerInstance) {
        distributedTracerInstance = new DistributedTracer(options);
    }
    return distributedTracerInstance;
}

export default DistributedTracer;