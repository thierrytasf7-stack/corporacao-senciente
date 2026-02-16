#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { CommunityEcosystem } from '../services/ecosystem/CommunityEcosystem';
import { EvolutionRegistry } from '../services/ecosystem/EvolutionRegistry';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
const GENOMES_DIR = path.join(DATA_DIR, 'genomes');

function injectGenome() {
    try {
        // Read community state
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        
        // Find baseline genome
        const genomeFiles = fs.readdirSync(GENOMES_DIR)
            .filter(file => file.startsWith('shard-baseline-'))
            .sort()
            .reverse();
            
        if (genomeFiles.length === 0) {
            throw new Error('No baseline genome found. Run extract-genome.js first.');
        }
        
        const baselineGenomePath = path.join(GENOMES_DIR, genomeFiles[0]);
        const baselineGenome = JSON.parse(fs.readFileSync(baselineGenomePath, 'utf8'));
        
        // Create clones for BETA and OMEGA groups
        const targetGroups = ['BETA', 'OMEGA'];
        const newBots = {};
        
        for (const groupId of targetGroups) {
            const botId = `shard-clone-${groupId}-${Date.now()}`;
            const botName = `Shard Clone ${groupId}`;
            
            const bot = {
                id: botId,
                name: botName,
                groupId,
                isAlive: true,
                bankroll: 100,
                generation: 1,
                fitness: 0,
                winRate: 0,
                trades: 0,
                genome: {
                    strategyParams: baselineGenome.strategyParams,
                    marketRegime: baselineGenome.marketRegime,
                    temporal: baselineGenome.temporal,
                    correlation: baselineGenome.correlation,
                    sentiment: baselineGenome.sentiment,
                    riskAdapt: baselineGenome.riskAdapt,
                    metaEvolution: baselineGenome.metaEvolution,
                    patterns: baselineGenome.patterns,
                    symbolSelection: baselineGenome.symbolSelection
                },
                timestamp: new Date().toISOString()
            };
            
            newBots[botId] = bot;
            console.log(`✅ Created clone: ${botId} for group ${groupId}`);
        }
        
        // Inject into community state
        const updatedState = {
            ...state,
            bots: {
                ...state.bots,
                ...newBots
            }
        };
        
        fs.writeFileSync(STATE_FILE, JSON.stringify(updatedState, null, 2));
        
        // Register in EvolutionRegistry
        const evolutionRegistry = new EvolutionRegistry();
        for (const botId in newBots) {
            const bot = newBots[botId];
            evolutionRegistry.record('genome-injection', {
                cycle: state.currentCycle,
                generation: bot.generation,
                fitness: bot.fitness,
                bestGenomeHash: '', // Will be calculated later
                metadata: {
                    operation: 'shard-clone-injection',
                    sourceGenome: 'shard-baseline',
                    targetGroups: targetGroups,
                    timestamp: bot.timestamp
                }
            });
        }
        
        console.log(`✅ Successfully injected ${Object.keys(newBots).length} clones`);
        console.log(`📊 Clones created: ${Object.keys(newBots).join(', ')}`);
        console.log(`📁 Updated community state with new bots`);
        
        return newBots;
        
    } catch (error) {
        console.error('❌ Error injecting genome:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    injectGenome();
}

export { injectGenome };