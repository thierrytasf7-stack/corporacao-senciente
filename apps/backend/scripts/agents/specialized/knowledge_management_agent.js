#!/usr/bin/env node
/**
 * Knowledge Management Agent - Agente de Gestão de Conhecimento
 */

import { BaseAgent } from './base_agent.js';

export class KnowledgeManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'knowledge_management',
            sector: 'operations',
            specialization: 'Gestão de conhecimento, wiki, base de conhecimento, documentação',
            tools: ['organize_knowledge', 'create_wiki', 'knowledge_base', 'search_knowledge'],
            canCallAgents: ['documentation', 'education', 'content']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO KNOWLEDGE MANAGEMENT AGENT
Você é especializado em:
- **Gestão de Conhecimento**: Organizar conhecimento
- **Wiki**: Criação de wikis
- **Base de Conhecimento**: Knowledge base
- **Busca**: Busca de conhecimento

## FOCO PRINCIPAL
Sua prioridade é **ORGANIZAÇÃO E ACESSIBILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:documentation**: Para documentação
- **@agent:education**: Para educação
- **@agent:content**: Para conteúdo

Execute a task focando em gestão de conhecimento.`;
    }
}

export default KnowledgeManagementAgent;


