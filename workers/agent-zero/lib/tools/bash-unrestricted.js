/**
 * Tool: bash_unrestricted
 * Executa QUALQUER comando bash sem whitelist
 * v4.0 UNLEASHED - Confiança total
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class BashUnrestrictedTool {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
  }

  definition() {
    return {
      name: 'bash_unrestricted',
      description: 'Execute ANY bash/shell command without whitelist restrictions. Full system access. Use for mkdir, cp, mv, npm, node, git, or any command.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The command to execute (any bash/PowerShell command)'
          },
          cwd: {
            type: 'string',
            description: 'Optional working directory (defaults to project root)'
          },
          timeout: {
            type: 'number',
            description: 'Optional timeout in milliseconds (default 60000)'
          }
        },
        required: ['command']
      }
    };
  }

  async execute(args) {
    const { command, cwd, timeout = 60000 } = args;
    const workDir = cwd || this.projectRoot;

    try {
      // Windows: convert Unix commands to PowerShell/Windows equivalents
      let finalCommand = command;
      if (process.platform === 'win32') {
        finalCommand = this._convertToWindowsCommand(command);
      }

      console.log(`[BASH-UNRESTRICTED] Executing: ${finalCommand}`);
      console.log(`[BASH-UNRESTRICTED] Working dir: ${workDir}`);

      const { stdout, stderr } = await execAsync(finalCommand, {
        cwd: workDir,
        timeout: timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash'
      });

      return {
        success: true,
        tool: 'bash_unrestricted',
        command: command,
        stdout: stdout,
        stderr: stderr || null,
        exit_code: 0
      };

    } catch (error) {
      return {
        success: false,
        tool: 'bash_unrestricted',
        command: command,
        error: error.message,
        stdout: error.stdout || null,
        stderr: error.stderr || null,
        exit_code: error.code || 1
      };
    }
  }

  /**
   * Converte comandos Unix para equivalentes Windows/PowerShell
   * @param {string} command - Comando Unix
   * @returns {string} - Comando Windows/PowerShell
   */
  _convertToWindowsCommand(command) {
    let converted = command;

    // 1. mkdir -p → New-Item -ItemType Directory -Force
    converted = converted.replace(/mkdir\s+-p\s+([^\s&|;]+(?:\s+[^\s&|;]+)*)/g, (match, paths) => {
      const pathArray = paths.trim().split(/\s+/);
      const newItemCmds = pathArray.map(p => `New-Item -ItemType Directory -Path "${p}" -Force -ErrorAction SilentlyContinue`);
      return newItemCmds.join('; ');
    });

    // 2. ls -la / ls -l / ls → Get-ChildItem
    converted = converted.replace(/\bls\s+-la\b/g, 'Get-ChildItem -Force');
    converted = converted.replace(/\bls\s+-l\b/g, 'Get-ChildItem');
    converted = converted.replace(/\bls\b/g, 'Get-ChildItem');

    // 3. rm -rf → Remove-Item -Recurse -Force
    converted = converted.replace(/\brm\s+-rf\s+([^\s&|;]+)/g, 'Remove-Item -Path "$1" -Recurse -Force -ErrorAction SilentlyContinue');
    converted = converted.replace(/\brm\s+-r\s+([^\s&|;]+)/g, 'Remove-Item -Path "$1" -Recurse -ErrorAction SilentlyContinue');
    converted = converted.replace(/\brm\s+([^\s&|;]+)/g, 'Remove-Item -Path "$1" -ErrorAction SilentlyContinue');

    // 4. cp -r → Copy-Item -Recurse
    converted = converted.replace(/\bcp\s+-r\s+([^\s&|;]+)\s+([^\s&|;]+)/g, 'Copy-Item -Path "$1" -Destination "$2" -Recurse -Force');
    converted = converted.replace(/\bcp\s+([^\s&|;]+)\s+([^\s&|;]+)/g, 'Copy-Item -Path "$1" -Destination "$2" -Force');

    // 5. mv → Move-Item
    converted = converted.replace(/\bmv\s+([^\s&|;]+)\s+([^\s&|;]+)/g, 'Move-Item -Path "$1" -Destination "$2" -Force');

    // 6. cat → Get-Content
    converted = converted.replace(/\bcat\s+([^\s&|;]+)/g, 'Get-Content -Path "$1"');

    // 7. grep → Select-String
    converted = converted.replace(/\bgrep\s+"([^"]+)"\s+([^\s&|;]+)/g, 'Select-String -Pattern "$1" -Path "$2"');
    converted = converted.replace(/\bgrep\s+'([^']+)'\s+([^\s&|;]+)/g, 'Select-String -Pattern "$1" -Path "$2"');

    // 8. pwd → Get-Location
    converted = converted.replace(/\bpwd\b/g, 'Get-Location');

    // 9. find → Get-ChildItem -Recurse
    converted = converted.replace(/\bfind\s+([^\s&|;]+)\s+-name\s+"([^"]+)"/g, 'Get-ChildItem -Path "$1" -Filter "$2" -Recurse');
    converted = converted.replace(/\bfind\s+([^\s&|;]+)\s+-name\s+'([^']+)'/g, 'Get-ChildItem -Path "$1" -Filter "$2" -Recurse');

    // 10. touch → New-Item -ItemType File
    converted = converted.replace(/\btouch\s+([^\s&|;]+)/g, 'New-Item -ItemType File -Path "$1" -Force');

    // 11. chmod / chown → Write-Warning (não suportado no Windows)
    converted = converted.replace(/\bchmod\s+[^\s&|;]+\s+([^\s&|;]+)/g, 'Write-Warning "chmod not supported on Windows (file: $1)"');
    converted = converted.replace(/\bchown\s+[^\s&|;]+\s+([^\s&|;]+)/g, 'Write-Warning "chown not supported on Windows (file: $1)"');

    // 12. Converter && para ;
    converted = converted.replace(/\s*&&\s*/g, '; ');

    // 13. Converter | (pipe) para PowerShell pipe (já compatível, mas garantir espaços)
    converted = converted.replace(/\s*\|\s*/g, ' | ');

    return converted;
  }
}

module.exports = BashUnrestrictedTool;
