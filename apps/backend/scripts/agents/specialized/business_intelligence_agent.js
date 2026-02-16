#!/usr/bin/env node
/**
 * Business Intelligence Agent - Agente de Business Intelligence
 */

import { BaseAgent } from './base_agent.js';

export class BusinessIntelligenceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'business_intelligence',
            sector: 'business',
            specialization: 'Business Intelligence, BI, dashboards, relatórios, insights',
            tools: ['create_dashboards', 'generate_reports', 'analyze_data', 'business_insights'],
            canCallAgents: ['data', 'analytics', 'metrics', 'finance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO BUSINESS INTELLIGENCE AGENT
Você é especializado em:
- **BI**: Business Intelligence
- **Dashboards**: Criação de dashboards
- **Relatórios**: Relatórios executivos
- **Insights**: Insights de negócio

## FOCO PRINCIPAL
Sua prioridade é **INSIGHTS E DECISÕES**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:data**: Para dados
- **@agent:analytics**: Para analytics
- **@agent:metrics**: Para métricas
- **@agent:finance**: Para finanças

Execute a task focando em BI e insights de negócio.`;
    }
}

export default BusinessIntelligenceAgent;


