"""
Stripe Webhooks Handler
Processamento de eventos de pagamento do Stripe
"""

import json
import hmac
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class StripeWebhookProcessor:
    """Processador de webhooks do Stripe"""

    def __init__(self, stripe_service):
        self.stripe_service = stripe_service
        self.processed_events = set()  # Evitar processamento duplicado

    async def process_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Processar webhook do Stripe

        Args:
            payload: Payload raw do webhook
            signature: Assinatura Stripe

        Returns:
            Resultado do processamento
        """
        try:
            # Verificar se já processamos este evento
            event_data = json.loads(payload)
            event_id = event_data.get('id')

            if event_id in self.processed_events:
                logger.warning(f"Evento duplicado ignorado: {event_id}")
                return {'status': 'duplicate', 'event_id': event_id}

            # Processar webhook através do serviço Stripe
            result = await self.stripe_service.handle_webhook(payload, signature)

            # Marcar como processado
            self.processed_events.add(event_id)

            # Limitar tamanho do set para evitar memory leak
            if len(self.processed_events) > 10000:
                # Manter apenas os últimos 5000
                self.processed_events = set(list(self.processed_events)[-5000:])

            # Executar ações pós-processamento
            await self._execute_post_processing(result)

            logger.info(f"Webhook processado com sucesso: {event_id}")
            return {
                'status': 'processed',
                'event_id': event_id,
                'event_type': result.get('event_type'),
                'processed_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Erro no processamento do webhook: {str(e)}")
            raise

    async def _execute_post_processing(self, webhook_result: Dict[str, Any]):
        """
        Executar ações pós-processamento do webhook

        Args:
            webhook_result: Resultado do processamento do webhook
        """
        event_type = webhook_result.get('event_type')
        event_data = webhook_result.get('data', {})

        if event_type == 'checkout.session.completed':
            await self._handle_checkout_completed_post_processing(event_data)

        elif event_type == 'invoice.payment_succeeded':
            await self._handle_payment_success_post_processing(event_data)

        elif event_type == 'invoice.payment_failed':
            await self._handle_payment_failed_post_processing(event_data)

        elif event_type == 'customer.subscription.updated':
            await self._handle_subscription_updated_post_processing(event_data)

        elif event_type == 'customer.subscription.deleted':
            await self._handle_subscription_cancelled_post_processing(event_data)

    async def _handle_checkout_completed_post_processing(self, event_data: Dict[str, Any]):
        """Ações pós-processamento para checkout concluído"""
        # Aqui seria implementada a lógica para:
        # 1. Atualizar status do usuário no banco
        # 2. Enviar email de boas-vindas
        # 3. Criar registros de auditoria
        # 4. Ativar funcionalidades premium
        # 5. Notificar equipe

        customer_id = event_data.get('customer')
        subscription_id = event_data.get('subscription')

        logger.info(f"Processando checkout concluído: customer={customer_id}, subscription={subscription_id}")

        # TODO: Implementar lógica real de pós-processamento

    async def _handle_payment_success_post_processing(self, event_data: Dict[str, Any]):
        """Ações pós-processamento para pagamento bem-sucedido"""
        customer_id = event_data.get('customer')
        amount = event_data.get('amount_paid', 0) / 100  # Converter de centavos
        currency = event_data.get('currency', 'usd')

        logger.info(f"Pagamento bem-sucedido: customer={customer_id}, amount={amount} {currency}")

        # TODO: Implementar lógica de processamento de receita

    async def _handle_payment_failed_post_processing(self, event_data: Dict[str, Any]):
        """Ações pós-processamento para pagamento falhado"""
        customer_id = event_data.get('customer')
        failure_reason = event_data.get('failure_reason')

        logger.warning(f"Pagamento falhou: customer={customer_id}, reason={failure_reason}")

        # TODO: Implementar lógica de retry e notificações

    async def _handle_subscription_updated_post_processing(self, event_data: Dict[str, Any]):
        """Ações pós-processamento para atualização de assinatura"""
        subscription_id = event_data.get('id')
        status = event_data.get('status')

        logger.info(f"Assinatura atualizada: subscription={subscription_id}, status={status}")

        # TODO: Implementar lógica de mudança de plano

    async def _handle_subscription_cancelled_post_processing(self, event_data: Dict[str, Any]):
        """Ações pós-processamento para cancelamento de assinatura"""
        subscription_id = event_data.get('id')
        customer_id = event_data.get('customer')

        logger.info(f"Assinatura cancelada: subscription={subscription_id}, customer={customer_id}")

        # TODO: Implementar lógica de downgrade para freemium

    def get_webhook_stats(self) -> Dict[str, Any]:
        """Obter estatísticas dos webhooks processados"""
        return {
            'processed_events_count': len(self.processed_events),
            'recent_events': list(self.processed_events)[-10:] if self.processed_events else []
        }


class StripeWebhookSecurity:
    """Utilitários de segurança para webhooks Stripe"""

    @staticmethod
    def verify_signature(payload: bytes, signature: str, webhook_secret: str) -> bool:
        """
        Verificar assinatura do webhook Stripe

        Args:
            payload: Payload do webhook
            signature: Header de assinatura
            webhook_secret: Secret do webhook

        Returns:
            True se assinatura for válida
        """
        try:
            # Extrair timestamp e signatures
            timestamp = None
            signatures = []

            for part in signature.split(','):
                key, value = part.split('=', 1)
                if key == 't':
                    timestamp = value
                elif key == 'v1':
                    signatures.append(value)

            if not timestamp or not signatures:
                return False

            # Criar signed_payload
            signed_payload = f"{timestamp}.{payload.decode('utf-8')}"

            # Verificar cada assinatura
            for sig in signatures:
                expected_sig = hmac.new(
                    webhook_secret.encode('utf-8'),
                    signed_payload.encode('utf-8'),
                    hashlib.sha256
                ).hexdigest()

                if hmac.compare_digest(sig, expected_sig):
                    return True

            return False

        except Exception:
            return False

    @staticmethod
    def construct_event_safely(payload: bytes, signature: str, webhook_secret: str):
        """
        Construir evento Stripe de forma segura

        Args:
            payload: Payload do webhook
            signature: Assinatura
            webhook_secret: Secret

        Returns:
            Evento Stripe ou None se inválido
        """
        if not StripeWebhookSecurity.verify_signature(payload, signature, webhook_secret):
            raise ValueError("Assinatura do webhook inválida")

        # Se assinatura OK, construir evento normalmente
        import stripe
        return stripe.Webhook.construct_event(payload, signature, webhook_secret)