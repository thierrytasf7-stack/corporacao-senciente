---
task: Execute Bet
responsavel: "@bettor"
atomic_layer: task
Entrada: |
  - event: Evento esportivo
  - market: Mercado de aposta (1X2, Over/Under, etc)
  - selection: Seleção específica
  - odds: Odds oferecidas
  - stake: Valor da aposta
  - bookmaker: Casa de apostas
Saida: |
  - bet_id: ID da aposta colocada
  - confirmation: Confirmação da bookmaker
  - timestamp: Momento da execução
  - actual_odds: Odds reais obtidas
---

# bettor-execute-bet

Executa aposta em bookmaker após validação de odds, stake e risco.

## Processo

1. Validar parâmetros de entrada
2. Verificar odds ainda disponíveis
3. Calcular stake final baseado em bankroll
4. Executar aposta via API da bookmaker
5. Confirmar execução e registrar
6. Notificar betting-ceo e bankroll-manager

## Critérios de Aceitação

- [ ] Aposta executada com sucesso
- [ ] Odds dentro do limite aceitável (±5%)
- [ ] Stake não excede limites de risco
- [ ] Confirmação registrada no sistema
