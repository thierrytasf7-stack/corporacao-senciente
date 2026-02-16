# Hierarquia de Decisão - Diana Corporação Senciente

**Data:** 2026-02-14
**Versão:** 1.0
**Status:** ATIVO

---

## Princípio Fundamental

```
┌─────────────────────────────────────┐
│   CRIADOR (Decisão Fundamental)     │ ← Autoridade Absoluta
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Axiomas (Verdade Ontológica)      │ ← Imutável, só versionada
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Fatos de Negócio (WikiLocal)      │ ← Evolui com aprovação
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Decisões Operacionais (Squads)    │ ← Execução dentro de constrain
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Ações Específicas (Agentes)       │ ← Tática
└─────────────────────────────────────┘
```

---

## Níveis de Decisão

### Nível 1: Decisão Criador (ABSOLUTA)

**Definição:** Determinações explícitas do Criador que definem estratégia, visão ou direção fundamental.

**Características:**
- Não requer justificativa racional
- Axiomática (assume-se como verdadeira)
- Overrides tudo abaixo
- Imutável durante implementação

**Exemplos:**
- "Diana roda nativamente, não em Docker"
- "Custo máximo por task: $0.01"
- "5 axiomas são fundação"

**Resposta do Sistema:**
- ✓ Aceita sem questionar
- Valida apenas coerência com axiomas existentes
- Propaga para toda arquitetura

**Escalação:** Nenhuma (é o topo)

---

### Nível 2: Axiomas (ONTOLÓGICO)

**Definição:** Princípios inegociáveis derivados das decisões do Criador que estruturam toda lógica.

**Características:**
- Validam todas as decisões inferiores
- Imutáveis (só versionadas)
- Formam base coerente (sem contradições)
- Públicos e documentados

**Exemplos:**
```
Axioma 1: Primado do Criador
Axioma 2: Coerência Interna
Axioma 3: Transparência Total
Axioma 4: Evolução Controlada
Axioma 5: Realidade é Autoridade
```

**Resposta do Sistema:**
- ✓ Rejeita qualquer coisa que viole
- Escalada se houver conflito detectado
- Logs rastreiam validação

**Escalação:** Se contradição detectada → Criador

---

### Nível 3: Fatos de Negócio (ESTRATÉGICO)

**Definição:** Informações sobre o negócio (missão, arquitetura, modelo de custo) que refletem implementação dos axiomas.

**Características:**
- Derivados dos axiomas
- Evoluem, mas com aprovação
- Rastreáveis até axiomas
- Implementados em WikiLocal

**Exemplos:**
- Missão: "Diana é AIOS cognitivo"
- Arquitetura: "100% nativa, sem Docker"
- Custo: "$0 operacional"
- Trading: "Mycelium com 25 agentes"

**Resposta do Sistema:**
- ✓ Implementa se válido contra axiomas
- ✗ Escalada se contradiz axioma
- Novo Fato requer aprovação Criador

**Escalação:** Se conflito com axiomas → Criador

---

### Nível 4: Decisões Operacionais (TÁTICO)

**Definição:** Decisões do squad/agente para execução dentro dos constrangimentos estratégicos.

**Características:**
- Devem ser coerentes com Fatos de Negócio
- Tomadas por liderança do squad
- Reversíveis (podem ser alteradas)
- Registradas em stories

**Exemplos:**
- "Qual porta usar? 21340 (conforme policy)"
- "Qual modelo LLM? Trinity (conforme custo fact)"
- "Qual estratégia usar? SpotRotative (conforme trading fact)"

**Resposta do Sistema:**
- ✓ Implementa se conforme Fatos
- ✗ Escalada se viola constrangimentos
- Logging automático

**Escalação:** Se viola Fatos → Squad Lead → Criador

---

### Nível 5: Ações Específicas (EXECUTIVO)

**Definição:** Implementação detalhada de decisões operacionais por agentes.

**Características:**
- Automáticas dentro de regras
- Não requerem aprovação se conforme
- Altamente reversíveis
- Registradas em logs

**Exemplos:**
- Deploying código em feature branch
- Rodando testes
- Gerando relatórios
- Salvando dados em cache

**Resposta do Sistema:**
- ✓ Executa se tudo conforme
- ✗ Pausa se detecta violação
- Logging detalhado

**Escalação:** Se erro → Squad Lead

---

## Processo de Escalação

```
Ação Específica (Agente)
    ↓ [ERROR ou VIOLAÇÃO?]
Decisão Operacional (Squad Lead)
    ↓ [Viola Fato de Negócio?]
Fatos de Negócio (WikiLocal)
    ↓ [Contradiz Axioma?]
Axiomas (Validador)
    ↓ [Rejeita?]
CRIADOR (Decisão Final)
```

### Protocolo de Escalação

1. **Detecção:** Sistema detecta violação em qualquer nível
2. **Rastreamento:** Log detalhado de onde/por quê
3. **Contexto:** Incluir axioma/fato/regra violada
4. **Proposta:** Sugerir 2-3 resoluções
5. **Aguardar:** Criador decide

---

## Exemplos de Aplicação

### Cenário 1: Novo Fato Proposto

```
Proposta: "Usar Docker para deployments"

Validação:
  ✗ Viola Fato: DIANA_ARCHITECTURE ("100% nativa")
  ✗ Viola Axioma 5: "Realidade é Autoridade"
     (Docker adiciona overhead real)

Resultado: REJEITAR
Escalação: Informar propositor
```

### Cenário 2: Criador Muda Decisão

```
Criador: "Aumenta orçamento para $100/task"

Validação:
  ✓ Autoridade suprema do Criador
  ✓ Não contradiz axiomas
  ✓ Afeta Fato: DIANA_COST_MODEL

Resultado: ACEITAR
Ação: Atualizar WikiLocal + propagação
```

### Cenário 3: Agente Detecta Conflito

```
Agent Zero: "Batch paralelo viabiliza mais tasks"

Validação:
  ✓ Alinhado com Axioma 5 (Realidade)
  ✓ Alinhado com Fato: DIANA_COST_MODEL
  ✓ Coerente com Axioma 2 (Coerência)

Resultado: ACEITAR
Ação: Implementar otimização
```

---

## Integração com Sistema de Prompts

O sistema de prompts injeta hierarquia em cada agente:

```javascript
// Injetado no SYSTEM_PROMPT de todo agente
const DECISION_HIERARCHY = {
  level1: "Criador > Tudo",
  level2: "Axiomas (imutáveis, validar sempre)",
  level3: "Fatos de Negócio (em WikiLocal)",
  level4: "Decisões Operacionais (conforme Fatos)",
  level5: "Ações Específicas (conforme Operacional)"
}
```

---

## Validação Automática

O `ConsistencyValidator` implementa esta hierarquia:

```typescript
// Pseudo-código
if (decision.violatesAxioms()) {
  escalate('CRIADOR', {
    level: 'AXIOMA',
    decision,
    violatedAxiom: detected
  })
} else if (decision.violatesBusinessFacts()) {
  escalate('SQUAD_LEAD', {
    level: 'FATO',
    decision,
    violatedFact: detected
  })
} else {
  approve(decision)
}
```

---

## Documento Relacionado

- `axioms.md` - Axiomas imutáveis
- `business-facts.md` - WikiLocal (Fatos)
- `consistency-validator.ts` - Implementação
- `.aios-core/system-prompt.md` - Injeção de contexto

---

**Status:** ✓ Hierarquia implementada e validável
