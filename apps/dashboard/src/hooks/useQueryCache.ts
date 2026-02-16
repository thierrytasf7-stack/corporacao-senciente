// Módulo de cache em memória para otimizar queries da API
// Implementa cache com TTL (time-to-live) para reduzir latência

interface CacheEntry<T> {
  data: T;
  expiry: number; // Timestamp em milissegundos
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Obtém dados do cache se disponível e não expirado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar se o cache expirou
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Armazena dados no cache com TTL
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  /**
   * Limpa o cache (útil para invalidação)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entrada específica do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Obtém tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Instância singleton do cache
export const queryCache = new QueryCache();

/**
 * Hook personalizado para usar o cache de queries
 */
export function useQueryCache<T>(key: string, ttlMs: number, fetcher: () => T): T | null {
  // Tentar obter do cache primeiro
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Se não houver cache, buscar dados
  const data = fetcher();
  queryCache.set(key, data, ttlMs);
  return data;
}

/**
 * Função utilitária para cache com async/await
 */
export async function getCached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  queryCache.set(key, data, ttlMs);
  return data;
}

/**
 * Função utilitária para cache com callback
 */
export function getCachedSync<T>(key: string, ttlMs: number, fetcher: () => T): T {
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = fetcher();
  queryCache.set(key, data, ttlMs);
  return data;
}
