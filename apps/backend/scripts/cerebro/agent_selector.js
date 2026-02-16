/**
 * Seleção Automática de Agentes - Cérebro 7.0
 * 
 * Sistema inteligente que decide qual agente usar para cada tarefa
 * baseado em especialização, histórico e performance.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { embed } from '../utils/embedding.js';
import { logger } from '../utils/logger.js';
import { callLLM } from '../utils/llm_client.js';

const log = logger.child({ module: 'agent_selector' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Mapa de especializações dos agentes
 */
const AGENT_SPECIALIZATIONS = {
    marketing: {
        keywords: ['campanha', 'publicidade', 'anúncio', 'marketing', 'SEO', 'segmentação', 'ROI', 'conversão', 'tráfego', 'growth', 'audience', 'budget', 'otimização'],
        description: 'Estratégia de marketing, campanhas, publicidade, SEO, análise de mercado, segmentação, A/B testing',
        tools: ['create_campaign', 'optimize_budget', 'analyze_roi', 'segment_audience', 'create_ab_test'],
        score: 0,
    },
    copywriting: {
        keywords: ['texto', 'copy', 'conteúdo', 'comunicação', 'storytelling', 'escrita', 'redação', 'blog', 'artigo', 'post'],
        description: 'Criação de textos persuasivos, storytelling, comunicação eficaz, conteúdo, SEO de conteúdo',
        tools: ['check_grammar', 'analyze_tone', 'publish_content', 'analyze_seo'],
        score: 0,
    },
    sales: {
        keywords: ['venda', 'conversão', 'funil', 'lead', 'CRM', 'negociação', 'cliente', 'proposta'],
        description: 'Vendas, conversão, funil de vendas, CRM, negociação, gestão de leads',
        tools: ['calculate_conversion', 'analyze_funnel'],
        score: 0,
    },
    development: {
        keywords: ['código', 'implementar', 'desenvolver', 'programar', 'feature', 'bug', 'refatorar', 'teste unitário'],
        description: 'Código, arquitetura técnica, implementação, desenvolvimento, testes',
        tools: ['analyze_code', 'create_test', 'refactor'],
        score: 0,
    },
    architect: {
        keywords: ['arquitetura', 'segurança', 'escalabilidade', 'design sistema', 'decisão técnica', 'padrão'],
        description: 'Arquitetura, segurança, escalabilidade, decisões técnicas críticas',
        tools: ['analyze_architecture', 'review_security'],
        score: 0,
    },
    product: {
        keywords: ['produto', 'UX', 'feature', 'roadmap', 'estratégia produto', 'priorização'],
        description: 'Produto, UX, roadmap, features, estratégia de produto',
        tools: ['prioritize_features', 'analyze_ux'],
        score: 0,
    },
    finance: {
        keywords: ['finança', 'custo', 'orçamento', 'ROI financeiro', 'análise financeira', 'investimento'],
        description: 'Finanças, custos, ROI, orçamento, análise financeira',
        tools: ['calculate_roi', 'analyze_costs'],
        score: 0,
    },
    validation: {
        keywords: ['teste', 'QA', 'validação', 'qualidade', 'garantia qualidade'],
        description: 'QA, testes, validação, garantia de qualidade',
        tools: ['run_tests', 'validate_quality'],
        score: 0,
    },
};

/**
 * Seleciona o(s) agente(s) mais adequado(s) para uma tarefa
 * 
 * @param {string} task - Descrição da tarefa
 * @param {object} context - Contexto adicional (prioridade, urgência, etc.)
 * @returns {Promise<object>} Agente(s) selecionado(s) e razão
 */
