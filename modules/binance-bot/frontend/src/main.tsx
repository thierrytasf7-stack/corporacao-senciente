import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.tsx'
import './index.css'
import { persistor, store } from './store'

// Importar e inicializar o console logger ANTES de qualquer componente
import { ensureConsoleFunctions } from './utils/consoleLogger'

// Garantir que as funções personalizadas do console estejam disponíveis globalmente
ensureConsoleFunctions();

// Configuração de performance para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Desabilitar warnings desnecessários
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Filtrar warnings específicos do Redux e React Router
    if (args[0] && typeof args[0] === 'string') {
      const message = args[0];
      if (message.includes('ImmutableStateInvariantMiddleware') ||
        message.includes('SerializableStateInvariantMiddleware') ||
        message.includes('React Router Future Flag Warning') ||
        message.includes('v7_startTransition') ||
        message.includes('v7_relativeSplatPath')) {
        return; // Silenciar warnings de performance do Redux e React Router
      }
    }
    originalWarn.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)