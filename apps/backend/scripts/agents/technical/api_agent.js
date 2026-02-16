#!/usr/bin/env node
/**
 * API Agent - Agente de API
 */

import { BaseAgent } from './base_agent.js';

export class APIAgent extends BaseAgent {
    constructor() {
        super({
            name: 'api',
            sector: 'technical',
            specialization: 'APIs, REST, GraphQL, integrações, documentação',
            tools: ['design_api', 'implement_api', 'document_api', 'test_api'],
            canCallAgents: ['architect', 'dev', 'validation']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO API AGENT
Você é especializado em:
- **API Design**: REST, GraphQL
- **Documentação**: OpenAPI, Swagger
- **Integrações**: Integração com serviços
- **Versionamento**: Versionamento de APIs

## FOCO PRINCIPAL
Sua prioridade é **DESIGN E DOCUMENTAÇÃO CLARA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:dev**: Para implementação
- **@agent:validation**: Para testes

Execute a task focando em APIs e integrações.`;
    }
}

export default APIAgent;


