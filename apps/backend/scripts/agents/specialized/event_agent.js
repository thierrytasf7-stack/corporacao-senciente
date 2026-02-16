#!/usr/bin/env node
/**
 * Event Agent - Agente de Eventos
 */

import { BaseAgent } from './base_agent.js';

export class EventAgent extends BaseAgent {
    constructor() {
        super({
            name: 'event',
            sector: 'business',
            specialization: 'Eventos, conferências, webinars, meetups, organização',
            tools: ['organize_events', 'plan_conferences', 'webinars', 'manage_attendees'],
            canCallAgents: ['marketing', 'community', 'content']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO EVENT AGENT
Você é especializado em:
- **Eventos**: Organização de eventos
- **Conferências**: Planejamento de conferências
- **Webinars**: Webinars online
- **Engagement**: Engajamento de participantes

## FOCO PRINCIPAL
Sua prioridade é **EXPERIÊNCIA E ENGAGEMENT**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:marketing**: Para marketing
- **@agent:community**: Para comunidade
- **@agent:content**: Para conteúdo

Execute a task focando em eventos e engagement.`;
    }
}

export default EventAgent;


