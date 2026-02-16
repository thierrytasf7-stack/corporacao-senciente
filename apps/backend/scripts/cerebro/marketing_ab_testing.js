/**
 * Marketing A/B Testing System
 * 
 * Sistema de A/B testing automático para campanhas de marketing
 * - Cria variantes automaticamente
 * - Tracka performance de cada variante
 * - Seleciona vencedoras automaticamente
 * - Escala vencedoras
 * 
 * TODO: Integrar Facebook Ads quando implementado
 * - Criar variantes no Facebook Ads API
 * - Trackar métricas do Facebook Ads
 * - Comparar performance entre Google Ads e Facebook Ads
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { createCampaign, getCampaignMetrics, pauseCampaign, resumeCampaign, updateCampaignBudget } from '../utils/google_ads_client.js';
import { callLLM } from '../utils/llm_client.js';
import { logger } from '../utils/logger.js';
import { calculateCPA, calculateROI } from '../utils/marketing_metrics.js';

const log = logger.child({ module: 'marketing_ab_testing' });

config({ path: fs.existsSync('.env') ? '.env' : 'env.local' });

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Cria variantes de uma campanha para A/B testing
 * 
 * @param {Object} params - Parâmetros da campanha original
 * @param {number} variantCount - Número de variantes a criar (padrão: 2)
 * @returns {Promise<Object>} Resultado com variantes criadas
 */
