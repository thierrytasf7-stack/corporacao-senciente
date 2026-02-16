/**
 * API de Controle do Loop de Evolução
 * 
 * Endpoints:
 * - GET /api/evolution/status - Status do loop
 * - POST /api/evolution/control - Controlar loop (start/stop/pause)
 * - GET /api/evolution/options - Opções pendentes (modo semi)
 * - POST /api/evolution/options - Enviar escolha (modo semi)
 */

import { supabase } from './supabase.js';


// Estado do loop (em produção, usar Redis ou banco)
let loopState = {
  running: false,
  mode: 'semi',
  iteration: 0,
  lastExecution: null,
  currentObjective: null,
  options: null,
};

/**
 * GET /api/evolution/status
 */
export async function getEvolutionStatus(req, res) {
  try {
    let lastDecision = null;
    let currentObjective = null;

    // Tentar buscar dados do Supabase, mas não falhar se não disponível
    try {
      const { data: decisionData, error: decisionError } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('category', 'boardroom')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!decisionError && decisionData) {
        lastDecision = {
          topic: decisionData.thought_process?.substring(0, 100) || 'Última decisão',
          timestamp: decisionData.created_at,
        };
      }
    } catch (error) {
      console.warn('⚠️  Erro ao buscar última decisão:', error.message);
    }

    try {
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('agent_logs')
        .select('content')
        .eq('category', 'objective')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!objectiveError && objectiveData) {
        currentObjective = objectiveData.content?.substring(0, 100) || null;
      }
    } catch (error) {
      console.warn('⚠️  Erro ao buscar objetivo:', error.message);
    }

    res.json({
      ...loopState,
      currentObjective: currentObjective || 'Aguardando início',
      lastDecision,
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    // Retornar erro 500 sem fallback mockado
    res.status(500).json({
      error: 'Erro ao buscar status de evolução',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * POST /api/evolution/control
 */
export async function controlEvolution(req, res) {
  try {
    const { action, mode } = req.body;

    switch (action) {
      case 'start':
        loopState.running = true;
        loopState.lastExecution = new Date().toISOString();
        if (mode) loopState.mode = mode;

        // Em produção, iniciar processo do loop aqui
        // Por enquanto, apenas atualizar estado
        res.json({
          success: true,
          message: 'Loop iniciado',
          mode: loopState.mode,
        });
        break;

      case 'stop':
        loopState.running = false;
        loopState.options = null;
        res.json({ success: true, message: 'Loop parado' });
        break;

      case 'pause':
        loopState.running = false;
        res.json({ success: true, message: 'Loop pausado' });
        break;

      case 'set_mode':
        if (['auto', 'semi'].includes(mode)) {
          loopState.mode = mode;
          res.json({ success: true, mode: loopState.mode });
        } else {
          res.status(400).json({ error: 'Modo inválido' });
        }
        break;

      default:
        res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error) {
    console.error('Erro ao controlar loop:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/evolution/options
 */
export async function getEvolutionOptions(req, res) {
  try {
    res.json({ options: loopState.options || [] });
  } catch (error) {
    console.error('Erro ao buscar opções:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/evolution/options
 */
export async function submitEvolutionOption(req, res) {
  try {
    const { option } = req.body;

    // Processar escolha
    loopState.options = null; // Limpar opções

    // Em produção, enviar escolha para o processo do loop
    res.json({ success: true, message: 'Opção recebida' });
  } catch (error) {
    console.error('Erro ao processar opção:', error);
    res.status(500).json({ error: error.message });
  }
}






























