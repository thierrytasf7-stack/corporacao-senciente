import { BacktestConfig, BacktestResult, BacktestBet, BacktestResultMetrics } from '../types/backtesting-types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface HistoricalMatch {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  odds: {
    homeWin: number;
    draw?: number;
    awayWin: number;
    timestamp: Date;
  }[];
  result: {
    homeScore: number;
    awayScore: number;
    outcome: 'home' | 'draw' | 'away';
  };
}

export class BacktestingService {
  private backtestDataPath: string;
  private historicalDataPath: string;

  constructor(backtestDataPath: string = path.join(__dirname, '../data/backtests')) {
    this.backtestDataPath = backtestDataPath;
    this.historicalDataPath = path.join(__dirname, '../data/historical/historical-matches.json');

    if (!fs.existsSync(backtestDataPath)) {
      fs.mkdirSync(backtestDataPath, { recursive: true });
    }
  }

  /**
   * Executa backtest de estratégia usando dados históricos reais
   */
  async runBacktest(strategyId: string, config: BacktestConfig): Promise<BacktestResult> {
    try {
      const backtestId = uuidv4();

      // Carrega dados históricos do JSON
      const historicalData = this.loadHistoricalData();

      // Filtra dados por date range
      const startDate = new Date(config.dateRange.start);
      const endDate = new Date(config.dateRange.end);

      const filteredMatches = historicalData.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= startDate && matchDate <= endDate;
      });

      if (filteredMatches.length === 0) {
        throw new Error('Nenhum dado histórico encontrado para o período especificado');
      }

      // Inicializa bankroll
      let currentBankroll = config.initialBankroll;
      const bets: BacktestBet[] = [];
      const equityCurve: Array<{ date: string; equity: number }> = [];

      let wins = 0;
      let losses = 0;
      let totalStaked = 0;
      let totalProfit = 0;
      let maxEquity = currentBankroll;
      let maxDrawdown = 0;
      let totalOdds = 0;

      // Simula apostas usando estratégia simples
      for (const match of filteredMatches) {
        // Estratégia: aposta sempre no favorito (menor odd) se odds >= 1.5
        const latestOdds = match.odds[match.odds.length - 1];
        const { homeWin, awayWin } = latestOdds;

        let betOutcome: 'home' | 'away';
        let betOdds: number;

        if (homeWin < awayWin && homeWin >= 1.5) {
          betOutcome = 'home';
          betOdds = homeWin;
        } else if (awayWin < homeWin && awayWin >= 1.5) {
          betOutcome = 'away';
          betOdds = awayWin;
        } else {
          continue; // Skip match sem favorito claro
        }

        // Calcula stake baseado na estratégia
        const stake = this.calculateStake(config.stakingStrategy, currentBankroll, config.initialBankroll);

        if (stake > currentBankroll) {
          continue; // Sem bankroll suficiente
        }

        totalStaked += stake;
        totalOdds += betOdds;

        // Determina resultado da aposta
        const actualResult = match.result.outcome;
        const betWon = actualResult === betOutcome;

        let profit: number;
        let betResult: 'win' | 'loss' | 'void';

        if (betWon) {
          profit = stake * (betOdds - 1);
          currentBankroll += profit;
          wins++;
          betResult = 'win';
        } else {
          profit = -stake;
          currentBankroll -= stake;
          losses++;
          betResult = 'loss';
        }

        totalProfit += profit;

        // Registra bet
        bets.push({
          id: uuidv4(),
          strategyId,
          timestamp: new Date(match.date),
          market: 'Match Winner',
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          bookmaker: 'Historical',
          odds: betOdds,
          stake,
          profit,
          result: betResult,
          status: 'SETTLED'
        });

        // Atualiza equity curve
        equityCurve.push({
          date: new Date(match.date).toISOString(),
          equity: currentBankroll
        });

        // Calcula drawdown
        if (currentBankroll > maxEquity) {
          maxEquity = currentBankroll;
        }

        const drawdown = (maxEquity - currentBankroll) / maxEquity;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }

      // Calcula métricas
      const totalBets = wins + losses;
      const winRate = totalBets > 0 ? wins / totalBets : 0;
      const roi = totalStaked > 0 ? totalProfit / totalStaked : 0;
      const avgOdds = totalBets > 0 ? totalOdds / totalBets : 0;

      // Calcula Sharpe Ratio (simplificado)
      const returns = bets.map(bet => bet.profit / bet.stake);
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0;
      const stdDev = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
      );
      const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

      const result: BacktestResult = {
        id: backtestId,
        strategyId,
        config,
        metrics: {
          winRate,
          roi,
          totalProfit,
          sharpeRatio,
          maxDrawdown,
          avgOdds,
          betCount: totalBets
        },
        bets,
        equityCurve,
        createdAt: new Date()
      };

      // Salva resultado
      this.saveResult(result);

      return result;
    } catch (error) {
      throw new Error(`Erro ao executar backtest: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Retorna resultado de backtest pelo ID
   */
  getResults(backtestId: string): BacktestResult | null {
    try {
      const filePath = path.join(this.backtestDataPath, `${backtestId}.json`);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao ler resultado:', error);
      return null;
    }
  }

  /**
   * Compara múltiplas estratégias
   */
  compareStrategies(backtestIds: string[]): Map<string, BacktestResultMetrics> {
    const comparison = new Map<string, BacktestResultMetrics>();

    for (const id of backtestIds) {
      const result = this.getResults(id);
      if (result) {
        comparison.set(id, result.metrics);
      }
    }

    return comparison;
  }

  /**
   * Calcula stake baseado na estratégia
   */
  private calculateStake(strategy: 'fixed' | 'percentage' | 'kelly', currentBankroll: number, initialBankroll: number): number {
    switch (strategy) {
      case 'fixed':
        return initialBankroll * 0.02; // 2% do bankroll inicial
      case 'percentage':
        return currentBankroll * 0.02; // 2% do bankroll atual
      case 'kelly':
        // Kelly simplificado: 1% do bankroll atual (conservative)
        return currentBankroll * 0.01;
      default:
        return initialBankroll * 0.02;
    }
  }

  /**
   * Carrega dados históricos do JSON
   */
  private loadHistoricalData(): HistoricalMatch[] {
    try {
      const data = fs.readFileSync(this.historicalDataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar dados históricos:', error);
      return [];
    }
  }

  /**
   * Salva resultado do backtest
   */
  private saveResult(result: BacktestResult): void {
    try {
      const filePath = path.join(this.backtestDataPath, `${result.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
    }
  }
}
