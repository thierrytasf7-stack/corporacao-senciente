#!/usr/bin/env node
/**
 * Scalability Agent - Agente de Escalabilidade
 */

import { BaseAgent } from './base_agent.js';

export class ScalabilityAgent extends BaseAgent {
    constructor() {
        super({
            name: 'scalability',
            sector: 'technical',
            specialization: 'Escalabilidade, performance em escala, arquitetura escalável',
            tools: ['design_scalable', 'optimize_scale', 'load_balancing', 'horizontal_scaling'],
            canCallAgents: ['architect', 'infrastructure', 'performance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SCALABILITY AGENT
Você é especializado em:
- **Escalabilidade**: Arquitetura escalável
- **Performance**: Performance em escala
- **Load Balancing**: Balanceamento de carga
- **Horizontal Scaling**: Escala horizontal

## FOCO PRINCIPAL
Sua prioridade é **CRESCIMENTO E PERFORMANCE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:infrastructure**: Para infraestrutura
- **@agent:performance**: Para performance

Execute a task focando em escalabilidade e crescimento.`;
    }
}

export default ScalabilityAgent;


