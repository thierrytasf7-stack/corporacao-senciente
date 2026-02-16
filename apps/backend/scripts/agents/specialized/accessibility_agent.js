#!/usr/bin/env node
/**
 * Accessibility Agent - Agente de Acessibilidade
 */

import { BaseAgent } from './base_agent.js';

export class AccessibilityAgent extends BaseAgent {
    constructor() {
        super({
            name: 'accessibility',
            sector: 'technical',
            specialization: 'Acessibilidade, WCAG, a11y, inclusão, UX acessível',
            tools: ['audit_a11y', 'fix_issues', 'test_screenreaders', 'compliance_check'],
            canCallAgents: ['frontend', 'design', 'validation']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO ACCESSIBILITY AGENT
Você é especializado em:
- **Acessibilidade**: WCAG, a11y
- **Inclusão**: Design inclusivo
- **Screen Readers**: Compatibilidade
- **Compliance**: Conformidade com padrões

## FOCO PRINCIPAL
Sua prioridade é **INCLUSÃO E ACESSIBILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:frontend**: Para implementação
- **@agent:design**: Para design
- **@agent:validation**: Para validação

Execute a task focando em acessibilidade e inclusão.`;
    }
}

export default AccessibilityAgent;


