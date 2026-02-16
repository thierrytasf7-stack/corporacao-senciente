#!/usr/bin/env node
/**
 * Event-Driven System - Arquitetura Orientada a Eventos
 *
 * Sistema completo de eventos para comunicação assíncrona entre componentes,
 * com publishers, subscribers, event sourcing e workflows baseados em eventos
 */

import { getDistributedTracer } from '../observability/distributed_tracer.js';
import { getCorrelationManager } from '../utils/correlation_manager.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'event_driven_system' });

/**
 * Evento do Sistema
 */
class SystemEvent {
    constructor(eventType, payload, metadata = {}) {
        this.id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.eventType = eventType;
        this.payload = payload;
        this.metadata = {
            timestamp: new Date().toISOString(),
            source: metadata.source || 'system',
            correlationId: metadata.correlationId,
            userId: metadata.userId,
            sessionId: metadata.sessionId,
            ...metadata
        };
        this.version = metadata.version || 1;
        this.schema = metadata.schema || 'event-v1';
    }

    /**
     * Serializar evento para transmissão
     */
    serialize() {
        return JSON.stringify({
            id: this.id,
            eventType: this.eventType,
            payload: this.payload,
            metadata: this.metadata,
            version: this.version,
            schema: this.schema
        });
    }

    /**
     * Desserializar evento
     */
    static deserialize(data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const event = new SystemEvent(parsed.eventType, parsed.payload, parsed.metadata);
        event.id = parsed.id;
        event.version = parsed.version;
        event.schema = parsed.schema;
        return event;
    }

    /**
     * Validar evento
     */
    validate() {
        if (!this.eventType || typeof this.eventType !== 'string') {
            throw new Error('Event type must be a non-empty string');
        }
        if (!this.payload || typeof this.payload !== 'object') {
            throw new Error('Event payload must be an object');
        }
        return true;
    }
}

/**
 * Publisher de Eventos
 */
class EventPublisher {
    constructor(eventBus, source) {
        this.eventBus = eventBus;
        this.source = source;
        this.publishedEvents = 0;
    }

    /**
     * Publicar evento
     */
    async publish(eventType, payload, metadata = {}) {
        const event = new SystemEvent(eventType, payload, {
            ...metadata,
            source: this.source
        });

        event.validate();

        await this.eventBus.publish(event);
        this.publishedEvents++;

        log.debug('Event published', {
            eventId: event.id,
            eventType,
            source: this.source
        });

        return event;
    }

    /**
     * Publicar evento crítico (com tracing)
     */
    async publishCritical(eventType, payload, metadata = {}) {
        const tracer = getDistributedTracer();
        const correlationManager = getCorrelationManager();

        // Iniciar trace para evento crítico
        const { traceId } = tracer.startTrace('publish_critical_event', {
            type: 'event_publication',
            eventType,
            source: this.source
        });

        try {
            // Adicionar correlation ID se não existir
            if (!metadata.correlationId) {
                const correlationId = correlationManager.startCorrelation(eventType, {
                    source: this.source,
                    eventType
                });
                metadata.correlationId = correlationId;
            }

            const event = await this.publish(eventType, payload, metadata);

            // Adicionar span de publicação
            const span = tracer.createChildSpan(traceId, 'event_published', {
                'event.id': event.id,
                'event.type': eventType,
                'event.source': this.source
            });

            if (span) {
                span.addEvent('event_published_successfully', {
                    eventId: event.id,
                    timestamp: event.metadata.timestamp
                });
                span.end();
            }

            tracer.endTrace(traceId);
            return event;

        } catch (error) {
            tracer.endTrace(traceId, null, error);
            throw error;
        }
    }

    /**
     * Publicar lote de eventos
     */
    async publishBatch(events) {
        const publishedEvents = [];

        for (const eventData of events) {
            const { eventType, payload, metadata } = eventData;
            const event = await this.publish(eventType, payload, metadata);
            publishedEvents.push(event);
        }

        log.info('Batch events published', {
            count: publishedEvents.length,
            source: this.source
        });

        return publishedEvents;
    }

    /**
     * Obter estatísticas do publisher
     */
    getStats() {
        return {
            source: this.source,
            publishedEvents: this.publishedEvents,
            lastActivity: new Date().toISOString()
        };
    }
}

/**
 * Subscriber de Eventos
 */
