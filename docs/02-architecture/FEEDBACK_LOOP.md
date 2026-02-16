# Sistema de Feedback Loop Automático

Documentação do sistema de aprendizado contínuo baseado em feedback de execuções na Corporação Senciente 7.0.

## Visão Geral

O Feedback Loop é um sistema de aprendizado de máquina que analisa automaticamente o desempenho de agentes, detecta padrões, sugere melhorias e otimiza prompts através de A/B testing. Ele transforma cada execução em uma oportunidade de aprendizado.

## Como Funciona

### 1. Coleta Automática de Feedback

Após cada execução, o sistema coleta automaticamente:

```javascript
const feedbackData = {
    success: true,           // Execução bem-sucedida?
    result: "Task completed", // Resultado da execução
    error: null,             // Erro (se houver)
    errorType: null,         // Tipo de erro
    metrics: {
        duration: 1500,      // Tempo em ms
        quality: 0.85        // Qualidade (0-1)
    },
    insights: null,          // Insights adicionais
    suggestedFix: null       // Correção sugerida
};
```

### 2. Análise de Padrões

O sistema identifica automaticamente padrões problemáticos:

- **Taxa de sucesso baixa** (<60%): Sugere revisões de abordagem
- **Tempo de execução alto** (>10s): Recomenda otimizações
- **Erros recorrentes**: Identifica tipos de erro frequentes
- **Qualidade inconsistente**: Detecta variabilidade alta
- **Aprendizado detectado**: Melhoria ao longo do tempo

### 3. A/B Testing de Prompts

Sistema automatizado de teste de variações de prompt:

```javascript
const variations = [
    { id: 'v1', prompt: 'Execute focando em qualidade', expectedQuality: 0.8 },
    { id: 'v2', prompt: 'Execute rapidamente', expectedQuality: 0.6 },
    { id: 'v3', prompt: 'Equilibre qualidade e velocidade', expectedQuality: 0.75 }
];

const results = await feedbackLoop.runABTesting('agent', 'task_type', variations);
// Resultado: variação vencedora com 37% de melhoria
```

### 4. Geração Automática de Melhorias

Baseado em padrões detectados, o sistema gera sugestões:

```javascript
// Exemplo de sugestões geradas automaticamente:
[
    {
        type: 'low_success_rate',
        severity: 'high',
        description: 'Taxa de sucesso baixa (45%) para tasks similares',
        suggestion: 'Revisar abordagem ou adicionar validações',
        confidence: 0.85
    }
]
```

## Integração com LLB Executor

### Coleta Automática

```javascript
// No LLB Executor, após cada execução:
await this.collectExecutionFeedback(action, result, context, 'success');

// Feedback é automaticamente:
// 1. Armazenado no histórico
// 2. Analisado para padrões
// 3. Convertido em aprendizado no LangMem
// 4. Usado para sugerir melhorias
```

### Aprendizado Contínuo

Cada execução alimenta o aprendizado:

```
Execução → Feedback → Análise → Padrões → Melhorias → Próximas Execuções
```

## APIs Disponíveis

### Coleta de Feedback

```javascript
await feedbackLoop.collectFeedback(executionData, feedbackData);
```

### Análise de Performance

```javascript
const insights = await feedbackLoop.getExecutionInsights('agent_name', 'task_type');
// Retorna: insights, recomendações, métricas
```

### A/B Testing

```javascript
const results = await feedbackLoop.runABTesting(agent, taskType, variations);
// Retorna: winner, improvement, confidence, recommendations
```

### Estatísticas

```javascript
const stats = feedbackLoop.getStats();
// {
//   totalFeedback: 150,
//   successRate: 0.78,
//   avgQuality: 82.5,
//   learningThreshold: 0.7
// }
```

## Configuração

### Parâmetros Principais

```javascript
const feedbackLoop = getFeedbackLoop({
    learningThreshold: 0.7,      // Threshold para considerar aprendizado
    feedbackRetentionDays: 30,   // Dias para manter feedback
    minFeedbackSamples: 5        // Mínimo de amostras para análise
});
```

