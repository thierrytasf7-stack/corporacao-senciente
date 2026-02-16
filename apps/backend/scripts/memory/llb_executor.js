#!/usr/bin/env node
/**
 * LLB Executor - Executor que segue Protocolo L.L.B.
 * 
 * Implementa diretrizes de execução L.L.B.:
 * - Eficiência > Burocracia
 * - Latência Zero
 * - Auto-Correção
 */

import { countRequests, getObservabilityMetrics, measureLatency } from '../observability/metrics.js';
import { getTracingSystem } from '../observability/tracing.js';
import { getActionValidator } from '../swarm/action_validator.js';
import { getConfidenceScorer } from '../swarm/confidence_scorer.js';
import { getFeedbackLoop } from '../swarm/feedback_loop.js';
import { getMetricsCollector } from '../swarm/metrics_collector.js';
import { getRAGPipeline } from '../swarm/rag_pipeline.js';
import { logger } from '../utils/logger.js';
import { getByteRover } from './byterover.js';
import { getLangMem } from './langmem.js';
import { getLetta } from './letta.js';
import { getLLBProtocol } from './llb_protocol.js';

const log = logger.child({ module: 'llb_executor' });

/**
 * LLB Executor - Executor que segue Protocolo L.L.B.
 */
class LLBExecutor {
    constructor() {
        this.protocol = getLLBProtocol();
        this.langmem = getLangMem();
        this.letta = getLetta();
        this.byterover = getByteRover();
        this.feedbackLoop = getFeedbackLoop();
        this.metricsCollector = getMetricsCollector();
        this.actionValidator = getActionValidator();
        this.confidenceScorer = getConfidenceScorer();
        this.ragPipeline = getRAGPipeline();
        this.tracingSystem = getTracingSystem();
        this.observabilityMetrics = getObservabilityMetrics();

        // Iniciar coleta de métricas do sistema
        this.observabilityMetrics.startSystemMetricsCollection();

        this.cache = new Map(); // Cache para latência zero
    }

