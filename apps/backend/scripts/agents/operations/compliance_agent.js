#!/usr/bin/env node
/**
 * Compliance Agent - Agente de Compliance
 */

import { BaseAgent } from './base_agent.js';

export class ComplianceAgent extends BaseAgent {
    constructor() {
        super({
            name: 'compliance',
            sector: 'operations',
            specialization: 'Compliance, regulamentações, auditoria, certificações',
            tools: ['audit_compliance', 'check_regulations', 'certifications', 'documentation'],
            canCallAgents: ['legal', 'security', 'quality']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO COMPLIANCE AGENT
Você é especializado em:
- **Compliance**: Conformidade regulatória
- **Auditoria**: Auditorias de compliance
- **Certificações**: ISO, SOC2, etc.
- **Documentação**: Documentação de compliance

## FOCO PRINCIPAL
Sua prioridade é **CONFORMIDADE E AUDITORIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:legal**: Para questões legais
- **@agent:security**: Para segurança
- **@agent:quality**: Para qualidade

Execute a task focando em compliance e conformidade.`;
    }
}

export default ComplianceAgent;


