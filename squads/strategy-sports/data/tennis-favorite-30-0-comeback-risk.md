# Parâmetros de Gestão de Risco: Favorite 30-0 Comeback

**ID da Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 1.0.0  
**Classificação de Risco:** MÉDIO  
**Documento Complementar:** [Especificação Técnica](./tennis-favorite-30-0-comeback-spec.md)

---

## 1. Visão Geral da Gestão de Risco

### 1.1. Filosofia de Risco

```
┌─────────────────────────────────────────────────────────────────┐
│                    RISK MANAGEMENT PYRAMID                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        ┌───────┐                                │
│                        │ INDIV │  ← Risco por aposta           │
│                       │ DUAL  │                                │
│                      │  BET  │                                 │
│                     │───────│                                   │
│                    │ PORTFOLIO │  ← Risco por conjunto         │
│                   │   LEVEL   │                                 │
│                  │─────────────│                                 │
│                 │   STRATEGY   │  ← Risco da estratégia        │
│                │     LEVEL     │                                 │
│               │─────────────────│                                │
│              │   SYSTEM LEVEL  │  ← Risco do sistema           │
│             │───────────────────│                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Princípios Fundamentais

1. **Preservação de Capital:** Nunca arriscar mais do que pode perder
2. **Diversificação:** Não concentrar em única partida/torneio
3. **Disciplina:** Seguir parâmetros rigorosamente
4. **Transparência:** Todo risco deve ser mensurável e reportável

---

## 2. Risco por Aposta (Individual Bet Risk)

### 2.1. Parâmetros de Stake

#### Método Recomendado: Stake Percentual Fixa

```yaml
stake_parameters:
  method: 'percentage'
  
  # Fase de Validação (Primeiros 100 bets)
  validation_phase:
    stake_percent: 0.25  # 0.25% da bankroll
    max_absolute: 50     # Máximo R$50 por bet
  
  # Fase Standard (Após validação)
  standard_phase:
    stake_percent: 1.0   # 1.0% da bankroll
    max_absolute: 200    # Máximo R$200 por bet
  
  # Fase Agressiva (Após 500+ bets lucrativos)
  aggressive_phase:
    stake_percent: 1.5   # 1.5% da bankroll
    max_absolute: 500    # Máximo R$500 por bet
```

#### Método Alternativo: Kelly Fractional

```typescript
interface KellyParameters {
  // Fórmula: f* = (bp - q) / b
  // Onde: b = odds - 1, p = probabilidade, q = 1 - p
  
  kellyFraction: 0.25;        // Quarter Kelly (25% do Kelly pleno)
  minKellyPercent: 0.0025;    // Mínimo 0.25% da bankroll
  maxKellyPercent: 0.015;     // Máximo 1.5% da bankroll
  
  // Probabilidade estimada baseada em histórico
  estimatedWinProbability: {
    overall: 0.55;           // 55% win rate esperado
    bySurface: {
      hard: 0.57;
      clay: 0.53;
      grass: 0.55;
    };
  };
}
```

### 2.2. Limites por Aposta

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Min Stake** | 0.25% | Stake mínima |
| **Max Stake** | 2.0% | Stake máxima absoluta |
| **Min Odds** | 1.70 | Odd mínima para entrada |
| **Max Odds** | 3.50 | Odd máxima (evitar risco extremo) |
| **Expected Value Min** | 2% | Valor esperado mínimo |

### 2.3. Cálculo de Expected Value (EV)

```typescript
function calculateExpectedValue(
  winRate: number,
  averageOdds: number
): number {
  // EV = (Win Rate * Average Odds) - 1
  return (winRate * averageOdds) - 1;
}

// Exemplo com parâmetros da estratégia:
// Win Rate: 55%, Average Odds: 1.90
// EV = (0.55 * 1.90) - 1 = 0.045 = 4.5%

// Mínimo aceitável: EV >= 2%
```

### 2.4. Ajuste de Stake por Nível de Risco

```yaml
risk_adjusted_staking:
  # Nível LOW: Favorito Top 20, superfície forte
  LOW:
    criteria:
      - favorite_ranking <= 20
      - surface_win_rate >= 0.60
      - no_injury_concerns
    stake_multiplier: 1.25  # +25% stake
    max_stake_percent: 1.25%
  
  # Nível MEDIUM: Condições normais
  MEDIUM:
    criteria:
      - favorite_ranking <= 50
      - surface_win_rate >= 0.50
    stake_multiplier: 1.0   # Stake padrão
    max_stake_percent: 1.0%
  
  # Nível HIGH: Situações de maior risco
  HIGH:
    criteria:
      - favorite_ranking <= 100
      - surface_win_rate >= 0.45
    stake_multiplier: 0.5   # -50% stake
    max_stake_percent: 0.5%
