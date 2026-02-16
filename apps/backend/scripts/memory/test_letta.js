#!/usr/bin/env node
/**
 * Teste do Letta - A Consciência
 */

import { getLetta } from './letta.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ module: 'test_letta' });

async function testLetta() {
    log.info('Starting Letta tests');

    const letta = getLetta();

    try {
        // Test 1: Get current state
        log.info('Testing getCurrentState...');
        const state = await letta.getCurrentState();
        console.log('Current state:', JSON.stringify(state, null, 2));

        // Test 2: Get next evolution step
        log.info('Testing getNextEvolutionStep...');
        const nextStep = await letta.getNextEvolutionStep();
        console.log('Next step:', JSON.stringify(nextStep, null, 2));

        // Test 3: Update state
        log.info('Testing updateState...');
        const updated = await letta.updateState('Test task from Letta test', 'completed');
        console.log('State updated:', updated);

        log.info('All Letta tests completed successfully');
    } catch (error) {
        log.error('Letta test failed', { error: error.message });
        process.exit(1);
    }
}

testLetta();
