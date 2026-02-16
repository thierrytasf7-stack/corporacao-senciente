import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestApplicationLayer } from '@/applicationLayer/backtestApplicationLayer';

export class BacktestPresentationLayer {
  static async getBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestApplicationLayer.fetchBacktestResults(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestApplicationLayer.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestApplicationLayer.exportResults(data);
  }
}

// Usage example
// const data = await BacktestPresentationLayer.getBacktestResults('last-month');