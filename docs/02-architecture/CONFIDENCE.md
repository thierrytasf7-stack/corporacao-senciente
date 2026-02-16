# Sistema de Confiança - Avaliação Inteligente

Documentação completa do sistema de avaliação de confiança da Corporação Senciente 7.0.

## Visão Geral

O Sistema de Confiança calcula scores inteligentes (0-1) para determinar o nível de confiança em ações, permitindo decisões automatizadas sobre execução direta, confirmação via prompt ou necessidade de aprovação manual.

## Arquitetura

### Componentes de Avaliação

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLB Executor  │───▶│ ConfidenceScorer │───▶│   LangMem       │
│                 │    │                 │    │ (Aprendizado)   │
│                 │    │                 │    │                 │
│                 │    │   ┌─────────────┐   │    ┌─────────────┐ │
│                 │    │   │   Fatores   │   │    │   Cache     │ │
│                 │    │   │  Avaliados  │   │    │ Confiança   │ │
│                 │    │   └─────────────┘   │    └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  MetricsCollector│
                       │  (Monitoramento) │
                       └─────────────────┘
```

## Fatores de Avaliação

### 1. Sucesso Histórico

Avalia o desempenho passado de ações similares:

```javascript
factors.historicalSuccess = await evaluateHistoricalSuccess(action, context);
// Baseado em:
// - Taxa de sucesso de ações similares
// - Peso por recência (ações recentes contam mais)
// - Similaridade contextual
```

### 2. Performance do Agente

Avalia a experiência e histórico do agente:

```javascript
factors.agentPerformance = evaluateAgentPerformance(context.agent);
// Combinação de:
// - Taxa de sucesso geral
- Qualidade média dos resultados
- Experiência (número de ações realizadas)
```

### 3. Complexidade da Ação

Avalia a dificuldade intrínseca da ação:

```javascript
factors.actionComplexity = evaluateActionComplexity(action);
// Considera:
// - Tipo de ação (create=0.4, deploy=0.9)
// - Número de arquivos afetados
- Tamanho do conteúdo
- Número de dependências
```

### 4. Qualidade do Prompt

Avalia a clareza e qualidade das instruções:

```javascript
factors.promptQuality = evaluatePromptQuality(action);
// Avalia:
// - Comprimento adequado
- Presença de verbos de ação
- Estrutura (listas, seções)
- Especificidade dos detalhes
```

### 5. Disponibilidade de Contexto

Avalia recursos disponíveis para execução:

```javascript
factors.contextAvailability = evaluateContextAvailability(action, context);
// Inclui:
// - Estado do LangMem
- Estado do Letta
- Histórico disponível
- Contexto do agente
```

## Decisões Baseadas em Confiança

### Thresholds Configuráveis

```javascript
const thresholds = {
    high: 0.8,     // ≥80%: Executar diretamente
    medium: 0.5,   // 50-80%: Executar com confirmação via prompt
    low: 0.3       // <50%: Requer confirmação manual
};
```

### Tipos de Decisão

#### 1. Execute Directly (Alta Confiança)
```
✅ Score: 85%
📋 Decisão: execute_directly
💡 Razão: Alta confiança - execução segura
🔄 Ação: Executar imediatamente
```

#### 2. Execute with Prompt (Confiança Média)
```
⚠️ Score: 65%
📋 Decisão: execute_with_prompt
💡 Razão: Confiança média - confirmação via prompt
🔄 Ação: Pedir confirmação antes de executar
```

#### 3. Require Confirmation (Baixa Confiança)
```
❌ Score: 25%
📋 Decisão: require_confirmation
💡 Razão: Baixa confiança - confirmação manual necessária
🔄 Ação: Bloquear execução até aprovação
```

## Cálculo de Score

### Fórmula de Avaliação

```javascript
// Score = Σ(fator × peso) / Σ(pesos)
const weights = {
    historicalSuccess: 0.4,
    agentPerformance: 0.25,
    actionComplexity: 0.15,
    promptQuality: 0.1,
    contextAvailability: 0.1
};

