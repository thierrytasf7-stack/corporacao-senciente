/**
 * API de Decisões do Boardroom
 * 
 * GET /api/decisions - Lista decisões do boardroom
 */

import { supabase } from './supabase.js';


/**
 * GET /api/decisions
 */
export async function getDecisions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error } = await supabase
      .from('agent_logs')
      .select('*')
      .eq('category', 'boardroom')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Parse thought_process para extrair opiniões (formato simplificado)
    const decisions = (data || []).map(log => {
      const process = log.thought_process || '';

      // Tentar extrair opiniões dos agentes (formato pode variar)
      const architectMatch = process.match(/ARCHITECT[:\n](.*?)(?=\n\n|PRODUCT|DEV|$)/is);
      const productMatch = process.match(/PRODUCT[:\n](.*?)(?=\n\n|ARCHITECT|DEV|$)/is);
      const devMatch = process.match(/DEV[:\n](.*?)(?=\n\n|ARCHITECT|PRODUCT|$)/is);

      return {
        id: log.id,
        timestamp: log.created_at,
        topic: process.substring(0, 100),
        architect: architectMatch ? architectMatch[1].trim() : null,
        product: productMatch ? productMatch[1].trim() : null,
        dev: devMatch ? devMatch[1].trim() : null,
        synthesis: process.length > 200 ? process.substring(200) : null,
        fullText: process,
      };
    });

    res.json({ decisions, total: decisions.length });
  } catch (error) {
    console.error('Erro ao buscar decisões:', error);
    res.status(500).json({ error: error.message });
  }
}






























