import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestInfrastructureService } from '@/infrastructure/backtestInfrastructureService';

export class BacktestPresentationService {
  static async fetchBacktestResults(period: string): Promise<BacktestData> {
    return await BacktestInfrastructureService.runBacktest(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestInfrastructureService.changePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestInfrastructureService.exportResults(data);
  }
}

// Usage example
// const data = await BacktestPresentationService.fetchBacktestResults('last-month');