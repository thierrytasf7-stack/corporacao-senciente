import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestBusinessLogic } from '@/businessLogic/backtestBusinessLogic';

export class BacktestApplicationLayer {
  static async fetchBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestBusinessLogic.getBacktestResults(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestBusinessLogic.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestBusinessLogic.exportResults(data);
  }
}

// Usage example
// const data = await BacktestApplicationLayer.fetchBacktestResults('last-month');