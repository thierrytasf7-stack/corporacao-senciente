# Arquitetura Multi-Instância - Múltiplas Corporações

## 🎯 Problema

Você quer criar clones da Corporação Autônoma para testar diferentes briefings sem afetar a original. A pergunta é: **como fazer isso de forma harmoniosa?**

## ❌ Abordagem Inicial (Duplicar Tudo)

### Problemas:
- ❌ **Duplicação de código** - Manutenção difícil
- ❌ **Atualizações não sincronizam** - Melhorias não compartilhadas
- ❌ **Múltiplas contas/envs** - Gerenciamento complexo
- ❌ **Custo duplicado** - Cada clone = novo Supabase/Atlassian
- ❌ **Dificulta evolução** - Código espalhado em múltiplas pastas

## ✅ Abordagem Recomendada: Workspaces/Instâncias

### Conceito:

```
coorporacao-autonoma/
├── core/                    # Código compartilhado
│   ├── scripts/
│   ├── backend/
│   └── docs/
│
├── instances/               # Instâncias isoladas
│   ├── default/            # Original
│   │   ├── .env
│   │   ├── supabase.config.json
│   │   └── atlassian.config.json
│   │
│   ├── clone-1/            # Clone 1 (novo briefing)
│   │   ├── .env
│   │   ├── supabase.config.json
│   │   └── atlassian.config.json
│   │
│   └── clone-2/            # Clone 2 (outro briefing)
│       ├── .env
│       ├── supabase.config.json
│       └── atlassian.config.json
│
└── scripts/
    └── create-instance.js   # Script para criar nova instância
```

### Estrutura de Dados:

Cada instância tem:
- ✅ **Supabase Project** próprio (ou schema separado)
- ✅ **Atlassian Workspace** próprio (ou space/project separado)
- ✅ **Env vars** próprias
- ✅ **Seeds/dados** próprios
- ✅ **Mesmo código** compartilhado

## 📋 Estratégia Recomendada

### Opção 1: Instâncias Completas (Recomendado para testes isolados)

**Estrutura:**
```
instances/
├── default/
│   └── .env (SUPABASE_PROJECT_REF=ffdszaiarxstxbafvedi)
└── clone-1/
    └── .env (SUPABASE_PROJECT_REF=novo_project_ref)
```

**Vantagens:**
- ✅ Isolamento total
- ✅ Pode deletar sem afetar outras
- ✅ Teste completo de novo briefing
- ✅ Custo controlado (pode pausar projetos)

**Quando usar:**
- Testes de novos briefings
- Ambientes de staging
- Demonstrações isoladas

### Opção 2: Schema Separation (Economia)

**Estrutura:**
```
Um único Supabase, múltiplos schemas:
- public (default)
- clone_1
- clone_2
```

**Vantagens:**
- ✅ Mais econômico
- ✅ Compartilha recursos
- ✅ Backup único

**Desvantagens:**
- ⚠️ Menos isolamento
- ⚠️ Mais complexo gerenciar schemas

### Opção 3: Híbrida (Recomendado)

**Estrutura:**
- **Código:** Compartilhado (core/)
- **Supabase:** Múltiplos projetos (isolados)
- **Atlassian:** Múltiplos spaces dentro do mesmo workspace

**Vantagens:**
- ✅ Balanceia isolamento e economia
- ✅ Atlassian: workspace compartilhado (sem custo extra)
- ✅ Supabase: projetos separados (isolamento de dados)

## 🛠️ Implementação Prática

### 1. Reorganizar Estrutura

```bash
# Manter código atual como "core"
mkdir -p core instances/default

# Mover código para core
mv scripts core/
mv backend core/
mv frontend core/
mv docs core/

# Criar instância default
cp -r core/* instances/default/
cd instances/default
# Criar .env específico
```

### 2. Sistema de Instâncias

```javascript
// scripts/create-instance.js
export async function createInstance(instanceName, config) {
  // 1. Criar pasta
  // 2. Copiar .env.template
  // 3. Criar novo Supabase project
  // 4. Criar novo Atlassian space/project
  // 5. Rodar seeds
  // 6. Configurar MCP
}
```

### 3. Script de Seleção de Instância

```javascript
// scripts/select-instance.js
// Define qual instância usar
const INSTANCE = process.env.INSTANCE_NAME || 'default';
const envPath = `instances/${INSTANCE}/.env`;
// Carrega env da instância
```

## 🎯 Para o Seu Caso Específico

### Recomendação: **Opção Híbrida**

1. **Código:** Manter único, mas organizado por instâncias
2. **Supabase:** Criar novo projeto para clone-1
3. **Atlassian:** Criar novo Space/Project no mesmo workspace
4. **Env:** Arquivo `.env` específico por instância

### Passos:

