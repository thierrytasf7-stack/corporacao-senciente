import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import backtestReducer from './slices/backtestSlice';
import binanceReducer from './slices/binanceSlice';
import monitoringReducer from './slices/monitoringSlice';
import portfolioReducer from './slices/portfolioSlice';
import strategiesReducer from './slices/strategiesSlice';
import uiReducer from './slices/uiSlice';

// Persist configuration - sem autenticação para uso pessoal
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['ui', 'strategies', 'portfolio'], // Persistir apenas dados de UI e trading
  // Otimizar serialização para melhor performance
  serialize: true,
  deserialize: true,
  // Limpar estado antigo
  migrate: (state: any) => {
    // Remover qualquer estado de autenticação que possa existir
    if (state && state.auth) {
      delete state.auth;
    }
    return Promise.resolve(state);
  },
};

const rootReducer = combineReducers({
  ui: uiReducer,
  strategies: strategiesReducer,
  portfolio: portfolioReducer,
  backtest: backtestReducer,
  monitoring: monitoringReducer,
  binance: binanceReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Middleware otimizado para performance
const performanceMiddleware = (store: any) => (next: any) => (action: any) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();

  // Log apenas se a operação for muito lenta (mais de 100ms)
  if (endTime - startTime > 100) {
    console.warn(`Redux Action Performance: ${action.type} took ${(endTime - startTime).toFixed(2)}ms`);
  }

  return result;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH'
        ],
        // Ignorar campos específicos que podem conter valores não serializáveis
        ignoredPaths: [
          'binance.connectionStatus.lastTest',
          'binance.connectionStatus',
          'binance.activePositions',
          'portfolio.positions',
          'monitoring.alerts'
        ],
        // Aumentar threshold para reduzir warnings de performance
        warnAfter: 2048,
        // Ignorar tipos específicos que podem causar problemas
        ignoredActionPaths: [
          'payload.lastTest',
          'payload.timestamp',
          'payload.data',
          'meta.arg'
        ],
      },
      // Otimizar middleware de imutabilidade para melhor performance
      immutableCheck: {
        warnAfter: 2048,
        // Ignorar paths específicos que podem causar problemas
        ignoredPaths: [
          'binance.connectionStatus',
          'binance.activePositions',
          'portfolio.positions',
          'monitoring.alerts',
          'ui.notifications'
        ],
      },
    }).concat(performanceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
  // Otimizações adicionais para performance
  preloadedState: undefined,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;