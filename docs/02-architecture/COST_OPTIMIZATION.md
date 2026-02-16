# Cost Optimization - Otimização Inteligente de Custos

## Visão Geral

O sistema de Cost Optimization implementa otimização inteligente de custos para operações LLM, rastreando uso em tempo real, aplicando estratégias automáticas de redução e fornecendo alertas proativos de orçamento. O sistema visa minimizar custos operacionais mantendo a qualidade e performance necessárias.

## Arquitetura

### Componentes Principais

1. **Cost Optimizer** (`scripts/swarm/cost_optimizer.js`)
   - Núcleo do sistema de otimização de custos
   - Tracking em tempo real de uso de tokens/custos
   - Aplicação automática de estratégias de otimização
   - Monitoramento de limites de orçamento

2. **Cost Tracking**
   - Rastreamento detalhado por modelo, agente e projeto
   - Cálculos precisos baseados em custos reais de APIs
   - Histórico completo de uso e custos

3. **Budget Management**
   - Limites configuráveis (diário, semanal, mensal)
   - Alertas automáticos quando próximos dos limites
   - Possibilidade de pausa automática em caso de excedente

4. **Optimization Strategies**
   - Seleção inteligente de modelo baseada em custo vs qualidade
   - Cache agressivo para reduzir chamadas repetidas
   - Compressão de prompts para reduzir uso de tokens
   - Batching de requests similares
   - Otimização de qualidade para operações não críticas

## Tracking de Custos

### Custos por Modelo (USD por 1000 tokens)

```javascript
const modelCosts = {
    // OpenAI
    'gpt-4': { input: 0.03, output: 0.06 },           // $0.09/1000 tokens
    'gpt-4-turbo': { input: 0.01, output: 0.03 },     // $0.04/1000 tokens
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 }, // $0.0035/1000 tokens

    // Anthropic
    'claude-3-opus': { input: 0.015, output: 0.075 },  // $0.09/1000 tokens
    'claude-3-sonnet': { input: 0.003, output: 0.015 }, // $0.018/1000 tokens
    'claude-3-haiku': { input: 0.00025, output: 0.00125 }, // $0.0015/1000 tokens

    // Local (gratuito)
    'llama2:13b': { input: 0, output: 0 },
    'mistral:7b': { input: 0, output: 0 }
};
```

### Rastreamento em Tempo Real

```javascript
// Registro automático de uso
await costOptimizer.recordUsage(
    'gpt-4',
    { input: 1000, output: 500 },
    'completion',
    {
        agent: 'architect',
        project: 'web_app',
        userId: 'user123',
        operation: 'code_review',
        correlationId: 'req_1703123456789_abc123'
    }
);
```

### Estado de Custos

```javascript
const costState = {
    // Custos atuais
    dailyCost: 2.45,      // $2.45 hoje
    weeklyCost: 12.80,    // $12.80 esta semana
    monthlyCost: 45.20,   // $45.20 este mês
    totalCost: 1250.75,   // $1250.75 total

    // Uso por dimensão
    modelUsage: new Map([
        ['gpt-4', { tokens: 45000, cost: 4.05, requests: 25 }],
        ['claude-3-haiku', { tokens: 120000, cost: 0.18, requests: 80 }]
    ]),

    agentUsage: new Map([
        ['architect', { tokens: 75000, cost: 2.85, requests: 45 }],
        ['developer', { tokens: 85000, cost: 1.48, requests: 60 }]
    ]),

    projectUsage: new Map([
        ['web_app', { tokens: 120000, cost: 3.20, requests: 85 }],
        ['api_service', { tokens: 55000, cost: 1.03, requests: 35 }]
    ]),

    // Otimizações
    optimizationSavings: 0.85,  // $0.85 economizados por otimizações

    // Histórico
    costHistory: [...] // Últimas 1000 operações
};
```

## Gestão de Orçamento

### Limites Configuráveis

