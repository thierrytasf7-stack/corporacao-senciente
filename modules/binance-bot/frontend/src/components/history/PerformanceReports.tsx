import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ReportPeriod {
  label: string;
  value: string;
  days: number;
}

interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  totalPnLPercent: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  totalFees: number;
  avgTradeDuration: number;
  bestTrade: number;
  worstTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export const PerformanceReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  const binanceState = useSelector((state: RootState) => state.binance);

  const periods: ReportPeriod[] = [
    { label: 'Últimos 7 dias', value: '7d', days: 7 },
    { label: 'Últimos 30 dias', value: '30d', days: 30 },
    { label: 'Últimos 90 dias', value: '90d', days: 90 },
    { label: 'Último ano', value: '1y', days: 365 },
    { label: 'Todo período', value: 'all', days: 0 },
  ];

  const strategies = [
    'Todas as Estratégias',
    'RSI Strategy',
    'MACD Strategy',
    'Bollinger Bands',
    'Custom Strategy',
  ];

  useEffect(() => {
    // Simular carregamento de relatórios de performance
    const loadPerformanceReports = async () => {
      setLoading(true);
      
      // Aguardar um pouco para simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por enquanto, não há dados de performance
      setMetrics(null);
      setLoading(false);
    };

    loadPerformanceReports();
  }, [selectedPeriod, selectedStrategy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Carregando relatórios de performance...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Relatórios de Performance
            </h2>
            <p className="text-gray-600 mt-1">
              Analise métricas detalhadas de suas operações
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estratégia
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {strategies.map((strategy) => (
                <option key={strategy} value={strategy}>
                  {strategy}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!metrics ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum Dado de Performance
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Você ainda não possui dados de performance para gerar relatórios. 
              Os relatórios aparecerão aqui quando você começar a operar e acumular dados.
            </p>
            
            {!binanceState.isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Conecte-se à Binance primeiro</strong> para gerar relatórios de performance.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-2">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>Conectado à Binance</strong> - Seus relatórios de performance aparecerão aqui quando você começar a operar.
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium text-gray-900 mb-1">Estratégias</h4>
                <p className="text-sm text-gray-600">Configure estratégias para começar a operar</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-medium text-gray-900 mb-1">Execução</h4>
                <p className="text-sm text-gray-600">Execute trades para acumular dados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-medium text-gray-900 mb-1">Análise</h4>
                <p className="text-sm text-gray-600">Analise performance e métricas</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Resumo da Performance
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getPerformanceIcon(metrics.totalPnL)}</span>
                <span className={`text-lg font-bold ${getPerformanceColor(metrics.totalPnL)}`}>
                  {formatCurrency(metrics.totalPnL)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.totalTrades}
                </div>
                <div className="text-sm text-gray-500">Total de Trades</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getPerformanceColor(metrics.totalPnLPercent)}`}>
                  {formatPercent(metrics.totalPnLPercent)}
                </div>
                <div className="text-sm text-gray-500">Retorno Total</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.profitFactor.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Profit Factor</div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estatísticas de Trading
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trades Vencedores:</span>
                  <span className="font-medium text-green-600">{metrics.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trades Perdedores:</span>
                  <span className="font-medium text-red-600">{metrics.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ganho Médio:</span>
                  <span className="font-medium text-green-600">{formatCurrency(metrics.avgWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perda Média:</span>
                  <span className="font-medium text-red-600">{formatCurrency(metrics.avgLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Melhor Trade:</span>
                  <span className="font-medium text-green-600">{formatCurrency(metrics.bestTrade)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pior Trade:</span>
                  <span className="font-medium text-red-600">{formatCurrency(metrics.worstTrade)}</span>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Métricas de Risco
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Drawdown:</span>
                  <span className="font-medium text-red-600">{formatPercent(metrics.maxDrawdownPercent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sharpe Ratio:</span>
                  <span className="font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sortino Ratio:</span>
                  <span className="font-medium">{metrics.sortinoRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calmar Ratio:</span>
                  <span className="font-medium">{metrics.calmarRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração Média:</span>
                  <span className="font-medium">{formatDuration(metrics.avgTradeDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxas Totais:</span>
                  <span className="font-medium">{formatCurrency(metrics.totalFees)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};