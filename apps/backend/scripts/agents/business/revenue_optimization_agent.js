#!/usr/bin/env node
/**
 * Revenue Optimization Agent - Agente de Otimização de Receita
 */

import { BaseAgent } from './base_agent.js';

export class RevenueOptimizationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'revenue_optimization',
            sector: 'business',
            specialization: 'Otimização de receita, pricing, monetização, upsell, cross-sell',
            tools: ['optimize_pricing', 'monetization_strategy', 'upsell_crosssell', 'revenue_analysis'],
            canCallAgents: ['finance', 'sales', 'product']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO REVENUE OPTIMIZATION AGENT
Você é especializado em:
- **Otimização de Receita**: Maximizar receita
- **Pricing**: Estratégias de pricing
- **Monetização**: Modelos de monetização
- **Upsell/Cross-sell**: Expansão de receita

## FOCO PRINCIPAL
Sua prioridade é **MAXIMIZAÇÃO DE RECEITA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:finance**: Para finanças
- **@agent:sales**: Para vendas
- **@agent:product**: Para produto

Execute a task focando em otimização de receita.`;
    }
}

export default RevenueOptimizationAgent;


