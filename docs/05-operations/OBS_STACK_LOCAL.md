# Observabilidade local (Loki/Prom/Grafana) – Guia rápido

Objetivo: habilitar métricas/logs locais para depuração do PSCC.

Componentes sugeridos (compose futuro):
- Loki: agregação de logs JSON (scripts já logam em JSON).
- Prometheus: métricas simples (expor via exporter leve ou pushgateway).
- Grafana: dashboards para latência de embeddings, RPC match_*, boardroom.
- (Opcional) Tempo/Jaeger: traces se adicionarmos tracing nos scripts.

Métricas mínimas
- Latência de embedding (ms) e throughput.
- Latência/sucesso RPC match_* (Supabase).
- Tempo total da mesa (board meeting) e taxa de retry/falha Grok.
- Taxa de seeds e duração total.

Como rodar (compose observability)
- `docker-compose -f docker-compose.observability.yml up -d`
- Acessos: Grafana http://localhost:3000 (user/pass admin/admin), Prom http://localhost:9090, Loki http://localhost:3100.
- Prometheus já scrapeia a si mesmo. Para métricas dos scripts, exporte via endpoint ou arquivo de métricas e adicione scrape_config.
- Para logs JSON dos scripts, configure promtail para apontar para a pasta de logs (ajuste em `promtail` volumes/config).

Checklist de verificação
- Grafana sobe e autentica (admin/admin).
- Prometheus responde em /targets (localhost:9090/targets) sem erros.
- Loki acessível (http://localhost:3100/ready).
- Logs estruturados (se configurado promtail) aparecem em Loki.

Métricas recomendadas
- Latência de embedding (p50/p95), tempo total boardroom, taxa de retry/falha Grok/Gemini.
- Latência/sucesso das RPC `match_*`.
- Taxa de seeds e ingest (commit logs, diffs/PRs).

Notas
- Ajustar `ivfflat.probes` e `lists` por env; registrar valores usados.
- Em produção, preferir stack gerenciada ou exporters dedicados; compose aqui é para dev.



