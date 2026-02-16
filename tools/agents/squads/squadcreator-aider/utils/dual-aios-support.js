#!/usr/bin/env node

/**
 * Dual AIOS Support - Synchronize squads to both Claude and Aider frameworks
 * Ensures created squads are available in both AIOS environments
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Detect which AIOS framework we're running in
 */
function detectAIOSVersion() {
  const isAider = process.env.AIDER_CLI === 'true' || process.env.AIOS_AIDER === 'true';
  return isAider ? 'aider' : 'claude';
}

/**
 * Get installation path based on framework
 */
function getInstallationPath(framework = null) {
  const fw = framework || detectAIOSVersion();

  const claudePath = path.join(process.env.HOME || process.env.USERPROFILE,
    'Desktop', 'AIOS_CLAUDE', 'aios-core', 'squads');

  const aiderPath = path.join(process.env.AIDER_HOME || process.env.AIOS_AIDER_HOME ||
    process.env.HOME || process.env.USERPROFILE,
    '.aios-aider', 'squads');

  return fw === 'aider' ? aiderPath : claudePath;
}

/**
 * Copy squad to specified AIOS framework
 */
function copySquadToAIOS(squadName, sourcePath, framework) {
  try {
    const targetPath = getInstallationPath(framework);
    const squadPath = path.join(targetPath, squadName);

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // Copy recursively
    copyDirRecursive(sourcePath, squadPath);

    console.log(`✅ Squad '${squadName}' copied to ${framework} AIOS`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy squad to ${framework} AIOS:`, error.message);
    return false;
  }
}

/**
 * Recursive directory copy
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

/**
 * Validate squad integrity after copy
 */
function validateSquadIntegrity(squadName, framework) {
  try {
    const basePath = getInstallationPath(framework);
    const squadPath = path.join(basePath, squadName);

    const required = [
      'config.yaml',
      'package.json',
      'README.md',
      'agents',
      'tasks',
      'templates',
      'checklists',
      'data'
    ];

    for (const file of required) {
      const filePath = path.join(squadPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required: ${file}`);
      }
    }

    console.log(`✅ Squad integrity validated for ${framework} AIOS`);
    return true;
  } catch (error) {
    console.error(`❌ Squad integrity check failed (${framework}):`, error.message);
    return false;
  }
}

/**
 * Register squad in memory layer
 */
function registerSquadInMemory(squadName, metadata) {
  try {
    const memoryFile = path.join(process.env.HOME || process.env.USERPROFILE,
      '.aios', 'memory', 'squads.json');

    let squads = [];
    if (fs.existsSync(memoryFile)) {
      const content = fs.readFileSync(memoryFile, 'utf8');
      squads = JSON.parse(content);
    }

    // Add or update squad entry
    const existing = squads.findIndex(s => s.name === squadName);
    const entry = {
      name: squadName,
      created: new Date().toISOString(),
      ...metadata
    };

    if (existing >= 0) {
      squads[existing] = entry;
    } else {
      squads.push(entry);
    }

    // Ensure directory exists
    const dir = path.dirname(memoryFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(memoryFile, JSON.stringify(squads, null, 2));
    console.log(`✅ Squad registered in memory layer`);
    return true;
  } catch (error) {
    console.warn(`⚠️  Memory registration failed (non-critical):`, error.message);
    return false;
  }
}

/**
 * Master function: Sync squad to both AIOS frameworks
 */
function syncBothAIOS(squadName, sourcePath, metadata = {}) {
  console.log(`\n🔄 Syncing squad '${squadName}' to both AIOS frameworks...`);
  console.log('═'.repeat(60));

  const results = {
    claude: false,
    aider: false,
    memory: false,
    success: false
  };

  try {
    // Validate source
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source squad directory not found: ${sourcePath}`);
    }

    // Copy to Claude AIOS
    console.log('\n📋 Copying to Claude AIOS...');
    results.claude = copySquadToAIOS(squadName, sourcePath, 'claude');
    if (results.claude) {
      validateSquadIntegrity(squadName, 'claude');
    }

    // Copy to Aider AIOS
    console.log('\n📋 Copying to Aider AIOS...');
    results.aider = copySquadToAIOS(squadName, sourcePath, 'aider');
    if (results.aider) {
      validateSquadIntegrity(squadName, 'aider');
    }

    // Register in memory
    console.log('\n📦 Registering in memory layer...');
    results.memory = registerSquadInMemory(squadName, metadata);

    // Final status
    console.log('\n' + '═'.repeat(60));
    if (results.claude && results.aider) {
      console.log(`✅ SUCCESS: '${squadName}' synchronized to both AIOS frameworks!`);
      results.success = true;
    } else {
      console.log(`⚠️  PARTIAL: Sync completed with warnings`);
      console.log(`  - Claude AIOS: ${results.claude ? '✅' : '❌'}`);
      console.log(`  - Aider AIOS: ${results.aider ? '✅' : '❌'}`);
      results.success = results.claude || results.aider;
    }

    return results;
  } catch (error) {
    console.error(`❌ FATAL ERROR:`, error.message);
    return results;
  }
}

// ============================================================================
// CLI Interface
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const squadName = args[1];
  const sourcePath = args[2];

  if (!command || !squadName) {
    console.log(`
Usage: node dual-aios-support.js <command> <squad-name> [source-path]

Commands:
  sync <squad-name> <source-path>  - Sync squad to both AIOS frameworks
  validate <squad-name>             - Validate squad in both frameworks
  detect                            - Detect current AIOS version

Examples:
  node dual-aios-support.js sync my-squad ./squads/my-squad
  node dual-aios-support.js validate my-squad
  node dual-aios-support.js detect
    `);
    process.exit(1);
  }

  switch (command) {
    case 'sync':
      if (!sourcePath) {
        console.error('❌ Source path required for sync command');
        process.exit(1);
      }
      syncBothAIOS(squadName, sourcePath, {
        author: process.env.AIOS_AUTHOR || 'AIOS Team',
        version: '1.0.0'
      });
      break;

    case 'validate':
      console.log('Validating squad in both frameworks...\n');
      const claudeValid = validateSquadIntegrity(squadName, 'claude');
      const aiderValid = validateSquadIntegrity(squadName, 'aider');
      console.log(`\nResult: ${claudeValid && aiderValid ? '✅ All valid' : '⚠️ Some issues'}`);
      break;

    case 'detect':
      const version = detectAIOSVersion();
      console.log(`Current AIOS version: ${version}`);
      console.log(`Installation path: ${getInstallationPath()}`);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = {
  detectAIOSVersion,
  getInstallationPath,
  copySquadToAIOS,
  validateSquadIntegrity,
  registerSquadInMemory,
  syncBothAIOS
};
