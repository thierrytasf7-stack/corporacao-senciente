import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestServiceManager } from '@/managers/backtestServiceManager';

export class BacktestApplicationFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestServiceManager.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestServiceManager.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestServiceManager.exportResults(data);
  }
}

// Usage example
// const data = await BacktestApplicationFacade.fetchBacktestData('last-month');