/**
 * Backtest Engine: Tennis Favorite 30-0 Comeback
 * 
 * Implementação completa do backtest para validação da estratégia
 * 
 * @version 1.0.0
 * @author Strategy-Sports Squad
 * @status Ready for Execution
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// =============================================================================
// TYPES E INTERFACES
// =============================================================================

interface MatchData {
  matchId: string;
  date: string;
  tournament: string;
  surface: 'Clay' | 'Grass' | 'Hard' | 'Carpet';
  round: string;
  player1: PlayerInfo;
  player2: PlayerInfo;
  preMatchOdds: { player1: number; player2: number };
  sets: SetScore[];
  games: GameData[];
  status: 'completed' | 'walkover' | 'retired' | 'stopped';
}

interface PlayerInfo {
  name: string;
  ranking?: number;
}

interface SetScore {
  setNumber: number;
  player1Games: number;
  player2Games: number;
  player1Tiebreak?: number;
  player2Tiebreak?: number;
}

interface GameData {
  gameId: string;
  setNumber: number;
  gameNumber: number;
  server: 'player1' | 'player2';
  points: { player1: number; player2: number };
  winner: 'player1' | 'player2';
  liveOdds?: { player1: number; player2: number };
  timestamp?: string;
  interrupted: boolean;
}

interface BacktestConfig {
  backtest: {
    name: string;
    version: string;
    strategy: string;
    configVersion: string;
  };
  period: {
    start: string;
    end: string;
    timezone: string;
  };
  data: {
    source: string;
    tournaments: { include: string[] };
    surfaces: { include: string[] };
  };
  strategy: {
    trigger: { type: string };
    window: { seconds: number };
    entryConditions: {
      favoriteDefinition: string;
      serverMustBeFavorite: boolean;
      gameScore: { favoritePoints: number; opponentPoints: number };
    };
    oddsValidation: {
      enabled: boolean;
      min: number;
      max: number;
    };
    exclusionRules: Array<{ name: string; condition: string; action: string }>;
  };
  management: {
    staking: { method: string; value: number };
    bankroll: { initial: number };
    limits: {
      daily: { maxBets: number | null; maxLoss: number | null };
      perMatch: { maxBets: number | null };
      stopLoss: { daily: number | null; weekly: number | null };
    };
  };
  filters: {
    excludeInterrupted: boolean;
    excludeWalkover: boolean;
    excludeRetired: boolean;
  };
  validation: {
    significanceLevel: number;
    minBets: number;
    targets: {
      roi: number;
      winRate: number;
      profitFactor: number;
      maxDrawdown: number;
      sharpeRatio: number;
    };
  };
  analysis: {
    groupBy: string[];
    oddsRanges: Array<{ label: string; min: number; max: number }>;
  };
  output: {
    directory: string;
    formats: string[];
    detailed: boolean;
  };
}

interface BetExecution {
  matchId: string;
  gameId: string;
  timestamp: string;
  selection: 'player1' | 'player2';
  odd: number;
  stake: number;
  market: 'Game Winner';
  tournament: string;
  surface: string;
  setNumber: number;
  oddsRange: string;
}

interface BetResult extends BetExecution {
  result: 'WIN' | 'LOSS';
  profit: number;
  bankrollAfter: number;
}

interface BacktestMetrics {
  // Estratégia
  totalMatches: number;
  totalGames: number;
  triggerCount: number;
  entryCount: number;
  placedBets: number;
  
  // Gestão
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  roi: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalBankroll: number;
  
  // Sequências
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
}

interface MonthlyResult {
  month: string;
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}

interface SurfaceResult {
  surface: string;
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}

interface OddsRangeResult {
  range: string;
  bets: number;
  wins: number;
  losses: number;
  winRate: number;
  profit: number;
  roi: number;
}

interface StatisticalValidation {
  isStatisticallySignificant: boolean;
  confidenceLevel: number;
  pValue: number;
  zScore: number;
  sampleSize: number;
  baselineComparison: {
    strategyROI: number;
    baselineROI: number;
    outperformance: number;
  };
}

interface BacktestResult {
  strategy: {
    totalMatches: number;
    totalGames: number;
    triggerCount: number;
    entryCount: number;
    placedBets: number;
  };
  management: BacktestMetrics;
  analysis: {
    byMonth: MonthlyResult[];
    bySurface: SurfaceResult[];
    byOddsRange: OddsRangeResult[];
    streaks: {
      longestWinStreak: number;
      longestLossStreak: number;
      currentStreak: number;
    };
  };
  validation: StatisticalValidation;
  recommendation: {
    status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    score: number;
    notes: string[];
    nextSteps: string[];
  };
  bets: BetResult[];
  config: BacktestConfig;
}

// =============================================================================
// BACKTEST ENGINE
// =============================================================================

class BacktestEngine {
  private config: BacktestConfig;
  private matches: MatchData[] = [];
  private bets: BetResult[] = [];
  private triggers: Array<{ match: MatchData; game: GameData }> = [];

  constructor(configPath: string) {
    console.log('🚀 Inicializando Backtest Engine...');
    this.config = this.loadConfig(configPath);
  }

  // ---------------------------------------------------------------------------
  // CARREGAMENTO DE DADOS
  // ---------------------------------------------------------------------------

  private loadConfig(configPath: string): BacktestConfig {
    const content = fs.readFileSync(configPath, 'utf-8');
    return yaml.load(content) as BacktestConfig;
  }

  async loadMatches(matches: MatchData[]): Promise<void> {
    console.log(`📊 Carregando ${matches.length} jogos...`);
    
    const startDate = new Date(this.config.period.start);
    const endDate = new Date(this.config.period.end);
    
    // Filtrar por período
    this.matches = matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate >= startDate && matchDate <= endDate;
    });
    
    // Filtrar por torneios
    const allowedTournaments = this.config.data.tournaments.include;
    this.matches = this.matches.filter(match =>
      allowedTournaments.some(t => match.tournament.includes(t))
    );
    
    // Filtrar por superfícies
    const allowedSurfaces = this.config.data.surfaces.include;
    this.matches = this.matches.filter(match =>
      allowedSurfaces.includes(match.surface)
    );
    
    // Aplicar filtros de status
    if (this.config.filters.excludeWalkover) {
      this.matches = this.matches.filter(m => m.status !== 'walkover');
    }
    if (this.config.filters.excludeRetired) {
      this.matches = this.matches.filter(m => m.status !== 'retired');
    }
    
    console.log(`✅ ${this.matches.length} jogos após filtros`);
  }

  // ---------------------------------------------------------------------------
  // DETECÇÃO DE TRIGGERS
  // ---------------------------------------------------------------------------

  detectTriggers(): void {
    console.log('🎯 Detectando triggers (30-0 exato)...');
    this.triggers = [];
    
    for (const match of this.matches) {
      // Identificar favorito (menor odd inicial)
      const favorite = match.preMatchOdds.player1 < match.preMatchOdds.player2
        ? 'player1'
        : 'player2';
      
      for (const game of match.games) {
        // Verificar se favorito está sacando
        if (game.server !== favorite) continue;
        
        // Verificar se game foi interrompido
        if (this.config.filters.excludeInterrupted && game.interrupted) {
          continue;
        }
        
        // Verificar placar exato 30-0 contra favorito
        const favoritePoints = favorite === 'player1'
          ? game.points.player1
          : game.points.player2;
        
        const opponentPoints = favorite === 'player1'
          ? game.points.player2
          : game.points.player1;
        
        // Exato 30-0 (favorito com 0, oponente com 30)
        if (favoritePoints === 0 && opponentPoints === 30) {
          this.triggers.push({ match, game });
        }
      }
    }
    
    console.log(`✅ ${this.triggers.length} triggers detectados`);
  }

  // ---------------------------------------------------------------------------
  // VALIDAÇÃO DE ODDS E EXECUÇÃO
  // ---------------------------------------------------------------------------

  executeBets(): void {
    console.log('💰 Executando apostas simuladas...');
    this.bets = [];
    
    let bankroll = this.config.management.bankroll.initial;
    const stake = this.config.management.staking.value;
    const minOdds = this.config.strategy.oddsValidation.min;
    const maxOdds = this.config.strategy.oddsValidation.max;
    
    for (const { match, game } of this.triggers) {
      // Identificar favorito
      const favorite = match.preMatchOdds.player1 < match.preMatchOdds.player2
        ? 'player1'
        : 'player2';
      
      // Obter odd live
      const liveOdd = favorite === 'player1'
        ? (game.liveOdds?.player1 || 0)
        : (game.liveOdds?.player2 || 0);
      
      if (!liveOdd || liveOdd <= 0) continue;
      
      // Validar odds
      if (liveOdd < minOdds || liveOdd > maxOdds) continue;
      
      // Determinar faixa de odds
      const oddsRange = this.getOddsRange(liveOdd);
      
      // Criar aposta
      const bet: BetResult = {
        matchId: match.matchId,
        gameId: game.gameId,
        timestamp: game.timestamp || match.date,
        selection: favorite,
        odd: liveOdd,
        stake: stake,
        market: 'Game Winner',
        tournament: match.tournament,
        surface: match.surface,
        setNumber: game.setNumber,
        oddsRange: oddsRange,
        result: 'LOSS', // Será atualizado abaixo
        profit: -stake,
        bankrollAfter: bankroll - stake,
      };
      
      // Determinar resultado
      const won = game.winner === favorite;
      if (won) {
        bet.result = 'WIN';
        bet.profit = stake * (liveOdd - 1);
        bet.bankrollAfter = bankroll + bet.profit;
      }
      
      this.bets.push(bet);
      bankroll = bet.bankrollAfter;
    }
    
    console.log(`✅ ${this.bets.length} apostas executadas`);
  }

  private getOddsRange(odd: number): string {
    const ranges = this.config.analysis.oddsRanges;
    for (const range of ranges) {
      if (odd >= range.min && odd < range.max) {
        return range.label;
      }
    }
    return `${odd.toFixed(2)}`;
  }

  // ---------------------------------------------------------------------------
  // CÁLCULO DE MÉTRICAS
  // ---------------------------------------------------------------------------

  calculateMetrics(): BacktestMetrics {
    console.log('📈 Calculando métricas...');
    
    const totalBets = this.bets.length;
    const wins = this.bets.filter(b => b.result === 'WIN').length;
    const losses = totalBets - wins;
    const winRate = totalBets > 0 ? wins / totalBets : 0;
    
    const totalProfit = this.bets.reduce((sum, b) => sum + b.profit, 0);
    const totalStaked = totalBets * this.config.management.staking.value;
    const roi = totalStaked > 0 ? totalProfit / totalStaked : 0;
    
    const grossProfit = this.bets
      .filter(b => b.profit > 0)
      .reduce((sum, b) => sum + b.profit, 0);
    const grossLoss = Math.abs(
      this.bets
        .filter(b => b.profit < 0)
        .reduce((sum, b) => sum + b.profit, 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
    
    // Calcular drawdown máximo
    const maxDrawdown = this.calculateMaxDrawdown();
    
    // Calcular Sharpe Ratio (simplificado)
    const sharpeRatio = this.calculateSharpeRatio();
    
    // Calcular sequências
    const { longestWinStreak, longestLossStreak, currentStreak } =
      this.calculateStreaks();
    
    const initialBankroll = this.config.management.bankroll.initial;
    const finalBankroll = initialBankroll + totalProfit;
    
    const metrics: BacktestMetrics = {
      totalMatches: this.matches.length,
      totalGames: this.matches.reduce((sum, m) => sum + m.games.length, 0),
      triggerCount: this.triggers.length,
      entryCount: this.bets.length,
      placedBets: this.bets.length,
      wins,
      losses,
      winRate,
      totalProfit,
      roi,
      profitFactor,
      maxDrawdown,
      sharpeRatio,
      finalBankroll,
      longestWinStreak,
      longestLossStreak,
      currentStreak,
    };
    
    this.printMetrics(metrics);
    return metrics;
  }

  private calculateMaxDrawdown(): number {
    if (this.bets.length === 0) return 0;
    
    let peak = this.config.management.bankroll.initial;
    let maxDrawdown = 0;
    let bankroll = this.config.management.bankroll.initial;
    
    for (const bet of this.bets) {
      bankroll += bet.profit;
      if (bankroll > peak) {
        peak = bankroll;
      }
      const drawdown = (peak - bankroll) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  private calculateSharpeRatio(): number {
    if (this.bets.length < 2) return 0;
    
    const returns = this.bets.map(b => b.profit / b.stake);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const riskFreeRate = 0; // Simplificado
    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
  }

  private calculateStreaks(): {
    longestWinStreak: number;
    longestLossStreak: number;
    currentStreak: number;
  } {
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    for (const bet of this.bets) {
      if (bet.result === 'WIN') {
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > longestWinStreak) {
          longestWinStreak = currentWinStreak;
        }
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > longestLossStreak) {
          longestLossStreak = currentLossStreak;
        }
      }
    }
    
    const currentStreak =
      this.bets[this.bets.length - 1]?.result === 'WIN'
        ? currentWinStreak
        : -currentLossStreak;
    
    return { longestWinStreak, longestLossStreak, currentStreak };
  }

  private printMetrics(metrics: BacktestMetrics): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MÉTRICAS DO BACKTEST');
    console.log('='.repeat(60));
    console.log(`Total de Jogos: ${metrics.totalMatches}`);
    console.log(`Total de Games: ${metrics.totalGames}`);
    console.log(`Triggers Detectados: ${metrics.triggerCount}`);
    console.log(`Apostas Executadas: ${metrics.placedBets}`);
    console.log('-'.repeat(60));
    console.log(`Vitórias: ${metrics.wins}`);
    console.log(`Derrotas: ${metrics.losses}`);
    console.log(`Win Rate: ${(metrics.winRate * 100).toFixed(2)}%`);
    console.log('-'.repeat(60));
    console.log(`Lucro Total: ${metrics.totalProfit.toFixed(2)} unidades`);
    console.log(`ROI: ${(metrics.roi * 100).toFixed(2)}%`);
    console.log(`Profit Factor: ${metrics.profitFactor.toFixed(2)}`);
    console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    console.log(`Bankroll Final: ${metrics.finalBankroll.toFixed(2)}`);
    console.log('-'.repeat(60));
    console.log(`Maior Sequência de Vitórias: ${metrics.longestWinStreak}`);
    console.log(`Maior Sequência de Derrotas: ${metrics.longestLossStreak}`);
    console.log('='.repeat(60) + '\n');
  }

  // ---------------------------------------------------------------------------
  // ANÁLISE DETALHADA
  // ---------------------------------------------------------------------------

  analyzeByMonth(): MonthlyResult[] {
    const byMonth = new Map<string, BetResult[]>();
    
    for (const bet of this.bets) {
      const month = bet.timestamp.substring(0, 7); // YYYY-MM
      if (!byMonth.has(month)) {
        byMonth.set(month, []);
      }
      byMonth.get(month)!.push(bet);
    }
    
    const results: MonthlyResult[] = [];
    for (const [month, bets] of byMonth.entries()) {
      const wins = bets.filter(b => b.result === 'WIN').length;
      const losses = bets.length - wins;
      const profit = bets.reduce((sum, b) => sum + b.profit, 0);
      const totalStaked = bets.length * this.config.management.staking.value;
      
      results.push({
        month,
        bets: bets.length,
        wins,
        losses,
        winRate: wins / bets.length,
        profit,
        roi: totalStaked > 0 ? profit / totalStaked : 0,
      });
    }
    
    return results.sort((a, b) => a.month.localeCompare(b.month));
  }

  analyzeBySurface(): SurfaceResult[] {
    const bySurface = new Map<string, BetResult[]>();
    
    for (const bet of this.bets) {
      if (!bySurface.has(bet.surface)) {
        bySurface.set(bet.surface, []);
      }
      bySurface.get(bet.surface)!.push(bet);
    }
    
    const results: SurfaceResult[] = [];
    for (const [surface, bets] of bySurface.entries()) {
      const wins = bets.filter(b => b.result === 'WIN').length;
      const profit = bets.reduce((sum, b) => sum + b.profit, 0);
      const totalStaked = bets.length * this.config.management.staking.value;
      
      results.push({
        surface,
        bets: bets.length,
        wins,
        losses: bets.length - wins,
        winRate: wins / bets.length,
        profit,
        roi: totalStaked > 0 ? profit / totalStaked : 0,
      });
    }
    
    return results;
  }

  analyzeByOddsRange(): OddsRangeResult[] {
    const byRange = new Map<string, BetResult[]>();
    
    for (const bet of this.bets) {
      if (!byRange.has(bet.oddsRange)) {
        byRange.set(bet.oddsRange, []);
      }
      byRange.get(bet.oddsRange)!.push(bet);
    }
    
    const results: OddsRangeResult[] = [];
    for (const [range, bets] of byRange.entries()) {
      const wins = bets.filter(b => b.result === 'WIN').length;
      const profit = bets.reduce((sum, b) => sum + b.profit, 0);
      const totalStaked = bets.length * this.config.management.staking.value;
      
      results.push({
        range,
        bets: bets.length,
        wins,
        losses: bets.length - wins,
        winRate: wins / bets.length,
        profit,
        roi: totalStaked > 0 ? profit / totalStaked : 0,
      });
    }
    
    return results;
  }

  // ---------------------------------------------------------------------------
  // VALIDAÇÃO ESTATÍSTICA
  // ---------------------------------------------------------------------------

  validateStatistically(): StatisticalValidation {
    console.log('🔬 Validando estatisticamente...');
    
    const n = this.bets.length;
    const winRate = this.bets.filter(b => b.result === 'WIN').length / n;
    const roi = this.bets.reduce((sum, b) => sum + b.profit, 0) / n;
    
    // Teste t one-sample (simplificado)
    const expectedWinRate = 0.5; // Hipótese nula: 50%
    const stdDev = Math.sqrt((winRate * (1 - winRate)) / n);
    const zScore = stdDev > 0 ? (winRate - expectedWinRate) / stdDev : 0;
    
    // P-value aproximado (distribuição normal)
    const pValue = this.calculatePValue(zScore);
    const isSignificant = pValue < this.config.validation.significanceLevel;
    
    // Baseline: apostar sempre no favorito
    const baselineROI = 0.02; // Exemplo: 2% (ajustar com dados reais)
    const outperformance = roi - baselineROI;
    
    const validation: StatisticalValidation = {
      isStatisticallySignificant: isSignificant,
      confidenceLevel: (1 - this.config.validation.significanceLevel) * 100,
      pValue,
      zScore,
      sampleSize: n,
      baselineComparison: {
        strategyROI: roi,
        baselineROI,
        outperformance,
      },
    };
    
    console.log(
      `✅ Validação: ${isSignificant ? 'SIGNIFICANTE' : 'NÃO SIGNIFICANTE'} (p=${pValue.toFixed(4)})`
    );
    
    return validation;
  }

  private calculatePValue(zScore: number): number {
    // Aproximação da distribuição normal cumulativa
    const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const prob =
      d *
      t *
      (0.3193815 +
        t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return zScore > 0 ? prob : 1 - prob;
  }

  // ---------------------------------------------------------------------------
  // RECOMENDAÇÃO FINAL
  // ---------------------------------------------------------------------------

  generateRecommendation(
    metrics: BacktestMetrics,
    validation: StatisticalValidation
  ): {
    status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    score: number;
    notes: string[];
    nextSteps: string[];
  } {
    console.log('📝 Gerando recomendação...');
    
    const targets = this.config.validation.targets;
    let score = 0;
    const notes: string[] = [];
    
    // Pontuação por métrica (0-100)
    const roiScore = Math.min(100, (metrics.roi / targets.roi) * 100);
    const winRateScore = Math.min(100, (metrics.winRate / targets.winRate) * 100);
    const pfScore = Math.min(100, (metrics.profitFactor / targets.profitFactor) * 100);
    const ddScore = Math.max(0, 100 - (metrics.maxDrawdown / targets.maxDrawdown) * 100);
    const sharpeScore = Math.min(100, (metrics.sharpeRatio / targets.sharpeRatio) * 100);
    const sampleScore = Math.min(100, (metrics.placedBets / this.config.validation.minBets) * 100);
    
    // Pesos
    const weights = {
      roi: 0.30,
      winRate: 0.25,
      profitFactor: 0.20,
      drawdown: 0.15,
      sharpeRatio: 0.10,
    };
    
    score =
      roiScore * weights.roi +
      winRateScore * weights.winRate +
      pfScore * weights.profitFactor +
      ddScore * weights.drawdown +
      sharpeScore * weights.sharpeRatio;
    
    // Bônus por significância estatística
    if (validation.isStatisticallySignificant) {
      score += 10;
    }
    
    // Bônus por tamanho de amostra
    if (metrics.placedBets >= 100) {
      score += 5;
    }
    
    score = Math.min(100, score);
    
    // Determinar status
    let status: 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    
    if (
      score >= 80 &&
      metrics.roi > targets.roi &&
      metrics.winRate > targets.winRate &&
      metrics.profitFactor > targets.profitFactor
    ) {
      status = 'APPROVED';
      confidence = 'HIGH';
      notes.push('Estratégia aprovada para produção');
      notes.push('Todos os critérios principais atendidos');
    } else if (score >= 60) {
      status = 'CONDITIONAL';
      confidence = 'MEDIUM';
      notes.push('Alguns critérios atendidos');
      notes.push('Requer otimização adicional');
    } else {
      status = 'REJECTED';
      confidence = 'LOW';
      notes.push('Critérios não atendidos');
      notes.push('Revisar lógica ou coletar mais dados');
    }
    
    // Próximos passos
    const nextSteps: string[] = [];
    if (status === 'APPROVED') {
      nextSteps.push('Iniciar paper trading');
      nextSteps.push('Configurar monitoramento em tempo real');
      nextSteps.push('Definir limites de produção');
    } else if (status === 'CONDITIONAL') {
      nextSteps.push('Otimizar parâmetros (odds, stake)');
      nextSteps.push('Expandir período de teste');
      nextSteps.push('Analisar subgrupos por superfície/torneio');
    } else {
      nextSteps.push('Revisar lógica da estratégia');
      nextSteps.push('Coletar mais dados históricos');
      nextSteps.push('Considerar ajustes no trigger');
    }
    
    console.log(`✅ Recomendação: ${status} (Score: ${score.toFixed(1)})`);
    
    return { status, confidence, score, notes, nextSteps };
  }

  // ---------------------------------------------------------------------------
  // GERAÇÃO DE RELATÓRIO
  // ---------------------------------------------------------------------------

  generateReport(result: BacktestResult): void {
    console.log('📄 Gerando relatório...');
    
    const outputDir = path.resolve(this.config.output.directory);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Relatório Markdown
    const reportMd = this.buildMarkdownReport(result);
    fs.writeFileSync(
      path.join(outputDir, 'report.md'),
      reportMd,
      'utf-8'
    );
    
    // Dados brutos JSON
    fs.writeFileSync(
      path.join(outputDir, 'results.json'),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    
    // Análise CSV
    const csvData = this.buildCSV(result);
    fs.writeFileSync(
      path.join(outputDir, 'analysis.csv'),
      csvData,
      'utf-8'
    );
    
    console.log(`✅ Relatório gerado em: ${outputDir}`);
  }

  private buildMarkdownReport(result: BacktestResult): string {
    const { management, analysis, validation, recommendation } = result;
    const targets = this.config.validation.targets;
    
    let md = `# Relatório de Backtest: ${this.config.backtest.name}\n\n`;
    md += `**Versão:** ${this.config.backtest.version}  \n`;
    md += `**Período:** ${this.config.period.start} a ${this.config.period.end}  \n`;
    md += `**Status:** ${recommendation.status}  \n\n`;
    
    // Resumo Executivo
    md += `## 📊 Resumo Executivo\n\n`;
    md += `| Métrica | Valor | Target | Status |\n`;
    md += `|---------|-------|--------|--------|\n`;
    md += `| ROI | ${(management.roi * 100).toFixed(2)}% | > ${(targets.roi * 100).toFixed(0)}% | ${management.roi > targets.roi ? '✅' : '❌'} |\n`;
    md += `| Win Rate | ${(management.winRate * 100).toFixed(2)}% | > ${(targets.winRate * 100).toFixed(0)}% | ${management.winRate > targets.winRate ? '✅' : '❌'} |\n`;
    md += `| Profit Factor | ${management.profitFactor.toFixed(2)} | > ${targets.profitFactor.toFixed(2)} | ${management.profitFactor > targets.profitFactor ? '✅' : '❌'} |\n`;
    md += `| Max Drawdown | ${(management.maxDrawdown * 100).toFixed(2)}% | < ${(targets.maxDrawdown * 100).toFixed(0)}% | ${management.maxDrawdown < targets.maxDrawdown ? '✅' : '❌'} |\n`;
    md += `| Sharpe Ratio | ${management.sharpeRatio.toFixed(2)} | > ${targets.sharpeRatio.toFixed(1)} | ${management.sharpeRatio > targets.sharpeRatio ? '✅' : '❌'} |\n`;
    md += `| Total Apostas | ${management.placedBets} | ≥ ${this.config.validation.minBets} | ${management.placedBets >= this.config.validation.minBets ? '✅' : '❌'} |\n\n`;
    
    // Métricas Completas
    md += `## 📈 Métricas Completas\n\n`;
    md += `### Estratégia (Lógica)\n`;
    md += `- Total de Jogos: ${result.strategy.totalMatches}\n`;
    md += `- Total de Games: ${result.strategy.totalGames}\n`;
    md += `- Triggers Detectados: ${result.strategy.triggerCount}\n`;
    md += `- Apostas Executadas: ${result.strategy.placedBets}\n\n`;
    
    md += `### Gestão (Performance)\n`;
    md += `- Vitórias: ${management.wins}\n`;
    md += `- Derrotas: ${management.losses}\n`;
    md += `- Win Rate: ${(management.winRate * 100).toFixed(2)}%\n`;
    md += `- Lucro Total: ${management.totalProfit.toFixed(2)} unidades\n`;
    md += `- ROI: ${(management.roi * 100).toFixed(2)}%\n`;
    md += `- Profit Factor: ${management.profitFactor.toFixed(2)}\n`;
    md += `- Max Drawdown: ${(management.maxDrawdown * 100).toFixed(2)}%\n`;
    md += `- Sharpe Ratio: ${management.sharpeRatio.toFixed(2)}\n`;
    md += `- Bankroll Inicial: ${this.config.management.bankroll.initial}\n`;
    md += `- Bankroll Final: ${management.finalBankroll.toFixed(2)}\n\n`;
    
    md += `### Sequências\n`;
    md += `- Maior Sequência de Vitórias: ${analysis.streaks.longestWinStreak}\n`;
    md += `- Maior Sequência de Derrotas: ${analysis.streaks.longestLossStreak}\n`;
    md += `- Sequência Atual: ${analysis.streaks.currentStreak}\n\n`;
    
    // Análise por Mês
    if (analysis.byMonth.length > 0) {
      md += `## 📅 Análise por Mês\n\n`;
      md += `| Mês | Apostas | Vitórias | Win Rate | Lucro | ROI |\n`;
      md += `|-----|---------|----------|----------|-------|-----|\n`;
      for (const m of analysis.byMonth) {
        md += `| ${m.month} | ${m.bets} | ${m.wins} | ${(m.winRate * 100).toFixed(1)}% | ${m.profit.toFixed(2)} | ${(m.roi * 100).toFixed(1)}% |\n`;
      }
      md += '\n';
    }
    
    // Análise por Superfície
    if (analysis.bySurface.length > 0) {
      md += `## 🎾 Análise por Superfície\n\n`;
      md += `| Superfície | Apostas | Vitórias | Win Rate | Lucro | ROI |\n`;
      md += `|------------|---------|----------|----------|-------|-----|\n`;
      for (const s of analysis.bySurface) {
        md += `| ${s.surface} | ${s.bets} | ${s.wins} | ${(s.winRate * 100).toFixed(1)}% | ${s.profit.toFixed(2)} | ${(s.roi * 100).toFixed(1)}% |\n`;
      }
      md += '\n';
    }
    
    // Análise por Faixa de Odds
    if (analysis.byOddsRange.length > 0) {
      md += `## 📊 Análise por Faixa de Odds\n\n`;
      md += `| Odds | Apostas | Vitórias | Win Rate | Lucro | ROI |\n`;
      md += `|------|---------|----------|----------|-------|-----|\n`;
      for (const r of analysis.byOddsRange) {
        md += `| ${r.range} | ${r.bets} | ${r.wins} | ${(r.winRate * 100).toFixed(1)}% | ${r.profit.toFixed(2)} | ${(r.roi * 100).toFixed(1)}% |\n`;
      }
      md += '\n';
    }
    
    // Validação Estatística
    md += `## 🔬 Validação Estatística\n\n`;
    md += `- Significância Estatística: ${validation.isStatisticallySignificant ? 'Sim' : 'Não'}\n`;
    md += `- Nível de Confiança: ${validation.confidenceLevel}%\n`;
    md += `- P-Value: ${validation.pValue.toFixed(4)}\n`;
    md += `- Z-Score: ${validation.zScore.toFixed(2)}\n`;
    md += `- Tamanho da Amostra: ${validation.sampleSize}\n`;
    md += `- Baseline ROI: ${(validation.baselineComparison.baselineROI * 100).toFixed(2)}%\n`;
    md += `- Outperformance: ${(validation.baselineComparison.outperformance * 100).toFixed(2)}%\n\n`;
    
    // Recomendação
    md += `## ✅ Recomendação Final\n\n`;
    md += `**Status:** ${recommendation.status}  \n`;
    md += `**Confiança:** ${recommendation.confidence}  \n`;
    md += `**Score:** ${recommendation.score.toFixed(1)}/100  \n\n`;
    
    md += `### Notas\n`;
    for (const note of recommendation.notes) {
      md += `- ${note}\n`;
    }
    md += '\n';
    
    md += `### Próximos Passos\n`;
    for (let i = 0; i < recommendation.nextSteps.length; i++) {
      md += `${i + 1}. ${recommendation.nextSteps[i]}\n`;
    }
    md += '\n';
    
    // Configuração
    md += `## ⚙️ Configuração Utilizada\n\n`;
    md += `\`\`\`yaml\n`;
    md += `Estratégia: ${this.config.backtest.strategy}\n`;
    md += `Período: ${this.config.period.start} a ${this.config.period.end}\n`;
    md += `Stake: ${this.config.management.staking.value} unidades (fixa)\n`;
    md += `Bankroll: ${this.config.management.bankroll.initial}\n`;
    md += `Odd Mínima: ${this.config.strategy.oddsValidation.min}\n`;
    md += `Odd Máxima: ${this.config.strategy.oddsValidation.max}\n`;
    md += `\`\`\`\n\n`;
    
    md += `---\n\n`;
    md += `**Gerado em:** ${new Date().toISOString()}  \n`;
    md += `**Strategy-Sports Squad** - CEO-BET Domain\n`;
    
    return md;
  }

  private buildCSV(result: BacktestResult): string {
    let csv = 'matchId,gameId,timestamp,selection,odd,stake,result,profit,tournament,surface,setNumber,oddsRange\n';
    
    for (const bet of result.bets) {
      csv += `${bet.matchId},${bet.gameId},${bet.timestamp},${bet.selection},${bet.odd},${bet.stake},${bet.result},${bet.profit},${bet.tournament},${bet.surface},${bet.setNumber},${bet.oddsRange}\n`;
    }
    
    return csv;
  }

  // ---------------------------------------------------------------------------
  // EXECUÇÃO PRINCIPAL
  // ---------------------------------------------------------------------------

  async run(matches: MatchData[]): Promise<BacktestResult> {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 INICIANDO BACKTEST');
    console.log(`Estratégia: ${this.config.backtest.name}`);
    console.log(`Período: ${this.config.period.start} a ${this.config.period.end}`);
    console.log('='.repeat(60) + '\n');
    
    // FASE 1: Carregar dados
    await this.loadMatches(matches);
    
    // FASE 2: Detectar triggers
    this.detectTriggers();
    
    // FASE 3: Executar apostas
    this.executeBets();
    
    // FASE 4: Calcular métricas
    const metrics = this.calculateMetrics();
    
    // FASE 5: Análise detalhada
    const byMonth = this.analyzeByMonth();
    const bySurface = this.analyzeBySurface();
    const byOddsRange = this.analyzeByOddsRange();
    
    // FASE 6: Validação estatística
    const validation = this.validateStatistically();
    
    // FASE 7: Gerar recomendação
    const recommendation = this.generateRecommendation(metrics, validation);
    
    // Resultado final
    const result: BacktestResult = {
      strategy: {
        totalMatches: metrics.totalMatches,
        totalGames: metrics.totalGames,
        triggerCount: metrics.triggerCount,
        entryCount: metrics.entryCount,
        placedBets: metrics.placedBets,
      },
      management: metrics,
      analysis: {
        byMonth,
        bySurface,
        byOddsRange,
        streaks: {
          longestWinStreak: metrics.longestWinStreak,
          longestLossStreak: metrics.longestLossStreak,
          currentStreak: metrics.currentStreak,
        },
      },
      validation,
      recommendation,
      bets: this.bets,
      config: this.config,
    };
    
    // FASE 8: Gerar relatório
    this.generateReport(result);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKTEST CONCLUÍDO');
    console.log(`Status: ${recommendation.status}`);
    console.log(`Score: ${recommendation.score.toFixed(1)}/100`);
    console.log('='.repeat(60) + '\n');
    
    return result;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { BacktestEngine, BacktestConfig, BacktestResult, MatchData, GameData };
