# ✅ Checklist de Compliance para Bots e Backtests

**Domínio:** BET-SPORTS  
**Versão:** 1.0.0  
**Data:** 2026-02-17  
**Status:** `APPROVED`  
**Autor:** strategy-sports  
**Aplicação:** TODOS os bots de trading e backtests do domínio BET-SPORTS

---

## ⚠️ PRINCÍPIO FUNDAMENTAL

> **ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.**
>
> Este checklist DEVE ser seguido por TODO bot/backtest antes de entrar em produção.

---

## 📋 Checklist de Validação

### 1. Separação Arquitetural

#### 1.1 Estratégia Carregada Sem Parâmetros de Gestão

- [ ] **1.1.1** A estratégia é carregada como módulo de lógica pura
- [ ] **1.1.2** A estratégia NÃO contém valores de stake (%, fixos, Kelly)
- [ ] **1.1.3** A estratégia NÃO contém limites de bankroll
- [ ] **1.1.4** A estratégia NÃO contém circuit breakers financeiros
- [ ] **1.1.5** A estratégia NÃO contém metas de ROI/Win Rate

**Como validar:**

```bash
# Script de validação automática
$ npm run validate:strategy:purity {strategy-id}

# Output esperado:
✅ No stake parameters found in strategy
✅ No bankroll limits found in strategy
✅ No circuit breakers found in strategy
✅ Strategy is PURE (logic only)
```

**Critério de Aceite:**
- Estratégia contém APENAS: triggers, regras de entrada/saída, schema de dados
- Estratégia NÃO contém: stake, limits, circuit breakers, ROI targets

---

#### 1.2 Config de Gestão Injetada Separadamente

- [ ] **1.2.1** Configuração de gestão é carregada de arquivo separado (YAML/JSON)
- [ ] **1.2.2** Config é injetada via dependência (constructor/initializer)
- [ ] **1.2.3** Config contém método de staking (percentage, kelly, fixed)
- [ ] **1.2.4** Config contém limites de exposição (per_match, per_day)
- [ ] **1.2.5** Config contém circuit breakers (daily loss stop, etc.)
- [ ] **1.2.6** Config NÃO contém lógica de trigger
- [ ] **1.2.7** Config NÃO contém regras de entrada/saída

**Como validar:**

```bash
# Script de validação automática
$ npm run validate:config:separation {strategy-id}

# Output esperado:
✅ Config loaded from separate file
✅ Config injected via dependency
✅ No trigger logic in config
✅ Config is CLEAN (params only)
```

**Critério de Aceite:**
- Config contém APENAS: parâmetros matemáticos de alocação de risco
- Config NÃO contém: triggers, regras de entrada, schema de dados

---

### 2. Validação de Schema

#### 2.1 Schema da Estratégia Validado

- [ ] **2.1.1** Schema JSON da estratégia existe (`schemas/strategy.schema.json`)
- [ ] **2.1.2** Estratégia valida contra o schema
- [ ] **2.1.3** Todos os campos obrigatórios estão presentes
- [ ] **2.1.4** Tipos de dados estão corretos
- [ ] **2.1.5** Enums estão dentro dos valores permitidos

**Como validar:**

```bash
# Validação de schema
$ npm run validate:schema:strategy {strategy-id}

# Output esperado:
✅ Schema file exists
✅ Strategy validates against schema
✅ All required fields present
✅ Data types correct
✅ Enums valid
```

---

#### 2.2 Schema da Gestão Validado

- [ ] **2.2.1** Schema JSON da gestão existe (`schemas/management.schema.json`)
- [ ] **2.2.2** Config valida contra o schema
- [ ] **2.2.3** Todos os campos obrigatórios estão presentes
- [ ] **2.2.4** Tipos de dados estão corretos
- [ ] **2.2.5** Ranges de valores estão dentro dos limites

**Como validar:**

```bash
# Validação de schema
$ npm run validate:schema:management {strategy-id}

# Output esperado:
✅ Schema file exists
✅ Config validates against schema
✅ All required fields present
✅ Data types correct
✅ Value ranges valid
```

---

### 3. Logs e Telemetria

#### 3.1 Logs Separam Lógica de Gestão

