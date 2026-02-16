---
task: Execute Instant Bet
tipo: "instant-betting"
responsavel: "@instant-bettor"
atomic_layer: task
Entrada: |
  - event: Evento esportivo ao vivo
  - market: Mercado de aposta (1X2, Over/Under, etc)
  - selection: Seleção específica
  - odds: Odds oferecidas
  - stake: Valor da aposta
  - bookmaker: Casa de apostas
  - live_data: Dados ao vivo do evento
  - risk_assessment: Avaliação de risco
Saida: |
  - bet_id: ID da aposta colocada
  - confirmation: Confirmação da bookmaker
  - timestamp: Momento da execução
  - actual_odds: Odds reais obtidas
  - execution_time: Tempo de execução
  - status: Status da aposta
---

# instant-bet

Executa aposta instantânea em bookmaker durante eventos ao vivo após validação de odds, stake e risco.

## Processo

1. Validar parâmetros de entrada e dados ao vivo
2. Verificar odds ainda disponíveis e movimento recente
3. Calcular stake final baseado em bankroll e risco
4. Executar aposta via API da bookmaker com timeout curto
5. Confirmar execução e registrar com timestamp preciso
6. Notificar live-lead e risk-calculator
7. Atualizar dashboard de operações ao vivo

## Critérios de Aceitação

- [ ] Aposta executada com sucesso em até 2 segundos
- [ ] Odds dentro do limite aceitável (±5%)
- [ ] Stake não excede limites de risco em tempo real
- [ ] Confirmação registrada no sistema com timestamp
- [ ] Execução documentada no log de operações