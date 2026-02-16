# Auditoria de Secrets Expostos - Relatório Crítico

**Data:** 2026-02-14
**Severidade:** 🔴 CRÍTICA

## Resumo Executivo

Foram encontrados **2 arquivos com secrets reais commitados no repositório**:

1. `config/arete.env` - Chaves Grok, Gemini, Serper, Tavily + Supabase
2. `config/production.env` - **Supabase Service Role Key + Gemini API Key**

Estes arquivos estão **tracked no git** e expostos ao histórico público.

---

## Achados Críticos

### 1. ⛔ `config/production.env` (TRACKED)

**Status:** EXPOSED PUBLICAMENTE
**Chaves encontradas:**

```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_hUc_sPELqVmL01DGi31iwQ__KLamr-v
GEMINI_API_KEY=AIzaSyBBF-SgqSmXr364MzrldnHXvMJ_vgaU0gA
```

**Riscos:**
- Supabase Service Role: Acesso TOTAL ao banco de dados (leitura + escrita + delete)
- Gemini API: Pode consumir quota da API + custos financeiros
- Público se o repo for público

**Ação Imediata:**
```bash
# Rotacionar todas as chaves (URGENTE)
1. Ir para https://app.supabase.com → Project Settings → API Keys → Regenerate Service Role Key
2. Ir para https://console.cloud.google.com/apis/credentials → Delete Gemini key + Create new
```

### 2. ⛔ `config/arete.env` (TRACKED)

**Status:** EXPOSED PUBLICAMENTE
**Chaves encontradas:**

```
GROK_API_KEY=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
GEMINI_API_KEY=AIzaSyBBF-SgqSmXr364MzrldnHXvMJ_vgaU0gA
SERPER_API_KEY=3ac63aad1bae44a89f553be1a384a00f29b59393
TAVILY_API_KEY=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
```

**Ação Imediata:**
```bash
# Rotacionar TODAS as chaves
1. Grok API: https://console.groq.com/keys → Delete + Generate new
2. Gemini API: Delete via Google Cloud Console (compartilhada com production.env)
3. Serper API: https://serper.dev/manage/keys → Regenerate
4. Tavily API: https://tavily.com/app/dashboard → Regenerate
```

### 3. ⚠️ `apps/backend/.env` (NÃO TRACKED)

**Status:** Local only (seguro)
**Secrets encontrados:**

```
DB_PASSWORD=21057788
SUPABASE_ANON_KEY=eyJhbGc... (anon, lower risk)
```

**Avaliação:** ✅ Seguro (arquivo está no .gitignore)

### 4. ⚠️ `modules/binance-bot/backend/.env` (NÃO TRACKED)

**Status:** Local only (seguro)
**Secrets encontrados:**

```
BINANCE_API_KEY=fNvgZQzCexYFQfGALy03zGXzsDQ3lEoDYLgtRDwdml1HGdmmH51uLKWfAzV4RGyF
BINANCE_SECRET_KEY=80nEJoimIghboxbDbPFuIWHPh5rRaGETWsi7ugYtnPHPa4puFgWG7CP2RSvynFsO
```

**Avaliação:** ✅ Seguro (TESTNET keys, arquivo está no .gitignore)

---

## Estrutura .gitignore

### ✅ Padrões Adequados

O `.gitignore` cobre corretamente:

```
# Environment
.env
.env.local
.env.*.local
.env.production
.env.development
.env.test

# Secrets
secrets/
credentials/
keys/
*.secret
*.credentials

# WhatsApp
**/integrations/whatsapp/auth_info/

# Build artifacts
node_modules/
dist/
```

### ⚠️ GAP ENCONTRADO

**Os arquivos `config/arete.env` e `config/production.env` NÃO estão no .gitignore!**

**Solução:** Adicionar padrão:
```gitignore
# Config files with secrets
config/*.env
config/*.env.*
```

---

## Arquivos .env.example Necessários

### ✅ JÁ EXISTEM

- `apps/backend/.env.example` - ✅ CRIADO/ATUALIZADO
- `modules/binance-bot/backend/.env.example` - ✅ ATUALIZADO

### 📝 FALTANDO

- `config/arete.env.example` - CRIAR
- `config/production.env.example` - CRIAR
- `workers/agent-zero/.env.example` - CRIAR (se aplicável)

---

## Plano de Ação Imediato

### 🔴 FASE 1: Rotação de Chaves (URGENTE - Próximas 2 horas)

