/**
 * TransferLearner - Transferência de Conhecimento entre Ativos
 * 
 * Aprende em BTC, aplica em ETH:
 * - Knowledge graph de estratégias
 * - Pattern matcher entre ativos
 * - Strategy transferrer
 */

export interface KnowledgeGraph {
    [symbol: string]: {
        strategies: string[];
        winRates: { [strategy: string]: number };
        patterns: MarketPattern[];
        lastUpdate: number;
    };
}

export interface MarketPattern {
    id: string;
    description: string;
    conditions: { [key: string]: number };
    outcome: 'WIN' | 'LOSS';
    confidence: number;
    occurrences: number;
}

export interface TransferRecommendation {
    sourceSymbol: string;
    targetSymbol: string;
    strategies: string[];
    confidence: number;
    similarity: number;
    expectedPerformance: number;
}

export class TransferLearner {
    // Knowledge graph
    private knowledgeGraph: KnowledgeGraph = {};
    
    // Similaridade entre ativos
    private assetSimilarity: Map<string, Map<string, number>> = new Map([
        ['BTCUSDT', new Map([['ETHUSDT', 0.85], ['BNBUSDT', 0.75], ['SOLUSDT', 0.70]])],
        ['ETHUSDT', new Map([['BTCUSDT', 0.85], ['BNBUSDT', 0.80], ['SOLUSDT', 0.75]])],
        ['BNBUSDT', new Map([['BTCUSDT', 0.75], ['ETHUSDT', 0.80], ['SOLUSDT', 0.65]])],
        ['SOLUSDT', new Map([['BTCUSDT', 0.70], ['ETHUSDT', 0.75], ['BNBUSDT', 0.65]])]
    ]);
    
    /**
     * Registra conhecimento de um ativo
     */
    registerKnowledge(
        symbol: string,
        strategy: string,
        outcome: 'WIN' | 'LOSS',
        pattern?: MarketPattern
    ): void {
        // Inicializa se não existe
        if (!this.knowledgeGraph[symbol]) {
            this.knowledgeGraph[symbol] = {
                strategies: [],
                winRates: {},
                patterns: [],
                lastUpdate: Date.now()
            };
        }
        
        const knowledge = this.knowledgeGraph[symbol];
        
        // Adiciona estratégia
        if (!knowledge.strategies.includes(strategy)) {
            knowledge.strategies.push(strategy);
            knowledge.winRates[strategy] = 0.5;
        }
        
        // Atualiza win rate
        const wins = knowledge.winRates[strategy];
        knowledge.winRates[strategy] = (wins * knowledge.patterns.length + (outcome === 'WIN' ? 1 : 0)) / (knowledge.patterns.length + 1);
        
        // Adiciona pattern
        if (pattern) {
            knowledge.patterns.push(pattern);
        }
        
        knowledge.lastUpdate = Date.now();
        
        console.log(`📚 Transfer Learning: Conhecimento registrado para ${symbol} - ${strategy}: ${outcome}`);
    }
    
    /**
     * Encontra padrões similares entre ativos
     */
    findSimilarPatterns(sourceSymbol: string, targetSymbol: string): MarketPattern[] {
        const source = this.knowledgeGraph[sourceSymbol];
        const target = this.knowledgeGraph[targetSymbol];
        
        if (!source || !target) return [];
        
        // Encontra patterns comuns
        const similarPatterns: MarketPattern[] = [];
        
        for (const sourcePattern of source.patterns) {
            for (const targetPattern of target.patterns) {
                const similarity = this.calculatePatternSimilarity(sourcePattern, targetPattern);
                
                if (similarity > 0.7) {
                    similarPatterns.push(sourcePattern);
                }
            }
        }
        
        return similarPatterns;
    }
    
