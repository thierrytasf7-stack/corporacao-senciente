import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestApplicationFacade } from '@/facades/backtestApplicationFacade';

export class BacktestDomainFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestApplicationFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestApplicationFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestApplicationFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestDomainFacade.getBacktestData('last-month');