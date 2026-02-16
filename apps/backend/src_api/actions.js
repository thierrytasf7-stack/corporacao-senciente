/**
 * API de Ações Rápidas
 * 
 * Endpoints para acionar funcionalidades do dashboard:
 * - POST /api/actions/boardroom - Acionar boardroom
 * - POST /api/actions/check-alignment - Verificar alinhamento
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import {
  MarketingAgentImprovements,
  SalesAgentImprovements,
  AutomationAgentImprovements,
  DataAgentImprovements
} from './agent_improvements.js';

const execAsync = promisify(exec);

/**
 * POST /api/actions/boardroom
 */
export async function runBoardroom(req, res) {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Tópico é obrigatório' });
    }

    // Executar boardroom via script
    try {
      const { stdout, stderr } = await execAsync(`npm run board:meeting -- "${topic}"`);
      
      res.json({
        success: true,
        message: 'Boardroom executado com sucesso',
        output: stdout,
        error: stderr || null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        output: error.stdout,
        stderr: error.stderr,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/actions/check-alignment
 */
export async function checkAlignment(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    // Executar check alignment via script
    try {
      const { stdout, stderr } = await execAsync(`npm run check:align -- "${query}"`);
      
      res.json({
        success: true,
        message: 'Alinhamento verificado',
        output: stdout,
        error: stderr || null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        output: error.stdout,
        stderr: error.stderr,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}






