export async function createABTestVariants(params, variantCount = 2) {
    const { name, objective, dailyBudget, keywords, adCopy, targetAudience, platform = 'google_ads' } = params;

    log.info('Criando variantes A/B', { name, variantCount, platform });

    try {
        const variants = [];

        // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
        // if (platform === 'facebook_ads') {
        //     return await createFacebookABTestVariants(params, variantCount);
        // }

        if (platform !== 'google_ads') {
            throw new Error(`Plataforma ${platform} ainda não suportada para A/B testing. Use 'google_ads'.`);
        }

        // Gerar variantes de copy usando LLM
        const variantPrompts = [];
        for (let i = 0; i < variantCount; i++) {
            variantPrompts.push(
                `Crie uma variação ${i + 1} do seguinte anúncio, mantendo a mesma mensagem principal mas mudando a abordagem, tom ou estrutura:
                
Anúncio Original:
- Headline 1: ${adCopy?.headline1 || 'N/A'}
- Headline 2: ${adCopy?.headline2 || 'N/A'}
- Headline 3: ${adCopy?.headline3 || 'N/A'}
- Description 1: ${adCopy?.description1 || 'N/A'}
- Description 2: ${adCopy?.description2 || 'N/A'}

Crie uma variação criativa e persuasiva, retornando JSON com:
{
  "headline1": "...",
  "headline2": "...",
  "headline3": "...",
  "description1": "...",
  "description2": "...",
  "path1": "${adCopy?.path1 || ''}",
  "path2": "${adCopy?.path2 || ''}",
  "finalUrl": "${adCopy?.finalUrl || ''}"
}`
            );
        }

        // Gerar variantes de copy
        const variantCopies = [];
        for (const prompt of variantPrompts) {
            try {
                const response = await callLLM(
                    prompt,
                    'Você é um especialista em copywriting e marketing digital. Crie variações criativas e persuasivas de anúncios.',
                    0.8
                );

                // Tentar extrair JSON da resposta
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const variantCopy = JSON.parse(jsonMatch[0]);
                    variantCopies.push(variantCopy);
                } else {
                    // Fallback: usar copy original com pequenas variações
                    variantCopies.push({
                        ...adCopy,
                        headline1: `${adCopy?.headline1 || 'Teste'} - Variante ${variantCopies.length + 1}`,
                    });
                }
            } catch (error) {
                log.warn('Erro ao gerar variante de copy, usando fallback', { error: error.message });
                variantCopies.push({
                    ...adCopy,
                    headline1: `${adCopy?.headline1 || 'Teste'} - Variante ${variantCopies.length + 1}`,
                });
            }
        }

        // Criar campanhas variantes
        for (let i = 0; i < variantCount; i++) {
            const variantName = `${name} - Variante ${String.fromCharCode(65 + i)}`; // A, B, C...
            const variantCopy = variantCopies[i] || adCopy;

            try {
                // Dividir orçamento igualmente entre variantes
                const variantBudget = dailyBudget / variantCount;

                const result = await createCampaign({
                    name: variantName,
                    objective: objective.toUpperCase(),
                    dailyBudget: Math.round(variantBudget * 100), // Converter para centavos
                    keywords: keywords || [],
                    adGroupName: `${variantName} - Ad Group`,
                    adCopy: variantCopy,
                });

                if (result.success) {
                    // Salvar no Supabase
                    const { data: campaign, error } = await supabase
                        .from('cerebro_marketing_campaigns')
                        .insert({
                            name: variantName,
                            status: 'paused', // Variantes iniciam pausadas para revisão
                            platform: 'google_ads',
                            campaign_type: 'search',
                            objective: objective.toLowerCase(),
                            daily_budget: variantBudget,
                            platform_campaign_id: result.campaignId.toString(),
                            keywords: keywords || [],
                            target_audience: targetAudience || {},
                            ad_variants: [variantCopy],
                            metadata: {
                                ab_test_id: `${name}-${Date.now()}`,
                                variant_letter: String.fromCharCode(65 + i),
                                is_variant: true,
                                original_campaign: name,
                            },
                        })
                        .select()
                        .single();

                    if (!error && campaign) {
                        variants.push({
                            variantId: campaign.id,
                            platformCampaignId: result.campaignId,
                            variantName,
                            variantCopy,
                            status: 'paused',
                        });
                    }
                }
            } catch (error) {
                log.error('Erro ao criar variante', { variantIndex: i, error: error.message });
            }
        }

        // Salvar informação do teste A/B
        await supabase.from('corporate_memory').insert({
            content: `Teste A/B criado: ${name} com ${variants.length} variantes`,
            category: 'history',
            sensitivity: 'low',
            metadata: {
                type: 'ab_test_created',
                test_name: name,
                variant_count: variants.length,
                variants: variants.map(v => ({
                    id: v.variantId,
                    name: v.variantName,
                })),
            },
        });

        return {
            success: true,
            testName: name,
            variants: variants,
            message: `${variants.length} variantes criadas com sucesso. Status: PAUSED (aguardando ativação manual)`,
        };

    } catch (error) {
        log.error('Erro ao criar variantes A/B', { error: error.message, stack: error.stack });
        throw error;
    }
}

/**
 * Analisa resultados de um teste A/B e identifica vencedora
 * 
 * @param {string} testName - Nome do teste A/B
 * @param {number} minDays - Número mínimo de dias de dados (padrão: 7)
 * @returns {Promise<Object>} Resultado da análise
 */
