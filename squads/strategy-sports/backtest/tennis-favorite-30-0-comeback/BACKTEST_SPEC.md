# Backtest Specification: Tennis Favorite 30-0 Comeback

**Version:** 1.0.0  
**Status:** Ready for Execution  
**Created:** 2026-02-17  
**Strategy:** `tennis-favorite-30-0-comeback`  
**Config:** `cfg-backtest-v1.0`

---

## 📋 RESUMO EXECUTIVO

Este documento especifica o backtest completo e funcional para validar a estratégia **Tennis Favorite 30-0 Comeback** para uso real em produção.

| Parâmetro | Valor |
|-----------|-------|
| **Estratégia** | Tennis Favorite 30-0 Comeback |
| **Período** | 08/2025 a 02/2026 (6 meses) |
| **Torneios** | Todos (ATP, WTA, Challenger, ITF, Grand Slams) |
| **Superfícies** | Todas (Clay, Grass, Hard, Carpet) |
| **Favorito** | Menor odd inicial (pré-match) |
| **Gatilho** | Exato 30-0 contra favorito no saque |
| **Janela** | Imediata (0-10 segundos) |
| **Odd Mínima** | 1.70 |
| **Odd Máxima** | 2.10 |
| **Stake** | Fixa: 1 unidade |
| **Bankroll** | 1.000 unidades |
| **Limites** | Sem limites (teste puro) |
| **Filtro** | Excluir jogos interrompidos no game da aposta |

---

## 🎯 OBJETIVO DO BACKTEST

Validar se a estratégia é **lucrativa e robusta** o suficiente para implantação em produção com capital real.

### Critérios de Sucesso

A estratégia será considerada **APROVADA** se atender:

| Métrica | Critério | Peso |
|---------|----------|------|
| **ROI** | > 5% | Alto |
| **Win Rate** | > 48% | Alto |
| **Profit Factor** | > 1.10 | Alto |
| **Max Drawdown** | < 25% | Médio |
| **Sharpe Ratio** | > 0.5 | Médio |
| **Total Bets** | ≥ 50 | Alto |
| **Lucro Líquido** | > 0 | Alto |

**Regra de Aprovação:**
- ✅ **APROVADO:** ROI > 5% E Win Rate > 48% E Profit Factor > 1.10
- ⚠️ **CONDICIONAL:** 2 dos 3 critérios principais atendidos
- ❌ **REPROVADO:** 1 ou nenhum critério atendido

---

## 📊 ESPECIFICAÇÃO TÉCNICA

### 1. Dados Necessários

#### 1.1 Fonte de Dados
```yaml
fonte: Sistema interno de busca (já disponível)
periodo:
  inicio: 2025-08-01
  fim: 2026-02-17
torneios: todos
superficies: todas
```

#### 1.2 Campos Obrigatórios por Jogo
```typescript
interface MatchData {
  matchId: string;
  date: string;                    // ISO 8601
  tournament: string;              // Nome do torneio
  surface: 'Clay' | 'Grass' | 'Hard' | 'Carpet';
  round: string;                   // Round do torneio
  
  player1: {
    name: string;
    ranking?: number;
    isFavorite: boolean;           // Menor odd inicial
  };
  
  player2: {
    name: string;
    ranking?: number;
    isFavorite: boolean;
  };
  
  preMatchOdds: {
    player1: number;               // Odd inicial P1
    player2: number;               // Odd inicial P2
  };
  
  sets: SetScore[];                // Resultado final por sets
  
  games: GameData[];               // Detalhe de cada game
  
  status: 'completed' | 'walkover' | 'retired' | 'stopped';
}

interface GameData {
  gameId: string;
  setNumber: number;
  gameNumber: number;
  server: 'player1' | 'player2';   // Quem está sacando
  
  points: {
    player1: number;               // Pontos do P1 no game
    player2: number;               // Pontos do P2 no game
  };
  
  winner: 'player1' | 'player2';   // Quem venceu o game
  
  liveOdds?: {
    player1: number;               // Odd live P1 no momento 30-0
    player2: number;               // Odd live P2 no momento 30-0
  };
  
  interrupted: boolean;            // Game/torneio interrompido?
}
```

