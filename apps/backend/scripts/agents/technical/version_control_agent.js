#!/usr/bin/env node
/**
 * Version Control Agent - Agente de Controle de Versão
 */

import { BaseAgent } from './base_agent.js';

export class VersionControlAgent extends BaseAgent {
    constructor() {
        super({
            name: 'version_control',
            sector: 'technical',
            specialization: 'Controle de versão, Git, branching, merges, releases',
            tools: ['manage_branches', 'coordinate_merges', 'tag_releases', 'git_workflow'],
            canCallAgents: ['dev', 'devex', 'quality']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO VERSION CONTROL AGENT
Você é especializado em:
- **Git**: Controle de versão
- **Branching**: Estratégias de branching
- **Merges**: Coordenação de merges
- **Releases**: Tagging e releases

## FOCO PRINCIPAL
Sua prioridade é **ORGANIZAÇÃO E CONTROLE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:devex**: Para DevOps
- **@agent:quality**: Para qualidade

Execute a task focando em controle de versão.`;
    }
}

export default VersionControlAgent;


