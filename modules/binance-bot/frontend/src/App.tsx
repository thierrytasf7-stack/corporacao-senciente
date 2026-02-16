import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AnalysisTabsPanel from './components/analysis/AnalysisTabsPanel';
import { BacktestPage } from './components/backtest/BacktestPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import MarketsPanel from './components/markets/MarketsPanel';
import PositionsTabsPanel from './components/positions/PositionsTabsPanel';
import MathStrategiesPanel from './components/strategies/MathStrategiesPanel';
import StrategiesTabsPanel from './components/strategies/StrategiesTabsPanel';
import { PortfolioOverview } from './components/dashboard/PortfolioOverview';
import { testBinanceConnection, validateBinanceCredentials } from './store/slices/binanceSlice';
import { AppDispatch, RootState } from './store';
import { debounce } from './utils/debounce';
import BinanceRealService from './services/BinanceRealService';
import { ApiService } from './services/api/apiService';

// Portfolio page - uses PortfolioOverview + positions data
const PortfolioPage: React.FC = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const [positionsRes, portfolioRes] = await Promise.all([
        ApiService.get('binance/positions').catch(() => null),
        BinanceRealService.getPortfolio().catch(() => null),
      ]);
      if (positionsRes?.data) setPositions(positionsRes.data);
      if (portfolioRes) setPortfolioStats(portfolioRes);
    } catch (err) {
      console.error('Portfolio load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview (real data) */}
      <PortfolioOverview />

      {/* Positions with P&L */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Posições Ativas</h2>
            <button
              onClick={loadPortfolioData}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Atualizar
            </button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Carregando posições...</span>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>Nenhuma posição ativa no momento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ativo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Atual</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor (USD)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&L</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((pos, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{pos.asset}</div>
                        <div className="text-xs text-gray-500">{pos.symbol}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{parseFloat(pos.quantity).toFixed(6)}</td>
                      <td className="px-4 py-3 text-right text-sm">${parseFloat(pos.currentPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">${parseFloat(pos.currentValue).toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{parseFloat(pos.pnl).toFixed(2)} ({parseFloat(pos.pnlPercent).toFixed(1)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings page - connection status and trading config
const SettingsPage: React.FC = () => {
  const binanceState = useSelector((state: RootState) => state.binance);
  const [healthData, setHealthData] = useState<any>(null);
  const [mathStrategies, setMathStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [healthRes, mathRes] = await Promise.all([
        ApiService.get('../health').catch(() => null),
        ApiService.get('math-strategies').catch(() => null),
      ]);
      if (healthRes) setHealthData(healthRes);
      if (mathRes?.data) setMathStrategies(Array.isArray(mathRes.data) ? mathRes.data : [mathRes.data]);
    } catch (err) {
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status da Conexão</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${binanceState.connectionStatus?.isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${binanceState.connectionStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">Binance API</div>
                <div className="text-sm text-gray-600">{binanceState.connectionStatus?.isConnected ? 'Conectado' : 'Desconectado'}</div>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border-2 ${healthData ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${healthData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <div className="font-medium text-gray-900">Backend Server</div>
                <div className="text-sm text-gray-600">{healthData ? `Uptime: ${Math.floor(healthData.uptime / 60)}min` : 'Verificando...'}</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
              <div>
                <div className="font-medium text-gray-900">Modo</div>
                <div className="text-sm text-gray-600">Testnet (Simulação)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuração de Trading</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {mathStrategies.filter(s => s.isActive).map((strategy, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{strategy.name}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Ativo</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Aposta:</span>
                    <span className="ml-1 font-medium">${strategy.betAmount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span className="ml-1 font-medium">{strategy.tradingType || 'SPOT'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Take Profit:</span>
                    <span className="ml-1 font-medium">{strategy.takeProfit}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stop Loss:</span>
                    <span className="ml-1 font-medium">{strategy.stopLoss}%</span>
                  </div>
                </div>
              </div>
            ))}
            {mathStrategies.filter(s => s.isActive).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma estratégia ativa. Configure em Math Strategies.</p>
            )}
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-600">Backend Port</span>
            <span className="font-mono font-medium">21341</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-600">Frontend Port</span>
            <span className="font-mono font-medium">21340</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-600">API Base URL</span>
            <span className="font-mono font-medium text-xs">http://127.0.0.1:21341/api/v1</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span className="text-gray-600">Environment</span>
            <span className="font-mono font-medium">Testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(testBinanceConnection());
        await dispatch(validateBinanceCredentials());
      } catch {
        // Initialization errors handled by Redux slice
      }
    };

    const debouncedInit = debounce(initializeApp, 500);
    debouncedInit();
  }, [dispatch]);

  return (
    <ErrorBoundary>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          {/* ROTAS DE LOGIN BLOQUEADAS - REDIRECIONAR PARA DASHBOARD */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/dashboard" replace />} />

          {/* Main routes - sem autenticação */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="math-strategies" element={<MathStrategiesPanel />} />
            <Route path="trading-strategies" element={<StrategiesTabsPanel />} />
            <Route path="markets" element={<MarketsPanel />} />
            <Route path="analysis" element={<AnalysisTabsPanel />} />
            <Route path="positions" element={<PositionsTabsPanel />} />
            <Route path="backtest" element={<BacktestPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
    </ErrorBoundary>
  );
};

export default App;
