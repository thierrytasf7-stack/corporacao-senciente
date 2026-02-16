#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { CommunityEcosystem } from '../services/ecosystem/CommunityEcosystem';
import { BinanceApiService } from '../BinanceApiService';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const GENOMES_DIR = path.join(process.cwd(), 'data', 'genomes');

// Create directories if they don't exist
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(GENOMES_DIR, { recursive: true });

async function extractShardGenome() {
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
        
        // Find Shard bot (eco-ALPHA-evo-gen138-*)
        const shardBot = Object.values(communityState.bots).find(bot => 
            bot.id.startsWith('eco-ALPHA-evo-gen138-')
        );
        
        if (!shardBot) {
            throw new Error('Shard bot not found in community state');
        }
        
        if (!shardBot.alive) {
            throw new Error('Shard bot is not alive');
        }
        
        console.log(`Found Shard bot: ${shardBot.id}`);
        console.log(`Group: ${shardBot.groupId}`);
        console.log(`Generation: ${shardBot.generation}`);
        console.log(`Bankroll: $${shardBot.bankroll}`);
        console.log(`Win Rate: ${shardBot.winRate}%`);
        console.log(`ROI: ${shardBot.roi}%`);
        
        // Extract complete genome
        const genome = {
            strategyParams: shardBot.genome.strategyParams,
            marketRegime: shardBot.genome.marketRegime,
            temporal: shardBot.genome.temporal,
            correlation: shardBot.genome.correlation,
            sentiment: shardBot.genome.sentiment,
            riskAdapt: shardBot.genome.riskAdapt,
            metaEvolution: shardBot.genome.metaEvolution,
            patterns: shardBot.genome.patterns,
            symbolSelection: shardBot.genome.symbolSelection,
            groupId: shardBot.groupId,
            generation: shardBot.generation,
            fitness: shardBot.fitness,
            winRate: shardBot.winRate,
            roi: shardBot.roi,
            trades: shardBot.trades,
            timestamp: new Date().toISOString()
        };
        
        // Save genome
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
        const genomePath = path.join(GENOMES_DIR, `shard-baseline-${timestamp}.json`);
        fs.writeFileSync(genomePath, JSON.stringify(genome, null, 2));
        
        console.log(`\nShard genome extracted successfully!`);
        console.log(`Saved to: ${genomePath}`);
        console.log(`Genome contains ${Object.keys(genome).length} seeds`);
        
        return genome;
        
    } catch (error) {
        console.error('Error extracting Shard genome:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    extractShardGenome().catch(console.error);
}