import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestDomainFacade } from '@/facades/backtestDomainFacade';

export class BacktestInfrastructureFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestDomainFacade.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestDomainFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestDomainFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestInfrastructureFacade.fetchBacktestData('last-month');