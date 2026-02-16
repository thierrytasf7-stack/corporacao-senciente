import { StrategyStorageService } from './StrategyStorageService';

export interface TradingStrategy {
    id: string;
    name: string;
    description: string;
    timeframe: '10s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    isActive: boolean;
    isFavorite: boolean; // Marcador para uso na análise rotativa
    maxCandles: number; // Máximo de candles a analisar (padrão 30 para 1m)
    indicators: {
        rsi?: {
            period: number;
            overbought: number;
            oversold: number;
        };
        macd?: {
            fastPeriod: number;
            slowPeriod: number;
            signalPeriod: number;
        };
        bollingerBands?: {
            period: number;
            standardDeviation: number;
        };
        movingAverage?: {
            type: 'SMA' | 'EMA';
            period: number;
        };
        volume?: {
            minVolume: number;
        };
    };
    rules: {
        buyConditions: string[];
        sellConditions: string[];
        // Observação: SL/TP pertencem à estratégia matemática, não expor aqui
    };
    createdAt: string;
    updatedAt: string;
}

export class TradingStrategyService {
    private storageService: StrategyStorageService;

    constructor() {
        this.storageService = new StrategyStorageService();
        this.initializeDefaultStrategies();
    }

    private async initializeDefaultStrategies(): Promise<void> {
        const strategies = await this.getAllStrategies();

        if (strategies.length === 0) {
            const defaultStrategies: TradingStrategy[] = [
                // ESTRATÉGIAS PARA 10 SEGUNDOS (Scalping Ultra-Rápido)
                {
                    id: 'scalping-10s-rsi',
                    name: 'Scalping RSI 10s',
                    description: 'Estratégia de scalping ultra-rápida baseada em RSI para candles de 10 segundos',
                    timeframe: '10s',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 50,
                    indicators: {
                        rsi: { period: 14, overbought: 70, oversold: 30 },
                        volume: { minVolume: 1000 }
                    },
                    rules: {
                        buyConditions: ['RSI < 30', 'Volume > minVolume'],
                        sellConditions: ['RSI > 70']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'scalping-10s-momentum',
                    name: 'Scalping Momentum 10s',
                    description: 'Estratégia baseada em momentum e volume para candles de 10 segundos',
                    timeframe: '10s',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 30,
                    indicators: {
                        movingAverage: { type: 'EMA', period: 9 },
                        volume: { minVolume: 1500 }
                    },
                    rules: {
                        buyConditions: ['Price > EMA9', 'Volume > minVolume * 1.5'],
                        sellConditions: ['Price < EMA9']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'scalping-10s-breakout',
                    name: 'Scalping Breakout 10s',
                    description: 'Estratégia de breakout para candles de 10 segundos',
                    timeframe: '10s',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 40,
                    indicators: {
                        bollingerBands: { period: 20, standardDeviation: 2 },
                        volume: { minVolume: 2000 }
                    },
                    rules: {
                        buyConditions: ['Price > Upper BB', 'Volume > minVolume'],
                        sellConditions: ['Price < Middle BB']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },

                // ESTRATÉGIAS PARA 1 MINUTO (Scalping Rápido)
                {
                    id: 'scalping-1m-rsi-macd',
                    name: 'Scalping RSI+MACD 1m',
                    description: 'Estratégia combinando RSI e MACD para candles de 1 minuto',
                    timeframe: '1m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 30, // padronizado para 30 velas
                    indicators: {
                        rsi: { period: 14, overbought: 75, oversold: 25 },
                        macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                        volume: { minVolume: 5000 }
                    },
                    rules: {
                        buyConditions: ['RSI < 25', 'MACD > Signal', 'Volume > minVolume'],
                        sellConditions: ['RSI > 75', 'MACD < Signal']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'scalping-1m-trend',
                    name: 'Scalping Trend 1m',
                    description: 'Estratégia de tendência para candles de 1 minuto',
                    timeframe: '1m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 30,
                    indicators: {
                        movingAverage: { type: 'EMA', period: 21 },
                        volume: { minVolume: 8000 }
                    },
                    rules: {
                        buyConditions: ['Price > EMA21', 'Volume > minVolume * 1.2'],
                        sellConditions: ['Price < EMA21 * 0.995']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'scalping-1m-reversal',
                    name: 'Scalping Reversal 1m',
                    description: 'Estratégia de reversão para candles de 1 minuto',
                    timeframe: '1m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 30,
                    indicators: {
                        rsi: { period: 14, overbought: 80, oversold: 20 },
                        bollingerBands: { period: 20, standardDeviation: 2.5 },
                        volume: { minVolume: 10000 }
                    },
                    rules: {
                        buyConditions: ['RSI < 20', 'Price < Lower BB', 'Volume > minVolume'],
                        sellConditions: ['RSI > 80', 'Price > Upper BB']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },

                // ESTRATÉGIAS PARA 5 MINUTOS (Swing Trading)
                {
                    id: 'swing-5m-macd',
                    name: 'Swing MACD 5m',
                    description: 'Estratégia de swing baseada em MACD para candles de 5 minutos',
                    timeframe: '5m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 100,
                    indicators: {
                        macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                        volume: { minVolume: 15000 }
                    },
                    rules: {
                        buyConditions: ['MACD > Signal', 'MACD > 0', 'Volume > minVolume'],
                        sellConditions: ['MACD < Signal', 'MACD < 0']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'swing-5m-bollinger',
                    name: 'Swing Bollinger 5m',
                    description: 'Estratégia de swing baseada em Bollinger Bands para candles de 5 minutos',
                    timeframe: '5m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 100,
                    indicators: {
                        bollingerBands: { period: 20, standardDeviation: 2 },
                        movingAverage: { type: 'SMA', period: 20 },
                        volume: { minVolume: 20000 }
                    },
                    rules: {
                        buyConditions: ['Price < Lower BB', 'Volume > minVolume'],
                        sellConditions: ['Price > Upper BB']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'swing-5m-rsi-trend',
                    name: 'Swing RSI+Trend 5m',
                    description: 'Estratégia combinando RSI e tendência para candles de 5 minutos',
                    timeframe: '5m',
                    isActive: false,
                    isFavorite: false,
                    maxCandles: 100,
                    indicators: {
                        rsi: { period: 14, overbought: 70, oversold: 30 },
                        movingAverage: { type: 'EMA', period: 50 },
                        volume: { minVolume: 25000 }
                    },
                    rules: {
                        buyConditions: ['RSI < 30', 'Price > EMA50', 'Volume > minVolume'],
                        sellConditions: ['RSI > 70', 'Price < EMA50']
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            await this.storageService.saveData('trading-strategies', defaultStrategies);
        }
    }

    async getAllStrategies(): Promise<TradingStrategy[]> {
        try {
            const strategies = await this.storageService.getData<TradingStrategy[]>('trading-strategies') || [];
            return strategies.sort((a, b) => {
                // Ordenar por timeframe primeiro, depois por nome
                const timeframeOrder = { '10s': 1, '1m': 2, '5m': 3, '15m': 4, '1h': 5, '4h': 6, '1d': 7 };
                const aOrder = timeframeOrder[a.timeframe] || 999;
                const bOrder = timeframeOrder[b.timeframe] || 999;

                if (aOrder !== bOrder) return aOrder - bOrder;
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error('Erro ao obter estratégias:', error);
            return [];
        }
    }

    async getStrategiesByTimeframe(timeframe: TradingStrategy['timeframe']): Promise<TradingStrategy[]> {
        const strategies = await this.getAllStrategies();
        return strategies.filter(s => s.timeframe === timeframe);
    }

    async getActiveStrategies(): Promise<TradingStrategy[]> {
        const strategies = await this.getAllStrategies();
        return strategies.filter(s => s.isActive);
    }

    async getActiveStrategiesByTimeframe(timeframe: TradingStrategy['timeframe']): Promise<TradingStrategy[]> {
        const strategies = await this.getAllStrategies();
        return strategies.filter(s => s.isActive && s.timeframe === timeframe);
    }

    async createStrategy(strategy: Omit<TradingStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<TradingStrategy> {
        try {
            const strategies = await this.getAllStrategies();
            const newStrategy: TradingStrategy = {
                ...strategy,
                id: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            strategies.push(newStrategy);
            await this.storageService.saveData('trading-strategies', strategies);
            return newStrategy;
        } catch (error) {
            console.error('Erro ao criar estratégia:', error);
            throw error;
        }
    }

    async toggleStrategy(id: string): Promise<TradingStrategy | null> {
        try {
            const strategies = await this.getAllStrategies();
            const strategyIndex = strategies.findIndex(s => s.id === id);

            if (strategyIndex === -1) return null;

            strategies[strategyIndex].isActive = !strategies[strategyIndex].isActive;
            strategies[strategyIndex].updatedAt = new Date().toISOString();

            await this.storageService.saveData('trading-strategies', strategies);
            return strategies[strategyIndex];
        } catch (error) {
            console.error('Erro ao alternar estratégia:', error);
            throw error;
        }
    }

    async toggleFavorite(id: string): Promise<TradingStrategy | null> {
        try {
            const strategies = await this.getAllStrategies();
            const strategyIndex = strategies.findIndex(s => s.id === id);

            if (strategyIndex === -1) return null;

            strategies[strategyIndex].isFavorite = !strategies[strategyIndex].isFavorite;
            strategies[strategyIndex].updatedAt = new Date().toISOString();

            await this.storageService.saveData('trading-strategies', strategies);
            return strategies[strategyIndex];
        } catch (error) {
            console.error('Erro ao alternar favorito da estratégia:', error);
            throw error;
        }
    }

    async getFavoriteStrategies(): Promise<TradingStrategy[]> {
        const strategies = await this.getAllStrategies();
        return strategies.filter(s => s.isFavorite);
    }

    async deleteStrategy(id: string): Promise<boolean> {
        try {
            const strategies = await this.getAllStrategies();
            const filteredStrategies = strategies.filter(s => s.id !== id);

            if (filteredStrategies.length === strategies.length) return false;

            await this.storageService.saveData('trading-strategies', filteredStrategies);
            return true;
        } catch (error) {
            console.error('Erro ao deletar estratégia:', error);
            throw error;
        }
    }

    async updateStrategy(id: string, updates: Partial<TradingStrategy>): Promise<TradingStrategy | null> {
        try {
            const strategies = await this.getAllStrategies();
            const strategyIndex = strategies.findIndex(s => s.id === id);

            if (strategyIndex === -1) return null;

            strategies[strategyIndex] = {
                ...strategies[strategyIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.storageService.saveData('trading-strategies', strategies);
            return strategies[strategyIndex];
        } catch (error) {
            console.error('Erro ao atualizar estratégia:', error);
            throw error;
        }
    }

    async getStrategyById(id: string): Promise<TradingStrategy | null> {
        try {
            const strategies = await this.getAllStrategies();
            return strategies.find(s => s.id === id) || null;
        } catch (error) {
            console.error('Erro ao buscar estratégia por ID:', error);
            return null;
        }
    }

    // Método para obter timeframes únicos das estratégias ativas
    async getActiveTimeframes(): Promise<TradingStrategy['timeframe'][]> {
        const activeStrategies = await this.getActiveStrategies();
        const timeframes = [...new Set(activeStrategies.map(s => s.timeframe))];
        return timeframes.sort((a, b) => {
            const timeframeOrder = { '10s': 1, '1m': 2, '5m': 3, '15m': 4, '1h': 5, '4h': 6, '1d': 7 };
            return (timeframeOrder[a] || 999) - (timeframeOrder[b] || 999);
        });
    }
}

export default TradingStrategyService;