- [ ] **3.1.1** Logs de trigger são categorizados como `STRATEGY`
- [ ] **3.1.2** Logs de stake são categorizados como `MANAGEMENT`
- [ ] **3.1.3** Logs de limites são categorizados como `MANAGEMENT`
- [ ] **3.1.4** Logs de circuit breaker são categorizados como `MANAGEMENT`
- [ ] **3.1.5** Logs de execução são categorizados como `EXECUTION`

**Exemplo de log correto:**

```typescript
// ✅ CORRETO: Logs separados por camada
logger.info('Trigger ativado', {
  signalId: '123',
  layer: 'STRATEGY',  // ← Categoria correta
});

logger.info('Stake calculada', {
  signalId: '123',
  stake: 100,
  method: 'percentage',
  layer: 'MANAGEMENT',  // ← Categoria correta
});

logger.info('Aposta executada', {
  betId: '456',
  layer: 'EXECUTION',  // ← Categoria correta
});
```

**Exemplo de log incorreto:**

```typescript
// ❌ ERRADO: Camadas misturadas
logger.info('Entrada com stake de 100', {
  // Mistura lógica (entrada) com gestão (stake)
});
```

---

#### 3.2 Métricas Reportadas por Camada

- [ ] **3.2.1** Métricas de estratégia incluem: triggerRate, entryRate, winRate
- [ ] **3.2.2** Métricas de gestão incluem: ROI, Sharpe, MaxDrawdown
- [ ] **3.2.3** Métricas são reportadas separadamente no dashboard
- [ ] **3.2.4** Alertas são categorizados por camada

**Exemplo de relatório correto:**

```typescript
// ✅ CORRETO: Métricas separadas
const report = {
  strategyMetrics: {
    triggerRate: 0.25,
    entryRate: 0.80,
    winRate: 0.55,
    averageOdds: 2.10,
  },
  managementMetrics: {
    roi: 12.5,
    sharpeRatio: 1.5,
    maxDrawdown: 8.3,
    profitFactor: 1.8,
  },
};
```

---

### 4. Versionamento

#### 4.1 Versionamento Correto (Estratégia + Config)

- [ ] **4.1.1** Estratégia tem versão SemVer (`v1.0.0`)
- [ ] **4.1.2** Config tem versão SemVer (`cfg-1.0.0`)
- [ ] **4.1.3** Versões são registradas em cada signal/execução
- [ ] **4.1.4** Changelog é atualizado para mudanças
- [ ] **4.1.5** Matriz de compatibilidade é verificada

**Como validar:**

```bash
# Validação de versionamento
$ npm run validate:versioning {strategy-id}

# Output esperado:
✅ Strategy version: v1.0.0 (SemVer compliant)
✅ Config version: cfg-1.0.0 (SemVer compliant)
✅ Versions registered in signals
✅ Changelog updated
✅ Compatibility matrix valid
```

**Matriz de Compatibilidade:**

| Estratégia | Config | Compatível? | Ação |
|------------|--------|-------------|------|
| v1.x.x | cfg-1.x.x | ✅ Sim | Usar |
| v2.x.x | cfg-1.x.x | ⚠️ Validar | Testar antes |
| v1.x.x | cfg-2.x.x | ⚠️ Validar | Testar antes |
| v2.x.x | cfg-2.x.x | ✅ Sim (se testado) | Usar |

---

### 5. Validação de Integração

#### 5.1 Bot/Backtest Segue Fluxo Correto

- [ ] **5.1.1** Fase 1: Estratégia avalia evento (lógica pura)
- [ ] **5.1.2** Fase 2: Gestão calcula stake (parâmetros injetados)
- [ ] **5.1.3** Fase 3: Validação de limites (exposure, circuit breakers)
- [ ] **5.1.4** Fase 4: Execução (bet placement)
- [ ] **5.1.5** Fase 5: Settlement e reporting (métricas separadas)

**Fluxo correto:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO CORRETO                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Strategy.evaluate(event) → Signal                      │
│     (Lógica pura, SEM gestão)                              │
│                                                             │
│  2. Management.calculateStake(signal, bankroll)            │
│     (Parâmetros injetados)                                 │
│                                                             │
│  3. RiskValidator.checkLimits(stake, exposure)             │
│     (Limites de gestão)                                    │
│                                                             │
│  4. BetExecutor.place(signal, stake, odds)                 │
│     (Execução)                                             │
│                                                             │
│  5. Analytics.record(result)                               │
│     (Métricas separadas: strategy + management)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Validação de Backtest

