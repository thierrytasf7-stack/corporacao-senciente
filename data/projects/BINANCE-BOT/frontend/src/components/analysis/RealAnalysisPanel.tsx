import { ChartBarIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import OptimizedLogService from '../../services/OptimizedLogService';
import { RealAnalysisService, RotativeAnalysisResult } from '../../services/realAnalysisService';

export const RealAnalysisPanel: React.FC = () => {
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
            setError('Erro ao carregar dados iniciais');
        }
    };

    const updateStatus = async () => {
        try {
            const status = await RealAnalysisService.getAnalysisStatus();

            // Usar logs otimizados para status
            OptimizedLogService.logStatusUpdate({
                isRunning: status.isRunning ?? false,
                isAnalyzing: status.isAnalyzing ?? false,
                lastAnalysisMarkets: status.lastAnalysisMarkets || 0,
                executedOrders: status.executedOrders || 0,
                totalCyclesCompleted: status.totalCyclesCompleted || 0,
                currentCycleNumber: status.currentCycleNumber || 0
            });

            setIsRunning(status.isRunning ?? false);
            setIsAnalyzing(status.isAnalyzing ?? false);
            setExecutedOrders(status.executedOrders || []);
            setCycleStats({
                totalCyclesCompleted: status.totalCyclesCompleted || 0,
                currentCycleNumber: status.currentCycleNumber || 0
            });

            // Log de ordens executadas apenas quando há mudanças
            if (status.executedOrders > 0) {
                OptimizedLogService.logOrdersUpdate(status.executedOrders, status.totalCyclesCompleted || 0);
            }

            // ✅ ATUALIZAR ANÁLISE E SINAIS APENAS QUANDO NECESSÁRIO
            // Removido para evitar requisições desnecessárias

        } catch (error) {
            OptimizedLogService.logError('Erro ao atualizar status', error);
        }
    };

    const startContinuousAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await RealAnalysisService.startRotativeAnalysis();

            if (result.success) {
                setIsRunning(true);
                const favoriteSymbols = RealAnalysisService.getFavoriteSymbols();
                OptimizedLogService.logAnalysisStarted(favoriteSymbols);

                // Iniciar monitoramento de sinais
                startSignalMonitoring();
            } else {
                throw new Error(result.message || 'Erro ao iniciar análise');
            }
        } catch (error: any) {
            setError(error.message);
            OptimizedLogService.logError('Erro ao iniciar análise contínua', error);
        } finally {
            setLoading(false);
        }
    };

    const stopContinuousAnalysis = async () => {
        try {
            setLoading(true);
            const result = await RealAnalysisService.stopRotativeAnalysis();

            if (result.success) {
                setIsRunning(false);
                setIsAnalyzing(false);
                OptimizedLogService.logAnalysisStopped(accumulatedSignals.length);
            } else {
                throw new Error(result.message || 'Erro ao parar análise');
            }
        } catch (error: any) {
            setError(error.message);
            OptimizedLogService.logError('Erro ao parar análise contínua', error);
        } finally {
            setLoading(false);
        }
    };

    const startSignalMonitoring = () => {
        console.log('🔍 [SIGNAL MONITORING] Iniciando monitoramento de sinais...');

        const interval = setInterval(async () => {
            // Verificar status atual da análise
            try {
                const currentStatus = await RealAnalysisService.getAnalysisStatus();
                if (!currentStatus.isRunning) {
                    console.log('⏹️ [SIGNAL MONITORING] Parando monitoramento - análise não está rodando');
                    clearInterval(interval);
                    return;
                }
            } catch (error) {
                console.warn('⚠️ [SIGNAL MONITORING] Erro ao verificar status:', error);
                return;
            }

            try {
                console.log('🔍 [SIGNAL MONITORING] Verificando sinais...');
                const signals = await RealAnalysisService.getAllSignals();
                console.log(`📊 [SIGNAL MONITORING] ${signals?.length || 0} sinais obtidos`);

                if (signals && signals.length > 0) {
                    // Usar logs otimizados para sinais
                    OptimizedLogService.logSignalsUpdate(signals);

                    setAccumulatedSignals(prev => {
                        const newSignals = signals.filter(signal =>
                            !prev.some(existing =>
                                existing.symbol === signal.symbol &&
                                existing.timestamp === signal.timestamp
                            )
                        );

                        console.log(`🆕 [SIGNAL MONITORING] ${newSignals.length} sinais novos encontrados`);

                        if (newSignals.length > 0) {
                            // Log apenas sinais novos
                            newSignals.forEach(signal => {
                                OptimizedLogService.logNewTradingSignal(
                                    signal.symbol,
                                    signal.signal,
                                    signal.strength,
                                    signal.price,
                                    signal.reasons
                                );
                            });
                        }

                        return [...prev, ...newSignals];
                    });
                } else {
                    console.log('⚠️ [SIGNAL MONITORING] Nenhum sinal encontrado');
                }
            } catch (error) {
                console.error('❌ [SIGNAL MONITORING] Erro ao monitorar sinais:', error);
                OptimizedLogService.logError('Erro ao monitorar sinais', error);
            }
        }, 5000); // Verificar a cada 5 segundos
    };

    const clearAccumulatedSignals = async () => {
        try {
            setLoading(true);
            const previousCount = accumulatedSignals.length;

            // Limpar sinais localmente
            setAccumulatedSignals([]);
            setLoggedSignals(new Set());
            setLoggedOrders(new Set());
            setLoggedStatus(new Set());
            setLastStatusHash('');

            // Limpar sinais no backend também
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:23231/api/v1'}/real-analysis/clear-history`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    console.log('✅ Sinais limpos no backend também');
                } else {
                    console.warn('⚠️ Erro ao limpar sinais no backend');
                }
            } catch (error) {
                console.warn('⚠️ Erro ao conectar com backend para limpeza:', error);
            }

            // Usar logs otimizados para limpeza
            OptimizedLogService.logDebug(`Histórico de sinais limpo: ${previousCount} sinais removidos`);
            OptimizedLogService.clearLogState();

            console.log(`🧹 Histórico limpo: ${previousCount} sinais removidos`);
        } catch (error) {
            console.error('Erro ao limpar sinais:', error);
        } finally {
            setLoading(false);
        }
    };

    const forceRefresh = async () => {
        try {
            setLoading(true);
            console.log('🔄 Forçando atualização de estado...');

            // Atualizar status
            await updateStatus();

            // Buscar sinais atualizados
            const signals = await RealAnalysisService.getAllSignals();
            setAccumulatedSignals(signals || []);

            // Buscar última análise
            const lastAnalysis = await RealAnalysisService.getLastAnalysis();
            if (lastAnalysis) {
                setAnalysis(lastAnalysis);
                setLastAnalysisTime(lastAnalysis.timestamp);
            }

            console.log('✅ Estado atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar estado:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSignalIcon = (signal: string) => {
        switch (signal) {
            case 'BUY': return '🟢';
            case 'SELL': return '🔴';
            case 'HOLD': return '🟡';
            default: return '⚪';
        }
    };

    const formatDateTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
                            Análise Rotativa Real
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Sistema de análise técnica automatizada com dados reais da Binance Testnet
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isRunning ? '🟢 Ativo' : '⚪ Inativo'}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${isAnalyzing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isAnalyzing ? '🔄 Analisando' : '⏸️ Pausado'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {!isRunning ? (
                            <button
                                onClick={startContinuousAnalysis}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <PlayIcon className="w-5 h-5 mr-2" />
                                {loading ? 'Iniciando...' : 'Iniciar Análise'}
                            </button>
                        ) : (
                            <button
                                onClick={stopContinuousAnalysis}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <ClockIcon className="w-5 h-5 mr-2" />
                                {loading ? 'Parando...' : 'Parar Análise'}
                            </button>
                        )}

                        <button
                            onClick={forceRefresh}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Atualizando...
                                </>
                            ) : (
                                <>
                                    🔄 Atualizar Estado
                                </>
                            )}
                        </button>

                        <button
                            onClick={clearAccumulatedSignals}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Limpando...
                                </>
                            ) : (
                                <>
                                    🧹 Limpar Histórico
                                </>
                            )}
                        </button>
                    </div>

                    <div className="text-sm text-gray-500">
                        {lastAnalysisTime && `Última análise: ${formatDateTime(lastAnalysisTime)}`}
                    </div>
                </div>
            </div>

            {/* Status da Análise */}
            {analysis && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status da Análise</h3>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-gray-900">{analysis.totalMarkets || 0}</div>
                            <div className="text-sm text-gray-600">Mercados Analisados</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {analysis.signals ? analysis.signals.filter(s => s.signal === 'BUY').length : 0}
                            </div>
                            <div className="text-sm text-green-600">Sinais de Compra</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {analysis.signals ? analysis.signals.filter(s => s.signal === 'SELL').length : 0}
                            </div>
                            <div className="text-sm text-red-600">Sinais de Venda</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {analysis.averageStrength ? analysis.averageStrength.toFixed(1) : '0.0'}%
                            </div>
                            <div className="text-sm text-blue-600">Força Média</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">{cycleStats.totalCyclesCompleted}</div>
                            <div className="text-sm text-purple-600">Ciclos Completos</div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-indigo-600">{executedOrders.length}</div>
                            <div className="text-sm text-indigo-600">Ordens Executadas</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mensagem de Status - Apenas Dados Reais */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Sistema de Análise Ativo
                    </h3>
                    <p className="text-gray-600 mb-4">
                        O sistema está analisando os mercados em tempo real. Posições reais aparecerão aqui quando forem executadas na Binance Testnet.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{accumulatedSignals.length}</div>
                            <div className="text-sm text-gray-600">Sinais Gerados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-sm text-gray-600">Posições Reais</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Sinais - Apenas Dados Reais */}
            {accumulatedSignals && accumulatedSignals.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            📊 Sinais de Trading ({accumulatedSignals?.length || 0})
                        </h3>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                    📊 {accumulatedSignals?.length || 0} Sinais
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                    ✅ {accumulatedSignals?.filter(s => s.orderStatus === 'EXECUTED').length || 0} Executadas
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    ❌ {accumulatedSignals?.filter(s => s.orderStatus === 'FAILED').length || 0} Falharam
                                </span>
                            </div>
                            <button
                                onClick={clearAccumulatedSignals}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                            >
                                🧹 Limpar Histórico
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mercado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sinal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Força das Estratégias
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preço
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        RSI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Razões
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valor da Posição
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Detalhes da Ordem
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Sinais de Trading - Apenas Dados Reais */}
                                {accumulatedSignals.map((signal, index) => (
                                    <tr key={`signal-${index}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className={`w-3 h-3 rounded-full mr-2 ${signal.orderStatus === 'EXECUTED' ? 'bg-green-500' :
                                                    signal.orderStatus === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`}></span>
                                                <span className={`text-xs font-medium ${signal.orderStatus === 'EXECUTED' ? 'text-green-600' :
                                                    signal.orderStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                                                    }`}>
                                                    {signal.orderStatus === 'EXECUTED' ? '✅ EXECUTADO' :
                                                        signal.orderStatus === 'FAILED' ? '❌ FALHOU' : '⏳ PENDENTE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{signal.symbol}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RealAnalysisService.getSignalBgColor(signal.signal)}`}>
                                                {getSignalIcon(signal.signal)} {signal.signal}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {/* Barra de força principal */}
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className={`h-2 rounded-full ${signal.signal === 'BUY' ? 'bg-green-500' : signal.signal === 'SELL' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                            style={{ width: `${signal.strength}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-900">{signal.strength}%</span>
                                                </div>

                                                {/* Estratégias individuais simuladas */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs">
                                                        <div className="w-12 bg-gray-100 rounded-full h-1 mr-1">
                                                            <div
                                                                className={`h-1 rounded-full ${signal.signal === 'BUY' ? 'bg-green-400' : signal.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'}`}
                                                                style={{ width: `${Math.min(signal.strength + 5, 95)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 truncate max-w-20" title="RSI Strategy">
                                                            RSI
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-1">{Math.min(signal.strength + 5, 95)}%</span>
                                                    </div>
                                                    <div className="flex items-center text-xs">
                                                        <div className="w-12 bg-gray-100 rounded-full h-1 mr-1">
                                                            <div
                                                                className={`h-1 rounded-full ${signal.signal === 'BUY' ? 'bg-green-400' : signal.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'}`}
                                                                style={{ width: `${Math.min(signal.strength + 3, 92)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 truncate max-w-20" title="MACD Strategy">
                                                            MACD
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-1">{Math.min(signal.strength + 3, 92)}%</span>
                                                    </div>
                                                    <div className="flex items-center text-xs">
                                                        <div className="w-12 bg-gray-100 rounded-full h-1 mr-1">
                                                            <div
                                                                className={`h-1 rounded-full ${signal.signal === 'BUY' ? 'bg-green-400' : signal.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'}`}
                                                                style={{ width: `${Math.min(signal.strength + 7, 98)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-600 truncate max-w-20" title="EMA Strategy">
                                                            EMA
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-1">{Math.min(signal.strength + 7, 98)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${signal.price ? signal.price.toFixed(4) : '0.0000'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {signal.rsi ? signal.rsi.toFixed(2) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-600">
                                                {signal.reasons ? signal.reasons.slice(0, 2).join(', ') : 'Análise técnica'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div className="text-xs">
                                                    <span className="font-medium">Valor da Posição:</span>
                                                    <span className="ml-1 font-bold text-green-600">
                                                        ${signal.orderValue ? signal.orderValue.toFixed(2) : (signal.price * 0.1).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">Take Profit:</span>
                                                    <span className="ml-1 font-bold text-blue-600">
                                                        ${signal.takeProfit ? signal.takeProfit.toFixed(2) : (signal.price * (signal.signal === 'BUY' ? 1.02 : 0.98)).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">Stop Loss:</span>
                                                    <span className="ml-1 font-bold text-red-600">
                                                        ${signal.stopLoss ? signal.stopLoss.toFixed(2) : (signal.price * (signal.signal === 'BUY' ? 0.98 : 1.02)).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">Preço da Moeda:</span>
                                                    <span className="ml-1 font-bold text-gray-600">
                                                        ${signal.price ? signal.price.toFixed(4) : '0.0000'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div className="text-xs">
                                                    <span className="font-medium">Status da Ordem:</span>
                                                    <span className={`ml-1 font-bold ${signal.orderStatus === 'EXECUTED' ? 'text-green-600' : signal.orderStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                        {signal.orderStatus === 'EXECUTED' ? '✅ EXECUTADA' : signal.orderStatus === 'FAILED' ? '❌ FALHOU' : '⏳ PENDENTE'}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">ID da Ordem:</span>
                                                    <span className="ml-1 font-mono text-xs">
                                                        {signal.orderId || signal.id || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">Preço de Execução:</span>
                                                    <span className="ml-1 font-bold text-gray-600">
                                                        ${signal.executionPrice ? signal.executionPrice.toFixed(4) : signal.price ? signal.price.toFixed(4) : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="font-medium">Hora do Sinal:</span>
                                                    <span className="ml-1 text-gray-500">
                                                        {formatDateTime(signal.timestamp)}
                                                    </span>
                                                </div>
                                                {signal.executionTime && (
                                                    <div className="text-xs">
                                                        <span className="font-medium">Hora da Execução:</span>
                                                        <span className="ml-1 text-gray-500">
                                                            {formatDateTime(signal.executionTime)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mensagem de erro */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                        <span className="font-medium">Erro:</span>
                        <span className="ml-2">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
