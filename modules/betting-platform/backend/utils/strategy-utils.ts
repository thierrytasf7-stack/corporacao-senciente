import { RiskLevel, Bankroll } from '../types/strategy-types';
import { RISK_THRESHOLDS, BANKROLL_LIMITS } from '../config/strategy-config';

export function calculateMaxStake(bankroll: Bankroll, riskLevel: RiskLevel): number {
  const threshold = RISK_THRESHOLDS[riskLevel];
  const maxStake = bankroll.available * threshold.maxStake;
  
  return Math.min(
    maxStake,
    bankroll.available * BANKROLL_LIMITS.MAX_SINGLE_STAKE_PERCENT
  );
}

export function validateBankroll(bankroll: Bankroll): boolean {
  if (bankroll.total < BANKROLL_LIMITS.MIN_BANKROLL) {
    return false;
  }

  const minAvailable = bankroll.total * BANKROLL_LIMITS.MIN_AVAILABLE_PERCENT;
  if (bankroll.available < minAvailable) {
    return false;
  }

  return bankroll.allocated <= bankroll.total;
}

export function calculateRecommendedStake(
  bankroll: Bankroll,
  riskLevel: RiskLevel,
  confidence: number
): number {
  const maxStake = calculateMaxStake(bankroll, riskLevel);
  const threshold = RISK_THRESHOLDS[riskLevel];

  // Reduce stake if confidence is below threshold
  if (confidence < threshold.minConfidence) {
    const confidenceRatio = confidence / threshold.minConfidence;
    return maxStake * confidenceRatio;
  }

  return maxStake;
}

export function decimalToAmericanOdds(decimal: number): number {
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

export function americanToDecimalOdds(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

export function impliedProbability(decimalOdds: number): number {
  return 1 / decimalOdds;
}

export function oddsToMargin(odds: number[]): number {
  const totalImplied = odds.reduce((sum, odd) => sum + impliedProbability(odd), 0);
  return totalImplied - 1;
}

export function removeMargin(odds: number[]): number[] {
  const margin = oddsToMargin(odds);
  return odds.map(odd => {
    const impliedProb = impliedProbability(odd);
    const trueProb = impliedProb / (1 + margin);
    return 1 / trueProb;
  });
}