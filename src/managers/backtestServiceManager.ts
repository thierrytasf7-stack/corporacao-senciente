import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestControllerFacade } from '@/facades/backtestControllerFacade';

export class BacktestServiceManager {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestControllerFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestControllerFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestControllerFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestServiceManager.getBacktestData('last-month');