const score = Object.entries(factors)
    .reduce((sum, [factor, value]) => sum + value * weights[factor], 0)
    / Object.values(weights).reduce((sum, w) => sum + w, 0);
```

### Ajustes Contextuais

- **Validação Prévia**: Penaliza/recompensa baseado em resultado da validação
- **Fatores de Risco**: Reduz score para ações de alto risco
- **Tendências Recentes**: Ajusta baseado em performance recente

## Cache de Confiança

### Otimização de Performance

```javascript
// Cache baseado em hash da ação + contexto
const cacheKey = generateCacheKey(action, context);
const cached = confidenceCache.get(cacheKey);

if (cached && !expired) {
    return cached.result; // Retorno imediato
}
```

### Configuração de Cache

```javascript
const cacheConfig = {
    timeout: 300000,    // 5 minutos
    maxSize: 1000,      // Máximo 1000 entradas
    cleanupInterval: 60000 // Limpeza a cada minuto
};
```

## Aprendizado Contínuo

### Atualização de Performance

Cada avaliação atualiza métricas dos agentes:

```javascript
// Após avaliação
updateAgentPerformance(agent, {
    score: result.score,
    decision: result.decision.decision,
    factors: result.factors
});

// Performance histórica
agentPerformance.set(agent, {
    successRate: updatedSuccessRate,
    avgQuality: updatedQuality,
    experience: experience + 1
});
```

### Padrões de Confiança

Armazenamento de lições aprendidas:

```javascript
const learning = `
Avaliação de confiança para \${action.type}:
Score: \${(result.score * 100).toFixed(1)}%
Decisão: \${result.decision.decision}
Fatores: \${Object.keys(result.factors).join(', ')}
Lições: \${result.recommendations.join('; ')}
`;

await llbProtocol.storePattern(learning, {
    category: 'confidence_patterns',
    source: 'confidence_scorer'
});
```

## Integração com LLB Protocol

### Fluxo de Decisão Completo

```
1. Ação Recebida
   ↓
2. Validação Pré-execução (ActionValidator)
   ↓
3. Avaliação de Confiança (ConfidenceScorer)
   ↓
4. Decisão Automatizada:
   - Alta confiança → Executar diretamente
   - Média confiança → Confirmar via prompt
   - Baixa confiança → Requer aprovação manual
   ↓
5. Execução (se aprovada)
   ↓
6. Feedback Loop (aprendizado)
   ↓
7. Métricas (monitoramento)
```

### Estado Sincronizado

- **LangMem**: Armazena padrões de confiança e aprendizado
- **Letta**: Rastreia estado de decisões e confiança
- **ByteRover**: Timeline de decisões de confiança
- **Métricas**: Estatísticas de performance de confiança

## Resultado da Avaliação

### Estrutura Completa

```javascript
const confidenceResult = {
    score: 0.75,                    // Score final (0-1)
    factors: {                      // Fatores avaliados
        historicalSuccess: 0.8,
        agentPerformance: 0.7,
        actionComplexity: 0.6,
        promptQuality: 0.9,
        contextAvailability: 0.8
    },
    decision: {                     // Decisão tomada
        decision: 'execute_with_prompt',
        reason: 'Confiança média - confirmação via prompt',
        action_required: 'user_prompt'
    },
    confidence: 'high',            // Confiança no cálculo
    reasoning: 'Explicação detalhada...', // Raciocínio
    recommendations: [             // Sugestões
        'Melhore especificidade do prompt',
        'Considere ações similares para histórico'
    ]
};
```

## Configuração

### Parâmetros Principais

```javascript
const confidenceConfig = {
    highThreshold: 0.8,         // Limite para execução direta
    mediumThreshold: 0.5,       // Limite para confirmação via prompt
    lowThreshold: 0.3,          // Limite para confirmação manual
    cacheTimeout: 300000,       // Timeout do cache (ms)
    weights: {                  // Pesos dos fatores
        historicalSuccess: 0.4,
        agentPerformance: 0.25,
        actionComplexity: 0.15,
        promptQuality: 0.1,
        contextAvailability: 0.1
    }
};
```

## Recomendações Automáticas

### Baseadas em Score Baixo

```javascript
if (score < thresholds.medium) {
    recommendations.push(
        'Melhore a qualidade do prompt com mais detalhes',
        'Execute ações similares primeiro para construir histórico',
        'Considere simplificar a ação em passos menores'
    );
}
```

### Baseadas em Fatores Específicos

```javascript
// Complexidade alta
if (factors.actionComplexity > 0.8) {
    recommendations.push('Quebre em ações menores');
}

