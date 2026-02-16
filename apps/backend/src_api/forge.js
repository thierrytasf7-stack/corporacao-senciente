/**
 * API de FORGE Kernel
 * 
 * Endpoints para controle de LLMs, MCPs, Workflows e Tools
 */

import { supabase } from './supabase.js';

/**
 * GET /api/forge/llm/usage - Uso de LLMs
 */
export async function getLLMUsage(req, res) {
  try {
    const { provider, model, agent_id, limit = 100 } = req.query;

    let query = supabase
      .from('llm_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (provider) {
      query = query.eq('provider', provider);
    }

    if (model) {
      query = query.eq('model', model);
    }

    if (agent_id) {
      query = query.eq('agent_id', agent_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calcular métricas agregadas
    const totalCost = (data || []).reduce((sum, usage) => sum + (usage.cost_usd || 0), 0);
    const totalTokens = (data || []).reduce((sum, usage) => sum + (usage.tokens_input || 0) + (usage.tokens_output || 0), 0);

    res.json({
      usage: data || [],
      metrics: {
        totalCost,
        totalTokens,
        count: data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar uso de LLMs:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/forge/mcps - Status de MCPs
 */
export async function getMCPStatus(req, res) {
  try {
    const { status } = req.query;

    let query = supabase
      .from('mcp_status')
      .select('*')
      .order('last_used_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ mcps: data || [] });
  } catch (error) {
    console.error('Erro ao buscar status de MCPs:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/forge/workflows - Execuções de workflows
 */
export async function getWorkflowRuns(req, res) {
  try {
    const { workflow_name, status, limit = 50 } = req.query;

    let query = supabase
      .from('workflow_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(parseInt(limit));

    if (workflow_name) {
      query = query.eq('workflow_name', workflow_name);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ runs: data || [] });
  } catch (error) {
    console.error('Erro ao buscar execuções de workflows:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/forge/tools - Registro de tools
 */
export async function getToolsRegistry(req, res) {
  try {
    const { tool_type, limit = 100 } = req.query;

    let query = supabase
      .from('tools_registry')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(parseInt(limit));

    if (tool_type) {
      query = query.eq('tool_type', tool_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ tools: data || [] });
  } catch (error) {
    console.error('Erro ao buscar registro de tools:', error);
    res.status(500).json({ error: error.message });
  }
}
