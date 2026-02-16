"""
Revenue Sharing System
Sistema inteligente de distribuição de receita e otimização financeira
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
import logging
from dataclasses import dataclass

from backend.core.entities.holding import Holding, Subsidiary
from backend.infrastructure.database.connection import get_database_connection

logger = logging.getLogger(__name__)


@dataclass
class RevenueAllocation:
    """Alocação de receita"""
    subsidiary_id: str
    gross_revenue: Decimal
    holding_share: Decimal
    subsidiary_share: Decimal
    reinvestment_allocation: Decimal
    performance_bonus: Decimal
    total_distribution: Decimal
    allocation_date: datetime

    @property
    def holding_percentage(self) -> float:
        """Percentual da holding"""
        return float((self.holding_share / self.gross_revenue) * 100) if self.gross_revenue > 0 else 0

    @property
    def subsidiary_percentage(self) -> float:
        """Percentual da subsidiária"""
        return float((self.subsidiary_share / self.gross_revenue) * 100) if self.gross_revenue > 0 else 0

    @property
    def reinvestment_percentage(self) -> float:
        """Percentual de reinvestimento"""
        return float((self.reinvestment_allocation / self.gross_revenue) * 100) if self.gross_revenue > 0 else 0


@dataclass
class PerformanceMetrics:
    """Métricas de performance financeira"""
    revenue_growth_rate: float
    profitability_score: float
    market_share_growth: float
    customer_satisfaction: float
    operational_efficiency: float
    innovation_score: float
    overall_performance_score: float = 0.0

    def __post_init__(self):
        # Calcular score geral de performance
        weights = {
            'revenue_growth_rate': 0.25,
            'profitability_score': 0.20,
            'market_share_growth': 0.15,
            'customer_satisfaction': 0.15,
            'operational_efficiency': 0.15,
            'innovation_score': 0.10
        }

        self.overall_performance_score = sum(
            getattr(self, metric) * weight
            for metric, weight in weights.items()
        )


@dataclass
class RevenueSharingAgreement:
    """Acordo de compartilhamento de receita"""
    subsidiary_id: str
    base_holding_percentage: float
    performance_bonus_cap: float
    reinvestment_percentage: float
    vesting_period_months: int
    minimum_performance_threshold: float
    adjustment_frequency: str  # monthly, quarterly, annually
    last_adjustment_date: datetime
    agreement_status: str  # active, suspended, terminated


class RevenueSharingSystem:
    """
    Sistema de compartilhamento de receita inteligente
    Otimiza distribuição de lucros entre holding e subsidiárias
    """

    def __init__(self, holding: Holding):
        self.holding = holding

        # Configurações padrão de compartilhamento
        self.default_sharing_rules = {
            "base_holding_percentage": 40.0,  # 40% para holding
            "performance_bonus_cap": 20.0,    # Até 20% bônus por performance
            "reinvestment_percentage": 15.0,  # 15% para reinvestimento
            "vesting_period_months": 12,      # 12 meses para vesting completo
            "minimum_performance_threshold": 70.0,  # Score mínimo para bônus
            "adjustment_frequency": "quarterly"
        }

        # Regras específicas por tipo de subsidiária
        self.business_type_multipliers = {
            "high_risk_high_reward": {
                "base_percentage_modifier": 1.2,  # 48% base
                "bonus_cap_modifier": 1.5,         # 30% bonus cap
                "reinvestment_modifier": 1.3       # 19.5% reinvestment
            },
            "stable_cash_cow": {
                "base_percentage_modifier": 0.8,   # 32% base
                "bonus_cap_modifier": 0.7,          # 14% bonus cap
                "reinvestment_modifier": 0.8        # 12% reinvestment
            },
            "strategic_investment": {
                "base_percentage_modifier": 1.0,   # 40% base
                "bonus_cap_modifier": 1.0,          # 20% bonus cap
                "reinvestment_modifier": 2.0        # 30% reinvestment
            }
        }

    async def calculate_revenue_distribution(self, subsidiary_id: str,
                                           revenue_data: Dict[str, Any]) -> RevenueAllocation:
        """
        Calcular distribuição de receita para uma subsidiária

        Args:
            subsidiary_id: ID da subsidiária
            revenue_data: Dados de receita

        Returns:
            Alocação de receita calculada
        """
        logger.info(f"Calculando distribuição de receita para subsidiária: {subsidiary_id}")

        # Buscar acordo de compartilhamento
        agreement = await self.get_revenue_sharing_agreement(subsidiary_id)
        if not agreement:
            # Criar acordo padrão
            agreement = await self.create_default_agreement(subsidiary_id)

        # Calcular métricas de performance
        performance = await self.calculate_performance_metrics(subsidiary_id, revenue_data)

        # Calcular receita bruta do período
        gross_revenue = Decimal(str(revenue_data.get("gross_revenue", 0)))

        # Aplicar regras de distribuição
        allocation = await self.apply_sharing_rules(gross_revenue, agreement, performance)

        # Registrar alocação
        await self.record_revenue_allocation(allocation)

        return allocation

    async def optimize_revenue_allocation(self, total_revenue: Decimal,
                                        subsidiary_portfolio: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Otimizar alocação de receita entre todas as subsidiárias

        Args:
            total_revenue: Receita total disponível
            subsidiary_portfolio: Portfolio de subsidiárias

        Returns:
            Plano otimizado de alocação
        """
        logger.info("Otimizando alocação de receita para todo portfolio")

        # Calcular scores de performance para todas as subsidiárias
        performance_scores = {}
        for subsidiary in subsidiary_portfolio:
            performance_scores[subsidiary["id"]] = await self.calculate_performance_metrics(
                subsidiary["id"], subsidiary.get("revenue_data", {})
            )

        # Aplicar algoritmo de otimização
        optimization_result = await self.apply_optimization_algorithm(
            total_revenue, subsidiary_portfolio, performance_scores
        )

        # Validar restrições
        validation_result = await self.validate_allocation_constraints(optimization_result)

        if not validation_result["valid"]:
            # Aplicar correções
            optimization_result = await self.apply_allocation_corrections(
                optimization_result, validation_result["violations"]
            )

        # Gerar recomendações
        recommendations = await self.generate_allocation_recommendations(optimization_result)

        return {
            "total_revenue": total_revenue,
            "optimized_allocations": optimization_result["allocations"],
            "total_allocated": optimization_result["total_allocated"],
            "unallocated_amount": optimization_result["unallocated_amount"],
            "optimization_score": optimization_result["optimization_score"],
            "recommendations": recommendations,
            "validation_status": validation_result
        }

    async def manage_subsidiary_budget(self, subsidiary_id: str,
                                     budget_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gerenciar orçamento da subsidiária baseado em performance

        Args:
            subsidiary_id: ID da subsidiária
            budget_requirements: Requisitos de orçamento

        Returns:
            Plano de orçamento aprovado
        """
        logger.info(f"Gerenciando orçamento para subsidiária: {subsidiary_id}")

        # Verificar performance histórica
        performance_history = await self.get_performance_history(subsidiary_id)

        # Avaliar risco de investimento
        investment_risk = await self.assess_investment_risk(subsidiary_id, budget_requirements)

        # Calcular orçamento aprovado
        approved_budget = await self.calculate_approved_budget(
            budget_requirements, performance_history, investment_risk
        )

        # Definir condições e milestones
        budget_conditions = await self.define_budget_conditions(
            subsidiary_id, approved_budget, budget_requirements
        )

        # Registrar decisão de orçamento
        await self.record_budget_decision(subsidiary_id, {
            "requested_amount": budget_requirements.get("total_amount", 0),
            "approved_amount": approved_budget["total_approved"],
            "approval_percentage": approved_budget["approval_percentage"],
            "conditions": budget_conditions,
            "decision_date": datetime.utcnow(),
            "risk_assessment": investment_risk
        })

        return {
            "subsidiary_id": subsidiary_id,
            "budget_request": budget_requirements,
            "approved_budget": approved_budget,
            "budget_conditions": budget_conditions,
            "investment_risk": investment_risk,
            "performance_based_adjustments": approved_budget.get("performance_adjustments", [])
        }

    async def calculate_portfolio_roi(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcular ROI do portfolio de subsidiárias

        Args:
            portfolio_data: Dados do portfolio

        Returns:
            Análise completa de ROI
        """
        logger.info("Calculando ROI do portfolio")

        total_invested = Decimal(str(portfolio_data.get("total_invested", 0)))
        current_portfolio_value = await self.calculate_portfolio_value(portfolio_data)

        # Calcular métricas de ROI
        roi_metrics = {
            "total_invested": total_invested,
            "current_value": current_portfolio_value,
            "gross_return": current_portfolio_value - total_invested,
            "gross_roi": ((current_portfolio_value - total_invested) / total_invested * 100) if total_invested > 0 else 0,
            "annualized_roi": await self.calculate_annualized_roi(portfolio_data),
            "irr": await self.calculate_internal_rate_of_return(portfolio_data)
        }

        # Análise por subsidiária
        subsidiary_roi_analysis = await self.analyze_subsidiary_roi(portfolio_data)

        # Projeções futuras
        future_projections = await self.project_future_roi(portfolio_data)

        # Recomendações de otimização
        optimization_recommendations = await self.generate_roi_optimization_recommendations(
            roi_metrics, subsidiary_roi_analysis
        )

        return {
            "portfolio_roi_metrics": roi_metrics,
            "subsidiary_analysis": subsidiary_roi_analysis,
            "future_projections": future_projections,
            "optimization_recommendations": optimization_recommendations,
            "benchmark_comparison": await self.compare_with_market_benchmarks(roi_metrics),
            "risk_adjusted_returns": await self.calculate_risk_adjusted_returns(portfolio_data)
        }

    async def implement_automated_reinvestment(self, available_capital: Decimal,
                                             investment_opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Implementar reinvestimento automático baseado em oportunidades

        Args:
            available_capital: Capital disponível para investimento
            investment_opportunities: Oportunidades de investimento

        Returns:
            Plano de reinvestimento automatizado
        """
        logger.info("Implementando reinvestimento automático")

        # Avaliar oportunidades de investimento
        evaluated_opportunities = []
        for opportunity in investment_opportunities:
            evaluation = await self.evaluate_investment_opportunity(opportunity)
            evaluated_opportunities.append(evaluation)

        # Ordenar por score de investimento
        evaluated_opportunities.sort(key=lambda x: x["investment_score"], reverse=True)

        # Aplicar algoritmo de alocação
        allocation_plan = await self.calculate_investment_allocation(
            available_capital, evaluated_opportunities
        )

        # Validar alocação
        validation = await self.validate_investment_allocation(allocation_plan)

        if not validation["valid"]:
            # Otimizar alocação
            allocation_plan = await self.optimize_investment_allocation(
                allocation_plan, validation["issues"]
            )

        # Implementar alocações aprovadas
        implementation_results = await self.implement_investment_allocations(allocation_plan)

        return {
            "available_capital": available_capital,
            "investment_opportunities": len(investment_opportunities),
            "allocation_plan": allocation_plan,
            "total_allocated": sum(allocation["amount"] for allocation in allocation_plan["allocations"]),
            "unallocated_capital": allocation_plan["unallocated_capital"],
            "implementation_results": implementation_results,
            "expected_returns": await self.calculate_expected_returns(allocation_plan),
            "risk_distribution": await self.analyze_risk_distribution(allocation_plan)
        }

    # Métodos auxiliares para revenue sharing

    async def get_revenue_sharing_agreement(self, subsidiary_id: str) -> Optional[RevenueSharingAgreement]:
        """
        Buscar acordo de compartilhamento de receita

        Args:
            subsidiary_id: ID da subsidiária

        Returns:
            Acordo de compartilhamento ou None
        """
        # Simulação - em produção seria consulta ao banco
        return RevenueSharingAgreement(
            subsidiary_id=subsidiary_id,
            base_holding_percentage=40.0,
            performance_bonus_cap=20.0,
            reinvestment_percentage=15.0,
            vesting_period_months=12,
            minimum_performance_threshold=70.0,
            adjustment_frequency="quarterly",
            last_adjustment_date=datetime.utcnow() - timedelta(days=30),
            agreement_status="active"
        )

    async def create_default_agreement(self, subsidiary_id: str) -> RevenueSharingAgreement:
        """
        Criar acordo padrão de compartilhamento

        Args:
            subsidiary_id: ID da subsidiária

        Returns:
            Acordo criado
        """
        agreement = RevenueSharingAgreement(
            subsidiary_id=subsidiary_id,
            base_holding_percentage=self.default_sharing_rules["base_holding_percentage"],
            performance_bonus_cap=self.default_sharing_rules["performance_bonus_cap"],
            reinvestment_percentage=self.default_sharing_rules["reinvestment_percentage"],
            vesting_period_months=self.default_sharing_rules["vesting_period_months"],
            minimum_performance_threshold=self.default_sharing_rules["minimum_performance_threshold"],
            adjustment_frequency=self.default_sharing_rules["adjustment_frequency"],
            last_adjustment_date=datetime.utcnow(),
            agreement_status="active"
        )

        # Salvar acordo (simulado)
        await self.record_sharing_agreement(agreement)

        return agreement

    async def calculate_performance_metrics(self, subsidiary_id: str,
                                         revenue_data: Dict[str, Any]) -> PerformanceMetrics:
        """
        Calcular métricas de performance da subsidiária

        Args:
            subsidiary_id: ID da subsidiária
            revenue_data: Dados de receita

        Returns:
            Métricas de performance
        """
        # Buscar dados históricos (simulado)
        historical_data = await self.get_subsidiary_performance_history(subsidiary_id)

        # Calcular métricas
        revenue_growth = self.calculate_revenue_growth(historical_data)
        profitability = self.calculate_profitability_score(revenue_data)
        market_share = self.calculate_market_share_growth(historical_data)
        satisfaction = revenue_data.get("customer_satisfaction", 85.0)
        efficiency = self.calculate_operational_efficiency(historical_data)
        innovation = self.calculate_innovation_score(historical_data)

        return PerformanceMetrics(
            revenue_growth_rate=revenue_growth,
            profitability_score=profitability,
            market_share_growth=market_share,
            customer_satisfaction=satisfaction,
            operational_efficiency=efficiency,
            innovation_score=innovation
        )

    async def apply_sharing_rules(self, gross_revenue: Decimal,
                                agreement: RevenueSharingAgreement,
                                performance: PerformanceMetrics) -> RevenueAllocation:
        """
        Aplicar regras de compartilhamento de receita

        Args:
            gross_revenue: Receita bruta
            agreement: Acordo de compartilhamento
            performance: Métricas de performance

        Returns:
            Alocação calculada
        """
        # Calcular participação base da holding
        base_holding_percentage = agreement.base_holding_percentage / 100
        base_holding_share = gross_revenue * Decimal(str(base_holding_percentage))

        # Calcular bônus por performance
        performance_bonus = Decimal('0')
        if performance.overall_performance_score >= agreement.minimum_performance_threshold:
            bonus_percentage = min(
                agreement.performance_bonus_cap / 100,
                (performance.overall_performance_score - agreement.minimum_performance_threshold) / 30 * (agreement.performance_bonus_cap / 100)
            )
            performance_bonus = gross_revenue * Decimal(str(bonus_percentage))

        # Participação total da holding
        total_holding_share = base_holding_share + performance_bonus

        # Participação da subsidiária
        subsidiary_share = gross_revenue - total_holding_share

        # Alocação para reinvestimento
        reinvestment_percentage = agreement.reinvestment_percentage / 100
        reinvestment_allocation = subsidiary_share * Decimal(str(reinvestment_percentage))

        # Participação final da subsidiária após reinvestimento
        final_subsidiary_share = subsidiary_share - reinvestment_allocation

        return RevenueAllocation(
            subsidiary_id=agreement.subsidiary_id,
            gross_revenue=gross_revenue,
            holding_share=total_holding_share,
            subsidiary_share=final_subsidiary_share,
            reinvestment_allocation=reinvestment_allocation,
            performance_bonus=performance_bonus,
            total_distribution=gross_revenue,
            allocation_date=datetime.utcnow()
        )

    async def apply_optimization_algorithm(self, total_revenue: Decimal,
                                         subsidiaries: List[Dict[str, Any]],
                                         performance_scores: Dict[str, PerformanceMetrics]) -> Dict[str, Any]:
        """
        Aplicar algoritmo de otimização de alocação

        Args:
            total_revenue: Receita total
            subsidiaries: Lista de subsidiárias
            performance_scores: Scores de performance

        Returns:
            Resultado da otimização
        """
        allocations = []
        total_allocated = Decimal('0')

        # Estratégia: alocar mais para subsidiárias de alta performance
        for subsidiary in subsidiaries:
            sub_id = subsidiary["id"]
            performance = performance_scores.get(sub_id)

            if performance and performance.overall_performance_score > 75:
                # Subsidiárias de alta performance recebem mais
                allocation_percentage = 0.25  # 25% da receita total
            elif performance and performance.overall_performance_score > 60:
                # Performance média
                allocation_percentage = 0.15  # 15%
            else:
                # Performance baixa
                allocation_percentage = 0.05  # 5%

            allocation_amount = total_revenue * Decimal(str(allocation_percentage))

            allocations.append({
                "subsidiary_id": sub_id,
                "allocation_amount": allocation_amount,
                "allocation_percentage": allocation_percentage * 100,
                "performance_score": performance.overall_performance_score if performance else 0,
                "rationale": self.generate_allocation_rationale(subsidiary, performance)
            })

            total_allocated += allocation_amount

        return {
            "allocations": allocations,
            "total_allocated": total_allocated,
            "unallocated_amount": total_revenue - total_allocated,
            "optimization_score": self.calculate_optimization_score(allocations, performance_scores)
        }

    async def validate_allocation_constraints(self, optimization_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validar restrições de alocação

        Args:
            optimization_result: Resultado da otimização

        Returns:
            Resultado da validação
        """
        violations = []

        # Verificar se não há alocações negativas
        for allocation in optimization_result["allocations"]:
            if allocation["allocation_amount"] < 0:
                violations.append(f"Alocação negativa para {allocation['subsidiary_id']}")

        # Verificar se total alocado não excede receita disponível
        if optimization_result["total_allocated"] > optimization_result.get("total_revenue", 0):
            violations.append("Total alocado excede receita disponível")

        # Verificar distribuição mínima
        min_allocation = optimization_result.get("total_revenue", 0) * Decimal('0.05')  # 5% mínimo
        for allocation in optimization_result["allocations"]:
            if allocation["allocation_amount"] < min_allocation:
                violations.append(f"Alocação muito baixa para {allocation['subsidiary_id']}")

        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "severity": "high" if len(violations) > 2 else "medium" if violations else "low"
        }

    async def apply_allocation_corrections(self, optimization_result: Dict[str, Any],
                                         violations: List[str]) -> Dict[str, Any]:
        """
        Aplicar correções às alocações

        Args:
            optimization_result: Resultado original
            violations: Violações identificadas

        Returns:
            Resultado corrigido
        """
        corrected = optimization_result.copy()

        # Aplicar correções baseadas nas violações
        for violation in violations:
            if "excede receita" in violation:
                # Reduzir alocações proporcionalmente
                excess = corrected["total_allocated"] - corrected.get("total_revenue", 0)
                reduction_factor = 1 - (excess / corrected["total_allocated"])

                for allocation in corrected["allocations"]:
                    allocation["allocation_amount"] *= reduction_factor
                    allocation["allocation_percentage"] *= float(reduction_factor)

                corrected["total_allocated"] *= reduction_factor

        return corrected

    async def generate_allocation_recommendations(self, optimization_result: Dict[str, Any]) -> List[str]:
        """
        Gerar recomendações para alocação

        Args:
            optimization_result: Resultado da otimização

        Returns:
            Lista de recomendações
        """
        recommendations = []

        # Analisar distribuição
        allocations = optimization_result["allocations"]
        high_performers = [a for a in allocations if a.get("performance_score", 0) > 80]

        if high_performers:
            recommendations.append(f"Considerar aumento de investimento em {len(high_performers)} subsidiárias de alta performance")

        # Verificar equilíbrio
        total_allocated = optimization_result["total_allocated"]
        unallocated = optimization_result["unallocated_amount"]

        if unallocated > total_allocated * Decimal('0.2'):  # >20% não alocado
            recommendations.append("Grande parcela da receita não está sendo alocada - considerar expansão")

        return recommendations

    # Métodos auxiliares para métricas

    def calculate_revenue_growth(self, historical_data: List[Dict[str, Any]]) -> float:
        """Calcular crescimento de receita"""
        if len(historical_data) < 2:
            return 0.0

        recent = sum(d.get("revenue", 0) for d in historical_data[-3:])  # Últimos 3 períodos
        previous = sum(d.get("revenue", 0) for d in historical_data[-6:-3])  # Períodos anteriores

        if previous == 0:
            return 100.0 if recent > 0 else 0.0

        return ((recent - previous) / previous) * 100

    def calculate_profitability_score(self, revenue_data: Dict[str, Any]) -> float:
        """Calcular score de rentabilidade"""
        revenue = revenue_data.get("gross_revenue", 0)
        costs = revenue_data.get("total_costs", revenue * 0.7)  # Assume 70% costs se não especificado

        if revenue == 0:
            return 0.0

        profit_margin = ((revenue - costs) / revenue) * 100
        return min(100.0, max(0.0, profit_margin * 2))  # Normalize para 0-100

    def calculate_market_share_growth(self, historical_data: List[Dict[str, Any]]) -> float:
        """Calcular crescimento de participação de mercado"""
        if len(historical_data) < 2:
            return 0.0

        recent_share = historical_data[-1].get("market_share", 0)
        previous_share = historical_data[-2].get("market_share", 0)

        if previous_share == 0:
            return recent_share * 100

        return ((recent_share - previous_share) / previous_share) * 100

    def calculate_operational_efficiency(self, historical_data: List[Dict[str, Any]]) -> float:
        """Calcular eficiência operacional"""
        if not historical_data:
            return 50.0  # Score padrão

        efficiencies = [d.get("operational_efficiency", 50) for d in historical_data[-6:]]
        return sum(efficiencies) / len(efficiencies)

    def calculate_innovation_score(self, historical_data: List[Dict[str, Any]]) -> float:
        """Calcular score de inovação"""
        # Baseado em novos produtos, features, etc.
        innovation_indicators = sum(d.get("new_features", 0) + d.get("product_updates", 0)
                                  for d in historical_data[-12:])
        return min(100.0, innovation_indicators * 5)  # Até 20 inovações = 100 pontos

    # Métodos auxiliares diversos

    def generate_allocation_rationale(self, subsidiary: Dict[str, Any],
                                    performance: Optional[PerformanceMetrics]) -> str:
        """Gerar justificativa para alocação"""
        if not performance:
            return "Alocação base para nova subsidiária"

        score = performance.overall_performance_score
        if score > 80:
            return "Alta performance justifica investimento adicional"
        elif score > 60:
            return "Performance sólida merece manutenção de investimento"
        else:
            return "Oportunidade de melhoria com investimento direcionado"

    def calculate_optimization_score(self, allocations: List[Dict[str, Any]],
                                   performance_scores: Dict[str, PerformanceMetrics]) -> float:
        """Calcular score de otimização"""
        total_weighted_allocation = sum(
            a["allocation_percentage"] * performance_scores.get(a["subsidiary_id"], PerformanceMetrics(0,0,0,0,0,0)).overall_performance_score
            for a in allocations
        )

        avg_performance = sum(p.overall_performance_score for p in performance_scores.values()) / len(performance_scores)

        # Score baseado em quão bem alocamos para alta performance
        return min(100.0, total_weighted_allocation / (avg_performance * 100) * 100 if avg_performance > 0 else 0)

    async def record_revenue_allocation(self, allocation: RevenueAllocation):
        """Registrar alocação de receita"""
        # Simulação de persistência
        logger.info(f"Registrando alocação: {allocation.subsidiary_id} - R$ {allocation.gross_revenue}")

    async def record_sharing_agreement(self, agreement: RevenueSharingAgreement):
        """Registrar acordo de compartilhamento"""
        logger.info(f"Registrando acordo para: {agreement.subsidiary_id}")

    async def get_subsidiary_performance_history(self, subsidiary_id: str) -> List[Dict[str, Any]]:
        """Buscar histórico de performance"""
        # Simulação de dados históricos
        return [
            {"period": "2024-01", "revenue": 10000, "market_share": 0.5, "operational_efficiency": 75, "new_features": 2},
            {"period": "2024-02", "revenue": 12000, "market_share": 0.7, "operational_efficiency": 78, "new_features": 1},
            {"period": "2024-03", "revenue": 15000, "market_share": 0.8, "operational_efficiency": 82, "new_features": 3}
        ]

    async def get_performance_history(self, subsidiary_id: str) -> List[Dict[str, Any]]:
        """Buscar histórico de performance completo"""
        return await self.get_subsidiary_performance_history(subsidiary_id)

    async def assess_investment_risk(self, subsidiary_id: str, budget_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Avaliar risco de investimento"""
        performance_history = await self.get_performance_history(subsidiary_id)

        # Calcular volatilidade de performance
        revenues = [p["revenue"] for p in performance_history]
        if len(revenues) > 1:
            avg_revenue = sum(revenues) / len(revenues)
            variance = sum((r - avg_revenue) ** 2 for r in revenues) / len(revenues)
            volatility = (variance ** 0.5) / avg_revenue if avg_revenue > 0 else 0
        else:
            volatility = 0.5  # Assumir volatilidade média se pouco histórico

        # Avaliar risco baseado na volatilidade
        if volatility < 0.2:
            risk_level = "low"
            risk_score = 20
        elif volatility < 0.4:
            risk_level = "medium"
            risk_score = 50
        else:
            risk_level = "high"
            risk_score = 80

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "volatility": volatility,
            "confidence_level": 100 - risk_score,
            "recommendations": self.generate_risk_recommendations(risk_level, budget_requirements)
        }

    async def calculate_approved_budget(self, requirements: Dict[str, Any],
                                      performance_history: List[Dict[str, Any]],
                                      investment_risk: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular orçamento aprovado"""
        requested_amount = Decimal(str(requirements.get("total_amount", 0)))
        risk_score = investment_risk["risk_score"]

        # Aplicar ajustes baseados no risco
        if risk_score < 30:
            # Baixo risco - aprovar mais
            approval_percentage = 0.95
        elif risk_score < 60:
            # Risco médio - aprovar parcial
            approval_percentage = 0.75
        else:
            # Alto risco - aprovar conservadoramente
            approval_percentage = 0.50

        approved_amount = requested_amount * Decimal(str(approval_percentage))

        # Ajustes baseados em performance
        performance_multiplier = self.calculate_performance_multiplier(performance_history)
        final_approved = approved_amount * Decimal(str(performance_multiplier))

        return {
            "requested_amount": requested_amount,
            "approved_amount": final_approved,
            "approval_percentage": approval_percentage * performance_multiplier * 100,
            "total_approved": final_approved,
            "performance_adjustments": self.generate_performance_adjustments(performance_history),
            "risk_adjustments": approval_percentage < 1.0
        }

    async def define_budget_conditions(self, subsidiary_id: str, approved_budget: Dict[str, Any],
                                     requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Definir condições para o orçamento"""
        conditions = []

        # Condição de performance
        conditions.append({
            "type": "performance_milestone",
            "description": "Atingir 80% do target de receita mensal",
            "deadline": (datetime.utcnow() + timedelta(days=90)).isoformat(),
            "penalty": "Redução de 20% no próximo orçamento",
            "reward": "Bônus de 10% no orçamento seguinte"
        })

        # Condição de eficiência
        conditions.append({
            "type": "efficiency_target",
            "description": "Manter efficiency score acima de 75",
            "measurement": "monthly",
            "penalty": "Revisão de alocação de recursos",
            "reward": "Prioridade em novos investimentos"
        })

        return conditions

    async def record_budget_decision(self, subsidiary_id: str, decision_data: Dict[str, Any]):
        """Registrar decisão de orçamento"""
        logger.info(f"Registrando decisão de orçamento para {subsidiary_id}: {decision_data}")

    async def calculate_portfolio_value(self, portfolio_data: Dict[str, Any]) -> Decimal:
        """Calcular valor total do portfolio"""
        total_value = Decimal('0')

        for subsidiary in portfolio_data.get("subsidiaries", []):
            # Valor baseado em revenue múltiplo
            revenue = Decimal(str(subsidiary.get("annual_revenue", 0)))
            valuation_multiple = Decimal(str(subsidiary.get("valuation_multiple", 5)))  # 5x revenue typical
            subsidiary_value = revenue * valuation_multiple
            total_value += subsidiary_value

        return total_value

    async def calculate_annualized_roi(self, portfolio_data: Dict[str, Any]) -> float:
        """Calcular ROI anualizado"""
        total_invested = portfolio_data.get("total_invested", 0)
        current_value = float(await self.calculate_portfolio_value(portfolio_data))
        months_held = portfolio_data.get("months_held", 12)

        if total_invested == 0 or months_held == 0:
            return 0.0

        total_return = (current_value - total_invested) / total_invested
        annualized_return = (1 + total_return) ** (12 / months_held) - 1

        return annualized_return * 100

    async def calculate_internal_rate_of_return(self, portfolio_data: Dict[str, Any]) -> float:
        """Calcular TIR (Taxa Interna de Retorno)"""
        # Implementação simplificada da TIR
        # Em produção, usaria fórmula financeira completa
        annualized_roi = await self.calculate_annualized_roi(portfolio_data)
        return annualized_roi * 0.8  # Ajuste conservador

    async def analyze_subsidiary_roi(self, portfolio_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analisar ROI por subsidiária"""
        analysis = []

        for subsidiary in portfolio_data.get("subsidiaries", []):
            invested = Decimal(str(subsidiary.get("invested_capital", 0)))
            current_value = await self.calculate_portfolio_value({"subsidiaries": [subsidiary]})

            roi = ((current_value - invested) / invested * 100) if invested > 0 else 0

            analysis.append({
                "subsidiary_id": subsidiary.get("id"),
                "name": subsidiary.get("name"),
                "invested": float(invested),
                "current_value": float(current_value),
                "roi": float(roi),
                "performance_rating": "excellent" if roi > 100 else "good" if roi > 50 else "fair" if roi > 0 else "poor"
            })

        return analysis

    async def project_future_roi(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """Projetar ROI futuro"""
        current_roi = await self.calculate_annualized_roi(portfolio_data)

        # Projeções baseadas em tendência histórica
        projections = {
            "year_1": current_roi * 1.2,   # 20% crescimento
            "year_2": current_roi * 1.4,   # 40% crescimento
            "year_3": current_roi * 1.6,   # 60% crescimento
            "confidence_level": "medium",
            "assumptions": [
                "Mantida taxa de crescimento atual",
                "Sem grandes mudanças de mercado",
                "Continuidade dos investimentos atuais"
            ]
        }

        return projections

    async def generate_roi_optimization_recommendations(self, roi_metrics: Dict[str, Any],
                                                      subsidiary_analysis: List[Dict[str, Any]]) -> List[str]:
        """Gerar recomendações de otimização de ROI"""
        recommendations = []

        # Analisar subsidiárias com baixo ROI
        low_roi_subsidiaries = [s for s in subsidiary_analysis if s["roi"] < 25]

        if low_roi_subsidiaries:
            recommendations.append(f"Reavaliar investimento em {len(low_roi_subsidiaries)} subsidiárias com ROI baixo")

        # Verificar concentração
        total_invested = roi_metrics["total_invested"]
        top_subsidiary_investment = max((s["invested"] for s in subsidiary_analysis), default=0)

        if total_invested > 0 and (top_subsidiary_investment / total_invested) > 0.5:
            recommendations.append("Diversificar investimentos - evitar concentração em uma subsidiária")

        # Recomendar timing de saída
        high_roi_subsidiaries = [s for s in subsidiary_analysis if s["roi"] > 150]
        if high_roi_subsidiaries:
            recommendations.append(f"Considerar exit strategy para {len(high_roi_subsidiaries)} subsidiárias maduras")

        return recommendations

    async def compare_with_market_benchmarks(self, roi_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Comparar com benchmarks de mercado"""
        portfolio_roi = roi_metrics.get("annualized_roi", 0)

        # Benchmarks típicos para diferentes tipos de investimento
        benchmarks = {
            "vc_funds": 25,           # 25% annualized return típico
            "private_equity": 20,     # 20% annualized return
            "angel_investments": 30,  # 30% annualized return
            "public_markets": 8       # 8% S&P 500
        }

        comparison = {}
        for benchmark_name, benchmark_rate in benchmarks.items():
            comparison[benchmark_name] = {
                "portfolio_roi": portfolio_roi,
                "benchmark_roi": benchmark_rate,
                "performance_vs_benchmark": "above" if portfolio_roi > benchmark_rate else "below",
                "difference": portfolio_roi - benchmark_rate
            }

        return comparison

    async def calculate_risk_adjusted_returns(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular retornos ajustados ao risco"""
        annualized_roi = await self.calculate_annualized_roi(portfolio_data)

        # Calcular volatilidade do portfolio
        subsidiary_returns = []
        for subsidiary in portfolio_data.get("subsidiaries", []):
            invested = subsidiary.get("invested_capital", 0)
            current_value = float(await self.calculate_portfolio_value({"subsidiaries": [subsidiary]}))
            if invested > 0:
                roi = (current_value - invested) / invested
                subsidiary_returns.append(roi)

        if subsidiary_returns:
            avg_return = sum(subsidiary_returns) / len(subsidiary_returns)
            variance = sum((r - avg_return) ** 2 for r in subsidiary_returns) / len(subsidiary_returns)
            volatility = variance ** 0.5
        else:
            volatility = 0.5  # Valor padrão

        # Calcular Sharpe ratio (simplificado)
        risk_free_rate = 0.03  # 3% risk-free rate
        sharpe_ratio = (annualized_roi/100 - risk_free_rate) / volatility if volatility > 0 else 0

        return {
            "sharpe_ratio": sharpe_ratio,
            "volatility": volatility,
            "risk_adjusted_return": sharpe_ratio * 10,  # Normalized score
            "risk_level": "low" if sharpe_ratio > 1.5 else "medium" if sharpe_ratio > 0.5 else "high"
        }

    async def evaluate_investment_opportunity(self, opportunity: Dict[str, Any]) -> Dict[str, Any]:
        """Avaliar oportunidade de investimento"""
        evaluation = opportunity.copy()

        # Calcular score de investimento
        roi_potential = opportunity.get("expected_roi", 0)
        risk_level = opportunity.get("risk_level", "medium")
        time_to_return = opportunity.get("time_to_return_months", 24)

        # Pesos para o score
        roi_weight = 0.4
        risk_weight = 0.3
        time_weight = 0.3

        # Normalizar ROI (máximo 300% = 100 pontos)
        roi_score = min(100, roi_potential / 3)

        # Normalizar risco (low=100, medium=50, high=0)
        risk_scores = {"low": 100, "medium": 50, "high": 0}
        risk_score = risk_scores.get(risk_level, 50)

        # Normalizar tempo (mais rápido = melhor score)
        time_score = max(0, 100 - (time_to_return - 12) * 2)  # 12 meses = 100 pontos

        investment_score = (roi_score * roi_weight +
                           risk_score * risk_weight +
                           time_score * time_weight)

        evaluation["investment_score"] = investment_score
        evaluation["roi_score"] = roi_score
        evaluation["risk_score"] = risk_score
        evaluation["time_score"] = time_score

        return evaluation

    async def calculate_investment_allocation(self, available_capital: Decimal,
                                           evaluated_opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calcular alocação de investimentos"""
        allocations = []
        remaining_capital = available_capital

        # Ordenar por score de investimento
        sorted_opportunities = sorted(evaluated_opportunities,
                                    key=lambda x: x["investment_score"], reverse=True)

        for opportunity in sorted_opportunities:
            if remaining_capital <= 0:
                break

            required_amount = Decimal(str(opportunity.get("required_investment", 0)))
            max_allocation = min(required_amount, remaining_capital)

            # Alocar baseado no score (oportunidades melhores recebem mais)
            score_weight = opportunity["investment_score"] / 100
            allocated_amount = max_allocation * Decimal(str(score_weight))

            if allocated_amount > 0:
                allocations.append({
                    "opportunity_id": opportunity.get("id"),
                    "opportunity_name": opportunity.get("name"),
                    "amount": allocated_amount,
                    "percentage_of_requirement": float(allocated_amount / required_amount * 100),
                    "investment_score": opportunity["investment_score"]
                })

                remaining_capital -= allocated_amount

        return {
            "allocations": allocations,
            "total_allocated": sum(a["amount"] for a in allocations),
            "unallocated_capital": remaining_capital,
            "allocation_efficiency": float(sum(a["amount"] for a in allocations) / available_capital * 100)
        }

    async def validate_investment_allocation(self, allocation_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Validar alocação de investimentos"""
        issues = []

        # Verificar se não excede capital disponível
        if allocation_plan["total_allocated"] > allocation_plan.get("available_capital", 0):
            issues.append("Alocação total excede capital disponível")

        # Verificar diversificação
        allocations = allocation_plan["allocations"]
        if len(allocations) > 0:
            max_allocation = max(a["amount"] for a in allocations)
            total_allocated = allocation_plan["total_allocated"]

            if total_allocated > 0 and (max_allocation / total_allocated) > 0.6:
                issues.append("Concentração muito alta em uma oportunidade")

        # Verificar alocações mínimas
        min_allocation = Decimal('10000')  # $10K mínimo
        small_allocations = [a for a in allocations if a["amount"] < min_allocation]

        if small_allocations:
            issues.append(f"{len(small_allocations)} alocações abaixo do mínimo recomendado")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "severity": "high" if len(issues) > 2 else "medium" if issues else "low"
        }

    async def optimize_investment_allocation(self, allocation_plan: Dict[str, Any],
                                          issues: List[str]) -> Dict[str, Any]:
        """Otimizar alocação baseada em problemas identificados"""
        optimized = allocation_plan.copy()

        for issue in issues:
            if "excede capital" in issue:
                # Reduzir alocações proporcionalmente
                excess = optimized["total_allocated"] - optimized.get("available_capital", 0)
                reduction_factor = 1 - (excess / optimized["total_allocated"])

                for allocation in optimized["allocations"]:
                    allocation["amount"] *= reduction_factor

                optimized["total_allocated"] *= reduction_factor

            elif "concentração" in issue:
                # Redistribuir para diversificar
                allocations = optimized["allocations"]
                if len(allocations) > 1:
                    # Pegar 20% da maior alocação e redistribuir
                    max_allocation = max(allocations, key=lambda x: x["amount"])
                    redistribution_amount = max_allocation["amount"] * Decimal('0.2')

                    max_allocation["amount"] -= redistribution_amount

                    # Distribuir entre as outras
                    other_allocations = [a for a in allocations if a != max_allocation]
                    per_allocation = redistribution_amount / len(other_allocations)

                    for allocation in other_allocations:
                        allocation["amount"] += per_allocation

        return optimized

    async def implement_investment_allocations(self, allocation_plan: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Implementar alocações de investimento"""
        implementation_results = []

        for allocation in allocation_plan["allocations"]:
            result = {
                "opportunity_id": allocation["opportunity_id"],
                "amount_allocated": allocation["amount"],
                "status": "implemented",
                "implementation_date": datetime.utcnow().isoformat(),
                "next_steps": [
                    "Due diligence completion",
                    "Legal documentation",
                    "Fund transfer",
                    "Project kickoff"
                ]
            }
            implementation_results.append(result)

        return implementation_results

    async def calculate_expected_returns(self, allocation_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular retornos esperados"""
        total_allocated = allocation_plan["total_allocated"]
        expected_returns = {
            "year_1": Decimal('0'),
            "year_2": Decimal('0'),
            "year_3": Decimal('0')
        }

        for allocation in allocation_plan["allocations"]:
            opportunity = next((opp for opp in allocation_plan.get("evaluated_opportunities", [])
                              if opp.get("id") == allocation["opportunity_id"]), None)

            if opportunity:
                expected_roi = opportunity.get("expected_roi", 0) / 100
                amount = allocation["amount"]

                expected_returns["year_1"] += amount * Decimal(str(expected_roi))
                expected_returns["year_2"] += amount * Decimal(str(expected_roi * 1.5))  # 50% growth
                expected_returns["year_3"] += amount * Decimal(str(expected_roi * 2.0))  # 100% growth

        return {
            "total_invested": float(total_allocated),
            "expected_returns": {k: float(v) for k, v in expected_returns.items()},
            "overall_roi_year1": float(expected_returns["year_1"] / total_allocated * 100) if total_allocated > 0 else 0,
            "overall_roi_year3": float(expected_returns["year_3"] / total_allocated * 100) if total_allocated > 0 else 0
        }

    async def analyze_risk_distribution(self, allocation_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Analisar distribuição de risco"""
        risk_distribution = {
            "low_risk": 0,
            "medium_risk": 0,
            "high_risk": 0
        }

        for allocation in allocation_plan["allocations"]:
            opportunity = next((opp for opp in allocation_plan.get("evaluated_opportunities", [])
                              if opp.get("id") == allocation["opportunity_id"]), None)

            if opportunity:
                risk_level = opportunity.get("risk_level", "medium")
                risk_distribution[f"{risk_level}_risk"] += allocation["amount"]

        total_allocated = allocation_plan["total_allocated"]

        return {
            "risk_distribution": {k: float(v) for k, v in risk_distribution.items()},
            "risk_concentration": max(risk_distribution.values()) / float(total_allocated) * 100 if total_allocated > 0 else 0,
            "diversification_score": len([v for v in risk_distribution.values() if v > 0]) / 3 * 100,  # 0-100
            "recommendations": self.generate_risk_distribution_recommendations(risk_distribution)
        }

    # Métodos auxiliares finais

    def generate_risk_recommendations(self, risk_level: str, requirements: Dict[str, Any]) -> List[str]:
        """Gerar recomendações baseadas no nível de risco"""
        recommendations = []

        if risk_level == "high":
            recommendations.extend([
                "Implementar marcos de progresso mensais",
                "Manter reserva de contingência de 30%",
                "Conduzir due diligence aprofundada",
                "Considerar investimento em fases"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Definir KPIs claros de sucesso",
                "Implementar monitoramento mensal",
                "Manter reserva de contingência de 20%"
            ])

        return recommendations

    def calculate_performance_multiplier(self, performance_history: List[Dict[str, Any]]) -> float:
        """Calcular multiplicador baseado em performance"""
        if not performance_history:
            return 0.8  # Multiplicador conservador

        recent_performance = performance_history[-1]
        revenue_growth = self.calculate_revenue_growth(performance_history)

        multiplier = 1.0

        # Ajuste baseado em crescimento de receita
        if revenue_growth > 50:
            multiplier += 0.2
        elif revenue_growth > 20:
            multiplier += 0.1
        elif revenue_growth < -20:
            multiplier -= 0.2

        # Ajuste baseado em eficiência operacional
        efficiency = recent_performance.get("operational_efficiency", 50)
        if efficiency > 80:
            multiplier += 0.1
        elif efficiency < 60:
            multiplier -= 0.1

        return max(0.5, min(1.5, multiplier))  # Limitar entre 0.5 e 1.5

    def generate_performance_adjustments(self, performance_history: List[Dict[str, Any]]) -> List[str]:
        """Gerar ajustes baseados em performance"""
        adjustments = []

        if performance_history:
            latest = performance_history[-1]
            efficiency = latest.get("operational_efficiency", 50)

            if efficiency > 85:
                adjustments.append("Bônus de performance: +15% no orçamento aprovado")
            elif efficiency < 70:
                adjustments.append("Ajuste de eficiência: foco em otimização operacional")

        return adjustments

    def generate_risk_distribution_recommendations(self, risk_distribution: Dict[str, Any]) -> List[str]:
        """Gerar recomendações para distribuição de risco"""
        recommendations = []

        total = sum(risk_distribution.values())

        if total > 0:
            high_risk_percentage = risk_distribution["high_risk"] / total * 100

            if high_risk_percentage > 40:
                recommendations.append("Reduzir exposição a investimentos de alto risco")

            low_risk_percentage = risk_distribution["low_risk"] / total * 100
            if low_risk_percentage < 20:
                recommendations.append("Aumentar alocação em investimentos de baixo risco para estabilidade")

        return recommendations