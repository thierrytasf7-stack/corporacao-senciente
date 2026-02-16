#!/usr/bin/env node
/**
 * Inicialização do Swarm
 * 
 * Registra todos os agentes no Brain
 */

import { CopywritingAgent } from '../agents/business/copywriting_agent.js';
import { MarketingAgent } from '../agents/business/marketing_agent.js';
import { ArchitectAgent } from '../agents/technical/architect_agent.js';
import { DevAgent } from '../agents/technical/dev_agent.js';
import { logger } from '../utils/logger.js';
import { getBrain } from './brain.js';

const log = logger.child({ module: 'swarm_init' });

/**
 * Inicializa o sistema de swarm
 * 
 * @returns {Brain} Instância do Brain com agentes registrados
 */
export function initSwarm() {
    log.info('Initializing swarm...');

    const brain = getBrain();

    // Registrar agentes técnicos
    try {
        const architect = new ArchitectAgent();
        brain.registerAgent(architect);
    } catch (err) {
        log.warn('Could not register architect agent', { error: err.message });
    }

    try {
        const dev = new DevAgent();
        brain.registerAgent(dev);
    } catch (err) {
        log.warn('Could not register dev agent', { error: err.message });
    }

    // Registrar agentes de negócio
    try {
        const marketing = new MarketingAgent();
        brain.registerAgent(marketing);
    } catch (err) {
        log.warn('Could not register marketing agent', { error: err.message });
    }

    try {
        const copywriting = new CopywritingAgent();
        brain.registerAgent(copywriting);
    } catch (err) {
        log.warn('Could not register copywriting agent', { error: err.message });
    }

    // TODO: Registrar mais agentes conforme forem criados
    // - ValidationAgent
    // - SalesAgent
    // - FinanceAgent
    // - ProductAgent
    // - DevExAgent
    // - MetricsAgent
    // etc.

    log.info('Swarm initialized', {
        agentsRegistered: brain.agents.size,
        agents: Array.from(brain.agents.keys())
    });

    return brain;
}

// Inicializar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('init.js')) {
    initSwarm()
        .then(brain => {
            console.log('\n✅ Swarm inicializado!');
            console.log(`   Agentes registrados: ${brain.agents.size}`);
            console.log(`   Agentes: ${Array.from(brain.agents.keys()).join(', ')}`);
        })
        .catch(err => {
            console.error('❌ Erro ao inicializar swarm:', err);
            process.exit(1);
        });
}

export default initSwarm;





