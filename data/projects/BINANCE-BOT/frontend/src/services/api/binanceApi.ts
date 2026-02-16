import { requestCache } from '../../utils/debounce';
import { apiClient, createRequestConfig } from './client';

// Interfaces para dados reais da Binance
export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

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
  balances: BinanceBalance[];
  permissions: string[];
}

export interface BinancePosition {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  notional: string;
  unrealizedPnl: string;
  unrealizedPnlPercent: string;
  leverage: string;
  liquidationPrice?: string;
}

export interface BinanceTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  isBestMatch: boolean;
}

export interface PortfolioData {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableBalance: number;
  investedAmount: number;
  balances: BinanceBalance[];
}

export interface ApiError {
  message: string;
  code?: string;
  critical: boolean;
}

// Serviço de API para Binance - DADOS REAIS
export class BinanceApiService {

  /**
   * Testa a conexão REAL com a API da Binance Testnet
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    const cacheKey = 'test-connection';
    const cached = requestCache.get(cacheKey);

    if (cached) {
      console.log('🔄 Usando cache para test-connection');
      return cached;
    }

    try {
      console.log('🔗 Testando conexão REAL com Binance Testnet...');
      const response = await apiClient.get('/binance/test-connection', createRequestConfig(30000));
      console.log('✅ Conexão REAL com Binance Testnet estabelecida');
      const result = { success: true };
      requestCache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('❌ Erro na conexão REAL com Binance Testnet:', error.response?.data?.message || error.message);
      const result = {
        success: false,
        error: error.response?.data?.message || 'Falha na conexão REAL com Binance Testnet'
      };
      requestCache.set(cacheKey, result);
      return result;
    }
  }

  /**
   * Obtém informações REAIS da conta Binance Testnet
   */
  static async getAccountInfo(): Promise<BinanceAccountInfo> {
    try {
      console.log('📊 Obtendo informações REAIS da conta Binance Testnet...');
      const response = await apiClient.get('/binance/account-info');
      console.log('✅ Informações REAIS da conta obtidas');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter informações REAIS da conta:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter informações REAIS da conta');
    }
  }

  /**
   * Obtém dados REAIS do portfolio Binance Testnet
   */
  static async getPortfolioData(): Promise<PortfolioData> {
    const cacheKey = 'portfolio-data';
    const cached = requestCache.get(cacheKey);

    if (cached) {
      console.log('🔄 Usando cache para portfolio-data');
      return cached;
    }

    try {
      console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');
      const response = await apiClient.get('/binance/portfolio', createRequestConfig(30000));
      console.log('✅ Dados REAIS do portfolio obtidos');
      const result = response.data;
      requestCache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('❌ Erro ao obter dados REAIS do portfolio:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter dados REAIS do portfolio');
    }
  }

  /**
   * Get order book data
   */
  static async getOrderBook(symbol: string, limit: number = 100): Promise<{
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
  }> {
    try {
      console.log(`📊 [ORDER BOOK] Getting order book for ${symbol}`);
      const response = await apiClient.get('/binance/order-book', {
        params: { symbol, limit }
      });

      console.log(`✅ [ORDER BOOK] Order book retrieved for ${symbol}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [ORDER BOOK] Error getting order book:`, error.response?.data || error);
      throw new Error(`Failed to get order book: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time order book updates
   */
  static subscribeToOrderBook(
    symbol: string,
    onUpdate: (data: {
      symbol: string;
      updateId: number;
      bids: [string, string][];
      asks: [string, string][];
    }) => void
  ): WebSocket {
    console.log(`🔌 [ORDER BOOK] Subscribing to order book updates for ${symbol}`);
    
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/orderbook/${symbol}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    ws.onerror = (error) => {
      console.error(`❌ [ORDER BOOK] WebSocket error:`, error);
    };

    return ws;
  }

  /**
   * Obtém posições ativas REAIS da Binance Testnet
   */
  static async getActivePositions(): Promise<BinancePosition[]> {
    try {
      console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');
      const response = await apiClient.get('/binance/positions', createRequestConfig(30000));
      console.log('✅ Posições ativas REAIS obtidas');

      // Extrair o array de dados da resposta do backend
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // Fallback para resposta direta (compatibilidade)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Erro ao obter posições ativas REAIS:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter posições ativas REAIS');
    }
  }

  /**
   * Obtém histórico de trades REAIS da Binance Testnet
   */
  static async getTradeHistory(symbol?: string, limit: number = 100): Promise<BinanceTrade[]> {
    try {
      console.log(`📜 Obtendo histórico de trades REAIS${symbol ? ` para ${symbol}` : ''}...`);
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/binance/trades?${params}`);
      console.log(`✅ ${response.data.length} trades REAIS obtidos`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter histórico de trades REAIS:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter histórico de trades REAIS');
    }
  }

  /**
   * Obtém dados de performance REAIS da Binance Testnet
   */
  static async getPerformanceData(period: string = '1M'): Promise<any> {
    try {
      console.log(`📊 Obtendo dados de performance REAIS (${period})...`);
      const response = await apiClient.get(`/binance/performance?period=${period}`);
      console.log('✅ Dados de performance REAIS obtidos');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao obter dados de performance REAIS:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter dados de performance REAIS');
    }
  }

  /**
   * Obtém saldos REAIS da conta Binance Testnet
   */
  static async getBalances(): Promise<BinanceBalance[]> {
    const cacheKey = 'balances-data';
    const cached = requestCache.get(cacheKey);

    if (cached) {
      console.log('🔄 Usando cache para balances-data');
      return cached;
    }

    try {
      console.log('💰 Obtendo saldos REAIS da Binance Testnet...');
      const response = await apiClient.get('/binance/balances', createRequestConfig(30000));

      // Extrair o array de dados da resposta do backend
      let balances: BinanceBalance[] = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        balances = response.data.data;
      } else if (Array.isArray(response.data)) {
        balances = response.data;
      }

      console.log(`✅ ${balances.length} saldos REAIS obtidos`);
      requestCache.set(cacheKey, balances);
      return balances;
    } catch (error: any) {
      console.error('❌ Erro ao obter saldos REAIS:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Erro ao obter saldos REAIS');
    }
  }

  /**
   * Valida se as credenciais REAIS da Binance Testnet estão configuradas
   */
  static async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    const cacheKey = 'validate-credentials';
    const cached = requestCache.get(cacheKey);

    if (cached) {
      console.log('🔄 Usando cache para validate-credentials');
      return cached;
    }

    try {
      console.log('🔐 Validando credenciais REAIS da Binance Testnet...');
      const response = await apiClient.get('/binance/validate-credentials', createRequestConfig(30000));
      console.log('✅ Credenciais REAIS válidas');
      const result = { valid: true };
      requestCache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('❌ Credenciais REAIS inválidas:', error.response?.data?.message || error.message);
      const result = {
        valid: false,
        error: error.response?.data?.message || 'Credenciais REAIS inválidas ou não configuradas'
      };
      requestCache.set(cacheKey, result);
      return result;
    }
  }
}

export default BinanceApiService;
