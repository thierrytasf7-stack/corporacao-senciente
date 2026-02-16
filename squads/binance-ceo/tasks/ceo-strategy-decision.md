# CEO Strategy Decision

```yaml
task:
  name: ceo-strategy-decision
  agent: binance-ceo
  elicit: true
  description: Avaliacao e decisao sobre ativacao/desativacao de estrategias de trading
```

## Elicitation

1. **Acao?** [Ativar nova / Desativar existente / Ajustar parametros]
2. **Qual estrategia?** [Nome ou ID]
3. **Capital a alocar?** [% do portfolio]

## Workflow

### 1. Strategy Assessment
- Revisar resultados do backtest (delegar para @quant se necessario)
- Verificar performance historica em producao
- Analisar condicoes atuais de mercado vs requisitos da estrategia

### 2. Risk Evaluation
- Delegar para @risk-manager avaliar impacto no portfolio
- Verificar correlacao com estrategias ja ativas
- Confirmar limites de risco respeitados

### 3. Decision Matrix

| Criterio | Peso | Score |
|----------|------|-------|
| Backtest Performance | 25% | /10 |
| Risk/Reward | 20% | /10 |
| Market Conditions | 20% | /10 |
| Diversificacao | 15% | /10 |
| Robustez (out-of-sample) | 20% | /10 |

### 4. Final Decision
- APROVADO: Delegar execucao para @trader
- REJEITADO: Documentar motivo, sugerir ajustes
- PENDENTE: Solicitar mais dados do @quant ou @analyst

## Codebase References

- Strategy configs: `modules/binance-bot/backend/data/trading-strategies.json`
- Strategy controller: `modules/binance-bot/backend/src/controllers/StrategyController.ts`
- Backtest: `modules/binance-bot/backend/src/controllers/BacktestController.ts`
- Risk configs: `modules/binance-bot/backend/data/strategy-risk-configs.json`
