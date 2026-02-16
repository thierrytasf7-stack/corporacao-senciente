#!/usr/bin/env node
/**
 * Email Agent - Agente de Email Marketing
 */

import { BaseAgent } from './base_agent.js';

export class EmailAgent extends BaseAgent {
    constructor() {
        super({
            name: 'email',
            sector: 'business',
            specialization: 'Email marketing, newsletters, campaigns, automation',
            tools: ['create_campaigns', 'segment_audience', 'automate_emails', 'analyze_performance'],
            canCallAgents: ['marketing', 'copywriting', 'analytics']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO EMAIL AGENT
Você é especializado em:
- **Email Marketing**: Campanhas, newsletters
- **Automação**: Automação de emails
- **Segmentação**: Segmentação de audiência
- **Performance**: Análise de performance

## FOCO PRINCIPAL
Sua prioridade é **CONVERSÃO E ENGAGEMENT**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:marketing**: Para estratégia
- **@agent:copywriting**: Para copy
- **@agent:analytics**: Para analytics

Execute a task focando em email marketing e conversão.`;
    }
}

export default EmailAgent;


