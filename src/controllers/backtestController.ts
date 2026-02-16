import { type BacktestData, Trade } from '@/stores/backtestStore'';
import { BacktestManager } from '@/managers/backtestManager'';

export class BacktestController {
  static async loadBacktestData(period: string): Promise<BacktestData> {
    return await BacktestManager.initializeBacktest(period);
  }

  static async updateBacktestPeriod(period: string): Promise<BacktestData> {
    return await BacktestManager.refreshBacktest(period);
  }

  static exportToCSV(data: BacktestData): string {
    return BacktestManager.exportBacktestResults(data);
  }

  static async saveResults(data: BacktestData): Promise<void> {
    return await BacktestManager.saveBacktestResults(data);
  }
}