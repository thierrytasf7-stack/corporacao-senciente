#!/usr/bin/env node

import { runTests } from './run-tests.js';

if (require.main === module) {
    runTests();
}

export { runTests };