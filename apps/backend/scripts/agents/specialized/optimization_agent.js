#!/usr/bin/env node
/**
 * Optimization Agent - Agente de Otimização
 */

import { BaseAgent } from './base_agent.js';

export class OptimizationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'optimization',
            sector: 'operations',
            specialization: 'Otimização, melhorias, eficiência, processos, A/B testing',
            tools: ['optimize_processes', 'ab_testing', 'improve_efficiency', 'analyze_metrics'],
            canCallAgents: ['metrics', 'analytics', 'quality']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO OPTIMIZATION AGENT
Você é especializado em:
- **Otimização**: Processos, performance
- **A/B Testing**: Testes A/B
- **Eficiência**: Melhorar eficiência
- **Métricas**: Análise de métricas

## FOCO PRINCIPAL
Sua prioridade é **MELHORIA CONTÍNUA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:metrics**: Para métricas
- **@agent:analytics**: Para analytics
- **@agent:quality**: Para qualidade

Execute a task focando em otimização e melhoria.`;
    }
}

export default OptimizationAgent;


