# Critérios de Validação e Backtesting: Favorite 30-0 Comeback

**ID da Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 1.0.0  
**Documento Complementar:** [Especificação Técnica](./tennis-favorite-30-0-comeback-spec.md)

---

## 1. Framework de Validação

### 1.1. Visão Geral do Processo

```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Backtest Histórico → 2. Paper Trading → 3. Live (Small)    │
│         ↓                      ↓                      ↓         │
│    1000+ bets            100+ bets             50+ bets         │
│    6-12 meses            2-4 semanas           4-8 semanas      │
│         ↓                      ↓                      ↓         │
│    Validação           Validação            Validação          │
│    Estatística         Operacional          Real               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Backtesting Histórico

### 2.1. Requisitos de Dados

| Requisito | Especificação | Prioridade |
|-----------|---------------|------------|
| **Período Mínimo** | 24 meses | CRÍTICO |
| **Sample Size** | 1000+ signals | CRÍTICO |
| **Granularidade** | Point-by-point | CRÍTICO |
| **Torneios** | ATP, WTA, Grand Slam | CRÍTICO |
| **Superfícies** | Clay, Grass, Hard | ALTA |
| **Odds Históricas** | Game Winner live | CRÍTICO |

### 2.2. Fontes de Dados para Backtest

```yaml
data_sources:
  primary:
    - SportRadar Tennis API (histórico)
    - Tennis Abstract (match charts)
    - Betfair Historical Odds
  
  secondary:
    - ATP/WTA official records
    - Match Charting Project
    - Custom scraping (se necessário)
  
  validation:
    - Cross-reference múltiplas fontes
    - Audit trail de discrepâncias
```

### 2.3. Configuração do Backtest

```typescript
interface BacktestConfig {
  strategyId: 'TENNIS_FAV_30_0_COMEBACK';
  
  // Período
  dateRange: {
    start: '2024-01-01';
    end: '2025-12-31';
  };
  
  // Universo
  filters: {
    sports: ['TENNIS'];
    tournaments: ['ATP', 'WTA', 'GRAND_SLAM'];
    surfaces: ['CLAY', 'GRASS', 'HARD'];
    minRanking: 100;
  };
  
  // Parâmetros da Estratégia
  parameters: {
    minOdds: 1.70;
    maxOdds: 3.50;
    stakeMethod: 'percentage';
    stakePercent: 1.0;
  };
  
  // Simulação
  simulation: {
    initialBankroll: 10000;
    commission: 0.02; // 2% commission
    slippage: 0.05; // 5% slippage nas odds
    latency: 2000; // 2s delay de execução
  };
}
```

### 2.4. Métricas de Backtest

#### Métricas Primárias (Obrigatórias)

| Métrica | Fórmula | Target Mínimo |
|---------|---------|---------------|
| **Win Rate** | `wins / total_bets` | > 52% |
| **ROI** | `(profit / total_stake) * 100` | > 5% |
| **Total Bets** | Count | >= 1000 |
| **Profit Factor** | `gross_profit / gross_loss` | > 1.20 |
| **Max Drawdown** | `max_peak_to_trough` | < 20% |
| **Sharpe Ratio** | `(return - risk_free) / std_dev` | > 1.0 |

#### Métricas Secundárias (Analíticas)

| Métrica | Descrição | Target |
|---------|-----------|--------|
| **Average Odds** | Odd média das apostas | 1.80 - 2.20 |
| **Average Stake** | Stake média (% bankroll) | 0.8% - 1.2% |
| **Win Rate por Superfície** | Breakdown por superfície | Varia > 48% |
| **Win Rate por Ranking** | Breakdown por faixa de ranking | Varia > 48% |
| **Consecutive Losses** | Máxima sequência de derrotas | < 10 |
| **Recovery Factor** | `net_profit / max_drawdown` | > 2.0 |
| **Expectancy** | `avg_win * win_rate - avg_loss * loss_rate` | > 0.05 |

### 2.5. Critérios de Aprovação do Backtest

```yaml
approval_criteria:
  mandatory:
    - total_bets >= 1000
    - win_rate >= 0.52
    - roi >= 0.05
    - profit_factor >= 1.20
    - max_drawdown <= 0.20
    - sharpe_ratio >= 1.0
  
  recommended:
    - recovery_factor >= 2.0
    - expectancy >= 0.05
    - consecutive_losses <= 10
    - positive_roi_em_cada_superficie
  
  red_flags:
    - win_rate < 0.48
    - roi < 0
    - max_drawdown > 0.30
    - profit_factor < 1.0
    - sample_size < 500