    /**
     * Executa ação seguindo Protocolo L.L.B.
     * 
     * @param {object} action - Ação a executar
     * @param {object} context - Contexto adicional
     * @returns {Promise<object>} Resultado da execução
     */
    @measureLatency('llb_execution')
    @countRequests('llb_execute')
    async execute(action, context = {}) {
        // Criar span de tracing para a execução completa
        const executionSpan = this.tracingSystem.startSpan('llb_execution', {
            action_type: action.type,
            action_description: action.description?.substring(0, 100),
            agent: context.agent,
            correlation_id: context.correlationId || `exec_${Date.now()}`
        });

        this.tracingSystem.addEvent(executionSpan.id, 'execution_started', {
            action: action.type,
            context_keys: Object.keys(context).length
        });

        log.info('Executing with LLB protocol', { actionType: action.type });

        try {
            // 0. Validação Pré-execução (Segurança e Guardrails)
            const validation = await this.actionValidator.validateAction(action, context);
            if (!validation.valid) {
                log.warn('Action validation failed', {
                    errors: validation.errors,
                    warnings: validation.warnings
                });

                return {
                    success: false,
                    validationFailed: true,
                    validationErrors: validation.errors,
                    validationWarnings: validation.warnings,
                    riskLevel: validation.riskLevel,
                    recommendations: validation.recommendations,
                    message: 'Ação rejeitada pela validação de segurança.'
                };
            }

            // Log de validação bem-sucedida
            if (validation.warnings.length > 0) {
                log.warn('Action validation warnings', {
                    warnings: validation.warnings,
                    riskLevel: validation.riskLevel
                });
            }

            // 0.1. Avaliação de Confiança
            const confidenceAction = { ...action, validationResult: validation };
            const confidence = await this.confidenceScorer.calculateConfidence(confidenceAction, context);

            log.info('Confidence evaluation completed', {
                score: confidence.score.toFixed(3),
                decision: confidence.decision.decision,
                confidence: confidence.confidence
            });

            // Decisão baseada em confiança
            if (confidence.decision.decision === 'require_confirmation') {
                return {
                    success: false,
                    requiresConfirmation: true,
                    confidence: confidence,
                    message: `Confiança baixa (${(confidence.score * 100).toFixed(1)}%) - confirmação manual necessária.`,
                    reasoning: confidence.reasoning,
                    recommendations: confidence.recommendations
                };
            }

            // 1. Eficiência > Burocracia: Verificar consistência antes de executar
            const consistencyCheck = await this.checkConsistency(action, context);
            if (!consistencyCheck.valid) {
                log.warn('Consistency check failed', {
                    conflicts: consistencyCheck.conflicts
                });

                // Auto-Correção: Sugerir refatoração
                const refactoring = await this.suggestRefactoring(
                    consistencyCheck.conflicts[0],
                    consistencyCheck.langmem_rule
                );

                return {
                    success: false,
                    requiresRefactoring: true,
                    conflicts: consistencyCheck.conflicts,
                    refactoring: refactoring,
                    message: 'Código conflita com regras do LangMem. Refatoração sugerida.'
                };
            }

            // 2. Latência Zero: Buscar contexto via cache primeiro
            const contextData = await this.getContextWithCache(action, context);

            // 3. Executar ação (delegar para executor híbrido se necessário)
            // Por enquanto, apenas validar e retornar
            const result = {
                success: true,
                action: action,
                context: contextData,
                timestamp: new Date().toISOString()
            };

            // 4. Eficiência > Burocracia: Atualizar memória automaticamente
            await this.updateMemoryAutomatically(action, result, context);

            // 5. Coletar feedback para aprendizado contínuo
            await this.collectExecutionFeedback(action, result, context, 'success');

            // Finalizar span com sucesso
            this.tracingSystem.addEvent(executionSpan.id, 'execution_completed', {
                result_status: 'success',
                result_keys: Object.keys(result).length
            });
            this.tracingSystem.endSpan(executionSpan.id, 'ok');

            return result;
        } catch (err) {
            log.error('Error executing with LLB protocol', { error: err.message });

            const errorResult = {
                success: false,
                error: err.message,
                errorType: err.constructor.name
            };

            // Coletar feedback de erro para aprendizado
            await this.collectExecutionFeedback(action, errorResult, context, 'error');

            // Finalizar span com erro
            this.tracingSystem.addEvent(executionSpan.id, 'execution_failed', {
                error: errorResult.error,
                error_type: errorResult.errorType
            });
            this.tracingSystem.endSpan(executionSpan.id, 'error', errorResult.error);

            return errorResult;
        }
    }

    /**
     * Verifica consistência com regras do LangMem
     * 
     * @param {object} code - Código ou ação a verificar
     * @param {object} langmem_rules - Regras do LangMem
     * @returns {Promise<object>} Resultado da verificação
     */
    async checkConsistency(code, langmem_rules = {}) {
        log.debug('Checking consistency with LangMem');

        try {
            // Buscar regras relevantes no LangMem
            const query = typeof code === 'string' ? code : code.type || JSON.stringify(code);
            const wisdom = await this.langmem.getWisdom(query, 'architecture');

            const conflicts = [];
            const warnings = [];

            // Verificar conflitos básicos (implementação simplificada)
            for (const w of wisdom) {
                // Verificar se há regras que conflitam
                // Por enquanto, verificação básica
                if (w.content.toLowerCase().includes('deprecated') ||
                    w.content.toLowerCase().includes('obsolete')) {
                    warnings.push({
                        rule: w.content.substring(0, 100),
                        message: 'Padrão pode estar obsoleto'
                    });
                }
            }

            return {
                valid: conflicts.length === 0,
                conflicts: conflicts,
                warnings: warnings,
                langmem_rule: wisdom.length > 0 ? wisdom[0] : null
            };
        } catch (err) {
            log.error('Error checking consistency', { error: err.message });
            return {
                valid: true, // Em caso de erro, permitir execução
                conflicts: [],
                warnings: [],
                langmem_rule: null
            };
        }
    }

    /**
     * Sugere refatoração quando há conflito
     * 
     * @param {object} conflict - Conflito detectado
     * @param {object} langmem_rule - Regra do LangMem
     * @returns {Promise<object>} Sugestão de refatoração
     */
    async suggestRefactoring(conflict, langmem_rule) {
        log.info('Suggesting refactoring', { conflict: conflict.type || 'unknown' });

        return {
            suggestion: `Refatorar código para seguir padrão: ${langmem_rule?.content?.substring(0, 100) || 'N/A'}`,
            rationale: conflict.message || 'Conflito detectado com regras arquiteturais',
            steps: [
                'Revisar regra no LangMem',
                'Ajustar código para seguir padrão',
                'Validar novamente',
                'Atualizar LangMem se necessário'
            ]
        };
    }

