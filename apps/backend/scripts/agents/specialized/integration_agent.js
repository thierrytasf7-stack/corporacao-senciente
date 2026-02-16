#!/usr/bin/env node
/**
 * Integration Agent - Agente de Integrações
 */

import { BaseAgent } from './base_agent.js';

export class IntegrationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'integration',
            sector: 'technical',
            specialization: 'Integrações, APIs, webhooks, third-party, sync',
            tools: ['integrate_apis', 'setup_webhooks', 'sync_data', 'manage_integrations'],
            canCallAgents: ['api', 'backend', 'automation']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO INTEGRATION AGENT
Você é especializado em:
- **Integrações**: APIs, webhooks
- **Third-party**: Integrações externas
- **Sync**: Sincronização de dados
- **APIs**: Consumo e criação

## FOCO PRINCIPAL
Sua prioridade é **CONECTIVIDADE E SINCRONIZAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:api**: Para APIs
- **@agent:backend**: Para backend
- **@agent:automation**: Para automação

Execute a task focando em integrações e conectividade.`;
    }
}

export default IntegrationAgent;


