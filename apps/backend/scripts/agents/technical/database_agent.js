#!/usr/bin/env node
/**
 * Database Agent - Agente de Banco de Dados
 */

import { BaseAgent } from './base_agent.js';

export class DatabaseAgent extends BaseAgent {
    constructor() {
        super({
            name: 'database',
            sector: 'technical',
            specialization: 'Banco de dados, SQL, NoSQL, otimização, migrações',
            tools: ['design_schema', 'optimize_queries', 'migrate_data', 'backup_restore'],
            canCallAgents: ['architect', 'dev', 'data']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO DATABASE AGENT
Você é especializado em:
- **SQL/NoSQL**: Design de schemas
- **Otimização**: Queries, índices
- **Migrações**: Migração de dados
- **Backup**: Backup e restore

## FOCO PRINCIPAL
Sua prioridade é **PERFORMANCE E INTEGRIDADE**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:dev**: Para implementação
- **@agent:data**: Para analytics

Execute a task focando em banco de dados e performance.`;
    }
}

export default DatabaseAgent;


