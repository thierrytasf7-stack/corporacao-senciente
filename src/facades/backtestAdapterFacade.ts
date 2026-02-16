import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestPresentationFacade } from '@/facades/backtestPresentationFacade';

export class BacktestAdapterFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestPresentationFacade.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestPresentationFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestPresentationFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestAdapterFacade.fetchBacktestData('last-month');