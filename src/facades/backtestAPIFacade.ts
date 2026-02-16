import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestGatewayFacade } from '@/facades/backtestGatewayFacade';

export class BacktestAPIFacade {
  static async getBacktestData(period: string): Promise<BacktestData> {
    return await BacktestGatewayFacade.fetchBacktestData(period);
  }

  static async setPeriod(period: string): Promise<BacktestData> {
    return await BacktestGatewayFacade.updatePeriod(period);
  }

  static exportResults(data: BacktestData): string {
    return BacktestGatewayFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestAPIFacade.getBacktestData('last-month');