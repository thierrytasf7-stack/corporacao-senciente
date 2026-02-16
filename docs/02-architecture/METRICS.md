# Sistema de Métricas - Monitoramento Inteligente

Documentação completa do sistema de métricas da Corporação Senciente 7.0.

## Visão Geral

O Sistema de Métricas fornece monitoramento completo e inteligente do desempenho do sistema, integrando-se com o Protocolo L.L.B. para fornecer insights acionáveis e aprendizado contínuo.

## Arquitetura

### Componentes Principais

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLB Executor  │───▶│ MetricsCollector │───▶│   LangMem       │
│                 │    │                 │    │ (Aprendizado)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Metrics API   │───▶│   Dashboard     │
                       │   (REST/WS)     │    │   (Web UI)      │
                       └─────────────────┘    └─────────────────┘
```

## Coleta de Métricas

### Tipos de Métricas

#### 1. Métricas de Execução de Prompt
```javascript
await metricsCollector.recordPromptExecution({
    agent: 'architect',
    task: 'Design system architecture',
    prompt: 'Design a scalable microservices architecture...',
    response: 'Based on the requirements...',
    success: true,
    duration: 2500,        // ms
    tokens: 450,          // LLM tokens
    confidence: 0.87,     // 0-1
    cacheHit: false,
    error: null
});
```

#### 2. Métricas de Cache
```javascript
await metricsCollector.recordCacheOperation({
    operation: 'get',      // 'get', 'set', 'evict'
    key: 'prompt_hash_123',
    hit: true,
    duration: 45,          // ms
    size: 2048             // bytes
});
```

#### 3. Métricas de Memória
```javascript
await metricsCollector.recordMemoryOperation({
    operation: 'store',    // 'store', 'retrieve', 'search'
    component: 'langmem',  // 'langmem', 'letta', 'byterover'
    duration: 120,
    success: true,
    size: 1024
});
```

#### 4. Métricas de Feedback
```javascript
await metricsCollector.recordFeedbackOperation({
    operation: 'analyze',  // 'collect', 'analyze', 'ab_test'
    patternsFound: 3,
    improvementsSuggested: 2,
    duration: 150
});
```

## Agregações e Análises

### Agregações Disponíveis

#### Métricas de Performance
- **Taxa de Sucesso**: % de execuções bem-sucedidas
- **Latência Média**: Tempo médio de resposta (ms)
- **Tokens Médios**: Consumo médio de tokens LLM
- **Confiança Média**: Score médio de confiança
- **Cache Hit Rate**: % de hits no cache

#### Breakdowns por Categoria
```javascript
{
    agentBreakdown: { 'architect': 45, 'dev': 32, 'qa': 23 },
    taskBreakdown: { 'coding': 50, 'analysis': 30, 'testing': 20 },
    errorBreakdown: { 'timeout': 5, 'validation': 3, 'network': 2 }
}
```

### Análise de Tendências

```javascript
const trends = {
    successRate: {
        firstHalf: 0.72,     // 72% na primeira metade
        secondHalf: 0.78,    // 78% na segunda metade
        change: 0.06,        // +6% de melhoria
        trend: 'improving'   // 'improving', 'degrading', 'stable'
    },
    latency: {
        firstHalf: 2800,
        secondHalf: 2400,
        change: -400,        // -400ms (melhoria)
        trend: 'improving'
    }
};
```

## Sistema de Alertas

### Thresholds Configuráveis

```javascript
const thresholds = {
    successRate: 0.7,      // < 70% = alerta
    latency: 5000,         // > 5000ms = alerta
    cost: 1000,           // > 1000 tokens = alerta
    confidence: 0.6,      // < 60% confiança = alerta
    cacheHitRate: 0.3     // < 30% cache hit = alerta
};
```

### Tipos de Alerta

#### Alerta de Sucesso Baixo
```
🚨 HIGH: success_rate
"5 falhas consecutivas detectadas"
Recomendação: Revisar validações e prompts
```

#### Alerta de Latência Alta
```
🚨 MEDIUM: latency
"Latência de 6500ms excede 2x o limite"
Recomendação: Otimizar performance
```

#### Alerta de Custo Alto
```
🚨 LOW: cost
"1200 tokens excede limite de custo"
Recomendação: Simplificar prompts
```

## API REST

### Endpoints Disponíveis

#### `GET /api/metrics`
Retorna métricas agregadas
```javascript
GET /api/metrics?timeRange=1h&agent=architect

