import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestOrchestrator } from '@/orchestrators/backtestOrchestrator';

export class BacktestApplicationService {
  static async executeBacktest(period: string): Promise<BacktestData> {
    return await BacktestOrchestrator.runBacktestWorkflow(period);
  }

  static async changeBacktestPeriod(period: string): Promise<BacktestData> {
    return await BacktestOrchestrator.updateBacktestPeriod(period);
  }

  static exportBacktestData(data: BacktestData): string {
    return BacktestOrchestrator.exportBacktestData(data);
  }
}

// Usage example
// const data = await BacktestApplicationService.executeBacktest('last-month');