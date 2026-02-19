/**
 * MetaLearner - Sistema de Meta-Aprendizado Adaptativo
 * 
 * Aprende a aprender mais rápido:
 * - Ajusta learning rate baseado em performance
 * - Detecta regime de mercado automaticamente
 * - Auto-ajusta hiperparâmetros
 * - Memory decay adaptativo
 */

export type MarketRegime = 'TRENDING_BULL' | 'TRENDING_BEAR' | 'RANGING' | 'VOLATILE' | 'CALM';

export interface LearningConfig {
    baseLearningRate: number;      // Learning rate base (0.01-0.3)
    currentLearningRate: number;   // Learning rate atual (ajustado dinamicamente)
    memoryDecayRate: number;       // Quanto do passado esquecer (0.01-0.2)
    explorationVsExploitation: number; // 0-1 (0=explorar, 1=explorar conhecido)
    adaptationSpeed: number;       // Velocidade de adaptação (1-10)
}

export interface RegimeDetection {
    currentRegime: MarketRegime;
    confidence: number;
    lastChange: number;
    consecutiveCycles: number;
}

export interface PerformanceMetrics {
    winRate: number;
    avgWin: number;
    avgLoss: number;
    sharpeRatio: number;
    maxDrawdown: number;
    recoveryFactor: number;
}

export class MetaLearner {
    // Configuração atual
    private config: LearningConfig = {
        baseLearningRate: 0.1,
        currentLearningRate: 0.1,
        memoryDecayRate: 0.05,
        explorationVsExploitation: 0.5,
        adaptationSpeed: 5
    };
    
    // Detecção de regime
    private regimeDetection: RegimeDetection = {
        currentRegime: 'CALM',
        confidence: 0.5,
        lastChange: 0,
        consecutiveCycles: 0
    };
    
    // Histórico de performance
    private performanceHistory: PerformanceMetrics[] = [];
    private readonly MAX_HISTORY = 100;
    
    // Thresholds de regime
    private readonly TREND_THRESHOLD = 0.6;      // ADX > 0.6 = trending
    private readonly VOLATILITY_HIGH = 0.03;     // 3% = alta volatilidade
    private readonly VOLATILITY_LOW = 0.01;      // 1% = baixa volatilidade
    private readonly RANGE_BOUND = 0.15;         // 15% do range = ranging
    
    // Ciclo atual
    private currentCycle = 0;
    
    /**
     * Executa ciclo de meta-aprendizado
     */
    executeCycle(metrics: {
        adx: number;           // ADX (trend strength)
        volatility: number;    // Volatilidade atual
        priceChange: number;   // Mudança de preço (%)
        volume: number;        // Volume relativo
        winRate: number;       // Win rate recente
        sharpe: number;        // Sharpe ratio recente
    }): void {
        this.currentCycle++;
        
        // 1. Detecta regime de mercado
        this.detectMarketRegime(metrics);
        
        // 2. Ajusta learning rate baseado em performance
        this.adaptLearningRate(metrics);
        
        // 3. Ajusta memory decay
        this.adaptMemoryDecay(metrics);
        
        // 4. Ajusta exploration vs exploitation
        this.adaptExploration(metrics);
        
        // 5. Salva métricas
        this.savePerformance(metrics);
    }
    
