/**
 * Serviço para gerenciar perfis de risco das estratégias
 * Cada estratégia tem 3 opções: AGRESSIVA, CONSERVADORA, MEDIANA
 */

export interface RiskProfile {
    id: string;
    name: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE';
    displayName: string;
    description: string;
    stopLoss: number; // Percentual
    takeProfit: number; // Percentual
    riskRewardRatio: number; // Relação risco/retorno
    color: string; // Cor para UI
}

export interface StrategyRiskConfig {
    strategyId: string;
    strategyName: string;
    timeframe: string;
    currentProfile: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE';
    profiles: {
        AGGRESSIVE: RiskProfile;
        CONSERVATIVE: RiskProfile;
        MODERATE: RiskProfile;
    };
    createdAt: string;
    updatedAt: string;
}

export class StrategyRiskProfileService {
    private storageService: any; // Será injetado

    constructor(storageService: any) {
        this.storageService = storageService;
        this.initializeDefaultRiskProfiles();
    }

    private async initializeDefaultRiskProfiles(): Promise<void> {
        const existingConfigs = await this.getAllStrategyRiskConfigs();

        if (existingConfigs.length === 0) {
            // Configurações padrão para cada estratégia baseada no timeframe
            const defaultConfigs: StrategyRiskConfig[] = [
                // ESTRATÉGIAS 10s (Ultra-Rápido)
                {
                    strategyId: 'scalping-10s-rsi',
                    strategyName: 'Scalping RSI 10s',
                    timeframe: '10s',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-10s-rsi-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 0.3,
                            takeProfit: 1.2,
                            riskRewardRatio: 4.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-10s-rsi-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 0.8,
                            takeProfit: 0.6,
                            riskRewardRatio: 0.75,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-10s-rsi-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 0.5,
                            takeProfit: 1.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'scalping-10s-momentum',
                    strategyName: 'Scalping Momentum 10s',
                    timeframe: '10s',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-10s-momentum-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 0.2,
                            takeProfit: 1.0,
                            riskRewardRatio: 5.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-10s-momentum-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 0.6,
                            takeProfit: 0.5,
                            riskRewardRatio: 0.83,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-10s-momentum-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 0.3,
                            takeProfit: 0.8,
                            riskRewardRatio: 2.67,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'scalping-10s-breakout',
                    strategyName: 'Scalping Breakout 10s',
                    timeframe: '10s',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-10s-breakout-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 0.3,
                            takeProfit: 1.5,
                            riskRewardRatio: 5.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-10s-breakout-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 0.7,
                            takeProfit: 0.8,
                            riskRewardRatio: 1.14,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-10s-breakout-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 0.4,
                            takeProfit: 1.2,
                            riskRewardRatio: 3.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },

                // ESTRATÉGIAS 1m (Scalping Rápido)
                {
                    strategyId: 'scalping-1m-rsi-macd',
                    strategyName: 'Scalping RSI+MACD 1m',
                    timeframe: '1m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-1m-rsi-macd-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 0.7,
                            takeProfit: 3.5,
                            riskRewardRatio: 5.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-1m-rsi-macd-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 1.5,
                            takeProfit: 1.8,
                            riskRewardRatio: 1.2,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-1m-rsi-macd-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 1.0,
                            takeProfit: 2.5,
                            riskRewardRatio: 2.5,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'scalping-1m-trend',
                    strategyName: 'Scalping Trend 1m',
                    timeframe: '1m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-1m-trend-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 1.0,
                            takeProfit: 4.5,
                            riskRewardRatio: 4.5,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-1m-trend-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 2.0,
                            takeProfit: 2.2,
                            riskRewardRatio: 1.1,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-1m-trend-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 1.5,
                            takeProfit: 3.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'scalping-1m-reversal',
                    strategyName: 'Scalping Reversal 1m',
                    timeframe: '1m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'scalping-1m-reversal-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 1.2,
                            takeProfit: 6.0,
                            riskRewardRatio: 5.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'scalping-1m-reversal-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 2.5,
                            takeProfit: 3.0,
                            riskRewardRatio: 1.2,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'scalping-1m-reversal-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 2.0,
                            takeProfit: 4.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },

                // ESTRATÉGIAS 5m (Swing Trading)
                {
                    strategyId: 'swing-5m-macd',
                    strategyName: 'Swing MACD 5m',
                    timeframe: '5m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'swing-5m-macd-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 2.0,
                            takeProfit: 9.0,
                            riskRewardRatio: 4.5,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'swing-5m-macd-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 4.0,
                            takeProfit: 4.5,
                            riskRewardRatio: 1.125,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'swing-5m-macd-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 3.0,
                            takeProfit: 6.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'swing-5m-bollinger',
                    strategyName: 'Swing Bollinger 5m',
                    timeframe: '5m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'swing-5m-bollinger-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 2.5,
                            takeProfit: 12.0,
                            riskRewardRatio: 4.8,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'swing-5m-bollinger-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 5.0,
                            takeProfit: 6.0,
                            riskRewardRatio: 1.2,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'swing-5m-bollinger-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 4.0,
                            takeProfit: 8.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    strategyId: 'swing-5m-rsi-trend',
                    strategyName: 'Swing RSI+Trend 5m',
                    timeframe: '5m',
                    currentProfile: 'MODERATE',
                    profiles: {
                        AGGRESSIVE: {
                            id: 'swing-5m-rsi-trend-aggressive',
                            name: 'AGGRESSIVE',
                            displayName: 'Agressiva',
                            description: 'Alto risco, alto retorno - Stop Loss apertado, Take Profit alto',
                            stopLoss: 3.0,
                            takeProfit: 15.0,
                            riskRewardRatio: 5.0,
                            color: '#ef4444'
                        },
                        CONSERVATIVE: {
                            id: 'swing-5m-rsi-trend-conservative',
                            name: 'CONSERVATIVE',
                            displayName: 'Conservadora',
                            description: 'Baixo risco, baixo retorno - Stop Loss largo, Take Profit baixo',
                            stopLoss: 6.0,
                            takeProfit: 7.5,
                            riskRewardRatio: 1.25,
                            color: '#10b981'
                        },
                        MODERATE: {
                            id: 'swing-5m-rsi-trend-moderate',
                            name: 'MODERATE',
                            displayName: 'Mediana',
                            description: 'Risco moderado, retorno equilibrado',
                            stopLoss: 5.0,
                            takeProfit: 10.0,
                            riskRewardRatio: 2.0,
                            color: '#f59e0b'
                        }
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            await this.storageService.saveData('strategy-risk-configs', defaultConfigs);
        }
    }

    async getAllStrategyRiskConfigs(): Promise<StrategyRiskConfig[]> {
        try {
            const configs = await this.storageService.getData('strategy-risk-configs') || [];
            return (configs as StrategyRiskConfig[]).sort((a: StrategyRiskConfig, b: StrategyRiskConfig) => {
                // Ordenar por timeframe primeiro, depois por nome
                const timeframeOrder: { [key: string]: number } = { '10s': 1, '1m': 2, '5m': 3, '15m': 4, '1h': 5, '4h': 6, '1d': 7 };
                const aOrder = timeframeOrder[a.timeframe] || 999;
                const bOrder = timeframeOrder[b.timeframe] || 999;

                if (aOrder !== bOrder) return aOrder - bOrder;
                return a.strategyName.localeCompare(b.strategyName);
            });
        } catch (error) {
            console.error('Erro ao obter configurações de risco:', error);
            return [];
        }
    }

    async getStrategyRiskConfig(strategyId: string): Promise<StrategyRiskConfig | null> {
        try {
            const configs = await this.getAllStrategyRiskConfigs();
            return configs.find(config => config.strategyId === strategyId) || null;
        } catch (error) {
            console.error('Erro ao obter configuração de risco da estratégia:', error);
            return null;
        }
    }

    async updateStrategyRiskProfile(strategyId: string, profile: 'AGGRESSIVE' | 'CONSERVATIVE' | 'MODERATE'): Promise<StrategyRiskConfig | null> {
        try {
            const configs = await this.getAllStrategyRiskConfigs();
            const configIndex = configs.findIndex(config => config.strategyId === strategyId);

            if (configIndex === -1) return null;

            configs[configIndex].currentProfile = profile;
            configs[configIndex].updatedAt = new Date().toISOString();

            await this.storageService.saveData('strategy-risk-configs', configs);
            return configs[configIndex];
        } catch (error) {
            console.error('Erro ao atualizar perfil de risco da estratégia:', error);
            throw error;
        }
    }

    async getCurrentRiskProfile(strategyId: string): Promise<RiskProfile | null> {
        try {
            const config = await this.getStrategyRiskConfig(strategyId);
            if (!config) return null;

            return config.profiles[config.currentProfile];
        } catch (error) {
            console.error('Erro ao obter perfil de risco atual:', error);
            return null;
        }
    }

    async getRiskProfilesForStrategy(strategyId: string): Promise<RiskProfile[] | null> {
        try {
            const config = await this.getStrategyRiskConfig(strategyId);
            if (!config) return null;

            return [
                config.profiles.AGGRESSIVE,
                config.profiles.MODERATE,
                config.profiles.CONSERVATIVE
            ];
        } catch (error) {
            console.error('Erro ao obter perfis de risco da estratégia:', error);
            return null;
        }
    }

    // Método para obter configurações por timeframe
    async getRiskConfigsByTimeframe(timeframe: string): Promise<StrategyRiskConfig[]> {
        const configs = await this.getAllStrategyRiskConfigs();
        return configs.filter(config => config.timeframe === timeframe);
    }

    // Método para obter configurações de estratégias ativas
    async getActiveStrategyRiskConfigs(): Promise<StrategyRiskConfig[]> {
        // Este método precisará ser integrado com o TradingStrategyService
        // para verificar quais estratégias estão ativas
        const configs = await this.getAllStrategyRiskConfigs();
        // Por enquanto, retorna todas as configurações
        // TODO: Integrar com TradingStrategyService para filtrar apenas ativas
        return configs;
    }
}

export default StrategyRiskProfileService;
