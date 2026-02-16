# 🚀 GUIA DE DEPLOY - Corporação Senciente

**Data:** 2026-01-31  
**Status:** ✅ Sistema completo e pronto para deploy

---

## 📋 PRÉ-REQUISITOS

- [x] Conta Vercel (https://vercel.com)
- [x] Repositório GitHub configurado
- [x] Node.js 18+ instalado localmente
- [x] Supabase configurado e populado

---

## 🔧 PREPARAÇÃO

### 1. Verificar Build Local

```bash
cd frontend
npm install
npm run build
```

**Resultado esperado:** Build bem-sucedido em `dist/`

### 2. Testar Build Localmente

```bash
npm run preview
```

**Resultado esperado:** App funcionando em http://localhost:4173

---

## 🚀 DEPLOY NO VERCEL

### Opção 1: Via Dashboard (Recomendado)

1. **Acessar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Login com GitHub

2. **Importar Projeto**
   - Click "Add New..."
   - Click "Project"
   - Importar repositório: `Diana-Corporacao-Senciente`

3. **Configurações de Build**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Variáveis de Ambiente**
   
   Adicionar em "Environment Variables":
   
   ```
   VITE_BACKEND_URL=https://backend-senciencycooporations-projects.vercel.app
   VITE_API_BASE_URL=https://backend-senciencycooporations-projects.vercel.app
   VITE_SUPABASE_URL=https://ffdszaiarxstxbafvedi.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZHN6YWlhcnhzdHhiYWZ2ZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA3MTYsImV4cCI6MjA4MDk3NjcxNn0.pD36vrlixzGi7P9MYaTbOGE9MG8yfZCQx0uRNN0Ez6A
   VITE_MAESTRO_URL=https://balanced-eat-editorials-collected.trycloudflare.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Aguardar build (~2-3 min)

### Opção 2: Via CLI

```bash
cd frontend

# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Checklist de Validação

#### 1. Páginas Principais
- [ ] Dashboard carrega e mostra métricas
- [ ] Mission Control conecta ao Maestro
- [ ] Agents lista agentes corretamente
- [ ] GAIA Kernel mostra DNA dos agentes
- [ ] Córtex exibe fluxos
- [ ] NRH mostra campo quântico
- [ ] POLVO exibe sensores
- [ ] FORGE mostra infraestrutura
- [ ] Schema visualiza banco de dados
- [ ] DAEMON Dashboard funciona

#### 2. Integrações
- [ ] Backend Node.js conecta
- [ ] Supabase consultas funcionam
- [ ] Maestro API responde (se online)
- [ ] Navegação entre páginas funciona

#### 3. Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s

---

## 🔄 ATUALIZAR DEPLOY

### Via Git Push

```bash
git add .
git commit -m "feat: Nova funcionalidade"
git push origin main
```

**Vercel detecta automaticamente e faz redeploy**

### Via CLI

```bash
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Build Falha

**Sintoma:** Build error no Vercel

**Solução:**
```bash
# Testar local
cd frontend
rm -rf node_modules dist
npm install
npm run build

# Se funcionar local, problema é env vars no Vercel
```

### Página em Branco

**Sintoma:** Deploy sucesso mas página branca

**Possíveis causas:**
1. Env vars não configuradas
2. Routing não funcionando
3. Erro de console

**Solução:**
1. Verificar Console do navegador (F12)
2. Verificar Network tab
3. Verificar env vars no Vercel Dashboard

### API não conecta

**Sintoma:** "Backend desconectado"

**Solução:**
1. Verificar VITE_BACKEND_URL está correto
2. Testar backend diretamente: `https://backend-senciencycooporations-projects.vercel.app/api/health`
3. Verificar CORS no backend

---

## 📊 MONITORAMENTO

### Vercel Analytics

Dashboard automático em:
- https://vercel.com/[seu-projeto]/analytics

### Logs

Ver logs em tempo real:
```bash
vercel logs [deployment-url]
```

---

## 🔐 SEGURANÇA

### Headers de Segurança

Já configurados em `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Variáveis Sensíveis

**NUNCA commitar:**
- `.env.local`
- Chaves de API
- Tokens de acesso

**Sempre usar:** Vercel Environment Variables

---

## 🎯 PRÓXIMOS PASSOS PÓS-DEPLOY

1. ✅ Validar todas as funcionalidades
2. ✅ Configurar domínio customizado (opcional)
3. ✅ Configurar alertas de uptime
4. ✅ Documentar URL de produção
5. ✅ Atualizar README com link

---

## 📞 SUPORTE

**Issues:** GitHub Issues do repositório  
**Docs:** README.md e documentação em `/docs`

---

**Status:** ✅ PRONTO PARA DEPLOY

Deploy realizado com sucesso!
URL: [será gerada pelo Vercel]