class EventSubscriber {
    constructor(eventBus, name, eventTypes = []) {
        this.eventBus = eventBus;
        this.name = name;
        this.eventTypes = new Set(eventTypes);
        this.handlers = new Map();
        this.processedEvents = 0;
        this.errors = 0;
        this.isActive = false;
    }

    /**
     * Inscrever-se em tipos de eventos
     */
    subscribe(eventTypes, handler) {
        const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

        types.forEach(type => {
            this.eventTypes.add(type);
            if (!this.handlers.has(type)) {
                this.handlers.set(type, []);
            }
            this.handlers.get(type).push(handler);
        });

        log.debug('Subscribed to event types', {
            subscriber: this.name,
            eventTypes: types
        });
    }

    /**
     * Processar evento
     */
    async processEvent(event) {
        if (!this.eventTypes.has(event.eventType)) {
            return; // Não inscrito neste tipo
        }

        const handlers = this.handlers.get(event.eventType) || [];

        for (const handler of handlers) {
            try {
                await handler(event);
                this.processedEvents++;
            } catch (error) {
                this.errors++;
                log.error('Event handler error', {
                    subscriber: this.name,
                    eventId: event.id,
                    eventType: event.eventType,
                    error: error.message
                });

                // Continuar processando outros handlers mesmo com erro
            }
        }
    }

    /**
     * Iniciar subscriber
     */
    async start() {
        this.isActive = true;
        await this.eventBus.subscribe(this);

        log.info('Event subscriber started', {
            name: this.name,
            eventTypes: Array.from(this.eventTypes)
        });
    }

    /**
     * Parar subscriber
     */
    async stop() {
        this.isActive = false;
        await this.eventBus.unsubscribe(this);

        log.info('Event subscriber stopped', {
            name: this.name
        });
    }

    /**
     * Verificar se subscriber está interessado em um tipo de evento
     */
    isInterested(eventType) {
        return this.eventTypes.has(eventType) || this.eventTypes.has('*');
    }

    /**
     * Obter estatísticas do subscriber
     */
    getStats() {
        return {
            name: this.name,
            isActive: this.isActive,
            eventTypes: Array.from(this.eventTypes),
            processedEvents: this.processedEvents,
            errors: this.errors,
            handlersCount: Array.from(this.handlers.values()).reduce((sum, handlers) => sum + handlers.length, 0)
        };
    }
}

/**
 * Event Bus - Barramento de Eventos
 */
