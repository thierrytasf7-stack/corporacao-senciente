#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { CommunityEcosystem } from '../services/ecosystem/CommunityEcosystem';
import { BinanceApiService } from '../BinanceApiService';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const GENOMES_DIR = path.join(process.cwd(), 'data', 'genomes');

async function injectShardClones() {
    try {
        // Initialize ecosystem
        const binanceService = new BinanceApiService();
        const ecosystem = new CommunityEcosystem(binanceService);
        
        // Load community state
        const statePath = path.join(DATA_DIR, 'community-state.json');
        if (!fs.existsSync(statePath)) {
            throw new Error('Community state file not found');
        }
        
        const communityState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        
        // Load Shard baseline genome
        const genomeFiles = fs.readdirSync(GENOMES_DIR).filter(file => 
            file.startsWith('shard-baseline-')
        );
        
        if (genomeFiles.length === 0) {
            throw new Error('No Shard baseline genome found');
        }
        
        const latestGenomeFile = genomeFiles.sort().reverse()[0];
        const genomePath = path.join(GENOMES_DIR, latestGenomeFile);
        const shardGenome = JSON.parse(fs.readFileSync(genomePath, 'utf8'));
        
        console.log(`Loaded Shard genome: ${latestGenomeFile}`);
        console.log(`Genome contains ${Object.keys(shardGenome).length} seeds`);
        
        // Create clones for BETA and OMEGA groups
        const targetGroups = ['BETA', 'OMEGA'];
        const createdBots = [];
        
        for (const groupId of targetGroups) {
            // Generate unique bot ID
            const existingBots = Object.values(communityState.bots);
            const groupBots = existingBots.filter(bot => bot.groupId === groupId);
            const nextGeneration = Math.max(0, ...groupBots.map(bot => bot.generation)) + 1;
            
            const botId = `shard-clone-${groupId}-evo-gen${nextGeneration}-${Date.now()}`;
            
            // Create bot object
            const bot = {
                id: botId,
                groupId,
                generation: nextGeneration,
                alive: true,
                bankroll: 100, // Initial bankroll
                fitness: 0,
                winRate: 0,
                roi: 0,
                trades: 0,
                genome: {
                    strategyParams: shardGenome.strategyParams,
                    marketRegime: shardGenome.marketRegime,
                    temporal: shardGenome.temporal,
                    correlation: shardGenome.correlation,
                    sentiment: shardGenome.sentiment,
                    riskAdapt: shardGenome.riskAdapt,
                    metaEvolution: shardGenome.metaEvolution,
                    patterns: shardGenome.patterns,
                    symbolSelection: shardGenome.symbolSelection
                },
                timestamp: new Date().toISOString()
            };
            
            // Inject genome using EvolutionRegistry
            const evolutionRegistry = ecosystem.getEvolutionRegistry();
            evolutionRegistry.injectGenome(bot.genome, {
                dimension: `shard-clone-${groupId}`,
                generation: nextGeneration,
                metadata: {
                    source: 'shard-baseline',
                    targetGroup: groupId,
                    timestamp: new Date().toISOString()
                }
            });
            
            // Add to community state
            communityState.bots[botId] = bot;
            createdBots.push(bot);
            
            console.log(`\nCreated clone for ${groupId}:`);
            console.log(`ID: ${botId}`);
            console.log(`Generation: ${nextGeneration}`);
            console.log(`Genome seeds: ${Object.keys(bot.genome).length}`);
        }
        
        // Save updated community state
        fs.writeFileSync(statePath, JSON.stringify(communityState, null, 2));
        
        console.log(`\nSuccessfully created ${createdBots.length} Shard clones!`);
        console.log(`Updated community state saved to: ${statePath}`);
        
        return createdBots;
        
    } catch (error) {
        console.error('Error injecting Shard clones:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    injectShardClones().catch(console.error);
}