    /**
     * Detecta regime de mercado atual
     */
    private detectMarketRegime(metrics: any): void {
        const { adx, volatility, priceChange } = metrics;
        
        let newRegime: MarketRegime = 'CALM';
        let confidence = 0.5;
        
        // 1. Verifica trending (ADX alto)
        if (adx > this.TREND_THRESHOLD) {
            newRegime = priceChange > 0 ? 'TRENDING_BULL' : 'TRENDING_BEAR';
            confidence = Math.min(1.0, adx);
        }
        // 2. Verifica volatilidade alta
        else if (volatility > this.VOLATILITY_HIGH) {
            newRegime = 'VOLATILE';
            confidence = Math.min(1.0, volatility / this.VOLATILITY_HIGH);
        }
        // 3. Verifica ranging (ADX baixo + preço lateral)
        else if (adx < 0.3 && Math.abs(priceChange) < this.RANGE_BOUND) {
            newRegime = 'RANGING';
            confidence = 1.0 - adx;
        }
        // 4. Verifica calm (baixa volatilidade + ADX médio)
        else if (volatility < this.VOLATILITY_LOW && adx < 0.5) {
            newRegime = 'CALM';
            confidence = 1.0 - volatility / this.VOLATILITY_LOW;
        }
        // 5. Default
        else {
            newRegime = 'CALM';
            confidence = 0.5;
        }
        
        // Atualiza detecção
        if (newRegime !== this.regimeDetection.currentRegime) {
            console.log(`🔄 Meta-Learning: Regime mudou para ${newRegime} (confiança: ${(confidence * 100).toFixed(0)}%)`);
            this.regimeDetection = {
                currentRegime: newRegime,
                confidence,
                lastChange: this.currentCycle,
                consecutiveCycles: 1
            };
        } else {
            this.regimeDetection.consecutiveCycles++;
            this.regimeDetection.confidence = confidence;
        }
    }
    
    /**
     * Ajusta learning rate baseado em performance
     */
    private adaptLearningRate(metrics: any): void {
        const { winRate, sharpe } = metrics;
        
        let newLearningRate = this.config.baseLearningRate;
        
        // Win rate alto = reduz learning rate (já está funcionando)
        if (winRate > 0.6) {
            newLearningRate *= 0.7;
        }
        // Win rate baixo = aumenta learning rate (precisa aprender mais rápido)
        else if (winRate < 0.4) {
            newLearningRate *= 1.5;
        }
        
        // Sharpe negativo = aumenta muito learning rate (urgente)
        if (sharpe < 0) {
            newLearningRate *= 2.0;
        }
        // Sharpe alto = reduz learning rate
        else if (sharpe > 2.0) {
            newLearningRate *= 0.5;
        }
        
        // Aplica limites
        newLearningRate = Math.max(0.01, Math.min(0.3, newLearningRate));
        
        // Smooth transition
        this.config.currentLearningRate = 
            (this.config.currentLearningRate * 0.8) + (newLearningRate * 0.2);
        
        console.log(`📊 Meta-Learning: Learning Rate ajustado para ${(this.config.currentLearningRate * 100).toFixed(2)}%`);
    }
    
    /**
     * Ajusta memory decay (quanto do passado esquecer)
     */
    private adaptMemoryDecay(metrics: any): void {
        const { volatility, sharpe } = metrics;
        
        let newDecayRate = 0.05;
        
        // Alta volatilidade = esquece mais rápido (mercado mudou)
        if (volatility > this.VOLATILITY_HIGH) {
            newDecayRate = 0.15;
        }
        // Sharpe negativo = esquece mais rápido (estratégia antiga não funciona)
        else if (sharpe < 0) {
            newDecayRate = 0.12;
        }
        // Sharpe positivo = mantém memória
        else if (sharpe > 1.5) {
            newDecayRate = 0.03;
        }
        
        // Smooth transition
        this.config.memoryDecayRate = 
            (this.config.memoryDecayRate * 0.9) + (newDecayRate * 0.1);
    }
    
    /**
     * Ajusta exploration vs exploitation
     */
    private adaptExploration(metrics: any): void {
        const { winRate, sharpe } = metrics;
        
        // Performance boa = explota mais (usa o que funciona)
        if (winRate > 0.55 && sharpe > 1.0) {
            this.config.explorationVsExploitation = 0.8;
        }
        // Performance ruim = explora mais (tenta coisas novas)
        else if (winRate < 0.45 || sharpe < 0) {
            this.config.explorationVsExploitation = 0.3;
        }
        // Normal = balanceado
        else {
            this.config.explorationVsExploitation = 0.5;
        }
    }
    
    /**
     * Salva métricas de performance
     */
    private savePerformance(metrics: any): void {
        const performance: PerformanceMetrics = {
            winRate: metrics.winRate,
            avgWin: metrics.avgWin || 0,
            avgLoss: metrics.avgLoss || 0,
            sharpeRatio: metrics.sharpe,
            maxDrawdown: metrics.maxDrawdown || 0,
            recoveryFactor: metrics.recoveryFactor || 0
        };
        
        this.performanceHistory.push(performance);
        
        // Mantém apenas último N
        if (this.performanceHistory.length > this.MAX_HISTORY) {
            this.performanceHistory.shift();
        }
    }
    
