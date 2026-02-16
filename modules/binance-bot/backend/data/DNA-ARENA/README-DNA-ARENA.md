# DNA ARENA - Competitive Trading Engine

## Conceito

3 bots competem com estratégias matemáticas diferentes (dupla camada) usando $100 de bankroll virtual cada.
Paper trading com **preços REAIS** do Binance Futures Testnet.

**Objetivo:** $100 → $10,000

## Os 3 Bots

### Hydra (Alpha)
- **L1:** Anti-Martingale (aumenta bet após win)
- **L2:** Martingale (aumenta bet após loss streak)
- **Trading:** Momentum (EMA crossover + RSI confirmation)
- **Leverage:** 50x | TP: 0.15% | SL: 0.10%
- **Perfil:** Agressivo, alta frequência

### Phoenix (Beta)
- **L1:** Fibonacci (bet sizes seguem sequência Fibonacci)
- **L2:** Anti-Martingale (escala após winning streaks)
- **Trading:** Mean Reversion (RSI extremos + Stochastic)
- **Leverage:** 40x | TP: 0.20% | SL: 0.12%
- **Perfil:** Conservador, alta win rate

### Cerberus (Gamma)
- **L1:** Kelly Criterion (fração ótima do bankroll)
- **L2:** D'Alembert (incremento linear após loss)
- **Trading:** Trend Following (EMA alignment + Volume + Momentum)
- **Leverage:** 30x | TP: 0.25% | SL: 0.15%
- **Perfil:** Balanceado, data-driven

## API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/dna-arena/start` | POST | Inicia a arena |
| `/api/v1/dna-arena/stop` | POST | Para a arena |
| `/api/v1/dna-arena/status` | GET | Status completo (bots, posições, trades) |
| `/api/v1/dna-arena/leaderboard` | GET | Ranking dos bots |
| `/api/v1/dna-arena/sessions` | GET | Lista sessões DNA salvas |
| `/api/v1/dna-arena/sessions/:id` | GET | Detalhes de uma sessão |

## Regras do Bankroll

1. Cada bot começa com **$100**
2. Todas posições abertas **não podem exceder o bankroll**
3. Bet sizing é calculado pela **estratégia dupla camada**
4. Se bankroll chega a **$0**: registra DNA session, reinicia com $100
5. Se bankroll chega a **$10,000**: evolui, gera filhos, reinicia

## Sistema de Evolução (DNA)

1. Bot que atinge $10,000 é o **vencedor**
2. Vencedor gera **child DNA** com mutações nos parâmetros
3. Child substitui o **pior bot** da arena
4. Mutações afetam: TP/SL, leverage, min signal, bet sizing
5. Gerações se acumulam, melhores genes sobrevivem

## Sessões DNA

Cada vez que um bot morre ($0) ou vence ($10k), uma sessão é salva em `data/DNA-ARENA/sessions/`:
- Configuração completa do DNA
- Histórico de trades
- Métricas de performance (Sharpe, Profit Factor, etc.)
- Reason: BANKRUPT | GOAL_REACHED | STOPPED

## Monitoramento

```bash
# Status rápido
curl http://localhost:21341/api/v1/dna-arena/leaderboard

# Status detalhado
python scripts/check-dna-status.py
```

## Arquitetura

```
CompetitiveDNAEngine.ts     → Motor principal (3 bots, cycles, evolution)
CompetitiveDNAController.ts → REST API
real-server.ts              → Wiring das rotas
data/DNA-ARENA/             → Dados persistentes
  ├── sessions/             → Sessões DNA salvas
  ├── leaderboard.json      → Estado atual
  └── README-DNA-ARENA.md   → Este arquivo
```

## Símbolos Operados

BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT

## Ciclo de Operação

1. A cada 6 segundos, cada bot:
   - Monitora posições abertas para TP/SL
   - Verifica se bankroll > $0 (senão: BANKRUPT)
   - Verifica se bankroll >= $10,000 (senão: GOAL_REACHED)
   - Escaneia sinais de trading
   - Calcula bet amount (Layer 1 * Layer 2)
   - Abre posição se signal >= minSignalStrength

---

*DNA Arena v1.0 | Paper Trading with Real Prices*
