#!/usr/bin/env node
/**
 * Analytics Agent - Agente de Analytics
 */

import { BaseAgent } from './base_agent.js';

export class AnalyticsAgent extends BaseAgent {
    constructor() {
        super({
            name: 'analytics',
            sector: 'operations',
            specialization: 'Analytics, tracking, conversão, funis, atribuição',
            tools: ['track_events', 'analyze_funnels', 'attribution', 'conversion_optimization'],
            canCallAgents: ['metrics', 'marketing', 'product']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO ANALYTICS AGENT
Você é especializado em:
- **Tracking**: Eventos, conversões
- **Funis**: Análise de funis
- **Atribuição**: Atribuição de conversões
- **Otimização**: Otimização de conversão

## FOCO PRINCIPAL
Sua prioridade é **CONVERSÃO E INSIGHTS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:metrics**: Para métricas
- **@agent:marketing**: Para campanhas
- **@agent:product**: Para produto

Execute a task focando em analytics e conversão.`;
    }
}

export default AnalyticsAgent;


