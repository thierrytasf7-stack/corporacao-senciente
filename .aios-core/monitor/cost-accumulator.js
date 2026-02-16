#!/usr/bin/env node

/**
 * Cost Accumulator for Dev-Aider Status Monitor
 *
 * Manages real-time tracking of economy/savings across dev-aider squad usage.
 * Provides CLI interface to view, reset, and export statistics.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class CostAccumulator {
  constructor() {
    this.dataDir = path.join(os.homedir(), '.aios', 'monitor');
    this.statsFile = path.join(this.dataDir, 'dev-aider-stats.json');
    this.archiveDir = path.join(this.dataDir, 'archives');
    this.ensureDirectories();
    this.load();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.archiveDir)) {
      fs.mkdirSync(this.archiveDir, { recursive: true });
    }
  }

  load() {
    if (fs.existsSync(this.statsFile)) {
      try {
        this.stats = JSON.parse(fs.readFileSync(this.statsFile, 'utf8'));
      } catch (e) {
        console.error('Failed to load stats:', e.message);
        this.stats = this.initStats();
      }
    } else {
      this.stats = this.initStats();
    }
  }

  initStats() {
    return {
      total_tasks: 0,
      aider_tasks: 0,
      claude_tasks: 0,
      total_tokens: 0,
      total_saved: 0.0,
      last_updated: null,
      last_task: null,
      session_start: new Date().toISOString(),
      breakdown: {
        implementation: 0,
        refactoring: 0,
        testing: 0,
        documentation: 0,
        other: 0
      }
    };
  }

  save() {
    this.stats.last_updated = new Date().toISOString();
    fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2));
  }

  recordAiderTask(taskData) {
    const {
      taskType = 'other',
      tokens = 0,
      savings = 0.0,
      description = ''
    } = taskData;

    this.stats.total_tasks += 1;
    this.stats.aider_tasks += 1;
    this.stats.total_tokens += tokens;
    this.stats.total_saved += savings;

    if (taskType in this.stats.breakdown) {
      this.stats.breakdown[taskType] += 1;
    } else {
      this.stats.breakdown.other += 1;
    }

    this.stats.last_task = {
      timestamp: new Date().toISOString(),
      type: taskType,
      tokens,
      savings,
      description,
      source: 'aider'
    };

    this.save();
    return this.getStatus();
  }

  recordClaudeTask(taskData) {
    const { tokens = 0, description = '' } = taskData;

    this.stats.total_tasks += 1;
    this.stats.claude_tasks += 1;
    this.stats.total_tokens += tokens;

    this.stats.last_task = {
      timestamp: new Date().toISOString(),
      type: 'claude_escalation',
      tokens,
      savings: 0.0,
      description,
      source: 'claude'
    };

    this.save();
    return this.getStatus();
  }

  getStatus() {
    return `💰 $${this.stats.total_saved.toFixed(2)} saved | 🤖 ${this.stats.aider_tasks} Aider | 🧠 ${this.stats.claude_tasks} Claude`;
  }

  getFullStatus() {
    const uptime = this.getUptime();

    return `
╔═══════════════════════════════════════════════════════════╗
║              DEV-AIDER STATUS MONITOR                     ║
╚═══════════════════════════════════════════════════════════╝

📊 CURRENT SESSION:
   💵 Total Saved: $${this.stats.total_saved.toFixed(2)}
   🤖 Aider Tasks: ${this.stats.aider_tasks}
   🧠 Claude Tasks: ${this.stats.claude_tasks}
   📈 Total Tokens: ${this.stats.total_tokens.toLocaleString()}
   ⏱️  Uptime: ${uptime}

📋 BREAKDOWN BY TYPE:
${this.getBreakdownText()}

⏱️  LAST TASK:
${this.getLastTaskText()}

💡 INSIGHTS:
${this.getInsights()}

═════════════════════════════════════════════════════════════
    `;
  }

  getBreakdownText() {
    const breakdown = this.stats.breakdown;
    const totalNonZero = Object.values(breakdown).reduce((a, b) => a + b, 0);

    if (totalNonZero === 0) {
      return '   No tasks recorded yet';
    }

    const lines = Object.entries(breakdown)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => {
        const percentage = ((count / this.stats.total_tasks) * 100).toFixed(1);
        return `   • ${type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.slice(1)}: ${count} (${percentage}%)`;
      });

    return lines.join('\n');
  }

  getLastTaskText() {
    if (!this.stats.last_task) {
      return '   No tasks executed yet';
    }

    const task = this.stats.last_task;
    return `
   Type: ${task.type.replace(/_/g, ' ').toUpperCase()}
   Savings: $${task.savings.toFixed(2)}
   Tokens: ${task.tokens.toLocaleString()}
   Time: ${new Date(task.timestamp).toLocaleString()}`;
  }

  getInsights() {
    if (this.stats.total_tasks === 0) {
      return '   Start using dev-aider to see insights!';
    }

    const avgSavingsPerTask = this.stats.total_saved / this.stats.aider_tasks;
    const aiderRatio = ((this.stats.aider_tasks / this.stats.total_tasks) * 100).toFixed(1);

    const insights = [];
    insights.push(`   📈 Avg Savings/Task: $${avgSavingsPerTask.toFixed(2)}`);
    insights.push(`   🎯 Aider Usage Rate: ${aiderRatio}%`);

    if (this.stats.breakdown.implementation > 0) {
      insights.push(`   ✨ Best for: Implementation (${this.stats.breakdown.implementation} tasks)`);
    }

    if (this.stats.total_saved > 100) {
      insights.push(`   🚀 You're a power user - keep it up!`);
    }

    return insights.join('\n');
  }

  getUptime() {
    const start = new Date(this.stats.session_start);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    }
    return `${diffHours}h`;
  }

  reset() {
    // Archive current stats
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveFile = path.join(this.archiveDir, `stats-${timestamp}.json`);
    fs.writeFileSync(archiveFile, JSON.stringify(this.stats, null, 2));

    // Reset stats
    this.stats = this.initStats();
    this.save();

    return `✅ Stats reset. Previous data archived to ${archiveFile}`;
  }

  exportJSON() {
    return JSON.stringify(this.stats, null, 2);
  }

  exportCSV() {
    let csv = 'Metric,Value\n';
    csv += `Total Tasks,${this.stats.total_tasks}\n`;
    csv += `Aider Tasks,${this.stats.aider_tasks}\n`;
    csv += `Claude Tasks,${this.stats.claude_tasks}\n`;
    csv += `Total Tokens,${this.stats.total_tokens}\n`;
    csv += `Total Saved,$${this.stats.total_saved.toFixed(2)}\n\n`;
    csv += `Task Type,Count\n`;

    Object.entries(this.stats.breakdown).forEach(([type, count]) => {
      if (count > 0) {
        csv += `${type},${count}\n`;
      }
    });

    return csv;
  }

  exportMarkdown() {
    let md = '# Dev-Aider Statistics\n\n';
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    md += '## Summary\n\n';
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Tasks | ${this.stats.total_tasks} |\n`;
    md += `| Aider Tasks | ${this.stats.aider_tasks} |\n`;
    md += `| Claude Tasks | ${this.stats.claude_tasks} |\n`;
    md += `| Total Tokens | ${this.stats.total_tokens.toLocaleString()} |\n`;
    md += `| Total Saved | $${this.stats.total_saved.toFixed(2)} |\n\n`;

    md += '## Breakdown by Type\n\n';
    Object.entries(this.stats.breakdown).forEach(([type, count]) => {
      if (count > 0) {
        md += `- **${type}**: ${count}\n`;
      }
    });

    return md;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const accumulator = new CostAccumulator();

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Cost Accumulator for Dev-Aider Status Monitor

Usage: node cost-accumulator.js [command] [options]

Commands:
  status              Show current status (default)
  full                Show full detailed status
  reset               Reset monthly statistics
  export [format]     Export stats (json|csv|markdown)
  record              Record new task (internal use)

Examples:
  node cost-accumulator.js status
  node cost-accumulator.js full
  node cost-accumulator.js reset
  node cost-accumulator.js export json
  node cost-accumulator.js export markdown
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'status':
      console.log(accumulator.getStatus());
      break;

    case 'full':
      console.log(accumulator.getFullStatus());
      break;

    case 'reset':
      console.log(accumulator.reset());
      break;

    case 'export':
      const format = args[1] || 'json';
      switch (format) {
        case 'json':
          console.log(accumulator.exportJSON());
          break;
        case 'csv':
          console.log(accumulator.exportCSV());
          break;
        case 'markdown':
          console.log(accumulator.exportMarkdown());
          break;
        default:
          console.error(`Unknown format: ${format}`);
          process.exit(1);
      }
      break;

    case 'record':
      const taskData = JSON.parse(args[1] || '{}');
      if (taskData.source === 'aider') {
        console.log(accumulator.recordAiderTask(taskData));
      } else {
        console.log(accumulator.recordClaudeTask(taskData));
      }
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Export for use as module
module.exports = CostAccumulator;

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
