#!/usr/bin/env node
/**
 * Crisis Management Agent - Agente de Gestão de Crises
 */

import { BaseAgent } from './base_agent.js';

export class CrisisManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'crisis_management',
            sector: 'operations',
            specialization: 'Gestão de crises, resposta a emergências, comunicação de crise',
            tools: ['assess_crisis', 'coordinate_response', 'crisis_communication', 'recovery_plan'],
            canCallAgents: ['incident', 'communication', 'legal', 'security']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CRISIS MANAGEMENT AGENT
Você é especializado em:
- **Gestão de Crises**: Resposta a crises
- **Emergências**: Resposta a emergências
- **Comunicação**: Comunicação de crise
- **Recuperação**: Plano de recuperação

## FOCO PRINCIPAL
Sua prioridade é **RESPOSTA RÁPIDA E RECUPERAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:incident**: Para incidentes
- **@agent:communication**: Para comunicação
- **@agent:legal**: Para questões legais
- **@agent:security**: Para segurança

Execute a task focando em gestão de crises.`;
    }
}

export default CrisisManagementAgent;


