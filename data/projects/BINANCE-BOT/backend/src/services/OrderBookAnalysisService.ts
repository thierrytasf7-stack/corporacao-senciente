import { logger } from '../utils/logger';
import BinanceApiService from './BinanceApiService';

export interface OrderBookSnapshot {
  symbol: string;
  timestamp: number;
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][]; // [price, quantity]
  spread: number;
  bidVolume: number;
  askVolume: number;
}

export interface MarketDepthAnalysis {
  symbol: string;
  timestamp: number;
  buyPressure: number; // 0-100
  sellPressure: number; // 0-100
  spread: number;
  volumeImbalance: number; // -100 to 100, negative means more sell pressure
  priceLevel: {
    support: number;
    resistance: number;
  };
}

export class OrderBookAnalysisService {
  private binanceApi: BinanceApiService;
  private snapshots: Map<string, OrderBookSnapshot[]>;
  private readonly MAX_SNAPSHOTS = 100;

  constructor(binanceApi: BinanceApiService) {
    this.binanceApi = binanceApi;
    this.snapshots = new Map();
  }

  /**
   * Start monitoring order book for a symbol
   */
  async startMonitoring(symbol: string): Promise<void> {
    try {
      // Inicializar array de snapshots para o símbolo
      if (!this.snapshots.has(symbol)) {
        this.snapshots.set(symbol, []);
      }

      // Obter snapshot inicial
      const initialBook = await this.binanceApi.getOrderBook(symbol);
      this.processSnapshot(symbol, initialBook);

      // Subscrever atualizações em tempo real
      this.binanceApi.subscribeToOrderBook(symbol, (update) => {
        this.processSnapshot(symbol, update);
      });

      logger.info(`Started monitoring order book for ${symbol}`);
    } catch (error: any) {
      logger.error(`Failed to start monitoring ${symbol}:`, error);
      throw new Error(`Failed to start monitoring ${symbol}: ${error.message}`);
    }
  }

  /**
   * Process new order book snapshot
   */
  private processSnapshot(symbol: string, data: any): void {
    const bids = data.bids as [string, string][];
    const asks = data.asks as [string, string][];

    const snapshot: OrderBookSnapshot = {
      symbol,
      timestamp: Date.now(),
      bids,
      asks,
      spread: this.calculateSpread(bids[0][0], asks[0][0]),
      bidVolume: this.calculateVolume(bids),
      askVolume: this.calculateVolume(asks)
    };

    const snapshots = this.snapshots.get(symbol) || [];
    snapshots.push(snapshot);

    // Manter apenas os últimos MAX_SNAPSHOTS snapshots
    if (snapshots.length > this.MAX_SNAPSHOTS) {
      snapshots.shift();
    }

    this.snapshots.set(symbol, snapshots);
  }

  /**
   * Analyze current market depth
   */
  analyzeMarketDepth(symbol: string): MarketDepthAnalysis {
    const snapshots = this.snapshots.get(symbol);
    if (!snapshots || snapshots.length === 0) {
      throw new Error(`No snapshots available for ${symbol}`);
    }

    const current = snapshots[snapshots.length - 1];
    
    // Calcular pressão de compra/venda
    const buyPressure = this.calculateBuyPressure(current);
    const sellPressure = this.calculateSellPressure(current);
    
    // Calcular desequilíbrio de volume
    const volumeImbalance = this.calculateVolumeImbalance(current);

    // Identificar níveis de suporte/resistência
    const priceLevel = this.identifyPriceLevels(current);

    return {
      symbol,
      timestamp: current.timestamp,
      buyPressure,
      sellPressure,
      spread: current.spread,
      volumeImbalance,
      priceLevel
    };
  }

  /**
   * Calculate spread between best bid and ask
   */
  private calculateSpread(bestBid: string, bestAsk: string): number {
    return parseFloat(bestAsk) - parseFloat(bestBid);
  }

  /**
   * Calculate total volume for bids or asks
   */
  private calculateVolume(orders: [string, string][]): number {
    return orders.reduce((sum, [_, quantity]) => sum + parseFloat(quantity), 0);
  }

  /**
   * Calculate buy pressure (0-100)
   */
  private calculateBuyPressure(snapshot: OrderBookSnapshot): number {
    const totalVolume = snapshot.bidVolume + snapshot.askVolume;
    return (snapshot.bidVolume / totalVolume) * 100;
  }

  /**
   * Calculate sell pressure (0-100)
   */
  private calculateSellPressure(snapshot: OrderBookSnapshot): number {
    const totalVolume = snapshot.bidVolume + snapshot.askVolume;
    return (snapshot.askVolume / totalVolume) * 100;
  }

  /**
   * Calculate volume imbalance (-100 to 100)
   */
  private calculateVolumeImbalance(snapshot: OrderBookSnapshot): number {
    const totalVolume = snapshot.bidVolume + snapshot.askVolume;
    return ((snapshot.bidVolume - snapshot.askVolume) / totalVolume) * 100;
  }

  /**
   * Identify support and resistance levels
   */
  private identifyPriceLevels(snapshot: OrderBookSnapshot): {
    support: number;
    resistance: number;
  } {
    // Encontrar níveis com maior volume
    const bids = snapshot.bids
      .map(([price, quantity]) => ({
        price: parseFloat(price),
        volume: parseFloat(quantity)
      }))
      .sort((a, b) => b.volume - a.volume);

    const asks = snapshot.asks
      .map(([price, quantity]) => ({
        price: parseFloat(price),
        volume: parseFloat(quantity)
      }))
      .sort((a, b) => b.volume - a.volume);

    return {
      support: bids[0].price,
      resistance: asks[0].price
    };
  }

  /**
   * Get historical snapshots for a symbol
   */
  getSnapshots(symbol: string): OrderBookSnapshot[] {
    return this.snapshots.get(symbol) || [];
  }

  /**
   * Stop monitoring order book for a symbol
   */
  stopMonitoring(symbol: string): void {
    this.snapshots.delete(symbol);
    logger.info(`Stopped monitoring order book for ${symbol}`);
  }
}

export default OrderBookAnalysisService;