```bash
# 1. Criar estrutura
mkdir -p instances/clone-1

# 2. Copiar apenas configs (não código)
cp .env.example instances/clone-1/.env
cp mcp.json instances/clone-1/mcp.json

# 3. Criar novo Supabase project (via dashboard)
# 4. Criar novo Atlassian Space/Project
# 5. Atualizar .env do clone-1

# 6. Clonar dados
npm run clone-instance default clone-1
```

## 📝 Script de Clone de Instância

```javascript
// scripts/clone-instance.js
/**
 * Clona uma instância (dados, configs, etc.)
 */
async function cloneInstance(source, target) {
  // 1. Backup do Supabase source
  // 2. Restore no Supabase target
  // 3. Clonar issues do Jira
  // 4. Clonar páginas do Confluence
  // 5. Atualizar referências
}
```

## ⚠️ Cuidados

1. **Custo:**
   - Cada Supabase project = custo adicional
   - Atlassian: workspace único = sem custo extra

2. **Backup:**
   - Fazer backup antes de clonar
   - Documentar estado de cada instância

3. **Sincronização:**
   - Código compartilhado = atualizações automáticas
   - Dados = isolados (como deve ser)

4. **Cleanup:**
   - Ter script para deletar instância
   - Limpar recursos não usados

## 🚀 Quick Start

### Criar Nova Instância

```bash
# 1. Criar estrutura
npm run instance:create clone-1

# 2. Configurar
cd instances/clone-1
# Editar .env com novas credenciais

# 3. Inicializar
npm run instance:init clone-1

# 4. Clonar dados (opcional)
npm run instance:clone default clone-1
```

### Usar Instância

```bash
# Definir instância atual
export INSTANCE_NAME=clone-1

# Ou usar flag
npm run seed --instance=clone-1
```

## 📊 Comparação

| Abordagem | Isolamento | Custo | Manutenção | Recomendado |
|-----------|-----------|-------|------------|-------------|
| **Duplicar tudo** | ✅✅✅ | ❌❌❌ | ❌❌❌ | ❌ Não |
| **Instâncias completas** | ✅✅✅ | ⚠️⚠️ | ✅✅ | ✅✅ Sim (testes) |
| **Schema separation** | ⚠️⚠️ | ✅✅✅ | ⚠️⚠️ | ⚠️ Para economia |
| **Híbrida** | ✅✅ | ✅✅ | ✅✅✅ | ✅✅✅ **Melhor** |

## 🧠 Coordenador Central

O sistema inclui um **Coordenador Central** (orquestrador) que:

- Monitora todas as instâncias (empresas)
- Mantém memória vetorial global agregada
- Gerencia compartilhamento seletivo de componentes/microservices
- Detecta padrões cross-empresa
- Sugere compartilhamentos inteligentes

### Arquitetura do Coordenador

```
┌─────────────────────────────────────────────────────┐
│         COORDENADOR CENTRAL (Cérebro)               │
│  - Memória vetorial global                          │
│  - Catálogo de microservices                        │
│  - Permissões de compartilhamento                   │
│  - Rastreamento cross-empresa                       │
└───────────────┬─────────────────────────────────────┘
                │
    ┌───────────┼───────────┬───────────┐
    │           │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│Empresa│  │Empresa│  │Empresa│  │Empresa│
│   A   │  │   B   │  │   C   │  │   N   │
└───────┘  └───────┘  └───────┘  └───────┘
```

### Componentes do Coordenador

1. **Core** (`scripts/orchestrator/core.js`) - Coordenador principal
2. **Instance Manager** - Gerencia instâncias
3. **Component Catalog** - Catálogo de microservices
4. **Sharing Engine** - Motor de compartilhamento
5. **Global Memory** - Memória vetorial global
6. **Sync Engine** - Sincronização bidirecional

### Uso

```javascript
import { initializeCoordinator, startCoordinationLoop } from './scripts/orchestrator/core.js';

// Inicializar coordenador
await initializeCoordinator();

// Iniciar loop de coordenação (60s de intervalo)
await startCoordinationLoop(60000);
```

**Documentação completa:**
- [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md)
- [MICROSERVICES.md](MICROSERVICES.md)
- [COMPARTILHAMENTO_COMPONENTES.md](COMPARTILHAMENTO_COMPONENTES.md)
- [MEMORIA_GLOBAL.md](MEMORIA_GLOBAL.md)

## 🎯 Conclusão

**Não duplique código!** Use sistema de instâncias com coordenador central:

- ✅ Código compartilhado
- ✅ Dados isolados
- ✅ Coordenador central para compartilhamento inteligente
- ✅ Memória vetorial global
- ✅ Microservices reutilizáveis
- ✅ Fácil criar/remover instâncias
- ✅ Manutenção centralizada
- ✅ Testes isolados

---

**Próximo passo:** Ver [ORQUESTRADOR_CENTRAL.md](ORQUESTRADOR_CENTRAL.md) para iniciar o coordenador.