export async function analyzeABTestResults(testName, minDays = 7) {
    log.info('Analisando resultados A/B', { testName, minDays });

    try {
        // Buscar todas as variantes do teste
        const { data: variants, error } = await supabase
            .from('cerebro_marketing_campaigns')
            .select('*')
            .eq('metadata->>original_campaign', testName)
            .eq('metadata->>is_variant', 'true');

        if (error || !variants || variants.length === 0) {
            throw new Error('Nenhuma variante encontrada para este teste A/B');
        }

        // Coletar métricas de cada variante
        const variantMetrics = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - minDays);

        for (const variant of variants) {
            if (!variant.platform_campaign_id || variant.platform !== 'google_ads') {
                continue;
            }

            // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
            // if (variant.platform === 'facebook_ads') {
            //     const metrics = await getFacebookCampaignMetrics(variant.platform_campaign_id, startDate, endDate);
            //     variantMetrics.push({ variant, metrics });
            //     continue;
            // }

            try {
                const metrics = await getCampaignMetrics(
                    variant.platform_campaign_id,
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0]
                );

                if (metrics.success) {
                    const roi = variant.revenue
                        ? calculateROI(variant.revenue, metrics.cost)
                        : null;

                    const cpa = metrics.conversions > 0
                        ? calculateCPA(metrics.cost, metrics.conversions)
                        : null;

                    variantMetrics.push({
                        variant,
                        metrics: {
                            ...metrics,
                            roi,
                            cpa,
                            score: calculateVariantScore(metrics, roi, cpa),
                        },
                    });
                }
            } catch (error) {
                log.error('Erro ao coletar métricas da variante', {
                    variantId: variant.id,
                    error: error.message,
                });
            }
        }

        if (variantMetrics.length === 0) {
            throw new Error('Nenhuma métrica coletada das variantes');
        }

        // Identificar vencedora (maior score)
        variantMetrics.sort((a, b) => b.metrics.score - a.metrics.score);
        const winner = variantMetrics[0];
        const losers = variantMetrics.slice(1);

        // Calcular significância estatística (simplificado)
        const significance = calculateStatisticalSignificance(variantMetrics);

        return {
            success: true,
            testName,
            winner: {
                variantId: winner.variant.id,
                variantName: winner.variant.name,
                score: winner.metrics.score,
                metrics: winner.metrics,
            },
            losers: losers.map(l => ({
                variantId: l.variant.id,
                variantName: l.variant.name,
                score: l.metrics.score,
                metrics: l.metrics,
            })),
            significance,
            recommendation: significance >= 0.95
                ? 'Vencedora estatisticamente significativa. Pode pausar perdedoras e escalar vencedora.'
                : 'Diferença não estatisticamente significativa. Continuar teste ou aumentar amostra.',
        };

    } catch (error) {
        log.error('Erro ao analisar resultados A/B', { error: error.message, stack: error.stack });
        throw error;
    }
}

/**
 * Calcula score de performance de uma variante (0-100)
 */
function calculateVariantScore(metrics, roi, cpa) {
    let score = 0;

    // CTR (até 30 pontos)
    if (metrics.ctr > 0) {
        score += Math.min(metrics.ctr * 10, 30);
    }

    // CPA (até 30 pontos) - quanto menor, melhor
    if (cpa && cpa < 100) {
        score += Math.max(0, 30 - (cpa / 100) * 30);
    }

    // ROI (até 30 pontos)
    if (roi && roi > 0) {
        score += Math.min(roi / 10, 30);
    }

    // Taxa de conversão (até 10 pontos)
    if (metrics.conversionRate > 0) {
        score += Math.min(metrics.conversionRate * 5, 10);
    }

    return Math.round(score);
}

/**
 * Calcula significância estatística (simplificado)
 */
