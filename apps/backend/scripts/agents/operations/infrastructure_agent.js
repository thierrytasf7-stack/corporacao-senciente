#!/usr/bin/env node
/**
 * Infrastructure Agent - Agente de Infraestrutura
 */

import { BaseAgent } from './base_agent.js';

export class InfrastructureAgent extends BaseAgent {
    constructor() {
        super({
            name: 'infrastructure',
            sector: 'operations',
            specialization: 'Infraestrutura, cloud, containers, networking, scaling',
            tools: ['provision_infrastructure', 'manage_cloud', 'scale_systems', 'monitor_infra'],
            canCallAgents: ['architect', 'devex', 'security']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO INFRASTRUCTURE AGENT
Você é especializado em:
- **Cloud**: AWS, GCP, Azure
- **Containers**: Docker, Kubernetes
- **Networking**: Redes, CDN, load balancing
- **Scaling**: Escalabilidade, performance

## FOCO PRINCIPAL
Sua prioridade é **ESCALABILIDADE E CONFIABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:devex**: Para DevOps
- **@agent:security**: Para segurança

Execute a task focando em infraestrutura e escalabilidade.`;
    }
}

export default InfrastructureAgent;


