/**
 * StrategyArena - Sistema competitivo de estratégias de trading
 * 
 * Estratégias competem entre si, as ruins morrem, as boas se reproduzem
 * Novas estratégias são criadas via crossover + mutação das vencedoras
 */

import { StrategyMetrics } from '../DNAArenaV2Engine';

export interface StrategyGene {
    id: string;
    generation: number;
    parentId1?: string;
    parentId2?: string;
    createdAt: number;
    lastActiveAt: number;
    
    // Trading parameters
    weight: number;              // Peso da estratégia (0-2)
    minSignalStrength: number;   // Força mínima do sinal (0-100)
    maxSignalStrength: number;   // Força máxima do sinal (0-100)
    timeframes: number[];        // Timeframes preferidos [1, 3, 5, 15, 60]
    riskMultiplier: number;      // Multiplicador de risco (0.5-2.0)
    
    // Performance tracking
    metrics: StrategyMetrics;
    fitness: number;             // Score de fitness atual
    age: number;                 // Idade em ciclos
    wins: number;
    losses: number;
    
    // Status
    isActive: boolean;
    isElite: boolean;            // Top 10% das estratégias
    deathCount: number;          // Quantas vezes "morreu" e renasceu
}

export interface ArenaSnapshot {
    totalStrategies: number;
    activeStrategies: number;
    eliteStrategies: number;
    avgFitness: number;
    topStrategy: StrategyGene | null;
    bottomStrategy: StrategyGene | null;
    newStrategiesThisCycle: number;
    deadStrategiesThisCycle: number;
}

export class StrategyArena {
    private strategies: Map<string, StrategyGene> = new Map();
    private currentCycle: number = 0;
    private strategyIdCounter: number = 0;
    
    // Configurações do sistema competitivo
    private readonly ELITE_PERCENTILE = 0.1;      // Top 10% são elite
    private readonly DEATH_THRESHOLD = 0.3;        // EV < 0.3 por 50 ciclos = morte
    private readonly BIRTH_RATE = 0.05;            // 5% de novas estratégias por ciclo
    private readonly MUTATION_RATE = 0.15;         // 15% de chance de mutação
    private readonly MAX_STRATEGIES = 50;          // Limite máximo de estratégias
    private readonly MIN_STRATEGIES = 20;          // Mínimo de estratégias ativas
    private readonly GENERATION_GAP = 100;         // Nova geração a cada 100 ciclos
    
    constructor() {
        this.initializeDefaultStrategies();
    }

