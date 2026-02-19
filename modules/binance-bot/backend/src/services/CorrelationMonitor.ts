/**
 * CorrelationMonitor - Monitor de correlação entre bots/posições
 * 
 * Detecta:
 * - Correlação entre posições abertas
 * - Risco de exposição concentrada
 * - Oportunidades de hedge natural
 */

export interface BotPosition {
    botId: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    betAmount: number;
    leverage: number;
    entryTime: number;
}

export interface CorrelationMatrix {
    [key: string]: { [symbol: string]: number };
}

export interface CorrelationAlert {
    type: 'HIGH_CORRELATION' | 'CONCENTRATION_RISK' | 'HEDGE_OPPORTUNITY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    affectedPositions: string[];
    correlationScore: number;
    recommendation: string;
}

export class CorrelationMonitor {
    // Matriz de correlação histórica (simplificada)
    private readonly HISTORICAL_CORRELATION: CorrelationMatrix = {
        'BTCUSDT': { 'ETHUSDT': 0.85, 'BNBUSDT': 0.75, 'SOLUSDT': 0.70, 'XRPUSDT': 0.60 },
        'ETHUSDT': { 'BTCUSDT': 0.85, 'BNBUSDT': 0.80, 'SOLUSDT': 0.75, 'XRPUSDT': 0.55 },
        'BNBUSDT': { 'BTCUSDT': 0.75, 'ETHUSDT': 0.80, 'SOLUSDT': 0.65, 'XRPUSDT': 0.50 },
        'SOLUSDT': { 'BTCUSDT': 0.70, 'ETHUSDT': 0.75, 'BNBUSDT': 0.65, 'XRPUSDT': 0.55 },
        'XRPUSDT': { 'BTCUSDT': 0.60, 'ETHUSDT': 0.55, 'BNBUSDT': 0.50, 'SOLUSDT': 0.55 },
        'ADAUSDT': { 'XRPUSDT': 0.70, 'DOTUSDT': 0.75, 'SOLUSDT': 0.60 },
        'DOTUSDT': { 'ADAUSDT': 0.75, 'XRPUSDT': 0.65, 'SOLUSDT': 0.55 }
    };
    
    private activePositions: BotPosition[] = [];
    private alerts: CorrelationAlert[] = [];
    
    // Thresholds
    private readonly HIGH_CORRELATION_THRESHOLD = 0.7;
    private readonly CONCENTRATION_THRESHOLD = 0.4; // 40% em um símbolo
       
    /**
     * Adiciona nova posição
     */
    addPosition(position: BotPosition): void {
        this.activePositions.push(position);
        this.checkCorrelation();
    }
    
    /**
     * Remove posição
     */
    removePosition(botId: string): void {
        this.activePositions = this.activePositions.filter(p => p.botId !== botId);
        this.checkCorrelation();
    }
    
    /**
     * Verifica correlações e gera alerts
     */
    private checkCorrelation(): void {
        this.alerts = [];
        
        if (this.activePositions.length < 2) return;
        
        // 1. Verifica correlação entre pares
        this.checkPairwiseCorrelation();
        
        // 2. Verifica concentração por símbolo
        this.checkSymbolConcentration();
        
        // 3. Verifica oportunidades de hedge
        this.checkHedgeOpportunities();
    }
    
    /**
     * Verifica correlação entre pares de posições
     */
    private checkPairwiseCorrelation(): void {
        for (let i = 0; i < this.activePositions.length; i++) {
            for (let j = i + 1; j < this.activePositions.length; j++) {
                const p1 = this.activePositions[i];
                const p2 = this.activePositions[j];
                
                // Mesma direção = potencial correlação
                if (p1.side !== p2.side) continue;
                
                const correlation = this.getCorrelation(p1.symbol, p2.symbol);
                
                if (correlation >= this.HIGH_CORRELATION_THRESHOLD) {
                    this.alerts.push({
                        type: 'HIGH_CORRELATION',
                        severity: correlation > 0.8 ? 'HIGH' : 'MEDIUM',
                        description: `Alta correlação entre ${p1.symbol} e ${p2.symbol}`,
                        affectedPositions: [p1.botId, p2.botId],
                        correlationScore: correlation,
                        recommendation: 'Considere reduzir exposição ou fechar uma posição'
                    });
                }
            }
        }
    }
    
