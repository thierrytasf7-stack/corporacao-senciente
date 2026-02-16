import { Request, Response } from 'express';
import { ConfigLoader } from '../config/ConfigLoader';
import { BinanceApiService } from '../services/BinanceApiService';
import { logger } from '../utils/logger';

export class BinanceController {
  private binanceService: BinanceApiService | null = null;

  constructor() {
    try {
      // Carregar configuração
      const configLoader = ConfigLoader.getInstance();
      const config = configLoader.loadConfig();
      const binanceConfig = config.binance;

      // Inicializar serviço Binance com credenciais da configuração
      const apiKey = binanceConfig.apiKey;
      const secretKey = binanceConfig.secretKey;
      const isTestnet = binanceConfig.useTestnet;

      if (apiKey && secretKey) {
        this.binanceService = new BinanceApiService({
          apiKey,
          secretKey,
          isTestnet
        });
        logger.info('Serviço Binance inicializado com sucesso');
      } else {
        logger.warn('Credenciais da Binance não configuradas - funcionalidades limitadas');
      }
    } catch (error) {
      logger.warn('Erro ao inicializar serviço Binance:', error);
      // Não crashar o servidor, apenas logar o aviso
    }
  }

  /**
   * Testa a conexão com a API da Binance
   */
  async testConnection(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        logger.warn('Tentativa de testar conexão sem serviço Binance configurado');
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      logger.info('Testando conexão com Binance API');

      const result = await this.binanceService.testApiKey();

      if (result.isValid) {
        logger.info('Conexão com Binance API bem-sucedida');
        res.json({
          success: true,
          message: 'Conexão com Binance API estabelecida com sucesso',
          accountInfo: result.accountInfo
        });
      } else {
        logger.error('Falha na conexão com Binance API:', { error: result.error });
        res.status(401).json({
          success: false,
          message: 'Falha na conexão com Binance API',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao testar conexão com Binance:', error);

      // Tratar erro de forma segura para evitar problemas de serialização
      let errorMessage = 'Erro interno ao testar conexão';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao testar conexão',
        error: errorMessage
      });
    }
  }

