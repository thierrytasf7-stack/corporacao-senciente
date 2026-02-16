/**
 * STRIPE ENDPOINTS - DIA 5: API PARA MONETIZAÇÃO
 * Endpoints para integração frontend ↔ Stripe
 */

import StripeIntegration from './stripe_integration.js';
import { supabase } from './supabase.js';

const stripe = new StripeIntegration();

// ========================================
// CHECKOUT & SUBSCRIPTIONS
// ========================================

/**
 * POST /api/stripe/create-checkout-session
 * Criar sessão de checkout para upgrade
 */
export async function createCheckoutSession(req, res) {
  try {
    const { userId, plan, interval = 'month' } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({
        error: 'Missing required fields: userId, plan'
      });
    }

    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan. Must be pro or enterprise'
      });
    }

    if (!['month', 'year'].includes(interval)) {
      return res.status(400).json({
        error: 'Invalid interval. Must be month or year'
      });
    }

    // Verificar se usuário existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (userError) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const session = await stripe.createCheckoutSession(userId, plan, interval);

    res.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url
    });

  } catch (error) {
    console.error('Erro ao criar checkout session:', error.message);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error.message
    });
  }
}

/**
 * GET /api/stripe/subscription-status/:userId
 * Verificar status da assinatura do usuário
 */
export async function getSubscriptionStatus(req, res) {
  try {
    const { userId } = req.params;

    // Buscar dados do usuário e assinatura
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        plan,
        subscription_status,
        campaigns_used,
        leads_processed,
        automations_active,
        campaign_limit,
        lead_limit,
        automation_limit,
        subscriptions (
          id,
          plan,
          status,
          current_period_end,
          amount,
          currency,
          interval
        )
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Calcular uso restante
    const usage = {
      campaigns: {
        used: user.campaigns_used || 0,
        limit: user.campaign_limit || 0,
        remaining: Math.max(0, (user.campaign_limit || 0) - (user.campaigns_used || 0))
      },
      leads: {
        used: user.leads_processed || 0,
        limit: user.lead_limit || 0,
        remaining: Math.max(0, (user.lead_limit || 0) - (user.leads_processed || 0))
      },
      automations: {
        used: user.automations_active || 0,
        limit: user.automation_limit || 0,
        remaining: Math.max(0, (user.automation_limit || 0) - (user.automations_active || 0))
      }
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        plan: user.plan,
        subscription_status: user.subscription_status
      },
      subscription: user.subscriptions?.[0] || null,
      usage: usage,
      limits: {
        campaign_limit: user.campaign_limit,
        lead_limit: user.lead_limit,
        automation_limit: user.automation_limit
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error.message);
    res.status(500).json({
      error: 'Failed to get subscription status',
      details: error.message
    });
  }
}

/**
 * POST /api/stripe/cancel-subscription
 * Cancelar assinatura
 */
export async function cancelSubscription(req, res) {
  try {
    const { userId, cancelAtPeriodEnd = true } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    const result = await stripe.cancelSubscription(userId, cancelAtPeriodEnd);

    res.json({
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be canceled at the end of the billing period'
        : 'Subscription canceled immediately',
      cancelAtPeriodEnd: result.cancelAtPeriodEnd
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error.message);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      details: error.message
    });
  }
}

// ========================================
// USAGE & LIMITS
// ========================================

/**
 * GET /api/stripe/check-limits/:userId
 * Verificar limites do usuário para um recurso
 */
export async function checkLimits(req, res) {
  try {
    const { userId } = req.params;
    const { resourceType, quantity = 1 } = req.query;

    if (!resourceType) {
      return res.status(400).json({
        error: 'Missing required query parameter: resourceType'
      });
    }

    if (!['campaign', 'lead', 'automation'].includes(resourceType)) {
      return res.status(400).json({
        error: 'Invalid resourceType. Must be campaign, lead, or automation'
      });
    }

    const limits = await stripe.checkUserLimits(userId, resourceType, parseInt(quantity));

    res.json({
      success: true,
      ...limits
    });

  } catch (error) {
    console.error('Erro ao verificar limites:', error.message);
    res.status(500).json({
      error: 'Failed to check limits',
      details: error.message
    });
  }
}

/**
 * POST /api/stripe/update-usage
 * Atualizar uso do usuário (chamado internamente pelos agentes)
 */
