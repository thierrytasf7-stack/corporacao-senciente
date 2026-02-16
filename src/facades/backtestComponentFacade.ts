import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestUIFacade } from '@/facades/backtestUIFacade';

export class BacktestComponentFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestUIFacade.loadBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestUIFacade.changePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestUIFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestComponentFacade.fetchBacktestData('last-month');