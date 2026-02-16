# 🔧 CORREÇÃO DE DIMENSÕES DE VETORES NO SUPABASE

## 🚨 PROBLEMA IDENTIFICADO
- Sistema gera embeddings de **384 dimensões** (Xenova bge-small)
- Funções RPC esperam **768 dimensões**
- Resultado: Buscas vetoriais falham

## ✅ SOLUÇÃO
Executar o SQL abaixo no Supabase Dashboard:

```sql
-- CORREÇÃO DAS DIMENSÕES DE VETORES NO SUPABASE
-- Ajustar função RPC para aceitar vetores de 384 dimensões (Xenova bge-small)

-- Recriar função match_corporate_memory com dimensões corretas
DROP FUNCTION IF EXISTS match_corporate_memory(vector, int);

CREATE OR REPLACE FUNCTION match_corporate_memory(
  query_embedding vector(384),  -- Alterado de vector para vector(384)
  match_count int default 5
) returns table (
  id bigint,
  content text,
  category text,
  similarity float
) language sql stable as $$
  select
    cm.id,
    cm.content,
    cm.category,
    1 - (cm.embedding <=> query_embedding) as similarity
  from corporate_memory cm
  order by cm.embedding <=> query_embedding
  limit match_count;
$$;

-- Recriar função match_agent_logs também
DROP FUNCTION IF EXISTS match_agent_logs(vector, int);

CREATE OR REPLACE FUNCTION match_agent_logs(
  query_embedding vector(384),  -- Alterado de vector para vector(384)
  match_count int default 5
) returns table (
  id bigint,
  agent_name text,
  thought_process text,
  similarity float
) language sql stable as $$
  select
    al.id,
    al.agent_name,
    al.thought_process,
    1 - (al.embedding <=> query_embedding) as similarity
  from agent_logs al
  order by al.embedding <=> query_embedding
  limit match_count;
$$;

-- Verificar se as funções foram criadas corretamente
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('match_corporate_memory', 'match_agent_logs')
ORDER BY proname;

```

## 📍 ONDE EXECUTAR
1. Acesse: [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para: **SQL Editor**
4. Cole o SQL acima
5. Clique: **Run**

## 🧪 COMO TESTAR
Após executar o SQL:
```bash
cd "C:\Users\Ryzen\Desktop\GITHUB\Coorporacao autonoma"
node scripts/test_vector_search.js
```

## ✅ RESULTADO ESPERADO
- Buscas por "Reestruturação Completa" devem retornar ID 286
- Buscas por "AUDITORIA FINAL" devem retornar ID 285
- Similaridade deve ser > 80% para textos exatos

## 📞 SUPORTE
Se houver problemas, verificar:
- Privilégios administrativos no projeto
- Sintaxe SQL correta
- Logs de erro no Supabase