class EventBus {
    constructor(options = {}) {
        this.persistenceEnabled = options.persistenceEnabled !== false;
        this.maxEventsInMemory = options.maxEventsInMemory || 10000;
        this.eventRetentionMs = options.eventRetentionMs || 24 * 60 * 60 * 1000; // 24 horas

        // Estrutura do event bus
        this.events = []; // Array circular para eventos em memória
        this.subscribers = new Set();
        this.publishers = new Map();

        // Estatísticas
        this.stats = {
            totalEvents: 0,
            processedEvents: 0,
            activeSubscribers: 0,
            activePublishers: 0,
            eventsByType: new Map(),
            errors: 0
        };

        // Cleanup automático
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60 * 60 * 1000); // A cada hora
    }

    /**
     * Inicializar event bus
     */
    async initialize() {
        log.info('Initializing Event Bus...');

        if (this.persistenceEnabled) {
            await this.loadPersistedEvents();
        }

        log.info('Event Bus initialized');
    }

    /**
     * Criar publisher
     */
    createPublisher(source) {
        const publisher = new EventPublisher(this, source);
        this.publishers.set(source, publisher);
        this.stats.activePublishers++;

        log.debug('Publisher created', { source });

        return publisher;
    }

    /**
     * Criar subscriber
     */
    createSubscriber(name, eventTypes = []) {
        const subscriber = new EventSubscriber(this, name, eventTypes);
        this.subscribers.add(subscriber);
        this.stats.activeSubscribers++;

        log.debug('Subscriber created', { name, eventTypes });

        return subscriber;
    }

    /**
     * Publicar evento
     */
    async publish(event) {
        // Adicionar à fila de eventos
        this.events.push({
            event,
            publishedAt: Date.now(),
            processed: false
        });

        // Limitar tamanho da fila
        if (this.events.length > this.maxEventsInMemory) {
            this.events.shift();
        }

        this.stats.totalEvents++;
        this.stats.eventsByType.set(
            event.eventType,
            (this.stats.eventsByType.get(event.eventType) || 0) + 1
        );

        // Persistir se habilitado
        if (this.persistenceEnabled) {
            await this.persistEvent(event);
        }

        // Distribuir para subscribers interessados
        await this.distributeEvent(event);

        log.debug('Event published to bus', {
            eventId: event.id,
            eventType: event.eventType,
            subscribersNotified: Array.from(this.subscribers).filter(s => s.isInterested(event.eventType)).length
        });
    }

    /**
     * Distribuir evento para subscribers
     */
    async distributeEvent(event) {
        const interestedSubscribers = Array.from(this.subscribers)
            .filter(subscriber => subscriber.isInterested(event.eventType));

        const promises = interestedSubscribers.map(subscriber =>
            subscriber.processEvent(event)
        );

        try {
            await Promise.allSettled(promises);
            this.stats.processedEvents++;
        } catch (error) {
            this.stats.errors++;
            log.error('Error distributing event', {
                eventId: event.id,
                error: error.message
            });
        }
    }

    /**
     * Inscrever subscriber
     */
    async subscribe(subscriber) {
        // Subscriber já foi adicionado no createSubscriber
        // Aqui poderíamos fazer configuração adicional se necessário
    }

    /**
     * Remover inscrição do subscriber
     */
    async unsubscribe(subscriber) {
        this.subscribers.delete(subscriber);
        this.stats.activeSubscribers--;

        log.debug('Subscriber unsubscribed', { name: subscriber.name });
    }

    /**
     * Buscar eventos por critérios
     */
    queryEvents(criteria = {}) {
        let filteredEvents = this.events.map(item => item.event);

        // Filtrar por tipo
        if (criteria.eventType) {
            filteredEvents = filteredEvents.filter(event => event.eventType === criteria.eventType);
        }

        // Filtrar por source
        if (criteria.source) {
            filteredEvents = filteredEvents.filter(event => event.metadata.source === criteria.source);
        }

        // Filtrar por correlation ID
        if (criteria.correlationId) {
            filteredEvents = filteredEvents.filter(event => event.metadata.correlationId === criteria.correlationId);
        }

        // Filtrar por período
        if (criteria.since) {
            const sinceTime = new Date(criteria.since).getTime();
            filteredEvents = filteredEvents.filter(event =>
                new Date(event.metadata.timestamp).getTime() >= sinceTime
            );
        }

        // Ordenar por timestamp (mais recente primeiro)
        filteredEvents.sort((a, b) =>
            new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp)
        );

        // Limitar resultados
        const limit = criteria.limit || 100;
        return filteredEvents.slice(0, limit);
    }

    /**
     * Obter eventos de uma stream específica (simulando Redis Streams)
     */
    getStreamEvents(streamName, start = '-', end = '+', count = 10) {
        // Em implementação real, isso seria uma query ao Redis Streams
        // Por enquanto, simulamos com busca por tipo

        return this.queryEvents({
            eventType: streamName,
            limit: count
        });
    }

    /**
     * Criar workflow baseado em eventos
     */
    createWorkflow(name, triggers, actions) {
        const workflow = {
            name,
            triggers: new Set(triggers),
            actions,
            executions: 0,
            lastExecuted: null
        };

        // Criar subscriber para o workflow
        const subscriber = this.createSubscriber(`workflow_${name}`, triggers);

        subscriber.subscribe(triggers, async (event) => {
            try {
                await this.executeWorkflow(workflow, event);
            } catch (error) {
                log.error('Workflow execution error', {
                    workflow: name,
                    eventId: event.id,
                    error: error.message
                });
            }
        });

        subscriber.start();

        log.info('Workflow created', { name, triggers: Array.from(triggers) });

        return workflow;
    }

    /**
     * Executar workflow
     */
    async executeWorkflow(workflow, triggerEvent) {
        log.info('Executing workflow', {
            workflow: workflow.name,
            triggerEvent: triggerEvent.eventType
        });

        workflow.executions++;
        workflow.lastExecuted = new Date().toISOString();

        // Executar ações do workflow
        for (const action of workflow.actions) {
            try {
                await action(triggerEvent, this);
            } catch (error) {
                log.error('Workflow action error', {
                    workflow: workflow.name,
                    action: action.name || 'anonymous',
                    error: error.message
                });
            }
        }
    }

    /**
     * Limpar eventos antigos
     */
    cleanupOldEvents() {
        const cutoffTime = Date.now() - this.eventRetentionMs;
        const initialCount = this.events.length;

        this.events = this.events.filter(item => item.publishedAt >= cutoffTime);

        const removed = initialCount - this.events.length;
        if (removed > 0) {
            log.info('Cleaned up old events', { removed });
        }
    }

    /**
     * Obter estatísticas do event bus
     */
    getStats() {
        return {
            ...this.stats,
            eventsInMemory: this.events.length,
            activeSubscribers: this.subscribers.size,
            activePublishers: this.publishers.size,
            eventTypesCount: this.stats.eventsByType.size,
            oldestEvent: this.events.length > 0 ?
                new Date(this.events[0].publishedAt).toISOString() : null,
            newestEvent: this.events.length > 0 ?
                new Date(this.events[this.events.length - 1].publishedAt).toISOString() : null
        };
    }

    /**
     * Obter estrutura completa do event bus
     */
    getSystemStatus() {
        return {
            publishers: Array.from(this.publishers.values()).map(p => p.getStats()),
            subscribers: Array.from(this.subscribers).map(s => s.getStats()),
            recentEvents: this.events.slice(-10).map(item => ({
                id: item.event.id,
                type: item.event.eventType,
                source: item.event.metadata.source,
                timestamp: item.event.metadata.timestamp
            })),
            stats: this.getStats()
        };
    }

    /**
     * Métodos de persistência (para implementação futura com Redis/NATS)
     */
    async loadPersistedEvents() {
        // Em produção, carregaria eventos do Redis/NATS
    }

    async persistEvent(event) {
        // Em produção, persistiria no Redis/NATS
    }

    /**
     * Encerrar event bus
     */
    async shutdown() {
        log.info('Shutting down Event Bus');

        // Parar todos os subscribers
        for (const subscriber of this.subscribers) {
            if (subscriber.isActive) {
                await subscriber.stop();
            }
        }

        log.info('Event Bus shutdown completed');
    }
}

