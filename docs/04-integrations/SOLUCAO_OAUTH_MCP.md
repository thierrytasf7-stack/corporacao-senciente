# Solução OAuth MCP Atlassian

## Problema
Erro: "Não foi possível identificar o aplicativo que está solicitando acesso"

## Causa
O MCP remote da Atlassian (`mcp-remote`) gerencia o fluxo OAuth automaticamente. Tentar usar URLs de autorização manuais não funciona porque o MCP precisa iniciar o fluxo.

## Solução Correta

### Passo 1: Verificar e Salvar Configuração no Developer Console

1. Acesse: https://developer.atlassian.com/console/myapps/
2. Abra o app **"coordenadorautonomo"**
3. Vá em **"Authorization"**
4. Verifique que o **Callback URL** está: `http://localhost:1919/callback`
5. **IMPORTANTE:** Clique em **"Save changes"** se você alterou algo
6. Verifique que o app está **ativo/enabled**

### Passo 2: Verificar Permissões (Permissions)

1. No Developer Console, vá em **"Permissions"**
2. Certifique-se de que os scopes estão configurados:
   - Jira: `read:jira-work`, `write:jira-work`
   - Confluence: `read:confluence-content.summary`, `write:confluence-content`
   - Compass: `read:compass-component`
   - Offline: `offline_access`

### Passo 3: Deixar o MCP Gerar a URL Automaticamente

O MCP remote deve gerar a URL automaticamente quando você tentar usar uma função pela primeira vez. 

**Teste:**
1. Reinicie o Cursor completamente
2. Tente usar: `mcp_jira-rovo-remote_getConfluenceSpaces`
3. O MCP deve retornar uma URL de autorização
4. Cole essa URL no navegador
5. Autorize o app

### Passo 4: Alternativa - Usar API REST Direta (Já Funcionando)

Se o MCP não funcionar, você pode usar os scripts REST que já estão funcionando:
- ✅ `scripts/create_jira_tasks.js` - Jira funciona
- ✅ `scripts/setup_confluence_pages.js` - Confluence funciona

Esses scripts usam `ATLASSIAN_API_TOKEN` e não requerem OAuth.

## Verificação Final

### No Developer Console, verifique:
- ✅ App está ativo
- ✅ Callback URL está salvo: `http://localhost:1919/callback`
- ✅ Client ID no mcp.json: `88zOFYpcPpIfRXkfsnNBSNMDmeMLz1KB`
- ✅ Client Secret no mcp.json: (do env.local, linha 28)
- ✅ Permissões (scopes) configuradas corretamente

## Próximos Passos

1. **Salve todas as configurações no Developer Console**
2. **Reinicie o Cursor**
3. **Teste novamente:** "testa"

Se ainda não funcionar, podemos continuar usando a API REST direta que já está funcionando para Jira e Confluence.

























