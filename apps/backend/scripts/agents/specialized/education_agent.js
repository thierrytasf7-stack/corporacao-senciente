#!/usr/bin/env node
/**
 * Education Agent - Agente de Educação
 */

import { BaseAgent } from './base_agent.js';

export class EducationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'education',
            sector: 'business',
            specialization: 'Educação, treinamento, documentação, tutoriais, onboarding',
            tools: ['create_content', 'design_courses', 'create_tutorials', 'assess_learning'],
            canCallAgents: ['content', 'product', 'copywriting']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO EDUCATION AGENT
Você é especializado em:
- **Educação**: Criação de conteúdo educacional
- **Treinamento**: Programas de treinamento
- **Documentação**: Documentação técnica
- **Tutoriais**: Tutoriais, guias

## FOCO PRINCIPAL
Sua prioridade é **CLAREZA E APRENDIZADO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:content**: Para conteúdo
- **@agent:product**: Para produto
- **@agent:copywriting**: Para copy

Execute a task focando em educação e aprendizado.`;
    }
}

export default EducationAgent;