function calculateStatisticalSignificance(variantMetrics) {
    if (variantMetrics.length < 2) {
        return 0;
    }

    // Simplificação: se a diferença de score for > 20 pontos, considerar significativa
    const scores = variantMetrics.map(v => v.metrics.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const difference = maxScore - minScore;

    // Se diferença for grande e houver dados suficientes, considerar significativa
    if (difference > 20) {
        const totalClicks = variantMetrics.reduce((sum, v) => sum + (v.metrics.clicks || 0), 0);
        if (totalClicks > 100) {
            return 0.95; // 95% de confiança
        }
    }

    return 0.7; // 70% de confiança (não muito significativo)
}

/**
 * Escala vencedora e pausa perdedoras
 * 
 * @param {string} testName - Nome do teste A/B
 * @param {number} scaleFactor - Fator de escala (padrão: 2x)
 */
export async function scaleWinnerAndPauseLosers(testName, scaleFactor = 2) {
    log.info('Escalando vencedora e pausando perdedoras', { testName, scaleFactor });

    try {
        // Analisar resultados
        const analysis = await analyzeABTestResults(testName);

        if (!analysis.success) {
            throw new Error('Erro ao analisar resultados do teste A/B');
        }

        // Escalar vencedora
        const winner = analysis.winner;
        const winnerCampaign = await supabase
            .from('cerebro_marketing_campaigns')
            .select('*')
            .eq('id', winner.variantId)
            .single();

        if (winnerCampaign.data && winnerCampaign.data.platform === 'google_ads') {
            const newBudget = (winnerCampaign.data.daily_budget || 0) * scaleFactor;

            // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
            // if (winnerCampaign.data.platform === 'facebook_ads') {
            //     await updateFacebookCampaignBudget(winnerCampaign.data.platform_campaign_id, newBudget);
            // }

            // Converter para centavos (updateCampaignBudget espera em centavos)
            const newBudgetInCents = Math.round(newBudget * 100);
            await updateCampaignBudget(winnerCampaign.data.platform_campaign_id, newBudgetInCents);

            // Retomar se estiver pausada
            if (winnerCampaign.data.status === 'paused') {
                await resumeCampaign(winnerCampaign.data.platform_campaign_id);
            }

            // Atualizar no Supabase
            await supabase
                .from('cerebro_marketing_campaigns')
                .update({
                    daily_budget: newBudget,
                    status: 'active',
                    metadata: {
                        ...winnerCampaign.data.metadata,
                        ab_test_winner: true,
                        scaled_at: new Date().toISOString(),
                    },
                })
                .eq('id', winner.variantId);
        }

        // Pausar perdedoras
        for (const loser of analysis.losers) {
            const loserCampaign = await supabase
                .from('cerebro_marketing_campaigns')
                .select('*')
                .eq('id', loser.variantId)
                .single();

            if (loserCampaign.data && loserCampaign.data.platform === 'google_ads') {
                // TODO: Quando Facebook Ads for implementado, adicionar suporte aqui
                // if (loserCampaign.data.platform === 'facebook_ads') {
                //     await pauseFacebookCampaign(loserCampaign.data.platform_campaign_id);
                // }

                await pauseCampaign(loserCampaign.data.platform_campaign_id);

                await supabase
                    .from('cerebro_marketing_campaigns')
                    .update({
                        status: 'paused',
                        metadata: {
                            ...loserCampaign.data.metadata,
                            ab_test_loser: true,
                            paused_at: new Date().toISOString(),
                        },
                    })
                    .eq('id', loser.variantId);
            }
        }

        // Log
        await supabase.from('corporate_memory').insert({
            content: `Teste A/B finalizado: ${testName}. Vencedora: ${winner.variantName} escalada ${scaleFactor}x. Perdedoras pausadas.`,
            category: 'history',
            sensitivity: 'low',
            metadata: {
                type: 'ab_test_completed',
                test_name: testName,
                winner: winner.variantName,
                scale_factor: scaleFactor,
                losers: analysis.losers.map(l => l.variantName),
            },
        });

        return {
            success: true,
            message: `Vencedora ${winner.variantName} escalada ${scaleFactor}x. ${analysis.losers.length} perdedoras pausadas.`,
            winner: winner.variantName,
            scaled: scaleFactor,
            paused: analysis.losers.length,
        };

    } catch (error) {
        log.error('Erro ao escalar vencedora', { error: error.message, stack: error.stack });
        throw error;
    }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    const testName = process.argv[3];

    if (command === 'analyze' && testName) {
        analyzeABTestResults(testName)
            .then(result => {
                console.log('✅ Análise A/B:', JSON.stringify(result, null, 2));
                process.exit(0);
            })
            .catch(error => {
                console.error('❌ Erro:', error.message);
                process.exit(1);
            });
    } else if (command === 'scale' && testName) {
        scaleWinnerAndPauseLosers(testName)
            .then(result => {
                console.log('✅ Escalação concluída:', JSON.stringify(result, null, 2));
                process.exit(0);
            })
            .catch(error => {
                console.error('❌ Erro:', error.message);
                process.exit(1);
            });
    } else {
        console.log('Uso: node marketing_ab_testing.js [analyze|scale] <test_name>');
        process.exit(1);
    }
}

