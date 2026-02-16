#!/usr/bin/env node
/**
 * PM2 NPM Wrapper - Executa npm/npx no Windows via child_process
 * Uso: node pm2-npm-wrapper.js npm run dev
 *      node pm2-npm-wrapper.js npx vite --port 21303
 */

const { spawn } = require('child_process');
const path = require('path');

// Args: [node, script, comando, ...args]
const [,, comando, ...args] = process.argv;

if (!comando) {
  console.error('[PM2-NPM-WRAPPER] Erro: comando não especificado');
  console.error('Uso: node pm2-npm-wrapper.js <npm|npx> <...args>');
  process.exit(1);
}

// Path completo do executável no Windows
const nodejsPath = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'nodejs');
const executavel = comando === 'npm'
  ? path.join(nodejsPath, 'npm.cmd')
  : path.join(nodejsPath, 'npx.cmd');

console.log(`[PM2-NPM-WRAPPER] Executando: ${executavel} ${args.join(' ')}`);

// No Windows, .cmd files precisam ser executados via cmd.exe
const child = spawn('cmd.exe', ['/c', executavel, ...args], {
  stdio: 'inherit',
  windowsHide: false
});

// Forward exit code
child.on('exit', (code) => {
  process.exit(code || 0);
});

// Error handling
child.on('error', (err) => {
  console.error(`[PM2-NPM-WRAPPER] Erro ao executar ${comando}:`, err);
  process.exit(1);
});
