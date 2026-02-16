"""
Core Domain Entities
Entidades centrais do domínio DDD da Corporação Senciente
"""

from .holding import Holding, Subsidiary, Agent, Opportunity

__all__ = [
    'Holding',
    'Subsidiary',
    'Agent',
    'Opportunity'
]