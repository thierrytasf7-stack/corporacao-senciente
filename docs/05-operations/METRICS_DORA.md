# Métricas (DORA) e Operacionais

## DORA
- Lead time: tempo do commit ao deploy (use timestamps de PR/CI se houver).
- Deployment frequency: contagem de merges/deploys por período.
- MTTR: tempo de incident detection → recovery.
- Change fail rate: % deploys que geram incidentes/rollbacks.

## Métricas de IA/Vetorial
- Latência embeddings, latência RPC `match_*`, tempo de boardroom, retries/falhas de LLM.
- Recall/precisão QA similarity (ver `docs/QA_SIMILARITY.md`).

## Coleta (sugestão)
- Git/MCP: pegar timestamps de commits/PRs para lead time/freq.
- CI: capturar tempos de pipeline (se disponível).
- Observabilidade: Prom/Loki para latências; contadores de falha.
- QA: rodar consultas e registrar se topMemory/topTask são coerentes.

## Relato do Agente de Métricas
- Periodicidade: diária ou por sprint.
- Formato: 4 métricas DORA + 3 métricas IA (latência embeddings, tempo boardroom, recall QA).
- Ações: 2–3 recomendações (reduzir MTTR, aumentar freq deploy, ajustar thresholds vetoriais).































