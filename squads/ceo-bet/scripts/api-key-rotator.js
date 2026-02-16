#!/usr/bin/env node
/**
 * API Key Rotator
 * Gerencia pool de 10 API keys do The Odds API
 * Auto-rotaciona quando quota esgota
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class APIKeyRotator {
  constructor() {
    this.envPath = path.join(__dirname, '../.env');
    this.currentAccount = parseInt(process.env.ODDS_API_CURRENT_ACCOUNT || '1');
    this.maxAccounts = 10;
    this.keys = this.loadKeys();
  }

  /**
   * Load all API keys from .env
   */
  loadKeys() {
    const keys = {};
    for (let i = 1; i <= this.maxAccounts; i++) {
      const key = process.env[`ODDS_API_KEY_${i}`];
      if (key && key.trim() !== '') {
        keys[i] = key.trim();
      }
    }
    return keys;
  }

  /**
   * Get current active API key
   */
  getCurrentKey() {
    return this.keys[this.currentAccount] || null;
  }

  /**
   * Get next available API key
   */
  getNextKey() {
    const availableKeys = Object.keys(this.keys).map(Number);
    if (availableKeys.length === 0) {
      throw new Error('No API keys available');
    }

    // Find next key in sequence
    let nextAccount = this.currentAccount + 1;
    while (nextAccount <= this.maxAccounts) {
      if (this.keys[nextAccount]) {
        return { account: nextAccount, key: this.keys[nextAccount] };
      }
      nextAccount++;
    }

    // Wrap around to first key
    nextAccount = 1;
    while (nextAccount < this.currentAccount) {
      if (this.keys[nextAccount]) {
        return { account: nextAccount, key: this.keys[nextAccount] };
      }
      nextAccount++;
    }

    throw new Error('No more API keys available for rotation');
  }

  /**
   * Rotate to next API key
   */
  rotate() {
    const next = this.getNextKey();

    // Update .env file
    let envContent = fs.readFileSync(this.envPath, 'utf8');

    // Update ODDS_API_KEY
    envContent = envContent.replace(
      /ODDS_API_KEY=.*/,
      `ODDS_API_KEY=${next.key}`
    );

    // Update ODDS_API_CURRENT_ACCOUNT
    envContent = envContent.replace(
      /ODDS_API_CURRENT_ACCOUNT=.*/,
      `ODDS_API_CURRENT_ACCOUNT=${next.account}`
    );

    fs.writeFileSync(this.envPath, envContent, 'utf8');

    this.currentAccount = next.account;

    return {
      account: next.account,
      key: next.key,
      message: `Rotated to account ${next.account}/${this.maxAccounts}`
    };
  }

  /**
   * Get rotation status
   */
  getStatus() {
    const totalKeys = Object.keys(this.keys).length;
    const availableKeys = Object.keys(this.keys).filter(k => k != this.currentAccount).length;

    return {
      currentAccount: this.currentAccount,
      currentKey: this.getCurrentKey()?.substring(0, 8) + '...',
      totalKeys,
      availableKeys,
      maxAccounts: this.maxAccounts,
      quota: `${totalKeys * 500} requests/month total`
    };
  }

  /**
   * Add new API key to pool
   */
  addKey(account, key) {
    if (account < 1 || account > this.maxAccounts) {
      throw new Error(`Account must be between 1 and ${this.maxAccounts}`);
    }

    let envContent = fs.readFileSync(this.envPath, 'utf8');

    // Update key in .env
    const keyPattern = new RegExp(`ODDS_API_KEY_${account}=.*`);
    if (keyPattern.test(envContent)) {
      envContent = envContent.replace(keyPattern, `ODDS_API_KEY_${account}=${key}`);
    } else {
      // Add new line if not exists
      envContent += `\nODDS_API_KEY_${account}=${key}`;
    }

    fs.writeFileSync(this.envPath, envContent, 'utf8');

    this.keys[account] = key;

    return {
      account,
      message: `API key ${account} added to pool`
    };
  }
}

// CLI usage
if (require.main === module) {
  const rotator = new APIKeyRotator();

  const command = process.argv[2];

  switch(command) {
    case 'status':
      console.log('\n=== API KEY ROTATOR STATUS ===');
      const status = rotator.getStatus();
      console.log(`Current Account: ${status.currentAccount}/${status.maxAccounts}`);
      console.log(`Current Key: ${status.currentKey}`);
      console.log(`Total Keys Configured: ${status.totalKeys}`);
      console.log(`Available for Rotation: ${status.availableKeys}`);
      console.log(`Total Quota: ${status.quota}`);
      console.log('');
      break;

    case 'rotate':
      console.log('\n=== ROTATING API KEY ===');
      try {
        const result = rotator.rotate();
        console.log(`✓ ${result.message}`);
        console.log(`New Key: ${result.key.substring(0, 8)}...`);
        console.log('\nPlease restart services to use new key.\n');
      } catch (error) {
        console.error(`✗ ${error.message}\n`);
        process.exit(1);
      }
      break;

    case 'add':
      const account = parseInt(process.argv[3]);
      const key = process.argv[4];

      if (!account || !key) {
        console.log('\nUsage: node api-key-rotator.js add <account> <key>');
        console.log('Example: node api-key-rotator.js add 2 abc123xyz\n');
        process.exit(1);
      }

      try {
        const result = rotator.addKey(account, key);
        console.log(`\n✓ ${result.message}\n`);
      } catch (error) {
        console.error(`\n✗ ${error.message}\n`);
        process.exit(1);
      }
      break;

    case 'current':
      const currentKey = rotator.getCurrentKey();
      console.log(`\nCurrent API Key (Account ${rotator.currentAccount}): ${currentKey}\n`);
      break;

    default:
      console.log(`
Usage: node api-key-rotator.js <command> [args]

Commands:
  status          Show current rotation status
  rotate          Rotate to next available API key
  current         Show current API key
  add <n> <key>   Add API key to pool (n = 1-10)

Examples:
  node api-key-rotator.js status
  node api-key-rotator.js rotate
  node api-key-rotator.js add 2 abc123xyz456
      `);
  }
}

module.exports = APIKeyRotator;
