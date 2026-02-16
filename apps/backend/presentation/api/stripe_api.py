"""
Stripe Payment API
Endpoints para integração com Stripe
"""

from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
import json

from backend.infrastructure.payments.stripe_service import StripeService


# Pydantic Models
class CreateCheckoutRequest(BaseModel):
    customer_email: EmailStr
    plan: str  # freemium, premium, enterprise
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, Any]] = None

class CheckoutResponse(BaseModel):
    session_id: str
    url: str
    plan: str
    customer_id: str

class WebhookResponse(BaseModel):
    received: bool
    event_type: str
    processed: bool

class SubscriptionInfo(BaseModel):
    subscription_id: str
    status: str
    plan: str
    amount: float
    currency: str
    current_period_start: str
    current_period_end: str

class PortalSessionResponse(BaseModel):
    url: str

class PlanLimitsResponse(BaseModel):
    plan: str
    features: list
    limits: Dict[str, Any]

class UsageValidationResponse(BaseModel):
    valid: bool
    violations: list
    plan: str
    features: list


# Dependency
def get_stripe_service() -> StripeService:
    return StripeService()


# Router
router = APIRouter(prefix="/api/stripe", tags=["stripe"])


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CreateCheckoutRequest,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Criar sessão de checkout do Stripe
    """
    try:
        result = await stripe_service.create_checkout_session(
            customer_email=request.customer_email,
            plan=request.plan,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata=request.metadata
        )

        return CheckoutResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar checkout: {str(e)}")


@router.post("/webhook", response_model=WebhookResponse)
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Webhook do Stripe para eventos de pagamento
    """
    try:
        # Get raw payload
        payload = await request.body()

        # Get Stripe signature
        signature = request.headers.get('stripe-signature')
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")

        # Process webhook
        result = await stripe_service.handle_webhook(payload, signature)

        # Add background task for additional processing if needed
        if result.get('action') == 'subscription_created':
            background_tasks.add_task(
                process_subscription_created,
                result.get('customer_email'),
                result.get('plan')
            )

        return WebhookResponse(
            received=True,
            event_type=result['event_type'],
            processed=True
        )

    except Exception as e:
        # Log the error but don't expose details
        print(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")


@router.get("/subscriptions/{customer_id}")
async def get_customer_subscriptions(
    customer_id: str,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Obter assinaturas de um cliente
    """
    try:
        subscriptions = await stripe_service.get_customer_subscriptions(customer_id)

        return {
            "subscriptions": [
                SubscriptionInfo(
                    subscription_id=sub['subscription_id'],
                    status=sub['status'],
                    plan=sub['plan'],
                    amount=sub['amount'],
                    currency=sub['currency'],
                    current_period_start=sub['current_period_start'].isoformat(),
                    current_period_end=sub['current_period_end'].isoformat()
                ).dict()
                for sub in subscriptions
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter assinaturas: {str(e)}")


@router.post("/cancel-subscription/{subscription_id}")
async def cancel_subscription(
    subscription_id: str,
    cancel_at_period_end: bool = True,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Cancelar assinatura
    """
    try:
        result = await stripe_service.cancel_subscription(
            subscription_id, cancel_at_period_end
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cancelar assinatura: {str(e)}")


@router.post("/create-portal-session")
async def create_customer_portal_session(
    customer_id: str,
    return_url: str,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Criar sessão do portal do cliente para gerenciamento de assinatura
    """
    try:
        url = await stripe_service.create_customer_portal_session(
            customer_id, return_url
        )

        return PortalSessionResponse(url=url)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar portal: {str(e)}")


@router.get("/plans/{plan}/limits", response_model=PlanLimitsResponse)
async def get_plan_limits(
    plan: str,
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Obter limites e recursos de um plano
    """
    try:
        limits = stripe_service.get_plan_limits(plan)

        return PlanLimitsResponse(
            plan=plan,
            features=limits['features'],
            limits=limits['limits']
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter limites: {str(e)}")


@router.post("/validate-usage")
async def validate_plan_usage(
    plan: str,
    current_usage: Dict[str, Any],
    stripe_service: StripeService = Depends(get_stripe_service)
):
    """
    Validar se uso atual está dentro dos limites do plano
    """
    try:
        validation = stripe_service.validate_plan_limits(plan, current_usage)

        return UsageValidationResponse(
            valid=validation['valid'],
            violations=validation['violations'],
            plan=validation['plan'],
            features=validation['features']
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na validação: {str(e)}")


@router.get("/config")
async def get_stripe_config():
    """
    Obter configuração pública do Stripe (publishable key)
    """
    return {
        "publishable_key": StripeService().publishable_key
    }


# Background task functions
async def process_subscription_created(customer_email: str, plan: str):
    """
    Process subscription creation in background
    """
    try:
        # Here you would:
        # 1. Update user database with subscription
        # 2. Send welcome email
        # 3. Enable plan features
        # 4. Create audit log

        print(f"Processing subscription creation: {customer_email} -> {plan}")

        # TODO: Implement actual processing logic
        # - Update user subscription status
        # - Send welcome email via SendGrid/Mailgun
        # - Enable plan-specific features
        # - Log to audit table

    except Exception as e:
        print(f"Error processing subscription creation: {str(e)}")
        # TODO: Add error handling/logging