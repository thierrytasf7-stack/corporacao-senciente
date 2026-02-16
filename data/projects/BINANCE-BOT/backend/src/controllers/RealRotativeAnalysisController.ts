import { Request, Response } from 'express';
import { ConfigLoader } from '../config/ConfigLoader';
import { BinanceApiService } from '../services/BinanceApiService';
import { MathStrategyService } from '../services/MathStrategyService';
import { RealRotativeAnalysisService } from '../services/RealRotativeAnalysisService';
import { RotativeAnalysisService } from '../services/RotativeAnalysisService';
import { SimpleExecutionService } from '../services/SimpleExecutionService';
import { TradingStrategyService } from '../services/TradingStrategyService';
import { logger } from '../utils/logger';

export class RealRotativeAnalysisController {
    private binanceService: BinanceApiService | null = null;
    private analysisService: RealRotativeAnalysisService | null = null;
    private rotativeAnalysisService: RotativeAnalysisService | null = null;

    constructor() {
        try {
            const configLoader = ConfigLoader.getInstance();
            const config = configLoader.loadConfig();
            const binanceConfig = config.binance;

            const apiKey = binanceConfig.apiKey;
            const secretKey = binanceConfig.secretKey;
            const isTestnet = binanceConfig.useTestnet;

            if (apiKey && secretKey) {
                this.binanceService = new BinanceApiService({
                    apiKey,
                    secretKey,
                    isTestnet
                });
                // Initialize all required services
                const tradingStrategyService = new TradingStrategyService();
                const mathStrategyService = new MathStrategyService();
                const executionService = new SimpleExecutionService(this.binanceService);

                // ✅ CRIAR INSTÂNCIA COMPARTILHADA DO ROTATIVEANALYSISSERVICE
                this.rotativeAnalysisService = new RotativeAnalysisService(this.binanceService);

                this.analysisService = new RealRotativeAnalysisService(
                    this.binanceService,
                    tradingStrategyService,
                    mathStrategyService,
                    executionService,
                    this.rotativeAnalysisService
                );
                logger.info('Real Rotative Analysis service initialized successfully with shared RotativeAnalysisService');
            } else {
                logger.warn('Binance credentials not configured - rotative analysis not available');
            }
        } catch (error) {
            logger.warn('Error initializing Real Rotative Analysis service:', error);
        }
    }

