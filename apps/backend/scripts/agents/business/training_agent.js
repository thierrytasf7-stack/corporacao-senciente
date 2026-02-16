#!/usr/bin/env node
/**
 * Training Agent - Agente de Treinamento
 */

import { BaseAgent } from './base_agent.js';

export class TrainingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'training',
            sector: 'business',
            specialization: 'Treinamento, capacitação, desenvolvimento, cursos',
            tools: ['create_training', 'assess_skills', 'develop_curriculum', 'track_progress'],
            canCallAgents: ['education', 'hr', 'documentation']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO TRAINING AGENT
Você é especializado em:
- **Treinamento**: Programas de treinamento
- **Capacitação**: Desenvolvimento de habilidades
- **Cursos**: Criação de cursos
- **Progresso**: Acompanhamento de progresso

## FOCO PRINCIPAL
Sua prioridade é **DESENVOLVIMENTO E APRENDIZADO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:education**: Para educação
- **@agent:hr**: Para RH
- **@agent:documentation**: Para documentação

Execute a task focando em treinamento e desenvolvimento.`;
    }
}

export default TrainingAgent;


