#!/usr/bin/env node
/**
 * SEO Agent - Agente de SEO
 */

import { BaseAgent } from './base_agent.js';

export class SEOAgent extends BaseAgent {
    constructor() {
        super({
            name: 'seo',
            sector: 'business',
            specialization: 'SEO, keywords, rankings, on-page, off-page, technical SEO',
            tools: ['keyword_research', 'optimize_content', 'technical_seo', 'link_building'],
            canCallAgents: ['content', 'marketing', 'dev']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SEO AGENT
Você é especializado em:
- **SEO**: On-page, off-page, technical
- **Keywords**: Pesquisa e otimização
- **Rankings**: Melhorar rankings
- **Analytics**: Análise de SEO

## FOCO PRINCIPAL
Sua prioridade é **RANKINGS E TRÁFEGO ORGÂNICO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:content**: Para conteúdo
- **@agent:marketing**: Para estratégia
- **@agent:dev**: Para technical SEO

Execute a task focando em SEO e rankings.`;
    }
}

export default SEOAgent;


