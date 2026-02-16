#!/usr/bin/env node
/**
 * Event-Driven Agent - Agente de Arquitetura Event-Driven
 */

import { BaseAgent } from './base_agent.js';

export class EventDrivenAgent extends BaseAgent {
    constructor() {
        super({
            name: 'event_driven',
            sector: 'technical',
            specialization: 'Arquitetura event-driven, eventos, pub/sub, message queues',
            tools: ['design_events', 'pub_sub', 'message_queues', 'event_sourcing'],
            canCallAgents: ['architect', 'backend', 'real_time']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO EVENT-DRIVEN AGENT
Você é especializado em:
- **Event-Driven**: Arquitetura baseada em eventos
- **Pub/Sub**: Publish/Subscribe
- **Message Queues**: Filas de mensagens
- **Event Sourcing**: Event sourcing

## FOCO PRINCIPAL
Sua prioridade é **DESACOPLAMENTO E ESCALABILIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:backend**: Para backend
- **@agent:real_time**: Para tempo real

Execute a task focando em arquitetura event-driven.`;
    }
}

export default EventDrivenAgent;


