/**
 * PortfolioExposureManager - Gerenciamento de exposição do portfolio
 * 
 * Controla:
 * - Exposição total do portfolio
 * - Exposição por símbolo
 * - Exposição por direção (LONG/SHORT)
 * - Correlação entre posições
 */

export interface PositionExposure {
    symbol: string;
    side: 'LONG' | 'SHORT';
    betAmount: number;
    leverage: number;
    notionalValue: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
}

export interface PortfolioLimits {
    maxTotalExposure: number;        // % máximo do bankroll exposto
    maxExposurePerSymbol: number;    // % máximo por símbolo
    maxExposurePerDirection: number; // % máximo por direção (LONG/SHORT)
    maxCorrelation: number;          // Correlação máxima permitida
    maxOpenPositions: number;        // Número máximo de posições abertas
}

export interface PortfolioStatus {
    totalExposure: number;
    totalExposurePercent: number;
    longExposure: number;
    shortExposure: number;
    exposureBySymbol: Map<string, number>;
    openPositionsCount: number;
    correlationScore: number;
    withinLimits: boolean;
    limitBreaches: string[];
}

export class PortfolioExposureManager {
    // Limites padrão
    private readonly DEFAULT_LIMITS: PortfolioLimits = {
        maxTotalExposure: 60,           // 60% máximo exposto
        maxExposurePerSymbol: 20,       // 20% máximo por símbolo
        maxExposurePerDirection: 40,    // 40% máximo por direção
        maxCorrelation: 0.7,            // 0.7 correlação máxima
        maxOpenPositions: 10            // 10 posições máximas
    };
    
    private limits: PortfolioLimits = { ...this.DEFAULT_LIMITS };
    private openPositions: Map<string, PositionExposure> = new Map();
    private bankroll: number = 0;
    
    /**
     * Configura limites do portfolio
     */
    setLimits(limits: Partial<PortfolioLimits>): void {
        this.limits = { ...this.limits, ...limits };
        console.log(`📊 Limites do portfolio atualizados:`, this.limits);
    }
    
    /**
     * Atualiza bankroll atual
     */
    updateBankroll(bankroll: number): void {
        this.bankroll = bankroll;
    }
    
    /**
     * Adiciona nova posição
     */
    addPosition(position: PositionExposure): boolean {
        // Verifica se pode abrir nova posição
        const status = this.getStatus();
        
        if (!status.withinLimits) {
            console.log('❌ Posição recusada - limites excedidos:', status.limitBreaches);
            return false;
        }
        
        // Verifica limite por símbolo
        const currentSymbolExposure = status.exposureBySymbol.get(position.symbol) || 0;
        const newSymbolExposure = currentSymbolExposure + (position.betAmount / this.bankroll * 100);
        
        if (newSymbolExposure > this.limits.maxExposurePerSymbol) {
            console.log(`❌ Posição recuada - limite por símbolo excedido (${position.symbol})`);
            return false;
        }
        
        // Adiciona posição
        this.openPositions.set(`${position.symbol}-${position.side}`, position);
        
        console.log(`✅ Posição aberta: ${position.symbol} ${position.side} - $${position.betAmount} x${position.leverage}`);
        return true;
    }
    
    /**
     * Remove posição
     */
    removePosition(symbol: string, side: 'LONG' | 'SHORT'): void {
        const key = `${symbol}-${side}`;
        this.openPositions.delete(key);
        console.log(`🔒 Posição fechada: ${symbol} ${side}`);
    }
    
    /**
     * Atualiza preço de posição
     */
    updatePositionPrice(symbol: string, side: 'LONG' | 'SHORT', currentPrice: number): void {
        const key = `${symbol}-${side}`;
        const position = this.openPositions.get(key);
        
        if (!position) return;
        
        position.currentPrice = currentPrice;
        
        // Calcula unrealized PnL
        const priceDiff = side === 'LONG' 
            ? currentPrice - position.entryPrice 
            : position.entryPrice - currentPrice;
        
        position.unrealizedPnl = (priceDiff / position.entryPrice) * 100 * position.leverage;
        
        this.openPositions.set(key, position);
    }
    
