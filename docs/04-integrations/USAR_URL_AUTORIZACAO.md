# Como Usar a URL de Autorização do Confluence

## ✅ Você está no lugar certo!

Na página "Authorization" do Developer Console, você vê uma seção chamada **"Authorization URL generator"**.

## 🎯 Ação Imediata

1. **Encontre a URL: "Classic Confluence API authorization URL"**
   - É a segunda URL na lista
   - Tem muitos scopes do Confluence listados

2. **Clique no ícone de copiar** (📋) ao lado dessa URL

3. **Cole a URL no seu navegador** e pressione Enter

4. **Autorize o app:**
   - Você verá uma tela pedindo permissão
   - Clique em "Autorizar" ou "Allow"

5. **Após autorizar:**
   - Você será redirecionado para `localhost:1919/callback` (pode dar erro, é normal)
   - Reinicie o Cursor
   - Teste: "Liste todos os espaços do Confluence"

## ⚠️ Importante - Client ID Diferente

Vejo que as URLs mostram `client_id=88zOFYpcPpIfRXkfsnNBSNMDmeMLz1KB`, mas no nosso `mcp.json` está `ddf7bd9f-24cb-4119-b6d9-3730eb3be971`.

**Isso pode significar:**
- Você está visualizando um app diferente
- Ou o Client ID mudou

**Solução:**
1. Use a URL que está na tela (a do Confluence)
2. Ou vamos atualizar o `mcp.json` com o Client ID correto (`88zOFYpcPpIfRXkfsnNBSNMDmeMLz1KB`)

Depois que você autorizar usando a URL da tela, me avise e eu testo novamente!


























