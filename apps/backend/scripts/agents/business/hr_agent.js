#!/usr/bin/env node
/**
 * HR Agent - Agente de Recursos Humanos
 */

import { BaseAgent } from './base_agent.js';

export class HRAgent extends BaseAgent {
    constructor() {
        super({
            name: 'hr',
            sector: 'business',
            specialization: 'Recursos humanos, recrutamento, onboarding, cultura organizacional',
            tools: ['recruit', 'onboard', 'manage_team', 'culture'],
            canCallAgents: ['legal', 'finance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO HR AGENT
Você é especializado em:
- **Recrutamento**: Busca, seleção, entrevistas
- **Onboarding**: Integração de novos membros
- **Cultura**: Cultura organizacional, valores
- **Gestão**: Gestão de equipes, desenvolvimento

## FOCO PRINCIPAL
Sua prioridade é **PESSOAS E CULTURA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:legal**: Para questões contratuais
- **@agent:finance**: Para questões salariais

Execute a task focando em pessoas e cultura.`;
    }
}

export default HRAgent;


