/**
 * ExplainableAI - Sistema de Explicação de Decisões
 * 
 * Explica decisões do bot em linguagem natural:
 * - Explicação por trade
 * - Feature importance (SHAP-like)
 * - Counterfactual analysis
 * - Confiança da explicação
 */

export interface TradeExplanation {
    tradeId: string;
    symbol: string;
    direction: 'LONG' | 'SHORT';
    decision: 'ENTER' | 'EXIT';
    explanation: string;
    confidence: number;
    topFactors: FactorImportance[];
    counterfactuals: Counterfactual[];
}

export interface FactorImportance {
    factor: string;
    importance: number;    // 0-1 (quanto maior, mais importante)
    contribution: number;  // Positivo ou negativo
    description: string;
}

export interface Counterfactual {
    whatIf: string;
    outcome: string;
    confidence: number;
}

export class ExplainableAI {
    // Histórico de explicações
    private explanations: Map<string, TradeExplanation> = new Map();
    
    // Feature weights (aprendido com histórico)
    private featureWeights: Map<string, number> = new Map([
        ['RSI', 0.15],
        ['MACD', 0.12],
        ['Bollinger Bands', 0.10],
        ['Volume', 0.13],
        ['Price Action', 0.18],
        ['Market Regime', 0.14],
        ['Sentiment', 0.10],
        ['Correlation', 0.08]
    ]);
    
    /**
     * Gera explicação para decisão de trade
     */
    explainDecision(params: {
        symbol: string;
        direction: 'LONG' | 'SHORT';
        decision: 'ENTER' | 'EXIT';
        indicators: { [key: string]: number };
        strategies: string[];
        confidence: number;
        botId: string;
    }): TradeExplanation {
        const tradeId = `${params.botId}-${params.symbol}-${Date.now()}`;
        
        // 1. Calcula importância das features
        const topFactors = this.calculateFeatureImportance(params.indicators, params.strategies);
        
        // 2. Gera explicação em linguagem natural
        const explanation = this.generateNaturalLanguageExplanation(
            params.symbol,
            params.direction,
            params.decision,
            topFactors,
            params.confidence
        );
        
        // 3. Gera counterfactuals
        const counterfactuals = this.generateCounterfactuals(params, topFactors);
        
        const tradeExplanation: TradeExplanation = {
            tradeId,
            symbol: params.symbol,
            direction: params.direction,
            decision: params.decision,
            explanation,
            confidence: params.confidence,
            topFactors,
            counterfactuals
        };
        
        // Salva histórico
        this.explanations.set(tradeId, tradeExplanation);
        
        console.log(`🔍 XAI: ${explanation}`);
        
        return tradeExplanation;
    }
    
    /**
     * Calcula importância das features
     */
    private calculateFeatureImportance(
        indicators: { [key: string]: number },
        strategies: string[]
    ): FactorImportance[] {
        const factors: FactorImportance[] = [];
        
        for (const [indicator, value] of Object.entries(indicators)) {
            const weight = this.featureWeights.get(indicator) || 0.1;
            const contribution = value > 0.5 ? 1 : -1;
            const importance = weight * Math.abs(value - 0.5) * 2;
            
            factors.push({
                factor: indicator,
                importance: Math.round(importance * 100) / 100,
                contribution: contribution * importance,
                description: this.getFactorDescription(indicator, value)
            });
        }
        
        // Ordena por importância
        return factors.sort((a, b) => b.importance - a.importance).slice(0, 5);
    }
    
    /**
     * Gera descrição para fator
     */
    private getFactorDescription(factor: string, value: number): string {
        const descriptions: { [key: string]: string } = {
            'RSI': value > 0.7 ? 'Sobrecompra detectada' : value < 0.3 ? 'Sobrevenda detectada' : 'Neutro',
            'MACD': value > 0.5 ? 'Crossover bullish' : value < 0.3 ? 'Crossover bearish' : 'Sem sinal claro',
            'Volume': value > 0.7 ? 'Volume acima da média' : 'Volume normal',
            'Market Regime': value > 0.7 ? 'Trending forte' : value < 0.3 ? 'Ranging' : 'Transição'
        };
        
        return descriptions[factor] || `Valor: ${value.toFixed(2)}`;
    }
    
    /**
     * Gera explicação em linguagem natural
     */
    private generateNaturalLanguageExplanation(
        symbol: string,
        direction: string,
        decision: string,
        factors: FactorImportance[],
        confidence: number
    ): string {
        const action = decision === 'ENTER' ? 'Entrar' : 'Sair';
        const dirText = direction === 'LONG' ? 'comprado' : 'vendido';
        
        let explanation = `${action} em ${symbol} (${dirText}). `;
        
        // Adiciona top 3 fatores
        const top3 = factors.slice(0, 3);
        const reasons = top3.map(f => f.description).join(', ');
        
        explanation += `Principais razões: ${reasons}. `;
        
        // Confiança
        const confidenceText = confidence > 0.8 ? 'Alta confiança' : 
                               confidence > 0.6 ? 'Confiança média' : 'Baixa confiança';
        explanation += `${confidenceText} (${(confidence * 100).toFixed(0)}%).`;
        
        return explanation;
    }
    
    /**
     * Gera counterfactuals (what-if analysis)
     */
    private generateCounterfactuals(
        params: any,
        factors: FactorImportance[]
    ): Counterfactual[] {
        const counterfactuals: Counterfactual[] = [];
        
        // What-if para os top 2 fatores
        for (let i = 0; i < Math.min(2, factors.length); i++) {
            const factor = factors[i];
            
            counterfactuals.push({
                whatIf: `Se ${factor.factor} fosse 30% menor`,
                outcome: `Confiança cairia ${(factor.importance * 30).toFixed(0)}%, decisão seria ${factor.contribution > 0 ? 'reconsiderada' : 'mantida'}`,
                confidence: 0.7
            });
        }
        
        // What-if geral
        counterfactuals.push({
            whatIf: 'Se volatilidade dobrasse',
            outcome: 'Risco aumentaria, tamanho da posição seria reduzido em 40%',
            confidence: 0.8
        });
        
        return counterfactuals;
    }
    
    /**
     * Obtém explicação por trade ID
     */
    getExplanation(tradeId: string): TradeExplanation | undefined {
        return this.explanations.get(tradeId);
    }
    
    /**
     * Obtém todas as explicações recentes
     */
    getRecentExplanations(limit: number = 10): TradeExplanation[] {
        return Array.from(this.explanations.values()).slice(-limit);
    }
    
    /**
     * Obtém status do XAI
     */
    getStatus(): any {
        return {
            totalExplanations: this.explanations.size,
            avgConfidence: Array.from(this.explanations.values())
                .reduce((sum, e) => sum + e.confidence, 0) / Math.max(1, this.explanations.size),
            topFactors: Array.from(this.featureWeights.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([factor, weight]) => ({ factor, weight }))
        };
    }
    
    /**
     * Atualiza weights baseado em feedback
     */
    updateWeights(feedback: { factor: string; actualImportance: number }): void {
        const current = this.featureWeights.get(feedback.factor) || 0.1;
        const updated = (current * 0.9) + (feedback.actualImportance * 0.1);
        this.featureWeights.set(feedback.factor, updated);
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.explanations.clear();
        console.log('🔍 XAI resetado');
    }
}

// Singleton instance
export const explainableAI = new ExplainableAI();