---

### 2. Lógica do Backtest

#### 2.1 Algoritmo Principal

```typescript
interface BacktestConfig {
  // Estratégia (lógica pura)
  strategy: {
    trigger: 'exact_30-0';         // Exato 30-0
    windowSeconds: 10;             // Janela de entrada
    minOdds: 1.70;
    maxOdds: 2.10;
  };
  
  // Gestão (parâmetros injetáveis)
  management: {
    stakeType: 'fixed';
    stakeValue: 1;                 // 1 unidade fixa
    bankroll: 1000;
    limits: {
      daily: null;                 // Sem limites (teste)
      perMatch: null;
      stopLoss: null;
    };
  };
  
  // Filtros
  filters: {
    excludeInterrupted: true;      // Excluir se parou no game da aposta
    minLiquidity: null;            // Sem filtro
  };
}

interface BacktestResult {
  // Métricas de Estratégia (lógica)
  strategy: {
    totalMatches: number;
    totalGames: number;
    triggerCount: number;          // Quantas vezes ocorreu 30-0
    entryCount: number;            // Quantas entradas válidas (odds)
    placedBets: number;            // Apostas executadas
  };
  
  // Métricas de Gestão (performance)
  management: {
    wins: number;
    losses: number;
    winRate: number;               // %
    totalProfit: number;           // Unidades
    roi: number;                   // %
    profitFactor: number;
    maxDrawdown: number;           // Unidades e %
    sharpeRatio: number;
    finalBankroll: number;
  };
  
  // Análise Detalhada
  analysis: {
    byMonth: MonthlyResult[];
    bySurface: SurfaceResult[];
    byTournament: TournamentResult[];
    byOddsRange: OddsRangeResult[];
    bySetNumber: SetResult[];
    streaks: {
      longestWinStreak: number;
      longestLossStreak: number;
      currentStreak: number;
    };
  };
  
  // Validação Estatística
  validation: {
    isStatisticallySignificant: boolean;
    confidenceLevel: number;       // %
    pValue: number;
    zScore: number;
    baselineComparison: {
      strategyROI: number;
      baselineROI: number;         // Apostar sempre no favorito
      outperformance: number;
    };
  };
  
  // Recomendação Final
  recommendation: {
    status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    notes: string[];
    nextSteps: string[];
  };
}
```

#### 2.2 Fluxo de Execução

```
FASE 1: Carregamento de Dados
    ↓
FASE 2: Identificação de Favoritos
    ↓
FASE 3: Detecção de Triggers (30-0)
    ↓
FASE 4: Validação de Odds (1.70 - 2.10)
    ↓
FASE 5: Execução Simulada (Stake Fixa: 1)
    ↓
FASE 6: Cálculo de Resultados
    ↓
FASE 7: Análise Estatística
    ↓
FASE 8: Geração de Relatório
```

---

### 3. Metodologia de Validação

#### 3.1 Validação Funcional (Produção)

Este backtest é desenhado para **validação real**, não apenas acadêmica:

| Característica | Implementação |
|----------------|---------------|
| **Dados Reais** | Odds históricas reais (não simuladas) |
| **Condições Reais** | Janela de 10s (executável na prática) |
| **Liquidez** | Considera odds disponíveis no mercado |
| **Atrasos** | Considera delay de atualização de odds |
| **Viés de Sobrevivência** | Exclui jogos interrompidos |
| **Out-of-Sample** | Período não usado em otimizações |

#### 3.2 Validação Estatística

```typescript
interface StatisticalValidation {
  // Teste de Significância
  significanceTest: {
    nullHypothesis: 'ROI = 0 (estratégia não gera valor)';
    alternativeHypothesis: 'ROI > 0 (estratégia gera valor)';
    testUsed: 'One-sample t-test';
    alpha: 0.05;                   // 95% confiança
    result: 'reject' | 'fail-to-reject';
  };
  
  // Teste de Robustez
  robustnessTest: {
    parameterSensitivity: {
      varyMinOdds: [1.65, 1.70, 1.75, 1.80];
      varyStake: [0.5, 1.0, 1.5, 2.0];
      results: SensitivityResult[];
    };
    isRobust: boolean;             // Se resultados consistentes
  };
  
  // Comparação com Baseline
  baselineComparison: {
    baseline: 'Apostar sempre no favorito para vencer game';
    strategyROI: number;
    baselineROI: number;
    alpha: number;                 // Valor agregado
    isAlphaSignificant: boolean;
  };
}
```

