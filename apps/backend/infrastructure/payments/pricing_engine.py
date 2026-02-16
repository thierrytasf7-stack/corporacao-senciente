"""
Pricing Engine
Sistema inteligente de preços e planos dinâmicos
"""

from typing import Dict, Any, List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)


class PricingEngine:
    """Motor de preços inteligente para a Corporação Senciente"""

    def __init__(self):
        # Planos base
        self.base_plans = {
            'freemium': {
                'name': 'Corporação Senciente - Freemium',
                'base_price': Decimal('0'),
                'currency': 'USD',
                'billing_period': 'monthly',
                'features': [
                    '3_subsidiaries',
                    'basic_support',
                    'community_access',
                    'core_automation'
                ],
                'limits': {
                    'max_subsidiaries': 3,
                    'max_agents_per_subsidiary': 5,
                    'api_calls_per_month': 1000,
                    'storage_gb': 1,
                    'support_level': 'community'
                },
                'metadata': {
                    'recommended_for': 'individuals',
                    'conversion_potential': 'high'
                }
            },
            'premium': {
                'name': 'Corporação Senciente - Premium',
                'base_price': Decimal('49.99'),
                'currency': 'USD',
                'billing_period': 'monthly',
                'features': [
                    'unlimited_subsidiaries',
                    'priority_support',
                    'advanced_analytics',
                    'api_access',
                    'custom_integrations',
                    'advanced_automation'
                ],
                'limits': {
                    'max_subsidiaries': -1,  # Unlimited
                    'max_agents_per_subsidiary': 20,
                    'api_calls_per_month': 50000,
                    'storage_gb': 50,
                    'support_level': 'priority'
                },
                'metadata': {
                    'recommended_for': 'small_businesses',
                    'conversion_potential': 'medium'
                }
            },
            'enterprise': {
                'name': 'Corporação Senciente - Enterprise',
                'base_price': Decimal('199.99'),
                'currency': 'USD',
                'billing_period': 'monthly',
                'features': [
                    'all_premium',
                    'white_label',
                    'dedicated_support',
                    'custom_integrations',
                    'advanced_security',
                    'sla_guarantee',
                    'on_premise_option'
                ],
                'limits': {
                    'max_subsidiaries': -1,  # Unlimited
                    'max_agents_per_subsidiary': -1,  # Unlimited
                    'api_calls_per_month': -1,  # Unlimited
                    'storage_gb': 500,
                    'support_level': 'dedicated'
                },
                'metadata': {
                    'recommended_for': 'enterprises',
                    'conversion_potential': 'low'
                }
            }
        }

        # Modificadores dinâmicos
        self.dynamic_modifiers = {
            'early_adopter': {'discount_percent': 20, 'duration_months': 12},
            'annual_discount': {'discount_percent': 15, 'billing_period': 'yearly'},
            'startup_discount': {'discount_percent': 30, 'max_users': 50},
            'nonprofit_discount': {'discount_percent': 50, 'verification_required': True},
            'volume_discount': {
                'tiers': [
                    {'min_quantity': 10, 'discount_percent': 10},
                    {'min_quantity': 50, 'discount_percent': 20},
                    {'min_quantity': 100, 'discount_percent': 30}
                ]
            }
        }

    def get_plan_details(self, plan_id: str, modifiers: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Obter detalhes completos de um plano com modificadores

        Args:
            plan_id: ID do plano
            modifiers: Modificadores dinâmicos aplicáveis

        Returns:
            Detalhes completos do plano
        """
        if plan_id not in self.base_plans:
            raise ValueError(f"Plano não encontrado: {plan_id}")

        plan = self.base_plans[plan_id].copy()

        # Aplicar modificadores
        if modifiers:
            plan = self._apply_modifiers(plan, modifiers)

        # Calcular preço final
        plan['final_price'] = self._calculate_final_price(plan)
        plan['price_per_period'] = plan['final_price']

        # Adicionar informações calculadas
        plan['savings'] = self._calculate_savings(plan)
        plan['effective_monthly_price'] = self._calculate_effective_monthly_price(plan)

        return plan

    def get_all_plans(self, user_context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Obter todos os planos disponíveis com preços dinâmicos

        Args:
            user_context: Contexto do usuário para personalização

        Returns:
            Lista de planos disponíveis
        """
        plans = []

        for plan_id, plan_data in self.base_plans.items():
            # Aplicar modificadores baseados no contexto do usuário
            modifiers = self._get_user_modifiers(user_context) if user_context else {}
            plan_details = self.get_plan_details(plan_id, modifiers)

            # Adicionar recomendações
            plan_details['recommendation'] = self._get_plan_recommendation(plan_id, user_context)

            plans.append(plan_details)

        return plans

    def calculate_upgrade_price(self, from_plan: str, to_plan: str, current_period_end: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Calcular preço de upgrade entre planos

        Args:
            from_plan: Plano atual
            to_plan: Plano destino
            current_period_end: Fim do período atual

        Returns:
            Detalhes do upgrade
        """
        if from_plan not in self.base_plans or to_plan not in self.base_plans:
            raise ValueError("Plano inválido")

        from_plan_data = self.get_plan_details(from_plan)
        to_plan_data = self.get_plan_details(to_plan)

        # Calcular diferença de preço
        price_difference = to_plan_data['final_price'] - from_plan_data['final_price']

        # Calcular prorated amount
        prorated_amount = Decimal('0')
        if current_period_end and current_period_end > datetime.utcnow():
            days_remaining = (current_period_end - datetime.utcnow()).days
            period_days = 30 if from_plan_data['billing_period'] == 'monthly' else 365
            prorated_amount = (price_difference * Decimal(days_remaining)) / Decimal(period_days)

        return {
            'from_plan': from_plan,
            'to_plan': to_plan,
            'price_difference': price_difference,
            'prorated_amount': max(Decimal('0'), prorated_amount),
            'immediate_charge': max(Decimal('0'), price_difference - prorated_amount),
            'effective_date': datetime.utcnow()
        }

    def get_dynamic_pricing(self, base_plan: str, usage_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcular preços dinâmicos baseados no uso

        Args:
            base_plan: Plano base
            usage_metrics: Métricas de uso

        Returns:
            Preços dinâmicos sugeridos
        """
        plan_data = self.get_plan_details(base_plan)

        # Análise de uso
        usage_analysis = self._analyze_usage_against_limits(usage_metrics, plan_data['limits'])

        # Sugestões de upgrade
        suggestions = []

        if usage_analysis['subsidiary_limit_exceeded']:
            suggestions.append({
                'type': 'upgrade',
                'reason': 'subsidiary_limit',
                'recommended_plan': 'premium',
                'savings_projection': 'R$ 500/mês em produtividade'
            })

        if usage_analysis['api_limit_approaching']:
            suggestions.append({
                'type': 'upgrade',
                'reason': 'api_limit',
                'recommended_plan': 'premium',
                'additional_cost': 'R$ 49.99/mês'
            })

        return {
            'current_plan': base_plan,
            'usage_analysis': usage_analysis,
            'upgrade_suggestions': suggestions,
            'next_billing_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }

    def create_custom_plan(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Criar plano personalizado baseado em requisitos

        Args:
            requirements: Requisitos específicos do cliente

        Returns:
            Plano personalizado
        """
        # Análise de requisitos
        subsidiary_count = requirements.get('subsidiary_count', 10)
        user_count = requirements.get('user_count', 100)
        api_calls = requirements.get('api_calls_per_month', 100000)
        storage_gb = requirements.get('storage_gb', 200)
        support_level = requirements.get('support_level', 'dedicated')

        # Calcular preço base
        base_price = self._calculate_custom_price({
            'subsidiary_count': subsidiary_count,
            'user_count': user_count,
            'api_calls': api_calls,
            'storage_gb': storage_gb,
            'support_level': support_level
        })

        # Aplicar descontos enterprise
        final_price = base_price * Decimal('0.8')  # 20% desconto

        custom_plan = {
            'id': f'custom_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}',
            'name': 'Plano Empresarial Personalizado',
            'base_price': base_price,
            'final_price': final_price,
            'currency': 'USD',
            'billing_period': 'monthly',
            'requirements': requirements,
            'features': [
                f'{subsidiary_count}+_subsidiaries',
                f'{user_count}+_users',
                f'{api_calls:,}_api_calls_per_month',
                f'{storage_gb}GB_storage',
                f'{support_level}_support',
                'white_label',
                'custom_integrations',
                'sla_guarantee'
            ],
            'limits': {
                'max_subsidiaries': subsidiary_count,
                'max_users': user_count,
                'api_calls_per_month': api_calls,
                'storage_gb': storage_gb,
                'support_level': support_level
            },
            'custom': True,
            'created_at': datetime.utcnow().isoformat()
        }

        return custom_plan

    def get_pricing_analytics(self) -> Dict[str, Any]:
        """
        Obter analytics de preços e conversões

        Returns:
            Dados analíticos de preços
        """
        # Simulação de dados reais
        return {
            'total_revenue': 28500,  # $28,500 MRR
            'revenue_by_plan': {
                'freemium': 0,
                'premium': 15000,    # 300 usuários × $49.99
                'enterprise': 13500  # 67 usuários × $199.99
            },
            'conversion_funnel': {
                'visitors': 10000,
                'signups': 1000,     # 10% conversion
                'premium_upgrades': 300,  # 30% of signups
                'enterprise_upgrades': 67   # 22% of premium
            },
            'average_revenue_per_user': 47.50,
            'churn_rate_by_plan': {
                'premium': 0.08,
                'enterprise': 0.03
            },
            'lifetime_value': {
                'premium': 570,      # 12 meses × $47.50
                'enterprise': 3420   # 24 meses × $142.50
            },
            'pricing_effectiveness': {
                'optimal_price_point': 49.99,
                'price_elasticity': -0.3,
                'conversion_rate_at_optimal': 0.30
            }
        }

    # Métodos auxiliares

    def _apply_modifiers(self, plan: Dict[str, Any], modifiers: Dict[str, Any]) -> Dict[str, Any]:
        """Aplicar modificadores dinâmicos ao plano"""
        modified_plan = plan.copy()

        for modifier_name, modifier_config in modifiers.items():
            if modifier_name == 'early_adopter':
                discount = Decimal(modifier_config['discount_percent']) / 100
                modified_plan['base_price'] *= (1 - discount)
                modified_plan['modifiers'] = modified_plan.get('modifiers', [])
                modified_plan['modifiers'].append({
                    'type': 'early_adopter',
                    'discount_percent': modifier_config['discount_percent'],
                    'expires_at': (datetime.utcnow() + timedelta(days=modifier_config['duration_months']*30)).isoformat()
                })

            elif modifier_name == 'annual_discount':
                discount = Decimal(modifier_config['discount_percent']) / 100
                modified_plan['base_price'] *= (1 - discount)
                modified_plan['billing_period'] = 'yearly'
                modified_plan['modifiers'] = modified_plan.get('modifiers', [])
                modified_plan['modifiers'].append({
                    'type': 'annual_discount',
                    'discount_percent': modifier_config['discount_percent']
                })

        return modified_plan

    def _get_user_modifiers(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Determinar modificadores aplicáveis baseados no contexto do usuário"""
        modifiers = {}

        # Early adopter discount
        if user_context.get('is_early_adopter', False):
            modifiers['early_adopter'] = self.dynamic_modifiers['early_adopter']

        # Startup discount
        if user_context.get('company_size', 0) <= 50:
            modifiers['startup_discount'] = self.dynamic_modifiers['startup_discount']

        # Volume discount
        subscription_count = user_context.get('subscription_quantity', 1)
        for tier in self.dynamic_modifiers['volume_discount']['tiers']:
            if subscription_count >= tier['min_quantity']:
                modifiers['volume_discount'] = {'discount_percent': tier['discount_percent']}

        return modifiers

    def _calculate_final_price(self, plan: Dict[str, Any]) -> Decimal:
        """Calcular preço final após modificadores"""
        return plan['base_price']

    def _calculate_savings(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Calcular economia em relação ao preço base"""
        base_price = self.base_plans[plan['id'].split('_')[0]]['base_price']
        final_price = plan['final_price']

        if final_price < base_price:
            savings_percent = ((base_price - final_price) / base_price) * 100
            return {
                'amount': base_price - final_price,
                'percentage': savings_percent,
                'description': f'Economia de {savings_percent:.0f}%'
            }

        return {'amount': Decimal('0'), 'percentage': 0, 'description': 'Preço base'}

    def _calculate_effective_monthly_price(self, plan: Dict[str, Any]) -> Decimal:
        """Calcular preço mensal efetivo"""
        if plan['billing_period'] == 'yearly':
            return plan['final_price'] / 12
        return plan['final_price']

    def _get_plan_recommendation(self, plan_id: str, user_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Obter recomendação para o plano"""
        if not user_context:
            return {'recommended': False, 'reason': 'no_context'}

        company_size = user_context.get('company_size', 1)
        current_usage = user_context.get('current_usage', {})

        if plan_id == 'freemium' and company_size > 10:
            return {
                'recommended': False,
                'reason': 'company_too_large_for_freemium',
                'suggested_upgrade': 'premium'
            }

        if plan_id == 'premium' and company_size > 100:
            return {
                'recommended': False,
                'reason': 'company_needs_enterprise_features',
                'suggested_upgrade': 'enterprise'
            }

        subsidiary_count = current_usage.get('subsidiaries', 0)
        if plan_id == 'freemium' and subsidiary_count > 2:
            return {
                'recommended': False,
                'reason': 'approaching_subsidiary_limit',
                'suggested_upgrade': 'premium'
            }

        return {
            'recommended': True,
            'reason': 'suitable_for_usage_profile',
            'confidence': 0.85
        }

    def _analyze_usage_against_limits(self, usage: Dict[str, Any], limits: Dict[str, Any]) -> Dict[str, Any]:
        """Analisar uso contra limites do plano"""
        analysis = {
            'subsidiary_limit_exceeded': False,
            'api_limit_approaching': False,
            'storage_limit_approaching': False,
            'overall_usage_score': 0.0
        }

        # Verificar subsidiárias
        if limits['max_subsidiaries'] != -1:
            current_subsidiaries = usage.get('subsidiaries', 0)
            limit_subsidiaries = limits['max_subsidiaries']
            if current_subsidiaries >= limit_subsidiaries:
                analysis['subsidiary_limit_exceeded'] = True

        # Verificar API calls
        if limits['api_calls_per_month'] != -1:
            current_api = usage.get('api_calls', 0)
            limit_api = limits['api_calls_per_month']
            usage_ratio = current_api / limit_api
            if usage_ratio > 0.8:  # 80% do limite
                analysis['api_limit_approaching'] = True

        # Verificar storage
        if limits['storage_gb'] != -1:
            current_storage = usage.get('storage_gb', 0)
            limit_storage = limits['storage_gb']
            usage_ratio = current_storage / limit_storage
            if usage_ratio > 0.8:  # 80% do limite
                analysis['storage_limit_approaching'] = True

        # Calcular score geral de uso
        usage_indicators = [
            analysis['subsidiary_limit_exceeded'],
            analysis['api_limit_approaching'],
            analysis['storage_limit_approaching']
        ]
        analysis['overall_usage_score'] = sum(usage_indicators) / len(usage_indicators)

        return analysis

    def _calculate_custom_price(self, requirements: Dict[str, Any]) -> Decimal:
        """Calcular preço para plano personalizado"""
        base_price = Decimal('99.99')  # Base enterprise

        # Ajustes por subsidiárias
        subsidiary_count = requirements['subsidiary_count']
        if subsidiary_count > 20:
            base_price += Decimal('50') * ((subsidiary_count - 20) // 10)

        # Ajustes por usuários
        user_count = requirements['user_count']
        if user_count > 100:
            base_price += Decimal('25') * ((user_count - 100) // 50)

        # Ajustes por API calls
        api_calls = requirements['api_calls']
        if api_calls > 100000:
            base_price += Decimal('20') * ((api_calls - 100000) // 50000)

        # Ajustes por storage
        storage_gb = requirements['storage_gb']
        if storage_gb > 50:
            base_price += Decimal('10') * ((storage_gb - 50) // 50)

        # Ajustes por suporte
        if requirements['support_level'] == 'dedicated':
            base_price += Decimal('50')

        return base_price