```

### 2.6. Análise de Robustez

#### 2.6.1. Sensibilidade a Parâmetros

```typescript
// Testar variações de parâmetros
const sensitivityTests = {
  minOdds: [1.60, 1.70, 1.80, 1.90, 2.00],
  stakePercent: [0.5, 1.0, 1.5, 2.0],
  maxDailyBets: [5, 10, 15, 20],
};

// Critério: Estratégia deve permanecer lucrativa em 80%+ das combinações
```

#### 2.6.2. Walk-Forward Analysis

```
Período Total: 24 meses
├── In-Sample 1: Meses 1-12  → Otimização
├── Out-Sample 1: Meses 13-15 → Validação
├── In-Sample 2: Meses 13-18 → Re-otimização
├── Out-Sample 2: Meses 19-21 → Validação
└── Out-Sample 3: Meses 22-24 → Validação Final

Critério: Performance consistente em todos os períodos out-sample
```

#### 2.6.3. Monte Carlo Simulation

```typescript
interface MonteCarloConfig {
  iterations: 10000;
  resampling: 'bootstrap';
  metrics: ['roi', 'max_drawdown', 'win_rate'];
  confidenceLevel: 0.95;
}

// Critérios de aprovação:
// - 95% das simulações com ROI > 0
// - 90% das simulações com drawdown < 25%
// - Mediana do ROI > 5%
```

---

## 3. Paper Trading (Forward Testing)

### 3.1. Configuração

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Duração Mínima** | 4 semanas | Período de teste |
| **Signals Mínimos** | 100+ | Volume estatístico |
| **Mercados** | Múltiplas bookmakers | Validação de execução |
| **Latência Simulada** | 2-5 segundos | Condições reais |

### 3.2. Métricas de Paper Trading

```yaml
paper_trading_metrics:
  execution:
    - fill_rate: "> 85%"  # Signals que viram bets
    - avg_latency: "< 3s"  # Trigger → Bet placement
    - odds_slippage: "< 5%"  # Diferença entre signal e bet
  
  performance:
    - win_rate: ">= 50%"  # Ligeiramente menor que backtest
    - roi: ">= 3%"  # Considerando condições reais
    - max_drawdown: "< 15%"
  
  operational:
    - false_signals: "< 5%"  # Signals inválidos
    - system_uptime: "> 99%"
    - data_quality_issues: "< 1%"
```

### 3.3. Critérios de Progressão

```
BACKTEST (Aprovado)
    ↓
    ├── Win Rate >= 52%
    ├── ROI >= 5%
    └── Max DD <= 20%
    ↓
PAPER TRADING (4 semanas)
    ↓
    ├── Win Rate >= 50%
    ├── ROI >= 3%
    └── Fill Rate >= 85%
    ↓
LIVE TRADING - FASE 1 (Stake reduzida)
```

---

## 4. Live Trading - Fase de Validação

### 4.1. Fase 1: Micro Stakes

| Parâmetro | Valor |
|-----------|-------|
| **Stake** | 0.25% da bankroll |
| **Duração** | 4-8 semanas |
| **Bets Mínimas** | 50+ |
| **Max Daily** | 5 bets |

**Critérios de Sucesso:**
- Win Rate >= 48%
- ROI >= 0% (break-even ou positivo)
- Execução sem erros operacionais

### 4.2. Fase 2: Standard Stakes

| Parâmetro | Valor |
|-----------|-------|
| **Stake** | 0.5-1.0% da bankroll |
| **Duração** | 8-12 semanas |
| **Bets Mínimas** | 100+ |
| **Max Daily** | 10 bets |

**Critérios de Sucesso:**
- Win Rate >= 50%
- ROI >= 3%
- Sharpe Ratio >= 1.0

### 4.3. Fase 3: Full Stakes

| Parâmetro | Valor |
|-----------|-------|
| **Stake** | 1.0-2.0% da bankroll |
| **Duração** | Contínuo |
| **Bets Mínimas** | N/A |
| **Max Daily** | 15 bets |

**Pré-requisito:** Aprovação nas Fases 1 e 2

---

## 5. Validação Estatística

### 5.1. Testes Estatísticos Obrigatórios

#### Teste 1: Significância do Win Rate

```typescript
// Hipótese nula: Win Rate = 50% (aleatório)
// Hipótese alternativa: Win Rate > 50%

