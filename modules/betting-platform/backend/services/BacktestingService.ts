import { HistoricalDataLoader } from './HistoricalDataLoader';
import { StrategyService } from './StrategyService';
import { AnalyticsService } from './AnalyticsService';
import { BacktestConfig, BacktestResult, BacktestBet, BacktestResultMetrics } from '../types/backtesting-types';
import { HistoricalOdds, MatchResult } from './HistoricalDataLoader';
import { Strategy, StrategyResult } from '../types/strategy-types';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class BacktestingService {
  private historicalDataLoader: HistoricalDataLoader;
  private strategyService: StrategyService;
  private analyticsService: AnalyticsService;
  private backtestDataPath: string;

  constructor(
    historicalDataLoader: HistoricalDataLoader,
    strategyService: StrategyService,
    analyticsService: AnalyticsService,
    backtestDataPath: string = 'modules/betting-platform/backend/data/backtests'
  ) {
    this.historicalDataLoader = historicalDataLoader;
    this.strategyService = strategyService;
    this.analyticsService = analyticsService;
    this.backtestDataPath = backtestDataPath;
    
    if (!existsSync(backtestDataPath)) {
      mkdirSync(backtestDataPath, { recursive: true });
    }
  }

  /**
   * Executa backtest de estratégia
   */
  async runBacktest(strategy: Strategy, config: BacktestConfig): Promise<BacktestResult> {
    try {
      const backtestId = uuidv4();
      const startDate = DateTime.fromISO(config.dateRange.start).toJSDate();
      const endDate = DateTime.fromISO(config.dateRange.end).toJSDate();
      
      // Carrega dados históricos
      const historicalData = await this.historicalDataLoader.getHistoricalOdds(
        config.filters.sports,
        config.filters.leagues,
        config.filters.minOdds,
        config.filters.maxOdds,
        startDate,
        endDate
      );

      if (historicalData.length === 0) {
        throw new Error('Nenhum dado histórico encontrado para os filtros especificados');
      }

      // Inicializa bankroll
      let bankroll = {
        available: config.initialBankroll,
        total: config.initialBankroll,
        bets: []
      };

      const bets: BacktestBet[] = [];
      const equityCurve: Array<{ date: string; equity: number }> = [];
      let maxEquity = config.initialBankroll;
      let maxDrawdown = 0;

      // Processa cada evento histórico
      for (const event of historicalData) {
        const result = await this.strategyService.executeStrategy(strategy, bankroll, event);
        
        if (result) {
          const stake = this.calculateStake(
            config.stakingStrategy,
            bankroll.available,
            result.recommendedStake,
            event.odds
          );

          if (stake > 0 && stake <= bankroll.available) {
            const bet: BacktestBet = {
              id: uuidv4(),
              strategyId: strategy.id,
              strategyType: result.strategyType,
              event: {
                sport: event.sport,
                market: event.market,
                homeTeam: event.homeTeam,
                awayTeam: event.awayTeam,
                matchDate: event.matchDate,
                bookmaker: event.bookmaker,
                odds: event.odds
              },
              stake,
              odds: event.odds,
              timestamp: new Date(),
              status: 'OPEN'
            };

            // Verifica resultado do evento
            const matchResult = await this.historicalDataLoader.getMatchResult(
              event.sport,
              event.homeTeam,
              event.awayTeam,
              event.matchDate
            );

            if (matchResult) {
              const profit = this.calculateProfit(bet, matchResult);
              bet.profit = profit;
              bet.status = profit > 0 ? 'WON' : 'LOST';
              bet.settlementDate = matchResult.matchDate;
              
              bankroll.available += profit;
              bankroll.total = bankroll.available;
              bankroll.bets.push(bet);
              
              bets.push(bet);
            }

            // Atualiza equity curve e drawdown
            const currentEquity = bankroll.available;
            equityCurve.push({
              date: event.matchDate.toISOString(),
              equity: currentEquity
            });

            maxEquity = Math.max(maxEquity, currentEquity);
            maxDrawdown = Math.max(maxDrawdown, maxEquity - currentEquity);
          }
        }
      }

      // Calcula métricas
      const metrics = this.calculateMetrics(bets, equityCurve, maxDrawdown, config.initialBankroll);

      const result: BacktestResult = {
        id: backtestId,
        strategyId: strategy.id,
        config,
        metrics,
        bets,
        equityCurve,
        createdAt: new Date()
      };

      // Salva resultado
      this.saveBacktestResult(result);

      return result;
    } catch (error) {
      throw new Error(`Erro ao executar backtest: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Retorna resultados de backtest
   */
  getResults(backtestId: string): BacktestResult | null {
    try {
      const filePath = join(this.backtestDataPath, `${backtestId}.json`);
      
      if (!existsSync(filePath)) {
        return null;
      }

      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erro ao carregar resultados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Compara múltiplas estratégias
   */
  compareStrategies(strategyIds: string[]): Map<string, BacktestResultMetrics> {
    const results = new Map<string, BacktestResultMetrics>();
    
    for (const strategyId of strategyIds) {
      const backtestFiles = this.getBacktestFilesForStrategy(strategyId);
      
      if (backtestFiles.length > 0) {
        const aggregatedMetrics = this.aggregateMetrics(backtestFiles);
        results.set(strategyId, aggregatedMetrics);
      }
    }
    
    return results;
  }

  /**
   * Calcula stake baseado na estratégia
   */
  private calculateStake(
    strategy: 'fixed' | 'percentage' | 'kelly',
    availableBankroll: number,
    recommendedStake: number,
    odds: Record<string, number>
  ): number {
    switch (strategy) {
      case 'fixed':
        return recommendedStake;
      case 'percentage':
        return availableBankroll * (recommendedStake / 100);
      case 'kelly':
        const decimalOdds = Object.values(odds)[0];
        const probability = 1 / decimalOdds;
        return availableBankroll * ((decimalOdds * probability - 1) / (decimalOdds - 1));
      default:
        return recommendedStake;
    }
  }

  /**
   * Calcula lucro/prejuízo de uma aposta
   */
  private calculateProfit(bet: BacktestBet, matchResult: MatchResult): number {
    const odds = bet.odds['1'] || bet.odds['X'] || bet.odds['2'];
    const stake = bet.stake;

    if (!matchResult.winner) {
      return -stake; // Aposta perdida
    }

    let isWinner = false;
    switch (bet.event.market) {
      case 'MATCH_WINNER':
        if (matchResult.winner === 'home' && bet.odds['1']) isWinner = true;
        if (matchResult.winner === 'away' && bet.odds['2']) isWinner = true;
        if (matchResult.winner === 'draw' && bet.odds['X']) isWinner = true;
        break;
      case 'OVER_UNDER':
        // Lógica para over/under baseada em placar
        const totalGoals = (matchResult.homeScore || 0) + (matchResult.awayScore || 0);
        const threshold = parseFloat(Object.keys(bet.odds)[0].split('_')[1]);
        const isOver = totalGoals > threshold;
        isWinner = (isOver && bet.odds[`over_${threshold}`]) || 
                   (!isOver && bet.odds[`under_${threshold}`]);
        break;
      default:
        return -stake;
    }

    return isWinner ? stake * odds - stake : -stake;
  }

  /**
   * Calcula métricas do backtest
   */
  private calculateMetrics(
    bets: BacktestBet[],
    equityCurve: Array<{ date: string; equity: number }>,
    maxDrawdown: number,
    initialBankroll: number
  ): BacktestResultMetrics {
    const winningBets = bets.filter(bet => bet.profit > 0);
    const totalProfit = bets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const avgOdds = bets.length > 0 ? bets.reduce((sum, bet) => sum + (bet.odds['1'] || bet.odds['X'] || bet.odds['2'] || 0), 0) / bets.length : 0;

    const winRate = bets.length > 0 ? winningBets.length / bets.length : 0;
    const roi = totalStake > 0 ? totalProfit / totalStake : 0;
    const sharpeRatio = this.calculateSharpeRatio(equityCurve, initialBankroll);

    return {
      winRate: parseFloat(winRate.toFixed(4)),
      roi: parseFloat(roi.toFixed(4)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(4)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      avgOdds: parseFloat(avgOdds.toFixed(2)),
      betCount: bets.length
    };
  }

  /**
   * Calcula Sharpe Ratio
   */
  private calculateSharpeRatio(
    equityCurve: Array<{ date: string; equity: number }>,
    initialBankroll: number
  ): number {
    if (equityCurve.length < 2) return 0;

    const returns = equityCurve.map((point, index) => {
      if (index === 0) return 0;
      return (point.equity - equityCurve[index - 1].equity) / equityCurve[index - 1].equity;
    }).slice(1);

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);

    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  /**
   * Salva resultado do backtest
   */
  private saveBacktestResult(result: BacktestResult): void {
    const filePath = join(this.backtestDataPath, `${result.id}.json`);
    writeFileSync(filePath, JSON.stringify(result, null, 2));
  }

  /**
   * Obtém arquivos de backtest para uma estratégia
   */
  private getBacktestFilesForStrategy(strategyId: string): string[] {
    const files = [];
    const dir = join(this.backtestDataPath);
    
    if (existsSync(dir)) {
      const fileNames = readFileSync(dir).filter(file => 
        file.startsWith(strategyId) && file.endsWith('.json')
      );
      files.push(...fileNames);
    }
    
    return files;
  }

  /**
   * Agrega métricas de múltiplos backtests
   */
  private aggregateMetrics(files: string[]): BacktestResultMetrics {
    const allBets: BacktestBet[] = [];
    let totalInitialBankroll = 0;
    let totalFinalEquity = 0;

    for (const file of files) {
      const filePath = join(this.backtestDataPath, file);
      const result = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      allBets.push(...result.bets);
      totalInitialBankroll += result.config.initialBankroll;
      totalFinalEquity += result.equityCurve.length > 0 ? result.equityCurve[result.equityCurve.length - 1].equity : 0;
    }

    const avgInitialBankroll = totalInitialBankroll / files.length;
    const avgFinalEquity = totalFinalEquity / files.length;
    const avgReturn = (avgFinalEquity - avgInitialBankroll) / avgInitialBankroll;

    // Calcula métricas agregadas
    const winningBets = allBets.filter(bet => bet.profit > 0);
    const totalProfit = allBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    const totalStake = allBets.reduce((sum, bet) => sum + bet.stake, 0);
    const winRate = allBets.length > 0 ? winningBets.length / allBets.length : 0;
    const roi = totalStake > 0 ? totalProfit / totalStake : 0;

    return {
      winRate: parseFloat(winRate.toFixed(4)),
      roi: parseFloat(roi.toFixed(4)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      sharpeRatio: 0, // TODO: Implementar Sharpe ratio agregado
      maxDrawdown: 0, // TODO: Implementar max drawdown agregado
      avgOdds: 0, // TODO: Implementar avg odds agregado
      betCount: allBets.length
    };
  }
}