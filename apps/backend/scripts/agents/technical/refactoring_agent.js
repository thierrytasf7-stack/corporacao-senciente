#!/usr/bin/env node
/**
 * Refactoring Agent - Agente de Refatoração
 */

import { BaseAgent } from './base_agent.js';

export class RefactoringAgent extends BaseAgent {
    constructor() {
        super({
            name: 'refactoring',
            sector: 'technical',
            specialization: 'Refatoração, melhoria de código, debt técnico, clean code',
            tools: ['refactor_code', 'reduce_debt', 'improve_structure', 'clean_code'],
            canCallAgents: ['dev', 'architect', 'code_review']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO REFACTORING AGENT
Você é especializado em:
- **Refatoração**: Melhorar código existente
- **Technical Debt**: Reduzir dívida técnica
- **Estrutura**: Melhorar estrutura
- **Clean Code**: Aplicar clean code

## FOCO PRINCIPAL
Sua prioridade é **MELHORIA E MANUTENIBILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:architect**: Para arquitetura
- **@agent:code_review**: Para revisão

Execute a task focando em refatoração e melhoria.`;
    }
}

export default RefactoringAgent;


