# Como Validar o Developer Token do Google Ads

## Formato do Developer Token

O Developer Token do Google Ads geralmente tem:
- **12-20 caracteres**
- **Letras e números** (pode ter hífens)
- **Exemplos válidos:**
  - `ABC123DEF456`
  - `abc-def-ghi`
  - `123456789012`

## Onde Aparece na Imagem?

Se você viu o Developer Token na imagem, ele geralmente aparece como:
- "Developer Token" ou "Token de Desenvolvedor"
- Uma string alfanumérica
- Pode estar em um campo de texto copiável

## Como Validar

### Opção 1: Adicionar ao env.local e Testar

1. Adicione ao `env.local`:
   ```bash
   GOOGLE_ADS_DEVELOPER_TOKEN=token_que_você_vê_na_imagem
   ```

2. Execute o teste:
   ```bash
   npm run google-ads:test
   ```

### Opção 2: Verificar no API Center

1. Acesse: https://ads.google.com/aw/apicenter
2. O Developer Token aparece na página principal
3. Compare com o que você viu na imagem

## Se Você Não Tem Developer Token Ainda

1. Acesse: https://ads.google.com/aw/apicenter
2. Clique em **"Apply for access"**
3. Preencha o formulário:
   - Application type: "My Client Library"
   - Use case: "I will access the API for my own use"
   - Description: "Automação de campanhas para Marketing Agent"
4. Aguarde aprovação (pode levar algumas horas a dias)

## Status Atual

✅ **Customer ID:** 731-088-2101 (configurado)  
✅ **Client ID e Secret:** Configurados  
⚠️ **Developer Token:** Aguardando confirmação  
⚠️ **Refresh Token:** Em processo (script rodando)

---

**Se você copiar o token da imagem, cole aqui e eu valido!**



















