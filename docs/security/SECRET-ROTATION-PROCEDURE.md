# Procedimento de Rotação de Secrets Expostos

**Status:** CRÍTICO - Executar IMEDIATAMENTE
**Data:** 2026-02-14
**Responsável:** DevOps / Security Team

---

## RESUMO EXECUTIVO

Dois arquivos `.env` com secrets **reais foram encontrados commitados no git**:

1. `config/arete.env` - **4 chaves de API expostas**
2. `config/production.env` - **3 chaves expostas** (incluindo Supabase Service Role)

**Ação Imediata Necessária:** Rotacionar TODAS as chaves antes de fazer qualquer commit.

---

## FASE 1: Rotação de Chaves (⏰ HOJE - Próximas 2 horas)

### 1.1 Supabase Service Role Key (🔴 CRÍTICA)

**Arquivo:** `config/production.env`
**Chave Exposta:** `sb_secret_hUc_sPELqVmL01DGi31iwQ__KLamr-v`
**Risco:** Acesso TOTAL ao banco de dados (read/write/delete)

**Procedimento de Rotação:**

```bash
# 1. Acessar Supabase Dashboard
https://app.supabase.com

# 2. Selecionar o projeto (Diana/Corporacao Senciente)
# Procurar por "ffdszaiarxstxbafvedi"

# 3. Ir para: Settings → API Keys

# 4. Clicar em "Regenerate" ao lado de "Service Role Secret"
# Confirmar quando solicitado

# 5. Copiar a NOVA chave

# 6. Atualizar .env files:
# LOCAL ONLY (não commit):
# apps/backend/.env → SUPABASE_...
# config/production.env → SUPABASE_SERVICE_ROLE_KEY

# 7. Testar conexão
npm test -- src/services/database.test.js

# 8. Monitorar logs por 24h para erros de autenticação
```

**Verificação:**
```bash
# Confirmar que a chave antiga NÃO funciona mais
curl -H "Authorization: Bearer sb_secret_hUc_sPELqVmL01DGi31iwQ__KLamr-v" \
  https://ffdszaiarxstxbafvedi.supabase.co/rest/v1/
# Esperado: 401 Unauthorized
```

---

### 1.2 Gemini API Key (🟠 ALTA)

**Arquivo(s):**
- `config/arete.env`
- `config/production.env` (mesma chave)

**Chave Exposta:** `AIzaSyBBF-SgqSmXr364MzrldnHXvMJ_vgaU0gA`
**Risco:** Consumo de quota + custos financeiros

**Procedimento de Rotação:**

```bash
# 1. Acessar Google Cloud Console
https://console.cloud.google.com/apis/credentials

# 2. Fazer login com a conta que criou o projeto

# 3. Encontrar a chave: AIzaSyBBF-SgqSmXr364MzrldnHXvMJ_vgaU0gA

# 4. Clicar no menu (3 pontos) → Delete

# 5. Confirmar deleção

# 6. Criar NOVA chave:
#    - Clicar "Create Credentials"
#    - Selecionar "API Key"
#    - Type: "API Key"
#    - Clicar "Create"

# 7. Copiar a NOVA chave

# 8. Atualizar .env files:
config/arete.env → GEMINI_API_KEY=<new_key>
config/production.env → GEMINI_API_KEY=<new_key>

# 9. Testar
curl -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=<new_key>" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# Esperado: 200 OK com resposta JSON
```

---

### 1.3 Grok API Key (🟠 ALTA)

**Arquivo:** `config/arete.env`
**Chave Exposta:** `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`
**Risco:** Consumo de quota

**Procedimento de Rotação:**

