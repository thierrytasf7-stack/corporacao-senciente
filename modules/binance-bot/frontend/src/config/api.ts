/**
 * Configuracao centralizada da API do BinanceBot
 * Porta: 21341 (DIANA_BINANCE_BACKEND_PORT) - faixa Diana 21300-21399
 *
 * NUNCA hardcodar URLs em componentes. Sempre importar daqui.
 */

const BACKEND_PORT = import.meta.env.VITE_BINANCE_BACKEND_PORT || '21341';
const BACKEND_HOST = import.meta.env.VITE_BINANCE_BACKEND_HOST || '127.0.0.1';

export const API_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/api/v1`;
export const WS_BASE_URL = `ws://${BACKEND_HOST}:${BACKEND_PORT}`;

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  wsUrl: WS_BASE_URL,
  timeout: 30000,
  wsTimeout: 10000,
} as const;

/**
 * Constroi URL completa para endpoint da API
 */
export const buildApiUrl = (endpoint: string): string => {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${clean}`;
};

export default API_CONFIG;
