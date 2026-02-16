import { logger } from '@/utils/logger';
import { StrategyParams } from '@/trading/strategies/BaseStrategy';
import { strategyModel } from '@/database/models/Strategy';
import { strategyEngine } from './StrategyEngineService';

interface EvolutionResult {
  success: boolean;
  newParams?: StrategyParams;
  performance?: {
    profitLoss: number;
    winRate: number;
    trades: number;
  };
  error?: string;
}

export class StrategyEvolutionService {
  private static readonly EVOLUTION_ITERATIONS = 10;
  private static readonly PERFORMANCE_THRESHOLD = 0.02; // 2% improvement required
  
  /**
   * Evolui os parâmetros de uma estratégia baseado no seu desempenho histórico
   */
  async evolveStrategy(
    userId: number,
    strategyId: number,
    timeframe: string = '7d'
  ): Promise<EvolutionResult> {
    try {
      // Verificar se a estratégia existe e pertence ao usuário
      const strategy = await strategyModel.findById(strategyId);
      if (!strategy || strategy.user_id !== userId) {
        return {
          success: false,
          error: 'Estratégia não encontrada'
        };
      }

      // Não permitir evolução de estratégias ativas
      if (strategy.is_active) {
        return {
          success: false,
          error: 'Não é possível evoluir uma estratégia ativa. Desative primeiro.'
        };
      }

      const currentParams = strategyModel.toStrategyParams(strategy);
      let bestParams = currentParams;
      let bestPerformance = await this.evaluateParameters(strategyId, currentParams, timeframe);

      logger.info('Iniciando evolução de estratégia', {
        userId,
        strategyId,
        timeframe,
        initialPerformance: bestPerformance
      });

      // Realizar iterações de evolução
      for (let i = 0; i < StrategyEvolutionService.EVOLUTION_ITERATIONS; i++) {
        const mutatedParams = this.mutateParameters(currentParams);
        const performance = await this.evaluateParameters(strategyId, mutatedParams, timeframe);

        if (performance.profitLoss > bestPerformance.profitLoss * (1 + StrategyEvolutionService.PERFORMANCE_THRESHOLD)) {
          bestParams = mutatedParams;
          bestPerformance = performance;

          logger.info('Encontrada melhor configuração', {
            iteration: i,
            performance: bestPerformance
          });
        }
      }

      // Se encontrou melhores parâmetros, atualizar a estratégia
      if (bestParams !== currentParams) {
        const updates = strategyModel.fromStrategyParams(
          userId,
          strategy.name,
          bestParams,
          strategy.description
        );

        await strategyModel.update(strategyId, updates);

        logger.info('Estratégia evoluída com sucesso', {
          userId,
          strategyId,
          improvement: (bestPerformance.profitLoss - bestPerformance.profitLoss) / bestPerformance.profitLoss
        });

        return {
          success: true,
          newParams: bestParams,
          performance: bestPerformance
        };
      }

      return {
        success: true,
        newParams: currentParams,
        performance: bestPerformance
      };

    } catch (error) {
      logger.error('Erro ao evoluir estratégia:', error);
      return {
        success: false,
        error: 'Falha ao evoluir estratégia'
      };
    }
  }

  /**
   * Avalia o desempenho de um conjunto de parâmetros
   */
  private async evaluateParameters(
    strategyId: number,
    params: StrategyParams,
    timeframe: string
  ): Promise<{
    profitLoss: number;
    winRate: number;
    trades: number;
  }> {
    // Simular backtest com os parâmetros
    const results = await strategyEngine.backtest(strategyId, params, timeframe);
    
    return {
      profitLoss: results.totalProfitLoss,
      winRate: results.winRate,
      trades: results.totalTrades
    };
  }

  /**
   * Gera uma variação dos parâmetros atuais
   */
  private mutateParameters(params: StrategyParams): StrategyParams {
    const mutated = { ...params };

    // Mutar parâmetros de risco
    if (mutated.riskParams) {
      mutated.riskParams = {
        ...mutated.riskParams,
        positionSizeUsd: this.mutateValue(mutated.riskParams.positionSizeUsd, 0.1),
        takeProfitPercent: this.mutateValue(mutated.riskParams.takeProfitPercent, 0.2),
        stopLossPercent: this.mutateValue(mutated.riskParams.stopLossPercent, 0.2)
      };
    }

    // Mutar parâmetros de indicadores
    if (mutated.indicatorParams) {
      Object.keys(mutated.indicatorParams).forEach(indicator => {
        const params = mutated.indicatorParams[indicator];
        if (typeof params === 'object') {
          Object.keys(params).forEach(param => {
            if (typeof params[param] === 'number') {
              params[param] = this.mutateValue(params[param], 0.15);
            }
          });
        }
      });
    }

    return mutated;
  }

  /**
   * Aplica uma mutação aleatória a um valor numérico
   */
  private mutateValue(value: number, maxChange: number): number {
    const change = (Math.random() * 2 - 1) * maxChange;
    return value * (1 + change);
  }
}

export const strategyEvolutionService = new StrategyEvolutionService();
