import { type BacktestData, Trade } from '@/stores/backtestStore';
import { BacktestServiceFacade } from '@/facades/backtestServiceFacade';

export class BacktestOrchestrator {
  static async runBacktestWorkflow(period: string): Promise<BacktestData> {
    try {
      // Step 1: Fetch data
      const data = await BacktestServiceFacade.getBacktestResults(period);
      
      // Step 2: Process data (if needed)
      // const processedData = this.processData(data);
      
      // Step 3: Save results
      await BacktestServiceFacade.persistResults(data);
      
      return data;
    } catch (error) {
      console.error('Backtest workflow failed', error);
      throw error;
    }
  }

  static async updateBacktestPeriod(period: string): Promise<BacktestData> {
    return await BacktestServiceFacade.changePeriod(period);
  }

  static exportBacktestData(data: BacktestData): string {
    return BacktestServiceFacade.exportResults(data);
  }
}

// Usage example
// const data = await BacktestOrchestrator.runBacktestWorkflow('last-month');