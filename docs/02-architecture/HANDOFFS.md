# Handoffs Inteligentes via Prompts

Documentação do sistema de handoffs inteligentes entre agentes na Corporação Senciente 7.0.

## Visão Geral

O sistema de handoffs detecta automaticamente quando um agente precisa chamar outro agente baseado na análise da task. Isso permite orquestração inteligente sem necessidade de configuração manual.

## Como Funciona

### 1. Detecção Automática

Quando um agente recebe uma task, o `HandoffManager` analisa a task e detecta se há necessidade de handoff:

```javascript
const handoffManager = getHandoffManager();
const handoff = handoffManager.detectHandoff('marketing', 'Criar copy para landing page');

if (handoff) {
    // Handoff detectado: marketing → copywriting
    // Confiança: 85%
}
```

### 2. Padrões de Handoff

O sistema usa padrões pré-definidos para detectar handoffs:

- **Marketing → Copywriting**: Quando task menciona "copy", "texto", "conteúdo", "landing page"
- **Marketing → Finance**: Quando task menciona "ROI", "orçamento", "budget", "custo"
- **Sales → Finance**: Quando task menciona "preço", "pricing", "margem", "contrato"
- **Dev → Architect**: Quando task menciona "arquitetura", "design", "escalabilidade"
- **Dev → Validation**: Quando task menciona "teste", "validação", "QA", "qualidade"

### 3. Geração de Prompt

Quando handoff é detectado, um prompt estruturado é gerado:

```
## HANDOFF INTELIGENTE DETECTADO

**Agente Chamador:** marketing
**Agente Destino:** copywriting
**Razão:** Criação de copy e conteúdo
**Confiança:** 85%

**Task Original:**
Criar copy para landing page de lançamento

---

O agente marketing detectou que esta task requer especialização do agente copywriting.
Por favor, incorpore o agente copywriting para executar esta subtask.
```

### 4. Agregação de Resultados

Quando múltiplos agentes trabalham na mesma task, os resultados são agregados:

```javascript
const results = [
    { agent: 'copywriting', success: true, summary: 'Copy criado' },
    { agent: 'finance', success: true, summary: 'ROI: 150%' }
];

const aggregated = handoffManager.aggregateResults(results, 'marketing');
// {
//   primaryAgent: 'marketing',
//   agents: ['copywriting', 'finance'],
//   conflicts: [],
//   consensus: { type: 'success', confidence: 1.0 }
// }
```

### 5. Detecção de Conflitos

O sistema detecta quando agentes têm resultados contraditórios:

```javascript
const conflictingResults = [
    { agent: 'copywriting', success: true },
    { agent: 'validation', success: false }
];

const aggregated = handoffManager.aggregateResults(conflictingResults, 'marketing');
// aggregated.conflicts = [
//   {
//     agent1: 'copywriting',
//     agent2: 'validation',
//     issue: 'Resultados contraditórios (sucesso vs falha)'
//   }
// ]
```

### 6. Resolução de Conflitos

Quando conflitos são detectados, o sistema sugere resolução:

```javascript
const resolution = handoffManager.resolveConflicts(conflicts, context);
// {
//   resolved: true,
//   strategy: 'priority_based',
//   recommendation: 'Revisar resultados manualmente ou usar agente de validação'
// }
```

## Padrões Disponíveis

### Business Sector

- **Marketing → Copywriting**: Copy, textos, conteúdo
- **Marketing → Finance**: ROI, orçamento, custos
- **Marketing → Sales**: Vendas, pipeline, leads
- **Sales → Finance**: Preço, pricing, margens
- **Sales → Marketing**: Campanhas, estratégia
- **Product → Design**: Design, UX, UI
- **Product → Marketing**: Lançamento, go-to-market

### Technical Sector

- **Dev → Architect**: Arquitetura, design, escalabilidade
- **Dev → Validation**: Testes, validação, QA
- **Architect → Dev**: Implementação, código

## Confiança

O sistema calcula confiança baseado em quantos triggers são encontrados na task:

- **Alta confiança (>0.7)**: Múltiplos triggers encontrados
- **Média confiança (0.5-0.7)**: Alguns triggers encontrados
- **Baixa confiança (<0.5)**: Poucos ou nenhum trigger

Handoffs só são sugeridos quando confiança > 0.5.

## Integração com BaseAgent

O `BaseAgent.execute()` automaticamente verifica handoffs:

```javascript
async execute(task, context = {}) {
    const handoff = handoffManager.detectHandoff(this.name, task);
    
    if (handoff && handoff.confidence > 0.5) {
        return {
            handoff: handoff,
            suggestion: `Esta task requer especialização do agente ${handoff.to}`,
            prompt: handoffManager.generateHandoffPrompt(handoff, task, context)
        };
    }
    
    // Execução normal...
}
```

## Exemplo Completo

```javascript
// Marketing Agent recebe task
const marketing = new MarketingAgent();
const task = 'Criar campanha de lançamento com copy e análise de ROI';

// Handoff Manager detecta necessidade
const handoffManager = getHandoffManager();
const handoff1 = handoffManager.detectHandoff('marketing', task);
// handoff1 = { to: 'copywriting', confidence: 0.8, ... }

const handoff2 = handoffManager.detectHandoff('marketing', 'analisar ROI');
// handoff2 = { to: 'finance', confidence: 0.9, ... }

// Múltiplos agentes executam
const results = [
    await copywriting.execute('Criar copy'),
    await finance.execute('Analisar ROI')
];

// Resultados são agregados
const aggregated = handoffManager.aggregateResults(results, 'marketing');
// Consenso encontrado, sem conflitos
```

## Testes

Execute os testes de handoffs:

```bash
node scripts/test_handoffs.js
```

## Referências

- **HandoffManager**: `scripts/agents/handoff_manager.js`
- **BaseAgent**: `scripts/agents/base_agent.js`
- **Protocolo Agent-to-Agent**: `docs/02-architecture/AGENT_TO_AGENT.md`

---

**Última Atualização**: 2025-01-XX
**Status**: ✅ Implementado e Testado