    /**
     * Start continuous rotative analysis
     */
    async startAnalysis(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const { favoriteSymbols } = req.body;

            if (!Array.isArray(favoriteSymbols)) {
                return res.status(400).json({
                    success: false,
                    message: 'favoriteSymbols deve ser um array de símbolos'
                });
            }

            logger.info(`🚀 Iniciando análise rotativa CONTÍNUA para ${favoriteSymbols.length} mercados favoritos`);

            const result = await this.analysisService.startRotativeAnalysis(favoriteSymbols);

            res.json({
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString(),
                note: 'Sistema de análise contínua com dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error('Erro ao iniciar análise rotativa:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    /**
     * Stop continuous rotative analysis
     */
    async stopAnalysis(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            logger.info('🛑 Parando análise rotativa contínua');

            const result = await this.analysisService.stopRotativeAnalysis();

            res.json({
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Erro ao parar análise rotativa:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    /**
     * Run single analysis cycle (one-time analysis)
     */
    async runAnalysis(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const { favoriteSymbols } = req.body;

            if (!Array.isArray(favoriteSymbols)) {
                return res.status(400).json({
                    success: false,
                    message: 'favoriteSymbols deve ser um array de símbolos'
                });
            }

            logger.info(`🚀 Iniciando análise rotativa REAL para ${favoriteSymbols.length} mercados favoritos`);

            const result = await this.analysisService.runSingleAnalysisCycle(favoriteSymbols);

            res.json({
                success: true,
                message: `Análise rotativa REAL concluída: ${result.analyzedMarkets}/${result.totalMarkets} mercados`,
                data: result,
                timestamp: new Date().toISOString(),
                note: 'Análise baseada em dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error('Failed to run rotative analysis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao executar análise rotativa',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get analysis for specific symbol
     */
    async analyzeSymbol(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const { symbol } = req.params;

            if (!symbol) {
                return res.status(400).json({
                    success: false,
                    message: 'Símbolo é obrigatório'
                });
            }

            logger.info(`📊 Analisando símbolo individual: ${symbol}`);

            const signal = await this.analysisService.analyzeSymbol(symbol.toUpperCase());

            res.json({
                success: true,
                message: `Análise individual concluída para ${symbol}`,
                data: signal,
                timestamp: new Date().toISOString(),
                note: 'Análise baseada em dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error(`Failed to analyze symbol ${req.params.symbol}:`, error);
            res.status(500).json({
                success: false,
                message: `Erro ao analisar ${req.params.symbol}`,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get multi-timeframe analysis for symbol
     */
    async getMultiTimeframeAnalysis(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const { symbol } = req.params;

            if (!symbol) {
                return res.status(400).json({
                    success: false,
                    message: 'Símbolo é obrigatório'
                });
            }

            logger.info(`📊 Análise multi-timeframe para: ${symbol}`);

            const analysis = await this.analysisService.getMultiTimeframeAnalysis(symbol.toUpperCase());

            res.json({
                success: true,
                message: `Análise multi-timeframe concluída para ${symbol}`,
                data: analysis,
                timestamp: new Date().toISOString(),
                note: 'Análise em múltiplos timeframes com dados reais da Binance Testnet'
            });

        } catch (error: any) {
            logger.error(`Failed to get multi-timeframe analysis for ${req.params.symbol}:`, error);
            res.status(500).json({
                success: false,
                message: `Erro na análise multi-timeframe de ${req.params.symbol}`,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get last analysis result
     */
    async getLastAnalysis(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const lastAnalysis = this.analysisService.getLastAnalysis();

            if (!lastAnalysis) {
                return res.json({
                    success: true,
                    message: 'Nenhuma análise anterior encontrada',
                    data: null,
                    timestamp: new Date().toISOString()
                });
            }

            res.json({
                success: true,
                message: 'Última análise recuperada',
                data: lastAnalysis,
                timestamp: new Date().toISOString(),
                note: 'Dados da última análise rotativa real'
            });

        } catch (error: any) {
            logger.error('Failed to get last analysis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao recuperar última análise',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get analysis status
     */
    async getAnalysisStatus(req: Request, res: Response) {
        console.log('🔍 [DEBUG] getAnalysisStatus chamado!');
        try {
            if (!this.analysisService) {
                console.log('❌ [DEBUG] analysisService não disponível');
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            const status = this.analysisService.getAnalysisStatus();
            const lastAnalysis = this.analysisService.getLastAnalysis();

            console.log('🔍 [DEBUG] Controller - status recebido:', status);

            res.json({
                success: true,
                message: 'Status da análise rotativa',
                data: {
                    isRunning: status.isRunning,
                    isAnalyzing: status.isAnalyzing,
                    lastAnalysisTime: status.lastAnalysisTime,
                    lastAnalysisMarkets: status.lastAnalysisMarkets,
                    hasLastAnalysis: status.hasLastAnalysis,
                    totalCyclesCompleted: status.totalCyclesCompleted,
                    currentCycleNumber: status.currentCycleNumber,
                    executedOrders: lastAnalysis?.executedOrders || 0,
                    activeStrategies: lastAnalysis?.activeStrategies || { trading: 0, mathStrategy: null }
                },
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to get analysis status:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter status da análise',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get real market data for analysis
     */
    async getMarketData(req: Request, res: Response) {
        try {
            if (!this.binanceService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço Binance não disponível'
                });
            }

            const { symbol, interval = '1h', limit = 100 } = req.query;

            if (!symbol) {
                return res.status(400).json({
                    success: false,
                    message: 'Símbolo é obrigatório'
                });
            }

            logger.info(`📊 Obtendo dados de mercado real para: ${symbol}`);

            const klines = await this.binanceService.getKlines(
                symbol as string,
                interval as string,
                parseInt(limit as string) || 100
            );

            res.json({
                success: true,
                message: `Dados de mercado obtidos para ${symbol}`,
                data: {
                    symbol,
                    interval,
                    klines,
                    count: klines.length
                },
                timestamp: new Date().toISOString(),
                note: 'Dados reais de candlesticks da Binance Testnet'
            });

        } catch (error: any) {
            logger.error(`Failed to get market data for ${req.query.symbol}:`, error);
            res.status(500).json({
                success: false,
                message: `Erro ao obter dados de mercado para ${req.query.symbol}`,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Get all accumulated signals
     */
    async getAllSignals(req: Request, res: Response) {
        try {
            console.log('🔍 [DEBUG] getAllSignals chamado no controller');

            // Usar o RealRotativeAnalysisService que já tem histórico de sinais
            if (!this.analysisService) {
                console.log('❌ [DEBUG] analysisService não disponível');
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            console.log('✅ [DEBUG] analysisService disponível, buscando sinais...');
            const signals = await this.analysisService.getAllSignals();
            console.log(`📊 [DEBUG] ${signals.length} sinais encontrados`);

            res.json({
                success: true,
                signals,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            console.error('❌ [DEBUG] Erro em getAllSignals:', error);
            logger.error('Failed to get all signals:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter todos os sinais',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Clear signals and analysis history
     */
    async clearHistory(req: Request, res: Response) {
        try {
            // Usar o RealRotativeAnalysisService que já tem histórico de sinais
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            await this.analysisService.clearSignalsHistory();

            res.json({
                success: true,
                message: 'Histórico de sinais e análise limpo com sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to clear history:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao limpar histórico',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Clear only signals (not analysis history)
     */
    async clearSignals(req: Request, res: Response) {
        try {
            if (!this.analysisService) {
                return res.status(503).json({
                    success: false,
                    message: 'Serviço de análise não disponível'
                });
            }

            // Limpar sinais no RotativeAnalysisService também
            if (this.rotativeAnalysisService) {
                await this.rotativeAnalysisService.clearSignals();
            }

            // Limpar sinais no RealRotativeAnalysisService
            await this.analysisService.clearSignalsHistory();

            logger.info('🧹 Sinais limpos com sucesso');

            res.json({
                success: true,
                message: 'Sinais limpos com sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Failed to clear signals:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao limpar sinais',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}
