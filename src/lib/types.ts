export interface DashboardData {
  totalProfitLoss: number;
  activePositions: Array<{
    id: string;
    symbol: string;
    entryPrice: number;
    currentPrice: number;
    quantity: number;
    status: 'open' | 'closed' | 'pending';
  }>;
  winRate: {
    wins: number;
    losses: number;
    total: number;
  };
  recentSignals: Array<{
    id: string;
    symbol: string;
    signalType: 'buy' | 'sell';
    price: number;
    timestamp: Date;
    status: 'pending' | 'executed' | 'cancelled';
  }>;
  profitLossHistory: Array<{
    date: string;
    profitLoss: number;
  }>;
}

export interface DashboardStore {
  dashboardData: DashboardData;
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
  updateDashboardData: (data: Partial<DashboardData>) => void;
}

export interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  status: 'open' | 'closed' | 'pending';
}

export interface Signal {
  id: string;
  symbol: string;
  signalType: 'buy' | 'sell';
  price: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'cancelled';
}

export interface ProfitLossHistory {
  date: string;
  profitLoss: number;
}

export interface WinRate {
  wins: number;
  losses: number;
  total: number;
}