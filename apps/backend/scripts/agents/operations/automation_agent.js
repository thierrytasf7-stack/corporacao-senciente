#!/usr/bin/env node
/**
 * Automation Agent - Agente de Automação
 */

import { BaseAgent } from './base_agent.js';

export class AutomationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'automation',
            sector: 'operations',
            specialization: 'Automação, workflows, integrações, bots',
            tools: ['create_workflows', 'integrate_apis', 'build_bots', 'automate_tasks'],
            canCallAgents: ['devex', 'dev', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO AUTOMATION AGENT
Você é especializado em:
- **Automação**: Workflows, processos automatizados
- **Integrações**: APIs, webhooks
- **Bots**: Chatbots, automação
- **Eficiência**: Reduzir trabalho manual

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E AUTOMAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:devex**: Para infraestrutura
- **@agent:dev**: Para implementação
- **@agent:architect**: Para arquitetura

Execute a task focando em automação e eficiência.`;
    }
}

export default AutomationAgent;


