// ATUALIZAÇÃO FORÇADA - NOVA ABA POSIÇÕES/HISTÓRICO
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AnalysisTabsPanel from './components/analysis/AnalysisTabsPanel';
import { BacktestPage } from './components/backtest/BacktestPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { Layout } from './components/layout/Layout';
import MarketsPanel from './components/markets/MarketsPanel';
import PositionsTabsPanel from './components/positions/PositionsTabsPanel';
import MathStrategiesPanel from './components/strategies/MathStrategiesPanel';
import StrategiesTabsPanel from './components/strategies/StrategiesTabsPanel';
import { testBinanceConnection, validateBinanceCredentials } from './store/slices/binanceSlice';
import { debounce } from './utils/debounce';

// Portfolio component
const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Portfolio Detalhado
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta página mostrará uma visão detalhada do seu portfolio, incluindo
            análise de ativos, distribuição de risco e métricas avançadas.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-2">ℹ️</div>
              <div className="text-sm text-blue-800">
                <strong>Funcionalidade em desenvolvimento</strong> - Esta página será implementada em breve.
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-gray-900 mb-1">Análise de Ativos</h4>
              <p className="text-sm text-gray-600">Visualize a distribuição dos seus ativos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <h4 className="font-medium text-gray-900 mb-1">Gestão de Risco</h4>
              <p className="text-sm text-gray-600">Monitore exposição e correlações</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-medium text-gray-900 mb-1">Performance</h4>
              <p className="text-sm text-gray-600">Analise retornos e métricas avançadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings component
const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Configurações do Sistema
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta página permitirá configurar parâmetros do sistema,
            notificações, preferências de trading e muito mais.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-2">ℹ️</div>
              <div className="text-sm text-blue-800">
                <strong>Funcionalidade em desenvolvimento</strong> - Esta página será implementada em breve.
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">🔐</div>
              <h4 className="font-medium text-gray-900 mb-1">Segurança</h4>
              <p className="text-sm text-gray-600">Configure autenticação e permissões</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <h4 className="font-medium text-gray-900 mb-1">Notificações</h4>
              <p className="text-sm text-gray-600">Gerencie alertas e notificações</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎛️</div>
              <h4 className="font-medium text-gray-900 mb-1">Preferências</h4>
              <p className="text-sm text-gray-600">Personalize interface e comportamento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Inicialização otimizada do sistema com debounce
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando Sistema AURA Binance...');

        // Testar conexão com a API de forma silenciosa
        await dispatch(testBinanceConnection() as any);
        console.log('✅ Conexão com API estabelecida');

        // Validar credenciais da Binance
        await dispatch(validateBinanceCredentials() as any);
        console.log('✅ Credenciais da Binance validadas');

        console.log('🎉 Sistema AURA Binance inicializado com sucesso!');
      } catch (error) {
        // Log silencioso de erros de inicialização
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Erro na inicialização:', error);
        }
      }
    };

    // Debounce para evitar múltiplas inicializações
    const debouncedInit = debounce(initializeApp, 500);
    debouncedInit();
  }, [dispatch]);

  return (
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
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;