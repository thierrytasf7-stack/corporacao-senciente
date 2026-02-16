import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestServiceLayer } from '@/serviceLayer/backtestServiceLayer';

export class BacktestBusinessLogic {
  static async getBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestServiceLayer.fetchBacktestResults(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestServiceLayer.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestServiceLayer.exportResults(data);
  }
}

// Usage example
// const data = await BacktestBusinessLogic.getBacktestResults('last-month');