```

---

## 3. Risco por Partida (Match Exposure)

### 3.1. Limites de Exposição

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| **Max Bets por Partida** | 3 | Evitar overexposure |
| **Max Stake por Partida** | 3% | Soma de todas as bets |
| **Min Intervalo entre Bets** | 2 games | Evitar bets correlacionadas |

### 3.2. Regras de Entrada Múltipla

```typescript
interface MatchExposureRules {
  // Máximo de entradas por partida
  maxBetsPerMatch: 3;
  
  // Condições para múltiplas entradas
  multipleEntryConditions: {
    // Segunda entrada apenas se:
    secondEntry: {
      minGamesSinceFirst: 2;
      firstBetResult: 'WIN' | 'PENDING';
      matchSituation: 'FAVORITE_SERVING_30_0';
    };
    
    // Terceira entrada apenas se:
    thirdEntry: {
      minGamesSinceSecond: 2;
      previousBetsResult: 'AT_LEAST_ONE_WIN';
      matchSituation: 'FAVORITE_SERVING_30_0';
      confidenceLevel: 'HIGH';
    };
  };
  
  // Stop por partida
  stopLossPerMatch: {
    maxLosses: 2;  // Após 2 losses, não apostar mais nesta partida
  };
}
```

### 3.3. Matriz de Decisão por Situação

| Situação | Ação | Stake |
|----------|------|-------|
| **1ª entrada, WIN** | Avaliar 2ª entrada | 1.0% |
| **1ª entrada, LOSS** | Aguardar próximo game | 1.0% |
| **2 entradas, 2 Wins** | Avaliar 3ª entrada | 0.75% |
| **2 entradas, 1W 1L** | Aguardar | 1.0% |
| **2 entradas, 2 Losses** | STOP na partida | 0% |

---

## 4. Risco Diário (Daily Risk)

### 4.1. Limites Diários

| Parâmetro | Valor | Ação ao Atingir |
|-----------|-------|-----------------|
| **Max Bets por Dia** | 15 | Parar novas entradas |
| **Max Stake Diário** | 10% | Soma de todas as bets |
| **Max Loss Diário** | 5% | STOP LOSS diário |
| **Max Gain Diário** | 15% | Opcional: Realizar lucros |

### 4.2. Circuit Breakers Diários

```yaml
daily_circuit_breakers:
  # Stop Loss Diário
  daily_stop_loss:
    threshold: -5%  # 5% de perda da bankroll
    action: 'STOP_ALL_BETS'
    cooldown: '24h'
  
  # Stop de Volume
  daily_max_bets:
    threshold: 15  # Número de bets
    action: 'STOP_NEW_BETS'
    cooldown: '24h'
  
  # Stop de Perda Consecutiva
  consecutive_losses:
    threshold: 5  # 5 losses seguidas
    action: 'PAUSE_4H'
    cooldown: '4h'
  
  # Redução de Stake após Loss
  stake_reduction:
    trigger: -3%  # Após 3% de loss no dia
    reduction: 50%  # Reduz stake pela metade
    recovery: '+2%'  # Volta ao normal após recuperar 2%
```

### 4.3. Escalonamento de Stake Diário

```
Dia 1-5 (Validação):
├── Max Bets: 5
├── Max Stake: 2%
└── Stop Loss: 3%

Dia 6-20 (Ramp-up):
├── Max Bets: 10
├── Max Stake: 5%
└── Stop Loss: 4%

