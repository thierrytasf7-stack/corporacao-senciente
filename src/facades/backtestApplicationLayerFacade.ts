import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestBusinessLogicFacade } from '@/facades/backtestBusinessLogicFacade';

export class BacktestApplicationLayerFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestBusinessLogicFacade.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestBusinessLogicFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestBusinessLogicFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestApplicationLayerFacade.fetchBacktestData('last-month');