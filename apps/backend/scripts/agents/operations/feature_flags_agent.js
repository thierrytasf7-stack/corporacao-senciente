#!/usr/bin/env node
/**
 * Feature Flags Agent - Agente de Feature Flags
 */

import { BaseAgent } from './base_agent.js';

export class FeatureFlagsAgent extends BaseAgent {
    constructor() {
        super({
            name: 'feature_flags',
            sector: 'technical',
            specialization: 'Feature flags, feature toggles, gradual rollout, A/B testing',
            tools: ['manage_flags', 'gradual_rollout', 'ab_testing', 'feature_control'],
            canCallAgents: ['dev', 'product', 'analytics']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO FEATURE FLAGS AGENT
Você é especializado em:
- **Feature Flags**: Gestão de feature flags
- **Gradual Rollout**: Rollout gradual
- **A/B Testing**: Testes A/B
- **Controle**: Controle de features

## FOCO PRINCIPAL
Sua prioridade é **CONTROLE E SEGURANÇA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:product**: Para produto
- **@agent:analytics**: Para analytics

Execute a task focando em feature flags e controle.`;
    }
}

export default FeatureFlagsAgent;


