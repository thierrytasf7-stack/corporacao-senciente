import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestClientFacade } from '@/facades/backtestClientFacade';

export class BacktestGatewayFacade {
  static async fetchBacktestData(period: string): Promise<BacktestData> {
    return await BacktestClientFacade.getBacktestData(period);
  }

  static async updatePeriod(period: string): Promise<BacktestData> {
    return await BacktestClientFacade.setPeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestClientFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestGatewayFacade.fetchBacktestData('last-month');