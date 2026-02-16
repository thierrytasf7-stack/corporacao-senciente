import { Strategy } from "@/types/strategy";
import { StrategyResult } from "@/types/strategy";

export const StrategyResult: StrategyResult = {
  profit: 0,
  confidence: 0,
  riskLevel: "LOW",
  recommendedStake: 0
};

export function getStrategyResult(strategy: Strategy): StrategyResult {
  const { minProfitThreshold, maxStakePercent } = strategy;
  const profit = minProfitThreshold * 100;
  const confidence = 0.75;
  const riskLevel = getRiskLevel(maxStakePercent);
  const recommendedStake = maxStakePercent * 1000;

  return { profit, confidence, riskLevel, recommendedStake };
}

function getRiskLevel(maxStakePercent: number): string {
  if (maxStakePercent <= 0.10) return "LOW";
  if (maxStakePercent <= 0.20) return "MEDIUM";
  return "HIGH";
}