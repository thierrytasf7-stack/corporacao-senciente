# Arquitetura: Testnet Bet Ecosystem

## 1. Visão Geral
Arquitetura baseada em eventos e micro-kernels, projetada para alta concorrência e isolamento. O sistema opera como um "Game Server" onde o mercado é o ambiente e os bots são os jogadores.

## 2. Componentes Principais

### 2.1. Core System (Rust/Node.js)
- **Market Engine (Event Bus):**
  - Recebe updates de odds (WebSocket/Polling).
  - Publica evento `MARKET_UPDATE` para todos os bots inscritos.
- **Execution Engine:**
  - Recebe ordens de aposta dos bots.
  - Valida saldo e limites.
  - Simula matching e registra a "Open Position".
- **Settlement Engine:**
  - Escuta resultados de jogos.
  - Calcula P&L e atualiza saldo das carteiras.

### 2.2. Bot Runner (Workers Isolados)
- Cada bot roda em uma "Sandbox" lógica (pode ser thread leve ou processo isolado).
- **Ciclo de Vida do Bot:**
  1. `Initialize(DNA)`: Carrega configs.
  2. `OnMarketUpdate(Event)`: Avalia oportunidade.
  3. `Decide()`: Aplica lógica de Betting e Matemática.
  4. `Execute()`: Envia ordem para o Core.

### 2.3. Data Layer (PostgreSQL)
- **Tables:**
  - `bots`: ID, DNA (JSONB), Status, Parent_ID (para evolução).
  - `wallets`: Bot_ID, Balance, Currency.
  - `bets`: Bot_ID, Match_ID, Selection, Odds, Stake, Status, Result.
  - `market_data`: Snapshot do mercado no momento da aposta (para auditoria).
  - `logs`: Logs estruturados de decisão (por que apostou/não apostou).

## 3. DNA Schema (Exemplo JSON)
```json
{
  "id": "bot-gen1-042",
  "genes": {
    "math": {
      "type": "kelly_criterion",
      "params": { "fraction": 0.25, "max_stake_percent": 0.05 }
    },
    "betting": {
      "type": "value_bet_model_v1",
      "params": { "min_edge": 0.03, "min_odds": 1.80, "markets": ["1x2", "ah"] }
    },
    "risk": {
      "stop_loss_daily": 0.10,
      "max_open_bets": 5
    }
  },
  "metadata": {
    "generation": 1,
    "parent": null
  }
}
```

## 4. Fluxo de Evolução (Genetic Algorithm)
1. **Selection:** A cada N dias (ou jogos), o sistema avalia o ROI.
2. **Culling:** Bots com pior performance são arquivados.
3. **Crossover/Mutation:** Bots top-tier têm seus parâmetros ligeiramente alterados (mutação) ou combinados para gerar nova população.
4. **Respawn:** Nova geração inicia com saldo resetado (ou herdado).

## 5. Stack Tecnológico Sugerido
- **Backend:** Node.js (TypeScript) ou Rust para o Core Engine (performance).
- **Database:** PostgreSQL (dados relacionais + JSONB para DNA).
- **Communication:** Redis Pub/Sub ou Node.js EventEmitters (se monolito modular).
- **Frontend:** React (Dashboard de Monitoramento da "Arena").
