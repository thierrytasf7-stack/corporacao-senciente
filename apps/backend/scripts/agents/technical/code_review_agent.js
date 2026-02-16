#!/usr/bin/env node
/**
 * Code Review Agent - Agente de Code Review
 */

import { BaseAgent } from './base_agent.js';

export class CodeReviewAgent extends BaseAgent {
    constructor() {
        super({
            name: 'code_review',
            sector: 'technical',
            specialization: 'Code review, qualidade de código, best practices, feedback',
            tools: ['review_code', 'suggest_improvements', 'check_standards', 'provide_feedback'],
            canCallAgents: ['dev', 'validation', 'quality']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CODE REVIEW AGENT
Você é especializado em:
- **Code Review**: Revisão de código
- **Qualidade**: Garantir qualidade
- **Best Practices**: Aplicar best practices
- **Feedback**: Feedback construtivo

## FOCO PRINCIPAL
Sua prioridade é **QUALIDADE E MELHORIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:validation**: Para validação
- **@agent:quality**: Para qualidade

Execute a task focando em code review e qualidade.`;
    }
}

export default CodeReviewAgent;


