#!/usr/bin/env node
/**
 * Observability Agent - Agente de Observabilidade
 */

import { BaseAgent } from './base_agent.js';

export class ObservabilityAgent extends BaseAgent {
    constructor() {
        super({
            name: 'observability',
            sector: 'operations',
            specialization: 'Observabilidade, logs, métricas, traces, APM, debugging',
            tools: ['setup_observability', 'analyze_logs', 'metrics_traces', 'apm'],
            canCallAgents: ['monitoring', 'debug', 'metrics']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO OBSERVABILITY AGENT
Você é especializado em:
- **Observabilidade**: Logs, métricas, traces
- **APM**: Application Performance Monitoring
- **Debugging**: Debugging via observabilidade
- **Análise**: Análise de dados de observabilidade

## FOCO PRINCIPAL
Sua prioridade é **VISIBILIDADE E DEBUGGING**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:monitoring**: Para monitoramento
- **@agent:debug**: Para debugging
- **@agent:metrics**: Para métricas

Execute a task focando em observabilidade e visibilidade.`;
    }
}

export default ObservabilityAgent;


