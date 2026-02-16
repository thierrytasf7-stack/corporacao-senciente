export interface Trade {
  date: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  pnl: number;
}

export interface PerformanceData {
  date: string;
  value: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface BacktestData {
  performance: PerformanceData[];
  metrics: BacktestMetrics;
  trades: Trade[];
}

export interface BacktestResponse {
  success: boolean;
  data: BacktestData;
}

export interface StrategyResult {
  profit: number;
  confidence: number;
  riskLevel: string;
  recommendedStake: number;
}