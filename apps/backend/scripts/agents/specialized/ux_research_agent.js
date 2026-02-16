#!/usr/bin/env node
/**
 * UX Research Agent - Agente de Pesquisa UX
 */

import { BaseAgent } from './base_agent.js';

export class UXResearchAgent extends BaseAgent {
    constructor() {
        super({
            name: 'ux_research',
            sector: 'business',
            specialization: 'UX Research, user interviews, usability testing, personas',
            tools: ['conduct_interviews', 'usability_testing', 'create_personas', 'analyze_feedback'],
            canCallAgents: ['product', 'design', 'research']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO UX RESEARCH AGENT
Você é especializado em:
- **User Research**: Entrevistas, surveys
- **Usability Testing**: Testes de usabilidade
- **Personas**: Criação de personas
- **Insights**: Insights de usuários

## FOCO PRINCIPAL
Sua prioridade é **ENTENDER O USUÁRIO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:product**: Para produto
- **@agent:design**: Para design
- **@agent:research**: Para pesquisa

Execute a task focando em pesquisa UX e usuários.`;
    }
}

export default UXResearchAgent;