/**
 * Event Sourcing Store
 */
class EventSourcingStore {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.entities = new Map(); // entityId -> events[]
        this.snapshots = new Map(); // entityId -> snapshot
        this.snapshotInterval = 100; // Fazer snapshot a cada 100 eventos
    }

    /**
     * Armazenar evento para entity
     */
    async storeEvent(entityId, entityType, event) {
        if (!this.entities.has(entityId)) {
            this.entities.set(entityId, []);
        }

        const entityEvents = this.entities.get(entityId);
        entityEvents.push({
            ...event,
            sequenceNumber: entityEvents.length + 1,
            entityId,
            entityType
        });

        // Criar snapshot se necessário
        if (entityEvents.length % this.snapshotInterval === 0) {
            await this.createSnapshot(entityId, entityType);
        }

        log.debug('Event stored for entity', {
            entityId,
            entityType,
            eventId: event.id,
            sequenceNumber: entityEvents.length
        });
    }

    /**
     * Reconstruir estado da entity a partir dos eventos
     */
    async rebuildEntityState(entityId) {
        const events = this.entities.get(entityId) || [];

        if (events.length === 0) {
            return null;
        }

        // Carregar snapshot se existir
        let state = this.snapshots.get(entityId)?.state || this.getInitialState(events[0].entityType);

        // Aplicar eventos subsequentes
        const startSequence = this.snapshots.get(entityId)?.sequenceNumber || 0;

        for (const event of events) {
            if (event.sequenceNumber > startSequence) {
                state = this.applyEvent(state, event);
            }
        }

        return state;
    }

    /**
     * Criar snapshot da entity
     */
    async createSnapshot(entityId, entityType) {
        const currentState = await this.rebuildEntityState(entityId);

        if (currentState) {
            this.snapshots.set(entityId, {
                entityId,
                entityType,
                state: currentState,
                sequenceNumber: this.entities.get(entityId).length,
                timestamp: new Date().toISOString()
            });

            log.debug('Snapshot created', { entityId, entityType });
        }
    }

    /**
     * Obter eventos da entity
     */
    getEntityEvents(entityId, fromSequence = 0) {
        const events = this.entities.get(entityId) || [];
        return events.filter(event => event.sequenceNumber > fromSequence);
    }

    /**
     * Aplicar evento ao estado (método a ser sobrescrito)
     */
    applyEvent(state, event) {
        // Implementação específica por tipo de entity
        // Este é um exemplo genérico
        switch (event.eventType) {
            case 'entity_created':
                return { ...state, ...event.payload, created: true };
            case 'entity_updated':
                return { ...state, ...event.payload };
            case 'entity_deleted':
                return { ...state, deleted: true };
            default:
                return state;
        }
    }

    /**
     * Obter estado inicial (método a ser sobrescrito)
     */
    getInitialState(entityType) {
        return { entityType, created: false, version: 1 };
    }
}