    /**
     * Obtém configuração atual otimizada
     */
    getConfig(): LearningConfig {
        return { ...this.config };
    }
    
    /**
     * Obtém regime atual
     */
    getRegime(): RegimeDetection {
        return { ...this.regimeDetection };
    }
    
    /**
     * Obtém recomendação de estratégia baseada no regime
     */
    getStrategyRecommendation(): {
        recommendedStrategies: string[];
        avoidStrategies: string[];
        parameterAdjustments: { [key: string]: number }
    } {
        const regime = this.regimeDetection.currentRegime;
        
        switch (regime) {
            case 'TRENDING_BULL':
                return {
                    recommendedStrategies: ['momentum', 'breakout', 'trend_following'],
                    avoidStrategies: ['mean_reversion', 'counter_trend'],
                    parameterAdjustments: {
                        stopLossDistance: 1.2,
                        takeProfitDistance: 1.5,
                        positionSize: 1.1
                    }
                };
            
            case 'TRENDING_BEAR':
                return {
                    recommendedStrategies: ['momentum', 'breakout', 'short_selling'],
                    avoidStrategies: ['mean_reversion', 'counter_trend'],
                    parameterAdjustments: {
                        stopLossDistance: 1.2,
                        takeProfitDistance: 1.5,
                        positionSize: 0.9
                    }
                };
            
            case 'RANGING':
                return {
                    recommendedStrategies: ['mean_reversion', 'bollinger_bands', 'rsi_divergence'],
                    avoidStrategies: ['trend_following', 'breakout'],
                    parameterAdjustments: {
                        stopLossDistance: 0.8,
                        takeProfitDistance: 0.9,
                        positionSize: 1.0
                    }
                };
            
            case 'VOLATILE':
                return {
                    recommendedStrategies: ['volatility_breakout', 'straddle'],
                    avoidStrategies: ['mean_reversion', 'low_volatility'],
                    parameterAdjustments: {
                        stopLossDistance: 1.5,
                        takeProfitDistance: 2.0,
                        positionSize: 0.5
                    }
                };
            
            case 'CALM':
            default:
                return {
                    recommendedStrategies: ['mean_reversion', 'momentum', 'breakout'],
                    avoidStrategies: [],
                    parameterAdjustments: {
                        stopLossDistance: 1.0,
                        takeProfitDistance: 1.0,
                        positionSize: 1.0
                    }
                };
        }
    }
    
    /**
     * Obtém histórico de performance
     */
    getPerformanceHistory(): PerformanceMetrics[] {
        return [...this.performanceHistory];
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const avgMetrics = this.performanceHistory.length > 0
            ? {
                avgWinRate: this.performanceHistory.reduce((s, m) => s + m.winRate, 0) / this.performanceHistory.length,
                avgSharpe: this.performanceHistory.reduce((s, m) => s + m.sharpeRatio, 0) / this.performanceHistory.length
            }
            : { avgWinRate: 0, avgSharpe: 0 };
        
        return {
            currentCycle: this.currentCycle,
            regime: this.regimeDetection,
            config: this.config,
            avgPerformance: avgMetrics,
            totalDataPoints: this.performanceHistory.length,
            recommendation: this.getStrategyRecommendation()
        };
    }
    
    /**
     * Reset para configuração inicial
     */
    reset(): void {
        this.config = {
            baseLearningRate: 0.1,
            currentLearningRate: 0.1,
            memoryDecayRate: 0.05,
            explorationVsExploitation: 0.5,
            adaptationSpeed: 5
        };
        this.regimeDetection = {
            currentRegime: 'CALM',
            confidence: 0.5,
            lastChange: 0,
            consecutiveCycles: 0
        };
        this.performanceHistory = [];
        this.currentCycle = 0;
        console.log('🔄 Meta-Learner resetado');
    }
}

// Singleton instance
export const metaLearner = new MetaLearner();
