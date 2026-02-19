**Status:** DONE
**Agente Sugerido:** @agente-zero
**Prioridade:** MEDIA

# Comando CLI `diana status` - Visao Consolidada do Sistema

## Descricao
Criar um comando CLI unico que mostra o estado completo do sistema Diana: processos PM2, portas ativas, stories pendentes, saude dos workers, uso de memoria e disco. Atualmente e necessario rodar multiplos comandos (pm2 status, netstat, ls docs/stories/) para ter visao geral. Um unico `node bin/diana-status.js` resolve isso.

## Acceptance Criteria
- [x] Script `bin/diana-status.js` executavel via `node bin/diana-status.js`
- [x] Mostra: processos PM2 (nome, status, uptime, memoria)
- [x] Mostra: portas da faixa 21300-21399 em uso (com servico associado)
- [x] Mostra: contagem de stories por status (TODO, IN_PROGRESS, DONE, REVISADO)
- [x] Mostra: espaco em disco usado pelo repo e submodulos
- [x] Output formatado com cores (chalk) e tabelas (cli-table3)
- [x] Exit code 0 se tudo saudavel, 1 se algum processo down

## Tasks
- [x] Criar estrutura basica do script com commander.js
- [x] Implementar coleta de status PM2 via `pm2 jlist`
- [x] Implementar scan de portas ativas na faixa Diana
- [x] Implementar parser de stories para contagem por status
- [x] Implementar check de disco (du equivalente)
- [x] Formatar output com chalk e cli-table3
- [x] Adicionar ao package.json como bin entry