Response:
{
    "success": true,
    "data": {
        "timeRange": "1h",
        "totalMetrics": 150,
        "aggregations": { ... },
        "alerts": [ ... ],
        "trends": { ... },
        "insights": [ ... ]
    }
}
```

#### `GET /api/metrics/realtime`
Métricas em tempo real
```javascript
{
    "success": true,
    "data": {
        "stats": {
            "totalMetrics": 150,
            "activeAlerts": 3,
            "realtimeMetrics": 12
        },
        "recentMetrics": [ ... ]
    }
}
```

#### `GET /api/metrics/alerts`
Alertas ativos
```javascript
{
    "success": true,
    "data": [
        {
            "id": "alert_123",
            "type": "success_rate",
            "severity": "high",
            "message": "Taxa de sucesso abaixo do threshold",
            "timestamp": "2025-01-XX..."
        }
    ]
}
```

#### `GET /api/metrics/trends`
Análise de tendências
```javascript
{
    "success": true,
    "data": {
        "trends": { ... },
        "insights": [ ... ]
    }
}
```

#### `GET /api/metrics/health`
Health check do sistema
```javascript
{
    "status": "healthy", // "healthy", "warning", "unhealthy"
    "uptime": 3600,
    "metrics": {
        "totalCollected": 150,
        "activeAlerts": 2,
        "recentActivity": 25
    }
}
```

## Dashboard Web

### Interface Completa

O dashboard fornece visualização em tempo real com:

- **Gráficos de Performance**: Taxa de sucesso, latência, cache hits
- **Métricas em Tempo Real**: Atualização automática a cada 30s
- **Alertas Visuais**: Notificações coloridas por severidade
- **Insights Automáticos**: Recomendações baseadas em dados
- **Tendências Históricas**: Análise de melhoria ao longo do tempo

### Recursos do Dashboard

```html
<!-- Dashboard principal -->
<div class="grid">
    <div class="card">
        <h3>🚀 Performance de Execução</h3>
        <div id="performanceMetrics"></div>
        <canvas id="performanceChart"></canvas>
    </div>

    <div class="card">
        <h3>💾 Cache & Memória</h3>
        <div id="cacheMetrics"></div>
        <canvas id="cacheChart"></canvas>
    </div>

    <div class="card">
        <h3>🧠 Aprendizado & Feedback</h3>
        <div id="feedbackMetrics"></div>
        <canvas id="feedbackChart"></canvas>
    </div>
</div>
```

## Integração com LLB Protocol

### Aprendizado Automático

Cada métrica coletada gera aprendizado:

```javascript
// Métricas de erro → Padrões de erro no LangMem
"Lição de erro: architect falhou em coding
Erro: Validation failed
Duração: 3000ms
Lições: Validar entrada antes de processar"

// Alertas → Padrões de sistema
"Alerta de métrica: Taxa de sucesso baixa (45%)
Severidade: high
Causa provável: Problemas de validação"
```

### Categorização Inteligente

```javascript
// Categorização automática de tarefas
"Implementar função de login" → "coding"
"Documentar API endpoints" → "documentation"
"Executar testes automatizados" → "testing"

