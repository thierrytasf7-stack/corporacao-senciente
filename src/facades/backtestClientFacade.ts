import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestAdapterFacade } from '@/facades/backtestAdapterFacade';

export class BacktestClientFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestAdapterFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestAdapterFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestAdapterFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestClientFacade.getBacktestData('last-month');