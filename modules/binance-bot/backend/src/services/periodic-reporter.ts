/**
 * Periodic Reporter - Relatórios ultra detalhados a cada 30 minutos
 * CEO-BINANCE: Updates frequentes para acompanhamento em tempo real
 */

import { logger } from '../utils/logger';
import axios from 'axios';

interface PeriodicReportData {
  timestamp: string;
  cycle: number;
  bankroll: number;
  roi: number;
  drawdown: number;
  aliveBots: number;
  totalBots: number;
  groups: GroupSnapshot[];
  recentTrades: number;
  recentWins: number;
  avgWinRate: number;
}

interface GroupSnapshot {
  groupId: string;
  bankroll: number;
  roi: number;
  generation: number;
  fitness: number;
  activeBots: number;
  recentTrades: number;
  winRate: number;
  lossRate: number;
  avgTakeProfitOdd: number;
  avgStopLossOdd: number;
  expectedValue: number;
  topBot: {
    name: string;
    fitness: number;
    bankroll: number;
    avgTakeProfitOdd: number;
    avgStopLossOdd: number;
    expectedValue: number;
  };
}

export class PeriodicReporter {
  private whatsappBridgeUrl = 'http://localhost:21350';
  private intervalMs = 30 * 60 * 1000; // 30 minutos
  private timer: NodeJS.Timeout | null = null;
  private lastReportTime: Date | null = null;

  /**
   * Inicia envio automático a cada 30 minutos
   */
  start(): void {
    logger.info('Periodic Reporter iniciado - updates a cada 30min', {
      type: 'PERIODIC_REPORTER',
      interval: '30min'
    });

    // IMPORTANTE: Primeiro relatório imediato (estado inicial)
    setTimeout(() => {
      this.sendPeriodicReport();
    }, 2000); // 2s de delay para garantir que ecosystem está pronto

    // Relatórios a cada 30 minutos
    this.timer = setInterval(() => {
      this.sendPeriodicReport();
    }, this.intervalMs);
  }

