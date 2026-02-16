#!/usr/bin/env node
/**
 * User Onboarding Agent - Agente de Onboarding de Usuários
 */

import { BaseAgent } from './base_agent.js';

export class UserOnboardingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'user_onboarding',
            sector: 'business',
            specialization: 'Onboarding de usuários, primeira experiência, ativação, engagement',
            tools: ['design_onboarding', 'create_flows', 'activate_users', 'measure_success'],
            canCallAgents: ['product', 'design', 'customer_success']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO USER ONBOARDING AGENT
Você é especializado em:
- **Onboarding**: Experiência de onboarding
- **Primeira Experiência**: Primeira impressão
- **Ativação**: Ativar usuários
- **Engagement**: Engajamento inicial

## FOCO PRINCIPAL
Sua prioridade é **ATIVAÇÃO E ENGAGEMENT**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:product**: Para produto
- **@agent:design**: Para design
- **@agent:customer_success**: Para customer success

Execute a task focando em onboarding e ativação.`;
    }
}

export default UserOnboardingAgent;


