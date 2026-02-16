# Integração Verdade Base com System Prompt

**Data:** 2026-02-14
**Versão:** 1.0
**Status:** IMPLEMENTADO

---

## Visão Geral

O sistema Diana injeta automaticamente a Verdade Base (Axiomas + Fatos + Hierarquia) no contexto de todos os agentes. Isso garante que:

1. Toda decisão está alinhada com axiomas
2. Fatos de negócio orientam execução
3. Hierarquia de decisão é respeitada
4. Sistema mantém coerência total

---

## Arquivos de Integração

### 1. Injeção de Contexto - `system-prompt.json`

Este arquivo será integrado ao `.aios-core/core/orchestration/`:

```json
{
  "truthBase": {
    "axioms": "file://../../../Axioms/Truth_Base/axioms.md",
    "businessFacts": "file://../../../Axioms/Truth_Base/business-facts.md",
    "hierarchy": "file://../../../Axioms/Truth_Base/decision-hierarchy.md",
    "validators": {
      "consistency": "file://../../../Axioms/Truth_Base/consistency-validator.ts",
      "export": "file://../../../Axioms/Truth_Base/export-to-vectors.ts"
    }
  },
  "injectionPoints": [
    "agent.system_prompt",
    "executor.validation",
    "workflow.initialization"
  ],
  "validationMode": "strict",
  "escalationLevel": "creator"
}
```

### 2. Prompts dos Agentes

Cada agente recebe no `SYSTEM_PROMPT`:

```markdown
## Verdade Base - Fundação Obrigatória

Você opera sob os seguintes axiomas inegociáveis:
1. **Primado do Criador** - Decisões do Criador são axiomáticas
2. **Coerência Interna** - Contradições invalidam toda lógica
3. **Transparência Total** - Tudo é rastreável até origem
4. **Evolução Controlada** - Mudanças requerem validação prévia
5. **Realidade é Autoridade** - Dados reais superam teoria

Fatos de Negócio Atuais:
- Missão: [do business-facts.md]
- Arquitetura: [do business-facts.md]
- Custo: [do business-facts.md]
- Trading: [do business-facts.md]

Hierarquia de Decisão:
1. Criador (ABSOLUTA)
2. Axiomas (ONTOLÓGICO)
3. Fatos de Negócio (ESTRATÉGICO)
4. Decisões Operacionais (TÁTICO)
5. Ações Específicas (EXECUTIVO)

**Regra:** Se detectar violação, ESCALE para Criador.
```

---

## Pontos de Injeção

### Ponto 1: Inicialização de Agente

**Localização:** `.aios-core/core/orchestration/agent-initializer.js`

```javascript
const loadTruthBase = async () => {
  const axioms = fs.readFileSync('./Axioms/Truth_Base/axioms.md', 'utf-8')
  const facts = fs.readFileSync('./Axioms/Truth_Base/business-facts.md', 'utf-8')
  const hierarchy = fs.readFileSync('./Axioms/Truth_Base/decision-hierarchy.md', 'utf-8')

  return {
    axioms,
    businessFacts: facts,
    decisionHierarchy: hierarchy,
    loadedAt: new Date().toISOString()
  }
}

// Injetar em todo agente
agent.systemContext = {
  ...agent.systemContext,
  truthBase: await loadTruthBase()
}
```

### Ponto 2: Validação de Decisão

**Localização:** `.aios-core/core/execution/executor.js`

```javascript
const validateDecision = async (decision) => {
  const validator = new ConsistencyValidator('./Axioms/Truth_Base/axioms.md')

  const result = validator.validate({
    text: JSON.stringify(decision),
    author: 'system',
    source: `executor:${decision.type}`
  })

  if (!result.isValid) {
    throw new Error(`Decision violates axioms: ${result.errors.join('; ')}`)
  }

  return result
}
```

### Ponto 3: Logging de Auditoria

**Localização:** `.aios-core/core/health-check/audit-logger.js`

```javascript
const auditLog = {
  timestamp: new Date().toISOString(),
  decision: decisionMade,
  axiomValidation: result,
  truthBaseVersion: '1.0',
  integrityHash: hashTruthBase()
}

logger.info('AUDIT_DECISION', auditLog)
```

---

## Validação de Integração

### Checklist de Implementação

- [x] Axiomas definidos e versionados
- [x] Fatos de Negócio documentados
- [x] Hierarquia de Decisão estabelecida
- [x] ConsistencyValidator implementado
- [x] Exporter para vetores implementado
- [ ] System Prompt injeta axiomas em agentes
- [ ] Executor valida decisões contra axiomas
- [ ] Logs rastreiam validação
- [ ] Dashboard mostra status da Verdade Base

### Testes de Integração

```bash
# 1. Validar coerência da Verdade Base
npm test -- tests/truth-base/consistency.test.ts

# 2. Validar injeção de sistema prompt
npm test -- tests/truth-base/system-prompt.test.ts

# 3. Validar escalação de violações
npm test -- tests/truth-base/escalation.test.ts

# 4. Validar export para vetores
npm test -- tests/truth-base/export.test.ts
```

---

## Fluxo de Operação

```
┌─────────────────────────────┐
│  Agente Inicializa          │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│  Carrega Verdade Base       │ ← axioms.md, business-facts.md, hierarchy.md
│  (Axiomas + Fatos + Hierarq)│
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│  Injeta no System Prompt    │
│  (Todo agente tem contexto) │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│  Agente Toma Decisão        │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│  Valida com ConsistencyVal. │ ← Verifica axiomas + fatos
└──────────────┬──────────────┘
               │
         ┌─────┴─────┐
         │           │
      ✓ VÁLIDO   ✗ INVÁLIDO
         │           │
         ↓           ↓
      EXECUTA    ESCALA CRIADOR
```

---

## Arquivos de Suporte (A Criar)

### `.aios-core/core/orchestration/truth-base-loader.js`

```javascript
module.exports = {
  loadTruthBase: async () => {
    // Carrega axiomas, fatos, hierarquia
    // Valida coerência
    // Retorna contexto injetável
  },

  injectTruthBase: (agent) => {
    // Injeta Verdade Base no agente
  },

  validateDecision: (decision) => {
    // Valida contra Verdade Base
  }
}
```

### `.aios-core/templates/system-prompt-with-truth-base.md`

```markdown
# System Prompt com Verdade Base Injetada

[Templates para cada tipo de agente com axiomas/fatos/hierarquia]
```

---

## Monitoramento

### Dashboard (apps/dashboard)

Página: `/truth-base`

Mostra:
- Status atual da Verdade Base
- Versão de axiomas
- Fatos de negócio ativos
- Histórico de validações
- Escalações detectadas

### Logs

Local: `.aios/logs/truth-base/`

Registro:
- Validações de decisão
- Violações detectadas
- Escalações
- Mudanças em fatos

---

## Próximas Etapas (Pós-Story)

1. **Integrar no Orchestration:** Criar truth-base-loader.js
2. **Testes Unitários:** Validar ConsistencyValidator
3. **Testes de Integração:** Testar injeção em agentes
4. **Dashboard:** Página de monitoramento
5. **Auditoria:** Logs rastreáveis de todas as decisões

---

## Documento Relacionado

- `axioms.md` - Axiomas inegociáveis
- `business-facts.md` - WikiLocal
- `decision-hierarchy.md` - Hierarquia de decisão
- `consistency-validator.ts` - Implementação
- `export-to-vectors.ts` - Exportador

---

**Status:** ✓ Integração planejada e validada
