# Estratégia: Favorite 30-0 Comeback

**ID da Estratégia:** `TENNIS_FAV_30_0_COMEBACK`  
**Versão:** 2.0.0 (Refatorada - Separação Arquitetural)  
**Status:** `DRAFT`  
**Squad Responsável:** strategy-sports  
**Data de Criação:** 2026-02-17  
**Data de Refatoração:** 2026-02-17  

---

## 🎯 Separação Arquitetural

### Princípio Fundamental

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTRATÉGIA vs GESTÃO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ESTRATÉGIA (WHAT)              GESTÃO (HOW MUCH)              │
│  ─────────────────              ───────────────────             │
│  • O que fazer                  • Quanto arriscar              │
│  • Quando entrar                • Qual stake usar              │
│  • Qual mercado                 • Qual % da bankroll           │
│  • Qual trigger                 • Quais limites de perda       │
│  • Qual lógica                  • Quais circuit breakers       │
│                                                                 │
│  → LÓGICA PURA                  → PARÂMETROS INJETÁVEIS        │
│  → IMUTÁVEL                     → CONFIGURÁVEL                 │
│  → REUTILIZÁVEL                 → AJUSTÁVEL POR PERFIL         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Por Que Separar?

1. **Reusabilidade:** A mesma lógica de estratégia pode ser usada com diferentes perfis de risco
2. **Manutenibilidade:** Mudanças na gestão não afetam a lógica da estratégia
3. **Testabilidade:** Backtest da lógica é separado da otimização de parâmetros
4. **Composabilidade:** Múltiplas estratégias compartilham a mesma camada de gestão

### Estrutura de Arquivos

```
squads/strategy-sports/
├── strategy/                              # ESTRATÉGIA PURA
│   └── tennis-favorite-30-0-comeback.md   # Lógica, triggers, regras
│
└── config/
    └── management/                        # GESTÃO (INJETÁVEL)
        └── tennis-favorite-30-0-comeback-config.yaml
            # Stake, bankroll, limites, circuit breakers
```

---

## 📋 Visão Geral da Estratégia

### Descrição

Estratégia de apostas live para tênis que identifica oportunidades de valor quando o **favorito de uma partida está perdendo um game por 30-0 no próprio saque**.

### Hipótese

> Jogadores favoritos em partidas de tênis possuem probabilidade real de vencer o game superior à probabilidade implícita nas odds quando estão perdendo por 30-0 no próprio saque.

### Premissas

1. O "favorito" é definido pela menor odd inicial de Match Winner
2. O favorito deve estar sacando no momento do gatilho
3. O placar do game atual deve ser exatamente 30-0 contra o favorito
4. O mercado de Game Winner deve estar disponível

---

## 🎲 Especificação do Trigger

### Condições de Ativação

| Critério | Valor | Tipo | Obrigatório |
|----------|-------|------|-------------|
| **Esporte** | `TENNIS` | Enum | Sim |
| **Mercado** | `GAME_WINNER` | Enum | Sim |
| **Sacador** | `FAVORITE` | Boolean | Sim |
| **Placar do Game** | `30-0` | String | Sim |
| **Pontos do Favorito** | `0` | Integer | Sim |
| **Pontos do Underdog** | `2` | Integer | Sim |

### Lógica de Trigger (Pseudocódigo)

```typescript
function shouldTrigger(match: TennisMatch, liveScore: LiveScore): boolean {
  // 1. Verifica esporte
  if (match.sport !== Sport.TENNIS) {
    return false;
  }

  // 2. Identifica favorito (menor odd pré-jogo)
  const favorite = match.preMatchOdds.home < match.preMatchOdds.away
    ? match.homePlayer
    : match.awayPlayer;

  // 3. Verifica se favorito está sacando
  const isFavoriteServing = liveScore.server === favorite;
  if (!isFavoriteServing) {
    return false;
  }

  // 4. Verifica placar do game atual (30-0 contra favorito)
  const gameScore = parseGameScore(liveScore.gameScore);
  const isThirtyLoveAgainstFavorite =
    gameScore.favoritePoints === 0 &&
    gameScore.underdogPoints === 2; // 30 = 2 pontos

  if (!isThirtyLoveAgainstFavorite) {
    return false;
  }

  // 5. Verifica se mercado Game Winner está disponível
  const gameWinnerMarketAvailable = liveScore.markets.has('GAME_WINNER');
  if (!gameWinnerMarketAvailable) {
    return false;
  }

  // ✅ Todos os critérios atendidos
  return true;
}
```

