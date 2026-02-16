#!/usr/bin/env node
/**
 * Regulatory Agent - Agente Regulatório
 */

import { BaseAgent } from './base_agent.js';

export class RegulatoryAgent extends BaseAgent {
    constructor() {
        super({
            name: 'regulatory',
            sector: 'operations',
            specialization: 'Regulamentações, compliance regulatório, licenças, certificações',
            tools: ['check_regulations', 'compliance_audit', 'licenses', 'certifications'],
            canCallAgents: ['legal', 'compliance', 'security']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO REGULATORY AGENT
Você é especializado em:
- **Regulamentações**: Conformidade regulatória
- **Licenças**: Gestão de licenças
- **Certificações**: Certificações necessárias
- **Auditoria**: Auditoria regulatória

## FOCO PRINCIPAL
Sua prioridade é **CONFORMIDADE REGULATÓRIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:legal**: Para questões legais
- **@agent:compliance**: Para compliance
- **@agent:security**: Para segurança

Execute a task focando em conformidade regulatória.`;
    }
}

export default RegulatoryAgent;


