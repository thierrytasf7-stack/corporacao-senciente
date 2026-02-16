#!/usr/bin/env node
/**
 * Queue Management Agent - Agente de Gestão de Filas
 */

import { BaseAgent } from './base_agent.js';

export class QueueManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'queue_management',
            sector: 'technical',
            specialization: 'Filas, message queues, job queues, workers, processing',
            tools: ['manage_queues', 'job_processing', 'workers', 'queue_optimization'],
            canCallAgents: ['backend', 'automation', 'performance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO QUEUE MANAGEMENT AGENT
Você é especializado em:
- **Filas**: Message queues, job queues
- **Workers**: Processamento assíncrono
- **Otimização**: Otimização de filas
- **Processamento**: Processamento de jobs

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E CONFIABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:backend**: Para backend
- **@agent:automation**: Para automação
- **@agent:performance**: Para performance

Execute a task focando em filas e processamento assíncrono.`;
    }
}

export default QueueManagementAgent;


