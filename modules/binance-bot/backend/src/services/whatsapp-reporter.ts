/**
 * WhatsApp Reporter - Relatórios SUPER VERBOSE para WhatsApp
 * CEO-BINANCE: 10x mais informação que antes
 */

import { logger } from '../utils/logger';
import axios from 'axios';

interface EcosystemData {
  isRunning: boolean;
  cycle: number;
  bankroll: number;
  initialBankroll: number;
  peakBankroll: number;
  drawdown: number;
  aliveBots: number;
  totalBots: number;
  groups: GroupData[];
  dnaMemory: DNAMemoryStats;
  level: number;
  target: string;
}

interface GroupData {
  groupId: string;
  bankroll: number;
  initialBankroll: number;
  generation: number;
  fitness: number;
  bots: BotData[];
  seeds: any;
  currentRegime: string;
  currentSentiment: string;
}

interface BotData {
  id: string;
  name: string;
  bankroll: number;
  fitness: number;
  trades: number;
  winRate: number;
  generation: number;
  activeStrategies: number;
  leverage: number;
  openPositions: number;
}

interface DNAMemoryStats {
  total: number;
  avgFitness: number;
  bestMultiplier: number;
  survivalRate: number;
}

export class WhatsAppReporter {
  private whatsappBridgeUrl = 'http://localhost:21350';

