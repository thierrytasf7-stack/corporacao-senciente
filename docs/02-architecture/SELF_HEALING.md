# Self-Healing and Auto-Recovery - Sistema de Auto-Recuperação

## Visão Geral

O sistema de Self-Healing and Auto-Recovery implementa recuperação automática inteligente que detecta problemas no sistema em tempo real e aplica estratégias de correção apropriadas. Este sistema garante alta disponibilidade e resiliência, minimizando intervenção manual e tempo de inatividade.

## Arquitetura

### Componentes Principais

1. **Self-Healing System** (`scripts/swarm/self_healing.js`)
   - Núcleo do sistema de auto-recuperação
   - Detectores de problemas configuráveis
   - Estratégias de recuperação múltiplas
   - Monitoramento contínuo de saúde

2. **Problem Detectors**
   - Detecção de falhas consecutivas
   - Monitoramento de degradação de performance
   - Detecção de vazamentos de recursos
   - Verificação de saúde de integrações

3. **Recovery Strategies**
   - Retry com backoff exponencial
   - Circuit breaker pattern
   - Fallback mode activation
   - Graceful restart
   - Resource scaling
   - Component isolation

4. **Health Monitoring**
   - Health checks contínuos
   - Métricas de saúde do sistema
   - Histórico de problemas e recuperações

## Detecção de Problemas

### Tipos de Problemas Detectados

#### 1. Falhas Consecutivas
```javascript
// Detecta quando múltiplas operações falham em sequência
{
    type: 'consecutive_failures',
    threshold: 5, // 5 falhas consecutivas
    detection: 'automatic',
    severity: 'critical'
}
```

#### 2. Degradação de Performance
```javascript
// Detecta quando latência ou throughput degradam
{
    type: 'performance_degradation',
    metrics: ['latency', 'throughput', 'error_rate'],
    baseline_period: '10_operations',
    threshold: '2x_baseline',
    severity: 'warning'
}
```

#### 3. Vazamentos de Recursos
```javascript
// Detecta vazamentos de memória, conexões, etc.
{
    type: 'resource_leak',
    resources: ['memory', 'cpu', 'connections', 'file_handles'],
    threshold: 0.9, // 90% de uso
    severity: 'critical'
}
```

#### 4. Falhas de Integração
```javascript
// Detecta quando integrações externas falham
{
    type: 'integration_failure',
    integrations: ['llb_protocol', 'metrics_collector', 'llm_client'],
    check_interval: 60000, // 1 minuto
    severity: 'critical'
}
```

### Thresholds Configuráveis

```javascript
const problemThresholds = {
    errorRate: 0.1,        // 10% taxa de erro
    latency: 10000,        // 10 segundos
    memoryUsage: 0.9,      // 90% memória
    cpuUsage: 0.95,        // 95% CPU
    consecutiveFailures: 5, // 5 falhas consecutivas
    recoveryTimeout: 300000 // 5 minutos para recuperação
};
```

## Estratégias de Recuperação

### 1. Retry Strategy
```javascript
// Tenta novamente com backoff exponencial
{
    strategy: 'retry',
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000, // 1 segundo
    maxDelay: 300000     // 5 minutos
}
```

**Aplicado para:**
- Falhas temporárias de rede
- Timeouts intermitentes
- Problemas de concorrência

### 2. Circuit Breaker Strategy
```javascript
// Isola componentes falhos temporariamente
{
    strategy: 'circuit_breaker',
    states: ['closed', 'open', 'half-open'],
    failureThreshold: 5,
    timeout: 60000, // 1 minuto
    successThreshold: 3
}
```

**Aplicado para:**
- Falhas consecutivas em integrações
- Cascading failures
- Serviços sobrecarregados

### 3. Fallback Strategy
```javascript
// Ativa modos de operação reduzidos
{
    strategy: 'fallback',
    modes: {
        llm_client: 'local_ollama',
        metrics: 'in_memory',
        cache: 'disabled'
    }
}
```

**Aplicado para:**
- Indisponibilidade de serviços externos
- Limitações de recursos
- Modo de manutenção

