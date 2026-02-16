# Migração de Variáveis de Ambiente - Protocolo L.L.B.

## Visão Geral

Este documento descreve as mudanças nas variáveis de ambiente após a migração para o Protocolo L.L.B., removendo dependências de Jira, Confluence e GitKraken.

## Variáveis Removidas

### Jira/Confluence (Atlassian)

As seguintes variáveis **não são mais necessárias** e podem ser removidas ou comentadas:

```bash
# ATLASSIAN - Integração com Jira, Confluence, etc.
# ⚠️ DESCONTINUADO: Substituído por Protocolo L.L.B. (Letta, LangMem)
# ATLASSIAN_SITE=https://coorporacaoautonoma.atlassian.net
# ATLASSIAN_CLOUD_ID=177fb6d9-9eeb-46df-abac-6fd61f449415
# ATLASSIAN_API_TOKEN=ATATT3x...
# ATLASSIAN_ORG_ID=c4bc88b6-c7ac-4aea-ac24-f868e3dd43ad
# ATLASSIAN_API_TOKEN_ADMIN=ATATT3x...
# ATLASSIAN_EMAIL=thierry.tasf7@gmail.com
# ATLASSIAN_CLIENT_SECRET=ATCTT3x...
```

**Substituição:**
- **Jira** → **Letta** (usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`)
- **Confluence** → **LangMem** (usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`)

### GitKraken

Nenhuma variável de ambiente específica do GitKraken foi encontrada. O GitKraken foi substituído por:
- **Git Nativo** (sem variáveis adicionais)
- **ByteRover** (usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`)

## Variáveis Necessárias para Protocolo L.L.B.

### Supabase (Já Existente)

O Protocolo L.L.B. usa as variáveis do Supabase já configuradas:

```bash
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<publishable_or_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### ByteRover (Opcional - Self-Hosted)

Se usar ByteRover Cipher self-hosted (futuro):

```bash
# ByteRover Cipher (Self-Hosted) - Opcional
# BYTEROVER_CIPHER_URL=http://localhost:8080
# BYTEROVER_CIPHER_API_KEY=your_api_key
```

**Nota:** Por enquanto, ByteRover usa Git nativo e não requer configuração adicional.

## Processo de Migração

### 1. Comentar Variáveis Antigas

No arquivo `env.local`:

1. Comentar todas as variáveis `ATLASSIAN_*`
2. Adicionar nota de descontinuação
3. Manter variáveis comentadas por referência (opcional)

### 2. Verificar Variáveis do Supabase

Garantir que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configuradas corretamente.

### 3. Atualizar `docs/env.example`

Remover ou comentar variáveis de Jira/Confluence/GitKraken no arquivo de exemplo.

## Checklist de Migração

- [x] Identificar variáveis de Jira/Confluence/GitKraken
- [ ] Comentar variáveis em `env.local`
- [ ] Atualizar `docs/env.example`
- [ ] Verificar que sistema funciona sem variáveis antigas
- [ ] Documentar mudanças

## Validação

Após remover variáveis:

1. **Testar Letta:**
   ```bash
   node -e "import('./scripts/memory/letta.js').then(m => m.getLetta().getCurrentState().then(s => console.log('Letta OK:', s.current_phase)))"
   ```

2. **Testar LangMem:**
   ```bash
   node -e "import('./scripts/memory/langmem.js').then(m => m.getLangMem().getWisdom('test').then(w => console.log('LangMem OK:', w.length)))"
   ```

3. **Testar ByteRover:**
   ```bash
   node -e "import('./scripts/memory/byterover.js').then(m => m.getByteRover().getEvolutionTimeline(5).then(t => console.log('ByteRover OK:', t.timeline?.length)))"
   ```

## Referências

- **Letta**: `docs/02-architecture/LETTA.md`
- **LangMem**: `docs/02-architecture/LANGMEM.md`
- **ByteRover**: `docs/02-architecture/BYTEROVER.md`
- **Protocolo L.L.B.**: `docs/02-architecture/LLB_PROTOCOL.md`

---

**Última Atualização**: 2025-01-XX
**Status**: Migração em progresso


