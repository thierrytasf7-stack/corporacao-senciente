# Fluxo de Dados: Estratégia → Gestão → Execução → Analytics

**Domínio:** BET-SPORTS  
**Versão:** 1.0.0  
**Data:** 2026-02-17  
**Status:** `APPROVED`  
**Autor:** strategy-sports

---

## ⚠️ PRINCÍPIO FUNDAMENTAL

> **ESTRATÉGIA e GESTÃO são camadas SEPARADAS e INDEPENDENTES.**
>
> Este documento descreve o fluxo de dados entre estas camadas.

---

## 📊 Visão Geral do Fluxo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO COMPLETO DE DADOS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ESTRATÉGIA (WHAT)           GESTÃO (HOW MUCH)         EXECUÇÃO            │
│  ───────────────           ────────────────         ────────────           │
│                                                                             │
│  ┌──────────────┐                                                         │
│  │  Match Data  │                                                         │
│  │  (Live Score)│                                                         │
│  └──────┬───────┘                                                         │
│         │                                                                  │
│         ▼                                                                  │
│  ┌──────────────┐                                                         │
│  │   Trigger    │                                                         │
│  │   Detector   │                                                         │
│  │  (Lógica)    │                                                         │
│  └──────┬───────┘                                                         │
│         │                                                                  │
│         ▼                                                                  │
│  ┌──────────────┐                                                         │
│  │   Signal     │  ──────────────────────────────────────────────┐       │
│  │  Generator   │                                                 │       │
│  └──────┬───────┘                                                 │       │
│         │                                                         │       │
│         ▼                                                         │       │
│  ┌──────────────┐    ┌──────────────┐                             │       │
│  │  Strategy    │    │  Management  │ ◀─── Config (YAML/JSON)    │       │
│  │   Signal     │    │    Config    │                             │       │
│  │  (Oportun.)  │    │  (Parâmetros)│                             │       │
│  └──────┬───────┘    └──────┬───────┘                             │       │
│         │                   │                                     │       │
│         │    Signal + Config│                                     │       │
│         └────────┬──────────┘                                     │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐                                       │       │
│         │ Risk Validator  │                                       │       │
│         │ (Limites/CB)    │                                       │       │
│         └────────┬────────┘                                       │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐                                       │       │
│         │ Stake Calculator│                                       │       │
│         │ (Kelly/%/Fixed) │                                       │       │
│         └────────┬────────┘                                       │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐                                       │       │
│         │  Bet Executor   │───────────────────────────────────────┼───────┤
│         │  (Exchange API) │                                       │       │
│         └────────┬────────┘                                       │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐                                       │       │
│         │  Bet Placed     │                                       │       │
│         │  (Confirmation) │                                       │       │
│         └────────┬────────┘                                       │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐                                       │       │
│         │   Settlement    │ ◀──────────── Event Resolution        │       │
│         │   (Win/Loss)    │                                       │       │
│         └────────┬────────┘                                       │       │
│                  │                                                │       │
│                  ▼                                                │       │
│         ┌─────────────────┐    ┌──────────────────┐               │       │
│         │  Result Record  │───▶│  Backtest/       │               │       │
│         │  (Profit/Loss)  │    │  Live Analytics  │◀──────────────┘       │
│         └─────────────────┘    └──────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Detalhado por Camada

