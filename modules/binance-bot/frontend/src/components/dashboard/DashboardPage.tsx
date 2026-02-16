import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { fetchActivePositions, fetchBalances, fetchPortfolioData } from '../../store/slices/binanceSlice';
import TradingStrategiesPanel from '../strategies/TradingStrategiesPanel';
import { ActivePositions } from './ActivePositions';
import { BinanceConnectionStatus } from './BinanceConnectionStatus';
import { LogsFeed } from './LogsFeed';
import { PortfolioOverview } from './PortfolioOverview';
import { SystemStatus } from './SystemStatus';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await dispatch(fetchPortfolioData());
        await dispatch(fetchBalances());
        await dispatch(fetchActivePositions());
      } catch {
        // Dashboard data loading failed - Redux handles error state
      }
    };

    loadDashboardData();
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard - Sistema AURA
        </h1>
        <p className="text-gray-600 mt-1">
          Bot de Trading Pessoal - Dados Reais Binance Testnet
        </p>
        <div className="mt-2 flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm text-yellow-700 font-medium">MODO TESTNET ATIVO</span>
        </div>
      </div>

      {/* Status de Conexão Binance */}
      <BinanceConnectionStatus />

      {/* System Status */}
      <SystemStatus />

      {/* Portfolio Overview */}
      <PortfolioOverview />


      {/* Active Positions and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivePositions />
        <LogsFeed />
      </div>

      {/* Trading Strategies Panel */}
      <TradingStrategiesPanel />
    </div>
  );
};