    /**
     * Verifica se pode abrir nova posição
     */
    canOpenPosition(
        symbol: string, 
        side: 'LONG' | 'SHORT', 
        betAmount: number,
        leverage: number
    ): { allowed: boolean; reason?: string } {
        const status = this.getStatus();
        
        // 1. Verifica limite de posições abertas
        if (status.openPositionsCount >= this.limits.maxOpenPositions) {
            return { 
                allowed: false, 
                reason: `Máximo de ${this.limits.maxOpenPositions} posições abertas` 
            };
        }
        
        // 2. Verifica exposição total (guard against bankroll=0)
        if (this.bankroll <= 0) {
            // Bankroll not set - allow position (exposure tracking disabled)
            return { allowed: true };
        }
        const newExposure = (betAmount * leverage / this.bankroll) * 100;
        if (status.totalExposurePercent + newExposure > this.limits.maxTotalExposure) {
            return { 
                allowed: false, 
                reason: `Exposição total excedida (${status.totalExposurePercent.toFixed(1)}%/${this.limits.maxTotalExposure}%)` 
            };
        }
        
        // 3. Verifica exposição por símbolo
        const currentSymbolExposure = status.exposureBySymbol.get(symbol) || 0;
        if (currentSymbolExposure + newExposure > this.limits.maxExposurePerSymbol) {
            return { 
                allowed: false, 
                reason: `Exposição por símbolo excedida (${symbol}: ${currentSymbolExposure.toFixed(1)}%)` 
            };
        }
        
        // 4. Verifica exposição por direção
        const directionExposure = side === 'LONG' ? status.longExposure : status.shortExposure;
        if (directionExposure + newExposure > this.limits.maxExposurePerDirection) {
            return { 
                allowed: false, 
                reason: `Exposição por direção excedida (${side}: ${directionExposure.toFixed(1)}%)` 
            };
        }
        
        // 5. Verifica correlação
        const newCorrelation = this.calculateNewCorrelation(symbol, side);
        if (newCorrelation > this.limits.maxCorrelation) {
            return { 
                allowed: false, 
                reason: `Correlação excedida (${newCorrelation.toFixed(2)} > ${this.limits.maxCorrelation})` 
            };
        }
        
        return { allowed: true };
    }
    
    /**
     * Calcula correlação se nova posição for aberta
     */
    private calculateNewCorrelation(symbol: string, side: 'LONG' | 'SHORT'): number {
        // Simplificação: calcula correlação baseada em símbolos similares
        const correlatedSymbols: { [key: string]: string[] } = {
            'BTCUSDT': ['ETHUSDT', 'BNBUSDT'],
            'ETHUSDT': ['BTCUSDT', 'BNBUSDT'],
            'BNBUSDT': ['BTCUSDT', 'ETHUSDT'],
            'SOLUSDT': ['AVAXUSDT', 'MATICUSDT'],
            'XRPUSDT': ['ADAUSDT', 'DOTUSDT']
        };
        
        const correlated = correlatedSymbols[symbol] || [];
        let correlationCount = 0;
        
        for (const [key, position] of this.openPositions) {
            if (position.side !== side) continue; // Direções opostas reduzem correlação
            
            const [posSymbol] = key.split('-');
            if (correlated.includes(posSymbol)) {
                correlationCount++;
            }
        }
        
        const totalPositions = this.openPositions.size + 1;
        return correlationCount / totalPositions;
    }
    
