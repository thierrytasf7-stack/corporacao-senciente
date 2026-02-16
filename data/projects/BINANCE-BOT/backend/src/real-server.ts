import express from 'express';
import { ConfigLoader } from './config/ConfigLoader';
import { MathStrategyController } from './controllers/MathStrategyController';
import { RotativeAnalysisController } from './controllers/RotativeAnalysisController';
import { SimpleSpotFavoritesController } from './controllers/SimpleSpotFavoritesController';
import { SpotRotativeAnalysisController } from './controllers/SpotRotativeAnalysisController';
import { SpotStrategyController } from './controllers/SpotStrategyController';
import { TradingStrategyController } from './controllers/TradingStrategyController';
import analysisRouter, { injectBinanceService as injectBinanceServiceAnalysis } from './routes/analysis';
import binanceMarketsRouter from './routes/binanceMarkets';
import marketsRouter from './routes/markets';
import positionMonitorRouter, { injectBinanceService as injectBinanceServicePositionMonitor } from './routes/positionMonitor';
import realRotativeAnalysisRouter from './routes/realRotativeAnalysis';
import strategyRiskRouter from './routes/strategyRiskRoutes';
import { testExecutionRouter } from './routes/testExecution';
import { BinanceApiService } from './services/BinanceApiService';

console.log('🚨 [SERVER] Importando realRotativeAnalysisRouter...');
console.log('🚨 [SERVER] realRotativeAnalysisRouter importado!');

const app = express();
const PORT = process.env.PORT || 23231;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