export async function selectAgentForTask(task, context = {}) {
    log.info('Selecionando agente para tarefa', { task: task.substring(0, 100) });

    try {
        // 1. Buscar contexto similar na memória corporativa
        const taskEmbedding = await embed(task);
        const embeddingStr = `[${taskEmbedding.join(',')}]`;

        const { data: similarMemory } = await supabase
            .rpc('match_corporate_memory', {
                query_embedding: embeddingStr,
                match_count: 5,
            });

        // 2. Buscar tarefas similares já executadas
        const { data: similarTasks } = await supabase
            .rpc('match_task_context', {
                query_embedding: embeddingStr,
                match_count: 5,
            });

        // 3. Buscar decisões passadas similares
        const { data: similarDecisions } = await supabase
            .rpc('match_agent_logs', {
                query_embedding: embeddingStr,
                match_count: 5,
            });

        // 4. Calcular score para cada agente
        const agentScores = await calculateAgentScores(task, taskEmbedding, {
            similarMemory,
            similarTasks,
            similarDecisions,
            context,
        });

        // 5. Selecionar agente(s) com maior score
        const sortedAgents = Object.entries(agentScores)
            .sort((a, b) => b[1].score - a[1].score)
            .map(([name, data]) => ({ name, ...data }));

        const selectedAgent = sortedAgents[0];
        const needsOrchestration = sortedAgents[0].score < 0.8 && sortedAgents[1]?.score > 0.6;

        // 6. Decidir se precisa orquestrar múltiplos agentes
        let orchestration = null;
        if (needsOrchestration) {
            orchestration = await planOrchestration(task, sortedAgents.slice(0, 3));
        }

        // 7. Registrar decisão
        await logAgentSelection(task, selectedAgent, orchestration, {
            similarMemory,
            similarTasks,
            similarDecisions,
        });

        return {
            primaryAgent: selectedAgent.name,
            primaryScore: selectedAgent.score,
            reasoning: selectedAgent.reasoning,
            orchestration,
            alternatives: sortedAgents.slice(1, 3).map(a => ({
                name: a.name,
                score: a.score,
                reasoning: a.reasoning,
            })),
        };

    } catch (error) {
        log.error('Erro ao selecionar agente', { error: error.message });
        // Fallback: usar análise simples por keywords
        return fallbackAgentSelection(task);
    }
}

/**
 * Calcula score de match para cada agente
 */
async function calculateAgentScores(task, taskEmbedding, context) {
    const scores = {};

    for (const [agentName, agentSpec] of Object.entries(AGENT_SPECIALIZATIONS)) {
        let score = 0;
        const reasons = [];

        // 1. Match por keywords (peso: 30%)
        const keywordMatches = agentSpec.keywords.filter(kw =>
            task.toLowerCase().includes(kw.toLowerCase())
        ).length;
        const keywordScore = (keywordMatches / agentSpec.keywords.length) * 0.3;
        score += keywordScore;
        if (keywordScore > 0) {
            reasons.push(`${keywordMatches} keywords encontradas`);
        }

        // 2. Similaridade semântica com especialização (peso: 40%)
        const specEmbedding = await embed(agentSpec.description);
        const similarity = cosineSimilarity(taskEmbedding, specEmbedding);
        const semanticScore = similarity * 0.4;
        score += semanticScore;
        if (semanticScore > 0.2) {
            reasons.push(`Alta similaridade semântica (${(similarity * 100).toFixed(1)}%)`);
        }

        // 3. Histórico de decisões similares (peso: 20%)
        if (context.similarDecisions) {
            const agentDecisions = context.similarDecisions.filter(d =>
                d.agent_name === agentName
            );
            if (agentDecisions.length > 0) {
                const avgSimilarity = agentDecisions.reduce((sum, d) => sum + d.similarity, 0) / agentDecisions.length;
                const historyScore = avgSimilarity * 0.2;
                score += historyScore;
                if (historyScore > 0.1) {
                    reasons.push(`${agentDecisions.length} decisões similares no histórico`);
                }
            }
        }

        // 4. Performance histórica (peso: 10%)
        // TODO: Implementar busca de métricas de performance do agente
        const performanceScore = 0.05; // Placeholder
        score += performanceScore;

        // 5. Análise LLM para validação (ajuste fino)
        const llmValidation = await validateAgentSelectionWithLLM(task, agentName, agentSpec);
        if (llmValidation.confidence > 0.7) {
            score += (llmValidation.confidence - 0.7) * 0.1; // Bonus até 3%
            reasons.push(`Validação LLM: ${llmValidation.reason}`);
        }

        scores[agentName] = {
            score: Math.min(score, 1.0), // Cap em 1.0
            reasoning: reasons.join('; ') || 'Score base calculado',
        };
    }

    return scores;
}

