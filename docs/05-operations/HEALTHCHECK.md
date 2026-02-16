# Healthcheck e Manutenção (Ciclo 1)

- Comando: `npm run health`
  - Verifica acesso às tabelas e RPC `match_corporate_memory` com vetor dummy.
- Reindex IVFFlat: `npm run reindex` (ajuste comando psql conforme env).
- Recomendações:
  - Rodar health em CI rápido.
  - Ajustar `ivfflat.probes` via SQL antes de consultas pesadas.
  - `vacuum analyze` periódico (executar via console ou job).


































