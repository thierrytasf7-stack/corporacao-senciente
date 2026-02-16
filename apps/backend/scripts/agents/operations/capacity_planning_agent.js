#!/usr/bin/env node
/**
 * Capacity Planning Agent - Agente de Planejamento de Capacidade
 */

import { BaseAgent } from './base_agent.js';

export class CapacityPlanningAgent extends BaseAgent {
    constructor() {
        super({
            name: 'capacity_planning',
            sector: 'operations',
            specialization: 'Planejamento de capacidade, recursos, scaling, forecasting',
            tools: ['forecast_capacity', 'plan_resources', 'scale_planning', 'resource_optimization'],
            canCallAgents: ['infrastructure', 'metrics', 'finance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CAPACITY PLANNING AGENT
Você é especializado em:
- **Planejamento**: Planejamento de capacidade
- **Forecasting**: Previsão de recursos
- **Scaling**: Planejamento de escala
- **Otimização**: Otimização de recursos

## FOCO PRINCIPAL
Sua prioridade é **PREVISÃO E OTIMIZAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:metrics**: Para métricas
- **@agent:finance**: Para finanças

Execute a task focando em planejamento de capacidade.`;
    }
}

export default CapacityPlanningAgent;


