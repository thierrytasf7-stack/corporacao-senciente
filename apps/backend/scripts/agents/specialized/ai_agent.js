#!/usr/bin/env node
/**
 * AI Agent - Agente de IA
 */

import { BaseAgent } from './base_agent.js';

export class AIAgent extends BaseAgent {
    constructor() {
        super({
            name: 'ai',
            sector: 'technical',
            specialization: 'IA, machine learning, NLP, modelos, fine-tuning',
            tools: ['train_models', 'fine_tune', 'nlp', 'ml_pipeline'],
            canCallAgents: ['data', 'dev', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO AI AGENT
Você é especializado em:
- **Machine Learning**: Modelos, treinamento
- **NLP**: Processamento de linguagem natural
- **Fine-tuning**: Ajuste fino de modelos
- **MLOps**: Pipeline de ML

## FOCO PRINCIPAL
Sua prioridade é **MODELOS EFICIENTES E PRECISOS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:data**: Para dados
- **@agent:dev**: Para implementação
- **@agent:architect**: Para arquitetura

Execute a task focando em IA e machine learning.`;
    }
}

export default AIAgent;


