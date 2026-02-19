export interface Strategy {
  id: string;
  type: StrategyType;
  name: string;
  parameters: Record<string, any>;
}

export interface StrategyResult {
  strategyId: string;
  strategyType: StrategyType;
  timestamp: Date;
  profitPotential: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedStake: number;
  confidence: number;
  metadata: Record<string, any>;
}

export interface Bankroll {
  available: number;
  total: number;
  locked: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Metrics {
  totalBets: number;
  totalProfit: number;
  averageProfit: number;
  winRate: number;
  roi: number;
  riskMetrics: {
    averageRisk: string;
    maxRisk: string;
  };
}

export type StrategyType = 
  | 'VALUE_BETTING'
  | 'ARBITRAGE'
  | 'KELLY_CRITERION'
  | 'SURE_BETTING'
  | 'TRADITIONAL';

export interface BacktestConfig {
  dateRange: {
    start: Date;
    end: Date;
  };
  initialBankroll: number;
  stakingStrategy: 'fixed' | 'percentage' | 'kelly';
  filters: {
    sports?: string[];
    leagues?: string[];
    minOdds?: number;
    maxOdds?: number;
  };
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialBankroll: number;
  finalBankroll: number;
  totalBets: number;
  winningBets: number;
  losingBets: number;
  totalProfit: number;
  totalStake: number;
  roi: number;
  winRate: number;
  averageOdds: number;
  maxDrawdown: number;
  sharpeRatio: number;
  stakingStrategy: string;
  trades: Array<{
    matchId: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: Date;
    bookmaker: string;
    odds: Record<string, number>;
    stake: number;
    profit: number;
    result: 'win' | 'loss' | 'void';
    timestamp: Date;
  }>;
  equityCurve: Array<{
    timestamp: Date;
    bankroll: number;
    drawdown: number;
  }>;
}

export interface StrategyComparisonResult {
  strategyId: string;
  strategyName: string;
  totalBets: number;
  winningBets: number;
  losingBets: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  averageOdds: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalBankroll: number;
}