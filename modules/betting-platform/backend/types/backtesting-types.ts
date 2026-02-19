export interface BacktestConfig {
  strategyType?: 'VALUE_BETTING' | 'ARBITRAGE' | 'KELLY_CRITERION' | 'SURE_BETTING';
  dateRange: {
    start: string;
    end: string;
  };
  initialBankroll: number;
  stakingStrategy: 'fixed' | 'percentage' | 'kelly';
  filters: {
    sports?: string[];
    leagues?: string[];
    minOdds?: number;
    maxOdds?: number;
  };
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  parameters?: Record<string, any>;
}

export interface BacktestBet {
  id: string;
  strategyId: string;
  strategyType?: string;
  timestamp: Date;
  market: string;
  event?: {
    sport: string;
    market: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: Date;
    bookmaker: string;
    odds: number;
  };
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  odds: number | Record<string, number>;
  stake: number;
  profit: number;
  result: 'win' | 'loss' | 'void';
  status?: 'OPEN' | 'SETTLED' | 'VOID';
  settlementDate?: Date;
  metadata?: any;
}

export interface BacktestResultMetrics {
  winRate: number;
  roi: number;
  totalProfit: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgOdds: number;
  betCount: number;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  metrics: BacktestResultMetrics;
  bets: BacktestBet[];
  equityCurve: { date: string; equity: number }[];
  createdAt: Date;
}