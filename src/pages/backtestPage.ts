import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestView } from '@/views/backtestView';

export class BacktestPage {
  static async loadBacktestData(period: string): Promise<BacktestData> {
    return await BacktestView.getBacktestData(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestView.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestView.exportResults(data);
  }
}

// Usage example
// const data = await BacktestPage.loadBacktestData('last-month');