// Pouco histórico
if (factors.historicalSuccess < 0.3) {
    recommendations.push('Execute versão de teste primeiro');
}

// Agente novo
if (factors.agentPerformance < 0.4) {
    recommendations.push('Considere supervisão adicional');
}
```

## Monitoramento e Métricas

### Métricas Rastreadas

- **Distribuição de Scores**: % de ações em cada faixa de confiança
- **Taxa de Decisões**: % de execuções diretas vs confirmações
- **Precisão de Previsão**: Comparação entre score previsto e resultado real
- **Performance do Cache**: Hit rate e tempo de resposta
- **Aprendizado**: Melhoria de scores ao longo do tempo

### Alertas Automáticos

```javascript
// Alerta: Muitas confirmações manuais
if (manualConfirmationsRate > 0.3) { // >30%
    alert('Sistema requer muitas aprovações manuais');
}

// Alerta: Cache ineficiente
if (cacheHitRate < 0.5) { // <50%
    alert('Cache de confiança pouco utilizado');
}
```

## Exemplos de Uso

### 1. Avaliação Básica

```javascript
const scorer = getConfidenceScorer();

const action = {
    type: 'deploy',
    description: 'Deploy em produção',
    files: ['dist/app.js', 'config/prod.json']
};

const result = await scorer.calculateConfidence(action, {
    agent: 'architect',
    langmemAvailable: true,
    lettaState: 'active'
});

console.log(`Confiança: ${(result.score * 100).toFixed(1)}%`);
console.log(`Decisão: ${result.decision.decision}`);
```

### 2. Decisão Automatizada

```javascript
const confidence = await calculateConfidence(action, context);

switch (confidence.decision.decision) {
    case 'execute_directly':
        await executeAction(action);
        break;

    case 'execute_with_prompt':
        const confirmed = await promptUser(
            `Executar ação? Confiança: ${(confidence.score * 100).toFixed(1)}%`
        );
        if (confirmed) await executeAction(action);
        break;

    case 'require_confirmation':
        const approved = await requireManualApproval(action, confidence);
        if (approved) await executeAction(action);
        break;
}
```

### 3. Análise de Fatores

```javascript
const result = await scorer.calculateConfidence(action, context);

// Análise detalhada
console.log('Análise de fatores:');
Object.entries(result.factors).forEach(([factor, score]) => {
    console.log(`  ${factor}: ${(score * 100).toFixed(1)}%`);
});

if (result.recommendations.length > 0) {
    console.log('Recomendações:');
    result.recommendations.forEach(rec => console.log(`  • ${rec}`));
}
```

## Limitações e Melhorias

### Limitações Atuais

- **Dados Históricos**: Depende de histórico suficiente para precisão
- **Contextualização**: Avaliação limitada a fatores pré-definidos
- **Adaptabilidade**: Regras fixas, não aprendizado de máquina avançado
- **Cache**: Estratégia simples de timeout

### Melhorias Planejadas

1. **Machine Learning**: Modelos preditivos treinados em dados reais
2. **Contextualização Avançada**: Consideração de fatores externos (hora, carga, etc.)
3. **Personalização**: Perfis de confiança específicos por agente/tarefa
4. **A/B Testing**: Testes automáticos de diferentes thresholds
5. **Feedback em Loop**: Ajuste automático baseado em resultados reais

## Testes

Execute os testes do sistema de confiança:

```bash
node scripts/test_confidence_scorer.js
```

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Funcional
**Precisão de Avaliação**: Alta (scores consistentes)
**Velocidade de Resposta**: <500ms com cache