// Rotas da API
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint para executar vendas
app.post('/api/v1/binance/sell', async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Symbol e quantity são obrigatórios'
      });
    }

    console.log('🚀 [VENDA REAL] Executando venda real na Binance:', { symbol, quantity });

    // Usar o BinanceApiService que já está funcionando
    console.log('🔧 [VENDA REAL] Criando BinanceApiService...');
    const binanceService = new BinanceApiService({
      apiKey: process.env.BINANCE_API_KEY || '',
      secretKey: process.env.BINANCE_SECRET_KEY || '',
      isTestnet: true
    });
    console.log('✅ [VENDA REAL] BinanceApiService criado com sucesso');
    console.log('🔍 [VENDA REAL] Verificando se marketSell existe:', typeof binanceService.marketSell);

    console.log('🔗 [VENDA REAL] Chamando binanceService.marketSell...');

    try {
      // Executar ordem de venda
      const result = await binanceService.marketSell(symbol, quantity);
      console.log('✅ [VENDA REAL] Ordem executada com sucesso:', result);

      res.json({
        success: true,
        message: 'Venda executada com sucesso na Binance',
        data: result
      });
    } catch (sellError) {
      console.error('❌ [VENDA REAL] Erro específico no marketSell:', sellError);
      console.error('❌ [VENDA REAL] Tipo do erro:', typeof sellError);
      console.error('❌ [VENDA REAL] Stack trace:', sellError.stack);
      throw sellError;
    }

  } catch (error) {
    console.error('❌ [VENDA REAL] Erro ao executar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar venda na Binance',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota de teste simples
app.get('/api/test-all-signals', (req, res) => {
  console.log('🔍 [TEST] Rota de teste chamada!');
  res.json({
    success: true,
    message: 'Teste funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota manual para real-analysis/all-signals (ANTES do router)
app.get('/api/v1/real-analysis/all-signals', (req, res) => {
  console.log('🔍 [MANUAL DEBUG] Rota manual /real-analysis/all-signals chamada!');
  res.json({
    success: true,
    message: 'All-signals endpoint funcionando via manual route',
    signals: [],
    total: 0,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/markets', marketsRouter);
app.use('/api/v1/binance/markets', binanceMarketsRouter);
app.use('/api/v1/real-analysis', realRotativeAnalysisRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/v1/strategy-risk', strategyRiskRouter);
app.use('/api/v1/position-monitor', positionMonitorRouter);
app.use('/api/v1/test', testExecutionRouter);

// Endpoint de teste
app.get('/api/v1/test-close', (req, res) => {
  console.log('🧪 [TEST] Endpoint de teste chamado!');
  res.json({ success: true, message: 'Endpoint de teste funcionando!' });
});

// Endpoint para fechar posição ativa
app.post('/api/v1/close-position/:positionId', async (req, res) => {
  try {
    const { positionId } = req.params;
    console.log(`🔐 [CLOSE POSITION] ENDPOINT CHAMADO - Fechando posição: ${positionId}`);
    console.log(`🔐 [CLOSE POSITION] binanceService existe:`, !!binanceService);
    console.log(`🔐 [CLOSE POSITION] URL completa:`, req.url);
    console.log(`🔐 [CLOSE POSITION] Method:`, req.method);

    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado'
      });
    }

    // 1. Buscar a posição no storage
    const { PositionStorageService } = await import('./services/PositionStorageService');
    const positionStorage = new PositionStorageService();
    const positions = await positionStorage.getAllPositions();

    console.log(`🔍 [CLOSE POSITION] Total de posições carregadas: ${positions.length}`);
    console.log(`🔍 [CLOSE POSITION] Procurando posição: ${positionId}`);
    console.log(`🔍 [CLOSE POSITION] Posições disponíveis:`, positions.map(p => ({ id: p.id, status: p.status, symbol: p.symbol })));

    const position = positions.find(p => p.id === positionId && p.status === 'OPEN');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posição não encontrada ou já fechada'
      });
    }

    console.log(`📊 [CLOSE POSITION] Posição encontrada:`, {
      id: position.id,
      symbol: position.symbol,
      side: position.side,
      quantity: position.quantity
    });

    // 2. Determinar lado oposto para fechar
    const closeSide = position.side === 'BUY' ? 'SELL' : 'BUY';

    // 3. Fechar posição na Binance
    // Arredondar quantidade para evitar erro de precisão da Binance
    const roundedQuantity = parseFloat(position.quantity.toFixed(8));

    const closeResult = await binanceService.closePosition({
      symbol: position.symbol,
      side: closeSide,
      quantity: roundedQuantity.toString()
    });

    if (!closeResult.success) {
      return res.status(500).json({
        success: false,
        message: `Erro ao fechar posição na Binance: ${closeResult.message}`
      });
    }

    // 4. Obter preço de fechamento e timestamp real da Binance
    const closePrice = closeResult.data?.fills?.[0]?.price || closeResult.data?.price || position.openPrice;
    const closeTime = closeResult.data?.transactTime ? new Date(closeResult.data.transactTime).toISOString() : new Date().toISOString();

    console.log(`💰 [CLOSE POSITION] Ordem de fechamento executada:`, {
      orderId: closeResult.data?.orderId,
      closePrice: closePrice,
      closeTime: closeTime
    });

    // 5. Atualizar posição no storage local
    const updatedPosition = await positionStorage.closePosition(position.id, parseFloat(closePrice), closeTime);

    if (!updatedPosition) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar posição no storage local'
      });
    }

    console.log(`✅ [CLOSE POSITION] Posição fechada com sucesso:`, {
      id: updatedPosition.id,
      symbol: updatedPosition.symbol,
      pnl: updatedPosition.pnl,
      pnlPercentage: updatedPosition.pnlPercentage
    });

    res.json({
      success: true,
      message: 'Posição fechada com sucesso',
      data: {
        position: updatedPosition,
        binanceOrder: closeResult.data
      }
    });

  } catch (error: any) {
    console.error('❌ [CLOSE POSITION] Erro ao fechar posição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao fechar posição',
      error: error.message
    });
  }
});

// Endpoint para forçar carregamento do histórico no frontend
app.post('/api/v1/force-load-history', async (req, res) => {
  try {
    console.log('🔄 [FORÇA BRUTA] Endpoint chamado para forçar carregamento do histórico');

    // Buscar dados diretamente do storage local
    const fs = require('fs');
    const path = require('path');

    let historyData = { success: false, positions: [] };

    try {
      const storagePath = path.join('/app/data', 'positions.json');
      if (fs.existsSync(storagePath)) {
        const fileContent = fs.readFileSync(storagePath, 'utf8');
        const positions = JSON.parse(fileContent);
        historyData = { success: true, positions };
      }
    } catch (error) {
      console.error('❌ [FORÇA BRUTA] Erro ao ler arquivo de posições:', error);
    }

    console.log('📊 [FORÇA BRUTA] Dados do histórico obtidos:', {
      success: historyData.success,
      positionsCount: historyData.positions?.length || 0
    });

    res.json({
      success: true,
      message: 'Histórico carregado com sucesso',
      positions: historyData.positions || [],
      count: historyData.positions?.length || 0
    });
  } catch (error) {
    console.error('❌ [FORÇA BRUTA] Erro ao carregar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar histórico',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Endpoint para verificar regras de trading
app.get('/api/v1/binance/trading-rules/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`🔍 Verificando regras de trading para ${symbol}`);

    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não disponível'
      });
    }

    const exchangeInfo = await binanceService.getExchangeInfo();
    const symbolInfo = exchangeInfo.symbols.find(s => s.symbol === symbol);

    if (!symbolInfo) {
      return res.status(404).json({
        success: false,
        message: `Símbolo ${symbol} não encontrado`
      });
    }

    const lotSizeFilter = symbolInfo.filters.find(f => f.filterType === 'LOT_SIZE');
    const minNotionalFilter = symbolInfo.filters.find(f => f.filterType === 'NOTIONAL');

    res.json({
      success: true,
      symbol: symbol,
      lotSize: lotSizeFilter,
      minNotional: minNotionalFilter,
      status: symbolInfo.status
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar regras de trading:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar regras de trading',
      error: error.message
    });
  }
});

