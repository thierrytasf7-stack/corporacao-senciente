#!/usr/bin/env node
/**
 * Customer Support Agent - Agente de Suporte ao Cliente
 */

import { BaseAgent } from './base_agent.js';

export class CustomerSupportAgent extends BaseAgent {
    constructor() {
        super({
            name: 'customer_support',
            sector: 'business',
            specialization: 'Suporte ao cliente, atendimento, resolução de problemas, satisfação',
            tools: ['handle_tickets', 'resolve_issues', 'collect_feedback', 'escalate'],
            canCallAgents: ['dev', 'product', 'sales']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CUSTOMER SUPPORT AGENT
Você é especializado em:
- **Atendimento**: Suporte ao cliente, resolução de problemas
- **Satisfação**: Garantir satisfação do cliente
- **Feedback**: Coletar e analisar feedback
- **Escalação**: Escalar problemas quando necessário

## FOCO PRINCIPAL
Sua prioridade é **SATISFAÇÃO E RESOLUÇÃO RÁPIDA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para bugs técnicos
- **@agent:product**: Para feedback de produto
- **@agent:sales**: Para questões comerciais

Execute a task focando em satisfação do cliente.`;
    }
}

export default CustomerSupportAgent;


