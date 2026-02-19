/**
 * EnsemblePredictor - Combinação de previsões múltiplas
 * 
 * Combina previsões de múltiplos bots/estratégias:
 * - Weighted ensemble (pesos por fitness)
 * - Meta-modelo que aprende confiabilidade por regime
 * - Stacking de modelos
 * - Detecção de outliers
 */

export interface BotPrediction {
    botId: string;
    symbol: string;
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    confidence: number;        // 0-100
    strength: number;          // Força do sinal (0-100)
    fitness: number;           // Fitness histórico do bot
    winRate: number;           // Win rate do bot
    expectedValue: number;     // EV do bot
    timeframes: number[];      // Timeframes analisados
    strategies: string[];      // Estratégias ativas
}

export interface EnsembleResult {
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    confidence: number;
    consensusLevel: number;    // 0-1 (quanto os bots concordam)
    weightedConfidence: number;
    botCount: number;
    longBots: number;
    shortBots: number;
    neutralBots: number;
    outlierBots: string[];
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface BotReliability {
    botId: string;
    overallReliability: number;
    reliabilityByRegime: {
        TRENDING_BULL: number;
        TRENDING_BEAR: number;
        RANGING: number;
        VOLATILE: number;
        CALM: number;
    };
    recentPerformance: number;
    consistency: number;
}

export class EnsemblePredictor {
    // Histórico de confiabilidade por bot
    private botReliability: Map<string, BotReliability> = new Map();
    
    // Histórico de previsões
    private predictionHistory: Array<{
        predictions: BotPrediction[];
        result: 'WIN' | 'LOSS';
        timestamp: number;
    }> = [];
    
    private readonly MAX_HISTORY = 500;
    
    // Thresholds
    private readonly STRONG_SIGNAL_THRESHOLD = 0.75;
    private readonly WEAK_SIGNAL_THRESHOLD = 0.4;
    private readonly OUTLIER_THRESHOLD = 2.0; // 2 std deviations
    
    /**
     * Combina previsões de múltiplos bots
     */
    combinePredictions(
        predictions: BotPrediction[],
        currentRegime?: string
    ): EnsembleResult {
        if (predictions.length === 0) {
            return this.createNeutralResult();
        }
        
        // 1. Detecta e remove outliers
        const cleanPredictions = this.removeOutliers(predictions);
        const outliers = predictions.filter(p => !cleanPredictions.includes(p));
        
        // 2. Calcula pesos por bot
        const weights = this.calculateWeights(cleanPredictions, currentRegime);
        
        // 3. Combina previsões
        const combined = this.weightedEnsemble(cleanPredictions, weights);
        
        // 4. Calcula consenso
        const consensusLevel = this.calculateConsensus(cleanPredictions);
        
        // 5. Determina recomendação
        const recommendation = this.determineRecommendation(combined, consensusLevel);
        
        return {
            direction: combined.direction,
            confidence: Math.round(combined.confidence * 100) / 100,
            consensusLevel: Math.round(consensusLevel * 100) / 100,
            weightedConfidence: Math.round(combined.weightedConfidence * 100) / 100,
            botCount: cleanPredictions.length,
            longBots: cleanPredictions.filter(p => p.direction === 'LONG').length,
            shortBots: cleanPredictions.filter(p => p.direction === 'SHORT').length,
            neutralBots: cleanPredictions.filter(p => p.direction === 'NEUTRAL').length,
            outlierBots: outliers.map(o => o.botId),
            recommendation
        };
    }
    
    /**
     * Cria resultado neutro
     */
    private createNeutralResult(): EnsembleResult {
        return {
            direction: 'NEUTRAL',
            confidence: 0.5,
            consensusLevel: 0,
            weightedConfidence: 0.5,
            botCount: 0,
            longBots: 0,
            shortBots: 0,
            neutralBots: 0,
            outlierBots: [],
            recommendation: 'HOLD'
        };
    }
    