```bash
# 1. Supabase Service Role (production.env)
# Go to: https://app.supabase.com → [Project] → Settings → API Keys
# Click "Regenerate" next to Service Role Key

# 2. Gemini API (ambos arete.env e production.env)
# Go to: https://console.cloud.google.com/apis/credentials
# Delete: AIzaSyBBF-SgqSmXr364MzrldnHXvMJ_vgaU0gA
# Create new key and update local .env files

# 3. Grok API (arete.env)
# Go to: https://console.groq.com/keys
# Delete: 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
# Generate new

# 4. Serper API (arete.env)
# Go to: https://serper.dev/manage/keys
# Regenerate: 3ac63aad1bae44a89f553be1a384a00f29b59393

# 5. Tavily API (arete.env)
# Go to: https://tavily.com/app/dashboard
# Regenerate: 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
```

### 🟡 FASE 2: Corrigir .gitignore (30 minutos)

```bash
# Adicionar ao .gitignore
echo "config/*.env" >> .gitignore
echo "config/*.env.*" >> .gitignore

# Verificar se config/arete.env e config/production.env vão ser removidos
git rm --cached config/arete.env config/production.env
git status
```

### 🟢 FASE 3: Criar .env.example Templates

- `config/arete.env.example`
- `config/production.env.example`

Exemplos (sem valores reais):

```env
# arete.env.example
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=your_qdrant_api_key_here

VECTOR_BACKEND=qdrant
MEM0_ENABLED=true

BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
BINANCE_USE_TESTNET=true

GROK_API_KEY=your_grok_api_key
GEMINI_API_KEY=your_gemini_api_key
SERPER_API_KEY=your_serper_api_key
TAVILY_API_KEY=your_tavily_api_key
```

---

## Verificação Git History

### ✅ Scan Results

```bash
git log --all --diff-filter=A -- '*.env'
# Resultado: Nenhum .env foi adicionado via commit de código
# (config/*.env foram adicionados, mas config/ não tinha .gitignore)
```

### Status de Arquivos

**Tracked (PROBLEMA):**
- `config/arete.env` - 🔴 CONTÉM SECRETS
- `config/production.env` - 🔴 CONTÉM SECRETS

**Não-Tracked (OK):**
- `apps/backend/.env` - ✅ Coberto por .gitignore
- `modules/binance-bot/backend/.env` - ✅ Coberto por .gitignore
- `apps/backend/integrations/whatsapp/auth_info/` - ✅ Coberto por .gitignore

---

## Checklist de Implementação

- [x] Scan completo do git history para secrets
- [x] Criar .env.example para apps/backend/ e modules/binance-bot/backend/
- [x] Identificar arquivos com secrets expostos
- [x] Documentar procedimento de rotação de keys
- [ ] Remover config/arete.env e config/production.env do tracking
- [ ] Atualizar .gitignore com padrão `config/*.env`
- [ ] Criar config/arete.env.example
- [ ] Criar config/production.env.example
- [ ] Rotacionar TODAS as chaves expostas
- [ ] Commit de limpeza com `git rm --cached`

---

## Impacto da Exposição

| Chave | Severidade | Risco | TTL |
|-------|-----------|-------|-----|
| Supabase Service Role | 🔴 CRÍTICA | Acesso total ao DB | ⏰ URGENT |
| Gemini API | 🟠 ALTA | Consumo de quota + custos | ⏰ URGENT |
| Grok API | 🟠 ALTA | Consumo de quota | ⏰ URGENT |
| Serper API | 🟠 ALTA | Consumo de quota | ⏰ URGENT |
| Tavily API | 🟠 ALTA | Consumo de quota | ⏰ URGENT |

---

## Referências de Segurança

- **OWASP Secret Management:** https://owasp.org/www-community/Sensitive_Data_Exposure
- **GitHub Secret Scanning:** https://docs.github.com/en/code-security/secret-scanning
- **.gitignore Best Practices:** https://github.com/github/gitignore/blob/main/Global/DotEnv.gitignore

---

## Próximos Passos

1. **Executar FASE 1** (Rotação de Chaves) - Hoje
2. **Executar FASE 2** (Corrigir .gitignore) - Hoje
3. **Executar FASE 3** (Criar templates) - Hoje
4. **Monitorar** chaves antigas por 7 dias para garantir nenhuma chamada
5. **Documentar** mudanças no CHANGELOG
6. **Treinar** time sobre secret management

---

**Relatório gerado:** 2026-02-14 14:30 UTC
**Status:** Pendente de Ação Imediata
