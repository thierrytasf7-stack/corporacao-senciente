# 📋 Protocolos Formais do Domínio BET-SPORTS

**Domínio:** BET-SPORTS  
**Versão:** 1.0.0  
**Data:** 2026-02-17  
**Status:** `APPROVED`  
**Autor:** strategy-sports  
**Aplicação:** TODAS as estratégias do domínio BET-SPORTS

---

## ⚠️ PRINCÍPIO FUNDAMENTAL

> **ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.**
>
> Bots e backtests DEVEM tratar essas camadas de forma isolada.
>
> - **Estratégia** define **O QUE** fazer (lógica de entrada/saída)
> - **Gestão** define **QUANTO** arriscar (parâmetros matemáticos)
>
> **Esta separação é OBRIGATÓRIA para todas as estratégias BET-SPORTS.**

---

## 📑 Índice

1. [Protocolo de Separação Arquitetural](#1-protocolo-de-separação-arquitetural)
2. [Protocolo para Bots de Trading](#2-protocolo-para-bots-de-trading)
3. [Protocolo para Backtesting](#3-protocolo-para-backtesting)
4. [Protocolo de Versionamento](#4-protocolo-de-versionamento)
5. [Protocolo de Validação](#5-protocolo-de-validação)
6. [Template de Nova Estratégia](#6-template-de-nova-estratégia)

---

## 1. Protocolo de Separação Arquitetural

### 1.1 Definição Formal

```
ESTRATÉGIA (WHAT) ≠ GESTÃO (HOW MUCH)
```

| Camada | Responsabilidade | Natureza | Mutabilidade |
|--------|------------------|----------|--------------|
| **Estratégia** | Lógica de identificação de oportunidades | Específica | IMUTÁVEL |
| **Gestão** | Parâmetros de alocação de capital | Transversal | CONFIGURÁVEL |

### 1.2 Por Que Separar?

#### 1.2.1 Reusabilidade

A mesma lógica de estratégia pode ser operada com diferentes perfis de risco:

```
Estratégia: TENNIS_FAV_30_0_COMEBACK
    │
    ├── Perfil Conservador → Stake 0.5%, Stop 3%
    ├── Perfil Moderado    → Stake 1.0%, Stop 5%
    └── Perfil Agressivo   → Kelly 0.25, Stop 7%
```

#### 1.2.2 Manutenibilidade

Mudanças na gestão **NÃO** requerem mudanças na lógica:

```yaml
# ❌ ANTES (Errado): Misturado
strategy.md:
  stake_percent: 1.0  # Lógica + gestão misturadas

# ✅ DEPOIS (Correto): Separado
strategy.md:              # Lógica pura (imutável)
config.yaml:
  stake_percent: 1.5      # Gestão (fácil de ajustar)
```

#### 1.2.3 Testabilidade

```
Teste de Lógica (Estratégia):
  - Trigger detecta corretamente?
  - Regras de exclusão funcionam?
  - Schema de dados está correto?

Teste de Gestão (Configuração):
  - Qual stake ótima?
  - Quais limites de drawdown?
  - Qual perfil de risco?
```

#### 1.2.4 Composabilidade

Múltiplas estratégias compartilham a mesma camada de gestão:

```
┌──────────────────────────────────────────────────────┐
│              CAMADA DE GESTÃO ÚNICA                 │
│  - Bankroll management                              │
│  - Risk limits                                      │
│  - Circuit breakers                                 │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   Estratégia   Estratégia   Estratégia
   Tennis       Futebol      Basquete
```

### 1.3 Benefícios Arquiteturais

| Benefício | Descrição | Impacto |
|-----------|-----------|---------|
| **Isolamento** | Mudanças em uma camada não afetam a outra | Reduz bugs |
| **Testabilidade** | Cada camada pode ser testada isoladamente | Melhor qualidade |
| **Reusabilidade** | Gestão única para múltiplas estratégias | Menos duplicação |
| **Auditabilidade** | Rastreabilidade clara de decisões | Compliance |
| **Escalabilidade** | Novas estratégias usam gestão existente | Velocidade |

### 1.4 Regras de Compliance

#### 1.4.1 Regras para Estratégia Pura

**DEVE CONTER:**
- ✅ Descrição da hipótese
- ✅ Regras de trigger (pseudocódigo)
- ✅ Condições de entrada
- ✅ Condições de saída
- ✅ Mercado e seleção
- ✅ Schema de dados
- ✅ Integrações técnicas
- ✅ Lógica de exclusão

**NÃO DEVE CONTER:**
- ❌ Valores de stake (%, fixos, Kelly)
- ❌ Parâmetros de bankroll
- ❌ Metas de ROI/Win Rate
- ❌ Limites de perda diária/semanal
- ❌ Circuit breakers financeiros
- ❌ Métricas de performance esperada

#### 1.4.2 Regras para Configuração de Gestão

**DEVE CONTER:**
- ✅ Métodos de staking (percentage, kelly, fixed)
- ✅ Valores de stake (% ou fixo)
- ✅ Limites de exposição (por partida, dia, semana)
- ✅ Circuit breakers (stop loss, consecutive losses)
- ✅ Alocação de bankroll (active, reserve, emergency)
- ✅ Perfis de risco (conservador, moderado, agressivo)
- ✅ Fases de operação (validation, standard, full)
- ✅ Alertas e monitoramento

**NÃO DEVE CONTER:**
- ❌ Lógica de trigger
- ❌ Regras de entrada/saída
- ❌ Schema de dados
- ❌ Integrações técnicas

#### 1.4.3 Validação de Compliance

```bash
# Script de validação (exemplo)
$ npm run validate:strategy tennis-favorite-30-0-comeback

# Output esperado:
✅ Strategy: No management parameters found
✅ Config: No trigger logic found
✅ Separation: COMPLIANT
```

---

## 2. Protocolo para Bots de Trading

### 2.1 Como Bots Devem Consumir Estratégias

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DO BOT                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Carregar estratégia (lógica pura)                      │
│         │                                                   │
│  2. Carregar configuração de gestão (injetável)            │
│         │                                                   │
│  3. Validar schemas (estratégia + gestão)                  │
│         │                                                   │
│  4. Monitorar eventos (live score, odds)                   │
│         │                                                   │
│  5. Executar lógica da estratégia (trigger)                │
│         │                                                   │
│  6. Aplicar gestão (calcular stake, validar limites)       │
│         │                                                   │
│  7. Executar aposta (bet placement)                        │
│         │                                                   │
│  8. Reportar resultados (separar lógica vs gestão)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Como Injetar Configuração de Gestão

```typescript
// ✅ CORRETO: Injeção de dependência
class TradingBot {
  constructor(
    private strategy: Strategy,      // Lógica pura
    private config: ManagementConfig // Gestão injetável
  ) {}

  async onMarketEvent(event: MarketEvent) {
    // 1. Executar lógica da estratégia
    const signal = await this.strategy.evaluate(event);

    if (!signal) return;

    // 2. Aplicar gestão
    const stake = this.calculateStake(signal);
    const withinLimits = this.checkLimits(signal);

    if (!withinLimits) return;

    // 3. Executar
    await this.executeBet(signal, stake);
  }

  private calculateStake(signal: Signal): number {
    // Usa config de gestão, NÃO estratégia
    switch (this.config.staking.method) {
      case 'percentage':
        return this.bankroll * (this.config.staking.value / 100);
      case 'kelly':
        return this.calculateKelly(signal);
      case 'fixed':
        return this.config.staking.value;
    }
  }
}
```

```typescript
// ❌ ERRADO: Estratégia com gestão embutida
class TradingBot {
  async onMarketEvent(event: MarketEvent) {
    const signal = await this.strategy.evaluate(event);

    // ❌ Estratégia NÃO deve saber de stake
    if (signal && signal.stake > 0) {
      await this.executeBet(signal);
    }
  }
}
```

### 2.3 Schema de Entrada/Saída Padronizado

#### Entrada do Bot

```typescript
interface BotInput {
  // Estratégia (lógica)
  strategy: {
    id: string;
    version: string;
    logic: StrategyLogic;  // Pseudocódigo compilado
  };

  // Gestão (config injetável)
  management: {
    configId: string;
    version: string;
    params: ManagementParams;
  };

  // Contexto
  context: {
    bankroll: number;
    openExposure: number;
    dailyPnL: number;
    consecutiveLosses: number;
  };

  // Evento de mercado
  event: MarketEvent;
}
```

#### Saída do Bot

```typescript
interface BotOutput {
  // Decisão
  decision: 'BET' | 'NO_BET';
  reason?: string;

  // Se BET
  bet?: {
    signal: StrategySignal;      // Da estratégia
    stake: number;               // Da gestão
    odds: number;
    expectedValue: number;
  };

  // Logs separados
  logs: {
    strategy: StrategyLog[];     // Lógica
    management: ManagementLog[]; // Gestão
  };

  // Métricas separadas
  metrics: {
    strategy: StrategyMetrics;   // Trigger rate, etc.
    management: ManagementMetrics; // ROI, drawdown, etc.
  };
}
```

### 2.4 Exemplo de Implementação

Ver: [`examples/bot-implementation.ts`](./examples/bot-implementation.ts)

---

## 3. Protocolo para Backtesting

### 3.1 Backtest da ESTRATÉGIA (Lógica Pura)

**Objetivo:** Validar se a lógica de trigger funciona corretamente.

```typescript
interface StrategyBacktest {
  // Input
  strategy: StrategyLogic;
  historicalData: HistoricalData[];

  // Processamento (lógica pura, SEM gestão)
  results: {
    triggers: number;        // Quantos triggers foram ativados
    entries: number;         // Quantas entradas válidas
    wins: number;            // Quantos wins
    losses: number;          // Quantos losses

    // Métricas de lógica
    triggerRate: number;     // triggers / oportunidades
    entryRate: number;       // entries / triggers
    winRate: number;         // wins / total
  };

  // Validações de lógica
  validations: {
    triggerAccuracy: boolean;
    exclusionRulesWork: boolean;
    schemaIsValid: boolean;
  };
}
```

### 3.2 Otimização de GESTÃO (Parâmetros)

**Objetivo:** Encontrar os melhores parâmetros de gestão para a estratégia validada.

```typescript
interface ManagementOptimization {
  // Input
  strategyResults: StrategyBacktestResults;
  paramRanges: {
    stakePercent: [0.25, 2.0];
    stopLoss: [3.0, 10.0];
    maxExposure: [5.0, 20.0];
  };

  // Processamento (otimização)
  optimization: {
    algorithm: 'grid-search' | 'bayesian' | 'genetic';
    objective: 'sharpe-ratio' | 'roi' | 'calmar';
  };

  // Output
  optimalParams: {
    stakePercent: number;
    stopLoss: number;
    maxExposure: number;
  };

  // Métricas de gestão
  metrics: {
    roi: number;
    sharpeRatio: number;
    maxDrawdown: number;
    calmarRatio: number;
  };
}
```

### 3.3 Separação de Responsabilidades no Teste

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUXO DE BACKTESTING                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FASE 1: Backtest da Lógica                                │
│  ─────────────────────────────                              │
│  Input: Estratégia + Dados Históricos                      │
│  Process: Executar triggers, validar entradas              │
│  Output: Trigger rate, entry rate, win rate                │
│  Critério: Lógica funciona?                                │
│                                                             │
│  FASE 2: Otimização de Gestão                              │
│  ───────────────────────────────                           │
│  Input: Resultados Fase 1 + Ranges de Parâmetros           │
│  Process: Grid search / Bayesian optimization              │
│  Output: Parâmetros ótimos de stake, stop, exposure        │
│  Critério: Sharpe/ROI máximo com drawdown aceitável        │
│                                                             │
│  FASE 3: Validação Cruzada                                 │
│  ──────────────────────────────                            │
│  Input: Parâmetros ótimos + Dados out-of-sample            │
│  Process: Validar se parâmetros generalizam                │
│  Output: Métricas de validação                             │
│  Critério: Sem overfitting                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Métricas que Cada Camada Reporta

#### Estratégia (Lógica)

| Métrica | Descrição | Fórmula |
|---------|-----------|---------|
| **Trigger Rate** | Frequência de triggers | triggers / oportunidades |
| **Entry Rate** | Conversão trigger→entrada | entradas / triggers |
| **Fill Rate** | Execução de signals | bets executadas / signals |
| **Win Rate** | Taxa de acerto | wins / total bets |
| **Avg Odds** | Odd média das entradas | soma odds / n |

#### Gestão (Parâmetros)

| Métrica | Descrição | Fórmula |
|---------|-----------|---------|
| **ROI** | Retorno sobre investimento | (profit / stake) × 100 |
| **Sharpe Ratio** | Retorno ajustado ao risco | (return - riskfree) / std |
| **Max Drawdown** | Maior perda consecutiva | pico → vale |
| **Calmar Ratio** | ROI / Max Drawdown | roi / maxdd |
| **Profit Factor** | Ganhos / Perdas | gross profit / gross loss |
| **Expectancy** | Valor esperado por bet | (win% × avg win) - (loss% × avg loss) |

---

## 4. Protocolo de Versionamento

### 4.1 Versão da Estratégia

**Formato:** `v{MAJOR}.{MINOR}.{PATCH}` (SemVer)

```
v1.0.0
│ │ │
│ │ └─ PATCH: Correções de bug na lógica (sem mudar comportamento)
│ └─── MINOR: Novas regras de trigger (compatível)
└───── MAJOR: Mudança de hipótese (breaking change)
```

**Exemplos:**

| Versão | Mudança | Tipo |
|--------|---------|------|
| `v1.0.0` → `v1.0.1` | Correção de pseudocódigo | PATCH |
| `v1.0.0` → `v1.1.0` | Nova regra de exclusão | MINOR |
| `v1.0.0` → `v2.0.0` | Mudança de hipótese | MAJOR |

### 4.2 Versão da Configuração

**Formato:** `cfg-{MAJOR}.{MINOR}.{PATCH}`

```
cfg-1.0.0
│   │ │ │
│   │ │ └─ PATCH: Ajuste de valor (ex: stake 1.0 → 1.25)
│   │ └─── MINOR: Novo perfil de risco
│   └───── MAJOR: Mudança de método (ex: percentage → kelly)
```

**Exemplos:**

| Versão | Mudança | Tipo |
|--------|---------|------|
| `cfg-1.0.0` → `cfg-1.0.1` | Stake 1.0% → 1.25% | PATCH |
| `cfg-1.0.0` → `cfg-1.1.0` | Adicionar perfil conservador | MINOR |
| `cfg-1.0.0` → `cfg-2.0.0` | Percentage → Kelly | MAJOR |

### 4.3 Como Versionar Mudanças em Cada Camada

#### Mudança na Estratégia

```yaml
# 1. Atualizar versão no arquivo da estratégia
version: v1.1.0

# 2. Atualizar changelog
changelog:
  - version: v1.1.0
    date: 2026-02-17
    changes:
      - "Adicionar regra de exclusão por fatigue factor"

# 3. Manter versão da config (se não mudou)
config_version: cfg-1.0.0  # Inalterada
```

#### Mudança na Gestão

```yaml
# 1. Manter versão da estratégia (se não mudou)
strategy_version: v1.0.0  # Inalterada

# 2. Atualizar versão na config
version: cfg-1.1.0

# 3. Atualizar changelog da config
changelog:
  - version: cfg-1.1.0
    date: 2026-02-17
    changes:
      - "Adicionar perfil conservador para validação"
```

### 4.4 Matriz de Compatibilidade

| Estratégia | Config | Compatível? |
|------------|--------|-------------|
| v1.x.x | cfg-1.x.x | ✅ Sim |
| v2.x.x | cfg-1.x.x | ⚠️ Validar |
| v1.x.x | cfg-2.x.x | ⚠️ Validar |
| v2.x.x | cfg-2.x.x | ✅ Sim (se testado) |

---

## 5. Protocolo de Validação

### 5.1 Gate de Aprovação da Estratégia

**Responsável:** Strategy Lead + Quant Sports

| Gate | Critério | Validador | Status |
|------|----------|-----------|--------|
| **G1** | Hipótese clara e testável | Strategy Lead | ⬜ |
| **G2** | Trigger bem definido (pseudocódigo) | Strategy Dev | ⬜ |
| **G3** | Schema de dados completo | Backtest Engineer | ⬜ |
| **G4** | Regras de exclusão documentadas | Quant Sports | ⬜ |
| **G5** | Integrações técnicas viáveis | Tech Lead | ⬜ |
| **G6** | Backtest de lógica válido | Backtest Engineer | ⬜ |

**Fluxo:**

```
G1 → G2 → G3 → G4 → G5 → G6 → ✅ ESTRATÉGIA APROVADA
```

### 5.2 Gate de Aprovação da Gestão

**Responsável:** Quant Sports + Risk Manager

| Gate | Critério | Validador | Status |
|------|----------|-----------|--------|
| **G1** | Método de staking definido | Quant Sports | ⬜ |
| **G2** | Limites de exposição configurados | Risk Manager | ⬜ |
| **G3** | Circuit breakers implementados | Risk Manager | ⬜ |
| **G4** | Perfis de risco documentados | Quant Sports | ⬜ |
| **G5** | Otimização de parâmetros válida | Backtest Engineer | ⬜ |
| **G6** | Validação out-of-sample | Quant Sports | ⬜ |

**Fluxo:**

```
G1 → G2 → G3 → G4 → G5 → G6 → ✅ GESTÃO APROVADA
```

### 5.3 Quem Aprova Cada Camada

```
┌─────────────────────────────────────────────────────────────┐
│              MATRIZ DE RESPONSABILIDADE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ESTRATÉGIA (Lógica)                                        │
│  ─────────────────────                                      │
│  • Criação: Strategy Dev                                   │
│  • Revisão: Strategy Lead                                  │
│  • Validação Técnica: Backtest Engineer                    │
│  • Validação Quant: Quant Sports                           │
│  • Aprovação Final: Strategy Lead + Tech Lead              │
│                                                             │
│  GESTÃO (Parâmetros)                                        │
│  ────────────────────                                       │
│  • Criação: Quant Sports                                   │
│  • Revisão: Risk Manager                                   │
│  • Validação: Backtest Engineer                            │
│  • Aprovação Final: Quant Sports + Risk Manager            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Template de Nova Estratégia

### 6.1 Estrutura de Arquivos Obrigatória

```
squads/strategy-sports/
├── strategy/
│   └── {strategy-id}.md              # Estratégia pura (lógica)
│
├── config/
│   └── management/
│       └── {strategy-id}-config.yaml # Gestão (injetável)
│
├── data/
│   └── {strategy-id}-readme.md       # Documentação geral
│
└── tests/
    └── {strategy-id}.test.ts         # Testes unitários (opcional)
```

### 6.2 Checklist de Criação

#### Fase 1: Definição da Estratégia

- [ ] Hipótese clara e testável
- [ ] Trigger bem definido (pseudocódigo)
- [ ] Condições de entrada documentadas
- [ ] Condições de saída documentadas
- [ ] Mercado e seleção especificados
- [ ] Schema de dados definido
- [ ] Integrações técnicas listadas
- [ ] Regras de exclusão documentadas

#### Fase 2: Definição da Gestão

- [ ] Método de staking definido
- [ ] Valores de stake configurados
- [ ] Limites de exposição configurados
- [ ] Circuit breakers implementados
- [ ] Perfis de risco documentados
- [ ] Fases de operação configuradas
- [ ] Alertas de monitoramento configurados

#### Fase 3: Validação

- [ ] Estratégia sem parâmetros de gestão
- [ ] Config sem lógica de trigger
- [ ] Schemas validados
- [ ] Backtest de lógica executado
- [ ] Otimização de gestão executada
- [ ] Validação out-of-sample executada

#### Fase 4: Documentação

- [ ] `strategy/{strategy-id}.md` criado
- [ ] `config/management/{strategy-id}-config.yaml` criado
- [ ] `data/{strategy-id}-readme.md` criado
- [ ] Versionamento correto (estratégia + config)
- [ ] Changelog atualizado

### 6.3 Validações Necessárias

#### Validação de Separação

```bash
# Script de validação automática
$ npm run validate:separation {strategy-id}

# Checks:
✅ Strategy file has no stake parameters
✅ Config file has no trigger logic
✅ Schemas are valid
✅ Versioning is correct
```

#### Validação de Schema

```bash
# Validar schema da estratégia
$ npm run validate:schema:strategy {strategy-id}

# Validar schema da gestão
$ npm run validate:schema:management {strategy-id}
```

#### Validação de Backtest

```bash
# Rodar backtest de lógica
$ npm run backtest:logic {strategy-id}

# Rodar otimização de gestão
$ npm run optimize:management {strategy-id}
```

---

## 📊 Resumo Executivo

### Princípios Chave

1. **SEPARAÇÃO:** Estratégia ≠ Gestão (OBRIGATÓRIO)
2. **INJEÇÃO:** Gestão é injetada em tempo de execução
3. **VALIDAÇÃO:** Cada camada tem gates de aprovação separados
4. **VERSIONAMENTO:** Estratégia e config têm versões independentes
5. **METRICS:** Métricas de lógica ≠ Métricas de gestão

### Fluxo Completo

```
Estratégia (Trigger Logic)
    ↓
Sinal de Oportunidade
    ↓
Gestão (Stake Calculator)
    ↓
Bot (Execution)
    ↓
Resultado → Backtest Analytics
```

### Próximos Passos

1. Ler [`examples/bot-implementation.ts`](./examples/bot-implementation.ts)
2. Ler [`examples/backtest-implementation.ts`](./examples/backtest-implementation.ts)
3. Ler [`strategy/DATA_FLOW.md`](./strategy/DATA_FLOW.md)
4. Seguir [`checklists/bot-compliance-checklist.md`](./checklists/bot-compliance-checklist.md)

---

## 🔗 Referências

### Documentos Relacionados

- [Architecture](./strategy/ARCHITECTURE.md) - Separação estratégica
- [Data Flow](./strategy/DATA_FLOW.md) - Fluxo de dados
- [Bot Implementation](./examples/bot-implementation.ts) - Exemplo prático
- [Backtest Implementation](./examples/backtest-implementation.ts) - Exemplo prático

### Tipos e Schemas

- [Strategy Types](./types/strategy.types.ts) - TypeScript interfaces
- [Strategy Schema](./schemas/strategy.schema.json) - JSON Schema estratégia
- [Management Schema](./schemas/management.schema.json) - JSON Schema gestão

### Checklists

- [Bot Compliance](./checklists/bot-compliance-checklist.md) - Checklist de validação

---

**Status:** `APPROVED`  
**Próxima revisão:** Conforme novas estratégias forem criadas  
**Responsável:** @strategy-lead

---

*Este documento é a referência oficial para TODAS as estratégias do domínio BET-SPORTS.*
