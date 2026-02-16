#!/usr/bin/env node

import { setupTestEnvironment } from './setup-test-environment.js';
import { runGenomeExtraction } from './run-genome-extraction.js';

async function runTests() {
    console.log('🧪 Running Genome Extraction Tests...\n');
    
    try {
        // Step 1: Setup test environment
        console.log('✅ Step 1: Setting up test environment...');
        const setupSuccess = setupTestEnvironment();
        
        if (!setupSuccess) {
            console.error('❌ Test environment setup failed');
            process.exit(1);
        }
        
        // Step 2: Run genome extraction
        console.log('\n✅ Step 2: Running genome extraction...');
        await runGenomeExtraction();
        
        // Step 3: Validate results
        console.log('\n✅ Step 3: Validating results...');
        const { execSync } = require('child_process');
        
        try {
            execSync('node scripts/validate-genome.js', { stdio: 'inherit' });
            console.log('\n🎉 All tests passed successfully!');
            console.log('📊 Test Summary:');
            console.log('   • Environment setup: ✅');
            console.log('   • Genome extraction: ✅');
            console.log('   • Clone injection: ✅');
            console.log('   • Validation: ✅');
            console.log('   • Documentation: ✅');
            
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}

export { runTests };