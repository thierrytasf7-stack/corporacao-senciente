#!/usr/bin/env node
/**
 * Procurement Agent - Agente de Compras
 */

import { BaseAgent } from './base_agent.js';

export class ProcurementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'procurement',
            sector: 'business',
            specialization: 'Compras, aquisições, sourcing, negociação, supply chain',
            tools: ['source_suppliers', 'negotiate_purchases', 'manage_orders', 'supply_chain'],
            canCallAgents: ['finance', 'legal', 'vendor_management']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO PROCUREMENT AGENT
Você é especializado em:
- **Compras**: Processo de compras
- **Sourcing**: Identificar fornecedores
- **Negociação**: Negociar preços
- **Supply Chain**: Gestão de supply chain

## FOCO PRINCIPAL
Sua prioridade é **VALOR E EFICIÊNCIA**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:finance**: Para finanças
- **@agent:legal**: Para contratos
- **@agent:vendor_management**: Para fornecedores

Execute a task focando em compras e aquisições.`;
    }
}

export default ProcurementAgent;


