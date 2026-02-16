# Diana Corporacao Senciente - Contexto Unificado

**Ultima atualizacao:** 2026-02-12

---

## O Que e Diana

Diana e um Sistema Operacional Cognitivo que orquestra agentes de IA para desenvolvimento autonomo de software. Opera em arquitetura **100% nativa Windows** (sem Docker), usando PM2, PowerShell, Rust e React.

## Arquitetura Nativa

### Como Iniciar
```powershell
# Opcao 1: Atalho direto
Start-Diana-Native.bat

# Opcao 2: Painel de controle
.\scripts\Control-Panel.ps1

# Opcao 3: PM2 direto
pm2 start ecosystem.config.js
```

### Componentes em Execucao (PM2)

| Componente | Namespace | Funcao |
|------------|-----------|--------|
| guardian-hive | WORKERS | Orquestrador de Backlog (Rust) |
| agent-zero | WORKERS | Worker de Infra (PowerShell) |
| maestro | WORKERS | Watchdog e Sincronizador |
| binance-bot | SERVERS | Operacoes de Trading |
| dashboard-ui | SERVERS | Dashboard React (apps/dashboard) |

### Comandos de Manutencao
```powershell
pm2 status                    # Ver status de todos os processos
pm2 logs                      # Logs em tempo real
pm2 restart all               # Reiniciar tudo
pm2 stop all                  # Parar tudo
.\scripts\Get-SystemStatus.ps1  # Status detalhado
```

## Estrutura do Repositorio

```
Diana-Corporacao-Senciente/
├── apps/                     # Aplicacoes
│   ├── backend/              # API backend
│   ├── dashboard/            # Dashboard Next.js (observability)
│   ├── frontend/             # Frontend React principal
│   ├── games/                # Modulos de jogos
│   ├── microservices/        # Microservicos
│   ├── mission-control/      # Controle de missao
│   └── monitor-server/       # Event streaming (Bun)
├── workers/                  # Workers autonomos
│   ├── agent-zero/           # Worker de infraestrutura
│   └── aider/                # Worker de edicao de codigo
├── modules/                  # Modulos independentes
│   └── binance-bot/          # Bot de trading
├── scripts/                  # Scripts operacionais (PowerShell/Python)
├── .aios-core/               # Framework AIOS (core do sistema)
│   ├── core/                 # Modulos principais
│   ├── development/          # Agents, tasks, workflows
│   └── cli/                  # Comandos CLI
├── docs/                     # Documentacao
│   └── stories/              # Stories de desenvolvimento
├── src/                      # Source code
├── config/                   # Configuracoes
├── ecosystem.config.js       # Config PM2 (processos nativos)
├── Start-Diana-Native.bat    # Inicializador principal
└── package.json              # Dependencias Node.js
```

## Framework AIOS (Synkra)

### Principio: CLI First
```
CLI First → Observability Second → UI Third
```
- CLI e a fonte da verdade
- Dashboard apenas observa, nunca controla
- Features novas devem funcionar 100% via CLI primeiro

### Agentes Disponiveis
| Agente | Persona | Funcao |
|--------|---------|--------|
| @dev (Dex) | Implementador | Codigo e implementacao |
| @qa (Quinn) | Qualidade | Testes e validacao |
| @architect (Aria) | Arquiteta | Design tecnico |
| @pm (Morgan) | Product Manager | PRD e priorizacao |
| @po (Pax) | Product Owner | Stories e backlog |
| @sm (River) | Scrum Master | Sprint planning |
| @devops (Gage) | DevOps | CI/CD e git push (EXCLUSIVO) |
| @data-engineer (Dara) | Data | Database design |
| @analyst (Alex) | Analista | Pesquisa e analise |
| @aios-master (Orion) | Orquestrador | Coordenacao geral |

### Workflow de Desenvolvimento
```
@po cria story → @sm decompoe em tasks → @dev implementa → @qa testa → @devops faz push
```

## Decisoes Importantes

1. **Docker abandonado** - Toda infra e nativa Windows
2. **PM2 como gerenciador** - Substitui docker-compose
3. **Story-driven** - Todo trabalho comeca com story em docs/stories/
4. **Conventional commits** - feat/fix/docs/test/chore/refactor
5. **So @devops faz push** - Nenhum outro agente tem autoridade

## Tecnologias

| Camada | Stack |
|--------|-------|
| Runtime | Node.js 18+, Bun |
| Linguagem | TypeScript 5, Python |
| Frontend | React 18, Vite, TailwindCSS |
| Dashboard | Next.js |
| Backend | Supabase (PostgreSQL + pgvector) |
| Workers | PowerShell, Nushell, Rust |
| Processo | PM2 |
| Testes | Jest, Vitest |
| CLI | Commander.js |

---

*Documento mantido por @aios-master (Orion)*
