import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestAPIFacade } from '@/facades/backtestAPIFacade';

export class BacktestServiceLayerFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestAPIFacade.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestAPIFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestAPIFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestServiceLayerFacade.fetchBacktestData('last-month');