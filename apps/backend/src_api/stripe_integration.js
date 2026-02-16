/**
 * STRIPE INTEGRATION - DIA 5: SISTEMA DE MONETIZAÇÃO
 * Integração completa com Stripe para pagamentos Freemium → Premium
 */

import Stripe from 'stripe';
import { supabase } from './supabase.js';
import { localCache } from './cache_system.js';

class StripeIntegration {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Preços dos planos (configurar no Stripe Dashboard)
    this.prices = {
      pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY
      },
      enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
      }
    };
  }

  // ========================================
  // CUSTOMER MANAGEMENT
  // ========================================

  /**
   * Criar ou buscar customer no Stripe
   */
  async createOrGetCustomer(userData) {
    try {
      console.log('🔍 Verificando customer Stripe para:', userData.email);

      // Buscar usuário no nosso banco
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      let stripeCustomerId = user?.stripe_customer_id;

      if (!stripeCustomerId) {
        // Criar customer no Stripe
        console.log('📝 Criando customer no Stripe...');

        const customer = await this.stripe.customers.create({
          email: userData.email,
          name: userData.name,
          metadata: {
            user_id: user?.id || 'pending',
            source: 'corporacao_senciente'
          }
        });

        stripeCustomerId = customer.id;

        // Atualizar usuário com customer_id
        if (user) {
          await supabase
            .from('users')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', user.id);
        }

        console.log('✅ Customer criado:', stripeCustomerId);
      } else {
        console.log('✅ Customer existente:', stripeCustomerId);
      }

      return stripeCustomerId;
    } catch (error) {
      console.error('❌ Erro ao criar/get customer:', error.message);
      throw error;
    }
  }

  // ========================================
  // SUBSCRIPTION MANAGEMENT
  // ========================================

  /**
   * Criar sessão de checkout para upgrade
   */
  async createCheckoutSession(userId, plan, interval = 'month') {
    try {
      console.log(`💳 Criando checkout para ${plan} ${interval} - User: ${userId}`);

      // Buscar dados do usuário
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Criar ou buscar customer
      const customerId = await this.createOrGetCustomer(user);

      // Pegar preço correto
      const priceId = this.prices[plan]?.[interval];
      if (!priceId) {
        throw new Error(`Preço não encontrado para ${plan} ${interval}`);
      }

      // Criar sessão de checkout
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: {
          user_id: userId,
          plan: plan,
          interval: interval
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      console.log('✅ Checkout session criada:', session.id);
      return {
        sessionId: session.id,
        url: session.url
      };

    } catch (error) {
      console.error('❌ Erro ao criar checkout session:', error.message);
      throw error;
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(userId, cancelAtPeriodEnd = true) {
    try {
      console.log(`🛑 Cancelando assinatura - User: ${userId}`);

      // Buscar assinatura ativa
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError) throw subError;

      // Cancelar no Stripe
      const canceledSubscription = await this.stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: cancelAtPeriodEnd
        }
      );

      // Atualizar status local
      await supabase
        .from('subscriptions')
        .update({
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          canceled_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', subscription.id);

      // Downgrade para freemium se cancelado imediatamente
      if (!cancelAtPeriodEnd) {
        await this.downgradeToFreemium(userId);
      }

      console.log('✅ Assinatura cancelada');
      return { success: true, cancelAtPeriodEnd };

    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura:', error.message);
      throw error;
    }
  }

  /**
   * Downgrade para Freemium
   */
  async downgradeToFreemium(userId) {
    console.log(`⬇️ Downgrade para Freemium - User: ${userId}`);

    await supabase
      .from('users')
      .update({
        plan: 'freemium',
        subscription_status: 'inactive',
        campaign_limit: 3,
        lead_limit: 10,
        automation_limit: 2,
        updated_at: new Date()
      })
      .eq('id', userId);

    console.log('✅ Downgrade concluído');
  }

  // ========================================
  // WEBHOOK HANDLING
  // ========================================

  /**
   * Processar webhooks do Stripe
   */
  async handleWebhook(rawBody, signature) {
    try {
      // Verificar assinatura do webhook
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );

      console.log('🎣 Webhook recebido:', event.type);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        default:
          console.log('ℹ️ Evento não processado:', event.type);
      }

      return { received: true };

    } catch (error) {
      console.error('❌ Erro no webhook:', error.message);
      throw error;
    }
  }

  /**
   * Processar checkout completado
   */
  async handleCheckoutCompleted(session) {
    const userId = session.metadata.user_id;
    const plan = session.metadata.plan;

    console.log(`✅ Checkout completado - User: ${userId}, Plan: ${plan}`);

    // Upgrade do usuário
    await this.upgradeUserPlan(userId, plan);

    // Registrar payment
    await this.recordPayment({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      status: 'succeeded',
      description: `Upgrade para ${plan}`,
      plan: plan
    });
  }

  /**
   * Processar pagamento bem-sucedido
   */
  async handlePaymentSucceeded(invoice) {
    console.log(`💰 Pagamento bem-sucedido - Invoice: ${invoice.id}`);

    await this.recordPayment({
      user_id: invoice.customer_metadata?.user_id,
      stripe_invoice_id: invoice.id,
      stripe_charge_id: invoice.charge,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description,
      plan: invoice.lines.data[0]?.plan?.nickname?.toLowerCase(),
      paid_at: new Date(invoice.status_transitions?.paid_at * 1000)
    });
  }

  /**
   * Processar falha de pagamento
   */
  async handlePaymentFailed(invoice) {
    console.log(`❌ Pagamento falhou - Invoice: ${invoice.id}`);

    const userId = invoice.customer_metadata?.user_id;

    // Registrar falha
    await this.recordPayment({
      user_id: userId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: `Falha de pagamento: ${invoice.description}`,
      failure_reason: invoice.last_payment_error?.message,
      failure_code: invoice.last_payment_error?.code
    });

    // Atualizar status da assinatura
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date()
      })
      .eq('id', userId);
  }

  /**
   * Processar atualização de assinatura
   */
  async handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.user_id;

    console.log(`🔄 Assinatura atualizada - User: ${userId}`);

    // Atualizar dados da assinatura
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscription.id);

    // Atualizar status do usuário
    await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_updated_at: new Date()
      })
      .eq('id', userId);
  }

  /**
   * Processar exclusão de assinatura
   */
  async handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata?.user_id;

    console.log(`🗑️ Assinatura excluída - User: ${userId}`);

    // Downgrade para freemium
    await this.downgradeToFreemium(userId);

    // Marcar assinatura como canceled
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date(),
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Upgrade do plano do usuário
   */
  async upgradeUserPlan(userId, plan) {
    console.log(`⬆️ Upgrade para ${plan} - User: ${userId}`);

    // Buscar limites do plano
    const { data: planData } = await supabase
      .from('plan_limits')
      .select('*')
      .eq('plan', plan)
      .single();

    // Atualizar usuário
    await supabase
      .from('users')
      .update({
        plan: plan,
        subscription_status: 'active',
        campaign_limit: planData.campaign_limit,
        lead_limit: planData.lead_limit,
        automation_limit: planData.automation_limit,
        updated_at: new Date()
      })
      .eq('id', userId);

    console.log('✅ Upgrade concluído');
  }

  /**
   * Registrar pagamento
   */
  async recordPayment(paymentData) {
    await supabase
      .from('payment_history')
      .insert({
        ...paymentData,
        created_at: new Date()
      });
  }

  /**
   * Verificar limites do usuário
   */
  async checkUserLimits(userId, resourceType, quantity = 1) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('plan, campaigns_used, leads_processed, automations_active')
        .eq('id', userId)
        .single();

      if (!user) return { allowed: false, reason: 'User not found' };

      // Buscar limites do plano
      const { data: planLimits } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan', user.plan)
        .single();

      if (!planLimits) return { allowed: false, reason: 'Plan not found' };

      // Verificar limite específico
      let currentUsage = 0;
      let limit = 0;

      switch (resourceType) {
        case 'campaign':
          currentUsage = user.campaigns_used || 0;
          limit = planLimits.campaign_limit;
          break;
        case 'lead':
          currentUsage = user.leads_processed || 0;
          limit = planLimits.lead_limit;
          break;
        case 'automation':
          currentUsage = user.automations_active || 0;
          limit = planLimits.automation_limit;
          break;
        default:
          return { allowed: false, reason: 'Invalid resource type' };
      }

      const allowed = (currentUsage + quantity) <= limit;

      return {
        allowed,
        currentUsage,
        limit,
        remaining: Math.max(0, limit - currentUsage),
        plan: user.plan
      };

    } catch (error) {
      console.error('Erro ao verificar limites:', error.message);
      return { allowed: false, reason: 'Error checking limits' };
    }
  }

  /**
   * Atualizar uso do usuário
   */
  async updateUserUsage(userId, resourceType, quantity = 1) {
    try {
      let updateField = '';

      switch (resourceType) {
        case 'campaign':
          updateField = 'campaigns_used';
          break;
        case 'lead':
          updateField = 'leads_processed';
          break;
        case 'automation':
          updateField = 'automations_active';
          break;
        default:
          throw new Error('Invalid resource type');
      }

      await supabase.rpc('update_user_usage', {
        p_user_id: userId,
        p_resource_type: resourceType,
        p_quantity: quantity
      });

      console.log(`📊 Uso atualizado: ${resourceType} +${quantity} para user ${userId}`);

    } catch (error) {
      console.error('Erro ao atualizar uso:', error.message);
      throw error;
    }
  }

  /**
   * Resetar limites mensais (Freemium)
   */
  async resetMonthlyLimits() {
    try {
      console.log('🔄 Resetando limites mensais...');

      const { error } = await supabase.rpc('reset_monthly_limits');

      if (error) throw error;

      console.log('✅ Limites resetados com sucesso');

    } catch (error) {
      console.error('Erro ao resetar limites:', error.message);
      throw error;
    }
  }
}

export default StripeIntegration;