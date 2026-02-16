# Estrutura de Diretórios Proposta

Este documento descreve a estrutura de diretórios proposta para o repositório `Diana-Corporacao-Senciente`, visando melhorar a organização, clareza e facilitar o desenvolvimento e a manutenção, especialmente no contexto da "Jornada Senciente" e do framework AIOS.

---

## Princípios de Organização

*   **Separação de Responsabilidades:** Agrupar arquivos e diretórios por sua função principal (código-fonte, configuração, documentação, scripts, ferramentas, dados, deploy).
*   **Consistência:** Manter padrões de nomenclatura e organização consistentes em todo o repositório.
*   **Escalabilidade:** Estrutura que suporte o crescimento do projeto e a adição de novos módulos, aplicações ou agentes.
*   **Clareza para Agentes e Humanos:** Facilidade de navegação e compreensão tanto para desenvolvedores quanto para agentes autônomos.

---

## Estrutura Proposta

```
Diana-Corporacao-Senciente/
├── .aios/                    # Configuração central e arquivos internos do AIOS (existente)
├── .git/                     # Repositório Git (existente)
├── .github/                  # Workflows e configurações do GitHub (existente)
├── .vscode/                  # Configurações do VS Code (existente)
├── apps/                     # Aplicações principais do projeto
│   ├── frontend/             # Aplicação React/Vite (existente)
│   ├── backend/              # Aplicação backend (existente)
│   ├── microservices/        # Microserviços (existente)
│   └── ...                   # Outras aplicações principais
├── config/                   # Arquivos de configuração global (existente 'config/', 'mcp-configs/')
├── docs/                     # Documentação abrangente do projeto
│   ├── stories/              # Stories do AIOS (existente)
│   ├── guides/               # Guias de usuário, deployment, etc.
│   ├── architecture/         # Documentação de arquitetura
│   ├── reports/              # Relatórios, anotações de progresso, outputs temporários
│   ├── inventories/          # Inventários de ativos (existing 'agentes_inventory.json', 'integracoes_inventory.json', 'docs_inventory.csv', etc.)
│   ├── estrutura-diretorios.md # Este documento
│   └── ...                   # Outros documentos gerais
├── scripts/                  # Todos os scripts utilitários (shell, python, powershell)
├── packages/                 # Pacotes de monorepo (existente, se aplicável)
├── libs/                     # Bibliotecas/módulos comuns (para código compartilhado entre apps/packages)
├── tests/                    # Testes globais (existente 'tests/', se não estiverem dentro das 'apps/')
├── tools/                    # Ferramentas diversas, proxies, scripts de agentes
│   ├── agents/               # Definições e scripts de agentes (AIDER-AIOS/, dev-aider/, squads/, .aios-core/development/agents/, etc.)
│   ├── monitoring/           # Ferramentas de monitoramento ('monitor-tools/')
│   ├── cloud/                # Ferramentas e scripts de interação com a nuvem ('oracle-vps/', 'google-cloud-brain/')
│   ├── game-interface/       # Interface do jogo (se aplicável)
│   └── ...                   # Outras ferramentas e utilitários
├── data/                     # Arquivos de dados, seeds, logs
│   ├── logs/                 # Logs de execução ('logs/', 'backend_job_log.txt', etc.)
│   ├── seeds/                # Dados de seed (existente 'seeds/')
│   ├── memory_store/         # Armazenamento de memória (existente 'memory_store/')
│   └── ...                   # Outros dados
├── deployments/              # Arquivos relacionados a deploy (Docker, configurações de nuvem)
│   ├── docker/               # Arquivos Docker e docker-compose ('docker-compose*.yml')
│   ├── cloud/                # Configurações específicas de provedores de nuvem ('cloudflared.exe', 'cf.exe', scripts de GCP/Vercel)
│   └── ...                   # Outros arquivos de deploy
├── temp/                     # Arquivos temporários, outputs de build, caches
│   ├── build/                # Artefatos de build (existente 'build/')
│   ├── cache/                # Arquivos de cache (ex: '.eslintcache', '.tsbuildinfo')
│   ├── analysis_results/     # Resultados de análises (existente)
│   ├── reports/              # Relatórios temporários (existente 'reports/', screenshots/)
│   └── ...                   # Outros arquivos temporários
└── supabase/                 # Configurações e migrações do Supabase (existente)

```

---

## Próximos Passos (Implementação da Estrutura)

A implementação desta estrutura será realizada de forma iterativa, movendo diretórios e arquivos existentes para seus novos locais.

1.  **Criação dos Novos Diretórios de Nível Superior:** Criar `apps/`, `libs/`, `tools/`, `data/`, `deployments/`, `temp/`.
2.  **Movimentação de Diretórios Existentes:**
    *   `frontend/` para `apps/frontend/`
    *   `backend/` para `apps/backend/`
    *   `microservices/` para `apps/microservices/`
    *   `agent-listener/`, `AIDER-AIOS/`, `dev-aider/`, `monitor-tools/`, `squad-creator/`, `squads/`, `oracle-vps/`, `google-cloud-brain/`, `game-interface/` para `tools/agents/`, `tools/monitoring/`, `tools/cloud/`, `tools/game-interface/` respectivamente.
    *   `logs/`, `seeds/`, `memory_store/` para `data/logs/`, `data/seeds/`, `data/memory_store/`.
    *   `build/` para `temp/build/`.
    *   `analysis_results/`, `screenshots/`, `reports/` para `temp/analysis_results/`, `temp/screenshots/`, `temp/reports/`.
    *   Arquivos `docker-compose*.yml` para `deployments/docker/`.
    *   Arquivos e scripts relacionados a cloud/deploy (ex: `cloudflared.exe`, `cf.exe`, scripts de GCP/Vercel) para `deployments/cloud/`.
3.  **Consolidação de Arquivos na Raiz:** Mover arquivos soltos na raiz que são relatórios, notas ou inventários (ex: `_AI_CONTEXT.md`, `agentes_inventory.json`, `MEMORIA_PROGRESSO.md`, `PLANO_MASTER_CORPORACAO_SENCIENTE_BLUEPRINT.md`, `jobs_*.json`, `RESUMO_*.md`, etc.) para `docs/reports/` ou `docs/inventories/`.
4.  **Atualização de Referências:** Ajustar caminhos em scripts, configurações e código-fonte que foram afetados pela movimentação.

Esta é uma tarefa complexa e será executada de forma iterativa e cuidadosa para evitar quebras.
