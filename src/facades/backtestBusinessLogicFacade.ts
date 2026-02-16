import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestServiceLayerFacade } from '@/facades/backtestServiceLayerFacade';

export class BacktestBusinessLogicFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestServiceLayerFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestServiceLayerFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestServiceLayerFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestBusinessLogicFacade.getBacktestData('last-month');