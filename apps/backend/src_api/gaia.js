/**
 * API de GAIA Kernel
 * 
 * Endpoints para gerenciamento de DNA de agentes, evolução e vacinas
 */

import { supabase } from './supabase.js';

/**
 * GET /api/gaia/dna - Lista todos os DNAs de agentes
 */
export async function getAllDNA(req, res) {
  try {
    const { status, limit = 100 } = req.query;
    
    let query = supabase
      .from('agent_dna')
      .select('*')
      .order('xp', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ dna: data || [] });
  } catch (error) {
    console.error('Erro ao buscar DNA:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/gaia/dna/:agentId - Obtém DNA de um agente específico
 */
export async function getAgentDNA(req, res) {
  try {
    const { agentId } = req.params;

    const { data, error } = await supabase
      .from('agent_dna')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return res.status(404).json({ error: 'DNA não encontrado' });
    }

    res.json({ dna: data });
  } catch (error) {
    console.error('Erro ao buscar DNA do agente:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/gaia/dna - Cria novo DNA para agente
 */
export async function createDNA(req, res) {
  try {
    const { agent_id, ...initialData } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id é obrigatório' });
    }

    const { data, error } = await supabase
      .from('agent_dna')
      .insert([{ agent_id, ...initialData }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ dna: data });
  } catch (error) {
    console.error('Erro ao criar DNA:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/gaia/xp - Adiciona XP a um agente
 */
export async function addXP(req, res) {
  try {
    const { agent_id, amount, reason } = req.body;

    if (!agent_id || amount === undefined || !reason) {
      return res.status(400).json({ error: 'agent_id, amount e reason são obrigatórios' });
    }

    // Buscar DNA atual
    const { data: dna, error: dnaError } = await supabase
      .from('agent_dna')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    if (dnaError && dnaError.code !== 'PGRST116') throw dnaError;

    if (!dna) {
      return res.status(404).json({ error: 'DNA não encontrado' });
    }

    const newXP = dna.xp + amount;

    // Log evento
    await supabase.from('agent_evolution_log').insert([{
      agent_id,
      event_type: amount > 0 ? 'XP_GAIN' : 'XP_LOSS',
      event_detail: reason,
      xp_before: dna.xp,
      xp_after: newXP,
    }]);

    // Atualizar XP
    const { data: updatedDNA, error: updateError } = await supabase
      .from('agent_dna')
      .update({ xp: newXP, updated_at: new Date().toISOString() })
      .eq('agent_id', agent_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Verificar promoção
    await checkPromotion(agent_id, newXP);

    res.json({ dna: updatedDNA });
  } catch (error) {
    console.error('Erro ao adicionar XP:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/gaia/vaccines - Lista vacinas
 */
export async function getVaccines(req, res) {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('agent_vaccines')
      .select('*')
      .order('times_applied', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ vaccines: data || [] });
  } catch (error) {
    console.error('Erro ao buscar vacinas:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/gaia/evolution/:agentId - Histórico de evolução de um agente
 */
export async function getEvolutionHistory(req, res) {
  try {
    const { agentId } = req.params;
    const { limit = 50 } = req.query;

    let query = supabase
      .from('agent_evolution_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ history: data || [] });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Função auxiliar para verificar promoção
 */
async function checkPromotion(agentId, currentXP) {
  const { data: dna } = await supabase
    .from('agent_dna')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (!dna) return;

  let newStatus = dna.status;

  if (currentXP >= 2000 && dna.status !== 'APEX') {
    newStatus = 'APEX';
  } else if (currentXP >= 500 && dna.status === 'FLOWERING') {
    newStatus = 'FRUITING';
  } else if (currentXP >= 100 && dna.status === 'GERMINATION') {
    newStatus = 'FLOWERING';
  }

  if (newStatus !== dna.status) {
    // Log promoção
    await supabase.from('agent_evolution_log').insert([{
      agent_id: agentId,
      event_type: 'PROMOTION',
      event_detail: `Promovido de ${dna.status} para ${newStatus}`,
      status_before: dna.status,
      status_after: newStatus,
    }]);

    // Atualizar status
    await supabase
      .from('agent_dna')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('agent_id', agentId);
  }
}
