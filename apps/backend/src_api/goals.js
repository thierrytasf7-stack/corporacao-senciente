/**
 * API de Metas/Objetivos
 * 
 * GET /api/goals - Objetivos de longo prazo
 */

import { buscarMemoriaCorporativa } from '../scripts/agents/specialized/consciencia_corporativa.js';


/**
 * GET /api/goals
 */
export async function getGoals(req, res) {
  try {
    // Buscar objetivos de longo prazo da memória corporativa
    const memorias = await buscarMemoriaCorporativa(
      'objetivos longo prazo evolução futuro roadmap visão',
      ['long_term_goal'],
      10
    );

    // Buscar tasks do Jira relacionadas a objetivos
    // Em produção, vincular tasks do Jira com objetivos

    const goals = memorias.map((memoria, idx) => ({
      id: memoria.id || idx,
      title: memoria.label || 'Objetivo de Longo Prazo',
      description: memoria.content,
      progress: null, // Calcular baseado em tasks/PRs relacionados
      nextSteps: [], // Extrair de task_context ou decisões recentes
      category: memoria.category,
      similarity: memoria.similarity,
    }));

    res.json({ goals });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: error.message });
  }
}






























