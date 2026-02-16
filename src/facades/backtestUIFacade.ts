import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestPresentationLayerFacade } from '@/facades/backtestPresentationLayerFacade';

export class BacktestUIFacade {
  static async loadBacktestData(period: string): Promise<BacktestData> {
    return await BacktestPresentationLayerFacade.getBacktestData(period);
  }

  static async changePeriod(period: string): Promise<BacktestData> {
    return await BacktestPresentationLayerFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestPresentationLayerFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestUIFacade.loadBacktestData('last-month');