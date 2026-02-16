import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestNavigator } from '@/navigator/backtestNavigator';

export class BacktestControllerFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestNavigator.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestNavigator.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestNavigator.exportResults(data);
  }
}

// Usage example
// const data = await BacktestControllerFacade.fetchBacktestData('last-month');