```javascript
const budgetLimits = {
    daily: 10.0,      // $10 por dia
    weekly: 50.0,     // $50 por semana
    monthly: 200.0    // $200 por mês
};
```

### Alertas de Orçamento

#### Thresholds de Alerta
```javascript
const budgetAlertThresholds = {
    warning: 0.8,    // 80% do orçamento = alerta amarelo
    critical: 0.95   // 95% do orçamento = alerta vermelho
};
```

#### Tipos de Alerta
```javascript
// Alerta de aviso
{
    type: 'budget_daily_warning',
    severity: 'warning',
    title: 'Orçamento Diário Atingindo Limite',
    description: 'Uso de $8.50 de $10.00 (85%)',
    recommendation: 'Considere usar modelos mais baratos'
}

// Alerta crítico
{
    type: 'budget_monthly_critical',
    severity: 'critical',
    title: 'Orçamento Mensal CRÍTICO',
    description: 'Uso de $195.00 de $200.00 (97.5%)',
    recommendation: 'PAUSAR operações imediatamente'
}
```

### Dashboard de Orçamento

```
Orçamento Atual
├── Diário: $8.50 / $10.00 (85%) ⚠️ ALERTA
├── Semanal: $32.40 / $50.00 (65%) ✅ OK
└── Mensal: $145.80 / $200.00 (73%) ✅ OK

Próximos Limites
├── Diário reseta em: 3h 45min
├── Semanal reseta em: 2 dias
└── Mensal reseta em: 12 dias
```

## Estratégias de Otimização

### 1. Seleção Inteligente de Modelo

```javascript
// Estratégia baseada em operação e custo
const optimization = {
    type: 'model_selection',
    currentModel: 'gpt-4',
    optimizedModel: 'claude-3-haiku',
    savings: 0.027,  // $0.027 economizados
    reasoning: 'Operação simples usando modelo mais barato'
};

// Lógica de decisão
if (operation === 'simple_query' && tokens < 500) {
    // Usar modelo mais barato disponível
    return 'claude-3-haiku'; // $0.0015/1000 vs $0.09/1000 do GPT-4
}
```

### 2. Cache Inteligente

```javascript
// Cache baseado em similaridade de prompts
const cacheOptimization = {
    type: 'caching',
    savings: 0.012,  // $0.012 economizados
    reasoning: 'Cache hit evitou chamada LLM',
    hitRate: 0.75    // 75% de hits
};

// Estratégia de cache
- Cache por hash de prompt
- TTL configurável (5 minutos padrão)
- Invalidação automática por mudanças
- Compressão de respostas cacheadas
```

### 3. Compressão de Prompts

```javascript
// Redução de tokens via compressão
const compressionOptimization = {
    type: 'compression',
    tokenSavings: 45,     // 45 tokens economizados
    savings: 0.0045,      // $0.0045 economizados
    reasoning: 'Compressão reduziu prompt em 45 tokens'
};

// Técnicas de compressão
- Remoção de redundâncias
- Abreviação inteligente
- Contexto contextual mínimo
- Tokens essenciais apenas
```

### 4. Batching de Requests

```javascript
// Agrupamento de requests similares
const batchOptimization = {
    type: 'batching',
    savings: 0.018,  // $0.018 economizados
    reasoning: '3 requests processados em batch',
    batchSize: 3
};

// Estratégia de batching
- Agrupamento por operação similar
- Janela de tempo configurável
- Priorização por urgência
- Rate limiting inteligente
```

### 5. Otimização de Qualidade

```javascript
// Qualidade vs custo para operações não críticas
const qualityOptimization = {
    type: 'quality_optimization',
    currentModel: 'claude-3-opus',
    optimizedModel: 'claude-3-haiku',
    savings: 0.072,  // $0.072 economizados
    reasoning: 'Operação de teste usando modelo mais barato'
};

// Mapeamento de qualidade
const qualityMapping = {
    critical: ['gpt-4', 'claude-3-opus'],        // Máxima qualidade
    important: ['gpt-4-turbo', 'claude-3-sonnet'], // Boa qualidade
    standard: ['gpt-3.5-turbo', 'claude-3-haiku'], // Qualidade padrão
    basic: ['llama2:13b', 'mistral:7b']         // Qualidade básica
};
```