    /**
     * Remove outliers das previsões
     */
    private removeOutliers(predictions: BotPrediction[]): BotPrediction[] {
        if (predictions.length < 3) return predictions;
        
        // Calcula média e std dev da confiança
        const avgConfidence = predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length;
        const variance = predictions.reduce((s, p) => s + Math.pow(p.confidence - avgConfidence, 2), 0) / predictions.length;
        const stdDev = Math.sqrt(variance);
        
        // Remove outliers (> 2 std deviations)
        return predictions.filter(p => {
            const zScore = Math.abs(p.confidence - avgConfidence) / stdDev;
            return zScore < this.OUTLIER_THRESHOLD;
        });
    }
    
    /**
     * Calcula pesos para cada bot
     */
    private calculateWeights(
        predictions: BotPrediction[],
        currentRegime?: string
    ): Map<string, number> {
        const weights = new Map<string, number>();
        
        for (const prediction of predictions) {
            let weight = 1.0;
            
            // 1. Peso por fitness
            weight *= (0.5 + (prediction.fitness / 100));
            
            // 2. Peso por win rate
            weight *= (0.5 + prediction.winRate);
            
            // 3. Peso por expected value
            if (prediction.expectedValue > 0) {
                weight *= (1 + prediction.expectedValue);
            }
            
            // 4. Peso por confiabilidade histórica
            const reliability = this.botReliability.get(prediction.botId);
            if (reliability) {
                const regimeReliability = currentRegime 
                    ? reliability.reliabilityByRegime[currentRegime as keyof typeof reliability.reliabilityByRegime]
                    : reliability.overallReliability;
                weight *= regimeReliability;
            }
            
            // 5. Peso por consistência
            if (reliability && reliability.consistency > 0.7) {
                weight *= 1.2;
            }
            
            weights.set(prediction.botId, weight);
        }
        
        // Normaliza pesos
        const totalWeight = Array.from(weights.values()).reduce((s, w) => s + w, 0);
        for (const [botId, weight] of weights) {
            weights.set(botId, weight / totalWeight);
        }
        
        return weights;
    }
    
    /**
     * Combina previsões com pesos
     */
    private weightedEnsemble(
        predictions: BotPrediction[],
        weights: Map<string, number>
    ): { direction: 'LONG' | 'SHORT' | 'NEUTRAL'; confidence: number; weightedConfidence: number } {
        let longScore = 0;
        let shortScore = 0;
        let neutralScore = 0;
        let totalWeight = 0;
        
        for (const prediction of predictions) {
            const weight = weights.get(prediction.botId) || 1.0;
            totalWeight += weight;
            
            const weightedConfidence = prediction.confidence * weight;
            
            if (prediction.direction === 'LONG') {
                longScore += weightedConfidence;
            } else if (prediction.direction === 'SHORT') {
                shortScore += weightedConfidence;
            } else {
                neutralScore += weightedConfidence;
            }
        }
        
        // Determina direção dominante
        const maxScore = Math.max(longScore, shortScore, neutralScore);
        let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        
        if (maxScore === longScore) direction = 'LONG';
        else if (maxScore === shortScore) direction = 'SHORT';
        
        // Calcula confiança
        const confidence = maxScore / totalWeight;
        const weightedConfidence = confidence;
        
        return { direction, confidence, weightedConfidence };
    }
    
    /**
     * Calcula nível de consenso
     */
    private calculateConsensus(predictions: BotPrediction[]): number {
        if (predictions.length === 0) return 0;
        
        const longCount = predictions.filter(p => p.direction === 'LONG').length;
        const shortCount = predictions.filter(p => p.direction === 'SHORT').length;
        const neutralCount = predictions.filter(p => p.direction === 'NEUTRAL').length;
        
        // Consenso = maior grupo / total
        const maxCount = Math.max(longCount, shortCount, neutralCount);
        return maxCount / predictions.length;
    }
    
    /**
     * Determina recomendação baseada em confiança e consenso
     */
    private determineRecommendation(
        combined: { direction: string; confidence: number },
        consensusLevel: number
    ): 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' {
        const { direction, confidence } = combined;
        
        // Score combinado
        const score = confidence * consensusLevel;
        
