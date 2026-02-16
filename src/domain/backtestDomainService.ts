import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestApplicationService } from '@/application/backtestApplicationService';

export class BacktestDomainService {
  static async performBacktest(period: string): Promise<BacktestData> {
    return await BacktestApplicationService.executeBacktest(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestApplicationService.changeBacktestPeriod(period);
  }

  static exportData(data: BacktestData): string {
    return BacktestApplicationService.exportBacktestData(data);
  }
}

// Usage example
// const data = await BacktestDomainService.performBacktest('last-month');