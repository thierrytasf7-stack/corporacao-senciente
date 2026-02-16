import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- UPGRADE DEFINITIONS (EVOLUTION DNA) ---
const UPGRADES = {
  // LEVEL 4: MODERNIZATION & DEEP SCAN
  4: async (squadPath) => {
    console.log('⚡ EVOLUTION (LV-004): Upgrading Cartographer to ESM + Deep Scan capability...');
    const cartographerPath = path.join(squadPath, 'scripts', 'cartographer.js');
    
    // Using simple string for stability
    const newCode = `import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class Cartographer {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.excludePatterns = options.excludePatterns || [
      'node_modules', '.git', 'dist', 'build', '.aios-core', 'coverage'
    ];
    this.observationReport = {
      directories: [],
      files: [],
      readmes: [],
      apis: [],
      structure: {}
    };
  }

  async scanDirectory(currentPath = this.rootPath) {
    try {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (this.excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }

        if (item.isDirectory()) {
          this.observationReport.directories.push(fullPath);
          await this.scanDirectory(fullPath);
        } else {
          this.observationReport.files.push(fullPath);
          if (/readme/i.test(item.name)) this.observationReport.readmes.push(fullPath);
          // LV-4 UPGRADE: Enable file content analysis placeholder
          if (/\\.(js|ts|py|java|go|rb|php)$/i.test(item.name)) {
             // Future: analyzeAPIFile(fullPath);
          }
        }
      }
      return this.observationReport;
    } catch (error) {
      throw new Error('Failed to scan directory: ' + error.message);
    }
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      projectRoot: this.rootPath,
      stats: {
        dirs: this.observationReport.directories.length,
        files: this.observationReport.files.length,
        docs: this.observationReport.readmes.length
      },
      readmes: this.observationReport.readmes,
      evolution_level: 4
    };
  }

  async execute() {
    console.log('🗺️ Cartographer (v2): Scanning terrain with enhanced perception...');
    await this.scanDirectory();
    console.log('🗺️ Cartographer (v2): Terrain mapped.');
    return this.generateReport();
  }
}

// CLI Adaptor for ESM
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  new Cartographer().execute().then(report => console.log(JSON.stringify(report, null, 2)));
}

export default Cartographer;
`;
    await fs.writeFile(cartographerPath, newCode);
    console.log('✅ Cartographer upgraded to v2 (ESM Compatible).');
  },

  // LEVEL 7: PATTERN RECOGNITION (Systems Philosopher)
  7: async (squadPath) => {
    console.log('⚡ EVOLUTION (LV-007): Granting Pattern Recognition to Systems Philosopher...');
    const philosopherPath = path.join(squadPath, 'scripts', 'systems-philosopher.js');
    
    const newCode = `import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

class SystemsPhilosopher {
  constructor(options = {}) {
    this.readmeFiles = options.readmeFiles || [];
    this.interpretation = {
      vision: '',
      intentions: [],
      goals: [],
      detected_todos: [] // NEW CAPABILITY
    };
  }

  async analyzeReadmes(files) {
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        this.extractIntentions(content);
        this.extractPatterns(content); // NEW CAPABILITY
      } catch (e) {
        console.warn('Failed to read ' + file + ': ' + e.message);
      }
    }
  }

  extractIntentions(content) {
    const visionMatch = content.match(/(vision|purpose|mission):?\\s*(.*)/i);
    if (visionMatch) this.interpretation.vision = visionMatch[2].trim();

    const goalMatches = content.matchAll(/(aim|goal|plan)\\s+to\\s+(.*)/gi);
    for (const match of goalMatches) {
      this.interpretation.goals.push(match[2].trim());
    }
  }

  // LV-7 UPGRADE: Pattern Extraction
  extractPatterns(content) {
    const todos = content.matchAll(/(TODO|FIXME|HACK):?\\s*(.*)/g);
    for (const match of todos) {
        this.interpretation.detected_todos.push({
            type: match[1],
            task: match[2].trim()
        });
    }
  }

  async execute(files) {
    console.log('🦉 Systems Philosopher (v2): Analyzing deeper patterns...');
    await this.analyzeReadmes(files || []);
    console.log('🦉 Systems Philosopher (v2): Patterns extracted.');
    return this.interpretation;
  }
}

// CLI Adaptor for ESM
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    // Mock execution if called directly
    new SystemsPhilosopher().execute([]).then(r => console.log(JSON.stringify(r, null, 2)));
}

export default SystemsPhilosopher;
`;
    await fs.writeFile(philosopherPath, newCode);
    console.log('✅ Systems Philosopher upgraded to v2 (Pattern Recognition).');
  },

  // LEVEL 10: AUTO-FIXER GENESIS
  10: async (squadPath) => {
    console.log('⚡ EVOLUTION (LV-010): Birthing new agent "The Mender"...');
    const fixerPath = path.join(squadPath, 'scripts', 'auto-fixer.js');
    
    const code = `import { promises as fs } from 'fs';

class AutoFixer {
    constructor() {
        this.capabilities = ['lint-fix', 'format-fix'];
    }

    async fix(filePath) {
        console.log('🔧 Mender: Attempting to fix ' + filePath + '...');
        // Placeholder for real logic
        return { fixed: false, reason: "Not implemented yet" };
    }
}

export default AutoFixer;
`;
    await fs.writeFile(fixerPath, code);
    
    // Also update squad.yaml to include the new agent
    const manifestPath = path.join(squadPath, 'squad.yaml');
    let content = await fs.readFile(manifestPath, 'utf-8');
    
    if (!content.includes('id: auto-fixer')) {
        const newAgent = '\\n  - id: auto-fixer\\n    role: mender\\n    description: "Agente de auto-cura (Nascido no Nível 10)."\\n';
        // Inject before # COMMANDS
        content = content.replace('# COMMANDS', newAgent + '# COMMANDS');
        await fs.writeFile(manifestPath, content);
        console.log('✅ Squad Manifest updated with "The Mender".');
    }
  }
};

