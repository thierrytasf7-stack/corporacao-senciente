# Meta-Orchestrator Squad

> 🧠 Universal Task Delegation & Dynamic Squad Creation

## Overview

O **Meta-Orchestrator Squad** é um squad híbrido que combina orquestração inteligente de tarefas com criação dinâmica de novos squads. Ele recebe qualquer tarefa, analisa, e decide se delega para squads existentes ou cria novos squads especializados automaticamente.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    META-ORCHESTRATOR SQUAD                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐                    │
│   │  NEXUS  │───▶│ SCANNER │───▶│  FORGE  │                    │
│   │Coordinator   │ Analyzer │    │ Creator │                    │
│   └────┬────┘    └─────────┘    └────┬────┘                    │
│        │                              │                          │
│        │         ┌─────────┐         │                          │
│        └────────▶│SENTINEL │◀────────┘                          │
│                  │ Monitor │                                     │
│                  └────┬────┘                                     │
│                       │                                          │
│                  ┌────▼────┐                                     │
│                  │ CORTEX  │                                     │
│                  │ Memory  │                                     │
│                  └─────────┘                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Agentes

| Agente | Ícone | Função |
|--------|-------|--------|
| **Nexus** | 🧠 | Coordenador - Recebe tarefas, analisa, roteia |
| **Scanner** | 🔍 | Analisador - Mapeia capacidades dos squads |
| **Forge** | 🔥 | Criador - Cria novos squads dinamicamente |
| **Sentinel** | 👁️ | Monitor - Monitora execução e qualidade |
| **Cortex** | 🧬 | Memória - Aprende padrões e otimiza |

## Workflow Principal

```
Tarefa do Usuário
        │
        ▼
   ┌─────────┐
   │  NEXUS  │ Recebe e interpreta
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ SCANNER │ Analisa squads disponíveis
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │  NEXUS  │ Decide: delegar ou criar?
   └────┬────┘
        │
   ┌────┴────┐
   ▼         ▼
DELEGAR   CRIAR
   │         │
   │    ┌────▼────┐
   │    │  FORGE  │ Cria novo squad
   │    └────┬────┘
   │         │
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │SENTINEL │ Monitora execução
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ CORTEX  │ Aprende com resultado
   └─────────┘
```

## Instalação

O squad já vem integrado no AIOS. Para usar:

```bash
# Ativar o coordenador principal
@nexus

# Ou ativar agentes específicos
@scanner
@forge
@sentinel
@cortex
```

## Comandos Principais

### @nexus (Coordenador)
```bash
*orchestrate {tarefa}    # Roteia qualquer tarefa
*analyze {tarefa}        # Analisa sem executar
*delegate {tarefa} to {squad}  # Delegação explícita
*list-squads             # Lista squads disponíveis
*spawn-squad {domínio}   # Cria novo squad
```

### @scanner (Analisador)
```bash
*scan-all                # Indexa todos os squads
*analyze-capabilities    # Analisa capacidades
*match {tarefa}          # Encontra melhor match
*gaps                    # Mostra lacunas
```

### @forge (Criador)
```bash
*create-squad {domínio}  # Cria squad completo
*quick-squad {domínio}   # Criação rápida
*clone-mind {expert}     # Agente baseado em expert
```

### @sentinel (Monitor)
```bash
*monitor {id}            # Monitora execução
*status                  # Status de todas execuções
*alerts                  # Alertas ativos
*quality-check {output}  # Verifica qualidade
```

### @cortex (Memória)
```bash
*learn {outcome}         # Aprende com resultado
*recall {query}          # Busca na memória
*patterns                # Padrões descobertos
*predict {tarefa}        # Prediz melhor rota
```

## Exemplo de Uso

### Cenário 1: Squad Existente
```
Usuário: @nexus preciso implementar uma API REST

Nexus: Analisando tarefa...
       Domínio: Desenvolvimento
       Complexidade: Média

Scanner: Squad match: dev-squad (92%)

Nexus: Delegando para @dev...
       Tarefa enviada. Sentinel monitorando.
```

### Cenário 2: Criar Novo Squad
```
Usuário: @nexus preciso revisar contratos de trabalho

Nexus: Analisando tarefa...
       Domínio: Legal/Jurídico

Scanner: Nenhum squad adequado (melhor: 28%)

Nexus: Domínio não coberto. Acionando Forge...

Forge: Criando legal-squad...
       - Pesquisando especialistas em direito trabalhista
       - Criando agentes: contract-analyst, compliance-checker
       - Squad registrado!

Nexus: legal-squad criado. Delegando tarefa...
       Sentinel monitorando.

Cortex: Padrão aprendido: contratos → legal-squad
```

## Estrutura do Squad

```
squads/meta-orchestrator/
├── config.yaml              # Configuração do squad
├── README.md                # Esta documentação
├── agents/
│   ├── nexus.md            # Coordenador
│   ├── scanner.md          # Analisador
│   ├── forge.md            # Criador
│   ├── sentinel.md         # Monitor
│   └── cortex.md           # Memória
├── tasks/
│   ├── orchestrate-task.md # Tarefa de orquestração
│   └── spawn-squad-task.md # Tarefa de criação
├── workflows/
│   └── universal-orchestration.yaml
├── checklists/
│   └── delegation-checklist.md
└── data/
    └── routing-patterns.md
```

## Integração

O Meta-Orchestrator integra com:
- **Todos os squads existentes** - Para delegação
- **squad-creator** - Para criar novos squads
- **Memory Layer** - Para aprendizado persistente
- **AIOS Core** - Para orquestração global

## Filosofia

> "Não importa o que você precisa fazer - eu encontro ou crio quem pode fazer."

O Meta-Orchestrator segue os princípios:
1. **Aceitar tudo** - Nenhuma tarefa é rejeitada
2. **Analisar profundamente** - Entender antes de rotear
3. **Delegar inteligentemente** - Encontrar o melhor executor
4. **Criar quando necessário** - Expandir o sistema sob demanda
5. **Aprender sempre** - Cada execução melhora o sistema

---

_Squad Version: 1.0.0_
_Part of AIOS Meta-Orchestrator System_
