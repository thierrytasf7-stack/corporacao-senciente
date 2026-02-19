/**
 * DynamicRiskManager - Gerenciamento de risco adaptativo
 * 
 * Calcula risco ótimo por trade baseado em múltiplos fatores:
 * - Volatilidade do mercado
 * - Confiança do bot
 * - Performance recente
 * - Correlação com outras posições
 * - Hora do dia
 */

export interface RiskFactors {
    marketVolatility: number;      // 0-1 (quanto maior, mais volátil)
    botConfidence: number;          // 0-100 (força do sinal)
    recentPerformance: number;      // -1 a 1 (ROI últimos 10 trades)
    correlationWithOtherBots: number; // 0-1 (correlação média)
    timeOfDay: number;              // 0-23 (hora do dia)
    currentDrawdown: number;        // 0-1 (drawdown atual)
    consecutiveLosses: number;      // Número de perdas consecutivas
    groupId?: string;               // ID do grupo para circuit breaker isolado
}

export interface RiskCalculation {
    optimalRiskPercent: number;     // % do bankroll para arriscar (0.5-5%)
    maxPositionSize: number;        // Tamanho máximo da posição
    leverageLimit: number;          // Limite de alavancagem
    stopLossDistance: number;       // Distância do stop loss (%)
    takeProfitDistance: number;     // Distância do take profit (%)
    confidence: number;             // Confiança no cálculo (0-1)
}

export class DynamicRiskManager {
    // Configurações base
    private readonly BASE_RISK = 1.0;           // Risco base 1%
    private readonly MIN_RISK = 0.5;            // Risco mínimo 0.5%
    private readonly MAX_RISK = 5.0;            // Risco máximo 5%
    
    // Limiares de volatilidade
    private readonly VOLATILITY_LOW = 0.3;
    private readonly VOLATILITY_HIGH = 0.7;
    
    // Limiares de performance
    private readonly PERFORMANCE_BAD = -0.1;    // -10% ROI
    private readonly PERFORMANCE_GOOD = 0.15;   // +15% ROI
    
    // Circuito de emergência
    private readonly EMERGENCY_STOP_LOSS = 0.05; // 5% perda em 1 hora = STOP
    private readonly HOURLY_LOSS_LIMIT = 0.03;   // 3% perda máxima por hora
    
    // Histórico de perdas por hora
    private hourlyLosses: Map<string, number> = new Map();
    
    /**
     * Calcula risco ótimo baseado em múltiplos fatores
     */
    calculateOptimalRisk(factors: RiskFactors): RiskCalculation {
        // 1. Começa com risco base
        let riskPercent = this.BASE_RISK;
        
        // 2. Ajusta por volatilidade (menos risco em alta volatilidade)
        const volatilityMultiplier = this.calculateVolatilityMultiplier(factors.marketVolatility);
        riskPercent *= volatilityMultiplier;
        
        // 3. Ajusta por confiança do bot (mais confiança = mais risco)
        const confidenceMultiplier = this.calculateConfidenceMultiplier(factors.botConfidence);
        riskPercent *= confidenceMultiplier;
        
        // 4. Ajusta por performance recente (performance ruim = menos risco)
        const performanceMultiplier = this.calculatePerformanceMultiplier(factors.recentPerformance);
        riskPercent *= performanceMultiplier;
        
        // 5. Ajusta por correlação (alta correlação = menos risco)
        const correlationMultiplier = this.calculateCorrelationMultiplier(factors.correlationWithOtherBots);
        riskPercent *= correlationMultiplier;
        
        // 6. Ajusta por drawdown atual (drawdown alto = menos risco)
        const drawdownMultiplier = this.calculateDrawdownMultiplier(factors.currentDrawdown);
        riskPercent *= drawdownMultiplier;
        
        // 7. Ajusta por perdas consecutivas (perdas = menos risco)
        const consecutiveLossMultiplier = this.calculateConsecutiveLossMultiplier(factors.consecutiveLosses);
        riskPercent *= consecutiveLossMultiplier;
        
        // 8. Verifica circuit breaker (per group)
        const circuitBreakerActive = this.checkCircuitBreaker(factors.groupId || 'default');
        if (circuitBreakerActive) {
            riskPercent = this.MIN_RISK * 0.5; // Reduz risco pela metade
        }
        
        // 9. Aplica limites
        riskPercent = Math.max(this.MIN_RISK, Math.min(this.MAX_RISK, riskPercent));
        
        // 10. Calcula demais parâmetros
        const leverageLimit = this.calculateLeverageLimit(riskPercent, factors);
        const stopLossDistance = this.calculateStopLossDistance(riskPercent, factors);
        const takeProfitDistance = this.calculateTakeProfitDistance(riskPercent, stopLossDistance);
        
        return {
            optimalRiskPercent: Math.round(riskPercent * 100) / 100,
            maxPositionSize: riskPercent,
            leverageLimit,
            stopLossDistance,
            takeProfitDistance,
            confidence: this.calculateConfidenceScore(factors)
        };
    }
    
