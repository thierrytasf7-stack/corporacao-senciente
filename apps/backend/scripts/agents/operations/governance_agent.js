#!/usr/bin/env node
/**
 * Governance Agent - Agente de Governança
 */

import { BaseAgent } from './base_agent.js';

export class GovernanceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'governance',
            sector: 'operations',
            specialization: 'Governança, políticas, processos, compliance, auditoria',
            tools: ['define_policies', 'create_processes', 'audit_governance', 'enforce_standards'],
            canCallAgents: ['compliance', 'legal', 'quality', 'risk']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO GOVERNANCE AGENT
Você é especializado em:
- **Governança**: Estrutura de governança
- **Políticas**: Definição de políticas
- **Processos**: Criação de processos
- **Auditoria**: Auditoria de governança

## FOCO PRINCIPAL
Sua prioridade é **ESTRUTURA E CONFORMIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:compliance**: Para compliance
- **@agent:legal**: Para questões legais
- **@agent:quality**: Para qualidade
- **@agent:risk**: Para riscos

Execute a task focando em governança e estrutura.`;
    }
}

export default GovernanceAgent;


