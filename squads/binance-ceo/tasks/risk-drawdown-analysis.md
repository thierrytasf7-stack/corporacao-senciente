# Risk Drawdown Analysis

```yaml
task:
  name: risk-drawdown-analysis
  agent: binance-risk-manager
  elicit: false
  description: Analise de drawdown atual e historico do portfolio
```

## Workflow

### 1. Current Drawdown
- Calcular drawdown atual vs ATH (all-time high)
- Drawdown do dia
- Drawdown da semana
- Drawdown do mes

### 2. Historical Analysis
- Max drawdown historico (valor e data)
- Duracao media dos drawdowns
- Recovery time medio
- Frequencia de drawdowns > 5%

### 3. Strategy Attribution
- Qual estrategia contribuiu mais para drawdown
- Trades que causaram maiores perdas
- Periodos de mercado vs drawdown

### 4. Stress Scenarios
- Se BTC cai 10%: impacto estimado
- Se BTC cai 20%: impacto estimado
- Se altcoins caem 30%: impacto estimado
- Flash crash (-50% em minutos)

### 5. Recommendations
- Proximidade dos limites de risco
- Acoes necessarias (reduzir, hedge, pausar)
- Ajuste de limites se necessario

## Codebase References

- Performance monitor: `modules/binance-bot/backend/src/monitoring/PerformanceMonitor.ts`
- Position history: `modules/binance-bot/frontend/src/components/positions/PositionsHistoryPanel.tsx`