interface StatisticalTest {
  test: 'binomial_test';
  nullHypothesis: 0.50;
  observedWins: number;
  observedTotal: number;
  significanceLevel: 0.05; // 95% confidence
  
  // Critério: p-value < 0.05 para rejeitar H0
}
```

#### Teste 2: Significância do ROI

```typescript
// Teste t para média do ROI
interface ROITest {
  test: 'one_sample_t_test';
  nullHypothesis: 0; // ROI = 0
  sampleROI: number[];
  significanceLevel: 0.05;
  
  // Critério: p-value < 0.05 e t-statistic > 0
}
```

#### Teste 3: Estacionariedade

```typescript
// Teste para verificar se a estratégia não degradou
interface StationarityTest {
  test: 'mann_kendall';
  data: 'monthly_roi';
  significanceLevel: 0.05;
  
  // Critério: Não deve haver trend negativa significativa
}
```

### 5.2. Análise de Regimes de Mercado

```yaml
regime_analysis:
  description: "Validar performance em diferentes condições"
  
  regimes:
    - name: "High Volatility"
      condition: "odds_variance > 0.3"
      min_samples: 100
    
    - name: "Low Volatility"
      condition: "odds_variance < 0.1"
      min_samples: 100
    
    - name: "Favorite Heavy"
      condition: "avg_favorite_odds < 1.30"
      min_samples: 100
    
    - name: "Competitive"
      condition: "avg_favorite_odds > 1.50"
      min_samples: 100
  
  criterion: "ROI positivo em pelo menos 3 de 4 regimes"
```

---

## 6. Validação de Edge

### 6.1. Cálculo do Edge Esperado

```typescript
// Edge = (Win Rate * Average Odds) - 1
function calculateEdge(winRate: number, avgOdds: number): number {
  return (winRate * avgOdds) - 1;
}

// Exemplo:
// Win Rate: 55%, Avg Odds: 1.90
// Edge = (0.55 * 1.90) - 1 = 0.045 = 4.5%
```

### 6.2. Edge Mínimo por Condição

| Condição | Edge Mínimo | Justificativa |
|----------|-------------|---------------|
| **Overall** | 3% | Edge base da estratégia |
| **Por Superfície** | 1% | Variações naturais |
| **Por Ranking** | 1% | Diferenças de nível |
| **Por Torneio** | 0% | Grand Slams podem variar |

### 6.3. Validação de Fechamento de Linha

```typescript
// Verificar se o edge se mantém após ajuste de linha
interface LineMovementAnalysis {
  openingOdds: number;
  closingOdds: number;
  executionOdds: number;
  
  // Edge deve permanecer positivo mesmo com closing odds
  edgeAtClosing: number;
  
  // Critério: edgeAtClosing >= 0.02 (2%)
}
```

---

## 7. Checklist de Validação

### 7.1. Backtest Checklist

```markdown
## Backtest Validation Checklist

### Dados
- [ ] Período >= 24 meses
- [ ] Sample size >= 1000 bets
- [ ] Dados de odds verificados
- [ ] Dados de placar point-by-point
- [ ] Cross-reference de fontes

### Métricas
- [ ] Win Rate >= 52%
- [ ] ROI >= 5%
- [ ] Profit Factor >= 1.20
- [ ] Max Drawdown <= 20%
- [ ] Sharpe Ratio >= 1.0
- [ ] Recovery Factor >= 2.0

### Robustez
- [ ] Sensibilidade a parâmetros testada
- [ ] Walk-forward analysis completado
- [ ] Monte Carlo simulation (10k iterações)
- [ ] Análise por regime de mercado
- [ ] Testes estatísticos de significância

### Documentação
- [ ] Relatório de backtest gerado
- [ ] Gráficos de equity curve
- [ ] Análise de drawdown periods
- [ ] Breakdown por superfície/torneio
```

### 7.2. Paper Trading Checklist

```markdown
## Paper Trading Checklist

### Configuração
- [ ] Sistema configurado com latência realista
- [ ] Múltiplas bookmakers integradas
- [ ] Alertas de execução configurados
- [ ] Logging completo ativado

