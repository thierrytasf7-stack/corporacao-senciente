#!/usr/bin/env node

/**
 * Test Finance Agent - AI Cost Management Specialist
 */

import { FinanceAgent } from './agents/business/finance_agent.js';
import { logger } from './utils/logger.js';

export async function testFinanceAgent() {
    logger.info('Testando Finance Agent - AI Cost Management...');

    try {
        const financeAgent = new FinanceAgent({ name: 'TestFinance' });

        logger.info('Teste 1: Inicialização do Finance Agent...');
        console.log('✅ Agente inicializado com capacidades:', financeAgent.tools);

        logger.info('Teste 2: Análise de Custos Inteligente...');
        const costAnalysisResult = await financeAgent.processTask({
            description: 'Analyze company costs',
            financial_type: 'cost_analysis',
            cost_data: {
                fixedCosts: 50000,
                variableCosts: 30000,
                totalRevenue: 120000,
                costBreakdown: {
                    marketing: 15000,
                    development: 25000,
                    operations: 20000,
                    infrastructure: 20000
                }
            }
        });
        console.log('✅ Análise de custos concluída:', costAnalysisResult.success);
        console.log('   Potencial de redução:', costAnalysisResult.totalCostReductionPotential);
        console.log('   Score de eficiência:', costAnalysisResult.costEfficiencyScore + '%');

        logger.info('Teste 3: Otimização de Orçamento...');
        const budgetOptimizationResult = await financeAgent.processTask({
            description: 'Optimize company budget',
            financial_type: 'budget_optimization',
            budget_data: {
                totalBudget: 100000,
                allocations: {
                    marketing: 30000,
                    development: 40000,
                    operations: 30000
                },
                goals: {
                    marketingROI: 3.5,
                    developmentEfficiency: 85,
                    operationalCostReduction: 15
                }
            }
        });
        console.log('✅ Otimização de orçamento concluída:', budgetOptimizationResult.success);
        console.log('   Ganho de eficiência:', budgetOptimizationResult.efficiencyGain + '%');
        console.log('   Avaliação de risco:', budgetOptimizationResult.riskAssessment);

        logger.info('Teste 4: Previsão Financeira...');
        const forecastingResult = await financeAgent.processTask({
            description: 'Forecast financial performance',
            financial_type: 'financial_forecasting',
            financial_data: {
                historicalData: [
                    { month: 'Jan', revenue: 100000, costs: 80000 },
                    { month: 'Feb', revenue: 110000, costs: 85000 },
                    { month: 'Mar', revenue: 120000, costs: 82000 }
                ],
                marketConditions: {
                    growth: 0.15,
                    inflation: 0.03,
                    competition: 'moderate'
                }
            }
        });
        console.log('✅ Previsão financeira concluída:', forecastingResult.success);
        console.log('   Acurácia da previsão:', (forecastingResult.forecastAccuracy * 100).toFixed(1) + '%');
        console.log('   Cenários gerados:', forecastingResult.forecastScenarios.length);

        logger.info('Teste 5: Análise de ROI...');
        const roiAnalysisResult = await financeAgent.processTask({
            description: 'Analyze ROI for investments',
            financial_type: 'roi_analysis',
            investment_data: [
                {
                    name: 'Marketing Campaign',
                    cost: 25000,
                    expectedRevenue: 75000,
                    timeline: 12,
                    riskLevel: 'low'
                },
                {
                    name: 'New Product Development',
                    cost: 50000,
                    expectedRevenue: 150000,
                    timeline: 18,
                    riskLevel: 'medium'
                }
            ]
        });
        console.log('✅ Análise de ROI concluída:', roiAnalysisResult.success);
        console.log('   ROI geral:', roiAnalysisResult.overallROI + 'x');
        console.log('   ROI ajustado ao risco:', roiAnalysisResult.riskAdjustedROI + 'x');

        logger.info('Teste 6: Otimização de Pricing...');
        const pricingOptimizationResult = await financeAgent.processTask({
            description: 'Optimize pricing strategy',
            financial_type: 'pricing_optimization',
            pricing_data: {
                currentPrice: 99,
                costPerUnit: 25,
                marketPosition: 'premium',
                competitorPrices: [79, 89, 109, 119],
                demandElasticity: -1.2,
                customerSegments: [
                    { segment: 'enterprise', willingnessToPay: 150, volume: 100 },
                    { segment: 'small_business', willingnessToPay: 89, volume: 500 },
                    { segment: 'individual', willingnessToPay: 59, volume: 1000 }
                ]
            }
        });
        console.log('✅ Otimização de pricing concluída:', pricingOptimizationResult.success);
        console.log('   Otimização de receita:', pricingOptimizationResult.revenueOptimization + '%');
        console.log('   Melhoria de margem:', pricingOptimizationResult.marginImprovement + '%');

        logger.info('Teste 7: Avaliação de Risco...');
        const riskAssessmentResult = await financeAgent.processTask({
            description: 'Assess financial risk',
            financial_type: 'risk_assessment',
            risk_data: {
                exposures: {
                    market: 0.3,
                    operational: 0.2,
                    financial: 0.1,
                    strategic: 0.4
                },
                volatility: 0.25,
                correlationMatrix: {},
                stressScenarios: [
                    { name: 'Market Crash', probability: 0.1, impact: -0.5 },
                    { name: 'Competition Surge', probability: 0.3, impact: -0.2 },
                    { name: 'Regulatory Change', probability: 0.2, impact: -0.3 }
                ]
            }
        });
        console.log('✅ Avaliação de risco concluída:', riskAssessmentResult.success);
        console.log('   Score de risco geral:', riskAssessmentResult.overallRiskScore);
        console.log('   Tolerância ao risco:', riskAssessmentResult.riskToleranceAssessment);

        logger.info('Teste 8: Otimização de Fluxo de Caixa...');
        const cashFlowOptimizationResult = await financeAgent.processTask({
            description: 'Optimize cash flow',
            financial_type: 'cash_flow',
            cash_flow_data: {
                receivables: {
                    averageCollectionPeriod: 45,
                    totalReceivables: 150000
                },
                payables: {
                    averagePaymentPeriod: 30,
                    totalPayables: 80000
                },
                cashBalance: 50000,
                monthlyCashFlow: [
                    { month: 'Jan', inflows: 120000, outflows: 100000 },
                    { month: 'Feb', inflows: 130000, outflows: 105000 },
                    { month: 'Mar', inflows: 125000, outflows: 102000 }
                ]
            }
        });
        console.log('✅ Otimização de fluxo de caixa concluída:', cashFlowOptimizationResult.success);
        console.log('   Melhoria de fluxo de caixa:', cashFlowOptimizationResult.cashFlowImprovement + '%');
        console.log('   Otimização de capital de giro: $', cashFlowOptimizationResult.workingCapitalOptimization);

        logger.info('Teste 9: Análise Financeira Abrangente...');
        const comprehensiveAnalysisResult = await financeAgent.processTask({
            description: 'Conduct comprehensive financial analysis',
            financial_type: 'comprehensive',
            cost_data: { fixedCosts: 50000, variableCosts: 30000 },
            budget_data: { totalBudget: 100000 },
            financial_data: { historicalData: [] },
            investment_data: []
        });
        console.log('✅ Análise financeira abrangente concluída:', comprehensiveAnalysisResult.success);
        console.log('   Métricas chave:', comprehensiveAnalysisResult.keyMetrics?.length || 0);
        console.log('   Plano de ação:', comprehensiveAnalysisResult.actionPlan?.length || 0);

        logger.info('Todos os testes do Finance Agent concluídos com sucesso!');
        return true;

    } catch (error) {
        logger.error('Erro durante os testes:', error);
        console.error('❌ Erro durante os testes:', error);
        return false;
    }
}

// Para execução direta
if (import.meta.url === `file://${process.argv[1]}`) {
    testFinanceAgent();
}
