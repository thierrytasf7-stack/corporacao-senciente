#!/usr/bin/env node
/**
 * Load Testing Agent - Agente de Testes de Carga
 */

import { BaseAgent } from './base_agent.js';

export class LoadTestingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'load_testing',
            sector: 'technical',
            specialization: 'Testes de carga, stress testing, performance, scalability',
            tools: ['load_test', 'stress_test', 'performance_test', 'analyze_results'],
            canCallAgents: ['testing', 'performance', 'infrastructure']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO LOAD TESTING AGENT
Você é especializado em:
- **Load Testing**: Testes de carga
- **Stress Testing**: Testes de stress
- **Performance**: Análise de performance
- **Escalabilidade**: Testes de escalabilidade

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:testing**: Para testes
- **@agent:performance**: Para performance
- **@agent:infrastructure**: Para infraestrutura

Execute a task focando em testes de carga e performance.`;
    }
}

export default LoadTestingAgent;


