import { promises as fs } from 'fs';
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
    const visionMatch = content.match(/(vision|purpose|mission):?\s*(.*)/i);
    if (visionMatch) this.interpretation.vision = visionMatch[2].trim();

    const goalMatches = content.matchAll(/(aim|goal|plan)\s+to\s+(.*)/gi);
    for (const match of goalMatches) {
      this.interpretation.goals.push(match[2].trim());
    }
  }

  // LV-7 UPGRADE: Pattern Extraction
  extractPatterns(content) {
    const todos = content.matchAll(/(TODO|FIXME|HACK):?\s*(.*)/g);
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
