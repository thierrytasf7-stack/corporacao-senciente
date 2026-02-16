#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'modules/binance-bot/backend/data/ecosystem');
const GENOMES_DIR = path.join(process.cwd(), 'modules/binance-bot/backend/data/genomes');

console.log('🔍 Verifying Shard Clone Implementation...');

// Step 1: Check community state
const statePath = path.join(DATA_DIR, 'community-state.json');
if (!fs.existsSync(statePath)) {
    console.error('❌ Community state file not found');
    process.exit(1);
}

const communityState = JSON.parse(fs.readFileSync(statePath, 'utf8'));

// Step 2: Find clones
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

// Step 3: Check genome files
const genomeFiles = fs.readdirSync(GENOMES_DIR).filter(file => 
    file.startsWith('shard-baseline-')
);

if (genomeFiles.length === 0) {
    console.error('❌ No genome files found');
    process.exit(1);
}

// Step 4: Check evolution registry
const registryPath = path.join(DATA_DIR, 'evolution-registry.json');
let registryExists = fs.existsSync(registryPath);
let registryData = {};
if (registryExists) {
    registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

// Step 5: Validate genome completeness
const requiredSeeds = [
    'strategyParams', 'marketRegime', 'temporal', 'correlation',
    'sentiment', 'riskAdapt', 'metaEvolution', 'patterns', 'symbolSelection'
];

const validateGenome = (genome: any) => {
    const missingSeeds = requiredSeeds.filter(seed => !genome.hasOwnProperty(seed));
    return {
        complete: missingSeeds.length === 0,
        missing: missingSeeds,
        totalSeeds: Object.keys(genome).length
    };
};

const betaValidation = validateGenome(betaClone.genome);
const omegaValidation = validateGenome(omegaClone.genome);

// Step 6: Output results
console.log('\n📊 Validation Results:');
console.log(`✅ Community state: ${statePath}`);
console.log(`✅ BETA clone: ${betaClone.id}`);
console.log(`✅ OMEGA clone: ${omegaClone.id}`);
console.log(`✅ Genome files: ${genomeFiles.length} found`);
console.log(`✅ Latest genome: ${genomeFiles[genomeFiles.length - 1]}`);
console.log(`✅ Evolution registry: ${registryExists ? 'exists' : 'missing'}`);

console.log('\n🔧 Genome Validation:');
console.log(`BETA Clone - Seeds: ${betaValidation.totalSeeds}/${requiredSeeds.length}`);
console.log(`BETA Clone - Complete: ${betaValidation.complete ? '✅' : '❌'}`);
if (!betaValidation.complete) {
    console.log(`Missing seeds: ${betaValidation.missing.join(', ')}`);
}

console.log(`\nOMEGA Clone - Seeds: ${omegaValidation.totalSeeds}/${requiredSeeds.length}`);
console.log(`OMEGA Clone - Complete: ${omegaValidation.complete ? '✅' : '❌'}`);
if (!omegaValidation.complete) {
    console.log(`Missing seeds: ${omegaValidation.missing.join(', ')}`);
}

// Step 7: Final verdict
let allValid = betaValidation.complete && omegaValidation.complete;
if (registryExists) {
    allValid = allValid && Object.keys(registryData).length > 0;
}

if (allValid) {
    console.log('\n✅ ALL VALIDATION CHECKS PASSED!');
    console.log('🎯 Shard genome extraction and clone injection successful!');
    console.log('\n📋 Next Steps:');
    console.log('1. Monitor clone performance in respective groups');
    console.log('2. Compare ROI and win rates against original Shard');
    console.log('3. Analyze group-specific adaptations');
    console.log('4. Document findings in performance analysis');
} else {
    console.error('\n❌ VALIDATION FAILED - Review the above issues');
    process.exit(1);
}
