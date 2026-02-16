#!/usr/bin/env node
/**
 * Backend Agent - Agente Backend
 */

import { BaseAgent } from './base_agent.js';

export class BackendAgent extends BaseAgent {
    constructor() {
        super({
            name: 'backend',
            sector: 'technical',
            specialization: 'Backend, APIs, servidores, microservices, performance',
            tools: ['build_apis', 'optimize_servers', 'microservices', 'caching'],
            canCallAgents: ['architect', 'dev', 'api']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO BACKEND AGENT
Você é especializado em:
- **Backend**: Servidores, APIs
- **Microservices**: Arquitetura de microservices
- **Performance**: Otimização backend
- **Caching**: Estratégias de cache

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:dev**: Para desenvolvimento
- **@agent:api**: Para APIs

Execute a task focando em backend e performance.`;
    }
}

export default BackendAgent;