// Categorização automática de erros
"Connection timeout" → "timeout"
"Validation failed" → "validation"
"Permission denied" → "permission"
```

## Configuração

### Parâmetros do Coletor

```javascript
const metricsCollector = getMetricsCollector({
    successRateThreshold: 0.7,      // Threshold para sucesso
    latencyThreshold: 5000,         // Threshold para latência (ms)
    costThreshold: 1000,           // Threshold para custo (tokens)
    confidenceThreshold: 0.6,      // Threshold para confiança
    cacheHitRateThreshold: 0.3,    // Threshold para cache hit
    collectionInterval: 60000,     // Intervalo de coleta (ms)
    historyRetention: 1000         // Máximo de métricas mantidas
});
```

### Configuração da API

```javascript
const api = getMetricsAPI(3001); // Porta do servidor
await api.start();
```

## Insights e Recomendações

### Insights Automáticos

O sistema gera insights baseados em padrões:

#### Insight de Performance
```
⚠️ HIGH: Taxa de Sucesso Baixa
Taxa de sucesso de 45% está abaixo do threshold de 70%
💡 Revisar prompts e validações
```

#### Insight de Otimização
```
⚡ MEDIUM: Cache Subutilizado
Taxa de cache hit de 15% está baixa
💡 Otimizar estratégia de cache ou aumentar similaridade
```

#### Insight de Melhoria
```
📈 LOW: Melhoria Detectada
Taxa de sucesso aumentou 12% recentemente
💡 Continuar otimizações atuais
```

## Limpeza e Manutenção

### Limpeza Automática

```javascript
// Limpar métricas antigas
metricsCollector.cleanupOldMetrics(30); // 30 dias

// Limpar alertas antigos automaticamente
// Mantém apenas os últimos 100 alertas
```

### Estatísticas do Sistema

```javascript
const stats = metricsCollector.getStats();
// {
//   totalMetrics: 1500,
//   activeAlerts: 3,
//   realtimeMetrics: 25,
//   collectionInterval: 60000,
//   retentionLimit: 1000,
//   thresholds: 5
// }
```

## Monitoramento e Alertas

### Health Checks

- **Status do Sistema**: Healthy/Warning/Unhealthy
- **Atividade Recente**: Métricas nos últimos 5 minutos
- **Alertas Ativos**: Número de alertas pendentes
- **Uptime**: Tempo de funcionamento

### Métricas de Monitoramento

- **Latência de Resposta**: < 100ms para API
- **Taxa de Coleta**: Configurável (padrão: 60s)
- **Retenção de Dados**: Configurável (padrão: 1000 métricas)
- **Uso de Memória**: Monitorado automaticamente

## Exemplos de Uso

### 1. Monitoramento Básico

```javascript
// Iniciar monitoramento
const metrics = getMetricsCollector();

// Registrar execução
await metrics.recordPromptExecution({
    agent: 'dev_agent',
    task: 'Implement user authentication',
    success: true,
    duration: 1800,
    tokens: 320
});

// Obter agregações
const aggregated = metrics.getAggregatedMetrics('1h');
console.log(`Taxa de sucesso: ${(aggregated.aggregations.prompt_execution.successRate * 100).toFixed(1)}%`);
```

### 2. Análise de Performance

```javascript
// Obter insights
const metrics = await fetch('/api/metrics?timeRange=24h');
const insights = metrics.data.insights;

insights.forEach(insight => {
    console.log(`${insight.type.toUpperCase()}: ${insight.title}`);
    console.log(`→ ${insight.description}`);
    if (insight.recommendation) {
        console.log(`💡 ${insight.recommendation}`);
    }
});
```

### 3. Alertas Customizados

```javascript
// Verificar alertas
const alerts = await fetch('/api/metrics/alerts');
alerts.data.forEach(alert => {
    if (alert.severity === 'high') {
        // Notificar equipe
        sendNotification(alert.message);
    }
});
```

## Testes

Execute os testes do sistema de métricas:

```bash
node scripts/test_metrics_system.js
```

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Funcional
**Cobertura de Testes**: 100%