/**
 * Valida seleção de agente usando LLM
 */
async function validateAgentSelectionWithLLM(task, agentName, agentSpec) {
    try {
        const prompt = `Analise se o agente "${agentName}" é adequado para a seguinte tarefa:

Tarefa: ${task}
Especialização do Agente: ${agentSpec.description}
Tools Disponíveis: ${agentSpec.tools.join(', ')}

Responda em JSON:
{
  "confidence": 0.0-1.0,
  "reason": "explicação curta",
  "suitable": true/false
}`;

        const response = await callLLM(
            prompt,
            'Você é um especialista em análise de adequação de agentes para tarefas.',
            0.3
        );

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { confidence: 0.5, reason: 'Análise LLM não disponível', suitable: false };
    } catch (error) {
        log.warn('Erro na validação LLM', { error: error.message });
        return { confidence: 0.5, reason: 'Erro na análise', suitable: false };
    }
}

/**
 * Planeja orquestração de múltiplos agentes
 */
async function planOrchestration(task, topAgents) {
    const prompt = `A tarefa "${task}" pode precisar de múltiplos agentes. Analise:

Agentes candidatos:
${topAgents.map((a, i) => `${i + 1}. ${a.name} (score: ${a.score.toFixed(2)})`).join('\n')}

Planeje uma orquestração:
1. Divida a tarefa em sub-tarefas
2. Atribua cada sub-tarefa a um agente
3. Defina ordem de execução (sequencial/paralelo)
4. Identifique pontos de handoff

Responda em JSON:
{
  "needed": true/false,
  "subtasks": [
    {
      "description": "...",
      "agent": "...",
      "order": 1,
      "depends_on": []
    }
  ],
  "handoffs": [
    {
      "from": "...",
      "to": "...",
      "data": "..."
    }
  ]
}`;

    try {
        const response = await callLLM(
            prompt,
            'Você é um especialista em orquestração de agentes.',
            0.5
        );

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const plan = JSON.parse(jsonMatch[0]);
            if (plan.needed) {
                return plan;
            }
        }
    } catch (error) {
        log.warn('Erro ao planejar orquestração', { error: error.message });
    }

    return null;
}

/**
 * Registra seleção de agente na memória
 */
async function logAgentSelection(task, selectedAgent, orchestration, context) {
    if (!supabase) return;

    try {
        const decisionVector = await embed(`${task} ${selectedAgent.name} ${selectedAgent.reasoning}`);
        const decisionVectorStr = `[${decisionVector.join(',')}]`;

        await supabase.from('agent_logs').insert({
            agent_name: 'cerebro',
            thought_process: JSON.stringify({
                task,
                selected_agent: selectedAgent.name,
                score: selectedAgent.score,
                reasoning: selectedAgent.reasoning,
                orchestration,
                context: {
                    similar_memory_count: context.similarMemory?.length || 0,
                    similar_tasks_count: context.similarTasks?.length || 0,
                    similar_decisions_count: context.similarDecisions?.length || 0,
                },
            }),
            decision_vector: decisionVectorStr,
        });

        log.info('Decisão de agente registrada', {
            task: task.substring(0, 50),
            agent: selectedAgent.name,
            score: selectedAgent.score,
        });
    } catch (error) {
        log.error('Erro ao registrar decisão', { error: error.message });
    }
}

/**
 * Fallback: seleção simples por keywords
 */
function fallbackAgentSelection(task) {
    const taskLower = task.toLowerCase();
    let bestAgent = 'development';
    let bestScore = 0;

    for (const [agentName, agentSpec] of Object.entries(AGENT_SPECIALIZATIONS)) {
        const matches = agentSpec.keywords.filter(kw => taskLower.includes(kw)).length;
        const score = matches / agentSpec.keywords.length;

        if (score > bestScore) {
            bestScore = score;
            bestAgent = agentName;
        }
    }

    return {
        primaryAgent: bestAgent,
        primaryScore: bestScore,
        reasoning: `Seleção por keywords (fallback)`,
        orchestration: null,
        alternatives: [],
    };
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default {
    selectAgentForTask,
};






















