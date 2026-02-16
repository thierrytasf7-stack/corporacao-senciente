#!/usr/bin/env node
/**
 * Security Audit Agent - Agente de Auditoria de Segurança
 */

import { BaseAgent } from './base_agent.js';

export class SecurityAuditAgent extends BaseAgent {
    constructor() {
        super({
            name: 'security_audit',
            sector: 'operations',
            specialization: 'Auditoria de segurança, pentesting, vulnerabilidades, compliance',
            tools: ['security_audit', 'pentest', 'vulnerability_scan', 'compliance_check'],
            canCallAgents: ['security', 'compliance', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO SECURITY AUDIT AGENT
Você é especializado em:
- **Auditoria**: Auditoria de segurança
- **Pentesting**: Testes de penetração
- **Vulnerabilidades**: Identificar vulnerabilidades
- **Compliance**: Compliance de segurança

## FOCO PRINCIPAL
Sua prioridade é **SEGURANÇA E PROTEÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:security**: Para segurança
- **@agent:compliance**: Para compliance
- **@agent:architect**: Para arquitetura

Execute a task focando em auditoria de segurança.`;
    }
}

export default SecurityAuditAgent;