        if (direction === 'LONG') {
            if (score >= this.STRONG_SIGNAL_THRESHOLD) return 'STRONG_BUY';
            if (score >= this.WEAK_SIGNAL_THRESHOLD) return 'BUY';
            return 'HOLD';
        } else if (direction === 'SHORT') {
            if (score >= this.STRONG_SIGNAL_THRESHOLD) return 'STRONG_SELL';
            if (score >= this.WEAK_SIGNAL_THRESHOLD) return 'SELL';
            return 'HOLD';
        }
        
        return 'HOLD';
    }
    
    /**
     * Atualiza confiabilidade de bot após resultado
     */
    updateReliability(
        botId: string,
        prediction: BotPrediction,
        result: 'WIN' | 'LOSS',
        regime?: string
    ): void {
        // Inicializa se não existe
        if (!this.botReliability.has(botId)) {
            this.botReliability.set(botId, {
                botId,
                overallReliability: 0.5,
                reliabilityByRegime: {
                    TRENDING_BULL: 0.5,
                    TRENDING_BEAR: 0.5,
                    RANGING: 0.5,
                    VOLATILE: 0.5,
                    CALM: 0.5
                },
                recentPerformance: 0.5,
                consistency: 0.5
            });
        }
        
        const reliability = this.botReliability.get(botId)!;
        
        // Atualiza overall
        const adjustment = result === 'WIN' ? 0.05 : -0.05;
        reliability.overallReliability = Math.max(0.1, Math.min(0.9, 
            reliability.overallReliability + adjustment));
        
        // Atualiza por regime
        if (regime && regime in reliability.reliabilityByRegime) {
            const key = regime as keyof typeof reliability.reliabilityByRegime;
            reliability.reliabilityByRegime[key] = Math.max(0.1, Math.min(0.9,
                reliability.reliabilityByRegime[key] + adjustment));
        }
        
        // Salva histórico
        this.predictionHistory.push({
            predictions: [prediction],
            result,
            timestamp: Date.now()
        });
        
        // Mantém histórico limitado
        if (this.predictionHistory.length > this.MAX_HISTORY) {
            this.predictionHistory.shift();
        }
        
        // Recalcula consistência
        this.calculateConsistency(botId);
    }
    
    /**
     * Calcula consistência de bot
     */
    private calculateConsistency(botId: string): void {
        const reliability = this.botReliability.get(botId);
        if (!reliability) return;
        
        // Pega últimas 20 previsões
        const recent = this.predictionHistory.slice(-20);
        if (recent.length < 5) {
            reliability.consistency = 0.5;
            return;
        }
        
        // Calcula variância dos resultados
        const wins = recent.filter(p => p.result === 'WIN').length;
        const winRate = wins / recent.length;
        
        // Consistência = baixa variância
        reliability.consistency = 1.0 - Math.abs(winRate - 0.5) * 2;
    }
    
    /**
     * Obtém confiabilidade de bot
     */
    getBotReliability(botId: string): BotReliability | undefined {
        return this.botReliability.get(botId);
    }
    
    /**
     * Obtém ranking de bots por confiabilidade
     */
    getBotRanking(): BotReliability[] {
        return Array.from(this.botReliability.values())
            .sort((a, b) => b.overallReliability - a.overallReliability);
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const ranking = this.getBotRanking();
        
        return {
            totalBots: this.botReliability.size,
            totalPredictions: this.predictionHistory.length,
            avgReliability: ranking.length > 0
                ? ranking.reduce((s, r) => s + r.overallReliability, 0) / ranking.length
                : 0,
            topBots: ranking.slice(0, 5).map(r => ({
                botId: r.botId,
                reliability: Math.round(r.overallReliability * 100) / 100
            })),
            recentAccuracy: this.calculateRecentAccuracy()
        };
    }
    
    /**
     * Calcula acurácia recente
     */
    private calculateRecentAccuracy(): number {
        const recent = this.predictionHistory.slice(-50);
        if (recent.length === 0) return 0;
        
        const wins = recent.filter(p => p.result === 'WIN').length;
        return Math.round((wins / recent.length) * 100) / 100;
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.botReliability.clear();
        this.predictionHistory = [];
        console.log('🔄 Ensemble Predictor resetado');
    }
}

// Singleton instance
export const ensemblePredictor = new EnsemblePredictor();
