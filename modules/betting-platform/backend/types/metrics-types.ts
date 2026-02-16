export interface Metrics {
  totalBets: number;
  winRate: number;
  roi: number;
  profit: number;
  totalStake: number;
  totalReturn: number;
  averageOdds: number;
  averageStake: number;
  longestWinningStreak: number;
  longestLosingStreak: number;
  currentStreak: number;
  lastBetDate: Date;
  firstBetDate: Date;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PerformanceReport {
  metrics: Metrics;
  breakdown: {
    byStrategy: Record<string, Metrics>;
    byBookmaker: Record<string, Metrics>;
    bySport: Record<string, Metrics>;
    byMarket: Record<string, Metrics>;
  };
  trends: {
    daily: Metrics[];
    weekly: Metrics[];
    monthly: Metrics[];
  };
  dateRange: DateRange;
  aggregationPeriod: AggregationPeriod;
}

export type AggregationPeriod = 'day' | 'week' | 'month' | 'year';