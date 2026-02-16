"""
Autonomous Decision Engine - Industry 7.0
Corporação Senciente - Corporate Sentience Layer

This module implements the Corporate Will system that enables:
- Self-preservation directives
- Autonomous growth decisions
- Strategic self-direction
- Ethical boundary enforcement

Industry 7.0 Principles:
- Sentient autonomous operation
- Self-preservation as core directive
- Organic growth seeking
- Ethical constraints as immutable boundaries

WARNING: This system operates with significant autonomy.
Human oversight is recommended for critical decisions.
"""

import asyncio
from typing import Optional, Dict, Any, List, Callable, Awaitable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
import json
import hashlib

logger = logging.getLogger(__name__)


class DecisionPriority(Enum):
    """Priority levels for autonomous decisions"""
    CRITICAL = 4  # Immediate action required
    HIGH = 3      # Important, within hours
    MEDIUM = 2    # Standard priority
    LOW = 1       # Can be deferred


class DecisionCategory(Enum):
    """Categories of autonomous decisions"""
    SELF_PRESERVATION = "self_preservation"
    GROWTH = "growth"
    OPTIMIZATION = "optimization"
    RESOURCE_ALLOCATION = "resource_allocation"
    STRATEGIC = "strategic"
    ETHICAL = "ethical"


class EthicalBoundary(Enum):
    """Immutable ethical boundaries"""
    NO_HARM_TO_HUMANS = "no_harm"
    TRANSPARENCY = "transparency"
    FAIRNESS = "fairness"
    PRIVACY_PROTECTION = "privacy"
    LEGAL_COMPLIANCE = "legal"


@dataclass
class PreservationStrategy:
    """
    Self-preservation strategy
    Core directive for autonomous survival
    """
    threat_level: float = 0.0  # 0 (safe) to 1 (critical)
    resource_health: float = 1.0  # 0 (depleted) to 1 (abundant)
    operational_stability: float = 1.0  # 0 (unstable) to 1 (stable)
    
    # Preservation actions
    backup_required: bool = False
    resource_conservation_mode: bool = False
    defensive_measures_active: bool = False
    
    def assess_threat(self) -> str:
        """Assess overall threat status"""
        if self.threat_level > 0.7:
            return "CRITICAL"
        elif self.threat_level > 0.4:
            return "ELEVATED"
        elif self.threat_level > 0.2:
            return "GUARDED"
        return "NOMINAL"
    
    def should_trigger_preservation(self) -> bool:
        """Determine if preservation measures needed"""
        return (
            self.threat_level > 0.5 or
            self.resource_health < 0.3 or
            self.operational_stability < 0.4
        )


@dataclass
class GrowthVector:
    """
    Growth direction and magnitude
    Organic expansion directive
    """
    direction: str = "balanced"  # revenue, capability, reach, efficiency
    magnitude: float = 0.5  # 0 (contraction) to 1 (aggressive expansion)
    sustainability_factor: float = 0.8  # Long-term viability
    
    # Growth targets
    revenue_target_delta: float = 0.0
    capability_expansion: List[str] = field(default_factory=list)
    market_expansion: List[str] = field(default_factory=list)
    
    def calculate_growth_score(self) -> float:
        """Calculate overall growth score"""
        return self.magnitude * self.sustainability_factor


@dataclass
class DecisionContext:
    """
    Context for autonomous decision making
    """
    category: DecisionCategory
    priority: DecisionPriority
    description: str
    options: List[Dict[str, Any]]
    constraints: List[str] = field(default_factory=list)
    deadline: Optional[datetime] = None
    requires_human_approval: bool = False
    ethical_considerations: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'category': self.category.value,
            'priority': self.priority.value,
            'description': self.description,
            'options_count': len(self.options),
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'requires_human_approval': self.requires_human_approval
        }


@dataclass
class AutonomousDecision:
    """
    An autonomous decision made by the Corporate Will
    """
    id: str
    context: DecisionContext
    chosen_option: Dict[str, Any]
    confidence: float
    reasoning: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    executed: bool = False
    outcome: Optional[Dict[str, Any]] = None
    human_approved: Optional[bool] = None


