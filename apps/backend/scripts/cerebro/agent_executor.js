/**
 * Executor de Agentes com Frameworks de Vanguarda
 * 
 * Integra ReAct, ToT e LLMs (Grok/Gemini) nos agentes especializados
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { specializedAgent } from '../frameworks/integrated_agent.js';
import { calculatePerformanceScore, fetchGA4Metrics } from '../utils/analytics_client.js';
import { embed } from '../utils/embedding.js';
import { createCampaign, getCampaignMetrics, listCampaigns, pauseCampaign, resumeCampaign, updateCampaignBudget } from '../utils/google_ads_client.js';
import { analyzeSentiment, formatSentimentResult } from '../utils/huggingface_client.js';
import { checkGrammar, formatGrammarResults } from '../utils/languagetool_client.js';
import { callLLM } from '../utils/llm_client.js';
import { logger } from '../utils/logger.js';
import { analyzeCampaignPerformance, calculateCPA, calculateROI } from '../utils/marketing_metrics.js';
import { metrics } from '../utils/metrics.js';
import { analyzeCompetitors, extractKeywords, searchKeywordVolume } from '../utils/seo_analyzer.js';
import { publishToWordPress } from '../utils/wordpress_client.js';

const log = logger.child({ module: 'agent_executor' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

/**
 * Executa um agente especializado usando frameworks de vanguarda
 * 
 * Se agentName não for especificado, usa seleção automática de agente
 */
export async function executeSpecializedAgent(agentName, question, context = {}) {
    // Se agentName não especificado, selecionar automaticamente
    if (!agentName || agentName === 'auto') {
        const { selectAgentForTask } = await import('./agent_selector.js');
        const selection = await selectAgentForTask(question, context);
        agentName = selection.primaryAgent;

        log.info('Agente selecionado automaticamente', {
            task: question.substring(0, 100),
            agent: agentName,
            score: selection.primaryScore,
            reasoning: selection.reasoning,
        });

        // Se precisa orquestração, executar múltiplos agentes
        if (selection.orchestration?.needed) {
            return await executeOrchestratedAgents(selection.orchestration, question, context);
        }
    }

    log.info('Executando agente especializado', { agentName, question: question.substring(0, 100) });

    const startTime = Date.now();

    // Mapeia agentes para suas especializações
    const agentConfigs = {
        copywriting: {
            role: 'Especialista em Copywriting',
            specialization: 'Criador de textos persuasivos, storytelling e comunicação eficaz.',
            useToT: false,
        },
        marketing: {
            role: 'Especialista em Marketing',
            specialization: 'Estrategista de marketing, campanhas, posicionamento e growth.',
            useToT: false,
        },
        sales: {
            role: 'Especialista em Vendas',
            specialization: 'Expert em vendas, conversão, funil de vendas e pricing.',
            useToT: false,
        },
        finance: {
            role: 'Especialista em Finanças',
            specialization: 'Analista financeiro, custos, ROI, orçamento e planejamento financeiro.',
            useToT: false,
        },
        architect: {
            role: 'Arquiteto de Software',
            specialization: 'Especialista em arquitetura de software, escalabilidade, segurança e design de sistemas.',
            useToT: true, // Decisões arquiteturais são complexas
        },
        product: {
            role: 'Product Manager',
            specialization: 'Especialista em produtos, UX, estratégia de produto e roadmap.',
            useToT: true, // Decisões de produto são estratégicas
        },
        dev: {
            role: 'Desenvolvedor',
            specialization: 'Desenvolvedor full-stack, código limpo, testes e boas práticas.',
            useToT: false,
        },
        validation: {
            role: 'Especialista em Validação e QA',
            specialization: 'QA, testes, validação e garantia de qualidade.',
            useToT: false,
        },
        metrics: {
            role: 'Especialista em Métricas DORA',
            specialization: 'Métricas DORA, performance, lead time, deployment frequency, MTTR, change fail rate.',
            useToT: false,
        },
        devex: {
            role: 'Especialista em Developer Experience',
            specialization: 'Onboarding, Git Hooks, CI/CD, Golden Paths, ambiente de desenvolvimento.',
            useToT: false,
        },
        security: {
            role: 'Especialista em Segurança',
            specialization: 'Segurança, compliance, privacidade e auditoria.',
            useToT: false,
        },
    };

    const config = agentConfigs[agentName] || {
        role: agentName,
        specialization: '',
        useToT: false,
    };

    // Ferramentas disponíveis para o agente
    const tools = buildToolsForAgent(agentName, context);

    try {
        const result = await specializedAgent(
            config.role,
            question,
            tools,
            {
                specialization: config.specialization,
                useToT: config.useToT,
                temperature: 0.7,
                ...context.options,
            }
        );

        const duration = Date.now() - startTime;
        metrics.recordPerformance('agent_execution', duration, {
            agentName,
            success: result.success,
            framework: config.useToT ? 'ToT' : 'ReAct',
        });

        log.info('Agente executado com sucesso', { agentName, duration, success: result.success });

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        log.error('Erro ao executar agente', { agentName, error: error.message, duration });

        metrics.recordPerformance('agent_execution', duration, {
            agentName,
            success: false,
            error: error.message,
        });

        throw error;
    }
}

/**
 * Constrói ferramentas disponíveis para um agente específico
 */
