# Checklist: Autorizar App OAuth para Confluence

## ❌ Não é necessário na página "Servidor Atlassian Rovo MCP"

Essa página é para adicionar domínios de AI tools externos. **Não precisamos mexer aqui.**

## ✅ O que fazer

### 1. Acesse o Developer Console
🔗 https://developer.atlassian.com/console/myapps/

### 2. Encontre o App
- Procure por "coordenadorautonomo"
- Ou pelo Client ID: `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`

### 3. Verifique PERMISSIONS/API ACCESS
- ✅ **Jira** deve estar habilitado (já está funcionando)
- ❌ **Confluence** precisa estar habilitado ← **ESSE É O PROBLEMA**

### 4. Verifique OAuth 2.0 SCOPES
Certifique-se de que estes scopes estão adicionados:
- ✅ `read:jira-work`
- ✅ `write:jira-work`
- ❌ `read:confluence-content.summary` ← **VERIFICAR**
- ❌ `write:confluence-content` ← **VERIFICAR**
- ✅ `read:compass-component`
- ✅ `offline_access`

### 5. Salve e Autorize
1. Salve as alterações
2. Execute: `node scripts/generate_oauth_url.js`
3. Cole a URL no navegador
4. Autorize o app
5. Reinicie o Cursor

## 🎯 Problema Principal

O app OAuth está funcionando para **Jira**, mas **Confluence não está habilitado** nas Permissions do app.

Isso precisa ser corrigido no **Developer Console**, não na página do Rovo MCP.


























