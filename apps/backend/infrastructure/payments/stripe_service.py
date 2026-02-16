"""
Stripe Payment Service
Integração completa com Stripe para monetização
"""

import os
import stripe
from typing import Dict, Any, Optional, List
from decimal import Decimal
from datetime import datetime, timedelta
import json

from backend.core.entities.holding import Holding, Subsidiary


class StripeService:
    """Service for handling Stripe payments and subscriptions"""

    def __init__(self):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        self.publishable_key = os.getenv('STRIPE_PUBLISHABLE_KEY')
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

        # Product/Price IDs (configure in Stripe Dashboard)
        self.products = {
            'freemium': {
                'name': 'Corporação Senciente - Freemium',
                'price_id': os.getenv('STRIPE_PRICE_FREEMIUM', 'price_freemium'),
                'features': ['3_subsidiaries', 'basic_support', 'community_access'],
                'limits': {'max_subsidiaries': 3}
            },
            'premium': {
                'name': 'Corporação Senciente - Premium',
                'price_id': os.getenv('STRIPE_PRICE_PREMIUM', 'price_premium'),
                'features': ['unlimited_subsidiaries', 'priority_support', 'advanced_analytics', 'api_access'],
                'limits': {'max_subsidiaries': -1}  # Unlimited
            },
            'enterprise': {
                'name': 'Corporação Senciente - Enterprise',
                'price_id': os.getenv('STRIPE_PRICE_ENTERPRISE', 'price_enterprise'),
                'features': ['all_premium', 'white_label', 'dedicated_support', 'custom_integrations'],
                'limits': {'max_subsidiaries': -1}  # Unlimited
            }
        }

    async def create_checkout_session(
        self,
        customer_email: str,
        plan: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe checkout session

        Args:
            customer_email: Customer email
            plan: Plan type (freemium, premium, enterprise)
            success_url: Success redirect URL
            cancel_url: Cancel redirect URL
            metadata: Additional metadata

        Returns:
            Checkout session data
        """
        if plan not in self.products:
            raise ValueError(f"Invalid plan: {plan}")

        product = self.products[plan]

        try:
            # Create or retrieve customer
            customer = await self._get_or_create_customer(customer_email)

            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=customer.id,
                payment_method_types=['card'],
                line_items=[{
                    'price': product['price_id'],
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'plan': plan,
                    'customer_email': customer_email,
                    **(metadata or {})
                },
                allow_promotion_codes=True,
                billing_address_collection='required',
                customer_update={
                    'address': 'auto',
                    'name': 'auto'
                }
            )

            return {
                'session_id': session.id,
                'url': session.url,
                'plan': plan,
                'customer_id': customer.id
            }

        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {e.user_message}")

    async def handle_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Handle Stripe webhook events

        Args:
            payload: Raw webhook payload
            signature: Stripe signature header

        Returns:
            Processed webhook data
        """
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )

            # Process different event types
            event_data = {
                'event_type': event.type,
                'event_id': event.id,
                'created': datetime.fromtimestamp(event.created),
                'processed_at': datetime.utcnow()
            }

            if event.type == 'checkout.session.completed':
                await self._handle_checkout_completed(event.data.object)
                event_data['action'] = 'subscription_created'

            elif event.type == 'invoice.payment_succeeded':
                await self._handle_payment_succeeded(event.data.object)
                event_data['action'] = 'payment_processed'

            elif event.type == 'invoice.payment_failed':
                await self._handle_payment_failed(event.data.object)
                event_data['action'] = 'payment_failed'

            elif event.type == 'customer.subscription.updated':
                await self._handle_subscription_updated(event.data.object)
                event_data['action'] = 'subscription_updated'

            elif event.type == 'customer.subscription.deleted':
                await self._handle_subscription_cancelled(event.data.object)
                event_data['action'] = 'subscription_cancelled'

            return event_data

        except stripe.error.SignatureVerificationError:
            raise Exception("Invalid webhook signature")
        except Exception as e:
            raise Exception(f"Webhook processing error: {str(e)}")

    async def get_customer_subscriptions(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        Get customer subscriptions

        Args:
            customer_id: Stripe customer ID

        Returns:
            List of subscriptions
        """
        try:
            subscriptions = stripe.Subscription.list(customer=customer_id, status='active')

            result = []
            for sub in subscriptions.data:
                result.append({
                    'subscription_id': sub.id,
                    'status': sub.status,
                    'current_period_start': datetime.fromtimestamp(sub.current_period_start),
                    'current_period_end': datetime.fromtimestamp(sub.current_period_end),
                    'plan': self._get_plan_from_price_id(sub.items.data[0].price.id),
                    'amount': sub.items.data[0].price.unit_amount / 100,  # Convert cents to dollars
                    'currency': sub.items.data[0].price.currency
                })

            return result

        except stripe.error.StripeError as e:
            raise Exception(f"Error getting subscriptions: {e.user_message}")

    async def cancel_subscription(self, subscription_id: str, cancel_at_period_end: bool = True) -> Dict[str, Any]:
        """
        Cancel a subscription

        Args:
            subscription_id: Stripe subscription ID
            cancel_at_period_end: Cancel at period end instead of immediately

        Returns:
            Cancellation result
        """
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=cancel_at_period_end
            )

            return {
                'subscription_id': subscription.id,
                'cancelled': True,
                'cancel_at_period_end': cancel_at_period_end,
                'current_period_end': datetime.fromtimestamp(subscription.current_period_end)
            }

        except stripe.error.StripeError as e:
            raise Exception(f"Error cancelling subscription: {e.user_message}")

    async def create_customer_portal_session(self, customer_id: str, return_url: str) -> str:
        """
        Create a customer portal session for subscription management

        Args:
            customer_id: Stripe customer ID
            return_url: URL to return to after portal session

        Returns:
            Portal session URL
        """
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )

            return session.url

        except stripe.error.StripeError as e:
            raise Exception(f"Error creating portal session: {e.user_message}")

    def get_plan_limits(self, plan: str) -> Dict[str, Any]:
        """
        Get limits for a specific plan

        Args:
            plan: Plan type

        Returns:
            Plan limits and features
        """
        if plan not in self.products:
            raise ValueError(f"Invalid plan: {plan}")

        return self.products[plan]

    def validate_plan_limits(self, plan: str, current_usage: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate if current usage is within plan limits

        Args:
            plan: Plan type
            current_usage: Current usage metrics

        Returns:
            Validation result
        """
        limits = self.get_plan_limits(plan)

        violations = []

        # Check subsidiary limit
        if limits['limits']['max_subsidiaries'] != -1:  # -1 means unlimited
            current_subsidiaries = current_usage.get('subsidiaries', 0)
            if current_subsidiaries >= limits['limits']['max_subsidiaries']:
                violations.append({
                    'type': 'subsidiary_limit',
                    'current': current_subsidiaries,
                    'limit': limits['limits']['max_subsidiaries'],
                    'message': f'Subsidiary limit exceeded: {current_subsidiaries}/{limits["limits"]["max_subsidiaries"]}'
                })

        return {
            'valid': len(violations) == 0,
            'violations': violations,
            'plan': plan,
            'features': limits['features']
        }

    async def _get_or_create_customer(self, email: str) -> stripe.Customer:
        """Get existing customer or create new one"""
        try:
            # Try to find existing customer
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                return customers.data[0]

            # Create new customer
            customer = stripe.Customer.create(
                email=email,
                name=email.split('@')[0],  # Use email prefix as name
                metadata={
                    'source': 'corporacao_senciente',
                    'created_at': datetime.utcnow().isoformat()
                }
            )

            return customer

        except stripe.error.StripeError as e:
            raise Exception(f"Customer creation error: {e.user_message}")

    async def _handle_checkout_completed(self, session: stripe.checkout.Session):
        """Handle successful checkout completion"""
        # Extract metadata
        plan = session.metadata.get('plan')
        customer_email = session.metadata.get('customer_email')

        # Here you would typically:
        # 1. Update user subscription in your database
        # 2. Send welcome email
        # 3. Enable plan features
        # 4. Log the event

        print(f"Checkout completed: {customer_email} subscribed to {plan}")

    async def _handle_payment_succeeded(self, invoice: stripe.Invoice):
        """Handle successful payment"""
        # Process successful payment
        # Update revenue tracking, send receipts, etc.
        print(f"Payment succeeded: {invoice.amount_paid / 100} {invoice.currency}")

    async def _handle_payment_failed(self, invoice: stripe.Invoice):
        """Handle failed payment"""
        # Handle failed payment
        # Send payment failed email, disable features, etc.
        print(f"Payment failed for invoice: {invoice.id}")

    async def _handle_subscription_updated(self, subscription: stripe.Subscription):
        """Handle subscription updates"""
        # Handle plan changes, etc.
        print(f"Subscription updated: {subscription.id}")

    async def _handle_subscription_cancelled(self, subscription: stripe.Subscription):
        """Handle subscription cancellation"""
        # Handle subscription cancellation
        # Downgrade to freemium, send cancellation email, etc.
        print(f"Subscription cancelled: {subscription.id}")

    def _get_plan_from_price_id(self, price_id: str) -> str:
        """Get plan name from Stripe price ID"""
        for plan, data in self.products.items():
            if data['price_id'] == price_id:
                return plan
        return 'unknown'