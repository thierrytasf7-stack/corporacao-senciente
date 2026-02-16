import { StrategyEvolutionService } from '@/services/StrategyEvolutionService';
import { strategyModel } from '@/database/models/Strategy';
import { strategyEngine } from '@/services/StrategyEngineService';

jest.mock('@/database/models/Strategy');
jest.mock('@/services/StrategyEngineService');

describe('StrategyEvolutionService', () => {
  let service: StrategyEvolutionService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    service = new StrategyEvolutionService();
  });

  describe('evolveStrategy', () => {
    const mockStrategy = {
      id: 1,
      user_id: 123,
      name: 'Test Strategy',
      symbol: 'BTCUSDT',
      interval: '1h',
      is_active: false,
      params: {
        riskParams: {
          positionSizeUsd: 100,
          takeProfitPercent: 2,
          stopLossPercent: 1
        }
      }
    };

    const mockBacktestResults = {
      totalProfitLoss: 150,
      winRate: 0.65,
      totalTrades: 50
    };

    it('deve retornar erro se a estratégia não existir', async () => {
      (strategyModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await service.evolveStrategy(123, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Estratégia não encontrada');
    });

    it('deve retornar erro se a estratégia estiver ativa', async () => {
      (strategyModel.findById as jest.Mock).mockResolvedValue({
        ...mockStrategy,
        is_active: true
      });

      const result = await service.evolveStrategy(123, 1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não é possível evoluir uma estratégia ativa. Desative primeiro.');
    });

    it('deve evoluir a estratégia com sucesso', async () => {
      (strategyModel.findById as jest.Mock).mockResolvedValue(mockStrategy);
      (strategyEngine.backtest as jest.Mock).mockResolvedValue(mockBacktestResults);
      (strategyModel.update as jest.Mock).mockResolvedValue({ ...mockStrategy });

      const result = await service.evolveStrategy(123, 1);

      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
      expect(strategyModel.update).toHaveBeenCalled();
    });
  });
});
