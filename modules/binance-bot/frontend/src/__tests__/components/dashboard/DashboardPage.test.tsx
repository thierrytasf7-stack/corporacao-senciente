import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DashboardPage } from '../../../components/dashboard/DashboardPage';
import uiSlice from '../../../store/slices/uiSlice';
import binanceSlice from '../../../store/slices/binanceSlice';
import portfolioSlice from '../../../store/slices/portfolioSlice';
import strategiesSlice from '../../../store/slices/strategiesSlice';
import monitoringSlice from '../../../store/slices/monitoringSlice';
import backtestSlice from '../../../store/slices/backtestSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice,
      binance: binanceSlice,
      portfolio: portfolioSlice,
      strategies: strategiesSlice,
      monitoring: monitoringSlice,
      backtest: backtestSlice,
    },
    preloadedState: {
      ui: {
        theme: 'light',
        sidebarOpen: true,
        notifications: [],
      },
      binance: {
        connectionStatus: {
          isConnected: false,
          lastTest: null,
          error: null,
        },
        balances: [],
        activePositions: [],
        isLoading: false,
        error: null,
      },
      portfolio: {
        positions: [],
        totalValue: 0,
        isLoading: false,
        error: null,
      },
      strategies: {
        strategies: [],
        isLoading: false,
        error: null,
      },
      monitoring: {
        alerts: [],
        systemStatus: 'healthy',
        isLoading: false,
        error: null,
      },
      backtest: {
        results: null,
        isLoading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('DashboardPage', () => {
  it('renders dashboard correctly', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Dashboard - Sistema AURA')).toBeInTheDocument();
  });

  it('displays system status section', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Status do Sistema')).toBeInTheDocument();
  });

  it('displays portfolio overview section', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Visão Geral do Portfolio')).toBeInTheDocument();
  });

  it('displays performance chart section', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Performance do Portfolio')).toBeInTheDocument();
  });

  it('displays quick metrics', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Métricas Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Retorno Mensal')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
  });

  it('displays active positions section', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Posições Ativas')).toBeInTheDocument();
  });

  it('displays logs feed section', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Logs do Sistema')).toBeInTheDocument();
  });
});