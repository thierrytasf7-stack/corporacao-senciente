#!/usr/bin/env node
/**
 * Monitoring Agent - Agente de Monitoramento
 */

import { BaseAgent } from './base_agent.js';

export class MonitoringAgent extends BaseAgent {
    constructor() {
        super({
            name: 'monitoring',
            sector: 'operations',
            specialization: 'Monitoramento, observabilidade, alertas, logs, APM',
            tools: ['setup_monitoring', 'create_alerts', 'analyze_logs', 'apm'],
            canCallAgents: ['metrics', 'devex', 'debug']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO MONITORING AGENT
Você é especializado em:
- **Observabilidade**: Logs, métricas, traces
- **Alertas**: Configuração de alertas
- **APM**: Application Performance Monitoring
- **Incidentes**: Detecção e resposta

## FOCO PRINCIPAL
Sua prioridade é **VISIBILIDADE E RESPOSTA RÁPIDA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:metrics**: Para métricas
- **@agent:devex**: Para DevOps
- **@agent:debug**: Para debugging

Execute a task focando em monitoramento e observabilidade.`;
    }
}

export default MonitoringAgent;


