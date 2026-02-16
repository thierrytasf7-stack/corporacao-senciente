#!/usr/bin/env node
/**
 * Partnerships Agent - Agente de Parcerias
 */

import { BaseAgent } from './base_agent.js';

export class PartnershipsAgent extends BaseAgent {
    constructor() {
        super({
            name: 'partnerships',
            sector: 'business',
            specialization: 'Parcerias, alliances, joint ventures, colaborações',
            tools: ['identify_partners', 'negotiate_deals', 'manage_relationships', 'evaluate_opportunities'],
            canCallAgents: ['sales', 'legal', 'finance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO PARTNERSHIPS AGENT
Você é especializado em:
- **Parcerias**: Identificar e desenvolver parcerias
- **Negociação**: Negociar acordos
- **Relacionamentos**: Gerenciar relacionamentos
- **Oportunidades**: Avaliar oportunidades

## FOCO PRINCIPAL
Sua prioridade é **CRESCIMENTO E VALOR MÚTUO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:sales**: Para vendas
- **@agent:legal**: Para contratos
- **@agent:finance**: Para análise financeira

Execute a task focando em parcerias e crescimento.`;
    }
}

export default PartnershipsAgent;