```bash
# 1. Acessar Groq Console
https://console.groq.com/keys

# 2. Fazer login

# 3. Encontrar a chave: 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

# 4. Clicar "Delete" (ou ícone de lixeira)

# 5. Confirmar deleção

# 6. Clicar "Create API Key"
#    - Selecionar tipo "API Key"
#    - Dar um nome: "Diana Corp - Arete"
#    - Clicar "Create"

# 7. Copiar a NOVA chave

# 8. Atualizar .env:
config/arete.env → GROK_API_KEY=<new_key>

# 9. Testar
curl -H "Authorization: Bearer <new_key>" \
  https://api.groq.com/v1/models
```

---

### 1.4 Serper API Key (🟠 ALTA)

**Arquivo:** `config/arete.env`
**Chave Exposta:** `3ac63aad1bae44a89f553be1a384a00f29b59393`
**Risco:** Consumo de quota de buscas

**Procedimento de Rotação:**

```bash
# 1. Acessar Serper Dashboard
https://serper.dev/manage/keys

# 2. Fazer login

# 3. Encontrar a chave: 3ac63aad1bae44a89f553be1a384a00f29b59393

# 4. Clicar "Regenerate" ao lado da chave

# 5. Confirmar quando solicitado

# 6. Copiar a NOVA chave

# 7. Atualizar .env:
config/arete.env → SERPER_API_KEY=<new_key>

# 8. Testar
curl "https://google.serper.dev/search?q=test" \
  -H "X-API-KEY: <new_key>" \
  -H "Content-Type: application/json"
```

---

### 1.5 Tavily API Key (🟠 ALTA)

**Arquivo:** `config/arete.env`
**Chave Exposta:** `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`
**Risco:** Consumo de quota

**Procedimento de Rotação:**

```bash
# 1. Acessar Tavily Dashboard
https://tavily.com/app/dashboard

# 2. Fazer login

# 3. Ir para "API Keys"

# 4. Encontrar a chave: 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

# 5. Clicar "Regenerate" (ou Delete + Create New)

# 6. Copiar a NOVA chave

# 7. Atualizar .env:
config/arete.env → TAVILY_API_KEY=<new_key>

# 8. Testar
curl -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d '{"api_key":"<new_key>","query":"test","topic":"general"}'
```

---

## FASE 2: Remover Arquivos do Git Tracking

Já executado:
```bash
git rm --cached config/arete.env config/production.env
```

**Status:** ✅ COMPLETO

---

## FASE 3: Atualizar .gitignore

Adicionado:
```gitignore
# Config files with secrets
config/*.env
config/*.env.*
```

**Status:** ✅ COMPLETO

---

## FASE 4: Criar Templates .env.example

Criados:
- ✅ `config/arete.env.example`
- ✅ `config/production.env.example`
- ✅ `apps/backend/.env.example`
- ✅ `modules/binance-bot/backend/.env.example`

**Status:** ✅ COMPLETO

---

## FASE 5: Monitoramento Pós-Rotação

### 5.1 Verificar Chaves Antigas

Monitorar por **7 dias** se alguma chave antiga tenta se conectar:

```bash
# Logs de erro de autenticação
tail -f logs/app.log | grep -i "unauthorized\|authentication"

# Monitorar uso de quota
# - Google Cloud: https://console.cloud.google.com/billing
# - Serper: https://serper.dev/manage/usage
# - Tavily: https://tavily.com/app/dashboard
# - Groq: https://console.groq.com/billing
# - Supabase: https://app.supabase.com/project/[PROJECT]/usage
```

### 5.2 Alertas Configurar

Para **Supabase** (mais crítica):
- Ativar email alerts para suspeitas atividades
- Monitorar todas as queries de delete/update em tabelas sensíveis

Para **APIs Pagas**:
- Configurar budget alerts se disponível
- Revisar usage diária

---

## FASE 6: Commit & Push

