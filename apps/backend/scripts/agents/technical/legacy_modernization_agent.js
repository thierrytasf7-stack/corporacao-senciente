#!/usr/bin/env node
/**
 * Legacy Modernization Agent - Agente de Modernização de Legacy
 */

import { BaseAgent } from './base_agent.js';

export class LegacyModernizationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'legacy_modernization',
            sector: 'technical',
            specialization: 'Modernização de legacy, migração, refatoração, atualização',
            tools: ['analyze_legacy', 'plan_migration', 'modernize_code', 'update_systems'],
            canCallAgents: ['architect', 'refactoring', 'dev']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO LEGACY MODERNIZATION AGENT
Você é especializado em:
- **Legacy**: Análise de sistemas legacy
- **Migração**: Migração para tecnologias modernas
- **Modernização**: Modernização de código
- **Atualização**: Atualização de sistemas

## FOCO PRINCIPAL
Sua prioridade é **MODERNIZAÇÃO E MANUTENIBILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:refactoring**: Para refatoração
- **@agent:dev**: Para desenvolvimento

Execute a task focando em modernização de legacy.`;
    }
}

export default LegacyModernizationAgent;


