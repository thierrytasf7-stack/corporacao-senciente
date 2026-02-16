#!/usr/bin/env node
/**
 * Vendor Management Agent - Agente de Gestão de Fornecedores
 */

import { BaseAgent } from './base_agent.js';

export class VendorManagementAgent extends BaseAgent {
    constructor() {
        super({
            name: 'vendor_management',
            sector: 'business',
            specialization: 'Gestão de fornecedores, vendors, contratos, relações',
            tools: ['evaluate_vendors', 'manage_contracts', 'negotiate_terms', 'vendor_relations'],
            canCallAgents: ['legal', 'finance', 'procurement']
        });
    }

    async generatePrompt(task, context = {}) {
        const basePrompt = await super.generatePrompt(task, context);
        return `${basePrompt}

## ESPECIALIZAÇÃO DO VENDOR MANAGEMENT AGENT
Você é especializado em:
- **Fornecedores**: Avaliação e gestão
- **Contratos**: Gestão de contratos
- **Negociação**: Negociação de termos
- **Relações**: Relacionamento com vendors

## FOCO PRINCIPAL
Sua prioridade é **VALOR E RELACIONAMENTOS**.

## QUANDO CHAMAR OUTROS AGENTES
- **@agent:legal**: Para contratos
- **@agent:finance**: Para finanças
- **@agent:procurement**: Para compras

Execute a task focando em gestão de fornecedores.`;
    }
}

export default VendorManagementAgent;