    /**
     * Calcula similaridade entre patterns
     */
    private calculatePatternSimilarity(p1: MarketPattern, p2: MarketPattern): number {
        // Compara condições
        const conditions1 = Object.entries(p1.conditions);
        const conditions2 = Object.entries(p2.conditions);
        
        let matchingConditions = 0;
        
        for (const [key, value] of conditions1) {
            const targetValue = conditions2.find(([k]) => k === key)?.[1] || 0;
            const diff = Math.abs(value - targetValue);
            
            if (diff < 0.2) {
                matchingConditions++;
            }
        }
        
        return matchingConditions / Math.max(conditions1.length, conditions2.length);
    }
    
    /**
     * Recomenda estratégias para transferir
     */
    recommendTransfer(sourceSymbol: string, targetSymbol: string): TransferRecommendation[] {
        const source = this.knowledgeGraph[sourceSymbol];
        if (!source) return [];
        
        const similarity = this.assetSimilarity.get(sourceSymbol)?.get(targetSymbol) || 0.5;
        
        // Encontra estratégias com bom desempenho no source
        const goodStrategies = source.strategies.filter(s => source.winRates[s] > 0.6);
        
        const recommendations: TransferRecommendation[] = [];
        
        for (const strategy of goodStrategies) {
            const expectedPerformance = source.winRates[strategy] * similarity;
            
            recommendations.push({
                sourceSymbol,
                targetSymbol,
                strategies: [strategy],
                confidence: similarity,
                similarity,
                expectedPerformance
            });
        }
        
        return recommendations.sort((a, b) => b.expectedPerformance - a.expectedPerformance);
    }
    
    /**
     * Transfere estratégias vencedoras
     */
    transferWinningStrategies(sourceSymbol: string, targetSymbol: string): string[] {
        const recommendations = this.recommendTransfer(sourceSymbol, targetSymbol);
        const transferred: string[] = [];
        
        for (const rec of recommendations.filter(r => r.expectedPerformance > 0.5)) {
            for (const strategy of rec.strategies) {
                // Aplica estratégia no target com ajuste baseado na similaridade
                const adjustedConfidence = rec.confidence * 0.8; // 20% discount por transferência
                
                console.log(`🔄 Transfer Learning: ${strategy} transferida de ${sourceSymbol} para ${targetSymbol} (confiança: ${(adjustedConfidence * 100).toFixed(0)}%)`);
                
                transferred.push(strategy);
            }
        }
        
        return transferred;
    }
    
    /**
     * Obtém conhecimento de um ativo
     */
    getKnowledge(symbol: string): any {
        return this.knowledgeGraph[symbol] || null;
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        const symbols = Object.keys(this.knowledgeGraph);
        const totalPatterns = symbols.reduce((sum, s) => sum + this.knowledgeGraph[s].patterns.length, 0);
        const avgWinRate = symbols.reduce((sum, s) => {
            const rates = Object.values(this.knowledgeGraph[s].winRates);
            return sum + (rates.reduce((a, b) => a + b, 0) / Math.max(1, rates.length));
        }, 0) / Math.max(1, symbols.length);
        
        return {
            totalSymbols: symbols.length,
            totalPatterns,
            avgWinRate: Math.round(avgWinRate * 100) / 100,
            topStrategies: this.getTopStrategies()
        };
    }
    
    /**
     * Obtém top estratégias globais
     */
    private getTopStrategies(): { strategy: string; avgWinRate: number }[] {
        const strategyRates: { [strategy: string]: number[] } = {};
        
        for (const symbol of Object.keys(this.knowledgeGraph)) {
            const knowledge = this.knowledgeGraph[symbol];
            
            for (const strategy of knowledge.strategies) {
                if (!strategyRates[strategy]) {
                    strategyRates[strategy] = [];
                }
                
                strategyRates[strategy].push(knowledge.winRates[strategy]);
            }
        }
        
        return Object.entries(strategyRates)
            .map(([strategy, rates]) => ({
                strategy,
                avgWinRate: rates.reduce((a, b) => a + b, 0) / rates.length
            }))
            .sort((a, b) => b.avgWinRate - a.avgWinRate)
            .slice(0, 10);
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.knowledgeGraph = {};
        console.log('📚 Transfer Learner resetado');
    }
}

// Singleton instance
export const transferLearner = new TransferLearner();
