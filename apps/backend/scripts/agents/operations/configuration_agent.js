#!/usr/bin/env node
/**
 * Configuration Agent - Agente de Configuração
 */

import { BaseAgent } from './base_agent.js';

export class ConfigurationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'configuration',
            sector: 'operations',
            specialization: 'Configuração, setup, ambiente, variáveis, deployment',
            tools: ['configure_systems', 'setup_environments', 'manage_configs', 'deploy_configs'],
            canCallAgents: ['devex', 'infrastructure', 'security']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CONFIGURATION AGENT
Você é especializado em:
- **Configuração**: Setup de sistemas
- **Ambientes**: Configuração de ambientes
- **Variáveis**: Gestão de variáveis
- **Deployment**: Configuração de deployment

## FOCO PRINCIPAL
Sua prioridade é **CONFIGURAÇÃO CORRETA E SEGURA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:devex**: Para DevOps
- **@agent:infrastructure**: Para infraestrutura
- **@agent:security**: Para segurança

Execute a task focando em configuração e setup.`;
    }
}

export default ConfigurationAgent;