## Relatórios e Analytics

### Relatório Diário de Custos

```javascript
const dailyReport = costOptimizer.generateCostReport('daily');

{
    period: 'daily',
    timestamp: '2024-01-15T10:30:00.000Z',
    summary: {
        totalCost: 8.45,
        periodCost: 8.45,
        budgetLimit: 10.0,
        budgetUsed: '84.5%',
        optimizationSavings: 1.23
    },
    breakdown: {
        byModel: {
            'gpt-4': {
                cost: '4.50',
                tokens: 25000,
                requests: 15,
                avgCostPerRequest: '0.300000',
                avgCostPerToken: '0.000180'
            },
            'claude-3-haiku': {
                cost: '1.20',
                tokens: 80000,
                requests: 45,
                avgCostPerRequest: '0.026667',
                avgCostPerToken: '0.000015'
            }
        },
        byAgent: {
            'architect': { cost: '3.25', tokens: 45000, requests: 20 },
            'developer': { cost: '2.80', tokens: 35000, requests: 25 },
            'analyst': { cost: '2.40', tokens: 25000, requests: 15 }
        },
        byProject: {
            'web_app': { cost: '5.20', tokens: 65000, requests: 35 },
            'api_service': { cost: '3.25', tokens: 35000, requests: 20 }
        }
    },
    trends: {
        periods: [
            { period: 1, cost: 2.10, tokens: 15000, avgCostPerToken: 0.000140 },
            { period: 2, cost: 2.45, tokens: 18000, avgCostPerToken: 0.000136 },
            { period: 3, cost: 2.80, tokens: 20000, avgCostPerToken: 0.000140 },
            { period: 4, cost: 3.20, tokens: 22000, avgCostPerToken: 0.000145 },
            { period: 5, cost: 3.10, tokens: 21000, avgCostPerToken: 0.000148 }
        ],
        trend: 'increasing',  // 'increasing' | 'decreasing' | 'stable'
        avgCostPerToken: 0.000142
    },
    recommendations: [
        {
            type: 'model_optimization',
            priority: 'high',
            description: 'Considere usar claude-3-haiku ao invés de gpt-4 para reduzir custos em 3.2x',
            potentialSavings: 2.25
        },
        {
            type: 'caching',
            priority: 'medium',
            description: 'Implemente cache inteligente para reduzir chamadas LLM repetidas',
            potentialSavings: 1.50
        },
        {
            type: 'compression',
            priority: 'medium',
            description: 'Implemente compressão de prompts para reduzir uso de tokens',
            potentialSavings: 1.20
        }
    ]
}
```

### Dashboard Visual

```
📊 Relatório de Custos - Janeiro 2024

💰 Resumo Financeiro
├── Total mensal: $145.80
├── Orçamento mensal: $200.00 (73% usado)
├── Economia por otimizações: $12.45
└── Custo médio por dia: $4.70

📈 Tendências
├── Custo por token: $0.000142 (↗️ +4.3% vs mês anterior)
├── Requests por dia: 247 (↗️ +12% vs mês anterior)
├── Taxa de cache hit: 68% (✅ Bom)
└── Otimizações aplicadas: 89

🏆 Top Consumidores
├── Por modelo:
│   ├── GPT-4: $67.50 (46%)
│   ├── Claude-3-Haiku: $42.30 (29%)
│   └── GPT-3.5-Turbo: $36.00 (25%)
├── Por agente:
│   ├── Architect: $58.90 (40%)
│   ├── Developer: $52.40 (36%)
│   └── Analyst: $34.50 (24%)
└── Por projeto:
    ├── Web App: $89.20 (61%)
    ├── API Service: $41.60 (29%)
    └── Mobile App: $15.00 (10%)

💡 Recomendações Ativas
├── 🔴 ALTA: Migrar 40% das operações GPT-4 para Claude-3-Haiku
├── 🟡 MÉDIA: Implementar cache para queries repetidas
└── 🟡 MÉDIA: Comprimir prompts longos automaticamente
```

