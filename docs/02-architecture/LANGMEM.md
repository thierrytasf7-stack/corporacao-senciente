# LangMem - O Arquivo de Sabedoria

## Visão Geral

LangMem é a memória de longo prazo do sistema que substitui Confluence. Armazena arquitetura, regras de negócio imutáveis e grafos de dependência.

## Funcionalidades

### 1. Armazenamento de Sabedoria

LangMem armazena conhecimento arquitetural de longo prazo:

- **Arquitetura**: Decisões arquiteturais, padrões de design
- **Regras de Negócio**: Regras imutáveis do negócio
- **Padrões Técnicos**: Padrões descobertos durante desenvolvimento
- **Grafos de Dependência**: Relacionamentos entre módulos

### 2. Busca de Sabedoria

Busca sabedoria usando embeddings vetoriais:

- Busca semântica por similaridade
- Filtro por categoria
- Cache para latência zero

### 3. Verificação de Dependências

Verifica grafos de dependência antes de criar módulos:

- Detecta dependências obrigatórias
- Identifica conflitos
- Emite avisos sobre padrões obsoletos

## Uso

### Exemplo Básico

```javascript
import { getLangMem } from './memory/langmem.js';

const langmem = getLangMem();

// Armazenar sabedoria
await langmem.storeWisdom(
    'Sempre usar async/await para operações assíncronas',
    'architecture'
);

// Buscar sabedoria
const wisdom = await langmem.getWisdom('async operations', 'architecture');

// Verificar dependências
const validation = await langmem.checkDependencies('new_module');
if (!validation.canCreate) {
    console.log('Conflitos:', validation.dependencies.conflicts);
}
```

## Métodos

### `storeWisdom(content, category, graph_dependencies)`

Armazena sabedoria arquitetural.

**Parâmetros:**
- `content` (string): Conteúdo da sabedoria
- `category` (string): Categoria (architecture, business_rules, patterns)
- `graph_dependencies` (object): Grafos de dependência (opcional)

**Retorna:** `Promise<boolean>` - Sucesso

### `getWisdom(query, category)`

Busca sabedoria com contexto.

**Parâmetros:**
- `query` (string): Query de busca
- `category` (string): Categoria específica (opcional)

**Retorna:** `Promise<array>` - Sabedoria encontrada

### `checkDependencies(module)`

Verifica grafos de dependência antes de criar módulo.

**Parâmetros:**
- `module` (string): Nome do módulo

**Retorna:** `Promise<object>` - Validação de dependências

**Estrutura de Retorno:**
```javascript
{
  module: "module_name",
  dependencies: {
    required: ["dep1", "dep2"],
    optional: ["dep3"],
    conflicts: ["conflict1"],
    warnings: ["warning1"]
  },
  canCreate: true,
  hasWarnings: false,
  message: "Sem conflitos detectados"
}
```

### `storePattern(pattern, context)`

Armazena padrão técnico descoberto.

**Parâmetros:**
- `pattern` (string): Padrão descoberto
- `context` (object): Contexto do padrão

**Retorna:** `Promise<boolean>` - Sucesso

### `storeArchitecture(decision, rationale, dependencies)`

Armazena decisão arquitetural.

**Parâmetros:**
- `decision` (string): Decisão tomada
- `rationale` (string): Justificativa
- `dependencies` (object): Dependências relacionadas

**Retorna:** `Promise<boolean>` - Sucesso

## Integração com Supabase

LangMem usa a tabela `corporate_memory` do Supabase:

- **content**: Conteúdo da sabedoria
- **category**: Categoria (architecture, business_rules, patterns)
- **embedding**: Embedding vetorial para busca
- **graph_dependencies**: Grafos de dependência (JSONB)

## Cache

LangMem mantém cache em memória:

- Timeout: 30 minutos (sabedoria muda pouco)
- Tamanho máximo: 100 entradas
- Limpeza automática de entradas antigas

## Substituição do Confluence

LangMem substitui Confluence fornecendo:

- **Documentação Arquitetural**: Via `storeArchitecture()`
- **Padrões Técnicos**: Via `storePattern()`
- **Grafos de Dependência**: Via `checkDependencies()`
- **Busca Semântica**: Via embeddings vetoriais

---

**Última Atualização**: 2025-01-XX
**Status**: Implementado, integrado com Supabase



