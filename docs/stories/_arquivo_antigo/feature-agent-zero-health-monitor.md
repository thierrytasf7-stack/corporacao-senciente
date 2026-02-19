**Status:** EM_EXECUCAO
**Agente Sugerido:** @agente-zero
**Prioridade:** ALTA

# Health Monitor para Agent Zero v3

## Descricao
Implementar um endpoint de health check e metricas para o Agent Zero v3. Atualmente o worker roda em background sem visibilidade sobre seu estado (uptime, tasks processadas, erros, latencia media por modelo, rate limits atingidos). Criar um arquivo `health.json` atualizado a cada ciclo e um script CLI para consulta rapida.

## Acceptance Criteria
- [ ] Agent Zero gera `workers/agent-zero/data/health.json` com metricas atualizadas
- [ ] Metricas incluem: uptime, tasks_processed, tasks_failed, avg_latency_ms, last_error, active_model, api_keys_status
- [ ] Script `workers/agent-zero/health-check.js` imprime status formatado no terminal
- [ ] Health file atualizado a cada task processada (nao apenas em intervalo fixo)
- [ ] Testes unitarios para o modulo de coleta de metricas

## Tasks
- [ ] Criar modulo `lib/health-collector.js` que acumula metricas em memoria
- [ ] Integrar collector no loop principal do worker (delegate.js / daemon)
- [ ] Persistir metricas em `data/health.json` apos cada task
- [ ] Criar CLI `health-check.js` que le e formata o JSON
- [ ] Adicionar contagem de rate limits (429) por API key
- [ ] Escrever testes para health-collector
