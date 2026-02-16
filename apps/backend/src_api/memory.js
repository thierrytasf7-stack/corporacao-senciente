/**
 * API de Memória
 * 
 * Endpoints para memórias corporativas, episódicas e insights derivados
 */

import { supabase } from './supabase.js';

/**
 * Funções legadas (compatibilidade)
 */
export async function listMemory(req, res) {
  // Redirecionar para corporate memories
  return getCorporateMemories(req, res);
}

export async function searchMemory(req, res) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query é obrigatório' });
    }

    // Buscar em todas as tabelas de memória
    const [corporate, episodic, insights] = await Promise.all([
      supabase.from('corporate_memory').select('*').ilike('content', `%${query}%`),
      supabase.from('episodic_memory').select('*').ilike('content', `%${query}%`),
      supabase.from('derived_insights').select('*').ilike('content', `%${query}%`),
    ]);

    res.json({
      corporate: corporate.data || [],
      episodic: episodic.data || [],
      insights: insights.data || [],
    });
  } catch (error) {
    console.error('Erro ao buscar memórias:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function addMemory(req, res) {
  // Redirecionar para addCorporateMemory
  return addCorporateMemory(req, res);
}

/**
 * GET /api/memory/corporate - Lista memórias corporativas
 */
export async function getCorporateMemories(req, res) {
  try {
    const { category, limit = 100 } = req.query;

    let query = supabase
      .from('corporate_memory')
      .select('*')
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ memories: data || [] });
  } catch (error) {
    console.error('Erro ao buscar memórias corporativas:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/memory/episodic - Lista memórias episódicas
 */
export async function getEpisodicMemories(req, res) {
  try {
    const { agent_id, limit = 100 } = req.query;

    let query = supabase
      .from('episodic_memory')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (agent_id) {
      query = query.eq('agent_id', agent_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ memories: data || [] });
  } catch (error) {
    console.error('Erro ao buscar memórias episódicas:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/memory/insights - Lista insights derivados
 */
export async function getDerivedInsights(req, res) {
  try {
    const { insight_type, limit = 50 } = req.query;

    let query = supabase
      .from('derived_insights')
      .select('*')
      .order('confidence', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (insight_type) {
      query = query.eq('insight_type', insight_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ insights: data || [] });
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/memory/corporate - Adiciona memória corporativa
 */
export async function addCorporateMemory(req, res) {
  try {
    const { category, content, importance = 5, source } = req.body;

    if (!category || !content) {
      return res.status(400).json({ error: 'category e content são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('corporate_memory')
      .insert([{ category, content, importance, source }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ memory: data });
  } catch (error) {
    console.error('Erro ao adicionar memória corporativa:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/memory/episodic - Adiciona memória episódica
 */
export async function addEpisodicMemory(req, res) {
  try {
    const { agent_id, event_type, content, context } = req.body;

    if (!event_type || !content) {
      return res.status(400).json({ error: 'event_type e content são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('episodic_memory')
      .insert([{ agent_id, event_type, content, context }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ memory: data });
  } catch (error) {
    console.error('Erro ao adicionar memória episódica:', error);
    res.status(500).json({ error: error.message });
  }
}
