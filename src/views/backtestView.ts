import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestComponent } from '@/components/backtestComponent';

export class BacktestView {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestComponent.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestComponent.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestComponent.exportResults(data);
  }
}

// Usage example
// const data = await BacktestView.getBacktestData('last-month');