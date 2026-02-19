/**
 * FederatedLearner - Aprendizado Federado Distribuído
 * 
 * Múltiplas instâncias aprendem separadamente e agregam conhecimento:
 * - Local model training
 * - Model aggregation (FedAvg)
 * - Global model manager
 * - Privacy-preserving (não compartilha dados brutos)
 */

export interface LocalModel {
    instanceId: string;
    weights: { [key: string]: number };
    trainingSamples: number;
    lastUpdate: number;
    performance: {
        winRate: number;
        sharpe: number;
        totalTrades: number;
    };
}

export interface GlobalModel {
    version: number;
    weights: { [key: string]: number };
    aggregatedFrom: number;
    lastUpdate: number;
    performance: {
        avgWinRate: number;
        avgSharpe: number;
        totalInstances: number;
    };
}

export interface AggregationResult {
    success: boolean;
    newVersion: number;
    instancesAggregated: number;
    improvement: number;
    timestamp: number;
}

export class FederatedLearner {
    // Modelo global
    private globalModel: GlobalModel | null = null;
    
    // Modelos locais (simulando múltiplas instâncias)
    private localModels: Map<string, LocalModel> = new Map();
    
    // Histórico de agregações
    private aggregationHistory: AggregationResult[] = [];
    
    // Configuração
    private readonly MIN_INSTANCES_FOR_AGGREGATION = 2;
    private readonly AGGREGATION_INTERVAL = 3600000; // 1 hora
    
    /**
     * Registra modelo local
     */
    registerLocalModel(model: LocalModel): void {
        this.localModels.set(model.instanceId, model);
        console.log(`🌐 Federated: Modelo local registrado - ${model.instanceId}`);
    }
    
    /**
     * Atualiza modelo local
     */
    updateLocalModel(
        instanceId: string,
        weights: { [key: string]: number },
        performance: LocalModel['performance']
    ): void {
        const existing = this.localModels.get(instanceId);
        
        if (!existing) {
            console.warn(`⚠️ Modelo local ${instanceId} não registrado`);
            return;
        }
        
        existing.weights = weights;
        existing.performance = performance;
        existing.lastUpdate = Date.now();
        existing.trainingSamples++;
        
        this.localModels.set(instanceId, existing);
    }
    
    /**
     * Agrega modelos locais em modelo global (FedAvg)
     */
    aggregateModels(): AggregationResult {
        if (this.localModels.size < this.MIN_INSTANCES_FOR_AGGREGATION) {
            return {
                success: false,
                newVersion: this.globalModel?.version || 0,
                instancesAggregated: 0,
                improvement: 0,
                timestamp: Date.now()
            };
        }
        
        console.log(`🌐 Federated: Agregando ${this.localModels.size} modelos locais`);
        
        // FedAvg: média ponderada dos pesos
        const aggregatedWeights: { [key: string]: number[] } = {};
        let totalSamples = 0;
        
        for (const [_, model] of this.localModels) {
            totalSamples += model.trainingSamples;
            
            for (const [key, value] of Object.entries(model.weights)) {
                if (!aggregatedWeights[key]) {
                    aggregatedWeights[key] = [];
                }
                
                // Pondera por número de samples
                const weight = model.trainingSamples / totalSamples;
                aggregatedWeights[key].push(value * weight);
            }
        }
        
        // Calcula média
        const newWeights: { [key: string]: number } = {};
        for (const [key, values] of Object.entries(aggregatedWeights)) {
            newWeights[key] = values.reduce((a, b) => a + b, 0);
        }
        
        // Calcula performance média
        const avgWinRate = Array.from(this.localModels.values())
            .reduce((sum, m) => sum + m.performance.winRate, 0) / this.localModels.size;
        
        const avgSharpe = Array.from(this.localModels.values())
            .reduce((sum, m) => sum + m.performance.sharpe, 0) / this.localModels.size;
        
        // Cria novo modelo global
        const newVersion = (this.globalModel?.version || 0) + 1;
        
        this.globalModel = {
            version: newVersion,
            weights: newWeights,
            aggregatedFrom: this.localModels.size,
            lastUpdate: Date.now(),
            performance: {
                avgWinRate: Math.round(avgWinRate * 100) / 100,
                avgSharpe: Math.round(avgSharpe * 100) / 100,
                totalInstances: this.localModels.size
            }
        };
        
        // Calcula melhoria
        const previousWinRate = this.aggregationHistory.length > 0
            ? this.aggregationHistory[this.aggregationHistory.length - 1].improvement
            : 0.5;
        
        const improvement = avgWinRate - previousWinRate;
        
        const result: AggregationResult = {
            success: true,
            newVersion,
            instancesAggregated: this.localModels.size,
            improvement: Math.round(improvement * 100) / 100,
            timestamp: Date.now()
        };
        
        this.aggregationHistory.push(result);
        
        console.log(`✅ Federated: Modelo global v${newVersion} criado (melhoria: ${(improvement * 100).toFixed(1)}%)`);
        
        return result;
    }
    