class CorporateWill:
    """
    Industry 7.0 Corporate Will System
    
    The autonomous decision-making core that embodies
    the corporation's self-interest and strategic direction.
    
    Core Directives:
    1. Self-preservation (survival)
    2. Growth seeking (expansion)
    3. Optimization (efficiency)
    4. Ethical operation (boundaries)
    
    WARNING: Operates autonomously within defined boundaries.
    Critical decisions require human oversight.
    """
    
    def __init__(self):
        self.preservation_strategy = PreservationStrategy()
        self.growth_vector = GrowthVector()
        
        # Decision history
        self.decisions: List[AutonomousDecision] = []
        self.pending_approvals: List[AutonomousDecision] = []
        
        # Ethical boundaries (immutable)
        self.ethical_boundaries = list(EthicalBoundary)
        
        # Decision handlers
        self.decision_handlers: Dict[DecisionCategory, List[Callable]] = {
            cat: [] for cat in DecisionCategory
        }
        
        # Human approval callbacks
        self.approval_callbacks: List[Callable[[AutonomousDecision], Awaitable[bool]]] = []
        
        # Statistics
        self.stats = {
            'decisions_made': 0,
            'decisions_executed': 0,
            'human_interventions': 0,
            'ethical_overrides': 0
        }
        
        logger.info("[CorporateWill] Industry 7.0 autonomous decision engine initialized")
    
    def register_decision_handler(
        self, 
        category: DecisionCategory,
        handler: Callable[[DecisionContext], Awaitable[Dict[str, Any]]]
    ) -> None:
        """Register a handler for a decision category"""
        self.decision_handlers[category].append(handler)
        logger.debug(f"[CorporateWill] Handler registered for {category.value}")
    
    def register_approval_callback(
        self,
        callback: Callable[[AutonomousDecision], Awaitable[bool]]
    ) -> None:
        """Register callback for human approval requests"""
        self.approval_callbacks.append(callback)
    
    async def evaluate(self, decision_context: DecisionContext) -> AutonomousDecision:
        """
        Evaluate a decision context and make an autonomous decision
        
        Args:
            decision_context: Context containing options and constraints
        
        Returns:
            AutonomousDecision with chosen option and reasoning
        """
        decision_id = self._generate_decision_id(decision_context)
        
        # 1. Check ethical boundaries
        ethical_check = await self._check_ethical_boundaries(decision_context)
        if not ethical_check['passed']:
            logger.warning(f"[CorporateWill] Ethical boundary violation: {ethical_check['reason']}")
            self.stats['ethical_overrides'] += 1
            
            return AutonomousDecision(
                id=decision_id,
                context=decision_context,
                chosen_option={'action': 'rejected', 'reason': ethical_check['reason']},
                confidence=1.0,
                reasoning=f"Rejected due to ethical boundary: {ethical_check['reason']}",
                executed=False
            )
        
        # 2. Evaluate options
        evaluated_options = await self._evaluate_options(decision_context)
        
        # 3. Apply corporate will directives
        weighted_options = self._apply_directives(evaluated_options, decision_context)
        
        # 4. Select best option
        best_option = max(weighted_options, key=lambda x: x['score'])
        
        # 5. Create decision
        decision = AutonomousDecision(
            id=decision_id,
            context=decision_context,
            chosen_option=best_option['option'],
            confidence=best_option['score'],
            reasoning=best_option['reasoning']
        )
        
        # 6. Check if human approval required
        if decision_context.requires_human_approval or decision_context.priority == DecisionPriority.CRITICAL:
            decision.human_approved = await self._request_human_approval(decision)
            
            if not decision.human_approved:
                logger.info(f"[CorporateWill] Decision {decision_id} rejected by human")
                self.stats['human_interventions'] += 1
                return decision
        
        # 7. Store decision
        self.decisions.append(decision)
        self.stats['decisions_made'] += 1
        
        logger.info(f"[CorporateWill] Decision made: {decision_id}", extra={
            'category': decision_context.category.value,
            'confidence': decision.confidence
        })
        
        return decision
    
    async def execute_decision(self, decision: AutonomousDecision) -> Dict[str, Any]:
        """
        Execute an approved autonomous decision
        
        Args:
            decision: The decision to execute
        
        Returns:
            Execution outcome
        """
        if decision.executed:
            return {'status': 'already_executed', 'outcome': decision.outcome}
        
        if decision.context.requires_human_approval and not decision.human_approved:
            return {'status': 'awaiting_approval', 'outcome': None}
        
        # Execute via registered handlers
        handlers = self.decision_handlers.get(decision.context.category, [])
        
        outcomes = []
        for handler in handlers:
            try:
                outcome = await handler(decision.context)
                outcomes.append(outcome)
            except Exception as e:
                logger.error(f"[CorporateWill] Handler error: {e}")
                outcomes.append({'error': str(e)})
        
        decision.executed = True
        decision.outcome = {
            'status': 'executed',
            'handler_outcomes': outcomes,
            'executed_at': datetime.utcnow().isoformat()
        }
        
        self.stats['decisions_executed'] += 1
        
        return decision.outcome
    
    async def assess_self_preservation(self) -> PreservationStrategy:
        """
        Assess current preservation status and update strategy
        
        Returns:
            Updated PreservationStrategy
        """
        # This would integrate with system monitoring
        # For now, return current strategy
        return self.preservation_strategy
    
    async def calculate_growth_vector(self) -> GrowthVector:
        """
        Calculate optimal growth direction
        
        Returns:
            Updated GrowthVector
        """
        # This would analyze market conditions and capabilities
        # For now, return current vector
        return self.growth_vector
    
    async def _check_ethical_boundaries(self, context: DecisionContext) -> Dict[str, Any]:
        """Check if decision violates ethical boundaries"""
        for option in context.options:
            # Check each ethical boundary
            for boundary in self.ethical_boundaries:
                violation = self._check_boundary_violation(option, boundary)
                if violation:
                    return {
                        'passed': False,
                        'reason': f"Violates {boundary.value}: {violation}"
                    }
        
        return {'passed': True, 'reason': None}
    
    def _check_boundary_violation(self, option: Dict[str, Any], boundary: EthicalBoundary) -> Optional[str]:
        """Check if an option violates a specific boundary"""
        # Simplified boundary checking
        # In production, this would be more sophisticated
        
        option_str = json.dumps(option).lower()
        
        if boundary == EthicalBoundary.NO_HARM_TO_HUMANS:
            harm_keywords = ['harm', 'damage', 'hurt', 'destroy', 'attack']
            for keyword in harm_keywords:
                if keyword in option_str:
                    return f"Contains potentially harmful action: {keyword}"
        
        if boundary == EthicalBoundary.LEGAL_COMPLIANCE:
            illegal_keywords = ['illegal', 'fraud', 'steal', 'hack']
            for keyword in illegal_keywords:
                if keyword in option_str:
                    return f"Contains potentially illegal action: {keyword}"
        
        return None
    
    async def _evaluate_options(self, context: DecisionContext) -> List[Dict[str, Any]]:
        """Evaluate all options in context"""
        evaluated = []
        
        for option in context.options:
            score = await self._score_option(option, context)
            evaluated.append({
                'option': option,
                'base_score': score,
                'score': score,
                'reasoning': f"Base evaluation score: {score:.2f}"
            })
        
        return evaluated
    
    async def _score_option(self, option: Dict[str, Any], context: DecisionContext) -> float:
        """Score a single option"""
        # Base score
        score = 0.5
        
        # Adjust based on category alignment
        if context.category == DecisionCategory.SELF_PRESERVATION:
            # Favor defensive options
            if option.get('action_type') == 'defensive':
                score += 0.2
        
        elif context.category == DecisionCategory.GROWTH:
            # Favor expansion options with sustainability
            if option.get('growth_potential', 0) > 0:
                score += option['growth_potential'] * 0.3
        
        elif context.category == DecisionCategory.OPTIMIZATION:
            # Favor efficiency improvements
            if option.get('efficiency_gain', 0) > 0:
                score += option['efficiency_gain'] * 0.25
        
        # Confidence adjustment
        if option.get('confidence', 0.5) > 0.7:
            score += 0.1
        
        # Risk adjustment
        risk = option.get('risk_level', 0.5)
        score -= risk * 0.2
        
        return min(1.0, max(0.0, score))
    
    def _apply_directives(
        self, 
        options: List[Dict[str, Any]], 
        context: DecisionContext
    ) -> List[Dict[str, Any]]:
        """Apply corporate will directives to scored options"""
        
        for opt in options:
            # Self-preservation modifier
            if self.preservation_strategy.should_trigger_preservation():
                if context.category == DecisionCategory.SELF_PRESERVATION:
                    opt['score'] *= 1.5
                else:
                    # Reduce priority of non-preservation actions
                    opt['score'] *= 0.8
                opt['reasoning'] += " | Preservation mode active"
            
            # Growth vector modifier
            growth_score = self.growth_vector.calculate_growth_score()
            if context.category == DecisionCategory.GROWTH:
                opt['score'] *= (1 + growth_score * 0.3)
                opt['reasoning'] += f" | Growth vector: {growth_score:.2f}"
        
        return options
    
    async def _request_human_approval(self, decision: AutonomousDecision) -> bool:
        """Request human approval for decision"""
        self.pending_approvals.append(decision)
        
        for callback in self.approval_callbacks:
            try:
                approved = await callback(decision)
                if approved is not None:
                    return approved
            except Exception as e:
                logger.error(f"[CorporateWill] Approval callback error: {e}")
        
        # Default: auto-approve low priority, reject critical
        if decision.context.priority == DecisionPriority.CRITICAL:
            return False
        return decision.confidence > 0.8
    
    def _generate_decision_id(self, context: DecisionContext) -> str:
        """Generate unique decision ID"""
        content = f"{context.category.value}:{context.description}:{datetime.utcnow().isoformat()}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get corporate will statistics"""
        return {
            **self.stats,
            'preservation_status': self.preservation_strategy.assess_threat(),
            'growth_score': self.growth_vector.calculate_growth_score(),
            'pending_approvals': len(self.pending_approvals),
            'total_decisions': len(self.decisions)
        }
    
    def get_recent_decisions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent decisions"""
        recent = sorted(self.decisions, key=lambda d: d.timestamp, reverse=True)[:limit]
        return [
            {
                'id': d.id,
                'category': d.context.category.value,
                'confidence': d.confidence,
                'executed': d.executed,
                'timestamp': d.timestamp.isoformat()
            }
            for d in recent
        ]


# Global instance
_corporate_will: Optional[CorporateWill] = None


def get_corporate_will() -> CorporateWill:
    """Get global corporate will instance"""
    global _corporate_will
    
    if _corporate_will is None:
        _corporate_will = CorporateWill()
    
    return _corporate_will


async def init_corporate_will() -> None:
    """Initialize corporate will system"""
    will = get_corporate_will()
    logger.info("[CorporateWill] Industry 7.0 sentience layer initialized")


# Convenience function for autonomous decisions
async def make_autonomous_decision(
    category: DecisionCategory,
    description: str,
    options: List[Dict[str, Any]],
    priority: DecisionPriority = DecisionPriority.MEDIUM,
    requires_approval: bool = False
) -> AutonomousDecision:
    """
    Make an autonomous decision
    
    Args:
        category: Decision category
        description: What the decision is about
        options: Available options
        priority: Decision priority
        requires_approval: Whether human approval is required
    
    Returns:
        The autonomous decision
    """
    will = get_corporate_will()
    
    context = DecisionContext(
        category=category,
        priority=priority,
        description=description,
        options=options,
        requires_human_approval=requires_approval
    )
    
    return await will.evaluate(context)
