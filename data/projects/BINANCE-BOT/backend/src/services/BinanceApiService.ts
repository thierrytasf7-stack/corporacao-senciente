import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';

export interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
  permissions: string[];
}

export interface BinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: Array<{
    rateLimitType: string;
    interval: string;
    intervalNum: number;
    limit: number;
  }>;
  symbols: Array<{
    symbol: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
    filters: any[];
  }>;
}

export interface BinanceApiCredentials {
  apiKey: string;
  secretKey: string;
  isTestnet?: boolean;
}

export class BinanceApiService {
  private apiKey: string;
  private secretKey: string;
  private baseURL: string;
  private client: AxiosInstance;
  private timeOffset: number = 0; // Offset para sincronização de tempo

  constructor(credentials: BinanceApiCredentials) {
    this.apiKey = credentials.apiKey;
    this.secretKey = credentials.secretKey;

    // Sincronizar tempo com servidor da Binance na inicialização
    this.syncTime().catch(error => {
      logger.warn('Failed to sync time with Binance server:', error);
    });

    // Use testnet or mainnet URL
    this.baseURL = credentials.isTestnet
      ? process.env.BINANCE_TESTNET_URL || 'https://testnet.binance.vision'
      : process.env.BINANCE_BASE_URL || 'https://api.binance.com';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Binance API request', {
          method: config.method,
          url: config.url,
          params: config.params
        });
        return config;
      },
      (error) => {
        logger.error('Binance API request error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Binance API response', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Binance API response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url || 'unknown',
          message: error.message,
          code: error.code
        });
        return Promise.reject(error);
      }
    );
  }

  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  private async createSignedParams(params: Record<string, any> = {}): Promise<string> {
    // Obter tempo do servidor diretamente para evitar problemas de sincronização
    let timestamp;
    try {
      const serverTime = await this.getServerTime();
      timestamp = serverTime;
    } catch (error) {
      // Fallback para tempo local se não conseguir obter tempo do servidor
      timestamp = Date.now();
      logger.warn('Using local time as fallback for timestamp');
    }

    const queryParams = {
      ...params,
      timestamp,
      recvWindow: 60000 // 60 segundos de tolerância
    };

    const queryString = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join('&');

    const signature = this.createSignature(queryString);

    return `${queryString}&signature=${signature}`;
  }

  /**
   * Test API key validity by getting account information
   */
  async testApiKey(): Promise<{
    isValid: boolean;
    error?: string;
    accountInfo?: BinanceAccountInfo;
  }> {
    try {
      const params = await this.createSignedParams();
      const response = await this.client.get(`/api/v3/account?${params}`);

      return {
        isValid: true,
        accountInfo: response.data
      };
    } catch (error: any) {
      logger.error('API key test failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      let errorMessage = 'Unknown error';
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        isValid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<BinanceAccountInfo> {
    try {
      const params = await this.createSignedParams();
      const response = await this.client.get(`/api/v3/account?${params}`);

      return response.data;
    } catch (error) {
      logger.error('Failed to get account info:', error);
      throw new Error('Failed to get account information');
    }
  }

  /**
   * Close position by placing opposite order
   */
  async closePosition(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      // Arredondar quantidade para evitar erro de precisão da Binance
      const roundedQuantity = parseFloat(orderData.quantity).toFixed(8);

      logger.info(`🔐 Fechando posição para ${orderData.symbol}:`, {
        ...orderData,
        originalQuantity: orderData.quantity,
        roundedQuantity: roundedQuantity
      });

      const params: any = {
        symbol: orderData.symbol,
        side: orderData.side, // Lado oposto para fechar
        type: 'MARKET',
        quantity: roundedQuantity
      };

      const signedParams = await this.createSignedParams(params);
      const response = await axios.post(`${this.baseURL}/api/v3/order`, signedParams, {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      logger.info(`✅ Posição fechada com sucesso: ${response.data.orderId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Failed to close position:', {
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        error: error.response?.data || error.message
      });
      return {
        success: false,
        message: `Failed to close position for ${orderData.symbol}: ${error.response?.data?.msg || error.message}`
      };
    }
  }

  /**
   * Get exchange information
   */
  async getExchangeInfo(): Promise<BinanceExchangeInfo> {
    try {
      const response = await this.client.get('/api/v3/exchangeInfo');
      return response.data;
    } catch (error) {
      logger.error('Failed to get exchange info:', error);
      throw new Error('Failed to get exchange information');
    }
  }

  /**
   * Get server time
   */
  async getServerTime(): Promise<number> {
    try {
      const response = await this.client.get('/api/v3/time');
      return response.data.serverTime;
    } catch (error) {
      logger.error('Failed to get server time:', error);
      throw new Error('Failed to get server time');
    }
  }

  private async syncTime(): Promise<void> {
    try {
      const serverTime = await this.getServerTime();
      const localTime = Date.now();
      this.timeOffset = serverTime - localTime;
      logger.info(`Time synced with Binance server. Offset: ${this.timeOffset}ms`);
    } catch (error) {
      logger.warn('Failed to sync time with Binance server:', error);
      this.timeOffset = 0; // Fallback para tempo local
    }
  }

  /**
   * Get 24hr ticker statistics
   */
  async get24hrTicker(symbol?: string): Promise<any> {
    try {
      const params = symbol ? { symbol } : {};
      const response = await this.client.get('/api/v3/ticker/24hr', { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to get 24hr ticker:', error);
      throw new Error('Failed to get 24hr ticker');
    }
  }

  /**
   * Get current open orders
   */
  async getOpenOrders(symbol?: string): Promise<any[]> {
    try {
      const params = symbol ? { symbol } : {};
      const signedParams = await this.createSignedParams(params);

      const response = await this.client.get(`/api/v3/openOrders?${signedParams}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get open orders:', error);
      throw new Error('Failed to get open orders');
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(
    symbol: string,
    limit?: number,
    startTime?: number,
    endTime?: number
  ): Promise<any[]> {
    try {
      const params: any = { symbol };
      if (limit) params.limit = limit;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const signedParams = await this.createSignedParams(params);
      const response = await this.client.get(`/api/v3/allOrders?${signedParams}`);

      return response.data;
    } catch (error) {
      logger.error('Failed to get order history:', error);
      throw new Error(`Failed to get order history for ${symbol}`);
    }
  }

  /**
   * Get trade history (executed trades)
   */
  async getTradeHistory(
    symbol?: string,
    limit: number = 200,
    startTime?: number,
    endTime?: number
  ): Promise<any[]> {
    try {
      console.log(`📊 [TRADES] Buscando histórico de trades executados...`);
      console.log(`🔍 [DEBUG] getTradeHistory chamado com: symbol=${symbol}, limit=${limit}`);

      // Se não há símbolo específico, buscar trades de todos os símbolos
      // Para isso, vamos usar o endpoint de account info para obter símbolos com trades
      if (!symbol) {
        console.log('📊 [TRADES] Buscando trades de todos os símbolos...');

        // Primeiro, obter informações da conta para ver quais símbolos têm trades
        const accountInfo = await this.getAccountInfo();
        const allTrades: any[] = [];

        // Buscar trades dos símbolos mais comuns primeiro
        const commonSymbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'XRPUSDT'];

        for (const sym of commonSymbols) {
          try {
            const params: any = { symbol: sym };
            if (limit) params.limit = Math.min(limit, 1000);
            if (startTime) params.startTime = startTime;
            if (endTime) params.endTime = endTime;

            const signedParams = await this.createSignedParams(params);
            const response = await this.client.get(`/api/v3/myTrades?${signedParams}`);

            if (response.data && response.data.length > 0) {
              allTrades.push(...response.data);
              console.log(`✅ [TRADES] ${response.data.length} trades encontrados para ${sym}`);
            }
          } catch (error: any) {
            // Log detalhado de erros para debug
            console.log(`🔍 [DEBUG] Erro ao buscar trades para ${sym}:`, {
              code: error.response?.data?.code,
              msg: error.response?.data?.msg,
              status: error.response?.status,
              fullError: error.response?.data
            });

            // Ignorar erros de símbolos sem trades
            if (error.response?.data?.code !== -1102) {
              console.warn(`⚠️ [TRADES] Erro ao buscar trades para ${sym}:`, error.response?.data?.msg);
            }
          }
        }

        console.log(`✅ [TRADES] Total: ${allTrades.length} trades executados obtidos da Binance`);
        return allTrades;
      }

      // Buscar trades de um símbolo específico
      const params: any = { symbol };
      if (limit) params.limit = Math.min(limit, 1000);
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const signedParams = await this.createSignedParams(params);
      const response = await this.client.get(`/api/v3/myTrades?${signedParams}`);

      console.log(`✅ [TRADES] ${response.data.length} trades executados obtidos da Binance para ${symbol}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [TRADES] Erro ao buscar histórico de trades:', error.response?.data || error);
      throw new Error(`Failed to get trade history: ${error.message}`);
    }
  }

  /**
   * Check if symbol exists and is tradeable
   */
  async isSymbolTradeable(symbol: string): Promise<boolean> {
    try {
      const exchangeInfo = await this.getExchangeInfo();
      const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);

      return symbolInfo ? symbolInfo.status === 'TRADING' : false;
    } catch (error) {
      logger.error('Failed to check symbol tradeability:', error);
      return false;
    }
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      console.log(`🔍 [PRICE] Getting current price for ${symbol}`);

      const response = await this.client.get('/api/v3/ticker/price', {
        params: { symbol }
      });

      console.log(`📊 [PRICE] Response received for ${symbol}:`, response.data);

      if (response.data && response.data.price) {
        const price = parseFloat(response.data.price);
        console.log(`✅ [PRICE] Current price retrieved successfully for ${symbol}: $${price}`);
        return price;
      }

      console.log(`⚠️ [PRICE] No price data found for ${symbol}`, response.data);
      return null;
    } catch (error: any) {
      console.error(`❌ [PRICE] Error details:`, error.response?.data || error);
      return null;
    }
  }

  /**
   * Get API key permissions
   */
  async getApiKeyPermissions(): Promise<{
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    permissions: string[];
  }> {
    try {
      const accountInfo = await this.getAccountInfo();

      return {
        canTrade: accountInfo.canTrade,
        canWithdraw: accountInfo.canWithdraw,
        canDeposit: accountInfo.canDeposit,
        permissions: accountInfo.permissions
      };
    } catch (error) {
      logger.error('Failed to get API key permissions:', error);
      throw new Error('Failed to get API key permissions');
    }
  }

  /**
   * Place a new order
   */
  async placeOrder(orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK';
  }): Promise<any> {
    try {
      const params: any = {
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        quantity: orderData.quantity
      };

      if (orderData.price) {
        params.price = orderData.price;
      }

      if (orderData.timeInForce) {
        params.timeInForce = orderData.timeInForce;
      }

      const signedParams = await this.createSignedParams(params);
      const response = await axios.post(`${this.baseURL}/api/v3/order`, signedParams, {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      logger.error('Failed to place order:', {
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        error: error.response?.data || error.message
      });
      return {
        success: false,
        message: `Failed to place ${orderData.side} order for ${orderData.symbol}: ${error.response?.data?.msg || error.message}`
      };
    }
  }

  /**
   * Execute market sell order
   */
  async marketSell(symbol: string, quantity: number): Promise<any> {
    try {
      logger.info(`🚀 [MARKET SELL] Executando venda de mercado: ${symbol} - ${quantity}`);

      // Obter preço atual real da Binance
      logger.info(`🔍 [MARKET SELL] Buscando preço atual para ${symbol}...`);
      const currentPrice = await this.getCurrentPrice(symbol);
      logger.info(`💰 [MARKET SELL] Preço obtido: ${currentPrice}`);

      if (!currentPrice) {
        throw new Error(`Não foi possível obter preço atual para ${symbol}`);
      }

      logger.info(`💰 [MARKET SELL] Preço atual de ${symbol}: $${currentPrice}`);

      // Executar ordem de venda de mercado
      logger.info(`🔗 [MARKET SELL] Executando placeOrder...`);
      const result = await this.placeOrder({
        symbol: symbol,
        side: 'SELL',
        type: 'MARKET',
        quantity: quantity.toString()
      });

      logger.info(`📊 [MARKET SELL] Resultado do placeOrder:`, result);

      if (result.success) {
        // Adicionar preço real à resposta
        result.data.price = currentPrice;
        logger.info(`✅ [MARKET SELL] Venda executada com sucesso:`, {
          symbol,
          quantity,
          price: currentPrice,
          orderId: result.data.orderId
        });
      } else {
        logger.error(`❌ [MARKET SELL] Falha no placeOrder:`, result.message);
        throw new Error(result.message);
      }

      return result.data;
    } catch (error: any) {
      logger.error('❌ [MARKET SELL] Erro ao executar venda:', error);
      throw error;
    }
  }

  /**
   * Get all available trading symbols from Binance
   */
  async getAllSymbols(): Promise<{
    symbols: Array<{
      symbol: string;
      baseAsset: string;
      quoteAsset: string;
      status: string;
      permissions: string[];
      isSpotTradingAllowed: boolean;
      isMarginTradingAllowed: boolean;
    }>;
  }> {
    try {
      const response = await this.client.get('/api/v3/exchangeInfo');

      return {
        symbols: response.data.symbols.filter((symbol: any) =>
          symbol.status === 'TRADING'
        ).map((symbol: any) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
          quoteAsset: symbol.quoteAsset,
          status: symbol.status,
          permissions: symbol.permissions,
          isSpotTradingAllowed: symbol.isSpotTradingAllowed,
          isMarginTradingAllowed: symbol.isMarginTradingAllowed
        }))
      };
    } catch (error: any) {
      logger.error('Failed to get symbols:', error.response?.data || error.message);
      throw new Error('Failed to get available symbols from Binance');
    }
  }

  /**
   * Get 24hr ticker statistics for all symbols
   */
  async getAllTickers(): Promise<Array<{
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    askPrice: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    count: number;
  }>> {
    try {
      const response = await this.client.get('/api/v3/ticker/24hr');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get tickers:', error.response?.data || error.message);
      throw new Error('Failed to get ticker data from Binance');
    }
  }

  /**
   * Get Kline/Candlestick data for a symbol
   */
  async getKlines(symbol: string, interval: string = '1h', limit: number = 100): Promise<Array<{
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume: string;
  }>> {
    try {
      const params = new URLSearchParams({
        symbol: symbol,
        interval: interval,
        limit: limit.toString()
      });

      const response = await this.client.get(`/api/v3/klines?${params}`);

      return response.data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10]
      }));
    } catch (error: any) {
      logger.error(`Failed to get klines for ${symbol}:`, error.response?.data || error.message);
      throw new Error(`Failed to get candlestick data for ${symbol}`);
    }
  }

  /**
   * Get current price for a symbol
   */
  async getSymbolPrice(symbol: string): Promise<{
    symbol: string;
    price: string;
  }> {
    try {
      const response = await this.client.get(`/api/v3/ticker/price?symbol=${symbol}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get price for ${symbol}:`, error.response?.data || error.message);
      throw new Error(`Failed to get price for ${symbol}`);
    }
  }

  /**
   * Get spot order history from Binance Testnet
   */
  async getSpotOrderHistory(params: {
    symbol?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startTime) queryParams.append('startTime', params.startTime.toString());
      if (params.endTime) queryParams.append('endTime', params.endTime.toString());

      queryParams.append('timestamp', Date.now().toString());

      const signature = this.createSignature(queryParams.toString());
      queryParams.append('signature', signature);

      const response = await this.client.get(`/api/v3/allOrders?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get spot order history:', error.response?.data || error.message);
      throw new Error('Failed to get spot order history');
    }
  }

  /**
   * Get spot trade history from Binance Testnet
   */
  async getSpotTradeHistory(params: {
    symbol?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startTime) queryParams.append('startTime', params.startTime.toString());
      if (params.endTime) queryParams.append('endTime', params.endTime.toString());

      queryParams.append('timestamp', Date.now().toString());

      const signature = this.createSignature(queryParams.toString());
      queryParams.append('signature', signature);

      const response = await this.client.get(`/api/v3/myTrades?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get spot trade history:', error.response?.data || error.message);
      throw new Error('Failed to get spot trade history');
    }
  }

  /**
   * Get futures order history from Binance Testnet
   */
  async getFuturesOrderHistory(params: {
    symbol?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startTime) queryParams.append('startTime', params.startTime.toString());
      if (params.endTime) queryParams.append('endTime', params.endTime.toString());

      queryParams.append('timestamp', Date.now().toString());

      const signature = this.createSignature(queryParams.toString());
      queryParams.append('signature', signature);

      // Use futures API endpoint
      const futuresClient = axios.create({
        baseURL: this.baseURL.replace('/api', '/fapi'),
        timeout: 10000,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const response = await futuresClient.get(`/v1/allOrders?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get futures order history:', error.response?.data || error.message);
      throw new Error('Failed to get futures order history');
    }
  }

  /**
   * Get futures trade history from Binance Testnet
   */
  /**
   * Get order book data for a symbol
   * @param symbol Trading pair symbol
   * @param limit Number of bids/asks (default 100, max 5000)
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<{
    lastUpdateId: number;
    bids: [string, string][]; // [price, quantity]
    asks: [string, string][]; // [price, quantity]
  }> {
    try {
      const response = await this.client.get('/api/v3/depth', {
        params: {
          symbol,
          limit: Math.min(limit, 5000)
        }
      });

      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get order book for ${symbol}:`, error.response?.data || error.message);
      throw new Error(`Failed to get order book for ${symbol}`);
    }
  }

  /**
   * Get real-time order book updates via WebSocket
   * @param symbol Trading pair symbol
   * @param callback Function to handle updates
   */
  async subscribeToOrderBook(
    symbol: string,
    callback: (data: {
      symbol: string;
      updateId: number;
      bids: [string, string][];
      asks: [string, string][];
    }) => void
  ): Promise<WebSocket> {
    try {
      const ws = new WebSocket(`${this.baseURL.replace('http', 'ws')}/ws/${symbol.toLowerCase()}@depth`);

      ws.on('message', (data: string) => {
        const update = JSON.parse(data);
        callback(update);
      });

      ws.on('error', (error: Error) => {
        logger.error(`WebSocket error for ${symbol} order book:`, error);
      });

      return ws;
    } catch (error: any) {
      logger.error(`Failed to subscribe to order book for ${symbol}:`, error);
      throw new Error(`Failed to subscribe to order book for ${symbol}`);
    }
  }

  async getFuturesTradeHistory(params: {
    symbol?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.startTime) queryParams.append('startTime', params.startTime.toString());
      if (params.endTime) queryParams.append('endTime', params.endTime.toString());

      queryParams.append('timestamp', Date.now().toString());

      const signature = this.createSignature(queryParams.toString());
      queryParams.append('signature', signature);

      // Use futures API endpoint
      const futuresClient = axios.create({
        baseURL: this.baseURL.replace('/api', '/fapi'),
        timeout: 10000,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const response = await futuresClient.get(`/v1/userTrades?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get futures trade history:', error.response?.data || error.message);
      throw new Error('Failed to get futures trade history');
    }
  }
}

export default BinanceApiService;
