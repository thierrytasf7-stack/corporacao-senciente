#!/usr/bin/env node
/**
 * Agent Registry - Carregamento dinâmico de agentes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { logger } from '../utils/logger.js';
import { getBrain } from './brain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = logger.child({ module: 'agent_registry' });

/**
 * Registra todos os agentes disponíveis no sistema
 */
export async function registerAllAgents() {
    const brain = getBrain();
    const agentsDir = path.join(__dirname, '../agents');

    log.info('Scanning for agents...', { agentsDir });

    const categories = ['', 'technical', 'business', 'operations', 'specialized'];

    for (const category of categories) {
        const categoryDir = path.join(agentsDir, category);
        if (!fs.existsSync(categoryDir)) {
            continue;
        }

        const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('_agent.js'));
        log.info(`Scanning category ${category || 'root'}: found ${files.length} files`);

        for (const file of files) {
            try {
                const agentPath = path.join(categoryDir, file);
                const agentUrl = pathToFileURL(agentPath).href;
                const module = await import(agentUrl);

                // Procurar por qualquer função ou classe que termine com Agent
                let AgentClass = null;

                // 1. Tentar exportação padrão
                if (module.default && typeof module.default === 'function' &&
                    (module.default.name.endsWith('Agent') || module.default.name === '')) {
                    AgentClass = module.default;
                }

                // 2. Tentar exportações nomeadas
                if (!AgentClass) {
                    AgentClass = Object.values(module).find(v =>
                        typeof v === 'function' && v.name.endsWith('Agent')
                    );
                }

                if (AgentClass) {
                    const agent = new AgentClass();
                    if (agent.name) {
                        brain.registerAgent(agent);
                    } else {
                        log.debug(`Agent class ${AgentClass.name} in ${file} has no name property, skipping.`);
                    }
                }
            } catch (err) {
                log.error(`Failed to load agent ${file}: ${err.message}`);
            }
        }
    }

    log.info('Agent registration complete', { count: brain.agents.size });
}

export default registerAllAgents;