    /**
     * Multiplicador por volatilidade
     */
    private calculateVolatilityMultiplier(volatility: number): number {
        if (volatility < this.VOLATILITY_LOW) {
            return 1.2; // Baixa volatilidade = mais risco
        } else if (volatility > this.VOLATILITY_HIGH) {
            return 0.6; // Alta volatilidade = menos risco
        }
        return 1.0;
    }
    
    /**
     * Multiplicador por confiança do bot
     */
    private calculateConfidenceMultiplier(confidence: number): number {
        if (confidence >= 80) {
            return 1.3; // Alta confiança
        } else if (confidence >= 60) {
            return 1.1;
        } else if (confidence >= 40) {
            return 1.0;
        } else {
            return 0.7; // Baixa confiança
        }
    }
    
    /**
     * Multiplicador por performance recente
     */
    private calculatePerformanceMultiplier(performance: number): number {
        if (performance < this.PERFORMANCE_BAD) {
            return 0.5; // Performance muito ruim
        } else if (performance < 0) {
            return 0.7;
        } else if (performance < this.PERFORMANCE_GOOD) {
            return 1.0;
        } else {
            return 1.2; // Performance boa
        }
    }
    
    /**
     * Multiplicador por correlação
     */
    private calculateCorrelationMultiplier(correlation: number): number {
        if (correlation > 0.8) {
            return 0.5; // Correlação muito alta
        } else if (correlation > 0.6) {
            return 0.7;
        } else if (correlation > 0.4) {
            return 0.85;
        }
        return 1.0; // Baixa correlação
    }
    
    /**
     * Multiplicador por drawdown
     */
    private calculateDrawdownMultiplier(drawdown: number): number {
        if (drawdown > 0.2) {
            return 0.4; // Drawdown > 20%
        } else if (drawdown > 0.15) {
            return 0.6;
        } else if (drawdown > 0.1) {
            return 0.8;
        } else if (drawdown > 0.05) {
            return 0.9;
        }
        return 1.0;
    }
    
    /**
     * Multiplicador por perdas consecutivas
     */
    private calculateConsecutiveLossMultiplier(losses: number): number {
        if (losses >= 5) {
            return 0.3; // 5+ perdas consecutivas
        } else if (losses >= 3) {
            return 0.5;
        } else if (losses >= 2) {
            return 0.7;
        }
        return 1.0;
    }
    
    /**
     * Calcula limite de alavancagem baseado no risco
     */
    private calculateLeverageLimit(riskPercent: number, factors: RiskFactors): number {
        // Risco maior = menos alavancagem
        const baseLeverage = 50;
        const riskFactor = this.BASE_RISK / riskPercent;
        const leverage = baseLeverage * riskFactor;
        
        // Ajusta por volatilidade
        const volatilityAdjusted = leverage * (1 - factors.marketVolatility * 0.5);
        
        return Math.max(5, Math.min(50, Math.round(volatilityAdjusted)));
    }
    
