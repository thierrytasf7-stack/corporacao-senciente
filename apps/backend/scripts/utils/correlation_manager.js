#!/usr/bin/env node
/**
 * Correlation Manager - Gerenciamento de Correlation IDs
 *
 * Sistema para rastrear requests completos através de correlation IDs
 * que seguem requests através de todos os componentes do sistema
 */

import crypto from 'crypto';
import { logger } from './logger.js';

const log = logger.child({ module: 'correlation_manager' });

/**
 * Gerenciador de Correlation IDs
 */
export class CorrelationManager {
    constructor() {
        this.activeCorrelations = new Map();
        this.correlationMetadata = new Map();

        // Cleanup automático a cada 30 minutos
        setInterval(() => {
            this.cleanupOldCorrelations();
        }, 30 * 60 * 1000);
    }

    /**
     * Gera um novo correlation ID único
     */
    generateCorrelationId(prefix = 'req') {
        const timestamp = Date.now();
        const random = crypto.randomBytes(4).toString('hex');
        const correlationId = `${prefix}_${timestamp}_${random}`;

        log.debug('Generated correlation ID', { correlationId, prefix });

        return correlationId;
    }

    /**
     * Inicia uma nova correlação para um request
     */
    startCorrelation(operation, metadata = {}) {
        const correlationId = this.generateCorrelationId();

        const correlationData = {
            correlationId,
            operation,
            startTime: Date.now(),
            metadata: {
                ...metadata,
                userId: metadata.userId || 'anonymous',
                sessionId: metadata.sessionId || 'unknown',
                requestType: metadata.requestType || operation
            },
            events: [],
            childCorrelations: [],
            status: 'active'
        };

        this.activeCorrelations.set(correlationId, correlationData);
        this.correlationMetadata.set(correlationId, correlationData.metadata);

        // Adicionar evento inicial
        this.addEvent(correlationId, 'correlation_started', {
            operation,
            metadata: correlationData.metadata
        });

        log.info('Correlation started', {
            correlationId,
            operation,
            userId: metadata.userId
        });

        return correlationId;
    }

    /**
     * Adiciona um evento à correlação
     */
    addEvent(correlationId, eventType, eventData = {}) {
        const correlation = this.activeCorrelations.get(correlationId);
        if (!correlation) {
            log.warn('Correlation not found for event', { correlationId, eventType });
            return;
        }

        const event = {
            eventType,
            timestamp: Date.now(),
            data: eventData,
            sequence: correlation.events.length + 1
        };

        correlation.events.push(event);

        // Log estruturado para tracing
        log.debug('Correlation event added', {
            correlationId,
            eventType,
            sequence: event.sequence,
            duration: Date.now() - correlation.startTime
        });
    }

    /**
     * Adiciona uma correlação filha (para operações aninhadas)
     */
    addChildCorrelation(parentId, childId, relationship = 'child') {
        const parent = this.activeCorrelations.get(parentId);
        if (parent) {
            parent.childCorrelations.push({
                childId,
                relationship,
                addedAt: Date.now()
            });

            this.addEvent(parentId, 'child_correlation_added', {
                childId,
                relationship
            });
        }
    }

    /**
     * Finaliza uma correlação
     */
    endCorrelation(correlationId, result = null, error = null) {
        const correlation = this.activeCorrelations.get(correlationId);
        if (!correlation) {
            log.warn('Correlation not found for ending', { correlationId });
            return;
        }

        const duration = Date.now() - correlation.startTime;

        // Atualizar status
        correlation.status = error ? 'error' : 'completed';
        correlation.endTime = Date.now();
        correlation.duration = duration;
        correlation.result = result;
        correlation.error = error;

        // Adicionar evento final
        this.addEvent(correlationId, 'correlation_completed', {
            duration,
            success: !error,
            result: result ? JSON.stringify(result).length : 0,
            error: error ? error.message : null
        });

        // Log final
        log.info('Correlation completed', {
            correlationId,
            operation: correlation.operation,
            duration,
            success: !error,
            events: correlation.events.length,
            children: correlation.childCorrelations.length
        });

        // Manter por mais 1 hora para consultas
        setTimeout(() => {
            this.activeCorrelations.delete(correlationId);
            this.correlationMetadata.delete(correlationId);
        }, 60 * 60 * 1000); // 1 hora
    }

    /**
     * Obtém dados de uma correlação
     */
    getCorrelation(correlationId) {
        const correlation = this.activeCorrelations.get(correlationId);
        if (correlation) {
            return { ...correlation };
        }

        // Tentar buscar no histórico (se implementado)
        return null;
    }

    /**
     * Obtém correlações ativas
     */
    getActiveCorrelations() {
        return Array.from(this.activeCorrelations.values()).map(corr => ({
            correlationId: corr.correlationId,
            operation: corr.operation,
            startTime: corr.startTime,
            duration: Date.now() - corr.startTime,
            events: corr.events.length,
            children: corr.childCorrelations.length,
            metadata: corr.metadata
        }));
    }

    /**
     * Obtém correlações por usuário
     */
    getCorrelationsByUser(userId) {
        return Array.from(this.activeCorrelations.values())
            .filter(corr => corr.metadata.userId === userId)
            .map(corr => ({
                correlationId: corr.correlationId,
                operation: corr.operation,
                startTime: corr.startTime,
                status: corr.status
            }));
    }

