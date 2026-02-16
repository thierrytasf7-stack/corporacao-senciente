import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// In-memory storage for CLI tool status (in production, this would be stored in a database)
const cliToolStatus = {
  qwenn: false,
  claudecode: false,
  cursor: false,
  aider: false
};

// Install a CLI tool
export const handleCLIInstall = async (req, res) => {
  try {
    const { toolId, command, name } = req.body;

    if (!toolId || !command) {
      return res.status(400).json({ 
        error: 'Missing required fields: toolId and command' 
      });
    }

    console.log(`Installing ${name} using command: ${command}`);

    // Execute the installation command
    const { stdout, stderr } = await execAsync(command);

    // Update the status of the tool
    cliToolStatus[toolId] = true;

    res.json({
      success: true,
      message: `${name} installed successfully`,
      toolId,
      output: stdout || stderr,
      version: '1.0.0' // This would be dynamically determined in a real implementation
    });
  } catch (error) {
    console.error(`Error installing CLI tool:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: `Failed to install the CLI tool`
    });
  }
};

// Get status of installed CLI tools for all PCs
export const getCLIStatus = async (req, res) => {
  try {
    // Check if tools are actually installed by running a version command
    const updatedStatus = {};
    
    for (const [toolId, status] of Object.entries(cliToolStatus)) {
      if (status) {
        // Verify the tool is actually installed by checking its version/command
        try {
          let versionCmd = '';
          
          switch(toolId) {
            case 'qwenn':
              versionCmd = 'qwenn --version 2>&1 || echo "not available"';
              break;
            case 'claudecode':
              versionCmd = 'claude --version 2>&1 || echo "not available"';
              break;
            case 'cursor':
              versionCmd = 'cursor --version 2>&1 || echo "not available"';
              break;
            case 'aider':
              versionCmd = 'aider --version 2>&1 || echo "not available"';
              break;
            default:
              versionCmd = `which ${toolId.split('-').join('')} 2>&1 || echo "not available"`;
          }
          
          const { stdout } = await execAsync(versionCmd);
          updatedStatus[toolId] = !stdout.includes('not available') && !stdout.includes('command not found');
        } catch (checkError) {
          updatedStatus[toolId] = false;
        }
      } else {
        updatedStatus[toolId] = false;
      }
    }

    res.json({
      installedTools: updatedStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error checking CLI status:`, error);
    res.status(500).json({
      error: error.message,
      installedTools: {}
    });
  }
};

// Get status of installed CLI tools for a specific PC
export const getCLISTatusForPC = async (req, res) => {
  try {
    const { pcId } = req.params;
    
    // In a real implementation, this would connect to the specific PC and check its CLI tools
    // For now, we'll simulate the response
    
    // This is a simplified response - in reality, you'd connect to the specific PC
    // and check the actual status of tools on that machine
    const toolsStatus = {};
    
    // Simulate different states for different PCs
    if (pcId === 'pc-001') {
      toolsStatus.qwenn = { status: 'installed', version: '1.2.3', lastUpdated: '2026-01-30' };
      toolsStatus.claudecode = { status: 'installed', version: '2.1.0', lastUpdated: '2026-01-29' };
      toolsStatus.cursor = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.aider = { status: 'installing', version: undefined, lastUpdated: undefined };
    } else if (pcId === 'pc-002') {
      toolsStatus.qwenn = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.claudecode = { status: 'installing', version: undefined, lastUpdated: undefined };
      toolsStatus.cursor = { status: 'installed', version: '0.5.2', lastUpdated: '2026-01-28' };
      toolsStatus.aider = { status: 'installed', version: '0.15.0', lastUpdated: '2026-01-30' };
    } else if (pcId === 'local' || pcId === 'pc-003') {
      toolsStatus.qwenn = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.claudecode = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.cursor = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.aider = { status: 'not-installed', version: undefined, lastUpdated: undefined };
    } else {
      // Default for unknown PCs
      toolsStatus.qwenn = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.claudecode = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.cursor = { status: 'not-installed', version: undefined, lastUpdated: undefined };
      toolsStatus.aider = { status: 'not-installed', version: undefined, lastUpdated: undefined };
    }

    res.json({
      pcId,
      tools: toolsStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error checking CLI status for PC ${req.params.pcId}:`, error);
    res.status(500).json({
      error: error.message,
      tools: {}
    });
  }
};

// Install a CLI tool on a specific PC
export const handleCLIInstallOnPC = async (req, res) => {
  try {
    const { pcId } = req.params;
    const { toolId, command, name } = req.body;

    if (!pcId || !toolId || !command) {
      return res.status(400).json({ 
        error: 'Missing required fields: pcId, toolId and command' 
      });
    }

    console.log(`Installing ${name} on PC ${pcId} using command: ${command}`);

    // In a real implementation, this would connect to the specific PC and execute the command
    // For now, we'll simulate the installation
    
    // Simulate installation process with a delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Random delay between 1-3 seconds
    
    // For demo purposes, assume the installation succeeds
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      // Update the status for the specific tool on the specific PC
      // In a real system, this would be stored in a PC-specific data structure
      
      res.json({
        success: true,
        message: `${name} installed successfully on PC ${pcId}`,
        toolId,
        pcId,
        output: `Successfully installed ${name} on PC ${pcId}`,
        version: '1.0.0' // This would be dynamically determined in a real implementation
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to install ${name} on PC ${pcId}`,
        toolId,
        pcId,
        error: 'Installation failed due to simulated error'
      });
    }
  } catch (error) {
    console.error(`Error installing CLI tool on PC ${req.params.pcId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: `Failed to install the CLI tool on PC ${req.params.pcId}`
    });
  }
};

// Run a CLI command
export const runCLICommand = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ 
        error: 'Missing command field' 
      });
    }

    console.log(`Running command: ${command}`);

    const { stdout, stderr } = await execAsync(command);

    res.json({
      success: true,
      output: stdout,
      error: stderr || null,
      command
    });
  } catch (error) {
    console.error(`Error running command:`, error);
    res.status(500).json({
      success: false,
      output: error.stdout || "",
      error: error.stderr || error.message,
      command
    });
  }
};