async function buildToolsForAgent(agentName, context) {
    const tools = {};

    // Ferramentas comuns com busca vetorial
    tools.search_memory = async (params) => {
        const { query, limit = 5 } = params;

        if (!supabase) {
            log.warn('Supabase não configurado, retornando resultado vazio');
            return 'Memória corporativa não disponível (Supabase não configurado)';
        }

        try {
            // Gerar embedding da query
            const queryEmbedding = await embed(query);
            const embeddingStr = `[${queryEmbedding.join(',')}]`;

            // Buscar na memória corporativa
            const { data, error } = await supabase.rpc('match_corporate_memory', {
                query_embedding: embeddingStr,
                match_count: limit,
            });

            if (error) {
                log.error('Erro ao buscar memória corporativa', { error: error.message });
                return `Erro ao buscar memória: ${error.message}`;
            }

            if (!data || data.length === 0) {
                return 'Nenhuma memória relevante encontrada';
            }

            // Formatar resultados
            const results = data.map((item, idx) =>
                `[${idx + 1}] (${item.category}, similaridade: ${(item.similarity * 100).toFixed(1)}%)\n${item.content}`
            ).join('\n\n');

            return `Memória corporativa encontrada (${data.length} resultados):\n\n${results}`;
        } catch (error) {
            log.error('Erro ao buscar memória', { error: error.message });
            return `Erro ao buscar memória: ${error.message}`;
        }
    };

    tools.search_knowledge = async (params) => {
        const { query, agentName, limit = 5 } = params;

        if (!supabase) {
            log.warn('Supabase não configurado, retornando resultado vazio');
            return 'Conhecimento especializado não disponível (Supabase não configurado)';
        }

        try {
            // Gerar embedding da query
            const queryEmbedding = await embed(query);
            const embeddingStr = `[${queryEmbedding.join(',')}]`;

            // Buscar no conhecimento especializado usando função RPC de busca vetorial
            const targetAgent = agentName || context.agentName || '';

            // Usar função RPC cerebro_search_specialized_knowledge se disponível
            const { data: vectorData, error: vectorError } = await supabase
                .rpc('cerebro_search_specialized_knowledge', {
                    agent_name_param: targetAgent,
                    query_embedding: embeddingStr,
                    match_count: limit,
                    min_confidence: 0.5,
                });

            if (vectorError) {
                log.warn('Erro ao buscar conhecimento especializado via RPC, tentando fallback', { error: vectorError.message });

                // Fallback: buscar na memória corporativa
                const { data: fallbackData, error: fallbackError } = await supabase
                    .rpc('match_corporate_memory', {
                        query_embedding: embeddingStr,
                        match_count: limit,
                    });

                if (fallbackError || !fallbackData || fallbackData.length === 0) {
                    return 'Nenhum conhecimento especializado encontrado';
                }

                const results = fallbackData.map((item, idx) =>
                    `[${idx + 1}] (similaridade: ${(item.similarity * 100).toFixed(1)}%)\n${item.content}`
                ).join('\n\n');

                return `Conhecimento encontrado (fallback - memória corporativa, ${fallbackData.length} resultados):\n\n${results}`;
            }

            if (!vectorData || vectorData.length === 0) {
                return 'Nenhum conhecimento especializado encontrado para este agente';
            }

            // Formatar resultados
            const results = vectorData.map((item, idx) =>
                `[${idx + 1}] ${item.source_type} (qualidade: ${(item.quality_score * 100).toFixed(0)}%)\n${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}\nFonte: ${item.source_url || 'N/A'}`
            ).join('\n\n');

            return `Conhecimento especializado encontrado (${vectorData.length} resultados):\n\n${results}`;
        } catch (error) {
            log.error('Erro ao buscar conhecimento especializado', { error: error.message });
            return `Erro ao buscar conhecimento: ${error.message}`;
        }
    };

    // Ferramentas específicas por agente
    switch (agentName) {
        case 'dev':
            tools.analyze_code = async (params) => {
                return `Código analisado: ${params.file}`;
            };
            tools.create_test = async (params) => {
                return `Teste criado para: ${params.function}`;
            };
            break;

        case 'copywriting':
            // Grammar checking tool (real implementation)
            tools.check_grammar = async (params) => {
                const { text, language = 'en-US' } = params;

                if (!text || text.trim().length === 0) {
                    return '❌ Texto vazio. Por favor, forneça um texto para verificar.';
                }

                try {
                    const result = await checkGrammar(text, language);
                    return formatGrammarResults(result);
                } catch (error) {
                    log.error('Erro ao verificar gramática', { error: error.message });
                    return `❌ Erro ao verificar gramática: ${error.message}`;
                }
            };

            // Tone analysis tool (real implementation)
            tools.analyze_tone = async (params) => {
                const { text } = params;

                if (!text || text.trim().length === 0) {
                    return '❌ Texto vazio. Por favor, forneça um texto para analisar.';
                }

                try {
                    // Análise de sentimento via Hugging Face
                    const sentiment = await analyzeSentiment(text);

                    // Análise de tom detalhada via LLM
                    const tonePrompt = `Analyze the tone of this text in detail. Consider:
- Formality level (formal, casual, conversational)
- Emotional tone (persuasive, informative, friendly, authoritative)
- Writing style (direct, narrative, technical)
- Target audience appropriateness

Text: ${text}

Provide a detailed analysis in Portuguese.`;

                    const toneAnalysis = await callLLM(
                        tonePrompt,
                        'You are a copywriting expert specializing in tone analysis. Provide detailed, actionable insights.',
                        0.7
                    );

                    const sentimentFormatted = formatSentimentResult(sentiment);

                    return `${sentimentFormatted}\n\n📝 Análise de Tom Detalhada:\n${toneAnalysis}`;
                } catch (error) {
                    log.error('Erro ao analisar tom', { error: error.message });
                    return `❌ Erro ao analisar tom: ${error.message}`;
                }
            };

            // SEO analysis tool (new)
            tools.analyze_seo = async (params) => {
                const { text, url } = params;

                if (!text || text.trim().length === 0) {
                    return '❌ Texto vazio. Por favor, forneça um texto para analisar SEO.';
                }

                try {
                    // Extrair keywords
                    const keywords = extractKeywords(text);

                    if (keywords.length === 0) {
                        return '⚠️ Nenhuma keyword relevante encontrada no texto.';
                    }

                    // Buscar volume de busca
                    const searchVolume = await searchKeywordVolume(keywords);

                    // Analisar competidores
                    const competitors = await analyzeCompetitors(keywords);

                    let output = `🔍 Análise de SEO\n\n`;
                    output += `📊 Keywords Encontradas (${keywords.length}):\n`;
                    keywords.forEach((keyword, idx) => {
                        output += `  ${idx + 1}. ${keyword}\n`;
                    });

                    output += `\n📈 Volume de Busca:\n`;
                    Object.entries(searchVolume).forEach(([keyword, data]) => {
                        if (data.error) {
                            output += `  ${keyword}: ⚠️ ${data.error}\n`;
                        } else {
                            output += `  ${keyword}: ${data.volume.toLocaleString()} resultados\n`;
                        }
                    });

                    if (competitors.competitors && competitors.competitors.length > 0) {
                        output += `\n🏆 Top Competidores:\n`;
                        competitors.competitors.slice(0, 5).forEach((comp, idx) => {
                            output += `  ${idx + 1}. ${comp.domain} (posição ${comp.position} para "${comp.keyword}")\n`;
                        });
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao analisar SEO', { error: error.message });
                    return `❌ Erro ao analisar SEO: ${error.message}`;
                }
            };

            // Content publishing tool (new)
            tools.publish_content = async (params) => {
                const { title, content, status = 'draft', metadata = {} } = params;

                if (!title || !content) {
                    return '❌ Título e conteúdo são obrigatórios para publicar.';
                }

                try {
                    const post = await publishToWordPress({
                        title,
                        content,
                        status,
                        metadata,
                    });

                    // Salvar referência no Supabase se disponível
                    if (supabase) {
                        try {
                            await supabase.from('corporate_memory').insert({
                                content: `Post publicado: ${title} - ${post.url}`,
                                category: 'history',
                                sensitivity: 'low',
                            });
                        } catch (error) {
                            log.warn('Erro ao salvar referência no Supabase', { error: error.message });
                        }
                    }

                    return `✅ Conteúdo publicado com sucesso!\n\n📝 Título: ${post.title}\n🔗 URL: ${post.url}\n📊 Status: ${post.status}`;
                } catch (error) {
                    log.error('Erro ao publicar conteúdo', { error: error.message });
                    return `❌ Erro ao publicar conteúdo: ${error.message}\n\n💡 Dica: Verifique se WORDPRESS_URL, WORDPRESS_USERNAME e WORDPRESS_APP_PASSWORD estão configurados.`;
                }
            };

            // Campaign creation tool (new)
            tools.create_campaign = async (params) => {
                const { name, copyVariants, targetAudience } = params;

                if (!name) {
                    return '❌ Nome da campanha é obrigatório.';
                }

                try {
                    // Criar campanha no Supabase
                    if (!supabase) {
                        return '❌ Supabase não configurado. Não é possível criar campanha.';
                    }

                    const { data: campaign, error } = await supabase
                        .from('cerebro_competitor_analysis')
                        .insert({
                            competitor_name: name,
                            analysis_type: 'campaign',
                            findings: JSON.stringify({
                                copyVariants: copyVariants || [],
                                targetAudience: targetAudience || {},
                                status: 'draft',
                                created_at: new Date().toISOString(),
                            }),
                            metadata: {
                                type: 'campaign',
                                variants: copyVariants?.length || 0,
                            },
                        })
                        .select()
                        .single();

                    if (error) {
                        throw error;
                    }

                    // Handoff para Marketing Agent (salvar contexto)
                    const handoffContext = {
                        action: 'review_campaign',
                        campaignId: campaign.id,
                        campaignName: name,
                        copyVariants,
                        targetAudience,
                    };

                    // Salvar contexto de handoff
                    await supabase.from('corporate_memory').insert({
                        content: `Campanha criada: ${name} - Handoff para Marketing Agent`,
                        category: 'history',
                        sensitivity: 'low',
                        metadata: handoffContext,
                    });

                    return `✅ Campanha criada com sucesso!\n\n📝 Nome: ${name}\n🆔 ID: ${campaign.id}\n📊 Variantes: ${copyVariants?.length || 0}\n🔄 Handoff para Marketing Agent realizado`;
                } catch (error) {
                    log.error('Erro ao criar campanha', { error: error.message });
                    return `❌ Erro ao criar campanha: ${error.message}`;
                }
            };

            // Performance analysis tool (new)
            tools.analyze_performance = async (params) => {
                const { url, startDate, endDate } = params;

                if (!url) {
                    return '❌ URL é obrigatória para analisar performance.';
                }

                try {
                    const metrics = await fetchGA4Metrics(url, startDate, endDate);
                    const score = calculatePerformanceScore(metrics);

                    let output = `📊 Análise de Performance\n\n`;
                    output += `🔗 URL: ${url}\n\n`;

                    if (metrics.error) {
                        output += `⚠️ ${metrics.error}\n\n`;
                        output += `💡 Dica: Configure GOOGLE_ANALYTICS_PROPERTY_ID e credenciais OAuth para análise completa.`;
                    } else {
                        output += `📈 Métricas:\n`;
                        output += `  • Pageviews: ${metrics.pageviews.toLocaleString()}\n`;
                        output += `  • Usuários: ${metrics.users.toLocaleString()}\n`;
                        output += `  • Tempo médio: ${Math.round(metrics.avgTimeOnPage)}s\n`;
                        output += `  • Taxa de rejeição: ${(metrics.bounceRate * 100).toFixed(1)}%\n\n`;
                        output += `⭐ Score de Performance: ${score}/100\n`;
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao analisar performance', { error: error.message });
                    return `❌ Erro ao analisar performance: ${error.message}`;
                }
            };
            break;

        case 'finance':
            tools.calculate_roi = async (params) => {
                return `ROI calculado: ${params.investment} investido, ${params.return} retorno`;
            };
            break;

        case 'marketing':
            // Criar campanha de marketing
            tools.create_campaign = async (params) => {
                const { name, objective, dailyBudget, platform = 'google_ads', keywords = [], adCopy, targetAudience } = params;

                if (!name || !objective || !dailyBudget) {
                    return '❌ Nome, objetivo e orçamento diário são obrigatórios.';
                }

                try {
                    let result;

                    if (platform === 'google_ads') {
                        // createCampaign espera orçamento em reais (não centavos)
                        // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
                        // if (platform === 'facebook_ads') {
                        //     result = await createFacebookCampaign({ name, objective, dailyBudget, keywords, adCopy, targetAudience });
                        // }

                        result = await createCampaign({
                            name,
                            objective: objective.toUpperCase(),
                            dailyBudget: parseFloat(dailyBudget), // Em reais
                            keywords: Array.isArray(keywords) ? keywords : [],
                            adGroupName: `${name} - Ad Group`,
                            adCopy: adCopy || {},
                        });

                        // Salvar no Supabase
                        if (supabase && result.success) {
                            const { error } = await supabase
                                .from('cerebro_marketing_campaigns')
                                .insert({
                                    name,
                                    status: 'paused', // Campanha inicia pausada
                                    platform: 'google_ads',
                                    campaign_type: 'search',
                                    objective: objective.toLowerCase(),
                                    daily_budget: parseFloat(dailyBudget),
                                    platform_campaign_id: result.campaignId.toString(),
                                    keywords: keywords,
                                    target_audience: targetAudience || {},
                                    ad_variants: adCopy ? [adCopy] : [],
                                });

                            if (error) {
                                log.error('Erro ao salvar campanha no Supabase', { error: error.message });
                            }
                        }

                        return `✅ Campanha Google Ads criada: ${result.campaignId}\nNome: ${name}\nStatus: ${result.status}\n${result.message}`;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada. Use 'google_ads' por enquanto.`;
                    }
                } catch (error) {
                    log.error('Erro ao criar campanha', { error: error.message });
                    return `❌ Erro ao criar campanha: ${error.message}`;
                }
            };

            // Otimizar orçamento de campanha
            tools.optimize_budget = async (params) => {
                const { campaignId, platform = 'google_ads', newBudget, reason } = params;

                if (!campaignId || !newBudget) {
                    return '❌ ID da campanha e novo orçamento são obrigatórios.';
                }

                try {
                    // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
                    // if (platform === 'facebook_ads') {
                    //     const result = await updateFacebookCampaignBudget(campaignId, parseFloat(newBudget));
                    //     // ... atualizar Supabase
                    //     return `✅ Orçamento otimizado: ${result.message}`;
                    // }

                    if (platform === 'google_ads') {
                        // updateCampaignBudget espera orçamento em centavos (para compatibilidade)
                        const budgetInCents = Math.round(parseFloat(newBudget) * 100);
                        const result = await updateCampaignBudget(campaignId, budgetInCents);

                        // Atualizar no Supabase
                        if (supabase && result.success) {
                            const { error } = await supabase
                                .from('cerebro_marketing_campaigns')
                                .update({
                                    daily_budget: parseFloat(newBudget),
                                    updated_at: new Date().toISOString(),
                                })
                                .eq('platform_campaign_id', campaignId);

                            if (error) {
                                log.error('Erro ao atualizar orçamento no Supabase', { error: error.message });
                            }
                        }

                        return `✅ Orçamento otimizado: ${result.message}\nCampanha: ${campaignId}\nNovo orçamento: R$ ${newBudget}/dia`;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada.`;
                    }
                } catch (error) {
                    log.error('Erro ao otimizar orçamento', { error: error.message });
                    return `❌ Erro ao otimizar orçamento: ${error.message}`;
                }
            };

            // Analisar ROI de campanha
            tools.analyze_roi = async (params) => {
                const { campaignId, platform = 'google_ads', startDate, endDate } = params;

                if (!campaignId) {
                    return '❌ ID da campanha é obrigatório.';
                }

                try {
                    const defaultEndDate = endDate || new Date().toISOString().split('T')[0];
                    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                    if (platform === 'google_ads') {
                        const metrics = await getCampaignMetrics(campaignId, defaultStartDate, defaultEndDate);

                        if (!metrics.success) {
                            return `❌ ${metrics.message}`;
                        }

                        // Calcular métricas adicionais
                        const roi = calculateROI(metrics.cost, metrics.revenue || 0);
                        const cpa = calculateCPA(metrics.cost, metrics.conversions);
                        const roas = metrics.revenue && metrics.cost > 0 ? metrics.revenue / metrics.cost : 0;

                        // Buscar receita do Google Analytics se disponível
                        let revenueFromGA = 0;
                        if (supabase) {
                            // Tentar buscar receita do GA4 se configurado
                            // Por enquanto, usar revenue da campanha
                        }

                        // Análise de performance
                        const analysis = analyzeCampaignPerformance({
                            impressions: metrics.impressions,
                            clicks: metrics.clicks,
                            conversions: metrics.conversions,
                            spend: metrics.cost,
                            revenue: metrics.revenue || revenueFromGA,
                        });

                        let output = `📊 Análise de ROI - Campanha ${campaignId}\n\n`;
                        output += `📅 Período: ${defaultStartDate} até ${defaultEndDate}\n\n`;
                        output += `💰 Métricas Financeiras:\n`;
                        output += `   Gasto: R$ ${metrics.cost.toFixed(2)}\n`;
                        output += `   Receita: R$ ${(metrics.revenue || 0).toFixed(2)}\n`;
                        output += `   ROI: ${roi.toFixed(2)}%\n`;
                        output += `   ROAS: ${roas.toFixed(2)}:1\n`;
                        output += `   CPA: R$ ${cpa.toFixed(2)}\n\n`;
                        output += `📈 Métricas de Performance:\n`;
                        output += `   Impressões: ${metrics.impressions.toLocaleString()}\n`;
                        output += `   Cliques: ${metrics.clicks.toLocaleString()}\n`;
                        output += `   CTR: ${metrics.ctr.toFixed(2)}%\n`;
                        output += `   CPC: R$ ${metrics.averageCpc.toFixed(2)}\n`;
                        output += `   Conversões: ${metrics.conversions}\n`;
                        output += `   Taxa de Conversão: ${analysis.metrics.conversionRate.toFixed(2)}%\n\n`;
                        output += `📊 Score de Performance: ${analysis.performanceScore}/100\n\n`;

                        if (analysis.recommendations.length > 0) {
                            output += `💡 Recomendações:\n`;
                            analysis.recommendations.forEach((rec, idx) => {
                                output += `   ${idx + 1}. ${rec}\n`;
                            });
                        }

                        // Salvar métricas no Supabase
                        if (supabase) {
                            const { error } = await supabase
                                .from('cerebro_marketing_metrics')
                                .upsert({
                                    campaign_id: campaignId,
                                    date: defaultEndDate,
                                    platform: platform,
                                    impressions: metrics.impressions,
                                    clicks: metrics.clicks,
                                    conversions: metrics.conversions,
                                    spend: metrics.cost,
                                    revenue: metrics.revenue || 0,
                                    roi: roi,
                                    ctr: metrics.ctr,
                                    cpc: metrics.averageCpc,
                                    cpa: cpa,
                                    conversion_rate: analysis.metrics.conversionRate,
                                }, {
                                    onConflict: 'campaign_id,date,platform',
                                });

                            if (error) {
                                log.error('Erro ao salvar métricas no Supabase', { error: error.message });
                            }
                        }

                        return output;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada.`;
                    }
                } catch (error) {
                    log.error('Erro ao analisar ROI', { error: error.message });
                    return `❌ Erro ao analisar ROI: ${error.message}`;
                }
            };

            // Listar campanhas
            tools.list_campaigns = async (params) => {
                const { platform = 'google_ads', status } = params;

                try {
                    if (platform === 'google_ads') {
                        const result = await listCampaigns();

                        if (!result.success || result.campaigns.length === 0) {
                            return '⚠️ Nenhuma campanha encontrada.';
                        }

                        let output = `📋 Campanhas Google Ads (${result.campaigns.length})\n\n`;
                        result.campaigns
                            .filter(c => !status || c.status === status.toUpperCase())
                            .forEach(campaign => {
                                output += `ID: ${campaign.id}\n`;
                                output += `Nome: ${campaign.name}\n`;
                                output += `Status: ${campaign.status}\n`;
                                if (campaign.startDate) output += `Início: ${campaign.startDate}\n`;
                                if (campaign.endDate) output += `Fim: ${campaign.endDate}\n`;
                                output += `---\n`;
                            });

                        return output;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada.`;
                    }
                } catch (error) {
                    log.error('Erro ao listar campanhas', { error: error.message });
                    return `❌ Erro ao listar campanhas: ${error.message}`;
                }
            };

            // Pausar campanha
            tools.pause_campaign = async (params) => {
                const { campaignId, platform = 'google_ads' } = params;

                if (!campaignId) {
                    return '❌ ID da campanha é obrigatório.';
                }

                try {
                    if (platform === 'google_ads') {
                        const result = await pauseCampaign(campaignId);

                        if (supabase && result.success) {
                            await supabase
                                .from('cerebro_marketing_campaigns')
                                .update({ status: 'paused' })
                                .eq('platform_campaign_id', campaignId);
                        }

                        return `✅ ${result.message}`;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada.`;
                    }
                } catch (error) {
                    log.error('Erro ao pausar campanha', { error: error.message });
                    return `❌ Erro ao pausar campanha: ${error.message}`;
                }
            };

            // Retomar campanha
            tools.resume_campaign = async (params) => {
                const { campaignId, platform = 'google_ads' } = params;

                if (!campaignId) {
                    return '❌ ID da campanha é obrigatório.';
                }

                try {
                    if (platform === 'google_ads') {
                        const result = await resumeCampaign(campaignId);

                        if (supabase && result.success) {
                            await supabase
                                .from('cerebro_marketing_campaigns')
                                .update({ status: 'active' })
                                .eq('platform_campaign_id', campaignId);
                        }

                        return `✅ ${result.message}`;
                    } else {
                        return `⚠️ Plataforma ${platform} ainda não implementada.`;
                    }
                } catch (error) {
                    log.error('Erro ao retomar campanha', { error: error.message });
                    return `❌ Erro ao retomar campanha: ${error.message}`;
                }
            };

            // Analisar concorrentes (reutiliza SEO analyzer)
            tools.analyze_competitors = async (params) => {
                const { keywords, industry } = params;

                if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
                    return '❌ Lista de keywords é obrigatória.';
                }

                try {
                    const competitors = await analyzeCompetitors(keywords);

                    let output = `🔍 Análise de Concorrentes\n\n`;
                    output += `Keywords analisadas: ${keywords.join(', ')}\n\n`;
                    output += `📊 Concorrentes encontrados:\n`;
                    output += JSON.stringify(competitors, null, 2);

                    return output;
                } catch (error) {
                    log.error('Erro ao analisar concorrentes', { error: error.message });
                    return `❌ Erro ao analisar concorrentes: ${error.message}`;
                }
            };

            // Segmentação de audiência
            tools.segment_audience = async (params) => {
                const { demographics, behavior, interests, platform = 'google_ads' } = params;

                // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
                // if (platform === 'facebook_ads') {
                //     return await segmentFacebookAudience({ demographics, behavior, interests });
                // }

                if (platform !== 'google_ads') {
                    return `⚠️ Plataforma ${platform} ainda não suportada para segmentação. Use 'google_ads' por enquanto.`;
                }

                try {
                    // Análise básica de segmentação usando LLM
                    const segmentPrompt = `Analise os seguintes dados demográficos e comportamentais e crie uma segmentação de audiência detalhada:

Demográficos: ${JSON.stringify(demographics || {})}
Comportamento: ${JSON.stringify(behavior || {})}
Interesses: ${JSON.stringify(interests || {})}

Retorne JSON com:
{
  "segments": [
    {
      "name": "Nome do segmento",
      "description": "Descrição",
      "demographics": {...},
      "behavior": {...},
      "interests": [...],
      "estimated_size": "tamanho estimado",
      "recommended_channels": ["google_ads", "facebook_ads"],
      "recommended_budget": "orçamento sugerido"
    }
  ],
  "recommendations": ["recomendação 1", "recomendação 2"]
}`;

                    const analysis = await callLLM(
                        segmentPrompt,
                        'Você é um especialista em segmentação de audiência e marketing digital.',
                        0.7
                    );

                    // Tentar extrair JSON
                    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
                    let segments = null;
                    if (jsonMatch) {
                        try {
                            segments = JSON.parse(jsonMatch[0]);
                        } catch (e) {
                            log.warn('Erro ao parsear JSON de segmentação', { error: e.message });
                        }
                    }

                    // Salvar segmentos no Supabase
                    if (supabase && segments && segments.segments) {
                        for (const segment of segments.segments) {
                            await supabase.from('cerebro_marketing_audiences').upsert({
                                name: segment.name,
                                description: segment.description,
                                demographics: segment.demographics || {},
                                behavior: segment.behavior || {},
                                interests: segment.interests || [],
                                estimated_size: segment.estimated_size || 'unknown',
                                recommended_channels: segment.recommended_channels || ['google_ads'],
                                metadata: {
                                    created_by: 'marketing_agent',
                                    platform: platform,
                                    analysis_date: new Date().toISOString(),
                                },
                            }, {
                                onConflict: 'name',
                            });
                        }
                    }

                    let output = `🎯 Segmentação de Audiência\n\n`;
                    if (segments && segments.segments) {
                        output += `📊 Segmentos Criados (${segments.segments.length}):\n\n`;
                        segments.segments.forEach((seg, idx) => {
                            output += `${idx + 1}. ${seg.name}\n`;
                            output += `   Descrição: ${seg.description}\n`;
                            output += `   Tamanho estimado: ${seg.estimated_size}\n`;
                            output += `   Canais recomendados: ${seg.recommended_channels.join(', ')}\n`;
                            output += `   Orçamento sugerido: ${seg.recommended_budget}\n\n`;
                        });

                        if (segments.recommendations && segments.recommendations.length > 0) {
                            output += `💡 Recomendações:\n`;
                            segments.recommendations.forEach((rec, idx) => {
                                output += `   ${idx + 1}. ${rec}\n`;
                            });
                        }
                    } else {
                        output += `📊 Análise de Segmentação:\n\n${analysis}\n\n`;
                        output += `⚠️ Não foi possível extrair segmentos estruturados. Análise acima.`;
                    }

                    return output;

                } catch (error) {
                    log.error('Erro ao segmentar audiência', { error: error.message });
                    return `❌ Erro ao segmentar audiência: ${error.message}`;
                }
            };

            // Criar teste A/B
            tools.create_ab_test = async (params) => {
                const { name, objective, dailyBudget, keywords, adCopy, targetAudience, variantCount = 2, platform = 'google_ads' } = params;

                if (!name || !objective || !dailyBudget) {
                    return '❌ Nome, objetivo e orçamento diário são obrigatórios.';
                }

                // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
                // if (platform === 'facebook_ads') {
                //     const { createABTestVariants } = await import('./marketing_ab_testing.js');
                //     return await createABTestVariants(params, variantCount);
                // }

                if (platform !== 'google_ads') {
                    return `⚠️ Plataforma ${platform} ainda não suportada para A/B testing. Use 'google_ads' por enquanto.`;
                }

                try {
                    const { createABTestVariants } = await import('./marketing_ab_testing.js');
                    const result = await createABTestVariants(params, variantCount);

                    if (!result.success) {
                        return `❌ Erro ao criar teste A/B: ${result.message}`;
                    }

                    let output = `🧪 Teste A/B Criado: ${result.testName}\n\n`;
                    output += `📊 Variantes Criadas (${result.variants.length}):\n\n`;
                    result.variants.forEach((variant, idx) => {
                        output += `${String.fromCharCode(65 + idx)}. ${variant.variantName}\n`;
                        output += `   ID: ${variant.variantId}\n`;
                        output += `   Status: ${variant.status}\n\n`;
                    });
                    output += `\n${result.message}\n`;
                    output += `\n💡 Próximos passos:\n`;
                    output += `   1. Revise as variantes no Google Ads\n`;
                    output += `   2. Ative as variantes manualmente\n`;
                    output += `   3. Aguarde ${variantCount} dias para coletar dados\n`;
                    output += `   4. Use analyze_ab_test para ver resultados\n`;

                    return output;

                } catch (error) {
                    log.error('Erro ao criar teste A/B', { error: error.message });
                    return `❌ Erro ao criar teste A/B: ${error.message}`;
                }
            };

            // Analisar resultados de teste A/B
            tools.analyze_ab_test = async (params) => {
                const { testName, minDays = 7 } = params;

                if (!testName) {
                    return '❌ Nome do teste A/B é obrigatório.';
                }

                try {
                    const { analyzeABTestResults } = await import('./marketing_ab_testing.js');
                    const result = await analyzeABTestResults(testName, minDays);

                    if (!result.success) {
                        return `❌ Erro ao analisar teste A/B: ${result.message}`;
                    }

                    let output = `📊 Análise de Teste A/B: ${testName}\n\n`;
                    output += `🏆 Vencedora:\n`;
                    output += `   Nome: ${result.winner.variantName}\n`;
                    output += `   Score: ${result.winner.score}/100\n`;
                    output += `   CTR: ${result.winner.metrics.ctr.toFixed(2)}%\n`;
                    output += `   CPA: R$ ${(result.winner.metrics.cpa || 0).toFixed(2)}\n`;
                    output += `   ROI: ${(result.winner.metrics.roi || 0).toFixed(2)}%\n\n`;

                    if (result.losers.length > 0) {
                        output += `📉 Perdedoras:\n`;
                        result.losers.forEach((loser, idx) => {
                            output += `   ${idx + 1}. ${loser.variantName} (Score: ${loser.score}/100)\n`;
                        });
                        output += `\n`;
                    }

                    output += `📈 Significância Estatística: ${(result.significance * 100).toFixed(0)}%\n\n`;
                    output += `💡 ${result.recommendation}\n\n`;
                    output += `💡 Use scale_ab_test_winner para escalar vencedora e pausar perdedoras.`;

                    return output;

                } catch (error) {
                    log.error('Erro ao analisar teste A/B', { error: error.message });
                    return `❌ Erro ao analisar teste A/B: ${error.message}`;
                }
            };

            // Escalar vencedora de teste A/B
            tools.scale_ab_test_winner = async (params) => {
                const { testName, scaleFactor = 2 } = params;

                if (!testName) {
                    return '❌ Nome do teste A/B é obrigatório.';
                }

                try {
                    const { scaleWinnerAndPauseLosers } = await import('./marketing_ab_testing.js');
                    const result = await scaleWinnerAndPauseLosers(testName, scaleFactor);

                    if (!result.success) {
                        return `❌ Erro ao escalar vencedora: ${result.message}`;
                    }

                    let output = `🚀 Teste A/B Finalizado: ${testName}\n\n`;
                    output += `🏆 Vencedora: ${result.winner}\n`;
                    output += `📈 Escalada: ${result.scaled}x\n`;
                    output += `⏸️  Perdedoras pausadas: ${result.paused}\n\n`;
                    output += `✅ ${result.message}`;

                    return output;

                } catch (error) {
                    log.error('Erro ao escalar vencedora', { error: error.message });
                    return `❌ Erro ao escalar vencedora: ${error.message}`;
                }
            };

            // Otimização automática de todas as campanhas
            tools.optimize_all_campaigns = async () => {
                try {
                    const { optimizeMarketingCampaigns } = await import('./marketing_optimizer.js');
                    const result = await optimizeMarketingCampaigns();

                    if (!result.success) {
                        return `❌ Erro na otimização: ${result.message}`;
                    }

                    let output = `🚀 Otimização Automática Concluída\n\n`;
                    output += `📊 Análise:\n`;
                    output += `   • Top Performers: ${result.analysis.topPerformers}\n`;
                    output += `   • Under Performers: ${result.analysis.underPerformers}\n`;
                    output += `   • CTR Médio: ${result.analysis.averageMetrics.ctr.toFixed(2)}%\n`;
                    output += `   • CPA Médio: R$ ${result.analysis.averageMetrics.cpa.toFixed(2)}\n\n`;

                    if (result.optimizations.length > 0) {
                        output += `💰 Orçamentos Aumentados (${result.optimizations.length}):\n`;
                        result.optimizations.forEach((opt, idx) => {
                            output += `   ${idx + 1}. ${opt.campaignName}: R$ ${opt.oldBudget.toFixed(2)} → R$ ${opt.newBudget.toFixed(2)} (+R$ ${opt.increase.toFixed(2)})\n`;
                        });
                        output += `\n`;
                    }

                    if (result.paused.length > 0) {
                        output += `⏸️  Campanhas Pausadas (${result.paused.length}):\n`;
                        result.paused.forEach((p, idx) => {
                            output += `   ${idx + 1}. ${p.campaignName} (Score: ${p.score.toFixed(1)})\n`;
                        });
                        output += `\n`;
                    }

                    if (result.resumed.length > 0) {
                        output += `▶️  Campanhas Retomadas (${result.resumed.length}):\n`;
                        result.resumed.forEach((r, idx) => {
                            output += `   ${idx + 1}. ${r.campaignName} (Score: ${r.score.toFixed(1)})\n`;
                        });
                        output += `\n`;
                    }

                    if (result.optimizations.length === 0 && result.paused.length === 0 && result.resumed.length === 0) {
                        output += `ℹ️  Nenhuma otimização necessária no momento.\n`;
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao otimizar campanhas', { error: error.message });
                    return `❌ Erro ao otimizar campanhas: ${error.message}`;
                }
            };
            break;

        case 'sales':
            // Importar clientes CRM
            const { createLead: createPipedriveLead, updateLead: updatePipedriveLead, createDeal: createPipedriveDeal, updateDeal: updatePipedriveDeal, moveDealStage: movePipedriveDealStage, listDeals: listPipedriveDeals, getPipelineMetrics: getPipedriveMetrics } = await import('../utils/pipedrive_client.js');
            const { createContact: createHubSpotContact, updateContact: updateHubSpotContact, createDeal: createHubSpotDeal, updateDeal: updateHubSpotDeal, moveDealStage: moveHubSpotDealStage, listDeals: listHubSpotDeals, getPipelineMetrics: getHubSpotMetrics } = await import('../utils/hubspot_client.js');

            // Criar lead
            tools.create_lead = async (params) => {
                const { name, email, phone, company, source, platform = 'pipedrive' } = params;

                if (!name) {
                    return '❌ Nome é obrigatório.';
                }

                try {
                    let result;
                    if (platform === 'pipedrive') {
                        result = await createPipedriveLead({ name, email, phone, company, source });
                    } else if (platform === 'hubspot') {
                        result = await createHubSpotContact({ email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`, firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' '), phone, company, source });
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada. Use 'pipedrive' ou 'hubspot'.`;
                    }

                    // Salvar no Supabase
                    if (supabase && result.success) {
                        await supabase.from('cerebro_sales_leads').insert({
                            name: result.name || name,
                            email: result.email || email,
                            phone: result.phone || phone,
                            company: result.company || company,
                            source: source || 'unknown',
                            status: 'new',
                            platform_lead_id: result.leadId || result.contactId,
                            platform: platform,
                        });
                    }

                    return `✅ Lead criado: ${result.name || name}\nID: ${result.leadId || result.contactId}\nPlataforma: ${platform}`;
                } catch (error) {
                    log.error('Erro ao criar lead', { error: error.message });
                    return `❌ Erro ao criar lead: ${error.message}`;
                }
            };

            // Criar deal
            tools.create_deal = async (params) => {
                const { title, value, leadId, stage, probability, expectedCloseDate, platform = 'pipedrive' } = params;

                if (!title) {
                    return '❌ Título do deal é obrigatório.';
                }

                try {
                    let result;
                    if (platform === 'pipedrive') {
                        result = await createPipedriveDeal({ title, value, personId: leadId, stage, probability, expectedCloseDate });
                    } else if (platform === 'hubspot') {
                        result = await createHubSpotDeal({ dealName: title, amount: value, contactId: leadId, stage, closeDate: expectedCloseDate });
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada. Use 'pipedrive' ou 'hubspot'.`;
                    }

                    // Salvar no Supabase
                    if (supabase && result.success) {
                        await supabase.from('cerebro_sales_deals').insert({
                            lead_id: leadId || null,
                            name: result.title || result.dealName,
                            value: result.value || value || 0,
                            stage: result.stage,
                            probability: probability || result.probability || 0,
                            expected_close_date: expectedCloseDate || result.expectedCloseDate,
                            platform_deal_id: result.dealId,
                            platform: platform,
                        });
                    }

                    return `✅ Deal criado: ${result.title || result.dealName}\nID: ${result.dealId}\nValor: R$ ${(result.value || 0).toFixed(2)}\nPlataforma: ${platform}`;
                } catch (error) {
                    log.error('Erro ao criar deal', { error: error.message });
                    return `❌ Erro ao criar deal: ${error.message}`;
                }
            };

            // Analisar funil de vendas
            tools.analyze_funnel = async (params) => {
                const { platform = 'pipedrive', startDate, endDate } = params;

                try {
                    let metrics;
                    if (platform === 'pipedrive') {
                        metrics = await getPipedriveMetrics();
                    } else if (platform === 'hubspot') {
                        metrics = await getHubSpotMetrics();
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada. Use 'pipedrive' ou 'hubspot'.`;
                    }

                    if (!metrics.success) {
                        return `❌ Erro ao obter métricas: ${metrics.message}`;
                    }

                    // Buscar deals para análise de estágios
                    let deals;
                    if (platform === 'pipedrive') {
                        deals = await listPipedriveDeals();
                    } else {
                        deals = await listHubSpotDeals();
                    }

                    // Agrupar por estágio
                    const stageAnalysis = {};
                    deals.deals.forEach(deal => {
                        const stage = deal.stage || 'unknown';
                        if (!stageAnalysis[stage]) {
                            stageAnalysis[stage] = {
                                count: 0,
                                totalValue: 0,
                                avgValue: 0,
                            };
                        }
                        stageAnalysis[stage].count++;
                        stageAnalysis[stage].totalValue += deal.value || deal.amount || 0;
                    });

                    Object.keys(stageAnalysis).forEach(stage => {
                        stageAnalysis[stage].avgValue = stageAnalysis[stage].totalValue / stageAnalysis[stage].count;
                    });

                    let output = `📊 Análise de Funil de Vendas\n\n`;
                    output += `💰 Métricas Gerais:\n`;
                    output += `   Total de Deals: ${metrics.metrics.totalDeals}\n`;
                    output += `   Valor Total: R$ ${metrics.metrics.totalValue.toFixed(2)}\n`;
                    output += `   Valor Médio: R$ ${metrics.metrics.avgDealValue.toFixed(2)}\n`;
                    output += `   Pipeline Ponderado: R$ ${metrics.metrics.weightedPipeline.toFixed(2)}\n\n`;

                    output += `📈 Análise por Estágio:\n`;
                    Object.entries(stageAnalysis).forEach(([stage, data]) => {
                        output += `   ${stage}:\n`;
                        output += `      Deals: ${data.count}\n`;
                        output += `      Valor Total: R$ ${data.totalValue.toFixed(2)}\n`;
                        output += `      Valor Médio: R$ ${data.avgValue.toFixed(2)}\n`;
                    });

                    // Salvar análise no Supabase
                    if (supabase) {
                        const analysisDate = new Date().toISOString().split('T')[0];
                        for (const [stage, data] of Object.entries(stageAnalysis)) {
                            await supabase.from('cerebro_sales_funnel_analysis').insert({
                                analysis_date: analysisDate,
                                stage,
                                leads_count: data.count,
                                conversion_rate: 0, // Calcular depois
                                avg_time_in_stage: 0, // Calcular depois
                                bottleneck_score: data.count < 3 ? 80 : 20, // Gargalo se poucos deals
                            });
                        }
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao analisar funil', { error: error.message });
                    return `❌ Erro ao analisar funil: ${error.message}`;
                }
            };

            // Calcular taxa de conversão
            tools.calculate_conversion = async (params) => {
                const { leads, sales, stage } = params;

                if (!leads && !sales) {
                    return '❌ Número de leads ou vendas é obrigatório.';
                }

                const conversionRate = sales && leads ? (sales / leads) * 100 : 0;

                let output = `📊 Taxa de Conversão\n\n`;
                if (leads) output += `Leads: ${leads}\n`;
                if (sales) output += `Vendas: ${sales}\n`;
                if (conversionRate > 0) output += `Taxa de Conversão: ${conversionRate.toFixed(2)}%\n`;

                return output;
            };

            // Previsão de receita (forecasting)
            tools.forecast_revenue = async (params) => {
                const { platform = 'pipedrive', months = 3 } = params;

                try {
                    let metrics;
                    if (platform === 'pipedrive') {
                        metrics = await getPipedriveMetrics();
                    } else if (platform === 'hubspot') {
                        metrics = await getHubSpotMetrics();
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada.`;
                    }

                    if (!metrics.success) {
                        return `❌ Erro ao obter métricas: ${metrics.message}`;
                    }

                    // Forecasting simples baseado em pipeline ponderado
                    const monthlyForecast = metrics.metrics.weightedPipeline / months;
                    const totalForecast = metrics.metrics.weightedPipeline;

                    let output = `🔮 Previsão de Receita (${months} meses)\n\n`;
                    output += `💰 Pipeline Ponderado: R$ ${metrics.metrics.weightedPipeline.toFixed(2)}\n`;
                    output += `📅 Previsão Mensal: R$ ${monthlyForecast.toFixed(2)}\n`;
                    output += `📊 Previsão Total: R$ ${totalForecast.toFixed(2)}\n\n`;
                    output += `💡 Baseado em ${metrics.metrics.totalDeals} deals ativos\n`;
                    output += `💡 Valor médio por deal: R$ ${metrics.metrics.avgDealValue.toFixed(2)}\n`;

                    return output;
                } catch (error) {
                    log.error('Erro ao fazer forecasting', { error: error.message });
                    return `❌ Erro ao fazer forecasting: ${error.message}`;
                }
            };

            // Criar proposta comercial
            tools.create_proposal = async (params) => {
                const { dealId, title, clientName, services, value, terms, platform = 'pipedrive' } = params;

                if (!title || !clientName || !value) {
                    return '❌ Título, nome do cliente e valor são obrigatórios.';
                }

                try {
                    // Gerar proposta usando LLM
                    const proposalPrompt = `Crie uma proposta comercial profissional para:

Cliente: ${clientName}
Título: ${title}
Valor: R$ ${value}
Serviços: ${JSON.stringify(services || [])}
Termos: ${terms || 'Padrão'}

Retorne uma proposta formatada em markdown com:
1. Cabeçalho com logo e informações
2. Resumo executivo
3. Escopo de serviços
4. Investimento
5. Termos e condições
6. Próximos passos`;

                    const proposalContent = await callLLM(
                        proposalPrompt,
                        'Você é um especialista em criar propostas comerciais profissionais e persuasivas.',
                        0.7
                    );

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_sales_proposals').insert({
                            deal_id: dealId || null,
                            title,
                            content: proposalContent,
                            value: parseFloat(value),
                            status: 'draft',
                        });
                    }

                    return `✅ Proposta criada: ${title}\n\n${proposalContent}\n\n💡 Status: Draft (revisar antes de enviar)`;
                } catch (error) {
                    log.error('Erro ao criar proposta', { error: error.message });
                    return `❌ Erro ao criar proposta: ${error.message}`;
                }
            };

            // Mover deal para próximo estágio
            tools.move_deal_stage = async (params) => {
                const { dealId, stage, platform = 'pipedrive' } = params;

                if (!dealId || !stage) {
                    return '❌ ID do deal e estágio são obrigatórios.';
                }

                try {
                    let result;
                    if (platform === 'pipedrive') {
                        result = await movePipedriveDealStage(dealId, stage);
                    } else if (platform === 'hubspot') {
                        result = await moveHubSpotDealStage(dealId, stage);
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada.`;
                    }

                    // Atualizar no Supabase
                    if (supabase && result.success) {
                        await supabase.from('cerebro_sales_deals')
                            .update({ stage: result.newStage, updated_at: new Date().toISOString() })
                            .eq('platform_deal_id', dealId)
                            .eq('platform', platform);
                    }

                    return `✅ Deal movido para estágio: ${result.newStage}\n${result.message}`;
                } catch (error) {
                    log.error('Erro ao mover deal', { error: error.message });
                    return `❌ Erro ao mover deal: ${error.message}`;
                }
            };

            // Listar deals
            tools.list_deals = async (params) => {
                const { platform = 'pipedrive', status, stage } = params;

                try {
                    let deals;
                    if (platform === 'pipedrive') {
                        deals = await listPipedriveDeals({ status, stage });
                    } else if (platform === 'hubspot') {
                        deals = await listHubSpotDeals({ stage, pipeline: 'default' });
                    } else if (platform === 'salesforce') {
                        const { listOpportunities } = await import('../utils/salesforce_client.js');
                        deals = await listOpportunities({ stageName: stage });
                    } else {
                        return `⚠️ Plataforma ${platform} não suportada.`;
                    }

                    if (!deals.success || deals.count === 0) {
                        return '⚠️ Nenhum deal encontrado.';
                    }

                    let output = `📋 Deals (${deals.count})\n\n`;
                    deals.deals.forEach(deal => {
                        output += `ID: ${deal.id}\n`;
                        output += `Título: ${deal.title || deal.dealName || deal.name}\n`;
                        output += `Valor: R$ ${(deal.value || deal.amount || 0).toFixed(2)}\n`;
                        output += `Estágio: ${deal.stage}\n`;
                        if (deal.probability) output += `Probabilidade: ${deal.probability}%\n`;
                        output += `---\n`;
                    });

                    return output;
                } catch (error) {
                    log.error('Erro ao listar deals', { error: error.message });
                    return `❌ Erro ao listar deals: ${error.message}`;
                }
            };

            // Qualificar lead automaticamente (BANT/GPCT)
            tools.qualify_lead = async (params) => {
                const { leadId, email, name, framework = 'auto', conversationContext = {} } = params;

                if (!leadId && !email && !name) {
                    return '❌ leadId, email ou name é obrigatório.';
                }

                try {
                    const { qualifyLead } = await import('./sales_lead_qualifier.js');

                    // Buscar dados do lead se necessário
                    let leadData = { email, name };
                    if (leadId && supabase) {
                        const { data } = await supabase
                            .from('cerebro_sales_leads')
                            .select('*')
                            .eq('id', leadId)
                            .single();
                        if (data) leadData = data;
                    }

                    const result = await qualifyLead(leadData, framework, conversationContext);

                    let output = `✅ Lead Qualificado (${result.framework})\n\n`;
                    output += `Score Geral: ${result.qualification.overall_score}/100\n`;
                    output += `Status: ${result.qualification.qualification_status}\n\n`;

                    if (result.framework === 'BANT') {
                        output += `📊 BANT:\n`;
                        output += `   Budget: ${result.qualification.budget.has_budget ? '✅' : '❌'} (Confiança: ${(result.qualification.budget.confidence * 100).toFixed(0)}%)\n`;
                        output += `   Authority: ${result.qualification.authority.is_decision_maker ? '✅' : '❌'} (Confiança: ${(result.qualification.authority.confidence * 100).toFixed(0)}%)\n`;
                        output += `   Need: ${result.qualification.need.has_need ? '✅' : '❌'} (Confiança: ${(result.qualification.need.confidence * 100).toFixed(0)}%)\n`;
                        output += `   Timing: ${result.qualification.timing.has_timeline ? '✅' : '❌'} (Confiança: ${(result.qualification.timing.confidence * 100).toFixed(0)}%)\n`;
                    } else {
                        output += `📊 GPCT:\n`;
                        output += `   Goals: ${result.qualification.goals.has_goals ? '✅' : '❌'}\n`;
                        output += `   Plans: ${result.qualification.plans.has_plans ? '✅' : '❌'}\n`;
                        output += `   Challenges: ${result.qualification.challenges.has_challenges ? '✅' : '❌'}\n`;
                        output += `   Timeline: ${result.qualification.timeline.has_timeline ? '✅' : '❌'}\n`;
                    }

                    if (result.qualification.recommendations && result.qualification.recommendations.length > 0) {
                        output += `\n💡 Recomendações:\n`;
                        result.qualification.recommendations.forEach((rec, idx) => {
                            output += `   ${idx + 1}. ${rec}\n`;
                        });
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao qualificar lead', { error: error.message });
                    return `❌ Erro ao qualificar lead: ${error.message}`;
                }
            };

            // Agendar follow-up
            tools.schedule_followup = async (params) => {
                const { leadId, dealId, scheduledDate, type = 'initial', context = {} } = params;

                if (!leadId && !dealId) {
                    return '❌ leadId ou dealId é obrigatório.';
                }

                if (!scheduledDate) {
                    return '❌ scheduledDate é obrigatório (YYYY-MM-DD).';
                }

                try {
                    const { scheduleFollowup } = await import('./sales_followup_automation.js');
                    const result = await scheduleFollowup({
                        leadId,
                        dealId,
                        scheduledDate: new Date(scheduledDate),
                        type,
                        context,
                    });

                    let output = `✅ Follow-up Agendado\n\n`;
                    output += `Data: ${scheduledDate}\n`;
                    output += `Tipo: ${type}\n`;
                    output += `Assunto: ${result.followup.subject}\n\n`;
                    output += `Corpo:\n${result.followup.body}\n\n`;
                    output += `💡 ${result.message}`;

                    return output;
                } catch (error) {
                    log.error('Erro ao agendar follow-up', { error: error.message });
                    return `❌ Erro ao agendar follow-up: ${error.message}`;
                }
            };

            // Criar lead/deal no Salesforce
            tools.create_salesforce_lead = async (params) => {
                const { firstName, lastName, email, company, phone, source } = params;

                if (!lastName) {
                    return '❌ Último nome é obrigatório.';
                }

                try {
                    const { createLead } = await import('../utils/salesforce_client.js');
                    const result = await createLead({ firstName, lastName, email, company, phone, source });

                    return `✅ Lead criado no Salesforce: ${result.leadId}\nNome: ${firstName} ${lastName}\nEmail: ${email || 'N/A'}`;
                } catch (error) {
                    log.error('Erro ao criar lead Salesforce', { error: error.message });
                    return `❌ Erro ao criar lead Salesforce: ${error.message}`;
                }
            };

            tools.create_salesforce_opportunity = async (params) => {
                const { name, amount, stageName, closeDate, accountId, leadId } = params;

                if (!name || !stageName || !closeDate) {
                    return '❌ Nome, estágio e data de fechamento são obrigatórios.';
                }

                try {
                    const { createOpportunity } = await import('../utils/salesforce_client.js');
                    const result = await createOpportunity({ name, amount, stageName, closeDate, accountId, leadId });

                    return `✅ Opportunity criada no Salesforce: ${result.opportunityId}\nNome: ${name}\nValor: R$ ${(amount || 0).toFixed(2)}`;
                } catch (error) {
                    log.error('Erro ao criar opportunity Salesforce', { error: error.message });
                    return `❌ Erro ao criar opportunity Salesforce: ${error.message}`;
                }
            };

            break;

        case 'validation':
            // Tools de validação e QA - Implementação Real Industrial 6.0
            const { validationTools } = await import('./tools/validation_tools.js');

            // Integrar tools reais
            tools.runTests = validationTools.runTests;
            tools.analyzeCodeQuality = validationTools.analyzeCodeQuality;
            tools.validateSecurity = validationTools.validateSecurity;
            tools.generateQualityReport = validationTools.generateQualityReport;

            // Importar utilitários de teste (para compatibilidade)
            const { execSync } = await import('child_process');
            const { readFileSync, existsSync } = await import('fs');
            const path = await import('path');

            // Manter compatibilidade com tools antigas (deprecated)
            // Executar testes unitários
            tools.run_unit_tests = async (params) => {
                const { testFile, testPattern, framework = 'jest' } = params;

                try {
                    let command;
                    if (framework === 'jest') {
                        if (testFile) {
                            command = `npx jest ${testFile}`;
                        } else if (testPattern) {
                            command = `npx jest --testNamePattern="${testPattern}"`;
                        } else {
                            command = 'npm test';
                        }
                    } else if (framework === 'mocha') {
                        command = testFile ? `npx mocha ${testFile}` : 'npm test';
                    } else {
                        return `⚠️ Framework ${framework} não suportado. Use 'jest' ou 'mocha'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 300000 // 5 minutos
                    });

                    // Salvar resultado no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_tests').insert({
                            test_type: 'unit',
                            framework: framework,
                            test_file: testFile || null,
                            status: 'passed',
                            output: result,
                            execution_time: Date.now(),
                        });
                    }

                    return `✅ Testes unitários executados com sucesso!\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // Salvar erro no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_tests').insert({
                            test_type: 'unit',
                            framework: framework,
                            test_file: testFile || null,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `❌ Erro ao executar testes unitários:\n\n${errorOutput}`;
                }
            };

            // Executar testes E2E
            tools.run_e2e_tests = async (params) => {
                const { testFile, browser = 'chromium', framework = 'playwright' } = params;

                try {
                    let command;
                    if (framework === 'playwright') {
                        command = testFile
                            ? `npx playwright test ${testFile} --browser=${browser}`
                            : `npx playwright test --browser=${browser}`;
                    } else if (framework === 'cypress') {
                        command = testFile ? `npx cypress run --spec ${testFile}` : 'npx cypress run';
                    } else {
                        return `⚠️ Framework ${framework} não suportado. Use 'playwright' ou 'cypress'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 600000 // 10 minutos
                    });

                    // Salvar resultado no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_tests').insert({
                            test_type: 'e2e',
                            framework: framework,
                            test_file: testFile || null,
                            browser: browser,
                            status: 'passed',
                            output: result,
                            execution_time: Date.now(),
                        });
                    }

                    return `✅ Testes E2E executados com sucesso!\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // Salvar erro no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_tests').insert({
                            test_type: 'e2e',
                            framework: framework,
                            test_file: testFile || null,
                            browser: browser,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `❌ Erro ao executar testes E2E:\n\n${errorOutput}`;
                }
            };

            // Analisar cobertura de código
            tools.analyze_coverage = async (params) => {
                const { threshold = 80, framework = 'jest' } = params;

                try {
                    let command;
                    if (framework === 'jest') {
                        command = 'npm test -- --coverage';
                    } else if (framework === 'nyc') {
                        command = 'npx nyc npm test';
                    } else {
                        return `⚠️ Framework ${framework} não suportado. Use 'jest' ou 'nyc'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 300000
                    });

                    // Tentar ler arquivo de cobertura
                    let coverageData = null;
                    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
                    if (existsSync(coveragePath)) {
                        try {
                            coverageData = JSON.parse(readFileSync(coveragePath, 'utf8'));
                        } catch (e) {
                            log.warn('Erro ao ler arquivo de cobertura', { error: e.message });
                        }
                    }

                    // Calcular cobertura total
                    let totalCoverage = 0;
                    if (coverageData && coverageData.total) {
                        totalCoverage = coverageData.total.lines.pct || 0;
                    }

                    const status = totalCoverage >= threshold ? 'passed' : 'warning';
                    const statusIcon = totalCoverage >= threshold ? '✅' : '⚠️';

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'coverage',
                            framework: framework,
                            coverage_percentage: totalCoverage,
                            threshold: threshold,
                            status: status,
                            output: result,
                            metadata: coverageData,
                            execution_time: Date.now(),
                        });
                    }

                    return `${statusIcon} Análise de Cobertura\n\nCobertura Total: ${totalCoverage.toFixed(2)}%\nThreshold: ${threshold}%\nStatus: ${status}\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;
                    return `❌ Erro ao analisar cobertura:\n\n${errorOutput}`;
                }
            };

            // Validar qualidade de código
            tools.validate_code_quality = async (params) => {
                const { files, configFile, tool = 'eslint' } = params;

                try {
                    let command;
                    if (tool === 'eslint') {
                        const filesArg = files ? files.join(' ') : '.';
                        command = configFile
                            ? `npx eslint ${filesArg} --config ${configFile}`
                            : `npx eslint ${filesArg}`;
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'eslint'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 300000
                    });

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'code_quality',
                            tool: tool,
                            status: 'passed',
                            output: result,
                            execution_time: Date.now(),
                        });
                    }

                    return `✅ Validação de qualidade de código concluída!\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // Salvar no Supabase mesmo com erros
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'code_quality',
                            tool: tool,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `⚠️ Problemas encontrados na validação:\n\n${errorOutput}`;
                }
            };

            // Analisar segurança
            tools.analyze_security = async (params) => {
                const { tool = 'npm_audit', level = 'moderate' } = params;

                try {
                    let command;
                    if (tool === 'npm_audit') {
                        command = `npm audit --audit-level=${level}`;
                    } else if (tool === 'snyk') {
                        command = 'npx snyk test';
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'npm_audit' ou 'snyk'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 300000
                    });

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'security',
                            tool: tool,
                            status: 'completed',
                            output: result,
                            execution_time: Date.now(),
                        });
                    }

                    return `🔒 Análise de Segurança\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // npm audit retorna código de saída 1 se encontrar vulnerabilidades
                    // Isso é esperado, então não tratamos como erro fatal
                    if (tool === 'npm_audit' && error.status === 1) {
                        if (supabase) {
                            await supabase.from('cerebro_validation_reports').insert({
                                report_type: 'security',
                                tool: tool,
                                status: 'vulnerabilities_found',
                                output: errorOutput,
                                execution_time: Date.now(),
                            });
                        }
                        return `⚠️ Vulnerabilidades encontradas:\n\n${errorOutput}`;
                    }

                    return `❌ Erro ao analisar segurança:\n\n${errorOutput}`;
                }
            };

            // Analisar performance
            tools.analyze_performance = async (params) => {
                const { file, tool = 'clinic', duration = 5000 } = params;

                try {
                    let command;
                    if (tool === 'clinic') {
                        // Clinic.js precisa de um script para analisar
                        if (!file) {
                            return '⚠️ Para usar Clinic.js, forneça o arquivo ou script a ser analisado.';
                        }
                        command = `npx clinic doctor -- node ${file}`;
                    } else if (tool === '0x') {
                        command = file ? `npx 0x ${file}` : 'npx 0x --help';
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'clinic' ou '0x'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 600000 // 10 minutos para profiling
                    });

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'performance',
                            tool: tool,
                            status: 'completed',
                            output: result,
                            execution_time: Date.now(),
                        });
                    }

                    return `⚡ Análise de Performance\n\n${result}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // Clinic pode retornar erro se não encontrar o arquivo
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'performance',
                            tool: tool,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `⚠️ Análise de performance:\n\n${errorOutput}\n\n💡 Dica: Certifique-se de que o arquivo existe e Clinic.js está instalado (npm install -g clinic).`;
                }
            };

            // Analisar complexidade
            tools.analyze_complexity = async (params) => {
                const { files, maxComplexity = 10, tool = 'eslint' } = params;

                try {
                    let command;
                    if (tool === 'eslint') {
                        const filesArg = files ? files.join(' ') : '.';
                        // ESLint com regra de complexidade ciclomática
                        command = `npx eslint ${filesArg} --rule "complexity: [error, ${maxComplexity}]" --format json`;
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'eslint'.`;
                    }

                    const result = execSync(command, {
                        encoding: 'utf8',
                        cwd: process.cwd(),
                        stdio: 'pipe',
                        timeout: 300000
                    });

                    // Tentar parsear JSON do ESLint
                    let complexityData = null;
                    try {
                        complexityData = JSON.parse(result);
                    } catch (e) {
                        // Se não for JSON, usar resultado como texto
                    }

                    // Calcular métricas de complexidade
                    let totalFiles = 0;
                    let highComplexityFiles = 0;
                    let totalIssues = 0;

                    if (complexityData && Array.isArray(complexityData)) {
                        totalFiles = complexityData.length;
                        complexityData.forEach(file => {
                            if (file.messages && file.messages.length > 0) {
                                totalIssues += file.messages.length;
                                highComplexityFiles++;
                            }
                        });
                    }

                    const status = highComplexityFiles === 0 ? 'passed' : 'warning';
                    const statusIcon = highComplexityFiles === 0 ? '✅' : '⚠️';

                    // Salvar no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'complexity',
                            tool: tool,
                            status: status,
                            output: result,
                            metadata: {
                                totalFiles,
                                highComplexityFiles,
                                totalIssues,
                                maxComplexity,
                            },
                            execution_time: Date.now(),
                        });
                    }

                    return `${statusIcon} Análise de Complexidade\n\nArquivos analisados: ${totalFiles}\nArquivos com alta complexidade: ${highComplexityFiles}\nTotal de problemas: ${totalIssues}\nThreshold: ${maxComplexity}\n\n${result.substring(0, 1000)}${result.length > 1000 ? '...' : ''}`;
                } catch (error) {
                    const errorOutput = error.stdout || error.stderr || error.message;

                    // ESLint pode retornar erro se encontrar problemas
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'complexity',
                            tool: tool,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `⚠️ Análise de complexidade:\n\n${errorOutput}`;
                }
            };

            // Validar acessibilidade
            tools.validate_accessibility = async (params) => {
                const { url, tool = 'axe-core' } = params;

                try {
                    if (tool === 'axe-core') {
                        // Para usar axe-core, precisamos de um script Node.js
                        // Por enquanto, retornamos instruções
                        if (!url) {
                            return '⚠️ Para validar acessibilidade, forneça uma URL. Use axe-core via script Node.js ou extensão do navegador.';
                        }

                        // Tentar usar puppeteer/playwright com axe-core se disponível
                        try {
                            const { chromium } = await import('playwright');
                            const browser = await chromium.launch();
                            const page = await browser.newPage();
                            await page.goto(url);

                            // Injetar axe-core
                            await page.addScriptTag({ url: 'https://unpkg.com/axe-core@latest/axe.min.js' });
                            const results = await page.evaluate(() => {
                                return window.axe.run();
                            });

                            await browser.close();

                            const violations = results.violations || [];
                            const passes = results.passes || [];
                            const status = violations.length === 0 ? 'passed' : 'failed';
                            const statusIcon = violations.length === 0 ? '✅' : '⚠️';

                            // Salvar no Supabase
                            if (supabase) {
                                await supabase.from('cerebro_validation_reports').insert({
                                    report_type: 'accessibility',
                                    tool: tool,
                                    status: status,
                                    output: JSON.stringify(results, null, 2),
                                    metadata: {
                                        url,
                                        violations: violations.length,
                                        passes: passes.length,
                                    },
                                    execution_time: Date.now(),
                                });
                            }

                            return `${statusIcon} Validação de Acessibilidade\n\nURL: ${url}\nViolações: ${violations.length}\nPasses: ${passes.length}\n\n${violations.length > 0 ? 'Violações encontradas:\n' + violations.map(v => `- ${v.id}: ${v.description}`).join('\n') : 'Nenhuma violação encontrada!'}`;
                        } catch (playwrightError) {
                            // Fallback: instruções
                            return `⚠️ Playwright não disponível. Para validar acessibilidade:\n\n1. Instale: npm install playwright @axe-core/cli\n2. Execute: npx axe ${url}\n\nOu use a extensão do navegador: https://www.deque.com/axe/devtools/`;
                        }
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'axe-core'.`;
                    }
                } catch (error) {
                    const errorOutput = error.message;

                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'accessibility',
                            tool: tool,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `❌ Erro ao validar acessibilidade:\n\n${errorOutput}`;
                }
            };

            // Validar SEO
            tools.validate_seo = async (params) => {
                const { url, tool = 'lighthouse' } = params;

                if (!url) {
                    return '❌ URL é obrigatória para validação de SEO.';
                }

                try {
                    if (tool === 'lighthouse') {
                        // Lighthouse CLI
                        const lighthousePath = path.join(process.cwd(), 'lighthouse-seo.json');
                        const command = `npx lighthouse ${url} --only-categories=seo --output=json --output-path="${lighthousePath}" --quiet`;

                        try {
                            const result = execSync(command, {
                                encoding: 'utf8',
                                cwd: process.cwd(),
                                stdio: 'pipe',
                                timeout: 300000
                            });

                            // Tentar ler o arquivo JSON gerado
                            let lighthouseData = null;
                            try {
                                const lighthousePath = path.join(process.cwd(), 'lighthouse-seo.json');
                                if (existsSync(lighthousePath)) {
                                    lighthouseData = JSON.parse(readFileSync(lighthousePath, 'utf8'));
                                }
                            } catch (e) {
                                log.warn('Erro ao ler arquivo Lighthouse', { error: e.message });
                            }

                            const seoScore = lighthouseData?.categories?.seo?.score
                                ? Math.round(lighthouseData.categories.seo.score * 100)
                                : null;

                            const status = seoScore && seoScore >= 90 ? 'passed' : seoScore && seoScore >= 70 ? 'warning' : 'failed';
                            const statusIcon = seoScore && seoScore >= 90 ? '✅' : seoScore && seoScore >= 70 ? '⚠️' : '❌';

                            // Salvar no Supabase
                            if (supabase) {
                                await supabase.from('cerebro_validation_reports').insert({
                                    report_type: 'seo',
                                    tool: tool,
                                    status: status,
                                    output: JSON.stringify(lighthouseData, null, 2),
                                    metadata: {
                                        url,
                                        seoScore,
                                    },
                                    execution_time: Date.now(),
                                });
                            }

                            return `${statusIcon} Validação de SEO\n\nURL: ${url}\nScore SEO: ${seoScore !== null ? seoScore + '/100' : 'N/A'}\n\n${lighthouseData ? 'Auditorias:\n' + (lighthouseData.audits ? Object.entries(lighthouseData.audits).filter(([_, audit]) => audit.score !== null && audit.score < 1).map(([key, audit]) => `- ${key}: ${audit.title} (${Math.round(audit.score * 100)}/100)`).join('\n') : 'Nenhuma auditoria disponível') : 'Relatório completo disponível no arquivo lighthouse-seo.json'}`;
                        } catch (lighthouseError) {
                            return `⚠️ Lighthouse não disponível. Instale: npm install -g lighthouse\n\nOu use a ferramenta online: https://pagespeed.web.dev/`;
                        }
                    } else {
                        return `⚠️ Ferramenta ${tool} não suportada. Use 'lighthouse'.`;
                    }
                } catch (error) {
                    const errorOutput = error.message;

                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'seo',
                            tool: tool,
                            status: 'failed',
                            output: errorOutput,
                            error: error.message,
                            execution_time: Date.now(),
                        });
                    }

                    return `❌ Erro ao validar SEO:\n\n${errorOutput}`;
                }
            };

            // Gerar relatório de qualidade consolidado
            tools.generate_quality_report = async (params) => {
                const { includeTests = true, includeCoverage = true, includeSecurity = true, includePerformance = false, includeAccessibility = false, includeSEO = false } = params;

                try {
                    const report = {
                        generated_at: new Date().toISOString(),
                        summary: {
                            tests: null,
                            coverage: null,
                            security: null,
                            performance: null,
                            accessibility: null,
                            seo: null,
                        },
                        details: {},
                        overall_score: 0,
                    };

                    // Buscar dados do Supabase se disponível
                    if (supabase) {
                        // Últimos testes
                        if (includeTests) {
                            const { data: tests } = await supabase
                                .from('cerebro_validation_tests')
                                .select('*')
                                .order('execution_time', { ascending: false })
                                .limit(10);

                            if (tests && tests.length > 0) {
                                const passed = tests.filter(t => t.status === 'passed').length;
                                const failed = tests.filter(t => t.status === 'failed').length;
                                report.summary.tests = {
                                    total: tests.length,
                                    passed,
                                    failed,
                                    pass_rate: (passed / tests.length) * 100,
                                };
                                report.details.tests = tests;
                            }
                        }

                        // Última cobertura
                        if (includeCoverage) {
                            const { data: coverage } = await supabase
                                .from('cerebro_validation_reports')
                                .select('*')
                                .eq('report_type', 'coverage')
                                .order('execution_time', { ascending: false })
                                .limit(1)
                                .single();

                            if (coverage) {
                                report.summary.coverage = {
                                    percentage: coverage.coverage_percentage,
                                    threshold: coverage.threshold,
                                    status: coverage.status,
                                };
                                report.details.coverage = coverage;
                            }
                        }

                        // Última análise de segurança
                        if (includeSecurity) {
                            const { data: security } = await supabase
                                .from('cerebro_validation_reports')
                                .select('*')
                                .eq('report_type', 'security')
                                .order('execution_time', { ascending: false })
                                .limit(1)
                                .single();

                            if (security) {
                                report.summary.security = {
                                    tool: security.tool,
                                    status: security.status,
                                    vulnerabilities_found: security.status === 'vulnerabilities_found',
                                };
                                report.details.security = security;
                            }
                        }

                        // Performance, Accessibility, SEO (se solicitados)
                        // Similar aos anteriores...
                    }

                    // Calcular score geral
                    let scores = [];
                    if (report.summary.tests) {
                        scores.push(report.summary.tests.pass_rate);
                    }
                    if (report.summary.coverage) {
                        scores.push(report.summary.coverage.percentage || 0);
                    }
                    if (report.summary.security && report.summary.security.status === 'completed') {
                        scores.push(100); // Sem vulnerabilidades
                    } else if (report.summary.security && report.summary.security.vulnerabilities_found) {
                        scores.push(50); // Vulnerabilidades encontradas
                    }

                    report.overall_score = scores.length > 0
                        ? scores.reduce((a, b) => a + b, 0) / scores.length
                        : 0;

                    // Formatar relatório
                    let output = `📊 Relatório de Qualidade Consolidado\n\n`;
                    output += `📅 Gerado em: ${new Date(report.generated_at).toLocaleString('pt-BR')}\n\n`;
                    output += `📈 Score Geral: ${report.overall_score.toFixed(1)}/100\n\n`;

                    if (report.summary.tests) {
                        output += `🧪 Testes:\n`;
                        output += `   Total: ${report.summary.tests.total}\n`;
                        output += `   Passou: ${report.summary.tests.passed}\n`;
                        output += `   Falhou: ${report.summary.tests.failed}\n`;
                        output += `   Taxa de sucesso: ${report.summary.tests.pass_rate.toFixed(1)}%\n\n`;
                    }

                    if (report.summary.coverage) {
                        output += `📊 Cobertura:\n`;
                        output += `   Cobertura: ${report.summary.coverage.percentage}%\n`;
                        output += `   Threshold: ${report.summary.coverage.threshold}%\n`;
                        output += `   Status: ${report.summary.coverage.status}\n\n`;
                    }

                    if (report.summary.security) {
                        output += `🔒 Segurança:\n`;
                        output += `   Ferramenta: ${report.summary.security.tool}\n`;
                        output += `   Status: ${report.summary.security.status}\n`;
                        output += `   Vulnerabilidades: ${report.summary.security.vulnerabilities_found ? 'Sim' : 'Não'}\n\n`;
                    }

                    // Salvar relatório no Supabase
                    if (supabase) {
                        await supabase.from('cerebro_validation_reports').insert({
                            report_type: 'quality_report',
                            tool: 'consolidated',
                            status: report.overall_score >= 80 ? 'passed' : report.overall_score >= 60 ? 'warning' : 'failed',
                            output: JSON.stringify(report, null, 2),
                            metadata: {
                                overall_score: report.overall_score,
                                included_sections: {
                                    tests: includeTests,
                                    coverage: includeCoverage,
                                    security: includeSecurity,
                                    performance: includePerformance,
                                    accessibility: includeAccessibility,
                                    seo: includeSEO,
                                },
                            },
                            execution_time: Date.now(),
                        });
                    }

                    return output;
                } catch (error) {
                    log.error('Erro ao gerar relatório de qualidade', { error: error.message });
                    return `❌ Erro ao gerar relatório de qualidade:\n\n${error.message}`;
                }
            };

            break;

        case 'metrics':
            // Tools de métricas DORA - Implementação Real Industrial 6.0
            const { metricsTools } = await import('./tools/metrics_tools.js');

            tools.calculateLeadTime = metricsTools.calculateLeadTime;
            tools.calculateDeploymentFrequency = metricsTools.calculateDeploymentFrequency;
            tools.calculateMTTR = metricsTools.calculateMTTR;
            tools.calculateChangeFailRate = metricsTools.calculateChangeFailRate;
            tools.generateDORAReport = metricsTools.generateDORAReport;
            break;

        case 'devex':
            // Tools de DevEx - Implementação Real Industrial 6.0
            const { devexTools } = await import('./tools/devex_tools.js');

            tools.checkDevelopmentEnvironment = devexTools.checkDevelopmentEnvironment;
            tools.checkGitHooks = devexTools.checkGitHooks;
            tools.checkCICD = devexTools.checkCICD;
            tools.generateOnboardingChecklist = devexTools.generateOnboardingChecklist;
            break;
    }

    return tools;
}

