import React, { useState } from 'react';
import { BacktestConfiguration } from './BacktestConfiguration';
import { BacktestHistory } from './BacktestHistory';
import { BacktestResults } from './BacktestResults';
import { StrategyComparison } from './StrategyComparison';

type BacktestView = 'configure' | 'results' | 'history' | 'comparison';

export const BacktestPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<BacktestView>('configure');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = async (config: any) => {
    setIsRunning(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Por enquanto, não há resultados de backtest
      setCurrentView('results');
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleViewResults = (result: any) => {
    setCurrentView('results');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'results':
        return (
          <BacktestResults
            result={null}
            onBack={() => setCurrentView('configure')}
            onNewBacktest={() => setCurrentView('configure')}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Backtesting
            </h1>
            <p className="text-gray-600 mt-1">
              Teste suas estratégias com dados históricos
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-yellow-700 font-medium">EM DESENVOLVIMENTO</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setCurrentView('configure')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${currentView === 'configure'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Configurar
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${currentView === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Histórico
            </button>
            <button
              onClick={() => setCurrentView('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${currentView === 'comparison'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Comparação
            </button>
          </nav>
        </div>

        <div className="p-6">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};