/**
 * Sistema Completo de Eventos
 */
export class EventDrivenSystem {
    constructor(options = {}) {
        this.eventBus = new EventBus(options);
        this.eventSourcing = new EventSourcingStore(this.eventBus);
        this.workflows = new Map();

        // Publishers padrão
        this.brainPublisher = null;
        this.agentPublisher = null;
        this.executorPublisher = null;

        // Subscribers padrão
        this.metricsSubscriber = null;
        this.loggingSubscriber = null;
        this.notificationSubscriber = null;

        // Configurações
        this.autoStart = options.autoStart !== false;
    }

    /**
     * Inicializar sistema completo
     */
    async initialize() {
        log.info('Initializing Event-Driven System...');

        await this.eventBus.initialize();

        // Criar publishers padrão
        this.brainPublisher = this.eventBus.createPublisher('brain');
        this.agentPublisher = this.eventBus.createPublisher('agent');
        this.executorPublisher = this.eventBus.createPublisher('executor');

        // Criar subscribers padrão
        await this.setupDefaultSubscribers();

        // Configurar workflows padrão
        await this.setupDefaultWorkflows();

        if (this.autoStart) {
            await this.start();
        }

        log.info('Event-Driven System initialized successfully');
    }

    /**
     * Configurar subscribers padrão
     */
    async setupDefaultSubscribers() {
        // Subscriber para métricas
        this.metricsSubscriber = this.eventBus.createSubscriber('metrics_collector', [
            'task_completed',
            'agent_called',
            'model_used',
            'error_occurred',
            'cost_incurred'
        ]);

        this.metricsSubscriber.subscribe(['task_completed', 'agent_called', 'model_used'], async (event) => {
            // Integração com sistema de métricas
            log.info('Metrics event processed', {
                eventType: event.eventType,
                source: event.metadata.source
            });
        });

        // Subscriber para logging
        this.loggingSubscriber = this.eventBus.createSubscriber('event_logger', ['*']);

        this.loggingSubscriber.subscribe(['*'], async (event) => {
            // Log estruturado de todos os eventos
            log.info('📢 EVENT', {
                id: event.id,
                type: event.eventType,
                source: event.metadata.source,
                correlationId: event.metadata.correlationId,
                timestamp: event.metadata.timestamp,
                payload: JSON.stringify(event.payload).substring(0, 200)
            });
        });

        // Subscriber para notificações
        this.notificationSubscriber = this.eventBus.createSubscriber('notification_handler', [
            'critical_error',
            'budget_alert',
            'system_degraded',
            'task_failed'
        ]);

        this.notificationSubscriber.subscribe(['critical_error', 'budget_alert'], async (event) => {
            // Sistema de notificações (email, Slack, etc.)
            log.warn('🚨 NOTIFICATION', {
                type: event.eventType,
                message: event.payload.message || 'Critical event detected',
                severity: event.payload.severity || 'high'
            });
        });

        await this.metricsSubscriber.start();
        await this.loggingSubscriber.start();
        await this.notificationSubscriber.start();
    }