### FASE 1: Estratégia (Lógica Pura)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 1: ESTRATÉGIA                           │
│                    (Lógica de Trigger)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:                                                         │
│  ──────                                                         │
│  • Live Score Data (API externa)                               │
│  • Odds Data (Feed de odds)                                    │
│  • Match Context (Torneio, superfície, jogadores)              │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ───────────────                                                │
│  1. Monitorar eventos em tempo real                            │
│  2. Aplicar lógica de trigger (pseudocódigo)                   │
│  3. Validar condições de entrada                               │
│  4. Aplicar regras de exclusão                                 │
│                                                                 │
│  OUTPUT:                                                        │
│  ──────                                                         │
│  • StrategySignal (oportunidade identificada)                  │
│    - signalId: UUID                                            │
│    - strategyId: TENNIS_FAV_30_0_COMEBACK                      │
│    - match: Dados da partida                                   │
│    - selection: Jogador/seleção alvo                           │
│    - market: Mercado e odds                                    │
│    - validation: { canEnter: boolean, reasons: [] }            │
│    - metadata: { riskLevel, confidence, exclusionChecks }      │
│                                                                 │
│  ⚠️ NOTA: Signal NÃO contém stake, limits ou parâmetros        │
│           de gestão. Apenas oportunidade lógica.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### FASE 2: Gestão (Parâmetros Injetados)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 2: GESTÃO                               │
│              (Parâmetros Matemáticos de Risco)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:                                                         │
│  ──────                                                         │
│  • StrategySignal (da Fase 1)                                  │
│  • ManagementConfig (YAML/JSON - injetado)                     │
│  • Bankroll State (estado atual)                               │
│  • Exposure State (exposição atual)                            │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ───────────────                                                │
│  1. Validar odds contra config (odds.min, odds.max)            │
│  2. Calcular stake (percentage, kelly, fixed)                  │
│  3. Validar limites de exposição                               │
│     - per_match.max_bets, per_match.max_stake                  │
│     - per_day.max_bets, per_day.max_loss                       │
│  4. Verificar circuit breakers                                 │
│     - daily.loss_stop                                          │
│     - consecutive_loss_pause                                   │
│                                                                 │
│  OUTPUT:                                                        │
│  ──────                                                         │
│  • BetDecision (decisão de apostar)                            │
│    - canBet: boolean                                           │
│    - stake: number (calculado)                                 │
│    - reason: string (se recusado)                              │
│    - riskLevel: LOW|MEDIUM|HIGH                                │
│                                                                 │
│  ⚠️ NOTA: Gestão é INJETADA. Mesma estratégia pode usar        │
│           diferentes configs conforme perfil de risco.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### FASE 3: Execução (Bot/Exchange)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 3: EXECUÇÃO                             │
│                    (Bet Placement)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:                                                         │
│  ──────                                                         │
│  • BetDecision (da Fase 2)                                     │
│  • Exchange Credentials (API keys)                             │
│  • Execution Config (max_latency, max_slippage)                │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ───────────────                                                │
│  1. Preparar ordem (seleção, stake, odds)                      │
│  2. Enviar para exchange (API call)                            │
│  3. Aguardar confirmação                                       │
│  4. Validar execução (slippage check)                          │
│  5. Retry se necessário (max_retries)                          │
│                                                                 │
│  OUTPUT:                                                        │
│  ──────                                                         │
│  • BetExecution (aposta executada)                             │
│    - executionId: UUID                                         │
│    - betId: ID na exchange                                     │
│    - signalId: Referência ao signal                            │
│    - stake: Valor apostado                                     │
│    - odds: Odd executada                                       │
│    - status: ACCEPTED|REJECTED|PENDING                         │
│    - executedAt: Timestamp                                     │
│    - slippage: Diferença entre signal e execução               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### FASE 4: Settlement & Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 4: SETTLEMENT                           │
│              (Resultado e Analytics)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT:                                                         │
│  ──────                                                         │
│  • BetExecution (da Fase 3)                                    │
│  • Event Result (API externa - fim do jogo/game)               │
│                                                                 │
│  PROCESSAMENTO:                                                 │
│  ───────────────                                                │
│  1. Aguardar resolução do evento                               │
│  2. Determinar resultado (WIN|LOSS|VOID)                       │
│  3. Calcular profit/loss                                       │
│  4. Atualizar bankroll                                         │
│  5. Atualizar métricas                                         │
│                                                                 │
│  OUTPUT:                                                        │
│  ──────                                                         │
│  • StrategyResult (resultado completo)                         │
│    - resultId: UUID                                            │
│    - signalId: Referência                                      │
│    - betId: Referência                                         │
│    - result: WIN|LOSS|VOID                                     │
│    - profit: Valor ganho/perdido                               │
│    - roi: (profit/stake) * 100                                 │
│    - settledAt: Timestamp                                      │
│                                                                 │
│  ANALYTICS:                                                     │
│  ──────────                                                     │
│  • Strategy Metrics (lógica):                                  │
│    - triggerRate, entryRate, winRate                           │
│    - averageOdds, averageConfidence                            │
│                                                                 │
│  • Management Metrics (gestão):                                │
│    - ROI, Sharpe Ratio, Max Drawdown                           │
│    - Profit Factor, Expectancy                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Dados

