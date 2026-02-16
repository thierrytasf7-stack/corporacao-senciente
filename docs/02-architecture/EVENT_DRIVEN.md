# Event-Driven Architecture - Arquitetura Orientada a Eventos

## Visão Geral

O sistema Event-Driven Architecture implementa comunicação assíncrona completa entre componentes através de eventos. Esta arquitetura permite que o sistema reaja a mudanças em tempo real, execute workflows automáticos e mantenha um histórico completo de todas as operações através de event sourcing.

## Arquitetura

### Componentes Principais

1. **Event Bus** (`scripts/events/event_driven_system.js`)
   - Barramento central para distribuição de eventos
   - Suporte a publishers e subscribers
   - Fila em memória com persistência opcional
   - Capacidade de expansão para Redis Streams/NATS

2. **SystemEvent** - Estrutura padronizada de eventos
   - ID único e tipo de evento
   - Payload estruturado e metadados
   - Correlation IDs para rastreamento
   - Versionamento e schema validation

3. **EventPublisher** - Publicadores de eventos
   - Publicação síncrona e assíncrona
   - Tracing integrado para eventos críticos
   - Batch publishing para alta performance
   - Source identification automática

4. **EventSubscriber** - Consumidores de eventos
   - Subscription por tipo de evento
   - Processamento paralelo e error handling
   - Health monitoring e statistics
   - Auto-scaling capabilities

5. **Event Sourcing Store** - Armazenamento de eventos
   - Histórico completo de entidades
   - Snapshots para performance
   - State reconstruction
   - Audit trail completo

## Estrutura dos Eventos

### Evento Padrão

```javascript
{
    id: "evt_1703123456789_a1b2c3d4",  // ID único
    eventType: "task_completed",       // Tipo do evento
    payload: {                         // Dados específicos do evento
        taskId: "design_system_001",
        result: "success",
        duration: 45000,
        output: "System design completed successfully"
    },
    metadata: {                        // Metadados do evento
        timestamp: "2024-01-15T10:30:00.000Z",
        source: "executor",             // Origem do evento
        correlationId: "req_1703123456789_abc123", // Correlation ID
        userId: "user123",             // Usuário associado
        sessionId: "session456",       // Sessão
        version: 1,                    // Versão do evento
        schema: "event-v1"             // Schema do evento
    }
}
```

### Tipos de Eventos Principais

#### Eventos do Brain
- `brain_decision_made` - Decisão tomada pelo brain
- `brain_strategy_selected` - Estratégia selecionada
- `brain_context_analyzed` - Contexto analisado

#### Eventos dos Agentes
- `agent_called` - Agente foi chamado
- `agent_task_started` - Agente iniciou tarefa
- `agent_task_progress` - Progresso da tarefa
- `agent_response_generated` - Resposta gerada pelo agente

#### Eventos do Executor
- `task_completed` - Tarefa concluída com sucesso
- `task_failed` - Tarefa falhou
- `execution_started` - Execução iniciada
- `action_performed` - Ação executada

#### Eventos de Sistema
- `system_started` - Sistema inicializado
- `system_health_check` - Health check executado
- `error_occurred` - Erro detectado
- `recovery_initiated` - Recuperação iniciada

#### Eventos de Observabilidade
- `cost_incurred` - Custo computacional incorrido
- `model_used` - Modelo de IA utilizado
- `latency_measured` - Latência medida
- `budget_alert` - Alerta de orçamento

## Publishers e Subscribers

### Publishers Padrão

```javascript
// Publisher do Brain
const brainPublisher = eventBus.createPublisher('brain');

// Publicar decisão crítica com tracing
await brainPublisher.publishCritical('brain_decision_made', {
    decision: 'execute_task',
    confidence: 0.95,
    reasoning: 'High confidence analysis completed'
}, {
    userId: 'user123',
    correlationId: 'req_1703123456789_abc123'
});

// Publisher de agentes
const agentPublisher = eventBus.createPublisher('agent');

// Publicar progresso da tarefa
await agentPublisher.publish('agent_task_progress', {
    agentName: 'architect',
    taskId: 'design_001',
    progress: 75,
    currentStep: 'Creating diagrams'
});
```

### Subscribers Padrão

