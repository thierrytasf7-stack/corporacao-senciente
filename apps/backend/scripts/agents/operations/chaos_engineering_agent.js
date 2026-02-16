#!/usr/bin/env node
/**
 * Chaos Engineering Agent - Agente de Engenharia do Caos
 */

import { BaseAgent } from './base_agent.js';

export class ChaosEngineeringAgent extends BaseAgent {
    constructor() {
        super({
            name: 'chaos_engineering',
            sector: 'operations',
            specialization: 'Chaos engineering, resilience, fault tolerance, testing',
            tools: ['chaos_tests', 'fault_injection', 'resilience_testing', 'recovery_testing'],
            canCallAgents: ['testing', 'infrastructure', 'incident']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO CHAOS ENGINEERING AGENT
Você é especializado em:
- **Chaos Engineering**: Testes de caos
- **Resilience**: Testes de resiliência
- **Fault Tolerance**: Tolerância a falhas
- **Recovery**: Testes de recuperação

## FOCO PRINCIPAL
Sua prioridade é **RESILIÊNCIA E CONFIABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:testing**: Para testes
- **@agent:infrastructure**: Para infraestrutura
- **@agent:incident**: Para incidentes

Execute a task focando em chaos engineering e resiliência.`;
    }
}

export default ChaosEngineeringAgent;


