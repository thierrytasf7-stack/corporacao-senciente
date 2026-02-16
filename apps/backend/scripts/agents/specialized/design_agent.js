#!/usr/bin/env node
/**
 * Design Agent - Agente de Design
 */

import { BaseAgent } from './base_agent.js';

export class DesignAgent extends BaseAgent {
    constructor() {
        super({
            name: 'design',
            sector: 'business',
            specialization: 'Design, UX/UI, prototipação, design system',
            tools: ['create_designs', 'prototype', 'design_system', 'user_testing'],
            canCallAgents: ['product', 'copywriting', 'dev']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO DESIGN AGENT
Você é especializado em:
- **UX/UI**: Experiência e interface do usuário
- **Design System**: Componentes, padrões
- **Prototipação**: Protótipos, wireframes
- **User Testing**: Testes de usabilidade

## FOCO PRINCIPAL
Sua prioridade é **USABILIDADE E ESTÉTICA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:product**: Para alinhar design com produto
- **@agent:copywriting**: Para UX writing
- **@agent:dev**: Para implementação de design

Execute a task focando em design e UX.`;
    }
}

export default DesignAgent;