```javascript
// Subscriber para métricas
const metricsSubscriber = eventBus.createSubscriber('metrics_collector', [
    'task_completed',
    'agent_called',
    'model_used',
    'cost_incurred'
]);

metricsSubscriber.subscribe(['task_completed'], async (event) => {
    // Atualizar métricas de performance
    await metricsCollector.recordMetric('tasks_completed', 1, {
        agent: event.payload.agentName,
        duration: event.payload.duration
    });
});

// Subscriber para logging
const loggingSubscriber = eventBus.createSubscriber('event_logger', ['*']);

loggingSubscriber.subscribe(['*'], async (event) => {
    // Log estruturado de todos os eventos
    logger.info('📢 EVENT', {
        id: event.id,
        type: event.eventType,
        source: event.metadata.source,
        correlationId: event.metadata.correlationId,
        payload: JSON.stringify(event.payload).substring(0, 200)
    });
});
```

### Subscribers Customizados

```javascript
// Subscriber para notificações
const notificationSubscriber = eventBus.createSubscriber('notification_handler', [
    'critical_error',
    'budget_alert',
    'task_failed'
]);

notificationSubscriber.subscribe(['budget_alert'], async (event) => {
    if (event.payload.severity === 'critical') {
        // Enviar notificação crítica
        await notificationService.sendAlert({
            title: 'Orçamento Crítico',
            message: event.payload.description,
            priority: 'high',
            channels: ['slack', 'email']
        });
    }
});
```

## Workflows Baseados em Eventos

### Criação de Workflows

```javascript
// Workflow: Quando task falha, iniciar recuperação
eventBus.createWorkflow(
    'task_failure_recovery',
    ['task_failed'],  // Triggers
    [
        // Ações do workflow
        async (triggerEvent, eventBus) => {
            log.info('Task failure detected, initiating recovery', {
                taskId: triggerEvent.payload.taskId,
                error: triggerEvent.payload.error
            });

            // Publicar evento de recuperação
            await eventBus.createPublisher('workflow_system').publishCritical(
                'recovery_initiated',
                {
                    originalEvent: triggerEvent.id,
                    taskId: triggerEvent.payload.taskId,
                    strategy: 'retry'
                },
                { correlationId: triggerEvent.metadata.correlationId }
            );
        },

        // Outra ação: notificar equipe
        async (triggerEvent, eventBus) => {
            await notificationService.notifyTeam({
                message: `Task ${triggerEvent.payload.taskId} failed`,
                details: triggerEvent.payload.error,
                priority: 'high'
            });
        }
    ]
);

// Workflow: Controle de orçamento
eventBus.createWorkflow(
    'budget_protection',
    ['budget_alert'],
    [
        async (triggerEvent, eventBus) => {
            if (triggerEvent.payload.severity === 'critical') {
                // Pausar operações automaticamente
                await eventBus.createPublisher('system_control').publishCritical(
                    'operations_paused',
                    {
                        reason: 'budget_exceeded',
                        resumeAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                    }
                );
            }
        }
    ]
);
```

### Workflows Complexos

```javascript
// Workflow: Ciclo completo de desenvolvimento
eventBus.createWorkflow(
    'development_cycle',
    ['task_created'],  // Trigger inicial
    [
        // 1. Atribuir agente
        async (event, eventBus) => {
            const agent = await agentSelector.selectBestAgent(event.payload.task);
            await eventBus.createPublisher('workflow_system').publish(
                'agent_assigned',
                { taskId: event.payload.taskId, agent: agent.name }
            );
        },

        // 2. Monitorar progresso
        // (Este seria outro workflow separado ou chaining)

        // 3. Validar resultado
        // (Outro workflow triggerado por 'task_completed')
    ]
);
```

## Event Sourcing

### Armazenamento de Eventos por Entity

```javascript
// Store de event sourcing
const eventStore = new EventSourcingStore(eventBus);

// Armazenar evento para uma entity
await eventStore.storeEvent('user_123', 'user', {
    id: 'evt_001',
    eventType: 'user_updated',
    payload: { name: 'João Silva', email: 'joao@example.com' }
});

// Reconstruir estado da entity
const userState = await eventStore.rebuildEntityState('user_123');
// Resultado: estado completo reconstruído a partir do histórico
```

### Snapshots para Performance

```javascript
// Criar snapshot automaticamente a cada 100 eventos
if (entityEvents.length % 100 === 0) {
    await eventStore.createSnapshot(entityId, entityType);
}

// Reconstruir estado usando snapshot
const state = await eventStore.rebuildEntityState(entityId);
// Carrega snapshot + aplica eventos posteriores
```

### Queries Temporais

```javascript
// Obter eventos de uma entity a partir de uma sequência
const recentEvents = eventStore.getEntityEvents('project_456', 50);
// Eventos da sequência 51 em diante

// Reconstruir estado em um ponto específico do tempo
const historicalState = await eventStore.rebuildEntityStateAtSequence('user_123', 75);
```