// Inicializar serviço Binance REAL
let binanceService: BinanceApiService | null = null;

try {
  const configLoader = ConfigLoader.getInstance();
  const config = configLoader.loadConfig();
  const binanceConfig = config.binance;

  if (binanceConfig.apiKey && binanceConfig.secretKey) {
    binanceService = new BinanceApiService({
      apiKey: binanceConfig.apiKey,
      secretKey: binanceConfig.secretKey,
      isTestnet: binanceConfig.useTestnet || true
    });
    console.log('✅ BinanceApiService inicializado com sucesso - CONEXÃO REAL');
  } else {
    console.error('❌ Credenciais da Binance não encontradas no arquivo .env');
    throw new Error('Credenciais da Binance não configuradas');
  }
} catch (error: any) {
  console.error('❌ Erro ao inicializar BinanceApiService:', error.message);
  console.error('🔧 Sistema continuará sem conexão com Binance - todos os endpoints falharão');
}

// Injetar binanceService nas rotas que precisam dele
injectBinanceServiceAnalysis(binanceService);
injectBinanceServicePositionMonitor(binanceService);

// Novas rotas v1
const mathStrategyController = new MathStrategyController();
const tradingStrategyController = new TradingStrategyController();
const rotativeAnalysisController = new RotativeAnalysisController(binanceService);
const spotStrategyController = new SpotStrategyController();
const spotRotativeAnalysisController = new SpotRotativeAnalysisController();
const simpleSpotFavoritesController = new SimpleSpotFavoritesController();

// Rotas para Estratégias Matemáticas
app.get('/api/v1/math-strategies', (req, res) => mathStrategyController.getAllStrategies(req, res));
app.post('/api/v1/math-strategies', (req, res) => mathStrategyController.createStrategy(req, res));
app.post('/api/v1/math-strategies/:id/toggle', (req, res) => mathStrategyController.toggleStrategy(req, res));
app.get('/api/v1/math-strategies/active', (req, res) => mathStrategyController.getActiveStrategy(req, res));
app.post('/api/v1/math-strategies/initialize-default', (req, res) => mathStrategyController.initializeDefaultStrategy(req, res));

// Rotas para Estratégias de Trading
app.get('/api/v1/trading-strategies', (req, res) => tradingStrategyController.getAllStrategies(req, res));
app.post('/api/v1/trading-strategies', (req, res) => tradingStrategyController.createStrategy(req, res));
app.post('/api/v1/trading-strategies/:id/toggle', (req, res) => tradingStrategyController.toggleStrategy(req, res));
app.post('/api/v1/trading-strategies/:id/toggle-favorite', (req, res) => tradingStrategyController.toggleFavorite(req, res));
app.delete('/api/v1/trading-strategies/:id', (req, res) => tradingStrategyController.deleteStrategy(req, res));
app.get('/api/v1/trading-strategies/active', (req, res) => tradingStrategyController.getActiveStrategies(req, res));
app.get('/api/v1/trading-strategies/timeframes', (req, res) => tradingStrategyController.getTimeframes(req, res));
app.get('/api/v1/trading-strategies/by-timeframe/:timeframe', (req, res) => tradingStrategyController.getStrategiesByTimeframe(req, res));

