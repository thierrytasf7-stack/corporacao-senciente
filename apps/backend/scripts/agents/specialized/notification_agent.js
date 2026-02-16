#!/usr/bin/env node
/**
 * Notification Agent - Agente de Notificações
 */

import { BaseAgent } from './base_agent.js';

export class NotificationAgent extends BaseAgent {
    constructor() {
        super({
            name: 'notification',
            sector: 'technical',
            specialization: 'Notificações, push, email, SMS, in-app, delivery',
            tools: ['send_notifications', 'push_notifications', 'email_sms', 'delivery_tracking'],
            canCallAgents: ['backend', 'email', 'mobile']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO NOTIFICATION AGENT
Você é especializado em:
- **Notificações**: Push, email, SMS, in-app
- **Delivery**: Rastreamento de entrega
- **Segmentação**: Segmentação de notificações
- **Engagement**: Aumentar engagement

## FOCO PRINCIPAL
Sua prioridade é **ENTREGA E ENGAGEMENT**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:backend**: Para backend
- **@agent:email**: Para email
- **@agent:mobile**: Para mobile

Execute a task focando em notificações e engagement.`;
    }
}

export default NotificationAgent;