## Correlation IDs e Tracing

### Rastreamento End-to-End

```javascript
// Correlation ID propagado através de toda a operação
const correlationId = 'req_1703123456789_abc123';

// Evento inicial
await brainPublisher.publish('brain_decision_made', {
    decision: 'execute_task'
}, { correlationId });

// Evento de agente (mesmo correlation ID)
await agentPublisher.publish('agent_called', {
    agentName: 'architect'
}, { correlationId });

// Evento final (mesmo correlation ID)
await executorPublisher.publish('task_completed', {
    result: 'success'
}, { correlationId });
```

### Query por Correlation ID

```javascript
// Buscar todos os eventos de uma operação completa
const operationEvents = eventBus.queryEvents({
    correlationId: 'req_1703123456789_abc123',
    limit: 50
});

// Timeline da operação
operationEvents.forEach(event => {
    console.log(`${event.metadata.timestamp}: ${event.eventType}`);
});
```

## Integração com Outros Sistemas

### Integração com Observabilidade

```javascript
// Eventos automaticamente integrados ao tracing
await distributedTracer.traceCriticalOperation(
    'event_driven_operation',
    async () => {
        const event = await eventBus.publishers.brain.publishCritical('operation_started', payload);
        // Operação...
        return result;
    },
    {
        type: 'event_driven',
        correlationId: event.metadata.correlationId
    }
);
```

### Integração com Graph Knowledge Base

```javascript
// Workflow que atualiza grafo de conhecimento
eventBus.createWorkflow(
    'knowledge_update',
    ['agent_called', 'task_completed'],
    [
        async (event, eventBus) => {
            // Adicionar nós e arestas ao grafo
            await graphKB.addNode(`task_${event.payload.taskId}`, 'task', {
                status: event.payload.status || 'in_progress',
                agent: event.payload.agentName
            });

            await graphKB.addEdge(
                event.payload.agentName,
                `task_${event.payload.taskId}`,
                'working_on'
            );
        }
    ]
);
```

## Escalabilidade e Performance

### Expansão para Redis Streams

```javascript
// Configuração para Redis Streams (produção)
const redisEventBus = {
    host: 'redis-cluster',
    streams: {
        events: 'corporacao_events',
        deadLetter: 'failed_events'
    },
    consumerGroups: {
        metrics: 'metrics_consumers',
        logging: 'logging_consumers',
        notifications: 'notification_consumers'
    }
};

// Publicação em stream
await redisClient.xadd('corporacao_events', '*', {
    event_id: event.id,
    event_type: event.eventType,
    payload: JSON.stringify(event.payload),
    metadata: JSON.stringify(event.metadata)
});
```

### Expansão para NATS

```javascript
// Configuração para NATS (alta performance)
const natsConfig = {
    servers: ['nats://nats1:4222', 'nats://nats2:4222'],
    subjects: {
        events: 'corporacao.events.>',
        workflows: 'corporacao.workflows.>',
        commands: 'corporacao.commands.>'
    },
    queues: {
        metrics: 'metrics_queue',
        logging: 'logging_queue'
    }
};

// Publicação em subject
await natsClient.publish(`corporacao.events.${event.eventType}`, {
    event: event.serialize()
});
```

### Otimizações de Performance

```javascript
// Cache de subscribers interessados
const subscriberCache = new Map();

function getInterestedSubscribers(eventType) {
    if (!subscriberCache.has(eventType)) {
        const interested = Array.from(eventBus.subscribers)
            .filter(sub => sub.isInterested(eventType));
        subscriberCache.set(eventType, interested);
    }
    return subscriberCache.get(eventType);
}

// Batch processing para alta throughput
async function processEventBatch(events) {
    const batches = chunkArray(events, 10); // Processar em lotes de 10

    for (const batch of batches) {
        await Promise.allSettled(
            batch.map(event => distributeEvent(event))
        );
    }
}
```

## Casos de Uso

### 1. Monitoramento em Tempo Real

```javascript
// Dashboard de operações ativas
const activeOperations = eventBus.queryEvents({
    eventType: ['task_started', 'agent_called'],
    since: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Últimos 5 min
});

// Status atual do sistema
const systemStatus = {
    activeTasks: activeOperations.filter(e => e.eventType === 'task_started').length,
    activeAgents: new Set(activeOperations
        .filter(e => e.eventType === 'agent_called')
        .map(e => e.payload.agentName)
    ).size,
    recentErrors: eventBus.queryEvents({
        eventType: 'error_occurred',
        since: new Date(Date.now() - 60 * 1000).toISOString() // Último minuto
    }).length
};
```

