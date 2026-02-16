# Sistema Multi-Model Support

Documentação completa do sistema de roteamento inteligente entre múltiplos provedores de LLM da Corporação Senciente 7.0.

## Visão Geral

O Multi-Model Support implementa um sistema de roteamento inteligente que seleciona automaticamente o modelo de LLM mais adequado baseado em custo, performance, confiabilidade e requisitos específicos da tarefa.

## Arquitetura

### Componentes do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Model Router  │───▶│  Strategy Engine │───▶│ Health Monitor │
│                 │    │                  │    │                │
│   ┌─────────────┐   │   ┌─────────────┐   │   ┌─────────────┐ │
│   │  Providers  │   │   │  Scoring    │   │   │  Fallback   │ │
│   │  OpenAI     │   │   │  Algorithm  │   │   │  System    │ │
│   │  Anthropic  │   │   │             │   │   │            │ │
│   │  Ollama     │   │   └─────────────┘   │   └─────────────┘ │
│   └─────────────┘   └─────────────────┘   └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Metrics &      │
                       │  Cost Tracking  │
                       └─────────────────┘
```

## Modelos Suportados

### OpenAI Models

| Modelo | Contexto | Custo/1K tokens | Forças | Fraquezas |
|--------|----------|----------------|--------|-----------|
| GPT-4 | 8K | $0.03 | Reasoning complexo, coding | Custo, latência |
| GPT-3.5-Turbo | 4K | $0.002 | Velocidade, tarefas gerais | Reasoning complexo |

### Anthropic Models

| Modelo | Contexto | Custo/1K tokens | Forças | Fraquezas |
|--------|----------|----------------|--------|-----------|
| Claude-3-Opus | 200K | $0.015 | Análise, contexto longo | Custo, latência |
| Claude-3-Haiku | 200K | $0.00025 | Eficiência, velocidade | Análise complexa |

### Local Models (Ollama)

| Modelo | Contexto | Custo/1K tokens | Forças | Fraquezas |
|--------|----------|----------------|--------|-----------|
| Llama2:13B | 4K | $0.00 | Privacidade, offline | Qualidade, contexto |
| Mistral:7B | 4K | $0.00 | Eficiência, privacidade | Reasoning complexo |

## Estratégias de Roteamento

### 1. Cost-Aware (Conscientização de Custo)

Prioriza modelos mais econômicos:

```javascript
const costStrategy = {
    enabled: true,
    priority: 'cost',
    threshold: 0.01,  // Máximo $0.01 por request
    fallbackToFree: true  // Fallback para modelos gratuitos
};
```

**Quando usar:**
- Orçamentos limitados
- Tarefas não críticas
- Processamento em lote

### 2. Performance-First (Performance em Primeiro Lugar)

Prioriza velocidade e baixa latência:

```javascript
const performanceStrategy = {
    enabled: true,
    priority: 'speed',
    maxLatency: 2000,  // Máximo 2 segundos
    preferredProviders: ['ollama', 'openai']
};
```

**Quando usar:**
- Respostas em tempo real
- Interfaces de usuário
- Processamento síncrono

### 3. Reliability-Focused (Foco em Confiabilidade)

Prioriza modelos mais estáveis:

```javascript
const reliabilityStrategy = {
    enabled: true,
    priority: 'reliability',
    minUptime: 0.95,  // Mínimo 95% uptime
    healthCheckInterval: 300000  // 5 minutos
};
```

**Quando usar:**
- Tarefas críticas
- Produção 24/7
- Dados sensíveis

### 4. Privacy-First (Privacidade em Primeiro Lugar)

Prioriza modelos locais e privados:

```javascript
const privacyStrategy = {
    enabled: true,
    priority: 'privacy',
    allowCloudProviders: false,
    maxDataTransfer: 0  // Sem transferência externa
};
```

**Quando usar:**
- Dados confidenciais
- Compliance regulatório
- Ambientes air-gapped

## Algoritmo de Seleção

### Análise de Requisitos

```javascript
const taskRequirements = {
    task_type: analyzeTaskType(request),
    complexity: analyzeComplexity(request),
    max_tokens: request.maxTokens,
    privacy_required: context.privacyRequired,
    cost_sensitivity: context.costSensitivity,
    latency_requirement: context.latencyRequirement
};
```

### Cálculo de Score

```javascript
// Score = Σ(fator × peso) / Σ(pesos)
const weights = {
    historicalSuccess: 0.4,
    agentPerformance: 0.25,
    actionComplexity: 0.15,
    promptQuality: 0.1,
    contextAvailability: 0.1
};
```

### Aplicação de Estratégias

```javascript
// Filtrar candidatos baseado na estratégia
let candidates = availableModels;

