import { detectArbitrage, detectSureBet } from '../utils/strategy-utils';

export default class ArbitrageDetector {
  private threshold: number;

  constructor(threshold: number = 0.01) {
    this.threshold = threshold;
  }

  detectArbitrage(odds: number[]): { profit: number; totalStake: number } | null {
    const result = detectArbitrage(odds);
    if (!result) return null;

    if (result.profit / result.totalStake < this.threshold) {
      return null;
    }

    return result;
  }

  detectSureBet(odds: number[]): { profit: number; totalStake: number } | null {
    const result = detectSureBet(odds);
    if (!result) return null;

    if (result.profit / result.totalStake < this.threshold) {
      return null;
    }

    return result;
  }

  getThreshold(): number {
    return this.threshold;
  }

  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, threshold);
  }

  calculateOptimalStake(
    totalBankroll: number,
    odds: number[]
  ): number[] | null {
    const arbitrage = this.detectArbitrage(odds);
    if (!arbitrage) return null;

    const inverseOdds = odds.map(odd => 1 / odd);
    const sumInverse = inverseOdds.reduce((sum, val) => sum + val, 0);
    
    return inverseOdds.map(inverse => (totalBankroll * inverse) / sumInverse);
  }

  calculateProfitPercentage(odds: number[]): number | null {
    const arbitrage = this.detectArbitrage(odds);
    if (!arbitrage) return null;

    return arbitrage.profit / arbitrage.totalStake;
  }
}