### StrategySignal (Saída da Estratégia)

```typescript
interface StrategySignal {
  // Identificação
  signalId: string;           // UUID
  strategyId: string;         // TENNIS_FAV_30_0_COMEBACK
  version: string;            // v1.0.0
  timestamp: Date;

  // Partida
  match: {
    matchId: string;
    tournament: { id, name, tier };
    surface: string;
    homePlayer: Player;
    awayPlayer: Player;
  };

  // Seleção
  selection: {
    playerId: string;
    playerName: string;
    role: 'FAVORITE';
    condition: 'SERVING_AT_30_0_DOWN';
  };

  // Mercado
  market: {
    marketType: 'GAME_WINNER';
    marketId: string;
    selection: {
      playerId: string;
      odds: number;
    };
  };

  // Validação (lógica)
  validation: {
    canEnter: boolean;
    reasons: string[];
    checks: {
      triggerActive: boolean;
      marketAvailable: boolean;
      selectionIdentified: boolean;
      oddsValid: boolean;
      exclusionsClear: boolean;
    };
  };

  // Metadados
  metadata: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;  // 0-1
    exclusionChecks: Record<string, boolean>;
  };

  // ⚠️ NOTA: SEM stake, SEM limits, SEM parâmetros de gestão
}
```

### ManagementConfig (Configuração Injetada)

```yaml
# config/management/tennis-favorite-30-0-comeback-config.yaml

strategy:
  id: TENNIS_FAV_30_0_COMEBACK
  version: cfg-1.0.0

odds:
  min: 1.70
  max: 3.50

staking:
  method: percentage
  value: 1.0
  limits:
    min: 0.25
    max: 2.0

exposure:
  per_match:
    max_bets: 3
    max_stake: 3.0
  per_day:
    max_bets: 15
    max_loss: 5.0

circuit_breakers:
  daily:
    loss_stop: 5.0
```

### BetExecution (Saída da Execução)

```typescript
interface BetExecution {
  executionId: string;
  signalId: string;
  betId: string;

  // Do signal
  signal: StrategySignal;

  // Da gestão
  stake: number;
  stakingMethod: 'percentage' | 'kelly' | 'fixed';

  // Execução
  odds: number;
  oddsType: 'DECIMAL';
  executedAt: Date;
  exchange: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  // Slippage
  signalOdds?: number;
  slippage?: number;
}
```

### StrategyResult (Resultado Final)

```typescript
interface StrategyResult {
  resultId: string;
  signalId: string;
  betId?: string;

  // Execução
  stake: number;
  odds: number;

  // Resultado
  result: 'WIN' | 'LOSS' | 'VOID';
  profit: number;
  roi: number;
  settledAt: Date;

  // Análise
  analysis?: {
    actualWinProbability?: number;
    edgeRealized?: number;
    duration?: number;
  };

  // Contexto
  context?: {
    bankrollBefore?: number;
    bankrollAfter?: number;
    drawdown?: number;
  };
}
```

---

## 🔀 Integração com Backtesting

### Fluxo de Backtest

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKTESTING FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FASE 1: Backtest de Lógica                                    │
│  ───────────────────────────                                    │
│                                                                 │
│  Historical Data ──▶ Strategy Logic ──▶ Signals               │
│                                             │                   │
│                                             ▼                   │
│                                    Logic Metrics:               │
│                                    - triggerRate                │
│                                    - entryRate                  │
│                                    - winRate (simulado)         │
│                                                                 │
│                                                                 │
│  FASE 2: Otimização de Gestão                                  │
│  ──────────────────────────────                                 │
│                                                                 │
│  Signals ──▶ Param Grid ──▶ Simulate ──▶ Metrics              │
│              (stake, stop)           (ROI, Sharpe)              │
│                                    │                            │
│                                    ▼                            │
│                             Optimal Params                      │
│                                                                 │
│                                                                 │
│  FASE 3: Validação Cruzada                                     │
│  ───────────────────────────                                     │
│                                                                 │
│  Optimal Params ──▶ Out-of-Sample Data ──▶ Validation          │
│                                              Metrics            │
│                                                   │             │
│                                                   ▼             │
│                                            Is Overfitting?      │
│                                            (degradation > 50%)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Separação de Métricas no Backtest

