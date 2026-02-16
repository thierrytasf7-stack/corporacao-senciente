import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestController } from '@/controllers/backtestController';

export class BacktestServiceFacade {
  static async getBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestController.loadBacktestData(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestController.updateBacktestPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestController.exportToCSV(data);
  }

  static async persistResults(data: BacktestData): Promise<void> {
    return await BacktestController.saveResults(data);
  }
}

// Usage example
// const data = await BacktestServiceFacade.getBacktestResults('last-month');