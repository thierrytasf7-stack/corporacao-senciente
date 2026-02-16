import { AxiosError, AxiosResponse } from 'axios';
import { apiClient } from './client';

// Request interceptor simplificado para uso pessoal
apiClient.interceptors.request.use(
  (config) => {
    // Para uso pessoal, não há necessidade de token
    // Apenas adiciona headers básicos se necessário
    config.headers['Content-Type'] = 'application/json';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor simplificado
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Para uso pessoal, apenas log do erro
    console.error('API Error:', error.response?.data || error.message);

    return Promise.reject(error);
  }
);