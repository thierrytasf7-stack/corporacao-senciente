# Solução: Erro 403 - Access Denied no OAuth Google

## 🔴 Problema

Erro: **"Acesso bloqueado: o app Coorporacao-Senciente não concluiu o processo de verificação do Google"**

**Causa:** O app OAuth está em modo de teste e seu email não está na lista de testadores.

## ✅ Solução Rápida: Adicionar Testador

### Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Faça login com `thierry.tasf7@gmail.com`
3. Selecione o projeto que contém o OAuth Client ID

### Passo 2: Navegar para OAuth Consent Screen

1. No menu lateral, vá em **"APIs & Services"** > **"OAuth consent screen"**
2. Ou acesse diretamente: https://console.cloud.google.com/apis/credentials/consent

### Passo 3: Adicionar Testador

1. Na seção **"Test users"** (Usuários de teste)
2. Clique em **"+ ADD USERS"** (Adicionar usuários)
3. Adicione o email: `thierry.tasf7@gmail.com`
4. Clique em **"ADD"** (Adicionar)

### Passo 4: Tentar Novamente

1. Feche a aba do erro
2. Execute novamente: `npm run google-ads:setup`
3. Abra a URL de autorização novamente
4. Agora deve funcionar! ✅

---

## 📋 Informações do App OAuth

- **Nome do App:** Coorporacao-Senciente
- **Client ID:** `393659950592-kmemsdnh6tce7cu656u1s8ld9c38llns.apps.googleusercontent.com`
- **Email para adicionar:** `thierry.tasf7@gmail.com`
- **Tipo:** Desktop App
- **Status:** Em modo de teste

---

## 🔄 Alternativa: Publicar o App (Futuro)

Se quiser que qualquer pessoa possa usar o app:

1. Vá em **"OAuth consent screen"**
2. Preencha todas as informações obrigatórias:
   - App name
   - User support email
   - Developer contact information
3. Adicione os escopos necessários
4. Clique em **"PUBLISH APP"** (Publicar app)
5. Aguarde verificação do Google (pode levar dias)

**Nota:** Para desenvolvimento/teste, adicionar testadores é mais rápido.

---

## ✅ Após Adicionar Testador

Execute novamente:

```bash
npm run google-ads:setup
```

E abra a URL de autorização. Deve funcionar agora!

---

**Última atualização:** 15/12/2025

















