#!/usr/bin/env node
/**
 * Incident Agent - Agente de Incidentes
 */

import { BaseAgent } from './base_agent.js';

export class IncidentAgent extends BaseAgent {
    constructor() {
        super({
            name: 'incident',
            sector: 'operations',
            specialization: 'Incidentes, incident response, troubleshooting, resolution',
            tools: ['respond_incidents', 'troubleshoot', 'coordinate_response', 'post_mortem'],
            canCallAgents: ['debug', 'monitoring', 'security', 'devex']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO INCIDENT AGENT
Você é especializado em:
- **Incident Response**: Resposta a incidentes
- **Troubleshooting**: Diagnóstico de problemas
- **Coordenação**: Coordenar resposta
- **Post-Mortem**: Análise pós-incidente

## FOCO PRINCIPAL
Sua prioridade é **RESOLUÇÃO RÁPIDA E APRENDIZADO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:debug**: Para debugging
- **@agent:monitoring**: Para monitoramento
- **@agent:security**: Para segurança
- **@agent:devex**: Para DevOps

Execute a task focando em resposta e resolução de incidentes.`;
    }
}

export default IncidentAgent;


