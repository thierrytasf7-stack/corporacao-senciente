# Descontinuação do Confluence

## Visão Geral

O Confluence foi **descontinuado** e substituído pelo **Protocolo L.L.B. (LangMem)** - o arquivo de sabedoria da Corporação Senciente 7.0.

## Data de Descontinuação

**2025-01-XX** - Confluence não é mais usado para documentação arquitetural e sabedoria.

## Substituição: LangMem

O **LangMem** substitui completamente o Confluence fornecendo:

- **Armazenar Sabedoria**: `storeWisdom()` - substitui criação de páginas
- **Buscar Sabedoria**: `getWisdom()` - substitui busca no Confluence
- **Verificar Dependências**: `checkDependencies()` - substitui grafos de dependência
- **Armazenar Padrões**: `storePattern()` - substitui documentação de padrões
- **Armazenar Arquitetura**: `storeArchitecture()` - substitui decisões arquiteturais

## Migração de Dados

### Páginas do Confluence → Sabedoria no LangMem

Todas as páginas importantes do Confluence devem ser migradas para o LangMem:

1. **Script de Migração**: `scripts/memory/migrate_confluence_to_langmem.js`
2. **Formato**: Páginas são convertidas para `corporate_memory` no Supabase
3. **Categorização**:
   - Espaço `Architecture` → categoria `architecture`
   - Espaço `Product` → categoria `business_rules`
   - Espaço `Patterns` → categoria `patterns`

### Como Migrar

```bash
# 1. Buscar páginas do Confluence (usar API REST)
# 2. Executar script de migração
node scripts/memory/migrate_confluence_to_langmem.js

# 3. Validar migração
# Verificar corporate_memory no Supabase
# Testar: langmem.getWisdom('query')
```

## Aviso de Descontinuação no Confluence

### Página de Descontinuação

**Título**: 🚨 DESCONTINUAÇÃO: Confluence substituído por Protocolo L.L.B. (LangMem)

**Conteúdo**:
```markdown
# 🚨 DESCONTINUAÇÃO: Confluence substituído por Protocolo L.L.B. (LangMem)

Este projeto migrou para o Protocolo L.L.B. (LangMem, Letta, ByteRover).

O Confluence foi substituído pelo LangMem - arquivo de sabedoria.

## 📚 Documentação

- **LangMem**: [docs/02-architecture/LANGMEM.md](../../02-architecture/LANGMEM.md)
- **Protocolo L.L.B.**: [docs/02-architecture/LLB_PROTOCOL.md](../../02-architecture/LLB_PROTOCOL.md)
- **Guia de Migração**: [docs/02-architecture/LLB_MIGRATION.md](../../02-architecture/LLB_MIGRATION.md)

## 🔄 Como Migrar Documentação

1. Páginas importantes foram migradas automaticamente para LangMem
2. Nova documentação deve ser armazenada via Protocolo L.L.B.
3. Buscar sabedoria: Use `LangMem.getWisdom(query)`

## 📅 Data de Descontinuação

**2025-01-XX** - Este Confluence não será mais atualizado.

⚠️ Use o Protocolo L.L.B. para armazenar e buscar sabedoria arquitetural.
```

### Banner de Descontinuação

Adicionar banner no topo de todas as páginas principais:

```html
<div style="background-color: #ff6b6b; color: white; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
  <strong>🚨 DESCONTINUAÇÃO:</strong> Esta página foi migrada para o Protocolo L.L.B. (LangMem).
  Esta página no Confluence não será mais atualizada.
  <a href="[link para LangMem docs]" style="color: white; text-decoration: underline;">Ver documentação</a>
</div>
```

## Script de Aviso (Manual)

Para adicionar avisos no Confluence, use o script:

```javascript
// scripts/memory/add_confluence_discontinuation_notice.js
// (Criar se necessário)

import { fetchConfluencePages, updateConfluencePage, createConfluencePage } from '../_archive/confluence_rest_api.js';

async function addDiscontinuationNotice() {
    // 1. Criar página de descontinuação
    const discontinuationPage = await createConfluencePage({
        space: 'PROJ',
        title: '🚨 DESCONTINUAÇÃO: Confluence substituído por Protocolo L.L.B. (LangMem)',
        content: '...', // Ver template acima
        parent: null
    });

    // 2. Buscar todas páginas principais
    const mainPages = await fetchConfluencePages({ space: 'PROJ', limit: 100 });

    // 3. Adicionar banner em cada página
    for (const page of mainPages) {
        const banner = `
<div style="background-color: #ff6b6b; color: white; padding: 10px; margin-bottom: 20px;">
  <strong>🚨 DESCONTINUAÇÃO:</strong> Esta página foi migrada para LangMem.
</div>
        `;
        
        await updateConfluencePage(page.id, {
            content: banner + page.body.storage.value
        });
    }
}
```

## Exportação de Conteúdo

Antes de descontinuar, exportar conteúdo importante:

1. **Exportar páginas principais** via API REST do Confluence
2. **Migrar para LangMem** usando script de migração
3. **Validar migração** verificando busca de sabedoria

## Referências

- **LangMem**: `docs/02-architecture/LANGMEM.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`
- **Guia de Migração**: `docs/02-architecture/LLB_MIGRATION.md`
- **Script de Migração**: `scripts/memory/migrate_confluence_to_langmem.js`

---

**Última Atualização**: 2025-01-XX
**Status**: Confluence descontinuado, migração para LangMem em progresso


