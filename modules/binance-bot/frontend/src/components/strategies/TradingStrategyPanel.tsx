import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api/client';
import StrategyDetailsModal from './StrategyDetailsModal';

interface TradingSignal {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    timestamp: Date;
    strategy: string;
    confidence: number;
    status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
}

interface StrategyConfig {
    id: string;
    name: string;
    symbol: string;
    isActive: boolean;
    buyThreshold: number;
    sellThreshold: number;
    quantity: number;
    maxPositions: number;
    stopLoss: number;
    takeProfit: number;
    leverage?: number;
    tradingType?: 'SPOT' | 'FUTURES';
    strategyType?: string;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    description?: string;
}

interface StrategyStatus {
    isRunning: boolean;
    strategiesCount: number;
    signalsCount: number;
}

const TradingStrategyPanel: React.FC = () => {
    const [strategies, setStrategies] = useState<StrategyConfig[]>([]);
    const [signals, setSignals] = useState<TradingSignal[]>([]);
    const [status, setStatus] = useState<StrategyStatus | null>(null);
    const [isServiceRunning, setIsServiceRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<StrategyConfig | null>(null);
    const [selectedStrategyStats, setSelectedStrategyStats] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [newStrategy, setNewStrategy] = useState({
        name: '',
        symbol: 'BTCUSDT',
        buyThreshold: 1.0,
        sellThreshold: 1.0,
        quantity: 0.001,
        maxPositions: 3,
        stopLoss: 2.0,
        takeProfit: 5.0,
        leverage: 1,
        tradingType: 'SPOT' as 'SPOT' | 'FUTURES',
        strategyType: 'TREND_FOLLOWING',
        riskLevel: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
        description: ''
    });

    // Carregar dados iniciais
    useEffect(() => {
        console.log('🎯 TradingStrategyPanel: Carregando dados iniciais...');
        loadStrategies();
        loadSignals();
        loadStatus();
        loadServiceStatus();
    }, []);

    // Atualizar dados a cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            if (isServiceRunning) {
                loadSignals();
                loadStatus();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isServiceRunning]);

    const loadStrategies = async () => {
        try {
            console.log('🎯 Carregando estratégias...');
            const response = await apiClient.get('/strategies');
            console.log('🎯 Resposta da API:', response.data);
            if (response.data.success) {
                setStrategies(response.data.strategies);
                console.log('🎯 Estratégias carregadas:', response.data.strategies.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estratégias:', error);
        }
    };

    const loadSignals = async () => {
        try {
            const response = await apiClient.get('/strategies/signals');
            if (response.data.success) {
                setSignals(response.data.signals);
            }
        } catch (error) {
            console.error('Erro ao carregar sinais:', error);
        }
    };

    const loadStatus = async () => {
        try {
            const response = await apiClient.get('/strategies/status');
            if (response.data.success) {
                setStatus(response.data.status);
            }
        } catch (error) {
            console.error('Erro ao carregar status:', error);
        }
    };

    const loadServiceStatus = async () => {
        try {
            const response = await apiClient.get('/strategies/status');
            if (response.data.success) {
                setIsServiceRunning(response.data.status.isRunning);
            }
        } catch (error) {
            console.error('Erro ao carregar status do serviço:', error);
        }
    };

    const startService = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/strategies/start');
            if (response.data.success) {
                setIsServiceRunning(true);
                console.log('✅ Serviço de estratégias iniciado');
            }
        } catch (error) {
            console.error('Erro ao iniciar serviço:', error);
        } finally {
            setLoading(false);
        }
    };

    const stopService = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/strategies/stop');
            if (response.data.success) {
                setIsServiceRunning(false);
                console.log('🛑 Serviço de estratégias parado');
            }
        } catch (error) {
            console.error('Erro ao parar serviço:', error);
        } finally {
            setLoading(false);
        }
    };

    const createStrategy = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/strategies', newStrategy);
            if (response.data.success) {
                setNewStrategy({
                    name: '',
                    symbol: 'BTCUSDT',
                    buyThreshold: 1.0,
                    sellThreshold: 1.0,
                    quantity: 0.001,
                    maxPositions: 3,
                    stopLoss: 2.0,
                    takeProfit: 5.0
                });
                loadStrategies();
                console.log('✅ Estratégia criada com sucesso');
            }
        } catch (error) {
            console.error('Erro ao criar estratégia:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStrategy = async (strategyId: string) => {
        try {
            const response = await apiClient.post(`/strategies/${strategyId}/toggle`);
            if (response.data.success) {
                loadStrategies();
                console.log('🔄 Estratégia alternada');
            }
        } catch (error) {
            console.error('Erro ao alternar estratégia:', error);
        }
    };

    const showStrategyDetails = async (strategy: StrategyConfig) => {
        try {
            setSelectedStrategy(strategy);

            // Carregar estatísticas da estratégia
            const statsResponse = await apiClient.get(`/strategies/${strategy.id}/stats`);
            if (statsResponse.data.success) {
                setSelectedStrategyStats(statsResponse.data.stats);
            }

            setIsDetailsModalOpen(true);
        } catch (error) {
            console.error('Erro ao carregar detalhes da estratégia:', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(price);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('pt-BR');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎯 Estratégias de Trading</h2>
                <div className="flex gap-2">
                    <button
                        onClick={startService}
                        disabled={loading || isServiceRunning}
                        className={`px-4 py-2 rounded-lg font-semibold ${isServiceRunning
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isServiceRunning ? '🟢 Ativo' : '▶️ Ativar Estratégias'}
                    </button>
                    <button
                        onClick={stopService}
                        disabled={loading || !isServiceRunning}
                        className={`px-4 py-2 rounded-lg font-semibold ${!isServiceRunning
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        🛑 Parar
                    </button>
                </div>
            </div>

            {/* Status do Serviço */}
            {status && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2">📊 Status do Sistema</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{status.strategiesCount}</div>
                            <div className="text-sm text-gray-600">Estratégias</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{status.signalsCount}</div>
                            <div className="text-sm text-gray-600">Sinais Gerados</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${status.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                                {status.isRunning ? '🟢' : '🔴'}
                            </div>
                            <div className="text-sm text-gray-600">Status</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Criar Nova Estratégia */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">➕ Criar Nova Estratégia</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <input
                        type="text"
                        placeholder="Nome da Estratégia"
                        value={newStrategy.name}
                        onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    />
                    <select
                        value={newStrategy.symbol}
                        onChange={(e) => setNewStrategy({ ...newStrategy, symbol: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="BTCUSDT">BTCUSDT</option>
                        <option value="ETHUSDT">ETHUSDT</option>
                        <option value="ADAUSDT">ADAUSDT</option>
                        <option value="DOTUSDT">DOTUSDT</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Quantidade"
                        value={newStrategy.quantity}
                        onChange={(e) => setNewStrategy({ ...newStrategy, quantity: parseFloat(e.target.value) })}
                        className="px-3 py-2 border rounded-lg"
                        step="0.001"
                    />
                    <select
                        value={newStrategy.tradingType}
                        onChange={(e) => setNewStrategy({ ...newStrategy, tradingType: e.target.value as 'SPOT' | 'FUTURES' })}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="SPOT">Spot (1x)</option>
                        <option value="FUTURES">Futures (10x+)</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Alavancagem"
                        value={newStrategy.leverage}
                        onChange={(e) => setNewStrategy({ ...newStrategy, leverage: parseInt(e.target.value) })}
                        className="px-3 py-2 border rounded-lg"
                        min="1"
                        max="125"
                    />
                    <button
                        onClick={createStrategy}
                        disabled={loading || !newStrategy.name}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:bg-gray-400"
                    >
                        Criar
                    </button>
                </div>
            </div>

            {/* Lista de Estratégias */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">📋 Estratégias Configuradas</h3>
                <div className="space-y-3">
                    {strategies.map((strategy) => (
                        <div key={strategy.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold">{strategy.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        {strategy.symbol} • Qty: {strategy.quantity} •
                                        Buy: +{strategy.buyThreshold}% • Sell: -{strategy.sellThreshold}%
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${(strategy.leverage || 1) === 1
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {(strategy.leverage || 1)}x {(strategy.tradingType || 'SPOT')}
                                        </span>
                                        {strategy.riskLevel && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${strategy.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                                                    strategy.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {strategy.riskLevel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => showStrategyDetails(strategy)}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                                    >
                                        📊 Detalhes
                                    </button>
                                    <button
                                        onClick={() => toggleStrategy(strategy.id)}
                                        className={`px-4 py-2 rounded-lg font-semibold ${strategy.isActive
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-400 hover:bg-gray-500 text-white'
                                            }`}
                                    >
                                        {strategy.isActive ? '🟢 Ativa' : '🔴 Inativa'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {strategies.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhuma estratégia configurada
                        </div>
                    )}
                </div>
            </div>

            {/* Sinais de Trading */}
            <div>
                <h3 className="text-lg font-semibold mb-4">🎯 Sinais de Trading</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {signals.map((signal) => (
                        <div key={signal.id} className={`rounded-lg p-4 ${signal.side === 'BUY' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                            }`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-bold ${signal.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                                            {signal.side === 'BUY' ? '📈' : '📉'} {signal.side}
                                        </span>
                                        <span className="font-semibold">{signal.symbol}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Preço: {formatPrice(signal.price)} • Qty: {signal.quantity} •
                                        Confiança: {signal.confidence.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(signal.timestamp)} • {signal.strategy}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${signal.status === 'EXECUTED' ? 'bg-green-200 text-green-800' :
                                    signal.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                                        'bg-red-200 text-red-800'
                                    }`}>
                                    {signal.status}
                                </div>
                            </div>
                        </div>
                    ))}
                    {signals.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum sinal gerado ainda
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes */}
            <StrategyDetailsModal
                strategy={selectedStrategy}
                stats={selectedStrategyStats}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedStrategy(null);
                    setSelectedStrategyStats(null);
                }}
            />
        </div>
    );
};

export default TradingStrategyPanel;
