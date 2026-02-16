// Configuração de ambiente para o frontend
export const config = {
  // Configuração da API - FORÇA 127.0.0.1 para desenvolvimento
  get API_URL() {
    // FORÇA 127.0.0.1 para desenvolvimento local - SOLUÇÃO DEFINITIVA
    const baseUrl = 'http://127.0.0.1:23231';
    console.log('🔧 Config API_URL:', `${baseUrl}/api/v1`);
    return `${baseUrl}/api/v1`;
  },

  // Configuração do ambiente
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',

  // Configuração do WebSocket - FORÇA 127.0.0.1 para desenvolvimento
  get WS_URL() {
    return 'ws://127.0.0.1:23231';
  },

  // Configuração da Binance Testnet
  BINANCE_TESTNET: import.meta.env.VITE_BINANCE_TESTNET || 'true',

  // Timeouts otimizados para Binance
  API_TIMEOUT: 30000, // 30 segundos para operações da Binance
  WS_TIMEOUT: 10000, // 10 segundos para WebSocket
};

// Configuração para desenvolvimento
if (config.NODE_ENV === 'development') {
  console.log('🔧 Configuração de desenvolvimento carregada');
  console.log('🌐 API URL:', config.API_URL);
  console.log('🔌 WebSocket URL:', config.WS_URL);
  console.log('🏠 Hostname detectado:', window.location.hostname);
  console.log('🔍 Lógica de ambiente: LOCAL FORÇADO');
  console.log('🚀 URL FINAL FORÇADA:', config.API_URL);
}
