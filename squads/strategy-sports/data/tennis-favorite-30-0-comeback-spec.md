# Especificação Técnica: Favorite 30-0 Comeback

**ID da Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 1.0.0  
**Data de Criação:** 2026-02-17  
**Squad Responsável:** strategy-sports  
**Status:** `DRAFT` → `PENDING_VALIDATION` → `APPROVED` → `LIVE`

---

## 1. Visão Geral

### 1.1. Descrição

Estratégia de apostas live para tênis que explora oportunidades de valor quando o favorito de uma partida está perdendo um game por 30-0 no próprio saque. A premissa é que jogadores favoritos tendem a reagir positivamente nestas situações, oferecendo odds inflated (>1.70) no mercado de Game Winner.

### 1.2. Hipótese Principal

> **Hipótese:** Favoritos em partidas de tênis possuem taxa de conversão significativamente maior que as odds implícitas quando estão perdendo um game por 30-0 no próprio saque, criando oportunidades de valor positivo.

### 1.3. Premissas

1. O "favorito" é definido pela odd inicial de Match Winner (menor odd)
2. O favorito está sacando no momento do gatilho
3. O placar do game atual é exatamente 30-0 contra o favorito
4. O mercado de Game Winner está disponível com odd >= 1.70

---

## 2. Regras de Entrada (Trigger Conditions)

### 2.1. Critérios Obrigatórios

| Critério | Valor | Descrição |
|----------|-------|-----------|
| **Esporte** | `TENNIS` | Apenas partidas de tênis |
| **Mercado** | `GAME_WINNER` | Vitória no game atual |
| **Sacador** | `FAVORITE` | Jogador favorito deve estar sacando |
| **Placar do Game** | `30-0` | Favorito perdendo por 30-0 no game |
| **Odd Mínima** | `1.70` | Odd decimal mínima para entrada |
| **Tipo de Partida** | `ATP`, `WTA`, `Grand Slam` | Torneios profissionais |

### 2.2. Condições de Filtro Adicionais (Opcionais)

| Filtro | Valor Padrão | Descrição |
|--------|--------------|-----------|
| **Ranking Máximo** | `100` | Ambos jogadores no top 100 |
| **Diferença de Ranking** | `50` | Diferença mínima de ranking |
| **Superfície** | `ALL` | Todas as superfícies (clay, grass, hard) |
| **Rodada Mínima** | `R1` | Primeira rodada ou superior |
| **Odd Inicial Favorito** | `1.01 - 1.50` | Faixa de odd para definir favorito claro |

### 2.3. Lógica de Trigger (Pseudocódigo)

```typescript
function shouldTriggerBet(match: TennisMatch, liveScore: LiveScore): boolean {
  // 1. Verifica esporte
  if (match.sport !== 'TENNIS') return false;
  
  // 2. Identifica favorito (menor odd pré-jogo)
  const favorite = match.preMatchOdds.home < match.preMatchOdds.away 
    ? match.homePlayer 
    : match.awayPlayer;
  
  // 3. Verifica se favorito está sacando
  const isFavoriteServing = liveScore.server === favorite;
  if (!isFavoriteServing) return false;
  
  // 4. Verifica placar do game atual (30-0 contra favorito)
  const gameScore = parseGameScore(liveScore.gameScore);
  const isThirtyLoveAgainstFavorite = 
    gameScore.favoritePoints === 0 && 
    gameScore.underdogPoints === 2; // 30 = 2 pontos
  
  if (!isThirtyLoveAgainstFavorite) return false;
  
  // 5. Verifica odd do mercado Game Winner
  const gameWinnerOdd = liveScore.markets.gameWinner[favorite.id];
  if (!gameWinnerOdd || gameWinnerOdd < 1.70) return false;
  
  // 6. Filtros adicionais (opcional)
  if (!passesAdditionalFilters(match, favorite)) return false;
  
  return true;
}
```

---

## 3. Mecânica da Aposta

### 3.1. Seleção do Mercado

```typescript
interface GameWinnerMarket {
  marketType: 'GAME_WINNER';
  selections: {
    playerId: string;
    playerName: string;
    odds: number;
  }[];
}
```

**Mercado Alvo:** Game Winner (Vencedor do Game Atual)

**Seleção:** Jogador favorito (mesmo que esteja perdendo 30-0)

