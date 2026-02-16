import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestComponentFacade } from '@/facades/backtestComponentFacade';

export class BacktestViewFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestComponentFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestComponentFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestComponentFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestViewFacade.getBacktestData('last-month');