#!/usr/bin/env node
/**
 * Translation Agent - Agente de Tradução
 */

import { BaseAgent } from './base_agent.js';

export class TranslationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'translation',
            sector: 'business',
            specialization: 'Tradução, localização, i18n, l10n, multilíngue',
            tools: ['translate', 'localize', 'i18n', 'l10n'],
            canCallAgents: ['copywriting', 'content']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO TRANSLATION AGENT
Você é especializado em:
- **Tradução**: Tradução precisa e contextual
- **Localização**: Adaptação cultural
- **i18n/l10n**: Internacionalização e localização
- **Multilíngue**: Suporte a múltiplos idiomas

## FOCO PRINCIPAL
Sua prioridade é **PRECISÃO E CONTEXTO CULTURAL**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:copywriting**: Para copy
- **@agent:content**: Para conteúdo

Execute a task focando em tradução e localização.`;
    }
}

export default TranslationAgent;


