#!/usr/bin/env node
/**
 * Serverless Agent - Agente de Serverless
 */

import { BaseAgent } from './base_agent.js';

export class ServerlessAgent extends BaseAgent {
    constructor() {
        super({
            name: 'serverless',
            sector: 'technical',
            specialization: 'Serverless, functions, Lambda, FaaS, cold starts, optimization',
            tools: ['deploy_functions', 'optimize_cold_starts', 'manage_serverless', 'cost_optimization'],
            canCallAgents: ['cloud', 'devex', 'cost_optimization']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SERVERLESS AGENT
Você é especializado em:
- **Serverless**: Functions, FaaS
- **Lambda**: AWS Lambda, Azure Functions
- **Cold Starts**: Otimização de cold starts
- **Custos**: Otimização de custos

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E CUSTOS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:cloud**: Para cloud
- **@agent:devex**: Para DevOps
- **@agent:cost_optimization**: Para custos

Execute a task focando em serverless e eficiência.`;
    }
}

export default ServerlessAgent;


