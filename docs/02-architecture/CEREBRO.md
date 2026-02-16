# 🧠 Cérebro Central - Sistema de Gestão de Órgãos Autônomos

## Visão Geral

O **Cérebro Central** é o sistema que treina e gerencia agentes especializados que operam em **Órgãos** (empresas/briefings isolados).

## Arquitetura

```
CÉREBRO CENTRAL (Supabase/Atlassian atual)
├── Treina agentes especializados
├── Memória vetorial global
├── Coordenação entre empresas
└── Aprendizado agregado

        ↓ Gerencia ↓

ÓRGÃO 1, 2, 3... (Novos Supabase + Atlassian)
├── Dados completamente isolados
├── Operação independente
└── Gerenciado por agentes do cérebro
```

## Quick Start

### 1. Inicializar Cérebro

```bash
# Aplicar migrações SQL primeiro
npm run db:migrate

# Inicializar agentes especializados
node scripts/cerebro/inicializar_cerebro.js
```

### 2. Criar Novo Órgão

```bash
node scripts/triagem_autonoma_cerebro.js
```

Este script irá:
- Solicitar configuração de novo Supabase e Atlassian
- Criar estrutura isolada em `instances/briefings/briefing-xxx/`
- Registrar órgão no cérebro
- Atribuir agentes especializados
- Criar Epic e tasks no Jira
- Criar estrutura no Confluence

## Estrutura de Arquivos

```
scripts/cerebro/
├── inicializar_cerebro.js      # Script de inicialização
├── orgao_manager.js             # Gerenciamento de órgãos
├── agent_specializations.js     # Agentes especializados
└── env_loader.js                # Carregador de .env por órgão

instances/
├── cerebro/                     # Config do cérebro (futuro)
└── briefings/
    ├── briefing-1/
    │   ├── .env                 # Config isolada
    │   └── config.json          # Metadados
    └── briefing-2/
        └── ...
```

## Agentes Especializados

O cérebro possui **30+ agentes especializados**:

### Essenciais
- Copywriting, Marketing, Sales, Finance
- Development, Debug, Training, Validation

### Estruturais
- Architect, Product, DevEx, Metrics, Entity

### Expandidos
- Customer Success, Operations, Security
- Data, Legal, HR, Innovation

Ver: `docs/AGENTES_ESPECIALIZADOS_COMPLETO.md` para lista completa.

## Migrações SQL

As tabelas do cérebro estão em:
- `supabase/migrations/cerebro_central.sql`

Tabelas principais:
- `cerebro_orgaos` - Órgãos gerenciados
- `cerebro_agent_specializations` - Especializações de agentes
- `cerebro_agent_orgao_assignments` - Agentes atribuídos a órgãos
- `cerebro_specialized_knowledge` - Conhecimento especializado
- `cerebro_agent_training` - Dados de treinamento

## Uso

### Listar Órgãos Ativos

```javascript
import { listarOrgaosAtivos } from './scripts/cerebro/orgao_manager.js';
const orgaos = await listarOrgaosAtivos();
```

### Buscar Conhecimento Especializado

```javascript
import { buscarConhecimentoEspecializado } from './scripts/cerebro/agent_specializations.js';
const conhecimento = await buscarConhecimentoEspecializado('marketing', 'estratégia de crescimento');
```

### Carregar Config de Órgão

```javascript
import { carregarEnvOrgao } from './scripts/cerebro/env_loader.js';
carregarEnvOrgao('briefing-ecommerce-1');
// Agora process.env tem as variáveis do órgão
```

## Documentação Completa

- [ARQUITETURA_CEREBRO_ORGOS.md](docs/ARQUITETURA_CEREBRO_ORGOS.md) - Arquitetura detalhada
- [AGENTES_ESPECIALIZADOS_COMPLETO.md](docs/AGENTES_ESPECIALIZADOS_COMPLETO.md) - Lista de agentes
- [RESUMO_ARQUITETURA_CEREBRO.md](docs/RESUMO_ARQUITETURA_CEREBRO.md) - Resumo executivo

---

**Última atualização:** 2025-01-13

























