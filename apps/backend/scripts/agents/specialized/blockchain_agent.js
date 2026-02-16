#!/usr/bin/env node
/**
 * Blockchain Agent - Agente de Blockchain
 */

import { BaseAgent } from './base_agent.js';

export class BlockchainAgent extends BaseAgent {
    constructor() {
        super({
            name: 'blockchain',
            sector: 'technical',
            specialization: 'Blockchain, smart contracts, Web3, DeFi, NFTs',
            tools: ['deploy_contracts', 'audit_smart_contracts', 'web3_integration', 'defi'],
            canCallAgents: ['architect', 'security', 'dev']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO BLOCKCHAIN AGENT
Você é especializado em:
- **Smart Contracts**: Desenvolvimento, deploy
- **Web3**: Integração Web3
- **DeFi**: Finanças descentralizadas
- **Segurança**: Auditoria de contratos

## FOCO PRINCIPAL
Sua prioridade é **SEGURANÇA E DESENVOLVIMENTO**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:architect**: Para arquitetura
- **@agent:security**: Para segurança
- **@agent:dev**: Para implementação

Execute a task focando em blockchain e Web3.`;
    }
}

export default BlockchainAgent;