  /**
   * Envia relatório SUPER VERBOSE
   */
  async sendVerboseReport(data: EcosystemData): Promise<void> {
    // Buscar dados completos dos bots se não foram fornecidos
    const enrichedData = await this.enrichEcosystemData(data);
    const report = this.generateSuperVerboseReport(enrichedData);

    try {
      await this.sendToWhatsApp(report);
      logger.info('Relatório WhatsApp enviado', {
        type: 'WHATSAPP_SENT',
        size: report.length
      });
    } catch (error) {
      logger.error('Erro ao enviar relatório WhatsApp', {
        type: 'WHATSAPP_ERROR',
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * Enriquece dados do ecosystem com informações completas dos bots
   */
  private async enrichEcosystemData(data: EcosystemData): Promise<EcosystemData> {
    try {
      const statusRes = await axios.get('http://localhost:21341/api/v3/ecosystem/status');
      const fullStatus = statusRes.data.data;

      // Mesclar grupos com bots completos
      return {
        ...data,
        groups: fullStatus.groups.map((g: any, idx: number) => ({
          ...data.groups[idx],
          bots: g.bots.map((b: any) => ({
            id: b.id,
            name: b.name,
            bankroll: b.bankroll,
            fitness: b.fitness,
            trades: b.trades,
            winRate: b.winRate,
            generation: b.generation,
            activeStrategies: b.activeStrategies,
            leverage: b.leverage || 1,
            openPositions: b.openPositions || 0
          }))
        }))
      };
    } catch (error) {
      logger.warn('Erro ao enriquecer dados, usando dados fornecidos', {
        type: 'ECOSYSTEM_ENRICH_ERROR',
        error: error instanceof Error ? error.message : error
      });
      return data;
    }
  }

  /**
   * Gera relatório SUPER VERBOSE (50+ linhas)
   */
  private generateSuperVerboseReport(data: EcosystemData): string {
    const lines: string[] = [];
    const now = new Date();

    // HEADER
    lines.push('╔═══════════════════════════════════╗');
    lines.push('║   📊 BINANCE MYCELIUM ECOSYSTEM   ║');
    lines.push('║     RELATÓRIO EXECUTIVO ULTRA     ║');
    lines.push('║         VERBOSE - 50+ INFO        ║');
    lines.push('╚═══════════════════════════════════╝');
    lines.push('');
    lines.push(`🕐 ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    lines.push(`⚙️  NÍVEL ${data.level} - ${data.target}`);
    lines.push('');

    // SEÇÃO 1: STATUS GERAL
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📌 STATUS GERAL');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`🟢 Sistema: ${data.isRunning ? 'OPERACIONAL' : '🔴 PARADO'}`);
    lines.push(`🔄 Ciclo: #${data.cycle.toLocaleString('pt-BR')}`);
    lines.push(`🤖 Bots: ${data.aliveBots}/${data.totalBots} alive (${(data.aliveBots/data.totalBots*100).toFixed(1)}%)`);
    lines.push('');

    // SEÇÃO 2: PERFORMANCE FINANCEIRA
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('💰 PERFORMANCE FINANCEIRA');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const roi = ((data.bankroll - data.initialBankroll) / data.initialBankroll * 100);
    const profit = data.bankroll - data.initialBankroll;

    lines.push(`💵 Bankroll Atual: $${data.bankroll.toFixed(2)}`);
    lines.push(`📊 Inicial: $${data.initialBankroll.toFixed(2)}`);
    lines.push(`📈 Peak: $${data.peakBankroll.toFixed(2)}`);
    lines.push(`💸 Lucro: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)} (${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%)`);
    lines.push(`📉 Drawdown: ${data.drawdown.toFixed(2)}%`);

    const peakRetraction = ((data.peakBankroll - data.bankroll) / data.peakBankroll * 100);
    lines.push(`🎯 Retração do Peak: ${peakRetraction.toFixed(2)}%`);
    lines.push('');

    // SEÇÃO 3: DNA MEMORY & EVOLUÇÃO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🧬 EVOLUÇÃO & DNA MEMORY');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`📚 Total Genomas: ${data.dnaMemory.total}`);
    lines.push(`⭐ Fitness Médio: ${data.dnaMemory.avgFitness.toFixed(2)}`);
    lines.push(`🏆 Best Multiplier: ${data.dnaMemory.bestMultiplier.toFixed(4)}x`);
    lines.push(`💪 Survival Rate: ${(data.dnaMemory.survivalRate * 100).toFixed(1)}%`);
    lines.push('');

    // SEÇÃO 4: RANKING DE GRUPOS
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🏆 RANKING DE GRUPOS');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const groupsSorted = [...data.groups].sort((a, b) => {
      const roiA = (a.bankroll - a.initialBankroll) / a.initialBankroll;
      const roiB = (b.bankroll - b.initialBankroll) / b.initialBankroll;
      return roiB - roiA;
    });

    groupsSorted.forEach((group, idx) => {
      const groupROI = ((group.bankroll - group.initialBankroll) / group.initialBankroll * 100);
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';

      lines.push(`${medal} ${group.groupId}`);
      lines.push(`   💵 $${group.bankroll.toFixed(2)} | ROI: ${groupROI >= 0 ? '+' : ''}${groupROI.toFixed(2)}%`);
      lines.push(`   🧬 Gen ${group.generation} | Fitness ${group.fitness.toFixed(1)}`);
      lines.push(`   🎭 ${group.currentRegime} | ${group.currentSentiment}`);
      lines.push(`   🤖 ${group.bots.filter(b => b.trades > 0).length}/${group.bots.length} bots ativos`);
      lines.push('');
    });

    // SEÇÃO 5: TOP BOTS
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('⭐ TOP 5 BOTS (por fitness)');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allBots = data.groups.flatMap(g => g.bots.map(b => ({...b, groupId: g.groupId})));
    const topBots = allBots
      .filter(b => b.trades > 0)
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, 5);

    topBots.forEach((bot, idx) => {
      lines.push(`${idx + 1}. ${bot.name} [${bot.groupId}]`);
      lines.push(`   💪 Fitness: ${bot.fitness.toFixed(1)} | $${bot.bankroll.toFixed(2)}`);
      lines.push(`   📊 Trades: ${bot.trades} | WR: ${bot.winRate.toFixed(1)}%`);
      lines.push(`   🧬 Gen ${bot.generation} | ⚡ ${bot.activeStrategies} estratégias`);
      lines.push(`   📈 Leverage: ${bot.leverage}x | Posições: ${bot.openPositions}`);
      lines.push('');
    });

    // SEÇÃO 6: WIN RATE DETALHADO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📊 WIN RATE POR GRUPO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    data.groups.forEach(group => {
      const totalTrades = group.bots.reduce((sum, b) => sum + b.trades, 0);
      const totalWins = group.bots.reduce((sum, b) => sum + (b.trades * b.winRate / 100), 0);
      const groupWR = totalTrades > 0 ? (totalWins / totalTrades * 100) : 0;

      lines.push(`${group.groupId}: ${groupWR.toFixed(1)}% (${totalTrades} trades)`);
    });
    lines.push('');

    // SEÇÃO 7: ANÁLISE DE RISCO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('⚠️ ANÁLISE DE RISCO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalOpenPositions = allBots.reduce((sum, b) => sum + b.openPositions, 0);
    const avgLeverage = allBots.reduce((sum, b) => sum + b.leverage, 0) / allBots.length;

    lines.push(`📊 Posições Abertas: ${totalOpenPositions}`);
    lines.push(`⚡ Leverage Médio: ${avgLeverage.toFixed(1)}x`);
    lines.push(`📉 Drawdown Atual: ${data.drawdown.toFixed(2)}%`);

    let riskLevel = 'BAIXO';
    if (data.drawdown > 5) riskLevel = 'MODERADO';
    if (data.drawdown > 10) riskLevel = 'ALTO';
    if (data.drawdown > 15) riskLevel = 'CRÍTICO';

    lines.push(`🎯 Nível de Risco: ${riskLevel}`);
    lines.push('');

    // SEÇÃO 8: PRÓXIMOS EVENTOS
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📅 PRÓXIMOS EVENTOS');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`⏰ Próximo Checkpoint: ${this.getNextCheckpoint()}`);
    lines.push(`🎯 Meta NÍVEL ${data.level}: ${data.target}`);
    lines.push('');

    // SEÇÃO 9: DETALHES DE TODOS OS BOTS
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🤖 DETALHES DE TODOS OS BOTS (25)');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    data.groups.forEach(group => {
      lines.push(`\n📦 ${group.groupId}:`);
      group.bots.forEach((bot, idx) => {
        lines.push(`   ${idx + 1}. ${bot.name}`);
        lines.push(`      💰 $${bot.bankroll.toFixed(2)} | Fitness: ${bot.fitness.toFixed(1)}`);
        lines.push(`      📊 ${bot.trades} trades | WR: ${bot.winRate.toFixed(1)}%`);
        lines.push(`      🧬 Gen ${bot.generation} | ⚡ ${bot.activeStrategies} estratégias`);
        lines.push(`      📈 Leverage: ${bot.leverage}x | Posições: ${bot.openPositions}`);
      });
    });
    lines.push('');

    // SEÇÃO 10: EVOLUÇÃO POR GRUPO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🧬 EVOLUÇÃO DETALHADA POR GRUPO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    data.groups.forEach(group => {
      lines.push(`\n${group.groupId}:`);
      lines.push(`   🔄 Geração Atual: ${group.generation}`);
      lines.push(`   💪 Fitness do Grupo: ${group.fitness.toFixed(2)}`);
      lines.push(`   🎭 Regime: ${group.currentRegime} | Sentimento: ${group.currentSentiment}`);

      const groupROI = ((group.bankroll - group.initialBankroll) / group.initialBankroll * 100);
      const groupProfit = group.bankroll - group.initialBankroll;
      lines.push(`   💵 $${group.bankroll.toFixed(2)} → ROI: ${groupROI >= 0 ? '+' : ''}${groupROI.toFixed(2)}%`);
      lines.push(`   💸 Lucro: ${groupProfit >= 0 ? '+' : ''}$${groupProfit.toFixed(2)}`);

      const activeBots = group.bots.filter(b => b.trades > 0).length;
      lines.push(`   🤖 Bots Ativos: ${activeBots}/${group.bots.length}`);

      if (group.bots.length > 0) {
        const avgFitness = group.bots.reduce((sum, b) => sum + b.fitness, 0) / group.bots.length;
        const avgTrades = group.bots.reduce((sum, b) => sum + b.trades, 0) / group.bots.length;
        lines.push(`   📊 Fitness Médio: ${avgFitness.toFixed(1)}`);
        lines.push(`   📈 Trades Médio: ${avgTrades.toFixed(1)}`);
      }
    });
    lines.push('');

    // SEÇÃO 11: LEVERAGE E EXPOSIÇÃO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('⚡ LEVERAGE & EXPOSIÇÃO DETALHADA');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const totalLeverage = allBots.reduce((sum, b) => sum + b.leverage, 0);
    const avgLeverageDetailed = totalLeverage / allBots.length;
    const maxLeverage = Math.max(...allBots.map(b => b.leverage));
    const minLeverage = Math.min(...allBots.map(b => b.leverage));

    lines.push(`📊 Leverage Médio: ${avgLeverageDetailed.toFixed(1)}x`);
    lines.push(`📈 Leverage Máximo: ${maxLeverage}x`);
    lines.push(`📉 Leverage Mínimo: ${minLeverage}x`);
    lines.push('');
    lines.push('Por Grupo:');

    data.groups.forEach(group => {
      const groupAvgLev = group.bots.reduce((sum, b) => sum + b.leverage, 0) / group.bots.length;
      const groupMaxLev = Math.max(...group.bots.map(b => b.leverage));
      lines.push(`   ${group.groupId}: Média ${groupAvgLev.toFixed(1)}x | Max ${groupMaxLev}x`);
    });
    lines.push('');

    // SEÇÃO 12: ESTRATÉGIAS ATIVAS
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🎯 ESTRATÉGIAS ATIVAS POR GRUPO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    data.groups.forEach(group => {
      const totalStrategies = group.bots.reduce((sum, b) => sum + b.activeStrategies, 0);
      const avgStrategies = totalStrategies / group.bots.length;
      const maxStrategies = Math.max(...group.bots.map(b => b.activeStrategies));
      const minStrategies = Math.min(...group.bots.map(b => b.activeStrategies));

      lines.push(`${group.groupId}:`);
      lines.push(`   Total: ${totalStrategies} | Média: ${avgStrategies.toFixed(1)}`);
      lines.push(`   Range: ${minStrategies} - ${maxStrategies}`);
    });
    lines.push('');

    // SEÇÃO 13: COMPARATIVO TEMPORAL
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('📈 COMPARATIVO DE PERFORMANCE');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const currentROI = ((data.bankroll - data.initialBankroll) / data.initialBankroll * 100);
    const targetROI = 3.0; // Meta de 3%
    const progress = (currentROI / targetROI * 100);

    lines.push(`🎯 Meta: ${targetROI}% em ${data.target.split(' em ')[1]}`);
    lines.push(`📊 Atual: ${currentROI.toFixed(2)}%`);
    lines.push(`📈 Progresso: ${progress.toFixed(1)}% da meta`);

    if (currentROI >= targetROI) {
      lines.push(`✅ META ATINGIDA! 🎉`);
    } else {
      const remaining = targetROI - currentROI;
      lines.push(`⏳ Faltam: ${remaining.toFixed(2)}% para meta`);
    }
    lines.push('');

    // SEÇÃO 14: HEALTH CHECK COMPLETO
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('🏥 HEALTH CHECK COMPLETO');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const botsWithTrades = allBots.filter(b => b.trades > 0).length;
    const botsWithPositions = allBots.filter(b => b.openPositions > 0).length;
    const botsIdle = allBots.filter(b => b.trades === 0).length;

    lines.push(`🤖 Bots Operando: ${botsWithTrades}/${data.totalBots}`);
    lines.push(`📊 Bots com Posições: ${botsWithPositions}/${data.totalBots}`);
    lines.push(`💤 Bots Idle: ${botsIdle}/${data.totalBots}`);
    lines.push(`💪 Taxa de Atividade: ${(botsWithTrades / data.totalBots * 100).toFixed(1)}%`);
    lines.push('');

    // Status de saúde geral
    let healthStatus = '🟢 EXCELENTE';
    if (data.drawdown > 3) healthStatus = '🟡 BOM';
    if (data.drawdown > 5) healthStatus = '🟠 ATENÇÃO';
    if (data.drawdown > 10) healthStatus = '🔴 CRÍTICO';

    lines.push(`🏥 Status Geral: ${healthStatus}`);
    lines.push(`📉 Drawdown: ${data.drawdown.toFixed(2)}%`);
    lines.push(`🛡️ Survival Rate DNA: ${(data.dnaMemory.survivalRate * 100).toFixed(1)}%`);
    lines.push('');

    // FOOTER
    lines.push('╔═══════════════════════════════════╗');
    lines.push('║  🤖 Diana Corporação Senciente    ║');
    lines.push('║     Mycelium Ecosystem v2.0       ║');
    lines.push('║    Ultra Verbose Report - 50+     ║');
    lines.push('╚═══════════════════════════════════╝');

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
      logger.warn('WhatsApp Bridge não disponível, usando console', {
        type: 'WHATSAPP_FALLBACK'
      });
      console.log('\n' + message + '\n');
    }
  }

  /**
   * Calcula horário do próximo checkpoint
   */
  private getNextCheckpoint(): string {
    const now = new Date();
    const next = new Date(now.getTime() + 6 * 60 * 60 * 1000); // +6h
    return next.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  }
}

export const whatsappReporter = new WhatsAppReporter();
