import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestPresentationLayer } from '@/presentationLayer/backtestPresentationLayer';

export class BacktestUI {
  static async loadBacktestData(period: string): Promise<BacktestData> {
    return await BacktestPresentationLayer.getBacktestResults(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestPresentationLayer.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestPresentationLayer.exportResults(data);
  }
}

// Usage example
// const data = await BacktestUI.loadBacktestData('last-month');