if (strategy.cost_aware) {
    candidates = candidates.filter(m => models[m].cost_per_token < threshold);
}

if (strategy.privacy_first) {
    candidates = candidates.filter(m => models[m].cost_per_token === 0);
}

// Score e rank final
const scoredModels = candidates.map(model => ({
    model,
    score: calculateModelScore(model, requirements, strategy)
}));

return scoredModels.sort((a, b) => b.score - a.score)[0].model;
```

## Sistema de Fallback

### Fallback Automático

```javascript
async function attemptFallback(request, context, originalError) {
    const fallbackCandidates = getAvailableModels()
        .filter(model => !originalError.message.includes(model))
        .slice(0, 3); // Máximo 3 tentativas

    for (const fallbackModel of fallbackCandidates) {
        try {
            const result = await executeWithModel(fallbackModel, request, context);
            logFallbackSuccess(fallbackModel, originalError);
            return result;
        } catch (fallbackError) {
            logFallbackFailure(fallbackModel, fallbackError);
        }
    }

    throw new Error('All fallback models failed');
}
```

### Estratégias de Fallback

1. **Mesmo Provider**: Tentar outro modelo do mesmo provedor
2. **Custo Similar**: Manter faixa de custo similar
3. **Funcionalidade Equivalente**: Garantir capacidades similares
4. **Disponibilidade**: Priorizar modelos com melhor uptime

## Monitoramento de Saúde

### Health Checks

```javascript
async function performHealthCheck(modelConfig) {
    const startTime = Date.now();

    try {
        // Ping rápido para o endpoint
        const response = await fetch(`${modelConfig.endpoint}/health`, {
            timeout: 5000,
            method: 'HEAD'
        });

        const latency = Date.now() - startTime;
        const isHealthy = response.ok && latency < 10000;

        updateModelHealth(model, {
            status: isHealthy ? 'healthy' : 'degraded',
            latency,
            lastCheck: Date.now()
        });

        return isHealthy;
    } catch (error) {
        updateModelHealth(model, {
            status: 'unhealthy',
            error: error.message,
            lastCheck: Date.now()
        });
        return false;
    }
}
```

### Métricas de Saúde

- **Uptime**: % de tempo que o modelo está disponível
- **Latência Média**: Tempo de resposta médio
- **Taxa de Erro**: % de requests que falham
- **Throughput**: Requests por segundo

## Cache de Decisões

### Cache Inteligente

```javascript
// Cache baseado em hash da requisição
const cacheKey = hash(request + context);

if (routingCache.has(cacheKey)) {
    const cached = routingCache.get(cacheKey);
    if (!isExpired(cached)) {
        return cached.decision;
    }
}

// Calcular nova decisão
const decision = await selectOptimalModel(requirements);
routingCache.set(cacheKey, {
    decision,
    timestamp: Date.now(),
    ttl: 30 * 60 * 1000  // 30 minutos
});
```

### Invalidação de Cache

- **Timeout**: Cache expira automaticamente
- **Mudança de Estratégia**: Invalidação quando estratégia muda
- **Health Change**: Invalidação quando saúde do modelo muda
- **Manual**: Invalidação forçada via API

## Rastreamento de Custos

### Monitoramento de Uso

```javascript
const usage = {
    model: selectedModel,
    tokens: response.usage.total_tokens,
    cost: (tokens / 1000) * modelConfig.cost_per_token,
    latency: Date.now() - startTime,
    success: true,
    timestamp: Date.now()
};

