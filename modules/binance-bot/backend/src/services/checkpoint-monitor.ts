/**
 * Checkpoint Monitor - Sistema de monitoramento automático de 6h
 * CEO-BINANCE: Monitora progresso do NÍVEL 1 e envia relatórios verbosos
 */

import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { whatsappReporter } from './whatsapp-reporter';

interface CheckpointData {
  timestamp: string;
  cycle: number;
  bankroll: number;
  roi24h: number;
  roi12h: number;
  roi6h: number;
  drawdown: number;
  winRate: number;
  botsAlive: number;
  totalBots: number;
  groups: GroupCheckpoint[];
  mutations: MutationEvent[];
  cyclesCompleted: number;
  performance: PerformanceMetrics;
}

interface GroupCheckpoint {
  groupId: string;
  bankroll: number;
  roi: number;
  generation: number;
  fitness: number;
  winRate: number;
  totalTrades: number;
  activeStrategies: number;
}

interface MutationEvent {
  timestamp: string;
  type: 'DEATH_BOOST' | 'RECENT_DEATHS' | 'STAGNATION' | 'BOT_DEATH';
  groupId?: string;
  details: any;
}

interface PerformanceMetrics {
  peakBankroll: number;
  peakToCurrentRetraction: number;
  tradesTotal: number;
  tradesWon: number;
  tradesLost: number;
  avgTradeSize: number;
  bestTrade: number;
  worstTrade: number;
}

