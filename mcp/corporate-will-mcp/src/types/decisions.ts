/**
 * Decision Types
 * Corporacao Senciente - Corporate Will MCP
 */

export type DecisionCategory = 'growth' | 'preservation' | 'strategic' | 'operational' | 'trading';
export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical';
export type ThreatLevel = 'nominal' | 'elevated' | 'high' | 'critical';

export interface DecisionContext {
  category: DecisionCategory;
  priority: DecisionPriority;
  description: string;
  options: DecisionOption[];
  metadata?: Record<string, any>;
  requestor?: string;
  timestamp: number;
}

export interface DecisionOption {
  action: string;
  cost?: number;
  risk_level: number; // 0-1
  expected_return?: number;
  ethical_concerns?: string[];
  time_to_implement?: string;
}

export interface DecisionResult {
  decision_id: string;
  approved: boolean;
  chosen_option?: DecisionOption;
  reasoning: string;
  confidence: number;
  ethical_check: EthicalCheckResult;
  risk_assessment: RiskAssessment;
  timestamp: number;
}

export interface EthicalCheckResult {
  passed: boolean;
  violations: string[];
  warnings: string[];
  boundary_checked: string[];
}

export interface RiskAssessment {
  overall_risk: number; // 0-1
  factors: RiskFactor[];
  mitigation_required: boolean;
  mitigation_suggestions: string[];
}

export interface RiskFactor {
  name: string;
  level: number; // 0-1
  description: string;
}

export interface PreservationStatus {
  threat_level: ThreatLevel;
  resource_health: number; // 0-1
  operational_stability: number; // 0-1
  external_threats: string[];
  recommended_actions: string[];
}

export interface GrowthVector {
  direction: 'expansion' | 'consolidation' | 'innovation' | 'efficiency';
  magnitude: number; // 0-1
  sustainability: number; // 0-1
  timeline: string;
  constraints: string[];
}

export interface EthicalBoundary {
  id: string;
  name: string;
  description: string;
  violation_keywords: string[];
  severity: 'warning' | 'block' | 'critical';
  immutable: boolean;
}