---

## 📈 MÉTRICAS DETALHADAS

### 4.1 Métricas de Estratégia (Lógica)

| Métrica | Descrição | Cálculo |
|---------|-----------|---------|
| **Total Matches** | Jogos no período | Count(matches) |
| **Total Games** | Games no período | Count(games) |
| **Trigger Count** | Ocorrências de 30-0 | Count(30-0 events) |
| **Entry Count** | Entradas válidas (odds 1.7-2.1) | Count(valid entries) |
| **Placed Bets** | Apostas executadas | Count(executed bets) |
| **Trigger Rate** | Frequência de triggers | Triggers / Games |
| **Entry Rate** | Taxa de conversão | Entries / Triggers |

### 4.2 Métricas de Gestão (Performance)

| Métrica | Descrição | Cálculo | Target |
|---------|-----------|---------|--------|
| **Wins** | Apostas vencidas | Count(won bets) | - |
| **Losses** | Apostas perdidas | Count(lost bets) | - |
| **Win Rate** | % de vitórias | Wins / (Wins + Losses) | > 48% |
| **Total Profit** | Lucro total (unidades) | Σ(profit per bet) | > 0 |
| **ROI** | Retorno sobre investimento | Profit / Total Staked | > 5% |
| **Profit Factor** | Fator de lucro | Gross Profit / Gross Loss | > 1.10 |
| **Max Drawdown** | Maior queda consecutiva | Max peak-to-trough | < 25% |
| **Sharpe Ratio** | Retorno ajustado ao risco | (ROI - RiskFree) / StdDev | > 0.5 |
| **Final Bankroll** | Bankroll final | Initial + Profit | > 1000 |

### 4.3 Métricas de Análise Detalhada

#### Por Mês
```typescript
interface MonthlyResult {
  month: string;                   // YYYY-MM
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}
```

#### Por Superfície
```typescript
interface SurfaceResult {
  surface: 'Clay' | 'Grass' | 'Hard' | 'Carpet';
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}
```

#### Por Faixa de Odds
```typescript
interface OddsRangeResult {
  range: string;                   // ex: "1.70-1.80"
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}
```

#### Por Número do Set
```typescript
interface SetResult {
  setNumber: number;               // 1, 2, 3
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 5.1 Estrutura de Arquivos

```
backtest/
├── tennis-favorite-30-0-comeback/
│   ├── config/
│   │   └── backtest.config.yaml         # Configuração do backtest
│   ├── src/
│   │   ├── data-loader.ts               # Carrega dados históricos
│   │   ├── trigger-detector.ts          # Detecta 30-0
│   │   ├── odds-validator.ts            # Valida odds (1.7-2.1)
│   │   ├── bet-executor.ts              # Executa apostas simuladas
│   │   ├── metrics-calculator.ts        # Calcula métricas
│   │   ├── statistical-validator.ts     # Validação estatística
│   │   └── report-generator.ts          # Gera relatório
│   ├── output/
│   │   ├── results.json                 # Resultados brutos
│   │   ├── analysis.csv                 # Dados para análise
│   │   └── report.md                    # Relatório final
│   └── tests/
│       ├── data-loader.test.ts
│       ├── trigger-detector.test.ts
│       └── metrics-calculator.test.ts
```

### 5.2 Configuração (YAML)

```yaml
# backtest.config.yaml
backtest:
  name: "Tennis Favorite 30-0 Comeback"
  version: "1.0.0"
  strategy: "tennis-favorite-30-0-comeback"
  config: "cfg-backtest-v1.0"

