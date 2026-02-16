# 🔧 Configurar Variável de Ambiente no Vercel

**PROBLEMA:** Mission Control não conecta porque `NEXT_PUBLIC_MAESTRO_URL` não está configurada no Vercel.

## ✅ Solução Rápida

### Via Dashboard Vercel (RECOMENDADO)

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto:** `mission-control`
3. **Vá em:** Settings → Environment Variables
4. **Clique em:** "Add New"
5. **Preencha:**
   - **Name:** `NEXT_PUBLIC_MAESTRO_URL`
   - **Value:** `http://100.78.145.65:8080`
   - **Environments:** Marque todas (Production, Preview, Development)
6. **Salve**
7. **Faça um novo deploy** (ou aguarde deploy automático)

### Via CLI (Alternativa)

```powershell
cd mission-control
npx vercel env add NEXT_PUBLIC_MAESTRO_URL production
# Quando solicitado, digite: http://100.78.145.65:8080
# Repita para preview e development se necessário
```

## 🔄 Após Configurar

1. **Fazer novo deploy:**
   ```powershell
   cd mission-control
   npx vercel --prod
   ```

2. **Ou aguardar deploy automático** (se estiver configurado)

3. **Recarregar Mission Control** no navegador

4. ✅ Conexão deve funcionar!

## ✅ Verificação

Após configurar, verifique:

```powershell
npx vercel env ls
# Deve mostrar NEXT_PUBLIC_MAESTRO_URL
```

## 🚨 Importante

- A variável **DEVE** ter o prefixo `NEXT_PUBLIC_` para ser acessível no navegador
- O valor **DEVE** ser `http://100.78.145.65:8080` (IP Tailscale do Maestro)
- Após adicionar, **sempre fazer novo deploy** para aplicar

---

**Após configurar e fazer deploy, a conexão deve funcionar!** 🚀
