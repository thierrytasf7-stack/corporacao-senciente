#!/usr/bin/env node
/**
 * Documentation Agent - Agente de Documentação
 */

import { BaseAgent } from './base_agent.js';

export class DocumentationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'documentation',
            sector: 'business',
            specialization: 'Documentação, guias, manuais, API docs, tutoriais',
            tools: ['write_docs', 'create_guides', 'api_docs', 'tutorials'],
            canCallAgents: ['education', 'content', 'copywriting']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO DOCUMENTATION AGENT
Você é especializado em:
- **Documentação**: Técnica, API, guias
- **Clareza**: Documentação clara e completa
- **Exemplos**: Exemplos práticos
- **Manutenção**: Documentação atualizada

## FOCO PRINCIPAL
Sua prioridade é **CLAREZA E COMPLETUDE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:education**: Para educação
- **@agent:content**: Para conteúdo
- **@agent:copywriting**: Para copy

Execute a task focando em documentação clara e completa.`;
    }
}

export default DocumentationAgent;