    /**
     * Obtém status atual do portfolio
     */
    getStatus(): PortfolioStatus {
        const exposureBySymbol = new Map<string, number>();
        let longExposure = 0;
        let shortExposure = 0;
        let totalExposure = 0;
        
        for (const [, position] of this.openPositions) {
            const exposurePercent = (position.betAmount * position.leverage / this.bankroll) * 100;
            totalExposure += exposurePercent;
            
            // Por símbolo
            const current = exposureBySymbol.get(position.symbol) || 0;
            exposureBySymbol.set(position.symbol, current + exposurePercent);
            
            // Por direção
            if (position.side === 'LONG') {
                longExposure += exposurePercent;
            } else {
                shortExposure += exposurePercent;
            }
        }
        
        // Calcula correlação
        const correlationScore = this.calculateCorrelationScore();
        
        // Verifica limites
        const limitBreaches: string[] = [];
        
        if (totalExposure > this.limits.maxTotalExposure) {
            limitBreaches.push(`Total exposure: ${totalExposure.toFixed(1)}% > ${this.limits.maxTotalExposure}%`);
        }
        
        for (const [symbol, exposure] of exposureBySymbol) {
            if (exposure > this.limits.maxExposurePerSymbol) {
                limitBreaches.push(`${symbol}: ${exposure.toFixed(1)}% > ${this.limits.maxExposurePerSymbol}%`);
            }
        }
        
        if (longExposure > this.limits.maxExposurePerDirection) {
            limitBreaches.push(`LONG: ${longExposure.toFixed(1)}% > ${this.limits.maxExposurePerDirection}%`);
        }
        
        if (shortExposure > this.limits.maxExposurePerDirection) {
            limitBreaches.push(`SHORT: ${shortExposure.toFixed(1)}% > ${this.limits.maxExposurePerDirection}%`);
        }
        
        if (correlationScore > this.limits.maxCorrelation) {
            limitBreaches.push(`Correlation: ${correlationScore.toFixed(2)} > ${this.limits.maxCorrelation}`);
        }
        
        return {
            totalExposure: Math.round(totalExposure * 100) / 100,
            totalExposurePercent: Math.round(totalExposure * 100) / 100,
            longExposure: Math.round(longExposure * 100) / 100,
            shortExposure: Math.round(shortExposure * 100) / 100,
            exposureBySymbol,
            openPositionsCount: this.openPositions.size,
            correlationScore: Math.round(correlationScore * 100) / 100,
            withinLimits: limitBreaches.length === 0,
            limitBreaches
        };
    }
    
    /**
     * Calcula score de correlação do portfolio atual
     */
    private calculateCorrelationScore(): number {
        if (this.openPositions.size < 2) return 0;
        
        const correlatedSymbols: { [key: string]: string[] } = {
            'BTCUSDT': ['ETHUSDT', 'BNBUSDT'],
            'ETHUSDT': ['BTCUSDT', 'BNBUSDT'],
            'BNBUSDT': ['BTCUSDT', 'ETHUSDT'],
            'SOLUSDT': ['AVAXUSDT', 'MATICUSDT'],
            'XRPUSDT': ['ADAUSDT', 'DOTUSDT']
        };
        
        let correlationPairs = 0;
        let totalPairs = 0;
        
        const positions = Array.from(this.openPositions.values());
        
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const p1 = positions[i];
                const p2 = positions[j];
                
                // Mesma direção aumenta correlação
                if (p1.side === p2.side) {
                    totalPairs++;
                    
                    // Símbolos correlacionados
                    const correlated = correlatedSymbols[p1.symbol] || [];
                    if (correlated.includes(p2.symbol)) {
                        correlationPairs++;
                    }
                }
            }
        }
        
        return totalPairs > 0 ? correlationPairs / totalPairs : 0;
    }
    
    /**
     * Obtém todas as posições abertas
     */
    getOpenPositions(): PositionExposure[] {
        return Array.from(this.openPositions.values());
    }
    
    /**
     * Fecha todas as posições (emergency)
     */
    closeAllPositions(): void {
        const count = this.openPositions.size;
        this.openPositions.clear();
        console.log(`🚨 EMERGENCY: ${count} posições fechadas`);
    }
    
    /**
     * Reduz exposição em X%
     */
    reduceExposure(percent: number): void {
        const status = this.getStatus();
        const positionsToClose = Math.ceil(status.openPositionsCount * (percent / 100));
        
        console.log(`📉 Reduzindo exposição em ${percent}% (${positionsToClose} posições)`);
        
        // Fecha piores posições (menor unrealized PnL)
        const sorted = this.getOpenPositions()
            .sort((a, b) => a.unrealizedPnl - b.unrealizedPnl)
            .slice(0, positionsToClose);
        
        for (const position of sorted) {
            this.removePosition(position.symbol, position.side);
        }
    }
}

// Singleton instance
export const portfolioExposureManager = new PortfolioExposureManager();