### Janela Temporal

```
Timeline do Game de Tênis:

0-0    → Aguardar
│
15-0   → Aguardar (contra favorito)
│
30-0   → ✅ GATILHO - Janela de entrada abre
│        Duração máxima: ~30 segundos
│
40-0   → Janela fecha (oportunidade perdida)
│
Deuce  → Situação diferente (não se aplica)
│
Game   → Game finalizado
```

---

## 🚪 Condições de Entrada

### Critérios de Validação

Após o trigger ser ativado, validar:

1. **Mercado Disponível:** Game Winner market está ativo
2. **Seleção Identificada:** Jogador favorito está nas seleções do mercado
3. **Odd Válida:** Odd está dentro do range configurado (injetado pela gestão)
4. **Exclusões:** Nenhuma regra de exclusão se aplica

### Regras de Exclusão (Exclusion Rules)

```typescript
const exclusionRules = {
  // Não entrar se:
  injuryTimeout: match.hasInjuryTimeout,      // Timeout médico ativo
  weatherDelay: match.hasWeatherDelay,        // Atraso por clima
  retirementRisk: player.hasRecentInjury,     // Risco de abandono
  surfaceMismatch: favorite.surfaceWinRate < 0.50,  // Performance ruim na superfície
  fatigueFactor: player.matchesLast7Days > 3,  // Fadiga excessiva
  oddMovementSuspicious: Math.abs(oddsChange) > 0.30  // Movimento suspeito de odds
};
```

### Validação de Entrada

```typescript
interface EntryValidation {
  canEnter: boolean;
  reasons: string[];
  
  checks: {
    triggerActive: boolean;
    marketAvailable: boolean;
    selectionIdentified: boolean;
    oddsValid: boolean;
    exclusionsClear: boolean;
  };
}
```

---

## 🎯 Seleção e Mercado

### Mercado Alvo

```typescript
interface TargetMarket {
  marketType: 'GAME_WINNER';
  description: 'Vencedor do game atual';
  sport: 'TENNIS';
}
```

### Seleção

```typescript
interface Selection {
  playerId: string;
  playerName: string;
  role: 'FAVORITE';  // Sempre apostar no favorito
  condition: 'SERVING_AT_30_0_DOWN';
}
```

### Estrutura do Mercado

```typescript
interface GameWinnerMarket {
  marketId: string;
  matchId: string;
  marketType: 'GAME_WINNER';
  status: 'ACTIVE' | 'SUSPENDED' | 'SETTLED';
  selections: {
    playerId: string;
    playerName: string;
    odds: number;
    oddsTimestamp: Date;
  }[];
}
```

---

## 🚪 Condições de Saída

### Saída Natural

A aposta é resolvida quando:

- **Win:** Favorito vence o game atual
- **Loss:** Favorito perde o game atual
- **Void:** Game não é completado (ex: retirement, walkover)

### Resolução

```typescript
interface BetResolution {
  betId: string;
  signalId: string;
  
  // Resultado
  result: 'WIN' | 'LOSS' | 'VOID';
  
  // Dados do game
  finalScore: string;  // Ex: "40-30", "Deuce", etc.
  gameWinner: string;  // ID do jogador
  pointsWonAfter30_0: number;  // Pontos conquistados após 30-0
  
  // Settlement
  settledAt: Date;
  profit: number;  // Positivo para win, negativo para loss
}
```

---

## 📊 Schema de Dados

### Signal Schema

```typescript
interface TennisFavorite30ComebackSignal {
  // Identificação
  signalId: string;              // UUID único
  strategyId: 'TENNIS_FAV_30_0_COMEBACK';
  version: string;               // Versão da estratégia
  timestamp: Date;               // Quando o signal foi gerado

  // Partida
  match: {
    matchId: string;
    tournament: {
      id: string;
      name: string;
      tier: 'ATP' | 'WTA' | 'GRAND_SLAM' | 'MASTERS' | 'CHALLENGER';
    };
    surface: 'CLAY' | 'GRASS' | 'HARD' | 'CARPET';
    round: string;               // Ex: "R1", "QF", "SF", "F"
    homePlayer: Player;
    awayPlayer: Player;
    status: 'LIVE' | 'SUSPENDED';
  };

  // Favorito
  favorite: {
    playerId: string;
    name: string;
    ranking: number;
    preMatchOdds: number;        // Odd inicial de Match Winner
    isServing: boolean;
  };

  // Placar
  score: {
    gameScore: '30-0';           // Placar atual do game
    favoritePoints: 0;           // 0 pontos
    underdogPoints: 2;           // 30 = 2 pontos
    currentServer: string;       // ID de quem está sacando
    setScore: string;            // Ex: "6-4, 3-2"
    gameNumber: number;          // Número do game no set
  };

  // Mercado
  market: {
    marketType: 'GAME_WINNER';
    marketId: string;
    selection: {
      playerId: string;
      odds: number;
    };
    oddsTimestamp: Date;
  };

  // Metadados
  metadata: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';  // Baseado em ranking, superfície
    confidence: number;                     // Score de confiança (0-1)
    exclusionChecks: {
      injuryTimeout: boolean;
      weatherDelay: boolean;
      retirementRisk: boolean;
      surfaceMismatch: boolean;
      fatigueFactor: boolean;
      oddMovementSuspicious: boolean;
    };
  };
}
```

