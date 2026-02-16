# Autotuning (custos/latência) – Guia

Objetivo: ajustar lists/probes e reindex conforme crescimento dos vetores, mantendo latência e recall.

Parâmetros
- IVFFlat lists: use 100 para bases pequenas; 200–400 para médias; acima disso medir.
- ivfflat.probes: 10–20 para recall melhor; menor para mais velocidade.

Rotina sugerida
1) Medir latência de `match_*` (p50/p95) e recall nos casos do `docs/QA_SIMILARITY.md`.
2) Ajustar lists/probes via SQL e reindex: `psql -f scripts/reindex_ivfflat.sql`.
3) Registrar resultados (latência/recall) por configuração.
4) Automatizar semanalmente: script que mede latência de N consultas e escolhe combinação com melhor custo.

Custos
- Embeddings locais (Xenova) custo zero; Grok cobra por chamada. Use retries/timeout e evite boardroom desnecessária.
- Se usar LLM fallback, medir custo por rodada e limitar calls em CI (usar dry-run).

Testes contínuos
- Executar QA de similaridade (ver `docs/QA_SIMILARITY.md`) a cada mudança de lists/probes.
- Executar RLS/pgTAP em cada deploy.

Autotuning seguro (script)
- `npm run autotune` (não aplica; só recomenda). Testa combos (lists/probes) em queries sample e reporta latência/falhas.
- Ajuste manual após avaliar relatório; reindex conforme escolhido.




