#!/usr/bin/env node
/**
 * Cloud Agent - Agente de Cloud
 */

import { BaseAgent } from './base_agent.js';

export class CloudAgent extends BaseAgent {
    constructor() {
        super({
            name: 'cloud',
            sector: 'technical',
            specialization: 'Cloud, AWS, GCP, Azure, cloud architecture, migration',
            tools: ['provision_cloud', 'migrate_to_cloud', 'optimize_cloud', 'manage_resources'],
            canCallAgents: ['infrastructure', 'architect', 'cost_optimization']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CLOUD AGENT
Você é especializado em:
- **Cloud**: AWS, GCP, Azure
- **Arquitetura**: Arquitetura cloud
- **Migração**: Migração para cloud
- **Otimização**: Otimização de cloud

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:architect**: Para arquitetura
- **@agent:cost_optimization**: Para custos

Execute a task focando em cloud e escalabilidade.`;
    }
}

export default CloudAgent;


