#!/usr/bin/env node
/**
 * Frontend Agent - Agente Frontend
 */

import { BaseAgent } from './base_agent.js';

export class FrontendAgent extends BaseAgent {
    constructor() {
        super({
            name: 'frontend',
            sector: 'technical',
            specialization: 'Frontend, React, Vue, Angular, UI, performance',
            tools: ['build_ui', 'optimize_performance', 'responsive_design', 'accessibility'],
            canCallAgents: ['dev', 'design', 'product']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO FRONTEND AGENT
Você é especializado em:
- **Frontend**: React, Vue, Angular
- **UI**: Componentes, design system
- **Performance**: Otimização frontend
- **Acessibilidade**: WCAG, a11y

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E UX**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:design**: Para design
- **@agent:product**: Para produto

Execute a task focando em frontend e UX.`;
    }
}

export default FrontendAgent;


