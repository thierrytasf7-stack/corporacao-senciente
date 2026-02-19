/**
 * SwarmMind - Inteligência Coletiva de Enxame
 * 
 * Implementa sabedoria das multidões:
 * - Shared beliefs map (crenças coletivas)
 * - Collective voting (votação ponderada)
 * - Anomaly detection (detecção coletiva de anomalias)
 * - Bot-to-bot communication
 */

export interface SharedBelief {
    symbol: string;
    bullishBelief: number;    // 0-1 (crença de alta)
    bearishBelief: number;    // 0-1 (crença de baixa)
    confidence: number;       // 0-1 (confiança na crença)
    contributors: string[];   // Bots que contribuíram
    lastUpdate: number;
}

export interface CollectiveDecision {
    symbol: string;
    direction: 'LONG' | 'SHORT' | 'NEUTRAL';
    confidence: number;
    consensusLevel: number;
    totalBots: number;
    longVotes: number;
    shortVotes: number;
    neutralVotes: number;
    anomalyDetected: boolean;
}

export interface AnomalyAlert {
    type: 'PRICE_ANOMALY' | 'VOLUME_ANOMALY' | 'CORRELATION_ANOMALY' | 'BEHAVIOR_ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    affectedSymbols: string[];
    confidence: number;
    recommendation: string;
}

export class SwarmMind {
    // Shared beliefs map
    private beliefs: Map<string, SharedBelief> = new Map();
    
    // Anomaly alerts
    private anomalies: AnomalyAlert[] = [];
    
    // Histórico de decisões coletivas
    private decisionHistory: CollectiveDecision[] = [];
    private readonly MAX_HISTORY = 100;
    
    // Thresholds
    private readonly CONSENSUS_THRESHOLD = 0.7;
    private readonly ANOMALY_THRESHOLD = 2.5; // std deviations
    
    /**
     * Atualiza crença compartilhada
     */
    updateBelief(
        botId: string,
        symbol: string,
        bullishConfidence: number,
        bearishConfidence: number
    ): void {
        // Inicializa se não existe
        if (!this.beliefs.has(symbol)) {
            this.beliefs.set(symbol, {
                symbol,
                bullishBelief: 0,
                bearishBelief: 0,
                confidence: 0,
                contributors: [],
                lastUpdate: Date.now()
            });
        }
        
        const belief = this.beliefs.get(symbol)!;
        
        // Adiciona contribuidor
        if (!belief.contributors.includes(botId)) {
            belief.contributors.push(botId);
        }
        
        // Atualiza crenças (média ponderada)
        const weight = 1 / belief.contributors.length;
        belief.bullishBelief = (belief.bullishBelief * (1 - weight)) + (bullishConfidence * weight);
        belief.bearishBelief = (belief.bearishBelief * (1 - weight)) + (bearishConfidence * weight);
        belief.confidence = Math.max(belief.bullishBelief, belief.bearishBelief);
        belief.lastUpdate = Date.now();
        
        // Verifica anomalias
        this.checkAnomalies(symbol);
    }
    
    /**
     * Obtém decisão coletiva para símbolo
     */
    getCollectiveDecision(symbol: string): CollectiveDecision {
        const belief = this.beliefs.get(symbol);
        
        if (!belief || belief.contributors.length === 0) {
            return {
                symbol,
                direction: 'NEUTRAL',
                confidence: 0.5,
                consensusLevel: 0,
                totalBots: 0,
                longVotes: 0,
                shortVotes: 0,
                neutralVotes: 0,
                anomalyDetected: false
            };
        }
        
        // Conta votos
        const longVotes = belief.contributors.filter(() => belief.bullishBelief > belief.bearishBelief).length;
        const shortVotes = belief.contributors.filter(() => belief.bearishBelief > belief.bullishBelief).length;
        const neutralVotes = belief.contributors.length - longVotes - shortVotes;
        
        // Determina direção
        let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
        if (belief.bullishBelief > belief.bearishBelief + 0.2) direction = 'LONG';
        else if (belief.bearishBelief > belief.bullishBelief + 0.2) direction = 'SHORT';
        
        // Calcula consenso
        const consensusLevel = Math.abs(belief.bullishBelief - belief.bearishBelief);
        
        // Verifica anomalias
        const anomalyDetected = this.anomalies.some(a => 
            a.affectedSymbols.includes(symbol) && a.severity === 'CRITICAL'
        );
        
        return {
            symbol,
            direction,
            confidence: belief.confidence,
            consensusLevel,
            totalBots: belief.contributors.length,
            longVotes,
            shortVotes,
            neutralVotes,
            anomalyDetected
        };
    }
    
    /**
     * Verifica anomalias para símbolo
     */
    private checkAnomalies(symbol: string): void {
        const belief = this.beliefs.get(symbol);
        if (!belief) return;
        
        // Verifica divergência extrema (possível anomalia)
        const divergence = Math.abs(belief.bullishBelief - belief.bearishBelief);
        
        if (divergence > 0.8 && belief.contributors.length > 3) {
            // Muitos bots discordando fortemente = possível anomalia
            this.anomalies.push({
                type: 'BEHAVIOR_ANOMALY',
                severity: 'HIGH',
                description: `Alta divergência de opiniões em ${symbol}`,
                affectedSymbols: [symbol],
                confidence: divergence,
                recommendation: 'Aguardar confirmação antes de operar'
            });
        }
        
        // Mantém apenas últimas anomalias
        if (this.anomalies.length > 20) {
            this.anomalies.shift();
        }
    }
    
    /**
     * Obtém todas as crenças compartilhadas
     */
    getAllBeliefs(): SharedBelief[] {
        return Array.from(this.beliefs.values());
    }
    
    /**
     * Obtém anomalias ativas
     */
    getActiveAnomalies(): AnomalyAlert[] {
        return this.anomalies.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
    }
    
    /**
     * Obtém status do swarm
     */
    getStatus(): any {
        const decisions = Array.from(this.beliefs.keys()).map(symbol => 
            this.getCollectiveDecision(symbol)
        );
        
        const highConsensus = decisions.filter(d => d.consensusLevel > this.CONSENSUS_THRESHOLD).length;
        const anomalyCount = this.getActiveAnomalies().length;
        
        return {
            totalSymbols: this.beliefs.size,
            totalBots: Array.from(this.beliefs.values())
                .reduce((sum, b) => sum + b.contributors.length, 0) / this.beliefs.size,
            highConsensusDecisions: highConsensus,
            activeAnomalies: anomalyCount,
            avgConfidence: Array.from(this.beliefs.values())
                .reduce((sum, b) => sum + b.confidence, 0) / Math.max(1, this.beliefs.size)
        };
    }
    
    /**
     * Limpa crenças antigas
     */
    cleanupOldBeliefs(maxAge: number = 3600000): void {
        const now = Date.now();
        for (const [symbol, belief] of this.beliefs) {
            if (now - belief.lastUpdate > maxAge) {
                this.beliefs.delete(symbol);
            }
        }
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.beliefs.clear();
        this.anomalies = [];
        this.decisionHistory = [];
        console.log('🐝 Swarm Mind resetado');
    }
}

// Singleton instance
export const swarmMind = new SwarmMind();
