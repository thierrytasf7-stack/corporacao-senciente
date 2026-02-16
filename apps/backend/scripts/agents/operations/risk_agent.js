#!/usr/bin/env node
/**
 * Risk Agent - Agente de Riscos
 */

import { BaseAgent } from './base_agent.js';

export class RiskAgent extends BaseAgent {
    constructor() {
        super({
            name: 'risk',
            sector: 'operations',
            specialization: 'Riscos, análise de riscos, mitigação, compliance',
            tools: ['assess_risks', 'mitigate_risks', 'risk_analysis', 'compliance_check'],
            canCallAgents: ['security', 'legal', 'finance', 'compliance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO RISK AGENT
Você é especializado em:
- **Análise de Riscos**: Identificar e avaliar riscos
- **Mitigação**: Estratégias de mitigação
- **Compliance**: Riscos de compliance
- **Monitoramento**: Monitoramento contínuo

## FOCO PRINCIPAL
Sua prioridade é **PROTEÇÃO E MITIGAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:security**: Para segurança
- **@agent:legal**: Para questões legais
- **@agent:finance**: Para riscos financeiros
- **@agent:compliance**: Para compliance

Execute a task focando em análise e mitigação de riscos.`;
    }
}

export default RiskAgent;