### Thresholds de Detecção

- **Taxa de sucesso baixa**: <60%
- **Tempo alto**: >10 segundos
- **Erro recorrente**: >30% das execuções
- **Qualidade variável**: variância >10%
- **Aprendizado**: melhoria >10% ao longo do tempo

## Armazenamento no LangMem

### Padrões de Execução

```javascript
// Aprendizados bem-sucedidos
await llbProtocol.storePattern(successPattern, {
    category: 'execution_patterns',
    source: 'feedback_loop',
    confidence: qualityScore
});
```

### Lições de Erro

```javascript
// Lições aprendidas de erros
await llbProtocol.storePattern(errorLesson, {
    category: 'error_patterns',
    source: 'feedback_loop',
    error_type: errorType
});
```

### Sugestões de Melhoria

```javascript
// Melhorias sugeridas
await llbProtocol.storePattern(improvement, {
    category: 'improvement_suggestions',
    source: 'feedback_loop',
    agent: agentName,
    severity: pattern.severity
});
```

## Exemplos de Uso

### 1. Monitoramento de Agente

```javascript
// Obter insights de performance
const insights = await feedbackLoop.getExecutionInsights('architect');

// Resultado:
{
  insights: [
    {
      type: 'performance_overview',
      data: {
        totalExecutions: 45,
        successRate: 78.5,
        avgDuration: 2300,
        timeRange: { days: 12 }
      }
    }
  ],
  recommendations: [
    'Considerar otimização de performance',
    'Implementar validações adicionais'
  ]
}
```

### 2. A/B Testing

```javascript
const variations = [
    { id: 'concise', prompt: 'Execute concisamente', expectedQuality: 0.8 },
    { id: 'detailed', prompt: 'Execute com detalhes', expectedQuality: 0.9 }
];

const results = await feedbackLoop.runABTesting('dev_agent', 'code_review', variations);

// Resultado:
{
  winner: 'detailed',
  improvement: 0.15,  // 15% melhor
  confidence: 0.82,   // 82% de confiança estatística
  recommendations: [
    'Adotar variação "detailed" como padrão',
    'Considerar combinar elementos das variações'
  ]
}
```

## Métricas de Performance

### Métricas Rastreadas

- **Taxa de Sucesso**: % de execuções bem-sucedidas
- **Qualidade Média**: Score médio de qualidade (0-1)
- **Tempo Médio**: Duração média das execuções
- **Padrões Detectados**: Número de padrões identificados
- **Melhorias Sugeridas**: Número de sugestões geradas

### Benchmarks

- **Coleta de Feedback**: <100ms por execução
- **Análise de Padrões**: <500ms para 50 execuções
- **A/B Testing**: <2s para 3 variações
- **Busca Similar**: <200ms para 1000 entradas

## Limitações e Melhorias

### Limitações Atuais

- **Análise Estatística**: Implementação básica (sem testes t ou ANOVA)
- **Similaridade**: Baseada em embeddings simples
- **A/B Testing**: Simulado (não real-time em produção)
- **Retenção**: Dados mantidos apenas em memória (não persistidos)

### Melhorias Planejadas

1. **Análise Estatística Avançada**: Testes de significância, correlação
2. **Machine Learning**: Modelos preditivos de sucesso
3. **Personalização**: Aprendizado personalizado por agente/task
4. **Integração com Cache**: Feedback-driven prompt optimization
5. **Dashboards**: Visualização de métricas e tendências

## Testes

Execute os testes do Feedback Loop:

```bash
node scripts/test_feedback_loop.js
```

## Referências

- **FeedbackLoop**: `scripts/swarm/feedback_loop.js`
- **LLB Executor**: `scripts/memory/llb_executor.js`
- **Embeddings Service**: `scripts/utils/embeddings_service.js`
- **LangMem**: `scripts/memory/langmem.js`

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Funcional

