import { Request, Response } from 'express';
import { BinanceApiService } from '../services/BinanceApiService';
import { SimpleExecutionService } from '../services/SimpleExecutionService';
import { logger } from '../utils/logger';

export class TestExecutionController {
    private executionService: SimpleExecutionService;

    constructor() {
        // Criar instância temporária do BinanceApiService para teste
        const binanceService = new BinanceApiService({
            apiKey: process.env.BINANCE_API_KEY || '',
            secretKey: process.env.BINANCE_API_SECRET || '',
            isTestnet: true
        });

        this.executionService = new SimpleExecutionService(binanceService);
        logger.info('🧪 TestExecutionController initialized with REAL Binance integration');
    }

    /**
     * Teste: Forçar execução de ordem e verificar histórico
     */
    async testExecution(req: Request, res: Response): Promise<void> {
        try {
            logger.info('🧪 TESTE: Iniciando teste de execução forçada');

            // Simular sinal forte
            const testSignal = {
                symbol: 'BTCUSDT',
                side: 'BUY' as 'BUY' | 'SELL',
                amount: 5, // $5 USD
                strategy: 'Teste de Execução',
                confidence: 85
            };

            logger.info('🧪 TESTE: Executando sinal de teste:', testSignal);

            // Executar ordem
            const result = await this.executionService.executeOrder(testSignal);

            if (result.success) {
                logger.info('✅ TESTE: Execução bem-sucedida:', { orderId: result.orderId });

                res.json({
                    success: true,
                    message: 'Teste de execução concluído com sucesso',
                    data: {
                        signal: testSignal,
                        execution: result,
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                logger.error('❌ TESTE: Execução falhou:', { error: result.error });

                res.status(500).json({
                    success: false,
                    message: 'Falha no teste de execução',
                    error: result.error
                });
            }

        } catch (error: any) {
            logger.error('❌ TESTE: Erro no controlador:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno no teste',
                error: error.message
            });
        }
    }

    /**
     * Teste: Verificar histórico após execução
     */
    async testHistory(req: Request, res: Response): Promise<void> {
        try {
            logger.info('🧪 TESTE: Verificando histórico de posições');

            // Aqui faria uma consulta ao histórico real
            // const positions = await positionHistoryService.getAllPositions();

            res.json({
                success: true,
                message: 'Histórico consultado com sucesso',
                data: {
                    note: 'Implementar consulta real ao histórico',
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error: any) {
            logger.error('❌ TESTE: Erro ao consultar histórico:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao consultar histórico',
                error: error.message
            });
        }
    }
}