Dia 21+ (Standard):
├── Max Bets: 15
├── Max Stake: 10%
└── Stop Loss: 5%
```

---

## 5. Risco Semanal e Mensal

### 5.1. Limites Semanais

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Max Drawdown Semanal** | 15% | Stop loss semanal |
| **Max Bets Semanal** | 75 | Volume semanal |
| **Min ROI Semanal** | -5% | Tolerância de perda |

### 5.2. Limites Mensais

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Max Drawdown Mensal** | 25% | Stop loss mensal |
| **Max Bets Mensais** | 300 | Volume mensal |
| **Target ROI Mensal** | 5-15% | Objetivo de retorno |

### 5.3. Revisão de Performance

```yaml
performance_review:
  weekly:
    metrics:
      - win_rate
      - roi
      - max_drawdown
      - sharpe_ratio
    action_if_underperforming:
      - win_rate < 48%: 'REDUCE_STAKE_50%'
      - roi < -5%: 'PAUSE_1WEEK'
      - max_dd > 15%: 'STOP_WEEK'
  
  monthly:
    metrics:
      - cumulative_roi
      - monthly_sharpe
      - strategy_degradation
    action_if_underperforming:
      - roi < 0%: 'COMPRETIVE_REVIEW'
      - sharpe < 0.5: 'PARAMETER_RECALIBRATION'
      - 3_months_negative: 'DEACTIVATE_STRATEGY'
```

---

## 6. Risco de Bankroll (Gestão de Banca)

### 6.1. Estrutura de Bankroll

```yaml
bankroll_structure:
  total_bankroll: 10000  # Exemplo: R$10.000
  
  allocation:
    active: 70%      # R$7.000 para apostas
    reserve: 20%     # R$2.000 reserva
    emergency: 10%   # R$1.000 emergência
  
  staking_base:
    # Stakes calculadas sobre bankroll ativo
    base: 'active_bankroll'
    recalculation: 'daily'
```

### 6.2. Regras de Rebalanceamento

```typescript
interface BankrollRebalancing {
  // Rebalancear quando:
  rebalanceTriggers: {
    // Bankroll ativo cair abaixo de 50% do total
    activeBelowThreshold: 0.50;
    
    // Reserva cair abaixo de 10% do total
    reserveBelowThreshold: 0.10;
    
    // Lucro acumulado > 50% (realizar parcialmente)
    profitAboveThreshold: 0.50;
  };
  
  // Ações de rebalanceamento
  rebalanceActions: {
    // Se ativo < 50%, transferir da reserva
    transferFromReserve: true;
    
    // Se lucro > 50%, retirar 50% do lucro
    withdrawProfits: 0.50;
    
    // Se reserva < 10%, priorizar recomposição
    prioritizeReserve: true;
  };
}
```

### 6.3. Gestão de Drawdown

| Nível de Drawdown | Ação | Stake Ajustada |
|-------------------|------|----------------|
| **0-10%** | Normal | 100% |
| **10-15%** | Alerta | 75% |
| **15-20%** | Redução | 50% |
| **20-25%** | Crítico | 25% |
| **25%+** | Stop | 0% (pausar) |

---

## 7. Risco Operacional

### 7.1. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Latência de Dados** | Média | Alto | Múltiplas fontes |
| **Falha de API** | Baixa | Alto | Fallback providers |
| **Erro de Execução** | Baixa | Médio | Validação pré-bet |
| **Odds Incorretas** | Média | Médio | Validação de range |
| **Conexão Interrompida** | Baixa | Alto | Auto-reconnect |
| **Dados de Placar Errados** | Baixa | Alto | Cross-validation |

### 7.2. Controles Operacionais

```yaml
operational_controls:
  # Validações pré-bet
  pre_bet_validations:
    - odds_within_expected_range: [1.70, 3.50]
    - score_verified_multiple_sources: true
    - favorite_confirmed_serving: true
    - no_suspicious_odds_movement: true
    - bankroll_sufficient: true
  
  # Validações de execução
  execution_validations:
    - max_latency: 3000ms  # 3 segundos
    - odds_slippage_max: 0.10  # 10% de slippage
    - stake_within_limits: true
    - daily_limits_not_exceeded: true
  
  # Post-bet verification
  post_bet_verification:
    - bet_confirmed_by_bookmaker: true
    - odds_matched: true
    - stake_matched: true
    - logged_for_audit: true
