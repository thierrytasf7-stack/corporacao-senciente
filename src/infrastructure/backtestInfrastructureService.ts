import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestDomainService } from '@/domain/backtestDomainService';

export class BacktestInfrastructureService {
  static async runBacktest(period: string): Promise<BacktestData> {
    return await BacktestDomainService.performBacktest(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestDomainService.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestDomainService.exportData(data);
  }
}

// Usage example
// const data = await BacktestInfrastructureService.runBacktest('last-month');