### 4. Restart Strategy
```javascript
// Reinicia componentes graciosamente
{
    strategy: 'restart',
    components: ['workers', 'connections', 'caches'],
    gracefulShutdown: true,
    restartDelay: 5000
}
```

**Aplicado para:**
- Vazamentos de memória
- Estados corrompidos
- Deadlocks

### 5. Scale Strategy
```javascript
// Aumenta recursos dinamicamente
{
    strategy: 'scale',
    resources: ['cpu', 'memory', 'workers'],
    scaleFactor: 1.5,
    maxScale: 3
}
```

**Aplicado para:**
- Sobrecarga de CPU/memória
- Aumento de demanda
- Bottlenecks de performance

### 6. Isolate Strategy
```javascript
// Isola componentes problemáticos
{
    strategy: 'isolate',
    isolationTypes: ['thread', 'process', 'network'],
    quarantineDuration: 300000 // 5 minutos
}
```

**Aplicado para:**
- Componentes comprometidos
- Ataques de segurança
- Dados corrompidos

## Monitoramento de Saúde

### Health Checks Contínuos

```javascript
// Health check completo do sistema
const healthCheck = {
    timestamp: Date.now(),
    overall: 'healthy', // 'healthy' | 'degraded' | 'critical'
    checks: {
        llbProtocol: true,
        metricsCollector: true,
        distributedTracer: true,
        memory: true,
        cpu: true,
        integrations: true
    },
    metrics: {
        uptime: 3600000,     // 1 hora
        activeRecoveries: 0,
        circuitBreakers: 2
    }
};
```

### Dashboard de Saúde

```
System Health: HEALTHY
├── CPU Usage: 45% (Threshold: 95%)
├── Memory Usage: 67% (Threshold: 90%)
├── Active Connections: 23
├── Error Rate (1h): 0.02% (Threshold: 10%)
├── Circuit Breakers: 5 closed, 0 open
└── Active Recoveries: 0
```

## Casos de Uso

### 1. Recuperação de Falha de LLM

```javascript
// Sistema detecta falha no Grok API
PROBLEM: integration_failure
├── Detection: API returns 500 errors
├── Strategy: circuit_breaker
├── Action: Open circuit for 1 minute
├── Fallback: Switch to Ollama
└── Result: Service continues operating
```

### 2. Recuperação de Vazamento de Memória

```javascript
// Sistema detecta uso crescente de memória
PROBLEM: memory_leak
├── Detection: 95% memory usage
├── Strategy: restart
├── Action: Graceful restart of workers
├── Cleanup: Force garbage collection
└── Result: Memory usage drops to 45%
```

### 3. Recuperação de Degradação de Performance

```javascript
// Sistema detecta latência crescente
PROBLEM: performance_degradation
├── Detection: 3x baseline latency
├── Strategy: scale
├── Action: Increase worker count by 50%
├── Monitoring: Track improvement
└── Result: Latency returns to normal
```

### 4. Recuperação de Falhas em Cascata

```javascript
// Sistema detecta falhas propagando
PROBLEM: cascade_failure
├── Detection: 5 sequential operation failures
├── Strategy: isolate
├── Action: Quarantine failing component
├── Investigation: Analyze root cause
└── Result: Failure contained, system stable
```

## Configuração

### Configuração Básica

```javascript
const selfHealing = getSelfHealingSystem({
    healingEnabled: true,
    autoRecoveryEnabled: true,
    circuitBreakerEnabled: true,

    // Thresholds
    errorRateThreshold: 0.1,
    latencyThreshold: 10000,
    memoryThreshold: 0.9,

    // Timing
    monitoringInterval: 30000,
    recoveryTimeout: 300000
});
```

### Configuração Avançada

```javascript
const advancedConfig = {
    // Estratégias customizadas
    customStrategies: {
        database_failure: 'switch_to_replica',
        network_partition: 'activate_read_only_mode'
    },

    // Detecções customizadas
    customDetectors: [
        {
            name: 'database_connection_pool',
            check: () => checkConnectionPoolHealth(),
            interval: 10000
        }
    ],

    // Alertas customizados
    alertChannels: {
        slack: '#system-alerts',
        pagerDuty: 'database-service',
        email: 'devops@company.com'
    }
};
```

