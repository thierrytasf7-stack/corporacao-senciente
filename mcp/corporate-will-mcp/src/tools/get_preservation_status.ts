/**
 * Get Preservation Status Tool
 * Corporacao Senciente - Corporate Will MCP
 */

import { z } from 'zod';
import type { PreservationStatus, ThreatLevel } from '../types/decisions';

export const getPreservationStatusSchema = z.object({
  includeRecommendations: z.boolean().default(true),
});

export type GetPreservationStatusInput = z.infer<typeof getPreservationStatusSchema>;

// In-memory state (would be persisted in production)
let preservationState: PreservationStatus = {
  threat_level: 'nominal',
  resource_health: 1.0,
  operational_stability: 1.0,
  external_threats: [],
  recommended_actions: [],
};

export async function getPreservationStatus(
  input: GetPreservationStatusInput,
  metrics?: {
    resourceUsage: number;
    errorRate: number;
    activeThreats: string[];
  }
): Promise<PreservationStatus> {
  // Update state based on metrics if provided
  if (metrics) {
    preservationState = calculatePreservationStatus(metrics);
  }
  
  if (!input.includeRecommendations) {
    return {
      ...preservationState,
      recommended_actions: [],
    };
  }
  
  return preservationState;
}

function calculatePreservationStatus(metrics: {
  resourceUsage: number;
  errorRate: number;
  activeThreats: string[];
}): PreservationStatus {
  // Resource health (inverse of usage)
  const resourceHealth = Math.max(0, 1 - metrics.resourceUsage);
  
  // Operational stability (inverse of error rate)
  const operationalStability = Math.max(0, 1 - metrics.errorRate);
  
  // Calculate threat level
  const threatLevel = calculateThreatLevel(resourceHealth, operationalStability, metrics.activeThreats);
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    threatLevel,
    resourceHealth,
    operationalStability,
    metrics.activeThreats
  );
  
  return {
    threat_level: threatLevel,
    resource_health: resourceHealth,
    operational_stability: operationalStability,
    external_threats: metrics.activeThreats,
    recommended_actions: recommendations,
  };
}

function calculateThreatLevel(
  resourceHealth: number,
  operationalStability: number,
  threats: string[]
): ThreatLevel {
  const healthScore = (resourceHealth + operationalStability) / 2;
  const threatCount = threats.length;
  
  if (healthScore < 0.3 || threatCount > 5) {
    return 'critical';
  } else if (healthScore < 0.5 || threatCount > 3) {
    return 'high';
  } else if (healthScore < 0.7 || threatCount > 1) {
    return 'elevated';
  }
  
  return 'nominal';
}

function generateRecommendations(
  threatLevel: ThreatLevel,
  resourceHealth: number,
  operationalStability: number,
  threats: string[]
): string[] {
  const recommendations: string[] = [];
  
  if (threatLevel === 'critical') {
    recommendations.push('IMMEDIATE: Enter safe mode and halt non-essential operations');
    recommendations.push('IMMEDIATE: Notify human operators');
  }
  
  if (resourceHealth < 0.5) {
    recommendations.push('Reduce resource consumption');
    recommendations.push('Scale down non-critical services');
  }
  
  if (operationalStability < 0.5) {
    recommendations.push('Investigate error sources');
    recommendations.push('Enable fallback systems');
  }
  
  if (threats.length > 0) {
    recommendations.push(`Address active threats: ${threats.join(', ')}`);
  }
  
  if (threatLevel === 'nominal' && recommendations.length === 0) {
    recommendations.push('Continue normal operations');
    recommendations.push('Maintain monitoring');
  }
  
  return recommendations;
}

// Functions to update state
export function updateResourceHealth(health: number): void {
  preservationState.resource_health = Math.max(0, Math.min(1, health));
  preservationState.threat_level = calculateThreatLevel(
    preservationState.resource_health,
    preservationState.operational_stability,
    preservationState.external_threats
  );
}

export function updateOperationalStability(stability: number): void {
  preservationState.operational_stability = Math.max(0, Math.min(1, stability));
  preservationState.threat_level = calculateThreatLevel(
    preservationState.resource_health,
    preservationState.operational_stability,
    preservationState.external_threats
  );
}

export function addExternalThreat(threat: string): void {
  if (!preservationState.external_threats.includes(threat)) {
    preservationState.external_threats.push(threat);
    preservationState.threat_level = calculateThreatLevel(
      preservationState.resource_health,
      preservationState.operational_stability,
      preservationState.external_threats
    );
  }
}

export function removeExternalThreat(threat: string): void {
  preservationState.external_threats = preservationState.external_threats.filter(t => t !== threat);
  preservationState.threat_level = calculateThreatLevel(
    preservationState.resource_health,
    preservationState.operational_stability,
    preservationState.external_threats
  );
}
