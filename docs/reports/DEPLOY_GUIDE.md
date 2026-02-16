# 🚀 GUIA DE DEPLOY - CORPORAÇÃO SENCIENTE 7.0

## 📋 PRÉ-REQUISITOS

### 1. Contas Necessárias
- ✅ **Vercel**: [vercel.com](https://vercel.com) - Para frontend
- ✅ **Supabase**: Já configurado
- ✅ **Git**: Repositório no GitHub

### 2. Variáveis de Ambiente
```bash
# No Vercel (Environment Variables)
SUPABASE_URL=https://ffdszaiarxstxbafvedi.supabase.co/
SUPABASE_SERVICE_ROLE_KEY=sb_secret_hUc_sPELqVmL01DGi31iwQ__KLamr-v
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZHN6YWlhcnhzdHhiYWZ2ZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDA3MTYsImV4cCI6MjA4MDk3NjcxNn0.pD36vrlixzGi7P9MYaTbOGE9MG8yfZCQx0uRNN0Ez6A
```

## 🚀 DEPLOY AUTOMÁTICO

### Passo 1: Push para GitHub
```bash
git add .
git commit -m "feat: Deploy Corporação Senciente 7.0"
git push origin main
```

### Passo 2: Deploy Backend (API)
```bash
cd backend
vercel --prod
# OU via Vercel Dashboard
```

### Passo 3: Deploy Frontend
```bash
cd frontend
vercel --prod
# OU via Vercel Dashboard
```

## 🔧 CONFIGURAÇÃO MANUAL NO VERCEL

### 1. Backend Deploy
1. Acesse [vercel.com](https://vercel.com)
2. Importe o projeto `backend/`
3. Configure Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
4. Deploy

### 2. Frontend Deploy
1. Importe o projeto `frontend/`
2. Configure Environment Variables:
   - `VITE_API_BASE_URL` (URL do backend no Vercel)
3. Deploy

## 🌐 URLs DE PRODUÇÃO

```
Frontend: https://coorporacao-senciente.vercel.app
Backend:  https://coorporacao-senciente-backend.vercel.app
```

## 🔍 VERIFICAÇÃO PÓS-DEPLOY

### Health Checks
```bash
# Backend
curl https://coorporacao-senciente-backend.vercel.app/health

# Frontend
curl https://coorporacao-senciente.vercel.app
```

### APIs Essenciais
```bash
curl https://coorporacao-senciente-backend.vercel.app/api/agents
curl https://coorporacao-senciente-backend.vercel.app/api/tasks
curl https://coorporacao-senciente-backend.vercel.app/api/metrics
```

## 🛠️ TROUBLESHOOTING

### Erro 404 nas APIs
- Verifique se o backend foi deployado primeiro
- Confirme a URL do backend no `vercel.json` do frontend

### Erro 500 no Backend
- Verifique Environment Variables no Vercel
- Confirme conexão com Supabase

### Frontend Não Carrega
- Verifique build logs no Vercel
- Confirme `VITE_API_BASE_URL` está correto

## 📊 MONITORAMENTO

### Vercel Analytics
- Acesse Vercel Dashboard
- Monitore performance e erros
- Configure alerts se necessário

### Logs
```bash
# Logs do Backend
vercel logs coorporacao-senciente-backend.vercel.app

# Logs do Frontend
vercel logs coorporacao-senciente.vercel.app
```

## 🔄 ATUALIZAÇÕES

### Deploy de Atualizações
```bash
# Commit das mudanças
git add .
git commit -m "feat: Nova funcionalidade"

# Push (deploy automático)
git push origin main
```

## 📞 SUPORTE

Em caso de problemas:
1. Verifique logs no Vercel Dashboard
2. Teste localmente primeiro
3. Verifique variáveis de ambiente
4. Consulte documentação do Vercel

---

**Status**: ✅ Pronto para deploy
**Última atualização**: 27/12/2025
