import { Request, Response } from 'express';
import { SpotRotativeAnalysisService } from '../services/SpotRotativeAnalysisService';

export class SpotRotativeAnalysisController {
    private spotAnalysisService: SpotRotativeAnalysisService;

    constructor() {
        this.spotAnalysisService = new SpotRotativeAnalysisService();
    }

    /**
     * Inicia análise rotativa spot
     */
    async startRotativeAnalysis(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🚀 [CONTROLLER] Iniciando análise rotativa spot...');
            const result = await this.spotAnalysisService.startRotativeAnalysis();

            if (result.success) {
                console.log('✅ [CONTROLLER] Análise rotativa iniciada com sucesso');
                return res.json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('❌ [CONTROLLER] Falha ao iniciar análise rotativa:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao iniciar análise rotativa:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Para análise rotativa spot
     */
    async stopRotativeAnalysis(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🛑 [CONTROLLER] Parando análise rotativa spot...');
            const result = await this.spotAnalysisService.stopRotativeAnalysis();

            if (result.success) {
                console.log('✅ [CONTROLLER] Análise rotativa parada com sucesso');
                return res.json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('❌ [CONTROLLER] Falha ao parar análise rotativa:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao parar análise rotativa:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Obtém status da análise rotativa
     */
    async getRotativeAnalysisStatus(req: Request, res: Response): Promise<Response> {
        try {
            console.log('📊 [CONTROLLER] Obtendo status da análise rotativa...');

            // Obter mercados favoritos do corpo da requisição
            const favoriteMarkets = req.body?.favoriteMarkets || [];
            console.log('📊 [CONTROLLER] Mercados favoritos recebidos:', favoriteMarkets);

            const status = await this.spotAnalysisService.getRotativeAnalysisStatus(favoriteMarkets);

            return res.json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao obter status da análise rotativa:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Executa análise simples (sem rotativa)
     */
    async performSimpleAnalysis(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🔍 [CONTROLLER] Executando análise simples...');
            const signalsTable = await this.spotAnalysisService.generateSignalsTable();

            console.log(`✅ [CONTROLLER] Análise simples concluída - ${signalsTable.length} mercados analisados`);

            return res.json({
                success: true,
                message: 'Análise simples executada com sucesso',
                data: {
                    signalsTable,
                    marketsAnalyzed: signalsTable.length,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro na análise simples:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Atualiza configuração da análise rotativa
     */
    async updateConfig(req: Request, res: Response): Promise<Response> {
        try {
            const { minSignalsRequired, minSignalStrength, cycleIntervalMs, maxHistoryTables } = req.body;

            console.log('⚙️ [CONTROLLER] Atualizando configuração da análise rotativa...');
            console.log('📋 [CONTROLLER] Nova configuração:', { minSignalsRequired, minSignalStrength, cycleIntervalMs, maxHistoryTables });

            const result = await this.spotAnalysisService.updateConfig({
                minSignalsRequired,
                minSignalStrength,
                cycleIntervalMs,
                maxHistoryTables
            });

            if (result.success) {
                console.log('✅ [CONTROLLER] Configuração atualizada com sucesso');
                return res.json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('❌ [CONTROLLER] Falha ao atualizar configuração:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao atualizar configuração:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca sinais emitidos
     */
    async getEmittedSignals(req: Request, res: Response): Promise<Response> {
        try {
            console.log('📡 [CONTROLLER] Buscando sinais emitidos...');
            const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
            const pageSize = Math.max(1, Math.min(50, parseInt((req.query.pageSize as string) || '20', 10)));
            const pageResult = await this.spotAnalysisService.getExecutionsPage(page, pageSize);

            console.log(`✅ [CONTROLLER] Página de execuções: page=${page}, size=${pageSize}, items=${pageResult.items.length}, total=${pageResult.total}`);

            return res.json({
                success: true,
                message: 'Execuções recuperadas com sucesso',
                data: pageResult,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao buscar sinais emitidos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Busca ciclos paginados
     */
    async getCycles(req: Request, res: Response): Promise<Response> {
        try {
            const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
            const pageSize = Math.max(1, Math.min(50, parseInt((req.query.pageSize as string) || '20', 10)));
            const pageResult = await this.spotAnalysisService.getCyclesPage(page, pageSize);

            return res.json({
                success: true,
                message: 'Ciclos recuperados com sucesso',
                data: pageResult,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro ao buscar ciclos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Testa execução do sistema
     */
    async testExecution(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🧪 [CONTROLLER] Executando teste de execução...');
            const result = await this.spotAnalysisService.testExecution();

            return res.json({
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ [CONTROLLER] Erro no teste de execução:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Limpa histórico de execuções
     */
    async clearExecutions(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🗑️ [CONTROLLER] Limpando histórico de execuções...');
            const result = await this.spotAnalysisService.clearExecutions();

            if (result.success) {
                console.log('✅ [CONTROLLER] Histórico de execuções limpo com sucesso');
                return res.json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('❌ [CONTROLLER] Falha ao limpar execuções:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Erro ao limpar execuções:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Limpa histórico de ciclos
     */
    async clearCycles(req: Request, res: Response): Promise<Response> {
        try {
            console.log('🗑️ [CONTROLLER] Limpando histórico de ciclos...');
            const result = await this.spotAnalysisService.clearCycles();

            if (result.success) {
                console.log('✅ [CONTROLLER] Histórico de ciclos limpo com sucesso');
                return res.json({
                    success: true,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('❌ [CONTROLLER] Falha ao limpar ciclos:', result.message);
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error: any) {
            console.error('❌ [CONTROLLER] Erro ao limpar ciclos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}