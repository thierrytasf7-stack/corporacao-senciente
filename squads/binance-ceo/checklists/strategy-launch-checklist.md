# Strategy Launch Checklist

Checklist para lancamento de nova estrategia em producao.

## Backtest Validation
- [ ] Minimo 200 trades no backtest
- [ ] Sharpe Ratio > 1.0
- [ ] Win Rate > 50%
- [ ] Profit Factor > 1.5
- [ ] Max Drawdown < 15%
- [ ] Walk-forward validation passed
- [ ] Performance consistente em bull/bear/lateral

## Risk Assessment
- [ ] Position sizing definido
- [ ] Stop loss rules definidos
- [ ] Take profit rules definidos
- [ ] Max drawdown da estrategia definido
- [ ] Correlacao com estrategias ativas verificada
- [ ] Impacto no portfolio avaliado pelo Risk Manager

## Technical Readiness
- [ ] Strategy JSON valido e completo
- [ ] Indicadores implementados e testados
- [ ] Triggers configurados
- [ ] API endpoints funcionando
- [ ] Logs configurados

## Approval
- [ ] Quant assinou backtest report
- [ ] Risk Manager aprovou limites
- [ ] CEO aprovou lancamento
- [ ] Capital alocado definido

## Post-Launch
- [ ] Paper trading periodo completado (min 7 dias)
- [ ] Resultados paper trade dentro dos parametros
- [ ] Monitoramento intensivo ativado
- [ ] Alertas configurados
- [ ] Revisao semanal agendada
