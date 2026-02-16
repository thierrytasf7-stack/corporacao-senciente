"""
Value Objects para Domain-Driven Design
Objetos imutáveis que representam conceitos de negócio
"""

from .business_type import BusinessType
from .agent_role import AgentRole
from .revenue_model import RevenueModel
from .market_opportunity import MarketOpportunity
from .llb_protocol import LLBProtocol

__all__ = [
    'BusinessType',
    'AgentRole',
    'RevenueModel',
    'MarketOpportunity',
    'LLBProtocol'
]