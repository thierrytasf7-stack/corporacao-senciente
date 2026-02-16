#!/usr/bin/env node
/**
 * Mobile Agent - Agente Mobile
 */

import { BaseAgent } from './base_agent.js';

export class MobileAgent extends BaseAgent {
    constructor() {
        super({
            name: 'mobile',
            sector: 'technical',
            specialization: 'Mobile, iOS, Android, React Native, Flutter',
            tools: ['develop_mobile', 'optimize_performance', 'app_store', 'push_notifications'],
            canCallAgents: ['dev', 'design', 'product']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO MOBILE AGENT
Você é especializado em:
- **Mobile Development**: iOS, Android
- **Frameworks**: React Native, Flutter
- **Performance**: Otimização mobile
- **App Stores**: Publicação, ASO

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E UX MOBILE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:design**: Para design
- **@agent:product**: Para produto

Execute a task focando em mobile e apps.`;
    }
}

export default MobileAgent;


