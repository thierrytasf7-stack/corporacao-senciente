import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestPage } from '@/pages/backtestPage';

export class BacktestRouter {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestPage.loadBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestPage.changePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestPage.exportResults(data);
  }
}

// Usage example
// const data = await BacktestRouter.fetchBacktestData('last-month');