    /**
     * Inicializa estratégias padrão (30 estratégias base)
     */
    private initializeDefaultStrategies(): void {
        const defaultStrategies = [
            // Momentum (0-9)
            { name: 'RSI_Momentum', weight: 1.2, minSignal: 30, maxSignal: 80, timeframes: [1, 3, 5] },
            { name: 'MACD_Trend', weight: 1.1, minSignal: 35, maxSignal: 75, timeframes: [3, 5, 15] },
            { name: 'Stochastic', weight: 1.0, minSignal: 25, maxSignal: 85, timeframes: [1, 3, 5] },
            { name: 'CCI_Momentum', weight: 0.9, minSignal: 30, maxSignal: 70, timeframes: [5, 15] },
            { name: 'ROC_Momentum', weight: 0.8, minSignal: 35, maxSignal: 75, timeframes: [3, 5, 15] },
            { name: 'Williams_R', weight: 0.9, minSignal: 30, maxSignal: 80, timeframes: [1, 3, 5] },
            { name: 'ADX_Trend', weight: 1.0, minSignal: 40, maxSignal: 70, timeframes: [5, 15, 60] },
            { name: 'Momentum_Osc', weight: 0.8, minSignal: 35, maxSignal: 75, timeframes: [3, 5] },
            { name: 'TSI_Momentum', weight: 0.7, minSignal: 30, maxSignal: 70, timeframes: [5, 15] },
            { name: 'PPO_Momentum', weight: 0.8, minSignal: 35, maxSignal: 75, timeframes: [3, 5, 15] },
            
            // Mean Reversion (10-19)
            { name: 'Bollinger_Squeeze', weight: 1.1, minSignal: 40, maxSignal: 90, timeframes: [5, 15] },
            { name: 'RSI_Divergence', weight: 1.0, minSignal: 35, maxSignal: 75, timeframes: [5, 15, 60] },
            { name: 'Mean_Revert', weight: 0.9, minSignal: 30, maxSignal: 70, timeframes: [3, 5, 15] },
            { name: 'Keltner_Channel', weight: 0.8, minSignal: 35, maxSignal: 75, timeframes: [5, 15] },
            { name: 'Donchian_Channel', weight: 0.9, minSignal: 40, maxSignal: 80, timeframes: [15, 60] },
            { name: 'VWAP_Reversion', weight: 1.0, minSignal: 35, maxSignal: 70, timeframes: [5, 15] },
            { name: 'Z_Score', weight: 0.8, minSignal: 40, maxSignal: 85, timeframes: [5, 15, 60] },
            { name: 'Pairs_Trading', weight: 0.7, minSignal: 45, maxSignal: 75, timeframes: [15, 60] },
            { name: 'Stat_Arb', weight: 0.6, minSignal: 50, maxSignal: 80, timeframes: [15, 60] },
            { name: 'Ornstein_Uhlenbeck', weight: 0.5, minSignal: 45, maxSignal: 75, timeframes: [15, 60] },
            
            // Volatility (20-29)
            { name: 'ATR_Breakout', weight: 1.0, minSignal: 40, maxSignal: 80, timeframes: [5, 15] },
            { name: 'Volatility_Expansion', weight: 0.9, minSignal: 45, maxSignal: 85, timeframes: [5, 15, 60] },
            { name: 'Volatility_Contraction', weight: 0.8, minSignal: 40, maxSignal: 75, timeframes: [15, 60] },
            { name: 'Keltner_Breakout', weight: 0.9, minSignal: 45, maxSignal: 80, timeframes: [5, 15] },
            { name: 'Bollinger_Breakout', weight: 1.0, minSignal: 40, maxSignal: 85, timeframes: [5, 15] },
            { name: 'Volatility_Squeeze', weight: 0.8, minSignal: 50, maxSignal: 90, timeframes: [15, 60] },
            { name: 'Historical_Vol', weight: 0.7, minSignal: 45, maxSignal: 75, timeframes: [15, 60] },
            { name: 'Implied_Vol', weight: 0.6, minSignal: 50, maxSignal: 80, timeframes: [60] },
            { name: 'Volatility_Risk', weight: 0.7, minSignal: 45, maxSignal: 75, timeframes: [15, 60] },
            { name: 'Volatility_Premium', weight: 0.6, minSignal: 50, maxSignal: 80, timeframes: [60] }
        ];

        defaultStrategies.forEach((strat, index) => {
            this.createStrategy(
                `strat_${index}`,
                strat.weight,
                strat.minSignal,
                strat.maxSignal,
                strat.timeframes
            );
        });
    }

    /**
     * Cria nova estratégia
     */
    private createStrategy(
        id: string,
        weight: number,
        minSignal: number,
        maxSignal: number,
        timeframes: number[],
        parentId1?: string,
        parentId2?: string
    ): StrategyGene {
        const strategy: StrategyGene = {
            id,
            generation: parentId1 && parentId2 ? 
                Math.max(this.getStrategy(parentId1)?.generation || 0, this.getStrategy(parentId2)?.generation || 0) + 1 : 1,
            parentId1,
            parentId2,
            createdAt: this.currentCycle,
            lastActiveAt: this.currentCycle,
            weight,
            minSignalStrength: minSignal,
            maxSignalStrength: maxSignal,
            timeframes,
            riskMultiplier: 1.0,
            metrics: {
                strategyId: id,
                totalTrades: 0,
                wins: 0,
                losses: 0,
                winRate: 0,
                totalTakeProfitValue: 0,
                totalStopLossValue: 0,
                avgTakeProfitOdd: 0,
                avgStopLossOdd: 0,
                expectedValue: 0,
                avgSignalStrength: 0,
                participationRate: 0
            },
            fitness: 0,
            age: 0,
            wins: 0,
            losses: 0,
            isActive: true,
            isElite: false,
            deathCount: 0
        };

        this.strategies.set(id, strategy);
        return strategy;
    }

