export interface Strategy {
  id: string;
  type: StrategyType;
  enabled: boolean;
  minProfitThreshold: number;
  maxStakePercent: number;
  [key: string]: unknown;
}

export type StrategyType = 
  | 'VALUE_BETTING'
  | 'ARBITRAGE'
  | 'SURE_BETTING'
  | 'KELLY_CRITERION';

export interface StrategyResult {
  profit: number;
  confidence: number;
  riskLevel: string;
  recommendedStake: number;
}