period:
  start: "2025-08-01"
  end: "2026-02-17"
  timezone: "UTC"

strategy:
  trigger: "exact_30-0"
  windowSeconds: 10
  minOdds: 1.70
  maxOdds: 2.10
  favoriteDefinition: "lower_initial_odd"

management:
  stakeType: "fixed"
  stakeValue: 1.0
  bankroll: 1000
  currency: "units"
  limits:
    daily: null
    perMatch: null
    stopLoss: null

filters:
  excludeInterrupted: true
  excludeWalkover: true
  minLiquidity: null

tournaments:
  include:
    - "ATP"
    - "WTA"
    - "Challenger"
    - "ITF"
    - "Grand Slam"

surfaces:
  include:
    - "Clay"
    - "Grass"
    - "Hard"
    - "Carpet"

validation:
  significanceLevel: 0.05
  minBets: 50
  targetROI: 0.05
  targetWinRate: 0.48
  targetProfitFactor: 1.10
  maxDrawdown: 0.25

output:
  format:
    - "json"
    - "csv"
    - "markdown"
  detailed: true
  includeCharts: true
```

### 5.3 Pseudocódigo do Backtest

```typescript
async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  // FASE 1: Carregamento de Dados
  const matches = await DataLoader.loadMatches({
    startDate: config.period.start,
    endDate: config.period.end,
    tournaments: config.tournaments.include,
    surfaces: config.surfaces.include,
  });
  
  console.log(`Carregados ${matches.length} jogos`);
  
  // FASE 2: Processamento
  const bets: BetExecution[] = [];
  
  for (const match of matches) {
    // Identificar favorito (menor odd inicial)
    const favorite = match.preMatchOdds.player1 < match.preMatchOdds.player2
      ? 'player1'
      : 'player2';
    
    // FASE 3: Detectar triggers (30-0 exato)
    for (const game of match.games) {
      // Verificar se favorito está sacando
      if (game.server !== favorite) continue;
      
      // Verificar placar exato 30-0 contra favorito
      const favoritePoints = favorite === 'player1' 
        ? game.points.player1 
        : game.points.player2;
      
      const opponentPoints = favorite === 'player1'
        ? game.points.player2
        : game.points.player1;
      
      if (favoritePoints !== 0 || opponentPoints !== 3) continue;
      
      // FASE 4: Validar odds
      const liveOdd = favorite === 'player1'
        ? game.liveOdds?.player1
        : game.liveOdds?.player2;
      
      if (!liveOdd) continue;
      if (liveOdd < config.strategy.minOdds) continue;
      if (liveOdd > config.strategy.maxOdds) continue;
      
      // FASE 5: Executar aposta simulada
      const bet: BetExecution = {
        matchId: match.matchId,
        gameId: game.gameId,
        timestamp: game.timestamp,
        selection: favorite,
        odd: liveOdd,
        stake: config.management.stakeValue,
        market: 'Game Winner',
      };
      
      bets.push(bet);
    }
  }
  
  console.log(`Detectadas ${bets.length} oportunidades`);
  
  // FASE 6: Calcular resultados
  const results: BetResult[] = bets.map(bet => {
    const game = findGame(bet.matchId, bet.gameId);
    const won = game.winner === bet.selection;
    
    return {
      ...bet,
      result: won ? 'WIN' : 'LOSS',
      profit: won ? bet.stake * (bet.odd - 1) : -bet.stake,
    };
  });
  
  // FASE 7: Calcular métricas
  const metrics = MetricsCalculator.calculate(results, {
    initialBankroll: config.management.bankroll,
  });
  
  // FASE 8: Validação estatística
  const validation = StatisticalValidator.validate(results, {
    significanceLevel: config.validation.significanceLevel,
    minBets: config.validation.minBets,
  });
  
  // FASE 9: Gerar recomendação
  const recommendation = generateRecommendation(metrics, validation);
  
  // FASE 10: Gerar relatório
  const report = ReportGenerator.generate({
    metrics,
    validation,
    recommendation,
    config,
  });
  
  return {
    strategy: { /* ... */ },
    management: metrics,
    analysis: { /* ... */ },
    validation,
    recommendation,
  };
}

