import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestInfrastructureFacade } from '@/facades/backtestInfrastructureFacade';

export class BacktestPresentationFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestInfrastructureFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestInfrastructureFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestInfrastructureFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestPresentationFacade.getBacktestData('last-month');