export class CheckpointMonitor {
  private dataPath: string;
  private checkpointInterval: number = 6 * 60 * 60 * 1000; // 6h em ms
  private timer: NodeJS.Timeout | null = null;
  private mutations: MutationEvent[] = [];

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'checkpoints');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  /**
   * Inicia monitoramento automático de 6h
   */
  start(): void {
    logger.info('Checkpoint Monitor iniciado - intervalo 6h', {
      type: 'CHECKPOINT_MONITOR',
      interval: '6h'
    });

    // Checkpoint imediato ao iniciar (baseline - estado inicial)
    setTimeout(() => {
      this.executeCheckpoint();
    }, 3000); // 3s de delay para garantir que ecosystem está pronto

    // Checkpoints a cada 6h
    this.timer = setInterval(() => {
      this.executeCheckpoint();
    }, this.checkpointInterval);
  }

  /**
   * Para monitoramento
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Checkpoint Monitor parado');
    }
  }

  /**
   * Registra evento de mutação adaptativa
   */
  recordMutation(event: MutationEvent): void {
    this.mutations.push(event);
    logger.info('Mutação adaptativa registrada', {
      type: 'MUTATION_RECORDED',
      mutationType: event.type,
      groupId: event.groupId
    });
  }

  /**
   * Executa checkpoint e gera relatório
   */
  private async executeCheckpoint(): Promise<void> {
    try {
      const data = await this.collectCheckpointData();
      await this.saveCheckpoint(data);
      await this.generateVerboseReport(data);
      await this.sendWhatsAppReport(data);

      logger.info('Checkpoint executado com sucesso', {
        type: 'CHECKPOINT_COMPLETE',
        timestamp: data.timestamp,
        roi24h: data.roi24h
      });

      // Limpa mutações antigas (mantém apenas últimas 6h)
      this.mutations = [];
    } catch (error) {
      logger.error('Erro ao executar checkpoint', {
        type: 'CHECKPOINT_ERROR',
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Coleta dados do ecosystem para checkpoint
   */
  private async collectCheckpointData(): Promise<CheckpointData> {
    const timestamp = new Date().toISOString();

    try {
      // Buscar dados reais do ecosystem
      const axios = require('axios');
      const statusRes = await axios.get('http://localhost:21341/api/v3/ecosystem/status');
      const leaderboardRes = await axios.get('http://localhost:21341/api/v3/ecosystem/leaderboard');
      const trackingData = this.loadAggressivenessTracking();

      const status = statusRes.data.data;
      const leaderboard = leaderboardRes.data.data;

      // Calcular métricas agregadas
      const allBots = status.groups.flatMap((g: any) => g.bots);
      const totalTrades = allBots.reduce((sum: number, b: any) => sum + b.trades, 0);
      const totalWins = allBots.reduce((sum: number, b: any) => sum + (b.trades * b.winRate / 100), 0);
      const winRate = totalTrades > 0 ? (totalWins / totalTrades * 100) : 0;

      // Mapear grupos para formato de checkpoint
      const groups: GroupCheckpoint[] = status.groups.map((g: any) => ({
        groupId: g.groupId,
        bankroll: g.bankroll,
        roi: ((g.bankroll - g.initialBankroll) / g.initialBankroll * 100),
        generation: g.generation,
        fitness: g.fitness,
        winRate: g.bots.reduce((sum: number, b: any) => sum + b.winRate, 0) / g.bots.length,
        totalTrades: g.bots.reduce((sum: number, b: any) => sum + b.trades, 0),
        activeStrategies: g.bots.reduce((sum: number, b: any) => sum + b.activeStrategies, 0)
      }));

      return {
        timestamp,
        cycle: status.cycle,
        bankroll: status.bankroll,
        roi24h: this.calculateROI(trackingData, 24),
        roi12h: this.calculateROI(trackingData, 12),
        roi6h: this.calculateROI(trackingData, 6),
        drawdown: status.drawdown,
        winRate,
        botsAlive: status.aliveBots,
        totalBots: status.totalBots,
        groups,
        mutations: [...this.mutations],
        cyclesCompleted: trackingData.cycleTracking.totalCyclesCompleted,
        performance: {
          peakBankroll: status.peakBankroll,
          peakToCurrentRetraction: ((status.peakBankroll - status.bankroll) / status.peakBankroll * 100),
          tradesTotal: totalTrades,
          tradesWon: Math.round(totalWins),
          tradesLost: totalTrades - Math.round(totalWins),
          avgTradeSize: totalTrades > 0 ? status.bankroll / totalTrades : 0,
          bestTrade: Math.max(...allBots.map((b: any) => b.bankroll)),
          worstTrade: Math.min(...allBots.map((b: any) => b.bankroll))
        }
      };
    } catch (error) {
      logger.error('Erro ao coletar dados do ecosystem', {
        type: 'CHECKPOINT_ERROR',
        error: error instanceof Error ? error.message : error
      });

      // Fallback para dados vazios
      return {
        timestamp,
        cycle: 0,
        bankroll: 0,
        roi24h: 0,
        roi12h: 0,
        roi6h: 0,
        drawdown: 0,
        winRate: 0,
        botsAlive: 0,
        totalBots: 25,
        groups: [],
        mutations: [...this.mutations],
        cyclesCompleted: 0,
        performance: {
          peakBankroll: 0,
          peakToCurrentRetraction: 0,
          tradesTotal: 0,
          tradesWon: 0,
          tradesLost: 0,
          avgTradeSize: 0,
          bestTrade: 0,
          worstTrade: 0
        }
      };
    }
  }

  /**
   * Carrega dados de tracking de aggressiveness
   */
  private loadAggressivenessTracking(): any {
    try {
      const trackingPath = path.join(process.cwd(), 'data', 'aggressiveness-tracking.json');
      if (fs.existsSync(trackingPath)) {
        return JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
      }
    } catch (error) {
      logger.warn('Erro ao carregar aggressiveness-tracking', { error });
    }
    return { cycleTracking: { totalCyclesCompleted: 0 } };
  }

  /**
   * Calcula ROI para janela de tempo específica
   */
  private calculateROI(trackingData: any, hours: number): number {
    // TODO: Implementar cálculo real baseado em checkpoints anteriores
    // Por enquanto retorna 0
    return 0;
  }

  /**
   * Salva checkpoint em disco
   */
  private async saveCheckpoint(data: CheckpointData): Promise<void> {
    const filename = `checkpoint-${Date.now()}.json`;
    const filepath = path.join(this.dataPath, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    logger.info('Checkpoint salvo', {
      type: 'CHECKPOINT_SAVED',
      file: filename
    });
  }

  /**
   * Gera relatório verbose para WhatsApp
   */
  private async generateVerboseReport(data: CheckpointData): Promise<string> {
    const lines: string[] = [];

    lines.push('═══════════════════════════════');
    lines.push('📊 CHECKPOINT REPORT - NÍVEL 1');
    lines.push('═══════════════════════════════');
    lines.push('');
    lines.push(`⏰ ${new Date(data.timestamp).toLocaleString('pt-BR')}`);
    lines.push('');

    // ROI detalhado
    lines.push('💰 PERFORMANCE ROI:');
    lines.push(`   └─ 24h: ${data.roi24h.toFixed(2)}%`);
    lines.push(`   └─ 12h: ${data.roi12h.toFixed(2)}%`);
    lines.push(`   └─  6h: ${data.roi6h.toFixed(2)}%`);
    lines.push('');

    // Bankroll
    lines.push('💵 BANKROLL:');
    lines.push(`   └─ Atual: $${data.bankroll.toFixed(2)}`);
    lines.push(`   └─ Peak:  $${data.performance.peakBankroll.toFixed(2)}`);
    lines.push(`   └─ Retração: ${data.performance.peakToCurrentRetraction.toFixed(2)}%`);
    lines.push('');

    // Ciclos
    lines.push('🔄 CICLOS DE 3%:');
    lines.push(`   └─ Total: ${data.cyclesCompleted}`);
    lines.push(`   └─ Últimas 24h: ?`);
    lines.push(`   └─ Últimas 12h: ?`);
    lines.push('');

    // Trades
    lines.push('📈 TRADES:');
    lines.push(`   └─ Total: ${data.performance.tradesTotal}`);
    lines.push(`   └─ Ganhos: ${data.performance.tradesWon} (${data.winRate.toFixed(1)}%)`);
    lines.push(`   └─ Perdas: ${data.performance.tradesLost}`);
    lines.push(`   └─ Melhor: $${data.performance.bestTrade.toFixed(2)}`);
    lines.push(`   └─ Pior: $${data.performance.worstTrade.toFixed(2)}`);
    lines.push('');

    // Bots
    lines.push('🤖 BOTS:');
    lines.push(`   └─ Alive: ${data.botsAlive}/${data.totalBots} (${(data.botsAlive/data.totalBots*100).toFixed(1)}%)`);
    lines.push(`   └─ Drawdown: ${data.drawdown.toFixed(2)}%`);
    lines.push('');

    // Grupos
    if (data.groups.length > 0) {
      lines.push('🏆 GRUPOS:');
      data.groups.forEach(g => {
        lines.push(`   ${g.groupId}:`);
        lines.push(`      ├─ ROI: ${g.roi.toFixed(2)}%`);
        lines.push(`      ├─ Bankroll: $${g.bankroll.toFixed(2)}`);
        lines.push(`      ├─ Gen: ${g.generation} | Fitness: ${g.fitness.toFixed(1)}`);
        lines.push(`      ├─ WR: ${g.winRate.toFixed(1)}% | Trades: ${g.totalTrades}`);
        lines.push(`      └─ Estratégias: ${g.activeStrategies}`);
      });
      lines.push('');
    }

    // Mutações adaptativas
    if (data.mutations.length > 0) {
      lines.push('🧬 MUTAÇÕES ADAPTATIVAS (últimas 6h):');
      data.mutations.forEach(m => {
        const time = new Date(m.timestamp).toLocaleTimeString('pt-BR');
        lines.push(`   [${time}] ${m.type}`);
        if (m.groupId) lines.push(`      └─ Grupo: ${m.groupId}`);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════');

    return lines.join('\n');
  }

  /**
   * Envia relatório para WhatsApp
   */
  private async sendWhatsAppReport(data: CheckpointData): Promise<void> {
    try {
      // Buscar tracking data para nível/target
      const trackingData = this.loadAggressivenessTracking();

      // Converter CheckpointData para EcosystemData
      const ecosystemData = {
        isRunning: true,
        cycle: data.cycle,
        bankroll: data.bankroll,
        initialBankroll: data.bankroll / (1 + (data.roi24h / 100)), // Aproximação
        peakBankroll: data.performance.peakBankroll,
        drawdown: data.drawdown,
        aliveBots: data.botsAlive,
        totalBots: data.totalBots,
        groups: data.groups.map(g => ({
          groupId: g.groupId,
          bankroll: g.bankroll,
          initialBankroll: g.bankroll / (1 + (g.roi / 100)),
          generation: g.generation,
          fitness: g.fitness,
          bots: [], // Será preenchido pelo reporter se necessário
          seeds: {},
          currentRegime: 'NORMAL',
          currentSentiment: 'NEUTRAL'
        })),
        dnaMemory: {
          total: data.mutations.length,
          avgFitness: data.groups.reduce((sum, g) => sum + g.fitness, 0) / data.groups.length || 0,
          bestMultiplier: data.performance.peakBankroll / data.bankroll,
          survivalRate: data.botsAlive / data.totalBots
        },
        level: trackingData.currentLevel || 1,
        target: trackingData.targetROI || '3% em 12h'
      };

      await whatsappReporter.sendVerboseReport(ecosystemData);

      logger.info('Relatório WhatsApp enviado via whatsappReporter', {
        type: 'CHECKPOINT_WHATSAPP',
        timestamp: data.timestamp
      });
    } catch (error) {
      logger.error('Erro ao enviar relatório WhatsApp', {
        type: 'CHECKPOINT_WHATSAPP_ERROR',
        error: error instanceof Error ? error.message : error
      });

      // Fallback: gera e loga relatório localmente
      const report = await this.generateVerboseReport(data);
      console.log('\n' + report + '\n');
    }
  }
}

export const checkpointMonitor = new CheckpointMonitor();
