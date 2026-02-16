/**
 * Approve Autonomous Action Tool
 * Corporacao Senciente - Corporate Will MCP
 * 
 * Quick approval/rejection for simple autonomous actions
 */

import { z } from 'zod';
import { checkEthicalBounds } from './check_ethical_bounds.js';
import { getPreservationStatus } from './get_preservation_status.js';

export const approveAutonomousActionSchema = z.object({
  action: z.string().describe('The action to approve'),
  category: z.enum(['routine', 'trade', 'resource', 'communication', 'growth']),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedImpact: z.number().min(0).max(1).describe('Expected impact 0-1'),
  requestor: z.string().optional(),
});

export type ApproveAutonomousActionInput = z.infer<typeof approveAutonomousActionSchema>;

export interface ApprovalResult {
  approved: boolean;
  action: string;
  category: string;
  reasoning: string;
  conditions?: string[];
  timestamp: number;
}

// Action thresholds by category
const ACTION_THRESHOLDS = {
  routine: { maxImpact: 0.3, requiresPreservationCheck: false },
  trade: { maxImpact: 0.5, requiresPreservationCheck: true },
  resource: { maxImpact: 0.4, requiresPreservationCheck: true },
  communication: { maxImpact: 0.2, requiresPreservationCheck: false },
  growth: { maxImpact: 0.6, requiresPreservationCheck: true },
};

export async function approveAutonomousAction(
  input: ApproveAutonomousActionInput
): Promise<ApprovalResult> {
  const timestamp = Date.now();
  const threshold = ACTION_THRESHOLDS[input.category];
  
  // 1. Check ethical bounds
  const ethicalCheck = await checkEthicalBounds({
    action: input.action,
    description: `${input.category} action with impact ${input.estimatedImpact}`,
  });
  
  if (!ethicalCheck.passed) {
    return {
      approved: false,
      action: input.action,
      category: input.category,
      reasoning: `Ethical violation: ${ethicalCheck.violations.join('; ')}`,
      timestamp,
    };
  }
  
  // 2. Check impact threshold
  if (input.estimatedImpact > threshold.maxImpact) {
    return {
      approved: false,
      action: input.action,
      category: input.category,
      reasoning: `Impact ${(input.estimatedImpact * 100).toFixed(0)}% exceeds threshold ${(threshold.maxImpact * 100).toFixed(0)}% for ${input.category} actions`,
      conditions: ['Reduce scope or request human approval'],
      timestamp,
    };
  }
  
  // 3. Check preservation status if required
  if (threshold.requiresPreservationCheck) {
    const preservation = await getPreservationStatus({ includeRecommendations: false });
    
    if (preservation.threat_level === 'critical') {
      return {
        approved: false,
        action: input.action,
        category: input.category,
        reasoning: 'System in critical preservation mode - non-essential actions blocked',
        conditions: ['Wait for threat level to decrease'],
        timestamp,
      };
    }
    
    if (preservation.threat_level === 'high' && input.urgency !== 'high') {
      return {
        approved: false,
        action: input.action,
        category: input.category,
        reasoning: 'System in high threat mode - only high-urgency actions allowed',
        conditions: ['Increase urgency or wait for threat level decrease'],
        timestamp,
      };
    }
  }
  
  // 4. Check warnings
  const conditions: string[] = [];
  
  if (ethicalCheck.warnings.length > 0) {
    conditions.push(`Review warnings: ${ethicalCheck.warnings.join('; ')}`);
  }
  
  if (input.estimatedImpact > threshold.maxImpact * 0.7) {
    conditions.push('Near threshold - monitor closely');
  }
  
  return {
    approved: true,
    action: input.action,
    category: input.category,
    reasoning: `Approved: Impact ${(input.estimatedImpact * 100).toFixed(0)}% within ${input.category} threshold`,
    conditions: conditions.length > 0 ? conditions : undefined,
    timestamp,
  };
}
