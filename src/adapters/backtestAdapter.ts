import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestPresentationService } from '@/presentation/backtestPresentationService';

export class BacktestAdapter {
  static async loadBacktestData(period: string): Promise<BacktestData> {
    return await BacktestPresentationService.fetchBacktestResults(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestPresentationService.updatePeriod(period);
  }

  static exportData(data: BacktestData): string {
    return BacktestPresentationService.exportResults(data);
  }
}

// Usage example
// const data = await BacktestAdapter.loadBacktestData('last-month');