export async function updateUsage(req, res) {
  try {
    const { userId, resourceType, quantity = 1 } = req.body;

    if (!userId || !resourceType) {
      return res.status(400).json({
        error: 'Missing required fields: userId, resourceType'
      });
    }

    // Verificar se está dentro dos limites antes de atualizar
    const limits = await stripe.checkUserLimits(userId, resourceType, quantity);

    if (!limits.allowed) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        currentUsage: limits.currentUsage,
        limit: limits.limit,
        plan: limits.plan
      });
    }

    // Atualizar uso
    await stripe.updateUserUsage(userId, resourceType, quantity);

    res.json({
      success: true,
      message: 'Usage updated successfully',
      newUsage: limits.currentUsage + quantity,
      remaining: limits.remaining - quantity
    });

  } catch (error) {
    console.error('Erro ao atualizar uso:', error.message);
    res.status(500).json({
      error: 'Failed to update usage',
      details: error.message
    });
  }
}

// ========================================
// WEBHOOKS
// ========================================

/**
 * POST /api/stripe/webhook
 * Webhook endpoint para eventos do Stripe
 */
export async function stripeWebhook(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;

    if (!sig) {
      return res.status(400).json({
        error: 'Missing Stripe signature'
      });
    }

    await stripe.handleWebhook(rawBody, sig);

    res.json({ received: true });

  } catch (error) {
    console.error('Erro no webhook:', error.message);

    // Stripe espera status 400 para erros de validação
    if (error.message.includes('signature')) {
      return res.status(400).json({
        error: 'Invalid signature'
      });
    }

    res.status(500).json({
      error: 'Webhook processing failed',
      details: error.message
    });
  }
}

// ========================================
// ANALYTICS & REPORTING
// ========================================

/**
 * GET /api/stripe/revenue-analytics
 * Analytics de receita (admin only)
 */
export async function getRevenueAnalytics(req, res) {
  try {
    // TODO: Implementar autenticação admin

    const { data: analytics, error } = await supabase
      .from('revenue_analytics')
      .select('*')
      .order('month', { ascending: false })
      .limit(12);

    if (error) throw error;

    res.json({
      success: true,
      analytics: analytics || []
    });

  } catch (error) {
    console.error('Erro ao buscar analytics:', error.message);
    res.status(500).json({
      error: 'Failed to get revenue analytics',
      details: error.message
    });
  }
}

/**
 * GET /api/stripe/user-distribution
 * Distribuição de usuários por plano
 */
export async function getUserDistribution(req, res) {
  try {
    const { data: distribution, error } = await supabase
      .from('user_plan_distribution')
      .select('*')
      .order('user_count', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      distribution: distribution || []
    });

  } catch (error) {
    console.error('Erro ao buscar distribuição:', error.message);
    res.status(500).json({
      error: 'Failed to get user distribution',
      details: error.message
    });
  }
}

/**
 * GET /api/stripe/plan-limits
 * Buscar limites de todos os planos
 */
export async function getPlanLimits(req, res) {
  try {
    const { data: plans, error } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('active', true)
      .order('price_cents');

    if (error) throw error;

    res.json({
      success: true,
      plans: plans || []
    });

  } catch (error) {
    console.error('Erro ao buscar planos:', error.message);
    res.status(500).json({
      error: 'Failed to get plan limits',
      details: error.message
    });
  }
}

// ========================================
// UTILITY ENDPOINTS
// ========================================

/**
 * POST /api/stripe/reset-limits
 * Resetar limites mensais (admin only - chamado por cron job)
 */
export async function resetMonthlyLimits(req, res) {
  try {
    // TODO: Implementar autenticação admin

    await stripe.resetMonthlyLimits();

    res.json({
      success: true,
      message: 'Monthly limits reset successfully'
    });

  } catch (error) {
    console.error('Erro ao resetar limites:', error.message);
    res.status(500).json({
      error: 'Failed to reset monthly limits',
      details: error.message
    });
  }
}

/**
 * GET /api/stripe/payment-history/:userId
 * Histórico de pagamentos do usuário
 */
export async function getPaymentHistory(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const { data: payments, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      payments: payments || []
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message);
    res.status(500).json({
      error: 'Failed to get payment history',
      details: error.message
    });
  }
}