trackModelUsage(usage);
```

### Relatórios de Custo

```javascript
const costReport = {
    totalCost: sum(allUsage.cost),
    costByModel: groupByModel(allUsage),
    costByProvider: groupByProvider(allUsage),
    avgCostPerRequest: totalCost / totalRequests,
    costSavings: calculateSavingsVsExpensiveModel(allUsage),
    timeRange: 'last_30_days'
};
```

## Configuração Dinâmica

### Adição de Modelos

```javascript
// Adicionar novo modelo em runtime
router.addModel('custom-gpt', {
    provider: 'openai',
    name: 'gpt-3.5-turbo-custom',
    cost_per_token: 0.001,
    max_tokens: 4096,
    strengths: ['customization', 'cost_effective'],
    weaknesses: ['complex_reasoning'],
    reliability: 0.95
});
```

### Atualização de Estratégias

```javascript
// Alterar estratégia baseada no horário
if (isBusinessHours()) {
    router.configureStrategies({
        performance_first: true,
        cost_aware: false
    });
} else {
    router.configureStrategies({
        cost_aware: true,
        performance_first: false
    });
}
```

## Exemplos de Uso

### 1. Roteamento Básico

```javascript
const router = getModelRouter();

const result = await router.routeRequest({
    prompt: 'Explique machine learning',
    estimatedTokens: 200,
    maxTokens: 500
}, {
    agent: 'student',
    task_type: 'education'
});

// Resultado: Modelo econômico selecionado automaticamente
console.log(`Modelo: ${result.model}, Custo: $${result.cost}`);
```

### 2. Roteamento com Privacidade

```javascript
const result = await router.routeRequest({
    prompt: 'Analise estes dados confidenciais',
    estimatedTokens: 500
}, {
    agent: 'security_analyst',
    privacyRequired: true,
    task_type: 'analysis'
});

// Resultado: Modelo local selecionado automaticamente
console.log(`Modelo privado: ${result.model}`); // ollama model
```

### 3. Roteamento Cost-Aware

```javascript
// Configurar estratégia
router.configureStrategies({ cost_aware: true });

const result = await router.routeRequest({
    prompt: 'Resuma este texto longo',
    estimatedTokens: 1000
}, {
    costSensitivity: 'high'
});

// Resultado: Modelo mais barato selecionado
console.log(`Modelo econômico: ${result.model}`); // claude-3-haiku
```

### 4. Monitoramento de Performance

```javascript
const stats = router.getStats();

console.log('Performance do Router:');
console.log(`Requests totais: ${stats.total_requests}`);
console.log(`Taxa de sucesso: ${(stats.success_rate * 100).toFixed(1)}%`);
console.log(`Custo total: $${stats.model_usage.reduce((sum, u) => sum + u.total_cost, 0).toFixed(4)}`);

stats.model_usage.forEach(usage => {
    console.log(`${usage.model}: ${usage.requests} requests, $${usage.total_cost.toFixed(4)}`);
});
```

## Limitações e Melhorias

### Limitações Atuais

- **APIs Reais**: Implementação usa simulação (não chama APIs reais)
- **Health Checks**: Baseado em simulação, não monitoramento real
- **Cache Persistente**: Cache em memória, perdido em restarts
- **Balanceamento de Carga**: Não distribui load entre instâncias

### Melhorias Planejadas

1. **Integração Real**: Chamadas reais para APIs dos provedores
2. **Monitoramento Avançado**: Métricas detalhadas de performance
3. **Cache Distribuído**: Redis ou similar para cache compartilhado
4. **Load Balancing**: Distribuição inteligente de requests
5. **A/B Testing**: Testes automáticos de diferentes estratégias
6. **Auto-scaling**: Adaptação automática baseada na demanda

## Testes

Execute os testes do Model Router:

```bash
node scripts/test_model_router.js
```

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Funcional
**Modelos Suportados**: 6 modelos de 3 provedores
**Estratégias**: 4 estratégias configuráveis
**Fallback**: Sistema automático de recuperação
