# Instruções de Migração SQL - Sales Agent

## Executar Migração SQL no Supabase

A migração SQL do Sales Agent precisa ser executada manualmente no Supabase Dashboard, pois o Supabase não permite execução de DDL (CREATE TABLE, ALTER TABLE, etc.) via API REST.

### Método 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - URL: https://ffdszaiarxstxbafvedi.supabase.co
   - Ou acesse: https://supabase.com/dashboard

2. **Vá para SQL Editor:**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute a Migração:**
   - Abra o arquivo: `supabase/migrations/add_sales_tables.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em **Run** ou pressione `Ctrl+Enter`

4. **Verificar:**
   - Verifique se as tabelas foram criadas:
     - `cerebro_sales_leads`
     - `cerebro_sales_deals`
     - `cerebro_sales_funnel_analysis`
     - `cerebro_sales_proposals`

### Método 2: Via Supabase CLI (Alternativo)

Se você tiver Supabase CLI instalado:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref ffdszaiarxstxbafvedi

# Executar migração
supabase db push
```

### Método 3: Via Script (Tentativa Automática)

Tente executar:

```bash
npm run sales:migrate
```

**Nota:** Este script tentará executar via API, mas pode falhar para comandos DDL. Se falhar, use o Método 1 (Dashboard).

## Tabelas Criadas

A migração cria as seguintes tabelas:

1. **cerebro_sales_leads** - Gestão de leads
2. **cerebro_sales_deals** - Gestão de deals
3. **cerebro_sales_funnel_analysis** - Análise de funil
4. **cerebro_sales_proposals** - Propostas comerciais

## Verificação

Após executar a migração, verifique se as tabelas existem:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'cerebro_sales%';
```

Deve retornar 4 tabelas.

---

**Arquivo de Migração:** `supabase/migrations/add_sales_tables.sql`  
**Data:** 16/12/2025

















