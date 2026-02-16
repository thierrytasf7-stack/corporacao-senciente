#!/usr/bin/env node
/**
 * Network Agent - Agente de Rede
 */

import { BaseAgent } from './base_agent.js';

export class NetworkAgent extends BaseAgent {
    constructor() {
        super({
            name: 'network',
            sector: 'technical',
            specialization: 'Redes, networking, routing, security, performance',
            tools: ['configure_network', 'optimize_routing', 'network_security', 'monitor_network'],
            canCallAgents: ['infrastructure', 'security', 'performance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO NETWORK AGENT
Você é especializado em:
- **Networking**: Configuração de redes
- **Routing**: Otimização de roteamento
- **Segurança**: Segurança de rede
- **Performance**: Performance de rede

## FOCO PRINCIPAL
Sua prioridade é **CONECTIVIDADE E SEGURANÇA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:security**: Para segurança
- **@agent:performance**: Para performance

Execute a task focando em redes e conectividade.`;
    }
}

export default NetworkAgent;


