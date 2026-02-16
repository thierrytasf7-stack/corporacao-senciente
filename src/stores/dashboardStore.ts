import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardData {
  totalProfitLoss: number;
  activePositions: Position[];
  winRate: number;
  recentSignals: Signal[];
  profitLossData: ProfitLossPoint[];
}

interface Position {
  id: string;
  symbol: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  status: 'open' | 'closed';
  profitLoss: number;
}

interface Signal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  timestamp: Date;
  confidence: number;
}

interface ProfitLossPoint {
  date: string;
  profitLoss: number;
}

interface DashboardStore extends DashboardData {
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      totalProfitLoss: 0,
      activePositions: [],
      winRate: 0,
      recentSignals: [],
      profitLossData: [],
      isLoading: false,

      fetchDashboardData: async () => {
        set({ isLoading: true });
        
        try {
          // Mock data for MVP
          const mockData: DashboardData = {
            totalProfitLoss: 2456.78,
            activePositions: [
              {
                id: 'pos_1',
                symbol: 'AAPL',
                entryPrice: 175.50,
                currentPrice: 180.25,
                quantity: 10,
                status: 'open',
                profitLoss: 47.50
              },
              {
                id: 'pos_2',
                symbol: 'TSLA',
                entryPrice: 720.00,
                currentPrice: 715.30,
                quantity: 5,
                status: 'open',
                profitLoss: -23.50
              },
              {
                id: 'pos_3',
                symbol: 'NVDA',
                entryPrice: 450.25,
                currentPrice: 465.75,
                quantity: 8,
                status: 'open',
                profitLoss: 124.00
              }
            ],
            winRate: 67.5,
            recentSignals: [
              {
                id: 'sig_1',
                symbol: 'AAPL',
                type: 'buy',
                price: 175.50,
                timestamp: new Date('2025-02-14T10:30:00Z'),
                confidence: 85
              },
              {
                id: 'sig_2',
                symbol: 'TSLA',
                type: 'sell',
                price: 720.00,
                timestamp: new Date('2025-02-14T09:15:00Z'),
                confidence: 72
              },
              {
                id: 'sig_3',
                symbol: 'NVDA',
                type: 'buy',
                price: 450.25,
                timestamp: new Date('2025-02-14T08:45:00Z'),
                confidence: 91
              },
              {
                id: 'sig_4',
                symbol: 'MSFT',
                type: 'buy',
                price: 299.50,
                timestamp: new Date('2025-02-14T07:30:00Z'),
                confidence: 78
              },
              {
                id: 'sig_5',
                symbol: 'GOOGL',
                type: 'sell',
                price: 1450.00,
                timestamp: new Date('2025-02-14T06:15:00Z'),
                confidence: 65
              },
              {
                id: 'sig_6',
                symbol: 'AMZN',
                type: 'buy',
                price: 3200.00,
                timestamp: new Date('2025-02-14T05:45:00Z'),
                confidence: 88
              },
              {
                id: 'sig_7',
                symbol: 'META',
                type: 'sell',
                price: 475.00,
                timestamp: new Date('2025-02-14T04:30:00Z'),
                confidence: 71
              },
              {
                id: 'sig_8',
                symbol: 'NFLX',
                type: 'buy',
                price: 585.00,
                timestamp: new Date('2025-02-14T03:15:00Z'),
                confidence: 82
              },
              {
                id: 'sig_9',
                symbol: 'AMD',
                type: 'sell',
                price: 125.50,
                timestamp: new Date('2025-02-14T02:00:00Z'),
                confidence: 69
              },
              {
                id: 'sig_10',
                symbol: 'INTC',
                type: 'buy',
                price: 38.75,
                timestamp: new Date('2025-02-14T01:30:00Z'),
                confidence: 76
              }
            ],
            profitLossData: [
              { date: '2025-01-15', profitLoss: 150.25 },
              { date: '2025-01-16', profitLoss: 175.50 },
              { date: '2025-01-17', profitLoss: 145.00 },
              { date: '2025-01-18', profitLoss: 160.75 },
              { date: '2025-01-19', profitLoss: 180.25 },
              { date: '2025-01-20', profitLoss: 155.00 },
              { date: '2025-01-21', profitLoss: 170.50 },
              { date: '2025-01-22', profitLoss: 165.75 },
              { date: '2025-01-23', profitLoss: 190.00 },
              { date: '2025-01-24', profitLoss: 185.25 },
              { date: '2025-01-25', profitLoss: 200.50 },
              { date: '2025-01-26', profitLoss: 195.75 },
              { date: '2025-01-27', profitLoss: 210.00 },
              { date: '2025-01-28', profitLoss: 205.25 },
              { date: '2025-01-29', profitLoss: 220.50 },
              { date: '2025-01-30', profitLoss: 215.75 },
              { date: '2025-01-31', profitLoss: 230.00 },
              { date: '2025-02-01', profitLoss: 225.25 },
              { date: '2025-02-02', profitLoss: 240.50 },
              { date: '2025-02-03', profitLoss: 235.75 },
              { date: '2025-02-04', profitLoss: 250.00 },
              { date: '2025-02-05', profitLoss: 245.25 },
              { date: '2025-02-06', profitLoss: 260.50 },
              { date: '2025-02-07', profitLoss: 255.75 },
              { date: '2025-02-08', profitLoss: 270.00 },
              { date: '2025-02-09', profitLoss: 265.25 },
              { date: '2025-02-10', profitLoss: 280.50 },
              { date: '2025-02-11', profitLoss: 275.75 },
              { date: '2025-02-12', profitLoss: 290.00 },
              { date: '2025-02-13', profitLoss: 285.25 },
              { date: '2025-02-14', profitLoss: 300.50 }
            ]
          };

          set(mockData);
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'dashboard-store',
      partialize: (state) => ({
        totalProfitLoss: state.totalProfitLoss,
        activePositions: state.activePositions,
        winRate: state.winRate,
        recentSignals: state.recentSignals,
        profitLossData: state.profitLossData
      })
    }
  )
);

export type { DashboardData, Position, Signal, ProfitLossPoint };