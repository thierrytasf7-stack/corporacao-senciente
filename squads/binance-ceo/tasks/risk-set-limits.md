# Risk Set Limits

```yaml
task:
  name: risk-set-limits
  agent: binance-risk-manager
  elicit: true
  description: Definir ou ajustar limites de risco para operacoes e portfolio
```

## Elicitation

1. **Escopo?** [Global / Por estrategia / Por ativo]
2. **Ajustar o que?** [Position size / Stop loss / Drawdown / Alavancagem / Todos]
3. **Perfil de risco?** [Conservador / Moderado / Agressivo]

## Profiles

### Conservador
- Risk per trade: 0.5%
- Max position: 5%
- Max drawdown daily: 2%
- Max leverage: 2x
- Max open positions: 3

### Moderado (Default)
- Risk per trade: 1%
- Max position: 10%
- Max drawdown daily: 5%
- Max leverage: 5x
- Max open positions: 5

### Agressivo
- Risk per trade: 2%
- Max position: 15%
- Max drawdown daily: 8%
- Max leverage: 10x
- Max open positions: 8

## Workflow

1. Revisar limites atuais
2. Propor novos limites baseado no perfil
3. Calcular impacto nos trades ativos
4. Confirmar com CEO
5. Atualizar `strategy-risk-configs.json`

## Codebase References

- Risk configs: `modules/binance-bot/backend/data/strategy-risk-configs.json`
- Risk form: `modules/binance-bot/frontend/src/components/strategies/RiskParametersForm.tsx`
