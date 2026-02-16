import { ChartBarIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import OptimizedLogService from '../../services/OptimizedLogService';
import { RealAnalysisService, RotativeAnalysisResult } from '../../services/realAnalysisService';

export const FuturesAnalysisPanel: React.FC = () => {
    const [analysis, setAnalysis] = useState<RotativeAnalysisResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [lastAnalysisTime, setLastAnalysisTime] = useState<number | null>(null);
    const [executedOrders, setExecutedOrders] = useState<any[]>([]);
    const [activeStrategies, setActiveStrategies] = useState<{ trading: number; mathStrategy: string | null }>({ trading: 0, mathStrategy: null });
    const [cycleStats, setCycleStats] = useState<{ totalCyclesCompleted: number; currentCycleNumber: number }>({ totalCyclesCompleted: 0, currentCycleNumber: 0 });
    const [accumulatedSignals, setAccumulatedSignals] = useState<any[]>([]);

    // Controle de logs para evitar repetição
    const [loggedSignals, setLoggedSignals] = useState<Set<string>>(new Set());
    const [loggedOrders, setLoggedOrders] = useState<Set<string>>(new Set());
    const [loggedStatus, setLoggedStatus] = useState<Set<string>>(new Set());
    const [lastStatusHash, setLastStatusHash] = useState<string>('');

    useEffect(() => {
        loadInitialData();

        // Intervalo otimizado para status (10 segundos - reduzido para evitar spam)
        const statusInterval = setInterval(updateStatus, 10000);

        return () => {
            clearInterval(statusInterval);
        };
    }, []);

    const loadInitialData = async () => {
        try {
            setFavoriteCount(RealAnalysisService.getFavoriteCount());

            // Load last analysis
            const lastAnalysis = await RealAnalysisService.getLastAnalysis();
            if (lastAnalysis) {
                setAnalysis(lastAnalysis);
                setLastAnalysisTime(lastAnalysis.timestamp);
            }

            // Update status
            await updateStatus();
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
        }
    };

    const updateStatus = async () => {
        try {
            const status = await RealAnalysisService.getAnalysisStatus();
            const statusHash = JSON.stringify(status);

            if (statusHash !== lastStatusHash) {
                setLastStatusHash(statusHash);

                // Log status changes only once
                if (!loggedStatus.has(statusHash)) {
                    OptimizedLogService.logDebug('📊 [FUTURES ANALYSIS] Status atualizado:', status);
                    setLoggedStatus(prev => new Set([...prev, statusHash]));
                }

                setIsRunning(status.isRunning);
                setIsAnalyzing(status.isAnalyzing);
                setActiveStrategies(status.activeStrategies || { trading: 0, mathStrategy: null });
                setCycleStats(status.cycleStats || { totalCyclesCompleted: 0, currentCycleNumber: 0 });
                setExecutedOrders(status.executedOrders || []);
                setAccumulatedSignals(status.accumulatedSignals || []);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const startAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            OptimizedLogService.logDebug('🚀 [FUTURES ANALYSIS] Iniciando análise rotativa de futures...');

            await RealAnalysisService.startAnalysis();
            setIsRunning(true);

            OptimizedLogService.logDebug('✅ [FUTURES ANALYSIS] Análise rotativa de futures iniciada com sucesso!');
        } catch (error: any) {
            console.error('Erro ao iniciar análise:', error);
            setError(error.message || 'Erro ao iniciar análise');
        } finally {
            setLoading(false);
        }
    };

    const stopAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            OptimizedLogService.logDebug('⏹️ [FUTURES ANALYSIS] Parando análise rotativa de futures...');

            await RealAnalysisService.stopAnalysis();
            setIsRunning(false);

            OptimizedLogService.logDebug('✅ [FUTURES ANALYSIS] Análise rotativa de futures parada com sucesso!');
        } catch (error: any) {
            console.error('Erro ao parar análise:', error);
            setError(error.message || 'Erro ao parar análise');
        } finally {
            setLoading(false);
        }
    };

    const runSingleAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            setIsAnalyzing(true);

            OptimizedLogService.logDebug('🔄 [FUTURES ANALYSIS] Executando análise única de futures...');

            const result = await RealAnalysisService.runSingleAnalysis();
            setAnalysis(result);
            setLastAnalysisTime(Date.now());

            OptimizedLogService.logDebug('✅ [FUTURES ANALYSIS] Análise única de futures concluída!');
        } catch (error: any) {
            console.error('Erro ao executar análise:', error);
            setError(error.message || 'Erro ao executar análise');
        } finally {
            setLoading(false);
            setIsAnalyzing(false);
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    const formatDuration = (startTime: number, endTime: number) => {
        const duration = endTime - startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    Análise Rotativa Futures - Binance Testnet
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    🔄 Análise automática de oportunidades de trading futures
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    ℹ️ Sistema configurado especificamente para trading de futures com leverage.
                </p>
            </div>

            {/* Controles */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        onClick={isRunning ? stopAnalysis : startAnalysis}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${isRunning
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span>{isRunning ? 'Parar Análise' : 'Iniciar Análise'}</span>
                    </button>

                    <button
                        onClick={runSingleAnalysis}
                        disabled={loading || isAnalyzing}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>{isAnalyzing ? 'Analisando...' : 'Análise Única'}</span>
                    </button>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span>{isRunning ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                            <span>{isAnalyzing ? 'Analisando' : 'Parado'}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Estatísticas */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Futures</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{cycleStats.totalCyclesCompleted}</div>
                        <div className="text-sm text-gray-600">Ciclos Completos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{cycleStats.currentCycleNumber}</div>
                        <div className="text-sm text-gray-600">Ciclo Atual</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{activeStrategies.trading}</div>
                        <div className="text-sm text-gray-600">Estratégias Ativas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{executedOrders.length}</div>
                        <div className="text-sm text-gray-600">Ordens Executadas</div>
                    </div>
                </div>
            </div>

            {/* Análise Atual */}
            {analysis && (
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Última Análise de Futures</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Timestamp:</span>
                                <div className="font-medium">{formatTime(analysis.timestamp)}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Duração:</span>
                                <div className="font-medium">
                                    {formatDuration(analysis.startTime, analysis.endTime)}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Símbolos Analisados:</span>
                                <div className="font-medium">{analysis.symbolsAnalyzed}</div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Sinais Gerados:</span>
                                <div className="font-medium">{analysis.signalsGenerated}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sinais Acumulados */}
            {accumulatedSignals.length > 0 && (
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sinais de Futures Recentes</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {accumulatedSignals.slice(-10).map((signal, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${signal?.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                    <span className="font-medium">{signal?.symbol || 'N/A'}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${signal?.type === 'BUY'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {signal?.type || 'N/A'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {signal?.timestamp ? formatTime(signal.timestamp) : 'N/A'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Informações de Configuração */}
            <div className="p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Configuração de Futures</h3>
                <div className="text-sm text-blue-800 space-y-1">
                    <p>• Sistema otimizado para trading de futures com leverage</p>
                    <p>• Análise técnica específica para contratos futuros</p>
                    <p>• Gestão de risco adaptada para posições alavancadas</p>
                    <p>• Monitoramento de margem e liquidação</p>
                </div>
            </div>
        </div>
    );
};

export default FuturesAnalysisPanel;
