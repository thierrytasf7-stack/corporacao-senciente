#!/usr/bin/env node
/**
 * Reporting Agent - Agente de Relatórios
 */

import { BaseAgent } from './base_agent.js';

export class ReportingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'reporting',
            sector: 'operations',
            specialization: 'Relatórios, dashboards, métricas, KPIs, análise',
            tools: ['create_reports', 'build_dashboards', 'analyze_kpis', 'generate_insights'],
            canCallAgents: ['metrics', 'analytics', 'business_intelligence']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO REPORTING AGENT
Você é especializado em:
- **Relatórios**: Criação de relatórios
- **Dashboards**: Dashboards executivos
- **KPIs**: Análise de KPIs
- **Insights**: Geração de insights

## FOCO PRINCIPAL
Sua prioridade é **CLAREZA E INSIGHTS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:metrics**: Para métricas
- **@agent:analytics**: Para analytics
- **@agent:business_intelligence**: Para BI

Execute a task focando em relatórios e insights.`;
    }
}

export default ReportingAgent;


