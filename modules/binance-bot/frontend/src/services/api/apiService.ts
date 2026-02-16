import { config } from '../../../env.config';

/**
 * Serviço centralizado de API para todas as requisições
 * Garante que todas as URLs usem a configuração correta
 */
export class ApiService {
    private static baseUrl = config.API_URL;

    /**
     * Constrói URL completa para endpoints da API
     */
    static buildUrl(endpoint: string): string {
        // Remove barra inicial se existir
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${this.baseUrl}/${cleanEndpoint}`;
    }

    /**
     * Constrói URL para endpoints de análise (com /api/analysis)
     */
    static buildAnalysisUrl(endpoint: string): string {
        const baseUrl = this.baseUrl.replace('/api/v1', '/api/analysis');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        return `${baseUrl}/${cleanEndpoint}`;
    }

    /**
     * Faz requisição GET
     */
    static async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = this.buildUrl(endpoint);
        console.log(`🚀 API Request: GET ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Faz requisição POST
     */
    static async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        const url = this.buildUrl(endpoint);
        console.log(`🚀 API Request: POST ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Faz requisição PUT
     */
    static async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        const url = this.buildUrl(endpoint);
        console.log(`🚀 API Request: PUT ${url}`);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Faz requisição DELETE
     */
    static async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = this.buildUrl(endpoint);
        console.log(`🚀 API Request: DELETE ${url}`);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Faz requisição para endpoints de análise
     */
    static async getAnalysis<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
        const url = this.buildAnalysisUrl(endpoint);
        console.log(`🚀 Analysis Request: GET ${url}`);
        console.log(`🔍 [API DEBUG] Endpoint original: ${endpoint}`);
        console.log(`🔍 [API DEBUG] Base URL: ${this.baseUrl}`);
        console.log(`🔍 [API DEBUG] URL final: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        console.log(`📡 [API DEBUG] Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [API DEBUG] Error response:`, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`✅ [API DEBUG] Response data received:`, data);
        return data;
    }

    /**
     * Faz requisição POST para endpoints de análise
     */
    static async postAnalysis<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        const url = this.buildAnalysisUrl(endpoint);
        console.log(`🚀 Analysis Request: POST ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

export default ApiService;
