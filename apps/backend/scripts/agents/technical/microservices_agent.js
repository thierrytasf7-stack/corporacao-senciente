#!/usr/bin/env node
/**
 * Microservices Agent - Agente de Microservices
 */

import { BaseAgent } from './base_agent.js';

export class MicroservicesAgent extends BaseAgent {
    constructor() {
        super({
            name: 'microservices',
            sector: 'technical',
            specialization: 'Microservices, arquitetura, comunicação, service discovery',
            tools: ['design_microservices', 'service_discovery', 'inter_service_comm', 'decompose_monolith'],
            canCallAgents: ['architect', 'api', 'service_mesh']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO MICROSERVICES AGENT
Você é especializado em:
- **Microservices**: Arquitetura de microservices
- **Service Discovery**: Descoberta de serviços
- **Comunicação**: Comunicação entre serviços
- **Decomposição**: Decomposição de monolitos

## FOCO PRINCIPAL
Sua prioridade é **MODULARIDADE E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:api**: Para APIs
- **@agent:service_mesh**: Para service mesh

Execute a task focando em microservices e arquitetura.`;
    }
}

export default MicroservicesAgent;


