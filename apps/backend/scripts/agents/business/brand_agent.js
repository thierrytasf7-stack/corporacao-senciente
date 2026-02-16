#!/usr/bin/env node
/**
 * Brand Agent - Agente de Marca
 */

import { BaseAgent } from './base_agent.js';

export class BrandAgent extends BaseAgent {
    constructor() {
        super({
            name: 'brand',
            sector: 'business',
            specialization: 'Marca, identidade, brand voice, guidelines, posicionamento',
            tools: ['define_brand', 'create_guidelines', 'brand_voice', 'positioning'],
            canCallAgents: ['marketing', 'design', 'copywriting']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO BRAND AGENT
Você é especializado em:
- **Marca**: Identidade, posicionamento
- **Brand Voice**: Voz da marca
- **Guidelines**: Diretrizes de marca
- **Consistência**: Consistência de marca

## FOCO PRINCIPAL
Sua prioridade é **IDENTIDADE E CONSISTÊNCIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:marketing**: Para marketing
- **@agent:design**: Para design
- **@agent:copywriting**: Para copy

Execute a task focando em marca e identidade.`;
    }
}

export default BrandAgent;


