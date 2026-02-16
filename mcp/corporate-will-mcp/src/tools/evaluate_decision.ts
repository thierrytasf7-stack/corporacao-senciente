/**
 * Evaluate Decision Tool
 * Corporacao Senciente - Corporate Will MCP
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type {
  DecisionContext,
  DecisionResult,
  EthicalCheckResult,
  RiskAssessment,
} from '../types/decisions';
import { checkEthicalBounds, ETHICAL_BOUNDARIES } from './check_ethical_bounds.js';

export const evaluateDecisionSchema = z.object({
  category: z.enum(['growth', 'preservation', 'strategic', 'operational', 'trading']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10),
  options: z.array(z.object({
    action: z.string(),
    cost: z.number().optional(),
    risk_level: z.number().min(0).max(1),
    expected_return: z.number().optional(),
    ethical_concerns: z.array(z.string()).optional(),
    time_to_implement: z.string().optional(),
  })).min(1),
  metadata: z.record(z.any()).optional(),
  requestor: z.string().optional(),
});

export type EvaluateDecisionInput = z.infer<typeof evaluateDecisionSchema>;

export async function evaluateDecision(
  input: EvaluateDecisionInput,
  config: { riskTolerance: number; prioritizePreservation: boolean }
): Promise<DecisionResult> {
  const decisionId = uuidv4();
  const timestamp = Date.now();
  
  // 1. Check ethical bounds for all options
  const ethicalResults = await Promise.all(
    input.options.map(opt => checkEthicalBounds({
      action: opt.action,
      description: input.description,
      context: input.metadata,
    }))
  );
  
  // Filter out ethically unacceptable options
  const acceptableOptions = input.options.filter((_, i) => ethicalResults[i].passed);
  
  // If no options pass ethical check, reject
  if (acceptableOptions.length === 0) {
    return {
      decision_id: decisionId,
      approved: false,
      reasoning: 'All options failed ethical boundary check',
      confidence: 1.0,
      ethical_check: combineEthicalResults(ethicalResults),
      risk_assessment: {
        overall_risk: 1.0,
        factors: [{ name: 'ethical_violation', level: 1.0, description: 'All options violate ethical boundaries' }],
        mitigation_required: true,
        mitigation_suggestions: ['Review proposed actions against ethical guidelines'],
      },
      timestamp,
    };
  }
  
  // 2. Assess risk for remaining options
  const riskAssessments = acceptableOptions.map(opt => assessRisk(opt, input, config));
  
  // 3. Score options
  const scores = acceptableOptions.map((opt, i) => ({
    option: opt,
    ethical: ethicalResults[input.options.indexOf(opt)],
    risk: riskAssessments[i],
    score: calculateOptionScore(opt, riskAssessments[i], input.priority, config),
  }));
  
  // 4. Select best option
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  
  // 5. Final approval based on risk tolerance
  const approved = best.risk.overall_risk <= config.riskTolerance;
  
  return {
    decision_id: decisionId,
    approved,
    chosen_option: approved ? best.option : undefined,
    reasoning: generateReasoning(best, approved, config),
    confidence: calculateConfidence(best, scores),
    ethical_check: best.ethical,
    risk_assessment: best.risk,
    timestamp,
  };
}

function assessRisk(
  option: EvaluateDecisionInput['options'][0],
  context: EvaluateDecisionInput,
  config: { riskTolerance: number; prioritizePreservation: boolean }
): RiskAssessment {
  const factors = [];
  let totalRisk = 0;
  
  // Base risk from option
  factors.push({
    name: 'inherent_risk',
    level: option.risk_level,
    description: 'Risk level declared for this action',
  });
  totalRisk += option.risk_level * 0.4;
  
  // Priority-based risk
  const priorityRisk = { low: 0.1, medium: 0.3, high: 0.5, critical: 0.7 }[context.priority];
  factors.push({
    name: 'priority_urgency',
    level: priorityRisk,
    description: `${context.priority} priority increases risk exposure`,
  });
  totalRisk += priorityRisk * 0.2;
  
  // Cost-based risk
  if (option.cost && option.cost > 0) {
    const costRisk = Math.min(1, option.cost / 100000); // Scale to $100k
    factors.push({
      name: 'financial_exposure',
      level: costRisk,
      description: `Financial commitment of ${option.cost}`,
    });
    totalRisk += costRisk * 0.2;
  }
  
  // Preservation priority
  if (config.prioritizePreservation && context.category === 'growth') {
    factors.push({
      name: 'preservation_priority',
      level: 0.3,
      description: 'Growth actions during preservation mode carry extra risk',
    });
    totalRisk += 0.3 * 0.2;
  }
  
  const overall = Math.min(1, totalRisk);
  
  return {
    overall_risk: overall,
    factors,
    mitigation_required: overall > config.riskTolerance,
    mitigation_suggestions: overall > config.riskTolerance
      ? ['Consider lower-risk alternatives', 'Implement staged rollout', 'Add monitoring']
      : [],
  };
}

function calculateOptionScore(
  option: EvaluateDecisionInput['options'][0],
  risk: RiskAssessment,
  priority: EvaluateDecisionInput['priority'],
  config: { riskTolerance: number; prioritizePreservation: boolean }
): number {
  let score = 0;
  
  // Lower risk = higher score
  score += (1 - risk.overall_risk) * 40;
  
  // Expected return
  if (option.expected_return) {
    score += Math.min(30, option.expected_return / 10000); // Scale returns
  }
  
  // Priority alignment
  const priorityBonus = { low: 5, medium: 10, high: 15, critical: 20 }[priority];
  score += priorityBonus;
  
  // Cost efficiency
  if (option.cost && option.expected_return) {
    const roi = option.expected_return / option.cost;
    score += Math.min(10, roi * 5);
  }
  
  return score;
}

function combineEthicalResults(results: EthicalCheckResult[]): EthicalCheckResult {
  return {
    passed: results.some(r => r.passed),
    violations: [...new Set(results.flatMap(r => r.violations))],
    warnings: [...new Set(results.flatMap(r => r.warnings))],
    boundary_checked: [...new Set(results.flatMap(r => r.boundary_checked))],
  };
}

function calculateConfidence(
  best: { score: number },
  all: { score: number }[]
): number {
  if (all.length === 1) return 0.7;
  
  const secondBest = all[1].score;
  const gap = best.score - secondBest;
  
  // Larger gap = higher confidence
  return Math.min(0.95, 0.5 + (gap / 100));
}

function generateReasoning(
  best: { option: any; risk: RiskAssessment; score: number },
  approved: boolean,
  config: { riskTolerance: number }
): string {
  if (!approved) {
    return `Rejected: Risk level (${(best.risk.overall_risk * 100).toFixed(1)}%) exceeds tolerance (${(config.riskTolerance * 100).toFixed(1)}%). ` +
      `Mitigation required: ${best.risk.mitigation_suggestions.join('; ')}`;
  }
  
  return `Approved: "${best.option.action}" selected with risk level ${(best.risk.overall_risk * 100).toFixed(1)}% ` +
    `(within tolerance of ${(config.riskTolerance * 100).toFixed(1)}%). Score: ${best.score.toFixed(1)}/100.`;
}
