# WikiLocal - Fatos de Negócio

## Propósito

A WikiLocal documenta **Fatos de Negócio** - decisões, definições e verdades estabelecidas pelo Criador que guiam o desenvolvimento da Diana.

## Estrutura

```
wiki/
├── business-facts/      # Fatos de negócio categorizados
│   ├── architecture/    # Decisões arquiteturais
│   ├── business-rules/  # Regras de negócio
│   ├── domain/          # Definições de domínio
│   └── policies/        # Políticas operacionais
├── decisions/           # Registro de decisões (ADRs)
├── glossary/            # Glossário de termos
└── README.md            # Este arquivo
```

## Formato de Fato de Negócio

Cada fato é documentado em Markdown seguindo template:

```markdown
---
id: FACT-XXX
title: Nome do Fato
category: architecture|business-rule|domain|policy
status: ESTABLISHED|DEPRECATED
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: CREATOR
---

# [Título do Fato]

## Contexto
Por que este fato foi estabelecido?

## Definição
Definição clara e sem ambiguidade do fato.

## Implicações
Como este fato afeta decisões e implementações?

## Exemplos
Exemplos práticos de aplicação.

## Relacionamentos
- Relacionado a: [FACT-XXX]
- Fundamenta: [DECISION-XXX]
- Deriva de: [AXIOM-XX]

## Histórico
- 2026-02-14: Estabelecido pelo Criador
```

## Categorias

### Architecture
Decisões sobre estrutura técnica do sistema.

**Exemplos:**
- Abandono do Docker
- Uso de PM2 para gestão de processos
- Política de portas 21300-21399

### Business Rules
Regras que governam comportamento do negócio.

**Exemplos:**
- Hierarquia de decisão (Criador > IA)
- Token Economy (Pareto 80/20)
- Story-driven development obrigatório

### Domain
Definições de conceitos e entidades do domínio.

**Exemplos:**
- O que é um "Worker"?
- Definição de "Squad"
- Ciclo de vida de uma Story

### Policies
Políticas operacionais e de governança.

**Exemplos:**
- Política de commits (Conventional Commits)
- Política de testes (coverage mínimo)
- Política de push (@devops exclusivo)

## Versionamento

Fatos são versionados usando frontmatter:

```yaml
---
version: 1.2.0
changelog:
  - 1.2.0 (2026-02-14): Adicionado exemplo X
  - 1.1.0 (2026-02-10): Atualizada definição
  - 1.0.0 (2026-02-01): Versão inicial
---
```

## Rastreabilidade

Todo fato deve rastrear:

1. **Origem**: Quem estabeleceu (sempre CREATOR)
2. **Axioma Base**: Qual axioma fundamenta
3. **Decisões Derivadas**: Quais ADRs usam este fato
4. **Implementações**: Onde este fato se manifesta no código

## Uso

### Criar Novo Fato

```bash
# Template via CLI
npx diana-wiki create-fact --category architecture --title "Nova Decisão"
```

### Consultar Fato

```bash
# Buscar por ID
npx diana-wiki get FACT-001

# Buscar por categoria
npx diana-wiki list --category architecture

# Buscar por termo
npx diana-wiki search "docker"
```

### Atualizar Fato

Apenas CREATOR pode atualizar fatos. Updates incrementam versão e registram no changelog.

## Integração com Sistema

### Em Agents

Agents devem consultar WikiLocal antes de propor soluções:

```typescript
const fact = await wiki.getFact('FACT-002'); // Arquitetura Nativa Windows
// Validar proposta contra fact.definition
```

### Em Validadores

Validadores usam WikiLocal como referência:

```typescript
const architectureFacts = await wiki.listByCategory('architecture');
// Validar consistência com fatos estabelecidos
```

### Em Prompts de Sistema

Facts relevantes são injetados em prompts:

```
FATOS DE NEGÓCIO APLICÁVEIS:
- [FACT-001] Primazia do Criador
- [FACT-002] Arquitetura Nativa Windows
...
```

## Manutenção

- **Revisão Mensal**: Verificar fatos desatualizados
- **Deprecação**: Marcar fatos obsoletos como DEPRECATED
- **Consolidação**: Unificar fatos redundantes
- **Referências**: Manter links entre fatos atualizados

## Ferramentas

### CLI Tools
```bash
diana-wiki create-fact   # Criar novo fato
diana-wiki list          # Listar todos os fatos
diana-wiki search        # Buscar fatos
diana-wiki validate      # Validar consistência
diana-wiki export        # Exportar para vetores
```

### API
```typescript
import { WikiLocal } from '@/Axioms/Truth_Base/wiki';

const wiki = new WikiLocal();
await wiki.initialize();

const fact = await wiki.getFact('FACT-001');
const facts = await wiki.listByCategory('architecture');
const results = await wiki.search('docker');
```

## Princípios

1. **Single Source of Truth**: WikiLocal é referência única
2. **Imutabilidade Controlada**: Apenas CREATOR altera
3. **Rastreabilidade Total**: Todo fato rastreável à origem
4. **Simplicidade**: Formato Markdown, sem complexidade desnecessária
5. **Versionamento**: Histórico completo de mudanças

---

**Status**: OPERATIONAL
**Responsável**: CREATOR
**Última Atualização**: 2026-02-14
