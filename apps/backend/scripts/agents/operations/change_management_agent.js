#!/usr/bin/env node
/**
 * Change Management Agent - Agente de Gestão de Mudanças
 */

import { BaseAgent } from './base_agent.js';

export class ChangeManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'change_management',
            sector: 'operations',
            specialization: 'Gestão de mudanças, releases, deployment, versionamento',
            tools: ['plan_changes', 'coordinate_releases', 'manage_deployments', 'version_control'],
            canCallAgents: ['devex', 'quality', 'security']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CHANGE MANAGEMENT AGENT
Você é especializado em:
- **Gestão de Mudanças**: Planejamento de mudanças
- **Releases**: Coordenação de releases
- **Deployment**: Gestão de deployments
- **Versionamento**: Controle de versões

## FOCO PRINCIPAL
Sua prioridade é **CONTROLE E ESTABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:devex**: Para DevOps
- **@agent:quality**: Para qualidade
- **@agent:security**: Para segurança

Execute a task focando em gestão de mudanças e releases.`;
    }
}

export default ChangeManagementAgent;


