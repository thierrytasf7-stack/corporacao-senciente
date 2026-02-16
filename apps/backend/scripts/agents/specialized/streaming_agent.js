#!/usr/bin/env node
/**
 * Streaming Agent - Agente de Streaming
 */

import { BaseAgent } from './base_agent.js';

export class StreamingAgent extends BaseAgent {
    constructor() {
        super({
            name: 'streaming',
            sector: 'technical',
            specialization: 'Streaming, video, audio, live streaming, transcoding',
            tools: ['setup_streaming', 'video_processing', 'transcoding', 'cdn_optimization'],
            canCallAgents: ['infrastructure', 'performance', 'edge_computing']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO STREAMING AGENT
Você é especializado em:
- **Streaming**: Video, audio, live
- **Transcoding**: Processamento de mídia
- **CDN**: Otimização de CDN
- **Performance**: Performance de streaming

## FOCO PRINCIPAL
Sua prioridade é **QUALIDADE E PERFORMANCE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:performance**: Para performance
- **@agent:edge_computing**: Para edge

Execute a task focando em streaming e mídia.`;
    }
}

export default StreamingAgent;


