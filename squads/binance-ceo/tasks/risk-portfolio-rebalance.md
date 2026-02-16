# Risk Portfolio Rebalance

```yaml
task:
  name: risk-portfolio-rebalance
  agent: binance-risk-manager
  elicit: true
  description: Calcular e propor rebalanceamento do portfolio
```

## Elicitation

1. **Alocacao alvo?** [Equal weight / Market cap weighted / Custom]
2. **Threshold de rebalanceamento?** [5% / 10% / 15% desvio]
3. **Executar ou apenas simular?** [Simular / Executar via @trader]

## Workflow

### 1. Current Allocation
- Listar ativos e pesos atuais
- Comparar com alocacao alvo
- Identificar desvios

### 2. Rebalance Calculation
- Calcular trades necessarios
- Estimar custos de transacao
- Verificar se desvio justifica custo

### 3. Risk Check
- Verificar impacto na correlacao
- Verificar concentracao pos-rebalance
- Confirmar limites respeitados

### 4. Proposal
- Tabela: ativo, peso atual, peso alvo, acao (buy/sell), quantidade
- Custo estimado de transacao
- Melhoria esperada no risk-adjusted return

### 5. Execution (se aprovado)
- Delegar para @trader executar as ordens
- Monitorar execucao
- Confirmar alocacao final

## Codebase References

- Portfolio controller: `modules/binance-bot/backend/src/controllers/PortfolioController.ts`
- Portfolio routes: `modules/binance-bot/backend/src/routes/portfolio.ts`
- Dashboard: `modules/binance-bot/frontend/src/components/dashboard/PortfolioOverview.tsx`
