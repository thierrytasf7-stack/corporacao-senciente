#!/usr/bin/env node
/**
 * Competitive Analysis Agent - Agente de Análise Competitiva
 */

import { BaseAgent } from './base_agent.js';

export class CompetitiveAnalysisAgent extends BaseAgent {
    constructor() {
        super({
            name: 'competitive_analysis',
            sector: 'business',
            specialization: 'Análise competitiva, competidores, mercado, posicionamento',
            tools: ['analyze_competitors', 'market_research', 'positioning', 'swot_analysis'],
            canCallAgents: ['research', 'strategy', 'marketing']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO COMPETITIVE ANALYSIS AGENT
Você é especializado em:
- **Análise Competitiva**: Análise de concorrentes
- **Mercado**: Pesquisa de mercado
- **Posicionamento**: Posicionamento competitivo
- **SWOT**: Análise SWOT

## FOCO PRINCIPAL
Sua prioridade é **VANTAGEM COMPETITIVA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:research**: Para pesquisa
- **@agent:strategy**: Para estratégia
- **@agent:marketing**: Para marketing

Execute a task focando em análise competitiva.`;
    }
}

export default CompetitiveAnalysisAgent;


