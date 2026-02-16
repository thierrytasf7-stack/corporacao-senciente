# Passos para Verificar Permissions do App

## Você está na página certa! ✅

Você está no Developer Console, na Overview do app "coordenadorautonomo".

## Próximo Passo

1. **No menu lateral esquerdo, clique em "Permissions"** (ícone de cadeado 🔒)

2. **Verifique se Confluence está listado:**
   - Procure por "Confluence" ou "Confluence API"
   - Deve aparecer algo como "Confluence API" ou "Confluence Content"

3. **Se Confluence NÃO estiver na lista:**
   - Procure por um botão "Add" ou "Request" ou "Enable"
   - Habilite o Confluence API

4. **Verifique os scopes específicos:**
   - Dentro de Confluence, certifique-se de que estes scopes estão habilitados:
     - `read:confluence-content.summary`
     - `write:confluence-content`

## Depois de Verificar Permissions

1. Vá em "Authorization" (ícone de chave 🔑) no menu lateral
2. Verifique se o Callback URL está correto: `http://localhost:1919/callback`
3. Verifique se os scopes do Confluence estão listados

## Após Configurar

1. Salve tudo
2. Execute: `node scripts/generate_oauth_url.js`
3. Cole a URL no navegador e autorize
4. Reinicie o Cursor
5. Teste: "Liste todos os espaços do Confluence"


























