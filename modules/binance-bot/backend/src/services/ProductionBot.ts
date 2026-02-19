/**
 * ProductionBot v2.0 — TRADING REAL na Binance Testnet
 *
 * SPOT executor  (TRADING_TYPE=SPOT):    Usa spot testnet keys → testnet.binance.vision
 * FUTURES executor (TRADING_TYPE=FUTURES): Usa futures testnet keys → testnet.binancefuture.com
 *
 * Pipeline:
 *   1. Conecta BinanceApiService (real)
 *   2. RSI(14) em velas 15m → sinal de entrada
 *   3. Abre posição com risk management (2% FUTURES / 15% SPOT)
 *   4. Monitora TP/SL a cada 30s
 *   5. Recarrega estratégias campeãs do DNA Arena a cada 10min
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { BinanceApiService } from './BinanceApiService';

dotenv.config();

// ─── Arquivos ──────────────────────────────────────────────────────────────────
const STRATEGIES_FILE   = path.join(__dirname, '../../data/futures-strategies/strategies.json');
const PRODUCTION_LOG    = path.join(__dirname, '../../logs/production-trades.log');
const OPEN_TRADES_FILE  = path.join(__dirname, '../../data/open-trades.json');

// ─── Constantes ────────────────────────────────────────────────────────────────
const SYMBOLS         = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
const RSI_PERIOD      = 14;
const RSI_OVERSOLD    = 35;   // → LONG / BUY
const RSI_OVERBOUGHT  = 65;   // → SHORT (futures only)
const MAX_POSITIONS   = 3;
const LOOP_INTERVAL   = 30_000; // 30s
const SYNC_INTERVAL   = 600_000; // 10min — recarrega campeões

// ─── Interfaces ────────────────────────────────────────────────────────────────
export interface ProductionStrategy {
  id: string;
  name: string;
  isActive: boolean;
  tradingType: 'FUTURES';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tpMultiplier: number;
  slMultiplier: number;
  trailingMultiplier: number;
  leverage: number;
  sourceBot: string;
  syncedAt: string;
}

export interface ProductionTrade {
  tradeId: string;
  strategyId: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  leverage: number;
  tpPrice: number;
  slPrice: number;
  timestamp: string;
  status: 'OPEN' | 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_MANUAL';
  pnl?: number;
  closePrice?: number;
  closeTimestamp?: string;
}

export interface ProductionBotConfig {
  name: string;
  useTestnet: boolean;
  apiKey: string;
  apiSecret: string;
  initialCapital: number;
  maxPositionSize: number;
  maxDailyLoss: number;
  maxDrawdownPercent: number;
  futuresApiUrl?: string; // URL base da API futures (ex: https://testnet.binancefuture.com)
}

// ─── Classe ────────────────────────────────────────────────────────────────────
export class ProductionBot {
  private binance!: BinanceApiService;
  private strategies: ProductionStrategy[] = [];
  private openTrades: Map<string, ProductionTrade> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private loopInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private totalPnl: number = 0;
  private tradesCount: number = 0;
  private wins: number = 0;
  private losses: number = 0;
  private config: ProductionBotConfig;
  private tradingType: 'FUTURES' | 'SPOT';

  constructor(config?: Partial<ProductionBotConfig>) {
    const useTestnet = config?.useTestnet ?? (process.env.BINANCE_USE_TESTNET === 'true');
    this.tradingType = (process.env.TRADING_TYPE as 'FUTURES' | 'SPOT') || 'FUTURES';

    // Carregar keys do arquivo específico de tipo: .env.{testnet|mainnet}-{futures|spot}
    const netLabel  = useTestnet ? 'testnet' : 'mainnet';
    const typeLabel = this.tradingType.toLowerCase();
    const envFile   = `.env.${netLabel}-${typeLabel}`;    // ex: .env.testnet-futures
    const envPath   = path.resolve(__dirname, '..', '..', envFile);
    let networkEnv: Record<string, string> = {};
    try {
      const result = dotenv.config({ path: envPath });
      if (result.parsed) {
        networkEnv = result.parsed;
        console.log(`📂 [ProductionBot] Env carregado: ${envFile}`);
      }
    } catch { /* fallback para process.env */ }

    this.config = {
      name: config?.name || `ProductionBot-${this.tradingType}-${useTestnet ? 'TESTNET' : 'MAINNET'}`,
      useTestnet,
      apiKey:    config?.apiKey    || networkEnv.BINANCE_API_KEY    || process.env.BINANCE_API_KEY    || '',
      apiSecret: config?.apiSecret || networkEnv.BINANCE_API_SECRET || process.env.BINANCE_API_SECRET || '',
      initialCapital:    config?.initialCapital    || Number(networkEnv.INITIAL_CAPITAL)       || 2500,
      maxPositionSize:   config?.maxPositionSize   || Number(networkEnv.MAX_POSITION_SIZE)     || 100,
      maxDailyLoss:      config?.maxDailyLoss      || Number(networkEnv.MAX_DAILY_LOSS)        || 500,
      maxDrawdownPercent: config?.maxDrawdownPercent || Number(networkEnv.MAX_DRAWDOWN_PERCENT) || 10,
      futuresApiUrl: networkEnv.BINANCE_API_URL || undefined,
    };

    // Restaurar trades abertos (se existirem)
    this.loadOpenTrades();
  }

  // ─── INICIALIZAÇÃO ──────────────────────────────────────────────────────────

  async start(): Promise<void> {
    const label = `[${this.config.name}]`;
    console.log(`🚀 ${label} Iniciando bot ${this.tradingType} ${this.config.useTestnet ? 'TESTNET' : 'MAINNET'}...`);

    if (!this.config.apiKey || !this.config.apiSecret) {
      console.error(`❌ ${label} API Keys não configuradas em .env.${this.config.useTestnet ? 'testnet' : 'mainnet'}`);
      if (this.tradingType === 'FUTURES' && this.config.useTestnet) {
        console.error(`   ➜ Obtenha chaves em: https://testnet.binancefuture.com → "My Account" → "API Key"`);
      } else {
        console.error(`   ➜ Obtenha chaves em: https://testnet.binance.vision → "Generate HMAC_SHA256 Key"`);
      }
      return;
    }

    // Instanciar BinanceApiService
    // BINANCE_API_URL no env específico (ex: https://testnet.binancefuture.com) sobrescreve URL futures
    this.binance = new BinanceApiService({
      apiKey:                this.config.apiKey,
      secretKey:             this.config.apiSecret,
      isTestnet:             this.config.useTestnet,
      futuresTestnet:        this.config.useTestnet && this.tradingType === 'FUTURES',
      futuresBaseURLOverride: (this.tradingType === 'FUTURES' && this.config.futuresApiUrl)
                               ? this.config.futuresApiUrl : undefined,
    });

    // Testar conectividade
    try {
      if (this.tradingType === 'FUTURES') {
        const balance = await this.getFuturesBalance();
        console.log(`✅ ${label} Conectado ao Futures Testnet`);
        console.log(`💰 ${label} Saldo USDT: $${balance.toFixed(2)}`);
      } else {
        const accountInfo = await this.binance.getAccountInfo();
        const usdtBalance = accountInfo.balances.find((b: any) => b.asset === 'USDT');
        const free = parseFloat(usdtBalance?.free || '0');
        console.log(`✅ ${label} Conectado ao Spot Testnet`);
        console.log(`💰 ${label} Saldo USDT livre: $${free.toFixed(2)}`);
      }
    } catch (err: any) {
      console.error(`❌ ${label} Falha ao conectar: ${err.message}`);
      console.error(`   Verifique as API Keys e permissões de trading.`);
      return;
    }

    // Carregar estratégias campeãs
    this.loadStrategies();

    // Iniciar loops
    this.isRunning = true;
    this.startTradingLoop();
    this.startSyncInterval();

    console.log(`✅ ${label} Bot iniciado com ${this.strategies.length} estratégias campeãs`);
    console.log(`📊 ${label} Modo: ${this.tradingType} | Símbolos: ${SYMBOLS.join(', ')}`);
    console.log(`⏰ ${label} Loop: ${LOOP_INTERVAL / 1000}s | Sync estratégias: ${SYNC_INTERVAL / 60000}min`);
  }

  stop(): void {
    this.isRunning = false;
    if (this.loopInterval)  { clearInterval(this.loopInterval);  this.loopInterval  = null; }
    if (this.syncInterval)  { clearInterval(this.syncInterval);  this.syncInterval  = null; }
    this.saveOpenTrades();
    console.log(`🛑 [${this.config.name}] Bot parado. Trades salvos.`);
  }

  // ─── LOOPS ──────────────────────────────────────────────────────────────────

  private startTradingLoop(): void {
    this.loopInterval = setInterval(async () => {
      if (!this.isRunning) return;
      try {
        await this.checkSignals();
        await this.manageOpenTrades();
      } catch (err: any) {
        console.error(`⚠️ [${this.config.name}] Erro no loop: ${err.message}`);
      }
    }, LOOP_INTERVAL);

    // Primeira execução imediata
    setTimeout(() => this.checkSignals().catch(() => {}), 5000);
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      this.loadStrategies();
      this.logPerformance();
    }, SYNC_INTERVAL);
  }

  // ─── SINAIS RSI ─────────────────────────────────────────────────────────────

  private async checkSignals(): Promise<void> {
    if (this.openTrades.size >= MAX_POSITIONS) return;

    for (const symbol of SYMBOLS) {
      // Não abre nova posição se já tem uma aberta neste símbolo
      const alreadyOpen = [...this.openTrades.values()].some(t => t.symbol === symbol && t.status === 'OPEN');
      if (alreadyOpen) continue;

      try {
        const rsi = await this.getRSI(symbol);
        if (rsi === null) continue;

        const label = `[${this.config.name}]`;

        if (rsi < RSI_OVERSOLD) {
          console.log(`📈 ${label} ${symbol} RSI=${rsi.toFixed(1)} < ${RSI_OVERSOLD} → LONG/BUY`);
          await this.openPosition(symbol, 'LONG', rsi);
        } else if (rsi > RSI_OVERBOUGHT && this.tradingType === 'FUTURES') {
          console.log(`📉 ${label} ${symbol} RSI=${rsi.toFixed(1)} > ${RSI_OVERBOUGHT} → SHORT`);
          await this.openPosition(symbol, 'SHORT', rsi);
        } else {
          console.log(`➖ ${label} ${symbol} RSI=${rsi.toFixed(1)} — sem sinal`);
        }
      } catch (err: any) {
        console.warn(`⚠️ [${this.config.name}] Erro ao verificar sinal ${symbol}: ${err.message}`);
      }
    }
  }

  private async getRSI(symbol: string): Promise<number | null> {
    try {
      let candles: any[];
      if (this.tradingType === 'FUTURES') {
        candles = await this.binance.getFuturesKlines(symbol, '15m', RSI_PERIOD + 1);
      } else {
        candles = await this.binance.getKlines(symbol, '15m', RSI_PERIOD + 1);
      }

      if (!candles || candles.length < RSI_PERIOD + 1) return null;

      const closes = candles.map((c: any) => parseFloat(c.close));
      return this.calculateRSI(closes);
    } catch {
      return null;
    }
  }

  private calculateRSI(closes: number[]): number {
    let gains = 0, losses = 0;
    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains  += diff;
      else           losses += Math.abs(diff);
    }
    const n = closes.length - 1;
    const avgGain = gains  / n;
    const avgLoss = losses / n;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // ─── ABRIR POSIÇÃO ──────────────────────────────────────────────────────────

  private async openPosition(symbol: string, side: 'LONG' | 'SHORT', rsi: number): Promise<void> {
    const label = `[${this.config.name}]`;
    const strategy = this.getBestStrategy();
    const tradeId = `${symbol}-${Date.now()}`;

    try {
      let entryPrice: number;
      let quantity: number;

      if (this.tradingType === 'FUTURES') {
        // ── FUTURES ──────────────────────────────────────────────
        const balance = await this.getFuturesBalance();
        const leverage = Math.min(strategy.leverage, 10); // cap testnet em 10x
        entryPrice = await this.getFuturesPrice(symbol);
        if (!entryPrice) throw new Error('Preço futures indisponível');

        const riskUsdt = balance * 0.02; // 2% do saldo
        quantity = this.roundQty(symbol, (riskUsdt * leverage) / entryPrice);
        if (quantity <= 0) throw new Error('Quantidade insuficiente');

        // Configurar leverage
        await this.binance.setFuturesLeverage(symbol, leverage).catch(() => {});
        await this.binance.setFuturesMarginType(symbol, 'CROSSED').catch(() => {});

        // Colocar ordem
        const orderSide = side === 'LONG' ? 'BUY' : 'SELL';
        const result = await this.binance.placeFuturesOrder({
          symbol,
          side: orderSide,
          type: 'MARKET',
          quantity: this.formatQty(symbol, quantity),
          positionSide: 'BOTH',
        });

        if (!result.success) throw new Error(result.message || 'Ordem futures rejeitada');
        console.log(`✅ ${label} FUTURES ${side} ${quantity} ${symbol} @ ~$${entryPrice.toFixed(2)} | lev=${leverage}x`);

      } else {
        // ── SPOT ──────────────────────────────────────────────────
        if (side === 'SHORT') return; // Spot não tem short sem margin

        const accountInfo = await this.binance.getAccountInfo();
        const usdtBalance = accountInfo.balances.find((b: any) => b.asset === 'USDT');
        const freeUsdt = parseFloat(usdtBalance?.free || '0');
        if (freeUsdt < 10) throw new Error(`Saldo USDT insuficiente: $${freeUsdt}`);

        const quoteQty = Math.min(freeUsdt * 0.15, this.config.maxPositionSize).toFixed(2);
        entryPrice = await this.getSpotPrice(symbol);
        if (!entryPrice) throw new Error('Preço spot indisponível');

        const result = await this.binance.placeMarketBuyQuote({ symbol, quoteOrderQty: quoteQty });
        if (!result.success) throw new Error(result.message || 'Ordem spot rejeitada');

        // Calcular quantidade comprada
        quantity = result.data?.executedQty
          ? parseFloat(result.data.executedQty)
          : parseFloat(quoteQty) / entryPrice;

        console.log(`✅ ${label} SPOT BUY ~${quantity.toFixed(6)} ${symbol} (≈$${quoteQty}) @ ~$${entryPrice.toFixed(2)}`);
      }

      // TP/SL baseados na estratégia campeã
      const tpPct = strategy.tpMultiplier * 0.005; // 0.5% por unidade
      const slPct = strategy.slMultiplier * 0.005;
      const tpPrice = side === 'LONG'
        ? entryPrice * (1 + tpPct)
        : entryPrice * (1 - tpPct);
      const slPrice = side === 'LONG'
        ? entryPrice * (1 - slPct)
        : entryPrice * (1 + slPct);

      const trade: ProductionTrade = {
        tradeId,
        strategyId: strategy.id,
        symbol,
        side,
        entryPrice,
        quantity,
        leverage: Math.min(strategy.leverage, 10),
        tpPrice,
        slPrice,
        timestamp: new Date().toISOString(),
        status: 'OPEN',
      };

      this.openTrades.set(tradeId, trade);
      this.saveOpenTrades();

      console.log(`📊 ${label} Trade registrado: TP=$${tpPrice.toFixed(2)} (+${(tpPct*100).toFixed(2)}%) | SL=$${slPrice.toFixed(2)} (-${(slPct*100).toFixed(2)}%)`);

    } catch (err: any) {
      console.error(`❌ ${label} Falha ao abrir posição ${symbol}: ${err.message}`);
    }
  }

  // ─── GERENCIAR TRADES ABERTOS ───────────────────────────────────────────────

  private async manageOpenTrades(): Promise<void> {
    if (this.openTrades.size === 0) return;

    for (const [tradeId, trade] of this.openTrades) {
      if (trade.status !== 'OPEN') continue;

      try {
        const currentPrice = this.tradingType === 'FUTURES'
          ? await this.getFuturesPrice(trade.symbol)
          : await this.getSpotPrice(trade.symbol);

        if (!currentPrice) continue;

        const hitTP = trade.side === 'LONG' ? currentPrice >= trade.tpPrice : currentPrice <= trade.tpPrice;
        const hitSL = trade.side === 'LONG' ? currentPrice <= trade.slPrice : currentPrice >= trade.slPrice;

        if (hitTP) {
          await this.closePosition(trade, currentPrice, 'CLOSED_TP');
        } else if (hitSL) {
          await this.closePosition(trade, currentPrice, 'CLOSED_SL');
        }
      } catch (err: any) {
        console.warn(`⚠️ [${this.config.name}] Erro ao monitorar ${trade.symbol}: ${err.message}`);
      }
    }
  }

  private async closePosition(
    trade: ProductionTrade,
    closePrice: number,
    reason: 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_MANUAL'
  ): Promise<void> {
    const label = `[${this.config.name}]`;

    try {
      if (this.tradingType === 'FUTURES') {
        const closeSide = trade.side === 'LONG' ? 'SELL' : 'BUY';
        const result = await this.binance.placeFuturesOrder({
          symbol: trade.symbol,
          side: closeSide,
          type: 'MARKET',
          quantity: this.formatQty(trade.symbol, trade.quantity),
          positionSide: 'BOTH',
        });
        if (!result.success) throw new Error(result.message || 'Falha ao fechar futures');
      } else {
        // SPOT: vender toda a quantidade comprada
        await this.binance.marketSell(trade.symbol, trade.quantity);
      }

      // Calcular PnL
      const priceDiff = trade.side === 'LONG'
        ? closePrice - trade.entryPrice
        : trade.entryPrice - closePrice;
      const pnl = priceDiff * trade.quantity * (this.tradingType === 'FUTURES' ? trade.leverage : 1);

      trade.status = reason;
      trade.closePrice = closePrice;
      trade.closeTimestamp = new Date().toISOString();
      trade.pnl = pnl;

      this.totalPnl += pnl;
      this.tradesCount++;
      if (pnl > 0) this.wins++; else this.losses++;

      const emoji = reason === 'CLOSED_TP' ? '🎯' : '🛑';
      console.log(`${emoji} ${label} ${reason} — ${trade.symbol} ${trade.side}`);
      console.log(`   Entrada: $${trade.entryPrice.toFixed(2)} | Saída: $${closePrice.toFixed(2)} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(4)}`);

      this.openTrades.delete(trade.tradeId);
      this.saveOpenTrades();
      this.appendLog(trade);

    } catch (err: any) {
      console.error(`❌ ${label} Falha ao fechar ${trade.symbol}: ${err.message}`);
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private async getFuturesBalance(): Promise<number> {
    const balances = await this.binance.getFuturesBalance();
    const usdt = balances.find((b: any) => b.asset === 'USDT');
    return usdt ? parseFloat(usdt.availableBalance || usdt.balance || '0') : 0;
  }

  private async getFuturesPrice(symbol: string): Promise<number> {
    const p = await this.binance.getFuturesPrice(symbol);
    return p || 0;
  }

  private async getSpotPrice(symbol: string): Promise<number> {
    const p = await this.binance.getCurrentPrice(symbol);
    return p || 0;
  }

  /** Arredonda a quantidade conforme precisão mínima da Binance Futures */
  private roundQty(symbol: string, qty: number): number {
    // Futures precision (decimal places): BTCUSDT=3, ETHUSDT=3, SOLUSDT=0 (inteiro)
    const decimals: Record<string, number> = {
      BTCUSDT: 3, ETHUSDT: 3, SOLUSDT: 0, BNBUSDT: 2, XRPUSDT: 1,
    };
    const d = decimals[symbol] ?? 2;
    const factor = Math.pow(10, d);
    return Math.floor(qty * factor) / factor;
  }

  /** Formata quantidade sem zeros desnecessários */
  private formatQty(symbol: string, qty: number): string {
    const decimals: Record<string, number> = {
      BTCUSDT: 3, ETHUSDT: 3, SOLUSDT: 0, BNBUSDT: 2, XRPUSDT: 1,
    };
    const d = decimals[symbol] ?? 2;
    return qty.toFixed(d);
  }

  private getBestStrategy(): ProductionStrategy {
    const active = this.strategies.filter(s => s.isActive);
    if (active.length === 0) {
      return {
        id: 'default', name: 'Default', isActive: true, tradingType: 'FUTURES',
        riskLevel: 'MEDIUM', tpMultiplier: 2.5, slMultiplier: 1.2,
        trailingMultiplier: 1.5, leverage: 5, sourceBot: 'default',
        syncedAt: new Date().toISOString(),
      };
    }
    // Pega a estratégia com maior tpMultiplier (mais agressiva)
    return active.reduce((best, s) => s.tpMultiplier > best.tpMultiplier ? s : best, active[0]);
  }

  private loadStrategies(): void {
    try {
      if (!fs.existsSync(STRATEGIES_FILE)) {
        console.warn(`⚠️ [${this.config.name}] strategies.json não encontrado — usando padrão`);
        return;
      }
      this.strategies = JSON.parse(fs.readFileSync(STRATEGIES_FILE, 'utf-8'));
      console.log(`🔄 [${this.config.name}] ${this.strategies.length} estratégias campeãs carregadas`);
    } catch (err: any) {
      console.error(`❌ [${this.config.name}] Erro ao carregar estratégias: ${err.message}`);
    }
  }

  private loadOpenTrades(): void {
    try {
      if (!fs.existsSync(OPEN_TRADES_FILE)) return;
      const data = JSON.parse(fs.readFileSync(OPEN_TRADES_FILE, 'utf-8'));
      const botKey = this.config.name;
      if (data[botKey]) {
        for (const trade of data[botKey]) {
          if (trade.status === 'OPEN') this.openTrades.set(trade.tradeId, trade);
        }
        console.log(`♻️ [${this.config.name}] ${this.openTrades.size} trades abertos restaurados`);
      }
    } catch { /* ignora */ }
  }

  private saveOpenTrades(): void {
    try {
      const dir = path.dirname(OPEN_TRADES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let all: Record<string, ProductionTrade[]> = {};
      if (fs.existsSync(OPEN_TRADES_FILE)) {
        all = JSON.parse(fs.readFileSync(OPEN_TRADES_FILE, 'utf-8'));
      }
      all[this.config.name] = [...this.openTrades.values()];
      fs.writeFileSync(OPEN_TRADES_FILE, JSON.stringify(all, null, 2));
    } catch { /* ignora */ }
  }

  private appendLog(trade: ProductionTrade): void {
    try {
      const dir = path.dirname(PRODUCTION_LOG);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(PRODUCTION_LOG, JSON.stringify({ bot: this.config.name, ...trade }) + '\n');
    } catch { /* ignora */ }
  }

  private logPerformance(): void {
    const winRate = this.tradesCount > 0 ? ((this.wins / this.tradesCount) * 100).toFixed(1) : '0';
    console.log(`📊 [${this.config.name}] Performance:`);
    console.log(`   └─ Trades: ${this.tradesCount} | Win: ${this.wins} | Loss: ${this.losses} | WR: ${winRate}%`);
    console.log(`   └─ PnL Total: ${this.totalPnl >= 0 ? '+' : ''}$${this.totalPnl.toFixed(4)}`);
    console.log(`   └─ Posições abertas: ${this.openTrades.size}`);
  }

  getStatus(): any {
    const winRate = this.tradesCount > 0 ? ((this.wins / this.tradesCount) * 100).toFixed(1) : '0';
    return {
      isRunning:       this.isRunning,
      tradingType:     this.tradingType,
      network:         this.config.useTestnet ? 'TESTNET' : 'MAINNET',
      strategiesCount: this.strategies.length,
      openTrades:      this.openTrades.size,
      tradesCount:     this.tradesCount,
      wins:            this.wins,
      losses:          this.losses,
      winRate:         `${winRate}%`,
      totalPnl:        this.totalPnl,
    };
  }
}

// ─── Singletons ────────────────────────────────────────────────────────────────
export const productionBotTestnet = new ProductionBot({
  name: 'ProductionBot-TESTNET',
  useTestnet: true,
});

export const productionBotMainnet = new ProductionBot({
  name: 'ProductionBot-MAINNET',
  useTestnet: false,
});

export const productionBot = productionBotTestnet;
