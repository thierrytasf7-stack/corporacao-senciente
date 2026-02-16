import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestUI } from '@/ui/backtestUI';

export class BacktestComponent {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestUI.loadBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestUI.changePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestUI.exportResults(data);
  }
}

// Usage example
// const data = await BacktestComponent.fetchBacktestData('last-month');