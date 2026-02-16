/**
 * Agent Zero v3.0 - Tool: file_write
 * Writes content to a file (sandboxed to allowed directories).
 */
const fs = require('fs');
const path = require('path');

class FileWriteTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.allowedDirs = config.security?.file_write_dirs || [
      'results/', 'data/', 'workers/agent-zero/output/'
    ];
  }

  definition() {
    return {
      name: 'file_write',
      description: 'Write content to a file. v4 UNLEASHED: Can write ANYWHERE in project (sandbox_bypass enabled). Creates parent directories if needed.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path for the file (e.g., "results/report.json")' },
          content: { type: 'string', description: 'The content to write to the file' }
        },
        required: ['path', 'content']
      }
    };
  }

  async execute(args) {
    const { path: filePath, content } = args;

    if (!filePath) return { success: false, error: 'Path is required' };
    if (content == null) return { success: false, error: 'Content is required' };

    // Security: resolve and check within project
    const resolved = path.resolve(this.projectRoot, filePath);
    if (!resolved.startsWith(this.projectRoot)) {
      return { success: false, error: 'Path traversal blocked: must stay within project directory' };
    }

    // Security: check allowed directories
    const normalizedPath = filePath.replace(/\\/g, '/');

    // v4.0 UNLEASHED: "*" means allow ALL paths
    const allowAll = this.allowedDirs.includes('*');
    const isAllowed = allowAll || this.allowedDirs.some(dir => normalizedPath.startsWith(dir));

    if (!isAllowed) {
      return {
        success: false,
        error: `Write blocked: path must start with one of: ${this.allowedDirs.join(', ')}`
      };
    }

    try {
      // Create parent directories
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(resolved, content, 'utf-8');

      return {
        success: true,
        path: filePath,
        bytes: Buffer.byteLength(content, 'utf-8')
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = FileWriteTool;
