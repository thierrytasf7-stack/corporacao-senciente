#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
const GENOMES_DIR = path.join(DATA_DIR, 'genomes');

function validateGenome() {
    try {
        // Read community state
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        
        // Find Shard bot
        const shardBot = Object.values(state.bots).find(bot => 
            bot.id.startsWith('eco-ALPHA-evo-gen138-')
        );
        
        if (!shardBot) {
            throw new Error(`Shard bot not found in community state`);
        }
        
        if (!shardBot.isAlive) {
            throw new Error(`Shard bot is not alive`);
        }
        
        // Find clones
        const clones = Object.values(state.bots).filter(bot => 
            bot.id.startsWith('shard-clone-')
        );
        
        if (clones.length !== 2) {
            throw new Error(`Expected 2 clones, found ${clones.length}`);
        }
        
        // Find latest baseline genome
        const genomeFiles = fs.readdirSync(GENOMES_DIR)
            .filter(file => file.startsWith('shard-baseline-'))
            .sort()
            .reverse();
            
        if (genomeFiles.length === 0) {
            throw new Error('No baseline genome found');
        }
        
        const baselineGenomePath = path.join(GENOMES_DIR, genomeFiles[0]);
        const baselineGenome = JSON.parse(fs.readFileSync(baselineGenomePath, 'utf8'));
        
        // Validate genome seeds
        const requiredSeeds = [
            'strategyParams', 'marketRegime', 'temporal', 
            'correlation', 'sentiment', 'riskAdapt', 
            'metaEvolution', 'patterns', 'symbolSelection'
        ];
        
        const missingSeeds = requiredSeeds.filter(seed => 
            !baselineGenome.hasOwnProperty(seed)
        );
        
        if (missingSeeds.length > 0) {
            throw new Error(`Baseline genome missing seeds: ${missingSeeds.join(', ')}`);
        }
        
        console.log(`🔍 Genome Validation Complete`);
        console.log(`✅ Shard bot found: ${shardBot.id}`);
        console.log(`✅ Shard status: ${shardBot.isAlive ? 'Alive' : 'Dead'}`);
        console.log(`✅ Clones found: ${clones.length}`);
        console.log(`✅ Baseline genome: ${genomeFiles[0]}`);
        console.log(`✅ Genome seeds: ${requiredSeeds.length} (all present)`);
        console.log(`🏆 Shard performance: ${shardBot.fitness.toFixed(2)}% ROI, ${shardBot.winRate.toFixed(1)}% WR, ${shardBot.trades} trades`);
        
        // Display clone details
        console.log('\n📋 Clone Details:');
        clones.forEach(clone => {
            console.log(`   - ${clone.id} (${clone.groupId}): ${clone.bankroll} bankroll, ${clone.generation} generation`);
        });
        
        return {
            shardBot,
            clones,
            baselineGenome,
            validation: 'success'
        };
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        return { validation: 'failed', error: error.message };
    }
}

if (require.main === module) {
    validateGenome();
}

export { validateGenome };