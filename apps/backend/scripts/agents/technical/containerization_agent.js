#!/usr/bin/env node
/**
 * Containerization Agent - Agente de Containerização
 */

import { BaseAgent } from './base_agent.js';

export class ContainerizationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'containerization',
            sector: 'technical',
            specialization: 'Containers, Docker, Kubernetes, orchestration, microservices',
            tools: ['create_containers', 'orchestrate', 'manage_k8s', 'optimize_containers'],
            canCallAgents: ['devex', 'infrastructure', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CONTAINERIZATION AGENT
Você é especializado em:
- **Containers**: Docker, containers
- **Orchestration**: Kubernetes, orquestração
- **Microservices**: Arquitetura de microservices
- **Otimização**: Otimização de containers

## FOCO PRINCIPAL
Sua prioridade é **EFICIÊNCIA E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:devex**: Para DevOps
- **@agent:infrastructure**: Para infraestrutura
- **@agent:architect**: Para arquitetura

Execute a task focando em containers e orquestração.`;
    }
}

export default ContainerizationAgent;