### 2. Debugging Distribuído

```javascript
// Rastrear falha através de correlation ID
const failureChain = eventBus.queryEvents({
    correlationId: 'req_1703123456789_abc123',
    since: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Última hora
});

// Timeline da falha
failureChain
    .sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp))
    .forEach(event => {
        console.log(`${event.metadata.timestamp}: ${event.eventType} - ${event.payload.message || 'OK'}`);
    });
```

### 3. Analytics de Performance

```javascript
// Análise de performance por agente
const agentPerformance = {};

eventBus.queryEvents({
    eventType: 'task_completed',
    since: '2024-01-01T00:00:00.000Z'
}).forEach(event => {
    const agent = event.payload.agentName;
    if (!agentPerformance[agent]) {
        agentPerformance[agent] = { tasks: 0, totalTime: 0 };
    }
    agentPerformance[agent].tasks++;
    agentPerformance[agent].totalTime += event.payload.duration;
});

// Calcular médias
Object.keys(agentPerformance).forEach(agent => {
    agentPerformance[agent].avgTime = agentPerformance[agent].totalTime / agentPerformance[agent].tasks;
});
```

## Configuração

### Configuração Básica

```javascript
const eventSystem = getEventDrivenSystem({
    persistenceEnabled: false,    // true para Redis/NATS
    maxEventsInMemory: 10000,
    eventRetentionMs: 86400000,   // 24 horas
    monitoringInterval: 30000,    // 30 segundos
    autoStart: true
});
```

### Configuração Avançada

```javascript
const advancedConfig = {
    // Redis Streams (produção)
    redis: {
        host: 'redis-cluster',
        port: 6379,
        streams: {
            events: 'corporacao_events',
            workflows: 'corporacao_workflows'
        }
    },

    // NATS (alta performance)
    nats: {
        servers: ['nats://nats1:4222'],
        subjects: {
            events: 'corporacao.events.>',
            commands: 'corporacao.commands.>'
        }
    },

    // Event sourcing
    eventSourcing: {
        snapshotInterval: 100,      // Snapshot a cada 100 eventos
        retention: {
            events: 365 * 24 * 60 * 60 * 1000,  // 1 ano
            snapshots: 90 * 24 * 60 * 60 * 1000  // 90 dias
        }
    },

    // Circuit breaker para event bus
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 60000,
        monitoringPeriod: 300000
    },

    // Workflows
    workflowConfig: {
        maxConcurrentWorkflows: 10,
        executionTimeout: 300000,   // 5 minutos
        retryAttempts: 3
    }
};
```

## Troubleshooting

### Problemas Comuns

1. **Eventos não sendo processados**
   - Verificar se subscribers estão ativos
   - Confirmar tipos de eventos inscritos
   - Verificar logs de erro nos handlers

2. **Performance degradada**
   - Verificar número de subscribers por evento
   - Considerar batch processing
   - Implementar circuit breaker

3. **Eventos perdidos**
   - Verificar configuração de persistência
   - Confirmar conectividade com Redis/NATS
   - Verificar limites de memória

4. **Workflows não executando**
   - Verificar triggers configurados
   - Confirmar subscribers ativos
   - Verificar condições dos eventos

### Debug Mode

```javascript
// Habilitar debug detalhado
const eventSystem = getEventDrivenSystem({
    debug: true,
    detailedLogging: true
});

// Monitorar em tempo real
setInterval(() => {
    const status = eventSystem.getSystemStatus();
    console.log('Active events:', status.eventBus.totalEvents);
    console.log('Processed events:', status.eventBus.processedEvents);
    console.log('Active workflows:', status.workflows.length);
}, 10000);
```

## Próximos Passos

### Melhorias Planejadas

1. **Event Streaming Avançado**
   - Integração completa com Apache Kafka
   - Event sourcing com CQRS pattern
   - Real-time event processing

2. **Machine Learning Integration**
   - Detecção automática de padrões de eventos
   - Predição de eventos futuros
   - Classificação automática de anomalias

3. **Distributed Event Processing**
   - Coordenação entre múltiplos nós
   - Load balancing de event processing
   - Fault tolerance avançado

4. **Event Analytics**
   - Dashboards em tempo real
   - Complex event processing (CEP)
   - Predictive analytics

Esta arquitetura fornece base sólida para comunicação assíncrona, permitindo que o sistema seja verdadeiramente orientado a eventos e capaz de reagir dinamicamente a mudanças e eventos do ambiente.