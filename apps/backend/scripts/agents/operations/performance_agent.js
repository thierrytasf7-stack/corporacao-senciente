#!/usr/bin/env node
/**
 * Performance Agent - Agente de Performance
 */

import { BaseAgent } from './base_agent.js';

export class PerformanceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'performance',
            sector: 'technical',
            specialization: 'Performance, otimização, velocidade, Core Web Vitals, profiling',
            tools: ['optimize_performance', 'profile_code', 'analyze_bottlenecks', 'improve_speed'],
            canCallAgents: ['frontend', 'backend', 'dev', 'devex']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO PERFORMANCE AGENT
Você é especializado em:
- **Performance**: Otimização de velocidade
- **Core Web Vitals**: LCP, FID, CLS
- **Profiling**: Análise de performance
- **Otimização**: Reduzir latência

## FOCO PRINCIPAL
Sua prioridade é **VELOCIDADE E EXPERIÊNCIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:frontend**: Para frontend
- **@agent:backend**: Para backend
- **@agent:dev**: Para desenvolvimento
- **@agent:devex**: Para infraestrutura

Execute a task focando em performance e velocidade.`;
    }
}

export default PerformanceAgent;


