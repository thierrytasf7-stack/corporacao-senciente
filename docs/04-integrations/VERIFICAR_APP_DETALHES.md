# Verificar Configurações do App "coordenadorautonomo"

## Status Atual
✅ App encontrado: "coordenadorautonomo" (OAuth 2.0)
✅ Status: "Not sharing" (normal, não precisa compartilhar)

## Passos para Verificar Configuração

### 1. Abrir Detalhes do App
1. **Clique no app "coordenadorautonomo"** na lista
2. Isso abrirá a página de detalhes do app

### 2. Verificar "Authorization" (OAuth 2.0)
1. No menu lateral, clique em **"Authorization"**
2. Verifique:
   - ✅ **Callback URL**: Deve ser `http://localhost:1919/callback`
   - ✅ Se alterou algo, clique em **"Save changes"**
   - ✅ Verifique se há mensagens de aviso/erro

### 3. Verificar "Permissions"
1. No menu lateral, clique em **"Permissions"**
2. Verifique se os scopes estão configurados:
   - ✅ Jira: `read:jira-work`, `write:jira-work`
   - ✅ Confluence: `read:confluence-content.summary`, `write:confluence-content`
   - ✅ Compass: `read:compass-component`
   - ✅ Offline: `offline_access`

### 4. Verificar "Settings" (Opcional)
1. No menu lateral, clique em **"Settings"**
2. Verifique:
   - ✅ App está ativo/enabled
   - ✅ Client ID: `88zOFYpcPpIfRXkfsnNBSNMDmeMLz1KB`
   - ✅ Client Secret está visível (pode precisar clicar em "Show")

## Após Verificar
1. **Salve todas as alterações** (se fez alguma)
2. **Reinicie o Cursor completamente**
3. **Teste novamente**: "testa"

## Se Ainda Não Funcionar
Podemos continuar usando a API REST direta (que já funciona):
- ✅ Jira funciona via `ATLASSIAN_API_TOKEN`
- ✅ Confluence funciona via `ATLASSIAN_API_TOKEN`

