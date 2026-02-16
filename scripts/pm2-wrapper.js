const { spawn } = require('child_process');
const path = require('path');

// Get arguments: script path is the first arg
const scriptPath = process.argv[2];
const scriptName = path.basename(scriptPath);

if (!scriptPath) {
  console.error('Error: No script path provided to wrapper.');
  process.exit(1);
}

console.log(`🚀 PM2 Wrapper starting PowerShell script: ${scriptName}`);
console.log(`📂 Path: ${scriptPath}`);

// Spawn PowerShell process
const ps = spawn('powershell.exe', [
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-File', scriptPath
], {
  stdio: 'inherit', // Pipe logs directly to parent (PM2)
  windowsHide: false
});

ps.on('error', (err) => {
  console.error(`❌ Failed to start subprocess: ${err.message}`);
});

ps.on('close', (code) => {
  console.log(`Subprocess exited with code ${code}`);
  process.exit(code);
});

// Keep alive if needed logic (auto-restart handled by PM2)
