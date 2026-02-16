"""
Revenue Sharing System Service
Sistema inteligente de distribuição de receita entre holding e subsidiárias
"""

import asyncio
from typing import Dict, List, Any, Optional
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from enum import Enum

from ..entities.holding import Holding, Subsidiary
from ...agents.memory.episodic_memory import EpisodicMemorySystem


class RevenueSharingModel(Enum):
    """Modelos de compartilhamento de receita"""
    FIXED_PERCENTAGE = "fixed_percentage"
    PERFORMANCE_BASED = "performance_based"
    HYBRID = "hybrid"
    EQUITY_BASED = "equity_based"


class RevenueSharingSystem:
    """
    Sistema para gestão inteligente da distribuição de receita
    Otimiza alocação entre holding e subsidiárias baseado em performance
    """

    def __init__(self,
                 holding: Holding,
                 memory_system: Optional[EpisodicMemorySystem] = None):
        self.holding = holding
        self.memory_system = memory_system or EpisodicMemorySystem()

        # Configurações padrão de compartilhamento
        self.default_sharing_rules = {
            'holding_base_percentage': Decimal('0.40'),  # 40% para holding
            'reinvestment_percentage': Decimal('0.15'),  # 15% para reinvestimento
            'subsidiary_minimum': Decimal('0.45'),       # 45% mínimo para subsidiária
            'performance_bonus_cap': Decimal('0.10'),    # Bônus máximo de performance
            'risk_adjustment_factor': Decimal('0.05')    # Ajuste por risco
        }

        # Histórico de distribuições
        self.distribution_history: List[Dict[str, Any]] = []

        # Métricas de otimização
        self.total_distributed = Decimal('0')
        self.optimization_cycles = 0

    async def distribute_revenue(self,
                                subsidiary: Subsidiary,
                                revenue_amount: Decimal,
                                period: str = "monthly") -> Dict[str, Any]:
        """
        Distribui receita de uma subsidiária

        Args:
            subsidiary: Subsidiária que gerou a receita
            revenue_amount: Valor da receita a distribuir
            period: Período da distribuição (monthly, quarterly, yearly)

        Returns:
            Dict com detalhes da distribuição
        """
        distribution = {
            'subsidiary_id': subsidiary.id,
            'subsidiary_name': subsidiary.name,
            'revenue_amount': revenue_amount,
            'distribution_period': period,
            'holding_allocation': Decimal('0'),
            'reinvestment_allocation': Decimal('0'),
            'subsidiary_allocation': Decimal('0'),
            'performance_bonuses': {},
            'risk_adjustments': {},
            'total_allocated': Decimal('0'),
            'distribution_timestamp': datetime.utcnow(),
            'optimization_applied': False
        }

        try:
            # Calcular alocações base
            base_allocations = self._calculate_base_allocations(revenue_amount)

            # Aplicar ajustes de performance
            performance_adjustments = await self._calculate_performance_adjustments(subsidiary)

            # Aplicar ajustes de risco
            risk_adjustments = self._calculate_risk_adjustments(subsidiary)

            # Calcular distribuição final
            final_distribution = self._calculate_final_distribution(
                revenue_amount, base_allocations, performance_adjustments, risk_adjustments
            )

            distribution.update(final_distribution)

            # Aplicar distribuições
            await self._apply_distributions(distribution)

            # Registrar distribuição
            self.distribution_history.append(distribution)
            await self._log_distribution_memory(distribution)

            # Atualizar métricas
            self.total_distributed += revenue_amount

        except Exception as e:
            distribution['error'] = str(e)
            await self._log_distribution_memory(distribution, error=str(e))

        return distribution

    def _calculate_base_allocations(self, revenue_amount: Decimal) -> Dict[str, Decimal]:
        """Calcula alocações base de receita"""
        rules = self.default_sharing_rules

        return {
            'holding': revenue_amount * rules['holding_base_percentage'],
            'reinvestment': revenue_amount * rules['reinvestment_percentage'],
            'subsidiary': revenue_amount * rules['subsidiary_minimum']
        }

    async def _calculate_performance_adjustments(self, subsidiary: Subsidiary) -> Dict[str, Any]:
        """Calcula ajustes baseados na performance da subsidiária"""
        adjustments = {
            'health_bonus': Decimal('0'),
            'growth_bonus': Decimal('0'),
            'efficiency_bonus': Decimal('0'),
            'total_bonus': Decimal('0')
        }

        # Bônus por saúde da subsidiária
        health_score = subsidiary.get_health_score()
        if health_score >= 80:
            adjustments['health_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.4')
        elif health_score >= 60:
            adjustments['health_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.2')

        # Bônus por crescimento
        current_users = subsidiary.active_users
        if current_users > 1000:
            adjustments['growth_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.3')
        elif current_users > 100:
            adjustments['growth_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.15')

        # Bônus por eficiência
        roi = subsidiary.calculate_roi()
        if roi >= Decimal('200'):  # ROI > 200%
            adjustments['efficiency_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.3')
        elif roi >= Decimal('100'):  # ROI > 100%
            adjustments['efficiency_bonus'] = self.default_sharing_rules['performance_bonus_cap'] * Decimal('0.15')

        # Calcular bônus total (limitado ao cap)
        total_bonus = sum(adjustments.values())
        adjustments['total_bonus'] = min(total_bonus, self.default_sharing_rules['performance_bonus_cap'])

        return adjustments

    def _calculate_risk_adjustments(self, subsidiary: Subsidiary) -> Dict[str, Any]:
        """Calcula ajustes baseados no risco da subsidiária"""
        adjustments = {
            'risk_penalty': Decimal('0'),
            'stability_bonus': Decimal('0')
        }

        # Penalidade por alto risco
        if subsidiary.risk_level == 'high':
            adjustments['risk_penalty'] = self.default_sharing_rules['risk_adjustment_factor']
        elif subsidiary.risk_level == 'critical':
            adjustments['risk_penalty'] = self.default_sharing_rules['risk_adjustment_factor'] * Decimal('2')

        # Bônus por estabilidade
        if subsidiary.status == 'operational':
            months_operational = (datetime.utcnow() - subsidiary.founded_at).days // 30
            if months_operational >= 12:  # Mais de 1 ano operacional
                adjustments['stability_bonus'] = self.default_sharing_rules['risk_adjustment_factor'] * Decimal('0.5')

        return adjustments

    def _calculate_final_distribution(self,
                                    revenue_amount: Decimal,
                                    base_allocations: Dict[str, Decimal],
                                    performance_adjustments: Dict[str, Any],
                                    risk_adjustments: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula distribuição final aplicando todos os ajustes"""

        # Aplicar bônus de performance à subsidiária
        performance_bonus = performance_adjustments['total_bonus']
        subsidiary_allocation = base_allocations['subsidiary'] + (revenue_amount * performance_bonus)

        # Aplicar penalidades de risco
        risk_penalty = risk_adjustments['risk_penalty']
        subsidiary_allocation -= revenue_amount * risk_penalty

        # Aplicar bônus de estabilidade à holding
        stability_bonus = risk_adjustments['stability_bonus']
        holding_allocation = base_allocations['holding'] + (revenue_amount * stability_bonus)

        # Reinvestimento permanece fixo
        reinvestment_allocation = base_allocations['reinvestment']

        # Garantir que subsidiary tenha pelo menos o mínimo
        minimum_subsidiary = revenue_amount * self.default_sharing_rules['subsidiary_minimum']
        subsidiary_allocation = max(subsidiary_allocation, minimum_subsidiary)

        # Recalcular holding se necessário para manter equilíbrio
        total_allocated = holding_allocation + reinvestment_allocation + subsidiary_allocation
        if total_allocated > revenue_amount:
            # Reduzir proportionally da holding
            excess = total_allocated - revenue_amount
            holding_allocation -= excess

        # Garantir que não seja negativo
        holding_allocation = max(holding_allocation, Decimal('0'))
        subsidiary_allocation = max(subsidiary_allocation, Decimal('0'))

        return {
            'holding_allocation': holding_allocation.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'reinvestment_allocation': reinvestment_allocation.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'subsidiary_allocation': subsidiary_allocation.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'performance_bonuses': performance_adjustments,
            'risk_adjustments': risk_adjustments,
            'total_allocated': (holding_allocation + reinvestment_allocation + subsidiary_allocation).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'optimization_applied': True
        }

    async def _apply_distributions(self, distribution: Dict[str, Any]):
        """Aplica as distribuições ao sistema"""
        subsidiary_id = distribution['subsidiary_id']
        subsidiary = next((s for s in self.holding.subsidiaries if s.id == subsidiary_id), None)

        if subsidiary:
            # Atualizar receita da subsidiária
            subsidiary.update_financials(
                Decimal('0'),  # Não adiciona receita adicional aqui
                distribution['subsidiary_allocation']
            )

            # Atualizar finanças da holding
            holding_profit = distribution['holding_allocation']
            reinvestment = distribution['reinvestment_allocation']

            self.holding.update_financials(Decimal('0'), holding_profit, reinvestment)

    async def _log_distribution_memory(self, distribution: Dict[str, Any], error: str = ""):
        """Registra memória da distribuição"""
        if error:
            event_data = {
                'event_type': 'revenue_distribution_failed',
                'description': f'Falha na distribuição de receita: {error}',
                'participants': ['revenue_sharing_system'],
                'outcome': 'failure',
                'lessons_learned': [f'Erro identificado: {error}']
            }
        else:
            subsidiary_name = distribution.get('subsidiary_name', 'Unknown')
            revenue_amount = distribution.get('revenue_amount', 0)
            subsidiary_allocation = distribution.get('subsidiary_allocation', 0)

            event_data = {
                'event_type': 'revenue_distribution',
                'description': f'Distribuição de receita para {subsidiary_name}: ${revenue_amount}',
                'participants': ['revenue_sharing_system', subsidiary_name],
                'outcome': 'success',
                'lessons_learned': [
                    f'Subsidiária reteve: ${subsidiary_allocation}',
                    f'Holding recebeu: ${distribution.get("holding_allocation", 0)}',
                    f'Reinvestimento: ${distribution.get("reinvestment_allocation", 0)}'
                ]
            }

        context = {
            'subsidiary_id': distribution.get('subsidiary_id'),
            'revenue_amount': float(distribution.get('revenue_amount', 0)),
            'distribution_period': distribution.get('distribution_period'),
            'optimization_applied': distribution.get('optimization_applied', False)
        }

        await self.memory_system.store_episodic_memory(
            event_data=event_data,
            owner='revenue_sharing_system',
            context=context
        )

    async def optimize_sharing_rules(self) -> Dict[str, Any]:
        """
        Otimiza regras de compartilhamento baseado em dados históricos
        Usa análise de performance para ajustar alocações
        """
        self.optimization_cycles += 1

        optimization_result = {
            'cycle_number': self.optimization_cycles,
            'analysis_period': 'last_12_months',
            'current_rules': self.default_sharing_rules.copy(),
            'proposed_changes': {},
            'expected_impact': {},
            'confidence_level': 0.0,
            'applied_changes': False,
            'optimization_timestamp': datetime.utcnow()
        }

        try:
            # Analisar dados históricos
            historical_analysis = self._analyze_historical_performance()

            # Calcular ajustes recomendados
            proposed_changes = self._calculate_optimal_adjustments(historical_analysis)

            # Avaliar impacto esperado
            expected_impact = self._calculate_expected_impact(proposed_changes)

            # Calcular confiança na otimização
            confidence = self._calculate_optimization_confidence(historical_analysis)

            optimization_result.update({
                'proposed_changes': proposed_changes,
                'expected_impact': expected_impact,
                'confidence_level': confidence
            })

            # Aplicar mudanças se confiança for alta
            if confidence >= 0.8:
                self._apply_optimization_changes(proposed_changes)
                optimization_result['applied_changes'] = True

            await self._log_optimization_memory(optimization_result)

        except Exception as e:
            optimization_result['error'] = str(e)
            await self._log_optimization_memory(optimization_result, error=str(e))

        return optimization_result

    def _analyze_historical_performance(self) -> Dict[str, Any]:
        """Analisa performance histórica das distribuições"""
        if not self.distribution_history:
            return {'insufficient_data': True}

        recent_distributions = [
            d for d in self.distribution_history
            if (datetime.utcnow() - d['distribution_timestamp']).days <= 365
        ]

        analysis = {
            'total_distributions': len(recent_distributions),
            'average_subsidiary_allocation_percentage': 0.0,
            'average_holding_allocation_percentage': 0.0,
            'high_performing_subsidiaries': [],
            'underperforming_subsidiaries': [],
            'risk_distribution': {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        }

        total_revenue = sum(d['revenue_amount'] for d in recent_distributions)

        if total_revenue > 0:
            total_subsidiary_allocation = sum(d['subsidiary_allocation'] for d in recent_distributions)
            total_holding_allocation = sum(d['holding_allocation'] for d in recent_distributions)

            analysis['average_subsidiary_allocation_percentage'] = float(total_subsidiary_allocation / total_revenue)
            analysis['average_holding_allocation_percentage'] = float(total_holding_allocation / total_revenue)

        # Identificar subsidiárias de alto desempenho
        subsidiary_performance = {}
        for distribution in recent_distributions:
            sub_id = distribution['subsidiary_id']
            if sub_id not in subsidiary_performance:
                subsidiary_performance[sub_id] = []
            subsidiary_performance[sub_id].append(distribution)

        for sub_id, distributions in subsidiary_performance.items():
            avg_roi = sum(
                self.holding.subsidiaries[i].calculate_roi()
                for i, s in enumerate(self.holding.subsidiaries) if s.id == sub_id
            ) / len(distributions) if distributions else 0

            if avg_roi >= 150:
                analysis['high_performing_subsidiaries'].append(sub_id)
            elif avg_roi < 50:
                analysis['underperforming_subsidiaries'].append(sub_id)

        # Analisar distribuição de risco
        for subsidiary in self.holding.subsidiaries:
            risk_level = subsidiary.risk_level
            analysis['risk_distribution'][risk_level] = analysis['risk_distribution'].get(risk_level, 0) + 1

        return analysis

    def _calculate_optimal_adjustments(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula ajustes ótimos baseados na análise"""
        changes = {}

        # Ajustar baseado na performance média
        avg_subsidiary_percentage = analysis.get('average_subsidiary_allocation_percentage', 0.45)

        if avg_subsidiary_percentage < 0.40:  # Muito baixo para subsidiárias
            changes['subsidiary_minimum'] = self.default_sharing_rules['subsidiary_minimum'] + Decimal('0.05')
        elif avg_subsidiary_percentage > 0.60:  # Muito alto para subsidiárias
            changes['subsidiary_minimum'] = self.default_sharing_rules['subsidiary_minimum'] - Decimal('0.03')

        # Ajustar baseado em subsidiárias de alto desempenho
        high_performers = len(analysis.get('high_performing_subsidiaries', []))
        if high_performers > len(self.holding.subsidiaries) * 0.3:  # >30% são high performers
            changes['performance_bonus_cap'] = self.default_sharing_rules['performance_bonus_cap'] + Decimal('0.02')

        # Ajustar baseado em distribuição de risco
        risk_dist = analysis.get('risk_distribution', {})
        high_risk_count = risk_dist.get('high', 0) + risk_dist.get('critical', 0)
        if high_risk_count > len(self.holding.subsidiaries) * 0.4:  # >40% alto risco
            changes['risk_adjustment_factor'] = self.default_sharing_rules['risk_adjustment_factor'] + Decimal('0.01')

        return changes

    def _calculate_expected_impact(self, changes: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula impacto esperado das mudanças"""
        impact = {
            'estimated_subsidiary_allocation_change': 0.0,
            'estimated_holding_allocation_change': 0.0,
            'expected_performance_improvement': 0.0,
            'risk_reduction': 0.0
        }

        # Calcular impacto baseado nas mudanças propostas
        if 'subsidiary_minimum' in changes:
            change = changes['subsidiary_minimum'] - self.default_sharing_rules['subsidiary_minimum']
            impact['estimated_subsidiary_allocation_change'] = float(change)
            impact['estimated_holding_allocation_change'] = -float(change)

        if 'performance_bonus_cap' in changes:
            impact['expected_performance_improvement'] = 0.05  # 5% melhoria esperada

        if 'risk_adjustment_factor' in changes:
            impact['risk_reduction'] = 0.03  # 3% redução de risco esperada

        return impact

    def _calculate_optimization_confidence(self, analysis: Dict[str, Any]) -> float:
        """Calcula confiança na otimização"""
        if analysis.get('insufficient_data'):
            return 0.0

        # Confiança baseada na quantidade de dados
        data_points = analysis.get('total_distributions', 0)
        data_confidence = min(1.0, data_points / 100)  # Máximo com 100 distribuições

        # Confiança baseada na consistência dos dados
        avg_sub_percentage = analysis.get('average_subsidiary_allocation_percentage', 0.45)
        consistency = 1.0 - abs(avg_sub_percentage - 0.45) * 2  # Penaliza desvios do ideal

        return min(1.0, (data_confidence + consistency) / 2)

    def _apply_optimization_changes(self, changes: Dict[str, Any]):
        """Aplica mudanças de otimização"""
        for key, value in changes.items():
            if key in self.default_sharing_rules:
                self.default_sharing_rules[key] = value

    async def _log_optimization_memory(self, optimization: Dict[str, Any], error: str = ""):
        """Registra memória da otimização"""
        if error:
            event_data = {
                'event_type': 'revenue_optimization_failed',
                'description': f'Falha na otimização do revenue sharing: {error}',
                'participants': ['revenue_sharing_system'],
                'outcome': 'failure',
                'lessons_learned': [f'Erro na otimização: {error}']
            }
        else:
            applied = optimization.get('applied_changes', False)
            confidence = optimization.get('confidence_level', 0)

            event_data = {
                'event_type': 'revenue_optimization',
                'description': f'Otimização do revenue sharing (confiança: {confidence:.2%})',
                'participants': ['revenue_sharing_system'],
                'outcome': 'success' if applied else 'deferred',
                'lessons_learned': [
                    f'Mudanças aplicadas: {applied}',
                    f'Ciclo de otimização: {optimization.get("cycle_number", 0)}',
                    f'Impacto esperado: {optimization.get("expected_impact", {})}'
                ]
            }

        context = {
            'optimization_cycle': optimization.get('cycle_number', 0),
            'changes_applied': optimization.get('applied_changes', False),
            'confidence_level': optimization.get('confidence_level', 0),
            'proposed_changes_count': len(optimization.get('proposed_changes', {}))
        }

        await self.memory_system.store_episodic_memory(
            event_data=event_data,
            owner='revenue_sharing_system',
            context=context
        )

    async def get_portfolio_analytics(self) -> Dict[str, Any]:
        """Retorna analytics do portfolio de revenue sharing"""
        analytics = {
            'total_revenue_distributed': float(self.total_distributed),
            'total_distributions': len(self.distribution_history),
            'current_sharing_rules': self.default_sharing_rules.copy(),
            'subsidiary_performance': {},
            'optimization_metrics': {
                'cycles_completed': self.optimization_cycles,
                'last_optimization': None
            },
            'revenue_flow_efficiency': 0.0
        }

        # Analisar performance por subsidiária
        for subsidiary in self.holding.subsidiaries:
            subsidiary_dists = [
                d for d in self.distribution_history
                if d['subsidiary_id'] == subsidiary.id
            ]

            if subsidiary_dists:
                total_allocated = sum(d['subsidiary_allocation'] for d in subsidiary_dists)
                total_revenue = sum(d['revenue_amount'] for d in subsidiary_dists)

                analytics['subsidiary_performance'][str(subsidiary.id)] = {
                    'name': subsidiary.name,
                    'total_revenue': float(total_revenue),
                    'total_allocated': float(total_allocated),
                    'allocation_percentage': float(total_allocated / total_revenue) if total_revenue > 0 else 0,
                    'roi': float(subsidiary.calculate_roi()),
                    'health_score': subsidiary.get_health_score()
                }

        # Calcular eficiência do fluxo de receita
        if self.distribution_history:
            total_allocated = sum(d['total_allocated'] for d in self.distribution_history)
            total_revenue = sum(d['revenue_amount'] for d in self.distribution_history)
            analytics['revenue_flow_efficiency'] = float(total_allocated / total_revenue) if total_revenue > 0 else 0

        return analytics

    async def simulate_distribution(self,
                                  subsidiary: Subsidiary,
                                  revenue_amount: Decimal) -> Dict[str, Any]:
        """
        Simula distribuição de receita sem aplicá-la
        Útil para planejamento e análise
        """
        # Mesmo cálculo da distribuição real, mas sem aplicar
        base_allocations = self._calculate_base_allocations(revenue_amount)
        performance_adjustments = await self._calculate_performance_adjustments(subsidiary)
        risk_adjustments = self._calculate_risk_adjustments(subsidiary)

        final_distribution = self._calculate_final_distribution(
            revenue_amount, base_allocations, performance_adjustments, risk_adjustments
        )

        return {
            'simulation': True,
            'subsidiary_id': subsidiary.id,
            'subsidiary_name': subsidiary.name,
            'revenue_amount': revenue_amount,
            **final_distribution,
            'simulation_timestamp': datetime.utcnow()
        }