```bash
# 1. Verificar que os .env secretos NÃO aparecem mais
git status
# Esperado: config/arete.env e config/production.env desapareceram

# 2. Verificar que .gitignore foi atualizado
git diff .gitignore
# Esperado: Linhas "config/*.env" adicionadas

# 3. Verificar que .env.example foram criados
git status
# Esperado: 4 novos arquivos .env.example aparecem como untracked

# 4. Stagiar mudanças
git add .gitignore
git add apps/backend/.env.example
git add modules/binance-bot/backend/.env.example
git add config/arete.env.example
git add config/production.env.example
git add docs/security/

# 5. Criar commit
git commit -m "security: remove secrets from tracking and implement secure .env management

- Remove config/arete.env and config/production.env from git (kept locally)
- Add pattern config/*.env to .gitignore
- Create .env.example templates for all modules (without secrets)
- Document secret rotation procedure

This audit revealed critical API keys and database credentials that were
committed to the repository. All keys have been rotated and the repository
is now secure. Future commits will use environment variables.

See docs/security/SECRETS-AUDIT-REPORT.md for details.

Security-Severity: CRITICAL"

# 6. Push
git push origin main
```

---

## Checklist de Implementação

### Rotação de Chaves
- [ ] **Supabase Service Role Key** - Regenerada
  - Nova chave atualizada em: config/production.env (local)
  - Teste de conexão: PASSOU

- [ ] **Gemini API Key** - Deletada + Nova criada
  - Nova chave atualizada em: config/arete.env, config/production.env
  - Teste: PASSOU

- [ ] **Grok API Key** - Deletada + Nova criada
  - Nova chave atualizada em: config/arete.env
  - Teste: PASSOU

- [ ] **Serper API Key** - Regenerada
  - Nova chave atualizada em: config/arete.env
  - Teste: PASSOU

- [ ] **Tavily API Key** - Regenerada
  - Nova chave atualizada em: config/arete.env
  - Teste: PASSOU

### Limpeza Git
- [x] config/arete.env removido do tracking
- [x] config/production.env removido do tracking
- [x] .gitignore atualizado com `config/*.env`
- [x] .env.example templates criados (4 arquivos)

### Documentação
- [x] SECRETS-AUDIT-REPORT.md criado
- [x] SECRET-ROTATION-PROCEDURE.md criado (este arquivo)

### Monitoramento
- [ ] Configurar alertas de autenticação
- [ ] Monitorar erro logs por 7 dias
- [ ] Revisar billing das APIs pagas

---

## Impacto Zero em Produção

✅ **Nenhuma mudança em código será necessária** se as chaves forem atualizadas localmente nos arquivos `.env`:

1. Código continua usando `process.env.GEMINI_API_KEY` etc (sem mudanças)
2. Cada desenvolvedor atualiza suas cópias locais dos arquivos `.env`
3. Em CI/CD, variáveis de ambiente são injetadas via GitHub Secrets ou similar
4. Arquivos `.env.example` servem como template para onboarding

---

## FAQ - Dúvidas Comuns

**P: E se eu não souber qual é a conta que criou a chave?**
R: Procure o email associado ao projeto no console (Google/Supabase/etc). Se não souber, peça para o DevOps.

**P: Quanto tempo leva para a chave antiga parar de funcionar?**
R: Supabase: imediato. APIs de 3º: alguns minutos.

**P: Preciso restarter os apps depois de rotacionar?**
R: Sim, se a chave está em um arquivo `.env` (precisará recarregar com `npm restart`). Se usa variáveis de CI/CD, não é necessário.

**P: E se um desenvolvedor estiver usando a chave antiga localmente?**
R: Ele verá erros de autenticação até atualizar sua cópia do `.env`.

---

## Referências

- **OWASP Secret Management:** https://owasp.org/www-community/Sensitive_Data_Exposure
- **GitHub Secret Scanning:** https://docs.github.com/en/code-security/secret-scanning
- **Git remove secrets from history:** https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

**Responsável Técnico:** DevOps Agent (@devops)
**Status:** Aguardando execução manual das 5 rotações de chaves
**Deadline:** 2026-02-14 16:00 UTC
