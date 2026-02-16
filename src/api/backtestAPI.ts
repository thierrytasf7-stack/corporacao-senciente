import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestGateway } from '@/gateways/backtestGateway';

export class BacktestAPI {
  static async getBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestGateway.fetchBacktestResults(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestGateway.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestGateway.exportResults(data);
  }
}

// Usage example
// const data = await BacktestAPI.getBacktestResults('last-month');