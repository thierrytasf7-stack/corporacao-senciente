import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../../../env.config';
import { API_TIMEOUT, verifyTimeout } from '../../config/timeout-fix';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: verifyTimeout(API_TIMEOUT), // 30 segundos para operações da Binance
  headers: {
    'Content-Type': 'application/json',
  },
  // Configurações adicionais para melhor conectividade
  maxRedirects: 5,
  validateStatus: (status) => status < 500, // Aceitar status < 500
});

// Request interceptor - sem autenticação
apiClient.interceptors.request.use(
  (config) => {
    // Forçar timeout correto
    config.timeout = verifyTimeout(config.timeout || API_TIMEOUT);
    // Log da requisição para debug
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url} (timeout: ${config.timeout}ms)`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - tratamento simplificado de erros
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      // Don't show notifications for certain status codes
      const silentErrors = [401, 403, 404];

      if (!silentErrors.includes(status)) {
        let message = 'An error occurred';

        if (data?.message) {
          message = data.message;
        } else if (data?.error) {
          message = data.error;
        } else {
          switch (status) {
            case 400:
              message = 'Bad request';
              break;
            case 404:
              message = 'Resource not found';
              break;
            case 500:
              message = 'Internal server error';
              break;
            case 503:
              message = 'Service unavailable';
              break;
            default:
              message = `HTTP Error ${status}`;
          }
        }

        // Log error apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.warn(`API Error ${status}: ${message}`);
        }
      }

      // Log 404 errors apenas em desenvolvimento
      if (status === 404 && process.env.NODE_ENV === 'development') {
        console.warn(`API 404 Error: ${error.config?.url} - ${message}`);
      }
    } else if (error.request) {
      // Network error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Network Error: Unable to connect to the server');
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

// Helper function to create request config with custom timeout
export const createRequestConfig = (timeout?: number): AxiosRequestConfig => ({
  timeout: verifyTimeout(timeout || API_TIMEOUT),
});

// Helper function to retry failed requests
export const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain status codes
      if (error.response?.status && [400, 401, 403, 404, 422].includes(error.response.status)) {
        throw error;
      }

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        console.warn(`Retrying request (attempt ${attempt + 1}/${maxRetries})`);
      }
    }
  }

  throw lastError;
};

export default apiClient;