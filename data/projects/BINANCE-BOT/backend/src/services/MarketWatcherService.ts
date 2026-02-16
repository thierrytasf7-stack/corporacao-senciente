/**
 * =============================================================================
 * CORPORACAO SENCIENTE - Market Watcher Service
 * Industry 7.0 Ready - Vigilância de Múltiplos Mercados Simultaneamente
 * =============================================================================
 */

import { EventEmitter } from 'events';

// Market data types
export interface MarketTicker {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastUpdate: Date;
}

export interface MarketCandle {
  symbol: string;
  interval: string;
  openTime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: Date;
}

export interface MarketAlert {
  id: string;
  symbol: string;
  type: 'PRICE_SPIKE' | 'VOLUME_SURGE' | 'VOLATILITY' | 'TREND_CHANGE' | 'CUSTOM';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data: Record<string, any>;
  timestamp: Date;
}

export interface WatchConfig {
  symbols: string[];
  updateIntervalMs: number;
  alertThresholds: {
    priceChangePercent: number;
    volumeSurgeMultiplier: number;
    volatilityThreshold: number;
  };
}

const DEFAULT_CONFIG: WatchConfig = {
  symbols: [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
    'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  ],
  updateIntervalMs: 5000,
  alertThresholds: {
    priceChangePercent: 3.0,
    volumeSurgeMultiplier: 2.0,
    volatilityThreshold: 0.05,
  },
};

export class MarketWatcherService extends EventEmitter {
  private config: WatchConfig;
  private tickers: Map<string, MarketTicker> = new Map();
  private candles: Map<string, MarketCandle[]> = new Map();
  private alerts: MarketAlert[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timer | null = null;
  private previousVolumes: Map<string, number> = new Map();

  constructor(config: Partial<WatchConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[MarketWatcher] Service initialized');
    console.log('[MarketWatcher] Watching symbols:', this.config.symbols);
  }

  /**
   * Start watching markets
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[MarketWatcher] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[MarketWatcher] Starting market surveillance...');
    
    // Initial fetch
    await this.fetchAllTickers();
    
    // Start polling
    this.intervalId = setInterval(async () => {
      await this.fetchAllTickers();
    }, this.config.updateIntervalMs);

    this.emit('started');
  }

  /**
   * Stop watching markets
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('[MarketWatcher] Stopped market surveillance');
    this.emit('stopped');
  }

  /**
   * Fetch all tickers (simulated - in production use Binance WebSocket)
   */
  private async fetchAllTickers(): Promise<void> {
    try {
      // In production, this would use the Binance API
      // For now, we simulate with realistic data patterns
      for (const symbol of this.config.symbols) {
        const ticker = await this.fetchTicker(symbol);
        this.processTicker(ticker);
      }
    } catch (error) {
      console.error('[MarketWatcher] Error fetching tickers:', error);
      this.emit('error', error);
    }
  }

  /**
   * Fetch single ticker (simulated)
   */
  private async fetchTicker(symbol: string): Promise<MarketTicker> {
    // Get previous ticker or create base
    const previous = this.tickers.get(symbol);
    const basePrice = previous?.price || this.getBasePrice(symbol);
    
    // Simulate price movement (±2%)
    const priceChange = basePrice * (Math.random() * 0.04 - 0.02);
    const price = basePrice + priceChange;
    
    // Simulate volume
    const baseVolume = this.getBaseVolume(symbol);
    const volume = baseVolume * (0.8 + Math.random() * 0.4);

    const ticker: MarketTicker = {
      symbol,
      price,
      priceChange24h: priceChange,
      priceChangePercent24h: (priceChange / basePrice) * 100,
      high24h: price * 1.03,
      low24h: price * 0.97,
      volume24h: volume,
      quoteVolume24h: volume * price,
      lastUpdate: new Date(),
    };

    return ticker;
  }

  /**
   * Process ticker and check for alerts
   */
  private processTicker(ticker: MarketTicker): void {
    const previous = this.tickers.get(ticker.symbol);
    this.tickers.set(ticker.symbol, ticker);

    // Check for alerts
    this.checkPriceAlert(ticker, previous);
    this.checkVolumeAlert(ticker);
    this.checkVolatilityAlert(ticker, previous);

    this.emit('ticker', ticker);
  }

  /**
   * Check for price spike alert
   */
  private checkPriceAlert(ticker: MarketTicker, previous?: MarketTicker): void {
    if (!previous) return;

    const changePercent = Math.abs((ticker.price - previous.price) / previous.price * 100);
    
    if (changePercent >= this.config.alertThresholds.priceChangePercent) {
      const direction = ticker.price > previous.price ? 'UP' : 'DOWN';
      const alert: MarketAlert = {
        id: `ALERT-${ticker.symbol}-${Date.now()}`,
        symbol: ticker.symbol,
        type: 'PRICE_SPIKE',
        message: `${ticker.symbol} price ${direction} ${changePercent.toFixed(2)}%`,
        severity: changePercent >= 5 ? 'HIGH' : 'MEDIUM',
        data: {
          previousPrice: previous.price,
          currentPrice: ticker.price,
          changePercent,
          direction,
        },
        timestamp: new Date(),
      };

      this.addAlert(alert);
    }
  }

  /**
   * Check for volume surge alert
   */
  private checkVolumeAlert(ticker: MarketTicker): void {
    const previousVolume = this.previousVolumes.get(ticker.symbol) || ticker.volume24h;
    this.previousVolumes.set(ticker.symbol, ticker.volume24h);

    if (ticker.volume24h > previousVolume * this.config.alertThresholds.volumeSurgeMultiplier) {
      const alert: MarketAlert = {
        id: `ALERT-${ticker.symbol}-VOL-${Date.now()}`,
        symbol: ticker.symbol,
        type: 'VOLUME_SURGE',
        message: `${ticker.symbol} volume surge detected`,
        severity: 'MEDIUM',
        data: {
          previousVolume,
          currentVolume: ticker.volume24h,
          multiplier: ticker.volume24h / previousVolume,
        },
        timestamp: new Date(),
      };

      this.addAlert(alert);
    }
  }

  /**
   * Check for volatility alert
   */
  private checkVolatilityAlert(ticker: MarketTicker, previous?: MarketTicker): void {
    if (!previous) return;

    const volatility = Math.abs(ticker.high24h - ticker.low24h) / ticker.price;
    
    if (volatility >= this.config.alertThresholds.volatilityThreshold) {
      const alert: MarketAlert = {
        id: `ALERT-${ticker.symbol}-VOLT-${Date.now()}`,
        symbol: ticker.symbol,
        type: 'VOLATILITY',
        message: `${ticker.symbol} high volatility: ${(volatility * 100).toFixed(2)}%`,
        severity: volatility >= 0.1 ? 'HIGH' : 'LOW',
        data: {
          volatility,
          high: ticker.high24h,
          low: ticker.low24h,
          spread: ticker.high24h - ticker.low24h,
        },
        timestamp: new Date(),
      };

      this.addAlert(alert);
    }
  }

  /**
   * Add alert and emit event
   */
  private addAlert(alert: MarketAlert): void {
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    console.log(`[MarketWatcher] ALERT: ${alert.message}`);
    this.emit('alert', alert);
  }

  /**
   * Get base price for symbol (simulated)
   */
  private getBasePrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'BTCUSDT': 95000,
      'ETHUSDT': 3300,
      'BNBUSDT': 680,
      'SOLUSDT': 210,
      'XRPUSDT': 2.5,
      'ADAUSDT': 0.95,
      'DOGEUSDT': 0.35,
      'AVAXUSDT': 38,
      'DOTUSDT': 7.2,
      'MATICUSDT': 0.48,
    };
    return basePrices[symbol] || 100;
  }

  /**
   * Get base volume for symbol (simulated)
   */
  private getBaseVolume(symbol: string): number {
    const baseVolumes: Record<string, number> = {
      'BTCUSDT': 50000,
      'ETHUSDT': 200000,
      'BNBUSDT': 500000,
      'SOLUSDT': 1000000,
      'XRPUSDT': 500000000,
      'ADAUSDT': 100000000,
      'DOGEUSDT': 1000000000,
      'AVAXUSDT': 5000000,
      'DOTUSDT': 10000000,
      'MATICUSDT': 200000000,
    };
    return baseVolumes[symbol] || 1000000;
  }

  /**
   * Get all current tickers
   */
  getTickers(): Map<string, MarketTicker> {
    return new Map(this.tickers);
  }

  /**
   * Get ticker for specific symbol
   */
  getTicker(symbol: string): MarketTicker | undefined {
    return this.tickers.get(symbol);
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 20): MarketAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Add symbol to watch list
   */
  addSymbol(symbol: string): void {
    if (!this.config.symbols.includes(symbol)) {
      this.config.symbols.push(symbol);
      console.log(`[MarketWatcher] Added ${symbol} to watch list`);
    }
  }

  /**
   * Remove symbol from watch list
   */
  removeSymbol(symbol: string): void {
    const index = this.config.symbols.indexOf(symbol);
    if (index > -1) {
      this.config.symbols.splice(index, 1);
      this.tickers.delete(symbol);
      console.log(`[MarketWatcher] Removed ${symbol} from watch list`);
    }
  }

  /**
   * Get watched symbols
   */
  getWatchedSymbols(): string[] {
    return [...this.config.symbols];
  }

  /**
   * Check if running
   */
  getStatus(): { running: boolean; symbolCount: number; alertCount: number } {
    return {
      running: this.isRunning,
      symbolCount: this.config.symbols.length,
      alertCount: this.alerts.length,
    };
  }
}

// Singleton instance
let instance: MarketWatcherService | null = null;

export function getMarketWatcherService(config?: Partial<WatchConfig>): MarketWatcherService {
  if (!instance) {
    instance = new MarketWatcherService(config);
  }
  return instance;
}

export default MarketWatcherService;
