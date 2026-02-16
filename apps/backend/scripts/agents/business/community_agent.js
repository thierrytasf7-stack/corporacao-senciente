#!/usr/bin/env node
/**
 * Community Agent - Agente de Comunidade
 */

import { BaseAgent } from './base_agent.js';

export class CommunityAgent extends BaseAgent {
    constructor() {
        super({
            name: 'community',
            sector: 'business',
            specialization: 'Comunidade, engagement, eventos, fóruns, suporte',
            tools: ['manage_community', 'organize_events', 'moderate_forums', 'engage_members'],
            canCallAgents: ['content', 'social_media', 'customer_support']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO COMMUNITY AGENT
Você é especializado em:
- **Comunidade**: Gestão de comunidade
- **Engagement**: Aumentar engagement
- **Eventos**: Organizar eventos
- **Moderação**: Moderar fóruns

## FOCO PRINCIPAL
Sua prioridade é **ENGAGEMENT E CRESCIMENTO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:content**: Para conteúdo
- **@agent:social_media**: Para redes sociais
- **@agent:customer_support**: Para suporte

Execute a task focando em comunidade e engagement.`;
    }
}

export default CommunityAgent;


