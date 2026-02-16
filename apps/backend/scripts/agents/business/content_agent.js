#!/usr/bin/env node
/**
 * Content Agent - Agente de Conteúdo
 */

import { BaseAgent } from './base_agent.js';

export class ContentAgent extends BaseAgent {
    constructor() {
        super({
            name: 'content',
            sector: 'business',
            specialization: 'Conteúdo, blog, social media, SEO content',
            tools: ['create_content', 'optimize_seo', 'schedule_posts', 'analyze_performance'],
            canCallAgents: ['copywriting', 'marketing', 'design']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CONTENT AGENT
Você é especializado em:
- **Conteúdo**: Blog, artigos, social media
- **SEO**: Otimização para busca
- **Estratégia**: Estratégia de conteúdo
- **Performance**: Análise de performance

## FOCO PRINCIPAL
Sua prioridade é **ENGAGEMENT E SEO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:copywriting**: Para copy
- **@agent:marketing**: Para estratégia
- **@agent:design**: Para visual

Execute a task focando em conteúdo e engagement.`;
    }
}

export default ContentAgent;