### 3.2. Critérios de Odd

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| **Odd Mínima** | 1.70 | Garante valor potencial (>41.2% implied probability) |
| **Odd Máxima** | 3.50 | Evita situações de risco extremo |
| **Odd Ideal** | 1.80 - 2.50 | Faixa de maior valor esperado |

### 3.3. Timing de Entrada

```
Timeline do Game de Tênis:
├── 0-0   → Aguardar
├── 15-0  → Aguardar (contra favorito)
├── 30-0  → ✅ GATILHO (contra favorito) - ENTRAR
├── 40-0  → Muito tarde (odd já caiu)
├── Deuce → Situação diferente (não se aplica)
└── Game  → Finalizado
```

**Janela de Entrada:** Máximo 30 segundos após o placar marcar 30-0

---

## 4. Gestão de Stake

### 4.1. Métodos de Staking Suportados

#### Método 1: Stake Fixa (Conservador)
```typescript
stake = BASE_STAKE; // Ex: 1% da bankroll
```

#### Método 2: Stake Percentual (Moderado)
```typescript
stake = bankroll * STAKE_PERCENT; // Ex: 1-2%
```

#### Método 3: Kelly Fractional (Agressivo)
```typescript
// Fórmula: f = (bp - q) / b
// Onde: b = odds - 1, p = probabilidade real, q = 1 - p
const b = odds - 1;
const p = estimatedWinProbability; // Baseado em histórico
const q = 1 - p;
const kellyFraction = (b * p - q) / b;
const stake = bankroll * kellyFraction * KELY_MULTIPLIER; // Ex: 0.25 (quarter Kelly)
```

### 4.2. Parâmetros Recomendados

| Método | Stake | Kelly Multiplier | Max Stake | Uso Recomendado |
|--------|-------|------------------|-----------|-----------------|
| **Conservador** | 0.5% | N/A | 0.5% | Validação inicial |
| **Moderado** | 1.0% | N/A | 1.5% | Operação padrão |
| **Agressivo** | N/A | 0.25 | 2.0% | Após validação |

---

## 5. Gestão de Risco

### 5.1. Limites Operacionais

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Max Stake por Aposta** | 2% | Limite máximo por bet |
| **Max Exposição por Partida** | 3 bets | Máximo de 3 entradas por match |
| **Max Exposição por Dia** | 10 bets | Limite diário de operações |
| **Max Drawdown Diário** | 5% | Stop loss diário |
| **Max Drawdown Semanal** | 15% | Stop loss semanal |

### 5.2. Critérios de Exclusão (Exclusion Rules)

```typescript
const exclusionRules = {
  // Não apostar se:
  'injury_timeout': match.hasInjuryTimeout,
  'weather_delay': match.hasWeatherDelay,
  'retirement_risk': player.hasRecentInjury,
  'surface_mismatch': favorite.surfaceWinRate < 0.50,
  'fatigue_factor': player.matchesLast7Days > 3,
  'odd_movement_suspicious': Math.abs(oddsChange) > 0.30
};
```

### 5.3. Níveis de Risco

| Nível | Critérios | Max Stake | Confidence Min |
|-------|-----------|-----------|----------------|
| **LOW** | Top 20, superfície forte | 1.5% | 65% |
| **MEDIUM** | Top 50, superfície OK | 1.0% | 55% |
| **HIGH** | Top 100, superfície fraca | 0.5% | 45% |

---

## 6. Critérios de Saída

### 6.1. Saída Natural

A aposta é resolvida naturalmente quando:
- O game é concluído (jogador favorito ganha ou perde o game)
- Não há cashout disponível para este mercado

### 6.2. Cashout (Opcional - Se Disponível)

| Situação | Ação | Condição |
|----------|------|----------|
| **Deuce após 30-0** | Avaliar cashout | Se odd caiu < 1.40 |
| **40-30 Favorito** | Manter | Aguardar resolução |
| **Break Point Contra** | Cashout Parcial | 50% da posição |

---

## 7. Estrutura de Dados

### 7.1. Schema de Entrada

