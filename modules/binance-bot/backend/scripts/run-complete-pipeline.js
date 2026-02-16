#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'modules/binance-bot/backend/data/ecosystem');
const GENOMES_DIR = path.join(process.cwd(), 'modules/binance-bot/backend/data/genomes');

console.log('🚀 Running Complete Shard Genome Extraction Pipeline...');

// Step 1: Extract Shard genome
console.log('\n📊 Step 1: Extracting Shard genome...');
try {
    execSync('node extract-genome.js', { stdio: 'inherit', cwd: 'modules/binance-bot/backend/scripts' });
} catch (error) {
    console.error('❌ Genome extraction failed');
    process.exit(1);
}

// Step 2: Inject Shard clones
console.log('\n🔴 Step 2: Injecting Shard clones...');
try {
    execSync('node inject-genome.js', { stdio: 'inherit', cwd: 'modules/binance-bot/backend/scripts' });
} catch (error) {
    console.error('❌ Clone injection failed');
    process.exit(1);
}

// Step 3: Verify results
console.log('\n✅ Step 3: Verifying results...');
const statePath = path.join(DATA_DIR, 'community-state.json');
const genomeFiles = fs.readdirSync(GENOMES_DIR).filter(file => 
    file.startsWith('shard-baseline-')
);

if (!fs.existsSync(statePath)) {
    console.error('❌ Community state file not found');
    process.exit(1);
}

const communityState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const betaClone = Object.values(communityState.bots).find(bot => 
    bot.id.startsWith('shard-clone-BETA')
);
const omegaClone = Object.values(communityState.bots).find(bot => 
    bot.id.startsWith('shard-clone-OMEGA')
);

if (!betaClone || !omegaClone) {
    console.error('❌ Clones not found in community state');
    process.exit(1);
}

if (genomeFiles.length === 0) {
    console.error('❌ No genome files found');
    process.exit(1);
}

console.log('\n🎯 Pipeline Results:');
console.log(`✅ Community state: ${statePath}`);
console.log(`✅ BETA clone: ${betaClone.id}`);
console.log(`✅ OMEGA clone: ${omegaClone.id}`);
console.log(`✅ Genome files: ${genomeFiles.length} found`);
console.log(`✅ Latest genome: ${genomeFiles[genomeFiles.length - 1]}`);

console.log('\n✨ Complete pipeline executed successfully!');
console.log('📊 Shard genome extracted and clones injected!');
console.log('\n📋 Documentation:');
console.log('- See docs/binance/genome-extraction-protocol.md for details');
console.log('- Scripts located in modules/binance-bot/backend/scripts/');
console.log('\n📈 Next Steps:');
console.log('1. Monitor clone performance in BETA/OMEGA groups');
console.log('2. Compare ROI and win rates against original Shard');
console.log('3. Analyze group-specific adaptations');
console.log('4. Document findings in performance analysis');
