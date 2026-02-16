/**
 * Agent Zero v3.0 - Tool: file_read
 * Reads a file from the project directory (sandboxed).
 */
const fs = require('fs');
const path = require('path');

class FileReadTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
  }

  definition() {
    return {
      name: 'file_read',
      description: 'Read a file from the project directory. Path must be relative to project root. Returns file content as text.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path to the file (e.g., "src/index.ts", "package.json")' },
          offset: { type: 'number', description: 'Optional: line number to start reading from (0-based)' },
          limit: { type: 'number', description: 'Optional: max number of lines to read' }
        },
        required: ['path']
      }
    };
  }

  async execute(args) {
    const { path: filePath, offset, limit } = args;

    if (!filePath) return { success: false, error: 'Path is required' };

    // Security: prevent path traversal
    const resolved = path.resolve(this.projectRoot, filePath);
    if (!resolved.startsWith(this.projectRoot)) {
      return { success: false, error: 'Path traversal blocked: must stay within project directory' };
    }

    if (!fs.existsSync(resolved)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      return { success: false, error: `Path is a directory, not a file: ${filePath}` };
    }

    try {
      let content = fs.readFileSync(resolved, 'utf-8');

      // Apply offset/limit if provided
      if (offset != null || limit != null) {
        const lines = content.split('\n');
        const start = offset || 0;
        const count = limit || lines.length;
        content = lines.slice(start, start + count).join('\n');
      }

      // Truncate large files
      const maxChars = this.config.security?.max_output_chars || 10000;
      if (content.length > maxChars) {
        content = content.substring(0, maxChars) + '\n[...truncated at ' + maxChars + ' chars]';
      }

      return { success: true, data: content, path: filePath, bytes: stat.size };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = FileReadTool;