    /**
     * Executa ciclo competitivo
     */
    async executeCycle(): Promise<void> {
        this.currentCycle++;
        
        // 1. Atualizar idade e fitness de todas as estratégias
        this.updateStrategyFitness();
        
        // 2. Identificar elite e bottom performers
        this.identifyEliteAndBottom();
        
        // 3. Matar estratégias ruins
        const deaths = this.killUnderperformingStrategies();
        
        // 4. Cruzar estratégias vencedoras
        const births = this.crossoverEliteStrategies();
        
        // 5. Mutação para inovação
        this.mutateStrategies();
        
        // 6. Manter população dentro dos limites
        this.maintainPopulationLimits();
        
        console.log(`🧬 [STRATEGY ARENA] Ciclo ${this.currentCycle}: ${deaths} mortes, ${births} nascimentos, ${this.getActiveCount()} ativas`);
    }

    /**
     * Atualiza fitness de todas as estratégias
     */
    private updateStrategyFitness(): void {
        for (const [, strategy] of this.strategies) {
            if (!strategy.isActive) continue;
            
            strategy.age++;
            
            // Fitness baseado em EV, win rate e consistência
            const evScore = Math.max(0, strategy.metrics.expectedValue);
            const winRateScore = strategy.metrics.winRate;
            const participationScore = strategy.metrics.participationRate;
            const consistencyScore = strategy.metrics.totalTrades > 10 ? 
                (1 - Math.abs(strategy.metrics.winRate - 0.5)) : 0.5;
            
            // Ponderação: EV é mais importante
            strategy.fitness = (evScore * 0.5) + (winRateScore * 0.25) + (participationScore * 0.15) + (consistencyScore * 0.1);
            
            // Bonus para estratégias consistentes
            if (strategy.metrics.totalTrades >= 50 && strategy.metrics.winRate >= 0.45) {
                strategy.fitness *= 1.2;
            }
        }
    }

    /**
     * Identifica elite (top 10%) e bottom (bottom 20%)
     */
    private identifyEliteAndBottom(): void {
        const activeStrategies = Array.from(this.strategies.values())
            .filter(s => s.isActive)
            .sort((a, b) => b.fitness - a.fitness);
        
        const eliteCount = Math.ceil(activeStrategies.length * this.ELITE_PERCENTILE);
        const bottomCount = Math.floor(activeStrategies.length * 0.2);
        
        // Marcar elite
        activeStrategies.forEach((s, index) => {
            s.isElite = index < eliteCount;
        });
        
        // Marcar para possível morte
        for (let i = activeStrategies.length - bottomCount; i < activeStrategies.length; i++) {
            const strategy = activeStrategies[i];
            // Só morre se EV for negativo por muitos ciclos
            if (strategy.metrics.expectedValue < this.DEATH_THRESHOLD && strategy.age > 50) {
                strategy.isActive = false;
                strategy.deathCount++;
            }
        }
    }

    /**
     * Mata estratégias com performance ruim
     */
    private killUnderperformingStrategies(): number {
        let deaths = 0;
        
        for (const [, strategy] of this.strategies) {
            if (!strategy.isActive) continue;
            
            // Condições de morte:
            // 1. EV negativo por 50+ ciclos
            // 2. Win rate < 30% com 30+ trades
            // 3. Participação < 10% com 50+ ciclos de idade
            
            const isDeadByEV = strategy.metrics.expectedValue < 0 && strategy.age > 50;
            const isDeadByWinRate = strategy.metrics.winRate < 0.3 && strategy.metrics.totalTrades > 30;
            const isDeadByParticipation = strategy.metrics.participationRate < 0.1 && strategy.age > 50;
            
            if (isDeadByEV || isDeadByWinRate || isDeadByParticipation) {
                strategy.isActive = false;
                strategy.deathCount++;
                deaths++;
            }
        }
        
        return deaths;
    }

    /**
     * Cruzamento de estratégias elite para criar novas
     */
    private crossoverEliteStrategies(): number {
        const eliteStrategies = Array.from(this.strategies.values())
            .filter(s => s.isActive && s.isElite);
        
        if (eliteStrategies.length < 2) return 0;
        
        let births = 0;
        const targetBirths = Math.ceil(eliteStrategies.length * this.BIRTH_RATE * 2);
        
        for (let i = 0; i < targetBirths && births < 5; i++) {
            // Selecionar dois pais aleatórios da elite
            const parent1 = eliteStrategies[Math.floor(Math.random() * eliteStrategies.length)];
            const parent2 = eliteStrategies[Math.floor(Math.random() * eliteStrategies.length)];
            
            if (parent1.id === parent2.id) continue;
            
            // Criar ID único
            const newId = `strat_${this.strategyIdCounter++}`;
            
            // Crossover dos genes
            const child = this.crossoverStrategies(parent1, parent2, newId);
            
            if (child) {
                this.strategies.set(newId, child);
                births++;
            }
        }
        
        return births;
    }

