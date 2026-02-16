import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestApplicationLayerFacade } from '@/facades/backtestApplicationLayerFacade';

export class BacktestPresentationLayerFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestApplicationLayerFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestApplicationLayerFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestApplicationLayerFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestPresentationLayerFacade.getBacktestData('last-month');