```

### 7.3. Plano de Contingência

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTINGENCY PLAN                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cenário 1: Falha de API de Odds                           │
│  → Switch para provider secundário                         │
│  → Se ambos falharem: PAUSAR estratégia                    │
│                                                             │
│  Cenário 2: Dados de Placar Inconsistentes                 │
│  → Cross-validar com 3ª fonte                            │
│  → Se inconsistência persistir: IGNORAR signal            │
│                                                             │
│  Cenário 3: Falha de Execução de Bet                       │
│  → Retry automático (max 2x)                               │
│  → Se falhar: Log e notificar                              │
│                                                             │
│  Cenário 4: Drawdown Excedido                              │
│  → STOP imediato de novas entradas                         │
│  → Aguardar review manual                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Risco de Mercado

### 8.1. Fatores de Risco de Mercado

| Fator | Impacto na Estratégia | Mitigação |
|-------|----------------------|-----------|
| **Mudança de Superfície** | Win rate pode variar | Ajustar por superfície |
| **Lesões de Jogadores** | Performance imprevisível | Exclusion rules |
| **Condições Climáticas** | Afeta jogo externo | Monitorar weather |
| **Fadiga (Multi-day)** | Performance reduzida | Fatigue factor filter |
| **Motivação (Torneio)** | Intensidade varia | Tournament importance |

### 8.2. Filtros de Mercado

```yaml
market_filters:
  # Excluir partidas com:
  exclusions:
    - player_has_injury_timeout: true
    - match_has_weather_delay: true
    - player_retired_last_match: true
    - player_playing_3rd_match_in_2_days: true
    - tournament_is_exhibition: true
  
  # Incluir apenas:
  inclusions:
    - tournament_tier: ['ATP', 'WTA', 'GRAND_SLAM', 'MASTERS']
    - match_round: ['R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F']
    - surface_known: true
```

---

## 9. Matriz de Risco Consolidada

### 9.1. Heat Map de Riscos

```
                    IMPACTO
              BAIXO   MÉDIO   ALTO
            ┌───────┬───────┬───────┐
         BA │  ●    │  ●    │       │
          I │       │       │       │
PRO     XA │───────┼───────┼───────┤
BA        MÉ │  ●    │  ●●   │  ●    │
BI          D │       │       │       │
LID       IO │───────┼───────┼───────┤
A         AL │       │  ●    │  ●●   │
          TA │       │       │       │
            └───────┴───────┴───────┘
                 PROBABILIDADE

Legenda:
● = Risco por Aposta
●● = Risco Diário/Semanal
●●● = Risco de Bankroll
```

### 9.2. Resumo de Limites

| Categoria | Parâmetro | Limite |
|-----------|-----------|--------|
| **Por Aposta** | Stake | 0.25% - 2.0% |
| **Por Aposta** | Odds | 1.70 - 3.50 |
| **Por Partida** | Max Bets | 3 |
| **Por Partida** | Max Stake | 3% |
| **Por Dia** | Max Bets | 15 |
| **Por Dia** | Max Loss | 5% |
| **Por Semana** | Max Drawdown | 15% |
| **Por Mês** | Max Drawdown | 25% |
| **Bankroll** | Reserva Mínima | 20% |

---

## 10. Configuração de Implementação

### 10.1. Arquivo de Configuração

```yaml
# config/strategy-risk-config.yaml
strategy: TENNIS_FAV_30_0_COMEBACK

risk_parameters:
  # Stake
  staking:
    method: 'percentage'
    base_percent: 1.0
    min_percent: 0.25
    max_percent: 2.0
    kelly_fraction: 0.25  # Se usar Kelly
  
  # Limites por aposta
  bet_limits:
    min_odds: 1.70
    max_odds: 3.50
    min_ev: 0.02
  
  # Limites por partida
  match_limits:
    max_bets: 3
    max_total_stake: 3.0
    stop_after_losses: 2
  
  # Limites diários
  daily_limits:
    max_bets: 15
    max_total_stake: 10.0
    max_loss: 5.0
    consecutive_loss_stop: 5
  
  # Limites semanais
  weekly_limits:
    max_drawdown: 15.0
    max_bets: 75
  
  # Limites mensais
  monthly_limits:
    max_drawdown: 25.0
    target_roi: 5.0
  
  # Circuit breakers
  circuit_breakers:
    daily_loss_pause: 5.0
    weekly_loss_pause: 15.0
    monthly_loss_review: 25.0
  
  # Bankroll management
  bankroll:
    active_percent: 70
    reserve_percent: 20
    emergency_percent: 10
    rebalance_threshold: 50
  
  # Risk adjustments
  risk_adjustments:
    low_risk_multiplier: 1.25
    medium_risk_multiplier: 1.0
    high_risk_multiplier: 0.5
  
  # Drawdown response
  drawdown_response:
    - threshold: 10
      action: 'ALERT'
    - threshold: 15
      action: 'REDUCE_STAKE_25'
    - threshold: 20
      action: 'REDUCE_STAKE_50'
    - threshold: 25
      action: 'STOP'
