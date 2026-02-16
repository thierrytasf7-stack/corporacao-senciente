import { promises as fs } from 'fs';
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
          if (/\.(js|ts|py|java|go|rb|php)$/i.test(item.name)) {
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
