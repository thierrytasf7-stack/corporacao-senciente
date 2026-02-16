# Observabilidade mínima (scripts locais)

- Embeddings (Xenova): scripts logam tempo de embedding (ms) em JSON.
- Seeds: logs JSON de quantos itens inseridos e tempo total.
- Boardroom: tempo total; retries e timeouts configuráveis via env; log JSON.
- Recomendações:
  - Exportar métricas simples para arquivo/log central (futuro Loki/Grafana).
  - Em Supabase, monitorar latência das RPC `match_*`.
  - Ajustar `lists/probes` conforme volume (ex.: lists 200, probes 10–20) e manter `analyze`.