```

### 10.2. Interface de Tipos

```typescript
interface TennisFavorite30ComebackRiskConfig {
  // Identificação
  strategyId: 'TENNIS_FAV_30_0_COMEBACK';
  riskClassification: 'MEDIUM';
  
  // Staking
  staking: {
    method: 'percentage' | 'kelly' | 'fixed';
    basePercent: number;
    minPercent: number;
    maxPercent: number;
    kellyFraction?: number;
  };
  
  // Bet Limits
  betLimits: {
    minOdds: number;
    maxOdds: number;
    minEV: number;
  };
  
  // Match Exposure
  matchLimits: {
    maxBets: number;
    maxTotalStake: number;
    stopAfterLosses: number;
  };
  
  // Time-based Limits
  dailyLimits: {
    maxBets: number;
    maxTotalStake: number;
    maxLoss: number;
    consecutiveLossStop: number;
  };
  
  weeklyLimits: {
    maxDrawdown: number;
    maxBets: number;
  };
  
  monthlyLimits: {
    maxDrawdown: number;
    targetROI: number;
  };
  
  // Circuit Breakers
  circuitBreakers: {
    dailyLossPause: number;
    weeklyLossPause: number;
    monthlyLossReview: number;
  };
  
  // Bankroll Allocation
  bankroll: {
    activePercent: number;
    reservePercent: number;
    emergencyPercent: number;
    rebalanceThreshold: number;
  };
  
  // Risk Adjustments
  riskAdjustments: {
    lowRiskMultiplier: number;
    mediumRiskMultiplier: number;
    highRiskMultiplier: number;
  };
  
  // Drawdown Response
  drawdownResponse: Array<{
    threshold: number;
    action: 'ALERT' | 'REDUCE_STAKE_25' | 'REDUCE_STAKE_50' | 'STOP';
  }>;
}
```

---

## 11. Monitoramento e Alertas

### 11.1. Alertas Configurados

| Alerta | Gatilho | Ação |
|--------|---------|------|
| **Stake Excedida** | Stake > maxPercent | Bloquear bet |
| **Daily Loss** | Loss > 3% | Alerta amarelo |
| **Daily Loss Critical** | Loss > 5% | STOP automático |
| **Consecutive Losses** | 3 losses seguidas | Alerta laranja |
| **Consecutive Losses Critical** | 5 losses seguidas | PAUSE 4h |
| **Drawdown Weekly** | DD > 10% | Alerta vermelho |
| **Drawdown Monthly** | DD > 20% | Review urgente |

### 11.2. Dashboard de Risco

```yaml
risk_dashboard:
  real_time:
    - current_bankroll
    - daily_pnl
    - daily_bets_count
    - open_exposure
  
  alerts_panel:
    - active_circuit_breakers
    - recent_stake_adjustments
    - pending_reviews
  
  historical:
    - daily_roi_chart
    - drawdown_chart
    - win_rate_trend
    - stake_distribution
```

---

## 12. Checklist de Implementação de Risco

```markdown
## Risk Implementation Checklist

### Configuração
- [ ] Parâmetros de stake configurados
- [ ] Limites diários/semanais/mensais definidos
- [ ] Circuit breakers implementados
- [ ] Bankroll allocation definida

### Validações
- [ ] Validações pré-bet implementadas
- [ ] Validações de execução implementadas
- [ ] Validações pós-bet implementadas

### Monitoramento
- [ ] Alertas configurados
- [ ] Dashboard de risco implementado
- [ ] Logging de todas as decisões

### Contingência
- [ ] Plano de contingência documentado
- [ ] Fallback providers configurados
- [ ] Procedimentos de emergência definidos

### Testing
- [ ] Testes de limites unitários
- [ ] Testes de circuit breakers
- [ ] Testes de cenários de estresse
```

---

**Documento criado:** 2026-02-17  
**Próxima revisão:** Trimestral ou após mudanças significativas  
**Responsável:** @risk-manager, @strategy-lead  
**Aprovação necessária:** @strategy-lead, @tech-lead