## Integração com Observabilidade

### Alertas Automáticos

```javascript
// Integração com Trace Alerts
await traceAlerts.processAlert({
    type: 'self_healing_problem_detected',
    severity: problemSeverity,
    title: 'Self-Healing: Problem Detected',
    description: problemDescription,
    metric: problemType,
    value: problemValue,
    traceId: 'system_health_check',
    recommendation: recoveryRecommendation
});
```

### Métricas de Recuperação

```javascript
// Métricas coletadas automaticamente
const recoveryMetrics = {
    recoveries_attempted: 15,
    recoveries_successful: 12,
    avg_recovery_time: 45000,     // 45 segundos
    circuit_breakers_tripped: 3,
    system_downtime_prevented: 1800000 // 30 minutos
};
```

### Tracing de Recuperações

```javascript
// Tracing completo de operações de recuperação
await distributedTracer.traceCriticalOperation(
    'self_healing_recovery',
    async () => {
        // Implementar estratégia de recuperação
        const result = await executeRecoveryStrategy(strategy);

        // Adicionar spans detalhados
        await addRecoverySpans(result);

        return result;
    },
    {
        type: 'recovery_operation',
        strategy: strategyName,
        problemType: problemType
    }
);
```

## Performance e Escalabilidade

### Impacto de Performance

- **CPU Overhead**: <1% adicional para health checks
- **Memory Overhead**: ~2MB para estado do sistema
- **Network Overhead**: Mínimo (health checks locais)
- **Recovery Time**: 5-120 segundos dependendo da estratégia

### Escalabilidade

```javascript
// Configuração para sistemas distribuídos
const distributedConfig = {
    // Coordenação entre nós
    coordination: {
        consensus: 'raft',
        heartbeat: 5000,
        leaderElection: true
    },

    // Estratégias distribuídas
    distributedStrategies: {
        node_failure: 'failover_to_replica',
        network_partition: 'split_brain_detection',
        load_imbalance: 'automatic_rebalancing'
    },

    // Métricas globais
    globalMetrics: {
        cross_node_visibility: true,
        aggregate_health: true,
        distributed_alerts: true
    }
};
```

## Troubleshooting

### Problemas Comuns

1. **Recuperações não são executadas**
   - Verificar se `autoRecoveryEnabled` está true
   - Confirmar que problema foi detectado
   - Verificar logs de estratégia de recuperação

2. **Circuit breakers ficam abertos**
   - Verificar thresholds de failure
   - Confirmar se serviço voltou ao normal
   - Verificar timeout de circuit breaker

3. **Falsos positivos em detecção**
   - Ajustar thresholds de detecção
   - Implementar período de estabilização
   - Adicionar hysteresis nas verificações

4. **Recuperações falham**
   - Verificar permissões do sistema
   - Confirmar recursos disponíveis
   - Verificar dependências da estratégia

### Debug Mode

```javascript
// Habilitar debug detalhado
const selfHealing = getSelfHealingSystem({
    debug: true,
    logLevel: 'debug',
    detailedMetrics: true
});

// Monitorar em tempo real
setInterval(() => {
    const status = selfHealing.getStatus();
    console.log('Health:', status.systemHealth);
    console.log('Active recoveries:', status.activeRecoveries.length);
    console.log('Circuit breakers:', Object.keys(status.circuitBreakers).length);
}, 10000);
```

## Próximos Passos

### Melhorias Planejadas

1. **Machine Learning Integration**
   - Predição de falhas baseada em histórico
   - Otimização automática de thresholds
   - Classificação inteligente de problemas

2. **Distributed Self-Healing**
   - Coordenação entre múltiplos nós
   - Failover automático
   - Load balancing inteligente

3. **Advanced Recovery Strategies**
   - Blue-green deployments
   - Canary releases
   - Feature flags automáticos

4. **Integration Ecosystem**
   - Kubernetes operators
   - Service mesh integration
   - Cloud provider APIs

Este sistema fornece resiliência automática completa, garantindo que o sistema se recupere de falhas sem intervenção manual, mantendo alta disponibilidade e performance consistente.