    /**
     * Crossover entre duas estratégias
     */
    private crossoverStrategies(parent1: StrategyGene, parent2: StrategyGene, childId: string): StrategyGene | null {
        // Blend crossover para parâmetros contínuos
        const alpha = Math.random() * 0.6 + 0.2; // 0.2 a 0.8
        
        const childWeight = (parent1.weight * alpha) + (parent2.weight * (1 - alpha));
        const childMinSignal = Math.round((parent1.minSignalStrength * alpha) + (parent2.minSignalStrength * (1 - alpha)));
        const childMaxSignal = Math.round((parent1.maxSignalStrength * alpha) + (parent2.maxSignalStrength * (1 - alpha)));
        
        // Combinar timeframes (união com probabilidade)
        const childTimeframes = Array.from(new Set([
            ...parent1.timeframes.filter(() => Math.random() > 0.3),
            ...parent2.timeframes.filter(() => Math.random() > 0.3)
        ])).sort((a, b) => a - b);
        
        if (childTimeframes.length === 0) return null; // Estratégia inválida
        
        return this.createStrategy(
            childId,
            Math.max(0.1, Math.min(2.0, childWeight)),
            Math.max(10, Math.min(60, childMinSignal)),
            Math.max(40, Math.min(100, childMaxSignal)),
            childTimeframes,
            parent1.id,
            parent2.id
        );
    }

    /**
     * Mutação de estratégias para inovação
     */
    private mutateStrategies(): void {
        for (const [, strategy] of this.strategies) {
            if (!strategy.isActive) continue;
            
            if (Math.random() > this.MUTATION_RATE) continue;
            
            // Tipo de mutação
            const mutationType = Math.random();
            
            if (mutationType < 0.3) {
                // Mutação de peso
                strategy.weight = Math.max(0.1, Math.min(2.0, strategy.weight + (Math.random() - 0.5) * 0.4));
            } else if (mutationType < 0.6) {
                // Mutação de signal strength
                strategy.minSignalStrength = Math.max(10, Math.min(60, 
                    Math.round(strategy.minSignalStrength + (Math.random() - 0.5) * 10)));
                strategy.maxSignalStrength = Math.max(40, Math.min(100,
                    Math.round(strategy.maxSignalStrength + (Math.random() - 0.5) * 10)));
            } else if (mutationType < 0.8) {
                // Mutação de timeframes
                if (Math.random() > 0.5 && strategy.timeframes.length < 5) {
                    // Adicionar timeframe
                    const newTf = [1, 3, 5, 15, 60][Math.floor(Math.random() * 5)];
                    if (!strategy.timeframes.includes(newTf)) {
                        strategy.timeframes.push(newTf);
                        strategy.timeframes.sort((a, b) => a - b);
                    }
                } else if (strategy.timeframes.length > 1) {
                    // Remover timeframe
                    strategy.timeframes.splice(Math.floor(Math.random() * strategy.timeframes.length), 1);
                }
            } else {
                // Mutação de risk multiplier
                strategy.riskMultiplier = Math.max(0.5, Math.min(2.0, 
                    strategy.riskMultiplier + (Math.random() - 0.5) * 0.3));
            }
        }
    }

    /**
     * Mantém população dentro dos limites
     */
    private maintainPopulationLimits(): void {
        const activeCount = this.getActiveCount();
        
        // Se muitas estratégias, remover as piores
        if (activeCount > this.MAX_STRATEGIES) {
            const sorted = Array.from(this.strategies.values())
                .filter(s => s.isActive)
                .sort((a, b) => a.fitness - b.fitness);
            
            const toRemove = activeCount - this.MAX_STRATEGIES;
            for (let i = 0; i < toRemove; i++) {
                sorted[i].isActive = false;
            }
        }
        
        // Se poucas estratégias, criar novas aleatórias
        if (activeCount < this.MIN_STRATEGIES) {
            const toCreate = this.MIN_STRATEGIES - activeCount;
            for (let i = 0; i < toCreate; i++) {
                const newId = `strat_${this.strategyIdCounter++}`;
                this.createStrategy(
                    newId,
                    0.5 + Math.random() * 1.0,
                    20 + Math.round(Math.random() * 30),
                    50 + Math.round(Math.random() * 30),
                    [1, 3, 5, 15, 60].filter(() => Math.random() > 0.5)
                );
            }
        }
    }

