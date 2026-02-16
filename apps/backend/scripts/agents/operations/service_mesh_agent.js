#!/usr/bin/env node
/**
 * Service Mesh Agent - Agente de Service Mesh
 */

import { BaseAgent } from './base_agent.js';

export class ServiceMeshAgent extends BaseAgent {
    constructor() {
        super({
            name: 'service_mesh',
            sector: 'technical',
            specialization: 'Service mesh, Istio, Linkerd, microservices, networking',
            tools: ['configure_mesh', 'manage_services', 'traffic_management', 'security_policies'],
            canCallAgents: ['architect', 'infrastructure', 'network']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SERVICE MESH AGENT
Você é especializado em:
- **Service Mesh**: Istio, Linkerd
- **Microservices**: Arquitetura de microservices
- **Networking**: Networking entre serviços
- **Segurança**: Políticas de segurança

## FOCO PRINCIPAL
Sua prioridade é **COMUNICAÇÃO E SEGURANÇA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:infrastructure**: Para infraestrutura
- **@agent:network**: Para rede

Execute a task focando em service mesh e microservices.`;
    }
}

export default ServiceMeshAgent;


