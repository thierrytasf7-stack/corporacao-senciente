/**
 * Sistema de Memória Compartilhada do Swarm
 *
 * Gerencia memória compartilhada entre agentes, incluindo:
 * - Decisões tomadas
 * - Histórico de agentes
 * - Conhecimento contextual
 * - Cache inteligente
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SwarmMemory {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.maxCacheSize = 100;
  }

  /**
   * Armazena uma decisão tomada por um agente
   */
  async storeDecision(agent, task, decision, result, metadata = {}) {
    try {
      // Combinar informações em thought_process (única coluna disponível)
      const thoughtProcess = JSON.stringify({
        task: task,
        decision: decision,
        result: result,
        confidence: metadata.confidence || 0.5,
        executionTime: metadata.executionTime || 0,
        timestamp: new Date().toISOString(),
        metadata: metadata
      });

      // Para decision_vector, usar um embedding simples (vetor zero por enquanto)
      const decisionVector = Array(384).fill(0);

      const decisionData = {
        agent_name: agent,
        thought_process: thoughtProcess,
        decision_vector: decisionVector,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('agent_logs')
        .insert(decisionData)
        .select();

      if (error) {
        console.error('Erro ao armazenar decisão:', error);
        return false;
      }

      // Invalidate cache related to this agent
      this.invalidateAgentCache(agent);

      console.log(`✅ Decisão armazenada: ${agent} → ${decision}`);
      return true;
    } catch (error) {
      console.error('Erro ao armazenar decisão:', error);
      return false;
    }
  }

  /**
   * Busca decisões similares baseadas em tarefa
   */
  async getSimilarDecisions(task, limit = 5) {
    try {
      const cacheKey = `similar_${task}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Busca por similaridade no thought_process (única coluna de texto)
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .ilike('thought_process', `%${task}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar decisões similares:', error);
        return [];
      }

      const result = data.map(item => {
        try {
          // Tentar parsear o JSON armazenado
          const parsed = JSON.parse(item.thought_process);
          return {
            agent: item.agent_name,
            task: parsed.task || 'Unknown task',
            decision: parsed.decision || 'Unknown decision',
            result: parsed.result || 'Unknown result',
            confidence: parsed.confidence || 0.5,
            executionTime: parsed.executionTime || 0,
            timestamp: parsed.timestamp || item.created_at,
            metadata: parsed.metadata || {}
          };
        } catch (parseError) {
          // Se não conseguir parsear, usar dados básicos
          return {
            agent: item.agent_name,
            task: 'Unknown task',
            decision: item.thought_process.substring(0, 100) + '...',
            result: 'Unknown result',
            confidence: 0.5,
            executionTime: 0,
            timestamp: item.created_at,
            metadata: {}
          };
        }
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar decisões similares:', error);
      return [];
    }
  }

  /**
   * Busca histórico de um agente específico
   */
  async getAgentHistory(agentName, limit = 10) {
    try {
      const cacheKey = `history_${agentName}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('agent_name', agentName)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico do agente:', error);
        return [];
      }

      const result = data.map(item => {
        try {
          // Tentar parsear o JSON armazenado
          const parsed = JSON.parse(item.thought_process);
          return {
            task: parsed.task || 'Unknown task',
            decision: parsed.decision || 'Unknown decision',
            result: parsed.result || 'Unknown result',
            confidence: parsed.confidence || 0.5,
            executionTime: parsed.executionTime || 0,
            timestamp: parsed.timestamp || item.created_at,
            metadata: parsed.metadata || {}
          };
        } catch (parseError) {
          // Se não conseguir parsear, usar dados básicos
          return {
            agent: item.agent_name,
            task: 'Unknown task',
            decision: item.thought_process.substring(0, 100) + '...',
            result: 'Unknown result',
            confidence: 0.5,
            executionTime: 0,
            timestamp: item.created_at,
            metadata: {}
          };
        }
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar histórico do agente:', error);
      return [];
    }
  }

  /**
   * Busca conhecimento contextual (integra com LangMem)
   */
  async getKnowledge(query, category = null, limit = 5) {
    try {
      const cacheKey = `knowledge_${query}_${category}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      let queryBuilder = supabase
        .from('corporate_memory')
        .select('*')
        .limit(limit);

      // Filtrar por categoria se especificada
      if (category) {
        queryBuilder = queryBuilder.eq('category', category);
      }

      // Buscar por conteúdo (label não existe no schema atual)
      queryBuilder = queryBuilder.ilike('content', `%${query}%`);

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conhecimento:', error);
        return [];
      }

      const result = data.map(item => ({
        id: item.id,
        label: item.content.substring(0, 50) + '...', // Usar início do conteúdo como label
        content: item.content,
        category: item.category,
        tags: [], // Não existe no schema atual
        metadata: {}, // Não existe no schema atual
        created_at: item.created_at
      }));

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erro ao buscar conhecimento:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de performance do agente
   */
  async getAgentStats(agentName) {
    try {
      const cacheKey = `stats_${agentName}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const { data, error } = await supabase
        .from('agent_logs')
        .select('thought_process')
        .eq('agent_name', agentName);

      if (error) {
        console.error('Erro ao buscar estatísticas do agente:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return {
          totalDecisions: 0,
          averageConfidence: 0,
          averageExecutionTime: 0,
          successRate: 0
        };
      }

      const totalDecisions = data.length;

      // Parsear dados dos thought_process para calcular estatísticas
      let totalConfidence = 0;
      let totalExecutionTime = 0;
      let successfulDecisions = 0;
      let validConfidenceCount = 0;
      let validExecutionTimeCount = 0;

      data.forEach(item => {
        try {
          const parsed = JSON.parse(item.thought_process);
          if (parsed.confidence !== undefined) {
            totalConfidence += parsed.confidence;
            validConfidenceCount++;
          }
          if (parsed.executionTime !== undefined) {
            totalExecutionTime += parsed.executionTime;
            validExecutionTimeCount++;
          }
          // Considerar sucesso se não houver indicações de erro
          if (parsed.result && typeof parsed.result === 'string' &&
            !parsed.result.toLowerCase().includes('erro') &&
            !parsed.result.toLowerCase().includes('falha')) {
            successfulDecisions++;
          }
        } catch (parseError) {
          // Ignorar entradas que não conseguem parsear
        }
      });

      const averageConfidence = validConfidenceCount > 0 ? totalConfidence / validConfidenceCount : 0;
      const averageExecutionTime = validExecutionTimeCount > 0 ? totalExecutionTime / validExecutionTimeCount : 0;
      const successRate = totalDecisions > 0 ? (successfulDecisions / totalDecisions) * 100 : 0;

      const stats = {
        totalDecisions,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        averageExecutionTime: Math.round(averageExecutionTime),
        successRate: Math.round(successRate)
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do agente:', error);
      return null;
    }
  }

  /**
   * Limpa cache de um agente específico
   */
  invalidateAgentCache(agentName) {
    for (const [key] of this.cache) {
      if (key.includes(agentName)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtém dados do cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && cached.timestamp) {
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  /**
   * Define dados no cache
   */
  setCache(key, data) {
    // Limpar cache se estiver muito grande
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpa todo o cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Cache de memória limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      timeout: this.cacheTimeout
    };
  }
}

// Instância singleton
export const swarmMemory = new SwarmMemory();

export function getMemory() {
  return swarmMemory;
}

// Função de compatibilidade para o sistema existente
export async function storeDecision(agent, task, decision, result, metadata = {}) {
  return await swarmMemory.storeDecision(agent, task, decision, result, metadata);
}

export async function getSimilarDecisions(task, limit = 5) {
  return await swarmMemory.getSimilarDecisions(task, limit);
}

export async function getAgentHistory(agentName, limit = 10) {
  return await swarmMemory.getAgentHistory(agentName, limit);
}

export async function getKnowledge(query, category = null, limit = 5) {
  return await swarmMemory.getKnowledge(query, category, limit);
}

export async function getAgentStats(agentName) {
  return await swarmMemory.getAgentStats(agentName);
}