/**
 * API de Córtex de Fluxos
 * 
 * Endpoints para gerenciamento de fluxos, execuções e pain tasks
 */

import { supabase } from './supabase.js';

/**
 * GET /api/cortex/flows - Lista todos os fluxos
 */
export async function getFlows(req, res) {
  try {
    const { status, domain, limit = 100 } = req.query;

    let query = supabase
      .from('flows')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    if (domain) {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ flows: data || [] });
  } catch (error) {
    console.error('Erro ao buscar fluxos:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/cortex/flows/:flowId/executions - Histórico de execuções de um fluxo
 */
export async function getFlowExecutions(req, res) {
  try {
    const { flowId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('flow_executions')
      .select('*')
      .eq('flow_id', flowId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ executions: data || [] });
  } catch (error) {
    console.error('Erro ao buscar execuções:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/cortex/pain-tasks - Lista pain tasks (dores a resolver)
 */
export async function getPainTasks(req, res) {
  try {
    const { status, severity, limit = 50 } = req.query;

    let query = supabase
      .from('flow_pain_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ tasks: data || [] });
  } catch (error) {
    console.error('Erro ao buscar pain tasks:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/cortex/flows - Cria novo fluxo
 */
export async function createFlow(req, res) {
  try {
    const { flow_id, name, description, domain, dna_version = '1.0.0' } = req.body;

    if (!flow_id || !name) {
      return res.status(400).json({ error: 'flow_id e name são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('flows')
      .insert([{ flow_id, name, description, domain, dna_version }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ flow: data });
  } catch (error) {
    console.error('Erro ao criar fluxo:', error);
    res.status(500).json({ error: error.message });
  }
}
