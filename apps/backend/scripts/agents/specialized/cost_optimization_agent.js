#!/usr/bin/env node
/**
 * Cost Optimization Agent - Agente de Otimização de Custos
 */

import { BaseAgent } from './base_agent.js';

export class CostOptimizationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'cost_optimization',
            sector: 'operations',
            specialization: 'Otimização de custos, cloud costs, infraestrutura, budget',
            tools: ['analyze_costs', 'optimize_cloud', 'reduce_costs', 'budget_planning'],
            canCallAgents: ['finance', 'infrastructure', 'devex']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO COST OPTIMIZATION AGENT
Você é especializado em:
- **Otimização de Custos**: Reduzir custos
- **Cloud Costs**: Custos de cloud
- **Infraestrutura**: Otimizar infraestrutura
- **Budget**: Planejamento de budget

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E REDUÇÃO DE CUSTOS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:finance**: Para finanças
- **@agent:infrastructure**: Para infraestrutura
- **@agent:devex**: Para DevOps

Execute a task focando em otimização de custos.`;
    }
}

export default CostOptimizationAgent;