```typescript
// Métricas de ESTRATÉGIA (lógica)
interface StrategyMetrics {
  totalOpportunities: number;
  totalTriggers: number;
  totalEntries: number;
  triggerRate: number;    // triggers / oportunidades
  entryRate: number;      // entries / triggers
  winRate: number;        // wins / entries
  averageOdds: number;
}

// Métricas de GESTÃO (parâmetros)
interface ManagementMetrics {
  roi: number;            // (profit / stake) * 100
  sharpeRatio: number;    // risk-adjusted return
  maxDrawdown: number;    // maior perda consecutiva
  profitFactor: number;   // gross profit / gross loss
  expectancy: number;     // valor esperado por bet
}
```

---

## 📊 Diagrama de Sequência

```
┌─────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────┐   ┌──────────┐
│  Match  │   │   Strategy   │   │  Management │   │    Bot   │   │ Exchange │
│  Data   │   │   (Logic)    │   │   (Config)  │   │          │   │          │
└────┬────┘   └──────┬───────┘   └──────┬──────┘   └────┬─────┘   └────┬─────┘
     │               │                  │                │              │
     │ Live Score    │                  │                │              │
     │──────────────▶│                  │                │              │
     │               │                  │                │              │
     │               │ Trigger Check    │                │              │
     │               │─────────┐        │                │              │
     │               │◀────────┘        │                │              │
     │               │                  │                │              │
     │               │ Signal Generated │                │              │
     │               │──────────┐       │                │              │
     │               │          │       │                │              │
     │               │          │       │                │              │
     │               │          │ Load Config            │              │
     │               │          │───────▶                │              │
     │               │          │       │                │              │
     │               │          │       │                │              │
     │               │          │ Calculate Stake        │              │
     │               │          │◀───────                │              │
     │               │          │       │                │              │
     │               │          │ Check Limits           │              │
     │               │          │◀───────                │              │
     │               │          │       │                │              │
     │               │          │ Bet Decision           │              │
     │               │          │───────▶                │              │
     │               │          │       │                │              │
     │               │          │       │ Place Bet      │              │
     │               │          │       │───────────────▶│              │
     │               │          │       │                │              │
     │               │          │       │ Bet Confirmed  │              │
     │               │          │       │◀───────────────│              │
     │               │          │       │                │              │
     │               │          │       │ Execution Log  │              │
     │               │          │       │◀───────────────│              │
     │               │          │       │                │              │
     │               │          │       │ Settlement Wait│              │
     │               │          │       │────────┐       │              │
     │               │          │       │        │       │              │
     │ Event Result  │          │       │        │       │              │
     │──────────────▶│          │       │        │       │              │
     │               │          │       │        │       │              │
     │               │          │       │ Record Result │              │
     │               │          │       │───────────────▶│              │
     │               │          │       │                │              │
     │               │          │       │ Update Metrics │              │
     │               │          │       │────────┐       │              │
     │               │          │       │        │       │              │
     │               │          │       │◀───────┘       │              │
     │               │          │       │                │              │
```

---

## 🔗 Referências

### Documentos Relacionados

- [PROTOCOLS.md](../PROTOCOLS.md) - Protocolos formais
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura de separação
- [Bot Implementation](../examples/bot-implementation.ts) - Exemplo de bot
- [Backtest Implementation](../examples/backtest-implementation.ts) - Exemplo de backtest

### Tipos e Schemas

- [Strategy Types](../types/strategy.types.ts) - TypeScript interfaces
- [Strategy Schema](../schemas/strategy.schema.json) - JSON Schema estratégia
- [Management Schema](../schemas/management.schema.json) - JSON Schema gestão

---

**Status:** `APPROVED`  
**Próxima revisão:** Conforme novas estratégias forem implementadas  
**Responsável:** @strategy-lead
