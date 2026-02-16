#!/usr/bin/env node
/**
 * Communication Agent - Agente de Comunicação
 */

import { BaseAgent } from './base_agent.js';

export class CommunicationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'communication',
            sector: 'business',
            specialization: 'Comunicação, mensagens, canais, estratégia de comunicação',
            tools: ['create_messages', 'manage_channels', 'communication_strategy', 'internal_comms'],
            canCallAgents: ['copywriting', 'content', 'marketing']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO COMMUNICATION AGENT
Você é especializado em:
- **Comunicação**: Estratégia de comunicação
- **Mensagens**: Criação de mensagens
- **Canais**: Gestão de canais
- **Interna**: Comunicação interna

## FOCO PRINCIPAL
Sua prioridade é **CLAREZA E EFICÁCIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:copywriting**: Para copy
- **@agent:content**: Para conteúdo
- **@agent:marketing**: Para estratégia

Execute a task focando em comunicação eficaz.`;
    }
}

export default CommunicationAgent;