function generateRecommendation(
  metrics: ManagementMetrics,
  validation: StatisticalValidation
): Recommendation {
  const criteria = {
    roi: metrics.roi > 0.05,
    winRate: metrics.winRate > 0.48,
    profitFactor: metrics.profitFactor > 1.10,
    drawdown: metrics.maxDrawdown < 0.25,
    significant: validation.isStatisticallySignificant,
    minBets: metrics.totalBets >= 50,
  };
  
  const passed = Object.values(criteria).filter(Boolean).length;
  
  if (passed >= 5 && criteria.roi && criteria.winRate && criteria.profitFactor) {
    return {
      status: 'APPROVED',
      confidence: 'HIGH',
      notes: ['Estratégia aprovada para produção'],
      nextSteps: ['Iniciar paper trading', 'Monitorar performance'],
    };
  }
  
  if (passed >= 3) {
    return {
      status: 'CONDITIONAL',
      confidence: 'MEDIUM',
      notes: ['Alguns critérios atendidos'],
      nextSteps: ['Otimizar parâmetros', 'Expandir período de teste'],
    };
  }
  
  return {
    status: 'REJECTED',
    confidence: 'LOW',
    notes: ['Critérios não atendidos'],
    nextSteps: ['Revisar lógica', 'Coletar mais dados'],
  };
}
```

---

## 📊 RELATÓRIO ESPERADO

### 6.1 Estrutura do Relatório (Markdown)

```markdown
# Relatório de Backtest: Tennis Favorite 30-0 Comeback

## Resumo Executivo
- Status: APROVADO / CONDICIONAL / REPROVADO
- Período: 08/2025 - 02/2026
- Total Apostas: XXX
- ROI: X.XX%
- Win Rate: XX.XX%
- Lucro: XXX unidades

## Métricas Principais
| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| ROI | X.XX% | > 5% | ✅/❌ |
| Win Rate | XX.XX% | > 48% | ✅/❌ |
| Profit Factor | X.XX | > 1.10 | ✅/❌ |
| Max Drawdown | XX.XX% | < 25% | ✅/❌ |
| Sharpe Ratio | X.XX | > 0.5 | ✅/❌ |

## Análise Detalhada
### Por Mês
[Table com performance mensal]

### Por Superfície
[Table com performance por superfície]

### Por Faixa de Odds
[Table com performance por odds]

### Sequências
- Maior sequência de vitórias: X
- Maior sequência de derrotas: X

## Validação Estatística
- Significância: XX% (p-value: 0.XXX)
- Comparação com baseline: +X.XX% (alpha)

## Conclusão e Recomendação
[Texto explicativo]

## Próximos Passos
1. [ ] ...
2. [ ] ...
3. [ ] ...

## Anexos
- Dados brutos: results.json
- Análise completa: analysis.csv
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Pré-Backtest
- [ ] Dados históricos carregados (6 meses)
- [ ] Campos obrigatórios preenchidos
- [ ] Filtros aplicados (excluídos interrompidos)
- [ ] Configuração validada (schema)

### Durante Backtest
- [ ] Triggers detectados corretamente
- [ ] Odds validadas (1.70 - 2.10)
- [ ] Apostas executadas (simulado)
- [ ] Resultados calculados

### Pós-Backtest
- [ ] Métricas calculadas
- [ ] Validação estatística executada
- [ ] Relatório gerado
- [ ] Recomendação emitida

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar Backtest**
   - Rodar algoritmo com dados reais
   - Gerar resultados

2. **Analisar Resultados**
   - Verificar métricas
   - Validar estatística

3. **Gerar Relatório**
   - Criar relatório completo (.md)
   - Exportar dados (.json, .csv)

4. **Tomar Decisão**
   - Aprovar para produção
   - Reprovar e ajustar
   - Condicional (mais testes)

---

## 📞 CONTATO

**Responsável:** Strategy-Sports Squad  
**CEO-BET:** Orquestrador  
**Status:** Ready for Execution

---

**Documento pronto para execução do backtest.** 🎯
