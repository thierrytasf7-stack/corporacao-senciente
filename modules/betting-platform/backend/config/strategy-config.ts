import { Strategy } from '../types/strategy-types';

export const DEFAULT_STRATEGIES: Strategy[] = [
  {
    id: 'value-betting-default',
    type: 'VALUE_BETTING',
    enabled: true,
    minProfitThreshold: 0.05,
    maxStakePercent: 0.10,
    minValuePercent: 0.05,
    trueProbabilitySource: 'MODEL'
  },
  {
    id: 'arbitrage-default',
    type: 'ARBITRAGE',
    enabled: true,
    minProfitThreshold: 0.01,
    maxStakePercent: 0.15,
    bookmakers: ['betfair', 'pinnacle', 'bet365'],
    minArbitragePercent: 0.01,
    includeStakeInCalculation: true
  },
  {
    id: 'sure-betting-default',
    type: 'SURE_BETTING',
    enabled: false,
    minProfitThreshold: 0.02,
    maxStakePercent: 0.20,
    bookmakers: ['betfair', 'pinnacle'],
    minGuaranteedProfit: 0.02
  },
  {
    id: 'kelly-criterion-default',
    type: 'KELLY_CRITERION',
    enabled: true,
    minProfitThreshold: 0.03,
    maxStakePercent: 0.25,
    kellyFraction: 0.25,
    minKellyPercent: 0.01,
    maxKellyPercent: 0.30
  }
];

export const RISK_THRESHOLDS = {
  LOW: { maxStake: 0.05, minConfidence: 0.80 },
  MEDIUM: { maxStake: 0.15, minConfidence: 0.65 },
  HIGH: { maxStake: 0.25, minConfidence: 0.50 },
  EXTREME: { maxStake: 0.35, minConfidence: 0.40 }
} as const;

export const BANKROLL_LIMITS = {
  MIN_BANKROLL: 100,
  MAX_SINGLE_STAKE_PERCENT: 0.30,
  MIN_AVAILABLE_PERCENT: 0.20,
  RESERVE_PERCENT: 0.10
} as const;

export function getStrategyById(id: string): Strategy | undefined {
  return DEFAULT_STRATEGIES.find(s => s.id === id);
}

export function getEnabledStrategies(): Strategy[] {
  return DEFAULT_STRATEGIES.filter(s => s.enabled);
}

export function getStrategiesByType(type: Strategy['type']): Strategy[] {
  return DEFAULT_STRATEGIES.filter(s => s.type === type);
}