// --- MAIN MANAGER ---

class EvolutionManager {
  constructor(squadPath = process.cwd()) {
    this.squadPath = squadPath;
    this.manifestPath = path.join(squadPath, 'squad.yaml');
  }

  async loadManifest() {
    try {
      const content = await fs.readFile(this.manifestPath, 'utf-8');
      const nameMatch = content.match(/name:\s*(.*)/);
      const levelMatch = content.match(/level:\s*(\d+)/);
      
      return {
        content,
        name: nameMatch ? nameMatch[1].trim() : 'unknown',
        level: levelMatch ? parseInt(levelMatch[1]) : 0
      };
    } catch (e) {
      throw new Error(`Failed to load manifest: ${e.message}`);
    }
  }

  async evolveSelf() {
    console.log('🧬 Genesis: Initiating STRUCTURAL Evolution Sequence...');
    
    const manifest = await this.loadManifest();
    const currentLevel = manifest.level;
    const nextLevel = currentLevel + 1;
    const nextLevelPad = String(nextLevel).padStart(3, '0');
    
    console.log(`📊 Current Status: NV-${String(currentLevel).padStart(3, '0')} -> Target: NV-${nextLevelPad}`);

    // --- APPLY REAL UPGRADES ---
    if (UPGRADES[nextLevel]) {
        console.log(`🛠️ Applying Structural Upgrade for Level ${nextLevel}...`);
        try {
            await UPGRADES[nextLevel](this.squadPath);
        } catch (error) {
            console.error(`❌ UPGRADE FAILED: ${error.message}`);
            return; // Abort evolution if upgrade fails
        }
    } else {
        console.log(`🔹 No structural changes defined for Level ${nextLevel} (Passive Growth).`);
    }

    // Update Manifest (The cosmetic part, strictly after functional success)
    let newContent = manifest.content.replace(
      /level:\s*\d+/, 
      `level: ${nextLevel}`
    );
    
    newContent = newContent.replace(
      /display_name:\s*".*?"/,
      `display_name: "GenesisObserver-NV:${nextLevelPad}"`
    );

    // Update tags
    newContent = newContent.replace(
        /level-\d+/,
        `level-${nextLevel}`
    );

    // Update description level
    newContent = newContent.replace(
        /Nível Atual: NV-\d+/,
        `Nível Atual: NV-${nextLevelPad}`
    );

    await fs.writeFile(this.manifestPath, newContent);
    
    console.log(`✨ EVOLUTION COMPLETE.`);
    console.log(`🆙 New Level: GenesisObserver-NV:${nextLevelPad}`);
    
    return { success: true, level: nextLevel };
  }
  
  // Method to force re-apply upgrades for current level (Retrospective Evolution)
  async retrofit(targetLevel) {
      console.log(`🔧 RETROFIT: Forcing upgrades up to Level ${targetLevel}...`);
      for (let i = 1; i <= targetLevel; i++) {
          if (UPGRADES[i]) {
              console.log(`... Applying missed upgrade for Level ${i}`);
              await UPGRADES[i](this.squadPath);
          }
      }
      console.log('✅ Retrofit Complete.');
  }
}

// CLI Adaptor
const args = process.argv.slice(2);
const manager = new EvolutionManager();

// Check if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    if (args.includes('self')) {
      manager.evolveSelf();
    } else if (args.includes('retrofit')) {
        // New command to fix empty levels
      manager.retrofit(10); 
    }
}

export default EvolutionManager;