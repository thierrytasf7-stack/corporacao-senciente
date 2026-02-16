#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'ecosystem');
const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
const GENOMES_DIR = path.join(DATA_DIR, 'genomes');

function createDirectories() {
    try {
        // Create data directory structure
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            console.log(`✅ Created data directory: ${DATA_DIR}`);
        }
        
        if (!fs.existsSync(GENOMES_DIR)) {
            fs.mkdirSync(GENOMES_DIR, { recursive: true });
            console.log(`✅ Created genomes directory: ${GENOMES_DIR}`);
        }
        
        // Create docs directory
        const DOCS_DIR = path.join(process.cwd(), 'docs', 'binance');
        if (!fs.existsSync(DOCS_DIR)) {
            fs.mkdirSync(DOCS_DIR, { recursive: true });
            console.log(`✅ Created docs directory: ${DOCS_DIR}`);
        }
        
        console.log('✅ Directory structure ready for genome extraction');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to create directories:', error.message);
        return false;
    }
}

function createSampleCommunityState() {
    try {
        const sampleState = {
            currentCycle: 0,
            totalBankroll: 2500,
            startTime: new Date().toISOString(),
            peakBankroll: 2500,
            consecutiveBankruptcies: 0,
            bots: {},
            groups: {
                ALPHA: { bankroll: 500, bots: [] },
                BETA: { bankroll: 500, bots: [] },
                GAMMA: { bankroll: 500, bots: [] },
                DELTA: { bankroll: 500, bots: [] },
                OMEGA: { bankroll: 500, bots: [] }
            }
        };
        
        const STATE_FILE = path.join(DATA_DIR, 'community-state.json');
        fs.writeFileSync(STATE_FILE, JSON.stringify(sampleState, null, 2));
        
        console.log('✅ Created sample community state');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to create sample state:', error.message);
        return false;
    }
}

function createSampleShardBot() {
    try {
        const shardBot = {
            id: 'eco-ALPHA-evo-gen138-001',
            name: 'Shard',
            groupId: 'ALPHA',
            isAlive: true,
            bankroll: 1400.08,
            generation: 138,
            fitness: 14.08,
            winRate: 57.4,
            trades: 54,
            genome: {
                strategyParams: { 
                    mask: [true, false, true, true, false, true, false, true, true, false],
                    weights: [0.8, 0.2, 0.9, 0.7, 0.3, 0.6, 0.4, 0.9, 0.8, 0.2]
                },
                marketRegime: { trend: 0.75, volatility: 0.6, volume: 0.8 },
                temporal: { short: 0.7, medium: 0.5, long: 0.3 },
                correlation: { crossAsset: 0.6, sector: 0.4, market: 0.8 },
                sentiment: { social: 0.7, news: 0.5, technical: 0.9 },
                riskAdapt: { atrTP: 2.0, atrSL: 1.5, trailingATR: 1.2, leverage: 2.5 },
                metaEvolution: { mutationRate: 0.05, crossoverRate: 0.7, elitism: 0.2 },
                patterns: { breakout: 0.8, reversal: 0.6, continuation: 0.7 },
                symbolSelection: { volumeFilter: 0.7, volatilityFilter: 0.6, correlationFilter: 0.8 }
            },
            timestamp: new Date().toISOString()
        };
        
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        state.bots[shardBot.id] = shardBot;
        state.groups.ALPHA.bots.push(shardBot.id);
        
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        
        console.log('✅ Created sample Shard bot');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to create sample bot:', error.message);
        return false;
    }
}

function setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    if (!createDirectories()) return false;
    if (!createSampleCommunityState()) return false;
    if (!createSampleShardBot()) return false;
    
    console.log('✅ Test environment ready for genome extraction');
    console.log('📁 Directories:');
    console.log(`   • Data: ${DATA_DIR}`);
    console.log(`   • Genomes: ${GENOMES_DIR}`);
    console.log(`   • Docs: ${path.join(process.cwd(), 'docs', 'binance')}`);
    
    return true;
}

if (require.main === module) {
    setupTestEnvironment();
}

export { setupTestEnvironment };