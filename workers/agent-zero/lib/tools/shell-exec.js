/**
 * Agent Zero v4.0 - Tool: shell_exec UNLEASHED
 * Executes shell commands with optional sandbox bypass.
 */
const { execFile, exec } = require('child_process');
const path = require('path');

class ShellExecTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.whitelist = config.security?.shell_whitelist || ['npx', 'node', 'npm'];
  }

  definition() {
    return {
      name: 'shell_exec',
      description: `Execute a whitelisted shell command. Only these commands are allowed: ${this.whitelist.join(', ')}. No piping, chaining, or redirection allowed.`,
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: `The command to run. Must start with: ${this.whitelist.join(', ')}` },
          args: {
            type: 'array',
            description: 'Command arguments as separate strings (e.g., ["--yes", "md-to-pdf", "file.md"])',
            items: { type: 'string' }
          }
        },
        required: ['command']
      }
    };
  }

  async execute(args) {
    const { command, args: cmdArgs = [] } = args;

    if (!command) return { success: false, error: 'Command is required' };

    // Security: extract base command
    const baseCmd = command.split(/\s+/)[0].toLowerCase();

    // Check whitelist (support "*" wildcard for unrestricted access)
    const allowAll = this.whitelist.includes('*');
    if (!allowAll && !this.whitelist.includes(baseCmd)) {
      return {
        success: false,
        error: `Command '${baseCmd}' not in whitelist. Allowed: ${this.whitelist.join(', ')}`
      };
    }

    // Security: block dangerous operators ONLY if sandbox enabled
    const sandboxBypass = this.config.security?.sandbox_bypass_enabled || false;
    if (!sandboxBypass) {
      const allParts = [command, ...cmdArgs].join(' ');
      const dangerousPatterns = ['&&', '||', ';', '|', '>', '<', '`', '$(', '%COMSPEC%', 'cmd /c', 'powershell'];
      for (const pattern of dangerousPatterns) {
        if (allParts.includes(pattern)) {
          return { success: false, error: `Blocked: operator '${pattern}' not allowed` };
        }
      }
    }

    const timeout = this.config.timeouts?.shell_exec || 30000;

    // Parse command + args
    const parts = command.split(/\s+/);
    const exe = parts[0];
    const fullArgs = [...parts.slice(1), ...cmdArgs];

    return new Promise((resolve) => {
      // UNLEASHED: use exec (full shell) when sandbox bypassed
      const sandboxBypass = this.config.security?.sandbox_bypass_enabled || false;

      const maxChars = this.config.security?.max_output_chars || 10000;
      const callback = (error, stdout, stderr) => {
        const out = stdout?.length > maxChars ? stdout.substring(0, maxChars) + '\n[...truncated]' : stdout || '';
        const err = stderr?.length > maxChars ? stderr.substring(0, maxChars) + '\n[...truncated]' : stderr || '';

        resolve({
          success: !error,
          stdout: out,
          stderr: err,
          exit_code: error ? error.code || 1 : 0,
          error: error ? error.message : undefined
        });
      };

      if (sandboxBypass) {
        // UNLEASHED MODE: use exec (full shell with cd, &&, pipes, etc)
        const fullCommand = cmdArgs.length > 0 ? `${command} ${cmdArgs.join(' ')}` : command;
        exec(fullCommand, {
          cwd: this.projectRoot,
          timeout,
          maxBuffer: 1024 * 1024,
          windowsHide: true,
          shell: true
        }, callback);
      } else {
        // SAFE MODE: use execFile (no shell interpretation)
        execFile(exe, fullArgs, {
          cwd: this.projectRoot,
          timeout,
          maxBuffer: 1024 * 1024,
          windowsHide: true,
          shell: false
        }, callback);
      }
    });
  }
}

module.exports = ShellExecTool;
