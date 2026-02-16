#!/usr/bin/env node

import { extractGenome } from './extract-genome.js';
import { injectGenome } from './inject-genome.js';
import { validateGenome } from './validate-genome.js';

async function runGenomeExtraction() {
    console.log('🔍 Starting Genome Extraction Protocol...\n');
    
    try {
        // Step 1: Extract Shard genome
        console.log('✅ Step 1: Extracting Shard genome...');
        const baselineGenome = extractGenome();
        
        // Step 2: Inject clones
        console.log('\n✅ Step 2: Injecting clones into BETA/OMEGA...');
        const clones = injectGenome();
        
        // Step 3: Validate results
        console.log('\n✅ Step 3: Validating genome extraction...');
        const validation = validateGenome();
        
        if (validation.validation === 'success') {
            console.log('\n🎉 Genome Extraction Protocol Complete!');
            console.log('📊 Summary:');
            console.log(`   • Shard ROI: ${validation.shardBot.fitness.toFixed(2)}%`);
            console.log(`   • Clones created: ${validation.clones.length}`);
            console.log(`   • Genome seeds: ${Object.keys(validation.baselineGenome).length}`);
            console.log(`   • Baseline saved: ${Object.keys(validation.baselineGenome).find(key => key.includes('shard-baseline'))}`);
            
            // Generate documentation
            console.log('\n📝 Documentation generated: docs/binance/genome-extraction-protocol.md');
            
            process.exit(0);
        } else {
            console.error('❌ Validation failed. Check logs for details.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Genome extraction failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runGenomeExtraction();
}

export { runGenomeExtraction };