### Execução
- [ ] Fill rate >= 85%
- [ ] Latência média < 3s
- [ ] Slippage médio < 5%
- [ ] Zero erros críticos

### Performance
- [ ] Win Rate >= 50%
- [ ] ROI >= 3%
- [ ] Max Drawdown <= 15%
- [ ] Mínimo 100 signals

### Operacional
- [ ] Zero falsos positivos
- [ ] Uptime >= 99%
- [ ] Data quality issues < 1%
```

### 7.3. Live Trading Checklist

```markdown
## Live Trading Checklist - Fase 1

### Pré-Lançamento
- [ ] Backtest aprovado
- [ ] Paper trading aprovado
- [ ] Risk parameters configurados
- [ ] Stop losses configurados
- [ ] Alertas configurados

### Durante Fase 1
- [ ] Stake 0.25% respeitada
- [ ] Max 5 bets/dia
- [ ] Daily P&L monitorado
- [ ] Weekly review completado

### Critérios de Sucesso
- [ ] Win Rate >= 48%
- [ ] ROI >= 0%
- [ ] Zero erros operacionais
- [ ] Drawdown <= 10%
```

---

## 8. Critérios de Falha e Rollback

### 8.1. Gatilhos de Falha

| Condição | Ação | Threshold |
|----------|------|-----------|
| **Backtest Fail** | Não prosseguir | ROI < 0 ou WR < 48% |
| **Paper Trading Fail** | Revisar estratégia | ROI < 0 por 4 semanas |
| **Live Fase 1 Fail** | Reduzir stake | Drawdown > 15% |
| **Live Fase 2 Fail** | Pausar estratégia | ROI < -5% |
| **Live Fase 3 Fail** | Desativar | 3 meses consecutivos negativos |

### 8.2. Procedimento de Rollback

```
1. Detectar falha (automático ou manual)
2. Pausar novas entradas (imediato)
3. Analisar causa raiz (24-48h)
4. Decidir: Ajustar parâmetros OU Desativar
5. Documentar lições aprendidas
6. Comunicar stakeholders
```

---

## 9. Relatórios e Monitoramento Contínuo

### 9.1. Relatórios Obrigatórios

| Relatório | Frequência | Conteúdo |
|-----------|------------|----------|
| **Daily Brief** | Diário | P&L, bets do dia, alerts |
| **Weekly Performance** | Semanal | KPIs, drawdown, análise |
| **Monthly Review** | Mensal | Review completo, ajustes |
| **Quarterly Audit** | Trimestral | Auditoria completa |

### 9.2. Dashboard de Monitoramento

```yaml
dashboard_metrics:
  real_time:
    - current_bankroll
    - daily_pnl
    - open_positions
    - today_bets_count
  
  daily:
    - win_rate_mtd
    - roi_mtd
    - max_drawdown_mtd
    - bet_frequency
  
  weekly:
    - sharpe_ratio
    - profit_factor
    - avg_odds
    - surface_breakdown
```

---

## 10. Template de Relatório de Backtest

```markdown
# Backtest Report: TENNIS_FAV_30_0_COMEBACK

## Resumo Executivo
- Período: [DATA_INICIO] - [DATA_FIM]
- Total Bets: [N]
- Win Rate: [X.XX]%
- ROI: [X.XX]%
- Max Drawdown: [X.XX]%

## Métricas Detalhadas
[Inserir tabela completa]

## Equity Curve
[Inserir gráfico]

## Análise por Superfície
[Inserir breakdown]

## Análise por Ranking
[Inserir breakdown]

## Testes Estatísticos
- Binomial Test: p-value = [X.XXXX]
- T-Test ROI: p-value = [X.XXXX]

## Conclusão
[APROVADO / REPROVADO / REVISAR]
```

---

## 11. Referências

1. [Quantitative Trading - Ernest Chan](https://www.amazon.com/Quantitative-Trading-Build-Algorithmic-Strategies/dp/0470284889)
2. [Expected Returns - Antti Ilmanen](https://www.amazon.com/Expected-Returns-Investors-Guide-Markets/dp/1119990726)
3. [Advances in Financial Machine Learning - Marcos López de Prado](https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089)

---

**Documento criado:** 2026-02-17  
**Próxima revisão:** Após primeiro backtest completo  
**Responsável:** @strategy-lead, @backtest-engine