/**
 * Executa múltiplos agentes de forma orquestrada
 */
async function executeOrchestratedAgents(orchestration, question, context) {
    log.info('Executando orquestração de agentes', {
        subtasks: orchestration.subtasks.length,
    });

    const results = [];
    const handoffData = {};

    for (const subtask of orchestration.subtasks.sort((a, b) => a.order - b.order)) {
        // Verificar dependências
        if (subtask.depends_on && subtask.depends_on.length > 0) {
            const allDepsMet = subtask.depends_on.every(dep =>
                results.find(r => r.subtask === dep)
            );
            if (!allDepsMet) {
                log.warn('Dependências não atendidas, pulando subtask', {
                    subtask: subtask.description,
                    depends_on: subtask.depends_on,
                });
                continue;
            }
        }

        // Coletar dados de handoff se necessário
        const handoffContext = {};
        if (subtask.depends_on) {
            for (const dep of subtask.depends_on) {
                const depResult = results.find(r => r.subtask === dep);
                if (depResult) {
                    handoffContext[dep] = depResult.result;
                }
            }
        }

        // Executar subtask
        log.info('Executando subtask', {
            agent: subtask.agent,
            description: subtask.description,
        });

        const result = await executeSpecializedAgent(
            subtask.agent,
            `${subtask.description}\n\nContexto de handoff: ${JSON.stringify(handoffContext, null, 2)}`,
            { ...context, orchestration: true }
        );

        results.push({
            subtask: subtask.description,
            agent: subtask.agent,
            result: typeof result === 'string' ? result : JSON.stringify(result),
        });

        // Armazenar para próximos handoffs
        handoffData[subtask.description] = result;
    }

    // Agregar resultados
    const aggregatedResult = await aggregateOrchestrationResults(results, question);

    return aggregatedResult;
}

/**
 * Agrega resultados de múltiplos agentes
 */
async function aggregateOrchestrationResults(results, originalQuestion) {
    const resultsSummary = results.map((r, idx) =>
        `[${idx + 1}] ${r.agent}: ${r.result.substring(0, 200)}...`
    ).join('\n\n');

    const aggregationPrompt = `Você é o Cérebro Coordenador. Agregue os seguintes resultados de múltiplos agentes para responder à pergunta original:

Pergunta Original: ${originalQuestion}

Resultados dos Agentes:
${resultsSummary}

Forneça uma resposta agregada, coerente e completa que integre todos os resultados.`;

    try {
        const aggregated = await callLLM(
            aggregationPrompt,
            'Você é um coordenador experiente que integra resultados de múltiplos especialistas.',
            0.5
        );

        return `🧠 Resultado Orquestrado (${results.length} agentes):\n\n${aggregated}\n\n---\n\nDetalhes por Agente:\n${resultsSummary}`;
    } catch (error) {
        log.error('Erro ao agregar resultados', { error: error.message });
        return `Resultado Orquestrado (${results.length} agentes):\n\n${results.map(r => `[${r.agent}] ${r.result}`).join('\n\n')}`;
    }
}

export default {
    executeSpecializedAgent,
};