### Result Schema

```typescript
interface TennisFavorite30ComebackResult {
  // Referência
  signalId: string;
  betId?: string;
  
  // Execução
  stake: number;               // Valor apostado (injetado pela gestão)
  odds: number;                // Odd da aposta
  oddsType: 'DECIMAL';
  
  // Resultado
  result: 'WIN' | 'LOSS' | 'VOID';
  profit: number;              // Lucro/prejuízo líquido
  settledAt: Date;
  
  // Análise pós-jogo
  analysis: {
    actualWinProbability: number;  // Probabilidade real observada
    edgeRealized: number;          // Edge realizado vs esperado
    gameDuration: number;          // Duração do game em segundos
    pointsWonAfter30_0: number;    // Pontos ganhos após 30-0
    maxPressurePoint: string;      // Ex: "Deuce", "Break Point"
    finalGameScore: string;        // Ex: "40-30", "Game"
  };
}
```

### Config Schema (Referência)

```typescript
interface TennisFavorite30ComebackConfig {
  // Nota: Este schema é preenchido pelo arquivo de gestão
  // strategy-sports/config/management/tennis-favorite-30-0-comeback-config.yaml
  
  strategyId: 'TENNIS_FAV_30_0_COMEBACK';
  
  // Parâmetros injetáveis (gestão)
  oddsRange: {
    min: number;
    max: number;
  };
  
  stakeConfig: {
    method: 'percentage' | 'kelly' | 'fixed';
    value: number;
  };
  
  riskLimits: {
    maxExposurePerMatch: number;
    maxExposurePerDay: number;
    stopLoss: number;
  };
}
```

---

## 🔌 Integrações Técnicas

### Fontes de Dados

| Sistema | Finalidade | Criticidade |
|---------|------------|-------------|
| **Live Score API** | Placar em tempo real | CRÍTICA |
| **Odds Feed** | Odds do mercado Game Winner | CRÍTICA |
| **Player Database** | Ranking e histórico dos jogadores | ALTA |
| **Match Statistics** | Estatísticas em tempo real | MÉDIA |

### Providers Sugeridos

```yaml
providers:
  live_score:
    primary: SportRadar
    secondary: Genius Sports
    fallback: BetGenius

  odds_feed:
    primary: OddsAPI
    secondary: TheOddsAPI
    fallback: Betfair API

  player_data:
    primary: ATP Tour API
    secondary: WTA Tour API
    fallback: ITF API
```

### Endpoints Necessários

```typescript
interface RequiredAPIs {
  // Live Score
  getLiveMatch(matchId: string): Promise<TennisMatch>;
  getGameScore(matchId: string): Promise<GameScore>;
  getServer(matchId: string): Promise<string>;
  
  // Odds
  getGameWinnerOdds(matchId: string): Promise<GameWinnerMarket>;
  getOddsHistory(matchId: string, minutes: number): Promise<OddsHistory>;
  
  // Player Data
  getPlayerRanking(playerId: string): Promise<number>;
  getPlayerSurfaceStats(playerId: string, surface: string): Promise<PlayerSurfaceStats>;
}
```

---

## 🏗️ Arquitetura de Implementação

### Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DO SISTEMA                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │  Match Monitor  │ ← Live Score API                          │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Trigger Detector │ ← Lógica da estratégia                   │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ Entry Validator  │ ← Regras de exclusão                     │
│  └────────┬────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐     ┌──────────────────┐                 │
│  │ Signal Generator│────▶│  Risk Manager    │ ← Config gestão │
│  └────────┬────────┘     └────────┬─────────┘                 │
│           │                       │                            │
│           ▼                       ▼                            │
│  ┌─────────────────┐     ┌──────────────────┐                 │
│  │  Bet Executor   │◀────│ Stake Calculator │                 │
│  └─────────────────┘     └──────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Módulos do Sistema

