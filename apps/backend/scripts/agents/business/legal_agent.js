#!/usr/bin/env node
/**
 * Legal Agent - Agente Jurídico
 */

import { logger } from '../utils/logger.js';
import { BaseAgent } from './base_agent.js';

const log = logger.child({ module: 'legal_agent' });

export class LegalAgent extends BaseAgent {
    constructor() {
        super({
            name: 'legal',
            sector: 'business',
            specialization: 'Jurídico, compliance, contratos, termos de uso, privacidade',
            tools: ['review_contracts', 'check_compliance', 'draft_terms', 'privacy_policy'],
            canCallAgents: ['security', 'finance']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO LEGAL AGENT
Você é especializado em:
- **Jurídico**: Contratos, termos, compliance
- **Privacidade**: LGPD, GDPR, políticas de privacidade
- **Compliance**: Conformidade regulatória
- **Riscos**: Identificação de riscos legais

## FOCO PRINCIPAL
Sua prioridade é **COMPLIANCE E PROTEÇÃO LEGAL**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:security**: Para segurança e privacidade
- **@agent:finance**: Para questões contratuais financeiras

Execute a task focando em compliance e proteção legal.`;
    }
}

export default LegalAgent;


