# Betting Strategies Module

Módulo de estratégias de apostas implementando Value Betting, Arbitrage, Sure Betting e Kelly Criterion.

## Estratégias Disponíveis

### 1. Value Betting

Detecta apostas onde as odds oferecidas são maiores que as verdadeiras (valor positivo).

**Fórmula:** `valuePct = (bookmakerOdds / trueOdds) - 1`

**Exemplo:**
```typescript
import { ValueBettingCalculator } from './index';

const calc = new ValueBettingCalculator(0.05); // 5% minimum value
const result = calc.calculateValue({
  bookmakerOdds: 2.50,
  trueProbability: 0.45 // 45% chance
});

console.log(result.valuePct); // 0.125 = 12.5% value
```

### 2. Arbitrage Detection

Encontra oportunidades de arbitragem entre diferentes bookmakers.

**Fórmula:** `isArbitrage = inverseSum < 1` onde `inverseSum = Σ(1/odds)`

**Exemplo:**
```typescript
import { ArbitrageDetector } from './index';

const detector = new ArbitrageDetector(0.01); // 1% minimum profit
const opportunity = detector.detectArbitrage([
  [{ bookmaker: 'betfair', selection: 'Home', odds: 2.10 }],
  [{ bookmaker: 'pinnacle', selection: 'Away', odds: 2.15 }]
]);

console.log(opportunity.profitPct); // e.g. 0.025 = 2.5% profit
```

### 3. Kelly Criterion

Calculates optimal stake size based on bankroll and edge.

**Fórmula:** `f = (bp - q) / b` onde b=odds-1, p=probability, q=1-p

**Exemplo:**
```typescript
import { KellyCalculator } from './index';

const kelly = new KellyCalculator(0.25); // Quarter Kelly
const result = kelly.calculate({
  bankroll: 1000,
  odds: 2.50,
  probability: 0.50
});

console.log(result.recommendedStake); // Optimal stake amount
console.log(result.riskLevel); // LOW/MEDIUM/HIGH/EXTREME
```

### 4. Sure Betting

Similar to arbitrage but focuses on guaranteed profits with higher thresholds.

## Architecture

```
strategies/
├── services/
│   ├── ValueBettingCalculator.ts
│   ├── ArbitrageDetector.ts
│   ├── KellyCalculator.ts
│   └── StrategyService.ts
├── types/
│   └── strategy-types.ts
├── config/
│   └── strategy-config.ts
├── utils/
│   └── strategy-utils.ts
└── index.ts
```

## Usage

```typescript
import { StrategyService, DEFAULT_STRATEGIES } from './strategies';

const service = new StrategyService();
const bankroll = { total: 1000, available: 900, allocated: 100, currency: 'USD' };

const result = service.executeStrategy(
  DEFAULT_STRATEGIES[0], // Value Betting
  bankroll,
  { odds: 2.50, probability: 0.45 }
);

console.log(result.recommendedStake);
console.log(result.profitPotential);
```

## Configuration

Default strategies in `config/strategy-config.ts`:
- Value Betting: 5% minimum value, 10% max stake
- Arbitrage: 1% minimum profit, 15% max stake
- Sure Betting: 2% minimum profit, 20% max stake (disabled by default)
- Kelly Criterion: Quarter Kelly, 25% max stake

## Risk Management

Risk levels determine max stake percentages:
- LOW: 5% max stake, 80% min confidence
- MEDIUM: 15% max stake, 65% min confidence
- HIGH: 25% max stake, 50% min confidence
- EXTREME: 35% max stake, 40% min confidence