  /**
   * Valida as credenciais da Binance
   */
  async validateCredentials(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        logger.warn('Tentativa de validar credenciais sem serviço Binance configurado');
        return res.status(503).json({
          valid: false,
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      logger.info('Validando credenciais da Binance');

      const result = await this.binanceService.testApiKey();

      if (result.isValid) {
        res.json({
          valid: true,
          message: 'Credenciais válidas'
        });
      } else {
        res.status(401).json({
          valid: false,
          message: 'Credenciais inválidas',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao validar credenciais:', error);

      let errorMessage = 'Erro interno ao validar credenciais';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      res.status(500).json({
        valid: false,
        message: 'Erro interno ao validar credenciais',
        error: errorMessage
      });
    }
  }

  /**
   * Obtém informações da conta
   */
  async getAccountInfo(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        logger.warn('Tentativa de obter informações da conta sem serviço Binance configurado');
        return res.status(503).json({
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      logger.info('Obtendo informações da conta Binance');

      const accountInfo = await this.binanceService.getAccountInfo();

      res.json(accountInfo);
    } catch (error) {
      logger.error('Erro ao obter informações da conta:', error);

      let errorMessage = 'Erro ao obter informações da conta';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      res.status(500).json({
        message: 'Erro ao obter informações da conta',
        error: errorMessage
      });
    }
  }

  /**
   * Obtém dados do portfolio
   */
  async getPortfolio(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        logger.warn('Tentativa de obter dados do portfolio sem serviço Binance configurado');
        return res.status(503).json({
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      logger.info('Obtendo dados do portfolio');

      const accountInfo = await this.binanceService.getAccountInfo();

      // Calcular dados do portfolio baseado nos saldos
      let totalValue = 0;
      let availableBalance = 0;
      let investedAmount = 0;

      for (const balance of accountInfo.balances) {
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);
        const total = free + locked;

        if (total > 0) {
          // Para simplificar, assumir que USDT é a moeda base
          if (balance.asset === 'USDT') {
            totalValue += total;
            availableBalance += free;
            investedAmount += locked;
          } else {
            // Para outras moedas, precisaríamos converter para USDT
            // Por enquanto, apenas somar como está
            totalValue += total;
            availableBalance += free;
            investedAmount += locked;
          }
        }
      }

      const portfolioData = {
        totalValue,
        totalPnL: 0, // Seria calculado com base no histórico
        totalPnLPercent: 0,
        availableBalance,
        investedAmount,
        balances: accountInfo.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      };

      res.json(portfolioData);
    } catch (error) {
      logger.error('Erro ao obter dados do portfolio:', error);
      res.status(500).json({
        message: 'Erro ao obter dados do portfolio',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém posições ativas (futures)
   */
  async getPositions(req: Request, res: Response) {
    try {
      logger.info('Obtendo posições ativas');

      // Para futures, precisaríamos implementar getPositions no BinanceApiService
      // Por enquanto, retornar array vazio
      res.json([]);
    } catch (error) {
      logger.error('Erro ao obter posições:', error);
      res.status(500).json({
        message: 'Erro ao obter posições',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico de trades
   */
  async getTrades(req: Request, res: Response) {
    try {
      const { symbol, limit = 100 } = req.query;

      logger.info('Obtendo histórico de trades', { symbol, limit });

      if (!this.binanceService) {
        logger.warn('Tentativa de obter trades sem serviço Binance configurado');
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      // Buscar histórico de ordens da Binance
      const trades = await this.binanceService.getOrderHistory(symbol as string, parseInt(limit as string));

      res.json({
        success: true,
        trades: trades,
        count: trades.length
      });
    } catch (error) {
      logger.error('Erro ao obter histórico de trades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter histórico de trades',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém saldos da conta
   */
  async getBalances(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        logger.warn('Tentativa de obter saldos sem serviço Binance configurado');
        return res.status(503).json({
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      logger.info('Obtendo saldos da conta');

      const accountInfo = await this.binanceService.getAccountInfo();

      // Filtrar apenas saldos com valor
      const balances = accountInfo.balances.filter(
        balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
      );

      res.json(balances);
    } catch (error) {
      logger.error('Erro ao obter saldos:', error);
      res.status(500).json({
        message: 'Erro ao obter saldos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém preço atual de um símbolo
   */
  async getCurrentPrice(req: Request, res: Response) {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: 'Símbolo é obrigatório',
          error: 'Parâmetro symbol não fornecido'
        });
      }

      logger.info('Obtendo preço atual', { symbol });

      if (!this.binanceService) {
        logger.warn('Tentativa de obter preço sem serviço Binance configurado');
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado',
          error: 'Credenciais da Binance não configuradas'
        });
      }

      // Buscar preço atual da Binance
      const price = await this.binanceService.getCurrentPrice(symbol);

      if (price === null) {
        return res.status(404).json({
          success: false,
          message: 'Preço não encontrado',
          error: `Preço para ${symbol} não disponível`
        });
      }

      res.json({
        success: true,
        symbol,
        price: price.toString(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter preço atual:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter preço atual',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém dados de performance
   */
  async getPerformance(req: Request, res: Response) {
    try {
      const { period = '1M' } = req.query;

      logger.info('Obtendo dados de performance', { period });

      // Para performance, precisaríamos implementar cálculo baseado no histórico
      // Por enquanto, retornar dados vazios
      res.json({
        period,
        data: [],
        metrics: {
          totalReturn: 0,
          winRate: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        }
      });
    } catch (error) {
      logger.error('Erro ao obter dados de performance:', error);
      res.status(500).json({
        message: 'Erro ao obter dados de performance',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Coloca ordem REAL na Binance
   */
  async placeOrder(req: Request, res: Response) {
    try {
      const { symbol, side, type, quantity, price, timeInForce } = req.body;

      logger.info('🚀 [ORDEM REAL] Colocando ordem na Binance:', {
        symbol,
        side,
        type,
        quantity,
        price,
        timeInForce
      });

      // Validar parâmetros obrigatórios
      if (!symbol || !side || !type || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros obrigatórios: symbol, side, type, quantity'
        });
      }

      // Preparar dados da ordem
      const orderData = {
        symbol,
        side: side.toUpperCase(),
        type: type.toUpperCase(),
        quantity: quantity.toString(),
        ...(price && { price: price.toString() }),
        ...(timeInForce && { timeInForce })
      };

      // Executar ordem REAL na Binance
      const result = await this.binanceService.placeOrder(orderData);

      logger.info('✅ [ORDEM SUCESSO] Ordem executada com sucesso:', result);

      res.json({
        success: true,
        message: 'Ordem executada com sucesso na Binance',
        data: result
      });

    } catch (error) {
      logger.error('❌ [ORDEM ERRO] Erro ao executar ordem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao executar ordem na Binance',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico completo de ordens SPOT da Binance Testnet
   */
  async getSpotOrderHistory(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado'
        });
      }

      const { symbol, limit = 100, startTime, endTime } = req.query;

      logger.info('📊 [HISTÓRICO SPOT] Buscando histórico de ordens spot:', {
        symbol,
        limit,
        startTime,
        endTime
      });

      const result = await this.binanceService.getSpotOrderHistory({
        symbol: symbol as string,
        limit: parseInt(limit as string),
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined
      });

      res.json({
        success: true,
        message: 'Histórico de ordens spot obtido com sucesso',
        data: result
      });

    } catch (error) {
      logger.error('❌ [HISTÓRICO SPOT] Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de ordens spot',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico de trades SPOT da Binance Testnet
   */
  async getSpotTradeHistory(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado'
        });
      }

      const { symbol, limit = 100, startTime, endTime } = req.query;

      logger.info('📊 [HISTÓRICO TRADES] Buscando histórico de trades spot:', {
        symbol,
        limit,
        startTime,
        endTime
      });

      const result = await this.binanceService.getSpotTradeHistory({
        symbol: symbol as string,
        limit: parseInt(limit as string),
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined
      });

      res.json({
        success: true,
        message: 'Histórico de trades spot obtido com sucesso',
        data: result
      });

    } catch (error) {
      logger.error('❌ [HISTÓRICO TRADES] Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de trades spot',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico de ordens FUTURES da Binance Testnet
   */
  async getFuturesOrderHistory(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado'
        });
      }

      const { symbol, limit = 100, startTime, endTime } = req.query;

      logger.info('📊 [HISTÓRICO FUTURES] Buscando histórico de ordens futures:', {
        symbol,
        limit,
        startTime,
        endTime
      });

      const result = await this.binanceService.getFuturesOrderHistory({
        symbol: symbol as string,
        limit: parseInt(limit as string),
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined
      });

      res.json({
        success: true,
        message: 'Histórico de ordens futures obtido com sucesso',
        data: result
      });

    } catch (error) {
      logger.error('❌ [HISTÓRICO FUTURES] Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de ordens futures',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico de trades FUTURES da Binance Testnet
   */
  async getFuturesTradeHistory(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado'
        });
      }

      const { symbol, limit = 100, startTime, endTime } = req.query;

      logger.info('📊 [HISTÓRICO FUTURES TRADES] Buscando histórico de trades futures:', {
        symbol,
        limit,
        startTime,
        endTime
      });

      const result = await this.binanceService.getFuturesTradeHistory({
        symbol: symbol as string,
        limit: parseInt(limit as string),
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined
      });

      res.json({
        success: true,
        message: 'Histórico de trades futures obtido com sucesso',
        data: result
      });

    } catch (error) {
      logger.error('❌ [HISTÓRICO FUTURES TRADES] Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de trades futures',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obtém histórico COMPLETO (spot + futures) da Binance Testnet
   */
  async getCompleteHistory(req: Request, res: Response) {
    try {
      if (!this.binanceService) {
        return res.status(503).json({
          success: false,
          message: 'Serviço Binance não configurado'
        });
      }

      const { limit = 100, days = 7 } = req.query;
      const endTime = Date.now();
      const startTime = endTime - (parseInt(days as string) * 24 * 60 * 60 * 1000);

      logger.info('📊 [HISTÓRICO COMPLETO] Buscando histórico completo da Binance Testnet:', {
        limit,
        days,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      });

      // Buscar dados de spot e futures em paralelo
      const [spotOrders, spotTrades, futuresOrders, futuresTrades] = await Promise.allSettled([
        this.binanceService.getSpotOrderHistory({ limit: parseInt(limit as string), startTime, endTime }),
        this.binanceService.getSpotTradeHistory({ limit: parseInt(limit as string), startTime, endTime }),
        this.binanceService.getFuturesOrderHistory({ limit: parseInt(limit as string), startTime, endTime }),
        this.binanceService.getFuturesTradeHistory({ limit: parseInt(limit as string), startTime, endTime })
      ]);

      const result = {
        spot: {
          orders: spotOrders.status === 'fulfilled' ? spotOrders.value : [],
          trades: spotTrades.status === 'fulfilled' ? spotTrades.value : []
        },
        futures: {
          orders: futuresOrders.status === 'fulfilled' ? futuresOrders.value : [],
          trades: futuresTrades.status === 'fulfilled' ? futuresTrades.value : []
        },
        summary: {
          totalSpotOrders: spotOrders.status === 'fulfilled' ? spotOrders.value.length : 0,
          totalSpotTrades: spotTrades.status === 'fulfilled' ? spotTrades.value.length : 0,
          totalFuturesOrders: futuresOrders.status === 'fulfilled' ? futuresOrders.value.length : 0,
          totalFuturesTrades: futuresTrades.status === 'fulfilled' ? futuresTrades.value.length : 0,
          period: {
            start: new Date(startTime).toISOString(),
            end: new Date(endTime).toISOString(),
            days: parseInt(days as string)
          }
        }
      };

      res.json({
        success: true,
        message: 'Histórico completo obtido com sucesso da Binance Testnet',
        data: result
      });

    } catch (error) {
      logger.error('❌ [HISTÓRICO COMPLETO] Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico completo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