    /**
     * Obtém estatísticas de correlação
     */
    getCorrelationStats() {
        const correlations = Array.from(this.activeCorrelations.values());
        const now = Date.now();

        // Estatísticas por operação
        const operationStats = {};
        correlations.forEach(corr => {
            const op = corr.operation;
            if (!operationStats[op]) {
                operationStats[op] = {
                    count: 0,
                    avgDuration: 0,
                    totalDuration: 0
                };
            }
            operationStats[op].count++;
            const duration = now - corr.startTime;
            operationStats[op].totalDuration += duration;
        });

        // Calcular médias
        Object.keys(operationStats).forEach(op => {
            operationStats[op].avgDuration = operationStats[op].totalDuration / operationStats[op].count;
        });

        return {
            active_correlations: correlations.length,
            operations: operationStats,
            avg_events_per_correlation: correlations.length > 0 ?
                correlations.reduce((sum, corr) => sum + corr.events.length, 0) / correlations.length : 0,
            avg_children_per_correlation: correlations.length > 0 ?
                correlations.reduce((sum, corr) => sum + corr.childCorrelations.length, 0) / correlations.length : 0
        };
    }

    /**
     * Busca correlações por critérios
     */
    searchCorrelations(criteria = {}) {
        let correlations = Array.from(this.activeCorrelations.values());

        if (criteria.operation) {
            correlations = correlations.filter(c => c.operation === criteria.operation);
        }

        if (criteria.userId) {
            correlations = correlations.filter(c => c.metadata.userId === criteria.userId);
        }

        if (criteria.status) {
            correlations = correlations.filter(c => c.status === criteria.status);
        }

        if (criteria.minDuration) {
            const now = Date.now();
            correlations = correlations.filter(c =>
                (now - c.startTime) >= criteria.minDuration
            );
        }

        return correlations.map(corr => ({
            correlationId: corr.correlationId,
            operation: corr.operation,
            startTime: corr.startTime,
            status: corr.status,
            duration: corr.endTime ? corr.endTime - corr.startTime : Date.now() - corr.startTime,
            events: corr.events.length,
            metadata: corr.metadata
        }));
    }

    /**
     * Limpa correlações antigas
     */
    cleanupOldCorrelations(maxAgeHours = 2) {
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
        const toRemove = [];

        for (const [correlationId, correlation] of this.activeCorrelations.entries()) {
            if (correlation.startTime < cutoffTime) {
                toRemove.push(correlationId);
            }
        }

        toRemove.forEach(correlationId => {
            const correlation = this.activeCorrelations.get(correlationId);
            if (correlation) {
                log.debug('Cleaning up old correlation', {
                    correlationId,
                    operation: correlation.operation,
                    age: (Date.now() - correlation.startTime) / (60 * 60 * 1000)
                });
            }

            this.activeCorrelations.delete(correlationId);
            this.correlationMetadata.delete(correlationId);
        });

        if (toRemove.length > 0) {
            log.info('Cleaned up old correlations', { count: toRemove.length });
        }
    }

    /**
     * Exporta dados de correlação para análise
     */
    exportCorrelationData(correlationId) {
        const correlation = this.activeCorrelations.get(correlationId);
        if (!correlation) {
            return null;
        }

        return {
            correlationId: correlation.correlationId,
            operation: correlation.operation,
            timeline: {
                started: new Date(correlation.startTime).toISOString(),
                ended: correlation.endTime ? new Date(correlation.endTime).toISOString() : null,
                duration: correlation.duration || (Date.now() - correlation.startTime)
            },
            metadata: correlation.metadata,
            events: correlation.events.map(event => ({
                sequence: event.sequence,
                type: event.eventType,
                timestamp: new Date(event.timestamp).toISOString(),
                data: event.data
            })),
            childCorrelations: correlation.childCorrelations,
            result: correlation.result,
            error: correlation.error,
            status: correlation.status
        };
    }

    /**
     * Cria um contexto de correlação para propagação
     */
    createCorrelationContext(correlationId) {
        const metadata = this.correlationMetadata.get(correlationId);
        if (!metadata) {
            return null;
        }

        return {
            correlationId,
            ...metadata,
            traceparent: this.generateTraceparent(correlationId),
            tracestate: this.generateTracestate(correlationId)
        };
    }

    /**
     * Gera header traceparent (W3C Trace Context)
     */
    generateTraceparent(correlationId) {
        // Formato: 00-{trace-id}-{span-id}-{flags}
        const traceId = correlationId.split('_')[1] || '0000000000000000';
        const spanId = crypto.randomBytes(8).toString('hex');
        return `00-${traceId.padEnd(32, '0').substring(0, 32)}-${spanId}-01`;
    }

    /**
     * Gera header tracestate (W3C Trace Context)
     */
    generateTracestate(correlationId) {
        return `corporacao=${correlationId}`;
    }
}

// Singleton
let correlationManagerInstance = null;

export function getCorrelationManager() {
    if (!correlationManagerInstance) {
        correlationManagerInstance = new CorrelationManager();
    }
    return correlationManagerInstance;
}

export default CorrelationManager;