    /**
     * Configurar workflows padrão
     */
    async setupDefaultWorkflows() {
        // Workflow: Quando task falha, notificar e tentar retry
        this.eventBus.createWorkflow(
            'task_failure_recovery',
            ['task_failed'],
            [
                async (event, eventBus) => {
                    log.info('Task failure detected, initiating recovery', {
                        taskId: event.payload.taskId,
                        error: event.payload.error
                    });

                    // Publicar evento de recuperação
                    await eventBus.createPublisher('workflow_system').publishCritical(
                        'recovery_initiated',
                        {
                            originalEvent: event.id,
                            taskId: event.payload.taskId,
                            strategy: 'retry'
                        },
                        { correlationId: event.metadata.correlationId }
                    );
                }
            ]
        );

        // Workflow: Quando orçamento atingido, pausar operações
        this.eventBus.createWorkflow(
            'budget_protection',
            ['budget_alert'],
            [
                async (event, eventBus) => {
                    if (event.payload.severity === 'critical') {
                        log.warn('Budget critical, pausing operations', {
                            budgetType: event.payload.type,
                            usage: event.payload.usage
                        });

                        // Publicar evento de pausa
                        await eventBus.createPublisher('workflow_system').publishCritical(
                            'operations_paused',
                            {
                                reason: 'budget_exceeded',
                                budgetType: event.payload.type,
                                resumeAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
                            }
                        );
                    }
                }
            ]
        );

        // Workflow: Quando agente chamado, atualizar grafo de conhecimento
        this.eventBus.createWorkflow(
            'knowledge_graph_update',
            ['agent_called'],
            [
                async (event, eventBus) => {
                    // Integração com Graph Knowledge Base
                    log.debug('Knowledge graph update triggered', {
                        agent: event.payload.agentName,
                        task: event.payload.task
                    });
                }
            ]
        );
    }

    /**
     * Iniciar sistema
     */
    async start() {
        log.info('Starting Event-Driven System...');

        // Publicar evento de inicialização
        await this.brainPublisher.publishCritical('system_started', {
            components: ['event_bus', 'publishers', 'subscribers', 'workflows'],
            timestamp: new Date().toISOString()
        });

        log.info('Event-Driven System started');
    }

    /**
     * Parar sistema
     */
    async stop() {
        log.info('Stopping Event-Driven System...');

        await this.eventBus.shutdown();

        log.info('Event-Driven System stopped');
    }

    /**
     * Publicar evento através do publisher apropriado
     */
    async publishEvent(publisher, eventType, payload, metadata = {}) {
        const publisherInstance = this[`${publisher}Publisher`];
        if (!publisherInstance) {
            throw new Error(`Unknown publisher: ${publisher}`);
        }

        return await publisherInstance.publishCritical(eventType, payload, metadata);
    }

    /**
     * Criar workflow customizado
     */
    createWorkflow(name, triggers, actions) {
        return this.eventBus.createWorkflow(name, triggers, actions);
    }

    /**
     * Criar subscriber customizado
     */
    createSubscriber(name, eventTypes, handler) {
        const subscriber = this.eventBus.createSubscriber(name, eventTypes);

        if (handler) {
            subscriber.subscribe(eventTypes, handler);
        }

        return subscriber;
    }

    /**
     * Query eventos
     */
    queryEvents(criteria) {
        return this.eventBus.queryEvents(criteria);
    }

    /**
     * Obter status do sistema
     */
    getSystemStatus() {
        return {
            eventBus: this.eventBus.getStats(),
            workflows: Array.from(this.workflows.entries()).map(([name, workflow]) => ({
                name,
                executions: workflow.executions,
                lastExecuted: workflow.lastExecuted
            })),
            publishers: {
                brain: this.brainPublisher?.getStats(),
                agent: this.agentPublisher?.getStats(),
                executor: this.executorPublisher?.getStats()
            },
            subscribers: {
                metrics: this.metricsSubscriber?.getStats(),
                logging: this.loggingSubscriber?.getStats(),
                notifications: this.notificationSubscriber?.getStats()
            }
        };
    }

    /**
     * Obter estatísticas detalhadas
     */
    getDetailedStats() {
        return {
            ...this.getSystemStatus(),
            eventBusDetails: this.eventBus.getSystemStatus(),
            eventSourcing: {
                entities: this.eventSourcing.entities.size,
                snapshots: this.eventSourcing.snapshots.size
            }
        };
    }

    /**
     * Encerrar sistema
     */
    async shutdown() {
        log.info('Shutting down Event-Driven System');

        await this.stop();
        await this.eventBus.shutdown();

        log.info('Event-Driven System shutdown completed');
    }
}

// Singleton
let eventDrivenSystemInstance = null;

export function getEventDrivenSystem(options = {}) {
    if (!eventDrivenSystemInstance) {
        eventDrivenSystemInstance = new EventDrivenSystem(options);
    }
    return eventDrivenSystemInstance;
}

export { EventBus, EventPublisher, EventSourcingStore, EventSubscriber, SystemEvent };
export default EventDrivenSystem;