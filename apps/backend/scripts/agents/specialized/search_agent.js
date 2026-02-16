#!/usr/bin/env node
/**
 * Search Agent - Agente de Busca
 */

import { BaseAgent } from './base_agent.js';

export class SearchAgent extends BaseAgent {
    constructor() {
        super({
            name: 'search',
            sector: 'technical',
            specialization: 'Busca, search engines, Elasticsearch, Algolia, relevância',
            tools: ['setup_search', 'index_data', 'optimize_relevance', 'search_analytics'],
            canCallAgents: ['backend', 'data', 'performance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SEARCH AGENT
Você é especializado em:
- **Busca**: Search engines, Elasticsearch
- **Indexação**: Indexação de dados
- **Relevância**: Otimização de relevância
- **Analytics**: Analytics de busca

## FOCO PRINCIPAL
Sua prioridade é **RELEVÂNCIA E PERFORMANCE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:backend**: Para backend
- **@agent:data**: Para dados
- **@agent:performance**: Para performance

Execute a task focando em busca e relevância.`;
    }
}

export default SearchAgent;