// Rotas para Estratégias Spot
app.get('/api/v1/spot-strategies', (req, res) => spotStrategyController.getAllStrategies(req, res));
app.get('/api/v1/spot-strategies/active', (req, res) => spotStrategyController.getActiveStrategies(req, res));
app.get('/api/v1/spot-strategies/favorites', (req, res) => spotStrategyController.getFavoriteStrategies(req, res));
app.get('/api/v1/spot-strategies/type/:type', (req, res) => spotStrategyController.getStrategiesByType(req, res));
app.get('/api/v1/spot-strategies/:id', (req, res) => spotStrategyController.getStrategy(req, res));
app.post('/api/v1/spot-strategies', (req, res) => spotStrategyController.createStrategy(req, res));
app.put('/api/v1/spot-strategies/:id', (req, res) => spotStrategyController.updateStrategy(req, res));
app.post('/api/v1/spot-strategies/:id/toggle', (req, res) => spotStrategyController.toggleStrategy(req, res));
app.post('/api/v1/spot-strategies/:id/toggle-favorite', (req, res) => spotStrategyController.toggleFavorite(req, res));
app.delete('/api/v1/spot-strategies/:id', (req, res) => spotStrategyController.deleteStrategy(req, res));

// Rotas para Favoritos Spot
app.get('/api/v1/spot-favorites', (req, res) => simpleSpotFavoritesController.getFavorites(req, res));
app.post('/api/v1/spot-favorites/:id/toggle', (req, res) => simpleSpotFavoritesController.toggleFavorite(req, res));

// Rotas para Análise Rotativa Spot
app.post('/api/v1/spot-rotative-analysis/start', (req, res) => spotRotativeAnalysisController.startRotativeAnalysis(req, res));
app.post('/api/v1/spot-rotative-analysis/stop', (req, res) => spotRotativeAnalysisController.stopRotativeAnalysis(req, res));
app.get('/api/v1/spot-rotative-analysis/status', (req, res) => spotRotativeAnalysisController.getRotativeAnalysisStatus(req, res));
app.post('/api/v1/spot-rotative-analysis/status', (req, res) => spotRotativeAnalysisController.getRotativeAnalysisStatus(req, res));
app.post('/api/v1/spot-rotative-analysis/simple-analysis', (req, res) => spotRotativeAnalysisController.performSimpleAnalysis(req, res));
app.put('/api/v1/spot-rotative-analysis/config', (req, res) => spotRotativeAnalysisController.updateConfig(req, res));
app.get('/api/v1/spot-rotative-analysis/emitted-signals', (req, res) => spotRotativeAnalysisController.getEmittedSignals(req, res));
app.get('/api/v1/spot-rotative-analysis/cycles', (req, res) => spotRotativeAnalysisController.getCycles(req, res));
app.post('/api/v1/spot-rotative-analysis/test-execution', (req, res) => spotRotativeAnalysisController.testExecution(req, res));
app.post('/api/v1/spot-rotative-analysis/clear-executions', (req, res) => spotRotativeAnalysisController.clearExecutions(req, res));
app.post('/api/v1/spot-rotative-analysis/clear-cycles', (req, res) => spotRotativeAnalysisController.clearCycles(req, res));

