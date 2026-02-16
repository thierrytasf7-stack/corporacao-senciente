"""
Subscription Manager
Gerenciamento de assinaturas e usuários premium
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from backend.infrastructure.payments.stripe_service import StripeService
from backend.infrastructure.database.connection import get_database_connection

logger = logging.getLogger(__name__)


class SubscriptionManager:
    """Gerenciador de assinaturas e usuários"""

    def __init__(self, stripe_service: StripeService):
        self.stripe_service = stripe_service
        self.db = get_database_connection()

    async def create_user_subscription(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Criar assinatura para usuário

        Args:
            user_data: Dados do usuário e plano

        Returns:
            Dados da assinatura criada
        """
        user_id = user_data.get('user_id')
        plan = user_data.get('plan', 'freemium')
        stripe_customer_id = user_data.get('stripe_customer_id')

        if not stripe_customer_id:
            raise ValueError("Stripe customer ID é obrigatório")

        # Verificar limites do plano
        current_usage = await self.get_user_usage(user_id)
        validation = self.stripe_service.validate_plan_limits(plan, current_usage)

        if not validation['valid']:
            raise ValueError(f"Plano {plan} não é válido para o uso atual: {validation['violations']}")

        # Criar assinatura no banco local
        subscription_data = {
            'user_id': user_id,
            'stripe_customer_id': stripe_customer_id,
            'plan': plan,
            'status': 'pending',
            'features': validation['features'],
            'limits': validation['limits'],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        # Salvar no banco
        await self._save_subscription(subscription_data)

        logger.info(f"Assinatura criada para usuário {user_id}: plano {plan}")

        return subscription_data

    async def update_user_subscription(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualizar assinatura do usuário

        Args:
            user_id: ID do usuário
            updates: Campos a atualizar

        Returns:
            Assinatura atualizada
        """
        # Buscar assinatura atual
        subscription = await self.get_user_subscription(user_id)
        if not subscription:
            raise ValueError(f"Assinatura não encontrada para usuário {user_id}")

        # Aplicar updates
        subscription.update(updates)
        subscription['updated_at'] = datetime.utcnow()

        # Salvar no banco
        await self._update_subscription(user_id, subscription)

        # Se mudou de plano, validar limites
        if 'plan' in updates:
            current_usage = await self.get_user_usage(user_id)
            validation = self.stripe_service.validate_plan_limits(subscription['plan'], current_usage)

            if not validation['valid']:
                # Opção: forçar downgrade ou notificar usuário
                logger.warning(f"Usuário {user_id} excedeu limites após mudança de plano")

        logger.info(f"Assinatura atualizada para usuário {user_id}: {updates}")

        return subscription

    async def cancel_user_subscription(self, user_id: str, immediate: bool = False) -> Dict[str, Any]:
        """
        Cancelar assinatura do usuário

        Args:
            user_id: ID do usuário
            immediate: Cancelar imediatamente ou ao fim do período

        Returns:
            Dados do cancelamento
        """
        subscription = await self.get_user_subscription(user_id)
        if not subscription:
            raise ValueError(f"Assinatura não encontrada para usuário {user_id}")

        # Cancelar no Stripe
        stripe_subscription_id = subscription.get('stripe_subscription_id')
        if stripe_subscription_id:
            await self.stripe_service.cancel_subscription(stripe_subscription_id, not immediate)

        # Atualizar status local
        updates = {
            'status': 'cancelled' if immediate else 'pending_cancellation',
            'cancelled_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }

        await self._update_subscription(user_id, updates)

        logger.info(f"Assinatura cancelada para usuário {user_id}")

        return {
            'user_id': user_id,
            'cancelled': True,
            'immediate': immediate,
            'status': updates['status']
        }

    async def get_user_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obter assinatura do usuário

        Args:
            user_id: ID do usuário

        Returns:
            Dados da assinatura ou None
        """
        # Simulação - em produção seria consulta ao banco
        # TODO: Implementar consulta real ao banco
        return {
            'user_id': user_id,
            'plan': 'freemium',
            'status': 'active',
            'features': ['3_subsidiaries', 'basic_support'],
            'limits': {'max_subsidiaries': 3},
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

    async def get_user_usage(self, user_id: str) -> Dict[str, Any]:
        """
        Obter uso atual do usuário

        Args:
            user_id: ID do usuário

        Returns:
            Dados de uso
        """
        # Simulação - em produção seria consulta real
        # TODO: Implementar consulta real ao banco
        return {
            'subsidiaries': 2,  # Número atual de subsidiárias
            'agents': 5,        # Número atual de agentes
            'revenue': 15000,   # Receita gerada
            'storage': 500      # MB usados
        }

    async def validate_user_access(self, user_id: str, feature: str) -> Dict[str, Any]:
        """
        Validar se usuário tem acesso a uma funcionalidade

        Args:
            user_id: ID do usuário
            feature: Funcionalidade solicitada

        Returns:
            Resultado da validação
        """
        subscription = await self.get_user_subscription(user_id)
        if not subscription:
            return {'access': False, 'reason': 'no_subscription'}

        current_usage = await self.get_user_usage(user_id)
        validation = self.stripe_service.validate_plan_limits(subscription['plan'], current_usage)

        # Verificar se feature está incluída no plano
        has_feature = feature in subscription.get('features', [])

        # Verificar limites
        within_limits = validation['valid']

        access_granted = has_feature and within_limits

        result = {
            'access': access_granted,
            'plan': subscription['plan'],
            'feature_included': has_feature,
            'within_limits': within_limits
        }

        if not access_granted:
            if not has_feature:
                result['reason'] = 'feature_not_included'
                result['upgrade_required'] = True
            elif not within_limits:
                result['reason'] = 'limit_exceeded'
                result['violations'] = validation['violations']

        return result

    async def process_payment_success(self, payment_data: Dict[str, Any]):
        """
        Processar pagamento bem-sucedido

        Args:
            payment_data: Dados do pagamento
        """
        customer_id = payment_data.get('customer')
        amount = payment_data.get('amount_paid', 0) / 100
        currency = payment_data.get('currency', 'usd')

        # Encontrar usuário pelo customer_id
        user_id = await self._get_user_by_stripe_customer(customer_id)
        if not user_id:
            logger.warning(f"Usuário não encontrado para customer {customer_id}")
            return

        # Atualizar assinatura para ativa
        await self.update_user_subscription(user_id, {
            'status': 'active',
            'last_payment_at': datetime.utcnow(),
            'last_payment_amount': amount
        })

        # Registrar transação de receita
        await self._record_revenue_transaction({
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'type': 'subscription',
            'stripe_payment_id': payment_data.get('id'),
            'created_at': datetime.utcnow()
        })

        logger.info(f"Pagamento processado: usuario {user_id}, valor {amount} {currency}")

    async def process_payment_failure(self, payment_data: Dict[str, Any]):
        """
        Processar falha de pagamento

        Args:
            payment_data: Dados do pagamento falhado
        """
        customer_id = payment_data.get('customer')
        failure_reason = payment_data.get('failure_reason')

        user_id = await self._get_user_by_stripe_customer(customer_id)
        if not user_id:
            return

        # Atualizar status de pagamento
        await self.update_user_subscription(user_id, {
            'payment_status': 'failed',
            'last_payment_failure': failure_reason,
            'last_payment_attempt': datetime.utcnow()
        })

        # TODO: Implementar lógica de retry e notificações

        logger.warning(f"Falha de pagamento: usuario {user_id}, motivo {failure_reason}")

    async def get_subscription_analytics(self) -> Dict[str, Any]:
        """
        Obter analytics de assinaturas

        Returns:
            Dados analíticos
        """
        # Simulação - em produção seria consulta real
        return {
            'total_subscriptions': 150,
            'active_subscriptions': 120,
            'cancelled_subscriptions': 30,
            'revenue_by_plan': {
                'freemium': 0,
                'premium': 4500,    # $45/mês × 100 usuários
                'enterprise': 15000 # $150/mês × 100 usuários
            },
            'churn_rate': 0.08,  # 8%
            'conversion_rate': {
                'freemium_to_premium': 0.15,
                'premium_to_enterprise': 0.05
            },
            'average_revenue_per_user': 47.50,
            'monthly_recurring_revenue': 5700
        }

    # Métodos auxiliares (privados)

    async def _save_subscription(self, subscription_data: Dict[str, Any]):
        """Salvar assinatura no banco"""
        # TODO: Implementar persistência real
        logger.info(f"Salvando assinatura: {subscription_data}")

    async def _update_subscription(self, user_id: str, updates: Dict[str, Any]):
        """Atualizar assinatura no banco"""
        # TODO: Implementar atualização real
        logger.info(f"Atualizando assinatura usuario {user_id}: {updates}")

    async def _get_user_by_stripe_customer(self, stripe_customer_id: str) -> Optional[str]:
        """Encontrar usuário pelo customer ID do Stripe"""
        # TODO: Implementar consulta real
        # Simulação: mapear customer ID para user ID
        customer_map = {
            'cus_test123': 'user_123',
            'cus_live456': 'user_456'
        }
        return customer_map.get(stripe_customer_id)

    async def _record_revenue_transaction(self, transaction_data: Dict[str, Any]):
        """Registrar transação de receita"""
        # TODO: Implementar persistência real
        logger.info(f"Registrando receita: {transaction_data}")

    async def check_subscription_health(self) -> Dict[str, Any]:
        """
        Verificar saúde das assinaturas

        Returns:
            Status de saúde
        """
        analytics = await self.get_subscription_analytics()

        health_status = {
            'overall_health': 'good',
            'issues': [],
            'metrics': analytics
        }

        # Verificar churn rate
        if analytics['churn_rate'] > 0.10:  # > 10%
            health_status['issues'].append({
                'type': 'high_churn',
                'severity': 'warning',
                'message': f'Churn rate alto: {analytics["churn_rate"]:.1%}'
            })

        # Verificar MRR
        if analytics['monthly_recurring_revenue'] < 5000:
            health_status['issues'].append({
                'type': 'low_revenue',
                'severity': 'warning',
                'message': f'MRR baixo: ${analytics["monthly_recurring_revenue"]}'
            })

        # Verificar conversão
        conversion_rate = analytics['conversion_rate']['freemium_to_premium']
        if conversion_rate < 0.10:  # < 10%
            health_status['issues'].append({
                'type': 'low_conversion',
                'severity': 'critical',
                'message': f'Taxa de conversão baixa: {conversion_rate:.1%}'
            })

        # Determinar saúde geral
        if any(issue['severity'] == 'critical' for issue in health_status['issues']):
            health_status['overall_health'] = 'critical'
        elif health_status['issues']:
            health_status['overall_health'] = 'warning'

        return health_status