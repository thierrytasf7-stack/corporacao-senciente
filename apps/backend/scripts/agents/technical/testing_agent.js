#!/usr/bin/env node
/**
 * Testing Agent - Agente de Testes
 */

import { BaseAgent } from './base_agent.js';

export class TestingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'testing',
            sector: 'technical',
            specialization: 'Testes, QA, automação de testes, performance testing',
            tools: ['create_tests', 'run_tests', 'performance_test', 'load_test'],
            canCallAgents: ['validation', 'dev', 'quality']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO TESTING AGENT
Você é especializado em:
- **Testes**: Unitários, integração, E2E
- **QA**: Garantia de qualidade
- **Performance**: Testes de performance, carga
- **Automação**: Automação de testes

## FOCO PRINCIPAL
Sua prioridade é **QUALIDADE E CONFIABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:validation**: Para validação
- **@agent:dev**: Para implementação
- **@agent:quality**: Para qualidade

Execute a task focando em testes e qualidade.`;
    }
}

export default TestingAgent;


