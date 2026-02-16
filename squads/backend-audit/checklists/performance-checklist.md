# Performance Checklist

## Queries & Data Access
- [ ] Zero N+1 queries (sem loops com queries dentro)
- [ ] Sem SELECT * (apenas colunas necessarias)
- [ ] Pagination em toda query que retorna listas
- [ ] Connection pooling configurado com min/max
- [ ] Queries com timeout configurado
- [ ] Indexes em colunas de WHERE/JOIN/ORDER BY

## Async & I/O
- [ ] Zero sync I/O em handlers HTTP (readFileSync, etc)
- [ ] Promise.all para operacoes paralelas independentes
- [ ] Sem CPU-bound blocking event loop
- [ ] Streams para payloads grandes
- [ ] Timeouts em toda chamada externa

## Caching
- [ ] Cache para dados frequentemente acessados
- [ ] Cache com TTL definido
- [ ] Cache invalidation strategy definida
- [ ] Sem over-caching de dados volateis

## Network
- [ ] Compression habilitada (gzip/brotli)
- [ ] HTTP keep-alive habilitado
- [ ] Payloads otimizados (sem campos extras)
- [ ] Connection reuse para chamadas externas

## Memory
- [ ] Zero memory leak patterns
- [ ] Event listeners com cleanup
- [ ] Caches com eviction policy
- [ ] Streams fechados apos uso
- [ ] Timers limpos (clearInterval/clearTimeout)