## Casos de Uso

### 1. Otimização de Desenvolvimento

```javascript
// Durante desenvolvimento, usar modelos mais baratos
const devOptimization = {
    environment: 'development',
    strategies: ['model_downgrade', 'cache_aggressive'],
    budget: { daily: 2.0, monthly: 20.0 },
    quality: 'standard'  // Não precisa de máxima qualidade
};

// Resultado: 70% redução de custos em desenvolvimento
```

### 2. Controle de Produção

```javascript
// Em produção, balancear custo vs qualidade
const prodOptimization = {
    environment: 'production',
    strategies: ['cost_aware_routing', 'intelligent_caching'],
    budget: { daily: 50.0, monthly: 1000.0 },
    quality: 'high',
    alerts: {
        budgetWarning: 0.8,
        budgetCritical: 0.95,
        autoPause: true
    }
};

// Resultado: Controle preciso de custos com alertas proativos
```

### 3. Otimização de Batch Jobs

```javascript
// Para processamento em lote, maximizar eficiência
const batchOptimization = {
    operation: 'batch_processing',
    strategies: ['maximum_batching', 'model_optimization', 'compression'],
    priority: 'cost_first',
    deadline: 'flexible'  // Não urgente
};

// Resultado: 80% redução de custos para jobs não críticos
```

## Configuração

### Configuração Básica

```javascript
const costOptimizer = getCostOptimizer({
    costEnabled: true,
    optimizationEnabled: true,
    budgetAlertsEnabled: true,

    // Orçamentos
    dailyBudget: 10.0,
    weeklyBudget: 50.0,
    monthlyBudget: 200.0,

    // Alertas
    budgetAlertThresholds: {
        warning: 0.8,
        critical: 0.95
    },

    // Otimizações
    optimizationStrategies: ['modelSelection', 'caching', 'compression'],
    cacheTimeout: 300000,  // 5 minutos

    // Monitoramento
    monitoringInterval: 60000  // 1 minuto
});
```

### Configuração Avançada

```javascript
const advancedConfig = {
    // Custos customizados
    customModelCosts: {
        'custom-model': { input: 0.005, output: 0.01 }
    },

    // Estratégias customizadas
    customStrategies: {
        enterprise: ['cost_aware', 'quality_preserved'],
        startup: ['maximum_optimization', 'budget_constrained'],
        research: ['quality_first', 'cost_secondary']
    },

    // Regras de roteamento
    routingRules: {
        'complex_analysis': 'gpt-4',
        'code_generation': 'claude-3-sonnet',
        'simple_query': 'claude-3-haiku',
        'test_operation': 'llama2:13b'
    },

    // Compressão adaptativa
    compressionRules: {
        maxTokens: 2000,  // Comprimir prompts > 2000 tokens
        preserveQuality: true,
        adaptiveRatio: true  // Ajustar ratio baseado em operação
    },

    // Cache inteligente
    cacheConfig: {
        strategy: 'semantic',  // 'exact' | 'semantic' | 'fuzzy'
        similarityThreshold: 0.85,
        maxCacheSize: 1000,
        ttlMs: 3600000  // 1 hora
    }
};
```

## Integração com o Sistema

### Integração com LLM Client

```javascript
// No LLM client, integrar cost tracking
class LLMClientWithCostTracking {
    async callLLM(prompt, options = {}) {
        // Antes da chamada
        const startTime = Date.now();
        const estimatedTokens = this.estimateTokens(prompt);

        // Fazer chamada
        const result = await this._callLLM(prompt, options);

        // Registrar custos
        const actualTokens = this.countTokens(result);
        await costOptimizer.recordUsage(
            this.selectedModel,
            actualTokens,
            'completion',
            {
                agent: options.agent,
                project: options.project,
                operation: options.operation,
                correlationId: options.correlationId
            }
        );

        return result;
    }
}
```

