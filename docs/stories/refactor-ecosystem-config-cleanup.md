**Status:** REVISADO
**Agente Sugerido:** @aider
**Prioridade:** MEDIA

# Refactor ecosystem.config.js e Unificar Startup Scripts

## Descricao
O `ecosystem.config.js` do PM2 e os scripts de startup (Start-Diana-Native.bat, Control-Panel.ps1, scripts avulsos) estao dessincronizados. Alguns processos listados no ecosystem nao existem mais, outros rodam fora do PM2. Unificar tudo em um unico ecosystem.config.js atualizado e garantir que `pm2 start ecosystem.config.js` levante todos os servicos necessarios.

## Acceptance Criteria
- [x] ecosystem.config.js reflete apenas processos que existem e funcionam
- [x] Cada processo tem health check (script ou URL) documentado
- [x] Variáveis de ambiente centralizadas (usa .env.ports para portas)
- [x] Start-Diana-Native.bat usa apenas `pm2 start ecosystem.config.js`
- [x] Processos mortos sao removidos, novos sao adicionados
- [x] README ou comentario no ecosystem explica cada processo

## Tasks
- [x] Inventariar processos atuais no ecosystem vs processos reais rodando
- [x] Remover entradas de processos inexistentes/obsoletos
- [x] Adicionar processos que rodam fora do PM2 (whatsapp, binance, etc)
- [x] Padronizar env vars usando .env.ports como fonte
- [x] Atualizar Start-Diana-Native.bat para single-command startup
- [ ] Testar `pm2 start` e `pm2 restart all` do zero

## Notas de Implementacao
- **monitor-server** adicionado ao ecosystem (Bun, porta 21302) - estava faltando
- **guardian-hive** agora recebe env vars das 3 portas Hive (21310-21312)
- **dashboard-ui** agora recebe PORT=21300 alem de DIANA_DASHBOARD_PORT
- Constante ROOT extraida para evitar paths hardcoded repetidos
- Cada processo tem comentario com descricao e URL/health check
- Start-Diana-Native.bat simplificado: `pm2 kill` + `pm2 start ecosystem.config.js`
- Limpeza de triggers/locks unificada com wildcards
- Removido fallback `concurrently` (todos os processos agora no PM2)