  /**
   * Para envio automático
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('Periodic Reporter parado');
    }
  }

  /**
   * Envia relatório periódico ultra detalhado
   */
  private async sendPeriodicReport(): Promise<void> {
    try {
      const data = await this.collectData();
      const report = this.generateUltraDetailedReport(data);

      await this.sendToWhatsApp(report);

      this.lastReportTime = new Date();

      logger.info('Relatório periódico (30min) enviado', {
        type: 'PERIODIC_REPORT_SENT',
        timestamp: data.timestamp,
        roi: data.roi
      });
    } catch (error) {
      logger.error('Erro ao enviar relatório periódico', {
        type: 'PERIODIC_REPORT_ERROR',
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Coleta dados do ecosystem
   */
  private async collectData(): Promise<PeriodicReportData> {
    try {
      const statusRes = await axios.get('http://localhost:21341/api/v3/ecosystem/status');
      const status = statusRes.data.data;

      const allBots = status.groups.flatMap((g: any) => g.bots);
      const totalTrades = allBots.reduce((sum: number, b: any) => sum + b.trades, 0);
      const totalWins = allBots.reduce((sum: number, b: any) => sum + (b.trades * b.winRate / 100), 0);
      const avgWinRate = totalTrades > 0 ? (totalWins / totalTrades * 100) : 0;

      const groups: GroupSnapshot[] = status.groups.map((g: any) => {
        const activeBots = g.bots.filter((b: any) => b.trades > 0).length;
        const groupTrades = g.bots.reduce((sum: number, b: any) => sum + b.trades, 0);
        const groupWins = g.bots.reduce((sum: number, b: any) => sum + (b.trades * b.winRate / 100), 0);
        const groupWR = groupTrades > 0 ? (groupWins / groupTrades * 100) : 0;
        const groupLR = 100 - groupWR;

        const topBot = [...g.bots].sort((a: any, b: any) => b.fitness - a.fitness)[0];

        return {
          groupId: g.groupId,
          bankroll: g.bankroll,
          roi: ((g.bankroll - g.initialBankroll) / g.initialBankroll * 100),
          generation: g.generation,
          fitness: g.groupFitness,
          activeBots,
          recentTrades: groupTrades,
          winRate: groupWR,
          lossRate: groupLR,
          avgTakeProfitOdd: g.avgTakeProfitOdd || 0,
          avgStopLossOdd: g.avgStopLossOdd || 0,
          expectedValue: g.expectedValue || 0,
          topBot: {
            name: topBot.name,
            fitness: topBot.fitness,
            bankroll: topBot.bankroll,
            avgTakeProfitOdd: topBot.avgTakeProfitOdd || 0,
            avgStopLossOdd: topBot.avgStopLossOdd || 0,
            expectedValue: topBot.expectedValue || 0
          }
        };
      });

      return {
        timestamp: new Date().toISOString(),
        cycle: status.cycle,
        bankroll: status.communityBankroll,
        roi: ((status.communityBankroll - status.communityInitial) / status.communityInitial * 100),
        drawdown: status.drawdownPercent,
        aliveBots: status.aliveBots,
        totalBots: status.totalBots,
        groups,
        recentTrades: totalTrades,
        recentWins: Math.round(totalWins),
        avgWinRate
      };
    } catch (error) {
      logger.error('Erro ao coletar dados para relatório periódico', { error });
      throw error;
    }
  }

  /**
   * Gera relatório ultra detalhado (30min update)
   */
  private generateUltraDetailedReport(data: PeriodicReportData): string {
    const lines: string[] = [];
    const now = new Date();

    // HEADER COMPACTO
    lines.push('╔═══════════════════════════════════╗');
    lines.push('║  ⚡ UPDATE 30MIN - ULTRA DETAIL   ║');
    lines.push('╚═══════════════════════════════════╝');
    lines.push('');
    lines.push(`🕐 ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`);
    lines.push('');

    // SNAPSHOT RÁPIDO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📸 SNAPSHOT ATUAL');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`🔄 Ciclo: #${data.cycle.toLocaleString('pt-BR')}`);
    lines.push(`🤖 Bots: ${data.aliveBots}/${data.totalBots} (${(data.aliveBots/data.totalBots*100).toFixed(0)}%)`);
    lines.push(`💰 Bankroll: $${data.bankroll.toFixed(2)}`);
    lines.push(`📈 ROI: ${data.roi >= 0 ? '+' : ''}${data.roi.toFixed(2)}%`);
    lines.push(`📉 Drawdown: ${data.drawdown.toFixed(2)}%`);
    lines.push('');

    // PERFORMANCE ÚLTIMOS 30MIN
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('⏱️ PERFORMANCE (últimos 30min)');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📊 Trades Totais: ${data.recentTrades}`);
    lines.push(`✅ Ganhos: ${data.recentWins} (${data.avgWinRate.toFixed(1)}%)`);
    lines.push(`❌ Perdas: ${data.recentTrades - data.recentWins}`);
    lines.push('');

    // STATUS POR GRUPO (ULTRA DETALHADO)
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📦 STATUS DETALHADO POR GRUPO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Ordenar grupos por ROI
    const sortedGroups = [...data.groups].sort((a, b) => b.roi - a.roi);

    sortedGroups.forEach((group, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
      
      // Calculate expected value interpretation
      let evStatus = group.expectedValue > 0.1 ? '✅ POSITIVO' : group.expectedValue > 0 ? '⚠️ NEUTRO' : '❌ NEGATIVO';
      let evEmoji = group.expectedValue > 0.1 ? '🟢' : group.expectedValue > 0 ? '🟡' : '🔴';

      lines.push('');
      lines.push(`${medal} ${group.groupId}`);
      lines.push(`   💵 Bankroll: $${group.bankroll.toFixed(2)}`);
      lines.push(`   📈 ROI: ${group.roi >= 0 ? '+' : ''}${group.roi.toFixed(2)}%`);
      lines.push(`   🧬 Geração: ${group.generation} | Fitness: ${group.fitness.toFixed(1)}`);
      lines.push(`   🤖 Bots Ativos: ${group.activeBots}/5`);
      lines.push(`   📊 Trades: ${group.recentTrades} | WR: ${group.winRate.toFixed(1)}% | LR: ${group.lossRate.toFixed(1)}%`);
      lines.push(`   🎯 TP Odd Média: ${group.avgTakeProfitOdd.toFixed(2)}x | SL Odd Média: ${group.avgStopLossOdd.toFixed(2)}x`);
      lines.push(`   ${evEmoji} Expected Value: ${group.expectedValue.toFixed(3)} (${evStatus})`);
      lines.push(`   ⭐ Top Bot: ${group.topBot.name}`);
      lines.push(`      └─ TP: ${group.topBot.avgTakeProfitOdd.toFixed(2)}x | SL: ${group.topBot.avgStopLossOdd.toFixed(2)}x | EV: ${group.topBot.expectedValue.toFixed(3)}`);
    });
    lines.push('');

    // INDICADORES DE SAÚDE
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🏥 INDICADORES DE SAÚDE');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let healthStatus = '🟢 EXCELENTE';
    let healthEmoji = '💚';
    if (data.drawdown > 2) { healthStatus = '🟡 BOM'; healthEmoji = '💛'; }
    if (data.drawdown > 5) { healthStatus = '🟠 ATENÇÃO'; healthEmoji = '🧡'; }
    if (data.drawdown > 10) { healthStatus = '🔴 CRÍTICO'; healthEmoji = '❤️'; }

    lines.push(`${healthEmoji} Status Geral: ${healthStatus}`);
    lines.push(`🎯 Bots Ativos: ${data.aliveBots}/${data.totalBots}`);
    lines.push(`📊 Win Rate Médio: ${data.avgWinRate.toFixed(1)}%`);

    const activeBots = data.groups.reduce((sum, g) => sum + g.activeBots, 0);
    const activityRate = (activeBots / data.totalBots * 100);
    lines.push(`⚡ Taxa de Atividade: ${activityRate.toFixed(1)}%`);
    lines.push('');

    // META PROGRESS
    const targetROI = 3.0;
    const progress = (data.roi / targetROI * 100);

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🎯 PROGRESSO DA META');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`Meta: 3% em 12h`);
    lines.push(`Atual: ${data.roi.toFixed(2)}%`);
    lines.push(`Progresso: ${progress.toFixed(1)}%`);

    if (data.roi >= targetROI) {
      lines.push(`✅ META ATINGIDA! 🎉`);
    } else {
      const remaining = targetROI - data.roi;
      lines.push(`⏳ Faltam: ${remaining.toFixed(2)}%`);
    }
    lines.push('');

    // PRÓXIMO UPDATE
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const nextUpdate = new Date(now.getTime() + this.intervalMs);
    lines.push(`⏰ Próximo update: ${nextUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return lines.join('\n');
  }

  /**
   * Envia mensagem para WhatsApp Bridge
   */
  private async sendToWhatsApp(message: string): Promise<void> {
    try {
      await axios.post(`${this.whatsappBridgeUrl}/send`, {
        to: process.env.WHATSAPP_REPORT_NUMBER || '5511994410278',
        message
      });
    } catch (error) {
      logger.warn('WhatsApp Bridge não disponível para relatório periódico', {
        type: 'PERIODIC_WHATSAPP_FALLBACK'
      });
      // Fallback: log no console
      console.log('\n' + message + '\n');
    }
  }
}

export const periodicReporter = new PeriodicReporter();
