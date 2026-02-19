import { StrategyResult, StrategyType, DateRange, Metrics } from '../types/strategy-types';

export default class AnalyticsService {
  private betHistory: StrategyResult[] = [];

  constructor() {
    this.betHistory = [];
  }

  public trackBet(bet: StrategyResult): void {
    this.betHistory.push(bet);
  }

  public getPerformanceMetrics(strategyId: string): Metrics {
    const strategyBets = this.betHistory.filter(bet => bet.strategyId === strategyId);
    
    if (strategyBets.length === 0) {
      return {
        totalBets: 0,
        totalProfit: 0,
        averageProfit: 0,
        winRate: 0,
        roi: 0,
        riskMetrics: {
          averageRisk: 'UNKNOWN',
          maxRisk: 'UNKNOWN'
        }
      };
    }

    const totalProfit = strategyBets.reduce((sum, bet) => sum + (bet.profitPotential || 0), 0);
    const winningBets = strategyBets.filter(bet => (bet.profitPotential || 0) > 0).length;
    const averageProfit = totalProfit / strategyBets.length;
    const winRate = winningBets / strategyBets.length;
    const roi = totalProfit / strategyBets.reduce((sum, bet) => sum + (bet.recommendedStake || 0), 0);

    const riskLevels = strategyBets.map(bet => bet.riskLevel);
    const uniqueRisks = [...new Set(riskLevels)];
    const riskCounts = uniqueRisks.map(risk => ({
      risk,
      count: riskLevels.filter(r => r === risk).length
    }));

    const averageRisk = riskCounts.reduce((sum, rc) => sum + (rc.count * (rc.risk === 'LOW' ? 1 : rc.risk === 'MEDIUM' ? 2 : 3)), 0) / strategyBets.length;
    const maxRisk = riskLevels.reduce((max, risk) => Math.max(max, risk === 'LOW' ? 1 : risk === 'MEDIUM' ? 2 : 3), 0);

    return {
      totalBets: strategyBets.length,
      totalProfit,
      averageProfit,
      winRate,
      roi,
      riskMetrics: {
        averageRisk: this.getRiskLevel(averageRisk),
        maxRisk: this.getRiskLevel(maxRisk)
      }
    };
  }

  public calculateROI(period: DateRange): number {
    const filteredBets = this.betHistory.filter(bet => {
      const betDate = bet.timestamp;
      return betDate >= period.startDate && betDate <= period.endDate;
    });

    if (filteredBets.length === 0) {
      return 0;
    }

    const totalProfit = filteredBets.reduce((sum, bet) => sum + (bet.profitPotential || 0), 0);
    const totalStake = filteredBets.reduce((sum, bet) => sum + (bet.recommendedStake || 0), 0);

    return totalStake > 0 ? totalProfit / totalStake : 0;
  }

  public getWinRate(strategyType: StrategyType): number {
    const strategyBets = this.betHistory.filter(bet => bet.strategyType === strategyType);
    
    if (strategyBets.length === 0) {
      return 0;
    }

    const winningBets = strategyBets.filter(bet => (bet.profitPotential || 0) > 0).length;
    return winningBets / strategyBets.length;
  }

  private getRiskLevel(score: number): string {
    if (score <= 1.5) return 'LOW';
    if (score <= 2.5) return 'MEDIUM';
    return 'HIGH';
  }
}