### Integração com Executor

```javascript
// No executor, aplicar otimizações
class ExecutorWithCostOptimization {
    async executeAction(action, context) {
        // Verificar orçamento antes de executar
        const budgetCheck = costOptimizer.getStatus();
        if (budgetCheck.currentCosts.daily > budgetCheck.budgetLimits.daily * 0.95) {
            throw new Error('Orçamento diário quase esgotado - operação cancelada');
        }

        // Aplicar otimizações se necessário
        const optimizedAction = await this.applyCostOptimizations(action, context);

        // Executar ação otimizada
        return await this._executeAction(optimizedAction, context);
    }
}
```

## Performance e Escalabilidade

### Impacto de Performance

- **CPU Overhead**: <1% adicional para cálculos de custo
- **Memória Overhead**: ~1MB para estado de custos
- **Latência**: <2ms por operação de tracking
- **Storage**: ~10KB por dia de histórico

### Escalabilidade

```javascript
// Configuração para alta escala
const highScaleConfig = {
    // Otimizações de performance
    asyncProcessing: true,
    batchReporting: true,
    compressedHistory: true,

    // Distribuição de carga
    distributedTracking: {
        shards: 8,
        replication: 3,
        coordinator: 'redis_cluster'
    },

    // Cache distribuído
    distributedCache: {
        provider: 'redis',
        ttl: 3600000,
        maxMemory: '1gb'
    },

    // Alertas escaláveis
    alertAggregation: {
        window: 300000,  // 5 minutos
        maxAlerts: 10,   // Máximo por janela
        deduplication: true
    }
};
```

## Troubleshooting

### Problemas Comuns

1. **Custos não sendo rastreados**
   - Verificar se `costEnabled: true`
   - Confirmar integração com LLM client
   - Verificar logs de erro no cost optimizer

2. **Alertas não disparando**
   - Verificar configuração de thresholds
   - Confirmar limites de orçamento
   - Verificar se `budgetAlertsEnabled: true`

3. **Otimizações não aplicando**
   - Verificar se `optimizationEnabled: true`
   - Confirmar estratégias configuradas
   - Verificar cache de decisões

4. **Relatórios vazios**
   - Aguardar período de coleta de dados
   - Verificar se operações estão sendo executadas
   - Confirmar configuração de períodos

### Debug Mode

```javascript
// Habilitar debug detalhado
const costOptimizer = getCostOptimizer({
    debug: true,
    detailedLogging: true,
    performanceMonitoring: true
});

// Monitorar em tempo real
setInterval(() => {
    const status = costOptimizer.getStatus();
    console.log(`Daily cost: $${status.currentCosts.daily}`);
    console.log(`Optimizations: ${status.activeOptimizations}`);
    console.log(`Budget alerts: ${status.budgetAlertsEnabled}`);
}, 30000);
```

## Próximos Passos

### Melhorias Planejadas

1. **Machine Learning para Previsão**
   - Predição de custos baseada em histórico
   - Otimização automática de orçamentos
   - Detecção de anomalias de custo

2. **Integração com Cloud Providers**
   - Reserved instances automático
   - Spot instances para workloads flexíveis
   - Auto-scaling baseado em custo

3. **Analytics Avançado**
   - ROI por feature/funcionalidade
   - Custo por usuário/organização
   - Otimização cross-service

4. **Compliance e Governança**
   - Auditoria completa de custos
   - Relatórios para compliance
   - Controle de acesso baseado em orçamento

Este sistema fornece controle completo e inteligente de custos, garantindo uso eficiente de recursos LLM com alertas proativos e otimizações automáticas que se adaptam ao uso real do sistema.