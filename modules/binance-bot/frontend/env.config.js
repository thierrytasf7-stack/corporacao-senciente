// Configuracao de ambiente para o frontend
// Porta: 21341 (DIANA_BINANCE_BACKEND_PORT) - faixa Diana 21300-21399
export const config = {
  get API_URL() {
    const port = import.meta.env.VITE_BINANCE_BACKEND_PORT || '21341';
    return `http://127.0.0.1:${port}/api/v1`;
  },

  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',

  get WS_URL() {
    const port = import.meta.env.VITE_BINANCE_BACKEND_PORT || '21341';
    return `ws://127.0.0.1:${port}`;
  },

  BINANCE_TESTNET: import.meta.env.VITE_BINANCE_TESTNET || 'true',
  API_TIMEOUT: 30000,
  WS_TIMEOUT: 10000,
};