    /**
     * Verifica concentração por símbolo
     */
    private checkSymbolConcentration(): void {
        const exposureBySymbol = new Map<string, number>();
        let totalExposure = 0;
        
        for (const position of this.activePositions) {
            const exposure = position.betAmount * position.leverage;
            totalExposure += exposure;
            
            const current = exposureBySymbol.get(position.symbol) || 0;
            exposureBySymbol.set(position.symbol, current + exposure);
        }
        
        for (const [symbol, exposure] of exposureBySymbol) {
            const concentration = exposure / totalExposure;
            
            if (concentration > this.CONCENTRATION_THRESHOLD) {
                this.alerts.push({
                    type: 'CONCENTRATION_RISK',
                    severity: concentration > 0.6 ? 'CRITICAL' : 'HIGH',
                    description: `Concentração excessiva em ${symbol}`,
                    affectedPositions: this.activePositions.filter(p => p.symbol === symbol).map(p => p.botId),
                    correlationScore: concentration,
                    recommendation: `Reduzir exposição em ${symbol} para <${this.CONCENTRATION_THRESHOLD * 100}%`
                });
            }
        }
    }
    
    /**
     * Verifica oportunidades de hedge natural
     */
    private checkHedgeOpportunities(): void {
        const longPositions = this.activePositions.filter(p => p.side === 'LONG');
        const shortPositions = this.activePositions.filter(p => p.side === 'SHORT');
        
        for (const long of longPositions) {
            for (const short of shortPositions) {
                const correlation = this.getCorrelation(long.symbol, short.symbol);
                
                // Alta correlação + direções opostas = hedge natural
                if (correlation >= 0.7) {
                    this.alerts.push({
                        type: 'HEDGE_OPPORTUNITY',
                        severity: 'LOW',
                        description: `Hedge natural entre ${long.symbol} (LONG) e ${short.symbol} (SHORT)`,
                        affectedPositions: [long.botId, short.botId],
                        correlationScore: correlation,
                        recommendation: 'Manter posições para reduzir risco de mercado'
                    });
                }
            }
        }
    }
    
    /**
     * Obtém correlação entre dois símbolos
     */
    private getCorrelation(symbol1: string, symbol2: string): number {
        if (symbol1 === symbol2) return 1.0;
        
        const corr1 = this.HISTORICAL_CORRELATION[symbol1]?.[symbol2];
        const corr2 = this.HISTORICAL_CORRELATION[symbol2]?.[symbol1];
        
        return corr1 || corr2 || 0.5; // Default 0.5 se não houver dados
    }
    
    /**
     * Obtém correlação média do portfolio
     */
    getAverageCorrelation(): number {
        if (this.activePositions.length < 2) return 0;
        
        let totalCorrelation = 0;
        let pairCount = 0;
        
        for (let i = 0; i < this.activePositions.length; i++) {
            for (let j = i + 1; j < this.activePositions.length; j++) {
                const p1 = this.activePositions[i];
                const p2 = this.activePositions[j];
                
                // Mesma direção conta positiva, oposta conta negativa
                const correlation = this.getCorrelation(p1.symbol, p2.symbol);
                totalCorrelation += p1.side === p2.side ? correlation : -correlation;
                pairCount++;
            }
        }
        
        return totalCorrelation / pairCount;
    }
    
    /**
     * Obtém alerts atuais
     */
    getAlerts(): CorrelationAlert[] {
        return this.alerts;
    }
    
    /**
     * Obtém status do monitor
     */
    getStatus(): any {
        return {
            activePositions: this.activePositions.length,
            averageCorrelation: Math.round(this.getAverageCorrelation() * 100) / 100,
            alertCount: this.alerts.length,
            criticalAlerts: this.alerts.filter(a => a.severity === 'CRITICAL').length,
            highAlerts: this.alerts.filter(a => a.severity === 'HIGH').length,
            hedgeOpportunities: this.alerts.filter(a => a.type === 'HEDGE_OPPORTUNITY').length
        };
    }
    
    /**
     * Limpa todas as posições
     */
    clear(): void {
        this.activePositions = [];
        this.alerts = [];
    }
}

// Singleton instance
export const correlationMonitor = new CorrelationMonitor();
