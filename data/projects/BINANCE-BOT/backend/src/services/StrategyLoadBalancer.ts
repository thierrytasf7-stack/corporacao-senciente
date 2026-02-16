import { logger } from '../utils/logger';

export interface Strategy {
  id: string;
  name: string;
  priority: number;
  maxConcurrentTrades: number;
  currentTrades: number;
  enabled: boolean;
  symbols: string[];
  config: Record<string, any>;
}

export interface StrategyAllocation {
  strategyId: string;
  symbol: string;
  weight: number;
}

export class StrategyLoadBalancer {
  private strategies: Map<string, Strategy>;
  private allocations: StrategyAllocation[];
  private maxGlobalTrades: number;

  constructor(maxGlobalTrades: number = 50) {
    this.strategies = new Map();
    this.allocations = [];
    this.maxGlobalTrades = maxGlobalTrades;
  }

  /**
   * Adiciona ou atualiza uma estratégia
   */
  registerStrategy(strategy: Strategy): void {
    this.strategies.set(strategy.id, strategy);
    this.rebalanceAllocations();
    
    logger.info('Strategy registered:', {
      strategyId: strategy.id,
      name: strategy.name,
      priority: strategy.priority
    });
  }

  /**
   * Remove uma estratégia
   */
  unregisterStrategy(strategyId: string): void {
    this.strategies.delete(strategyId);
    this.rebalanceAllocations();
    
    logger.info('Strategy unregistered:', { strategyId });
  }

  /**
   * Atualiza o estado de uma estratégia
   */
  updateStrategyStatus(strategyId: string, enabled: boolean): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = enabled;
      this.rebalanceAllocations();
      
      logger.info('Strategy status updated:', {
        strategyId,
        enabled
      });
    }
  }

  /**
   * Obtém todas as estratégias registadas
   */
  getStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Obtém as alocações atuais
   */
  getAllocations(): StrategyAllocation[] {
    return this.allocations;
  }

  /**
   * Verifica se uma estratégia pode iniciar uma nova trade
   */
  canStartNewTrade(strategyId: string, symbol: string): boolean {
    const strategy = this.strategies.get(strategyId);
    if (!strategy || !strategy.enabled) return false;

    const totalTrades = Array.from(this.strategies.values())
      .reduce((sum, s) => sum + s.currentTrades, 0);

    return (
      strategy.currentTrades < strategy.maxConcurrentTrades &&
      totalTrades < this.maxGlobalTrades &&
      strategy.symbols.includes(symbol)
    );
  }

  /**
   * Incrementa o contador de trades ativas para uma estratégia
   */
  incrementTrades(strategyId: string): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.currentTrades++;
      this.rebalanceAllocations();
      
      logger.debug('Strategy trades incremented:', {
        strategyId,
        currentTrades: strategy.currentTrades
      });
    }
  }

  /**
   * Decrementa o contador de trades ativas para uma estratégia
   */
  decrementTrades(strategyId: string): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy && strategy.currentTrades > 0) {
      strategy.currentTrades--;
      this.rebalanceAllocations();
      
      logger.debug('Strategy trades decremented:', {
        strategyId,
        currentTrades: strategy.currentTrades
      });
    }
  }

  /**
   * Rebalanceia as alocações com base nas prioridades e estado atual
   */
  private rebalanceAllocations(): void {
    this.allocations = [];
    
    const enabledStrategies = Array.from(this.strategies.values())
      .filter(s => s.enabled);

    if (enabledStrategies.length === 0) return;

    const totalPriority = enabledStrategies
      .reduce((sum, s) => sum + s.priority, 0);

    // Calcula pesos baseados na prioridade
    for (const strategy of enabledStrategies) {
      const baseWeight = strategy.priority / totalPriority;
      
      // Ajusta peso baseado em trades ativas vs máximo permitido
      const utilizationFactor = 1 - (strategy.currentTrades / strategy.maxConcurrentTrades);
      const adjustedWeight = baseWeight * utilizationFactor;

      // Cria alocações para cada símbolo da estratégia
      for (const symbol of strategy.symbols) {
        this.allocations.push({
          strategyId: strategy.id,
          symbol,
          weight: adjustedWeight
        });
      }
    }

    logger.info('Strategy allocations rebalanced:', {
      totalStrategies: enabledStrategies.length,
      totalAllocations: this.allocations.length
    });
  }
}