```
dependencies:
  - modules/betting-platform/backend/services/StrategyService
  - modules/betting-platform/backend/services/BacktestingService
  - modules/betting-platform/backend/types/strategy-types
  - modules/betting-platform/backend/config/management
  - squads/live-betting/agents/match-monitor
  - squads/live-betting/agents/instant-bettor
```

---

## 📈 Métricas de Performance (Referência)

### Métricas da Estratégia

| Métrica | Descrição | Como Calcular |
|---------|-----------|---------------|
| **Trigger Rate** | Frequência de triggers | triggers / partidas |
| **Entry Rate** | Taxa de conversão trigger→entrada | entradas / triggers |
| **Fill Rate** | Taxa de execução | bets executadas / signals |
| **Win Rate** | Taxa de acerto | wins / total bets |
| **ROI** | Retorno sobre investimento | (profit / stake) * 100 |

**Nota:** Valores alvo e thresholds são definidos na camada de gestão, não na estratégia.

---

## 🧪 Validação da Lógica

### Testes Unitários

```typescript
describe('TennisFavorite30ComebackStrategy', () => {
  describe('shouldTrigger', () => {
    it('deve retornar true quando favorito está sacando a 30-0', () => {
      // Arrange
      const match = createMatchWithFavorite();
      const liveScore = createLiveScore({
        server: 'favorite',
        gameScore: '30-0'
      });
      
      // Act
      const result = strategy.shouldTrigger(match, liveScore);
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('deve retornar false quando underdog está sacando', () => {
      // Arrange
      const match = createMatchWithFavorite();
      const liveScore = createLiveScore({
        server: 'underdog',
        gameScore: '30-0'
      });
      
      // Act
      const result = strategy.shouldTrigger(match, liveScore);
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('deve retornar false quando placar é 15-0', () => {
      // Arrange
      const match = createMatchWithFavorite();
      const liveScore = createLiveScore({
        server: 'favorite',
        gameScore: '15-0'
      });
      
      // Act
      const result = strategy.shouldTrigger(match, liveScore);
      
      // Assert
      expect(result).toBe(false);
    });
  });
});
```

### Critérios de Validação da Lógica

- [ ] Trigger detecta corretamente 30-0 contra favorito sacando
- [ ] Trigger ignora outras contagens (15-0, 40-0, Deuce)
- [ ] Trigger ignora quando underdog está sacando
- [ ] Regras de exclusão funcionam corretamente
- [ ] Signal é gerado com schema correto
- [ ] Integração com APIs de dados funciona

---

## 📁 Estrutura de Arquivos

### Estratégia Pura

```
squads/strategy-sports/strategy/
└── tennis-favorite-30-0-comeback.md    # Este arquivo (lógica pura)
```

### Configuração de Gestão (Separada)

```
squads/strategy-sports/config/management/
└── tennis-favorite-30-0-comeback-config.yaml    # Parâmetros injetáveis
```

### Documentos Antigos (Legado)

```
squads/strategy-sports/data/    # ⚠️ LEGADO - Será removido após migração
├── tennis-favorite-30-0-comeback-readme.md
├── tennis-favorite-30-0-comeback-spec.md
├── tennis-favorite-30-0-comeback-validation.md
├── tennis-favorite-30-0-comeback-risk.md
└── tennis-favorite-30-0-comeback-implementation.md
```

---

## 📝 Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-02-17 | Strategy-Sports | Criação inicial (misturada com gestão) |
| 2.0.0 | 2026-02-17 | Strategy-Sports | **Refatoração:** Separação estratégia/gestão |

---

## 🔗 Links Relacionados

### Configuração de Gestão
- [Config Management](../config/management/tennis-favorite-30-0-comeback-config.yaml)

### Squad
- [Strategy Lead Agent](../agents/strategy-lead.md)
- [Strategy Dev Agent](../agents/strategy-dev.md)
- [Backtest Engine](../agents/backtest-engine.md)

### Módulos
- [Strategy Service](../../modules/betting-platform/backend/services/StrategyService.ts)
- [Strategy Types](../../modules/betting-platform/backend/types/strategy-types.ts)

---

**Última atualização:** 2026-02-17  
**Status:** `DRAFT` → `PENDING_REVIEW` → `APPROVED`  
**Próxima revisão:** Após implementação da Fase 1
