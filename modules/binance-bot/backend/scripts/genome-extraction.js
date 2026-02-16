#!/usr/bin/env node

import { runGenomeExtraction } from './run-genome-extraction.js';

if (require.main === module) {
    runGenomeExtraction();
}

export { runGenomeExtraction };