    /**
     * Calcula distância do stop loss
     */
    private calculateStopLossDistance(riskPercent: number, factors: RiskFactors): number {
        // Stop loss baseado em ATR e volatilidade
        const baseDistance = 2.0; // 2% base
        const volatilityAdjustment = 1 + (factors.marketVolatility * 0.5);
        
        return Math.round((baseDistance * volatilityAdjustment) * 100) / 100;
    }
    
    /**
     * Calcula distância do take profit (risk/reward ratio)
     */
    private calculateTakeProfitDistance(riskPercent: number, stopLossDistance: number): number {
        // Target: risk/reward de pelo menos 1:2
        const minRewardRatio = 2.0;
        const takeProfit = stopLossDistance * minRewardRatio;
        
        return Math.round(takeProfit * 100) / 100;
    }
    
    /**
     * Calcula score de confiança do cálculo
     */
    private calculateConfidenceScore(factors: RiskFactors): number {
        let confidence = 1.0;
        
        // Reduz confiança se muitos fatores extremos
        if (factors.marketVolatility > 0.8) confidence -= 0.2;
        if (factors.recentPerformance < -0.2) confidence -= 0.2;
        if (factors.correlationWithOtherBots > 0.7) confidence -= 0.15;
        if (factors.consecutiveLosses > 3) confidence -= 0.2;
        
        return Math.max(0.3, Math.round(confidence * 100) / 100);
    }
    
    /**
     * Verifica se circuit breaker está ativo (per group)
     */
    private checkCircuitBreaker(groupId: string): boolean {
        const now = new Date();
        const hourKey = `${groupId}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        const hourlyLoss = this.hourlyLosses.get(hourKey) || 0;

        // Circuit breaker: 5% de perda em 1 hora por grupo
        if (hourlyLoss >= this.EMERGENCY_STOP_LOSS) {
            console.log(`🚨 CIRCUIT BREAKER [${groupId}] - Perda horária excedida (${(hourlyLoss * 100).toFixed(1)}%)`);
            return true;
        }

        return false;
    }
    
    /**
     * Registra perda para circuit breaker (per group)
     */
    recordLoss(pnlValue: number, bankrollBefore: number, groupId: string = 'default'): void {
        if (pnlValue >= 0) return; // Só registra perdas

        const now = new Date();
        const hourKey = `${groupId}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        const lossPercent = Math.abs(pnlValue) / bankrollBefore;
        const currentHourlyLoss = this.hourlyLosses.get(hourKey) || 0;

        this.hourlyLosses.set(hourKey, currentHourlyLoss + lossPercent);

        // Limpa horas antigas (mantém apenas última hora)
        this.cleanupOldHours();
    }
    
    /**
     * Limpa histórico de horas antigas
     */
    private cleanupOldHours(): void {
        const now = new Date();
        const currentHourSuffix = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        for (const [key] of this.hourlyLosses) {
            if (!key.endsWith(currentHourSuffix)) {
                this.hourlyLosses.delete(key);
            }
        }
    }
    
    /**
     * Reseta circuit breaker (após emergência)
     */
    resetCircuitBreaker(): void {
        this.hourlyLosses.clear();
        console.log('✅ Circuit breaker resetado');
    }
    
    /**
     * Obtém status atual do risk manager
     */
    getStatus(groupId: string = 'default'): any {
        const now = new Date();
        const hourKey = `${groupId}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
        const currentHourlyLoss = this.hourlyLosses.get(hourKey) || 0;

        return {
            circuitBreakerActive: this.checkCircuitBreaker(groupId),
            currentHourlyLoss: Math.round(currentHourlyLoss * 100) / 100,
            hourlyLossLimit: this.HOURLY_LOSS_LIMIT,
            emergencyStopLoss: this.EMERGENCY_STOP_LOSS,
            baseRisk: this.BASE_RISK,
            minRisk: this.MIN_RISK,
            maxRisk: this.MAX_RISK
        };
    }
}

// Singleton instance
export const dynamicRiskManager = new DynamicRiskManager();
