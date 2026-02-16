/**
 * Módulo de Consciência Corporativa
 * Implementa funções para buscar memória corporativa e objetivos de longo prazo
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Tentar carregar env.local se existir
const envPath = fs.existsSync('env.local') ? 'env.local' : (fs.existsSync('.env') ? '.env' : null);
if (envPath) {
  config({ path: envPath });
}

const supabaseUrl = process.env.SUPABASE_URL || 'https://ffdszaiarxstxbafvedi.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZHN6YWlhcnhzdHhiYWZ2ZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA3MTYsImV4cCI6MjA4MDk3NjcxNn0.pD36vrlixzGi7P9MYaTbOGE9MG8yfZCQx0uRNN0Ez6A';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Busca memória corporativa por query e categoria
 */
export async function buscarMemoriaCorporativa(query, categorias = [], limit = 10) {
  try {
    let queryBuilder = supabase
      .from('corporate_memory')
      .select('*')
      .limit(limit);

    // Filtrar por categorias se fornecidas
    if (categorias.length > 0) {
      queryBuilder = queryBuilder.in('category', categorias);
    }

    // Busca por similaridade de conteúdo (simplificada)
    if (query) {
      queryBuilder = queryBuilder.ilike('content', `%${query}%`);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Erro ao buscar memória corporativa:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      label: item.label || item.title,
      content: item.content,
      category: item.category,
      similarity: Math.random() * 0.5 + 0.5 // Simulação de similaridade
    }));

  } catch (error) {
    console.error('Erro ao buscar memória corporativa:', error);
    return [];
  }
}

/**
 * Obtém objetivos de longo prazo da corporação
 */
export async function obterObjetivosLongoPrazo() {
  return buscarMemoriaCorporativa(
    'objetivos longo prazo evolução futuro roadmap visão',
    ['long_term_goal', 'strategy', 'vision'],
    20
  );
}

/**
 * Busca decisões estratégicas recentes
 */
export async function buscarDecisoesEstrategicas(limit = 10) {
  return buscarMemoriaCorporativa(
    'decisão estratégica importante',
    ['decision', 'strategy', 'governance'],
    limit
  );
}

/**
 * Busca valores e princípios corporativos
 */
export async function buscarValoresCorporativos() {
  return buscarMemoriaCorporativa(
    'valores princípios missão visão cultura',
    ['values', 'mission', 'culture'],
    5
  );
}





