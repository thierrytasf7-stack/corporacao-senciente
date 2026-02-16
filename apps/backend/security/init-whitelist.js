#!/usr/bin/env node
/**
 * Initialize whitelist with seed data
 * Usage: node apps/backend/security/init-whitelist.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_FILE = path.join(__dirname, 'whitelist-seeds.json');
const WHITELIST_FILE = path.join(__dirname, 'source_whitelist.json');

async function initializeWhitelist() {
  console.log('[INIT] Initializing whitelist with seed data...');

  try {
    // Load seed data
    const seedData = JSON.parse(await fs.readFile(SEED_FILE, 'utf-8'));
    console.log(`[INIT] Found ${seedData.sources.length} seed sources`);

    // Load or create whitelist
    let config;
    try {
      config = JSON.parse(await fs.readFile(WHITELIST_FILE, 'utf-8'));
      console.log('[INIT] Loaded existing whitelist');
    } catch {
      console.log('[INIT] Creating new whitelist file');
      config = {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        policy: {
          blockUnauthorized: true,
          logBlocked: true,
          validateReputation: true,
          reputationCheckInterval: 604800000
        },
        sources: [],
        blocklist: [],
        pendingApproval: [],
        auditLog: []
      };
    }

    let added = 0;
    let skipped = 0;

    // Add seed sources
    for (const seed of seedData.sources) {
      // Check if already exists
      const exists = config.sources.some((s) => s.domain === seed.domain);

      if (exists) {
        console.log(`[INIT] Skipping ${seed.domain} (already exists)`);
        skipped++;
        continue;
      }

      // Add to whitelist
      config.sources.push({
        id: `seed-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: seed.name,
        domain: seed.domain,
        category: seed.category,
        status: 'active',
        reputation: {
          score: 8.0,
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: seed.tags,
        description: seed.description,
        addedBy: 'system',
        addedAt: new Date().toISOString()
      });

      console.log(`[INIT] ✓ Added ${seed.domain}`);
      added++;

      // Small delay to avoid duplicate IDs
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Save whitelist
    config.lastUpdated = new Date().toISOString();
    await fs.writeFile(WHITELIST_FILE, JSON.stringify(config, null, 2));

    console.log(`\n[INIT] Whitelist initialization complete:`);
    console.log(`  - Added: ${added}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`  - Total sources: ${config.sources.length}`);
    console.log(`  - File: ${WHITELIST_FILE}`);
  } catch (error) {
    console.error('[INIT] Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
initializeWhitelist();
