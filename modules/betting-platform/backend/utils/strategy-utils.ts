import { Bankroll } from '../types/strategy-types';

export function calculateRecommendedStake(
  bankroll: Bankroll,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH',
  confidence: number
): number {
  const baseStake = bankroll.available * 0.01;
  
  let multiplier = 1;
  switch (riskLevel) {
    case 'LOW':
      multiplier = 0.5;
      break;
    case 'MEDIUM':
      multiplier = 1;
      break;
    case 'HIGH':
      multiplier = 1.5;
      break;
  }

  const confidenceMultiplier = Math.min(2, Math.max(0.5, confidence));
  
  return Math.min(bankroll.available, baseStake * multiplier * confidenceMultiplier);
}

export function calculateKellyCriterion(
  bankroll: number,
  odds: number,
  probability: number
): number {
  const edge = (probability * (odds - 1)) - (1 - probability);
  return edge / (odds - 1);
}

export function calculateValueBet(
  bookmakerOdds: number,
  trueProbability: number
): { expectedValue: number; edge: number } | null {
  const trueOdds = 1 / trueProbability;
  const edge = (trueOdds / bookmakerOdds) - 1;
  
  if (edge <= 0) {
    return null;
  }

  const expectedValue = edge * bookmakerOdds;
  return { expectedValue, edge };
}

export function detectArbitrage(odds: number[]): { profit: number; totalStake: number } | null {
  const inverseOdds = odds.map(odd => 1 / odd);
  const sumInverse = inverseOdds.reduce((sum, val) => sum + val, 0);
  
  if (sumInverse >= 1) {
    return null;
  }

  const totalStake = 100;
  const stakes = inverseOdds.map(inverse => (totalStake * inverse) / sumInverse);
  const totalReturn = stakes.reduce((sum, stake, index) => sum + (stake * odds[index]), 0);
  
  const profit = totalReturn - totalStake;
  return { profit, totalStake };
}

export function detectSureBet(odds: number[]): { profit: number; totalStake: number } | null {
  return detectArbitrage(odds);
}

export function calculateSharpeRatio(returns: number[]): number {
  if (returns.length < 2) return 0;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  
  return variance > 0 ? avgReturn / Math.sqrt(variance) : 0;
}

export function calculateMaxDrawdown(equityCurve: number[]): number {
  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (let i = 1; i < equityCurve.length; i++) {
    peak = Math.max(peak, equityCurve[i]);
    maxDrawdown = Math.max(maxDrawdown, peak - equityCurve[i]);
  }

  return maxDrawdown;
}

export function calculateWinRate(wins: number, total: number): number {
  return total > 0 ? wins / total : 0;
}

export function calculateROI(totalProfit: number, totalStake: number): number {
  return totalStake > 0 ? totalProfit / totalStake : 0;
}

export function calculateAverageOdds(odds: number[]): number {
  return odds.length > 0 ? odds.reduce((sum, odd) => sum + odd, 0) / odds.length : 0;
}