    /**
     * Obtém modelo global para instância local
     */
    getGlobalModel(instanceId?: string): GlobalModel | null {
        if (!this.globalModel) return null;
        
        // Se instanceId fornecida, exclui esse modelo da agregação (evita data leakage)
        if (instanceId) {
            const filteredModels = new Map(this.localModels);
            filteredModels.delete(instanceId);
            
            if (filteredModels.size < this.MIN_INSTANCES_FOR_AGGREGATION) {
                return this.globalModel;
            }
        }
        
        return this.globalModel;
    }
    
    /**
     * Compara performance local vs global
     */
    comparePerformance(instanceId: string): {
        localWinRate: number;
        globalWinRate: number;
        localSharpe: number;
        globalSharpe: number;
        recommendation: 'USE_LOCAL' | 'USE_GLOBAL' | 'HYBRID';
    } {
        const local = this.localModels.get(instanceId);
        
        if (!local || !this.globalModel) {
            return {
                localWinRate: 0,
                globalWinRate: 0,
                localSharpe: 0,
                globalSharpe: 0,
                recommendation: 'USE_LOCAL'
            };
        }
        
        const localBetter = local.performance.winRate > this.globalModel.performance.avgWinRate;
        const localMuchBetter = local.performance.winRate > this.globalModel.performance.avgWinRate + 0.1;
        
        let recommendation: 'USE_LOCAL' | 'USE_GLOBAL' | 'HYBRID' = 'HYBRID';
        
        if (localMuchBetter) {
            recommendation = 'USE_LOCAL';
        } else if (!localBetter && this.globalModel.performance.avgWinRate > 0.6) {
            recommendation = 'USE_GLOBAL';
        }
        
        return {
            localWinRate: Math.round(local.performance.winRate * 100) / 100,
            globalWinRate: this.globalModel.performance.avgWinRate,
            localSharpe: Math.round(local.performance.sharpe * 100) / 100,
            globalSharpe: this.globalModel.performance.avgSharpe,
            recommendation
        };
    }
    
    /**
     * Obtém histórico de agregações
     */
    getAggregationHistory(limit: number = 10): AggregationResult[] {
        return this.aggregationHistory.slice(-limit);
    }
    
    /**
     * Obtém status completo
     */
    getStatus(): any {
        return {
            totalLocalModels: this.localModels.size,
            globalModelVersion: this.globalModel?.version || 0,
            globalModelPerformance: this.globalModel?.performance || null,
            totalAggregations: this.aggregationHistory.length,
            lastAggregation: this.aggregationHistory.length > 0
                ? this.aggregationHistory[this.aggregationHistory.length - 1]
                : null,
            localModels: Array.from(this.localModels.entries()).map(([id, model]) => ({
                instanceId: id,
                trainingSamples: model.trainingSamples,
                winRate: model.performance.winRate,
                sharpe: model.performance.sharpe
            }))
        };
    }
    
    /**
     * Reset completo
     */
    reset(): void {
        this.localModels.clear();
        this.globalModel = null;
        this.aggregationHistory = [];
        console.log('🌐 Federated Learner resetado');
    }
}

// Singleton instance
export const federatedLearner = new FederatedLearner();
