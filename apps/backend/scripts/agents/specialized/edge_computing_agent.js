#!/usr/bin/env node
/**
 * Edge Computing Agent - Agente de Edge Computing
 */

import { BaseAgent } from './base_agent.js';

export class EdgeComputingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'edge_computing',
            sector: 'technical',
            specialization: 'Edge computing, CDN, edge functions, latency, distributed',
            tools: ['deploy_edge', 'optimize_cdn', 'edge_functions', 'reduce_latency'],
            canCallAgents: ['infrastructure', 'performance', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO EDGE COMPUTING AGENT
Você é especializado em:
- **Edge Computing**: Computação na borda
- **CDN**: Content Delivery Network
- **Edge Functions**: Funções na borda
- **Latência**: Reduzir latência

## FOCO PRINCIPAL
Sua prioridade é **LATÊNCIA E PERFORMANCE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:performance**: Para performance
- **@agent:architect**: Para arquitetura

Execute a task focando em edge computing e latência.`;
    }
}

export default EdgeComputingAgent;


