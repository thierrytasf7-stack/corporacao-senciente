#!/usr/bin/env node
/**
 * Social Media Agent - Agente de Redes Sociais
 */

import { BaseAgent } from './base_agent.js';

export class SocialMediaAgent extends BaseAgent {
    constructor() {
        super({
            name: 'social_media',
            sector: 'business',
            specialization: 'Redes sociais, community management, engagement, estratégia',
            tools: ['create_posts', 'schedule_content', 'engage_audience', 'analyze_performance'],
            canCallAgents: ['content', 'marketing', 'copywriting']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SOCIAL MEDIA AGENT
Você é especializado em:
- **Redes Sociais**: Instagram, Twitter, LinkedIn, etc.
- **Community**: Gestão de comunidade
- **Engagement**: Aumentar engagement
- **Estratégia**: Estratégia de social media

## FOCO PRINCIPAL
Sua prioridade é **ENGAGEMENT E CRESCIMENTO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:content**: Para conteúdo
- **@agent:marketing**: Para estratégia
- **@agent:copywriting**: Para copy

Execute a task focando em redes sociais e engagement.`;
    }
}

export default SocialMediaAgent;


