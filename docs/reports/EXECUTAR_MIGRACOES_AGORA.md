# 🚀 EXECUTAR MIGRAÇÕES SQL - INSTRUÇÕES RÁPIDAS

## ⚡ MÉTODO RÁPIDO (Recomendado)

### 1. Abrir Supabase Dashboard
👉 **Acesse:** https://supabase.com/dashboard/project/ffdszaiarxstxbafvedi/sql

### 2. Abrir SQL Editor
- Clique em **"SQL Editor"** no menu lateral
- Clique em **"New query"** (botão azul)

### 3. Executar Migração Consolidada
- Abra o arquivo: `supabase/migrations/ALL_MIGRATIONS_CONSOLIDATED.sql`
- **Copie TODO o conteúdo**
- **Cole no SQL Editor**
- Clique em **"Run"** ou pressione `Ctrl+Enter`

### 4. Verificar Sucesso
Você deve ver a mensagem:
```
✅ Todas as 14 tabelas foram criadas com sucesso!
```

---

## 📋 TABELAS QUE SERÃO CRIADAS

1. ✅ `pc_activity_log` - Histórico de atividades dos PCs
2. ✅ `agent_dna` - DNA dos agentes (GAIA)
3. ✅ `agent_evolution_log` - Log de evolução (GAIA)
4. ✅ `agent_vaccines` - Vacinas de conhecimento (GAIA)
5. ✅ `llm_usage` - Uso de LLMs (FORGE)
6. ✅ `mcp_status` - Status de MCPs (FORGE)
7. ✅ `workflow_runs` - Execuções de workflows (FORGE)
8. ✅ `tools_registry` - Registro de tools (FORGE)
9. ✅ `corporate_memory` - Memória corporativa
10. ✅ `episodic_memory` - Memória episódica
11. ✅ `derived_insights` - Insights derivados
12. ✅ `flows` - Fluxos (Córtex)
13. ✅ `flow_executions` - Execuções de fluxos (Córtex)
14. ✅ `flow_pain_tasks` - Pain tasks (Córtex)

---

## ✅ VERIFICAÇÃO PÓS-EXECUÇÃO

Execute este SQL para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'pc_activity_log',
    'agent_dna',
    'agent_evolution_log',
    'agent_vaccines',
    'llm_usage',
    'mcp_status',
    'workflow_runs',
    'tools_registry',
    'corporate_memory',
    'episodic_memory',
    'derived_insights',
    'flows',
    'flow_executions',
    'flow_pain_tasks'
  )
ORDER BY table_name;
```

Deve retornar **14 linhas**.

---

## 🛠️ ALTERNATIVA: Supabase CLI (Se Instalado)

```bash
cd "c:\Users\User\Desktop\Sencient-Coorporation\Diana-Corporacao-Senciente"
supabase link --project-ref ffdszaiarxstxbafvedi
supabase db push
```

---

## 📝 ARQUIVO SQL CONSOLIDADO

**Localização:** `supabase/migrations/ALL_MIGRATIONS_CONSOLIDATED.sql`

Este arquivo contém **TODAS as 5 migrações** consolidadas em um único arquivo SQL.

---

## ⚠️ IMPORTANTE

- ⚠️ O Supabase **não permite** execução de DDL via REST API
- ✅ Você **DEVE** executar manualmente no SQL Editor
- ✅ O arquivo consolidado está pronto para uso
- ✅ Todas as migrações são idempotentes (podem ser executadas múltiplas vezes)

---

## 🎯 PRÓXIMOS PASSOS APÓS EXECUTAR

1. ✅ Verificar que todas as 14 tabelas foram criadas
2. ✅ Testar endpoints do backend
3. ✅ Testar frontend conectado ao Supabase
4. ✅ Validar funcionalidades