#### 6.1 Backtest Separa Fases

- [ ] **6.1.1** FASE 1: Backtest de lógica (estratégia pura)
- [ ] **6.1.2** FASE 2: Otimização de gestão (parâmetros)
- [ ] **6.1.3** FASE 3: Validação cruzada (out-of-sample)
- [ ] **6.1.4** Métricas de lógica reportadas separadamente
- [ ] **6.1.5** Métricas de gestão reportadas separadamente
- [ ] **6.1.6** Overfitting é detectado (degradação > 50%)

**Como validar:**

```bash
# Validação de backtest
$ npm run validate:backtest {strategy-id}

# Output esperado:
✅ Phase 1: Logic backtest completed
✅ Phase 2: Management optimization completed
✅ Phase 3: Out-of-sample validation completed
✅ Metrics separated by layer
✅ Overfitting check passed (degradation < 50%)
```

---

## 📊 Resumo do Checklist

### Checklist Rápido (Pré-Deploy)

```
[ ] 1.1 Estratégia carregada sem parâmetros de gestão
[ ] 1.2 Config de gestão injetada separadamente
[ ] 2.1 Schema da estratégia validado
[ ] 2.2 Schema da gestão validado
[ ] 3.1 Logs separam lógica de gestão
[ ] 3.2 Métricas reportadas por camada
[ ] 4.1 Versionamento correto (estratégia + config)
[ ] 5.1 Bot segue fluxo correto
[ ] 6.1 Backtest separa fases
```

### Critério de Aprovação

- **Todos os itens** devem estar marcados como `[x]`
- **Nenhum item** pode estar marcado como `[ ]` ou `[-]`
- Validações automáticas devem passar sem erros

---

## 🔧 Scripts de Validação Automática

### Validação Completa

```bash
# Validação completa de uma estratégia
$ npm run validate:all {strategy-id}

# Executa:
# 1. validate:strategy:purity
# 2. validate:config:separation
# 3. validate:schema:strategy
# 4. validate:schema:management
# 5. validate:versioning
# 6. validate:backtest
```

### Validação Individual

```bash
# Validação de pureza da estratégia
$ npm run validate:strategy:purity {strategy-id}

# Validação de separação da config
$ npm run validate:config:separation {strategy-id}

# Validação de schema
$ npm run validate:schema:strategy {strategy-id}
$ npm run validate:schema:management {strategy-id}

# Validação de versionamento
$ npm run validate:versioning {strategy-id}

# Validação de backtest
$ npm run validate:backtest {strategy-id}
```

---

## 📝 Exemplo de Relatório de Compliance

```yaml
# compliance-report.yaml

strategyId: TENNIS_FAV_30_0_COMEBACK
strategyVersion: v1.0.0
configVersion: cfg-1.0.0
timestamp: 2026-02-17T10:00:00Z

checks:
  separation:
    strategyPure: true
    configClean: true
    injectionCorrect: true

  schemas:
    strategySchemaValid: true
    managementSchemaValid: true

  logs:
    layersSeparated: true
    metricsSeparated: true

  versioning:
    strategySemVer: true
    configSemVer: true
    changelogUpdated: true

  integration:
    flowCorrect: true
    phasesSeparated: true

  backtest:
    phase1Completed: true
    phase2Completed: true
    phase3Completed: true
    overfittingDetected: false

overall:
  passed: true
  score: 100%
  readyForProduction: true
```

---

## 🔗 Referências

### Documentos Relacionados

- [PROTOCOLS.md](../PROTOCOLS.md) - Protocolos formais
- [DATA_FLOW.md](../strategy/DATA_FLOW.md) - Fluxo de dados
- [ARCHITECTURE.md](../strategy/ARCHITECTURE.md) - Arquitetura de separação

### Implementações de Exemplo

- [Bot Implementation](../examples/bot-implementation.ts)
- [Backtest Implementation](../examples/backtest-implementation.ts)

### Tipos e Schemas

- [Strategy Types](../types/strategy.types.ts)
- [Strategy Schema](../schemas/strategy.schema.json)
- [Management Schema](../schemas/management.schema.json)

---

**Status:** `APPROVED`  
**Próxima revisão:** Conforme novas estratégias forem implementadas  
**Responsável:** @strategy-lead

---

*Este checklist é OBRIGATÓRIO para todos os bots e backtests do domínio BET-SPORTS.*