```typescript
interface TennisFavorite30ComebackSignal {
  // Identificação
  signalId: string;
  strategyId: 'TENNIS_FAV_30_0_COMEBACK';
  timestamp: Date;
  
  // Partida
  match: {
    matchId: string;
    tournament: string;
    surface: 'CLAY' | 'GRASS' | 'HARD' | 'CARPET';
    round: string;
    homePlayer: Player;
    awayPlayer: Player;
  };
  
  // Favorito
  favorite: {
    playerId: string;
    name: string;
    ranking: number;
    preMatchOdds: number;
    isServing: boolean;
  };
  
  // Placar
  score: {
    gameScore: '30-0';
    favoritePoints: 0;
    underdogPoints: 2;
    currentServer: string;
    setScore: string;
    gameNumber: number;
  };
  
  // Mercado
  market: {
    marketType: 'GAME_WINNER';
    selection: string; // ID do favorito
    odds: number;
    oddsTimestamp: Date;
  };
  
  // Metadados
  metadata: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number;
    exclusionChecks: Record<string, boolean>;
  };
}
```

### 7.2. Schema de Resultado

```typescript
interface TennisFavorite30ComebackResult {
  signalId: string;
  betId?: string;
  stake: number;
  odds: number;
  result: 'WIN' | 'LOSS' | 'VOID';
  profit: number;
  settlementDate: Date;
  
  // Análise pós-jogo
  analysis: {
    actualWinProbability: number;
    edgeRealized: number;
    gameDuration: number; // segundos
    pointsWonAfter30_0: number;
    maxPressurePoint: string; // Ex: "Deuce", "Break Point"
  };
}
```

---

## 8. Integrações Necessárias

### 8.1. Fontes de Dados

| Sistema | Finalidade | Prioridade |
|---------|------------|------------|
| **Live Score API** | Placar em tempo real | CRÍTICA |
| **Odds Feed** | Odds Game Winner | CRÍTICA |
| **Player Database** | Ranking, histórico | ALTA |
| **Match Statistics** | Stats em tempo real | MÉDIA |

### 8.2. APIs Recomendadas

```yaml
providers:
  live_score:
    - SportRadar
    - Genius Sports
    - BetGenius
  
  odds_feed:
    - OddsAPI
    - TheOddsAPI
    - Betfair API
  
  player_data:
    - ATP Tour API
    - WTA Tour API
    - ITF API
```

---

## 9. Dependências Técnicas

### 9.1. Módulos do Sistema

```
dependencies:
  - modules/betting-platform/backend/services/StrategyService
  - modules/betting-platform/backend/services/BacktestingService
  - modules/betting-platform/backend/types/strategy-types
  - squads/live-betting/agents/match-monitor
  - squads/live-betting/agents/instant-bettor
```

### 9.2. Configuração Required

```yaml
strategy_config:
  tennis_favorite_30_0_comeback:
    enabled: false  # Começa desativado até validação
    min_odds: 1.70
    max_odds: 3.50
    stake_method: 'percentage'
    stake_percent: 1.0
    max_daily_bets: 10
    max_match_exposure: 3
    exclusion_rules:
      injury_timeout: true
      weather_delay: true
      fatigue_factor: true
```

---

## 10. Métricas de Sucesso

### 10.1. KPIs Primários

| KPI | Target | Período |
|-----|--------|---------|
| **Win Rate** | > 55% | 500+ bets |
| **ROI** | > 8% | 500+ bets |
| **Average Odds** | 1.80 - 2.20 | Por bet |
| **Sharpe Ratio** | > 1.5 | Mensal |

### 10.2. KPIs Secundários

| KPI | Target | Descrição |
|-----|--------|-----------|
| **Bet Frequency** | 5-15/dia | Volume sustentável |
| **Fill Rate** | > 85% | Odds capturadas |
| **Latency** | < 2s | Trigger → Bet |
| **Edge Detection** | > 5% | Valor médio detectado |

---

## 11. Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-02-17 | Strategy-Sports | Criação inicial |

---

## 12. Aprovações

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| **Strategy Lead** | @strategy-lead | `PENDING` | - |
| **Quant Sports** | @quant-sports | `PENDING` | - |
| **Risk Manager** | @risk-manager | `PENDING` | - |
| **Tech Lead** | @tech-lead | `PENDING` | - |

---

## Anexos

### A. Glossário

| Termo | Definição |
|-------|-----------|
| **Favorite** | Jogador com menor odd pré-jogo |
| **Game Winner** | Mercado de quem vence o game atual |
| **30-0** | Placar de pontos: 30 para recebedor, 0 para sacador |
| **Hold** | Quando sacador vence o próprio game |
| **Break** | Quando recebedor vence o game do sacador |

### B. Referências

1. [ATP Statistics](https://www.atptour.com/en/stats)
2. [Tennis Abstract](https://www.tennisabstract.com/)
3. [Match Charting Project](https://www.tennisabstract.com/charting/)
