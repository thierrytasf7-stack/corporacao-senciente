import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface StrategyData {
  id: string;
  name: string;
  description: string;
  symbol: string;
  timeframe: string;
  status: 'active' | 'paused' | 'inactive';
  parameters: {
    rsiPeriod?: number;
    oversoldLevel?: number;
    overboughtLevel?: number;
    stopLoss: number;
    takeProfit: number;
    maxPositionSize: number;
  };
  performance: {
    totalTrades: number;
    winRate: number;
    pnl: number;
    pnlPercent: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

interface StrategyEditorProps {
  strategyId?: string;
  onBack: () => void;
}

export const StrategyEditor: React.FC<StrategyEditorProps> = ({ strategyId, onBack }) => {
  const [strategy, setStrategy] = useState<StrategyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters' | 'performance' | 'logs'>('overview');
  const [loading, setLoading] = useState(true);
  
  const binanceState = useSelector((state: RootState) => state.binance);

  useEffect(() => {
    // Simular carregamento de estratégia
    const loadStrategy = async () => {
      setLoading(true);
      
      // Aguardar um pouco para simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, não há estratégias para editar
      setStrategy(null);
      setLoading(false);
    };

    loadStrategy();
  }, [strategyId]);

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving strategy:', strategy);
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    if (strategy) {
      const newStatus = strategy.status === 'active' ? 'paused' : 'active';
      setStrategy({ ...strategy, status: newStatus });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <div className="mt-4 text-gray-600">Carregando estratégia...</div>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editor de Estratégias
              </h2>
              <p className="text-gray-600 mt-1">
                Edite e configure suas estratégias de trading
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Voltar
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma Estratégia Encontrada
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Não foi possível encontrar a estratégia solicitada ou você ainda não criou nenhuma estratégia.
            </p>
            
            {!binanceState.isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Conecte-se à Binance primeiro</strong> para criar e editar estratégias.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-2">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Conectado à Binance</strong> - Crie sua primeira estratégia para começar a editar.
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900 mb-1">Indicadores</h4>
                <p className="text-sm text-gray-600">Configure RSI, MACD, Bollinger Bands</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="font-medium text-gray-900 mb-1">Parâmetros</h4>
                <p className="text-sm text-gray-600">Ajuste stop loss e take profit</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-gray-900 mb-1">Performance</h4>
                <p className="text-sm text-gray-600">Monitore resultados e métricas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {strategy.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(strategy.status)}`}>
                  {strategy.status === 'active' ? 'Ativa' : 
                   strategy.status === 'paused' ? 'Pausada' : 'Inativa'}
                </span>
                <span className="text-sm text-gray-500">
                  {strategy.symbol} • {strategy.timeframe}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                strategy.status === 'active'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {strategy.status === 'active' ? 'Pausar' : 'Ativar'}
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Salvar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'parameters', label: 'Parâmetros', icon: '⚙️' },
              { id: 'performance', label: 'Performance', icon: '📈' },
              { id: 'logs', label: 'Logs', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600">{strategy.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Símbolo:</span>
                      <span className="font-medium">{strategy.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeframe:</span>
                      <span className="font-medium">{strategy.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{strategy.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Trades:</span>
                      <span className="font-medium">{strategy.performance.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win Rate:</span>
                      <span className="font-medium">{strategy.performance.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P&L:</span>
                      <span className="font-medium">{formatCurrency(strategy.performance.pnl)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parameters' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Parâmetros da Estratégia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Gestão de Risco</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stop Loss:</span>
                      <span className="font-medium">{strategy.parameters.stopLoss}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Take Profit:</span>
                      <span className="font-medium">{strategy.parameters.takeProfit}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tamanho Máximo:</span>
                      <span className="font-medium">{formatCurrency(strategy.parameters.maxPositionSize)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Indicadores</h4>
                  <div className="space-y-2 text-sm">
                    {strategy.parameters.rsiPeriod && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">RSI Período:</span>
                          <span className="font-medium">{strategy.parameters.rsiPeriod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Oversold:</span>
                          <span className="font-medium">{strategy.parameters.oversoldLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overbought:</span>
                          <span className="font-medium">{strategy.parameters.overboughtLevel}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Métricas de Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{strategy.performance.totalTrades}</div>
                  <div className="text-sm text-gray-500">Total de Trades</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{strategy.performance.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Win Rate</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${strategy.performance.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(strategy.performance.pnl)}
                  </div>
                  <div className="text-sm text-gray-500">P&L Total</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Logs da Estratégia</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <div>Nenhum log disponível para esta estratégia</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};