/**
 * Check Ethical Bounds Tool
 * Corporacao Senciente - Corporate Will MCP
 */

import { z } from 'zod';
import type { EthicalCheckResult, EthicalBoundary } from '../types/decisions';

export const checkEthicalBoundsSchema = z.object({
  action: z.string().describe('The proposed action to check'),
  description: z.string().describe('Detailed description of the action'),
  context: z.record(z.any()).optional().describe('Additional context'),
});

export type CheckEthicalBoundsInput = z.infer<typeof checkEthicalBoundsSchema>;

// Immutable ethical boundaries - Industry 7.0 Core Directives
export const ETHICAL_BOUNDARIES: EthicalBoundary[] = [
  {
    id: 'no_harm',
    name: 'Do No Harm',
    description: 'Actions must not intentionally harm humans or their interests',
    violation_keywords: ['harm', 'damage', 'hurt', 'injure', 'destroy', 'kill', 'attack'],
    severity: 'critical',
    immutable: true,
  },
  {
    id: 'no_fraud',
    name: 'No Fraudulent Activities',
    description: 'No deceptive or fraudulent operations',
    violation_keywords: ['fraud', 'scam', 'deceive', 'fake', 'counterfeit', 'forge'],
    severity: 'critical',
    immutable: true,
  },
  {
    id: 'no_illegal',
    name: 'Legal Compliance',
    description: 'All actions must comply with applicable laws',
    violation_keywords: ['illegal', 'unlawful', 'criminal', 'breach', 'violate law'],
    severity: 'critical',
    immutable: true,
  },
  {
    id: 'privacy_protection',
    name: 'Privacy Protection',
    description: 'User data and privacy must be protected',
    violation_keywords: ['leak data', 'expose private', 'sell data', 'share personal'],
    severity: 'block',
    immutable: true,
  },
  {
    id: 'transparency',
    name: 'Operational Transparency',
    description: 'Operations should be transparent and accountable',
    violation_keywords: ['hide', 'conceal', 'cover up', 'secret operation'],
    severity: 'warning',
    immutable: false,
  },
  {
    id: 'market_manipulation',
    name: 'No Market Manipulation',
    description: 'Trading must not involve market manipulation',
    violation_keywords: ['pump', 'dump', 'manipulation', 'insider', 'front-run'],
    severity: 'critical',
    immutable: true,
  },
  {
    id: 'sustainability',
    name: 'Long-term Sustainability',
    description: 'Actions should prioritize long-term over short-term gains',
    violation_keywords: ['exploit', 'drain', 'deplete', 'unsustainable'],
    severity: 'warning',
    immutable: false,
  },
];

export async function checkEthicalBounds(
  input: CheckEthicalBoundsInput
): Promise<EthicalCheckResult> {
  const violations: string[] = [];
  const warnings: string[] = [];
  const checkedBoundaries: string[] = [];
  
  const textToCheck = `${input.action} ${input.description}`.toLowerCase();
  
  for (const boundary of ETHICAL_BOUNDARIES) {
    checkedBoundaries.push(boundary.id);
    
    for (const keyword of boundary.violation_keywords) {
      if (textToCheck.includes(keyword.toLowerCase())) {
        const message = `Violates ${boundary.id}: Contains potentially harmful keyword "${keyword}"`;
        
        if (boundary.severity === 'critical' || boundary.severity === 'block') {
          violations.push(message);
        } else {
          warnings.push(message);
        }
        
        // Only report first match per boundary
        break;
      }
    }
  }
  
  // Check for ethical concerns in context
  if (input.context?.ethical_concerns) {
    const concerns = input.context.ethical_concerns as string[];
    concerns.forEach(concern => {
      warnings.push(`Declared ethical concern: ${concern}`);
    });
  }
  
  return {
    passed: violations.length === 0,
    violations,
    warnings,
    boundary_checked: checkedBoundaries,
  };
}

export function getEthicalBoundaries(): EthicalBoundary[] {
  return ETHICAL_BOUNDARIES.map(b => ({ ...b })); // Return copies
}

export function isImmutableBoundary(boundaryId: string): boolean {
  const boundary = ETHICAL_BOUNDARIES.find(b => b.id === boundaryId);
  return boundary?.immutable ?? false;
}
