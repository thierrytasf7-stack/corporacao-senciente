/**
 * Configuração Unificada dos EPICs
 * 
 * Todos os thresholds e parâmetros configuráveis em um único lugar
 */

export interface EpicConfig {
    // EPIC-001: Meta-Learning
    metaLearning: {
        trendThreshold: number;
        volatilityHigh: number;
        volatilityLow: number;
        rangeBound: number;
        learningRateMin: number;
        learningRateMax: number;
        memoryDecayMin: number;
        memoryDecayMax: number;
    };
    
    // EPIC-002: Risk Management
    riskManagement: {
        baseRisk: number;
        minRisk: number;
        maxRisk: number;
        emergencyStopLoss: number;
        hourlyLossLimit: number;
        maxTotalExposure: number;
        maxExposurePerSymbol: number;
        maxExposurePerDirection: number;
        maxCorrelation: number;
        maxOpenPositions: number;
    };
    
    // EPIC-003: Ensemble
    ensemble: {
        strongSignalThreshold: number;
        weakSignalThreshold: number;
        outlierThreshold: number;
        minBotReliability: number;
    };
    
    // EPIC-004: Swarm
    swarm: {
        consensusThreshold: number;
        anomalyThreshold: number;
        beliefDecayRate: number;
    };
    
    // EPIC-007: Sentiment
    sentiment: {
        positiveThreshold: number;
        negativeThreshold: number;
        newsWeight: number;
        socialWeight: number;
        whaleWeight: number;
        apiKeys: {
            cryptopanic?: string;
            whalealert?: string;
            twitter?: string;
        };
    };
    
    // EPIC-008: Microstructure
    microstructure: {
        highImbalanceThreshold: number;
        predictionConfidenceThreshold: number;
        spoofingDetectionRatio: number;
        websocketReconnectDelay: number;
    };
    
    // EPIC-009: Adversarial
    adversarial: {
        stressTestScenarios: string[];
        minStressTestScore: number;
        autoFixIterations: number;
    };
}

export const DEFAULT_CONFIG: EpicConfig = {
    metaLearning: {
        trendThreshold: 0.6,
        volatilityHigh: 0.03,
        volatilityLow: 0.01,
        rangeBound: 0.15,
        learningRateMin: 0.01,
        learningRateMax: 0.3,
        memoryDecayMin: 0.01,
        memoryDecayMax: 0.2
    },
    
    riskManagement: {
        baseRisk: 1.0,
        minRisk: 0.5,
        maxRisk: 5.0,
        emergencyStopLoss: 0.05,
        hourlyLossLimit: 0.03,
        maxTotalExposure: 60,
        maxExposurePerSymbol: 20,
        maxExposurePerDirection: 40,
        maxCorrelation: 0.7,
        maxOpenPositions: 10
    },
    
    ensemble: {
        strongSignalThreshold: 0.75,
        weakSignalThreshold: 0.4,
        outlierThreshold: 2.0,
        minBotReliability: 0.5
    },
    
    swarm: {
        consensusThreshold: 0.7,
        anomalyThreshold: 2.5,
        beliefDecayRate: 0.05
    },
    
    sentiment: {
        positiveThreshold: 0.3,
        negativeThreshold: -0.3,
        newsWeight: 0.4,
        socialWeight: 0.4,
        whaleWeight: 0.2,
        apiKeys: {}
    },
    
    microstructure: {
        highImbalanceThreshold: 0.7,
        predictionConfidenceThreshold: 0.65,
        spoofingDetectionRatio: 0.7,
        websocketReconnectDelay: 5000
    },
    
    adversarial: {
        stressTestScenarios: ['flash_crash', 'pump_dump', 'volatility_spike', 'liquidity_crisis'],
        minStressTestScore: 70,
        autoFixIterations: 3
    }
};

// Singleton
export class ConfigManager {
    private static instance: ConfigManager;
    private config: EpicConfig = { ...DEFAULT_CONFIG };
    
    private constructor() {}
    
    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    
    getConfig(): EpicConfig {
        return this.config;
    }
    
    updateConfig(updates: Partial<EpicConfig>): void {
        this.config = this.mergeConfig(this.config, updates);
        console.log('✅ Configuração atualizada');
    }
    
    resetToDefaults(): void {
        this.config = { ...DEFAULT_CONFIG };
        console.log('🔄 Configuração resetada para defaults');
    }
    
    private mergeConfig(base: EpicConfig, updates: Partial<EpicConfig>): EpicConfig {
        const result = { ...base };
        
        for (const key in updates) {
            if (key in result && typeof updates[key] === 'object' && updates[key] !== null) {
                result[key] = this.mergeConfig(result[key], updates[key]);
            } else if (updates[key] !== undefined) {
                result[key] = updates[key];
            }
        }
        
        return result;
    }
}

export const configManager = ConfigManager.getInstance();
