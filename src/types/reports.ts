export interface ReportSummary {
  totalTrades: number;
  winRate: number;
  averageProfit: number;
  bestDay: {
    date: string;
    profit: number;
  };
}

export interface PerformanceByStrategy {
  strategy: string;
  totalTrades: number;
  winRate: number;
  profit: number;
}

export interface MonthlyPnL {
  month: string;
  year: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
}

export interface DateRange {
  start: string;
  end: string;
}