# Configurar App OAuth Atlassian - Passo a Passo

## 🔍 Diagnóstico Atual

**Status:** O app OAuth está funcionando para **Jira**, mas **não para Confluence**.

**Scopes ativos:** `read:jira-work`, `write:jira-work`  
**Scopes faltando:** `read:confluence-content.summary`, `write:confluence-content`

## 📋 Passo a Passo para Configurar

### 1. Acesse o Developer Console

1. Abra: https://developer.atlassian.com/console/myapps/
2. Faça login com sua conta Atlassian (`thierry.tasf7@gmail.com`)

### 2. Encontre ou Crie o App

**Se o app já existe:**
- Procure por "coordenadorautonomo" ou pelo Client ID: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`
- Clique no app para abrir

**Se o app NÃO existe:**
- Clique em "Create" > "New app"
- Escolha "OAuth 2.0 (3LO)" 
- Nome: `coordenadorautonomo`
- Descrição: `MCP Server para Jira e Confluence`

### 3. Configure o App

#### 3.1. Authorization Settings

1. Vá em "Authorization" ou "OAuth 2.0 (3LO)"
2. **Callback URL:** `http://localhost:1919/callback`
3. **Scopes:** Adicione TODOS estes scopes:
   - ✅ `read:jira-work`
   - ✅ `write:jira-work`
   - ✅ `read:confluence-content.summary`
   - ✅ `write:confluence-content`
   - ✅ `read:compass-component`
   - ✅ `offline_access`

#### 3.2. Permissions

1. Vá em "Permissions" ou "API access"
2. Certifique-se de que os seguintes produtos estão habilitados:
   - ✅ **Jira** (já deve estar)
   - ✅ **Confluence** (precisa estar habilitado!)

### 4. Salve e Publique

1. Clique em "Save" ou "Update"
2. Se houver opção de "Publish", não precisa publicar (apps OAuth 3LO são privados)

### 5. Verifique o Client Secret

1. Vá em "Settings" ou "OAuth 2.0 (3LO)"
2. Copie o **Client Secret** (deve começar com `ATCTT...`)
3. Verifique se está no `env.local` como `ATLASSIAN_CLIENT_SECRET`

### 6. Autorize o App no Site

**Opção A: Via URL de Autorização**

1. Execute: `node scripts/generate_oauth_url.js`
2. Cole a URL gerada no navegador
3. Faça login e autorize

**Opção B: Autorização Automática**

1. Tente usar o MCP Confluence no Cursor
2. Você será redirecionado automaticamente para autorizar

### 7. Verificação

Após configurar, teste:

```bash
node scripts/test_atlassian_mcp.js
```

Ou no Cursor:
```
"Liste todos os espaços do Confluence"
```

## ⚠️ Problemas Comuns

### Erro: "Não foi possível identificar o aplicativo"

**Causa:** App não existe ou Client ID incorreto

**Solução:**
1. Verifique se o app existe no Developer Console
2. Confirme que o Client ID no `mcp.json` está correto: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`

### Erro: "The app is not installed on this instance"

**Causa:** App não autorizado para Confluence

**Solução:**
1. Verifique se Confluence está habilitado nas "Permissions" do app
2. Verifique se os scopes do Confluence estão adicionados
3. Autorize o app novamente usando a URL de autorização

### Erro: "Invalid redirect URI"

**Causa:** Redirect URI não corresponde ao configurado

**Solução:**
1. No Developer Console, verifique se o Callback URL é exatamente: `http://localhost:1919/callback`
2. No `mcp.json`, verifique se o `--redirect-uri` é o mesmo

## 📝 Checklist Final

- [ ] App existe no Developer Console
- [ ] Client ID correto: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`
- [ ] Client Secret no `env.local`
- [ ] Callback URL: `http://localhost:1919/callback`
- [ ] Scopes do Confluence adicionados
- [ ] Confluence habilitado nas Permissions
- [ ] App autorizado via URL de autorização
- [ ] Cursor reiniciado após autorização
- [ ] Teste funcionando

## 🎯 Próximo Passo

Depois de configurar tudo, execute:

```bash
node scripts/generate_oauth_url.js
```

Cole a URL no navegador e autorize. Depois reinicie o Cursor e teste!


























