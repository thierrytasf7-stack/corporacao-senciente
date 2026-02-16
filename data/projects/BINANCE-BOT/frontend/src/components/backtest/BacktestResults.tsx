import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { BacktestResult } from './BacktestPage';
import { TradesList } from './TradesList';
import { EquityCurveChart } from './EquityCurveChart';
import { MetricsBreakdown } from './MetricsBreakdown';

interface BacktestResultsProps {
  result: BacktestResult | null;
  onBack: () => void;
  onNewBacktest: () => void;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({
  result,
  onBack,
  onNewBacktest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'metrics' | 'chart'>('overview');
  const [loading, setLoading] = useState(false);
  
  const binanceState = useSelector((state: RootState) => state.binance);

  useEffect(() => {
    // Simular carregamento de resultados de backtest
    if (result) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  }, [result]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Processando resultados do backtest...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Resultados do Backtest
              </h2>
              <p className="text-gray-600 mt-1">
                Analise a performance de suas estratégias
              </p>
            </div>
            <button
              onClick={onNewBacktest}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Executar Backtest
            </button>
          </div>
          
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum Backtest Executado
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Você ainda não executou nenhum backtest. 
              Execute um backtest para analisar a performance de suas estratégias com dados históricos.
            </p>
            
            {!binanceState.isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Conecte-se à Binance primeiro</strong> para executar backtests com dados reais.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-2">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Conectado à Binance</strong> - Você pode executar backtests com dados históricos reais.
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium text-gray-900 mb-1">Estratégia</h4>
                <p className="text-sm text-gray-600">Selecione uma estratégia para testar</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <h4 className="font-medium text-gray-900 mb-1">Período</h4>
                <p className="text-sm text-gray-600">Defina o período histórico</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-gray-900 mb-1">Resultados</h4>
                <p className="text-sm text-gray-600">Analise performance e métricas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? '📈' : '📉';
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
              <h2 className="text-xl font-semibold text-gray-900">
                Resultados do Backtest
              </h2>
              <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                <span>{result.strategyName}</span>
                <span>•</span>
                <span>{result.symbol}</span>
                <span>•</span>
                <span>{result.period}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onNewBacktest}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Novo Backtest
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumo da Performance
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getPerformanceIcon(result.totalReturnPercent)}</span>
            <span className={`text-lg font-bold ${getPerformanceColor(result.totalReturnPercent)}`}>
              {formatPercent(result.totalReturnPercent)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(result.initialCapital)}
            </div>
            <div className="text-sm text-gray-500">Capital Inicial</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(result.finalCapital)}
            </div>
            <div className="text-sm text-gray-500">Capital Final</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getPerformanceColor(result.totalPnL)}`}>
              {formatCurrency(result.totalPnL)}
            </div>
            <div className="text-sm text-gray-500">P&L Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {result.totalTrades}
            </div>
            <div className="text-sm text-gray-500">Total de Trades</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'trades', label: 'Trades', icon: '📋' },
              { id: 'metrics', label: 'Métricas', icon: '📈' },
              { id: 'chart', label: 'Gráfico', icon: '📉' },
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Métricas Principais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win Rate:</span>
                      <span className="font-medium">{result.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit Factor:</span>
                      <span className="font-medium">{result.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Drawdown:</span>
                      <span className="font-medium text-red-600">{formatPercent(result.maxDrawdown)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio:</span>
                      <span className="font-medium">{result.sharpeRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Estatísticas de Trades</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trades Vencedores:</span>
                      <span className="font-medium text-green-600">{result.winningTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trades Perdedores:</span>
                      <span className="font-medium text-red-600">{result.losingTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">P&L Médio:</span>
                      <span className="font-medium">{formatCurrency(result.averagePnL)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maior Trade:</span>
                      <span className="font-medium">{formatCurrency(result.largestWin)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <TradesList trades={result.trades} />
          )}

          {activeTab === 'metrics' && (
            <MetricsBreakdown result={result} />
          )}

          {activeTab === 'chart' && (
            <EquityCurveChart equityCurve={result.equityCurve} />
          )}
        </div>
      </div>
    </div>
  );
};