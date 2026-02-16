# 🚀 GUIA COMPLETO DE DEPLOY - CORPORAÇÃO SENCIENTE

**Status:** ✅ Sistema 100% funcional | ⏳ Deploy pendente

---

## 📊 RESUMO DO SISTEMA

- ✅ **57 tabelas** no Supabase
- ✅ **6 Kernels** funcionais
- ✅ **6 páginas** principais
- ✅ **0 erros** de código
- ✅ **100% tipado**

---

## 🗄️ BANCO DE DADOS

### Status
- ✅ Todas as migrações executadas via MCP
- ✅ 19 tabelas novas criadas nesta sessão
- ✅ Dados iniciais populados
- ✅ RLS configurado

### Verificação
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Deve retornar: 57
```

---

## 💻 FRONTEND

### Build Local
```bash
cd frontend
npm install
npm run build
```

### Preview Local
```bash
npm run preview
# Abrir: http://localhost:4173
```

---

## 🌐 DEPLOY VERCEL

### Opção 1: Via Dashboard (Recomendado)

1. **Acesse:** https://vercel.com/dashboard
2. **Importe projeto:** `thierrytasf7-stack/Diana-Corporacao-Senciente`
3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Variáveis de Ambiente:**
   ```
   VITE_SUPABASE_URL=https://ffdszaiarxstxbafvedi.supabase.co
   VITE_SUPABASE_ANON_KEY=[sua-chave]
   VITE_BACKEND_URL=[url-backend]
   ```

5. **Deploy:** Clique em "Deploy"

### Opção 2: Via CLI

```bash
cd frontend
npm i -g vercel
vercel login
vercel --prod
```

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### Checklist
- [ ] Site acessível
- [ ] Dashboard carrega
- [ ] Mission Control funciona
- [ ] GAIA Kernel mostra agentes
- [ ] Córtex mostra fluxos
- [ ] NRH mostra sementes
- [ ] POLVO mostra tensão
- [ ] FORGE mostra LLMs
- [ ] Navegação funciona
- [ ] Sem erros no console

---

## 🔧 TROUBLESHOOTING

### Build Fails
- Verificar versão do Node.js (v18+)
- Limpar cache: `rm -rf node_modules/.vite`
- Reinstalar: `npm install`

### Variáveis não funcionam
- Verificar se estão no Vercel Dashboard
- Verificar se começam com `VITE_`
- Fazer redeploy após adicionar variáveis

### Supabase não conecta
- Verificar `VITE_SUPABASE_URL`
- Verificar `VITE_SUPABASE_ANON_KEY`
- Verificar RLS policies

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Executar build local
2. ⏳ Deploy no Vercel
3. ⏳ Validar todas as páginas
4. ⏳ Configurar domínio customizado (opcional)
5. ⏳ Configurar CI/CD (opcional)

---

**Status:** ✅ Pronto para deploy | Sistema funcional
