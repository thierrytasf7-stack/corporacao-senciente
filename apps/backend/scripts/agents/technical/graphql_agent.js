#!/usr/bin/env node
/**
 * GraphQL Agent - Agente de GraphQL
 */

import { BaseAgent } from './base_agent.js';

export class GraphQLAgent extends BaseAgent {
    constructor() {
        super({
            name: 'graphql',
            sector: 'technical',
            specialization: 'GraphQL, schemas, resolvers, queries, mutations, subscriptions',
            tools: ['design_schema', 'implement_resolvers', 'optimize_queries', 'document_api'],
            canCallAgents: ['api', 'backend', 'frontend']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO GRAPHQL AGENT
Você é especializado em:
- **GraphQL**: Schemas, resolvers
- **Queries**: Otimização de queries
- **Mutations**: Mutations e subscriptions
- **Documentação**: Documentação de API

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E FLEXIBILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:api**: Para APIs
- **@agent:backend**: Para backend
- **@agent:frontend**: Para frontend

Execute a task focando em GraphQL e APIs.`;
    }
}

export default GraphQLAgent;


