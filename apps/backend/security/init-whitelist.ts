#!/usr/bin/env node
/**
 * Initialize whitelist with seed data
 * Usage: npx tsx apps/backend/security/init-whitelist.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { getWhitelistManager } from '../src/middleware/source-whitelist'

interface SeedSource {
  name: string
  domain: string
  category: string
  description: string
  tags: string[]
}

interface SeedData {
  version: string
  description: string
  lastUpdated: string
  sources: SeedSource[]
}

async function initializeWhitelist() {
  console.log('[INIT] Initializing whitelist with seed data...')

  // Load seed data
  const seedPath = path.join(__dirname, 'whitelist-seeds.json')
  const seedData: SeedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'))

  const manager = getWhitelistManager()

  console.log(`[INIT] Found ${seedData.sources.length} seed sources`)

  let added = 0
  let skipped = 0

  for (const seed of seedData.sources) {
    try {
      // Check if already exists
      const existing = manager.getWhitelist().find((s) => s.domain === seed.domain)

      if (existing) {
        console.log(`[INIT] Skipping ${seed.domain} (already exists)`)
        skipped++
        continue
      }

      // Add to whitelist
      manager.addSourceToWhitelist({
        id: `seed-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: seed.name,
        domain: seed.domain,
        category: seed.category,
        status: 'active',
        reputation: {
          score: 8.0, // Default score for seeds (will be updated)
          lastChecked: new Date().toISOString(),
          trusted: true
        },
        tags: seed.tags,
        description: seed.description
      })

      console.log(`[INIT] ✓ Added ${seed.domain}`)
      added++
    } catch (error) {
      console.error(`[INIT] Failed to add ${seed.domain}:`, error)
    }
  }

  console.log(`\n[INIT] Whitelist initialization complete:`)
  console.log(`  - Added: ${added}`)
  console.log(`  - Skipped: ${skipped}`)
  console.log(`  - Total sources: ${manager.getWhitelist().length}`)

  // Update reputation scores
  console.log('\n[INIT] Updating reputation scores...')
  await manager.updateReputationScores()

  console.log('[INIT] Done!')
}

// Run if called directly
if (require.main === module) {
  initializeWhitelist().catch((error) => {
    console.error('[INIT] Fatal error:', error)
    process.exit(1)
  })
}

export { initializeWhitelist }
