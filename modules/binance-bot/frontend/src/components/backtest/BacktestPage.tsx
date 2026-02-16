import React, { useState } from 'react';
import { BacktestConfiguration } from './BacktestConfiguration';
import { BacktestHistory } from './BacktestHistory';
import { BacktestResults } from './BacktestResults';
import { StrategyComparison } from './StrategyComparison';
import { ApiService } from '../../services/api/apiService';

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  period: string;
  totalReturnPercent: number;
  initialCapital: number;
  finalCapital: number;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winningTrades: number;
  losingTrades: number;
  averagePnL: number;
  largestWin: number;
  trades: any[];
  equityCurve: any[];
}

type BacktestView = 'configure' | 'results' | 'history' | 'comparison';

export const BacktestPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<BacktestView>('configure');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBacktest = async (config: any) => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await ApiService.post('backtest/run', {
        strategyType: config.strategyType,
        strategyParams: config.strategyParams,
        startDate: config.startDate,
        endDate: config.endDate,
        initialBalance: config.initialBalance,
      });

      if (response?.success && response.data) {
        const { summary, trades, equityCurve } = response.data;

        // Map backend response to frontend BacktestResult shape
        const wins = trades.filter((t: any) => (t.pnl || 0) > 0);
        const largestWin = wins.length > 0 ? Math.max(...wins.map((t: any) => t.pnl || 0)) : 0;

        const mappedResult: BacktestResult = {
          strategyName: config.strategyType,
          symbol: config.strategyParams?.symbol || config.symbol,
          period: `${config.startDate} - ${config.endDate}`,
          totalReturnPercent: summary.totalReturn || 0,
          initialCapital: summary.initialBalance,
          finalCapital: summary.finalBalance,
          totalPnL: summary.totalPnl,
          totalTrades: summary.totalTrades,
          winRate: summary.winRate,
          profitFactor: summary.profitFactor,
          maxDrawdown: summary.maxDrawdownPercent,
          sharpeRatio: summary.sharpeRatio,
          winningTrades: summary.winningTrades,
          losingTrades: summary.losingTrades,
          averagePnL: summary.totalTrades > 0 ? summary.totalPnl / summary.totalTrades : 0,
          largestWin,
          trades,
          equityCurve,
        };

        setResult(mappedResult);
        setCurrentView('results');
      } else {
        setError(response?.error || 'Backtest falhou sem detalhes.');
      }
    } catch (err: any) {
      console.error('Backtest failed:', err);
      setError(err?.message || 'Erro ao executar backtest. Verifique se o backend está rodando.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewResults = (_result: any) => {
    setCurrentView('results');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'results':
        return (
          <BacktestResults
            result={result}
            onBack={() => setCurrentView('configure')}
            onNewBacktest={() => { setResult(null); setCurrentView('configure'); }}
          />
        );
      case 'history':
        return (
          <BacktestHistory
            onViewResult={handleViewResults}
            onNewBacktest={() => setCurrentView('configure')}
          />
        );
      case 'comparison':
        return (
          <StrategyComparison
            onBack={() => setCurrentView('configure')}
          />
        );
      default:
        return (
          <BacktestConfiguration
            onRunBacktest={handleRunBacktest}
            isRunning={isRunning}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backtesting</h1>
            <p className="text-gray-600 mt-1">Teste suas estratégias com dados históricos reais</p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-green-700 font-medium">OPERACIONAL</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-sm text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">✕</button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'configure', label: 'Configurar' },
              { id: 'results', label: 'Resultados' },
              { id: 'history', label: 'Histórico' },
              { id: 'comparison', label: 'Comparação' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as BacktestView)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};
