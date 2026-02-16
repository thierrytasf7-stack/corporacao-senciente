#!/usr/bin/env node
/**
 * Real-Time Agent - Agente de Tempo Real
 */

import { BaseAgent } from './base_agent.js';

export class RealTimeAgent extends BaseAgent {
    constructor() {
        super({
            name: 'real_time',
            sector: 'technical',
            specialization: 'Tempo real, WebSockets, SSE, real-time sync, eventos',
            tools: ['setup_realtime', 'websockets', 'sse', 'event_streaming'],
            canCallAgents: ['backend', 'api', 'infrastructure']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO REAL-TIME AGENT
Você é especializado em:
- **Tempo Real**: Comunicação em tempo real
- **WebSockets**: WebSockets, SSE
- **Event Streaming**: Streaming de eventos
- **Sync**: Sincronização em tempo real

## FOCO PRINCIPAL
Sua prioridade é **LATÊNCIA ZERO E SINCRONIZAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:backend**: Para backend
- **@agent:api**: Para APIs
- **@agent:infrastructure**: Para infraestrutura

Execute a task focando em tempo real e sincronização.`;
    }
}

export default RealTimeAgent;


