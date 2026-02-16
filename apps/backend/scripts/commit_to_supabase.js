/**
 * Redirecionamento para o script arquivado
 * Mantido para compatibilidade com hooks legados
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = path.join(__dirname, '_archive/commit_to_supabase.js');

console.log('Redirecting hook to archive...');
spawn('node', [target], { stdio: 'inherit' });