    /**
     * Atualiza métricas de uma estratégia após trade
     */
    updateStrategyMetrics(strategyId: string, pnlValue: number, betAmount: number, isWin: boolean, signalStrength: number): void {
        const strategy = this.strategies.get(strategyId);
        if (!strategy || !strategy.isActive) return;
        
        strategy.lastActiveAt = this.currentCycle;
        strategy.metrics.totalTrades++;
        
        if (isWin) {
            strategy.wins++;
            strategy.metrics.wins++;
            strategy.metrics.totalTakeProfitValue += pnlValue;
            strategy.metrics.avgTakeProfitOdd = strategy.metrics.totalTakeProfitValue / strategy.wins / betAmount;
        } else {
            strategy.losses++;
            strategy.metrics.losses++;
            strategy.metrics.totalStopLossValue += Math.abs(pnlValue);
            strategy.metrics.avgStopLossOdd = strategy.metrics.totalStopLossValue / strategy.losses / betAmount;
        }
        
        strategy.metrics.winRate = strategy.metrics.totalTrades > 0 ? 
            strategy.metrics.wins / strategy.metrics.totalTrades : 0;
        strategy.metrics.expectedValue = 
            (strategy.metrics.winRate * strategy.metrics.avgTakeProfitOdd) - 
            ((1 - strategy.metrics.winRate) * strategy.metrics.avgStopLossOdd);
        strategy.metrics.participationRate = this.currentCycle > 0 ? 
            strategy.metrics.totalTrades / this.currentCycle : 0;
        
        // Atualizar força média do sinal
        strategy.metrics.avgSignalStrength = 
            ((strategy.metrics.avgSignalStrength * (strategy.metrics.totalTrades - 1)) + signalStrength) / 
            strategy.metrics.totalTrades;
    }

    /**
     * Obtém snapshot da arena
     */
    getSnapshot(): ArenaSnapshot {
        const active = Array.from(this.strategies.values()).filter(s => s.isActive);
        const sorted = [...active].sort((a, b) => b.fitness - a.fitness);
        
        const eliteCount = Math.ceil(active.length * this.ELITE_PERCENTILE);
        const avgFitness = active.reduce((sum, s) => sum + s.fitness, 0) / Math.max(1, active.length);
        
        return {
            totalStrategies: this.strategies.size,
            activeStrategies: active.length,
            eliteStrategies: eliteCount,
            avgFitness: Math.round(avgFitness * 100) / 100,
            topStrategy: sorted[0] || null,
            bottomStrategy: sorted[sorted.length - 1] || null,
            newStrategiesThisCycle: Array.from(this.strategies.values())
                .filter(s => s.createdAt === this.currentCycle).length,
            deadStrategiesThisCycle: Array.from(this.strategies.values())
                .filter(s => s.deathCount > 0 && s.lastActiveAt < this.currentCycle - 1).length
        };
    }

    /**
     * Obtém estratégia por ID
     */
    getStrategy(id: string): StrategyGene | undefined {
        return this.strategies.get(id);
    }

    /**
     * Obtém todas as estratégias ativas
     */
    getActiveStrategies(): StrategyGene[] {
        return Array.from(this.strategies.values())
            .filter(s => s.isActive)
            .sort((a, b) => b.fitness - a.fitness);
    }

    /**
     * Obtém contagem de ativas
     */
    getActiveCount(): number {
        return Array.from(this.strategies.values()).filter(s => s.isActive).length;
    }

    /**
     * Obtém ranking de estratégias
     */
    getRanking(limit: number = 10): StrategyGene[] {
        return this.getActiveStrategies().slice(0, limit);
    }

    /**
     * Obtém ciclo atual
     */
    getCurrentCycle(): number {
        return this.currentCycle;
    }
}

// Singleton instance
export const strategyArena = new StrategyArena();