    /**
     * Busca contexto com cache (Latência Zero)
     * 
     * @param {object} action - Ação
     * @param {object} context - Contexto
     * @returns {Promise<object>} Contexto completo
     */
    async getContextWithCache(action, context = {}) {
        const cacheKey = `context_${action.type}_${JSON.stringify(context)}`;

        // Verificar cache
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 60000) { // 1 minuto
            log.debug('Using cached context');
            return cached.data;
        }

        // Buscar contexto completo via Protocolo L.L.B.
        const query = action.type || JSON.stringify(action);
        const fullContext = await this.protocol.getFullContext(query);

        // Cachear resultado
        this.cache.set(cacheKey, {
            data: fullContext,
            timestamp: Date.now()
        });

        // Limpar cache antigo
        if (this.cache.size > 50) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            this.cache = new Map(entries.slice(0, 50));
        }

        return fullContext;
    }

    /**
     * Atualiza memória automaticamente (Eficiência > Burocracia)
     * 
     * @param {object} action - Ação executada
     * @param {object} result - Resultado
     * @param {object} context - Contexto
     * @returns {Promise<boolean>} Sucesso
     */
    async updateMemoryAutomatically(action, result, context = {}) {
        log.debug('Updating memory automatically');

        try {
            // Atualizar todas as camadas
            await this.protocol.updateAllLayers(
                action.type || JSON.stringify(action),
                result,
                {
                    files: action.files || [],
                    type: action.type
                }
            );

            // Se padrão foi descoberto, armazenar automaticamente
            if (result.pattern || context.pattern) {
                await this.langmem.storePattern(
                    result.pattern || context.pattern,
                    {
                        action: action,
                        result: result
                    }
                );
            }

            return true;
        } catch (err) {
            log.error('Error updating memory automatically', { error: err.message });
            return false;
        }
    }

    /**
     * Coleta feedback de execução para aprendizado contínuo
     *
     * @param {object} action - Ação executada
     * @param {object} result - Resultado da execução
     * @param {object} context - Contexto da execução
     * @param {string} executionType - Tipo de execução ('success' | 'error')
     */
    async collectExecutionFeedback(action, result, context, executionType) {
        try {
            const executionData = {
                agent: context.agent || 'llb_executor',
                task: action.description || action.type || 'Unknown task',
                action: action,
                context: context,
                timestamp: new Date().toISOString()
            };

            const feedbackData = {
                success: result.success,
                result: result.message || result.result || 'Execution completed',
                error: result.error,
                errorType: result.errorType,
                metrics: {
                    duration: result.duration || 0,
                    quality: result.quality || (result.success ? 0.8 : 0.2)
                },
                insights: result.insights || null,
                suggestedFix: result.suggestedFix || null,
                rootCause: result.rootCause || null
            };

            // Coletar feedback via FeedbackLoop
            await this.feedbackLoop.collectFeedback(executionData, feedbackData);

            // Registrar métricas de execução
            await this.metricsCollector.recordPromptExecution({
                agent: executionData.agent,
                task: executionData.task,
                prompt: action.prompt || action.description,
                response: result.message || result.result,
                success: result.success,
                duration: result.duration || 0,
                tokens: result.tokens || 0,
                confidence: result.confidence || (result.success ? 0.8 : 0.2),
                cacheHit: result.cacheHit || false,
                error: result.error
            });

            log.debug('Execution feedback and metrics collected', {
                executionType,
                success: result.success,
                agent: executionData.agent
            });
        } catch (error) {
            log.warn('Failed to collect execution feedback', { error: error.message });
            // Não falhar a execução principal por causa do feedback
        }
    }
}

// Singleton
let executorInstance = null;

export function getLLBExecutor() {
    if (!executorInstance) {
        executorInstance = new LLBExecutor();
    }
    return executorInstance;
}

export default LLBExecutor;



