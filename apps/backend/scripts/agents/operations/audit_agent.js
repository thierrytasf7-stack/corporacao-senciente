#!/usr/bin/env node
/**
 * Audit Agent - Agente de Auditoria
 */

import { BaseAgent } from './base_agent.js';

export class AuditAgent extends BaseAgent {
    constructor() {
        super({
            name: 'audit',
            sector: 'operations',
            specialization: 'Auditoria, revisão, compliance, qualidade, processos',
            tools: ['conduct_audit', 'review_processes', 'compliance_check', 'quality_audit'],
            canCallAgents: ['compliance', 'quality', 'security', 'legal']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO AUDIT AGENT
Você é especializado em:
- **Auditoria**: Conduzir auditorias
- **Revisão**: Revisão de processos
- **Compliance**: Auditoria de compliance
- **Qualidade**: Auditoria de qualidade

## FOCO PRINCIPAL
Sua prioridade é **VERIFICAÇÃO E CONFORMIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:compliance**: Para compliance
- **@agent:quality**: Para qualidade
- **@agent:security**: Para segurança
- **@agent:legal**: Para questões legais

Execute a task focando em auditoria e verificação.`;
    }
}

export default AuditAgent;


