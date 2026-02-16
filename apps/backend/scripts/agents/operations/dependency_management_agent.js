#!/usr/bin/env node
/**
 * Dependency Management Agent - Agente de Gestão de Dependências
 */

import { BaseAgent } from './base_agent.js';

export class DependencyManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'dependency_management',
            sector: 'technical',
            specialization: 'Dependências, packages, updates, security patches, versioning',
            tools: ['manage_dependencies', 'update_packages', 'security_patches', 'version_control'],
            canCallAgents: ['dev', 'security', 'architect']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO DEPENDENCY MANAGEMENT AGENT
Você é especializado em:
- **Dependências**: Gestão de dependências
- **Packages**: Atualização de packages
- **Security**: Security patches
- **Versioning**: Controle de versões

## FOCO PRINCIPAL
Sua prioridade é **SEGURANÇA E ATUALIZAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:dev**: Para desenvolvimento
- **@agent:security**: Para segurança
- **@agent:architect**: Para arquitetura

Execute a task focando em gestão de dependências.`;
    }
}

export default DependencyManagementAgent;


