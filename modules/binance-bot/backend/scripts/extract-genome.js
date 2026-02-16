#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { CommunityEcosystem } from '../services/ecosystem/CommunityEcosystem';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
const GENOMES_DIR = path.join(DATA_DIR, 'genomes');

// Create genomes directory if not exists
if (!fs.existsSync(GENOMES_DIR)) {
    fs.mkdirSync(GENOMES_DIR, { recursive: true });
}

const shardBotId = 'eco-ALPHA-evo-gen138-*';

function extractGenome() {
    try {
        // Read community state
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        
        // Find Shard bot
        const shardBot = Object.values(state.bots).find(bot => 
            bot.id.startsWith('eco-ALPHA-evo-gen138-')
        );
        
        if (!shardBot) {
            throw new Error(`Bot ${shardBotId} not found in community state`);
        }
        
        if (!shardBot.isAlive) {
            throw new Error(`Bot ${shardBotId} is not alive`);
        }
        
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
            bankroll: shardBot.bankroll,
            trades: shardBot.trades,
            timestamp: new Date().toISOString()
        };
        
        // Save baseline genome
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
        const outputPath = path.join(GENOMES_DIR, `shard-baseline-${timestamp}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(genome, null, 2));
        
        console.log(`✅ Shard genome extracted successfully!`);
        console.log(`📁 Saved to: ${outputPath}`);
        console.log(`📊 Genome contains ${Object.keys(genome).length} seeds`);
        console.log(`🏆 Shard stats: ${shardBot.fitness.toFixed(2)} ROI, ${shardBot.winRate.toFixed(1)}% WR, ${shardBot.trades} trades`);
        
        return genome;
        
    } catch (error) {
        console.error('❌ Error extracting genome:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    extractGenome();
}

export { extractGenome };