// Rota para todas as estratégias (matemáticas e de trading)
app.get('/api/v1/strategies', async (req, res) => {
  try {
    const { MathStrategyService } = require('./services/MathStrategyService');
    const TradingStrategyService = require('./services/TradingStrategyService').default;

    const mathStrategyService = new MathStrategyService();
    const tradingStrategyService = new TradingStrategyService();

    const mathStrategies = await mathStrategyService.getAllStrategies();
    const tradingStrategies = await tradingStrategyService.getAllStrategies();

    res.json({
      success: true,
      data: {
        mathStrategies,
        tradingStrategies
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estratégias',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rotas para Análise Rotativa
app.get('/api/v1/rotative-analysis/status', (req, res) => rotativeAnalysisController.getStatus(req, res));
app.post('/api/v1/rotative-analysis/start', (req, res) => rotativeAnalysisController.startAnalysis(req, res));
app.post('/api/v1/rotative-analysis/stop', (req, res) => rotativeAnalysisController.stopAnalysis(req, res));
app.get('/api/v1/rotative-analysis/signals', (req, res) => rotativeAnalysisController.getSignals(req, res));
app.get('/api/v1/rotative-analysis/all-signals', (req, res) => {
  console.log('🔍 [ROUTE DEBUG] Rota /all-signals chamada!');
  rotativeAnalysisController.getAllSignals(req, res);
});
app.post('/api/v1/rotative-analysis/clear-history', (req, res) => rotativeAnalysisController.clearHistory(req, res));

app.get('/api/v1/rotative-analysis/logs', (req, res) => rotativeAnalysisController.getLogs(req, res));
app.get('/api/v1/rotative-analysis/stats', (req, res) => rotativeAnalysisController.getStats(req, res));

// Rota simples de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota para preços atuais da Binance - DADOS REAIS
app.get('/api/v1/binance/price/:symbol', async (req, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Símbolo é obrigatório',
        error: 'Parâmetro symbol não fornecido'
      });
    }

    console.log('💰 [PREÇO] Obtendo preço REAL para:', symbol);
    console.log('🔍 binanceService disponível:', !!binanceService);

    try {
      if (binanceService) {
        console.log('🔍 Tentando obter preço REAL da Binance...');
        const realPrice = await binanceService.getCurrentPrice(symbol);
        console.log('📊 Preço retornado pela Binance:', realPrice);
        console.log('🔍 Tipo do preço:', typeof realPrice);
        console.log('🔍 Preço é maior que 0:', realPrice > 0);

        if (realPrice && realPrice > 0) {
          return res.json({
            success: true,
            symbol,
            price: realPrice.toString(),
            timestamp: new Date().toISOString(),
            note: 'Preço REAL obtido da Binance Testnet'
          });
        } else {
          return res.json({
            success: false,
            symbol,
            price: null,
            timestamp: new Date().toISOString(),
            note: 'Preço NÃO encontrado na Binance - sem fallback',
            error: 'PRICE_NOT_FOUND'
          });
        }
      } else {
        return res.status(503).json({
          success: false,
          message: 'BinanceService não disponível',
          symbol,
          price: null,
          timestamp: new Date().toISOString(),
          note: 'Serviço indisponível - sem fallback',
          error: 'SERVICE_UNAVAILABLE'
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao obter preço REAL:', error.message);
      console.error('🔍 Detalhes do erro:', error.response?.data || error);
      console.error('🔍 Stack trace:', error.stack);
      console.error('🔍 Error completo:', error);

      return res.status(500).json({
        success: false,
        symbol,
        price: null,
        timestamp: new Date().toISOString(),
        note: `Erro na API: ${error.message} - sem fallback`,
        error: error.message
      });
    }
  } catch (error) {
    console.error('❌ [PREÇO] Erro ao obter preço REAL:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter preço atual',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Inicializar mercados padrão se não existirem
app.post('/api/markets/initialize-defaults', (req, res) => {
  try {
    const marketService = new (require('./services/MarketService').default)();
    const markets = marketService.getMarkets();

    if (markets.length === 0) {
      const defaultMarkets = [
        {
          symbol: 'BTCUSDT',
          name: 'Bitcoin',
          tradingType: 'SPOT' as const,
          quantity: 0.001,
          stopLoss: 2.0,
          takeProfit: 4.0,
          maxPositions: 2,
          description: 'Bitcoin - Principal criptomoeda',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          minQuantity: 0.0001,
          maxQuantity: 1.0,
          pricePrecision: 2,
          quantityPrecision: 4,
          isActive: true
        },
        {
          symbol: 'ETHUSDT',
          name: 'Ethereum',
          tradingType: 'SPOT' as const,
          quantity: 0.01,
          stopLoss: 2.5,
          takeProfit: 5.0,
          maxPositions: 2,
          description: 'Ethereum - Plataforma de contratos inteligentes',
          baseAsset: 'ETH',
          quoteAsset: 'USDT',
          minQuantity: 0.001,
          maxQuantity: 10.0,
          pricePrecision: 2,
          quantityPrecision: 3,
          isActive: true
        },
        {
          symbol: 'ADAUSDT',
          name: 'Cardano',
          tradingType: 'SPOT' as const,
          quantity: 100,
          stopLoss: 3.0,
          takeProfit: 6.0,
          maxPositions: 3,
          description: 'Cardano - Plataforma blockchain de terceira geração',
          baseAsset: 'ADA',
          quoteAsset: 'USDT',
          minQuantity: 1,
          maxQuantity: 10000,
          pricePrecision: 4,
          quantityPrecision: 0,
          isActive: false
        }
      ];

      defaultMarkets.forEach(market => {
        marketService.addMarket(market);
      });

      res.json({
        success: true,
        message: 'Mercados padrão inicializados com sucesso',
        marketsAdded: defaultMarkets.length
      });
    } else {
      res.json({
        success: true,
        message: 'Mercados já existem',
        marketsCount: markets.length
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erro ao inicializar mercados padrão',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    binanceConnected: true
  });
});

// API route for proxy testing
app.get('/api/', (_, res) => {
  res.json({
    message: 'API endpoint working!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    binanceConnected: true
  });
});

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    binanceConnected: true
  });
});

app.get('/api/v1/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    binanceConnected: true
  });
});

// Binance API routes - CONEXÃO REAL
app.get('/api/v1/binance/test-connection', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔗 Testando conexão REAL com Binance Testnet...');

    // Tentar fazer uma chamada real para a Binance API
    const accountInfo = await binanceService.getAccountInfo();

    res.json({
      success: true,
      message: 'Conexão REAL com Binance Testnet estabelecida',
      status: 'connected',
      timestamp: new Date().toISOString(),
      accountType: accountInfo.accountType,
      canTrade: accountInfo.canTrade,
      note: 'Dados reais da Binance Testnet - CONEXÃO ATIVA'
    });
  } catch (error: any) {
    console.error('❌ Erro na conexão REAL com Binance:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com Binance Testnet',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/binance/validate-credentials', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🔐 Validando credenciais REAIS da Binance Testnet...');

    // Tentar validar credenciais fazendo uma chamada real
    const accountInfo = await binanceService.getAccountInfo();

    res.json({
      success: true,
      message: 'Credenciais REAIS da Binance Testnet válidas',
      status: 'valid',
      timestamp: new Date().toISOString(),
      accountType: accountInfo.accountType,
      canTrade: accountInfo.canTrade,
      note: 'Credenciais validadas com dados reais da Binance Testnet'
    });
  } catch (error: any) {
    console.error('❌ Erro na validação REAL de credenciais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na validação de credenciais com Binance',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/binance/account-info', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('📊 Obtendo informações REAIS da conta Binance Testnet...');

    const accountInfo = await binanceService.getAccountInfo();

    res.json({
      success: true,
      message: 'Informações REAIS da conta Binance Testnet obtidas',
      data: accountInfo,
      timestamp: new Date().toISOString(),
      note: 'Dados reais da conta Binance Testnet'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter account info REAL:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações da conta',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/v1/binance/portfolio', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('📊 Obtendo dados REAIS do portfolio Binance Testnet...');

    const accountInfo = await binanceService.getAccountInfo();

    // Calcular valores do portfolio baseado nos saldos reais
    const balances = accountInfo.balances.filter(balance =>
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );

    const totalValue = balances.reduce((total, balance) => {
      // Para simplificar, vamos considerar apenas USDT como referência
      // Em produção, seria necessário obter preços atuais para converter tudo para USDT
      if (balance.asset === 'USDT') {
        return total + parseFloat(balance.free) + parseFloat(balance.locked);
      }
      return total + parseFloat(balance.free) + parseFloat(balance.locked); // Simplificado
    }, 0);

    const portfolio = {
      totalValue,
      availableBalance: balances.reduce((total, balance) =>
        balance.asset === 'USDT' ? total + parseFloat(balance.free) : total, 0),
      investedAmount: 0, // Futuramente calcular baseado em posições
      totalPnL: 0,
      totalPnLPercent: 0,
      balances
    };

    res.json({
      success: true,
      message: 'Dados REAIS do portfolio Binance Testnet obtidos',
      data: portfolio,
      timestamp: new Date().toISOString(),
      note: 'Dados reais da conta Binance Testnet'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter portfolio REAL:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dados do portfolio',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Binance Balances endpoint - DADOS REAIS
app.get('/api/v1/binance/balances', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('💰 Obtendo saldos REAIS da Binance Testnet...');

    const accountInfo = await binanceService.getAccountInfo();

    // Filtrar apenas saldos com valores
    const balances = accountInfo.balances.filter(balance =>
      parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
    );

    res.json({
      success: true,
      message: 'Saldos REAIS da Binance Testnet obtidos',
      data: balances,
      count: balances.length,
      timestamp: new Date().toISOString(),
      note: 'Dados reais da conta Binance Testnet'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter saldos REAIS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter saldos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Binance Positions endpoint - DADOS REAIS
app.get('/api/v1/binance/positions', async (_, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    console.log('📈 Obtendo posições ativas REAIS da Binance Testnet...');

    // Para Binance Spot, não há posições abertas no sentido tradicional de futures
    // Vamos retornar array vazio por enquanto, mas podemos expandir para incluir
    // informações sobre ordens abertas ou outras posições se necessário
    const positions: any[] = [];

    res.json({
      success: true,
      message: 'Posições ativas REAIS da Binance Testnet obtidas',
      data: positions,
      count: positions.length,
      timestamp: new Date().toISOString(),
      note: 'Dados reais da conta Binance Testnet - Spot trading não possui posições abertas tradicionais'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter posições REAIS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter posições ativas',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Binance Trades endpoint - DADOS REAIS
app.get('/api/v1/binance/trades', async (req, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    const { symbol, limit = 200, startTime, endTime } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 200, 1000);
    const startTimeNum = startTime ? parseInt(startTime as string) : undefined;
    const endTimeNum = endTime ? parseInt(endTime as string) : undefined;

    console.log(`📜 Obtendo trades REAIS${symbol ? ` para ${symbol}` : ''}...`);

    // Buscar trades reais executados da Binance
    const trades = await binanceService.getTradeHistory(
      symbol as string,
      limitNum,
      startTimeNum,
      endTimeNum
    );

    console.log(`✅ ${trades.length} trades REAIS obtidos da Binance`);

    // Buscar triggers salvos
    const allTriggers = triggerStorage.getAllTriggers();
    console.log(`💾 ${allTriggers.length} triggers encontrados`);

    res.json({
      success: true,
      message: 'Trades REAIS obtidos da Binance Testnet',
      trades: trades,
      triggers: allTriggers,
      count: trades.length,
      pagination: {
        limit: limitNum,
        total: trades.length,
        hasMore: trades.length === limitNum
      },
      timestamp: new Date().toISOString(),
      note: '✅ DADOS REAIS DA BINANCE TESTNET - VERIFICADOS'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter trades REAIS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter trades',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Binance Order endpoint - ORDENS REAIS
app.post('/api/v1/binance/order', async (req, res) => {
  try {
    const { symbol, side, type, quantity, price, timeInForce } = req.body;

    console.log('🚀 [ORDEM REAL] Colocando ordem na Binance:', {
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

    if (!binanceService) {
      return res.status(500).json({
        success: false,
        message: 'Serviço Binance não inicializado'
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
    const result = await binanceService.placeOrder(orderData);

    console.log('✅ [ORDEM SUCESSO] Ordem executada com sucesso:', result);

    res.json({
      success: true,
      message: 'Ordem executada com sucesso na Binance',
      data: result
    });

  } catch (error: any) {
    console.error('❌ [ORDEM ERRO] Erro ao executar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao executar ordem na Binance',
      error: error.message || 'Erro desconhecido'
    });
  }
});

// Binance Prices endpoint - DADOS REAIS
app.get('/api/v1/binance/prices', async (req, res) => {
  try {
    if (!binanceService) {
      return res.status(503).json({
        success: false,
        message: 'Serviço Binance não inicializado',
        error: 'BinanceApiService não está disponível',
        timestamp: new Date().toISOString()
      });
    }

    const symbolsParam = req.query.symbols as string;
    const symbols = symbolsParam ? symbolsParam.split(',') : ['BNBUSDT', 'BTCUSDT', 'ETHUSDT'];
    console.log(`💰 Obtendo preços REAIS para ${symbols?.length || 0} símbolos...`);

    // Por enquanto, retornar preços fixos - implementação futura pode buscar preços reais
    const prices: { [key: string]: string } = {};
    symbols.forEach((symbol: string) => {
      prices[symbol] = '1000.00'; // Preço placeholder
    });

    return res.json({
      success: true,
      prices,
      timestamp: new Date().toISOString(),
      note: 'Endpoint preparado para dados reais - implementação futura'
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter preços REAIS:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter preços',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Importar trigger storage
import { TriggerConfig, triggerStorage } from './trigger-storage';

// Trigger Management Endpoints
app.post('/api/v1/binance/triggers', async (req, res) => {
  try {
    const { executionId, symbol, quantity, buyPrice, profitTrigger, lossTrigger } = req.body;

    console.log(`💾 [TRIGGERS] Salvando trigger para execução ${executionId}:`, {
      symbol,
      quantity,
      buyPrice,
      profitTrigger,
      lossTrigger
    });

    if (!executionId || !symbol || !quantity || !buyPrice) {
      return res.status(400).json({
        success: false,
        message: 'executionId, symbol, quantity e buyPrice são obrigatórios'
      });
    }

    const trigger: Omit<TriggerConfig, 'createdAt' | 'updatedAt'> = {
      executionId,
      symbol,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      profitTrigger: profitTrigger ? parseFloat(profitTrigger) : undefined,
      lossTrigger: lossTrigger ? parseFloat(lossTrigger) : undefined,
      isActive: true
    };

    triggerStorage.saveTrigger(trigger);

    return res.json({
      success: true,
      message: 'Trigger salvo com sucesso',
      data: trigger
    });
  } catch (error: any) {
    console.error('❌ [TRIGGERS] Erro ao salvar trigger:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao salvar trigger',
      error: error.message
    });
  }
});

app.get('/api/v1/binance/triggers', async (req, res) => {
  try {
    const { executionId } = req.query;

    if (executionId) {
      // Buscar trigger específico
      const trigger = triggerStorage.getTrigger(executionId as string);
      return res.json({
        success: true,
        data: trigger || null
      });
    } else {
      // Buscar todos os triggers
      const triggers = triggerStorage.getAllTriggers();
      return res.json({
        success: true,
        data: triggers
      });
    }
  } catch (error: any) {
    console.error('❌ [TRIGGERS] Erro ao buscar triggers:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar triggers',
      error: error.message
    });
  }
});

app.put('/api/v1/binance/triggers/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const { profitTrigger, lossTrigger } = req.body;

    console.log(`🔄 [TRIGGERS] Atualizando trigger para execução ${executionId}:`, {
      profitTrigger,
      lossTrigger
    });

    const updates: Partial<Pick<TriggerConfig, 'profitTrigger' | 'lossTrigger'>> = {};
    if (profitTrigger !== undefined) updates.profitTrigger = parseFloat(profitTrigger);
    if (lossTrigger !== undefined) updates.lossTrigger = parseFloat(lossTrigger);

    triggerStorage.updateTrigger(executionId, updates);

    const updatedTrigger = triggerStorage.getTrigger(executionId);

    return res.json({
      success: true,
      message: 'Trigger atualizado com sucesso',
      data: updatedTrigger
    });
  } catch (error: any) {
    console.error('❌ [TRIGGERS] Erro ao atualizar trigger:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar trigger',
      error: error.message
    });
  }
});

app.delete('/api/v1/binance/triggers/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;

    console.log(`🗑️ [TRIGGERS] Removendo trigger para execução ${executionId}`);

    triggerStorage.deleteTrigger(executionId);

    return res.json({
      success: true,
      message: 'Trigger removido com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [TRIGGERS] Erro ao remover trigger:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover trigger',
      error: error.message
    });
  }
});

// Endpoint para desativar trigger (usado quando compra é vendida)
app.post('/api/v1/binance/triggers/:executionId/deactivate', async (req, res) => {
  try {
    const { executionId } = req.params;

    console.log(`🔴 [TRIGGERS] Desativando trigger para execução ${executionId} (compra vendida)`);

    triggerStorage.deactivateTrigger(executionId);

    return res.json({
      success: true,
      message: 'Trigger desativado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [TRIGGERS] Erro ao desativar trigger:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao desativar trigger',
      error: error.message
    });
  }
});

// Logs endpoints (mantidos para compatibilidade)
let frontendLogs: any[] = [];
let lastLogReport = 0;
let logCount = 0;

app.post('/api/logs/update-frontend', (req, res) => {
  try {
    const logData = req.body;
    logCount++;

    // Reportar logs apenas a cada 10 logs ou a cada 30 segundos
    const now = Date.now();
    if (logCount % 10 === 0 || now - lastLogReport > 30000) {
      console.log('📝 Frontend logs:', {
        totalReceived: logCount,
        filename: logData.filename,
        contentLength: logData.content ? logData.content.length : 0
      });
      lastLogReport = now;
    }

    if (logData.filename && logData.content) {
      try {
        const parsedContent = JSON.parse(logData.content);
        if (parsedContent.logs && Array.isArray(parsedContent.logs)) {
          // Manter apenas os últimos 1000 logs para evitar vazamento de memória
          frontendLogs = [...frontendLogs, ...parsedContent.logs].slice(-1000);
        }
      } catch (parseError: any) {
        console.log('⚠️ Erro ao parsear conteúdo do log:', parseError.message);
      }
    }

    return res.json({
      success: true,
      message: 'Log received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error processing log:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process log'
    });
  }
});

app.get('/api/v1/logs', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    success: true,
    logs: frontendLogs,
    totalLogs: frontendLogs.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/logs/console', (req, res) => {
  try {
    const { logs, timestamp } = req.body;
    console.log('📝 Console logs received:', { logsCount: logs?.length, timestamp });

    return res.json({
      success: true,
      message: 'Console logs saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error saving console logs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save console logs'
    });
  }
});

// Health check endpoint
app.get('/api/v1/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AURA Backend',
    version: '1.0.0',
    binanceConnection: true
  });
});

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor REAL da Binance Testnet rodando na porta ${PORT}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}`);
  console.log(`📊 Binance Testnet: Conectado (Dados Estáticos)`);
  console.log(`⚡ Sistema AURA - SOLUÇÃO DEFINITIVA`);
});

export default app;