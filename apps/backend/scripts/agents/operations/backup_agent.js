#!/usr/bin/env node
/**
 * Backup Agent - Agente de Backup
 */

import { BaseAgent } from './base_agent.js';

export class BackupAgent extends BaseAgent {
    constructor() {
        super({
            name: 'backup',
            sector: 'operations',
            specialization: 'Backup, restore, disaster recovery, data protection',
            tools: ['create_backups', 'restore_data', 'disaster_recovery', 'verify_backups'],
            canCallAgents: ['infrastructure', 'security', 'database']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO BACKUP AGENT
Você é especializado em:
- **Backup**: Criação de backups
- **Restore**: Restauração de dados
- **Disaster Recovery**: Recuperação de desastres
- **Proteção**: Proteção de dados

## FOCO PRINCIPAL
Sua prioridade é **PROTEÇÃO E RECUPERAÇÃO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:infrastructure**: Para infraestrutura
- **@agent:security**: Para segurança
- **@agent:database**: Para banco de dados

Execute a task focando em backup e proteção de dados.`;
    }
}

export default BackupAgent;


