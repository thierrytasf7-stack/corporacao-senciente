import { StrategyLoadBalancer, Strategy } from '../services/StrategyLoadBalancer';

describe('StrategyLoadBalancer', () => {
  let loadBalancer: StrategyLoadBalancer;
  
  const mockStrategy1: Strategy = {
    id: 'strategy1',
    name: 'Test Strategy 1',
    priority: 2,
    maxConcurrentTrades: 5,
    currentTrades: 0,
    enabled: true,
    symbols: ['BTCUSDT', 'ETHUSDT'],
    config: {}
  };

  const mockStrategy2: Strategy = {
    id: 'strategy2',
    name: 'Test Strategy 2',
    priority: 1,
    maxConcurrentTrades: 3,
    currentTrades: 0,
    enabled: true,
    symbols: ['BTCUSDT'],
    config: {}
  };

  beforeEach(() => {
    loadBalancer = new StrategyLoadBalancer(10);
  });

  describe('Strategy Registration', () => {
    it('should register strategies correctly', () => {
      loadBalancer.registerStrategy(mockStrategy1);
      loadBalancer.registerStrategy(mockStrategy2);

      const strategies = loadBalancer.getStrategies();
      expect(strategies).toHaveLength(2);
      expect(strategies).toContainEqual(mockStrategy1);
      expect(strategies).toContainEqual(mockStrategy2);
    });

    it('should update existing strategy', () => {
      loadBalancer.registerStrategy(mockStrategy1);
      
      const updatedStrategy = { ...mockStrategy1, priority: 3 };
      loadBalancer.registerStrategy(updatedStrategy);

      const strategies = loadBalancer.getStrategies();
      expect(strategies).toHaveLength(1);
      expect(strategies[0].priority).toBe(3);
    });
  });

  describe('Trade Management', () => {
    beforeEach(() => {
      loadBalancer.registerStrategy(mockStrategy1);
      loadBalancer.registerStrategy(mockStrategy2);
    });

    it('should allow new trades within limits', () => {
      expect(loadBalancer.canStartNewTrade('strategy1', 'BTCUSDT')).toBe(true);
      
      loadBalancer.incrementTrades('strategy1');
      expect(loadBalancer.canStartNewTrade('strategy1', 'BTCUSDT')).toBe(true);
    });

    it('should respect strategy trade limits', () => {
      // Fill up strategy1's trade limit
      for (let i = 0; i < mockStrategy1.maxConcurrentTrades; i++) {
        loadBalancer.incrementTrades('strategy1');
      }

      expect(loadBalancer.canStartNewTrade('strategy1', 'BTCUSDT')).toBe(false);
    });

    it('should respect global trade limits', () => {
      const loadBalancer = new StrategyLoadBalancer(3);
      loadBalancer.registerStrategy(mockStrategy1);
      loadBalancer.registerStrategy(mockStrategy2);

      loadBalancer.incrementTrades('strategy1');
      loadBalancer.incrementTrades('strategy1');
      loadBalancer.incrementTrades('strategy2');

      expect(loadBalancer.canStartNewTrade('strategy1', 'BTCUSDT')).toBe(false);
      expect(loadBalancer.canStartNewTrade('strategy2', 'BTCUSDT')).toBe(false);
    });
  });

  describe('Allocations', () => {
    it('should calculate correct allocation weights', () => {
      loadBalancer.registerStrategy(mockStrategy1);
      loadBalancer.registerStrategy(mockStrategy2);

      const allocations = loadBalancer.getAllocations();
      
      // Strategy1 tem prioridade 2 e 2 símbolos
      // Strategy2 tem prioridade 1 e 1 símbolo
      expect(allocations).toHaveLength(3); // 2 de strategy1 + 1 de strategy2
      
      const strategy1Allocations = allocations.filter(a => a.strategyId === 'strategy1');
      const strategy2Allocations = allocations.filter(a => a.strategyId === 'strategy2');

      expect(strategy1Allocations).toHaveLength(2);
      expect(strategy2Allocations).toHaveLength(1);
    });

    it('should adjust weights based on current trades', () => {
      loadBalancer.registerStrategy(mockStrategy1);
      loadBalancer.registerStrategy(mockStrategy2);

      const initialAllocations = loadBalancer.getAllocations();
      const initialWeight1 = initialAllocations.find(
        a => a.strategyId === 'strategy1' && a.symbol === 'BTCUSDT'
      )?.weight;

      loadBalancer.incrementTrades('strategy1');
      
      const updatedAllocations = loadBalancer.getAllocations();
      const updatedWeight1 = updatedAllocations.find(
        a => a.strategyId === 'strategy1' && a.symbol === 'BTCUSDT'
      )?.weight;

      expect(updatedWeight1).toBeLessThan(initialWeight1!);
    });
  });
});
