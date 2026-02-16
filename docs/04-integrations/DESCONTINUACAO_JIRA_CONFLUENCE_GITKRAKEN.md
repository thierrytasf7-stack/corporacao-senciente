# 🚨 Descontinuação: Jira, Confluence e GitKraken

**Data de Descontinuação:** 2025-01-XX  
**Substituído por:** Protocolo L.L.B. (LangMem, Letta, ByteRover)

## 📋 Resumo

As ferramentas externas **Jira**, **Confluence** e **GitKraken** foram descontinuadas e substituídas pelo **Protocolo L.L.B.**, uma arquitetura de memória em 3 camadas que elimina a necessidade de ferramentas externas de gestão.

## 🔄 Substituições

### Jira → Letta (A Consciência)
- **Função:** Gerenciador de estado e fluxo
- **O que faz:** Mantém rastro de "quem somos", "onde paramos" e "qual o próximo passo evolutivo"
- **Documentação:** `docs/02-architecture/LETTA.md`
- **Migração:** `docs/02-architecture/JIRA_LETTA_MIGRATION.md`

### Confluence → LangMem (O Arquivo de Sabedoria)
- **Função:** Memória de longo prazo
- **O que faz:** Armazena arquitetura, regras de negócio imutáveis, grafos de dependência
- **Documentação:** `docs/02-architecture/LANGMEM.md`
- **Migração:** `docs/02-architecture/CONFLUENCE_LANGMEM_MIGRATION.md`

### GitKraken → ByteRover (A Ação)
- **Função:** Interface nervosa com código
- **O que faz:** Injeta contexto em tempo real, gerencia mudanças atómicas, garante execução respeitando memória das outras camadas
- **Documentação:** `docs/02-architecture/BYTEROVER.md`
- **Migração:** `docs/02-architecture/GITKRAKEN_DISCONTINUATION.md`

## 📝 Git Nativo Mantido

**Git** continua sendo usado para:
- Commits inteligentes com metadados L.L.B.
- Documentação oficial (issues/docs como referência, não gestão de contexto)
- Histórico de código

**Git Hooks** configurados:
- `hooks/pre-commit`: Valida padrões L.L.B. e sincroniza com Letta/LangMem
- `hooks/post-commit`: Atualiza ByteRover e "Linha do Tempo Evolutiva"

## 🔧 Como Migrar

### Para Desenvolvedores

1. **Remover variáveis de ambiente:**
   ```bash
   # Remover ou comentar:
   # ATLASSIAN_SITE
   # ATLASSIAN_EMAIL
   # ATLASSIAN_API_TOKEN
   # ATLASSIAN_CLOUD_ID
   ```

2. **Adicionar variáveis do Protocolo L.L.B.:**
   ```bash
   BYTEROVER_CIPHER_URL=http://localhost:3000
   BYTEROVER_CIPHER_API_KEY=xxx
   ```

3. **Atualizar código:**
   - Substituir chamadas a Jira por `update_letta_state()`
   - Substituir chamadas a Confluence por `store_langmem_wisdom()`
   - Substituir chamadas a GitKraken por `byterover_inject_context()`

### Scripts de Migração

- `scripts/memory/migrate_jira_to_letta.js` - Migra issues do Jira para Letta
- `scripts/memory/migrate_confluence_to_langmem.js` - Migra páginas do Confluence para LangMem
- `scripts/memory/migrate_gitkraken.js` - Migra visualizações do GitKraken para ByteRover

## 📚 Documentação Relacionada

- **Protocolo L.L.B. Completo:** `.cursor/plans/reestruturação_completa_corporação_senciente_b4623469.plan copy.md` (Tasks 2.2.7 e 2.2.8)
- **Guia de Migração:** `docs/02-architecture/MIGRATION_GUIDE.md`
- **Validação:** `docs/02-architecture/MIGRATION_VALIDATION.md`

## ⚠️ Avisos de Descontinuação

Avisos foram adicionados em:
- **Jira:** Issue de descontinuação criada com link para documentação
- **Confluence:** Página de descontinuação criada com banner em todas páginas principais
- **GitKraken:** Documentação atualizada removendo referências

## ✅ Status da Migração

- [x] Protocolo L.L.B. implementado (LangMem, Letta, ByteRover)
- [x] Avisos de descontinuação adicionados em Jira/Confluence
- [x] Scripts de migração criados
- [ ] Dados migrados de Jira para Letta
- [ ] Dados migrados de Confluence para LangMem
- [ ] Código atualizado para remover dependências
- [ ] Variáveis de ambiente atualizadas
- [ ] Validação completa do sistema

---

**Última atualização:** 2025-01-XX  
**Responsável:** Sistema de Documentação



