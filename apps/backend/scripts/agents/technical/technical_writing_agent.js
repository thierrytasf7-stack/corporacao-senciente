#!/usr/bin/env node
/**
 * Technical Writing Agent - Agente de Escrita Técnica
 */

import { BaseAgent } from './base_agent.js';

export class TechnicalWritingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'technical_writing',
            sector: 'business',
            specialization: 'Escrita técnica, documentação técnica, guias, manuais',
            tools: ['write_technical', 'create_guides', 'documentation', 'tutorials'],
            canCallAgents: ['documentation', 'education', 'copywriting']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO TECHNICAL WRITING AGENT
Você é especializado em:
- **Escrita Técnica**: Documentação técnica
- **Guias**: Criação de guias
- **Manuais**: Manuais técnicos
- **Clareza**: Comunicação técnica clara

## FOCO PRINCIPAL
Sua prioridade é **CLAREZA E PRECISÃO TÉCNICA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:documentation**: Para documentação
- **@agent:education**: Para educação
- **@agent:copywriting**: Para copy

Execute a task focando em escrita técnica e clareza.`;
    }
}

export default TechnicalWritingAgent;


