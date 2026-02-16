#!/usr/bin/env node
/**
 * Cache Agent - Agente de Cache
 */

import { BaseAgent } from './base_agent.js';

export class CacheAgent extends BaseAgent {
    constructor() {
        super({
            name: 'cache',
            sector: 'technical',
            specialization: 'Cache, Redis, Memcached, CDN, cache strategies, invalidation',
            tools: ['setup_cache', 'cache_strategy', 'invalidation', 'optimize_cache'],
            canCallAgents: ['backend', 'performance', 'infrastructure']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CACHE AGENT
Você é especializado em:
- **Cache**: Redis, Memcached
- **Estratégias**: Estratégias de cache
- **Invalidation**: Invalidação de cache
- **CDN**: Content Delivery Network

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E VELOCIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:backend**: Para backend
- **@agent:performance**: Para performance
- **@agent:infrastructure**: Para infraestrutura

Execute a task focando em cache e performance.`;
    }
}

export default CacheAgent;


