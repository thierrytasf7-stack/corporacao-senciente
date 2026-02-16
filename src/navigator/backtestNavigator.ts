import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestRouter } from '@/router/backtestRouter';

export class BacktestNavigator {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestRouter.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestRouter.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestRouter.exportResults(data);
  }
}

// Usage example
// const data = await BacktestNavigator.getBacktestData('last-month');